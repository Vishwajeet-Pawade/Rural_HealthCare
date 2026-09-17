import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { Role } from '@prisma/client';
import { AuthUserPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ruralcare_jwt_super_secret_key_change_in_production_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(payload: AuthUserPayload): string {
  // @ts-expect-error jsonwebtoken type compatibility
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const registerWorkerSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (must be 10 digits starting with 6-9)'),
  pin: z.string().length(4, 'Security PIN must be exactly 4 digits'),
  workerType: z.enum(['ASHA', 'ANM', 'CHO', 'Health Worker']).default('ASHA'),
  village: z.string().min(2, 'Village is required'),
  subCentre: z.string().optional(),
  assignedPhc: z.string().optional(),
  district: z.string().min(2, 'District is required').default('Pune Rural'),
  state: z.string().min(2, 'State is required').default('Maharashtra'),
});

/**
 * Register a new Health Worker (ASHA / ANM / CHO).
 * POST /api/v1/workers/register
 */
export async function registerWorker(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = registerWorkerSchema.parse(req.body);

    // 1. Check duplicate phone
    const existingUser = await prisma.user.findUnique({
      where: { phone: input.phone },
    });
    if (existingUser) {
      throw new AppError(`A user account is already registered with mobile number +91 ${input.phone}.`, 409);
    }

    // 2. Check Mock Worker Directory for automatic verification matching
    const directoryMatch = await prisma.mockWorkerDirectory.findFirst({
      where: {
        OR: [
          { contactPhone: { contains: input.phone } },
          { name: { contains: input.fullName, mode: 'insensitive' } },
        ],
      },
    });

    let status = 'PENDING_VERIFICATION';
    let workerCode = `WRK-${Date.now().toString().slice(-6)}`;

    if (directoryMatch) {
      status = 'ACTIVE';
      workerCode = directoryMatch.workerCode;
    }

    // 3. Hash PIN
    const pinHash = await bcrypt.hash(input.pin, 10);

    // 4. Create User + Worker Profile inside Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: input.phone,
          role: Role.WORKER,
          fullName: input.fullName,
          pinHash,
          active: status === 'ACTIVE',
        },
      });

      const worker = await tx.worker.create({
        data: {
          userId: user.id,
          name: input.fullName,
          workerType: input.workerType,
          workerCode,
          village: input.village,
          subCentre: input.subCentre || directoryMatch?.subCentre || 'Sub Centre',
          assignedPhc: input.assignedPhc || directoryMatch?.parentPhcName || 'Primary Health Centre',
          district: input.district,
          state: input.state,
          status,
        },
      });

      return { user, worker };
    });

    // 5. Issue JWT token
    const token = generateToken({
      id: result.user.id,
      phone: result.user.phone,
      role: Role.WORKER,
      fullName: result.user.fullName,
      workerId: result.worker.id,
    });

    res.status(201).json({
      success: true,
      message: status === 'ACTIVE'
        ? 'ASHA/Health Worker registered and verified successfully.'
        : 'ASHA registration submitted. Account status is PENDING_VERIFICATION awaiting MOIC approval.',
      data: {
        token,
        status,
        user: {
          id: result.user.id,
          phone: result.user.phone,
          fullName: result.user.fullName,
          role: result.user.role,
        },
        worker: {
          id: result.worker.id,
          workerCode: result.worker.workerCode,
          name: result.worker.name,
          workerType: result.worker.workerType,
          village: result.worker.village,
          subCentre: result.worker.subCentre,
          assignedPhc: result.worker.assignedPhc,
          status: result.worker.status,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * List all registered health workers.
 * GET /api/v1/workers
 */
export async function getWorkers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const village = typeof req.query.village === 'string' ? req.query.village : undefined;
    const workerType = typeof req.query.workerType === 'string' ? req.query.workerType : undefined;

    const where: any = {};
    if (village) where.village = { contains: village, mode: 'insensitive' };
    if (workerType) where.workerType = workerType;

    const workers = await prisma.worker.findMany({
      where,
      include: {
        user: { select: { phone: true, active: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { workers },
    });
  } catch (err) {
    next(err);
  }
}
