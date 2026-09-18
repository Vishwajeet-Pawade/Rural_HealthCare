import { Router } from 'express';
import {
  getConsultations,
  getConsultationById,
  createConsultation,
} from '../controllers/consultation.controller.js';

const router = Router();

// GET /api/v1/consultations
router.get('/', getConsultations);

// POST /api/v1/consultations
router.post('/', createConsultation);

// GET /api/v1/consultations/:id
router.get('/:id', getConsultationById);

export default router;

