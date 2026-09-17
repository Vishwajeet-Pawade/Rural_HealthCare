import { useState, useEffect } from 'react';
import { PATIENTS, REFERRALS } from '../data';
import { StatCard, RiskBadge, PriorityBadge, ReferralBadge, PatientRow, Card, SectionHeader, Icon, HPRBadge, HFRBadge, DutyStatusBadge, ABDMLayerLegend } from '../components/shared';

interface SOSAlert {
  id: string; from: string; role: string; patientId: string; location: string;
  ts: string; offline: boolean; dismissed: boolean;
  status: 'sent' | 'notified' | 'awaiting' | 'acknowledged' | 'declined' | 'escalated';
  escalationLevel: number;
}
interface Props {
  navigate: (s: string) => void;
  sosAlerts?: SOSAlert[];
  onDismissSOS?: (id: string) => void;
  onAcknowledgeSOS?: (id: string) => void;
  onDeclineSOS?: (id: string) => void;
}

type DutyStatus = 'available' | 'busy' | 'offline';

const STATUS_OPTIONS: { value: DutyStatus; label: string; sub: string; dot: string; bg: string; text: string; border: string }[] = [
  { value: 'available', label: 'Available', sub: 'Accepting patients & SOS', dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
  { value: 'busy',      label: 'Busy',      sub: 'In consultation — limited', dot: 'bg-amber-500', bg: 'bg-amber-50',  text: 'text-amber-800', border: 'border-amber-300' },
  { value: 'offline',   label: 'Off Duty',  sub: 'Not available for SOS',     dot: 'bg-gray-400',  bg: 'bg-gray-50',   text: 'text-gray-700',  border: 'border-gray-300' },
];

export default function DoctorDashboard({ navigate, sosAlerts = [], onDismissSOS, onAcknowledgeSOS, onDeclineSOS }: Props) {
  const [search, setSearch] = useState('');
  const [myStatus, setMyStatus] = useState<DutyStatus>('available');
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [realReferrals, setRealReferrals] = useState<any[]>([]);
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    import('../imports/api').then(({ referrals, auth, getToken }) => {
      const token = getToken() || undefined;
      referrals.get(token).then(res => {
        if(res.data?.referrals?.length > 0) {
          const mapped = res.data.referrals.map((r: any) => ({
            ...r,
            status: r.status.toLowerCase(),
            priority: r.priority.toLowerCase(),
            riskLevel: r.riskLevel.toLowerCase(),
          }));
          setRealReferrals(mapped);
        }
      }).catch(e => console.error("Failed to load referrals", e));

      auth.getCurrentUser(token).then((res: any) => {
        if (res.data?.user) setDbUser(res.data.user);
      }).catch((e: any) => console.error("Failed to load user", e));
    });
  }, []);

  const baseReferrals = realReferrals.length > 0 ? realReferrals : [];
  const pendingReferrals = baseReferrals.filter((r: any) => r.status === 'pending' || r.status === 'accepted');
  const isMock = !dbUser;

  // Use mock only if not logged in (dev preview)
  const mockReferrals = isMock ? REFERRALS.filter((r: any) => r.status === 'pending' || r.status === 'accepted') : [];
  const displayReferrals = isMock ? mockReferrals : pendingReferrals;

  const criticalPatients = isMock ? PATIENTS.filter((p: any) => p.riskLevel === 'critical' || p.riskLevel === 'high') : [];

  const doctorName = dbUser?.fullName || 'Dr. Ankit Sharma';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="font-display text-2xl font-bold text-gray-900">{doctorName}</h1>
            <HPRBadge id={dbUser?.doctorProfile?.healthId || "HPR-PENDING"} />
            {/* Clickable availability status */}
            <div className="relative">
              <button
                onClick={() => setStatusPickerOpen(o => !o)}
                className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-semibold transition-colors ${STATUS_OPTIONS.find(s => s.value === myStatus)!.bg} ${STATUS_OPTIONS.find(s => s.value === myStatus)!.text} ${STATUS_OPTIONS.find(s => s.value === myStatus)!.border} hover:opacity-80`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_OPTIONS.find(s => s.value === myStatus)!.dot} ${myStatus === 'available' ? 'animate-pulse' : ''}`} />
                {STATUS_OPTIONS.find(s => s.value === myStatus)!.label}
                <Icon name="chevron_down" size={11} className={`transition-transform ${statusPickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {statusPickerOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 overflow-hidden">
                  <div className="px-3 pt-3 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Set Your Availability</div>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setMyStatus(opt.value); setStatusPickerOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left ${myStatus === opt.value ? 'bg-gray-50' : ''}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                        <div className="text-[10px] text-gray-500">{opt.sub}</div>
                      </div>
                      {myStatus === opt.value && <Icon name="check" size={14} className="text-brand-600 shrink-0" />}
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t border-gray-100">
                    <p className="text-[9px] text-gray-400">Status is visible to ASHA workers and used for SOS routing. Logged in audit trail.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-500">{dbUser?.doctorProfile?.facility || 'PHC / Hospital'} · {dbUser?.doctorProfile?.specialty || 'General Medicine'} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <HFRBadge id={dbUser?.doctorProfile?.hfrId || "HFR-PENDING"} compact />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-700 font-semibold flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            PHC Staff Mode
          </div>
          <button onClick={() => navigate('emergency-access')}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors">
            <Icon name="alert" size={13} />
            Emergency Access
          </button>
        </div>
      </div>

      {/* ABDM identity layer legend */}
      <ABDMLayerLegend />

      {/* SOS incoming alerts — with Accept / Decline workflow */}
      {sosAlerts.length > 0 && (
        <div className="space-y-3">
          {sosAlerts.map(sos => (
            <div key={sos.id} className={`rounded-2xl shadow-lg overflow-hidden ${sos.status === 'acknowledged' ? 'shadow-green-200' : 'shadow-red-200'}`}>
              {/* Alert header */}
              <div className={`flex items-start gap-3 px-4 py-4 ${sos.status === 'acknowledged' ? 'bg-green-600' : 'bg-red-600 animate-pulse'} text-white`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sos.status === 'acknowledged' ? 'bg-green-500' : 'bg-red-500'}`}>
                  <Icon name={sos.status === 'acknowledged' ? 'check' : 'alert'} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-base">
                    {sos.status === 'acknowledged' ? '✓ SOS ACKNOWLEDGED — You are Responding' : '🚨 EMERGENCY SOS RECEIVED'}
                  </div>
                  <div className="text-red-100 text-xs mt-0.5">
                    <strong>{sos.from}</strong> · {sos.ts} · {sos.location}
                  </div>
                  <div className="font-mono text-xs text-red-200 mt-0.5">{sos.patientId}</div>
                  {sos.offline && <div className="text-xs text-red-200 mt-0.5">⚠ Transmitted from offline device — GPS approximate</div>}
                </div>
              </div>

              {/* SOS workflow body */}
              <div className="bg-white border-x border-b border-red-100 rounded-b-2xl px-4 py-3 space-y-3">
                <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                  <Icon name="info" size={13} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800">
                    <strong>HPR verifies doctor identity.</strong> RuralCare shows duty status. Being listed as on-duty does not guarantee physical presence — your acceptance confirms you are actively responding.
                  </p>
                </div>

                {/* Actions */}
                {sos.status === 'acknowledged' ? (
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('emergency-access')}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2">
                      <Icon name="clipboard" size={14} />
                      Open Emergency Access
                    </button>
                    <button onClick={() => onDismissSOS?.(sos.id)}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs transition-colors">
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onAcknowledgeSOS?.(sos.id); navigate('emergency-access'); }}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2">
                      <Icon name="check" size={14} />
                      ACCEPT — RESPOND
                    </button>
                    <button
                      onClick={() => onDeclineSOS?.(sos.id)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 hover:border-red-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2">
                      <Icon name="x" size={14} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="New Referrals" value={displayReferrals.length} sub="Awaiting review" icon="share" color="amber" />
        <StatCard label="Today's Patients" value={isMock ? "14" : "0"} sub={isMock ? "6 completed" : "Start by adding assessment"} icon="users" color="brand" />
        <StatCard label="High-risk Cases" value={criticalPatients.length} sub="Under monitoring" icon="alert" color="red" />
        <StatCard label="Pending Follow-ups" value={isMock ? "8" : "0"} sub={isMock ? "3 overdue" : "No follow-ups yet"} icon="history" color="purple" />
      </div>

      {/* Patient search */}
      <div className="relative">
        <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search patient by name or Health ID"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* New referrals – urgent attention */}
          <Card>
            <div className="px-4 pt-4">
              <SectionHeader title="New Referrals" sub="Requires immediate review" action={
                <button onClick={() => navigate('referral')} className="text-xs text-brand-600 font-medium hover:underline">View all</button>
              } />
            </div>
            <div className="divide-y divide-gray-50">
              {displayReferrals.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No pending referrals.</div>
              ) : displayReferrals.map((r: any) => (
                <button key={r.id} onClick={() => navigate('doctor-patient-view')}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group">
                  <div className={`w-2 h-12 rounded-full shrink-0 ${r.priority === 'emergency' ? 'bg-red-500' : r.priority === 'urgent' ? 'bg-amber-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900">{r.patientName}</span>
                      <PriorityBadge priority={r.priority} />
                      <RiskBadge level={r.riskLevel} size="sm" />
                    </div>
                    <div className="text-xs text-gray-500 truncate">{r.reason}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <ReferralBadge status={r.status} />
                      <span className="text-[10px] text-gray-400 font-mono">{r.id} · {r.date}</span>
                    </div>
                  </div>
                  <Icon name="chevron_right" size={16} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                </button>
              ))}
            </div>
          </Card>

          {/* Today's schedule */}
          <Card>
            <div className="px-4 pt-4">
              <SectionHeader title="Today's Consultations" sub={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
            </div>
            <div className="overflow-x-auto">
              {isMock ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Time', 'Patient', 'Age/Gender', 'Purpose', 'Risk', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { time: '09:00', name: 'Mohan Lal', ag: '67M', purpose: 'Emergency – COPD', risk: 'critical' as const, status: 'In Progress' },
                      { time: '09:40', name: 'Ramesh Kumar', ag: '45M', purpose: 'Chest pain eval.', risk: 'critical' as const, status: 'Waiting' },
                      { time: '10:30', name: 'Priya Devi', ag: '28F', purpose: 'Anaemia review', risk: 'moderate' as const, status: 'Completed' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('doctor-patient-view')}>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{row.time}</td>
                        <td className="px-4 py-2.5 font-medium text-sm text-gray-900">{row.name}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{row.ag}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{row.purpose}</td>
                        <td className="px-4 py-2.5"><RiskBadge level={row.risk} size="sm" /></td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${row.status === 'Completed' ? 'bg-green-50 text-green-700' : row.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm">
                  <Icon name="clipboard" size={24} className="mx-auto mb-2 text-gray-300" />
                  No consultations recorded yet. Use <strong>New Assessment</strong> to start.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Critical patients */}
          <Card className="border-red-100">
            <div className="px-4 pt-4">
              <SectionHeader title="Critical Patients" />
            </div>
            <div className="px-4 pb-4 space-y-3">
              {criticalPatients.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-3">No critical patients assigned.</div>
              ) : criticalPatients.map((p: any) => (
                <button key={p.id} onClick={() => navigate('doctor-patient-view')}
                  className="w-full text-left flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-red-200 text-red-800 flex items-center justify-center font-bold text-xs">
                      {p.name.split(' ').map((w: string) => w[0]).join('').slice(0,2)}
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.age}{p.gender} · {p.village}</div>
                    <RiskBadge level={p.riskLevel} size="sm" />
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Quick patient lookup */}
          <Card className="p-4">
            <SectionHeader title="Quick Lookup" sub="Enter patient Health ID" />
            <div className="flex gap-2">
              <input placeholder="RHC-2026-..." className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <button onClick={() => navigate('doctor-patient-view')}
                className="px-3 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors">
                <Icon name="search" size={14} />
              </button>
            </div>
          </Card>

          {/* Follow-ups */}
          <Card className="p-4">
            <SectionHeader title="Follow-ups Due" />
            <div className="space-y-2">
              {isMock ? [
                { name: 'Priya Devi', date: '28 Sep 2026', type: 'Haematology review' },
                { name: 'Ramesh Kumar', date: '14 Sep 2026', type: 'Cardiac follow-up' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('doctor-patient-view')}>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-900">{f.name}</div>
                    <div className="text-[10px] text-gray-500">{f.date} · {f.type}</div>
                  </div>
                </div>
              )) : (
                <div className="text-xs text-gray-400 text-center py-3">No follow-ups scheduled yet.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
