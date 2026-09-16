import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  loginPin,
  getCurrentUser,
  logout,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login-pin', loginPin);
router.get('/me', requireAuth, getCurrentUser);
router.post('/logout', logout);

export default router;

