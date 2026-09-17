import { Router } from 'express';
import { registerWorker, getWorkers } from '../controllers/worker.controller.js';

const router = Router();

// GET /api/v1/workers
router.get('/', getWorkers);

// POST /api/v1/workers/register
router.post('/register', registerWorker);

export default router;

