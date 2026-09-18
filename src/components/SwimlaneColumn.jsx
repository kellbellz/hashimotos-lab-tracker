import { StepCard } from './StepCard.jsx';
import { ACCENTS } from '../lib/processFlow.js';

export function SwimlaneColumn({ lane, steps, dragId, onDragStart, onDragEnd, onDragOverCard, onDropOnCard, onDropOnColumn, onDelete, onRename, onMoveToLane }) {
  const colors = ACCENTS[lane.accent] || ACCENTS.stone;

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDropOnColumn(e, lane.id)}
      className={`flex flex-col w-64 shrink-0 bg-white/60 rounded-2xl border-t-4 ${colors.border} border border-stone-200 shadow-sm`}
    >
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`text-sm font-extrabold ${colors.header}`}>{lane.label}</h3>
          <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${colors.chip}`}>{steps.length}</span>
        </div>
        <p className="text-xs text-stone-400 mt-0.5">{lane.description}</p>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-3 pb-3 min-h-[120px]">
        {steps.map(step => (
          <StepCard
            key={step.id}
            step={step}
            accent={lane.accent}
            isDragging={dragId === step.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOverCard={onDragOverCard}
            onDrop={onDropOnCard}
            onDelete={onDelete}
            onRename={(title) => onRename(step.id, title)}
            onMoveToLane={onMoveToLane}
          />
        ))}
        {steps.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-stone-300 border-2 border-dashed border-stone-200 rounded-xl py-6">
            Drop steps here
          </div>
        )}
      </div>
    </div>
  );
}
