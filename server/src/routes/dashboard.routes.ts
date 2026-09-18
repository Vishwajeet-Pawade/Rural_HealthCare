import { Router } from 'express';
import {
  getAdminDashboard,
  getWorkerDashboard,
  getDoctorDashboard,
  getPatientDashboard,
} from '../controllers/dashboard.controller.js';

const router = Router();

// GET /api/v1/dashboards/admin
router.get('/admin', getAdminDashboard);

// GET /api/v1/dashboards/worker
router.get('/worker', getWorkerDashboard);

// GET /api/v1/dashboards/doctor
router.get('/doctor', getDoctorDashboard);

// GET /api/v1/dashboards/patient/:healthId
router.get('/patient/:healthId', getPatientDashboard);

export default router;

