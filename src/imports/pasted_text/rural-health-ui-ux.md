Design a complete modern, professional and trustworthy UI/UX for an **offline-first rural healthcare platform for India** developed for Smart India Hackathon (SIH) problem statement **26133**.

The platform connects **patients, rural health workers/ASHA workers, doctors/PHC staff and administrators** through a secure digital healthcare system.

The design must feel suitable for a real government/public-health deployment — simple enough for rural health workers with limited technical experience, but modern and professional enough for doctors and administrators.

## CORE CONCEPT

Create a **Secure Unique Patient Health Registry** where every patient receives a unique Patient Health ID.

Example:
RHC-2026-8F4K92

One patient should have one longitudinal digital health record containing authorized medical information such as:

* Patient profile
* Previous diagnoses
* Symptoms
* Medical history
* Allergies
* Medications
* Treatments
* Lab/test reports
* Doctor consultations
* Referrals
* Follow-ups
* Vaccination/immunization records
* Previous AI-assisted assessments
* Uploaded medical documents

The Patient ID itself must NOT automatically grant access.

Use a **consent + role-based access-control system**.

Different users should only see information they are authorized to access.

Include an **audit trail** showing who accessed a patient's information, what was accessed, when, and for what purpose.

## USER ROLES

Design separate experiences for:

1. Patient
2. Rural Health Worker / ASHA Worker
3. Doctor / PHC Staff
4. Administrator

## REQUIRED SCREENS

### 1. Login / Role Selection

Create a clean login screen with:

* Role selection
* Mobile number / username
* OTP authentication
* PIN/password option
* Language selection
* Accessibility option
* Simple rural-friendly interface

---

### 2. Health Worker Dashboard

Show:

* Today's consultations
* Registered patients
* Pending follow-ups
* High-risk patients
* Pending referrals
* Recent patients
* Quick "Register Patient"
* Quick "New Assessment"
* Search Patient by Health ID
* Offline/online status
* Last synchronization time

Make this the primary operational screen.

---

### 3. Patient Registration

Create a simple multi-step registration workflow.

Collect only necessary information:

* Name
* Age/date of birth
* Gender
* Contact information
* Address/village
* Emergency contact
* Basic medical information

After registration:

Display:

**Unique Patient Health ID**

with options:

* Copy ID
* Generate QR
* Share ID securely
* Print/download patient card

---

### 4. Patient Profile

Create a comprehensive patient profile screen.

Header:

* Patient name
* Unique Health ID
* Age
* Gender
* Blood group if available
* Emergency information
* Consent status

Sections/tabs:

* Overview
* Medical History
* Diagnoses
* Medications
* Tests & Reports
* Consultations
* Referrals
* Follow-ups
* Documents
* Access History

Use a clear chronological **health timeline** showing previous consultations, diagnoses, treatments and referrals.

---

### 5. New Health Assessment

Design a guided assessment interface for health workers.

Include:

* Current symptoms
* Duration
* Temperature
* Blood pressure
* Heart rate
* SpO2
* Other relevant vitals
* Existing conditions
* Current medications
* Allergies
* Relevant observations

Provide clear validation and simple form controls.

The interface should be usable on low-end Android devices.

---

### 6. AI-Assisted Risk Assessment

Create a dedicated AI decision-support screen.

Show:

**Risk Level**

* Low
* Moderate
* High
* Critical

Show:

* Symptoms considered
* Relevant patient history considered
* Abnormal vitals
* Important risk factors
* AI-generated reasoning/explanation
* Recommended next action

Example:

**Recommended Action**
"Refer patient to PHC for further clinical evaluation."

Clearly label:

**AI Decision Support — Not a Final Diagnosis**

The final medical decision must remain with the authorized healthcare professional.

---

### 7. Referral System

Create a referral workflow:

Health Worker → AI-assisted assessment → Doctor/PHC → Referral decision → Follow-up

Show:

* Referral reason
* Patient information
* Risk level
* Relevant history
* Current vitals
* AI assessment
* Destination PHC/hospital
* Priority
* Referral status

Statuses:

* Pending
* Accepted
* In Consultation
* Referred
* Completed
* Follow-up Required

---

### 8. Doctor / PHC Dashboard

Create a professional clinical dashboard containing:

* New referrals
* High-risk patients
* Pending consultations
* Today's patients
* Follow-ups
* Recent cases
* Search by Patient Health ID

Allow doctors to open an authorized patient record.

---

### 9. Doctor Patient View

Show:

* Patient profile
* Medical history
* Previous diagnoses
* Current symptoms
* Vitals
* Medications
* Lab reports
* Previous consultations
* Referral information
* AI assessment
* Follow-up history

Provide actions:

* Add diagnosis
* Add treatment
* Add prescription/medicine record
* Request tests
* Refer patient
* Schedule follow-up

---

### 10. Consent & Permission Management

Create a dedicated privacy/consent interface.

