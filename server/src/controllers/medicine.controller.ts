import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

/**
 * List dispensary medicines & stock levels.
 * GET /api/v1/medicines
 */
export async function getMedicines(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const lowStock = req.query.lowStock === 'true';

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { genericName: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (lowStock) {
      where.isLowStock = true;
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        facility: {
          select: {
            name: true,
            hfrId: true,
            facilityType: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { medicines },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get medicine details by ID or code.
 * GET /api/v1/medicines/:id
 */
export async function getMedicineById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const medicine = await prisma.medicine.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
      include: { facility: true },
    });

    if (!medicine) {
      throw new AppError(`Medicine '${id}' not found in dispensary catalog`, 404);
    }

    res.status(200).json({
      success: true,
      data: { medicine },
    });
  } catch (err) {
    next(err);
  }
}

