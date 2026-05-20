import { useState } from 'react';
import { Trash2, TrendingUp } from 'lucide-react';
import { MARKERS, CATEGORIES } from '../data/markers.js';
import { TrendChart } from './TrendChart.jsx';
import { deleteSnapshot } from '../lib/history.js';

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function r(n) { return parseFloat(parseFloat(n).toPrecision(3)); }

const categoryOrder = ['thyroid', 'antibodies', 'nutrients', 'inflammation', 'hormones', 'cardiometabolic'];

export function TrendsView({ snapshots, onHistoryChange, perspective }) {
  // Build list of markers that have at least 1 data point across all snapshots
  const markerIdsWithData = new Set(
    snapshots.flatMap(s => Object.keys(s.values).filter(id => s.values[id] !== undefined && s.values[id] !== ''))
  );

  const availableMarkers = MARKERS.filter(m => markerIdsWithData.has(m.id));

  // Group by category for the select dropdown
  const byCategory = categoryOrder.reduce((acc, cat) => {
    const ms = availableMarkers.filter(m => m.category === cat);
    if (ms.length) acc[cat] = ms;
    return acc;
  }, {});

  const [selectedId, setSelectedId] = useState(availableMarkers[0]?.id || '');
  const selectedMarker = MARKERS.find(m => m.id === selectedId);

  const optimalOverride = perspective?.optimalOverrides?.[selectedId];

  function handleDelete(id) {
    if (confirm('Remove this snapshot?')) {
      onHistoryChange(deleteSnapshot(id));
    }
  }

  if (snapshots.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center shadow-sm">
        <TrendingUp className="w-10 h-10 text-teal-300 mx-auto mb-3" />
        <h3 className="font-bold text-stone-700 text-base">No snapshots saved yet</h3>
        <p className="text-stone-400 text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
          Upload or enter your labs, then save a snapshot to start tracking your trends over time.
        </p>
      </div>
    );
  }

  if (availableMarkers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center shadow-sm">
        <p className="text-stone-400 text-sm">No lab values found in saved snapshots.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Marker selector */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
          Choose a lab to chart
        </label>
        <div className="relative">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full appearance-none bg-stone-50 border-2 border-teal-200 focus:border-teal-400 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-stone-800 outline-none cursor-pointer"
          >
            {categoryOrder.map(cat => {
              const ms = byCategory[cat];
              if (!ms) return null;
              return (
                <optgroup key={cat} label={CATEGORIES[cat]?.label || cat}>
                  {ms.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      {/* Chart card */}
      {selectedMarker && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-extrabold text-stone-800">{selectedMarker.name}</h3>
            <p className="text-xs text-stone-400 mt-0.5">{selectedMarker.fullName}</p>
            <div className="text-xs text-stone-400 mt-1">
              Standard: {selectedMarker.standard.low}–{selectedMarker.standard.high} {selectedMarker.unit}
              {selectedMarker.optimal && (
                <> &bull; Optimal: {(optimalOverride || selectedMarker.optimal).low}–{(optimalOverride || selectedMarker.optimal).high} {selectedMarker.unit}</>
              )}
            </div>
          </div>
          <TrendChart
            snapshots={snapshots}
            marker={selectedMarker}
            optimalOverride={optimalOverride}
          />
        </div>
      )}

      {/* Snapshot history table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
        <div className="px-5 pt-4 pb-3 border-b border-stone-50">
          <h3 className="font-extrabold text-stone-800 text-sm">Saved Snapshots</h3>
          <p className="text-xs text-stone-400 mt-0.5">{snapshots.length} saved — tap a row to see details</p>
        </div>

        <div className="divide-y divide-stone-50">
          {[...snapshots].reverse().map(snap => {
            const markerVal = snap.values[selectedId];
            const hasVal = markerVal !== undefined && markerVal !== '';
            return (
              <details key={snap.id} className="group">
                <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-stone-50 transition-colors list-none">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-stone-700">{fmtDate(snap.date)}</span>
                      {hasVal && selectedMarker && (
                        <span className="text-sm font-bold text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-2 py-0.5">
                          {r(markerVal)} {selectedMarker.unit}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {Object.keys(snap.values).filter(k => snap.values[k] !== undefined && snap.values[k] !== '').length} labs saved
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-stone-300 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </summary>

                {/* Expanded snapshot detail */}
                <div className="px-5 pb-4 bg-stone-50/60">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                    {Object.entries(snap.values)
                      .filter(([, v]) => v !== undefined && v !== '')
                      .map(([id, val]) => {
                        const m = MARKERS.find(mk => mk.id === id);
                        if (!m) return null;
                        return (
                          <div key={id} className="bg-white rounded-xl border border-stone-100 px-3 py-2">
                            <div className="text-xs text-stone-400">{m.name}</div>
                            <div className="text-sm font-bold text-stone-700">
                              {r(val)} <span className="font-normal text-stone-400">{m.unit}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <button
                    onClick={() => handleDelete(snap.id)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-stone-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete this snapshot
                  </button>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
