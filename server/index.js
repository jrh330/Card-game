const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);

// Get allowed origins from environment variable or default to localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:5173"];

console.log('Allowed origins:', allowedOrigins);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const gameRooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('createGame', (data) => {
    console.log('Creating game for player:', data.playerName);
    const roomId = Math.random().toString(36).substring(7);
    gameRooms.set(roomId, {
      id: roomId,
      players: [{ id: socket.id, name: data.playerName }],
      status: 'waiting'
    });
    socket.join(roomId);
    socket.emit('gameCreated', { roomId, playerId: socket.id });
    console.log('Game created with room ID:', roomId);
  });

  socket.on('joinGame', ({ roomId, playerName }) => {
    const room = gameRooms.get(roomId);
    if (room && room.players.length < 2) {
      room.players.push({ id: socket.id, name: playerName });
      socket.join(roomId);
      io.to(roomId).emit('playerJoined', room);
      if (room.players.length === 2) {
        room.status = 'ready';
        io.to(roomId).emit('gameReady', room);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    for (const [roomId, room] of gameRooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
        } else {
          io.to(roomId).emit('playerLeft', room);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Server configuration:', {
    port: PORT,
    allowedOrigins,
    environment: process.env.NODE_ENV
  });
});