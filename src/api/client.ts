// ============================================================================
// RuralCare API Client Layer (SIH 26133)
// Communicates with the Node.js + Express backend on http://localhost:5000/api/v1
// ============================================================================

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ path: string; message: string }>;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();

    if (!res.ok) {
      const errMsg =
        json.message ||
        json.errors?.[0]?.message ||
        `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return json;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Network error or server unreachable. Please verify the backend is running.');
  }
}

// ─── ABHA Services ───────────────────────────────────────────────────────────

export interface AbhaVerificationResult {
  exists: boolean;
  verified: boolean;
  status?: string;
  abhaAddress?: string;
  abhaNumber?: string;
  fullName?: string;
  gender?: string;
  dob?: string;
  isMock?: boolean;
  message?: string;
}

export async function verifyAbha(abhaAddress: string): Promise<AbhaVerificationResult> {
  const res = await request<ApiResponse<AbhaVerificationResult>>('/abdm/mock/abha/verify', {
    method: 'POST',
    body: JSON.stringify({ abhaAddress }),
  });
  return res.data || { exists: false, verified: false };
}

export async function getAbhaProfile(identifier: string) {
  const res = await request<ApiResponse>('/abdm/mock/abha/' + encodeURIComponent(identifier));
  return res.data;
}

// ─── HPR Services ────────────────────────────────────────────────────────────

export interface HprProfessionalResult {
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
  primaryHfrId?: string;
  primaryFacilityName?: string;
  verificationStatus: string;
  isMock: boolean;
}

export async function verifyHpr(hprId: string): Promise<HprProfessionalResult> {
  const res = await request<ApiResponse<HprProfessionalResult>>('/abdm/mock/hpr/professionals/' + encodeURIComponent(hprId));
  return res.data!;
}

// ─── Facility Services ───────────────────────────────────────────────────────

export interface FacilityItem {
  id: string;
  hfrId: string;
  facilityName: string;
  facilityType: string;
  district: string;
  state: string;
  hasEmergency: boolean;
}

export async function getFacilities(): Promise<FacilityItem[]> {
  const res = await request<{ data: FacilityItem[] }>('/abdm/mock/hfr/facilities');
  return res.data || [];
}

// ─── Patient Registration ────────────────────────────────────────────────────

export interface PatientRegistrationPayload {
  name: string;
  nameHi?: string;
  dob: string;
  gender: 'M' | 'F' | 'O' | 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  address?: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  abhaAddress?: string;
  healthWorkerName?: string;
  consent: {
    granted: boolean;
    purpose?: string;
    dataScope?: string[];
  };
}

export interface PatientRegistrationResult {
  patient: {
    id: string;
    healthId: string;
    name: string;
    nameHi?: string;
    dob: string;
    age: number;
    gender: string;
    phone: string;
    village: string;
    district: string;
    state: string;
    abhaAddress?: string;
    abhaNumber?: string;
    abhaSource: 'existing' | 'mock-created';
    registeredAt: string;
    consentStatus: string;
  };
}

export async function registerPatient(payload: PatientRegistrationPayload): Promise<PatientRegistrationResult> {
  const res = await request<ApiResponse<PatientRegistrationResult>>('/patients/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data!;
}

// ─── Doctor Registration ─────────────────────────────────────────────────────

export interface DoctorRegistrationPayload {
  fullName: string;
  phone: string;
  pin: string;
  hprId: string;
  facilityId: string;
  specialty?: string;
}

export interface DoctorRegistrationResult {
  token: string;
  user: {
    id: string;
    phone: string;
    role: string;
    fullName: string;
  };
  doctor: {
    id: string;
    hprId: string;
    name: string;
    specialty: string;
    facilityId: string;
    facilityName: string;
    qualification: string;
    registrationNumber: string;
    registrationCouncil: string;
    verificationStatus: string;
  };
}

export async function registerDoctor(payload: DoctorRegistrationPayload): Promise<DoctorRegistrationResult> {
  const res = await request<ApiResponse<DoctorRegistrationResult>>('/doctors/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data!;
}

// ─── Worker / ASHA Registration ───────────────────────────────────────────────

export interface WorkerRegistrationPayload {
  fullName: string;
  phone: string;
  pin: string;
  workerType?: 'ASHA' | 'ANM' | 'CHO' | 'Health Worker';
  village: string;
  subCentre?: string;
  assignedPhc?: string;
  district?: string;
  state?: string;
}

export interface WorkerRegistrationResult {
  token: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION';
  user: {
    id: string;
    phone: string;
    fullName: string;
  };
  worker: {
    id: string;
    workerCode: string;
    name: string;
    role: string;
    village: string;
    subCentre: string;
    assignedPhc: string;
    district: string;
    state: string;
    status: string;
  };
}

export async function registerWorker(payload: WorkerRegistrationPayload): Promise<WorkerRegistrationResult> {
  const res = await request<ApiResponse<WorkerRegistrationResult>>('/workers/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data!;
}

// ─── Patients Endpoints ───────────────────────────────────────────────────────

export async function getPatients(search?: string): Promise<any[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await request<ApiResponse<{ patients: any[] }>>(`/patients${query}`);
  return res.data?.patients || [];
}

export async function getPatientByHealthId(healthId: string): Promise<any> {
  const res = await request<ApiResponse<{ patient: any; consultations: any[]; referrals: any[] }>>(`/patients/${encodeURIComponent(healthId)}`);
  return res.data;
}

// ─── Consultations Endpoints ─────────────────────────────────────────────────

export interface CreateConsultationPayload {
  patientId: string;
  workerId?: string;
  workerName?: string;
  doctorId?: string;
  doctorName?: string;
  facilityName?: string;
  symptoms?: string[];
  vitals?: Record<string, any>;
  diagnosis?: string;
  treatment?: string;
  prescription?: string[];
  notes?: string;
  riskLevel?: 'low' | 'moderate' | 'high' | 'critical';
  referralStatus?: 'pending' | 'accepted' | 'in-consultation' | 'referred' | 'completed';
  followUpDate?: string;
}

export async function getConsultations(patientId?: string): Promise<any[]> {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const res = await request<ApiResponse<{ consultations: any[] }>>(`/consultations${query}`);
  return res.data?.consultations || [];
}

export async function createConsultation(payload: CreateConsultationPayload): Promise<any> {
  const res = await request<ApiResponse<{ consultation: any; aiAssessment?: any }>>('/consultations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

// ─── Referrals Endpoints ──────────────────────────────────────────────────────

export interface CreateReferralPayload {
  patientId: string;
  consultationId?: string;
  fromWorkerName?: string;
  toFacilityName: string;
  reason: string;
  priority?: 'routine' | 'urgent' | 'emergency';
  riskLevel?: 'low' | 'moderate' | 'high' | 'critical';
  aiSummary?: string;
}

export async function getReferrals(patientId?: string): Promise<any[]> {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const res = await request<ApiResponse<{ referrals: any[] }>>(`/referrals${query}`);
  return res.data?.referrals || [];
}

export async function createReferral(payload: CreateReferralPayload): Promise<any> {
  const res = await request<ApiResponse<{ referral: any }>>('/referrals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateReferralStatus(id: string, status: string, notes?: string): Promise<any> {
  const res = await request<ApiResponse<{ referral: any }>>(`/referrals/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
  return res.data;
}

