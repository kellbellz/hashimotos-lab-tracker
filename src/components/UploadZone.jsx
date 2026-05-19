import { useState, useRef } from 'react';
import { FileText, Image, Loader2 } from 'lucide-react';
import { extractTextFromPDF, extractTextFromImage, parseTextForMarkers } from '../lib/parseLabs.js';

export function UploadZone({ onParsed }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  async function processFile(file) {
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPDF && !isImage) {
      setStatus('error');
      setMessage('Please upload a PDF or image file (JPG, PNG, HEIC).');
      return;
    }

    setStatus('processing');
    setMessage(isPDF ? 'Reading your PDF — this may take up to 30 seconds…' : 'Running OCR on your image (this may take 15–30 seconds)...');

    try {
      let text;
      if (isPDF) {
        text = await extractTextFromPDF(file);
      } else {
        text = await extractTextFromImage(file);
      }

      console.log('[LabParser] Full extracted text:\n', text);
      console.log('[LabParser] Text length:', text.length);

      if (!text || text.trim().length < 20) {
        setStatus('error');
        setMessage(
          isPDF
            ? 'Could not read text from this PDF. It may be a scanned image — try uploading a screenshot or photo of the results instead.'
            : 'Could not read text from this image. Try a clearer photo or enter values manually.'
        );
        return;
      }

      const parsed = parseTextForMarkers(text);
      const count = Object.keys(parsed).length;
      console.log('[LabParser] Parsed values:', parsed);

      if (count === 0) {
        setStatus('error');
        setMessage(
          "Text was extracted but no lab values were recognized. Your lab report may use a format we haven't seen — try entering values manually."
        );
        return;
      }

      setStatus('done');
      setMessage(`Found ${count} lab value${count !== 1 ? 's' : ''}. Review and correct anything that looks off.`);
      onParsed(parsed);
    } catch (err) {
      console.error('[LabParser] Error:', err);
      setStatus('error');
      setMessage(`Error reading file: ${err?.message || 'unknown error'}. Try manual entry instead.`);
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
      e.target.value = '';
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-teal-300 bg-teal-50' : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileInput} />

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
              <p className="font-semibold text-stone-700">Drop your lab results here</p>
              <p className="text-sm text-stone-400 mt-1">PDF or image (JPG, PNG, screenshot) &bull; <span className="text-teal-500">click to browse</span></p>
            </div>
          </div>
        )}
      </div>

      {status === 'done' && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5 border border-emerald-100">
          <span>✓</span> {message}
        </div>
      )}
      {status === 'error' && (
        <div className="text-sm text-rose-700 bg-rose-50 rounded-xl px-3 py-2.5 border border-rose-100">{message}</div>
      )}
    </div>
  );
}
