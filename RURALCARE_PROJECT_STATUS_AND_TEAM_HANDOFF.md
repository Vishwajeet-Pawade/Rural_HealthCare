# RuralCare Project Status & Team Handoff Document
**Smart India Hackathon 2026 — Problem Statement SIH 26133**  
*“Accessibility and Quality of Public Healthcare Services, Particularly in Rural and Underserved Areas”*  
**Auditor:** Lead Technical Auditor  
**Date of Audit:** September 16, 2026  
**Repository Working Directory:** `d:\Build App (1)`

---

## 1. Project Overview & Context

RuralCare is a rural-first, offline-capable digital healthcare coordination platform engineered for SIH 26133. The platform addresses the extreme friction rural citizens face in accessing timely healthcare in primary health centres (PHCs), sub-centres (SCs), and community health centres (CHCs).

The system creates an unbroken chain of care:
$$\text{Patient} \longrightarrow \text{ASHA Assessment} \longrightarrow \text{AI Decision Support} \longrightarrow \text{PHC Doctor Review} \longrightarrow \text{Specialist Referral} \longrightarrow \text{Continuous Follow-up}$$

It implements an ABDM-ready (Ayushman Bharat Digital Mission) framework incorporating ABHA (patient identity), HPR (healthcare professionals registry), HFR (health facility registry), digital consent management, longitudinal health records, and emergency break-glass workflows.

---

## 2. Core Problem Statement & RuralCare Vision

### Problem Statement SIH 26133
Rural public healthcare in India suffers from fragmented patient records, delayed emergency response, poor specialist referral tracking, high rates of missed follow-ups for chronic illnesses (hypertension, anaemia, diabetes, COPD), and severe connectivity constraints in remote village clusters.

### The 24 Pillars of the RuralCare Architectural Vision
1. **Patient Registration & ABHA-Linked Identity**: Unique Health ID (`RHC-YYYY-XXXXXX`) mapped to 14-digit ABHA.
2. **Longitudinal Patient Health Record**: Chronological, multi-facility lifetime health record.
3. **Role-Based Access Control (RBAC)**: Distinct permissions for Patients, ASHAs/ANMs, PHC Doctors, and District Admins.
4. **Consent Management**: Patient-centric, time-bounded, granular data-scope consent artifacts.
5. **Clinical History & Consultations**: Structured diagnoses, treatment plans, and doctor prescriptions.
6. **Vitals & Symptoms Intake**: Standardized vital signs (BP, SpO2, HR, Temp, Weight, Respiratory Rate) and chief complaints.
7. **AI-Assisted Risk Assessment**: Clinical decision support classifying risk into Low, Moderate, High, Critical.
8. **AI-Generated History Summaries**: Concise synthesis of longitudinal records for time-constrained physicians.
9. **Referral Prioritization & Facility Matching**: Matching patients to nearest accredited PHC/CHC/DH by capability.
10. **Doctor Assignment & Escalation**: On-duty roster mapping with multi-tiered fallback.
11. **Referral Tracking & Closure**: End-to-end status pipeline from creation to specialist treatment completion.
12. **Follow-Up & Missed Follow-Up Detection**: Scheduled reviews with alert generation for overdue patients.
13. **Medicine & Diagnostic Availability**: Inventory visibility across sub-centre and PHC tiers.
14. **Specialist & Telemedicine Support**: Asynchronous second opinions and eSanjeevani integration.
15. **Emergency SOS & Break-Glass Access**: Audited emergency bypass for unconscious patients.
16. **Offline-First Operation & Sync**: Full local functionality with conflict-free background synchronization.
17. **Multilingual Voice/NL Interaction**: Vernacular voice input (Hindi/regional) for grassroots workers.
18. **OCR for Medical Documents**: Ingestion and digitisation of physical lab slips and prescriptions.
19. **Notifications**: SMS, push, and local alert dispatches.
20. **District/Admin Dashboards & Analytics**: Epidemiological disease surveillance and infrastructure monitoring.
21. **ABDM Interoperability**: ABHA, HFR, HPR, Consent Manager, and FHIR R4 clinical bundles.
22. **Immutable Audit Logs**: Tamper-evident logging of every clinical and demographic access event.
23. **Privacy & Security**: Encryption at rest and in transit, strict authorization boundaries.
24. **AI Decision Support, NOT Autonomous Diagnosis**: Clinician maintains final clinical authority.

---

## 3. Current Architecture & Tech Stack

```
+-------------------------------------------------------------------------+
|                              FRONTEND LAYER                             |
| React 19 + Vite 8 + Tailwind CSS v4 (@tailwindcss/vite)                 |
| Local prototype UI: 18 Screens, Inline SVG Icons, Client-side State     |
| Current State: Pure mock data (src/data.ts) - NOT yet wired to REST API  |
+-------------------------------------------------------------------------+
                                    |
                          REST APIs (HTTP / JSON)
                        [Auth Endpoints Active]
                                    |
+-------------------------------------------------------------------------+
|                              BACKEND LAYER                              |
| Node.js 24 + Express 4.21 + TypeScript 5.7 (ES2022 / NodeNext)          |
| Port: 5000 | JWT Auth (7-day tokens) | RBAC Middleware | Zod Validation |
| Morgan Logging | Centralized Error Handling | CORS Configured           |
+-------------------------------------------------------------------------+
                                    |
                             Prisma ORM 6.19
                       (prisma-client-js singleton)
                                    |
+-------------------------------------------------------------------------+
|                             DATABASE LAYER                              |
| PostgreSQL 18 running NATIVE on Windows (localhost:5432)                |
| Database: ruralcare | User: postgres | Migration: 20260916105209_init   |
| 11 Tables, 8 Enums, Seeded with SIH 26133 Demo Dataset                  |
+-------------------------------------------------------------------------+
```

### Verified Tech Stack Components
- **Frontend**: React 19 (`^19.0.0`), React DOM 19, Vite 8 (`^8.0.5`), Tailwind CSS v4 (`^4.0.0`), TypeScript 5.7.
- **Backend**: Node.js v24.14.1, Express (`^4.21.2`), TypeScript (`^5.7.3`), `tsx` runner, `jsonwebtoken`, `bcryptjs`, `zod`, `cors`, `morgan`, `dotenv`.
- **Database**: PostgreSQL 18 Native Windows Service on port `5432`, Prisma ORM (`@prisma/client` & `prisma` v6.19.3).
- **Offline & AI**: Architecture and UI representations exist; backend sync and ML model inference engines are not yet built.

---

## 4. Native Windows PostgreSQL Setup & Docker Status

