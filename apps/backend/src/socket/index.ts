import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerSessionHandlers } from './handlers/session.handler.js';
import { registerCodeHandlers } from './handlers/code.handler.js';

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Register event handlers
    registerSessionHandlers(io, socket);
    registerCodeHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
