const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Basic CORS setup for Express
app.use(cors());

const httpServer = createServer(app);

// Socket.IO setup with proper CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Game state management
const gameRooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create a new game room
  socket.on('createGame', (data) => {
    const roomId = Math.random().toString(36).substring(7);
    gameRooms.set(roomId, {
      id: roomId,
      players: [{ id: socket.id, name: data.playerName }],
      status: 'waiting'
    });
    socket.join(roomId);
    socket.emit('gameCreated', { roomId, playerId: socket.id });
    console.log('Game created:', roomId);
  });

  // Join an existing game room
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

  // Handle disconnection
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});