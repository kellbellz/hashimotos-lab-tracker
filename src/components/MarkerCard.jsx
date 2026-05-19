import { useState } from 'react';
import { StatusBadge } from './StatusBadge.jsx';
import { RangeBar } from './RangeBar.jsx';
import { STATUS } from '../lib/analyze.js';

const categoryColors = {
  thyroid: 'border-l-blue-400',
  antibodies: 'border-l-purple-400',
  nutrients: 'border-l-green-400',
  inflammation: 'border-l-orange-400',
  hormones: 'border-l-pink-400',
};

export function MarkerCard({ result }) {
  const [expanded, setExpanded] = useState(false);
  const { marker, value, status, direction, message } = result;

  const borderColor = categoryColors[marker.category] || 'border-l-gray-300';
  const isActionable = status === STATUS.CRITICAL || status === STATUS.CONCERN;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{marker.name}</span>
              <StatusBadge status={status} direction={direction} />
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{marker.fullName}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-gray-900">
              {value}
              <span className="text-sm font-normal text-gray-400 ml-1">{marker.unit}</span>
            </div>
          </div>
        </div>

        <RangeBar marker={marker} value={value} status={status} />

        {isActionable && message && !expanded && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{message}</p>
        )}

        <button className="text-xs text-gray-400 mt-2 hover:text-gray-600 transition-colors">
          {expanded ? '▲ Less info' : '▼ More info'}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-50">
          <p className="text-sm text-gray-600 mb-2">{marker.description}</p>
          {message && (
            <div className={`text-sm rounded-lg p-3 mt-2 ${
              status === STATUS.CRITICAL ? 'bg-red-50 text-red-800' :
              status === STATUS.CONCERN ? 'bg-amber-50 text-amber-800' :
              'bg-green-50 text-green-800'
            }`}>
              {message}
            </div>
          )}
          {marker.optimalNote && (
            <div className="text-sm rounded-lg p-3 mt-2 bg-blue-50 text-blue-800">
              <span className="font-medium">Note: </span>{marker.optimalNote}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-3">
            Standard range: {marker.standard.low}–{marker.standard.high} {marker.unit}
            {marker.optimal && (
              <> &bull; Optimal: {marker.optimal.low}–{marker.optimal.high} {marker.unit}</>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
