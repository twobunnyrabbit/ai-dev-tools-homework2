import { Server as SocketIOServer, Socket } from 'socket.io';
import * as sessionService from '../../services/session.service.js';
import { generateUserId } from '../../utils/id-generator.js';
import { User } from '../../types/session.types.js';

// Track which session each socket is in
const socketToSession = new Map<string, string>();
const socketToUser = new Map<string, User>();

export function registerSessionHandlers(io: SocketIOServer, socket: Socket): void {
  // Handle join-session event
  socket.on('join-session', ({ sessionId, username }: { sessionId: string; username: string }) => {
    const session = sessionService.getSession(sessionId);

    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    // Handle duplicate usernames by appending a number
    let finalUsername = username;
    const existingUsers = sessionService.getSessionUsers(sessionId);
    const existingUsernames = existingUsers.map((u) => u.username);

    if (existingUsernames.includes(username)) {
      let counter = 2;
      while (existingUsernames.includes(`${username}-${counter}`)) {
        counter++;
      }
      finalUsername = `${username}-${counter}`;
    }

    // Create user object
    const user: User = {
      id: generateUserId(),
      username: finalUsername,
      socketId: socket.id,
    };

    // Add user to session
    sessionService.addUserToSession(sessionId, user);

    // Track the connection
    socketToSession.set(socket.id, sessionId);
    socketToUser.set(socket.id, user);

    // Join the socket room
    socket.join(sessionId);

    // Notify the user they've joined
    socket.emit('session-joined', {
      userId: user.id,
      username: finalUsername,
      users: sessionService.getSessionUsers(sessionId),
    });

    // Notify other users in the session
    socket.to(sessionId).emit('user-joined', {
      user,
      users: sessionService.getSessionUsers(sessionId),
    });

    console.log(`User ${finalUsername} (${user.id}) joined session ${sessionId}`);
  });

  // Handle leave-session event
  socket.on('leave-session', () => {
    handleUserLeaving(io, socket);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    handleUserLeaving(io, socket);
  });
}

/**
 * Handle user leaving a session
 */
function handleUserLeaving(io: SocketIOServer, socket: Socket): void {
  const sessionId = socketToSession.get(socket.id);
  const user = socketToUser.get(socket.id);

  if (sessionId && user) {
    // Remove user from session
    sessionService.removeUserFromSession(sessionId, user.id);

    // Leave the socket room
    socket.leave(sessionId);

    // Notify other users
    socket.to(sessionId).emit('user-left', {
      userId: user.id,
      username: user.username,
      users: sessionService.getSessionUsers(sessionId),
    });

    // Clean up tracking
    socketToSession.delete(socket.id);
    socketToUser.delete(socket.id);

    console.log(`User ${user.username} (${user.id}) left session ${sessionId}`);
  }
}
