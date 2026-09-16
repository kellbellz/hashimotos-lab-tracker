'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { Room } = require('./room');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));

const server = http.createServer(app);
const io = new Server(server);

/** @type {Map<string, Room>} */
const rooms = new Map();
// socket.id -> { code, playerId }
const socketMeta = new Map();

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateRoomCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function broadcast(room) {
  for (let seat = 0; seat < 4; seat++) {
    const p = room.players[seat];
    if (p && !p.isBot && p.socketId) {
      io.to(p.socketId).emit('state', room.buildView(seat));
    }
  }
}

function getRoomOrThrow(code) {
  const room = rooms.get(code);
  if (!room) throw new Error('Room not found');
  return room;
}

function attachBotHook(room) {
  room.onBotMove = () => broadcast(room);
}

io.on('connection', (socket) => {
  socket.on('createRoom', ({ name, playerId, rulesetName, targetScore }, cb) => {
    try {
      const code = generateRoomCode();
      const room = new Room(code, { rulesetName, targetScore });
      attachBotHook(room);
      const seat = room.addPlayer(playerId, name, socket.id);
      rooms.set(code, room);
      socketMeta.set(socket.id, { code, playerId });
      socket.join(code);
      cb({ ok: true, code, seat });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('joinRoom', ({ code, name, playerId }, cb) => {
    try {
      const room = getRoomOrThrow((code || '').toUpperCase());
      const seat = room.addPlayer(playerId, name, socket.id);
      socketMeta.set(socket.id, { code: room.code, playerId });
      socket.join(room.code);
      cb({ ok: true, code: room.code, seat });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('rejoinRoom', ({ code, playerId }, cb) => {
    try {
      const room = getRoomOrThrow((code || '').toUpperCase());
      const seat = room.findSeatByPlayerId(playerId);
      if (seat === -1) throw new Error('You are not part of that room');
      room.players[seat].socketId = socket.id;
      room.players[seat].connected = true;
      socketMeta.set(socket.id, { code: room.code, playerId });
      socket.join(room.code);
      cb({ ok: true, code: room.code, seat });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('switchSeat', ({ code, targetSeat }, cb) => {
    try {
      const room = getRoomOrThrow(code);
      const meta = socketMeta.get(socket.id);
      room.switchSeat(meta.playerId, targetSeat);
      cb({ ok: true });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('addBot', ({ code, seat }, cb) => {
    try {
      const room = getRoomOrThrow(code);
      room.addBot(seat);
      cb({ ok: true });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('startGame', ({ code }, cb) => {
    try {
      const room = getRoomOrThrow(code);
      room.startGame();
      cb({ ok: true });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('dealNextHand', ({ code }, cb) => {
    try {
      const room = getRoomOrThrow(code);
      if (room.phase !== 'handOver') throw new Error('Hand is not over yet');
      const meta = socketMeta.get(socket.id);
      const seat = room.findSeatByPlayerId(meta.playerId);
      if (seat !== room.dealerSeat) throw new Error('Only the dealer deals the next hand');
      room.startHand();
      cb({ ok: true });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('placeBid', ({ code, amount, pass }, cb) => {
    try {
      const room = getRoomOrThrow(code);
      const meta = socketMeta.get(socket.id);
      const seat = room.findSeatByPlayerId(meta.playerId);
      room.placeBid(seat, { amount, pass });
      cb({ ok: true });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('resolveNest', ({ code, discards, trump }, cb) => {
    try {
      const room = getRoomOrThrow(code);
      const meta = socketMeta.get(socket.id);
      const seat = room.findSeatByPlayerId(meta.playerId);
      room.resolveNest(seat, discards, trump);
      cb({ ok: true });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('setTeamName', ({ code, team, name }, cb) => {
    try {
      const room = getRoomOrThrow(code);
      const meta = socketMeta.get(socket.id);
      const seat = room.findSeatByPlayerId(meta.playerId);
      room.setTeamName(seat, team, name);
      cb({ ok: true });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('playCard', ({ code, card }, cb) => {
    try {
      const room = getRoomOrThrow(code);
      const meta = socketMeta.get(socket.id);
      const seat = room.findSeatByPlayerId(meta.playerId);
      room.playCard(seat, card);
      cb({ ok: true });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('clearTrick', ({ code }, cb) => {
    try {
      const room = getRoomOrThrow(code);
      const meta = socketMeta.get(socket.id);
      const seat = room.findSeatByPlayerId(meta.playerId);
      room.clearTrick(seat);
      cb({ ok: true });
      broadcast(room);
    } catch (err) {
      cb({ ok: false, error: err.message });
    }
  });

  socket.on('disconnect', () => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    const room = rooms.get(meta.code);
    if (room) {
      room.markDisconnected(socket.id);
      broadcast(room);
    }
    socketMeta.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Rook online listening on http://localhost:${PORT}`);
});
