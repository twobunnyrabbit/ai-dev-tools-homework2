import { describe, it, expect, beforeEach } from 'vitest';
import * as sessionService from '../src/services/session.service.js';
import type { Language, User } from '../src/types/session.types.js';

describe('Session Service', () => {
  // Clear sessions before each test
  beforeEach(() => {
    const sessions = sessionService.getAllSessions();
    sessions.forEach(session => sessionService.deleteSession(session.id));
  });

  describe('createSession', () => {
    it('should create a session with provided language', () => {
      const session = sessionService.createSession('typescript');

      expect(session).toBeDefined();
      expect(session.id).toBeTruthy();
      expect(session.language).toBe('typescript');
      expect(session.code).toBe('');
      expect(session.users.size).toBe(0);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.lastActivity).toBeInstanceOf(Date);
    });

    it('should create sessions with unique IDs', () => {
      const session1 = sessionService.createSession('javascript');
      const session2 = sessionService.createSession('python');

      expect(session1.id).not.toBe(session2.id);
    });

    it('should create sessions for all supported languages', () => {
      const languages: Language[] = ['javascript', 'typescript', 'python', 'java', 'go', 'cpp'];

      languages.forEach(language => {
        const session = sessionService.createSession(language);
        expect(session.language).toBe(language);
      });
    });
  });

  describe('getSession', () => {
    it('should return a session by ID', () => {
      const created = sessionService.createSession('javascript');
      const retrieved = sessionService.getSession(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent session', () => {
      const session = sessionService.getSession('non-existent-id');
      expect(session).toBeUndefined();
    });
  });

  describe('getSessionMetadata', () => {
    it('should return metadata for existing session', () => {
      const session = sessionService.createSession('python');
      const user: User = { id: 'user-1', username: 'Alice', socketId: 'socket-1' };
      sessionService.addUserToSession(session.id, user);

      const metadata = sessionService.getSessionMetadata(session.id);

      expect(metadata.sessionId).toBe(session.id);
      expect(metadata.language).toBe('python');
      expect(metadata.userCount).toBe(1);
      expect(metadata.exists).toBe(true);
    });

    it('should return non-existent metadata for missing session', () => {
      const metadata = sessionService.getSessionMetadata('missing-id');

      expect(metadata.sessionId).toBe('missing-id');
      expect(metadata.language).toBe('javascript');
      expect(metadata.userCount).toBe(0);
      expect(metadata.exists).toBe(false);
    });
  });

  describe('updateSessionCode', () => {
    it('should update code for existing session', () => {
      const session = sessionService.createSession('javascript');
      const code = 'console.log("Hello World");';

      const result = sessionService.updateSessionCode(session.id, code);

      expect(result).toBe(true);
      const updated = sessionService.getSession(session.id);
      expect(updated?.code).toBe(code);
    });

    it('should update lastActivity timestamp', () => {
      const session = sessionService.createSession('javascript');
      const originalActivity = session.lastActivity;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        sessionService.updateSessionCode(session.id, 'new code');
        const updated = sessionService.getSession(session.id);
        expect(updated?.lastActivity.getTime()).toBeGreaterThan(originalActivity.getTime());
      }, 10);
    });

    it('should return false for non-existent session', () => {
      const result = sessionService.updateSessionCode('non-existent', 'code');
      expect(result).toBe(false);
    });
  });

  describe('updateSessionLanguage', () => {
    it('should update language for existing session', () => {
      const session = sessionService.createSession('javascript');

      const result = sessionService.updateSessionLanguage(session.id, 'typescript');

      expect(result).toBe(true);
      const updated = sessionService.getSession(session.id);
      expect(updated?.language).toBe('typescript');
    });

    it('should return false for non-existent session', () => {
      const result = sessionService.updateSessionLanguage('non-existent', 'python');
      expect(result).toBe(false);
    });
  });

  describe('addUserToSession', () => {
    it('should add user to existing session', () => {
      const session = sessionService.createSession('javascript');
      const user: User = { id: 'user-1', username: 'Alice', socketId: 'socket-1' };

      const result = sessionService.addUserToSession(session.id, user);

      expect(result).toBe(true);
      const updated = sessionService.getSession(session.id);
      expect(updated?.users.size).toBe(1);
      expect(updated?.users.get(user.id)).toEqual(user);
    });

    it('should add multiple users to session', () => {
      const session = sessionService.createSession('javascript');
      const user1: User = { id: 'user-1', username: 'Alice', socketId: 'socket-1' };
      const user2: User = { id: 'user-2', username: 'Bob', socketId: 'socket-2' };

      sessionService.addUserToSession(session.id, user1);
      sessionService.addUserToSession(session.id, user2);

      const updated = sessionService.getSession(session.id);
      expect(updated?.users.size).toBe(2);
    });

    it('should return false for non-existent session', () => {
      const user: User = { id: 'user-1', username: 'Alice', socketId: 'socket-1' };
      const result = sessionService.addUserToSession('non-existent', user);
      expect(result).toBe(false);
    });
  });

  describe('removeUserFromSession', () => {
    it('should remove user from session', () => {
      const session = sessionService.createSession('javascript');
      const user: User = { id: 'user-1', username: 'Alice', socketId: 'socket-1' };
      sessionService.addUserToSession(session.id, user);

      const result = sessionService.removeUserFromSession(session.id, user.id);

      expect(result).toBe(true);
      const updated = sessionService.getSession(session.id);
      expect(updated?.users.size).toBe(0);
    });

    it('should return false when removing non-existent user', () => {
      const session = sessionService.createSession('javascript');
      const result = sessionService.removeUserFromSession(session.id, 'non-existent-user');
      expect(result).toBe(false);
    });

    it('should return false for non-existent session', () => {
      const result = sessionService.removeUserFromSession('non-existent', 'user-1');
      expect(result).toBe(false);
    });
  });

  describe('getSessionUsers', () => {
    it('should return all users in a session', () => {
      const session = sessionService.createSession('javascript');
      const user1: User = { id: 'user-1', username: 'Alice', socketId: 'socket-1' };
      const user2: User = { id: 'user-2', username: 'Bob', socketId: 'socket-2' };

      sessionService.addUserToSession(session.id, user1);
      sessionService.addUserToSession(session.id, user2);

      const users = sessionService.getSessionUsers(session.id);

      expect(users).toHaveLength(2);
      expect(users).toContainEqual(user1);
      expect(users).toContainEqual(user2);
    });

    it('should return empty array for non-existent session', () => {
      const users = sessionService.getSessionUsers('non-existent');
      expect(users).toEqual([]);
    });
  });

  describe('deleteSession', () => {
    it('should delete existing session', () => {
      const session = sessionService.createSession('javascript');

      const result = sessionService.deleteSession(session.id);

      expect(result).toBe(true);
      expect(sessionService.getSession(session.id)).toBeUndefined();
    });

    it('should return false for non-existent session', () => {
      const result = sessionService.deleteSession('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getAllSessions', () => {
    it('should return all sessions', () => {
      sessionService.createSession('javascript');
      sessionService.createSession('python');
      sessionService.createSession('typescript');

      const sessions = sessionService.getAllSessions();
      expect(sessions).toHaveLength(3);
    });

    it('should return empty array when no sessions exist', () => {
      const sessions = sessionService.getAllSessions();
      expect(sessions).toEqual([]);
    });
  });

  describe('touchSession', () => {
    it('should update lastActivity timestamp', () => {
      const session = sessionService.createSession('javascript');
      const originalActivity = session.lastActivity;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        sessionService.touchSession(session.id);
        const updated = sessionService.getSession(session.id);
        expect(updated?.lastActivity.getTime()).toBeGreaterThan(originalActivity.getTime());
      }, 10);
    });

    it('should not throw for non-existent session', () => {
      expect(() => sessionService.touchSession('non-existent')).not.toThrow();
    });
  });
});
