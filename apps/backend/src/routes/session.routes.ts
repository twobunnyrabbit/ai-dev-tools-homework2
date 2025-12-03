import { Router } from 'express';
import * as sessionController from '../controllers/session.controller.js';

const router = Router();

// POST /api/sessions - Create a new session
router.post('/', sessionController.createSession);

// GET /api/sessions/:id - Get session metadata
router.get('/:id', sessionController.getSessionMetadata);

// GET /api/sessions/:id/code - Get current code content
router.get('/:id/code', sessionController.getSessionCode);

export default router;
