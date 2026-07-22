Exit code: 0
Wall time: 0.7 seconds
Output:
const path = require('node:path');
const crypto = require('node:crypto');
const http = require('node:http');
const { promisify } = require('node:util');
const express = require('express');
const helmet = require('helmet');
const { Server } = require('socket.io');

const scrypt = promisify(crypto.scrypt);
const PORT = Number(process.env.PORT) || 3000;
const SERVICE_NAME = 'Mirrised';
const ROOM_ID_BYTES = 16;
const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;
const PIN_PATTERN = /^\d{4,8}$/;
const MAX_SOCKET_MESSAGE_BYTES = 64 * 1024;
const MAX_ACTIVE_ROOMS = Math.min(Math.max(Number(process.env.MAX_ACTIVE_ROOMS) || 1_000, 1), 10_000);
const MAX_PENDING_ROOMS = Math.min(Math.max(Number(process.env.MAX_PENDING_ROOMS) || 1_000, 1), 10_000);
const SOCKET_PING_INTERVAL_MS = Math.min(Math.max(Number(process.env.SOCKET_PING_INTERVAL_MS) || 3_000, 1_000), 30_000);
const SOCKET_PING_TIMEOUT_MS = Math.min(Math.max(Number(process.env.SOCKET_PING_TIMEOUT_MS) || 5_000, 1_000), 30_000);
const PENDING_ROOM_TTL_MS = Number(process.env.PENDING_ROOM_TTL_MS) || 10 * 60 * 1000;
const ROOM_IDLE_TTL_MS = Number(process.env.ROOM_IDLE_TTL_MS) || 30 * 60 * 1000;
const ROOM_MAX_AGE_MS = Number(process.env.ROOM_MAX_AGE_MS) || 6 * 60 * 60 * 1000;
const PIN_ATTEMPT_LIMIT = 5;
const PIN_BLOCK_MS = 15 * 60 * 1000;
const DEFAULT_STUN_URL = process.env.STUN_URL || 'stun:stun.l.google.com:19302';
const TURN_URLS = (process.env.TURN_URL || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const TURN_SHARED_SECRET = process.env.TURN_SHARED_SECRET || '';
const TURN_TTL_SECONDS = Math.min(Math.max(Number(process.env.TURN_TTL_SECONDS) || 3600, 600), 24 * 60 * 60);
const ROOM_MODES = Object.freeze({
  direct: { id: 'direct', maxViewers: 1, allowTurn: false, label: 'P2P напрямую' },
  reliable: { id: 'reliable', maxViewers: 1, allowTurn: true, label: 'P2P с TURN' },
  group: { id: 'group', maxViewers: 6, allowTurn: true, label: 'Группа до 6 зрителей' }
});
const SIGNAL_RATE_LIMITS = {
  'webrtc-offer': { windowMs: 60_000, max: 10 },
  'webrtc-answer': { windowMs: 60_000, max: 10 },
  'ice-candidate': { windowMs: 60_000, max: 240 },
  'stream-stopped': { windowMs: 60_000, max: 5 }
};

const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || 'https://mirror.erised.click')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: MAX_SOCKET_MESSAGE_BYTES,
  pingInterval: SOCKET_PING_INTERVAL_MS,
  pingTimeout: SOCKET_PING_TIMEOUT_MS,
  cors: {
    origin: [...allowedOrigins],
    methods: ['GET', 'POST'],
    credentials: false
  }
});

// This server only keeps temporary signalling metadata. Media never reaches it.
const rooms = new Map();
const pendingRooms = new Map();
const pinAttempts = new Map();
const rateLimitBuckets = new Map();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      connectSrc: ["'self'", 'wss:'],
      imgSrc: ["'self'", 'data:'],
      mediaSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginResourcePolicy: { policy: 'same-origin' }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/healthz', (_request, response) => {
  response.status(200).json({ status: 'ok', service: SERVICE_NAME });
});

function log(event, details = {}) {
  // Keep operational logs useful without recording SDP, PINs, tokens, IPs or room IDs.
  console.info(JSON.stringify({ timestamp: new Date().toISOString(), service: SERVICE_NAME, event, ...details }));
}

function logError(event, error) {
  log(event, { level: 'error', error: error?.name || 'Error' });
}

