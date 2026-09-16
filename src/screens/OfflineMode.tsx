import { Icon, Card, SectionHeader } from '../components/shared';

interface Props { navigate: (s: string) => void; isOffline: boolean; toggleOffline: () => void; }

const AVAILABLE_FEATURES = [
  { label: 'Patient Registration', icon: 'plus', available: true },
  { label: 'View Cached Patient Records', icon: 'user', available: true },
  { label: 'Record Consultations & Vitals', icon: 'clipboard', available: true },
  { label: 'Create & Update Referrals', icon: 'share', available: true },
  { label: 'Update Follow-up Records', icon: 'history', available: true },
  { label: 'AI Risk Assessment (local model)', icon: 'brain', available: true },
  { label: 'Send notifications to patients', icon: 'bell', available: false },
  { label: 'Sync with central server', icon: 'sync', available: false },
  { label: 'Access uncached records', icon: 'document', available: false },
];

const PENDING_ITEMS = [
  { type: 'Patient Registration', desc: 'Anita Meena – new patient', time: '07:15 AM' },
  { type: 'Referral', desc: 'Ramesh Kumar – emergency referral', time: '09:48 AM' },
  { type: 'Vitals Record', desc: 'Mohan Lal – vitals recorded', time: '08:25 AM' },
  { type: 'Vitals Record', desc: 'Ramesh Kumar – vitals recorded', time: '09:41 AM' },
];

export default function OfflineMode({ navigate, isOffline, toggleOffline }: Props) {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('worker-dashboard')} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          <Icon name="chevron_right" size={18} className="rotate-180 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Offline Mode</h1>
          <p className="text-xs text-gray-500">Offline-first healthcare — works without internet</p>
        </div>
      </div>

      {/* Status banner */}
      {isOffline ? (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-200 rounded-2xl flex items-center justify-center">
              <Icon name="wifi_off" size={24} className="text-amber-800" />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-amber-900">OFFLINE MODE</div>
              <div className="text-xs text-amber-700">Operating without internet connection</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 p-3 bg-amber-100 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-amber-900">📋 Pending Sync: {PENDING_ITEMS.length} records</div>
              <div className="text-xs text-amber-700 mt-0.5">Will sync automatically when connectivity is restored</div>
            </div>
            <button onClick={() => navigate('sync')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors">
              View
            </button>
          </div>
          <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
            <Icon name="history" size={11} />
            Last successful sync: Today, 08:00 AM
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Icon name="check" size={24} className="text-green-600" />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-green-800">All records synchronized ✓</div>
              <div className="text-xs text-green-600">Last sync: Today, 08:00 AM · Connected to server</div>
            </div>
          </div>
        </div>
      )}

      {/* Demo toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-100 rounded-2xl">
        <div>
          <div className="text-sm font-semibold text-gray-700">Simulate Offline Mode</div>
          <div className="text-xs text-gray-500">Demo only — toggle to preview offline experience</div>
        </div>
        <button onClick={toggleOffline}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isOffline ? 'bg-amber-500' : 'bg-gray-300'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isOffline ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Available features */}
        <Card className="p-5">
          <SectionHeader title="Available Offline" sub="Works without internet" />
          <div className="space-y-2.5">
            {AVAILABLE_FEATURES.map(f => (
              <div key={f.label} className={`flex items-center gap-3 p-2.5 rounded-xl ${f.available ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${f.available ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Icon name={f.icon} size={14} className={f.available ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <span className={`text-xs font-medium ${f.available ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                  {f.label}
                </span>
                <div className="ml-auto">
                  {f.available
                    ? <Icon name="check" size={13} className="text-green-500" />
                    : <Icon name="x" size={13} className="text-gray-300" />
                  }
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending items */}
        <div className="space-y-4">
          <Card className={`p-5 ${isOffline ? 'border-amber-200' : ''}`}>
            <SectionHeader title={`Pending Sync (${PENDING_ITEMS.length})`} sub={isOffline ? 'Waiting for connectivity' : 'Ready to sync'} />
            <div className="space-y-2">
              {PENDING_ITEMS.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isOffline ? 'bg-amber-500' : 'bg-brand-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-700">{item.type}</div>
                    <div className="text-xs text-gray-500 truncate">{item.desc}</div>
                    <div className="font-mono text-[10px] text-gray-400">{item.time}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${isOffline ? 'bg-amber-50 text-amber-700' : 'bg-brand-50 text-brand-700'}`}>
                    {isOffline ? 'Pending ↻' : 'Queued'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Local data info */}
          <Card className="p-5">
            <SectionHeader title="Local Storage" />
            <div className="space-y-2">
              {[
                { label: 'Cached patient records', value: '156' },
                { label: 'Local consultations', value: '48' },
                { label: 'Offline AI model', value: 'v2.1 ready' },
                { label: 'Storage used', value: '84 MB / 512 MB' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-800 font-mono">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-400 rounded-full" style={{ width: '16%' }} />
            </div>
          </Card>
        </div>
      </div>

      {/* Quick action */}
      {isOffline && (
        <button onClick={() => navigate('register-patient')}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors">
          <Icon name="plus" size={18} />
          Register New Patient (Offline)
        </button>
      )}
    </div>
  );
}
