import { useState, useEffect, useCallback } from 'react';
import { Activity, Shield, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeAllMarkers, generateTakeaways, generateTopActions, sortByUrgency, STATUS } from './lib/analyze.js';
import { MarkerCard } from './components/MarkerCard.jsx';
import { Takeaways } from './components/Takeaways.jsx';
import { TopActions } from './components/TopActions.jsx';
import { UploadZone } from './components/UploadZone.jsx';
import { ManualEntry } from './components/ManualEntry.jsx';
import { StatusDot } from './components/StatusBadge.jsx';
import { PerspectiveSelector } from './components/PerspectiveSelector.jsx';
import { PERSPECTIVES, DEFAULT_PERSPECTIVE } from './data/perspectives.js';

const STORAGE_KEY = 'hashimotos_labs_v1';
const PERSPECTIVE_KEY = 'hashimotos_perspective_v1';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadPerspective() {
  try {
    const raw = localStorage.getItem(PERSPECTIVE_KEY);
    if (!raw) return DEFAULT_PERSPECTIVE;
    const saved = JSON.parse(raw);
    return PERSPECTIVES.find(p => p.id === saved.id) || DEFAULT_PERSPECTIVE;
  } catch {
    return DEFAULT_PERSPECTIVE;
  }
}

export default function App() {
  const [values, setValues] = useState(loadSaved);
  const [perspective, setPerspective] = useState(loadPerspective);
  const [inputMode, setInputMode] = useState('upload');
  const [showManual, setShowManual] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  useEffect(() => {
    localStorage.setItem(PERSPECTIVE_KEY, JSON.stringify(perspective));
  }, [perspective]);

  const handleValueChange = useCallback((id, val) => {
    setValues(prev => ({ ...prev, [id]: val === '' ? undefined : val }));
  }, []);

  const handleParsed = useCallback((parsed) => {
    setValues(prev => ({ ...prev, ...parsed }));
    setShowManual(true);
  }, []);

  const handleClear = () => {
    if (confirm('Clear all entered lab values? This cannot be undone.')) {
      setValues({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const allResults = analyzeAllMarkers(values, perspective);
  const sorted = sortByUrgency(allResults);
  const takeaways = generateTakeaways(allResults, perspective);
  const topActions = generateTopActions(allResults, perspective);

  const criticalCount = allResults.filter(r => r.status === STATUS.CRITICAL).length;
  const concernCount  = allResults.filter(r => r.status === STATUS.CONCERN).length;
  const optimalCount  = allResults.filter(r => r.status === STATUS.OPTIMAL).length;
  const hasAnyValues  = allResults.length > 0;

  const visibleResults = showAllResults ? sorted : sorted.filter(r => r.status !== STATUS.OPTIMAL);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center shadow-sm shrink-0">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-stone-800 leading-tight text-sm truncate">Hashimoto's Lab Tracker</h1>
              <p className="text-xs text-stone-400">All data stays on your device</p>
            </div>
          </div>
          {hasAnyValues && (
            <button
              onClick={handleClear}
              className="shrink-0 flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-500 transition-colors border border-stone-200 hover:border-rose-200 rounded-lg px-2.5 py-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Hero */}
        {!hasAnyValues && (
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-stone-800">Understand your Hashimoto's labs</h2>
            <p className="text-stone-500 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
              Upload or enter your lab results to see which values are most concerning,
              what they mean for Hashimoto's, and what to discuss with your doctor.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                100% private — no data leaves your device
              </span>
              <span className="hidden sm:block">&bull;</span>
              <span>For educational purposes — not medical advice</span>
            </div>
          </div>
        )}

        {/* Perspective selector */}
        <PerspectiveSelector perspective={perspective} onChange={setPerspective} />

        {/* Summary bar */}
        {hasAnyValues && (
          <div className="bg-white rounded-2xl border border-stone-100 p-4 flex flex-wrap items-center gap-6 shadow-sm">
            <div className="flex items-center gap-2">
              <StatusDot status={STATUS.CRITICAL} />
              <span className="text-sm font-semibold text-stone-700">{criticalCount} out of range</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={STATUS.CONCERN} />
              <span className="text-sm font-semibold text-stone-700">{concernCount} below optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={STATUS.OPTIMAL} />
              <span className="text-sm font-semibold text-stone-700">{optimalCount} optimal</span>
            </div>
          </div>
        )}

        {/* Top 3 Actions */}
        {topActions.length > 0 && <TopActions actions={topActions} />}

        {/* Key Takeaways */}
        {takeaways.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-stone-700 mb-3">Key Takeaways</h2>
            <Takeaways takeaways={takeaways} />
          </section>
        )}

        {/* Results */}
        {hasAnyValues && (
          <section>
            <h2 className="text-base font-bold text-stone-700 mb-3">Your Lab Results</h2>
            {visibleResults.length > 0 ? (
              <div className="space-y-3">
                {visibleResults.map(result => (
                  <MarkerCard key={result.marker.id} result={result} />
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 text-center text-emerald-800 text-sm font-medium">
                All entered values are within optimal range 🌿
              </div>
            )}

            {optimalCount > 0 && (
              <button
                className="mt-3 text-sm text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
                onClick={() => setShowAllResults(!showAllResults)}
              >
                {showAllResults ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showAllResults ? 'Hide' : 'Show'} {optimalCount} optimal value{optimalCount !== 1 ? 's' : ''}
              </button>
            )}
          </section>
        )}

        {/* Input section */}
        <section className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-800">
              {hasAnyValues ? 'Add / Update Labs' : 'Enter Your Lab Results'}
            </h2>
            <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm">
              <button
                className={`px-3 py-1.5 font-semibold transition-colors ${inputMode === 'upload' ? 'bg-teal-500 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                onClick={() => setInputMode('upload')}
              >
                Upload
              </button>
              <button
                className={`px-3 py-1.5 font-semibold transition-colors ${inputMode === 'manual' ? 'bg-teal-500 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                onClick={() => setInputMode('manual')}
              >
                Manual
              </button>
            </div>
          </div>

          {inputMode === 'upload' && (
            <>
              <UploadZone onParsed={handleParsed} />
              {showManual && (
                <div className="pt-4 border-t border-stone-50">
                  <p className="text-sm text-stone-400 mb-3">Review and correct parsed values:</p>
                  <ManualEntry values={values} onChange={handleValueChange} perspective={perspective} />
                </div>
              )}
              <button
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
                onClick={() => setInputMode('manual')}
              >
                Enter values manually instead →
              </button>
            </>
          )}

          {inputMode === 'manual' && (
            <ManualEntry values={values} onChange={handleValueChange} perspective={perspective} />
          )}
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-stone-400 text-center pb-6 leading-relaxed">
          This tool is for educational purposes only and is not a substitute for medical advice.
          Reference ranges may vary by lab. Always discuss results with a qualified healthcare provider.
        </p>
      </main>
    </div>
  );
}
