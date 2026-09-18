import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Workflow } from 'lucide-react';
import { LANES, newStep, loadSteps, saveSteps, clearSteps } from '../lib/processFlow.js';
import { SwimlaneColumn } from './SwimlaneColumn.jsx';

export default function ProcessFlowBoard() {
  const [steps, setSteps] = useState(loadSteps);
  const [dragId, setDragId] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => { saveSteps(steps); }, [steps]);

  const addStep = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSteps(prev => [...prev, newStep(trimmed)]);
    setTitle('');
  };

  const deleteStep = useCallback((id) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  }, []);

  const renameStep = useCallback((id, nextTitle) => {
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, title: nextTitle } : s)));
  }, []);

  // Moves `id` into `laneId`, inserted just before `beforeId` (or appended to
  // the end of that lane when `beforeId` is null/undefined).
  const moveStep = useCallback((id, laneId, beforeId) => {
    setSteps(prev => {
      const current = prev.find(s => s.id === id);
      if (!current) return prev;

      const without = prev.filter(s => s.id !== id);
      let insertAt;
      if (beforeId) {
        insertAt = without.findIndex(s => s.id === beforeId);
        if (insertAt === -1) insertAt = without.length;
      } else {
        let lastIndexInLane = -1;
        without.forEach((s, i) => { if (s.lane === laneId) lastIndexInLane = i; });
        insertAt = lastIndexInLane === -1 ? without.length : lastIndexInLane + 1;
      }

      const next = [...without];
      next.splice(insertAt, 0, { ...current, lane: laneId });

      // Avoid a re-render/state churn loop when the computed position is identical.
      if (next.length === prev.length && next.every((s, i) => s.id === prev[i].id && s.lane === prev[i].lane)) {
        return prev;
      }
      return next;
    });
  }, []);

  const handleDragStart = useCallback((e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragEnd = useCallback(() => setDragId(null), []);

  const handleDragOverCard = useCallback((e, overStep) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragId || dragId === overStep.id) return;
    moveStep(dragId, overStep.lane, overStep.id);
  }, [dragId, moveStep]);

  const handleDropOnCard = useCallback((e, overStep) => {
    e.preventDefault();
    e.stopPropagation();
    const id = dragId || e.dataTransfer.getData('text/plain');
    if (!id) return;
    moveStep(id, overStep.lane, overStep.id);
    setDragId(null);
  }, [dragId, moveStep]);

  const handleDropOnColumn = useCallback((e, laneId) => {
    e.preventDefault();
    const id = dragId || e.dataTransfer.getData('text/plain');
    if (!id) return;
    moveStep(id, laneId, null);
    setDragId(null);
  }, [dragId, moveStep]);

  const handleMoveToLane = useCallback((id, laneId) => {
    moveStep(id, laneId, null);
  }, [moveStep]);

  const handleClearAll = () => {
    if (steps.length === 0) return;
    if (confirm('Clear the whole board? This cannot be undone.')) {
      setSteps([]);
      clearSteps();
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur-md border-b border-cyan-100/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-md shrink-0">
              <Workflow className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-stone-800 leading-tight text-sm truncate tracking-tight">
                Process Flow Mapper
              </h1>
              <p className="text-xs text-stone-400">List each step, then drag it into where it belongs</p>
            </div>
          </div>
          {steps.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-500 transition-colors border border-stone-200 hover:border-rose-200 rounded-lg px-2.5 py-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear board
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <form onSubmit={addStep} className="bg-white rounded-2xl border border-stone-100 p-3 shadow-sm flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a process step, e.g. 'Approve weekly expense reports'"
            className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-1.5 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-stone-300 transition-colors rounded-xl px-3 py-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add step
          </button>
        </form>

        <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
          {LANES.map(lane => (
            <SwimlaneColumn
              key={lane.id}
              lane={lane}
              steps={steps.filter(s => s.lane === lane.id)}
              dragId={dragId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOverCard={handleDragOverCard}
              onDropOnCard={handleDropOnCard}
              onDropOnColumn={handleDropOnColumn}
              onDelete={deleteStep}
              onRename={renameStep}
              onMoveToLane={handleMoveToLane}
            />
          ))}
        </div>

        {steps.length === 0 && (
          <div className="rounded-3xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 p-px shadow-lg">
            <div className="rounded-3xl bg-white/95 px-6 py-8 text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <h2 className="text-xl font-extrabold text-stone-800 tracking-tight">Map your process</h2>
              <p className="text-stone-500 mt-2 max-w-md mx-auto text-sm leading-relaxed">
                Add every step in a workflow above, then drag each card into{' '}
                <strong>Specialized Judgement Needed</strong>, <strong>Automate</strong>,{' '}
                <strong>Delegate</strong>, or <strong>Remove</strong> to see where your time is really going.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-stone-400 text-center pb-6 leading-relaxed">
          Your board is only stored on this device (browser local storage) — nothing is uploaded.
        </p>
      </main>
    </div>
  );
}
