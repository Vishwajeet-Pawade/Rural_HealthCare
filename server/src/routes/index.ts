import { Router } from 'express';
import authRoutes from './auth.routes.js';
import abdmMockRoutes from './abdm.mock.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/abdm/mock', abdmMockRoutes);

export default router;


