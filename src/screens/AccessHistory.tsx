import { useState } from 'react';
import { AUDIT_LOG } from '../data';
import { Card, Icon, SectionHeader } from '../components/shared';

interface Props { navigate: (s: string) => void; }

export default function AccessHistory({ navigate }: Props) {
  const [filterRole, setFilterRole] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const roles = ['all', 'Doctor', 'ASHA Worker', 'PHC Staff'];

  const filtered = AUDIT_LOG.filter(entry => {
    if (filterRole !== 'all' && !entry.accessorRole.includes(filterRole)) return false;
    return true;
  });

  const roleColors: Record<string, string> = {
    Doctor: 'bg-purple-50 text-purple-700',
    'ASHA Worker': 'bg-brand-50 text-brand-700',
    'PHC Staff': 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('patient-dashboard')} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          <Icon name="chevron_right" size={18} className="rotate-180 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Access History</h1>
          <p className="text-xs text-gray-500">Complete audit log of who accessed your records</p>
        </div>
      </div>

      {/* Summary banner */}
      <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl flex items-start gap-3">
        <Icon name="shield" size={18} className="text-brand-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-brand-800 text-sm">Your Privacy is Protected</div>
          <div className="text-xs text-brand-600 mt-0.5">Every access to your health records is logged. Unauthorized access is prohibited and reported automatically.</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {roles.map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterRole === r ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
        <div className="relative">
          <Icon name="history" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        {(filterRole !== 'all' || filterDate) && (
          <button onClick={() => { setFilterRole('all'); setFilterDate(''); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100">
            <Icon name="x" size={11} /> Clear filters
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500">{filtered.length} access event{filtered.length !== 1 ? 's' : ''} found</div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.map((entry, i) => (
          <Card key={entry.id} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${roleColors[entry.accessorRole] || 'bg-gray-100 text-gray-500'}`}>
                <Icon name={entry.accessorRole === 'Doctor' ? 'clipboard' : 'users'} size={17} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{entry.accessorName}</div>
                    <div className="text-xs text-gray-500">{entry.accessorRole} · {entry.organization}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs text-gray-500">{entry.timestamp}</div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-700">
                    <Icon name="eye" size={12} className="text-gray-400" />
                    {entry.action}
                  </div>
                </div>

                <div className="mt-1.5">
                  <div className="text-[10px] text-gray-400 mb-1">Data accessed:</div>
                  <div className="flex flex-wrap gap-1">
                    {entry.dataAccessed.map(d => (
                      <span key={d} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{d}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                  <Icon name="info" size={10} />
                  Purpose: {entry.purpose}
                </div>
              </div>
            </div>

            {/* Divider timeline connector */}
            {i < filtered.length - 1 && (
              <div className="flex justify-start pl-5 mt-3">
                <div className="w-px h-3 bg-gray-100" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Icon name="eye" size={32} className="text-gray-200 mx-auto mb-3" />
          <div className="text-gray-500 font-medium">No access events found</div>
          <div className="text-xs text-gray-400 mt-1">Try adjusting your filters</div>
        </div>
      )}

      {/* Export */}
      <button className="w-full py-3 flex items-center justify-center gap-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
        <Icon name="document" size={15} />
        Download Full Audit Report (PDF)
      </button>
    </div>
  );
}
