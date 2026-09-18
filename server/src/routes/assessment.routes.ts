import { Router } from 'express';

import { generateAssessment } from '../controllers/assessment.controller.js';

const router = Router();

router.post('/generate', generateAssessment);

export default router;