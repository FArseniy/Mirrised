const assert = require('node:assert/strict');
const { after, afterEach, before, test } = require('node:test');
const {
  app,
  io,
  pendingRooms,
  pinAttempts,
  rateLimitBuckets,
  rooms,
  server,
  cleanupExpiredRooms,
  getClientIp,
  isOriginAllowed
} = require('../server');
const { connect, createRoom, emitWithAck, joinViewer, once } = require('./helpers/socket');

let baseUrl;
let testSockets = [];

function track(socket) {
  testSockets.push(socket);
  return socket;
}

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(() => {
  for (const socket of testSockets) socket.disconnect();
  testSockets = [];
  rooms.clear();
  pendingRooms.clear();
  pinAttempts.clear();
  rateLimitBuckets.clear();
});

after(async () => {
  await new Promise((resolve) => io.close(resolve));
  await new Promise((resolve) => server.close(resolve));
});

test('health endpoint reports the service status', async () => {
  const response = await fetch(`${baseUrl}/healthz`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'Mirrised' });
});

test('requires the configured browser origin and uses the final proxy IP', () => {
  assert.equal(isOriginAllowed('https://mirror.erised.click'), true);
  assert.equal(isOriginAllowed(undefined), false);
  assert.equal(isOriginAllowed('https://attacker.example'), false);
  assert.equal(getClientIp({
    handshake: { headers: { 'x-forwarded-for': '203.0.113.88, 198.51.100.42' } }
  }), '198.51.100.42');
});

test('rejects a missing or malformed room id', async () => {
  const client = track(await connect(baseUrl));
  const error = once(client, 'room-error');
  client.emit('join-room', { roomId: '<script>', intent: 'viewer' });

  assert.match((await error).message, /коррект/i);
});

test('admits only a host and one viewer', async () => {
  const host = track(await connect(baseUrl));
  const viewer = track(await connect(baseUrl));
  const thirdClient = track(await connect(baseUrl));
  const { roomId } = await createRoom(host);

  await joinViewer(viewer, roomId);
  const full = once(thirdClient, 'room-full');
  thirdClient.emit('join-room', { roomId, intent: 'viewer' });

  assert.match((await full).message, /максимум.*1/i);
});

test('notifies the host about viewer departure and accepts a replacement viewer', async () => {
  const host = track(await connect(baseUrl));
  const viewer = track(await connect(baseUrl));
  const replacement = track(await connect(baseUrl));
  const { roomId } = await createRoom(host);

  await joinViewer(viewer, roomId);
  const disconnected = once(host, 'viewer-disconnected');
  viewer.disconnect();
  assert.match((await disconnected).message, /зрител/i);

  await joinViewer(replacement, roomId);
  assert.equal(rooms.get(roomId).viewerIds.has(replacement.id), true);
});

test('notifies the viewer and deletes the room when the host disconnects', async () => {
  const host = track(await connect(baseUrl));
  const viewer = track(await connect(baseUrl));
  const { roomId } = await createRoom(host);
  await joinViewer(viewer, roomId);

  const disconnected = once(viewer, 'host-disconnected');
  host.disconnect();
  assert.match((await disconnected).message, /ведущий/i);
  assert.equal(rooms.has(roomId), false);
});

test('forwards SDP signalling only to the peer in the same room', async () => {
  const hostA = track(await connect(baseUrl));
  const viewerA = track(await connect(baseUrl));
  const hostB = track(await connect(baseUrl));
  const viewerB = track(await connect(baseUrl));
  const roomA = await createRoom(hostA);
  const roomB = await createRoom(hostB);
  await joinViewer(viewerA, roomA.roomId);
  await joinViewer(viewerB, roomB.roomId);

  let leaked = false;
  viewerB.once('webrtc-offer', () => { leaked = true; });
  const offer = once(viewerA, 'webrtc-offer');
  hostA.emit('webrtc-offer', { targetId: viewerA.id, sessionId: 'test-session', sdp: { type: 'offer', sdp: 'opaque-test-data' } });

  assert.equal((await offer).sessionId, 'test-session');
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(leaked, false);
});

