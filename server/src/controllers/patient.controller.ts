import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { abhaService } from '../services/abdm/abha.service.js';
import { AppError } from '../middleware/error.js';
import { ConsentStatus, RiskLevel } from '@prisma/client';

// Helper to generate unique Patient Health ID (e.g. RHC-2026-8F4K92)
async function generateUniqueHealthId(): Promise<string> {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let healthId = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    attempts++;
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    healthId = `RHC-2026-${randomPart}`;
    const found = await prisma.patient.findUnique({ where: { healthId } });
    if (!found) exists = false;
  }

  return healthId;
}

// Calculate age from DOB string (supports YYYY-MM-DD or standard date strings)
function calculateAge(dobString: string, fallbackAge?: number): number {
  if (fallbackAge && fallbackAge > 0) return fallbackAge;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return 28;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

// Validation schema for Patient Registration
const registerPatientSchema = z.object({
  name: z.string().min(2, 'Full Name must be at least 2 characters'),
  nameHi: z.string().optional(),
  dob: z.string().min(4, 'Date of Birth is required'),
  age: z.number().int().positive().optional(),
  gender: z.enum(['M', 'F', 'O', 'Male', 'Female', 'Other']),
  bloodGroup: z.string().optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (must be 10 digits starting with 6-9)'),
  village: z.string().min(2, 'Village is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    relation: z.string().min(2, 'Emergency contact relation is required'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid emergency contact phone number'),
  }),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  abhaAddress: z.string().optional(),
  healthWorkerId: z.string().optional(),
  healthWorkerName: z.string().optional(),
  consent: z.object({
    granted: z.boolean().refine(val => val === true, {
      message: 'Explicit patient consent is required to register and create a health record',
    }),
    purpose: z.string().optional(),
    dataScope: z.array(z.string()).optional(),
  }),
});

/**
 * Register a new patient with ABDM ABHA verification / creation workflow.
 * POST /api/v1/patients/register
 */