### Architecture Decision: Docker Removal
Docker and Docker Compose are **no longer required** for local development.
- The PostgreSQL database runs directly as a native Windows service listening on `localhost:5432`.
- `docker-compose.yml` remains in the root repository for reference/CI deployment only, but is documented as **inactive** for local development.
- All database configuration is strictly driven by the `DATABASE_URL` environment variable in `server/.env`.
- Connection string template:
  ```env
  DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/ruralcare"
  ```
- **Rule**: Future teammates and AI agents must **NOT** reintroduce Docker as a requirement for local development.

---

## 5. Phase 1 Completed State (Verified)

Phase 1 has been executed and verified on the live system:

1. **Native PostgreSQL Database Configured**:
   - PostgreSQL 18 is listening on `0.0.0.0:5432` on Windows.
   - Database `ruralcare` is created.
2. **Prisma Schema & Initial Migration**:
   - Schema defined in `server/prisma/schema.prisma`.
   - Migration `server/prisma/migrations/20260916105209_init/migration.sql` successfully applied.
   - Prisma Client generated (`@prisma/client` v6.19.3).
3. **Database Seeding Completed**:
   - `server/prisma/seed.ts` executed. All 11 tables populated with exact records matching `src/data.ts`.
4. **Backend Server Operational**:
   - Express server starts cleanly on port `5000`.
   - `GET /api/health` returns `status: "healthy"` and `database.status: "connected"`.
5. **Authentication Endpoints Functional**:
   - `POST /api/v1/auth/send-otp` generates valid 10-minute OTPs with Zod validation.
   - `POST /api/v1/auth/verify-otp` issues 7-day signed JWT tokens with RBAC claims.
   - `POST /api/v1/auth/login-pin` authenticates users against bcrypt-hashed PINs.

---

## 6. Repository Inventory & File Map

```
d:\Build App (1)\
├── .figma/                          # Figma Make metadata and preview settings
├── .gitignore                       # Root gitignore (ignoring node_modules, dist, .env*)
├── AGENTS.md                        # Figma Make agent environment rules
├── CLAUDE.md                        # Quick command cheatsheet
├── docker-compose.yml               # [ARCHIVED/INACTIVE] PostgreSQL 16 container definition
├── index.html                       # Vite HTML wrapper mounting #root
├── package.json                     # Frontend dependencies (React 19, Tailwind v4)
├── tsconfig.json                    # Frontend TypeScript configuration
├── vite.config.ts                   # Vite 8 config with Tailwind v4 and Figma plugins
├── src/
│   ├── main.tsx                     # Frontend entrypoint
│   ├── App.tsx                      # Root component, state-based router, navigation bar
│   ├── index.css                    # Tailwind v4 theme variables, fonts
│   ├── types.ts                     # Frontend domain types and interfaces
│   ├── data.ts                      # Static mock data (Patients, Consultations, Referrals...)
│   ├── components/
│   │   └── shared.tsx               # Shared UI widgets (Icons, Badges, StatCards, ABDM legends)
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Role selector, dummy phone/OTP/PIN inputs
│   │   ├── WorkerDashboard.tsx      # ASHA home, roster, quick actions, SOS initiator
│   │   ├── PatientRegistration.tsx  # 4-step patient registration wizard
│   │   ├── PatientProfile.tsx       # Longitudinal record, tabs, timeline (ASHA view)
│   │   ├── HealthAssessment.tsx     # Symptoms and vitals entry wizard
│   │   ├── AIRiskAssessment.tsx     # AI decision support score, factors, reasoning
│   │   ├── ReferralSystem.tsx       # Referral pipeline & creation modal
│   │   ├── DoctorDashboard.tsx      # Doctor consultation queue, availability toggle, SOS receiver
│   │   ├── DoctorPatientView.tsx    # Doctor clinical evaluation & diagnosis input
│   │   ├── EmergencyAccess.tsx      # Break-glass emergency override (15-min countdown)
│   │   ├── EmergencyAccessLog.tsx   # Break-glass audit history
│   │   ├── PatientMobileDashboard.tsx # Patient PHR, expandable consultations, lab reports
│   │   ├── ConsentManagement.tsx    # Patient consent artifact manager (grant/revoke)
│   │   ├── AccessRequest.tsx        # Inbound doctor access request approval screen
│   │   ├── AccessHistory.tsx        # Patient data-access audit trail
│   │   ├── AdminDashboard.tsx       # District epidemiological metrics & system health
│   │   ├── OfflineMode.tsx          # Offline feature checklist & simulated offline toggle
│   │   └── SyncCenter.tsx           # Sync status monitor, conflict resolution mock
│   └── imports/pasted_text/
│       ├── emergency-access-spec.md # Break-Glass specification document
│       └── rural-health-ui-ux.md    # SIH 26133 UI/UX specification document
└── server/
    ├── package.json                 # Backend dependencies (Express, Prisma, JWT, Zod)
    ├── tsconfig.json                # Backend TypeScript configuration (NodeNext)
    ├── .env                         # Local environment configuration (DATABASE_URL, JWT_SECRET)
    ├── .env.example                 # Sanitized environment template
    ├── .gitignore                   # Backend gitignore (node_modules, dist, .env)
    ├── prisma/
    │   ├── schema.prisma            # Complete PostgreSQL Prisma schema (11 models, 8 enums)
    │   ├── seed.ts                  # Database seed script matching src/data.ts
    │   └── migrations/
    │       └── 20260916105209_init/ # Initial migration directory
    │           └── migration.sql    # DDL script creating all PostgreSQL tables and constraints
    ├── dist/                        # Compiled production JavaScript bundle
    └── src/
        ├── index.ts                 # Express bootstrap, CORS, middleware, server listener
        ├── lib/
        │   └── prisma.ts            # PrismaClient singleton instance
        ├── types/
        │   └── index.ts             # AuthUserPayload and AuthenticatedRequest interfaces
        ├── middleware/
        │   ├── auth.ts              # JWT authentication and requireRole RBAC middleware
        │   ├── error.ts             # Centralized AppError and Zod validation error handler
        │   └── logger.ts            # Morgan HTTP request logger
        ├── controllers/
        │   ├── health.controller.ts # GET /api/health with database status check
        │   └── auth.controller.ts   # OTP and PIN authentication controllers
        └── routes/
            ├── index.ts             # API v1 router aggregator
            ├── health.routes.ts     # Healthcheck router
            └── auth.routes.ts       # Authentication router (/send-otp, /verify-otp, /login-pin, /me)
```

---

## 7. Feature Implementation Status Matrix