if (TURN_URLS.length && !TURN_SHARED_SECRET) {
  log('turn_disabled_missing_shared_secret', { level: 'warn' });
}

function createRoomId() {
  return crypto.randomBytes(ROOM_ID_BYTES).toString('base64url');
}

function createSecret() {
  return crypto.randomBytes(32).toString('base64url');
}

function createIceServers(allowTurn = true) {
  const iceServers = [{ urls: DEFAULT_STUN_URL }];
  if (!allowTurn || !TURN_URLS.length || !TURN_SHARED_SECRET) return iceServers;

  // Coturn's REST API scheme: username is an expiry timestamp plus an opaque suffix.
  const expiresAt = Math.floor(Date.now() / 1000) + TURN_TTL_SECONDS;
  const username = `${expiresAt}:${crypto.randomBytes(12).toString('hex')}`;
  const credential = crypto
    .createHmac('sha1', TURN_SHARED_SECRET)
    .update(username)
    .digest('base64');

  iceServers.push({ urls: TURN_URLS, username, credential });
  return iceServers;
}

function normalizeRoomId(roomId) {
  if (typeof roomId !== 'string') return null;
  const normalizedRoomId = roomId.trim();
  return ROOM_ID_PATTERN.test(normalizedRoomId) ? normalizedRoomId : null;
}

function normalizePin(pin) {
  if (pin === undefined || pin === null || pin === '') return null;
  if (typeof pin !== 'string') return undefined;
  const normalizedPin = pin.trim();
  return PIN_PATTERN.test(normalizedPin) ? normalizedPin : undefined;
}

function normalizeRoomMode(mode) {
  if (mode === undefined || mode === null || mode === '') return ROOM_MODES.reliable;
  return typeof mode === 'string' ? ROOM_MODES[mode] || null : null;
}

function roomDetails(room) {
  return {
    mode: room.mode.id,
    modeLabel: room.mode.label,
    maxViewers: room.mode.maxViewers,
    allowTurn: room.mode.allowTurn,
    viewerCount: room.viewerIds.size
  };
}

async function hashSecret(secret, salt = crypto.randomBytes(16)) {
  const hash = await scrypt(secret, salt, 64);
  return { salt: salt.toString('base64'), hash: hash.toString('base64') };
}

