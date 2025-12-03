export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'cpp';

export interface Session {
  sessionId: string;
  language: Language;
  userCount: number;
  exists: boolean;
}

export interface CreateSessionRequest {
  language: Language;
}

export interface CreateSessionResponse {
  sessionId: string;
  expiresIn: number;
}

export interface SessionCodeResponse {
  code: string;
  language: Language;
}

export interface User {
  id: string;
  username: string;
}
