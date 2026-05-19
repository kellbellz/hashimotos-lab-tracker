import { STATUS } from '../lib/analyze.js';

// Visual range bar showing where a value falls relative to standard and optimal ranges
export function RangeBar({ marker, value, status }) {
  if (value === null || value === undefined) return null;

  const { standard, optimal } = marker;

  // Define display window: extend a bit beyond standard range
  const rangeSpan = standard.high - standard.low;
  const padding = rangeSpan * 0.3;
  const displayMin = Math.max(0, standard.low - padding);
  const displayMax = standard.high + padding;
  const displaySpan = displayMax - displayMin;

  const toPercent = (v) => Math.min(100, Math.max(0, ((v - displayMin) / displaySpan) * 100));

  const valuePercent = toPercent(value);
  const stdLowPercent = toPercent(standard.low);
  const stdHighPercent = toPercent(standard.high);
  const optLowPercent = optimal ? toPercent(optimal.low) : null;
  const optHighPercent = optimal ? toPercent(optimal.high) : null;

  const dotColor = {
    [STATUS.CRITICAL]: 'bg-red-500',
    [STATUS.CONCERN]: 'bg-amber-400',
    [STATUS.OPTIMAL]: 'bg-green-500',
  }[status] || 'bg-gray-400';

  return (
    <div className="mt-2 mb-1">
      <div className="relative h-5">
        {/* Background track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-red-100" />

        {/* Standard range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-amber-100 rounded"
          style={{ left: `${stdLowPercent}%`, width: `${stdHighPercent - stdLowPercent}%` }}
        />

        {/* Optimal range */}
        {optLowPercent !== null && optHighPercent !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-200 rounded"
            style={{ left: `${optLowPercent}%`, width: `${optHighPercent - optLowPercent}%` }}
          />
        )}

        {/* Value marker dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm ${dotColor}`}
          style={{ left: `${valuePercent}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{standard.low}</span>
        {optimal && (
          <span className="text-green-600 text-xs">
            optimal {optimal.low}–{optimal.high}
          </span>
        )}
        <span>{standard.high}</span>
      </div>
    </div>
  );
}
