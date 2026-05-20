import { useState } from 'react';
import { StatusBadge } from './StatusBadge.jsx';
import { RangeBar } from './RangeBar.jsx';
import { STATUS } from '../lib/analyze.js';

const categoryTheme = {
  thyroid:       { border: 'border-l-sky-400',     badge: 'bg-sky-100 text-sky-700' },
  antibodies:    { border: 'border-l-violet-400',  badge: 'bg-violet-100 text-violet-700' },
  nutrients:     { border: 'border-l-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  inflammation:  { border: 'border-l-orange-400',  badge: 'bg-orange-100 text-orange-700' },
  hormones:      { border: 'border-l-pink-400',    badge: 'bg-pink-100 text-pink-700' },
  cardiometabolic:{ border: 'border-l-red-400',   badge: 'bg-red-100 text-red-700' },
};

const fallback = { border: 'border-l-stone-300', badge: 'bg-stone-100 text-stone-500' };

export function MarkerCard({ result }) {
  const [expanded, setExpanded] = useState(false);
  const { marker, value, status, direction, message } = result;

  const theme = categoryTheme[marker.category] || fallback;
  const isActionable = status === STATUS.CRITICAL || status === STATUS.CONCERN;

  return (
    <div className={`bg-white rounded-2xl border border-stone-100 border-l-4 ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-stone-800">{marker.name}</span>
              <StatusBadge status={status} direction={direction} />
            </div>
            <div className="text-xs text-stone-400 mt-0.5">{marker.fullName}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-extrabold text-stone-800">
              {value}
              <span className="text-sm font-normal text-stone-400 ml-1">{marker.unit}</span>
            </div>
          </div>
        </div>

        <RangeBar marker={marker} value={value} status={status} />

        {isActionable && message && !expanded && (
          <p className="text-sm text-stone-500 mt-2 line-clamp-2">{message}</p>
        )}

        <button className="text-xs text-stone-400 mt-2 hover:text-teal-500 transition-colors">
          {expanded ? '▲ Less info' : '▼ More info'}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-stone-50">
          <p className="text-sm text-stone-600 mb-2 mt-3">{marker.description}</p>
          {message && (
            <div className={`text-sm rounded-xl p-3 mt-2 ${
              status === STATUS.CRITICAL ? 'bg-rose-50 text-rose-800' :
              status === STATUS.CONCERN  ? 'bg-amber-50 text-amber-800' :
                                           'bg-emerald-50 text-emerald-800'
            }`}>
              {message}
            </div>
          )}
          {marker.optimalNote && (
            <div className="text-sm rounded-xl p-3 mt-2 bg-sky-50 text-sky-800 border border-sky-100">
              <span className="font-semibold">Note: </span>{marker.optimalNote}
            </div>
          )}
          <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
            <div className="text-xs text-stone-400">
              Standard: {marker.standard.low}–{marker.standard.high} {marker.unit}
              {marker.optimal && (
                <> &bull; Optimal: {marker.optimal.low}–{marker.optimal.high} {marker.unit}</>
              )}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme.badge}`}>
              {marker.category.charAt(0).toUpperCase() + marker.category.slice(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
