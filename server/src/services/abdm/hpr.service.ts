import { prisma } from '../../lib/prisma.js';
import { HPRSearchQuery } from '../../types/abdm.types.js';

export class HPRService {
  /**
   * Retrieves all mock healthcare professionals with optional filtering.
   * NOTE: HPR represents verified practitioner credentials, distinct from RuralCare on-duty status.
   */
  async getAllProfessionals(query?: HPRSearchQuery) {
    const where: any = {};

    if (query?.specialty) {
      where.specialties = { has: query.specialty };
    }

    if (query?.district) {
      where.district = { equals: query.district, mode: 'insensitive' };
    }

    if (query?.facilityHfrId) {
      where.primaryHfrId = { equals: query.facilityHfrId, mode: 'insensitive' };
    }

    if (query?.state) {
      where.state = { equals: query.state, mode: 'insensitive' };
    }

    if (query?.q) {
      where.OR = [
        { fullName: { contains: query.q, mode: 'insensitive' } },
        { hprId: { contains: query.q, mode: 'insensitive' } },
        { registrationNumber: { contains: query.q, mode: 'insensitive' } },
        { qualification: { contains: query.q, mode: 'insensitive' } },
        { primaryFacilityName: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return prisma.mockHPRProfessional.findMany({
      where,
      orderBy: { fullName: 'asc' },
    });
  }

  /**
   * Finds a mock healthcare professional by UUID or HPR ID.
   */
  async getProfessionalById(idOrHprId: string) {
    return prisma.mockHPRProfessional.findFirst({
      where: {
        OR: [
          { id: idOrHprId },
          { hprId: idOrHprId },
        ],
      },
    });
  }

  /**
   * Searches healthcare professionals by specialty, facility, or keyword.
   */
  async searchProfessionals(params: HPRSearchQuery) {
    return this.getAllProfessionals(params);
  }
}

export const hprService = new HPRService();

