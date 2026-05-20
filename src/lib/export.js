import { STATUS } from './analyze.js';
import { CATEGORIES } from '../data/markers.js';

const SYMPTOM_LABELS = {
  fatigue:           'Fatigue / low energy',
  brain_fog:         'Brain fog',
  weight_gain:       'Weight gain',
  cold_intolerance:  'Cold intolerance',
  hair_loss:         'Hair loss / thinning',
  dry_skin:          'Dry skin',
  constipation:      'Constipation',
  depression:        'Depression',
  anxiety:           'Anxiety',
  joint_pain:        'Joint / muscle pain',
  palpitations:      'Heart palpitations',
  poor_sleep:        'Poor sleep',
  puffiness:         'Puffy face / eyes',
  irregular_periods: 'Irregular periods',
  low_libido:        'Low libido',
  memory:            'Memory problems',
  mood_swings:       'Mood swings',
  headaches:         'Headaches',
};

export function exportBackup(values, history, perspective, patientContext) {
  const data = {
    exportedAt: new Date().toISOString(),
    version: 1,
    perspective: perspective?.id,
    values,
    history,
    patientContext,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hashimotos-labs-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.version) throw new Error('Invalid backup file');
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}

function r(n) { return parseFloat(parseFloat(n).toPrecision(3)); }

function statusBadge(status) {
  if (status === STATUS.CRITICAL) return '<span class="badge critical">Out of Range</span>';
  if (status === STATUS.CONCERN)  return '<span class="badge concern">Below Optimal</span>';
  return '<span class="badge optimal">Optimal</span>';
}

const CATEGORY_ORDER = ['thyroid', 'antibodies', 'nutrients', 'inflammation', 'hormones', 'cardiometabolic'];

export function openPhysicianReport(results, patientContext = {}, perspective) {
  if (!results?.length) return;

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const name = patientContext.name?.trim() || '';
  const symptoms = (patientContext.symptoms || []).map(k => SYMPTOM_LABELS[k] || k);
  const symptomsNotes = patientContext.symptomsNotes?.trim() || '';
  const medications   = patientContext.medications?.trim() || '';
  const supplements   = patientContext.supplements?.trim() || '';
  const habits        = patientContext.habits?.trim() || '';

  const byCategory = {};
  for (const res of results) {
    const cat = res.marker.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(res);
  }

  const labRows = CATEGORY_ORDER
    .filter(cat => byCategory[cat])
    .map(cat => {
      const catLabel = CATEGORIES[cat]?.label || cat;
      const rows = byCategory[cat].map(res => {
        const optOverride = perspective?.optimalOverrides?.[res.marker.id];
        const opt = optOverride || res.marker.optimal;
        return `<tr>
          <td><strong>${res.marker.name}</strong></td>
          <td class="full-name">${res.marker.fullName}</td>
          <td class="value-cell">${r(res.value)} ${res.marker.unit}</td>
          <td>${res.marker.standard.low}–${res.marker.standard.high}</td>
          <td>${opt ? `${opt.low}–${opt.high}` : '—'}</td>
          <td>${statusBadge(res.status)}</td>
        </tr>`;
      }).join('');
      return `<tr class="cat-row"><td colspan="6">${catLabel}</td></tr>${rows}`;
    }).join('');

  const symptomsSection = symptoms.length || symptomsNotes
    ? `${symptoms.length ? `<div class="tag-grid">${symptoms.map(s => `<span class="tag">${s}</span>`).join('')}</div>` : ''}
       ${symptomsNotes ? `<p class="notes">${symptomsNotes}</p>` : ''}`
    : '<p class="no-data">None reported</p>';

  const perspectiveLine = perspective?.name
    ? `<div class="perspective-badge">${perspective.emoji || ''} ${perspective.name} perspective</div>`
    : '';

  const textBlock = (text) => text
    ? `<div class="text-block">${text}</div>`
    : '<p class="no-data">Not provided</p>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Lab Results Summary${name ? ` — ${name}` : ''}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1c1917;background:#fff;padding:40px;max-width:840px;margin:0 auto;font-size:14px;line-height:1.5}
  .print-btn{background:#0d9488;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:28px;display:inline-flex;align-items:center;gap:8px}
  .print-btn:hover{background:#0f766e}
  h1{font-size:22px;font-weight:800;color:#0f766e;margin-bottom:3px}
  .patient-name{font-size:19px;font-weight:700;color:#1c1917;margin-bottom:3px}
  .meta{font-size:12px;color:#78716c;margin-bottom:10px}
  .perspective-badge{display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:11px;font-weight:600;border-radius:20px;padding:2px 10px;margin-bottom:24px}
  h2{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#57534e;border-bottom:2px solid #e7e5e4;padding-bottom:6px;margin:28px 0 12px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:7px 10px;background:#f5f5f4;font-weight:600;color:#44403c;border:1px solid #e7e5e4;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
  td{padding:6px 10px;border:1px solid #e7e5e4;vertical-align:middle}
  .cat-row td{background:#fafaf9;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#78716c;padding:4px 10px}
  .full-name{color:#78716c;font-size:12px}
  .value-cell{font-weight:700}
  .badge{border-radius:4px;padding:2px 7px;font-size:11px;font-weight:700;white-space:nowrap}
  .badge.critical{background:#fff1f2;color:#be123c}
  .badge.concern{background:#fffbeb;color:#b45309}
  .badge.optimal{background:#f0fdf4;color:#15803d}
  .tag-grid{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
  .tag{background:#fff1f2;border:1px solid #fecdd3;border-radius:6px;padding:4px 10px;font-size:12px;color:#be123c}
  .notes{font-size:13px;color:#44403c;line-height:1.6;white-space:pre-wrap;margin-top:4px}
  .text-block{font-size:13px;color:#44403c;line-height:1.7;white-space:pre-wrap;background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;padding:12px 14px}
  .no-data{color:#a8a29e;font-style:italic;font-size:13px}
  .disclaimer{font-size:11px;color:#a8a29e;border-top:1px solid #e7e5e4;padding-top:16px;margin-top:32px;line-height:1.6}
  @media print{.print-btn{display:none!important}body{padding:20px}}
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
<h1>Lab Results Summary</h1>
${name ? `<div class="patient-name">${name}</div>` : ''}
<div class="meta">Generated ${date} · Hashimoto's Lab Tracker</div>
${perspectiveLine}

<h2>Lab Results</h2>
<table>
  <thead><tr>
    <th>Marker</th><th>Full Name</th><th>Value</th>
    <th>Standard Range</th><th>Optimal Range</th><th>Status</th>
  </tr></thead>
  <tbody>${labRows}</tbody>
</table>

<h2>Reported Symptoms</h2>
${symptomsSection}

<h2>Current Medications &amp; Prescriptions</h2>
${textBlock(medications)}

<h2>Current Supplements</h2>
${textBlock(supplements)}

<h2>Lifestyle &amp; Habits</h2>
${textBlock(habits)}

<div class="disclaimer">
  This report was generated by Hashimoto's Lab Tracker and is intended for informational purposes only.
  Reference ranges and optimal values are general guidelines; interpretation should be done by a qualified
  healthcare provider in the context of the patient's full clinical picture. All data is stored locally
  on the patient's device and is not transmitted to any server.
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
