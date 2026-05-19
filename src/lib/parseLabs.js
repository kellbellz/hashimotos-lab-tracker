import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { MARKERS } from '../data/markers.js';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Extract a lab value from a raw line using multiple strategies.
// LabCorp format: "Test Name   01   VALUE   [High/Low]   [prev]   [date]   units   range"
// Flag codes: "01" (normal), "A, 02" (above), "B, 02" (below)
function extractValue(rawLine) {
  // Strategy 1: LabCorp/Quest flag code pattern — most reliable
  const flagMatch = rawLine.match(/\b(?:[A-Z],?\s*)?0[0-9]\b\s*([<>]?\s*\d+\.?\d*)/);
  if (flagMatch) {
    const raw = flagMatch[1].replace(/[<>]/g, '').trim();
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 0) return num;
  }

  // Strategy 2: "Result: X" or "Value: X" explicit label
  const labelMatch = rawLine.match(/(?:result|value|level)[:\s]+([<>]?\s*\d+\.?\d*)/i);
  if (labelMatch) {
    const raw = labelMatch[1].replace(/[<>]/g, '').trim();
    const num = parseFloat(raw);
    if (!isNaN(num)) return num;
  }

  // Strategy 3: Clean the line and take the first plausible number.
  const hasUnits = /\b(mg\/dL|pg\/mL|ng\/mL|ng\/dL|mIU\/L|uIU\/mL|IU\/mL|IU\/L|mmol\/L|g\/dL|ug\/dL|mcg\/dL|nmol\/L|mL\/min|%)\b/i.test(rawLine);
  if (hasUnits) {
    let cleaned = rawLine;
    cleaned = cleaned.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, ' ');
    cleaned = cleaned.replace(/\b\d{4}\b/g, ' ');
    cleaned = cleaned.replace(/\d+\.?\d*\s*[-–]\s*\d+\.?\d*/g, ' ');
    cleaned = cleaned.replace(/[<>]\s*\d+\.?\d*/g, ' ');
    cleaned = cleaned.replace(/\b(High|Low|H|L|Abnormal|Normal|Critical)\b/gi, ' ');
    cleaned = cleaned.replace(/\b[A-Z]?,?\s*0[0-9]\b/g, ' ');
    cleaned = cleaned.replace(/\b(mg\/dL|pg\/mL|ng\/mL|ng\/dL|mIU\/L|uIU\/mL|IU\/mL|IU\/L|mmol\/L|g\/dL|ug\/dL|mcg\/dL|nmol\/L|mL\/min|%|ratio)\b/gi, ' ');

    const nums = [...cleaned.matchAll(/\b(\d+\.?\d*)\b/g)];
    for (const m of nums) {
      const num = parseFloat(m[1]);
      if (isNaN(num)) continue;
      if (num >= 1900 && num <= 2099 && Number.isInteger(num)) continue;
      if (num > 50000) continue;
      return num;
    }
  }

  return null;
}

// Main parser: works line-by-line.
export function parseTextForMarkers(rawText) {
  const found = {};
  const lines = rawText.split(/\r?\n/);

  for (const marker of MARKERS) {
    if (found[marker.id] !== undefined) continue;

    const sortedAliases = [...marker.aliases].sort((a, b) => b.length - a.length);

    for (const alias of sortedAliases) {
      const normalAlias = normalize(alias);
      let matched = false;

      for (let i = 0; i < lines.length; i++) {
        const rawWindow = lines[i] + ' ' + (lines[i + 1] || '');
        const normWindow = normalize(rawWindow);

        if (!normWindow.includes(normalAlias)) continue;

        const value = extractValue(rawWindow);
        if (value !== null) {
          found[marker.id] = value;
          matched = true;
          break;
        }
      }

      if (matched) break;
    }
  }

  return found;
}

// Render a PDF page to a canvas and return it as a data URL for OCR.
async function renderPageToDataUrl(page, scale = 2.0) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
}

// OCR fallback: render PDF pages to canvas, then run Tesseract on them.
async function ocrPdfPages(pdf) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  let fullText = '';
  const pageLimit = Math.min(pdf.numPages, 6); // cap at 6 pages for speed
  try {
    for (let i = 1; i <= pageLimit; i++) {
      const page = await pdf.getPage(i);
      const dataUrl = await renderPageToDataUrl(page);
      const { data: { text } } = await worker.recognize(dataUrl);
      fullText += text + '\n';
      page.cleanup();
    }
  } finally {
    await worker.terminate();
  }
  return fullText;
}

// Extract text from a PDF. Tries native text extraction first;
// if that fails or yields no text (image-based / Epic PDF), falls back to canvas OCR.
export async function extractTextFromPDF(file) {
  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error('Could not read the file. Please try again.');
  }

  let pdf;
  try {
    pdf = await getDocument({
      data: new Uint8Array(arrayBuffer),
      disableFontFace: true,
      isEvalSupported: false,
      useSystemFonts: true,
      stopAtErrors: false,
    }).promise;
  } catch (err) {
    // Password-protected PDF
    if (err?.name === 'PasswordException' || err?.message?.toLowerCase().includes('password')) {
      throw new Error(
        'This PDF is password-protected. Open it in Preview or Adobe Reader, print to PDF (without a password), then upload the new file.'
      );
    }
    // Any other pdf.js load error — re-throw with a helpful message
    console.warn('[LabParser] pdf.js load error, cannot attempt OCR fallback:', err);
    throw new Error(
      'This PDF format isn\'t supported. Try taking a screenshot of your lab results and uploading that as a JPG or PNG instead.'
    );
  }

  // --- Attempt 1: native text extraction ---
  try {
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent({ includeMarkedContent: false });

      let prevY = null;
      let pageText = '';
      for (const item of content.items) {
        if ('str' in item) {
          const y = item.transform?.[5];
          if (prevY !== null && Math.abs(y - prevY) > 3) {
            pageText += '\n';
          }
          pageText += item.str + ' ';
          prevY = y;
        }
      }
      fullText += pageText + '\n';
      page.cleanup();
    }

    if (fullText.trim().length >= 20) {
      return fullText;
    }

    // Text was empty — image-based PDF, fall through to OCR
    console.log('[LabParser] PDF has no extractable text — trying canvas OCR...');
  } catch (err) {
    // Text extraction threw (e.g. Epic XFA PDFs) — fall through to OCR
    console.warn('[LabParser] Text extraction failed, trying canvas OCR:', err?.message);
  }

  // --- Attempt 2: canvas-based OCR ---
  try {
    const text = await ocrPdfPages(pdf);
    return text;
  } catch (ocrErr) {
    console.error('[LabParser] Canvas OCR also failed:', ocrErr);
    throw new Error(
      'We couldn\'t read this PDF automatically. Try taking a screenshot of your lab results and uploading that as an image instead.'
    );
  }
}

// Extract text from an image using Tesseract.js (client-side OCR)
export async function extractTextFromImage(file) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  const url = URL.createObjectURL(file);
  try {
    const { data: { text } } = await worker.recognize(url);
    return text;
  } finally {
    await worker.terminate();
    URL.revokeObjectURL(url);
  }
}
