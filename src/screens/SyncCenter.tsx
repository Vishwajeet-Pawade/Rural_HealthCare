import { useState } from 'react';
import { SYNC_RECORDS } from '../data';
import { SyncBadge, Card, Icon, SectionHeader } from '../components/shared';

interface Props { navigate: (s: string) => void; isOffline: boolean; }

export default function SyncCenter({ navigate, isOffline }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [records, setRecords] = useState(SYNC_RECORDS);

  function retrySyncing() {
    if (isOffline) return;
    setSyncing(true);
    setTimeout(() => {
      setRecords(prev => prev.map(r => r.status === 'failed' ? { ...r, status: 'pending' as const } : r));
      setSyncing(false);
    }, 2000);
  }

  const synced = records.filter(r => r.status === 'synced');
  const pending = records.filter(r => r.status === 'pending');
  const failed = records.filter(r => r.status === 'failed');

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('worker-dashboard')} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          <Icon name="chevron_right" size={18} className="rotate-180 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Synchronization Center</h1>
          <p className="text-xs text-gray-500">Monitor and manage data synchronization</p>
        </div>
      </div>

      {/* Status card */}
      <div className={`rounded-2xl p-5 border-2 ${isOffline ? 'bg-amber-50 border-amber-300' : syncing ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOffline ? 'bg-amber-200' : syncing ? 'bg-blue-100' : 'bg-green-100'}`}>
            {isOffline ? (
              <Icon name="wifi_off" size={22} className="text-amber-800" />
            ) : syncing ? (
              <Icon name="sync" size={22} className="text-blue-600 animate-spin" />
            ) : (
              <Icon name="check" size={22} className="text-green-600" />
            )}
          </div>
          <div>
            <div className={`font-display text-lg font-bold ${isOffline ? 'text-amber-900' : syncing ? 'text-blue-800' : 'text-green-800'}`}>
              {isOffline ? 'Offline — sync paused' : syncing ? 'Synchronizing...' : 'Sync Status: Healthy'}
            </div>
            <div className={`text-xs ${isOffline ? 'text-amber-600' : syncing ? 'text-blue-600' : 'text-green-600'}`}>
              {isOffline ? 'Connect to internet to resume sync' : syncing ? 'Uploading pending records to server...' : 'Last sync: Today, 08:00 AM'}
            </div>
          </div>
        </div>

        {!isOffline && !syncing && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Synced ✓', count: synced.length, color: 'bg-green-100 text-green-800' },
              { label: 'Pending ↻', count: pending.length, color: 'bg-amber-100 text-amber-800' },
              { label: 'Failed !', count: failed.length, color: 'bg-red-100 text-red-800' },
            ].map(s => (
              <div key={s.label} className={`p-3 rounded-xl text-center ${s.color}`}>
                <div className="font-display text-2xl font-bold">{s.count}</div>
                <div className="text-xs font-mono font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={retrySyncing} disabled={isOffline || syncing}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition-colors">
          <Icon name="sync" size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
        {failed.length > 0 && (
          <button onClick={retrySyncing} disabled={isOffline}
            className="flex items-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-700 font-semibold rounded-xl text-sm border border-red-200 transition-colors">
            <Icon name="sync" size={15} />
            Retry Failed ({failed.length})
          </button>
        )}
      </div>

      {/* Conflict resolution */}
      <Card className="p-5">
        <SectionHeader title="Conflict Resolution" sub="No data conflicts detected" />
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
          <Icon name="check" size={14} className="text-green-600" />
          <span className="text-xs text-green-700">All records are consistent. No conflicts to resolve.</span>
        </div>
      </Card>

      {/* Records list */}
      <Card>
        <div className="px-5 pt-5">
          <SectionHeader title="Sync Records" sub={`${records.length} total records`} />
        </div>
        <div className="divide-y divide-gray-50">
          {records.map(record => (
            <div key={record.id} className="px-5 py-3 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${record.status === 'synced' ? 'bg-green-50' : record.status === 'failed' ? 'bg-red-50' : 'bg-amber-50'}`}>
                <Icon name={record.status === 'synced' ? 'check' : record.status === 'failed' ? 'alert' : 'sync'} size={14}
                  className={record.status === 'synced' ? 'text-green-600' : record.status === 'failed' ? 'text-red-600' : 'text-amber-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{record.description}</div>
                    <div className="text-xs text-gray-500">{record.type}</div>
                  </div>
                  <SyncBadge status={record.status} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 font-mono">
                  <span>Recorded: {record.recordedAt}</span>
                  {record.syncedAt && <span>Synced: {record.syncedAt}</span>}
                </div>
                {record.error && (
                  <div className="mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1">
                    <Icon name="alert" size={10} />
                    {record.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Info */}
      <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
        <Icon name="lock" size={11} />
        All data is encrypted end-to-end before synchronization · AES-256
      </div>
    </div>
  );
}
