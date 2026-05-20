import { PERSPECTIVES } from '../data/perspectives.js';

const perspectiveTheme = {
  hashimotos:    { active: 'border-teal-400 bg-teal-50',    text: 'text-teal-800' },
  pcos:          { active: 'border-violet-400 bg-violet-50', text: 'text-violet-800' },
  menopause:     { active: 'border-cyan-400 bg-cyan-50',    text: 'text-cyan-800' },
  postmenopause: { active: 'border-pink-400 bg-pink-50',    text: 'text-pink-800' },
  undiagnosed:   { active: 'border-amber-400 bg-amber-50',  text: 'text-amber-800' },
  fertility:     { active: 'border-emerald-400 bg-emerald-50', text: 'text-emerald-800' },
};

export function PerspectiveSelector({ perspective, onChange }) {
  return (
    <div className="bg-white/80 rounded-2xl border border-stone-100 p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-extrabold text-stone-700">Your Situation</h2>
        <p className="text-xs text-stone-400 mt-0.5">Personalizes the analysis and recommendations for you</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PERSPECTIVES.map(p => {
          const active = perspective.id === p.id;
          const theme = perspectiveTheme[p.id] || perspectiveTheme.hashimotos;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p)}
              className={`text-left rounded-xl border-2 px-3 py-2.5 transition-all ${
                active
                  ? theme.active
                  : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{p.emoji}</span>
                <div className="min-w-0">
                  <div className={`text-xs font-bold leading-tight truncate ${active ? theme.text : 'text-stone-700'}`}>
                    {p.name}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5 leading-tight line-clamp-1">{p.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
