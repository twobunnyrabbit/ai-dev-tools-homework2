import { Request, Response } from 'express';
import * as sessionService from '../services/session.service.js';
import { Language } from '../types/session.types.js';

/**
 * POST /api/sessions
 * Create a new session
 */
export function createSession(req: Request, res: Response): void {
  const { language } = req.body;

  // Validate language
  const validLanguages: Language[] = ['javascript', 'typescript', 'python', 'java', 'go', 'cpp'];
  if (!language || !validLanguages.includes(language)) {
    res.status(400).json({ error: 'Invalid or missing language' });
    return;
  }

  const session = sessionService.createSession(language as Language);

  res.status(201).json({
    sessionId: session.id,
    expiresIn: 3600000, // 1 hour in milliseconds
  });
}

/**
 * GET /api/sessions/:id
 * Get session metadata
 */
export function getSessionMetadata(req: Request, res: Response): void {
  const { id } = req.params;

  const metadata = sessionService.getSessionMetadata(id);
  res.json(metadata);
}

/**
 * GET /api/sessions/:id/code
 * Get current code content
 */
export function getSessionCode(req: Request, res: Response): void {
  const { id } = req.params;

  const session = sessionService.getSession(id);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json({
    code: session.code,
    language: session.language,
  });
}