test('admits up to six viewers in group mode and rejects the seventh', async () => {
  const host = track(await connect(baseUrl));
  const viewers = await Promise.all(Array.from({ length: 7 }, async () => track(await connect(baseUrl))));
  const { roomId } = await createRoom(host, '', 'group');

  for (const viewer of viewers.slice(0, 6)) await joinViewer(viewer, roomId);
  assert.equal(rooms.get(roomId).viewerIds.size, 6);
  assert.equal(rooms.get(roomId).mode.maxViewers, 6);

  const full = once(viewers[6], 'room-full');
  viewers[6].emit('join-room', { roomId, intent: 'viewer' });
  assert.match((await full).message, /максимум/i);
});

test('keeps the direct mode limited to STUN and one viewer', async () => {
  const host = track(await connect(baseUrl));
  const viewer = track(await connect(baseUrl));
  const { roomId } = await createRoom(host, '', 'direct');

  const joined = await joinViewer(viewer, roomId);
  assert.equal(joined.allowTurn, false);
  assert.equal(joined.maxViewers, 1);
  const turn = await emitWithAck(viewer, 'get-turn-credentials');
  assert.equal(turn.allowTurn, false);
  assert.equal(turn.iceServers.length, 1);
});

test('rejects a host signal addressed to a viewer outside its room', async () => {
  const hostA = track(await connect(baseUrl));
  const viewerA = track(await connect(baseUrl));
  const hostB = track(await connect(baseUrl));
  const viewerB = track(await connect(baseUrl));
  const roomA = await createRoom(hostA, '', 'group');
  const roomB = await createRoom(hostB);
  await joinViewer(viewerA, roomA.roomId);
  await joinViewer(viewerB, roomB.roomId);

  const rejected = once(hostA, 'room-error');
  hostA.emit('webrtc-offer', {
    targetId: viewerB.id,
    sessionId: 'wrong-target',
    sdp: { type: 'offer', sdp: 'opaque' }
  });
  assert.match((await rejected).message, /получатель/i);
});

test('rejects a signalling message from the wrong room role', async () => {
  const host = track(await connect(baseUrl));
  const viewer = track(await connect(baseUrl));
  const { roomId } = await createRoom(host);
  await joinViewer(viewer, roomId);

  const rejected = once(viewer, 'room-error');
  viewer.emit('webrtc-offer', { sessionId: 'invalid-role', sdp: { type: 'offer', sdp: 'opaque' } });
  assert.equal(typeof (await rejected).message, 'string');
});

test('blocks PIN entry after repeated incorrect attempts', async () => {
  const host = track(await connect(baseUrl));
  const viewer = track(await connect(baseUrl));
  const { roomId } = await createRoom(host, '1234');

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const error = once(viewer, 'room-pin-error');
    viewer.emit('join-room', { roomId, intent: 'viewer', pin: '9999' });
    const payload = await error;
    if (attempt === 4) assert.ok(payload.blockedUntil > Date.now());
  }

  const blocked = once(viewer, 'room-pin-error');
  viewer.emit('join-room', { roomId, intent: 'viewer', pin: '1234' });
  assert.ok((await blocked).blockedUntil > Date.now());
});

test('removes expired reservations and inactive rooms during cleanup', async () => {
  const creator = track(await connect(baseUrl));
  const reservation = await emitWithAck(creator, 'create-room', { pin: '' });
  pendingRooms.get(reservation.roomId).createdAt = 0;

  const host = track(await connect(baseUrl));
  const { roomId } = await createRoom(host);
  rooms.get(roomId).lastActivityAt = 0;
  const closed = once(host, 'room-closed');

  cleanupExpiredRooms();

  assert.equal(pendingRooms.has(reservation.roomId), false);
  assert.match((await closed).message, /неактивност/i);
  assert.equal(rooms.has(roomId), false);
});

