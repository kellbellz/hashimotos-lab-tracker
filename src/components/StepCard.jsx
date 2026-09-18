import { useState, useRef, useEffect } from 'react';
import { GripVertical, Trash2, Brain, Bot, Users, Ban, ListTodo } from 'lucide-react';
import { LANES, ACCENTS } from '../lib/processFlow.js';

const LANE_ICONS = { judgement: Brain, automate: Bot, delegate: Users, remove: Ban, backlog: ListTodo };

export function StepCard({ step, accent, isDragging, onDragStart, onDragEnd, onDragOverCard, onDrop, onDelete, onRename, onMoveToLane }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(step.title);
  const inputRef = useRef(null);
  const colors = ACCENTS[accent] || ACCENTS.stone;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    const trimmed = draft.trim();
    onRename(trimmed || step.title);
    setEditing(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, step.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOverCard(e, step)}
      onDrop={(e) => onDrop(e, step)}
      className={`group bg-white rounded-xl border shadow-sm px-3 py-2.5 transition-all cursor-grab active:cursor-grabbing ${colors.card} ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-stone-300 mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setDraft(step.title); setEditing(false); }
              }}
              className="w-full text-sm font-semibold text-stone-800 border border-teal-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          ) : (
            <p
              onClick={() => { setDraft(step.title); setEditing(true); }}
              className="text-sm font-semibold text-stone-800 leading-snug cursor-text break-words"
              title="Click to rename"
            >
              {step.title}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(step.id)}
          className="text-stone-300 hover:text-rose-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={`Delete step "${step.title}"`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fallback quick-move controls — keeps the board usable on touch devices where drag-and-drop isn't available */}
      <div className="flex flex-wrap gap-1 mt-2 pl-6">
        {LANES.filter(l => l.id !== step.lane).map(l => {
          const Icon = LANE_ICONS[l.id];
          return (
            <button
              key={l.id}
              onClick={() => onMoveToLane(step.id, l.id)}
              title={`Move to ${l.label}`}
              className={`flex items-center gap-1 text-[10px] font-semibold rounded-full px-1.5 py-0.5 transition-colors ${ACCENTS[l.accent].chip} opacity-0 group-hover:opacity-100 focus:opacity-100 hover:brightness-95`}
            >
              <Icon className="w-2.5 h-2.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