| Feature | Status | Evidence File(s) | What Works | What Is Missing |
|---|---|---|---|---|
| **Patient Registration** | PARTIALLY IMPLEMENTED | `src/screens/PatientRegistration.tsx`, `server/prisma/schema.prisma` | 4-step wizard UI, health ID generator mock, consent checkbox. DB model exists. | Backend `POST /api/v1/patients` endpoint; frontend does not send network request. |
| **Patient Login** | PARTIALLY IMPLEMENTED | `src/screens/LoginScreen.tsx`, `server/src/controllers/auth.controller.ts` | Backend `/api/v1/auth/send-otp` & `/verify-otp` work. UI accepts input. | Frontend `LoginScreen.tsx` does not call the backend API; bypasses via local state. |
| **Staff Login (ASHA/Doctor/Admin)** | PARTIALLY IMPLEMENTED | `src/screens/LoginScreen.tsx`, `server/src/controllers/auth.controller.ts` | Backend verifies PIN and OTP per role. User seeds exist in DB. | Frontend bypasses auth; sidebar role switcher changes active view without token. |
| **JWT Authentication** | FULLY IMPLEMENTED (Backend) | `server/src/middleware/auth.ts`, `server/src/controllers/auth.controller.ts` | JWT signing with 7-day expiry, bearer extraction, payload decoding, user injection. | Token storage on frontend (`localStorage`/cookies) and Axios interceptor. |
| **Role-Based Access Control** | PARTIALLY IMPLEMENTED | `server/src/middleware/auth.ts`, `src/App.tsx#L28-L56` | Backend `requireRole` middleware works. Frontend filters navigation items by role. | Backend guards are not yet hooked to clinical/patient endpoints; frontend role switcher bypasses security. |
| **Longitudinal Health Record** | PARTIALLY IMPLEMENTED | `src/screens/PatientMobileDashboard.tsx`, `server/prisma/schema.prisma` | UI renders timeline of consultations, vitals, prescriptions. DB model supports it. | Endpoint `GET /api/v1/patients/:id/records` does not exist; UI uses hardcoded arrays. |
| **Consultation Intake** | PARTIALLY IMPLEMENTED | `src/screens/HealthAssessment.tsx`, `server/prisma/schema.prisma` | Vitals intake with abnormal threshold flags, symptom picker. DB model ready. | Backend `POST /api/v1/consultations`; frontend navigates to AI screen without saving. |
| **Doctor Clinical Review & Diagnosis** | PARTIALLY IMPLEMENTED | `src/screens/DoctorPatientView.tsx`, `server/prisma/schema.prisma` | Doctor can input diagnosis, treatment plan, prescription in UI. DB model ready. | Backend `PATCH /api/v1/consultations/:id/clinical-notes` missing; state is lost on navigation. |
| **AI Risk Assessment** | PARTIALLY IMPLEMENTED | `src/screens/AIRiskAssessment.tsx`, `server/prisma/schema.prisma` | UI renders confidence score, risk factors, clinical reasoning, disclaimers. DB table seeded. | No real ML model (Gemma/Qwen/XGBoost); scores and reasoning are static mock objects. |
| **Facility Referrals** | PARTIALLY IMPLEMENTED | `src/screens/ReferralSystem.tsx`, `server/prisma/schema.prisma` | Status pipeline (Pending -> Accepted -> In-Consultation -> Completed). DB table seeded. | Backend `GET/POST/PATCH /api/v1/referrals` missing; mutations are client-side only. |
| **Doctor Duty Status & Roster** | PARTIALLY IMPLEMENTED | `src/screens/DoctorDashboard.tsx`, `server/prisma/schema.prisma` | Doctor can toggle Available/Busy/Off Duty in UI. `DutyStatus` enum in DB. | Endpoint `PATCH /api/v1/doctors/duty-status` missing; toggle does not update PostgreSQL. |
| **Emergency SOS Dispatch** | PARTIALLY IMPLEMENTED | `src/screens/WorkerDashboard.tsx`, `src/screens/DoctorDashboard.tsx`, `schema.prisma` | Smart doctor recommendation UI, 90s countdown, doctor accept/decline buttons. DB model ready. | Real-time WebSocket/SSE notification; server-side 90s escalation cron not implemented. |
| **Break-Glass Emergency Access** | PARTIALLY IMPLEMENTED | `src/screens/EmergencyAccess.tsx`, `src/screens/EmergencyAccessLog.tsx` | QR scan, search, temp ID (`TEMP-ER-...`), 15-min timer, audit log UI. DB model ready. | Backend session token issuance with 15-min TTL; timer is currently frontend `setInterval`. |
| **Consent Management** | PARTIALLY IMPLEMENTED | `src/screens/ConsentManagement.tsx`, `src/screens/AccessRequest.tsx` | View active consents, grant/revoke modal, data scope selection. DB table seeded. | Backend consent validation gate; revocations in UI do not update PostgreSQL. |
| **Audit Logging** | PARTIALLY IMPLEMENTED | `src/screens/AccessHistory.tsx`, `server/prisma/schema.prisma` | Immutable audit log UI with actor, organization, data accessed. DB table seeded. | Automated Express middleware to write access logs into `AuditLog` on every clinical query. |
| **Offline-First Storage** | PLANNED / NOT IMPLEMENTED | `src/screens/OfflineMode.tsx` | UI displays checklist of offline capabilities and simulated offline toggle. | No IndexedDB/Dexie.js integration; no local SQLite/watermelondb; data lost on refresh. |
| **Offline Sync & Conflict Handling** | PLANNED / NOT IMPLEMENTED | `src/screens/SyncCenter.tsx`, `server/prisma/schema.prisma` | UI renders sync queue and simulated retry action. DB has `SyncRecord` table. | No sync protocol; no `POST /api/v1/sync/batch`; no timestamp-based conflict resolver. |
| **District Admin Analytics** | PARTIALLY IMPLEMENTED | `src/screens/AdminDashboard.tsx`, `src/data.ts#L341-L368` | UI renders disease prevalence bars, PHC consultation volumes, system alerts. | Backend `GET /api/v1/admin/stats` aggregating real PostgreSQL rows; data is hardcoded. |
| **ABDM / ABHA Integration** | DATABASE/SCAFFOLD ONLY | `server/prisma/schema.prisma`, `src/components/shared.tsx` | DB has `abhaNumber`, `abhaAddress`, `hprId`, `hfrId`. HPR/HFR badges rendered in UI. | No ABDM M1/M2/M3 API integration; no Sandbox OAuth or gateway communication. |
| **FHIR R4 Bundles** | PLANNED / NOT IMPLEMENTED | None | None | No FHIR JSON serializer or validator; records are stored in proprietary Prisma schema. |
| **Voice / Multilingual Input** | PLANNED / NOT IMPLEMENTED | None | Static English/Hindi UI label toggles exist in topbar. | No Web Speech API, Whisper, or Indic voice model integration. |
| **OCR Document Scanner** | PLANNED / NOT IMPLEMENTED | None | None | No Tesseract or vision model integration for physical prescription scanning. |
| **eSanjeevani Telemedicine** | PLANNED / NOT IMPLEMENTED | None | None | No telemedicine webhook or iframe integration. |
| **Automated Testing** | PLANNED / NOT IMPLEMENTED | None | None | No Jest, Vitest, Supertest, or Playwright test suites configured. |

