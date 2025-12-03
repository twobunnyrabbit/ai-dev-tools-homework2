import { Session, Language, User, SessionMetadata } from '../types/session.types.js';
import { generateSessionId } from '../utils/id-generator.js';

// In-memory storage
const sessions = new Map<string, Session>();

/**
 * Create a new session with the specified language
 */
export function createSession(language: Language): Session {
  const sessionId = generateSessionId();
  const now = new Date();

  const session: Session = {
    id: sessionId,
    language,
    code: '',
    users: new Map<string, User>(),
    createdAt: now,
    lastActivity: now,
  };

  sessions.set(sessionId, session);
  return session;
}

/**
 * Get a session by ID
 */
export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

/**
 * Get session metadata
 */
export function getSessionMetadata(sessionId: string): SessionMetadata {
  const session = sessions.get(sessionId);

  if (!session) {
    return {
      sessionId,
      language: 'javascript',
      userCount: 0,
      exists: false,
    };
  }

  return {
    sessionId: session.id,
    language: session.language,
    userCount: session.users.size,
    exists: true,
  };
}

/**
 * Update session code
 */
export function updateSessionCode(sessionId: string, code: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }

  session.code = code;
  session.lastActivity = new Date();
  return true;
}

/**
 * Update session language
 */
export function updateSessionLanguage(sessionId: string, language: Language): boolean {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }

  session.language = language;
  session.lastActivity = new Date();
  return true;
}

/**
 * Add a user to a session
 */
export function addUserToSession(sessionId: string, user: User): boolean {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }

  session.users.set(user.id, user);
  session.lastActivity = new Date();
  return true;
}

/**
 * Remove a user from a session
 */
export function removeUserFromSession(sessionId: string, userId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) {
    return false;
  }

  const removed = session.users.delete(userId);
  if (removed) {
    session.lastActivity = new Date();
  }
  return removed;
}

/**
 * Get all users in a session
 */
export function getSessionUsers(sessionId: string): User[] {
  const session = sessions.get(sessionId);
  if (!session) {
    return [];
  }

  return Array.from(session.users.values());
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

/**
 * Get all sessions (for cleanup purposes)
 */
export function getAllSessions(): Session[] {
  return Array.from(sessions.values());
}

/**
 * Update last activity timestamp
 */
export function touchSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.lastActivity = new Date();
  }
}
