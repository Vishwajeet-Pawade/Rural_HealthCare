import { Router } from 'express';
import { registerPatient, getPatientById, getPatients } from '../controllers/patient.controller.js';

const router = Router();

// GET /api/v1/patients
router.get('/', getPatients);

// POST /api/v1/patients/register
router.post('/register', registerPatient);

// GET /api/v1/patients/:id
router.get('/:id', getPatientById);

export default router;

