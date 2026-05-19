import { STATUS } from '../lib/analyze.js';

export function RangeBar({ marker, value, status }) {
  if (value === null || value === undefined) return null;

  const { standard, optimal } = marker;

  const rangeSpan = standard.high - standard.low;
  const padding = rangeSpan * 0.3;
  const displayMin = Math.max(0, standard.low - padding);
  const displayMax = standard.high + padding;
  const displaySpan = displayMax - displayMin;

  const toPercent = (v) => Math.min(100, Math.max(0, ((v - displayMin) / displaySpan) * 100));

  const valuePercent   = toPercent(value);
  const stdLowPercent  = toPercent(standard.low);
  const stdHighPercent = toPercent(standard.high);
  const optLowPercent  = optimal ? toPercent(optimal.low) : null;
  const optHighPercent = optimal ? toPercent(optimal.high) : null;

  const dotColor = {
    [STATUS.CRITICAL]: 'bg-rose-400',
    [STATUS.CONCERN]:  'bg-amber-400',
    [STATUS.OPTIMAL]:  'bg-emerald-400',
  }[status] || 'bg-stone-300';

  return (
    <div className="mt-2 mb-1">
      <div className="relative h-5">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-rose-100" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-amber-100 rounded"
          style={{ left: `${stdLowPercent}%`, width: `${stdHighPercent - stdLowPercent}%` }}
        />
        {optLowPercent !== null && optHighPercent !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2 bg-emerald-200 rounded"
            style={{ left: `${optLowPercent}%`, width: `${optHighPercent - optLowPercent}%` }}
          />
        )}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm ${dotColor}`}
          style={{ left: `${valuePercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-stone-400 mt-1">
        <span>{standard.low}</span>
        {optimal && (
          <span className="text-emerald-600 text-xs">optimal {optimal.low}–{optimal.high}</span>
        )}
        <span>{standard.high}</span>
      </div>
    </div>
  );
}
