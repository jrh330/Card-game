// server/server.js
const express = require('express');
const cors = require('cors');
const database = require('./config/database');

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Create game endpoint
app.post('/api/create-game', async (req, res) => {
  console.log('Received create game request:', req.body);
  const { playerName } = req.body;
  
  try {
    if (!playerName) {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    const rooms = await database.getCollection('rooms');
    const roomId = Math.random().toString(36).substring(7);
    
    const gameRoom = {
      id: roomId,
      players: [{ 
        id: 'http-' + roomId, 
        name: playerName 
      }],
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
    
    console.log('Creating new game room:', gameRoom);
    await rooms.insertOne(gameRoom);
    console.log('Game room created successfully');
    
    res.json({ 
      success: true, 
      roomId,
      room: gameRoom
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create game' 
    });
  }
});

const PORT = process.env.PORT || 3002;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('GET  /test');
  console.log('POST /api/create-game');
});