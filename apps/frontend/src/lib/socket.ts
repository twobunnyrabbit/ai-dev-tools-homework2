import { io } from 'socket.io-client';

// Create Socket.io client instance
// autoConnect: false - don't connect automatically, wait for explicit connect() call
// reconnection: true - enable automatic reconnection on disconnect
// reconnectionAttempts: 5 - try to reconnect up to 5 times
export const socket = io({
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
