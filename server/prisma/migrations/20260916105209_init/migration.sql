-- CreateEnum
CREATE TYPE "Role" AS ENUM ('WORKER', 'DOCTOR', 'PATIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('GRANTED', 'TEMPORARY', 'REVOKED');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SYNCED', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_CONSULTATION', 'REFERRED', 'COMPLETED', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "ReferralPriority" AS ENUM ('ROUTINE', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "DutyStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "SosStatus" AS ENUM ('SENT', 'NOTIFIED', 'AWAITING', 'ACKNOWLEDGED', 'DECLINED', 'ESCALATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "pinHash" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "hfrId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facilityType" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hprId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "dutyStatus" "DutyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "distance" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "recommendationReasons" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workerType" TEXT NOT NULL DEFAULT 'ASHA',
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "healthId" TEXT NOT NULL,
    "abhaNumber" TEXT,
    "abhaAddress" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "nameHi" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "dob" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "emergencyContact" JSONB NOT NULL,
    "allergies" TEXT[],
    "chronicConditions" TEXT[],
    "currentMedications" TEXT[],
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "lastConsultation" TEXT,
    "healthWorkerId" TEXT,
    "healthWorkerName" TEXT,
    "registeredAt" TEXT NOT NULL,
    "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'GRANTED',
    "vaccinationStatus" TEXT NOT NULL DEFAULT 'Fully vaccinated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "consultationCode" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "workerId" TEXT,
    "workerName" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorName" TEXT,
    "facilityName" TEXT,
    "symptoms" TEXT[],
    "vitals" JSONB NOT NULL,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "prescription" TEXT[],
    "notes" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "referralStatus" TEXT NOT NULL DEFAULT 'none',
    "followUpDate" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAssessment" (
    "id" TEXT NOT NULL,
    "assessmentCode" TEXT NOT NULL,
    "consultationId" TEXT,
    "patientId" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "symptomsConsidered" TEXT[],
    "abnormalVitals" TEXT[],
    "riskFactors" TEXT[],
    "reasoning" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "generatedAt" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL DEFAULT 'v2.1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "fromWorkerId" TEXT,
    "fromWorker" TEXT NOT NULL,
    "toFacilityId" TEXT,
    "toPHC" TEXT NOT NULL,
    "toDoctorId" TEXT,
    "reason" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "date" TEXT NOT NULL,
    "priority" "ReferralPriority" NOT NULL DEFAULT 'ROUTINE',
    "notes" TEXT,
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SosAlert" (
    "id" TEXT NOT NULL,
    "sosCode" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "senderId" TEXT,
    "patientId" TEXT,
    "patientHealthId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "ts" TEXT NOT NULL,
    "isOffline" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "status" "SosStatus" NOT NULL DEFAULT 'SENT',
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "targetedDoctorId" TEXT,
    "respondingDoctorId" TEXT,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SosAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentArtifact" (
    "id" TEXT NOT NULL,
    "consentCode" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "grantedTo" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "facilityId" TEXT,
    "status" "ConsentStatus" NOT NULL DEFAULT 'GRANTED',
    "purpose" TEXT NOT NULL,
    "dataScope" TEXT[],
    "grantedAt" TEXT NOT NULL,
    "expiresAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyAccessLog" (
    "id" TEXT NOT NULL,
    "logCode" TEXT NOT NULL,
    "patientId" TEXT,
    "patientHealthId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorName" TEXT NOT NULL,
    "facilityId" TEXT,
    "facilityName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "started" TEXT NOT NULL,
    "ended" TEXT,
    "duration" TEXT NOT NULL DEFAULT '15 min',
    "records" TEXT NOT NULL,
    "addlRequested" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "auditCode" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "accessorId" TEXT,
    "accessorName" TEXT NOT NULL,
    "accessorRole" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "dataAccessed" TEXT[],
    "timestamp" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncRecord" (
    "id" TEXT NOT NULL,
    "syncCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "recordedAt" TEXT NOT NULL,
    "syncedAt" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_hfrId_key" ON "Facility"("hfrId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_hprId_key" ON "Doctor"("hprId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_userId_key" ON "Worker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_healthId_key" ON "Patient"("healthId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_abhaNumber_key" ON "Patient"("abhaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_abhaAddress_key" ON "Patient"("abhaAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_consultationCode_key" ON "Consultation"("consultationCode");

-- CreateIndex
CREATE UNIQUE INDEX "AIAssessment_assessmentCode_key" ON "AIAssessment"("assessmentCode");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referralCode_key" ON "Referral"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "SosAlert_sosCode_key" ON "SosAlert"("sosCode");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentArtifact_consentCode_key" ON "ConsentArtifact"("consentCode");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyAccessLog_logCode_key" ON "EmergencyAccessLog"("logCode");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_auditCode_key" ON "AuditLog"("auditCode");

-- CreateIndex
CREATE UNIQUE INDEX "SyncRecord_syncCode_key" ON "SyncRecord"("syncCode");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_healthWorkerId_fkey" FOREIGN KEY ("healthWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAssessment" ADD CONSTRAINT "AIAssessment_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAssessment" ADD CONSTRAINT "AIAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_fromWorkerId_fkey" FOREIGN KEY ("fromWorkerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_toFacilityId_fkey" FOREIGN KEY ("toFacilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_toDoctorId_fkey" FOREIGN KEY ("toDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosAlert" ADD CONSTRAINT "SosAlert_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosAlert" ADD CONSTRAINT "SosAlert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosAlert" ADD CONSTRAINT "SosAlert_targetedDoctorId_fkey" FOREIGN KEY ("targetedDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosAlert" ADD CONSTRAINT "SosAlert_respondingDoctorId_fkey" FOREIGN KEY ("respondingDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentArtifact" ADD CONSTRAINT "ConsentArtifact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentArtifact" ADD CONSTRAINT "ConsentArtifact_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAccessLog" ADD CONSTRAINT "EmergencyAccessLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAccessLog" ADD CONSTRAINT "EmergencyAccessLog_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAccessLog" ADD CONSTRAINT "EmergencyAccessLog_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_accessorId_fkey" FOREIGN KEY ("accessorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
