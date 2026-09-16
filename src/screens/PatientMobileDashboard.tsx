import { useState } from 'react';
import { Icon, HealthIDCard, ConsentBadge, RiskBadge, Card, PermissionBadge, RecordOwnershipBanner } from '../components/shared';

interface Props { navigate: (s: string) => void; onSOS: () => void; }

const QR_GRID = Array.from({ length: 7 }, (_, row) =>
  Array.from({ length: 7 }, (_, col) => {
    if ((row < 3 && col < 3) || (row < 3 && col > 3) || (row > 3 && col < 3)) return 'corner';
    const pattern = (row * 7 + col) % 3 !== 0;
    return pattern ? 'dark' : 'light';
  })
);

const FULL_HISTORY = [
  {
    id: 'CON-2026-001', date: '29 Aug 2026', time: '10:15 AM',
    recordedBy: 'Meena Kumari (ASHA)', reviewedBy: 'Dr. Ankit Sharma',
    facility: 'PHC Lunkaransar',
    symptoms: ['Fatigue', 'Dizziness', 'Pale skin', 'Shortness of breath'],
    vitals: { bp: '108/70 mmHg', hr: '92 bpm', temp: '37.1°C', spo2: '97%', wt: '51 kg' },
    diagnosis: 'Moderate Anaemia – likely dietary iron deficiency',
    prescription: ['Ferrous Sulphate 200 mg (TDS × 3 months)', 'Folic Acid 5 mg (OD × 3 months)', 'Vitamin C 500 mg (OD)'],
    notes: 'Haemoglobin: 8.6 g/dL. Referred for complete blood count at PHC.',
    risk: 'moderate' as const, followUp: '28 Sep 2026',
  },
  {
    id: 'CON-2026-B02', date: '22 Jul 2026', time: '09:30 AM',
    recordedBy: 'Meena Kumari (ASHA)', reviewedBy: 'Dr. Priya Mehta',
    facility: 'CHC Bikaner',
    symptoms: ['Fatigue', 'Weight gain', 'Cold intolerance'],
    vitals: { bp: '112/74 mmHg', hr: '68 bpm', temp: '36.9°C', spo2: '98%', wt: '52 kg' },
    diagnosis: 'Hypothyroidism – TSH within range on current dose',
    prescription: ['Thyronorm 25 mcg (OD – empty stomach) — continued'],
    notes: 'TSH: 3.2 mIU/L. Dose maintained. Review in 3 months.',
    risk: 'low' as const, followUp: '22 Oct 2026',
  },
  {
    id: 'CON-2026-B01', date: '14 May 2026', time: '11:00 AM',
    recordedBy: 'Meena Kumari (ASHA)', reviewedBy: 'Dr. Priya Mehta',
    facility: 'CHC Bikaner',
    symptoms: ['Fatigue', 'Hair loss', 'Constipation', 'Feeling cold'],
    vitals: { bp: '110/72 mmHg', hr: '64 bpm', temp: '36.7°C', spo2: '99%', wt: '53 kg' },
    diagnosis: 'Hypothyroidism (newly diagnosed) – TSH: 8.2 mIU/L',
    prescription: ['Thyronorm 25 mcg (OD – empty stomach)'],
    notes: 'Thyroid function test done at CHC lab. Started levothyroxine. Follow-up TSH in 3 months.',
    risk: 'low' as const, followUp: '22 Jul 2026',
  },
];

const LAB_REPORTS = [
  { date: '29 Aug 2026', name: 'Complete Blood Count (CBC)', by: 'PHC Lunkaransar Lab', result: 'Hb: 8.6 g/dL · MCV: 72 fL · MCH: 22 pg', status: 'abnormal' },
  { date: '22 Jul 2026', name: 'Thyroid Function Test (TFT)', by: 'CHC Bikaner Lab', result: 'TSH: 3.2 mIU/L · T3: Normal · T4: Normal', status: 'normal' },
  { date: '14 May 2026', name: 'Thyroid Function Test (TFT)', by: 'CHC Bikaner Lab', result: 'TSH: 8.2 mIU/L · T3: Low · T4: Low', status: 'abnormal' },
];

