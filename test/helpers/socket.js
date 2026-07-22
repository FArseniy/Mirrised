Exit code: 0
Wall time: 0.7 seconds
Output:
const { io: createClient } = require('socket.io-client');

let nextClientNumber = 10;

function once(socket, eventName, timeoutMs = 1_500) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(eventName, onEvent);
      reject(new Error(`Timed out waiting for ${eventName}`));
    }, timeoutMs);

    function onEvent(payload) {
      clearTimeout(timeout);
      resolve(payload);
    }

    socket.once(eventName, onEvent);
  });
}

function emitWithAck(socket, eventName, payload, timeoutMs = 1_500) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${eventName} acknowledgement`)), timeoutMs);
    socket.emit(eventName, payload, (response) => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}

async function connect(url) {
  const ip = `198.51.100.${nextClientNumber++}`;
  const socket = createClient(url, {
    forceNew: true,
    reconnection: false,
    transports: ['websocket'],
    extraHeaders: {
      origin: 'https://mirror.erised.click',
      'x-forwarded-for': ip
    }
  });
  await once(socket, 'connect');
  return socket;
}

async function createRoom(hostSocket, pin = '', mode = 'reliable') {
  const created = await emitWithAck(hostSocket, 'create-room', { pin, mode });
  if (!created?.ok) throw new Error(created?.message || 'Unable to reserve room');

  const roomCreated = once(hostSocket, 'room-created');
  hostSocket.emit('join-room', {
    roomId: created.roomId,
    intent: 'host',
    hostToken: created.hostToken
  });
  await roomCreated;
  return created;
}

async function joinViewer(viewerSocket, roomId, pin = '') {
  const joined = once(viewerSocket, 'room-joined');
  viewerSocket.emit('join-room', { roomId, intent: 'viewer', pin });
  return joined;
}

module.exports = { once, emitWithAck, connect, createRoom, joinViewer };

