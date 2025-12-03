import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SessionCleanupService } from '../src/services/session-cleanup.service.js';
import * as sessionService from '../src/services/session.service.js';
import type { User } from '../src/types/session.types.js';

describe('SessionCleanupService', () => {
  let cleanupService: SessionCleanupService;

  beforeEach(() => {
    // Clear sessions before each test
    const sessions = sessionService.getAllSessions();
    sessions.forEach(session => sessionService.deleteSession(session.id));

    cleanupService = new SessionCleanupService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanupService.stop();
    vi.useRealTimers();
  });

  describe('start and stop', () => {
    it('should start cleanup service', () => {
      cleanupService.start();
      expect(cleanupService['cleanupInterval']).not.toBeNull();
    });

    it('should stop cleanup service', () => {
      cleanupService.start();
      cleanupService.stop();
      expect(cleanupService['cleanupInterval']).toBeNull();
    });
  });

  describe('cleanup logic', () => {
    it('should not cleanup recent sessions with users', () => {
      const session = sessionService.createSession('javascript');
      const user: User = { id: 'user-1', username: 'Alice', socketId: 'socket-1' };
      sessionService.addUserToSession(session.id, user);

      cleanupService.start();
      vi.advanceTimersByTime(10 * 60 * 1000); // 10 minutes

      const retrieved = sessionService.getSession(session.id);
      expect(retrieved).toBeDefined();
    });

    it('should cleanup empty sessions after 5 minutes', () => {
      const session = sessionService.createSession('javascript');

      // Mock session creation time to be 6 minutes ago
      const mockSession = sessionService.getSession(session.id);
      if (mockSession) {
        mockSession.createdAt = new Date(Date.now() - 6 * 60 * 1000);
      }

      cleanupService.start();
      vi.advanceTimersByTime(10 * 60 * 1000); // Trigger cleanup

      const retrieved = sessionService.getSession(session.id);
      expect(retrieved).toBeUndefined();
    });

    it('should cleanup expired sessions after 1 hour', () => {
      const session = sessionService.createSession('javascript');
      const user: User = { id: 'user-1', username: 'Alice', socketId: 'socket-1' };
      sessionService.addUserToSession(session.id, user);

      // Mock session creation time to be 61 minutes ago
      const mockSession = sessionService.getSession(session.id);
      if (mockSession) {
        mockSession.createdAt = new Date(Date.now() - 61 * 60 * 1000);
      }

      cleanupService.start();
      vi.advanceTimersByTime(10 * 60 * 1000); // Trigger cleanup

      const retrieved = sessionService.getSession(session.id);
      expect(retrieved).toBeUndefined();
    });

    it('should keep sessions with users under TTL', () => {
      const session = sessionService.createSession('javascript');
      const user: User = { id: 'user-1', username: 'Alice', socketId: 'socket-1' };
      sessionService.addUserToSession(session.id, user);

      // Mock session creation time to be 30 minutes ago (under 1 hour)
      const mockSession = sessionService.getSession(session.id);
      if (mockSession) {
        mockSession.createdAt = new Date(Date.now() - 30 * 60 * 1000);
      }

      cleanupService.start();
      vi.advanceTimersByTime(10 * 60 * 1000); // Trigger cleanup

      const retrieved = sessionService.getSession(session.id);
      expect(retrieved).toBeDefined();
    });

    it('should cleanup multiple expired sessions', () => {
      const session1 = sessionService.createSession('javascript');
      const session2 = sessionService.createSession('python');
      const session3 = sessionService.createSession('typescript');

      // Mock all sessions as old (61 minutes)
      [session1, session2, session3].forEach(session => {
        const mockSession = sessionService.getSession(session.id);
        if (mockSession) {
          mockSession.createdAt = new Date(Date.now() - 61 * 60 * 1000);
        }
      });

      cleanupService.start();
      vi.advanceTimersByTime(10 * 60 * 1000); // Trigger cleanup

      expect(sessionService.getAllSessions()).toHaveLength(0);
    });
  });
});
