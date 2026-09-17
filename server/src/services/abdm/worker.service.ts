import { prisma } from '../../lib/prisma.js';
import { WorkerSearchQuery } from '../../types/abdm.types.js';

export class WorkerDirectoryService {
  /**
   * Retrieves operational health workers (ASHA/ANM/CHO) with optional filters.
   * NOTE: This directory is separate from HPR (which is strictly for licensed medical professionals).
   */
  async getAllWorkers(query?: WorkerSearchQuery) {
    const where: any = {};

    if (query?.workerType) {
      where.workerType = { equals: query.workerType, mode: 'insensitive' };
    }

    if (query?.village) {
      where.assignedVillage = { contains: query.village, mode: 'insensitive' };
    }

    if (query?.district) {
      where.district = { equals: query.district, mode: 'insensitive' };
    }

    if (query?.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { workerCode: { contains: query.q, mode: 'insensitive' } },
        { assignedVillage: { contains: query.q, mode: 'insensitive' } },
        { subCentre: { contains: query.q, mode: 'insensitive' } },
        { parentPhcName: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return prisma.mockWorkerDirectory.findMany({
      where,
      orderBy: [{ district: 'asc' }, { assignedVillage: 'asc' }],
    });
  }

  /**
   * Finds a worker by UUID or workerCode (e.g. WRK-MH-ASHA-001).
   */
  async getWorkerById(idOrCode: string) {
    return prisma.mockWorkerDirectory.findFirst({
      where: {
        OR: [
          { id: idOrCode },
          { workerCode: idOrCode },
        ],
      },
    });
  }

  /**
   * Searches workers by village, subcentre, or name.
   */
  async searchWorkers(params: WorkerSearchQuery) {
    return this.getAllWorkers(params);
  }
}

export const workerDirectoryService = new WorkerDirectoryService();

