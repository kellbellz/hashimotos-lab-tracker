import { useState, useRef } from 'react';
import { FileText, Image, Loader2, ChevronDown, ChevronUp, Copy, Check, Mail } from 'lucide-react';

const SUPPORT_EMAIL = 'labs@heal-hashimotos.com';
import { extractTextFromPDF, extractTextFromImage, parseTextForMarkers } from '../lib/parseLabs.js';

export function UploadZone({ onParsed }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [rawText, setRawText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
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
    setRawText('');
    setShowPreview(false);
    setMessage(
      isPDF
        ? 'Reading your PDF — this may take up to 30 seconds…'
        : 'Running OCR on your image (this may take 15–30 seconds)…'
    );

    try {
      let text;
      if (isPDF) {
        text = await extractTextFromPDF(file);
      } else {
        text = await extractTextFromImage(file);
      }

      console.log('[LabParser] Extracted text length:', text.length);
      console.log('[LabParser] Full extracted text:\n', text);

      if (!text || text.trim().length < 20) {
        setStatus('error');
        setMessage(
          isPDF
            ? 'Could not read text from this PDF. Try taking a screenshot of your results and uploading that as a JPG or PNG instead.'
            : 'Could not read text from this image. Try a clearer photo or enter values manually.'
        );
        return;
      }

      const parsed = parseTextForMarkers(text);
      const count = Object.keys(parsed).length;
      console.log('[LabParser] Parsed values:', parsed);

      if (count === 0) {
        // Show the raw text so we can debug the format
        setRawText(text.trim().slice(0, 3000));
        setStatus('error');
        setMessage(
          "Text was extracted but no lab values were recognized. Your lab report may use an unusual format — try entering values manually, or send us the extracted text below so we can add support for your lab."
        );
        return;
      }

      setRawText('');
      setStatus('done');
      setMessage(`Found ${count} lab value${count !== 1 ? 's' : ''}. Review and correct anything that looks off.`);
      onParsed(parsed);
    } catch (err) {
      console.error('[LabParser] Error:', err);
      setStatus('error');
      setMessage(err?.message || 'Something went wrong reading this file. Try manual entry instead.');
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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  function handleEmailDebug() {
    const subject = encodeURIComponent('Lab Parser — Format Not Recognized');
    const snippet = rawText ? rawText.slice(0, 1500) : '(no text extracted)';
    const body = encodeURIComponent(
      `Hi,\n\nI uploaded a lab PDF and the parser couldn't recognize any values. Here's the extracted text:\n\n---\n${snippet}\n---\n\nPlease add support for this format!`
    );
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
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
        <div className="space-y-2">
          <div className="text-sm text-rose-700 bg-rose-50 rounded-xl px-3 py-2.5 border border-rose-100">
            {message}
          </div>

          {rawText && (
            <div className="space-y-2">
              <button
                onClick={handleEmailDebug}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl px-3 py-2.5 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send extracted text to us for help
              </button>

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
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-teal-600 transition-colors"
                      >
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
