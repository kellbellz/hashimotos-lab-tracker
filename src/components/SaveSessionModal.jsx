import { useState } from 'react';
import { X } from 'lucide-react';

export function SaveSessionModal({ onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [label, setLabel] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!date) return;
    onSave({ date, label: label.trim() });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-stone-800">Save lab entry</h2>
          <button onClick={onCancel} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-500 mb-1.5 block">
              Date of blood draw
            </label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={e => setDate(e.target.value)}
              required
              autoFocus
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 mb-1.5 block">
              Label <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. 6-month recheck, post-treatment"
              maxLength={50}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>

          <button
            type="submit"
            disabled={!date}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
          >
            Save entry →
          </button>
        </form>
      </div>
    </div>
  );
}
