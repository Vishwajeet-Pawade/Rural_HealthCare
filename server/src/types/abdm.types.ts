// ============================================================================
// ABDM Types & Interfaces (SIH 26133 Mock Registry & Future Sandbox Integration)
// ============================================================================

export type ABDMMode = 'mock' | 'sandbox' | 'production';

// ─── HFR (Health Facility Registry) Types ─────────────────────────────────────

export interface HFRFacilityRecord {
  id: string;
  hfrId: string;
  facilityName: string;
  facilityType: string;
  subType?: string | null;
  ownership: string;
  state: string;
  district: string;
  subDistrict?: string | null;
  village?: string | null;
  pincode: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  contactPhone: string;
  contactEmail: string;
  services: string[];
  specialties: string[];
  hasEmergency: boolean;
  operationalStatus: string;
  openingHours: string;
  registryStatus: string;
  isMock: boolean;
  linkedFacilityId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HFRSearchQuery {
  q?: string;
  facilityType?: string;
  district?: string;
  state?: string;
  hasEmergency?: boolean;
}

// ─── HPR (Healthcare Professionals Registry) Types ───────────────────────────

export interface HPRProfessionalRecord {
  id: string;
  hprId: string;
  fullName: string;
  gender: string;
  professionalType: string;
  qualification: string;
  specialties: string[];
  registrationNumber: string;
  registrationCouncil: string;
  state: string;
  district: string;
  primaryHfrId?: string | null;
  primaryFacilityName?: string | null;
  languages: string[];
  contactPhone: string;
  contactEmail: string;
  verificationStatus: string;
  isMock: boolean;
  linkedDoctorId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HPRSearchQuery {
  q?: string;
  specialty?: string;
  district?: string;
  facilityHfrId?: string;
  state?: string;
}

// ─── Worker Directory Types (Operational, distinct from HPR) ─────────────────

export interface WorkerDirectoryRecord {
  id: string;
  workerCode: string;
  name: string;
  workerType: string;
  assignedVillage: string;
  subCentre: string;
  parentPhcName: string;
  parentPhcHfrId: string;
  district: string;
  state: string;
  pincode: string;
  contactPhone: string;
  languages: string[];
  assignedPopulation: number;
  active: boolean;
  latitude?: number | null;
  longitude?: number | null;
  linkedWorkerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerSearchQuery {
  q?: string;
  village?: string;
  workerType?: string;
  district?: string;
}

// ─── ABHA Identity Profile Types ─────────────────────────────────────────────

export interface ABHAProfileRecord {
  id: string;
  abhaAddress: string;
  abhaNumber: string;
  fullName: string;
  fullNameHi?: string | null;
  gender: string;
  dob: string;
  dayOfBirth?: string | null;
  monthOfBirth?: string | null;
  yearOfBirth?: string | null;
  mobile: string;
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  authMethods: string[];
  status: string;
  isMock: boolean;
  linkedPatientId?: string | null;
  linkedHealthId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Consent Artifact Types ──────────────────────────────────────────────────

export interface CreateConsentInput {
  patientId: string;
  grantedTo: string;
  role: string;
  organization: string;
  facilityId?: string;
  purpose: string;
  dataScope: string[];
  expiresAt?: string;
  hiuId?: string;
  hipId?: string;
}

// ─── HL7 FHIR R4 Minimal Types ───────────────────────────────────────────────

export interface FHIRIdentifier {
  system: string;
  value: string;
  use?: 'official' | 'usual' | 'secondary';
}

export interface FHIRCoding {
  system: string;
  code: string;
  display: string;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRReference {
  reference: string;
  display?: string;
}

export interface FHIRMeta {
  profile?: string[];
  versionId?: string;
  lastUpdated?: string;
}

export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  meta: FHIRMeta;
  identifier: FHIRIdentifier[];
  active: boolean;
  name: Array<{
    use?: string;
    text: string;
    family?: string;
    given?: string[];
  }>;
  telecom: Array<{
    system: 'phone' | 'email';
    value: string;
    use?: 'home' | 'work' | 'mobile';
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address: Array<{
    use?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country: string;
  }>;
}

export interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  meta: FHIRMeta;
  identifier: FHIRIdentifier[];
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  class: FHIRCoding;
  subject: FHIRReference;
  participant?: Array<{
    type?: FHIRCodeableConcept[];
    individual: FHIRReference;
  }>;
  period: {
    start: string;
    end?: string;
  };
  reasonCode?: FHIRCodeableConcept[];
  serviceProvider?: FHIRReference;
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  meta: FHIRMeta;
  status: 'preliminary' | 'final' | 'amended';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  component?: Array<{
    code: FHIRCodeableConcept;
    valueQuantity?: {
      value: number;
      unit: string;
      system?: string;
      code?: string;
    };
    valueString?: string;
  }>;
}

export interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  meta: FHIRMeta;
  clinicalStatus: FHIRCodeableConcept;
  verificationStatus: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  severity?: FHIRCodeableConcept;
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  recordedDate: string;
}

export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  meta: FHIRMeta;
  status: 'active' | 'completed' | 'cancelled';
  intent: 'order' | 'proposal' | 'plan';
  medicationCodeableConcept: FHIRCodeableConcept;
  subject: FHIRReference;
  authoredOn: string;
  requester?: FHIRReference;
  dosageInstruction?: Array<{
    text: string;
  }>;
}

export interface FHIRServiceRequest {
  resourceType: 'ServiceRequest';
  id: string;
  meta: FHIRMeta;
  status: 'draft' | 'active' | 'completed' | 'revoked';
  intent: 'order' | 'original-order' | 'reflex-order';
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  authoredOn: string;
  requester?: FHIRReference;
  performer?: FHIRReference[];
  reasonCode?: FHIRCodeableConcept[];
}

export interface FHIRBundleEntry {
  fullUrl: string;
  resource: any;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  meta: FHIRMeta;
  type: 'document' | 'collection' | 'transaction' | 'searchset';
  timestamp: string;
  total?: number;
  entry: FHIRBundleEntry[];
}

