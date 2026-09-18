import { Router } from 'express';
import { getAiAssessments, getAiAssessmentById } from '../controllers/ai.controller.js';

const router = Router();

// GET /api/v1/ai-assessments
router.get('/', getAiAssessments);

// GET /api/v1/ai-assessments/:id
router.get('/:id', getAiAssessmentById);

export default router;

