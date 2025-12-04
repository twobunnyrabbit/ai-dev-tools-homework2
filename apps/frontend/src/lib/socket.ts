import { io } from 'socket.io-client';

// Socket.io server URL configuration
// - In production: empty string (same-origin, backend serves frontend)
// - In development: http://localhost:3000 (proxied by Vite dev server)
// - Can be overridden with VITE_API_URL env var
const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3000');

// Create Socket.io client instance
// autoConnect: false - don't connect automatically, wait for explicit connect() call
// reconnection: true - enable automatic reconnection on disconnect
// reconnectionAttempts: 5 - try to reconnect up to 5 times
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
