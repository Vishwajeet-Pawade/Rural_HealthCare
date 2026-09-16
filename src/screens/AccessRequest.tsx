import { useState } from 'react';
import { Icon, HealthIDCard } from '../components/shared';

interface Props { navigate: (s: string) => void; }

export default function AccessRequest({ navigate }: Props) {
  const [decision, setDecision] = useState<'none' | 'allowed' | 'denied'>('none');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOTP, setShowOTP] = useState(false);

  function handleOTP(i: number, val: string) {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) (document.getElementById(`req-otp-${i + 1}`) as HTMLInputElement)?.focus();
  }

  if (decision === 'allowed') return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="check" size={28} className="text-green-600" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-900">Access Granted</h2>
        <p className="text-sm text-gray-500 mt-2">Dr. Ankit Sharma can now access your records for the specified duration.</p>
        <div className="mt-4 p-3 bg-green-50 rounded-xl text-xs text-green-700">
          This access has been logged in your audit history.
        </div>
        <button onClick={() => navigate('patient-dashboard')}
          className="mt-5 w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 text-sm">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (decision === 'denied') return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="x" size={28} className="text-red-600" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-2">You have declined the access request. No information will be shared.</p>
        <button onClick={() => navigate('patient-dashboard')}
          className="mt-5 w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 text-sm">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-brand-700 text-white px-6 py-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon name="shield" size={16} />
            </div>
            <span className="font-display font-bold text-lg">Access Request</span>
          </div>
          <p className="text-brand-200 text-xs">Someone is requesting access to your medical records</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Requester card */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
            <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-display font-bold text-xl shrink-0">
              AS
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-gray-900 text-base">Dr. Ankit Sharma</div>
              <div className="text-sm text-gray-600">Doctor · MD General Medicine</div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Icon name="map_pin" size={10} />
                PHC Lunkaransar, Bikaner District
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-700 font-medium">Verified Healthcare Provider</span>
              </div>
            </div>
          </div>

          {/* Request details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Purpose</div>
                <div className="text-xs font-medium text-gray-800">Clinical consultation & referral assessment</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Duration</div>
                <div className="text-xs font-medium text-gray-800">30 days (until 30 Sep 2026)</div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Data Requested</div>
              <div className="flex flex-wrap gap-1.5">
                {['Medical History', 'Diagnoses', 'Medications', 'Lab Reports', 'Vitals', 'Referral Records'].map(d => (
                  <span key={d} className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-xs">{d}</span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Your Health ID</div>
              <div className="font-mono text-sm text-brand-700 font-semibold">RHC-2026-8F4K92</div>
            </div>
          </div>

          {/* Auth method */}
          {!showOTP && (
            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="lock" size={14} className="text-brand-600" />
                <div className="text-sm font-semibold text-brand-800">Authorize with OTP</div>
              </div>
              <p className="text-xs text-brand-600">An OTP will be sent to your registered mobile +91 XXXXX 58392 to confirm your decision.</p>
            </div>
          )}

          {showOTP && (
            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200">
              <div className="text-sm font-semibold text-brand-800 mb-3">Enter OTP to authorize</div>
              <div className="flex gap-2 justify-center mb-3">
                {otp.map((digit, i) => (
                  <input key={i} id={`req-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOTP(i, e.target.value)}
                    className="w-9 h-11 text-center border-2 border-gray-200 rounded-lg text-base font-mono font-bold focus:outline-none focus:border-brand-500" />
                ))}
              </div>
              <p className="text-[10px] text-brand-600 text-center">OTP sent to +91 94141 58392</p>
            </div>
          )}

          {/* Consent notice */}
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Icon name="info" size={12} className="shrink-0 mt-0.5" />
            <span>This access will be logged in your privacy audit trail. You can revoke access at any time from Consent settings.</span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setDecision('denied')}
              className="py-3.5 border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors text-sm">
              <Icon name="x" size={15} className="inline-block mr-1.5" />
              Deny
            </button>
            <button onClick={() => { if (showOTP) setDecision('allowed'); else setShowOTP(true); }}
              className="py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-sm active:scale-95">
              <Icon name="check" size={15} className="inline-block mr-1.5" />
              Allow Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
