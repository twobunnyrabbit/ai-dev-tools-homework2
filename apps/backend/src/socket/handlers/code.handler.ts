import { Server as SocketIOServer, Socket } from 'socket.io';
import * as sessionService from '../../services/session.service.js';
import { Language } from '../../types/session.types.js';

// Track which session each socket is in
const socketToSession = new Map<string, string>();

export function registerCodeHandlers(io: SocketIOServer, socket: Socket): void {
  // Track session when user joins
  socket.on('join-session', ({ sessionId }: { sessionId: string }) => {
    socketToSession.set(socket.id, sessionId);
  });

  // Handle code-change event
  socket.on('code-change', ({ code }: { code: string }) => {
    const sessionId = socketToSession.get(socket.id);

    if (!sessionId) {
      socket.emit('error', { message: 'Not in a session' });
      return;
    }

    // Update the code in the session
    const updated = sessionService.updateSessionCode(sessionId, code);

    if (!updated) {
      socket.emit('error', { message: 'Failed to update code' });
      return;
    }

    // Broadcast to other users in the session
    socket.to(sessionId).emit('code-update', {
      code,
      userId: socket.id,
    });
  });

  // Handle language-change event
  socket.on('language-change', ({ language }: { language: Language }) => {
    const sessionId = socketToSession.get(socket.id);

    if (!sessionId) {
      socket.emit('error', { message: 'Not in a session' });
      return;
    }

    // Update the language in the session
    const updated = sessionService.updateSessionLanguage(sessionId, language);

    if (!updated) {
      socket.emit('error', { message: 'Failed to update language' });
      return;
    }

    // Broadcast to all users in the session (including sender)
    io.to(sessionId).emit('language-update', {
      language,
      userId: socket.id,
    });
  });

  // Handle cursor-move event
  socket.on('cursor-move', ({ position }: { position: { line: number; column: number } }) => {
    const sessionId = socketToSession.get(socket.id);

    if (!sessionId) {
      return;
    }

    // Broadcast cursor position to other users
    socket.to(sessionId).emit('cursor-update', {
      userId: socket.id,
      position,
    });
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    socketToSession.delete(socket.id);
  });
}
