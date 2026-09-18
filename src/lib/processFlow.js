const STORAGE_KEY = 'hashimotos_process_flow_v1';

export const BACKLOG_LANE = 'backlog';

export const LANES = [
  {
    id: BACKLOG_LANE,
    label: 'Process Steps',
    description: 'Not yet sorted',
    accent: 'stone',
  },
  {
    id: 'judgement',
    label: 'Specialized Judgement Needed',
    description: 'Requires expert human judgment — protect this time',
    accent: 'violet',
  },
  {
    id: 'automate',
    label: 'Automate',
    description: 'Rules-based and repetitive — build a system',
    accent: 'cyan',
  },
  {
    id: 'delegate',
    label: 'Delegate',
    description: 'Someone else can own this',
    accent: 'amber',
  },
  {
    id: 'remove',
    label: 'Remove',
    description: 'Adds no value — eliminate it',
    accent: 'rose',
  },
];

export const ACCENTS = {
  stone:  { border: 'border-stone-300',  header: 'text-stone-600',  chip: 'bg-stone-100 text-stone-600',   card: 'border-stone-200 hover:border-stone-300' },
  violet: { border: 'border-violet-300', header: 'text-violet-700', chip: 'bg-violet-100 text-violet-700', card: 'border-violet-200 hover:border-violet-300' },
  cyan:   { border: 'border-cyan-300',   header: 'text-cyan-700',   chip: 'bg-cyan-100 text-cyan-700',     card: 'border-cyan-200 hover:border-cyan-300' },
  amber:  { border: 'border-amber-300',  header: 'text-amber-700',  chip: 'bg-amber-100 text-amber-700',   card: 'border-amber-200 hover:border-amber-300' },
  rose:   { border: 'border-rose-300',   header: 'text-rose-700',   chip: 'bg-rose-100 text-rose-700',     card: 'border-rose-200 hover:border-rose-300' },
};

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `step_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function newStep(title) {
  return { id: makeId(), title, notes: '', lane: BACKLOG_LANE, createdAt: Date.now() };
}

export function loadSteps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSteps(steps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
  } catch {
    /* localStorage unavailable (private mode, quota, etc.) */
  }
}

export function clearSteps() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
