import { Router } from 'express';

import {
  registerPatient,
  getPatients,
  getPatientById,
  getPatientByPhone,
} from '../controllers/patient.controller.js';

const router = Router();

router.post('/register', registerPatient);

router.get('/', getPatients);

router.get('/by-phone/:phone', getPatientByPhone);

router.get('/:id', getPatientById);

export default router;