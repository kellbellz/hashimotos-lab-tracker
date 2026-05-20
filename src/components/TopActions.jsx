import { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';

const labelStyles = {
  'Call Your Doctor': { bg: 'bg-rose-500',    text: 'text-white' },
  'Ask Your Doctor':  { bg: 'bg-amber-500',   text: 'text-white' },
  'Start Today':      { bg: 'bg-teal-500',    text: 'text-white' },
  'Change Your Diet': { bg: 'bg-emerald-500', text: 'text-white' },
  'Get Tested':       { bg: 'bg-violet-500',  text: 'text-white' },
};

const numBubbleStyles = {
  'Call Your Doctor': 'bg-rose-600',
  'Ask Your Doctor':  'bg-amber-600',
  'Start Today':      'bg-teal-600',
  'Change Your Diet': 'bg-emerald-600',
  'Get Tested':       'bg-violet-600',
};

export function TopActions({ actions }) {
  const [open, setOpen] = useState({});
  if (!actions?.length) return null;

  // Show affiliate note only when an action with a product link is expanded
  const showAffiliateNote = actions.some((a, i) => open[i] && a.products?.length);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-base font-extrabold text-stone-800">Your Top Next Steps</h2>
        <p className="text-xs text-stone-400 mt-0.5">Based on your most urgent results</p>
        <p className="text-xs text-stone-600 mt-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 leading-relaxed">
          General recommendations based on your lab values — not medical advice. Always check with your doctor before starting a supplement or changing treatment.
        </p>
      </div>

      <div className="divide-y divide-stone-50">
        {actions.map((action, i) => {
          const style = labelStyles[action.label] || { bg: 'bg-stone-500', text: 'text-white' };
          const bubbleColor = numBubbleStyles[action.label] || 'bg-stone-600';
          const isOpen = !!open[i];

          return (
            <div key={i} className="px-5 py-4">
              <div className="flex gap-3">
                {/* Number bubble */}
                <div className={`shrink-0 w-7 h-7 rounded-full ${bubbleColor} text-white text-sm font-bold flex items-center justify-center mt-0.5`}>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Label chip */}
                  <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-1.5 ${style.bg} ${style.text}`}>
                    {action.label}
                  </span>

                  {/* Title row */}
                  <button
                    className="w-full text-left flex items-start gap-2 group"
                    onClick={() => setOpen(prev => ({ ...prev, [i]: !prev[i] }))}
                  >
                    <p className="text-sm font-bold text-stone-800 leading-snug flex-1">{action.title}</p>
                    <ChevronDown className={`w-4 h-4 shrink-0 mt-0.5 text-stone-400 group-hover:text-stone-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Detail — collapsible */}
                  {isOpen && (
                    <div className="mt-2 space-y-3">
                      <p className="text-sm text-stone-500 leading-relaxed">{action.detail}</p>

                      {action.products?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 mb-1.5">Where to get it:</p>
                          <a
                            href={action.products[0].url}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="inline-flex items-center gap-2 text-xs bg-stone-50 hover:bg-teal-50 border border-stone-200 hover:border-teal-200 rounded-xl px-3 py-2 transition-colors group"
                          >
                            <span className="text-stone-600 group-hover:text-teal-800">{action.products[0].name}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-stone-300 group-hover:text-teal-400" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAffiliateNote && (
        <div className="px-5 py-3 border-t border-stone-50 bg-stone-50/60">
          <p className="text-xs text-stone-400 leading-relaxed">
            <span className="font-semibold text-stone-500">Affiliate links:</span> Product links above are Amazon affiliate links. We earn a small commission at no extra cost to you — this is how we keep the tool free.
          </p>
        </div>
      )}
    </div>
  );
}
