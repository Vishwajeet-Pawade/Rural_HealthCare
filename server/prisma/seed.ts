import {
  PrismaClient,
  Role,
  RiskLevel,
  ConsentStatus,
  ReferralPriority,
  ReferralStatus,
  DutyStatus,
  SyncStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUser(data: any) {
  const email = data.email || `${data.phone}@ruralcare.demo`;

  return prisma.user.upsert({
    where: { phone: data.phone },
    update: {
      email,
      fullName: data.fullName,
      role: data.role,
      pinHash: data.pinHash,
      isDemo: true,
    },
    create: {
      email,
      phone: data.phone,
      role: data.role,
      fullName: data.fullName,
      pinHash: data.pinHash,
      isDemo: true,
    },
  });
}