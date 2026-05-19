import { STATUS } from '../lib/analyze.js';

const config = {
  [STATUS.CRITICAL]: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', label: 'Out of Range' },
  [STATUS.CONCERN]:  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Below Optimal' },
  [STATUS.OPTIMAL]:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Optimal' },
  [STATUS.UNKNOWN]:  { bg: 'bg-stone-50', text: 'text-stone-400', border: 'border-stone-200', label: 'Not entered' },
};

export function StatusBadge({ status, direction }) {
  const { bg, text, border, label } = config[status] || config[STATUS.UNKNOWN];
  const dirLabel = direction === 'high' ? '↑ High' : direction === 'low' ? '↓ Low' : label;
  const displayLabel = status === STATUS.CRITICAL || status === STATUS.CONCERN ? dirLabel : label;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
      {displayLabel}
    </span>
  );
}

export function StatusDot({ status }) {
  const colors = {
    [STATUS.CRITICAL]: 'bg-rose-400',
    [STATUS.CONCERN]:  'bg-amber-400',
    [STATUS.OPTIMAL]:  'bg-emerald-400',
    [STATUS.UNKNOWN]:  'bg-stone-300',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || colors[STATUS.UNKNOWN]}`} />;
}
