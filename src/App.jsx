import { useState, useEffect, useCallback } from 'react';
import { Activity, Shield, Trash2, ChevronDown, ChevronUp, TrendingUp, FlaskConical, Save, Check } from 'lucide-react';
import { analyzeAllMarkers, generateTakeaways, generateTopActions, sortByUrgency, STATUS } from './lib/analyze.js';
import { loadHistory, saveSnapshot, clearHistory } from './lib/history.js';
import { MarkerCard } from './components/MarkerCard.jsx';
import { Takeaways } from './components/Takeaways.jsx';
import { TopActions } from './components/TopActions.jsx';
import { UploadZone } from './components/UploadZone.jsx';
import { PasteZone } from './components/PasteZone.jsx';
import { ManualEntry } from './components/ManualEntry.jsx';
import { PerspectiveSelector } from './components/PerspectiveSelector.jsx';
import { TrendsView } from './components/TrendsView.jsx';
import { ExportPanel } from './components/ExportPanel.jsx';
import { PERSPECTIVES, DEFAULT_PERSPECTIVE } from './data/perspectives.js';

const STORAGE_KEY    = 'hashimotos_labs_v1';
const PERSPECTIVE_KEY = 'hashimotos_perspective_v1';
const PATIENT_KEY    = 'hashimotos_patient_v1';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function loadPatient() {
  try { return JSON.parse(localStorage.getItem(PATIENT_KEY) || '{}'); }
  catch { return {}; }
}

function loadPerspective() {
  try {
    const raw = localStorage.getItem(PERSPECTIVE_KEY);
    if (!raw) return DEFAULT_PERSPECTIVE;
    const saved = JSON.parse(raw);
    return PERSPECTIVES.find(p => p.id === saved.id) || DEFAULT_PERSPECTIVE;
  } catch { return DEFAULT_PERSPECTIVE; }
}