---

## 8. User Journey Trace & Gaps

### Journey A: Patient Registration & Longitudinal Care
$$\text{Registration} \longrightarrow \text{Profile Creation} \longrightarrow \text{Consultation Intake} \longrightarrow \text{Follow-Up}$$
- **Implemented Steps**: Frontend forms for personal, contact, and medical info; display of generated Health ID card; presentation of past consultations in timeline.
- **Missing Steps**: Submission of registration payload to backend; database persistence; generation of cryptographically unique Health ID sequence.
- **Broken Transitions**: Clicking "Register Patient" advances to step 4 using static mock data (`Anita Meena`) without writing to the database.
- **Involved Endpoints**: Needed: `POST /api/v1/patients`, `GET /api/v1/patients/:id`, `GET /api/v1/patients/:id/timeline`.
- **Involved Models**: `Patient`, `User`, `Consultation`, `Worker`.
- **Involved Screens**: `PatientRegistration.tsx`, `PatientProfile.tsx`, `PatientMobileDashboard.tsx`.

### Journey B: ASHA Assessment, Symptoms/Vitals & AI Referral
$$\text{Patient Selection} \longrightarrow \text{Vitals/Symptoms} \longrightarrow \text{AI Evaluation} \longrightarrow \text{Referral Creation}$$
- **Implemented Steps**: Patient lookup from list; vitals entry form with abnormal SpO2/BP warnings; symptom checklist; navigation to AI Risk screen; referral creation form.
- **Missing Steps**: Persistence of consultation intake; dynamic risk calculation via ML model; persistence of referral record.
- **Broken Transitions**: Clicking "Generate AI Risk Assessment" simply switches screen to `AIRiskAssessment.tsx` displaying pre-computed mock data for Ramesh Kumar.
- **Involved Endpoints**: Needed: `POST /api/v1/consultations`, `POST /api/v1/ai/assess`, `POST /api/v1/referrals`.
- **Involved Models**: `Consultation`, `AIAssessment`, `Referral`, `Patient`.
- **Involved Screens**: `HealthAssessment.tsx`, `AIRiskAssessment.tsx`, `ReferralSystem.tsx`.

### Journey C: Doctor Queue, Patient History & Clinical Diagnosis
$$\text{Referral Queue} \longrightarrow \text{Longitudinal Review} \longrightarrow \text{Diagnosis & Prescription} \longrightarrow \text{Referral Status Update}$$
- **Implemented Steps**: Referral cards displayed on Doctor Dashboard; Doctor Patient View displaying vitals and reported symptoms; modal to enter diagnosis and treatment notes.
- **Missing Steps**: Fetching real referral list from database; persisting diagnosis and treatment plan to consultation record; updating referral status to `completed`.
- **Broken Transitions**: Submitting clinical note closes modal via `setAddingDiagnosis(false)` with zero API interaction; data disappears on reload.
- **Involved Endpoints**: Needed: `GET /api/v1/referrals?facilityId=...`, `GET /api/v1/patients/:id/clinical`, `PATCH /api/v1/consultations/:id/clinical-notes`.
- **Involved Models**: `Doctor`, `Consultation`, `Referral`, `Patient`.
- **Involved Screens**: `DoctorDashboard.tsx`, `DoctorPatientView.tsx`.

### Journey D: Referral Lifecycle Management
$$\text{Referral Created} \longrightarrow \text{Assigned to PHC} \longrightarrow \text{Accepted} \longrightarrow \text{Treated} \longrightarrow \text{Closed}$$
- **Implemented Steps**: Referral status pipeline visualization (`pending` -> `accepted` -> `in-consultation` -> `referred` -> `completed`); filter by status.
- **Missing Steps**: State transitions are not connected to backend database updates.
- **Broken Transitions**: Clicking pathway steps or filtering only alters in-memory state of the active component.
- **Involved Endpoints**: Needed: `GET /api/v1/referrals`, `PATCH /api/v1/referrals/:id/status`.
- **Involved Models**: `Referral`, `Facility`, `Doctor`, `Patient`.
- **Involved Screens**: `ReferralSystem.tsx`, `DoctorDashboard.tsx`.

### Journey E: Emergency SOS & Break-Glass Workflow
$$\text{SOS Button} \longrightarrow \text{Doctor Selected} \longrightarrow \text{Dispatch} \longrightarrow \text{Timeout/Ack} \longrightarrow \text{Break-Glass Override} \longrightarrow \text{Audit Log}$$
- **Implemented Steps**: SOS confirmation modal with smart vs manual doctor picker; 90-second countdown in UI; Doctor dashboard incoming SOS alert with Accept/Decline; Break-Glass QR scan / Search / Temp ID workflow; 15-minute emergency timer; immutable audit log screen.
- **Missing Steps**: Real-time push notification (Socket.io/SSE); server-side timeout escalation logic; server-enforced 15-minute temporary JWT access token; automated writing of break-glass audit logs.
- **Broken Transitions**: ASHA triggers SOS by mutating `App.tsx` state array. If doctor is on another browser/device, alert is never transmitted.
- **Involved Endpoints**: Needed: `POST /api/v1/sos/alerts`, `POST /api/v1/sos/alerts/:id/ack`, `POST /api/v1/sos/alerts/:id/decline`, `POST /api/v1/emergency-access/authorize`, `GET /api/v1/emergency-access/:id/summary`.
- **Involved Models**: `SosAlert`, `EmergencyAccessLog`, `Doctor`, `Patient`.
- **Involved Screens**: `WorkerDashboard.tsx`, `DoctorDashboard.tsx`, `EmergencyAccess.tsx`, `EmergencyAccessLog.tsx`.

### Journey F: Offline Caching & Background Synchronization
$$\text{Offline Mode} \longrightarrow \text{Local Mutation} \longrightarrow \text{Queued in Outbox} \longrightarrow \text{Connection Restored} \longrightarrow \text{Batch Sync} \longrightarrow \text{Conflict Resolution}$$
- **Implemented Steps**: Visual offline badge; simulated offline mode toggle; UI sync queue list; simulated retry button with spinner.
- **Missing Steps**: True browser storage engine (IndexedDB); network listener (`window.addEventListener('online')`); batch ingestion endpoint; conflict detection.
- **Broken Transitions**: Toggling "Offline" simply flips a boolean flag in `App.tsx` and shows static `PENDING_ITEMS`. Refreshing the browser resets the simulation.
- **Involved Endpoints**: Needed: `POST /api/v1/sync/batch`.
- **Involved Models**: `SyncRecord`, `Patient`, `Consultation`.
- **Involved Screens**: `OfflineMode.tsx`, `SyncCenter.tsx`.

