import { useState } from 'react';
import { CONSENT_ENTRIES } from '../data';
import { ConsentBadge, HealthIDCard, Card, Icon, SectionHeader } from '../components/shared';
import type { ConsentEntry } from '../types';

interface Props { navigate: (s: string) => void; }

export default function ConsentManagement({ navigate }: Props) {
  const [consents, setConsents] = useState<ConsentEntry[]>(CONSENT_ENTRIES);
  const [showGrant, setShowGrant] = useState(false);
  const [selectedScope, setSelectedScope] = useState<string[]>(['Vitals', 'Consultations']);

  const dataScopes = ['Full Medical History', 'Diagnoses', 'Lab Reports', 'Medications', 'Vitals', 'Consultations', 'Referrals', 'Follow-up Records', 'Documents', 'Contact Information'];

  function toggleScope(scope: string) {
    setSelectedScope(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]);
  }

  function revoke(id: string) {
    setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'revoked' as const } : c));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('patient-dashboard')} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          <Icon name="chevron_right" size={18} className="rotate-180 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Consent & Privacy</h1>
          <p className="text-xs text-gray-500">Control who can access your health records</p>
        </div>
      </div>

      <div className="flex justify-center">
        <HealthIDCard id="RHC-2026-8F4K92" name="Priya Devi" size="sm" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Access Granted', count: consents.filter(c => c.status === 'granted' || c.status === 'temporary').length, color: 'bg-green-50 text-green-700' },
          { label: 'Temporary', count: consents.filter(c => c.status === 'temporary').length, color: 'bg-amber-50 text-amber-700' },
          { label: 'Revoked', count: consents.filter(c => c.status === 'revoked').length, color: 'bg-gray-100 text-gray-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 text-center ${s.color}`}>
            <div className="font-display text-2xl font-bold">{s.count}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Notice */}
      <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <Icon name="shield" size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>You control your data.</strong> Your Patient Health ID alone does not give anyone access to your records. Every access requires your explicit consent. You can revoke access at any time.
        </p>
      </div>

      {/* Who has access */}
      <Card>
        <div className="px-5 pt-5">
          <SectionHeader title="Who Currently Has Access" action={
            <button onClick={() => setShowGrant(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700">
              <Icon name="plus" size={13} /> Grant Access
            </button>
          } />
        </div>
        <div className="divide-y divide-gray-50">
          {consents.map(consent => (
            <div key={consent.id} className="px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Icon name={consent.role === 'Doctor' ? 'clipboard' : consent.role.includes('Admin') ? 'settings' : 'users'} size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900">{consent.grantedTo}</span>
                  <ConsentBadge status={consent.status} />
                </div>
                <div className="text-xs text-gray-500">{consent.role} · {consent.organization}</div>
                <div className="text-xs text-gray-500 mt-0.5">Purpose: {consent.purpose}</div>
                {consent.expiresAt && (
                  <div className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                    <Icon name="history" size={10} />
                    {consent.status === 'revoked' ? 'Was valid until' : 'Expires'}: {consent.expiresAt}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {consent.dataScope.map(d => (
                    <span key={d} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{d}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {consent.status !== 'revoked' && (
                  <>
                    <button onClick={() => revoke(consent.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors border border-red-100">
                      Revoke
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                      Edit
                    </button>
                  </>
                )}
                {consent.status === 'revoked' && (
                  <span className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-xs">Revoked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grant access modal */}
      {showGrant && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-gray-900">Grant Access</h3>
                <button onClick={() => setShowGrant(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                  <Icon name="x" size={16} className="text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Healthcare Provider</label>
                  <input placeholder="Name of doctor or health worker" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">Access Duration</label>
                  <div className="flex gap-2">
                    {['1 day', '1 week', '1 month', 'Permanent'].map(d => (
                      <button key={d} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-medium hover:border-brand-300 hover:bg-brand-50 transition-all">
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-2">Data They Can Access</label>
                  <div className="flex flex-wrap gap-2">
                    {dataScopes.map(scope => (
                      <button key={scope} onClick={() => toggleScope(scope)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${selectedScope.includes(scope) ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                  <Icon name="info" size={13} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Verify the identity of the person before granting access. You can revoke access at any time.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={() => setShowGrant(false)}
                    className="py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
                    Cancel
                  </button>
                  <button onClick={() => setShowGrant(false)}
                    className="py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm">
                    Grant Access
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => navigate('access-history')}
        className="w-full py-3 flex items-center justify-center gap-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
        <Icon name="eye" size={15} />
        View Access History (Who accessed my records?)
      </button>
    </div>
  );
}
