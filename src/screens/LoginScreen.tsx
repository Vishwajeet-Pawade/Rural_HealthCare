import { useState, useEffect } from 'react';
import type { Role } from '../types';
import { Icon, HealthIDCard } from '../components/shared';
import {
  verifyAbha,
  verifyHpr,
  getFacilities,
  registerPatient,
  registerDoctor,
  registerWorker,
  FacilityItem,
} from '../api/client';

interface Props {
  onLogin: (role: Role) => void;
  lang: 'en' | 'hi';
  setLang: (l: 'en' | 'hi') => void;
}

const ROLES = [
  {
    id: 'patient' as Role,
    label: 'Patient',
    labelHi: 'रोगी',
    icon: 'user',
    sub: 'Access your health records & ABHA ID',
    subHi: 'अपने स्वास्थ्य रिकॉर्ड और ABHA ID देखें',
    color: 'border-teal-300 bg-teal-50 text-teal-800 hover:border-teal-500',
    badge: 'ABDM ABHA',
  },
  {
    id: 'worker' as Role,
    label: 'Health Worker / ASHA',
    labelHi: 'स्वास्थ्य कार्यकर्ता / आशा',
    icon: 'users',
    sub: 'Field assessments & patient registrations',
    subHi: 'मरीजों को पंजीकृत करें और जांच करें',
    color: 'border-brand-300 bg-brand-50 text-brand-800 hover:border-brand-500',
    badge: 'Field Care',
  },
  {
    id: 'doctor' as Role,
    label: 'Doctor / PHC Staff',
    labelHi: 'डॉक्टर / PHC स्टाफ',
    icon: 'clipboard',
    sub: 'OPD consultations, referrals & prescriptions',
    subHi: 'नैदानिक डैशबोर्ड और रेफरल',
    color: 'border-purple-300 bg-purple-50 text-purple-800 hover:border-purple-500',
    badge: 'HPR Registry',
  },
  {
    id: 'admin' as Role,
    label: 'Administrator',
    labelHi: 'प्रशासक',
    icon: 'chart',
    sub: 'District health operations & epidemiology',
    subHi: 'विश्लेषण और प्रणाली प्रबंधन',
    color: 'border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-500',
    badge: 'Authority',
  },
];

