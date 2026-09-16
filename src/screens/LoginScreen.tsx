import { useState } from 'react';
import type { Role } from '../types';
import { Icon } from '../components/shared';

interface Props { onLogin: (role: Role) => void; lang: 'en' | 'hi'; setLang: (l: 'en' | 'hi') => void; }

const ROLES = [
  { id: 'patient' as Role, label: 'Patient', labelHi: 'रोगी', icon: 'user', sub: 'View your health records', subHi: 'अपने स्वास्थ्य रिकॉर्ड देखें', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { id: 'worker' as Role, label: 'Health Worker / ASHA', labelHi: 'स्वास्थ्य कार्यकर्ता / आशा', icon: 'users', sub: 'Register & assess patients', subHi: 'मरीजों को पंजीकृत करें', color: 'bg-brand-50 border-brand-200 text-brand-700' },
  { id: 'doctor' as Role, label: 'Doctor / PHC Staff', labelHi: 'डॉक्टर / PHC स्टाफ', icon: 'clipboard', sub: 'Clinical dashboard & records', subHi: 'नैदानिक डैशबोर्ड', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'admin' as Role, label: 'Administrator', labelHi: 'प्रशासक', icon: 'chart', sub: 'Analytics & system management', subHi: 'विश्लेषण और प्रबंधन', color: 'bg-saffron-50 border-saffron-200 text-saffron-700' },
];

export default function LoginScreen({ onLogin, lang, setLang }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [step, setStep] = useState<'role' | 'otp' | 'pin'>('role');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pin, setPin] = useState('');
  const hi = lang === 'hi';

  function handleOTPChange(i: number, val: string) {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      if (el) (el as HTMLInputElement).focus();
    }
  }

  function handleLogin() {
    if (selectedRole) onLogin(selectedRole);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%"><defs><pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors border border-white/20">
            <Icon name="settings" size={13} />
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand-600 px-8 py-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon name="shield" size={20} />
              </div>
              <div>
                <div className="font-display font-bold text-xl leading-tight">RuralHealth</div>
                <div className="text-brand-200 text-xs">ग्रामीण स्वास्थ्य प्रणाली</div>
              </div>
            </div>
            <p className="text-brand-100 text-xs mt-1 leading-relaxed">
              {hi ? 'सुरक्षित डिजिटल स्वास्थ्य रिकॉर्ड प्रणाली · ऑफलाइन-फर्स्ट · SIH-26133' : 'Secure Digital Health Records · Offline-First · SIH-26133'}
            </p>
          </div>

          <div className="px-8 py-6">
            {step === 'role' && (
              <>
                <h2 className="font-display text-base font-semibold text-gray-800 mb-4">
                  {hi ? 'अपनी भूमिका चुनें' : 'Select your role'}
                </h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {ROLES.map(r => (
                    <button key={r.id} onClick={() => setSelectedRole(r.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${selectedRole === r.id ? r.color + ' ring-2 ring-offset-1 ring-brand-400' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${selectedRole === r.id ? 'bg-current/10' : 'bg-gray-200'}`}>
                        <Icon name={r.icon} size={16} className={selectedRole === r.id ? '' : 'text-gray-500'} />
                      </div>
                      <div className="font-semibold text-xs leading-tight">{hi ? r.labelHi : r.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{hi ? r.subHi : r.sub}</div>
                    </button>
                  ))}
                </div>

                {selectedRole && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        {hi ? 'मोबाइल नंबर / यूजरनेम' : 'Mobile Number / Username'}
                      </label>
                      <div className="flex gap-2">
                        <span className="px-3 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-500 border border-gray-200">+91</span>
                        <input
                          type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="9XXXXXXXXX"
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button onClick={() => setStep('otp')} disabled={phone.length < 10}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm active:scale-95">
                      {hi ? 'OTP भेजें' : 'Send OTP'}
                    </button>
                    <button onClick={() => setStep('pin')} className="w-full py-2 text-brand-600 text-sm hover:underline">
                      {hi ? 'PIN से लॉगिन करें' : 'Login with PIN instead'}
                    </button>
                  </div>
                )}
              </>
            )}

            {step === 'otp' && (
              <div className="space-y-5">
                <div>
                  <button onClick={() => setStep('role')} className="text-xs text-brand-600 flex items-center gap-1 mb-4 hover:underline">
                    ← {hi ? 'वापस जाएं' : 'Back'}
                  </button>
                  <h2 className="font-display text-base font-semibold text-gray-800">
                    {hi ? 'OTP दर्ज करें' : 'Enter OTP'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">{hi ? `+91 ${phone} पर भेजा गया` : `Sent to +91 ${phone}`}</p>
                </div>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOTPChange(i, e.target.value)}
                      className="w-10 h-12 text-center border-2 border-gray-200 rounded-xl text-lg font-mono font-semibold focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  ))}
                </div>
                <button onClick={handleLogin} className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors active:scale-95">
                  {hi ? 'सत्यापित करें और लॉगिन करें' : 'Verify & Login'}
                </button>
                <p className="text-center text-xs text-gray-400">
                  {hi ? 'OTP नहीं मिला?' : "Didn't receive OTP?"}{' '}
                  <button className="text-brand-600 hover:underline">{hi ? 'पुनः भेजें' : 'Resend'}</button>
                </p>
              </div>
            )}

            {step === 'pin' && (
              <div className="space-y-5">
                <div>
                  <button onClick={() => setStep('role')} className="text-xs text-brand-600 flex items-center gap-1 mb-4 hover:underline">
                    ← {hi ? 'वापस जाएं' : 'Back'}
                  </button>
                  <h2 className="font-display text-base font-semibold text-gray-800">
                    {hi ? 'PIN दर्ज करें' : 'Enter your PIN'}
                  </h2>
                </div>
                <div className="flex gap-3 justify-center">
                  {[0,1,2,3].map(i => (
                    <div key={i} className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center ${pin.length > i ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                      {pin.length > i && <div className="w-3 h-3 rounded-full bg-brand-600" />}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
                    <button key={i} onClick={() => {
                      if (d === '⌫') setPin(p => p.slice(0,-1));
                      else if (d && pin.length < 4) setPin(p => p + d);
                    }}
                      className={`h-14 rounded-xl text-lg font-semibold transition-all active:scale-95 ${d ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'cursor-default'}`}>
                      {d}
                    </button>
                  ))}
                </div>
                <button onClick={handleLogin} disabled={pin.length < 4}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors active:scale-95">
                  {hi ? 'लॉगिन करें' : 'Login'}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <Icon name="lock" size={10} />
              End-to-end encrypted · AES-256
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Offline-capable
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div className="mt-4 flex justify-center">
          <button className="text-white/60 text-xs hover:text-white/90 flex items-center gap-1">
            <Icon name="info" size={12} />
            {hi ? 'पहुँच विकल्प' : 'Accessibility Options'}
          </button>
        </div>
      </div>
    </div>
  );
}
