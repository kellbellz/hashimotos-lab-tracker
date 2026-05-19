import { PERSPECTIVES } from '../data/perspectives.js';

export function PerspectiveSelector({ perspective, onChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Your Situation</h2>
        <p className="text-xs text-gray-400 mt-0.5">Personalizes the analysis and recommendations for you</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {PERSPECTIVES.map(p => {
          const active = perspective.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p)}
              className={`flex-1 text-left rounded-lg border-2 px-3 py-2.5 transition-all ${
                active
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{p.emoji}</span>
                <div>
                  <div className={`text-sm font-medium leading-tight ${active ? 'text-teal-800' : 'text-gray-800'}`}>
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