// ─── Medicines / Inventory Endpoints ──────────────────────────────────────────

export async function getMedicines(search?: string, category?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await request<ApiResponse<{ medicines: any[] }>>(`/medicines${qs}`);
  return res.data?.medicines || [];
}

// ─── AI Risk Assessments Endpoints ───────────────────────────────────────────

export async function getAiAssessments(patientId?: string): Promise<any[]> {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const res = await request<ApiResponse<{ assessments: any[] }>>(`/ai${query}`);
  return res.data?.assessments || [];
}

// ─── Doctor & Worker Profiles & Duty Status ───────────────────────────────────

export async function getDoctors(): Promise<any[]> {
  const res = await request<ApiResponse<{ doctors: any[] }>>('/doctors');
  return res.data?.doctors || [];
}

export async function updateDoctorDutyStatus(id: string, dutyStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE'): Promise<any> {
  const res = await request<ApiResponse<{ doctor: any }>>(`/doctors/${encodeURIComponent(id)}/duty-status`, {
    method: 'PATCH',
    body: JSON.stringify({ dutyStatus }),
  });
  return res.data;
}

// ─── Dashboards Endpoints ─────────────────────────────────────────────────────

export async function getAdminDashboardData(): Promise<any> {
  const res = await request<ApiResponse<any>>('/dashboards/admin');
  return res.data;
}

export async function getWorkerDashboardData(): Promise<any> {
  const res = await request<ApiResponse<any>>('/dashboards/worker');
  return res.data;
}

export async function getDoctorDashboardData(): Promise<any> {
  const res = await request<ApiResponse<any>>('/dashboards/doctor');
  return res.data;
}

export async function getPatientDashboardData(healthId: string): Promise<any> {
  const res = await request<ApiResponse<any>>(`/dashboards/patient/${encodeURIComponent(healthId)}`);
  return res.data;
}