---

## 9. Database Architecture Audit

### Model Inventory & Current Utilization

| Model | Table Name | Purpose | Actively Used by APIs? | Seeded Only? |
|---|---|---|---|---|
| **User** | `User` | User credentials, mobile number, role, PIN hash, status. | **YES** (`/api/v1/auth/*`) | Seeded with 10 demo accounts |
| **Facility** | `Facility` | HFR accredited healthcare centres (PHCs, CHCs, DHs). | NO | Seeded (7 facilities) |
| **Doctor** | `Doctor` | HPR verified doctor profiles, specialty, duty status. | NO | Seeded (3 doctors) |
| **Worker** | `Worker` | ASHA/ANM health workers, assigned village/sector. | NO | Seeded (3 workers) |
| **Patient** | `Patient` | Master patient index, Health ID, vitals, allergies. | NO | Seeded (5 patients) |
| **Consultation**| `Consultation`| Clinical encounters, vitals JSON, diagnoses, treatments.| NO | Seeded (3 consultations) |
| **AIAssessment**| `AIAssessment`| Clinical risk scores, abnormal vitals, recommendations. | NO | Seeded (2 assessments) |
| **Referral** | `Referral` | Inter-facility transfers, priority, status pipeline. | NO | Seeded (3 referrals) |
| **SosAlert** | `SosAlert` | Emergency alerts, locations, assigned doctor, timeouts. | NO | NO (Table empty) |
| **ConsentArtifact**| `ConsentArtifact`| ABDM consent artifacts, scopes, validity periods. | NO | Seeded (4 artifacts) |
| **EmergencyAccessLog**| `EmergencyAccessLog`| Immutable Break-Glass access logs. | NO | Seeded (3 logs) |
| **AuditLog** | `AuditLog` | Access audit trail for medical record access. | NO | Seeded (4 logs) |
| **SyncRecord** | `SyncRecord` | Outbox sync records for offline synchronization. | NO | Seeded (7 records) |

### Missing Models Required for Full Vision
1. **`MedicineInventory` / `FacilityStock`**: Tracks drug availability at PHCs (essential for Pillar 13).
2. **`DiagnosticTest` / `LabReport`**: Currently lab reports are embedded in patient UI; needs a dedicated table for test requests, attachments, and abnormal flags.
3. **`FollowUpSchedule`**: Currently stored as a string date on `Consultation`; needs dedicated recurrence, reminder timestamps, and missed-status flags.
4. **`Notification`**: Dispatched alerts, SMS transmission status, push tokens.
5. **`BreakGlassSession`**: Active 15-minute emergency tokens to invalidate expired sessions at database level.

### Potential Data Integrity & Conflict Risks
- **String Dates**: Fields like `date`, `time`, `registeredAt`, `started` are stored as plain text strings (`"31 Aug 2026"`) rather than `DateTime` or `Date`. This impedes range queries, timezone conversions, and automated sorting in PostgreSQL.
- **Duplicate Prevention**: `Patient.healthId` is properly enforced with a unique index. However, `phone` is non-unique on `Patient` because rural families often share a single mobile device. An index on `(phone, name)` is needed to prevent accidental duplicate patient creation.
- **Unstructured Vitals**: Stored as `Json` in `Consultation.vitals`. While flexible, range queries (e.g. finding all patients with `SpO2 < 90`) require PostgreSQL JSONB operators (`(vitals->>'spo2')::numeric < 90`).

---

## 10. API Layer Audit

### Implemented Endpoints

| Method | Endpoint | Auth Required? | Allowed Roles | Purpose | Database Action | Status |
|---|---|---|---|---|---|---|
| `GET` | `/api/health` | NO | ALL | System health diagnostics | `SELECT 1` via Prisma | **WORKING** (200 OK) |
| `POST`| `/api/v1/auth/send-otp` | NO | ALL | Validate phone & send OTP | None (In-memory store) | **WORKING** (200 OK) |
| `POST`| `/api/v1/auth/verify-otp` | NO | ALL | Verify OTP & issue JWT | `findUnique` / `create` on `User` | **WORKING** (200 OK) |
| `POST`| `/api/v1/auth/login-pin` | NO | ALL | Authenticate via 4-digit PIN | `findUnique` on `User` + bcrypt compare | **WORKING** (200 OK) |
| `GET` | `/api/v1/auth/me` | **YES** | ALL | Get active user profile | `findUnique` on `User` with relations | **WORKING** (200 OK) |
| `POST`| `/api/v1/auth/logout` | NO | ALL | Session termination | None (Stateless acknowledgment) | **WORKING** (200 OK) |

### Missing Endpoints Required for Core Flow
- **Patients**: `GET /api/v1/patients`, `POST /api/v1/patients`, `GET /api/v1/patients/:id`, `GET /api/v1/patients/:id/timeline`.
- **Consultations**: `POST /api/v1/consultations`, `PATCH /api/v1/consultations/:id/clinical-notes`.
- **AI Decision Support**: `POST /api/v1/ai/assess` (running inference or rule-based scoring).
- **Referrals**: `GET /api/v1/referrals`, `POST /api/v1/referrals`, `PATCH /api/v1/referrals/:id/status`.
- **Doctors & Rosters**: `GET /api/v1/facilities/:id/roster`, `PATCH /api/v1/doctors/duty-status`.
- **Emergency SOS**: `POST /api/v1/sos/alerts`, `POST /api/v1/sos/alerts/:id/acknowledge`, `POST /api/v1/sos/alerts/:id/decline`.
- **Break-Glass**: `POST /api/v1/emergency-access/authorize`, `GET /api/v1/emergency-access/:id/summary`.
- **Consent**: `GET /api/v1/consents`, `POST /api/v1/consents/grant`, `PATCH /api/v1/consents/:id/revoke`.
- **Admin**: `GET /api/v1/admin/dashboard-stats`.
- **Sync**: `POST /api/v1/sync/batch`.

---

## 11. Frontend Audit & Screen Connectivity

