import { ExternalLink } from 'lucide-react';

const labelStyles = {
  'Call Your Doctor': { bg: 'bg-red-100',    text: 'text-red-700' },
  'Ask Your Doctor':  { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Start Today':      { bg: 'bg-teal-100',   text: 'text-teal-700' },
  'Change Your Diet': { bg: 'bg-green-100',  text: 'text-green-700' },
  'Get Tested':       { bg: 'bg-blue-100',   text: 'text-blue-700' },
};

export function TopActions({ actions }) {
  if (!actions?.length) return null;

  const hasProducts = actions.some(a => a.products?.length);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-base font-semibold text-gray-900">Your Top 3 Next Steps</h2>
        <p className="text-xs text-gray-400 mt-0.5">Based on your most urgent results</p>
        <p className="text-xs text-gray-500 mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
          These are general recommendations based on your lab values — not medical advice. Always check with your doctor before starting a new supplement or changing your treatment, especially if you are pregnant or on medication.
        </p>
      </div>

      <div className="divide-y divide-gray-50">
        {actions.map((action, i) => {
          const style = labelStyles[action.label] || { bg: 'bg-gray-100', text: 'text-gray-600' };
          return (
            <div key={i} className="flex gap-4 px-4 py-4">
              <div className="shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                    {action.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{action.title}</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{action.detail}</p>

                {action.products?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Where to get it:</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {action.products.map((p, j) => (
                        <a
                          key={j}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="flex items-center gap-2 text-xs bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-200 rounded-lg px-3 py-2 transition-colors group"
                        >
                          <span className="font-semibold text-gray-500 group-hover:text-teal-700 whitespace-nowrap">
                            {p.role}
                          </span>
                          <span className="text-gray-400">—</span>
                          <span className="text-gray-700 group-hover:text-teal-800 flex-1">{p.name}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-gray-300 group-hover:text-teal-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasProducts && (
        <div className="px-4 py-3 border-t border-gray-50 bg-gray-50">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="font-medium text-gray-500">Affiliate links:</span> The product links above are Amazon affiliate links. If you purchase through them, we earn a small commission at no extra cost to you — this is how we keep this tool free to use. We only recommend products we believe are high quality.
          </p>
        </div>
      )}
    </div>
  );
}
