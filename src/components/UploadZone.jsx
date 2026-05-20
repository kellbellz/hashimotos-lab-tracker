import { useState, useRef } from 'react';
import { FileText, Image, Loader2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { extractTextFromPDF, extractTextFromImage, parseTextForMarkers } from '../lib/parseLabs.js';
import { MARKERS } from '../data/markers.js';

// Marker IDs that belong to the thyroid/antibodies categories — used to detect
// whether an upload contained any thyroid-specific results.
const THYROID_IDS = new Set(
  MARKERS.filter(m => m.category === 'thyroid' || m.category === 'antibodies').map(m => m.id)
);

// Keywords that signal a known non-thyroid report type.
const REPORT_TYPE_HINTS = [
  { keywords: ['complete blood count', 'white blood cell', 'hemoglobin', 'hematocrit', 'platelet', 'neutrophil', 'lymphocyte'], label: 'Complete Blood Count (CBC)' },
  { keywords: ['comprehensive metabolic', 'basic metabolic', 'creatinine', 'bun ', 'sodium', 'potassium', 'chloride'], label: 'Metabolic Panel' },
  { keywords: ['lipid panel', 'total cholesterol', 'ldl', 'hdl', 'triglyceride'], label: 'Lipid Panel' },
  { keywords: ['urinalysis', 'urine culture', 'specific gravity', 'leukocyte esterase'], label: 'Urinalysis' },
];

function detectReportType(text) {
  const lower = text.toLowerCase();
  for (const hint of REPORT_TYPE_HINTS) {
    if (hint.keywords.filter(k => lower.includes(k)).length >= 2) return hint.label;
  }
  return null;
}

async function extractText(file) {
  const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  if (isPDF) return extractTextFromPDF(file);
  if (file.type.startsWith('image/')) return extractTextFromImage(file);
  throw new Error(`Unsupported file type: ${file.name}`);
}

export function UploadZone({ onParsed }) {
  const [status, setStatus] = useState('idle');   // idle | processing | done | warning | error
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [thyroidNudge, setThyroidNudge] = useState(false);
  const [rawText, setRawText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  async function processFiles(files) {
    const validFiles = files.filter(f =>
      f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.type.startsWith('image/')
    );

    if (validFiles.length === 0) {
      setStatus('error');
      setMessage('Please upload PDF or image files (JPG, PNG, HEIC).');
      setSubMessage('');
      return;
    }

    setStatus('processing');
    setRawText('');
    setSubMessage('');
    setThyroidNudge(false);
    setShowPreview(false);

    const allParsed = {};
    const skipped = files.length - validFiles.length;
    let lastRawText = '';
    let detectedTypes = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setMessage(
        validFiles.length === 1
          ? `Reading ${file.name.length > 30 ? file.name.slice(0, 28) + '…' : file.name}…`
          : `Reading file ${i + 1} of ${validFiles.length}…`
      );

      try {
        const text = await extractText(file);
        if (text && text.trim().length >= 3) {
          const type = detectReportType(text);
          if (type) detectedTypes.push(type);
          const parsed = parseTextForMarkers(text);
          Object.assign(allParsed, parsed);
          lastRawText = text.trim().slice(0, 3000);
        }
      } catch (err) {
        console.warn(`[LabParser] Error reading ${file.name}:`, err?.message);
        // continue with other files
      }
    }

    const totalCount = Object.keys(allParsed).length;

    if (totalCount === 0) {
      const typeLabel = detectedTypes[0] || null;
      if (typeLabel) {
        setStatus('warning');
        setMessage(`Got your ${typeLabel} — no values we track were found in this one.`);
        setSubMessage(
          'Upload your thyroid panel too to see your full picture. Look for a report that includes TSH, Free T4, Free T3, or TPO antibodies.'
        );
      } else {
        setRawText(lastRawText);
        setStatus('warning');
        setMessage('Text was extracted but no lab values were recognized.');
        setSubMessage(
          'Your report may use a format we haven\'t seen yet. Try uploading your thyroid panel, or enter values manually below.'
        );
      }
      return;
    }

    // Values found — call onParsed and check if any are thyroid markers
    onParsed(allParsed);
    const hasThyroid = Object.keys(allParsed).some(id => THYROID_IDS.has(id));
    const fileWord = validFiles.length === 1 ? 'file' : `${validFiles.length} files`;
    const skippedNote = skipped > 0 ? ` (${skipped} unsupported file${skipped > 1 ? 's' : ''} skipped)` : '';

    setStatus('done');
    setMessage(`Found ${totalCount} lab value${totalCount !== 1 ? 's' : ''} from ${fileWord}.${skippedNote} Review and correct anything that looks off.`);
    setThyroidNudge(!hasThyroid);
    setSubMessage('');
  }

  function handleFileInput(e) {
    const files = [...(e.target.files || [])];
    if (files.length > 0) {
      processFiles(files);
      e.target.value = '';
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = [...(e.dataTransfer.files || [])];
    if (files.length > 0) processFiles(files);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-3">
      {/* Drop zone — always visible so users can keep adding files */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-teal-300 bg-teal-50' : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        {status === 'processing' ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            <p className="text-stone-500">{message}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-500" />
              </div>
              <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center">
                <Image className="w-5 h-5 text-teal-500" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-stone-700">
                {status === 'done' ? 'Drop more files to add results' : 'Drop your lab results here'}
              </p>
              <p className="text-sm text-stone-400 mt-1">
                PDF or image &bull; multiple files OK &bull; <span className="text-teal-500">click to browse</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Success */}
      {status === 'done' && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5 border border-emerald-100">
            <span className="mt-0.5">✓</span>
            <span>{message}</span>
          </div>
          {thyroidNudge && (
            <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
              <p className="text-sm text-amber-800 font-semibold">No thyroid markers found yet.</p>
              <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
                Upload your thyroid panel too — look for a report with TSH, Free T4, Free T3, or TPO antibodies.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Warning — text extracted but nothing (or no thyroid markers) found */}
      {status === 'warning' && (
        <div className="space-y-2">
          <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
            <p className="text-sm text-amber-800 font-semibold">{message}</p>
            {subMessage && <p className="text-sm text-amber-700 mt-1 leading-relaxed">{subMessage}</p>}
          </div>

          {rawText && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                onClick={() => setShowPreview(p => !p)}
              >
                <span>View extracted text</span>
                {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showPreview && (
                <div className="border-t border-stone-200">
                  <div className="flex justify-end px-3 py-1.5 border-b border-stone-100">
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-teal-600 transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy all'}
                    </button>
                  </div>
                  <pre className="px-3 py-2.5 text-xs text-stone-500 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-mono">
                    {rawText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hard error */}
      {status === 'error' && (
        <div className="bg-rose-50 rounded-xl px-3 py-2.5 border border-rose-100">
          <p className="text-sm text-rose-700 font-semibold">{message}</p>
          {subMessage && <p className="text-sm text-rose-600 mt-1 leading-relaxed">{subMessage}</p>}
        </div>
      )}
    </div>
  );
}
