const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Game state management
const gameRooms = new Map();

// Log all incoming requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
});

// Create game endpoint
app.post('/api/create-game', (req, res) => {
  console.log('Received create game request:', req.body);
  const { playerName } = req.body;
  
  try {
    const roomId = Math.random().toString(36).substring(7);
    const gameRoom = {
      id: roomId,
      players: [{ id: 'http-' + roomId, name: playerName }],
      status: 'waiting'
    };
    
    gameRooms.set(roomId, gameRoom);
    
    console.log('Created game room:', gameRoom);
    res.json({ success: true, roomId });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ success: false, error: 'Failed to create game' });
  }
});

// Join game endpoint
app.post('/api/join-game', (req, res) => {
  console.log('Received join game request:', req.body);
  const { roomId, playerName } = req.body;
  
  try {
    const room = gameRooms.get(roomId);
    if (room && room.players.length < 2) {
      room.players.push({ id: 'http-' + roomId + '-2', name: playerName });
      if (room.players.length === 2) {
        room.status = 'ready';
      }
      res.json({ success: true, room });
    } else {
      res.status(400).json({ success: false, error: 'Room not found or full' });
    }
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ success: false, error: 'Failed to join game' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeRooms: gameRooms.size,
    serverTime: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
