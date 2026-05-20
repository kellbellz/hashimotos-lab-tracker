import { useRef, useState } from 'react';
import { Download, FileText, Upload, ChevronDown } from 'lucide-react';
import { exportBackup, parseBackupFile, openPhysicianReport } from '../lib/export.js';

const SYMPTOMS = [
  { key: 'fatigue',           label: 'Fatigue / low energy' },
  { key: 'brain_fog',         label: 'Brain fog' },
  { key: 'weight_gain',       label: 'Weight gain' },
  { key: 'cold_intolerance',  label: 'Cold intolerance' },
  { key: 'hair_loss',         label: 'Hair loss / thinning' },
  { key: 'dry_skin',          label: 'Dry skin' },
  { key: 'constipation',      label: 'Constipation' },
  { key: 'depression',        label: 'Depression' },
  { key: 'anxiety',           label: 'Anxiety' },
  { key: 'joint_pain',        label: 'Joint / muscle pain' },
  { key: 'palpitations',      label: 'Heart palpitations' },
  { key: 'poor_sleep',        label: 'Poor sleep' },
  { key: 'puffiness',         label: 'Puffy face / eyes' },
  { key: 'irregular_periods', label: 'Irregular periods' },
  { key: 'low_libido',        label: 'Low libido' },
  { key: 'memory',            label: 'Memory problems' },
  { key: 'mood_swings',       label: 'Mood swings' },
  { key: 'headaches',         label: 'Headaches' },
];

export function ExportPanel({ values, history, perspective, results, patientContext, onChange, onRestore }) {
  const [open, setOpen]         = useState(false);
  const [importError, setImportError] = useState('');
  const fileRef = useRef(null);

  function toggleSymptom(key) {
    const symptoms = patientContext.symptoms || [];
    const next = symptoms.includes(key)
      ? symptoms.filter(s => s !== key)
      : [...symptoms, key];
    onChange({ ...patientContext, symptoms: next });
  }

  function field(key, value) {
    onChange({ ...patientContext, [key]: value });
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    try {
      const data = await parseBackupFile(file);
      if (!confirm('This will overwrite your current lab values, history, and patient info. Continue?')) return;
      onRestore(data);
    } catch {
      setImportError('Could not read that file. Make sure it is a Hashimoto\'s Lab Tracker backup.');
    }
    e.target.value = '';
  }

  const hasLabs = results?.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
            <Download className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-stone-800">Export &amp; Backup</p>
            <p className="text-xs text-stone-400">Save your data or prepare a physician report</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-stone-50 px-5 py-4 space-y-5">

          {/* Export buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => exportBackup(values, history, perspective, patientContext)}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-teal-100 hover:border-teal-300 bg-teal-50/50 hover:bg-teal-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-teal-900">Download Backup</p>
                <p className="text-xs text-teal-700 mt-0.5">JSON file — restore anytime</p>
              </div>
            </button>

            <button
              onClick={() => openPhysicianReport(results, patientContext, perspective)}
              disabled={!hasLabs}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-violet-100 hover:border-violet-300 bg-violet-50/50 hover:bg-violet-50 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-violet-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-violet-900">Physician Report</p>
                <p className="text-xs text-violet-700 mt-0.5">Printable · save as PDF</p>
              </div>
            </button>
          </div>

          {/* Patient context for physician report */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Physician report details (optional)
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Your name</label>
              <input
                type="text"
                value={patientContext.name || ''}
                onChange={e => field('name', e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Current symptoms</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {SYMPTOMS.map(s => {
                  const active = (patientContext.symptoms || []).includes(s.key);
                  return (
                    <button
                      key={s.key}
                      onClick={() => toggleSymptom(s.key)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                        active
                          ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'
                      }`}
                    >
                      {active ? '✓ ' : ''}{s.label}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={patientContext.symptomsNotes || ''}
                onChange={e => field('symptomsNotes', e.target.value)}
                placeholder="Any other symptoms or notes..."
                rows={2}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Current prescriptions &amp; medications</label>
              <textarea
                value={patientContext.medications || ''}
                onChange={e => field('medications', e.target.value)}
                placeholder="e.g. Levothyroxine 75 mcg, Liothyronine 5 mcg..."
                rows={3}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Current supplements</label>
              <textarea
                value={patientContext.supplements || ''}
                onChange={e => field('supplements', e.target.value)}
                placeholder="e.g. Vitamin D 5000 IU, Selenium 200 mcg, Magnesium glycinate 400 mg..."
                rows={3}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Lifestyle &amp; habits</label>
              <textarea
                value={patientContext.habits || ''}
                onChange={e => field('habits', e.target.value)}
                placeholder="e.g. Gluten-free diet, 7–8 hrs sleep, walks 30 min/day, high stress at work..."
                rows={3}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-300 resize-none"
              />
            </div>
          </div>

          {/* Restore from backup */}
          <div className="border-t border-stone-50 pt-4">
            <p className="text-xs font-semibold text-stone-400 mb-2">Restore from backup</p>
            <label className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-teal-600 cursor-pointer border border-stone-200 hover:border-teal-200 rounded-xl px-3 py-2 transition-colors bg-stone-50 hover:bg-teal-50">
              <Upload className="w-3.5 h-3.5" />
              Choose backup file…
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            {importError && <p className="text-xs text-rose-500 mt-1.5">{importError}</p>}
            <p className="text-xs text-stone-400 mt-1.5">Overwrites current data with the backup</p>
          </div>
        </div>
      )}
    </div>
  );
}