export default function PatientMobileDashboard({ navigate, onSOS }: Props) {
  const [sosConfirm, setSosConfirm] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* SOS confirm modal */}
      {sosConfirm && !sosSent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Icon name="alert" size={28} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900">Send Emergency SOS?</h3>
              <p className="text-sm text-gray-500 mt-1">This will immediately alert your ASHA worker and duty doctor with your Health ID and GPS location.</p>
              <p className="text-xs text-brand-600 bg-brand-50 rounded-xl px-3 py-2 mt-2">Works offline — SOS is stored locally and sent as soon as connectivity is available.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSosConfirm(false)} className="py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={() => { onSOS(); setSosSent(true); setSosConfirm(false); }}
                className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm">Send SOS</button>
            </div>
          </div>
        </div>
      )}

      {/* SOS sent */}
      {sosSent && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <p className="flex-1 text-xs text-red-700 font-medium">SOS sent — Dr. Ankit Sharma & ASHA Meena Kumari have been alerted.</p>
          <button onClick={() => setSosSent(false)}><Icon name="x" size={13} className="text-gray-400" /></button>
        </div>
      )}

      {/* Record ownership notice */}
      <RecordOwnershipBanner />

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Priya Devi</h1>
          <p className="text-xs text-gray-500">Patient · Govindpur, Bikaner</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Icon name="bell" size={18} className="text-gray-600" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">PD</div>
          {/* SOS */}
          <button onClick={() => setSosConfirm(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl text-xs shadow-md shadow-red-200 transition-all">
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
            <Icon name="alert" size={14} />SOS
          </button>
        </div>
      </div>

      {/* Health ID + QR */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-600 rounded-3xl p-5 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-brand-200 text-xs font-medium mb-1">My Health ID</div>
            <div className="font-mono text-lg font-bold tracking-wider">RHC-2026-8F4K92</div>
            <div className="text-brand-200 text-xs mt-1">Priya Devi · 28F · O+</div>
          </div>
          {/* Mini QR placeholder */}
          <div className="w-16 h-16 bg-white rounded-xl p-1.5 shrink-0">
            <div className="grid grid-cols-5 gap-px h-full">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`rounded-sm ${[0,1,2,5,10,14,15,16,20,24,6,7,8,22,23].includes(i) ? 'bg-gray-900' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level="moderate" />
          <ConsentBadge status="granted" />
        </div>
        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors">
            <Icon name="qr" size={13} /> Show QR
          </button>
          <button className="flex-1 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors">
            <Icon name="share" size={13} /> Share
          </button>
        </div>
      </div>

      {/* SOS — large accessible button */}
      <button onClick={() => setSosConfirm(true)}
        className="relative w-full py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-2xl text-base shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-3">
        <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
        <Icon name="alert" size={22} />
        EMERGENCY SOS
        <span className="text-red-200 text-xs font-normal">· Works offline</span>
      </button>

      {/* Quick nav */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Records', icon: 'clipboard', color: 'bg-brand-50 text-brand-700', screen: null },
          { label: 'Medicines', icon: 'pill', color: 'bg-purple-50 text-purple-700', screen: null },
          { label: 'Consent', icon: 'shield', color: 'bg-green-50 text-green-700', screen: 'consent' },
          { label: 'Access Log', icon: 'eye', color: 'bg-amber-50 text-amber-700', screen: 'access-history' },
        ].map(item => (
          <button key={item.label} onClick={() => item.screen && navigate(item.screen)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${item.color} hover:opacity-80 transition-opacity`}>
            <Icon name={item.icon} size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Upcoming follow-up */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
          <Icon name="history" size={18} className="text-brand-600" />
        </div>
        <div>
          <div className="text-xs font-semibold text-brand-700">Upcoming Follow-up</div>
          <div className="font-display font-bold text-gray-900 mt-0.5">28 September 2026</div>
          <div className="text-xs text-gray-500">PHC Lunkaransar · Dr. Ankit Sharma</div>
          <div className="text-xs text-brand-600 mt-1">Haematology review + iron response check</div>
        </div>
      </div>

      {/* My Health Record — full longitudinal history */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-gray-900">My Health Record</h2>
            <p className="text-xs text-gray-500 mt-0.5">{FULL_HISTORY.length} consultations · longitudinal history</p>
          </div>
          <PermissionBadge type="view-only" />
        </div>

        <RecordOwnershipBanner />

        {/* Consultation timeline — expandable cards */}
        {FULL_HISTORY.map((entry) => {
          const isExpanded = expandedConsultation === entry.id;
          return (
            <Card key={entry.id} className="overflow-hidden">
              {/* Card header — always visible */}
              <button
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedConsultation(isExpanded ? null : entry.id)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${entry.risk === 'moderate' ? 'bg-amber-100' : 'bg-green-100'}`}>
                  <Icon name="clipboard" size={16} className={entry.risk === 'moderate' ? 'text-amber-700' : 'text-green-700'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 truncate">{entry.diagnosis}</span>
                    <RiskBadge level={entry.risk} size="sm" />
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {entry.date} · {entry.time} · {entry.facility}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Recorded by: <span className="font-medium">{entry.recordedBy}</span>
                    {entry.reviewedBy && <> · Reviewed by: <span className="font-medium">{entry.reviewedBy}</span></>}
                  </div>
                </div>
                <Icon name="chevron_down" size={16} className={`text-gray-400 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {/* Symptoms */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Symptoms</span>
                      <PermissionBadge type="asha-recorded" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.symptoms.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg text-xs">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vitals</span>
                      <PermissionBadge type="asha-recorded" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(entry.vitals).map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                          <div className="font-mono text-xs font-bold text-gray-800">{v}</div>
                          <div className="text-[9px] text-gray-400 capitalize">{k === 'bp' ? 'Blood Pressure' : k === 'hr' ? 'Heart Rate' : k === 'temp' ? 'Temp' : k === 'spo2' ? 'SpO₂' : 'Weight'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div className="px-4 py-3 bg-purple-50/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Diagnosis</span>
                      <PermissionBadge type="doctor-editable" />
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{entry.diagnosis}</p>
                    {entry.notes && <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>}
                  </div>

                  {/* Prescription */}
                  <div className="px-4 py-3 bg-blue-50/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Prescription</span>
                      <PermissionBadge type="doctor-editable" />
                    </div>
                    <ul className="space-y-1">
                      {entry.prescription.map(rx => (
                        <li key={rx} className="flex items-start gap-2 text-xs text-gray-700">
                          <Icon name="pill" size={11} className="text-blue-500 shrink-0 mt-0.5" />
                          {rx}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Follow-up */}
                  {entry.followUp && (
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon name="history" size={13} className="text-brand-500 shrink-0" />
                        <span className="text-xs text-gray-700">Follow-up scheduled: <strong>{entry.followUp}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {/* Lab Reports */}
        <Card>
          <div className="px-4 pt-4 pb-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-gray-900">Lab & Test Reports</h3>
              <PermissionBadge type="clinician-only" />
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {LAB_REPORTS.map((r, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.status === 'abnormal' ? 'bg-red-50' : 'bg-green-50'}`}>
                  <Icon name="document" size={14} className={r.status === 'abnormal' ? 'text-red-500' : 'text-green-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">{r.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${r.status === 'abnormal' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.status}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{r.date} · {r.by}</div>
                  <div className="text-xs text-gray-700 mt-0.5 font-mono">{r.result}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Request correction */}
        <button className="w-full flex items-center gap-2.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl hover:border-brand-200 hover:bg-brand-50 transition-all text-left">
          <Icon name="document" size={16} className="text-gray-500 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">Request Correction / Update</div>
            <div className="text-[10px] text-gray-400">Flag an error for review by your healthcare provider</div>
          </div>
          <Icon name="chevron_right" size={14} className="text-gray-400 shrink-0" />
        </button>
      </div>

      {/* Current medicines */}
      <Card>
        <div className="p-4">
          <div className="font-display font-semibold text-gray-800 mb-3">My Medicines</div>
          <div className="space-y-2">
            {[
              { name: 'Thyronorm 25 mcg', dosage: 'Once daily – morning (empty stomach)' },
              { name: 'Ferrous Sulphate 200 mg', dosage: 'Three times daily – after meals' },
              { name: 'Folic Acid 5 mg', dosage: 'Once daily – after meals' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="pill" size={14} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{m.name}</div>
                  <div className="text-[10px] text-gray-500">{m.dosage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Referral status */}
      <Card>
        <div className="p-4">
          <div className="font-display font-semibold text-gray-800 mb-3">Referral Status</div>
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
            <Icon name="check" size={16} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-900">PHC Lunkaransar – Completed</div>
              <div className="text-xs text-gray-500">Anaemia evaluation · 29 Aug 2026</div>
              <div className="text-xs text-green-700 mt-0.5">Follow-up scheduled: 28 Sep 2026</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy summary */}
      <button onClick={() => navigate('consent')}
        className="w-full flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-brand-200 hover:bg-brand-50 transition-all text-left">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
          <Icon name="shield" size={18} className="text-green-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">Privacy & Consent</div>
          <div className="text-xs text-gray-500">2 providers have access · 1 temporary</div>
        </div>
        <Icon name="chevron_right" size={16} className="text-gray-400" />
      </button>

      {/* Emergency access notification */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
          <Icon name="alert" size={18} className="text-red-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-red-800">Emergency Access Used</div>
          <div className="text-xs text-red-700 mt-0.5">Dr. Ankit Sharma accessed your emergency medical summary on 31 Aug 2026 at 14:32 — Reason: Patient unconscious</div>
          <button onClick={() => navigate('access-history')} className="text-xs text-red-600 font-semibold mt-1.5 hover:underline">View in Access History →</button>
        </div>
      </div>

      {/* Access request alert */}
      <button onClick={() => navigate('access-request')}
        className="w-full flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors text-left">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <Icon name="bell" size={18} className="text-amber-700" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-amber-900">New Access Request</div>
          <div className="text-xs text-amber-700">Dr. Ankit Sharma is requesting access</div>
        </div>
        <Icon name="chevron_right" size={16} className="text-amber-500" />
      </button>
    </div>
  );
}
