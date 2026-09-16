import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let dbStatus = 'disconnected';
  let dbError: string | null = null;

  try {
    // Quick query to check database connection
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'disconnected';
    dbError = err instanceof Error ? err.message : 'Database query failed';
  }

  res.status(200).json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    service: 'ruralcare-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      ...(dbError ? { error: dbError } : {}),
    },
  });
}
