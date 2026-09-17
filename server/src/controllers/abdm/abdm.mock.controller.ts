import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { hfrService } from '../../services/abdm/hfr.service.js';
import { hprService } from '../../services/abdm/hpr.service.js';
import { workerDirectoryService } from '../../services/abdm/worker.service.js';
import { abhaService } from '../../services/abdm/abha.service.js';
import { consentService } from '../../services/abdm/consent.service.js';
import { fhirService } from '../../services/abdm/fhir.service.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';

// Helper to reliably extract string from Express param
function getParam(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

// ─── Status & Metadata ────────────────────────────────────────────────────────

export async function getMockStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [facilities, professionals, workers, abhaProfiles, consents] = await Promise.all([
      prisma.mockHFRFacility.count(),
      prisma.mockHPRProfessional.count(),
      prisma.mockWorkerDirectory.count(),
      prisma.mockABHAProfile.count(),
      prisma.consentArtifact.count(),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        mode: process.env.ABDM_MODE || 'mock',
        isMock: true,
        registryNotice: 'RuralCare currently uses a local mock registry interface designed for future ABDM integration.',
        timestamp: new Date().toISOString(),
        counts: {
          mockFacilities: facilities,
          mockProfessionals: professionals,
          mockWorkers: workers,
          mockABHAProfiles: abhaProfiles,
          consentArtifacts: consents,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── HFR (Health Facility Registry) Handlers ─────────────────────────────────

export async function getFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const facilities = await hfrService.getAllFacilities({
      facilityType: req.query.type as string,
      district: req.query.district as string,
      state: req.query.state as string,
      hasEmergency: req.query.emergency ? req.query.emergency === 'true' : undefined,
      q: req.query.q as string,
    });

    res.status(200).json({
      status: 'success',
      isMock: true,
      count: facilities.length,
      data: facilities,
    });
  } catch (err) {
    next(err);
  }
}

export async function getFacilityById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const facility = await hfrService.getFacilityById(id);
    if (!facility) {
      throw new AppError(`Facility with ID or HFR-ID '${id}' not found`, 404);
    }

    res.status(200).json({
      status: 'success',
      isMock: true,
      data: facility,
    });
  } catch (err) {
    next(err);
  }
}

export async function searchFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const facilities = await hfrService.searchFacilities({
      q: req.query.q as string,
      facilityType: req.query.type as string,
      district: req.query.district as string,
    });

    res.status(200).json({
      status: 'success',
      isMock: true,
      count: facilities.length,
      data: facilities,
    });
  } catch (err) {
    next(err);
  }
}

// ─── HPR (Healthcare Professionals Registry) Handlers ─────────────────────────

export async function getProfessionals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const professionals = await hprService.getAllProfessionals({
      specialty: req.query.specialty as string,
      district: req.query.district as string,
      facilityHfrId: req.query.facilityId as string,
      q: req.query.q as string,
    });

    res.status(200).json({
      status: 'success',
      isMock: true,
      count: professionals.length,
      data: professionals,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfessionalById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const professional = await hprService.getProfessionalById(id);
    if (!professional) {
      throw new AppError(`Professional with ID or HPR-ID '${id}' not found`, 404);
    }

    res.status(200).json({
      status: 'success',
      isMock: true,
      data: professional,
    });
  } catch (err) {
    next(err);
  }
}

export async function searchProfessionals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const professionals = await hprService.searchProfessionals({
      q: req.query.q as string,
      specialty: req.query.specialty as string,
      facilityHfrId: req.query.facilityId as string,
    });

    res.status(200).json({
      status: 'success',
      isMock: true,
      count: professionals.length,
      data: professionals,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Worker Directory Handlers ───────────────────────────────────────────────

export async function getWorkers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const workers = await workerDirectoryService.getAllWorkers({
      workerType: req.query.type as string,
      village: req.query.village as string,
      district: req.query.district as string,
      q: req.query.q as string,
    });

    res.status(200).json({
      status: 'success',
      isMock: true,
      count: workers.length,
      data: workers,
    });
  } catch (err) {
    next(err);
  }
}

