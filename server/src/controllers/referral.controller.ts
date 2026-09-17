import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getReferrals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const referrals = await prisma.referral.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.status(200).json({
      success: true,
      data: { referrals }
    });
  } catch(err) {
    next(err);
  }
}

export async function createReferral(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { patientId, patientName, reason, priority, toFacilityId, notes, riskLevel } = req.body;
    
    // Make sure patient exists (mock if needed)
    let patient = await prisma.patient.findUnique({ where: { healthId: patientId }});
    if(!patient) {
       patient = await prisma.patient.findFirst();
       if(!patient) throw new Error("No patient found");
    }

    const referral = await prisma.referral.create({
      data: {
        referralCode: `REF-${Date.now()}`,
        patientId: patient.id,
        patientName,
        fromWorker: 'Worker',
        toPHC: 'PHC Demo',
        reason,
        priority: priority || 'ROUTINE',
        riskLevel: riskLevel || 'MODERATE',
        date: new Date().toISOString(),
        notes
      }
    });

    res.status(201).json({
      success: true,
      data: { referral }
    });
  } catch(err) {
    next(err);
  }
}
