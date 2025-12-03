import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server as SocketIOServer } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { createServer, Server as HTTPServer } from 'http';
import * as sessionService from '../src/services/session.service.js';
import { registerSessionHandlers } from '../src/socket/handlers/session.handler.js';
import { registerCodeHandlers } from '../src/socket/handlers/code.handler.js';

describe('Socket.io Handlers', () => {
  let httpServer: HTTPServer;
  let io: SocketIOServer;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;
  let serverPort: number;

  beforeEach((done) => {
    // Clear sessions
    const sessions = sessionService.getAllSessions();
    sessions.forEach(session => sessionService.deleteSession(session.id));

    // Create HTTP server
    httpServer = createServer();
    io = new SocketIOServer(httpServer, {
      cors: { origin: '*' },
    });

    // Register handlers
    io.on('connection', (socket) => {
      registerSessionHandlers(io, socket);
      registerCodeHandlers(io, socket);
    });

    // Start server on random port
    httpServer.listen(() => {
      const address = httpServer.address();
      serverPort = typeof address === 'object' && address ? address.port : 3001;
      done();
    });
  });

  afterEach(() => {
    io.close();
    httpServer.close();
    if (clientSocket1?.connected) clientSocket1.close();
    if (clientSocket2?.connected) clientSocket2.close();
  });

  describe('join-session', () => {
    it('should allow user to join existing session', (done) => {
      const session = sessionService.createSession('javascript');

      clientSocket1 = Client(`http://localhost:${serverPort}`);

      clientSocket1.on('session-joined', (data) => {
        expect(data.userId).toBeTruthy();
        expect(data.username).toBe('Alice');
        expect(data.users).toHaveLength(1);
        done();
      });

      clientSocket1.emit('join-session', {
        sessionId: session.id,
        username: 'Alice',
      });
    });

    it('should emit error when joining non-existent session', (done) => {
      clientSocket1 = Client(`http://localhost:${serverPort}`);

      clientSocket1.on('error', (data) => {
        expect(data.message).toBe('Session not found');
        done();
      });

      clientSocket1.emit('join-session', {
        sessionId: 'non-existent-id',
        username: 'Alice',
      });
    });

    it('should handle duplicate usernames', (done) => {
      const session = sessionService.createSession('javascript');

      clientSocket1 = Client(`http://localhost:${serverPort}`);
      clientSocket2 = Client(`http://localhost:${serverPort}`);

      let joinedCount = 0;

      clientSocket1.on('session-joined', (data) => {
        expect(data.username).toBe('Alice');
        joinedCount++;

        if (joinedCount === 1) {
          // First user joined, now join with second socket
          clientSocket2.emit('join-session', {
            sessionId: session.id,
            username: 'Alice',
          });
        }
      });

      clientSocket2.on('session-joined', (data) => {
        expect(data.username).toBe('Alice-2');
        joinedCount++;

        if (joinedCount === 2) {
          done();
        }
      });

      clientSocket1.emit('join-session', {
        sessionId: session.id,
        username: 'Alice',
      });
    });

    it('should notify existing users when new user joins', (done) => {
      const session = sessionService.createSession('javascript');

      clientSocket1 = Client(`http://localhost:${serverPort}`);
      clientSocket2 = Client(`http://localhost:${serverPort}`);

      clientSocket1.on('session-joined', () => {
        // First user joined, now join with second socket
        clientSocket2.emit('join-session', {
          sessionId: session.id,
          username: 'Bob',
        });
      });

      clientSocket1.on('user-joined', (data) => {
        expect(data.user.username).toBe('Bob');
        expect(data.users).toHaveLength(2);
        done();
      });

      clientSocket1.emit('join-session', {
        sessionId: session.id,
        username: 'Alice',
      });
    });
  });

  describe('leave-session', () => {
    it('should remove user from session on leave-session event', (done) => {
      const session = sessionService.createSession('javascript');

      clientSocket1 = Client(`http://localhost:${serverPort}`);
      clientSocket2 = Client(`http://localhost:${serverPort}`);

      clientSocket1.on('session-joined', () => {
        clientSocket2.emit('join-session', {
          sessionId: session.id,
          username: 'Bob',
        });
      });

      clientSocket2.on('session-joined', () => {
        // Both users joined, now have first user leave
        clientSocket1.emit('leave-session');
      });

      clientSocket2.on('user-left', (data) => {
        expect(data.username).toBe('Alice');
        expect(data.users).toHaveLength(1);
        done();
      });

      clientSocket1.emit('join-session', {
        sessionId: session.id,
        username: 'Alice',
      });
    });

    it('should remove user from session on disconnect', (done) => {
      const session = sessionService.createSession('javascript');

      clientSocket1 = Client(`http://localhost:${serverPort}`);
      clientSocket2 = Client(`http://localhost:${serverPort}`);

      clientSocket1.on('session-joined', () => {
        clientSocket2.emit('join-session', {
          sessionId: session.id,
          username: 'Bob',
        });
      });

      clientSocket2.on('session-joined', () => {
        // Both users joined, now disconnect first user
        clientSocket1.disconnect();
      });

      clientSocket2.on('user-left', (data) => {
        expect(data.username).toBe('Alice');
        done();
      });

      clientSocket1.emit('join-session', {
        sessionId: session.id,
        username: 'Alice',
      });
    });
  });

  describe('code-change', () => {
    it('should broadcast code changes to other users', (done) => {
      const session = sessionService.createSession('javascript');

      clientSocket1 = Client(`http://localhost:${serverPort}`);
      clientSocket2 = Client(`http://localhost:${serverPort}`);

      clientSocket1.on('session-joined', () => {
        clientSocket2.emit('join-session', {
          sessionId: session.id,
          username: 'Bob',
        });
      });

      clientSocket2.on('session-joined', () => {
        // Both users joined, now emit code change from client 1
        clientSocket1.emit('code-change', {
          code: 'console.log("Hello World");',
        });
      });

      clientSocket2.on('code-update', (data) => {
        expect(data.code).toBe('console.log("Hello World");');
        expect(data.userId).toBe(clientSocket1.id);
        done();
      });

      clientSocket1.emit('join-session', {
        sessionId: session.id,
        username: 'Alice',
      });
    });

    it('should emit error when not in a session', (done) => {
      clientSocket1 = Client(`http://localhost:${serverPort}`);

      clientSocket1.on('connect', () => {
        clientSocket1.emit('code-change', {
          code: 'console.log("test");',
        });
      });

      clientSocket1.on('error', (data) => {
        expect(data.message).toBe('Not in a session');
        done();
      });
    });
  });

  describe('language-change', () => {
    it('should broadcast language changes to all users', (done) => {
      const session = sessionService.createSession('javascript');

      clientSocket1 = Client(`http://localhost:${serverPort}`);
      clientSocket2 = Client(`http://localhost:${serverPort}`);

      let updateCount = 0;

      clientSocket1.on('session-joined', () => {
        clientSocket2.emit('join-session', {
          sessionId: session.id,
          username: 'Bob',
        });
      });

      clientSocket2.on('session-joined', () => {
        // Both users joined, now emit language change from client 1
        clientSocket1.emit('language-change', {
          language: 'python',
        });
      });

      const checkDone = () => {
        updateCount++;
        if (updateCount === 2) {
          done();
        }
      };

      clientSocket1.on('language-update', (data) => {
        expect(data.language).toBe('python');
        checkDone();
      });

      clientSocket2.on('language-update', (data) => {
        expect(data.language).toBe('python');
        checkDone();
      });

      clientSocket1.emit('join-session', {
        sessionId: session.id,
        username: 'Alice',
      });
    });
  });

  describe('cursor-move', () => {
    it('should broadcast cursor position to other users', (done) => {
      const session = sessionService.createSession('javascript');

      clientSocket1 = Client(`http://localhost:${serverPort}`);
      clientSocket2 = Client(`http://localhost:${serverPort}`);

      clientSocket1.on('session-joined', () => {
        clientSocket2.emit('join-session', {
          sessionId: session.id,
          username: 'Bob',
        });
      });

      clientSocket2.on('session-joined', () => {
        // Both users joined, now emit cursor move from client 1
        clientSocket1.emit('cursor-move', {
          position: { line: 5, column: 10 },
        });
      });

      clientSocket2.on('cursor-update', (data) => {
        expect(data.userId).toBe(clientSocket1.id);
        expect(data.position).toEqual({ line: 5, column: 10 });
        done();
      });

      clientSocket1.emit('join-session', {
        sessionId: session.id,
        username: 'Alice',
      });
    });
  });
});
