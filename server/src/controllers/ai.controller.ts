import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

/**
 * List AI Risk Assessments.
 * GET /api/v1/ai-assessments
 */
export async function getAiAssessments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientId = typeof req.query.patientId === 'string' ? req.query.patientId : undefined;
    const consultationId = typeof req.query.consultationId === 'string' ? req.query.consultationId : undefined;

    const where: any = {};
    if (patientId) {
      where.OR = [
        { patientId },
        { patient: { healthId: patientId } },
      ];
    }
    if (consultationId) {
      where.consultationId = consultationId;
    }

    const assessments = await prisma.aIAssessment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            healthId: true,
            name: true,
            age: true,
            gender: true,
            riskLevel: true,
          },
        },
        consultation: true,
      },
    });

    res.status(200).json({
      success: true,
      data: { assessments },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get AI Assessment by ID or code.
 * GET /api/v1/ai-assessments/:id
 */
export async function getAiAssessmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const assessment = await prisma.aIAssessment.findFirst({
      where: {
        OR: [{ id }, { assessmentCode: id }],
      },
      include: {
        patient: true,
        consultation: true,
      },
    });

    if (!assessment) {
      throw new AppError(`AI assessment '${id}' not found`, 404);
    }

    res.status(200).json({
      success: true,
      data: { assessment },
    });
  } catch (err) {
    next(err);
  }
}

