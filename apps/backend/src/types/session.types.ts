export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'cpp';

export interface User {
  id: string;
  username: string;
  socketId: string;
}

export interface Session {
  id: string;
  language: Language;
  code: string;
  users: Map<string, User>;
  createdAt: Date;
  lastActivity: Date;
}

export interface SessionMetadata {
  sessionId: string;
  language: Language;
  userCount: number;
  exists: boolean;
}
