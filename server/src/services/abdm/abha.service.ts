import { prisma } from '../../lib/prisma.js';

export class ABHAService {
  /**
   * Resolves a mock ABHA profile by ABHA Address (mock-abha-xxxxxx@sbx),
   * ABHA 14-digit number (91-xxxx-xxxx-xxxx), or internal UUID.
   * NEVER stores or queries real Aadhaar numbers.
   */
  async getProfileById(identifier: string) {
    return prisma.mockABHAProfile.findFirst({
      where: {
        OR: [
          { id: identifier },
          { abhaAddress: identifier.toLowerCase() },
          { abhaNumber: identifier },
          { linkedHealthId: identifier },
        ],
      },
    });
  }

  /**
   * Verifies if a given ABHA address exists in the mock registry.
   */
  async verifyAbhaAddress(abhaAddress: string) {
    const profile = await prisma.mockABHAProfile.findUnique({
      where: { abhaAddress: abhaAddress.toLowerCase() },
    });

    if (!profile) {
      return {
        exists: false,
        verified: false,
        message: 'ABHA address not found in mock sandbox registry.',
      };
    }

    return {
      exists: true,
      verified: true,
      status: profile.status,
      abhaAddress: profile.abhaAddress,
      abhaNumber: profile.abhaNumber,
      fullName: profile.fullName,
      gender: profile.gender,
      dob: profile.dob,
      authMethods: profile.authMethods,
      isMock: true,
    };
  }

  /**
   * Helper to generate a realistic mock ABHA profile for a RuralCare registered patient.
   */
  async createMockProfile(data: {
    fullName: string;
    fullNameHi?: string;
    gender: string;
    dob: string;
    mobile: string;
    address: string;
    village: string;
    district: string;
    state: string;
    pincode: string;
    linkedPatientId?: string;
    linkedHealthId?: string;
  }) {
    // Generate synthetic ABHA Address and ABHA Number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const abhaAddress = `mock-abha-${randomSuffix}@sbx`;
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const abhaNumber = `91-${p1}-${p2}-${p3}`;

    return prisma.mockABHAProfile.create({
      data: {
        abhaAddress,
        abhaNumber,
        fullName: data.fullName,
        fullNameHi: data.fullNameHi,
        gender: data.gender,
        dob: data.dob,
        mobile: data.mobile,
        address: data.address,
        village: data.village,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        authMethods: ['MOBILE_OTP', 'DEMO_AUTH'],
        status: 'ACTIVE',
        isMock: true,
        linkedPatientId: data.linkedPatientId,
        linkedHealthId: data.linkedHealthId,
      },
    });
  }
}

export const abhaService = new ABHAService();