| Screen Component | Target Role | Currently Uses Real API? | Data Source | Connectivity Status |
|---|---|---|---|---|
| `LoginScreen.tsx` | All | NO | Local state | **MOCK** (Bypasses backend auth) |
| `WorkerDashboard.tsx` | Worker | NO | Static `PATIENTS`, `REFERRALS` in `src/data.ts` | **MOCK** |
| `PatientRegistration.tsx` | Worker | NO | Local React state (`useState`) | **MOCK** (Data lost on submit) |
| `PatientProfile.tsx` | Worker | NO | Hardcoded `PATIENTS[0]` in `src/data.ts` | **MOCK** |
| `HealthAssessment.tsx` | Worker | NO | Local state (`useState`) | **MOCK** (Does not write to DB) |
| `AIRiskAssessment.tsx` | Worker | NO | Static `AI_ASSESSMENTS` in `src/data.ts` | **MOCK** |
| `ReferralSystem.tsx` | Worker/Doc | NO | Static `REFERRALS` in `src/data.ts` | **MOCK** |
| `DoctorDashboard.tsx` | Doctor | NO | Static `PATIENTS`, `REFERRALS` in `src/data.ts` | **MOCK** |
| `DoctorPatientView.tsx` | Doctor | NO | Hardcoded `PATIENTS[1]` in `src/data.ts` | **MOCK** |
| `EmergencyAccess.tsx` | Doctor | NO | Hardcoded arrays & timers | **MOCK** |
| `EmergencyAccessLog.tsx` | Doctor/Admin| NO | Static `LOG_ENTRIES` array | **MOCK** |
| `PatientMobileDashboard.tsx`| Patient | NO | Hardcoded `FULL_HISTORY` in component | **MOCK** |
| `ConsentManagement.tsx` | Patient | NO | Static `CONSENT_ENTRIES` in `src/data.ts` | **MOCK** |
| `AccessRequest.tsx` | Patient | NO | Local state (`useState`) | **MOCK** |
| `AccessHistory.tsx` | Patient | NO | Static `AUDIT_LOG` in `src/data.ts` | **MOCK** |
| `AdminDashboard.tsx` | Admin | NO | Static `ADMIN_STATS` in `src/data.ts` | **MOCK** |
| `OfflineMode.tsx` | Worker | NO | Static `AVAILABLE_FEATURES` array | **MOCK** |
| `SyncCenter.tsx` | Worker | NO | Static `SYNC_RECORDS` in `src/data.ts` | **MOCK** |

---

## 12. Security Audit

| Security Domain | Classification | Current State in Repository | Required Remediation |
|---|---|---|---|
| **JWT Implementation** | IMPLEMENTED | Signed with `HS256`, 7-day expiration, bearer validation in `auth.ts`. | Store tokens in HTTP-only secure cookies or memory with refresh tokens. |
| **Password & PIN Hashing**| IMPLEMENTED | Handled via `bcryptjs` with salt factor 10. | Ensure all newly registered users hash PINs before writing to DB. |
| **Authentication Middleware**| IMPLEMENTED | `requireAuth` validates token and rejects unauthorized calls with 401. | Hook middleware to all new private routes. |
| **Role-Based Authorization** | PARTIAL | Backend `requireRole` exists; frontend bypasses via sidebar role switcher. | Remove demo role switcher; restrict route rendering to authenticated role. |
| **Consent Gate Enforcement** | MISSING | Patients can toggle consents in UI, but backend has no middleware checking active consent before returning records. | Create `requireConsent(patientId, requiredScope)` Express middleware. |
| **Audit Logging** | PARTIAL | Table and seed data exist; UI displays log. | Middleware must automatically log every patient read/write to `AuditLog`. |
| **Emergency Break-Glass** | PARTIAL | UI workflow designed with justifications; DB model exists. | Enforce 15-minute expiration via server-issued short-lived token. |
| **Input Validation** | IMPLEMENTED | Zod schemas enforce phone and OTP constraints on auth endpoints. | Create Zod schemas for patient registration, vitals, and referrals. |
| **CORS Policy** | IMPLEMENTED | Configured in `server/src/index.ts` allowing `8443`, `5173`, `3000`. | Keep restricted to frontend host. |
| **Secrets Management** | IMPLEMENTED | `.env` is ignored in `.gitignore`; `.env.example` provides templates. Secrets never committed. | Maintain strict hygiene; no hardcoded keys. |
| **SQL Injection Safety** | IMPLEMENTED | Prisma ORM uses parameterized queries natively. | Avoid raw SQL queries without parameterization. |
| **Sensitive Data in Bundle** | PARTIAL | Fake patient records in `src/data.ts` are bundled into the client build. | Delete or isolate `src/data.ts` once API integration is complete. |

---

## 13. Offline-First Architecture Audit

### Current Reality
- **Status: Only Designed / Scaffolded.**
- **No Local Persistence**: The frontend uses standard React `useState`. If the browser tab is refreshed or closed, all offline form inputs are immediately lost.
- **No Client Database**: No IndexedDB, Dexie.js, localforage, or SQLite integration exists in the repository.
- **No Automated Sync Queue**: The sync records on `SyncCenter.tsx` are hardcoded objects from `src/data.ts`. The "Sync Now" button merely triggers a 2-second `setTimeout`.
- **No Network State Listener**: The offline toggle is a manual UI switch in `App.tsx`; `navigator.onLine` and `window.addEventListener('online')` are not active.

### Target Architecture to Implement
1. **Storage**: Integrate **Dexie.js** (IndexedDB) on the frontend for offline caching of assigned village patients and outbox queue.
2. **Sync Protocol**: Implement `POST /api/v1/sync/batch` accepting client-generated UUIDs and timestamps.
3. **Idempotency**: Use client-side UUIDs as primary keys to ensure resubmitted transactions do not duplicate rows in PostgreSQL.
4. **Conflict Resolution**: Append-only clinical records (consultations and vitals never overwrite, only append). Last-Write-Wins (LWW) for patient demographic updates based on UTC timestamps.

---

## 14. AI Functionality Audit

### Current Reality
- **Status: Scaffolded / Decision Support Only.**
- **Zero Live Inference**: There is no machine learning model executing in the frontend or backend.
- **No Python / ONNX / LLM Runtime**: No Gemma, Qwen, XGBoost, or scikit-learn models are bundled or invoked via API.
- **Mock Assessments**: `AI_ASSESSMENTS` in `src/data.ts` and `AIAssessment` in PostgreSQL contain pre-written, static text strings generated during prototyping.
- **Decision Support Philosophy**: The system strictly obeys the principle of **AI-assisted decision support, NOT autonomous diagnosis**. The UI prominently features the `AIDisclaimer` component: *"AI Decision Support — Not a Final Diagnosis. The final medical decision must remain with the authorized healthcare professional."*

