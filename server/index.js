const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Log all incoming requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin
  });
  next();
});

app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Log all socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', {
    id: socket.id,
    origin: socket.handshake.headers.origin
  });

  // ... rest of your socket event handlers ...
});

// Health check endpoint with more details
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    serverUrl: process.env.SERVER_URL,
    cors: io.engine.cors
  });
});

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Server configuration:', {
    port: PORT,
    environment: process.env.NODE_ENV,
    cors: io.engine.cors
  });
});