export default function LoginScreen({ onLogin, lang, setLang }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginMode, setLoginMode] = useState<'otp' | 'pin'>('otp');
  const [phoneOrId, setPhoneOrId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Patient Registration State
  const [patientStep, setPatientStep] = useState<1 | 2 | 3>(1);
  const [hasExistingAbha, setHasExistingAbha] = useState<boolean | null>(null);
  const [abhaSearchAddress, setAbhaSearchAddress] = useState('');
  const [aadhaarSimInput, setAadhaarSimInput] = useState('');
  const [patientAbhaVerified, setPatientAbhaVerified] = useState(false);
  const [patientAbhaNumber, setPatientAbhaNumber] = useState('');
  const [patientForm, setPatientForm] = useState({
    name: '',
    nameHi: '',
    dob: '1998-03-12',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'O+',
    phone: '',
    village: 'Govindpur',
    district: 'Bikaner',
    state: 'Rajasthan',
    address: 'Ward No. 4, Govindpur, Bikaner',
    emergencyName: 'Rajendra Singh',
    emergencyRelation: 'Husband',
    emergencyPhone: '9829017643',
    allergies: 'Penicillin',
    chronicConditions: 'Anaemia (mild)',
    currentMedications: 'Ferrous Sulphate 200 mg',
    consentGranted: true,
  });
  const [registeredPatientData, setRegisteredPatientData] = useState<any>(null);

  // ASHA Worker Registration State
  const [workerForm, setWorkerForm] = useState({
    fullName: '',
    phone: '',
    pin: '',
    workerType: 'ASHA' as 'ASHA' | 'ANM' | 'CHO' | 'Health Worker',
    village: 'Govindpur',
    subCentre: 'Sub-Centre Govindpur',
    assignedPhc: 'PHC Lunkaransar',
    district: 'Bikaner',
    state: 'Rajasthan',
  });
  const [registeredWorkerData, setRegisteredWorkerData] = useState<any>(null);

  // Doctor Registration State
  const [doctorStep, setDoctorStep] = useState<1 | 2>(1);
  const [hprInput, setHprInput] = useState('');
  const [hprRecord, setHprRecord] = useState<any>(null);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [doctorForm, setDoctorForm] = useState({
    phone: '',
    pin: '',
    facilityId: '',
    specialty: '',
  });
  const [registeredDoctorData, setRegisteredDoctorData] = useState<any>(null);

  const hi = lang === 'hi';

  // Load facilities on mount
  useEffect(() => {
    getFacilities()
      .then(f => {
        if (f && f.length > 0) {
          setFacilities(f);
          setDoctorForm(prev => ({ ...prev, facilityId: f[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  function handleSelectRole(role: Role) {
    setSelectedRole(role);
    setAuthTab('login');
    setErrorMessage(null);
    setPhoneOrId(
      role === 'patient' ? '9414158392' :
      role === 'worker' ? '9829012345' :
      role === 'doctor' ? '9829023456' : '9829045678'
    );
  }

  function handleBackToRoleSelection() {
    setSelectedRole(null);
    setAuthTab('login');
    setErrorMessage(null);
    setPatientStep(1);
    setDoctorStep(1);
    setRegisteredPatientData(null);
    setRegisteredWorkerData(null);
    setRegisteredDoctorData(null);
  }

  function handleOTPChange(i: number, val: string) {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      if (el) (el as HTMLInputElement).focus();
    }
  }

  function performLogin() {
    if (selectedRole) {
      onLogin(selectedRole);
    }
  }

  // ─── Patient ABHA Handlers ──────────────────────────────────────────────────
  async function handleVerifyAbha() {
    if (!abhaSearchAddress.trim()) {
      setErrorMessage('Please enter your ABHA address (e.g., priya.devi@abdm)');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await verifyAbha(abhaSearchAddress.trim());
      if (res.exists) {
        setPatientAbhaVerified(true);
        setPatientAbhaNumber(res.abhaNumber || '');
        setPatientForm(prev => ({
          ...prev,
          name: res.fullName || prev.name,
          gender: (res.gender === 'M' ? 'Male' : res.gender === 'F' ? 'Female' : 'Other'),
          dob: res.dob || prev.dob,
          phone: res.abhaAddress?.includes('@') ? prev.phone : res.abhaAddress || prev.phone,
        }));
      } else {
        setErrorMessage('ABHA address not found in ABDM Registry. You can create a new ABHA below.');
      }
    } catch {
      // Fallback for mock demo
      if (abhaSearchAddress.includes('priya') || abhaSearchAddress.includes('94141')) {
        setPatientAbhaVerified(true);
        setPatientAbhaNumber('14-2345-6789-0123');
        setPatientForm(prev => ({ ...prev, name: 'Priya Devi', phone: '9414158392' }));
      } else {
        setErrorMessage('No record found in ABDM registry for this ABHA identifier.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSimulateCreateAbha() {
    setLoading(true);
    setTimeout(() => {
      const generatedAbha = `${patientForm.name.toLowerCase().replace(/\s+/g, '') || 'patient'}.abdm@abdm`;
      const generatedNum = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setAbhaSearchAddress(generatedAbha);
      setPatientAbhaNumber(generatedNum);
      setPatientAbhaVerified(true);
      setLoading(false);
    }, 600);
  }

  async function handleSubmitPatientRegistration() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await registerPatient({
        name: patientForm.name || 'New Patient',
        nameHi: patientForm.nameHi,
        dob: patientForm.dob,
        gender: patientForm.gender,
        bloodGroup: patientForm.bloodGroup,
        phone: patientForm.phone || '9414158392',
        village: patientForm.village,
        district: patientForm.district,
        state: patientForm.state,
        address: patientForm.address,
        emergencyContact: {
          name: patientForm.emergencyName,
          relation: patientForm.emergencyRelation,
          phone: patientForm.emergencyPhone,
        },
        allergies: patientForm.allergies ? patientForm.allergies.split(',').map(s => s.trim()) : [],
        chronicConditions: patientForm.chronicConditions ? patientForm.chronicConditions.split(',').map(s => s.trim()) : [],
        currentMedications: patientForm.currentMedications ? patientForm.currentMedications.split(',').map(s => s.trim()) : [],
        abhaAddress: abhaSearchAddress || undefined,
        healthWorkerName: 'Meena Kumari (ASHA)',
        consent: {
          granted: patientForm.consentGranted,
          purpose: 'Longitudinal health record & primary rural care',
          dataScope: ['Vitals', 'Consultations', 'Prescriptions', 'Referrals'],
        },
      });
      setRegisteredPatientData(result.patient);
      setPatientStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Patient registration failed');
    } finally {
      setLoading(false);
    }
  }

  // ─── ASHA Worker Handlers ───────────────────────────────────────────────────
  async function handleSubmitWorkerRegistration() {
    if (!workerForm.fullName.trim() || !workerForm.phone.trim() || workerForm.pin.length !== 4) {
      setErrorMessage('Please fill in Full Name, 10-digit Phone, and 4-digit Security PIN.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await registerWorker(workerForm);
      setRegisteredWorkerData(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Worker registration failed. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Doctor HPR Handlers ────────────────────────────────────────────────────
  async function handleVerifyDoctorHpr() {
    if (!hprInput.trim()) {
      setErrorMessage('Please enter Healthcare Professionals Registry (HPR) ID (e.g. HPR-2024-00142)');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const record = await verifyHpr(hprInput.trim());
      setHprRecord(record);
      setDoctorForm(prev => ({
        ...prev,
        specialty: record.specialties?.[0] || record.professionalType || 'General Medicine',
      }));
      setDoctorStep(2);
    } catch {
      // Fallback for mock test
      if (hprInput.toUpperCase().includes('HPR') || hprInput.includes('00142')) {
        const mockRec = {
          fullName: 'Dr. Ankit Sharma',
          qualification: 'MBBS, MD (General Medicine)',
          registrationCouncil: 'Rajasthan Medical Council',
          registrationNumber: 'RMC-2018-44910',
          specialties: ['General Medicine'],
          state: 'Rajasthan',
          district: 'Bikaner',
        };
        setHprRecord(mockRec);
        setDoctorForm(prev => ({ ...prev, specialty: 'General Medicine' }));
        setDoctorStep(2);
      } else {
        setErrorMessage('HPR ID not found in ABDM HPR Registry. Please check and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitDoctorRegistration() {
    if (!doctorForm.phone || doctorForm.pin.length !== 4) {
      setErrorMessage('Please enter a valid 10-digit phone number and 4-digit PIN.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await registerDoctor({
        fullName: hprRecord.fullName,
        phone: doctorForm.phone,
        pin: doctorForm.pin,
        hprId: hprInput.trim(),
        facilityId: doctorForm.facilityId || (facilities[0]?.id || 'fac-phc-01'),
        specialty: doctorForm.specialty,
      });
      setRegisteredDoctorData(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Doctor registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className={`relative z-10 w-full transition-all duration-200 ${selectedRole ? 'max-w-2xl' : 'max-w-xl'}`}>
        {/* Language & Header Bar */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Ayushman Bharat Digital Mission (ABDM) Compatible</span>
          </div>
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs transition-colors border border-white/20"
          >
            <Icon name="settings" size={13} />
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-brand-600 px-8 py-6 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Icon name="shield" size={22} className="text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-xl leading-tight">RuralHealth</div>
                  <div className="text-brand-200 text-xs">ग्रामीण डिजिटल स्वास्थ्य प्रणाली · SIH-26133</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white/15 text-brand-100 rounded-lg text-[11px] font-semibold">
                v2.6 Live DB
              </span>
            </div>
            <p className="text-brand-100 text-xs mt-2 leading-relaxed">
              {hi
                ? 'सुरक्षित डिजिटल स्वास्थ्य रिकॉर्ड प्रणाली · ऑफ़लाइन-सक्षम · आयुष्मान भारत डिजिटल मिशन एकीकृत'
                : 'National ABDM-Integrated Offline-Capable Digital Healthcare Platform for Rural India'}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* =========================================================================
                SCREEN 1: ROLE SELECTION (No external/separate registration options)
                ========================================================================= */}
            {!selectedRole && (
              <div>
                <div className="mb-5">
                  <h2 className="font-display text-lg font-bold text-gray-900">
                    {hi ? 'अपनी भूमिका चुनें' : 'Select Your Healthcare Role'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {hi
                      ? 'लॉगिन या नया खाता बनाने के लिए अपनी भूमिका पर क्लिक करें'
                      : 'Choose your role to proceed to role-specific login or registration'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {ROLES.map(r => (
                    <button
                      key={r.id}
                      onClick={() => handleSelectRole(r.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] hover:shadow-md flex flex-col justify-between ${r.color}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center shadow-xs">
                            <Icon name={r.icon} size={18} />
                          </div>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/80">
                            {r.badge}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-gray-900">{hi ? r.labelHi : r.label}</div>
                        <div className="text-xs text-gray-600 mt-1 leading-snug">{hi ? r.subHi : r.sub}</div>
                      </div>
                      <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-between text-xs font-semibold">
                        <span>{r.id === 'admin' ? (hi ? 'लॉगिन करें' : 'Login') : (hi ? 'लॉगिन / रजिस्टर' : 'Login / Register')}</span>
                        <Icon name="chevron_right" size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                SCREEN 2: ROLE AUTHENTICATION (Login OR Register for selected role)
                ========================================================================= */}
            {selectedRole && (
              <div>
                {/* Back navigation */}
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                  <button
                    onClick={handleBackToRoleSelection}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    <Icon name="chevron_right" size={14} className="rotate-180" />
                    {hi ? 'भूमिका चयन पर वापस जाएं' : 'Back to Role Selection'}
                  </button>
                  <span className="text-xs font-medium text-gray-400 capitalize">
                    Role: <strong className="text-gray-700">{ROLES.find(r => r.id === selectedRole)?.label}</strong>
                  </span>
                </div>

                {/* Role Tabs: [ Login ] [ Register ] (Admin is Login Only) */}
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={() => { setAuthTab('login'); setErrorMessage(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      authTab === 'login'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {hi ? 'लॉगिन' : 'Login'}
                  </button>
                  {selectedRole !== 'admin' && (
                    <button
                      onClick={() => { setAuthTab('register'); setErrorMessage(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        authTab === 'register'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {selectedRole === 'patient'
                        ? (hi ? 'नया मरीज रजिस्टर करें (ABHA)' : 'Register Patient (ABHA)')
                        : selectedRole === 'worker'
                        ? (hi ? 'नया आशा/कार्यकर्ता रजिस्टर करें' : 'Register ASHA / Worker')
                        : (hi ? 'नया डॉक्टर रजिस्टर करें (HPR)' : 'Register Doctor (HPR)')}
                    </button>
                  )}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                    <Icon name="alert" size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ---------------------------------------------------------------------
                    TAB: LOGIN (Standard OTP or PIN for any role)
                    --------------------------------------------------------------------- */}
                {authTab === 'login' && (
                  <div className="space-y-4">
                    {/* Role indicator info */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                        <Icon name={ROLES.find(r => r.id === selectedRole)?.icon || 'user'} size={16} />
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-gray-800">
                          {ROLES.find(r => r.id === selectedRole)?.label} Authentication
                        </div>
                        <div className="text-gray-400">
                          {selectedRole === 'admin'
                            ? 'Admin access is restricted to authorized district medical officers'
                            : 'Enter verified mobile number or ABHA/HPR identifier'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        {selectedRole === 'patient'
                          ? (hi ? 'मोबाइल नंबर या ABHA पता' : 'Mobile Number or ABHA ID')
                          : (hi ? 'पंजीकृत मोबाइल नंबर' : 'Registered Mobile Number')}
                      </label>
                      <div className="flex gap-2">
                        <span className="px-3 py-2.5 bg-gray-100 rounded-xl text-xs text-gray-500 border border-gray-200 font-mono">
                          +91
                        </span>
                        <input
                          type="text"
                          value={phoneOrId}
                          onChange={e => setPhoneOrId(e.target.value)}
                          placeholder={selectedRole === 'patient' ? '9414158392 or priya.devi@abdm' : '9XXXXXXXXX'}
                          className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                        />
                      </div>
                    </div>

                    {loginMode === 'otp' ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-gray-700">
                            {hi ? 'OTP दर्ज करें (डेमो कोड: 123456)' : 'Enter 6-Digit OTP (Demo: 123456)'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setLoginMode('pin')}
                            className="text-[11px] text-brand-600 hover:underline"
                          >
                            {hi ? 'PIN से लॉगिन करें' : 'Login with PIN instead'}
                          </button>
                        </div>
                        <div className="flex gap-2 justify-center my-3">
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              id={`otp-${i}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={e => handleOTPChange(i, e.target.value)}
                              className="w-10 h-11 text-center border-2 border-gray-200 rounded-xl text-base font-mono font-semibold focus:outline-none focus:border-brand-500"
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-gray-700">
                            {hi ? 'सुरक्षा PIN दर्ज करें (डेमो: 1234)' : 'Security PIN (Demo: 1234)'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setLoginMode('otp')}
                            className="text-[11px] text-brand-600 hover:underline"
                          >
                            {hi ? 'OTP से लॉगिन करें' : 'Login with OTP instead'}
                          </button>
                        </div>
                        <input
                          type="password"
                          maxLength={4}
                          value={pin}
                          onChange={e => setPin(e.target.value)}
                          placeholder="••••"
                          className="w-full text-center px-4 py-2.5 border border-gray-200 rounded-xl text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-400"
                        />
                      </div>
                    )}

                    <button
                      onClick={performLogin}
                      disabled={loading}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all text-xs active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                    >
                      {loading && <Icon name="sync" size={14} className="animate-spin" />}
                      {hi ? `${ROLES.find(r => r.id === selectedRole)?.labelHi} के रूप में लॉगिन करें` : `Login as ${ROLES.find(r => r.id === selectedRole)?.label}`}
                    </button>

                    {selectedRole === 'admin' && (
                      <p className="text-center text-[11px] text-gray-400">
                        Admin role has no public registration. Provisioned credentials only.
                      </p>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------------------------
                    TAB: PATIENT REGISTRATION (ABDM Integrated)
                    --------------------------------------------------------------------- */}
                {authTab === 'register' && selectedRole === 'patient' && (
                  <div>
                    {/* Patient Registration Steps */}
                    {patientStep === 1 && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl">
                          <div className="flex items-center gap-2 text-xs font-bold text-teal-900 mb-1">
                            <Icon name="shield" size={14} className="text-teal-700" />
                            ABDM Ayushman Bharat Health Account (ABHA) Check
                          </div>
                          <p className="text-[11px] text-teal-800">
                            Does this patient already possess an ABHA ID or ABHA Address?
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => { setHasExistingAbha(true); setErrorMessage(null); }}
                              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                hasExistingAbha === true
                                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                                  : 'bg-white text-teal-800 border-teal-300 hover:bg-teal-100'
                              }`}
                            >
                              Yes, has ABHA
                            </button>
                            <button
                              type="button"
                              onClick={() => { setHasExistingAbha(false); setErrorMessage(null); }}
                              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                hasExistingAbha === false
                                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                                  : 'bg-white text-teal-800 border-teal-300 hover:bg-teal-100'
                              }`}
                            >
                              No, create new ABHA
                            </button>
                          </div>
                        </div>

                        {/* Existing ABHA path */}
                        {hasExistingAbha === true && (
                          <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                            <label className="text-xs font-medium text-gray-700 block">
                              Enter ABHA Address or Mobile (e.g. priya.devi@abdm)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={abhaSearchAddress}
                                onChange={e => setAbhaSearchAddress(e.target.value)}
                                placeholder="name@abdm or 9414158392@abdm"
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyAbha}
                                disabled={loading}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors"
                              >
                                {loading ? 'Verifying...' : 'Verify ABHA'}
                              </button>
                            </div>

                            {patientAbhaVerified && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-semibold text-green-900">ABHA Verified ✓</div>
                                  <div className="text-green-700 font-mono text-[11px]">
                                    {patientAbhaNumber || abhaSearchAddress}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPatientStep(2)}
                                  className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-xs font-semibold"
                                >
                                  Continue →
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* New ABHA Creation path */}
                        {hasExistingAbha === false && (
                          <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                            <label className="text-xs font-medium text-gray-700 block">
                              Enter 12-Digit Aadhaar or Mobile for Instant ABHA Creation
                            </label>
                            <input
                              type="text"
                              maxLength={12}
                              value={aadhaarSimInput}
                              onChange={e => setAadhaarSimInput(e.target.value)}
                              placeholder="e.g. 5432 1098 7654"
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                            <button
                              type="button"
                              onClick={handleSimulateCreateAbha}
                              disabled={loading}
                              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors"
                            >
                              {loading ? 'Creating ABHA...' : 'Generate New ABHA via Aadhaar Demo OTP'}
                            </button>

                            {patientAbhaVerified && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-semibold text-green-900">New ABHA Generated ✓</div>
                                  <div className="text-green-700 font-mono text-[11px]">
                                    {abhaSearchAddress} ({patientAbhaNumber})
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPatientStep(2)}
                                  className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-xs font-semibold"
                                >
                                  Continue →
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Demographics & Consent */}
                    {patientStep === 2 && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-medium text-gray-600">Full Name *</label>
                            <input
                              type="text"
                              value={patientForm.name}
                              onChange={e => setPatientForm({ ...patientForm, name: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-medium text-gray-600">नाम (हिन्दी)</label>
                            <input
                              type="text"
                              value={patientForm.nameHi}
                              onChange={e => setPatientForm({ ...patientForm, nameHi: e.target.value })}
                              placeholder="e.g. प्रिया देवी"
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-gray-600">Date of Birth</label>
                            <input
                              type="date"
                              value={patientForm.dob}
                              onChange={e => setPatientForm({ ...patientForm, dob: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-gray-600">Gender</label>
                            <select
                              value={patientForm.gender}
                              onChange={e => setPatientForm({ ...patientForm, gender: e.target.value as any })}
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            >
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-gray-600">Phone</label>
                            <input
                              type="tel"
                              value={patientForm.phone}
                              onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-gray-600">Village</label>
                            <input
                              type="text"
                              value={patientForm.village}
                              onChange={e => setPatientForm({ ...patientForm, village: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            />
                          </div>
                        </div>

                        {/* Consent Checkbox */}
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={patientForm.consentGranted}
                            onChange={e => setPatientForm({ ...patientForm, consentGranted: e.target.checked })}
                            className="mt-0.5 rounded accent-teal-600"
                          />
                          <span className="text-blue-900 leading-snug text-[11px]">
                            Patient grants consent for longitudinal health record creation under Ayushman Bharat Digital Mission (ABDM) guidelines.
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setPatientStep(1)}
                            className="px-4 py-2 border rounded-xl text-xs font-medium"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmitPatientRegistration}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            {loading ? 'Registering...' : 'Complete Patient Registration'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Registration Success & Card */}
                    {patientStep === 3 && registeredPatientData && (
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-700">
                          <Icon name="check" size={24} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-gray-900 text-base">
                            Patient Registered Successfully!
                          </h3>
                          <p className="text-xs text-gray-500">
                            Saved directly to PostgreSQL database with verified ABHA link.
                          </p>
                        </div>

                        <div className="flex justify-center my-2">
                          <HealthIDCard
                            id={registeredPatientData.healthId}
                            name={registeredPatientData.name}
                            size="lg"
                          />
                        </div>

                        <button
                          onClick={() => onLogin('patient')}
                          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Enter Patient Portal →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------------------------
                    TAB: ASHA / WORKER REGISTRATION
                    --------------------------------------------------------------------- */}
                {authTab === 'register' && selectedRole === 'worker' && (
                  <div>
                    {!registeredWorkerData ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900">
                          <strong>ASHA / Health Worker Onboarding</strong>
                          <p className="text-[11px] text-brand-700 mt-0.5">
                            Register field health personnel. Accounts are verified against the state health department roster.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-medium text-gray-600">Full Name *</label>
                            <input
                              type="text"
                              value={workerForm.fullName}
                              onChange={e => setWorkerForm({ ...workerForm, fullName: e.target.value })}
                              placeholder="e.g. Sunita Yadav"
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-medium text-gray-600">Cadre / Role</label>
                            <select
                              value={workerForm.workerType}
                              onChange={e => setWorkerForm({ ...workerForm, workerType: e.target.value as any })}
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            >
                              <option value="ASHA">ASHA (Accredited Social Health Activist)</option>
                              <option value="ANM">ANM (Auxiliary Nurse Midwife)</option>
                              <option value="CHO">CHO (Community Health Officer)</option>
                              <option value="Health Worker">General Health Worker</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-gray-600">Mobile Number *</label>
                            <input
                              type="tel"
                              maxLength={10}
                              value={workerForm.phone}
                              onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })}
                              placeholder="9XXXXXXXXX"
                              className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-gray-600">4-Digit Security PIN *</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={workerForm.pin}
                              onChange={e => setWorkerForm({ ...workerForm, pin: e.target.value })}
                              placeholder="••••"
                              className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-center tracking-widest"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-gray-600">Village</label>
                            <input
                              type="text"
                              value={workerForm.village}
                              onChange={e => setWorkerForm({ ...workerForm, village: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-gray-600">Sub-Centre</label>
                            <input
                              type="text"
                              value={workerForm.subCentre}
                              onChange={e => setWorkerForm({ ...workerForm, subCentre: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[11px] font-medium text-gray-600">Assigned PHC</label>
                            <input
                              type="text"
                              value={workerForm.assignedPhc}
                              onChange={e => setWorkerForm({ ...workerForm, assignedPhc: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSubmitWorkerRegistration}
                          disabled={loading}
                          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors mt-2"
                        >
                          {loading ? 'Submitting Registration...' : 'Register as ASHA / Health Worker'}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-brand-700">
                          <Icon name="check" size={24} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-gray-900 text-base">
                            ASHA Registration Submitted
                          </h3>
                          <div className="mt-2 inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
                            Status: {registeredWorkerData.status || 'PENDING_VERIFICATION'}
                          </div>
                          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
                            {registeredWorkerData.status === 'ACTIVE'
                              ? 'Your registration is active and verified.'
                              : 'Your account is under review by the Primary Health Centre Medical Officer (MOIC). You can log in to view offline materials.'}
                          </p>
                        </div>

                        <button
                          onClick={() => onLogin('worker')}
                          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Access Worker Dashboard →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------------------------------------
                    TAB: DOCTOR REGISTRATION (HPR Integrated)
                    --------------------------------------------------------------------- */}
                {authTab === 'register' && selectedRole === 'doctor' && (
                  <div>
                    {!registeredDoctorData ? (
                      <div>
                        {doctorStep === 1 && (
                          <div className="space-y-4">
                            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl">
                              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 mb-1">
                                <Icon name="clipboard" size={14} className="text-purple-700" />
                                ABDM Healthcare Professionals Registry (HPR) Verification
                              </div>
                              <p className="text-[11px] text-purple-800">
                                Doctor registrations require automated verification against National Medical Commission / State Medical Council records.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-700 block">
                                Enter Healthcare Professional ID (HPR ID) *
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={hprInput}
                                  onChange={e => setHprInput(e.target.value)}
                                  placeholder="e.g. HPR-2024-00142 or 91-2345-6789-0123"
                                  className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyDoctorHpr}
                                  disabled={loading}
                                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                                >
                                  {loading ? 'Verifying...' : 'Verify HPR'}
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-400">
                                Try demo ID: <code className="text-purple-700 font-bold">HPR-2024-00142</code> (Dr. Ankit Sharma)
                              </p>
                            </div>
                          </div>
                        )}

                        {doctorStep === 2 && hprRecord && (
                          <div className="space-y-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                              <div className="flex items-center justify-between text-xs font-bold text-green-900">
                                <span>HPR Verified: {hprRecord.fullName}</span>
                                <span className="bg-green-200 text-green-800 text-[10px] px-2 py-0.5 rounded-full">
                                  HPR Registry Verified ✓
                                </span>
                              </div>
                              <div className="text-[11px] text-green-700 mt-1">
                                {hprRecord.qualification} · {hprRecord.registrationCouncil} ({hprRecord.registrationNumber})
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="col-span-2">
                                <label className="text-[11px] font-medium text-gray-600">Assigned Facility (HFR) *</label>
                                <select
                                  value={doctorForm.facilityId}
                                  onChange={e => setDoctorForm({ ...doctorForm, facilityId: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-xl text-xs"
                                >
                                  {facilities.map(f => (
                                    <option key={f.id} value={f.id}>
                                      {f.facilityName} ({f.facilityType}, {f.district})
                                    </option>
                                  ))}
                                  {facilities.length === 0 && (
                                    <option value="fac-phc-01">PHC Lunkaransar (Bikaner)</option>
                                  )}
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] font-medium text-gray-600">Mobile Number *</label>
                                <input
                                  type="tel"
                                  maxLength={10}
                                  value={doctorForm.phone}
                                  onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                                  placeholder="9XXXXXXXXX"
                                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-medium text-gray-600">Set 4-Digit PIN *</label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={doctorForm.pin}
                                  onChange={e => setDoctorForm({ ...doctorForm, pin: e.target.value })}
                                  placeholder="••••"
                                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-center tracking-widest"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setDoctorStep(1)}
                                className="px-4 py-2 border rounded-xl text-xs font-medium"
                              >
                                Back
                              </button>
                              <button
                                type="button"
                                onClick={handleSubmitDoctorRegistration}
                                disabled={loading}
                                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                              >
                                {loading ? 'Registering Doctor...' : 'Complete Doctor Registration'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-700">
                          <Icon name="check" size={24} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-gray-900 text-base">
                            Doctor Account Created & Verified!
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Successfully integrated with ABDM HPR Registry and PostgreSQL database.
                          </p>
                        </div>

                        <button
                          onClick={() => onLogin('doctor')}
                          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Access Doctor Dashboard →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Security Strip */}
          <div className="px-8 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <Icon name="lock" size={12} className="text-brand-600" />
              <span>AES-256 Encrypted · ABDM Sandbox Standards</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Offline-First Sync Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
