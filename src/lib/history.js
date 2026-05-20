const KEY = 'hashimotos_history_v1';

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function saveSnapshot(values, date) {
  const history = loadHistory();
  const snapshot = { id: Date.now().toString(), date, values: { ...values } };
  const updated = [...history, snapshot].sort((a, b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function deleteSnapshot(id) {
  const updated = loadHistory().filter(s => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
  return [];
}
