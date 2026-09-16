import { useState } from 'react';
import { PATIENTS, CONSULTATIONS, AI_ASSESSMENTS } from '../data';
import { RiskBadge, ConsentBadge, HealthIDCard, Tabs, Card, Icon, SectionHeader, AIDisclaimer, PermissionBadge } from '../components/shared';

interface Props { navigate: (s: string) => void; }

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'vitals', label: 'Vitals & Symptoms' },
  { id: 'history', label: 'Medical History' },
  { id: 'ai', label: 'AI Assessment' },
  { id: 'actions', label: 'Actions' },
];

export default function DoctorPatientView({ navigate }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const [addingDiagnosis, setAddingDiagnosis] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');

  const patient = PATIENTS[1]; // Ramesh Kumar – high risk
  const consultation = CONSULTATIONS.find(c => c.patientId === patient.id);
  const aiAssessment = AI_ASSESSMENTS.find(a => a.patientId === patient.id);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('doctor-dashboard')} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          <Icon name="chevron_right" size={18} className="rotate-180 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Patient Record</h1>
          <p className="text-xs text-gray-500">Authenticated clinical view · Dr. Ankit Sharma</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700">
          <Icon name="shield" size={12} />
          Authorized Access
        </div>
      </div>

      {/* Patient header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-display font-bold shrink-0">
              {patient.name.split(' ').map(w=>w[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="font-display text-xl font-bold">{patient.name}</h2>
                <span className="text-red-200 text-sm">· {patient.nameHi}</span>
              </div>
              <div className="text-red-100 text-sm">{patient.age} yrs · Male · Blood: <strong className="text-white">{patient.bloodGroup}</strong></div>
              <div className="font-mono text-xs text-red-200 mt-0.5">{patient.id}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <RiskBadge level={patient.riskLevel} />
                <ConsentBadge status={patient.consentStatus} />
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-red-50 border-t border-red-100 flex flex-wrap gap-x-8 gap-y-1 text-xs text-gray-600">
          <span className="flex items-center gap-1 text-red-700 font-semibold"><Icon name="alert" size={11} />
            ALLERGIES: {patient.allergies.join(', ')}
          </span>
          <span className="flex items-center gap-1"><Icon name="map_pin" size={11} className="text-gray-400" />{patient.village}, {patient.district}</span>
          <span>Emergency: {patient.emergencyContact.name} ({patient.emergencyContact.relation})</span>
        </div>
      </Card>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5">
              <SectionHeader title="Chronic Conditions" />
              <div className="flex flex-wrap gap-2">
                {patient.chronicConditions.map(c => (
                  <span key={c} className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-sm font-medium">{c}</span>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Current Medications" />
              <div className="space-y-2.5">
                {patient.currentMedications.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name="pill" size={14} className="text-blue-600" />
                    </div>
                    <div className="text-sm text-gray-800 font-medium">{m}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Previous Consultations" sub="Consultation providers — not different patients" />
              <p className="text-[10px] text-gray-400 mb-3 -mt-2">The names below are the ASHA workers and doctors who recorded or reviewed each consultation.</p>
              <div className="space-y-3">
                {CONSULTATIONS.map(c => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">{c.date}</div>
                      <RiskBadge level={c.riskLevel} size="sm" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] text-gray-500">Recorded by: <strong>{c.workerName}</strong></span>
                      <PermissionBadge type="asha-recorded" />
                    </div>
                    {'doctorName' in c && c.doctorName && (
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] text-gray-500">Reviewed by: <strong>{c.doctorName as string}</strong></span>
                        <PermissionBadge type="doctor-editable" />
                      </div>
                    )}
                    <div className="text-xs text-gray-700 mt-1">Symptoms: {c.symptoms.join(', ')}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <HealthIDCard id={patient.id} name={patient.name} size="md" />

            <Card className="p-4 border-red-100 bg-red-50">
              <div className="flex items-start gap-2">
                <Icon name="alert" size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-red-700">Critical Referral</div>
                  <div className="text-xs text-red-600 mt-0.5">Suspected ACS. Patient has been referred from health worker Sunita Yadav.</div>
                  <button onClick={() => navigate('referral')} className="text-xs text-red-700 font-semibold mt-1.5 hover:underline">View Referral →</button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-xs font-semibold text-gray-500 mb-2">EMERGENCY CONTACT</div>
              <div className="text-sm font-medium text-gray-900">{patient.emergencyContact.name}</div>
              <div className="text-xs text-gray-500">{patient.emergencyContact.relation}</div>
              <div className="text-xs text-brand-600 font-mono mt-1">{patient.emergencyContact.phone}</div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'vitals' && consultation && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-gray-900">Latest Vitals</h2>
                <p className="text-xs text-gray-500 mt-0.5">Recorded: {consultation.date}, {consultation.time}</p>
              </div>
              <PermissionBadge type="asha-recorded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Temperature', value: `${consultation.vitals.temperature}°C`, abnormal: consultation.vitals.temperature > 37.5 },
                { label: 'Blood Pressure', value: consultation.vitals.bloodPressure, abnormal: true },
                { label: 'Heart Rate', value: `${consultation.vitals.heartRate} bpm`, abnormal: consultation.vitals.heartRate > 100 },
                { label: 'SpO₂', value: `${consultation.vitals.spo2}%`, abnormal: consultation.vitals.spo2 < 95 },
              ].map(v => (
                <div key={v.label} className={`p-4 rounded-2xl text-center border-2 ${v.abnormal ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className={`font-mono text-xl font-bold ${v.abnormal ? 'text-red-700' : 'text-gray-800'}`}>{v.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{v.label}</div>
                  {v.abnormal && <div className="text-[10px] text-red-500 font-bold mt-1 uppercase">Abnormal</div>}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-gray-900">Reported Symptoms</h2>
              <PermissionBadge type="asha-recorded" />
            </div>
            <div className="flex flex-wrap gap-2">
              {consultation.symptoms.map(s => (
                <span key={s} className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-sm font-medium">{s}</span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'ai' && aiAssessment && (
        <div className="space-y-4">
          <AIDisclaimer />
          <Card className="p-5 border-red-200 bg-red-50">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-lg font-bold text-gray-900">AI Risk Assessment</div>
              <RiskBadge level={aiAssessment.riskLevel} size="lg" />
            </div>
            <div className="p-4 bg-white rounded-xl border border-red-100 mb-3">
              <div className="text-xs font-bold text-gray-500 mb-1">RECOMMENDED ACTION</div>
              <p className="text-sm font-semibold text-red-800">{aiAssessment.recommendedAction}</p>
            </div>
            <div className="text-xs text-gray-600 bg-white p-3 rounded-xl leading-relaxed">{aiAssessment.reasoning}</div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
              <span>Confidence: {aiAssessment.confidence}%</span>
              <span>{aiAssessment.generatedAt}</span>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-4">
          {/* Role clarity banner for Actions tab */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
            <Icon name="shield" size={14} className="text-purple-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold text-purple-800">Doctor Clinical Actions</div>
              <div className="text-[10px] text-purple-600 mt-0.5">Clinical records updated here are attributed to Dr. Ankit Sharma and form part of the permanent patient record.</div>
            </div>
            <PermissionBadge type="doctor-editable" />
          </div>
          {!addingDiagnosis ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Add Diagnosis', icon: 'clipboard', action: () => setAddingDiagnosis(true), color: 'bg-brand-600 text-white hover:bg-brand-700' },
                { label: 'Add Treatment Plan', icon: 'pill', action: () => setAddingDiagnosis(true), color: 'bg-purple-600 text-white hover:bg-purple-700' },
                { label: 'Request Lab Tests', icon: 'document', action: () => {}, color: 'bg-blue-600 text-white hover:bg-blue-700' },
                { label: 'Create Referral', icon: 'share', action: () => navigate('referral'), color: 'bg-amber-500 text-white hover:bg-amber-600' },
                { label: 'Schedule Follow-up', icon: 'history', action: () => {}, color: 'bg-green-600 text-white hover:bg-green-700' },
                { label: 'View AI Assessment', icon: 'brain', action: () => setActiveTab('ai'), color: 'bg-gray-800 text-white hover:bg-gray-900' },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  className={`p-4 rounded-2xl flex items-center gap-3 font-semibold text-sm transition-all active:scale-95 ${a.color}`}>
                  <Icon name={a.icon} size={18} />
                  {a.label}
                </button>
              ))}
            </div>
          ) : (
            <Card className="p-5">
              <SectionHeader title="Add Clinical Note" action={
                <button onClick={() => setAddingDiagnosis(false)} className="text-gray-400 hover:text-gray-600">
                  <Icon name="x" size={18} />
                </button>
              } />
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Diagnosis *</label>
                  <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2}
                    placeholder="e.g. Acute Coronary Syndrome – NSTEMI (suspected)"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Treatment Plan</label>
                  <textarea value={treatment} onChange={e => setTreatment(e.target.value)} rows={3}
                    placeholder="Treatment plan, medications, instructions..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setAddingDiagnosis(false)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
                    Cancel
                  </button>
                  <button onClick={() => { setAddingDiagnosis(false); }}
                    className="flex-1 py-2.5 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700">
                    Save & Update Record
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
