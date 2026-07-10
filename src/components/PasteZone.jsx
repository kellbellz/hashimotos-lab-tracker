import { useState } from 'react';
import { parseTextForMarkers } from '../lib/parseLabs.js';
import { MARKERS } from '../data/markers.js';

const THYROID_IDS = new Set(
  MARKERS.filter(m => m.category === 'thyroid' || m.category === 'antibodies').map(m => m.id)
);

export function PasteZone({ onParsed }) {
  const [text, setText]     = useState('');
  const [status, setStatus] = useState('idle'); // idle | done | warning
  const [message, setMessage] = useState('');
  const [thyroidNudge, setThyroidNudge] = useState(false);

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
    setMessage(`Found ${count} lab value${count !== 1 ? 's' : ''}. Review and correct anything that looks off.`);
    setThyroidNudge(!hasThyroid);
  }

  return (
    <div className="space-y-3">
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

      {status === 'done' && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5 border border-emerald-100">
            <span className="mt-0.5">✓</span>
            <span>{message}</span>
          </div>
          {thyroidNudge && (
            <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
              <p className="text-sm text-amber-800 font-semibold">No thyroid markers found yet.</p>
              <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
                Make sure your text includes TSH, Free T4, Free T3, or TPO antibodies if you have them.
              </p>
            </div>
          )}
        </div>
      )}

      {status === 'warning' && (
        <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
          <p className="text-sm text-amber-800 font-semibold">{message}</p>
        </div>
      )}
    </div>
  );
}
