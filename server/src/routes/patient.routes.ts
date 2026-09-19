import { Router } from 'express';

import {
  registerPatient,
  getPatients,
  getPatientById,
  getPatientByPhone,
  updatePatient,
  getPatientAuditLogs,
  getPatientAccessRequests,
} from '../controllers/patient.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerPatient);

router.get('/', getPatients);

router.get('/by-phone/:phone', getPatientByPhone);

router.get('/:id', optionalAuth, getPatientById);

router.patch('/:id', requireAuth, updatePatient);

router.get('/:id/audit-logs', requireAuth, getPatientAuditLogs);

router.get('/:id/access-requests', requireAuth, getPatientAccessRequests);

export default router;
