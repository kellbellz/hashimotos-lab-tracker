import { STATUS } from '../lib/analyze.js';

const config = {
  [STATUS.CRITICAL]: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Out of Range' },
  [STATUS.CONCERN]: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Below Optimal' },
  [STATUS.OPTIMAL]: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Optimal' },
  [STATUS.UNKNOWN]: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: 'Not entered' },
};

export function StatusBadge({ status, direction }) {
  const { bg, text, border, label } = config[status] || config[STATUS.UNKNOWN];
  const dirLabel = direction === 'high' ? '↑ High' : direction === 'low' ? '↓ Low' : label;
  const displayLabel = status === STATUS.CRITICAL || status === STATUS.CONCERN ? dirLabel : label;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}>
      {displayLabel}
    </span>
  );
}

export function StatusDot({ status }) {
  const colors = {
    [STATUS.CRITICAL]: 'bg-red-500',
    [STATUS.CONCERN]: 'bg-amber-400',
    [STATUS.OPTIMAL]: 'bg-green-500',
    [STATUS.UNKNOWN]: 'bg-gray-300',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || colors[STATUS.UNKNOWN]}`} />;
}
