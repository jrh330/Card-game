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
  transports: ['websocket', 'polling']
});

// Debug logging
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

export { socket };