export async function registerPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = registerPatientSchema.parse(req.body);

    // Normalize gender
    const normalizedGender = input.gender === 'Male' ? 'M' : input.gender === 'Female' ? 'F' : input.gender === 'Other' ? 'O' : input.gender;

    // Check duplicate patient by phone
    const existingPatientByPhone = await prisma.patient.findFirst({
      where: { phone: input.phone },
    });

    if (existingPatientByPhone) {
      throw new AppError(`A patient is already registered with mobile number +91 ${input.phone}. Health ID: ${existingPatientByPhone.healthId}`, 409);
    }

    let finalAbhaAddress: string | null = null;
    let finalAbhaNumber: string | null = null;
    let abhaSource: 'existing' | 'mock-created' = 'mock-created';
    let verifiedAbhaProfile: any = null;

    // ─── 1. ABHA Resolution Flow ───────────────────────────────────────────────
    if (input.abhaAddress && input.abhaAddress.trim()) {
      const cleanAbha = input.abhaAddress.trim().toLowerCase();

      // Check if this ABHA address is already linked to an existing patient
      const duplicateAbha = await prisma.patient.findFirst({
        where: {
          OR: [
            { abhaAddress: cleanAbha },
            { abhaNumber: cleanAbha },
          ],
        },
      });

      if (duplicateAbha) {
        throw new AppError('This ABHA is already linked to an existing patient account.', 409);
      }

      // Verify in ABDM mock registry
      const verification = await abhaService.verifyAbhaAddress(cleanAbha);
      if (!verification.exists) {
        throw new AppError(`ABHA address '${cleanAbha}' not found in ABDM registry. You can create a new mock ABHA instead.`, 404);
      }

      // Fetch verified demographic profile
      verifiedAbhaProfile = await abhaService.getProfileById(cleanAbha);
      finalAbhaAddress = verifiedAbhaProfile?.abhaAddress || cleanAbha;
      finalAbhaNumber = verifiedAbhaProfile?.abhaNumber || null;
      abhaSource = 'existing';
    } else {
      // Patient has no ABHA: Mint a brand new mock ABHA profile (format: mock-abha-xxxxxx@sbx)
      const newMockProfile = await abhaService.createMockProfile({
        fullName: input.name,
        fullNameHi: input.nameHi,
        gender: normalizedGender,
        dob: input.dob,
        mobile: `+91 ${input.phone}`,
        address: input.address || input.village,
        village: input.village,
        district: input.district,
        state: input.state,
        pincode: '412205',
      });

      finalAbhaAddress = newMockProfile.abhaAddress;
      finalAbhaNumber = newMockProfile.abhaNumber;
      abhaSource = 'mock-created';
      verifiedAbhaProfile = newMockProfile;
    }

    // ─── 2. Generate Unique Patient Health ID ──────────────────────────────────
    const healthId = await generateUniqueHealthId();
    const age = calculateAge(input.dob, input.age);
    const now = new Date();
    const registeredAtDateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timestampStr = now.toISOString();

    // ─── 3. Database Transaction: Patient + ABHA Link + Consent + Audit ─────────
    const result = await prisma.$transaction(async (tx) => {
      // Create Patient
      const patient = await tx.patient.create({
        data: {
          healthId,
          abhaAddress: finalAbhaAddress,
          abhaNumber: finalAbhaNumber,
          name: input.name,
          nameHi: input.nameHi || input.name,
          age,
          dob: input.dob,
          gender: normalizedGender,
          bloodGroup: input.bloodGroup || 'Not known',
          phone: input.phone,
          village: input.village,
          district: input.district,
          state: input.state,
          address: input.address || `${input.village}, ${input.district}, ${input.state}`,
          emergencyContact: input.emergencyContact,
          allergies: input.allergies || [],
          chronicConditions: input.chronicConditions || [],
          currentMedications: input.currentMedications || [],
          riskLevel: RiskLevel.LOW,
          healthWorkerId: input.healthWorkerId || null,
          healthWorkerName: input.healthWorkerName || 'Community Health Worker',
          registeredAt: registeredAtDateStr,
          consentStatus: ConsentStatus.GRANTED,
          vaccinationStatus: 'Fully vaccinated',
        },
      });

      // Link Mock ABHA Profile to newly created Patient
      if (verifiedAbhaProfile?.id) {
        await tx.mockABHAProfile.update({
          where: { id: verifiedAbhaProfile.id },
          data: {
            linkedPatientId: patient.id,
            linkedHealthId: patient.healthId,
          },
        });
      }

      // Generate electronic Consent Artifact
      const consentRandomSuffix = Math.floor(1000 + Math.random() * 9000);
      const consentCode = `CA-2026-${consentRandomSuffix}`;
      const consentPurpose = input.consent.purpose || 'General healthcare coordination and longitudinal health record';
      const consentScope = input.consent.dataScope || ['Consultations', 'Vitals', 'Prescriptions', 'DiagnosticReports'];

      await tx.consentArtifact.create({
        data: {
          consentCode,
          patientId: patient.id,
          grantedTo: input.healthWorkerName || 'RuralCare Clinical Network',
          role: 'Community Health Worker',
          organization: 'RuralCare Primary Health Network',
          status: ConsentStatus.GRANTED,
          purpose: consentPurpose,
          dataScope: consentScope,
          grantedAt: timestampStr,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year default
          hiuId: 'HIU-RURALCARE-01',
          hipId: 'HIP-HFR-MH-00103',
          consentManagerId: 'mock-abdm-cm@sbx',
          signature: `MOCK_SHA256_SIG_${Buffer.from(consentCode + timestampStr).toString('hex').slice(0, 32)}`,
          isMock: true,
        },
      });

      // Record Audit Log Entry
      const auditCode = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      await tx.auditLog.create({
        data: {
          auditCode,
          patientId: patient.id,
          accessorName: input.healthWorkerName || 'System Registration Agent',
          accessorRole: 'HEALTH_WORKER',
          organization: 'RuralCare Primary Health Network',
          action: 'PATIENT_REGISTERED_CONSENT_GRANTED',
          dataAccessed: consentScope,
          timestamp: timestampStr,
          purpose: consentPurpose,
        },
      });

      return patient;
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully with ABDM identity linkage',
      data: {
        patient: {
          id: result.id,
          healthId: result.healthId,
          name: result.name,
          nameHi: result.nameHi,
          dob: result.dob,
          age: result.age,
          gender: result.gender,
          phone: result.phone,
          village: result.village,
          district: result.district,
          state: result.state,
          abhaAddress: result.abhaAddress,
          abhaNumber: result.abhaNumber,
          abhaSource,
          registeredAt: result.registeredAt,
          consentStatus: result.consentStatus,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get patient by ID or Health ID.
 * GET /api/v1/patients/:id
 */
export async function getPatientById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { id },
          { healthId: id },
          { abhaAddress: id },
        ],
      },
      include: {
        consentEntries: { take: 5, orderBy: { createdAt: 'desc' } },
        consultations: { take: 5, orderBy: { createdAt: 'desc' } },
        referrals: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!patient) {
      throw new AppError(`Patient '${id}' not found`, 404);
    }

    res.status(200).json({
      success: true,
      data: { patient },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * List all patients with optional search and risk level filter.
 * GET /api/v1/patients
 */
export async function getPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const risk = typeof req.query.risk === 'string' ? req.query.risk.toUpperCase() : '';

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { healthId: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { village: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (risk && ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].includes(risk)) {
      where.riskLevel = risk as RiskLevel;
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        healthWorker: true,
      },
    });

    res.status(200).json({
      success: true,
      data: { patients },
    });
  } catch (err) {
    next(err);
  }
}

