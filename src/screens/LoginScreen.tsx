import { useState } from 'react';
import type { Role } from '../types';
import { Icon } from '../components/shared';
import { auth, saveToken } from '../imports/api';

interface Props { onLogin: (role: Role, phone?: string) => void; lang: 'en' | 'hi'; setLang: (l: 'en' | 'hi') => void; onNavigate: (s: string) => void; }

const ROLES = [
  { id: 'patient' as Role, label: 'Patient', labelHi: 'रोगी', icon: 'user', sub: 'View your health records', subHi: 'अपने स्वास्थ्य रिकॉर्ड देखें', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { id: 'worker' as Role, label: 'Health Worker / ASHA', labelHi: 'स्वास्थ्य कार्यकर्ता / आशा', icon: 'users', sub: 'Register & assess patients', subHi: 'मरीजों को पंजीकृत करें', color: 'bg-brand-50 border-brand-200 text-brand-700' },
  { id: 'doctor' as Role, label: 'Doctor / PHC Staff', labelHi: 'डॉक्टर / PHC स्टाफ', icon: 'clipboard', sub: 'Clinical dashboard & records', subHi: 'नैदानिक डैशबोर्ड', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'admin' as Role, label: 'Administrator', labelHi: 'प्रशासक', icon: 'chart', sub: 'Analytics & system management', subHi: 'विश्लेषण और प्रबंधन', color: 'bg-saffron-50 border-saffron-200 text-saffron-700' },
];

export default function LoginScreen({ onLogin, lang, setLang, onNavigate }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hprId, setHprId] = useState('');
  const [facility, setFacility] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hi = lang === 'hi';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRole || !email || !password) return;
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (!fullName) throw new Error('Full name is required to register');
        if (selectedRole === 'doctor') {
          if (!specialty) throw new Error('Specialty is required for doctors');
          if (!facility) throw new Error('Facility name is required for doctors');
        }
        
        const profileData = selectedRole === 'doctor' ? { specialty, hprId, facility } : {};
        const res = await auth.register(email, password, fullName, selectedRole.toUpperCase(), profileData);
        saveToken(res.data.token);
        // Temporarily passing email as phone prop for compatibility until App.tsx is fully updated
        onLogin(res.data.user.role.toLowerCase() as Role, email);
      } else {
        const res = await auth.login(email, password, selectedRole.toUpperCase());
        saveToken(res.data.token);
        onLogin(res.data.user.role.toLowerCase() as Role, email);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%"><defs><pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors border border-white/20">
            <Icon name="settings" size={13} />
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
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
            {selectedRole === null && (
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
              </>
            )}

            {selectedRole && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <button type="button" onClick={() => setSelectedRole(null)} className="text-xs text-brand-600 flex items-center gap-1 mb-4 hover:underline">
                    ← {hi ? 'भूमिका बदलें' : 'Change Role'}
                  </button>
                  <h2 className="font-display text-base font-semibold text-gray-800">
                    {isRegistering ? (hi ? 'रजिस्टर करें' : 'Register') : (hi ? 'लॉगिन करें' : 'Login')} 
                    <span className="text-brand-600"> {ROLES.find(r => r.id === selectedRole)?.label}</span>
                  </h2>
                </div>

                {error && <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
                
                {isRegistering && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        {hi ? 'पूरा नाम' : 'Full Name'}
                      </label>
                      <input
                        type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      />
                    </div>
                    
                    {selectedRole === 'doctor' && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            {hi ? 'विशेषता' : 'Specialty'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text" required value={specialty} onChange={e => setSpecialty(e.target.value)}
                            placeholder="e.g. General Medicine"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            {hi ? 'सुविधा का नाम (PHC)' : 'Facility Name (PHC)'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text" required value={facility} onChange={e => setFacility(e.target.value)}
                            placeholder="e.g. PHC Lunkaransar"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            {hi ? 'HPR रजिस्ट्रेशन नंबर' : 'HPR Registration Number'} <span className="text-gray-400">(Optional)</span>
                          </label>
                          <input
                            type="text" value={hprId} onChange={e => setHprId(e.target.value)}
                            placeholder="e.g. HPR-2024-..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
                
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    {hi ? 'ईमेल पता' : 'Email Address'}
                  </label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    {hi ? 'पासवर्ड' : 'Password'}
                  </label>
                  <input
                    type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                </div>

                <button type="submit" disabled={!email || !password || (isRegistering && !fullName) || loading}
                  className="w-full mt-2 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm active:scale-95">
                  {loading ? 'Please wait...' : isRegistering ? (hi ? 'रजिस्टर करें' : 'Register') : (hi ? 'लॉगिन करें' : 'Login')}
                </button>

                <div className="mt-4 text-center">
                  <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-brand-600 text-sm hover:underline font-medium">
                    {isRegistering 
                      ? (hi ? 'पहले से खाता है? लॉगिन करें' : 'Already have an account? Login') 
                      : (hi ? 'खाता नहीं है? रजिस्टर करें' : "Don't have an account? Register")}
                  </button>
                </div>
              </form>
            )}
          </div>

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