### Path to Implementation
1. **Phase A (Lightweight Rule-Based Scoring)**: Implement a clinical risk scoring engine in TypeScript evaluating vitals thresholds (SpO2 < 94%, BP > 160/100, HR > 100) and high-risk symptoms to dynamically generate risk levels.
2. **Phase B (Offline ML)**: Export an offline Logistic Regression / Decision Tree model to ONNX runtime for client-side execution in low-connectivity settings.
3. **Phase C (Server-Side LLM)**: Connect backend to a quantized Gemma-2B or Qwen-2.5-7B endpoint for longitudinal history summarization and referral draft generation.

---

## 15. ABDM & FHIR Interoperability Audit

### Current Reality
- **Status: Data Model / Scaffolding Only.**
- **No Sandbox Integration**: The repository does not make HTTP calls to ABDM Sandbox (abdm.gov.in) APIs. No client IDs, client secrets, or NHA encryption certs are configured.
- **Database Alignment**:
  - `Patient.healthId` and `Patient.abhaNumber` are modeled.
  - `Doctor.hprId` is modeled (`HPR-2024-00142`).
  - `Facility.hfrId` is modeled (`HFR-2024-00891`).
  - `ConsentArtifact` models HIP/HIU, data scope, and expiry dates.
- **No FHIR Bundling**: Records are stored in native relational format, not serialized into HL7 FHIR R4 JSON resources (`Bundle`, `Patient`, `Observation`, `Condition`, `MedicationRequest`).
- **No eSanjeevani**: No telemedicine integration exists.

---

## 16. Phased Implementation Roadmap

Based purely on actual repository state, the development must proceed through four logical phases:

```
+-------------------------------------------------------------------------+
| PHASE 1: FOUNDATION (COMPLETED)                                         |
| - Native PostgreSQL 18 setup on Windows port 5432                       |
| - Prisma schema, migration (20260916105209_init), database seeding     |
| - Express + TypeScript server startup, healthcheck, JWT/RBAC auth APIs  |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| PHASE 2: FRONTEND AUTH & API CLIENT INTEGRATION (NEXT STEP)             |
| - Create Axios/fetch API client with Bearer token interceptor           |
| - Create React AuthContext and replace mock role switcher               |
| - Wire LoginScreen.tsx to /api/v1/auth/send-otp and /verify-otp         |
| - Implement ProtectedRoute guards by user role                          |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| PHASE 3: CORE CLINICAL & REFERRAL REST APIS (P0 WORKFLOW)               |
| - Patient CRUD & Health ID generation APIs (/api/v1/patients)           |
| - Consultation & vitals intake APIs (/api/v1/consultations)             |
| - Referral management & status pipeline APIs (/api/v1/referrals)        |
| - Doctor roster & duty status endpoints (/api/v1/doctors)               |
| - Replace static data imports in ASHA and Doctor dashboard screens      |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| PHASE 4: ADVANCED CAPABILITIES & SIH HARDENING (P1/P2)                  |
| - Emergency Break-Glass token issuance and auto-audit logging           |
| - Real-time SOS dispatch via WebSockets / Server-Sent Events (SSE)      |
| - IndexedDB local caching (Dexie.js) and offline batch sync protocol    |
| - Dynamic clinical risk scoring engine (vitals thresholds + decision tree)|
| - FHIR R4 JSON export serialization for consultations                   |
+-------------------------------------------------------------------------+
```

---

## 17. Prioritized Implementation Backlog

### P0: Required for Core End-to-End Demo (Immediate Next Work)

#### Task P0-1: Frontend API Service Layer & Axios Client
- **Why Needed**: Frontend has no mechanism to communicate with the Express server.
- **Affected Files**: `src/services/api.ts` [NEW], `package.json` [ADD `axios`].
- **Dependencies**: None.
- **Expected Output**: Axios instance configured with base URL `http://localhost:5000/api/v1`, bearer token attachment from storage, and error interceptors.
- **Complexity**: Low.

#### Task P0-2: Frontend Authentication Context & Real Login Wiring
- **Why Needed**: `LoginScreen.tsx` currently bypasses security and uses mock state.
- **Affected Files**: `src/contexts/AuthContext.tsx` [NEW], `src/screens/LoginScreen.tsx`, `src/App.tsx`.
- **Dependencies**: P0-1.
- **Expected Output**: Users log in via OTP/PIN, JWT stored securely, authenticated role loads appropriate dashboard, mock role switcher disabled.
- **Complexity**: Medium.

#### Task P0-3: Patient Registry REST APIs & Registration Wiring
- **Why Needed**: ASHA registration form data is currently discarded on submission.
- **Affected Files**: `server/src/controllers/patient.controller.ts` [NEW], `server/src/routes/patient.routes.ts` [NEW], `src/screens/PatientRegistration.tsx`, `src/screens/WorkerDashboard.tsx`.
- **Dependencies**: P0-1, P0-2.
- **Expected Output**: `GET /api/v1/patients` lists real DB patients; `POST /api/v1/patients` creates patient and generates unique Health ID; dashboard displays real counts.
- **Complexity**: Medium.

#### Task P0-4: Consultation & Vitals Intake APIs
- **Why Needed**: Health assessments recorded by ASHA are not persisted.
- **Affected Files**: `server/src/controllers/consultation.controller.ts` [NEW], `server/src/routes/consultation.routes.ts` [NEW], `src/screens/HealthAssessment.tsx`.
- **Dependencies**: P0-3.
- **Expected Output**: ASHA submits symptoms and vitals; recorded in `Consultation` table and visible on patient profile.
- **Complexity**: Medium.

#### Task P0-5: Doctor Clinical Diagnosis & Prescription API
- **Why Needed**: Doctor cannot save diagnoses or prescriptions to patient records.
- **Affected Files**: `server/src/controllers/consultation.controller.ts`, `src/screens/DoctorPatientView.tsx`.
- **Dependencies**: P0-4.
- **Expected Output**: Doctor submits diagnosis/prescription; updates consultation in PostgreSQL and attributes clinician name and HPR ID.
- **Complexity**: Medium.

#### Task P0-6: Referral Management Endpoints
- **Why Needed**: Inter-facility transfers are currently client-side only.
- **Affected Files**: `server/src/controllers/referral.controller.ts` [NEW], `server/src/routes/referral.routes.ts` [NEW], `src/screens/ReferralSystem.tsx`, `src/screens/DoctorDashboard.tsx`.
- **Dependencies**: P0-3.
- **Expected Output**: Referrals can be created, viewed by destination PHC doctor, and transitioned through status pipeline.
- **Complexity**: Medium.

---

### P1: Required for Strong SIH Prototype

