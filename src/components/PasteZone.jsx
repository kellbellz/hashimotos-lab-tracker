import { useState } from 'react';
import { parseTextForMarkers } from '../lib/parseLabs.js';
import { MARKERS } from '../data/markers.js';

const THYROID_IDS = new Set(
  MARKERS.filter(m => m.category === 'thyroid' || m.category === 'antibodies').map(m => m.id)
);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function PasteZone({ onParsed, onSave }) {
  const [text, setText]       = useState('');
  const [status, setStatus]   = useState('idle'); // idle | done | saved | warning
  const [message, setMessage] = useState('');
  const [thyroidNudge, setThyroidNudge] = useState(false);
  const [saveDate, setSaveDate] = useState(todayISO);
  const [snapSaved, setSnapSaved] = useState(false);

  function handleParse() {
    if (!text.trim()) return;
    const parsed = parseTextForMarkers(text);
    const count = Object.keys(parsed).length;

    if (count === 0) {
      setStatus('warning');
      setMessage('No lab values were recognized. Make sure the text includes test names and numbers (e.g. "TSH 2.5").');
      setThyroidNudge(false);
      return;
    }

    onParsed(parsed);
    const hasThyroid = Object.keys(parsed).some(id => THYROID_IDS.has(id));
    setStatus('done');
    setMessage(`Found ${count} lab value${count !== 1 ? 's' : ''}.`);
    setThyroidNudge(!hasThyroid);
    setSnapSaved(false);
  }

  function handleSave() {
    if (onSave) onSave(saveDate);
    setSnapSaved(true);
  }

  function handleAddAnother() {
    setText('');
    setStatus('idle');
    setMessage('');
    setThyroidNudge(false);
    setSnapSaved(false);
    setSaveDate(todayISO());
  }

  return (
    <div className="space-y-3">
      {status === 'idle' || status === 'warning' ? (
        <>
          <p className="text-sm text-stone-500 leading-relaxed">
            Copy and paste your lab results below - plain text works best. You can usually select all text in your lab portal and paste it here.
          </p>

          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setStatus('idle'); }}
            placeholder={"Paste your lab results here...\n\nExample:\nTSH 2.5 mIU/L\nFree T4 1.1 ng/dL\nTPO Antibodies 45 IU/mL"}
            rows={10}
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-300 resize-y font-mono leading-relaxed"
          />

          <button
            onClick={handleParse}
            disabled={!text.trim()}
            className="w-full py-2.5 rounded-xl bg-teal-500 text-white text-sm font-bold hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Parse Lab Results
          </button>

          {status === 'warning' && (
            <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
              <p className="text-sm text-amber-800 font-semibold">{message}</p>
            </div>
          )}
        </>
      ) : (
        /* Success state - show save options */
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5 border border-emerald-100">
            <span className="mt-0.5">✓</span>
            <span>{message} Review the results above and correct anything that looks off.</span>
          </div>

          {thyroidNudge && (
            <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
              <p className="text-sm text-amber-800 font-semibold">No thyroid markers found yet.</p>
              <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
                Make sure your text includes TSH, Free T4, Free T3, or TPO antibodies if you have them.
              </p>
            </div>
          )}

          {/* Save to trends inline */}
          <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3 space-y-2">
            <p className="text-xs font-semibold text-teal-700">Save this panel to track over time</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={saveDate}
                onChange={e => { setSaveDate(e.target.value); setSnapSaved(false); }}
                className="flex-1 border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
              <button
                onClick={handleSave}
                disabled={snapSaved}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  snapSaved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                }`}
              >
                {snapSaved ? '✓ Saved!' : 'Save to Trends'}
              </button>
            </div>
          </div>

          {/* Add another panel */}
          <button
            onClick={handleAddAnother}
            className="w-full py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
          >
            + Paste another panel from a different date
          </button>
        </div>
      )}
    </div>
  );
}