export async function getWorkerById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const worker = await workerDirectoryService.getWorkerById(id);
    if (!worker) {
      throw new AppError(`Worker with ID or code '${id}' not found`, 404);
    }

    res.status(200).json({
      status: 'success',
      isMock: true,
      data: worker,
    });
  } catch (err) {
    next(err);
  }
}

export async function searchWorkers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const workers = await workerDirectoryService.searchWorkers({
      q: req.query.q as string,
      village: req.query.village as string,
      workerType: req.query.type as string,
      district: req.query.district as string,
    });

    res.status(200).json({
      status: 'success',
      isMock: true,
      count: workers.length,
      data: workers,
    });
  } catch (err) {
    next(err);
  }
}

// ─── ABHA Identity Handlers ──────────────────────────────────────────────────

export async function getAbhaProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const profile = await abhaService.getProfileById(id);
    if (!profile) {
      throw new AppError(`ABHA profile '${id}' not found`, 404);
    }

    res.status(200).json({
      status: 'success',
      isMock: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

const verifyAbhaSchema = z.object({
  abhaAddress: z.string().min(3),
});

export async function verifyAbha(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { abhaAddress } = verifyAbhaSchema.parse(req.body);
    const result = await abhaService.verifyAbhaAddress(abhaAddress);

    res.status(200).json({
      status: 'success',
      isMock: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Consent Handlers ────────────────────────────────────────────────────────

const createConsentSchema = z.object({
  patientId: z.string().uuid('Invalid patient UUID'),
  grantedTo: z.string().min(2),
  role: z.string().min(2),
  organization: z.string().min(2),
  facilityId: z.string().uuid().optional(),
  purpose: z.string().min(3),
  dataScope: z.array(z.string()).min(1),
  expiresAt: z.string().optional(),
  hiuId: z.string().optional(),
  hipId: z.string().optional(),
});

export async function createConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = createConsentSchema.parse(req.body);
    const consent = await consentService.requestConsent(payload);

    res.status(201).json({
      status: 'success',
      isMock: true,
      message: 'Consent artifact generated and audit logged.',
      data: consent,
    });
  } catch (err) {
    next(err);
  }
}

export async function getConsentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const consent = await consentService.getConsentById(id);
    if (!consent) {
      throw new AppError(`Consent artifact '${id}' not found`, 404);
    }

    res.status(200).json({
      status: 'success',
      isMock: true,
      data: consent,
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const reason = req.body.reason as string | undefined;
    const consent = await consentService.revokeConsent(id, reason);

    res.status(200).json({
      status: 'success',
      isMock: true,
      message: 'Consent revoked successfully and audit logged.',
      data: consent,
    });
  } catch (err) {
    next(err);
  }
}

// ─── FHIR R4 Handlers ────────────────────────────────────────────────────────

export async function getFHIRPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const resource = await fhirService.generatePatientResource(id);
    res.setHeader('Content-Type', 'application/fhir+json');
    res.status(200).json(resource);
  } catch (err) {
    next(err);
  }
}

export async function getFHIREncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const resource = await fhirService.generateEncounterResource(id);
    res.setHeader('Content-Type', 'application/fhir+json');
    res.status(200).json(resource);
  } catch (err) {
    next(err);
  }
}

export async function getFHIRBundle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientId = getParam(req.params.patientId);
    const bundle = await fhirService.generatePatientBundle(patientId);
    res.setHeader('Content-Type', 'application/fhir+json');
    res.status(200).json(bundle);
  } catch (err) {
    next(err);
  }
}

export async function getFHIRServiceRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const resource = await fhirService.generateServiceRequestResource(id);
    res.setHeader('Content-Type', 'application/fhir+json');
    res.status(200).json(resource);
  } catch (err) {
    next(err);
  }
}

