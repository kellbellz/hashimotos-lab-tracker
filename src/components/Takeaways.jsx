import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { STATUS } from '../lib/analyze.js';

const priorityStyles = {
  high: {
    wrapper: 'bg-rose-50 border-rose-200',
    header:  'hover:bg-rose-100/60',
    title:   'text-rose-900',
    detail:  'text-rose-800',
    step:    'bg-rose-200 text-rose-900',
    divider: 'border-rose-100',
    chevron: 'text-rose-400',
    valueBg: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  medium: {
    wrapper: 'bg-amber-50 border-amber-200',
    header:  'hover:bg-amber-100/60',
    title:   'text-amber-900',
    detail:  'text-amber-800',
    step:    'bg-amber-200 text-amber-900',
    divider: 'border-amber-100',
    chevron: 'text-amber-400',
    valueBg: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  good: {
    wrapper: 'bg-emerald-50 border-emerald-200',
    header:  'hover:bg-emerald-100/60',
    title:   'text-emerald-900',
    detail:  'text-emerald-800',
    step:    'bg-emerald-200 text-emerald-900',
    divider: 'border-emerald-100',
    chevron: 'text-emerald-400',
    valueBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
};

// Split detail into intro paragraph + numbered action steps.
function parseDetail(text) {
  const sep = /What to do:|What to try:|Steps to take:|Steps:/i;
  const parts = text.split(sep);
  if (parts.length < 2) return { intro: text.trim(), steps: [] };
  const intro = parts[0].trim();
  const steps = parts[1]
    .split(/\s*\([1-9]\)\s+/)
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(s => s.length > 2);
  return { intro, steps };
}

// Try to find the lab result that this takeaway is about.
// Titles consistently start with "<Marker Name> is <value>" or "<Marker Name> Are <value>".
function findRelatedResult(title, results) {
  if (!results?.length) return null;
  const match = title.match(/^(.+?)\s+(?:is|are)\s+[<>]?[\d]/i);
  if (!match) return null;
  const label = match[1].trim().toLowerCase().replace(/[()]/g, '');
  return results.find(r => {
    const name = r.marker.name.toLowerCase();
    const full = r.marker.fullName.toLowerCase();
    return name === label || full === label || label.startsWith(name) || name.startsWith(label.split(' ')[0]);
  }) || null;
}

function r(n) { return parseFloat(parseFloat(n).toPrecision(3)); }

export function Takeaways({ takeaways, results }) {
  const [open, setOpen] = useState({});

  if (!takeaways.length) return null;

  return (
    <div className="space-y-2">
      {takeaways.map((t, i) => {
        const isOpen = !!open[i];
        const styles = priorityStyles[t.priority] || priorityStyles.medium;
        const { intro, steps } = parseDetail(t.detail);
        const related = findRelatedResult(t.title, results);
        const opt = related?.marker?.optimal;

        return (
          <div key={i} className={`rounded-2xl border overflow-hidden ${styles.wrapper}`}>
            {/* Header — always visible */}
            <button
              className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors ${styles.header}`}
              onClick={() => setOpen(prev => ({ ...prev, [i]: !prev[i] }))}
            >
              <span className="text-xl shrink-0 leading-none mt-0.5">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm leading-snug ${styles.title}`}>{t.title}</p>

                {/* Lab value + range chip — visible in collapsed state */}
                {related && (
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${styles.valueBg}`}>
                      {r(related.value)} {related.marker.unit}
                    </span>
                    <span className="text-xs text-stone-400">
                      Standard: {related.marker.standard.low}–{related.marker.standard.high}
                      {opt && <> &bull; Optimal: {opt.low}–{opt.high}</>}
                    </span>
                  </div>
                )}

                {/* Intro preview when collapsed (only if no related result chip) */}
                {!related && !isOpen && intro && (
                  <p className={`text-xs mt-1 leading-relaxed line-clamp-1 opacity-70 ${styles.detail}`}>
                    {intro}
                  </p>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 shrink-0 mt-1 transition-transform duration-200 ${styles.chevron} ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expanded body */}
            {isOpen && (
              <div className={`px-4 pb-4 border-t ${styles.divider}`}>
                {intro && (
                  <p className={`text-sm mt-3 leading-relaxed ${styles.detail}`}>{intro}</p>
                )}
                {steps.length > 0 && (
                  <ol className="mt-3 space-y-2.5">
                    {steps.map((step, si) => (
                      <li key={si} className={`flex gap-3 text-sm ${styles.detail}`}>
                        <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold leading-none ${styles.step}`}>
                          {si + 1}
                        </span>
                        <span className="leading-relaxed pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
