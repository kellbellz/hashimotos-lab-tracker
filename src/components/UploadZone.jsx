import { useState, useRef } from 'react';
import { Upload, FileText, Image, Loader2 } from 'lucide-react';
import { extractTextFromPDF, extractTextFromImage, parseTextForMarkers } from '../lib/parseLabs.js';

export function UploadZone({ onParsed }) {
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
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
    setMessage(isPDF ? 'Reading your PDF...' : 'Running OCR on your image (this may take 15–30 seconds)...');

    try {
      let text;
      if (isPDF) {
        text = await extractTextFromPDF(file);
      } else {
        text = await extractTextFromImage(file);
      }

      // Log full extracted text so we can tune the parser for this lab format
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
          'Text was extracted but no lab values were recognized. Your lab report may use a format we haven\'t seen — try entering values manually, or share a screenshot and we can improve parsing.'
        );
        return;
      }

      setStatus('done');
      setMessage(`Found ${count} lab value${count !== 1 ? 's' : ''}. Review and correct anything that looks wrong.`);
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
      // Reset so the same file can be re-selected
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
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={handleFileInput}
        />

        {status === 'processing' ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            <p className="text-gray-600">{message}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <Image className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-700">Drop your lab results here</p>
              <p className="text-sm text-gray-400 mt-1">PDF or image (JPG, PNG, screenshot) &bull; <span className="text-teal-600">click to browse</span></p>
            </div>
          </div>
        )}
      </div>

      {status === 'done' && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
          <span>✓</span> {message}
        </div>
      )}
      {status === 'error' && (
        <div className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{message}</div>
      )}
    </div>
  );
}
