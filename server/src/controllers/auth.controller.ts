import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { AuthenticatedRequest, AuthUserPayload, UserRole } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ruralcare_jwt_super_secret_key_change_in_production_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// In-memory OTP cache for development/demo (phone -> { otp, expiresAt, role })
const otpStore = new Map<string, { otp: string; expiresAt: number; role: UserRole }>();

const sendOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (must be 10 digits starting with 6-9)'),
  role: z.enum(['WORKER', 'DOCTOR', 'PATIENT', 'ADMIN']),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  role: z.enum(['WORKER', 'DOCTOR', 'PATIENT', 'ADMIN']),
});

const loginPinSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  pin: z.string().length(4, 'PIN must be 4 digits'),
  role: z.enum(['WORKER', 'DOCTOR', 'PATIENT', 'ADMIN']),
});

function generateToken(payload: AuthUserPayload): string {
  // @ts-expect-error jsonwebtoken type compatibility
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, role } = sendOtpSchema.parse(req.body);

    // Development default OTP: 123456
    const otp = process.env.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456';

    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(phone, { otp, expiresAt, role });

    console.log(`[AUTH] Generated OTP for +91 ${phone} (${role}): ${otp}`);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to +91 ${phone}`,
      data: {
        phone,
        expiresInSeconds: 600,
        // Include mock OTP in development mode for easy testing
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, otp, role } = verifyOtpSchema.parse(req.body);

    const cached = otpStore.get(phone);
    const isValidDevOtp = process.env.NODE_ENV !== 'production' && otp === '123456';

    if (!isValidDevOtp) {
      if (!cached || cached.otp !== otp) {
        throw new AppError('Invalid OTP. Please check and try again.', 400);
      }
      if (Date.now() > cached.expiresAt) {
        otpStore.delete(phone);
        throw new AppError('OTP has expired. Please request a new one.', 400);
      }
    }

    // Clear used OTP
    otpStore.delete(phone);

    // Find or locate user in database
    let user = await prisma.user.findUnique({
      where: { phone },
      include: {
        doctorProfile: { include: { facility: true } },
        workerProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      // Create user if not existing
      user = await prisma.user.create({
        data: {
          phone,
          role,
          fullName: role === 'PATIENT' ? 'New Patient' : role === 'WORKER' ? 'Health Worker' : role === 'DOCTOR' ? 'Doctor' : 'Administrator',
        },
        include: {
          doctorProfile: { include: { facility: true } },
          workerProfile: true,
          patientProfile: true,
        },
      });
    }

    const payload: AuthUserPayload = {
      id: user.id,
      phone: user.phone,
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

export async function loginPin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, pin, role } = loginPinSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        doctorProfile: { include: { facility: true } },
        workerProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found with this mobile number.', 404);
    }

    if (user.role !== role) {
      throw new AppError(`User exists but does not have the '${role}' role.`, 403);
    }

    // Verify PIN: in dev, allow '1234' as default PIN, or compare hash
    let pinValid = false;
    if (user.pinHash) {
      pinValid = await bcrypt.compare(pin, user.pinHash);
    } else if (process.env.NODE_ENV !== 'production') {
      pinValid = pin === '1234';
    }

    if (!pinValid) {
      throw new AppError('Incorrect PIN. Please try again.', 401);
    }

    const payload: AuthUserPayload = {
      id: user.id,
      phone: user.phone,
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

