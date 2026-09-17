import { useState, useEffect } from 'react';
import { Icon, Card, HealthIDCard } from '../components/shared';

interface Props { navigate: (s: string) => void; }

const SYMPTOMS = [
  'Fever', 'Cough', 'Cold / Runny nose', 'Shortness of breath', 'Chest tightness', 'Chest pain',
  'Fatigue / Weakness', 'Dizziness', 'Headache', 'Nausea / Vomiting', 'Abdominal pain',
  'Diarrhoea', 'Loss of appetite', 'Joint pain', 'Back pain', 'Swelling (oedema)',
  'Skin rash', 'Blurred vision', 'Fainting', 'Palpitations',
];

export default function HealthAssessment({ navigate }: Props) {
  const [step, setStep] = useState<'patient' | 'vitals' | 'symptoms' | 'review'>('patient');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [vitals, setVitals] = useState({ temp: '', bp: '', hr: '', spo2: '', weight: '' });
  const [obs, setObs] = useState('');
  const [realPatients, setRealPatients] = useState<any[]>([]);
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    import('../imports/api').then(({ patients, auth, getToken }) => {
      const token = getToken() || undefined;
      auth.getCurrentUser(token).then((res: any) => {
        if (res.data?.user) {
          setDbUser(res.data.user);
          if (res.data.user.role === 'PATIENT') {
            // If patient, they can only assess themselves
            setStep('vitals');
          } else {
            patients.get(token).then((res: any) => {
              if (res.data?.patients?.length > 0) setRealPatients(res.data.patients);
            }).catch((e: any) => console.error(e));
          }
        }
      }).catch((e: any) => console.error(e));
    });
  }, []);

  function toggleSymptom(s: string) {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white font-mono";

  function isAbnormal(field: string, val: string): boolean {
    if (!val) return false;
    const n = parseFloat(val);
    if (field === 'temp' && (n < 36 || n > 37.5)) return true;
    if (field === 'hr' && (n < 60 || n > 100)) return true;
    if (field === 'spo2' && n < 95) return true;
    return false;
  }

  const steps = ['Patient', 'Vitals', 'Symptoms', 'Review'];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('worker-dashboard')} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          <Icon name="chevron_right" size={18} className="rotate-180 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">New Health Assessment</h1>
          <p className="text-xs text-gray-500">Guided assessment with AI-assisted risk evaluation</p>
        </div>
      </div>

      {/* Step bar */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => {
          const idx = steps.indexOf(step.charAt(0).toUpperCase() + step.slice(1).replace('-', ''));
          const isCurrent = steps[i] === (step.charAt(0).toUpperCase() + step.slice(1));
          const isDone = i < steps.indexOf(step.charAt(0).toUpperCase() + step.slice(1));
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                ${isDone ? 'bg-brand-600 text-white' : isCurrent ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-gray-100 text-gray-400'}`}>
                {isDone ? <Icon name="check" size={13} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${isCurrent ? 'text-brand-700 font-semibold' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${isDone ? 'bg-brand-400' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>

      <Card className="p-6 shadow-sm">
        {/* Patient selection step */}
        {step === 'patient' && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-gray-800">Select Patient</h2>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Search by Name or Health ID</label>
              <div className="relative">
                <Icon name="search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input placeholder="RHC-2026-... or Patient Name" className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
            <div className="space-y-2">
              {(realPatients.length > 0 ? realPatients : [
                { id: 'RHC-2026-3M9P71', name: 'Ramesh Kumar', age: 45, village: 'Khetolai' },
                { id: 'RHC-2026-8F4K92', name: 'Priya Devi', age: 28, village: 'Govindpur' },
                { id: 'RHC-2026-2K8Q15', name: 'Mohan Lal', age: 67, village: 'Deshnok' },
              ]).map((p: any) => (
                <button key={p.id || p.healthId} onClick={() => setStep('vitals')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-300 hover:bg-brand-50 transition-all text-left">
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
                    {(p.name || 'P').split(' ').map((w: string) => w[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.age || '--'} · {p.village || p.address || 'N/A'}</div>
                    <div className="font-mono text-[10px] text-gray-400">{p.healthId || p.id}</div>
                  </div>
                  <Icon name="chevron_right" size={15} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vitals step */}
        {step === 'vitals' && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display font-semibold text-gray-800">Record Vitals</h2>
              <div className="mt-1">
                <HealthIDCard id="RHC-2026-3M9P71" name="Ramesh Kumar, 45M" size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Temperature (°C)
                  {vitals.temp && isAbnormal('temp', vitals.temp) && <span className="ml-2 text-amber-600 font-semibold">⚠ Abnormal</span>}
                </label>
                <input value={vitals.temp} onChange={e => setVitals(v => ({ ...v, temp: e.target.value }))}
                  placeholder="37.4" className={`${inputClass} ${vitals.temp && isAbnormal('temp', vitals.temp) ? 'border-amber-400 bg-amber-50' : ''}`} />
                <div className="text-[10px] text-gray-400 mt-1">Normal: 36.0 – 37.5°C</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Blood Pressure (mmHg)</label>
                <input value={vitals.bp} onChange={e => setVitals(v => ({ ...v, bp: e.target.value }))}
                  placeholder="120/80" className={inputClass} />
                <div className="text-[10px] text-gray-400 mt-1">Systolic / Diastolic</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Heart Rate (bpm)
                  {vitals.hr && isAbnormal('hr', vitals.hr) && <span className="ml-2 text-amber-600 font-semibold">⚠</span>}
                </label>
                <input value={vitals.hr} onChange={e => setVitals(v => ({ ...v, hr: e.target.value }))}
                  placeholder="78" className={`${inputClass} ${vitals.hr && isAbnormal('hr', vitals.hr) ? 'border-amber-400 bg-amber-50' : ''}`} />
                <div className="text-[10px] text-gray-400 mt-1">Normal: 60 – 100 bpm</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  SpO₂ (%)
                  {vitals.spo2 && isAbnormal('spo2', vitals.spo2) && <span className="ml-2 text-red-600 font-semibold">⚠ Critical</span>}
                </label>
                <input value={vitals.spo2} onChange={e => setVitals(v => ({ ...v, spo2: e.target.value }))}
                  placeholder="98" className={`${inputClass} ${vitals.spo2 && isAbnormal('spo2', vitals.spo2) ? 'border-red-400 bg-red-50' : ''}`} />
                <div className="text-[10px] text-gray-400 mt-1">Normal: ≥ 95%</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Weight (kg)</label>
                <input value={vitals.weight} onChange={e => setVitals(v => ({ ...v, weight: e.target.value }))}
                  placeholder="65" className={inputClass} />
              </div>
            </div>

            {vitals.spo2 && isAbnormal('spo2', vitals.spo2) && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <Icon name="alert" size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-800">
                  <strong>Low SpO₂ detected.</strong> Ensure correct placement of pulse oximeter. If reading is accurate, escalate immediately.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Symptoms step */}
        {step === 'symptoms' && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-gray-800">Current Symptoms</h2>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">Select all that apply:</label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${selectedSymptoms.includes(s) ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300 bg-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Duration of Symptoms</label>
              <div className="flex gap-2">
                {['< 24 hrs', '1–3 days', '4–7 days', '1–2 weeks', '> 2 weeks'].map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${duration === d ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Observations & Notes</label>
              <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3}
                placeholder="Relevant clinical observations, patient history context, environmental factors..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
            </div>
            {selectedSymptoms.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl">
                <Icon name="info" size={14} className="text-brand-600" />
                <span className="text-xs text-brand-700">{selectedSymptoms.length} symptoms selected · Duration: {duration || 'not specified'}</span>
              </div>
            )}
          </div>
        )}

        {/* Review step */}
        {step === 'review' && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-gray-800">Review & Submit</h2>
            <HealthIDCard id="RHC-2026-3M9P71" name="Ramesh Kumar, 45M" />
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-xs font-semibold text-gray-500 mb-2">VITALS</div>
                <div className="space-y-1 text-xs text-gray-700">
                  <div>Temp: <strong>{vitals.temp || '—'}°C</strong></div>
                  <div>BP: <strong>{vitals.bp || '—'} mmHg</strong></div>
                  <div>HR: <strong>{vitals.hr || '—'} bpm</strong></div>
                  <div>SpO₂: <strong className={isAbnormal('spo2', vitals.spo2) ? 'text-red-600' : ''}>{vitals.spo2 || '—'}%</strong></div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-xs font-semibold text-gray-500 mb-2">SYMPTOMS ({selectedSymptoms.length})</div>
                <div className="flex flex-wrap gap-1">
                  {selectedSymptoms.length > 0 ? selectedSymptoms.map(s => (
                    <span key={s} className="text-[10px] bg-brand-100 text-brand-700 rounded px-1.5 py-0.5">{s}</span>
                  )) : <span className="text-xs text-gray-400">None recorded</span>}
                </div>
              </div>
            </div>
            {obs && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-xs font-semibold text-gray-500 mb-1">OBSERVATIONS</div>
                <div className="text-xs text-gray-700">{obs}</div>
              </div>
            )}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
              <Icon name="brain" size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <strong>AI Risk Assessment</strong> will be automatically generated based on vitals, symptoms, and patient history. You can review it before confirming the referral.
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="flex gap-3">
            {step !== 'patient' && (
              <button onClick={() => setStep(s => s === 'review' ? 'symptoms' : s === 'symptoms' ? 'vitals' : 'patient')}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Back
              </button>
            )}
            <button
              onClick={async () => {
                if (step === 'patient') setStep('vitals');
                else if (step === 'vitals') setStep('symptoms');
                else if (step === 'symptoms') setStep('review');
                else {
                  // Call API
                  try {
                    const { assessments, getToken } = await import('../imports/api');
                    const payload = {
                      patientId: 'RHC-2026-3M9P71', // hardcoded for demo
                      symptoms: selectedSymptoms,
                      vitals,
                      obs
                    };
                    const res = await assessments.generate(payload, getToken() || undefined);
                    if(res?.data?.assessment) {
                      localStorage.setItem('latestAssessment', JSON.stringify(res.data.assessment));
                      navigate('ai-risk');
                    }
                  } catch(e) {
                    console.error(e);
                    navigate('ai-risk');
                  }
                }
              }}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              {step === 'review' ? (
                <><Icon name="brain" size={16} /> Generate AI Risk Assessment</>
              ) : (
                <>Continue <Icon name="chevron_right" size={16} /></>
              )}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
