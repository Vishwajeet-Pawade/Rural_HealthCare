# RuralCare — Local Mock ABDM Registry Service Integration Guide

> **SIH 26133**: *Accessibility and Quality of Public Healthcare Services, Particularly in Rural and Underserved Areas*  
> **Component**: Local Mock ABDM (Ayushman Bharat Digital Mission) Registry & FHIR R4 Interoperability Layer  
> **Status**: Complete Mock Implementation (Native Windows PostgreSQL + Node.js + Express + Prisma)  
> **Notice**: *RuralCare currently uses a local mock registry interface designed for future ABDM integration. This service uses synthetic demonstration data only. No real citizen or clinician PII is stored or queried.*

---

## Table of Contents

1. [Why the Mock Exists](#1-why-the-mock-exists)
2. [What It Represents](#2-what-it-represents)
3. [What It Does NOT Represent](#3-what-it-does-not-represent)
4. [HFR (Health Facility Registry) Model](#4-hfr-health-facility-registry-model)
5. [HPR (Healthcare Professionals Registry) Model](#5-hpr-healthcare-professionals-registry-model)
6. [ASHA / Health Worker Operational Directory](#6-asha--health-worker-operational-directory)
7. [ABHA Synthetic Identity References](#7-abha-synthetic-identity-references)
8. [Consent & PHR Mock Model](#8-consent--phr-mock-model)
9. [HL7 FHIR R4 Interoperability Support](#9-hl7-fhir-r4-interoperability-support)
10. [REST API Endpoint Reference](#10-rest-api-endpoint-reference)
11. [Database Seeding & Verification](#11-database-seeding--verification)
12. [Configuration (`ABDM_MODE`)](#12-configuration-abdm_mode)
13. [Transition Roadmap: Moving to ABDM Sandbox / Production](#13-transition-roadmap-moving-to-abdm-sandbox--production)
14. [Implementation Matrix: Real vs. Simulated Components](#14-implementation-matrix-real-vs-simulated-components)

---

## 1. Why the Mock Exists

During hackathons, field pilots, and early application development, accessing the official National Health Authority (NHA) ABDM Sandbox poses several operational barriers:
- **Client Credentials & IP Whitelisting**: Official sandbox access requires whitelisting and corporate gateway keys.
- **Offline / Low-Bandwidth Resilience**: Rural healthcare field tests often occur without high-speed internet. Having an external API dependency breaks local demonstrations.
- **End-to-End Workflow Prototyping**: RuralCare needs to prove the complete longitudinal care cycle:
  $$\text{Patient} \rightarrow \text{ABHA Linked} \rightarrow \text{ASHA Triaging} \rightarrow \text{PHC / CHC Referral} \rightarrow \text{Consent} \rightarrow \text{Doctor Consult} \rightarrow \text{FHIR Record}$$
  A local mock service allows this entire pipeline to execute end-to-end against native PostgreSQL without external service downtime.

---

## 2. What It Represents

The Local Mock ABDM Registry Service represents the external digital health ecosystem:
- **Registry Services**: Simulates national registries for healthcare facilities (HFR) and medical professionals (HPR).
- **Identity Resolution**: Simulates ABHA profile verification and demographic lookups (`mock-abha-xxxxxx@sbx`).
- **Electronic Consent**: Implements a standard consent artifact lifecycle with audit trail logging.
- **Data Exchange Standard**: Generates valid HL7 FHIR R4 JSON resources complying with NRCES NDHM profiles (Patient, Encounter, Observation, Condition, MedicationRequest, ServiceRequest, DocumentBundle).

---

## 3. What It Does NOT Represent

To adhere to data privacy and regulatory ethics, this implementation explicitly enforces:
- **NOT a Government Registry**: Does not connect to live NHA production or Sandbox servers.
- **NO Real Aadhaar Numbers**: Zero 12-digit Aadhaar numbers are stored or simulated. Only synthetic ABHA numbers (`91-xxxx-xxxx-xxxx`) and handles (`mock-abha-xxxxxx@sbx`) are used.
- **NO Real Patient or Clinical Data**: All clinical diagnoses, vitals, patient profiles, and medical histories are fictional.
- **NO Real Professional Credentials**: Physician council numbers (e.g. `MMC-2012-04821`) and facility IDs are synthetic.
- **NEVER Claim Live Government Integration**: Team presentations must state: *"RuralCare currently uses a local mock registry interface designed for future ABDM integration."*

---

## 4. HFR (Health Facility Registry) Model

The Health Facility Registry represents both public and private healthcare facilities.

### Database Model: `MockHFRFacility`
```prisma
model MockHFRFacility {
  id                String   @id @default(uuid())
  hfrId             String   @unique // e.g. HFR-MH-00103
  facilityName      String
  facilityType      String   // Sub Centre, PHC, CHC, District Hospital, Diagnostic Centre, Telemedicine Node
  subType           String?
  ownership         String   @default("Government/Public")
  state             String
  district          String
  subDistrict       String?
  village           String?
  pincode           String
  address           String
  latitude          Float?
  longitude         Float?
  contactPhone      String
  contactEmail      String
  services          String[] // OPD, IPD, Emergency, Maternity, etc.
  specialties       String[]
  hasEmergency      Boolean  @default(false)
  operationalStatus String   @default("ACTIVE")
  openingHours      String   @default("24x7")
  registryStatus    String   @default("VERIFIED_MOCK")
  isMock            Boolean  @default(true)
  linkedFacilityId  String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Seeded Facilities Across Care Tiers (Maharashtra Rural)
| HFR ID | Facility Name | Tier | District | 24x7 Emergency | Key Services |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `HFR-MH-00101` | SC Shirwal Pada | Sub Centre | Satara | No | OPD, Immunization, NCD Screening |
| `HFR-MH-00102` | SC Velhe Khurd | Sub Centre | Pune Rural | No | Maternal Health, Basic Diagnostics |
| `HFR-MH-00103` | PHC Khed Shivapur | PHC 24x7 | Pune Rural | **Yes** | 24x7 Emergency, IPD (6 Beds), Labour Room |
| `HFR-MH-00104` | PHC Bhor Dehar | PHC | Pune Rural | No | Maternity, Pharmacy, Cold Chain |
| `HFR-MH-00105` | PHC Paud Taluka | PHC 24x7 | Pune Rural | **Yes** | Emergency, Snakebite Unit, Lab |
| `HFR-MH-00201` | CHC Saswad Rural | CHC (30 Beds) | Pune Rural | **Yes** | Surgery, Blood Storage, Sonography, OT |
| `HFR-MH-00202` | CHC Wai Valley | CHC (50 Beds) | Satara | **Yes** | HDU, Surgical Ward, ICU |
| `HFR-MH-00301` | District Hospital Aundh-Pune | DH (300 Beds) | Pune | **Yes** | Tertiary ICU, Trauma Unit, CT Scan, Blood Bank |
| `HFR-MH-00401` | Sahyadri Rural Diagnostic | Diagnostic Centre | Pune Rural | No | Digital X-Ray, Sonography, Automated Lab |
| `HFR-MH-00501` | Maharashtra Tele-Consult Hub | Telemedicine Node | Pune | No | eSanjeevani Node, Super-Specialty Consult |

---

## 5. HPR (Healthcare Professionals Registry) Model

### Core Distinction: HPR vs. Operational Availability
- **HPR (External ABDM Concept)**: Simulates the national register of verified practitioner credentials, medical council affiliations (`Maharashtra Medical Council`), degrees (`MBBS`, `MD`, `MS`), and registered specialties.
- **RuralCare Operational Availability (Internal Concept)**: Manages real-time duty status (`AVAILABLE`, `BUSY`, `OFFLINE`), physical clinic distance, on-call assignments, and patient queue handling.

### Database Model: `MockHPRProfessional`
```prisma
model MockHPRProfessional {
  id                  String   @id @default(uuid())
  hprId               String   @unique // e.g. HPR-MH-100201
  fullName            String
  gender              String
  professionalType    String   // Doctor, Specialist, Medical Officer, AYUSH Practitioner
  qualification       String   // MBBS, MD, MS, DCH, DNB, BAMS
  specialties         String[]
  registrationNumber  String   // Council registration number
  registrationCouncil String   // e.g. "Maharashtra Medical Council"
  state               String
  district            String
  primaryHfrId        String?
  primaryFacilityName String?
  languages           String[]
  contactPhone        String
  contactEmail        String
  verificationStatus  String   @default("VERIFIED_MOCK")
  isMock              Boolean  @default(true)
  linkedDoctorId      String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

---

## 6. ASHA / Health Worker Operational Directory

> [!IMPORTANT]
> **Regulatory Boundary**: ABDM HFR/HPR registries are designated for healthcare facilities and certified medical doctors/dentists/nurses. Village-level frontline community workers (**ASHA**, **ANM**, **CHO**) are tracked in RuralCare's operational worker directory, **NOT** conflated with HPR doctor licenses.

### Database Model: `MockWorkerDirectory`
```prisma
model MockWorkerDirectory {
  id                 String   @id @default(uuid())
  workerCode         String   @unique // e.g. WRK-MH-ASHA-001
  name               String
  workerType         String   @default("ASHA") // ASHA, ANM, CHO
  assignedVillage    String
  subCentre          String
  parentPhcName      String
  parentPhcHfrId     String
  district           String
  state              String
  pincode            String
  contactPhone       String
  languages          String[]
  assignedPopulation Int      @default(1200)
  active             Boolean  @default(true)
  latitude           Float?
  longitude          Float?
  linkedWorkerId     String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

---

## 7. ABHA Synthetic Identity References

All mock patient identities strictly use the sandbox namespace `@sbx` and synthetic 14-digit numbers starting with `91-`:
- **Address Format**: `mock-abha-xxxxxx@sbx` (e.g. `mock-abha-000001@sbx`)
- **Number Format**: `91-XXXX-XXXX-XXXX`
- **Zero Real Aadhaar Numbers**: The system generates zero mock Aadhaar numbers.

### Database Model: `MockABHAProfile`
```prisma
model MockABHAProfile {
  id              String   @id @default(uuid())
  abhaAddress     String   @unique
  abhaNumber      String   @unique
  fullName        String
  fullNameHi      String?
  gender          String
  dob             String
  dayOfBirth      String?
  monthOfBirth    String?
  yearOfBirth     String?
  mobile          String
  address         String
  village         String
  district        String
  state           String
  pincode         String
  authMethods     String[] // ["MOBILE_OTP", "DEMO_AUTH"]
  status          String   @default("ACTIVE")
  isMock          Boolean  @default(true)
  linkedPatientId String?
  linkedHealthId  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 8. Consent & PHR Mock Model

RuralCare integrates consent artifact creation, checking, and revocation with automated audit trail logging:

### Consent Workflow
1. Patient grants consent to an accessor (`Dr. Nilesh Patil` or `Meena Kumari - ASHA`).
2. Requester specifies data scope (`["Consultations", "Vitals", "Prescriptions", "DiagnosticReports"]`) and expiration date.
3. System records the `ConsentArtifact` with a synthetic SHA256 digital signature.
4. An immutable `AuditLog` entry is generated with action `CONSENT_GRANTED`.
5. Upon revocation (`POST /api/v1/abdm/mock/consents/:id/revoke`), the status updates to `REVOKED`, and an `AuditLog` entry is added with action `CONSENT_REVOKED`.

---

## 9. HL7 FHIR R4 Interoperability Support

The service transforms internal relational PostgreSQL data into standard **HL7 FHIR R4** JSON resources compliant with the National Resource Centre for EHR Standards (NRCES):

| Resource | Profile URI | Mapped Fields |
| :--- | :--- | :--- |
| **`Patient`** | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient` | HealthId, ABHA Address, ABHA Number, official name, telecom, gender, birthDate, rural address |
| **`Encounter`** | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter` | Encounter code, ambulatory class (`AMB`), practitioner reference (`Practitioner/{hprId}`), organization reference (`Organization/{hfrId}`) |
| **`Observation`** | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation` | Standard LOINC codes for vitals: BP (`85354-9`), Pulse (`8867-4`), SpO2 (`2708-6`), Temp (`8310-5`) |
| **`Condition`** | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition` | Clinical diagnosis, provisional symptoms, recorded timestamps |
| **`MedicationRequest`** | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest` | Prescribed drugs, dosage instructions, ordering physician |
| **`ServiceRequest`** | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/ServiceRequest` | Referral consultation orders, urgency priority (`routine`, `urgent`, `stat`), target facility |
| **`Bundle`** | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle` | Full composite collection of patient records for longitudinal data exchange |

---

## 10. REST API Endpoint Reference

All mock registry routes are served under `/api/v1/abdm/mock/`:

### System Status
- `GET /api/v1/abdm/mock/status`
  - Returns current integration mode (`mock`), registry record counts, and sandbox notice.

### Health Facility Registry (HFR)
- `GET /api/v1/abdm/mock/hfr/facilities`
  - Filter options: `?type=PHC&district=Pune Rural&emergency=true`
- `GET /api/v1/abdm/mock/hfr/facilities/:id`
  - Resolves by database UUID or official mock HFR ID (`HFR-MH-00103`).
- `GET /api/v1/abdm/mock/hfr/search?q=Saswad`

### Healthcare Professionals Registry (HPR)
- `GET /api/v1/abdm/mock/hpr/professionals`
  - Filter options: `?specialty=General Medicine&district=Pune Rural`
- `GET /api/v1/abdm/mock/hpr/professionals/:id`
  - Resolves by UUID or HPR ID (`HPR-MH-100201`).
- `GET /api/v1/abdm/mock/hpr/search?q=Patil`

### Health Worker Directory (Operational)
- `GET /api/v1/abdm/mock/workers`
  - Filter options: `?type=ASHA&village=Shivapur`
- `GET /api/v1/abdm/mock/workers/:id`
  - Resolves by UUID or Worker Code (`WRK-MH-ASHA-001`).
- `GET /api/v1/abdm/mock/workers/search?q=Gaikwad`

### ABHA Identity Verification
- `GET /api/v1/abdm/mock/abha/:id`
  - Resolves by ABHA Address, ABHA Number, or RuralCare HealthId.
- `POST /api/v1/abdm/mock/abha/verify`
  - Request body: `{"abhaAddress": "mock-abha-000001@sbx"}`

### Consent Management
- `GET /api/v1/abdm/mock/consents/:id`
  - Resolves by UUID or Consent Code (`CNS-001` or `CA-2026-xxxx`).
- `POST /api/v1/abdm/mock/consents`
  - Request body:
    ```json
    {
      "patientId": "7edc94c4-49c4-48eb-8499-11e15c1e1613",
      "grantedTo": "Dr. Nilesh Patil",
      "role": "General Physician",
      "organization": "PHC Khed Shivapur",
      "purpose": "Specialist referral consultation",
      "dataScope": ["Consultations", "Vitals", "Prescriptions"]
    }
    ```
- `POST /api/v1/abdm/mock/consents/:id/revoke`
  - Request body: `{"reason": "Patient revoked consent after visit"}`

### HL7 FHIR R4 Resources
- `GET /api/v1/abdm/mock/fhir/patient/:id`
  - Content-Type: `application/fhir+json`
- `GET /api/v1/abdm/mock/fhir/encounter/:id`
  - Generates Encounter resource for consultation code or UUID.
- `GET /api/v1/abdm/mock/fhir/servicerequest/:id`
  - Generates ServiceRequest resource for referral code or UUID.
- `GET /api/v1/abdm/mock/fhir/bundle/:patientId`
  - Generates complete longitudinal record Bundle for patient.

---

## 11. Database Seeding & Verification

To reset and seed the mock ABDM registry:

```powershell
cd server
npm run seed
```

Output:
```
🌱 Seeding RuralCare database with SIH 26133 domain records...
✓ Cleaned existing records.
✓ Seeded facilities.
✓ Seeded staff & healthcare worker accounts.
✓ Seeded patients.
✓ Seeded consultations.
✓ Seeded AI assessments.
✓ Seeded referrals.
✓ Seeded consent artifacts.
✓ Seeded audit logs.
✓ Seeded emergency access logs.
✓ Seeded sync records.
🏥 Seeding Mock ABDM Ecosystem (Synthetic registry data)...
✓ Seeded Mock HFR Facilities (13 facilities across care tiers).
✓ Seeded Mock HPR Professionals (12 verified mock practitioners).
✓ Seeded Mock Health Worker Directory (12 ASHA/ANM/CHO records).
✓ Seeded Mock ABHA Profiles (10 synthetic patient identities).
🎉 Seeding completed successfully!
```

---

## 12. Configuration (`ABDM_MODE`)

In `server/.env`:
```ini
# ABDM Integration Mode: "mock" (default for local demo) | "sandbox" | "production"
ABDM_MODE="mock"
```

The application uses this configuration to toggle between internal mock registry repositories and external gateway proxies:
- `"mock"`: Queries the native PostgreSQL `MockHFRFacility`, `MockHPRProfessional`, etc.
- `"sandbox"`: Directs outbound requests to `https://dev.abdm.gov.in/gateway/` via the official ABDM bridge client.
- `"production"`: Connects to the national NHA ABDM Gateway with production digital signing certificates.

---

## 13. Transition Roadmap: Moving to ABDM Sandbox / Production

| Milestone | ABDM Milestone Name | RuralCare Capability | Transition Steps |
| :---: | :--- | :--- | :--- |
| **M1** | ABHA Creation & Verification | Patient Registration | Replace `abhaService` with ABDM Gateway API calls: `/v0.5/users/auth/init` and `/v0.5/users/auth/confirmWithMobileOTP`. |
| **M2** | Health Information Provider (HIP) | Consultations & Discharge Summaries | Connect RuralCare API to ABDM Gateway discovery & data push endpoints (`/v0.5/health-information/hip/on-request`). Output existing `fhirService` payloads directly. |
| **M3** | Health Information User (HIU) | Cross-Facility Longitudinal Record | Implement ABDM Consent Manager webhooks (`/v0.5/consent-requests/init`). Existing `ConsentArtifact` model maps directly to official ABDM Consent Artifact schema. |

---

## 14. Implementation Matrix: Real vs. Simulated Components

| Component | Status | Implementation Details |
| :--- | :---: | :--- |
| **PostgreSQL Database** | **REAL** | Native Windows PostgreSQL 18 running on port 5432. Real schema migrations applied. |
| **Prisma ORM** | **REAL** | Type-safe queries, relational foreign keys, cascade deletes, and migrations. |
| **Express REST Server** | **REAL** | Active on port 5000 with CORS, JWT auth middleware, error handler, and request logging. |
| **FHIR R4 Generation** | **REAL** | Valid HL7 FHIR R4 JSON serialization conforming to NRCES NDHM structure definitions. |
| **Consent & Audit Engine** | **REAL** | True relational persistence, status lifecycle (`GRANTED` $\rightarrow$ `REVOKED`), and audit log entries. |
| **HFR / HPR Registries** | **SIMULATED** | Fictional facilities and practitioners stored in local PostgreSQL tables (`isMock: true`). |
| **ABHA Profiles** | **SIMULATED** | Synthetic ABHA identifiers (`mock-abha-xxxxxx@sbx`) with zero fake Aadhaar storage. |
| **SMS / Mobile OTP Gateway** | **SIMULATED** | In-memory OTP store (`123456` in development) logging to server console. |

---

### Example cURL Queries

```bash
# 1. Check Mock Status & Record Counts
curl -X GET http://localhost:5000/api/v1/abdm/mock/status

# 2. Query PHC Khed Shivapur by HFR ID
curl -X GET http://localhost:5000/api/v1/abdm/mock/hfr/facilities/HFR-MH-00103

# 3. Query Doctor Nilesh Patil by HPR ID
curl -X GET http://localhost:5000/api/v1/abdm/mock/hpr/professionals/HPR-MH-100201

# 4. Generate HL7 FHIR R4 Patient Resource
curl -X GET http://localhost:5000/api/v1/abdm/mock/fhir/patient/RHC-2026-8F4K92

# 5. Generate HL7 FHIR R4 Encounter Resource
curl -X GET http://localhost:5000/api/v1/abdm/mock/fhir/encounter/CON-2026-001
```

