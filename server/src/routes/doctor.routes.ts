import { Router } from 'express';
import { registerDoctor, getDoctors, updateDutyStatus } from '../controllers/doctor.controller.js';

const router = Router();

// GET /api/v1/doctors
router.get('/', getDoctors);

// POST /api/v1/doctors/register
router.post('/register', registerDoctor);

// PATCH /api/v1/doctors/:id/duty-status
router.patch('/:id/duty-status', updateDutyStatus);

export default router;

