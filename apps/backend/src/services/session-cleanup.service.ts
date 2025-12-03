import * as sessionService from './session.service.js';

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
const EMPTY_SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export class SessionCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;

  start(): void {
    console.log('Starting session cleanup service...');
    this.cleanupInterval = setInterval(() => {
      this.cleanupSessions();
    }, CLEANUP_INTERVAL_MS);
  }

  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Session cleanup service stopped');
    }
  }

  private cleanupSessions(): void {
    const now = Date.now();
    const sessions = sessionService.getAllSessions();
    let cleanedCount = 0;

    for (const session of sessions) {
      const age = now - session.createdAt.getTime();
      const isEmpty = session.users.size === 0;
      const isExpired = age > SESSION_TTL_MS;
      const isEmptyAndOld = isEmpty && age > EMPTY_SESSION_TTL_MS;

      if (isExpired || isEmptyAndOld) {
        sessionService.deleteSession(session.id);
        cleanedCount++;
        console.log(
          `Cleaned up session ${session.id} (${
            isExpired ? 'expired' : 'empty'
          })`
        );
      }
    }

    if (cleanedCount > 0) {
      console.log(`Session cleanup: removed ${cleanedCount} session(s)`);
    }
  }
}

export const sessionCleanupService = new SessionCleanupService();
