import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { createVault, openVault, deleteVault } from '../lib/vault.js';

export function PassphraseGate({ mode, onUnlocked }) {
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function handleSetup(e) {
    e.preventDefault();
    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters.');
      return;
    }
    if (passphrase !== confirm) {
      setError('Passphrases do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { key, data } = await createVault(passphrase);
      onUnlocked(key, data.sessions);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleUnlock(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { key, data } = await openVault(passphrase);
      onUnlocked(key, data.sessions);
    } catch {
      setError('Wrong passphrase — please try again.');
      setLoading(false);
    }
  }

  function handleReset() {
    deleteVault();
    window.location.reload();
  }

  const isSetup = mode === 'setup';

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-sm">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-stone-800 text-sm">Hashimoto's Lab Tracker</h1>
            <p className="text-xs text-stone-400">Encrypted lab history</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          {isSetup ? (
            <>
              <h2 className="text-base font-bold text-stone-800 mb-1">Create a passphrase</h2>
              <p className="text-sm text-stone-500 mb-4 leading-relaxed">
                Your lab history will be encrypted with this passphrase.{' '}
                <strong className="text-stone-700">There is no recovery option</strong> — store it somewhere safe.
              </p>
              <form onSubmit={handleSetup} className="space-y-3">
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Passphrase (8+ characters)"
                    value={passphrase}
                    onChange={e => setPassphrase(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                    autoFocus
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Confirm passphrase"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  autoComplete="new-password"
                />
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !passphrase || !confirm}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                >
                  {loading ? 'Creating vault…' : 'Create encrypted vault →'}
                </button>
              </form>
              <div className="mt-4 flex items-start gap-2 text-xs text-stone-400 bg-stone-50 rounded-xl p-3">
                <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-400" />
                AES-256-GCM encryption. Key derived with PBKDF2-SHA256 (310,000 iterations). Your passphrase never leaves your device.
              </div>
            </>
          ) : (
            <>
              <h2 className="text-base font-bold text-stone-800 mb-1">Welcome back</h2>
              <p className="text-sm text-stone-500 mb-4">Enter your passphrase to unlock your lab history.</p>
              {!showReset ? (
                <form onSubmit={handleUnlock} className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Your passphrase"
                      value={passphrase}
                      onChange={e => setPassphrase(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                      autoFocus
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error && <p className="text-sm text-rose-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || !passphrase}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                  >
                    {loading ? 'Unlocking…' : 'Unlock →'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Forgot passphrase?
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="bg-rose-50 rounded-xl border border-rose-100 p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 leading-relaxed">
                      <strong>This permanently deletes all saved lab history.</strong> Without the passphrase, there is no way to recover it.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                  >
                    Delete all data and start over
                  </button>
                  <button
                    onClick={() => setShowReset(false)}
                    className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    ← Go back
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
