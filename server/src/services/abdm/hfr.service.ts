import { prisma } from '../../lib/prisma.js';
import { HFRSearchQuery } from '../../types/abdm.types.js';

export class HFRService {
  /**
   * Retrieves all mock health facilities with optional filter parameters.
   */
  async getAllFacilities(query?: HFRSearchQuery) {
    const where: any = {};

    if (query?.facilityType) {
      where.facilityType = { equals: query.facilityType, mode: 'insensitive' };
    }

    if (query?.district) {
      where.district = { equals: query.district, mode: 'insensitive' };
    }

    if (query?.state) {
      where.state = { equals: query.state, mode: 'insensitive' };
    }

    if (query?.hasEmergency !== undefined) {
      where.hasEmergency = query.hasEmergency;
    }

    if (query?.q) {
      where.OR = [
        { facilityName: { contains: query.q, mode: 'insensitive' } },
        { hfrId: { contains: query.q, mode: 'insensitive' } },
        { district: { contains: query.q, mode: 'insensitive' } },
        { village: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return prisma.mockHFRFacility.findMany({
      where,
      orderBy: [{ district: 'asc' }, { facilityType: 'asc' }],
    });
  }

  /**
   * Finds a mock facility by UUID or official mock HFR ID.
   */
  async getFacilityById(idOrHfrId: string) {
    return prisma.mockHFRFacility.findFirst({
      where: {
        OR: [
          { id: idOrHfrId },
          { hfrId: idOrHfrId },
        ],
      },
    });
  }

  /**
   * Searches facilities by query string and specialty or type.
   */
  async searchFacilities(params: HFRSearchQuery) {
    return this.getAllFacilities(params);
  }
}

export const hfrService = new HFRService();

