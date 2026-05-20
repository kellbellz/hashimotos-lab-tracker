import { Clock, Plus, ChevronRight } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export function SessionList({ sessions, activeSessionId, onSelect, onNewEntry }) {
  if (sessions.length === 0) return null;

  const sorted = [...sessions].reverse();

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-stone-800">Lab History</h2>
          <p className="text-xs text-stone-400">
            {sessions.length} saved {sessions.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <button
          onClick={onNewEntry}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            activeSessionId === null
              ? 'bg-teal-500 text-white'
              : 'border border-stone-200 text-stone-500 hover:bg-stone-50'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          New entry
        </button>
      </div>

      <div className="divide-y divide-stone-50 max-h-52 overflow-y-auto">
        {sorted.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
              activeSessionId === s.id ? 'bg-teal-50' : 'hover:bg-stone-50'
            }`}
          >
            <Clock
              className={`w-4 h-4 shrink-0 ${
                activeSessionId === s.id ? 'text-teal-500' : 'text-stone-300'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold truncate ${
                  activeSessionId === s.id ? 'text-teal-800' : 'text-stone-700'
                }`}
              >
                {s.label || formatDate(s.date)}
              </p>
              {s.label && (
                <p className="text-xs text-stone-400">{formatDate(s.date)}</p>
              )}
            </div>
            <ChevronRight
              className={`w-4 h-4 shrink-0 ${
                activeSessionId === s.id ? 'text-teal-400' : 'text-stone-200'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