Show:

**Who currently has access to my medical records?**

Examples:

Health Worker — Current consultation
Doctor — Clinical consultation
PHC — Referral management

Allow:

* Grant access
* Revoke access
* Temporary access
* Select what information can be shared
* Set access duration

Show clear consent states:

🟢 Granted
🟡 Temporary
🔴 Revoked

---

### 11. Secure Access Request

When a healthcare worker tries to access another patient's record, display:

**Access Request**

"Health Worker XYZ is requesting access to your medical history."

Show:

* Requesting person
* Organization/PHC
* Purpose
* Data requested
* Duration

Buttons:

**Allow Access**

**Deny**

Use a simple OTP/PIN/QR-based authorization concept.

---

### 12. Patient Privacy & Access History

Create:

**"Who accessed my records?"**

Show an audit timeline:

Doctor XYZ
PHC ABC
31 Aug 2026, 14:32
Viewed medical history

Health Worker XYZ
Village Health Centre
31 Aug 2026, 11:15
Updated consultation

Include filters for:

* Date
* User
* Organization
* Action

---

### 13. Offline Mode

Design a dedicated offline experience.

Clearly display:

**OFFLINE MODE**

The application should still allow:

* Patient registration
* Viewing authorized cached records
* Recording consultations
* Recording vitals
* Creating referrals
* Updating follow-ups

Show:

**Pending Sync: 7 records**

When connectivity returns:

**Synchronizing...**

Then:

**All records synchronized ✓**

Make offline status highly visible but not disruptive.

---

### 14. Synchronization Center

Create a sync-management screen showing:

* Last successful synchronization
* Pending records
* Successfully synchronized records
* Failed synchronization
* Retry button
* Conflict resolution status

Use clear states:

**Synced ✓**

**Pending ↻**

**Failed !**

---

### 15. Patient Mobile Dashboard

Design a simplified patient-facing mobile interface.

Show:

* My Health ID
* My medical records
* Recent consultations
* Medicines
* Upcoming follow-up
* Referrals
* Reports
* Consent & privacy
* Access history

Include a **QR code for secure identification/access authorization**.

---

### 16. Administrator Dashboard

Create an analytics dashboard showing:

* Total registered patients
* Active health workers
* Consultations
* Referrals
* High-risk cases
* Pending follow-ups
* PHC activity
* Village/region trends
* Common symptoms/disease trends
* System synchronization status

Use charts and cards but keep the interface clean.

---

## OFFLINE-FIRST DESIGN PRINCIPLES

The entire application must visually communicate that it works in low-connectivity rural environments.

Include:

* Offline indicator
* Sync status
* Pending data indicator
* Local data availability
* Retry synchronization
* Minimal-data workflows

Avoid interfaces that depend on continuous Internet connectivity.

---

## SECURITY & PRIVACY DESIGN

Make security visible throughout the UI.

Use:

* Role-based access
* Patient consent
* Temporary access
* Access revocation
* Authentication
* Audit logs
* Encrypted-data indicators
* Session timeout
* Privacy notifications

Do not expose sensitive medical information unnecessarily.

---

## DESIGN SYSTEM

Use a clean healthcare design language.

Style:

* Modern
* Minimal
* Trustworthy
* Accessible
* Government/public-health appropriate
* Mobile-first
* Responsive
* High readability
* Large touch targets
* Clear typography
* Simple icons
* Minimal visual clutter

Use a professional healthcare color palette with strong contrast.

Support:

* Light mode
* Optional dark mode
* Accessibility-friendly typography
* Hindi + English language toggle

Design for:

**Android mobile + tablet + desktop**

Prioritize mobile/tablet for rural health workers and desktop/tablet for doctors and administrators.

## IMPORTANT UX REQUIREMENTS

Do NOT make the interface look like a generic hospital management system.

The UI should communicate these unique concepts clearly:

1. **One patient → One secure longitudinal health record**
2. **Unique Patient Health ID**
3. **Patient-controlled consent**
4. **Role-based access**
5. **Access audit trail**
6. **AI-assisted risk assessment**
7. **Human/doctor remains the final decision maker**
8. **Offline-first operation**
9. **Automatic secure synchronization**
10. **Referral + follow-up continuity**

Create a consistent design system with reusable:

* Buttons
* Cards
* Forms
* Tables
* Patient ID components
* Risk badges
* Consent badges
* Status indicators
* Timeline components
* Notifications
* Modal dialogs
* Navigation
* Empty/error/loading states

Create realistic sample Indian rural healthcare data rather than placeholder text.

Focus on **clarity, usability, trust, privacy and accessibility** rather than excessive visual decoration.

The final Figma file should present a coherent end-to-end patient journey:

**Registration → Unique Health ID → Consultation → Medical Record → AI Risk Assessment → Consent → Referral → Doctor Review → Treatment → Follow-up → Longitudinal Record**
