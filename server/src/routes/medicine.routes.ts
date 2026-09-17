import { Router } from 'express';
import { getMedicines, getMedicineById } from '../controllers/medicine.controller.js';

const router = Router();

// GET /api/v1/medicines
router.get('/', getMedicines);

// GET /api/v1/medicines/:id
router.get('/:id', getMedicineById);

export default router;

