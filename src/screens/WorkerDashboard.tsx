import { useState, useEffect } from 'react';
import { PATIENTS, REFERRALS } from '../data';
import { StatCard, SectionHeader, PatientRow, RiskBadge, ReferralBadge, PriorityBadge, Card, Icon, HPRBadge, DutyStatusBadge, ABDMLayerLegend } from '../components/shared';

interface ActiveSosAlert {
  id: string;
  status: 'sent' | 'notified' | 'awaiting' | 'acknowledged' | 'declined' | 'escalated';
  escalationLevel: number;
}

interface Props {
  navigate: (s: string, patientId?: string) => void;
  isOffline: boolean;
  onSOS: () => void;
  activeSosAlert?: ActiveSosAlert | null;
}

const ON_DUTY_DOCTORS = [
  { id: 'doc1', name: 'Dr. Ankit Sharma', specialty: 'General Medicine', facility: 'PHC Lunkaransar', hprId: 'HPR-2024-00142', status: 'available' as 'available' | 'busy' | 'offline', distance: '2.1 km', recommended: true, reasons: ['Primary assigned doctor', 'On-duty now', 'General Medicine specialist', 'Nearest PHC'] },
  { id: 'doc2', name: 'Dr. Priya Mehta', specialty: 'Gynaecology & Obstetrics', facility: 'CHC Bikaner', hprId: 'HPR-2024-00289', status: 'busy' as 'available' | 'busy' | 'offline', distance: '8.4 km', recommended: false, reasons: [] },
  { id: 'doc3', name: 'Dr. Suresh Gupta', specialty: 'Emergency Medicine', facility: 'District Hospital Bikaner', hprId: 'HPR-2024-00371', status: 'available' as 'available' | 'busy' | 'offline', distance: '14.2 km', recommended: false, reasons: ['Emergency specialist available'] },
];

const ESCALATION_CHAIN = [
  { label: 'Dr. Ankit Sharma', sub: 'PHC Lunkaransar · General Medicine' },
  { label: 'Dr. Suresh Gupta', sub: 'District Hospital · Emergency Medicine' },
  { label: 'District Control Room', sub: 'Bikaner District Emergency Operations' },
];

