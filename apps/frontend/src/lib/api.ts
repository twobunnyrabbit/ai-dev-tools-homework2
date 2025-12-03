import type {
  CreateSessionRequest,
  CreateSessionResponse,
  Session,
  SessionCodeResponse,
} from '../types/session';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(
      errorText || response.statusText,
      response.status,
      response.statusText
    );
  }
  return response.json();
}

export async function createSession(
  request: CreateSessionRequest
): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return handleResponse<CreateSessionResponse>(response);
}

export async function getSession(sessionId: string): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
  return handleResponse<Session>(response);
}

export async function getSessionCode(
  sessionId: string
): Promise<SessionCodeResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${sessionId}/code`
  );
  return handleResponse<SessionCodeResponse>(response);
}
