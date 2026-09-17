import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { ReferralStatus, ReferralPriority, RiskLevel } from '@prisma/client';

const createReferralSchema = z.object({
  patientId: z.string().min(1, 'Patient identifier is required'),
  fromWorker: z.string().default('Meena Kumari (ASHA)'),
  fromWorkerId: z.string().optional(),
  toPHC: z.string().min(2, 'Destination facility/PHC is required'),
  toFacilityId: z.string().optional(),
  toDoctorId: z.string().optional(),
  reason: z.string().min(5, 'Clinical referral reason is required'),
  riskLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'low', 'moderate', 'high', 'critical']).default('MODERATE'),
  priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY', 'routine', 'urgent', 'emergency']).default('ROUTINE'),
  notes: z.string().optional(),
  aiSummary: z.string().optional(),
});

/**
 * List referrals with optional filtering by status, priority, patient.
 * GET /api/v1/referrals
 */
export async function getReferrals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
    const priority = typeof req.query.priority === 'string' ? req.query.priority.toUpperCase() : undefined;
    const patientId = typeof req.query.patientId === 'string' ? req.query.patientId : undefined;

    const where: any = {};
    if (status && Object.values(ReferralStatus).includes(status as any)) {
      where.status = status as ReferralStatus;
    }
    if (priority && Object.values(ReferralPriority).includes(priority as any)) {
      where.priority = priority as ReferralPriority;
    }
    if (patientId) {
      where.OR = [
        { patientId },
        { patient: { healthId: patientId } },
      ];
    }

    const referrals = await prisma.referral.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            healthId: true,
            name: true,
            nameHi: true,
            gender: true,
            age: true,
            bloodGroup: true,
            village: true,
            phone: true,
          },
        },
        toFacility: true,
        toDoctor: true,
      },
    });

    res.status(200).json({
      success: true,
      data: { referrals },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get referral by ID or Code.
 * GET /api/v1/referrals/:id
 */
export async function getReferralById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const referral = await prisma.referral.findFirst({
      where: {
        OR: [
          { id },
          { referralCode: id },
        ],
      },
      include: {
        patient: true,
        toFacility: true,
        toDoctor: true,
      },
    });

    if (!referral) {
      throw new AppError(`Referral '${id}' not found`, 404);
    }

    res.status(200).json({
      success: true,
      data: { referral },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new clinical referral order.
 * POST /api/v1/referrals
 */
export async function createReferral(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createReferralSchema.parse(req.body);

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { id: input.patientId },
          { healthId: input.patientId },
        ],
      },
    });

    if (!patient) {
      throw new AppError(`Patient '${input.patientId}' not found for referral`, 404);
    }

    const referralCode = `REF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const referral = await prisma.referral.create({
      data: {
        referralCode,
        patientId: patient.id,
        patientName: patient.name,
        fromWorker: input.fromWorker,
        fromWorkerId: input.fromWorkerId,
        toPHC: input.toPHC,
        toFacilityId: input.toFacilityId,
        toDoctorId: input.toDoctorId,
        reason: input.reason,
        riskLevel: input.riskLevel.toUpperCase() as RiskLevel,
        priority: input.priority.toUpperCase() as ReferralPriority,
        status: ReferralStatus.PENDING,
        date: dateStr,
        notes: input.notes,
        aiSummary: input.aiSummary,
      },
      include: {
        patient: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Referral order created and dispatched to receiving facility.',
      data: { referral },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update referral status (e.g. ACCEPTED, IN_CONSULTATION, COMPLETED).
 * PATCH /api/v1/referrals/:id/status
 */
export async function updateReferralStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const { status, notes } = z.object({
      status: z.enum([
        'PENDING', 'ACCEPTED', 'IN_CONSULTATION', 'REFERRED', 'COMPLETED', 'FOLLOW_UP',
        'pending', 'accepted', 'in-consultation', 'referred', 'completed', 'follow-up'
      ]),
      notes: z.string().optional(),
    }).parse(req.body);

    const mappedStatus = status.replace('-', '_').toUpperCase() as ReferralStatus;

    // Find by id or referralCode
    const existing = await prisma.referral.findFirst({
      where: {
        OR: [{ id }, { referralCode: id }],
      },
    });

    if (!existing) {
      throw new AppError(`Referral '${id}' not found`, 404);
    }

    const referral = await prisma.referral.update({
      where: { id: existing.id },
      data: {
        status: mappedStatus,
        notes: notes || existing.notes,
      },
      include: {
        patient: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Referral status updated to ${mappedStatus}`,
      data: { referral },
    });
  } catch (err) {
    next(err);
  }
}

