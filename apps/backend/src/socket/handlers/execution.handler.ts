import { Server as SocketIOServer, Socket } from 'socket.io';
import * as sessionService from '../../services/session.service.js';
import { Language, User } from '../../types/session.types.js';

// Track which session each socket is in
const socketToSession = new Map<string, string>();
const socketToUser = new Map<string, User>();

// Execution result type (matches frontend)
interface ExecutionResult {
  status: 'idle' | 'running' | 'success' | 'error' | 'timeout';
  output?: string;
  error?: string;
  executionTime?: number;
  timestamp: number;
}

export function registerExecutionHandlers(io: SocketIOServer, socket: Socket): void {
  // Track session and user when they join
  socket.on('join-session', ({ sessionId, username }: { sessionId: string; username: string }) => {
    const session = sessionService.getSession(sessionId);
    if (session) {
      socketToSession.set(socket.id, sessionId);
      // Find user from session by socket ID
      const users = sessionService.getSessionUsers(sessionId);
      const user = users.find(u => u.socketId === socket.id);
      if (user) {
        socketToUser.set(socket.id, user);
      }
    }
  });

  // Handle execution-started event
  socket.on('execution-started', ({ sessionId, code, language }: {
    sessionId: string;
    code: string;
    language: Language;
  }) => {
    const trackedSessionId = socketToSession.get(socket.id);
    const user = socketToUser.get(socket.id);

    if (!trackedSessionId || trackedSessionId !== sessionId) {
      socket.emit('error', { message: 'Not in session' });
      return;
    }

    if (!user) {
      socket.emit('error', { message: 'User not found' });
      return;
    }

    // Broadcast to all users in session (including sender)
    io.to(sessionId).emit('execution-started', {
      userId: user.id,
      username: user.username,
      code,
      language,
      timestamp: Date.now(),
    });
  });

  // Handle execution-result event
  socket.on('execution-result', ({ sessionId, result }: {
    sessionId: string;
    result: ExecutionResult;
  }) => {
    const trackedSessionId = socketToSession.get(socket.id);
    const user = socketToUser.get(socket.id);

    if (!trackedSessionId || trackedSessionId !== sessionId) {
      socket.emit('error', { message: 'Not in session' });
      return;
    }

    if (!user) {
      socket.emit('error', { message: 'User not found' });
      return;
    }

    // Broadcast to all users in session (including sender)
    io.to(sessionId).emit('execution-update', {
      userId: user.id,
      username: user.username,
      result,
      timestamp: Date.now(),
    });
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    socketToSession.delete(socket.id);
    socketToUser.delete(socket.id);
  });
}
