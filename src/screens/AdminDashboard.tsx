import { useState, useEffect } from 'react';
import { ADMIN_STATS, DISEASE_TRENDS, PHC_ACTIVITY } from '../data';
import { StatCard, Card, Icon, SectionHeader } from '../components/shared';

interface Props { navigate: (s: string) => void; isOffline: boolean; }

export default function AdminDashboard({ navigate, isOffline }: Props) {
  const [dbUser, setDbUser] = useState<any>(null);
  
  useEffect(() => {
    import('../imports/api').then(({ auth, getToken }) => {
      auth.getCurrentUser(getToken() || undefined).then((res: any) => {
        if(res.data?.user) setDbUser(res.data.user);
      }).catch((e: any) => console.error("Failed to load admin user", e));
    });
  }, []);

  const adminName = dbUser?.fullName || 'Rajiv Singh';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{adminName} · District Health Officer, Bikaner · 31 Aug 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${isOffline ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
            <Icon name={isOffline ? 'wifi_off' : 'check'} size={12} />
            System: {isOffline ? 'Partial' : 'Operational'}
          </div>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Registered Patients" value={ADMIN_STATS.totalPatients.toLocaleString()} sub={`${ADMIN_STATS.villagesCovered} villages`} icon="users" color="brand" trend="up" />
        <StatCard label="Active Health Workers" value={ADMIN_STATS.activeWorkers} sub="Across all PHCs" icon="users" color="green" />
        <StatCard label="Consultations" value={ADMIN_STATS.totalConsultations.toLocaleString()} sub="This month" icon="clipboard" color="purple" trend="up" />
        <StatCard label="High-risk Cases" value={ADMIN_STATS.highRiskCases} sub="Under monitoring" icon="alert" color="red" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Referrals (Month)" value={ADMIN_STATS.referralsThisMonth} sub="32 completed" icon="share" color="amber" />
        <StatCard label="Pending Follow-ups" value={ADMIN_STATS.pendingFollowUps} sub="12 overdue" icon="history" color="amber" />
        <StatCard label="Sync Success Rate" value={`${ADMIN_STATS.syncSuccess}%`} sub="Last 7 days" icon="sync" color="green" />
        <StatCard label="Villages Covered" value={ADMIN_STATS.villagesCovered} sub="Bikaner district" icon="map_pin" color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease trends */}
        <Card className="p-5">
          <SectionHeader title="Common Disease Trends" sub="Most reported conditions this month" />
          <div className="space-y-3 mt-4">
            {DISEASE_TRENDS.map(d => (
              <div key={d.condition} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">{d.condition}</span>
                  <span className="text-gray-900 font-semibold">{d.count} cases</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${d.pct > 60 ? 'bg-red-400' : d.pct > 40 ? 'bg-amber-400' : 'bg-brand-400'}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400">{d.pct}% of monitored patients</div>
              </div>
            ))}
          </div>
        </Card>

        {/* PHC activity */}
        <Card className="p-5">
          <SectionHeader title="PHC Activity" sub="Consultations & referrals by centre" />
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-1 text-xs font-medium text-gray-500">PHC</th>
                  <th className="text-right py-2 px-1 text-xs font-medium text-gray-500">Consult.</th>
                  <th className="text-right py-2 px-1 text-xs font-medium text-gray-500">Referrals</th>
                  <th className="text-right py-2 px-1 text-xs font-medium text-gray-500">Workers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PHC_ACTIVITY.map((phc, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2.5 px-1 font-medium text-gray-800 text-xs">{phc.phc}</td>
                    <td className="py-2.5 px-1 text-right font-mono text-xs text-gray-700">{phc.consultations}</td>
                    <td className="py-2.5 px-1 text-right font-mono text-xs text-gray-700">{phc.referrals}</td>
                    <td className="py-2.5 px-1 text-right font-mono text-xs text-gray-700">{phc.workers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mini bar chart for consultations */}
          <div className="mt-4">
            <div className="text-xs font-semibold text-gray-500 mb-2">Consultations Volume</div>
            <div className="flex items-end gap-2 h-16">
              {PHC_ACTIVITY.map((phc, i) => {
                const max = Math.max(...PHC_ACTIVITY.map(p => p.consultations));
                const pct = (phc.consultations / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-brand-100 rounded-t-sm" style={{ height: `${pct}%` }}>
                      <div className="w-full h-full bg-brand-400 rounded-t-sm hover:bg-brand-600 transition-colors" />
                    </div>
                    <div className="text-[9px] text-gray-400 text-center leading-tight">{phc.phc.replace('PHC ', '')}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* System status */}
      <Card className="p-5">
        <SectionHeader title="System Status" sub="Infrastructure & synchronization health" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Central Server', status: 'Operational', ok: true },
            { label: 'Database Sync', status: `${ADMIN_STATS.syncSuccess}% success rate`, ok: true },
            { label: 'AI Model Service', status: 'v2.1 running', ok: true },
            { label: 'Offline Nodes', status: isOffline ? '3 disconnected' : 'All connected', ok: !isOffline },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-2xl border ${s.ok ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${s.ok ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-xs font-semibold text-gray-700">{s.label}</span>
              </div>
              <div className={`text-xs ${s.ok ? 'text-green-700' : 'text-amber-700'}`}>{s.status}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Regional map placeholder */}
      <Card className="p-5">
        <SectionHeader title="Regional Coverage – Bikaner District" sub="Patient registrations by village cluster" />
        <div className="h-48 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl flex items-center justify-center border border-brand-100 relative overflow-hidden">
          {/* Simulated map dots */}
          {[
            { x: '30%', y: '40%', size: 20, label: 'Lunkaransar', patients: 342 },
            { x: '55%', y: '35%', size: 16, label: 'Kolayat', patients: 287 },
            { x: '70%', y: '55%', size: 12, label: 'Nokha', patients: 219 },
            { x: '20%', y: '60%', size: 10, label: 'Deshnok', patients: 198 },
            { x: '80%', y: '30%', size: 14, label: 'Dungargarh', patients: 238 },
          ].map((dot, i) => (
            <div key={i} className="absolute group" style={{ left: dot.x, top: dot.y }}>
              <div
                className="rounded-full bg-brand-500 opacity-70 hover:opacity-100 transition-all cursor-pointer flex items-center justify-center"
                style={{ width: dot.size, height: dot.size }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white px-2 py-1 rounded-lg shadow-sm text-[9px] font-medium text-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {dot.label}: {dot.patients} patients
              </div>
            </div>
          ))}
          <div className="absolute bottom-3 right-3 text-xs text-brand-600 font-medium bg-white/70 px-2 py-1 rounded-lg">
            {ADMIN_STATS.villagesCovered} villages · {ADMIN_STATS.totalPatients.toLocaleString()} patients
          </div>
        </div>
      </Card>

      {/* Recent alerts */}
      <Card>
        <div className="px-5 pt-5">
          <SectionHeader title="System Alerts" />
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { msg: '2 emergency referrals initiated from Khetolai and Deshnok', time: '09:50 AM', type: 'emergency' },
            { msg: 'Sync failure at Node-07 (Dungargarh) – connection timeout', time: '08:32 AM', type: 'warning' },
            { msg: '14 new patient registrations synced from PHC Lunkaransar', time: '08:05 AM', type: 'info' },
            { msg: 'AI model v2.1 deployed to all health worker devices', time: 'Yesterday', type: 'info' },
          ].map((alert, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${alert.type === 'emergency' ? 'bg-red-100' : alert.type === 'warning' ? 'bg-amber-100' : 'bg-blue-50'}`}>
                <Icon name={alert.type === 'info' ? 'info' : 'alert'} size={14}
                  className={alert.type === 'emergency' ? 'text-red-600' : alert.type === 'warning' ? 'text-amber-600' : 'text-blue-500'} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-800">{alert.msg}</div>
                <div className="font-mono text-xs text-gray-400 mt-0.5">{alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
