import { useState, useEffect, useCallback } from 'react';
import { Activity, Shield, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { analyzeAllMarkers, generateTakeaways, generateTopActions, sortByUrgency, STATUS } from './lib/analyze.js';
import { vaultExists, saveToVault, legacyDataExists, clearLegacyData } from './lib/vault.js';
import { MarkerCard } from './components/MarkerCard.jsx';
import { Takeaways } from './components/Takeaways.jsx';
import { TopActions } from './components/TopActions.jsx';
import { UploadZone } from './components/UploadZone.jsx';
import { ManualEntry } from './components/ManualEntry.jsx';
import { StatusDot } from './components/StatusBadge.jsx';
import { PerspectiveSelector } from './components/PerspectiveSelector.jsx';
import { PassphraseGate } from './components/PassphraseGate.jsx';
import { SessionList } from './components/SessionList.jsx';
import { SaveSessionModal } from './components/SaveSessionModal.jsx';
import { PERSPECTIVES, DEFAULT_PERSPECTIVE } from './data/perspectives.js';

const PERSPECTIVE_KEY = 'hashimotos_perspective_v1';

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
  // 'loading' while checking localStorage, then 'setup' | 'locked' | 'unlocked'
  const [vaultState, setVaultState] = useState('loading');
  const [cryptoKey, setCryptoKey] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null); // null = new unsaved entry
  const [workingValues, setWorkingValues] = useState({});
  const [perspective, setPerspective] = useState(loadPerspective);
  const [inputMode, setInputMode] = useState('upload');
  const [showManual, setShowManual] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVaultState(vaultExists() ? 'locked' : 'setup');
  }, []);

  useEffect(() => {
    localStorage.setItem(PERSPECTIVE_KEY, JSON.stringify(perspective));
  }, [perspective]);

  function handleUnlocked(key, loadedSessions) {
    setCryptoKey(key);
    setVaultState('unlocked');

    // One-time migration: if user had un-encrypted data in the old format,
    // import it as the first session and clean it up.
    let finalSessions = loadedSessions;
    if (loadedSessions.length === 0) {
      const legacy = legacyDataExists();
      if (legacy) {
        const today = new Date().toISOString().split('T')[0];
        const migrated = {
          id: 'migrated-' + Date.now(),
          date: today,
          label: 'Imported from previous version',
          values: legacy,
        };
        finalSessions = [migrated];
        saveToVault(key, { sessions: finalSessions });
        clearLegacyData();
      }
    }

    setSessions(finalSessions);
    if (finalSessions.length > 0) {
      const latest = finalSessions[finalSessions.length - 1];
      setActiveSessionId(latest.id);
      setWorkingValues(latest.values);
    }
  }

  const handleValueChange = useCallback((id, val) => {
    setWorkingValues(prev => ({ ...prev, [id]: val === '' ? undefined : val }));
  }, []);

  const handleParsed = useCallback((parsed) => {
    setWorkingValues(prev => ({ ...prev, ...parsed }));
    setShowManual(true);
  }, []);

  function handleSelectSession(id) {
    const s = sessions.find(s => s.id === id);
    if (!s) return;
    setActiveSessionId(id);
    setWorkingValues(s.values);
    setShowAllResults(false);
  }

  function handleNewEntry() {
    setActiveSessionId(null);
    setWorkingValues({});
    setShowManual(false);
    setShowAllResults(false);
  }

  async function handleSave({ date, label }) {
    setSaving(true);
    try {
      const newSession = {
        id: Date.now().toString(),
        date,
        label,
        values: { ...workingValues },
      };
      const newSessions = [...sessions, newSession];
      await saveToVault(cryptoKey, { sessions: newSessions });
      setSessions(newSessions);
      setActiveSessionId(newSession.id);
    } finally {
      setSaving(false);
      setShowSaveModal(false);
    }
  }

  async function handleDeleteSession(id) {
    if (!confirm('Delete this lab entry? This cannot be undone.')) return;
    const newSessions = sessions.filter(s => s.id !== id);
    await saveToVault(cryptoKey, { sessions: newSessions });
    setSessions(newSessions);
    if (newSessions.length > 0) {
      handleSelectSession(newSessions[newSessions.length - 1].id);
    } else {
      handleNewEntry();
    }
  }

  function handleClearWorking() {
    if (!confirm('Clear all entered lab values?')) return;
    setWorkingValues({});
  }

  if (vaultState === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-teal-500 animate-pulse" />
      </div>
    );
  }

  if (vaultState === 'setup' || vaultState === 'locked') {
    return <PassphraseGate mode={vaultState} onUnlocked={handleUnlocked} />;
  }

  const isViewingSession = activeSessionId !== null;
  const hasValues = Object.values(workingValues).some(v => v !== undefined && v !== '');

  const allResults = analyzeAllMarkers(workingValues, perspective);
  const sorted = sortByUrgency(allResults);
  const takeaways = generateTakeaways(allResults, perspective);
  const topActions = generateTopActions(allResults, perspective);

  const criticalCount = allResults.filter(r => r.status === STATUS.CRITICAL).length;
  const concernCount  = allResults.filter(r => r.status === STATUS.CONCERN).length;
  const optimalCount  = allResults.filter(r => r.status === STATUS.OPTIMAL).length;

  const visibleResults = showAllResults ? sorted : sorted.filter(r => r.status !== STATUS.OPTIMAL);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center shadow-sm shrink-0">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-stone-800 leading-tight text-sm truncate">Hashimoto's Lab Tracker</h1>
              <p className="text-xs text-stone-400">Encrypted on your device</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isViewingSession && (
              <button
                onClick={() => handleDeleteSession(activeSessionId)}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-500 transition-colors border border-stone-200 hover:border-rose-200 rounded-lg px-2.5 py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete entry
              </button>
            )}
            {!isViewingSession && hasValues && (
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs text-white bg-teal-500 hover:bg-teal-600 disabled:opacity-50 transition-colors rounded-lg px-2.5 py-1.5 font-semibold"
              >
                <Save className="w-3.5 h-3.5" />
                Save entry
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {!hasValues && sessions.length === 0 && (
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-stone-800">Understand your Hashimoto's labs</h2>
            <p className="text-stone-500 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
              Upload or enter your lab results to see which values are most concerning,
              what they mean for Hashimoto's, and what to discuss with your doctor.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                AES-256 encrypted — data never leaves your device
              </span>
              <span className="hidden sm:block">&bull;</span>
              <span>For educational purposes — not medical advice</span>
            </div>
          </div>
        )}

        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={handleSelectSession}
          onNewEntry={handleNewEntry}
        />

        <PerspectiveSelector perspective={perspective} onChange={setPerspective} />

        {hasValues && (
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

        {topActions.length > 0 && <TopActions actions={topActions} />}

        {takeaways.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-stone-700 mb-3">Key Takeaways</h2>
            <Takeaways takeaways={takeaways} />
          </section>
        )}

        {hasValues && (
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

        {/* Entry input — only available when not viewing a saved session */}
        {!isViewingSession && (
          <section className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-800">
                {hasValues ? 'Add / Update Labs' : 'Enter Your Lab Results'}
              </h2>
              <div className="flex items-center gap-2">
                {hasValues && (
                  <button
                    onClick={handleClearWorking}
                    className="text-xs text-stone-400 hover:text-rose-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
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
            </div>

            {inputMode === 'upload' && (
              <>
                <UploadZone onParsed={handleParsed} />
                {showManual && (
                  <div className="pt-4 border-t border-stone-50">
                    <p className="text-sm text-stone-400 mb-3">Review and correct parsed values:</p>
                    <ManualEntry values={workingValues} onChange={handleValueChange} perspective={perspective} />
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
              <ManualEntry values={workingValues} onChange={handleValueChange} perspective={perspective} />
            )}
          </section>
        )}

        {!isViewingSession && hasValues && (
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-teal-700">These values are not saved yet.</p>
            <button
              onClick={() => setShowSaveModal(true)}
              className="text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors whitespace-nowrap"
            >
              Save entry →
            </button>
          </div>
        )}

        <p className="text-xs text-stone-400 text-center pb-6 leading-relaxed">
          This tool is for educational purposes only and is not a substitute for medical advice.
          Reference ranges may vary by lab. Always discuss results with a qualified healthcare provider.
        </p>
      </main>

      {showSaveModal && (
        <SaveSessionModal
          onSave={handleSave}
          onCancel={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
