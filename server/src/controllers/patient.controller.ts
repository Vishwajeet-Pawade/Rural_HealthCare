import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const registerPatientSchema = z.object({
  name: z.string().min(1),
  nameHi: z.string().optional(),
  dob: z.string().min(1),
  gender: z.string().min(1),
  bloodGroup: z.string().optional(),
  phone: z.string().min(1),
  village: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    relation: z.string(),
    phone: z.string(),
  }).optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
});

function generateHealthId(): string {
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RHC-${new Date().getFullYear()}-${randomChars}`;
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff); 
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export async function registerPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerPatientSchema.parse(req.body);
    const healthId = generateHealthId();
    const age = calculateAge(data.dob);

    const patient = await prisma.patient.create({
      data: {
        healthId,
        name: data.name,
        nameHi: data.nameHi || '',
        age,
        dob: data.dob,
        gender: data.gender,
        bloodGroup: data.bloodGroup || 'Unknown',
        phone: data.phone,
        village: data.village,
        district: data.district,
        state: data.state,
        address: data.address || '',
        emergencyContact: data.emergencyContact || {},
        allergies: data.allergies || [],
        chronicConditions: data.chronicConditions || [],
        currentMedications: data.currentMedications || [],
        registeredAt: new Date().toISOString(),
      },
    });

    res.status(201).json({
      success: true,
      data: {
        patient,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: { patients } });
  } catch(err) {
    next(err);
  }
}

export async function getPatientById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: { assessments: { orderBy: { createdAt: 'desc' } } }
    });
    if (!patient) { res.status(404).json({ success: false, message: 'Patient not found' }); return; }
    res.status(200).json({ success: true, data: { patient } });
  } catch(err) {
    next(err);
  }
}

export async function getPatientByPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patient = await prisma.patient.findFirst({
      where: { phone: req.params.phone },
      include: { assessments: { orderBy: { createdAt: 'desc' } } }
    });
    if (!patient) { res.status(404).json({ success: false, message: 'No record found for this phone number' }); return; }
    res.status(200).json({ success: true, data: { patient } });
  } catch(err) {
    next(err);
  }
}