#### Task P1-1: Doctor Duty Status & Facility Roster API
- **Why Needed**: Doctor availability toggle in `DoctorDashboard.tsx` does not update DB.
- **Affected Files**: `server/src/controllers/doctor.controller.ts` [NEW], `src/screens/DoctorDashboard.tsx`, `src/screens/WorkerDashboard.tsx`.
- **Complexity**: Low.

#### Task P1-2: Emergency Break-Glass Session Token & Audit Logging
- **Why Needed**: Emergency access timer is client-only; does not enforce security or log access.
- **Affected Files**: `server/src/controllers/emergency.controller.ts` [NEW], `src/screens/EmergencyAccess.tsx`, `src/screens/EmergencyAccessLog.tsx`.
- **Complexity**: Medium.

#### Task P1-3: Real-Time SOS Dispatch (WebSockets / SSE)
- **Why Needed**: SOS triggered by ASHA or patient must alert on-duty doctors across network.
- **Affected Files**: `server/src/lib/socket.ts` [NEW], `server/src/controllers/sos.controller.ts` [NEW], `src/screens/WorkerDashboard.tsx`, `src/screens/DoctorDashboard.tsx`.
- **Complexity**: High.

#### Task P1-4: Dynamic Rule-Based Risk Evaluation Engine
- **Why Needed**: AI Risk Assessment screen currently displays static pre-computed mock data.
- **Affected Files**: `server/src/services/riskAssessment.service.ts` [NEW], `src/screens/AIRiskAssessment.tsx`.
- **Complexity**: Medium.

#### Task P1-5: Consent Validation Middleware & Patient Consent Portal
- **Why Needed**: Consent grants and revocations in UI do not gate record access in backend.
- **Affected Files**: `server/src/middleware/consent.ts` [NEW], `server/src/controllers/consent.controller.ts` [NEW], `src/screens/ConsentManagement.tsx`.
- **Complexity**: Medium.

---

### P2: Advanced & Differentiating Features

#### Task P2-1: IndexedDB Offline Caching & Sync Queue (Dexie.js)
- **Why Needed**: Rural health workers operate in offline village environments.
- **Affected Files**: `src/services/offlineDb.ts` [NEW], `src/services/syncEngine.ts` [NEW], `server/src/controllers/sync.controller.ts` [NEW].
- **Complexity**: High.

#### Task P2-2: FHIR R4 Bundle Serializer
- **Why Needed**: Conformance to ABDM / national digital health interoperability standards.
- **Affected Files**: `server/src/services/fhir.service.ts` [NEW].
- **Complexity**: Medium.

#### Task P2-3: District Admin Real-Time Metrics Aggregator
- **Why Needed**: Admin dashboard currently reads static constants.
- **Affected Files**: `server/src/controllers/admin.controller.ts` [NEW], `src/screens/AdminDashboard.tsx`.
- **Complexity**: Low.

---

### P3: Production Hardening & Future Vision
- Automated Unit & Integration Testing (Vitest, Supertest).
- ABDM M1/M2/M3 Sandbox OAuth gateway connectivity.
- Edge ML inference (ONNX runtime for local risk scoring).
- OCR processing for paper medical records.
- Multilingual vernacular voice input via Web Speech API / Whisper.

---

## 18. Known Limitations of Current Implementation

1. **Frontend-Backend Disconnection**: The Express server is operational on port 5000 with native PostgreSQL, but the React frontend remains 100% disconnected, consuming static arrays in `src/data.ts`.
2. **Client-Side Authorization Bypasses**: Users can switch between Patient, ASHA, Doctor, and Admin views in the browser without re-authentication.
3. **Transient State**: Actions taken in forms (registering a patient, adding a diagnosis, revoking consent) are lost as soon as the user navigates away or refreshes.
4. **Static AI**: Clinical risk assessments are hardcoded strings; no dynamic vital signs evaluation occurs.
5. **No True Offline Capability**: Offline mode is a visual simulation with no local database or sync engine.

---

## 19. Important Architecture Decisions

1. **Native PostgreSQL on Windows**: All development connects directly to PostgreSQL 18 running as a native Windows service on `localhost:5432`. Docker is completely inactive for local development.
2. **No Framework Replacement**: The frontend remains strictly **React + Vite**. Do NOT introduce Flutter, Next.js, or React Native.
3. **No ORM Replacement**: The backend remains strictly **Prisma ORM** with PostgreSQL.
4. **AI As Decision Support**: AI outputs must always be framed as clinical decision support for healthcare professionals, never autonomous diagnostic decisions.
5. **Unified Data Architecture**: All migrations and models must flow through `server/prisma/schema.prisma`.

---

## 20. Rules for Future AI Coding Agents

When working on the RuralCare codebase, every future AI coding assistant and human developer **MUST STRICTLY ADHERE** to these rules:

1. **DO NOT REINTRODUCE DOCKER**: Local development uses native PostgreSQL on Windows at `localhost:5432`. Do not recommend, run, or mandate Docker containers.
2. **PRESERVE TECH STACK**: Frontend = React + Vite. Backend = Node.js + Express + TypeScript. Database = PostgreSQL + Prisma ORM. Do not replace or refactor these core technologies.
3. **NEVER EXPOSE SECRETS**: Never commit `.env` files. Never hardcode database passwords, JWT secrets, or API keys in source code. Use sanitized `.env.example` templates.
4. **DO NOT TOUCH `.git/index`**: Never execute destructive git commands or modify internal git files.
5. **INSPECT BEFORE CODING**: Always inspect existing models in `server/prisma/schema.prisma` and frontend types in `src/types.ts` before creating new files or schemas. Avoid creating duplicate functionality.
6. **FOLLOW THE 5-TIER FLOW**: Every new full-stack feature must follow:
   $$\text{React Screen} \longrightarrow \text{API Service (Axios)} \longrightarrow \text{Express Controller} \longrightarrow \text{Prisma Query} \longrightarrow \text{PostgreSQL Table}$$
7. **NO DEMO OVERWRITES WITHOUT BACKWARD COMPATIBILITY**: When connecting screens to real APIs, ensure that if the API is offline or returning empty arrays during development, the UI fails gracefully with proper loading and error states.
8. **MAINTAIN AI BOUNDARIES**: Never describe AI as autonomous diagnosis. Always include non-diagnostic disclaimers and require clinician sign-off.
9. **PRESERVE RBAC & PERMISSION LABELS**: Maintain visual permission badges (`CLINICIAN ONLY`, `RECORDED BY ASHA`, `VIEW ONLY`) and enforce them via Express `requireRole` middleware.
10. **VERIFY BUILDS**: After making code modifications, always verify that `npm run build` succeeds in `server/` (zero TypeScript errors) and the Vite frontend remains operational.

