import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { AuthenticatedRequest, AuthUserPayload, UserRole } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ruralcare_jwt_super_secret_key_change_in_production_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['WORKER', 'DOCTOR', 'PATIENT', 'ADMIN']),
  specialty: z.string().optional(),
  hprId: z.string().optional(),
  facility: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
  role: z.enum(['WORKER', 'DOCTOR', 'PATIENT', 'ADMIN']),
});

function generateToken(payload: AuthUserPayload): string {
  // @ts-expect-error jsonwebtoken type compatibility
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName, role, specialty, hprId, facility } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email is already registered.', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        fullName,
        ...(role === 'DOCTOR' ? {
          doctorProfile: {
            create: {
              name: fullName,
              specialty: specialty || 'General Medicine',
              hprId: hprId || `HPR-2026-${Math.floor(Math.random() * 90000) + 10000}`,
              facility: {
                create: {
                  name: facility || 'Rural Health Centre',
                  hfrId: `HFR-2026-${Math.floor(Math.random() * 90000) + 10000}`,
                  facilityType: 'PHC',
                  district: 'Default District',
                  state: 'Default State'
                }
              }
            }
          }
        } : {})
      },
      include: {
        doctorProfile: { include: { facility: true } },
        workerProfile: true,
        patientProfile: true,
      },
    });

    const payload: AuthUserPayload = {
      id: user.id,
      phone: user.phone || '',
      role: user.role as UserRole,
      fullName: user.fullName,
      workerId: user.workerProfile?.id,
      doctorId: user.doctorProfile?.id,
      patientId: user.patientProfile?.id,
      facilityId: user.doctorProfile?.facilityId,
    };

    const token = generateToken(payload);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          doctorProfile: user.doctorProfile,
          workerProfile: user.workerProfile,
          patientProfile: user.patientProfile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, role } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctorProfile: { include: { facility: true } },
        workerProfile: true,
        patientProfile: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (user.role !== role) {
      throw new AppError(`User exists but does not have the '${role}' role.`, 403);
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const payload: AuthUserPayload = {
      id: user.id,
      phone: user.phone || '',
      role: user.role as UserRole,
      fullName: user.fullName,
      workerId: user.workerProfile?.id,
      doctorId: user.doctorProfile?.id,
      patientId: user.patientProfile?.id,
      facilityId: user.doctorProfile?.facilityId,
    };

    const token = generateToken(payload);

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          doctorProfile: user.doctorProfile,
          workerProfile: user.workerProfile,
          patientProfile: user.patientProfile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctorProfile: { include: { facility: true } },
        workerProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User account not found.', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName,
          doctorProfile: user.doctorProfile,
          workerProfile: user.workerProfile,
          patientProfile: user.patientProfile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

