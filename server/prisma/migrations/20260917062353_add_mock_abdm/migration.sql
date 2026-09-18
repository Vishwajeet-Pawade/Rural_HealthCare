-- AlterTable
ALTER TABLE "ConsentArtifact" ADD COLUMN     "consentManagerId" TEXT DEFAULT 'mock-abdm-cm@sbx',
ADD COLUMN     "hipId" TEXT,
ADD COLUMN     "hiuId" TEXT,
ADD COLUMN     "isMock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "signature" TEXT;

-- CreateTable
CREATE TABLE "MockHFRFacility" (
    "id" TEXT NOT NULL,
    "hfrId" TEXT NOT NULL,
    "facilityName" TEXT NOT NULL,
    "facilityType" TEXT NOT NULL,
    "subType" TEXT,
    "ownership" TEXT NOT NULL DEFAULT 'Government/Public',
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "subDistrict" TEXT,
    "village" TEXT,
    "pincode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "services" TEXT[],
    "specialties" TEXT[],
    "hasEmergency" BOOLEAN NOT NULL DEFAULT false,
    "operationalStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "openingHours" TEXT NOT NULL DEFAULT '24x7',
    "registryStatus" TEXT NOT NULL DEFAULT 'VERIFIED_MOCK',
    "isMock" BOOLEAN NOT NULL DEFAULT true,
    "linkedFacilityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockHFRFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockHPRProfessional" (
    "id" TEXT NOT NULL,
    "hprId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "professionalType" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "specialties" TEXT[],
    "registrationNumber" TEXT NOT NULL,
    "registrationCouncil" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "primaryHfrId" TEXT,
    "primaryFacilityName" TEXT,
    "languages" TEXT[],
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "verificationStatus" TEXT NOT NULL DEFAULT 'VERIFIED_MOCK',
    "isMock" BOOLEAN NOT NULL DEFAULT true,
    "linkedDoctorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockHPRProfessional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockWorkerDirectory" (
    "id" TEXT NOT NULL,
    "workerCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workerType" TEXT NOT NULL DEFAULT 'ASHA',
    "assignedVillage" TEXT NOT NULL,
    "subCentre" TEXT NOT NULL,
    "parentPhcName" TEXT NOT NULL,
    "parentPhcHfrId" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "languages" TEXT[],
    "assignedPopulation" INTEGER NOT NULL DEFAULT 1200,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "linkedWorkerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockWorkerDirectory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockABHAProfile" (
    "id" TEXT NOT NULL,
    "abhaAddress" TEXT NOT NULL,
    "abhaNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fullNameHi" TEXT,
    "gender" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "dayOfBirth" TEXT,
    "monthOfBirth" TEXT,
    "yearOfBirth" TEXT,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "authMethods" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isMock" BOOLEAN NOT NULL DEFAULT true,
    "linkedPatientId" TEXT,
    "linkedHealthId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockABHAProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MockHFRFacility_hfrId_key" ON "MockHFRFacility"("hfrId");

-- CreateIndex
CREATE UNIQUE INDEX "MockHPRProfessional_hprId_key" ON "MockHPRProfessional"("hprId");

-- CreateIndex
CREATE UNIQUE INDEX "MockWorkerDirectory_workerCode_key" ON "MockWorkerDirectory"("workerCode");

-- CreateIndex
CREATE UNIQUE INDEX "MockABHAProfile_abhaAddress_key" ON "MockABHAProfile"("abhaAddress");

-- CreateIndex
CREATE UNIQUE INDEX "MockABHAProfile_abhaNumber_key" ON "MockABHAProfile"("abhaNumber");