export default function App() {
  const [values, setValues]             = useState(loadSaved);
  const [perspective, setPerspective]   = useState(loadPerspective);
  const [patientContext, setPatientContext] = useState(loadPatient);
  const [inputMode, setInputMode]       = useState('upload');
  const [showManual, setShowManual]     = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [view, setView]                 = useState('results'); // 'results' | 'trends'

  // History
  const [history, setHistory]           = useState(loadHistory);
  const [snapDate, setSnapDate]         = useState(todayISO);
  const [snapSaved, setSnapSaved]       = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); }, [values]);
  useEffect(() => { localStorage.setItem(PERSPECTIVE_KEY, JSON.stringify(perspective)); }, [perspective]);
  useEffect(() => { localStorage.setItem(PATIENT_KEY, JSON.stringify(patientContext)); }, [patientContext]);

  const handleValueChange = useCallback((id, val) => {
    setValues(prev => ({ ...prev, [id]: val === '' ? undefined : val }));
  }, []);

  const handleParsed = useCallback((parsed) => {
    setValues(prev => ({ ...prev, ...parsed }));
    setShowManual(true);
  }, []);

  const handleClear = () => {
    if (confirm('Clear all lab values and trend history? This cannot be undone.')) {
      setValues({});
      localStorage.removeItem(STORAGE_KEY);
      setHistory(clearHistory());
      setSnapSaved(false);
    }
  };

  const handleRestore = (data) => {
    if (data.values)        { setValues(data.values); localStorage.setItem(STORAGE_KEY, JSON.stringify(data.values)); }
    if (data.history)       { setHistory(data.history); }
    if (data.patientContext){ setPatientContext(data.patientContext); }
    if (data.perspective) {
      const p = PERSPECTIVES.find(p => p.id === data.perspective);
      if (p) setPerspective(p);
    }
  };

  const handleSaveSnapshot = () => {
    const updated = saveSnapshot(values, snapDate);
    setHistory(updated);
    setSnapSaved(true);
    setTimeout(() => setSnapSaved(false), 3000);
  };

  const allResults  = analyzeAllMarkers(values, perspective);
  const sorted      = sortByUrgency(allResults);
  const takeaways   = generateTakeaways(allResults, perspective);
  const topActions  = generateTopActions(allResults, perspective);

  const criticalCount = allResults.filter(r => r.status === STATUS.CRITICAL).length;
  const concernCount  = allResults.filter(r => r.status === STATUS.CONCERN).length;
  const optimalCount  = allResults.filter(r => r.status === STATUS.OPTIMAL).length;
  const hasAnyValues  = allResults.length > 0;
  const hasHistory    = history.length > 0;

  const visibleResults = showAllResults ? sorted : sorted.filter(r => r.status !== STATUS.OPTIMAL);

  return (
    <div className="min-h-screen">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-teal-100/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-md shrink-0">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-stone-800 leading-tight text-sm truncate tracking-tight">
                Hashimoto's Lab Tracker
              </h1>
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

        {/* ── Hero (empty state) ────────────────────────────────────────────── */}
        {!hasAnyValues && !hasHistory && (
          <div className="rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-violet-500 p-px shadow-lg">
            <div className="rounded-3xl bg-white/95 px-6 py-8 text-center">
              <div className="text-4xl mb-3">🦋</div>
              <h2 className="text-2xl font-extrabold text-stone-800 tracking-tight">
                Understand your Hashimoto's labs
              </h2>
              <p className="text-stone-500 mt-2 max-w-md mx-auto text-sm leading-relaxed">
                Upload or enter your lab results to see which values need attention,
                what they mean for Hashimoto's, and what to ask your doctor.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-1">
                  <Shield className="w-3.5 h-3.5" />
                  100% private
                </span>
                <span className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-3 py-1">
                  Not medical advice
                </span>
                <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-full px-3 py-1">
                  Free forever
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Perspective selector ──────────────────────────────────────────── */}
        <PerspectiveSelector perspective={perspective} onChange={setPerspective} />

        {/* ── Results / Trends tab bar ──────────────────────────────────────── */}
        {(hasAnyValues || hasHistory) && (
          <div className="flex rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setView('results')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors ${
                view === 'results'
                  ? 'bg-teal-500 text-white'
                  : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              Results
            </button>
            <button
              onClick={() => setView('trends')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors ${
                view === 'trends'
                  ? 'bg-teal-500 text-white'
                  : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trends
              {hasHistory && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${view === 'trends' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'}`}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ══════════════════════════ RESULTS VIEW ════════════════════════════ */}
        {view === 'results' && (
          <>
            {/* Summary bar */}
            {hasAnyValues && (
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-extrabold text-rose-600">{criticalCount}</div>
                  <div className="text-xs font-semibold text-rose-500 mt-0.5">Out of Range</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-extrabold text-amber-600">{concernCount}</div>
                  <div className="text-xs font-semibold text-amber-500 mt-0.5">Below Optimal</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-extrabold text-emerald-600">{optimalCount}</div>
                  <div className="text-xs font-semibold text-emerald-500 mt-0.5">Optimal</div>
                </div>
              </div>
            )}

            {/* Save snapshot */}
            {hasAnyValues && (
              <div className="bg-white rounded-2xl border border-teal-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Save className="w-4 h-4 text-teal-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-700">Save to Trends</p>
                    <p className="text-xs text-stone-400">Track how your labs change over time</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={snapDate}
                    onChange={e => setSnapDate(e.target.value)}
                    className="border border-stone-200 rounded-xl px-3 py-1.5 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                  <button
                    onClick={handleSaveSnapshot}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                      snapSaved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-teal-500 hover:bg-teal-600 text-white'
                    }`}
                  >
                    {snapSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {snapSaved ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {/* Top Actions */}
            {topActions.length > 0 && <TopActions actions={topActions} />}

            {/* Key Takeaways */}
            {takeaways.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-extrabold text-stone-800">Key Takeaways</h2>
                  <span className="text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-0.5 rounded-full">
                    {takeaways.length}
                  </span>
                  <span className="text-xs text-stone-400 ml-1">Tap each to expand</span>
                </div>
                <Takeaways takeaways={takeaways} results={allResults} />
              </section>
            )}

            {/* Lab Results */}
            {hasAnyValues && (
              <section>
                <h2 className="text-base font-extrabold text-stone-800 mb-3">Your Lab Results</h2>
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

            {/* Export & Backup */}
            {(hasAnyValues || hasHistory) && (
              <ExportPanel
                values={values}
                history={history}
                perspective={perspective}
                results={allResults}
                patientContext={patientContext}
                onChange={setPatientContext}
                onRestore={handleRestore}
              />
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
                    className={`px-3 py-1.5 font-semibold transition-colors ${inputMode === 'paste' ? 'bg-teal-500 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                    onClick={() => setInputMode('paste')}
                  >
                    Paste
                  </button>
                  <button
                    className={`px-3 py-1.5 font-semibold transition-colors ${inputMode === 'manual' ? 'bg-teal-500 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
                    onClick={() => setInputMode('manual')}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {inputMode === 'paste' && (
                <PasteZone
                  onParsed={handleParsed}
                  onSave={(date) => { const updated = saveSnapshot(values, date); setHistory(updated); }}
                />
              )}

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
          </>
        )}

        {/* ══════════════════════════ TRENDS VIEW ═════════════════════════════ */}
        {view === 'trends' && (
          <TrendsView
            snapshots={history}
            onHistoryChange={setHistory}
            perspective={perspective}
          />
        )}

        {/* Disclaimer */}
        <p className="text-xs text-stone-400 text-center pb-6 leading-relaxed">
          This tool is for educational purposes only and is not a substitute for medical advice.
          Reference ranges may vary by lab. Always discuss results with a qualified healthcare provider.
        </p>
      </main>
    </div>
  );
}
