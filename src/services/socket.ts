import { io } from 'socket.io-client';

const serverUrl = import.meta.env.VITE_SERVER_URL;
console.log('Connecting to server:', serverUrl);

if (!serverUrl) {
  throw new Error('VITE_SERVER_URL environment variable is not set');
}

const socket = io(serverUrl, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ['polling'], // Only use polling
  forceNew: true,
  withCredentials: true
});

// Debug logging
socket.on('connect', () => {
  console.log('Connected to server successfully');
  console.log('Socket ID:', socket.id);
  console.log('Transport:', socket.io.engine.transport.name);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  console.log('Connection details:', {
    serverUrl,
    readyState: socket.connected,
    id: socket.id,
    transport: socket.io.engine.transport.name
  });
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

// Add error event listener
socket.on('error', (error) => {
  console.error('Socket error:', error);
});

export { socket };