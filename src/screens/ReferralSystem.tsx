import { useState, useEffect } from 'react';
import { REFERRALS, PATIENTS } from '../data';
import { RiskBadge, ReferralBadge, PriorityBadge, Card, Icon, SectionHeader } from '../components/shared';
import type { Referral } from '../types';
import { getReferrals, createReferral, updateReferralStatus } from '../api/client';

interface Props { navigate: (s: string) => void; }

const STATUS_STEPS: Referral['status'][] = ['pending', 'accepted', 'in-consultation', 'referred', 'completed'];

export default function ReferralSystem({ navigate }: Props) {
  const [referrals, setReferrals] = useState<Referral[]>(REFERRALS);
  const [selected, setSelected] = useState<Referral>(REFERRALS[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [creating, setCreating] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(PATIENTS[0].id);
  const [newPHC, setNewPHC] = useState('PHC Lunkaransar');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'emergency'>('urgent');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getReferrals()
      .then(items => {
        if (items && items.length > 0) {
          const mapped: Referral[] = items.map((r: any) => ({
            id: r.referralCode || r.id,
            patientId: r.patient?.healthId || r.patientId,
            patientName: r.patient?.name || 'Patient',
            fromWorker: r.fromWorkerName || 'Meena Kumari (ASHA)',
            toPHC: r.toFacilityName,
            reason: r.reason,
            riskLevel: (r.riskLevel?.toLowerCase() || 'moderate') as any,
            status: (r.status?.toLowerCase().replace('_', '-') || 'pending') as any,
            date: new Date(r.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            priority: (r.priority?.toLowerCase() || 'routine') as any,
            aiSummary: r.aiSummary,
          }));
          setReferrals(mapped);
          setSelected(mapped[0]);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = filterStatus === 'all' ? referrals : referrals.filter(r => r.status === filterStatus);
  const currentStepIdx = Math.max(0, STATUS_STEPS.indexOf(selected.status as Referral['status']));

  async function handleCreateReferral() {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const res = await createReferral({
        patientId: selectedPatientId,
        toFacilityName: newPHC,
        reason,
        priority,
      });
      if (res?.referral) {
        const newRef: Referral = {
          id: res.referral.referralCode || res.referral.id,
          patientId: selectedPatientId,
          patientName: PATIENTS.find(p => p.id === selectedPatientId)?.name || 'Patient',
          fromWorker: 'Meena Kumari (ASHA)',
          toPHC: newPHC,
          reason,
          riskLevel: (res.referral.riskLevel?.toLowerCase() || 'moderate') as any,
          status: 'pending',
          date: 'Today',
          priority,
          aiSummary: res.referral.aiSummary,
        };
        setReferrals(prev => [newRef, ...prev]);
        setSelected(newRef);
        setCreating(false);
        setReason('');
      }
    } catch {
      setCreating(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdvanceStatus() {
    const nextIdx = currentStepIdx + 1;
    if (nextIdx < STATUS_STEPS.length) {
      const nextStatus = STATUS_STEPS[nextIdx];
      updateReferralStatus(selected.id, nextStatus.toUpperCase()).catch(() => {});
      const updated = { ...selected, status: nextStatus };
      setSelected(updated);
      setReferrals(prev => prev.map(r => r.id === selected.id ? updated : r));
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Referral System</h1>
          <p className="text-sm text-gray-500">Track patient referrals and follow the care pathway (PostgreSQL API)</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors">
          <Icon name="plus" size={16} />
          New Referral
        </button>
      </div>

      {creating && (
        <Card className="p-5 border-brand-200 bg-brand-50">
          <SectionHeader title="Create New Referral" action={
            <button onClick={() => setCreating(false)} className="text-gray-400 hover:text-gray-600">
              <Icon name="x" size={18} />
            </button>
          } />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Patient</label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Destination PHC / Hospital</label>
              <select value={newPHC} onChange={e => setNewPHC(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                {['PHC Lunkaransar', 'PHC Kolayat', 'PHC Nokha', 'PHC Deshnok', 'District Hospital Bikaner', 'SMS Hospital Jaipur'].map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1">Reason for Referral</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={2}
                placeholder="Describe the clinical reason for referral..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Priority</label>
              <div className="flex gap-2">
                {(['routine', 'urgent', 'emergency'] as const).map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold uppercase transition-all ${priority === p ? p === 'emergency' ? 'bg-red-600 text-white border-red-600' : p === 'urgent' ? 'bg-amber-500 text-white border-amber-500' : 'bg-gray-600 text-white border-gray-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setCreating(false); navigate('ai-risk'); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-xl text-sm border border-blue-200">
              <Icon name="brain" size={14} /> Get AI Assessment First
            </button>
            <button
              onClick={handleCreateReferral}
              disabled={loading || !reason.trim()}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm"
            >
              {loading ? 'Submitting...' : 'Submit Referral to PostgreSQL'}
            </button>
          </div>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {['all', 'pending', 'accepted', 'in-consultation', 'completed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterStatus === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'all' ? 'All Referrals' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
            {s === 'all' && <span className="ml-1.5 bg-white/20 px-1.5 rounded text-white">{referrals.length}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Referral list */}
        <div className="space-y-3">
          {filtered.map(r => (
            <button key={r.id} onClick={() => setSelected(r)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selected.id === r.id ? 'border-brand-400 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-gray-900">{r.patientName}</span>
                <PriorityBadge priority={r.priority} />
              </div>
              <div className="text-xs text-gray-500 mb-1.5">{r.toPHC}</div>
              <div className="text-xs text-gray-600 truncate mb-2">{r.reason}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <RiskBadge level={r.riskLevel} size="sm" />
                <ReferralBadge status={r.status} />
              </div>
              <div className="font-mono text-[10px] text-gray-400 mt-2">{r.id} · {r.date}</div>
            </button>
          ))}
        </div>

        {/* Referral detail */}
        <div className="lg:col-span-2 space-y-4">
          {/* Referral header */}
          <Card className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-lg font-bold text-gray-900">{selected.patientName}</h2>
                  <PriorityBadge priority={selected.priority} />
                </div>
                <div className="font-mono text-xs text-gray-400">{selected.id}</div>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level={selected.riskLevel} size="lg" />
                {currentStepIdx < STATUS_STEPS.length - 1 && (
                  <button
                    onClick={handleAdvanceStatus}
                    className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold"
                  >
                    Advance Step →
                  </button>
                )}
              </div>
            </div>

            {/* Status flow */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 mb-3">REFERRAL PATHWAY</div>
              <div className="flex items-center">
                {STATUS_STEPS.map((s, i) => {
                  const isActive = i <= currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className={`flex flex-col items-center gap-1 ${i < STATUS_STEPS.length - 1 ? 'flex-1' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                          ${isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}
                          ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}>
                          {i < currentStepIdx ? <Icon name="check" size={11} /> : i + 1}
                        </div>
                        <div className={`text-[9px] text-center font-medium ${isActive ? 'text-brand-700' : 'text-gray-400'}`}>
                          {s.replace('-', ' ')}
                        </div>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-px mx-1 ${i < currentStepIdx ? 'bg-brand-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">From</div>
                <div className="text-sm text-gray-800">{selected.fromWorker}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">To</div>
                <div className="text-sm text-gray-800 font-medium">{selected.toPHC}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Date</div>
                <div className="text-sm text-gray-800">{selected.date}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Status</div>
                <ReferralBadge status={selected.status} />
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <div className="text-xs font-semibold text-gray-500 mb-1">Reason for Referral</div>
              <div className="text-sm text-gray-700">{selected.reason}</div>
            </div>

            {selected.aiSummary && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
                <Icon name="brain" size={15} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">{selected.aiSummary}</div>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => navigate('patient-profile')}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <Icon name="user" size={16} /> View Full Record
            </button>
            <button onClick={() => navigate('ai-risk')}
              className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-xl text-sm border border-blue-200 transition-colors flex items-center gap-2">
              <Icon name="brain" size={16} /> AI Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
