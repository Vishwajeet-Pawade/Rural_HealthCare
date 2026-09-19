import { useState, useEffect } from 'react';
import {
  RiskBadge,
  ConsentBadge,
  HealthIDCard,
  Tabs,
  TimelineEntry,
  Card,
  Icon,
  SectionHeader,
  PermissionBadge,
} from '../components/shared';
import {
  getPatientByHealthId,
  getPatients,
  getCurrentUser,
  updatePatient,
  getPatientAuditLogs,
  getDoctors,
  getWorkers,
} from '../api/client';

interface Props {
  navigate: (s: string) => void;
  patientId?: string | null;
}

const PROFILE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'history', label: 'Medical History' },
  { id: 'diagnoses', label: 'Diagnoses' },
  { id: 'medications', label: 'Medications' },
  { id: 'consultations', label: 'Consultations' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'documents', label: 'Documents' },
  { id: 'access', label: 'Access History' },
];

export default function PatientProfile({
  navigate,
  patientId,
}: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patient, setPatient] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    familyDoctorId: '',
    healthWorkerId: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    address: '',
  });
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const user = await getCurrentUser().catch(() => null);
        if (mounted) setCurrentUser(user);

        // Fetch doctors and workers for profile dropdowns
        getDoctors().then(docs => {
          if (mounted) setDoctorsList(docs || []);
        }).catch(() => {});

        getWorkers().then(wrks => {
          if (mounted) setWorkersList(wrks || []);
        }).catch(() => {});

        if (patientId) {
          // Specific patient lookup (by Health ID or UUID)
          const res = await getPatientByHealthId(patientId).catch(() => null);

          if (res?.patient) {
            if (mounted) {
              setPatient({
                ...res.patient,
                id: res.patient.healthId || res.patient.id,
              });
              setConsultations(mapConsultations(res.consultations, res.patient));
              setReferrals(mapReferrals(res.referrals, res.patient));
              setAuditLogs(res.patient.auditEntries || []);
            }
          } else {
            // Patient not found
            if (mounted) setPatient(null);
          }
        } else {
          // Patient viewing their own profile
          if (user?.patientProfile) {
            const pProfile = user.patientProfile;
            const healthId = pProfile.healthId || pProfile.id;

            const res = healthId ? await getPatientByHealthId(healthId).catch(() => null) : null;

            if (mounted) {
              if (res?.patient) {
                setPatient({
                  ...res.patient,
                  id: res.patient.healthId || res.patient.id,
                });
                setConsultations(mapConsultations(res.consultations, res.patient));
                setReferrals(mapReferrals(res.referrals, res.patient));
                setAuditLogs(res.patient.auditEntries || []);
              } else {
                // Use profile from auth session
                setPatient({
                  ...pProfile,
                  id: pProfile.healthId || pProfile.id,
                });
                setConsultations([]);
                setReferrals([]);
                setAuditLogs([]);
              }
            }
          } else if (user?.role === 'worker' || user?.role === 'doctor') {
            // Fallback for worker/doctor previewing patient profile without selecting one
            const patientList = await getPatients().catch(() => []);
            if (patientList && patientList.length > 0 && mounted) {
              const firstId = patientList[0].healthId || patientList[0].id;
              const res = await getPatientByHealthId(firstId).catch(() => null);
              if (res?.patient) {
                setPatient({
                  ...res.patient,
                  id: res.patient.healthId || res.patient.id,
                });
                setConsultations(mapConsultations(res.consultations, res.patient));
                setReferrals(mapReferrals(res.referrals, res.patient));
                setAuditLogs(res.patient.auditEntries || []);
              }
            }
          } else {
            if (mounted) setPatient(null);
          }
        }
      } catch (err) {
        console.error('Failed to load patient profile:', err);
        if (mounted) setPatient(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  // Sync editForm when patient is loaded or editing opens
  function handleOpenEdit() {
    if (!patient) return;
    setEditForm({
      bloodGroup: patient.bloodGroup || '',
      allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || ''),
      chronicConditions: Array.isArray(patient.chronicConditions) ? patient.chronicConditions.join(', ') : (patient.chronicConditions || ''),
      currentMedications: Array.isArray(patient.currentMedications) ? patient.currentMedications.join(', ') : (patient.currentMedications || ''),
      emergencyContactName: patient.emergencyContact?.name || '',
      emergencyContactRelation: patient.emergencyContact?.relation || '',
      emergencyContactPhone: patient.emergencyContact?.phone || '',
      familyDoctorId: patient.familyDoctorId || patient.familyDoctor?.id || '',
      healthWorkerId: patient.healthWorkerId || patient.healthWorker?.id || '',
      phone: patient.phone || '',
      village: patient.village || '',
      district: patient.district || '',
      state: patient.state || 'Rajasthan',
      address: patient.address || '',
    });
    setSaveErrorMsg('');
    setSaveSuccessMsg('');
    setIsEditing(true);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!patient) return;

    setSaveLoading(true);
    setSaveErrorMsg('');
    setSaveSuccessMsg('');

    try {
      const allergiesArr = editForm.allergies
        ? editForm.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      const conditionsArr = editForm.chronicConditions
        ? editForm.chronicConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      const medsArr = editForm.currentMedications
        ? editForm.currentMedications.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      const emergencyContact = (editForm.emergencyContactName || editForm.emergencyContactPhone)
        ? {
            name: editForm.emergencyContactName.trim(),
            relation: editForm.emergencyContactRelation.trim() || 'Family',
            phone: editForm.emergencyContactPhone.trim(),
          }
        : undefined;

      const payload = {
        bloodGroup: editForm.bloodGroup || null,
        allergies: allergiesArr,
        chronicConditions: conditionsArr,
        currentMedications: medsArr,
        emergencyContact,
        familyDoctorId: editForm.familyDoctorId || null,
        healthWorkerId: editForm.healthWorkerId || null,
        phone: editForm.phone,
        village: editForm.village,
        district: editForm.district,
        state: editForm.state,
        address: editForm.address,
      };

      const targetId = patient.realId || patient.rawId || patient.id;
      const res = await updatePatient(targetId, payload);

      if (res?.patient) {
        setPatient({
          ...res.patient,
          id: res.patient.healthId || res.patient.id,
        });
        setSaveSuccessMsg('Profile updated successfully!');
        setTimeout(() => {
          setIsEditing(false);
          setSaveSuccessMsg('');
        }, 1200);
      } else {
        setSaveSuccessMsg('Profile updated successfully!');
        setTimeout(() => setIsEditing(false), 1000);
      }
    } catch (err: any) {
      setSaveErrorMsg(err?.message || 'Failed to update patient profile.');
    } finally {
      setSaveLoading(false);
    }
  }

  function mapConsultations(list: any[] | undefined, p: any) {
    if (!list?.length) return [];

    return list.map((c: any) => ({
      id: c.consultationCode || c.id,
      patientId: p?.healthId || p?.id,
      date: c.date,
      time: c.time,
      workerName: c.workerName || 'Community Worker',
      doctorName: c.doctorName,
      symptoms: c.symptoms || [],
      vitals: c.vitals || {},
      diagnosis: c.diagnosis,
      treatment: c.treatment,
      prescription: c.prescription || [],
      notes: c.notes,
      riskLevel: (c.riskLevel?.toLowerCase() || 'low') as any,
      referralStatus: (c.referralStatus || 'completed') as any,
      followUpDate: c.followUpDate,
    }));
  }

  function mapReferrals(list: any[] | undefined, p: any) {
    if (!list?.length) return [];

    return list.map((r: any) => ({
      id: r.referralCode || r.id,
      patientId: p?.healthId || p?.id,
      patientName: p?.name,
      fromWorker: r.fromWorker || r.fromWorkerName || 'Meena Kumari (ASHA)',
      toPHC: r.toPHC || r.toFacility?.name || r.toFacilityName || 'Primary Health Centre',
      reason: r.reason,
      riskLevel: (r.riskLevel?.toLowerCase() || 'low') as any,
      status: (r.status?.toLowerCase().replace(/_/g, '-') || 'pending') as any,
      date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'),
      priority: (r.priority?.toLowerCase() || 'routine') as any,
      aiSummary: r.aiSummary,
    }));
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-gray-500">Loading patient profile…</div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
          <Icon name="user" size={32} />
        </div>
        <h2 className="font-display text-lg font-bold text-gray-900">Patient Record Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          No profile record was found for this ID. If you just registered, your record is syncing securely with the ABDM network.
        </p>
        <button
          onClick={() => navigate(currentUser?.role === 'patient' ? 'patient-dashboard' : 'worker-dashboard')}
          className="mt-5 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isPatientUser = currentUser?.role === 'patient';
  const nameStr = patient.name || 'Unknown';
  const initials = nameStr
    .split(' ')
    .map((w: string) => w[0] || '')
    .join('')
    .toUpperCase();

  const backDestination = isPatientUser ? 'patient-dashboard' : currentUser?.role === 'doctor' ? 'doctor-dashboard' : 'worker-dashboard';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Navigation & Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(backDestination)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          <Icon name="chevron_right" size={14} className="rotate-180" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-xl text-[10px] text-teal-700 font-semibold">
            <Icon name="user" size={11} />
            {isPatientUser ? 'My Health Profile' : currentUser?.role === 'doctor' ? 'Doctor View' : 'ASHA Worker View'}
          </div>

          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl text-xs font-semibold hover:bg-brand-100 transition-colors"
          >
            <Icon name="edit" size={12} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Permission hints */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <PermissionBadge type="asha-recorded" />
          <span>— Symptoms, vitals, basic info</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PermissionBadge type="doctor-editable" />
          <span>— Diagnoses, prescriptions, referrals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PermissionBadge type="view-only" />
          <span>— Verified ABHA & ABDM Identity</span>
        </div>
      </div>

      {/* Primary Patient Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-display font-bold shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-xl font-bold">{patient.name}</h1>
                {patient.nameHi && (
                  <span className="text-brand-200 text-sm">· {patient.nameHi}</span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-1 text-brand-100 text-sm flex-wrap">
                <span>
                  {patient.age} yrs · {patient.gender === 'F' || patient.gender === 'Female' ? 'Female' : 'Male'}
                </span>
                <span>
                  Blood: <strong className="text-white">{patient.bloodGroup || 'Not Specified'}</strong>
                </span>
                <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded">
                  {patient.healthId || patient.id}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <RiskBadge
                  level={
                    patient.riskLevel
                      ? typeof patient.riskLevel === 'string'
                        ? patient.riskLevel.toLowerCase()
                        : patient.riskLevel
                      : 'low'
                  }
                />
                {patient.consentStatus && <ConsentBadge status={patient.consentStatus} />}
                {patient.vaccinationStatus && (
                  <span className="px-2.5 py-1 bg-white/10 text-white text-xs rounded-full">
                    {patient.vaccinationStatus}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={handleOpenEdit}
                className="px-3 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-semibold hover:bg-white/20 transition-colors flex items-center gap-1.5"
              >
                <Icon name="edit" size={12} />
                Edit
              </button>

              {!isPatientUser && (
                <button
                  onClick={() => navigate('health-assessment')}
                  className="px-4 py-2 bg-white text-brand-700 rounded-xl text-xs font-semibold hover:bg-brand-50 transition-colors"
                >
                  + Assessment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contact and Metadata sub-bar */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-8 gap-y-1.5 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Icon name="map_pin" size={11} className="text-gray-400" />
            {patient.village}
            {patient.district ? `, ${patient.district}` : ''}
          </span>

          <span className="flex items-center gap-1">
            <Icon name="phone" size={11} className="text-gray-400" />
            {patient.phone}
          </span>

          {patient.emergencyContact?.name && (
            <span>
              Emergency: <strong>{patient.emergencyContact.name}</strong> ({patient.emergencyContact.relation || 'Relation'}) {patient.emergencyContact.phone}
            </span>
          )}

          {(patient.familyDoctorName || patient.familyDoctor?.name) && (
            <span className="text-blue-700 font-medium">
              Family Doctor: <strong>{patient.familyDoctorName || patient.familyDoctor?.name}</strong>
            </span>
          )}

          {(patient.healthWorkerName || patient.healthWorker?.name || (typeof patient.healthWorker === 'string' && patient.healthWorker)) && (
            <span>
              ASHA Worker: <strong>{patient.healthWorkerName || patient.healthWorker?.name || patient.healthWorker}</strong>
            </span>
          )}

          <span>
            Registered: {patient.registeredAt || patient.createdAt?.slice(0, 10) || 'Active'}
          </span>
        </div>
      </Card>

      <Tabs tabs={PROFILE_TABS} active={activeTab} onChange={setActiveTab} />

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Primary Care Links (Family Doctor & ASHA Worker) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="p-4 bg-blue-50/50 border-blue-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Icon name="user" size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Family Doctor</div>
                      <div className="text-sm font-bold text-gray-900 mt-0.5">
                        {patient.familyDoctorName || patient.familyDoctor?.name || 'Not Assigned'}
                      </div>
                      {patient.familyDoctor?.specialty && (
                        <div className="text-xs text-gray-500">
                          {patient.familyDoctor.specialty} · {patient.familyDoctor?.facility?.name || 'PHC'}
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={handleOpenEdit} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Edit
                  </button>
                </div>
              </Card>

              <Card className="p-4 bg-teal-50/50 border-teal-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Icon name="users" size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">ASHA Worker</div>
                      <div className="text-sm font-bold text-gray-900 mt-0.5">
                        {patient.healthWorkerName || patient.healthWorker?.name || (typeof patient.healthWorker === 'string' ? patient.healthWorker : 'Not Assigned')}
                      </div>
                      <div className="text-xs text-gray-500">{patient.village} Ward</div>
                    </div>
                  </div>
                  <button onClick={handleOpenEdit} className="text-xs text-teal-600 hover:text-teal-800 font-medium">
                    Edit
                  </button>
                </div>
              </Card>
            </div>

            <Card className="p-5">
              <SectionHeader title="Patient Health ID" />
              <HealthIDCard id={patient.healthId || patient.id} name={patient.name} size="lg" />
              <div className="flex gap-2 mt-4">
                {['Copy Health ID', 'QR Code', 'Share'].map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      if (a === 'Copy Health ID') {
                        navigator.clipboard?.writeText(patient.healthId || patient.id);
                        alert(`Copied Health ID: ${patient.healthId || patient.id}`);
                      } else if (a === 'QR Code') {
                        setActiveTab('overview');
                      }
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <SectionHeader title="Alerts & Conditions" />
                <button onClick={handleOpenEdit} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  Update
                </button>
              </div>

              <div className="space-y-3">
                {patient.allergies?.length > 0 ? (
                  <div>
                    <div className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                      <Icon name="alert" size={12} />
                      ALLERGIES
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((a: string) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-medium"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">No allergies recorded.</div>
                )}

                <div>
                  <div className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                    <Icon name="activity" size={12} />
                    CHRONIC CONDITIONS
                  </div>

                  {patient.chronicConditions?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.chronicConditions.map((c: string) => (
                        <span
                          key={c}
                          className="px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg text-xs font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">None reported.</div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Health Timeline" sub="Chronological record of care" />
              <div className="mt-4">
                {consultations.length > 0 ? (
                  consultations.map((c) => (
                    <TimelineEntry
                      key={c.id}
                      date={`${c.date}${c.time ? ', ' + c.time : ''}`}
                      title={`Consultation – ${c.diagnosis || 'Assessment recorded'}`}
                      sub={c.notes || `Recorded by ${c.workerName}`}
                      icon="clipboard"
                      color="brand"
                    />
                  ))
                ) : (
                  <div className="text-xs text-gray-400 py-3">No clinical consultations recorded yet.</div>
                )}

                <TimelineEntry
                  date={patient.registeredAt || 'Registered'}
                  title="Patient Registered"
                  sub={`Health ID issued: ${patient.healthId || patient.id}`}
                  icon="user"
                  color="brand"
                  last
                />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <SectionHeader
                title="Current Medications"
                action={
                  <button onClick={handleOpenEdit} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    Edit
                  </button>
                }
              />

              <div className="space-y-2.5 mt-3">
                {patient.currentMedications?.length > 0 ? (
                  patient.currentMedications.map((m: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-brand-50 rounded-xl">
                      <Icon name="pill" size={14} className="text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{m}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 text-center py-4">No active prescriptions.</div>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader
                title="Last Vitals"
                sub={consultations[0]?.date || 'No vitals recorded'}
                action={<PermissionBadge type="asha-recorded" />}
              />

              {consultations[0]?.vitals && Object.keys(consultations[0].vitals).length > 0 ? (
                <div className="space-y-2 mt-3">
                  {Object.entries(consultations[0].vitals).map(([k, v]: any) => (
                    <div
                      key={k}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-xs text-gray-500 capitalize">{k}</span>
                      <span className="font-mono text-sm font-semibold text-gray-800">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 text-center py-4">Take an assessment to record vitals.</div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* CONSULTATIONS TAB */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[11px] text-gray-500">
            <Icon name="info" size={13} className="shrink-0 mt-0.5 text-gray-400" />
            Consultation records are authorized and signed by licensed medical clinicians and community health workers.
          </div>

          {consultations.length === 0 ? (
            <Card className="p-10 text-center">
              <Icon name="clipboard" size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold text-sm">No Consultations Recorded Yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                When a doctor or ASHA worker completes an in-person or tele-consultation with you, the clinical records, diagnoses, and notes will appear here.
              </p>
            </Card>
          ) : (
            consultations.map((c) => (
              <Card key={c.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-display font-semibold text-gray-900">
                      {c.date}, {c.time}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-gray-500">
                        Recorded by: <strong>{c.workerName}</strong>
                      </span>
                      <PermissionBadge type="asha-recorded" />
                      {c.doctorName && (
                        <>
                          <span className="text-[10px] text-gray-500">
                            · Reviewed by: <strong>{c.doctorName}</strong>
                          </span>
                          <PermissionBadge type="doctor-editable" />
                        </>
                      )}
                    </div>
                  </div>
                  <RiskBadge level={c.riskLevel} />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-gray-500">Symptoms</span>
                      <PermissionBadge type="asha-recorded" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.symptoms.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-gray-500">Vitals</span>
                      <PermissionBadge type="asha-recorded" />
                    </div>
                    <div className="text-xs text-gray-700 space-y-0.5">
                      <div>
                        BP: {c.vitals?.bloodPressure || 'N/A'} · HR: {c.vitals?.heartRate || 'N/A'} bpm
                      </div>
                      <div>
                        Temp: {c.vitals?.temperature || 'N/A'}°C · SpO₂: {c.vitals?.spo2 || 'N/A'}%
                      </div>
                    </div>
                  </div>
                </div>

                {c.diagnosis && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-purple-700">Diagnosis</span>
                      <PermissionBadge type="doctor-editable" />
                    </div>
                    <div className="text-sm text-gray-800">{c.diagnosis}</div>
                  </div>
                )}

                {c.prescription?.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-700">Prescription</span>
                      <PermissionBadge type="doctor-editable" />
                    </div>
                    <ul className="text-xs text-gray-700 space-y-0.5">
                      {c.prescription.map((rx: string) => (
                        <li key={rx}>· {rx}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* REFERRALS TAB */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          {referrals.length === 0 ? (
            <Card className="p-10 text-center">
              <Icon name="shuffle" size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold text-sm">No Referrals Issued</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Referrals from primary health workers to Community Health Centres or District Hospitals will appear here.
              </p>
            </Card>
          ) : (
            referrals.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{r.toPHC}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {r.date} · {r.fromWorker}
                    </div>
                  </div>
                  <RiskBadge level={r.riskLevel} size="sm" />
                </div>
                <p className="text-sm text-gray-700 mt-2">{r.reason}</p>
                {r.aiSummary && (
                  <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded-lg">
                    {r.aiSummary}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* MEDICATIONS TAB */}
      {activeTab === 'medications' && (
        <Card className="p-5">
          <SectionHeader
            title="Current Medications & Prescriptions"
            action={
              <button onClick={handleOpenEdit} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                Update List
              </button>
            }
          />

          <div className="space-y-3 mt-3">
            {patient.currentMedications?.length > 0 ? (
              patient.currentMedications.map((m: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                  <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                    <Icon name="pill" size={16} className="text-brand-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{m}</div>
                    <div className="text-xs text-gray-400">Active Prescription</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Icon name="pill" size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold text-sm">No Active Medications</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  You do not have any active medication regimens recorded. Update your profile or consult a doctor to record active prescriptions.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ACCESS TAB */}
      {activeTab === 'access' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 rounded-xl px-4 py-3">
            <Icon name="shield" size={14} className="text-brand-600" />
            Showing real-time access log for <strong>{patient.name}</strong> ·{' '}
            <span className="font-mono text-xs">{patient.healthId || patient.id}</span>
          </div>

          {auditLogs.length === 0 ? (
            <Card className="p-10 text-center">
              <Icon name="eye" size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold text-sm">No Access Events Recorded</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                No healthcare provider has requested or accessed this record yet. All future accesses will be logged with cryptographic timestamps.
              </p>
            </Card>
          ) : (
            auditLogs.map((entry: any) => (
              <Card key={entry.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon name="eye" size={14} className="text-gray-500" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-gray-900">{entry.accessorName}</div>
                      <div className="font-mono text-xs text-gray-400">
                        {entry.timestamp || (entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '')}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {entry.accessorRole} · {entry.organization}
                    </div>
                    <div className="text-xs text-gray-700 mt-1">{entry.action}</div>

                    {entry.dataAccessed && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(Array.isArray(entry.dataAccessed) ? entry.dataAccessed : [String(entry.dataAccessed)]).map((d: string) => (
                          <span key={d} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-gray-400 mt-1">Purpose: {entry.purpose}</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* DOCUMENTS & HISTORY & DIAGNOSES TABS */}
      {(activeTab === 'history' || activeTab === 'diagnoses' || activeTab === 'documents') && (
        <Card className="p-8 text-center">
          <Icon
            name={activeTab === 'documents' ? 'document' : 'clipboard'}
            size={32}
            className="text-gray-300 mx-auto mb-3"
          />
          <p className="text-gray-500 font-medium">
            {activeTab === 'documents'
              ? 'No documents uploaded'
              : activeTab === 'diagnoses'
              ? 'No formal diagnoses on record'
              : 'No additional clinical records'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Records will appear here as consultations are completed</p>
        </Card>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-gray-900">Edit Patient Profile</h3>
                <p className="text-xs text-gray-500">Update medical details, emergency contact, and doctor relations</p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            {saveErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {saveErrorMsg}
              </div>
            )}

            {saveSuccessMsg && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
                {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Family Doctor Assignment */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-blue-900 block">
                  Family Doctor (Primary Contact for SOS)
                </label>
                <p className="text-[11px] text-blue-700">
                  Select a licensed doctor to be your dedicated Family Doctor. When you trigger an Emergency SOS, alerts route directly to them first.
                </p>
                <select
                  value={editForm.familyDoctorId}
                  onChange={(e) => setEditForm({ ...editForm, familyDoctorId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">None / Not Assigned</option>
                  {doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialty || 'General Practice'} — {doc.facility?.name || doc.facilityName || 'PHC'})
                    </option>
                  ))}
                </select>
              </div>

              {/* ASHA Worker Assignment */}
              <div className="p-3.5 bg-teal-50/60 border border-teal-100 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-teal-900 block">
                  Assigned ASHA / Community Health Worker
                </label>
                <select
                  value={editForm.healthWorkerId}
                  onChange={(e) => setEditForm({ ...editForm, healthWorkerId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">None / Not Assigned</option>
                  {workersList.map((wrk) => (
                    <option key={wrk.id} value={wrk.id}>
                      {wrk.name} ({wrk.role || wrk.workerType || 'ASHA'} — {wrk.village || 'Primary Centre'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Blood Group</label>
                <select
                  value={editForm.bloodGroup}
                  onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Not Specified</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Allergies */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, Dust"
                  value={editForm.allergies}
                  onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Chronic Conditions */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Chronic Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                  value={editForm.chronicConditions}
                  onChange={(e) => setEditForm({ ...editForm, chronicConditions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Current Medications */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Current Medications (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metformin 500mg, Amlodipine 5mg"
                  value={editForm.currentMedications}
                  onChange={(e) => setEditForm({ ...editForm, currentMedications: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <label className="text-xs font-bold text-gray-900 block">Emergency Contact</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={editForm.emergencyContactName}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Spouse)"
                    value={editForm.emergencyContactRelation}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactRelation: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="tel"
                    placeholder="10-digit Phone"
                    value={editForm.emergencyContactPhone}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Village & Phone */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Village</label>
                  <input
                    type="text"
                    value={editForm.village}
                    onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {saveLoading && <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}