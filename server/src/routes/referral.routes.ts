import { Router } from 'express';
import {
  getReferrals,
  getReferralById,
  createReferral,
  updateReferralStatus,
} from '../controllers/referral.controller.js';

const router = Router();

// GET /api/v1/referrals
router.get('/', getReferrals);

// POST /api/v1/referrals
router.post('/', createReferral);

// GET /api/v1/referrals/:id
router.get('/:id', getReferralById);

// PATCH /api/v1/referrals/:id/status
router.patch('/:id/status', updateReferralStatus);

export default router;