export default function WorkerDashboard({ navigate, isOffline, onSOS, activeSosAlert }: Props) {
  const [search, setSearch] = useState('');
  const [sosConfirm, setSosConfirm] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc1');
  const [selectionMode, setSelectionMode] = useState<'smart' | 'manual'>('smart');
  const [countdown, setCountdown] = useState(90);
  const [realPatients, setRealPatients] = useState<any[]>([]);
  const [dbUser, setDbUser] = useState<any>(null);
  const today = '31 Aug 2026';

  useEffect(() => {
    import('../imports/api').then(({ patients, auth, getToken }) => {
      const token = getToken() || undefined;
      patients.get(token).then(res => {
        if(res.data?.patients?.length > 0) {
          const mapped = res.data.patients.map((p: any) => ({
             ...p,
             riskLevel: p.riskLevel.toLowerCase()
          }));
          setRealPatients(mapped);
        }
      }).catch(e => console.error("Failed to load patients", e));

      auth.getCurrentUser(token).then((res: any) => {
        if(res.data?.user) setDbUser(res.data.user);
      }).catch((e: any) => console.error("Failed to load user", e));
    });
  }, []);

  const basePatients = realPatients.length > 0 ? realPatients : PATIENTS;
  const highRisk = basePatients.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical');
  const pendingReferrals = REFERRALS.filter(r => r.status === 'pending');
  const filtered = search.trim()
    ? basePatients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id?.includes(search.toUpperCase()))
    : basePatients.slice(0, 4);

  const workerName = dbUser?.fullName?.split(' ')[0] || 'Meena';


  useEffect(() => {
    if (!sosSent) return;
    setCountdown(90);
    const timer = setInterval(() => setCountdown(c => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(timer);
  }, [sosSent]);

  const formatCountdown = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sosStatus = activeSosAlert?.status ?? 'sent';
  const escalationLevel = activeSosAlert?.escalationLevel ?? 0;
  const simulatedStep = sosSent ? Math.min(2, Math.floor((90 - countdown) / 12) + 1) : 0;
  const currentStep = (sosStatus === 'acknowledged' || sosStatus === 'declined') ? 3 : simulatedStep;

  const statusSteps = ['SOS Sent', 'Doctor Notified', 'Awaiting Ack.', sosStatus === 'acknowledged' ? 'Acknowledged ✓' : escalationLevel > 0 ? 'Escalating…' : 'Response'];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* SOS confirm modal — doctor roster + selection */}
      {sosConfirm && !sosSent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="bg-red-600 px-6 py-5 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="alert" size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Send Emergency SOS</h3>
                  <p className="text-red-200 text-xs">Select responding doctor and confirm</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Responding Doctor</div>
                <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                  <button onClick={() => setSelectionMode('smart')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectionMode === 'smart' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}>
                    Smart Recommendation
                  </button>
                  <button onClick={() => setSelectionMode('manual')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectionMode === 'manual' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}>
                    Manual Selection
                  </button>
                </div>
                {selectionMode === 'smart' && (() => {
                  const rec = ON_DUTY_DOCTORS.find(d => d.recommended)!;
                  return (
                    <div className="rounded-2xl border-2 border-brand-400 bg-brand-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {rec.name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-gray-900">{rec.name}</span>
                            <HPRBadge compact />
                            <DutyStatusBadge status={rec.status} />
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">{rec.specialty} · {rec.facility}</div>
                          <div className="text-[10px] font-mono text-gray-400 mt-0.5">{rec.hprId} · {rec.distance}</div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {rec.reasons.map(r => (
                              <span key={r} className="px-2 py-0.5 bg-white border border-brand-200 text-brand-700 rounded-full text-[10px] font-medium">{r}</span>
                            ))}
                          </div>
                        </div>
                        <div className="px-2 py-1 bg-brand-600 text-white text-[9px] font-bold rounded-lg shrink-0">RECOMMENDED</div>
                      </div>
                      <p className="text-[10px] text-brand-600 mt-3 border-t border-brand-200 pt-2">
                        RuralCare selects based on duty roster and specialty. HPR confirms doctor identity via ABDM — physical presence confirmed by acknowledgement.
                      </p>
                    </div>
                  );
                })()}
                {selectionMode === 'manual' && (
                  <div className="space-y-2">
                    {ON_DUTY_DOCTORS.map(doc => (
                      <button key={doc.id} onClick={() => doc.status !== 'offline' && setSelectedDoctorId(doc.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedDoctorId === doc.id ? 'border-brand-400 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200'} ${doc.status === 'offline' ? 'opacity-40' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${selectedDoctorId === doc.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {doc.name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-gray-900">{doc.name}</span>
                              {doc.recommended && <span className="text-[9px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-bold">RECOMMENDED</span>}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">{doc.specialty} · {doc.distance}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <HPRBadge compact />
                              <DutyStatusBadge status={doc.status} />
                            </div>
                          </div>
                          {selectedDoctorId === doc.id && (
                            <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                              <Icon name="check" size={11} className="text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <ABDMLayerLegend />
              {isOffline && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <Icon name="wifi_off" size={13} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800">SOS stored locally — transmitted when connectivity is restored.</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button onClick={() => setSosConfirm(false)} className="py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={() => { onSOS(); setSosSent(true); setSosConfirm(false); }}
                  className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors">Send SOS</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOS active status pipeline */}
      {sosSent && (
        <div className="rounded-2xl border border-red-200 bg-red-50 overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-display font-bold text-red-800 text-sm">Emergency SOS Active</span>
              </div>
              <button onClick={() => setSosSent(false)} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={14} /></button>
            </div>
            {/* 4-step pipeline */}
            <div className="flex items-start gap-1">
              {statusSteps.map((label, i) => {
                const done = i < currentStep;
                const active = i === currentStep && sosStatus !== 'acknowledged';
                const ack = sosStatus === 'acknowledged' && i === 3;
                return (
                  <div key={i} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${done || ack ? 'bg-green-500 text-white' : active ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {done || ack ? '✓' : active ? '⟳' : i + 1}
                      </div>
                      <span className={`text-[9px] text-center leading-tight font-medium px-0.5 ${done || ack ? 'text-green-700' : active ? 'text-red-700' : 'text-gray-400'}`}>{label}</span>
                    </div>
                    {i < 3 && <div className={`h-px w-3 shrink-0 mt-[-10px] ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            {sosStatus === 'acknowledged' ? (
              <div className="flex items-center gap-3 p-3 bg-green-100 border border-green-300 rounded-xl">
                <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="check" size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-green-900 text-sm">SOS Acknowledged — Doctor Responding</div>
                  <div className="text-xs text-green-700">Dr. Ankit Sharma is responding · PHC Lunkaransar</div>
                </div>
              </div>
            ) : sosStatus === 'declined' || (countdown === 0 && escalationLevel === 0) ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <Icon name="alert" size={14} className="shrink-0 mt-0.5 text-amber-600" />
                  <span><strong>Dr. Ankit Sharma has not acknowledged.</strong> Escalating to Dr. Suresh Gupta, District Hospital.</span>
                </div>
                {escalationLevel >= 2 && (
                  <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-800">
                    <Icon name="phone" size={14} className="shrink-0 mt-0.5" />
                    <span><strong>District Control Room alerted.</strong> Bikaner District Emergency Operations has been notified.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700">Awaiting acknowledgement from <strong>Dr. Ankit Sharma</strong></span>
                <div className="font-mono text-lg font-bold text-red-700 bg-red-100 px-3 py-1 rounded-xl">
                  {formatCountdown(countdown)}
                </div>
              </div>
            )}
            {/* Escalation chain */}
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Escalation Chain</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {ESCALATION_CHAIN.map((step, i) => (
                  <div key={i} className={`flex items-center gap-2 shrink-0 px-3 py-2 rounded-xl border text-xs transition-all ${i === escalationLevel && sosStatus !== 'acknowledged' ? 'border-red-400 bg-red-50' : i < escalationLevel ? 'border-gray-200 bg-gray-50 opacity-40' : 'border-gray-100 bg-white opacity-50'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === escalationLevel && sosStatus !== 'acknowledged' ? 'bg-red-500 text-white animate-pulse' : i < escalationLevel ? 'bg-gray-300 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-[11px] leading-tight">{step.label}</div>
                      <div className="text-[9px] text-gray-500 leading-tight">{step.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Good morning, {workerName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{today} · {dbUser?.workerProfile?.village || 'Village Health Centre, Govindpur'}</p>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2">
              <Icon name="wifi_off" size={14} />
              OFFLINE
            </div>
          )}
          {/* SOS Button */}
          <button onClick={() => setSosConfirm(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-red-200">
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
            <Icon name="alert" size={16} />
            SOS
          </button>
        </div>
      </div>

      {/* On-Duty Doctors Roster */}
      <Card>
        <div className="px-4 pt-4 pb-2">
          <SectionHeader
            title="On-Duty Doctors · Facility Roster"
            sub="PHC Lunkaransar & nearby facilities — RuralCare operational mapping"
          />
        </div>
        <div className="px-4 pb-4 space-y-2">
          {ON_DUTY_DOCTORS.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${doc.status === 'available' ? 'bg-green-100 text-green-800' : doc.status === 'busy' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>
                {doc.name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900">{doc.name}</span>
                  <HPRBadge compact />
                  {doc.recommended && <span className="text-[9px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-bold">PREFERRED</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{doc.specialty} · {doc.facility}</div>
                <div className="text-[10px] font-mono text-gray-400">{doc.hprId}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <DutyStatusBadge status={doc.status} />
                <span className="text-[10px] text-gray-400">{doc.distance}</span>
              </div>
            </div>
          ))}
          <ABDMLayerLegend className="mt-2" />
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Register Patient', labelHi: 'मरीज पंजीकृत करें', icon: 'plus', screen: 'register-patient', color: 'bg-brand-600 text-white hover:bg-brand-700' },
          { label: 'New Assessment', labelHi: 'नया आकलन', icon: 'clipboard', screen: 'health-assessment', color: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200' },
          { label: 'Search Patient', labelHi: 'मरीज खोजें', icon: 'search', screen: 'patient-profile', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
          { label: isOffline ? 'Sync Pending' : 'Sync Center', labelHi: 'सिंक केंद्र', icon: 'sync', screen: 'sync', color: isOffline ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
        ].map(a => (
          <button key={a.screen} onClick={() => navigate(a.screen)}
            className={`p-4 rounded-2xl flex flex-col items-center gap-2 text-center transition-all active:scale-95 font-medium text-sm ${a.color}`}>
            <Icon name={a.icon} size={20} />
            {a.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Today's Consultations" value="7" sub="3 more scheduled" icon="clipboard" color="brand" trend="up" />
        <StatCard label="Registered Patients" value="156" sub="Govindpur sector" icon="users" color="green" trend="up" />
        <StatCard label="Pending Follow-ups" value="12" sub="4 overdue" icon="history" color="amber" />
        <StatCard label="High-risk Patients" value={highRisk.length} sub="Need urgent review" icon="alert" color="red" />
      </div>

      {/* Search */}
      <div className="relative">
        <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or Health ID (e.g. RHC-2026-...)"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent patients */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-4 pt-4 pb-2">
              <SectionHeader title="Recent Patients" sub={search ? `Showing results for "${search}"` : 'Last visited'} />
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">No patients found</div>
              ) : filtered.map(p => (
                <PatientRow key={p.id} patient={p} onClick={() => navigate('patient-profile', p.id)} />
              ))}
            </div>
            {!search && (
              <div className="px-4 py-3 border-t border-gray-50">
                <button onClick={() => navigate('patient-profile')} className="text-sm text-brand-600 font-medium hover:underline">
                  View all patients →
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* High risk alerts */}
          <Card className="border-red-100">
            <div className="px-4 pt-4">
              <SectionHeader title="High-risk Alerts" sub="Require immediate attention" />
            </div>
            <div className="px-4 pb-4 space-y-3">
              {highRisk.map(p => (
                <button key={p.id} onClick={() => navigate('patient-profile', p.id)}
                  className="w-full text-left flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {p.name.split(' ').map((w: string) => w[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <RiskBadge level={p.riskLevel} size="sm" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Pending referrals */}
          <Card>
            <div className="px-4 pt-4">
              <SectionHeader title="Pending Referrals" />
            </div>
            <div className="px-4 pb-4 space-y-3">
              {pendingReferrals.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No pending referrals</p>
              ) : pendingReferrals.map(r => (
                <button key={r.id} onClick={() => navigate('referral')}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{r.patientName}</span>
                    <PriorityBadge priority={r.priority} />
                  </div>
                  <div className="text-xs text-gray-500 truncate">{r.toPHC}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <RiskBadge level={r.riskLevel} size="sm" />
                    <ReferralBadge status={r.status} />
                  </div>
                </button>
              ))}
              <button onClick={() => navigate('referral')} className="text-sm text-brand-600 font-medium hover:underline">
                View all referrals →
              </button>
            </div>
          </Card>

          {/* Sync status */}
          <div className={`rounded-2xl p-4 flex items-center justify-between ${isOffline ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-100'}`}>
            <div>
              <div className={`text-sm font-semibold ${isOffline ? 'text-amber-800' : 'text-green-800'}`}>
                {isOffline ? 'Offline — 4 pending' : 'All synced ✓'}
              </div>
              <div className={`text-xs mt-0.5 ${isOffline ? 'text-amber-600' : 'text-green-600'}`}>
                Last sync: Today, 08:00 AM
              </div>
            </div>
            <button onClick={() => navigate('sync')} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isOffline ? 'bg-amber-400 text-amber-900 hover:bg-amber-500' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
              {isOffline ? 'Retry' : 'Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Today's schedule */}
      <Card>
        <div className="px-4 pt-4">
          <SectionHeader title="Today's Schedule" sub={today} action={
            <button onClick={() => navigate('health-assessment')} className="text-xs text-brand-600 font-medium hover:underline">+ New Assessment</button>
          } />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Time', 'Patient', 'Village', 'Purpose', 'Risk', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { time: '08:20 AM', name: 'Mohan Lal', village: 'Deshnok', purpose: 'Emergency Assessment', risk: 'critical' as const, status: 'Referred' },
                { time: '09:40 AM', name: 'Ramesh Kumar', village: 'Khetolai', purpose: 'Chest pain evaluation', risk: 'critical' as const, status: 'Referred' },
                { time: '10:15 AM', name: 'Priya Devi', village: 'Govindpur', purpose: 'Anaemia follow-up', risk: 'moderate' as const, status: 'Completed' },
                { time: '11:30 AM', name: 'Kavita Sharma', village: 'Churi Ajitgarh', purpose: 'Routine check-up', risk: 'low' as const, status: 'Completed' },
                { time: '02:00 PM', name: 'Anita Meena', village: 'Govindpur', purpose: 'Vaccination', risk: 'low' as const, status: 'Scheduled' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('patient-profile')}>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{row.time}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{row.village}</td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs">{row.purpose}</td>
                  <td className="px-4 py-2.5"><RiskBadge level={row.risk} size="sm" /></td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${row.status === 'Completed' ? 'bg-green-50 text-green-700' : row.status === 'Referred' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
