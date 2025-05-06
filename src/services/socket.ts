import { io } from 'socket.io-client';

const serverUrl = import.meta.env.VITE_SERVER_URL;
console.log('Connecting to server:', serverUrl);

const socket = io(serverUrl, {
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 2000
});

export { socket };
