import { MARKERS, CATEGORIES } from '../data/markers.js';

export function ManualEntry({ values, onChange, perspective }) {
  const activeMarkers = MARKERS.filter(m => {
    if (!m.perspectiveOnly || m.perspectiveOnly.length === 0) return true;
    return perspective && m.perspectiveOnly.includes(perspective.id);
  });

  const byCategory = activeMarkers.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  const categoryOrder = ['thyroid', 'antibodies', 'nutrients', 'inflammation', 'hormones', 'cardiometabolic'];

  return (
    <div className="space-y-6">
      {categoryOrder.map(cat => {
        const markers = byCategory[cat];
        if (!markers) return null;
        const { label } = CATEGORIES[cat];

        return (
          <div key={cat}>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">{label}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {markers.map(marker => (
                <div key={marker.id} className="bg-stone-50 rounded-xl border border-stone-100 p-3">
                  <label className="block text-sm font-semibold text-stone-700 mb-1">
                    {marker.name}
                    <span className="text-stone-400 font-normal ml-1">({marker.unit})</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="—"
                    value={values[marker.id] ?? ''}
                    onChange={e => onChange(marker.id, e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent"
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Range: {marker.standard.low}–{marker.standard.high}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
