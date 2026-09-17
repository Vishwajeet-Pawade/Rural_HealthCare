import { Router } from 'express';
import authRoutes from './auth.routes.js';
import patientRoutes from './patient.routes.js';
import assessmentRoutes from './assessment.routes.js';
import referralRoutes from './referral.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/referrals', referralRoutes);

export default router;

