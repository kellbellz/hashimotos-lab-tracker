import { PERSPECTIVES } from '../data/perspectives.js';
import { ChevronDown } from 'lucide-react';

export function PerspectiveSelector({ perspective, onChange }) {
  return (
    <div className="bg-white/80 rounded-2xl border border-stone-100 p-4 shadow-sm">
      <label className="block text-sm font-extrabold text-stone-700 mb-1">Your Situation</label>
      <p className="text-xs text-stone-400 mb-3">Personalizes the analysis and recommendations for you</p>
      <div className="relative">
        <select
          value={perspective.id}
          onChange={e => onChange(PERSPECTIVES.find(p => p.id === e.target.value))}
          className="w-full appearance-none bg-white border-2 border-teal-200 focus:border-teal-400 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-stone-800 cursor-pointer outline-none transition-colors"
        >
          {PERSPECTIVES.map(p => (
            <option key={p.id} value={p.id}>
              {p.emoji}  {p.name} — {p.description}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
      </div>
    </div>
  );
}