async function verifySecret(secret, stored) {
  if (typeof secret !== 'string' || !stored?.salt || !stored?.hash) return false;
  const expected = Buffer.from(stored.hash, 'base64');
  const actual = await scrypt(secret, Buffer.from(stored.salt, 'base64'), expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function sendRoomError(socket, message) {
  socket.emit('room-error', { message });
}

function getClientIp(socket) {
  const forwardedFor = socket.handshake.headers['x-forwarded-for'];
  const value = Array.isArray(forwardedFor) ? forwardedFor.at(-1) : forwardedFor;
  // Nginx overwrites this header with $remote_addr. Taking the final value here
  // also prevents a client from choosing a rate-limit key by prepending an IP.
  return String(value || socket.handshake.address || 'unknown').split(',').at(-1).trim();
}

function checkRateLimit(key, { windowMs, max }) {
  const now = Date.now();
  const bucket = (rateLimitBuckets.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  if (bucket.length >= max) {
    rateLimitBuckets.set(key, bucket);
    return false;
  }
  bucket.push(now);
  rateLimitBuckets.set(key, bucket);
  return true;
}

function touchRoom(room) {
  room.lastActivityAt = Date.now();
}

function clearSocketRoomData(socket, roomId) {
  if (socket?.data.roomId === roomId) {
    socket.leave(roomId);
    delete socket.data.roomId;
    delete socket.data.role;
  }
}

function closeRoom(roomId, message) {
  const room = rooms.get(roomId);
  if (!room) return;

  for (const socketId of [room.hostId, ...room.viewerIds]) {
    if (!socketId) continue;
    const participant = io.sockets.sockets.get(socketId);
    if (participant) {
      participant.emit('room-closed', { message });
      clearSocketRoomData(participant, roomId);
    }
  }
  rooms.delete(roomId);
}

function relayToPeer(socket, eventName, payload, allowedRole) {
  if (socket.data.role !== allowedRole) {
    sendRoomError(socket, 'Этот сигнальный запрос недоступен для вашей роли.');
    return;
  }

  const room = rooms.get(socket.data.roomId);
  if (!room) {
    sendRoomError(socket, 'Комната больше не активна.');
    return;
  }

  const limit = SIGNAL_RATE_LIMITS[eventName];
  if (limit && !checkRateLimit(`signal:${eventName}:${socket.id}`, limit)) {
    sendRoomError(socket, 'Too many signalling messages. Please try again later.');
    return;
  }

  const targetId = payload?.targetId;
  const peerSocketId = allowedRole === 'host' ? targetId : room.hostId;
  if (allowedRole === 'host' && (typeof targetId !== 'string' || !room.viewerIds.has(targetId))) {
    sendRoomError(socket, 'Получатель сигнального сообщения больше не находится в комнате.');
    return;
  }
  const peer = peerSocketId && io.sockets.sockets.get(peerSocketId);
  if (!peer || peer.data.roomId !== socket.data.roomId) return;

  // SDP and ICE remain opaque: the server forwards them only to the room peer.
  touchRoom(room);
  const { targetId: _targetId, ...signal } = payload || {};
  peer.emit(eventName, { ...signal, senderId: socket.id });
}

function leaveCurrentRoom(socket) {
  const roomId = socket.data.roomId;
  const role = socket.data.role;
  if (!roomId || !role) return;

  const room = rooms.get(roomId);
  clearSocketRoomData(socket, roomId);
  if (!room) return;

  if (role === 'host' && room.hostId === socket.id) {
    for (const viewerId of room.viewerIds) {
      const viewer = io.sockets.sockets.get(viewerId);
      viewer?.emit('host-disconnected', { message: 'Ведущий отключился. Трансляция завершена.' });
      clearSocketRoomData(viewer, roomId);
    }
    rooms.delete(roomId);
    log('room_closed', { reason: 'host_disconnected' });
    return;
  }

  if (role === 'viewer' && room.viewerIds.delete(socket.id)) {
    touchRoom(room);
    io.to(room.hostId).emit('viewer-disconnected', {
      viewerId: socket.id,
      message: 'Зритель отключился.',
      ...roomDetails(room)
    });
    log('viewer_disconnected');
  }
}

function pinAttemptKey(roomId, ip) {
  return `${roomId}:${ip}`;
}

function getPinBlock(roomId, ip) {
  const attempt = pinAttempts.get(pinAttemptKey(roomId, ip));
  if (!attempt?.blockedUntil || attempt.blockedUntil <= Date.now()) return null;
  return attempt.blockedUntil;
}

function recordFailedPin(roomId, ip) {
  const key = pinAttemptKey(roomId, ip);
  const previous = pinAttempts.get(key) || { count: 0, blockedUntil: 0 };
  const next = { count: previous.count + 1, blockedUntil: 0, updatedAt: Date.now() };
  if (next.count >= PIN_ATTEMPT_LIMIT) {
    next.count = 0;
    next.blockedUntil = Date.now() + PIN_BLOCK_MS;
  }
  pinAttempts.set(key, next);
  return next;
}

function clearPinAttempts(roomId, ip) {
  pinAttempts.delete(pinAttemptKey(roomId, ip));
}

function isOriginAllowed(origin) {
  return typeof origin === 'string' && allowedOrigins.has(origin);
}

io.use((socket, next) => {
  if (!isOriginAllowed(socket.handshake.headers.origin)) {
    next(new Error('Недопустимый источник подключения.'));
    return;
  }

  const ip = getClientIp(socket);
  if (!checkRateLimit(`connect:${ip}`, { windowMs: 60_000, max: 30 })) {
    next(new Error('Слишком много попыток подключения. Повторите позже.'));
    return;
  }

  socket.data.clientIp = ip;
  next();
});

io.on('connection', (socket) => {
  socket.on('create-room', async (payload, callback) => {
    try {
      if (typeof payload === 'function') {
        callback = payload;
        payload = {};
      }
      if (!checkRateLimit(`create:${socket.data.clientIp}`, { windowMs: 10 * 60 * 1000, max: 5 })) {
        callback?.({ ok: false, message: 'Слишком много созданных комнат. Повторите через несколько минут.' });
        return;
      }
      if (pendingRooms.size >= MAX_PENDING_ROOMS) {
        callback?.({ ok: false, message: 'Service is temporarily busy creating rooms. Please try again later.' });
        return;
      }

      const pin = normalizePin(payload?.pin);
      if (pin === undefined) {
        callback?.({ ok: false, message: 'PIN должен состоять из 4–8 цифр.' });
        return;
      }
      const mode = normalizeRoomMode(payload?.mode);
      if (!mode) {
        callback?.({ ok: false, message: 'Выберите допустимый режим комнаты.' });
        return;
      }

      let roomId;
      do {
        roomId = createRoomId();
      } while (rooms.has(roomId) || pendingRooms.has(roomId));

      const hostToken = createSecret();
      const reservation = {
        hostToken: await hashSecret(hostToken),
        pin: pin ? await hashSecret(pin) : null,
        mode,
        createdAt: Date.now()
      };
      pendingRooms.set(roomId, reservation);
      log('room_reservation_created', { pinProtected: Boolean(pin), mode: mode.id });
      callback?.({ ok: true, roomId, hostToken, mode: mode.id, maxViewers: mode.maxViewers });
    } catch (error) {
      logError('room_create_failed', error);
      callback?.({ ok: false, message: 'Не удалось создать комнату. Повторите попытку.' });
    }
  });

  socket.on('join-room', (payload) => {
    void (async () => {
      const roomId = normalizeRoomId(payload?.roomId);
      if (!roomId) {
        sendRoomError(socket, 'Введите корректный код комнаты.');
        return;
      }
      if (socket.data.roomId) {
        sendRoomError(socket, 'Вы уже подключены к комнате.');
        return;
      }

      const wantsToHost = payload?.intent === 'host';
      let room = rooms.get(roomId);

      if (!room) {
        if (!wantsToHost) {
          sendRoomError(socket, 'Комната не найдена или трансляция уже завершена.');
          return;
        }

        const reservation = pendingRooms.get(roomId);
        if (!reservation || Date.now() - reservation.createdAt > PENDING_ROOM_TTL_MS) {
          pendingRooms.delete(roomId);
          sendRoomError(socket, 'Ссылка на создание комнаты недействительна. Создайте новую комнату.');
          return;
        }
        if (!(await verifySecret(payload?.hostToken, reservation.hostToken))) {
          sendRoomError(socket, 'Не удалось подтвердить право на создание этой комнаты.');
          return;
        }
        if (rooms.size >= MAX_ACTIVE_ROOMS) {
          sendRoomError(socket, 'Service has reached its active-room limit. Please try again later.');
          return;
        }

        room = {
          hostId: socket.id,
          viewerIds: new Set(),
          mode: reservation.mode,
          pin: reservation.pin,
          createdAt: Date.now(),
          lastActivityAt: Date.now()
        };
        pendingRooms.delete(roomId);
        rooms.set(roomId, room);
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.role = 'host';
        log('room_activated', { role: 'host', pinProtected: Boolean(room.pin), mode: room.mode.id });
        socket.emit('room-created', { roomId, role: 'host', pinRequired: Boolean(room.pin), ...roomDetails(room) });
        return;
      }

      if (wantsToHost || room.hostId === socket.id || room.viewerIds.has(socket.id)) {
        sendRoomError(socket, 'Вы уже подключены к этой комнате или не можете занять роль ведущего.');
        return;
      }
      if (room.viewerIds.size >= room.mode.maxViewers) {
        socket.emit('room-full', {
          message: `В комнате уже находится максимум зрителей: ${room.mode.maxViewers}.`,
          ...roomDetails(room)
        });
        return;
      }

      if (room.pin) {
        const blockedUntil = getPinBlock(roomId, socket.data.clientIp);
        if (blockedUntil) {
          socket.emit('room-pin-error', {
            message: 'Ввод PIN временно заблокирован после нескольких неверных попыток.',
            blockedUntil
          });
          return;
        }
        const pin = normalizePin(payload?.pin);
        if (!pin) {
          socket.emit('room-pin-required', { message: 'Эта комната защищена PIN-кодом.' });
          return;
        }
        if (!(await verifySecret(pin, room.pin))) {
          const attempt = recordFailedPin(roomId, socket.data.clientIp);
          socket.emit('room-pin-error', {
            message: attempt.blockedUntil
              ? 'PIN временно заблокирован после нескольких неверных попыток.'
              : 'PIN-код неверный. Попробуйте ещё раз.',
            blockedUntil: attempt.blockedUntil || undefined
          });
          return;
        }
        clearPinAttempts(roomId, socket.data.clientIp);
      }

      room.viewerIds.add(socket.id);
      touchRoom(room);
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.role = 'viewer';
      log('viewer_joined', { mode: room.mode.id, viewerCount: room.viewerIds.size });
      socket.emit('room-joined', { roomId, role: 'viewer', ...roomDetails(room) });
      io.to(room.hostId).emit('viewer-connected', {
        viewerId: socket.id,
        message: 'Зритель подключился к комнате.',
        ...roomDetails(room)
      });
    })().catch((error) => {
      logError('room_join_failed', error);
      sendRoomError(socket, 'Не удалось подключиться к комнате. Повторите попытку.');
    });
  });

  socket.on('webrtc-offer', (payload) => relayToPeer(socket, 'webrtc-offer', payload, 'host'));
  socket.on('webrtc-answer', (payload) => relayToPeer(socket, 'webrtc-answer', payload, 'viewer'));
  socket.on('ice-candidate', (payload) => {
    if (socket.data.role !== 'host' && socket.data.role !== 'viewer') {
      sendRoomError(socket, 'Сначала подключитесь к комнате.');
      return;
    }
    relayToPeer(socket, 'ice-candidate', payload, socket.data.role);
  });
  socket.on('get-turn-credentials', (payload, callback) => {
    if (typeof payload === 'function') callback = payload;
    const room = rooms.get(socket.data.roomId);
    if (!socket.data.roomId || !socket.data.role || !room) {
      callback?.({ ok: false, message: 'Сначала подключитесь к активной комнате.' });
      return;
    }
    if (!checkRateLimit(`turn:${socket.data.clientIp}`, { windowMs: 5 * 60 * 1000, max: 10 })) {
      callback?.({ ok: false, message: 'Слишком много запросов TURN-данных. Повторите позже.' });
      return;
    }
    callback?.({ ok: true, iceServers: createIceServers(room.mode.allowTurn), allowTurn: room.mode.allowTurn });
  });
  socket.on('stream-stopped', (payload) => {
    if (socket.data.role !== 'host') {
      sendRoomError(socket, 'Этот сигнальный запрос недоступен для вашей роли.');
      return;
    }
    const room = rooms.get(socket.data.roomId);
    if (!room) {
      sendRoomError(socket, 'Комната больше не активна.');
      return;
    }
    if (!checkRateLimit(`signal:stream-stopped:${socket.id}`, SIGNAL_RATE_LIMITS['stream-stopped'])) {
      sendRoomError(socket, 'Слишком много сигнальных сообщений. Повторите позже.');
      return;
    }
    for (const viewerId of room.viewerIds) {
      const viewer = io.sockets.sockets.get(viewerId);
      if (viewer?.data.roomId === socket.data.roomId) viewer.emit('stream-stopped', payload);
    }
  });
  socket.on('disconnect', () => leaveCurrentRoom(socket));
});

function cleanupExpiredRooms() {
  const now = Date.now();
  for (const [roomId, reservation] of pendingRooms) {
    if (now - reservation.createdAt > PENDING_ROOM_TTL_MS) pendingRooms.delete(roomId);
  }
  for (const [roomId, room] of rooms) {
    if (now - room.createdAt > ROOM_MAX_AGE_MS) {
      closeRoom(roomId, 'Комната закрыта: достигнут максимальный срок её работы.');
    } else if (now - room.lastActivityAt > ROOM_IDLE_TTL_MS) {
      closeRoom(roomId, 'Комната закрыта из-за длительной неактивности.');
    }
  }
  for (const [key, attempt] of pinAttempts) {
    if (!attempt.blockedUntil || attempt.blockedUntil <= now) pinAttempts.delete(key);
  }
  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.every((timestamp) => now - timestamp > 10 * 60 * 1000)) rateLimitBuckets.delete(key);
  }
}

const cleanupTimer = setInterval(cleanupExpiredRooms, 60_000);
cleanupTimer.unref();

function start() {
  server.listen(PORT, '127.0.0.1', () => {
    log('server_started', { port: server.address().port });
  });
}

if (require.main === module) start();

module.exports = {
  app,
  server,
  io,
  rooms,
  pendingRooms,
  pinAttempts,
  rateLimitBuckets,
  cleanupExpiredRooms,
  getClientIp,
  isOriginAllowed,
  start
};

