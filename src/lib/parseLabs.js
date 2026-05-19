import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { MARKERS } from '../data/markers.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Extract a lab value from a raw line using multiple strategies.
// LabCorp format: "Test Name   01   VALUE   [High/Low]   [prev]   [date]   units   range"
// Flag codes: "01" (normal), "A, 02" (above), "B, 02" (below)
function extractValue(rawLine) {
  // Strategy 1: LabCorp/Quest flag code pattern — most reliable
  // Looks for "01" or "A, 02" etc. immediately followed by the actual result
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
  // Only attempt if the line has known lab units (avoids false matches
  // in ordered-items lists, headers, reference range footnotes, etc.)
  const hasUnits = /\b(mg\/dL|pg\/mL|ng\/mL|ng\/dL|mIU\/L|uIU\/mL|IU\/mL|IU\/L|mmol\/L|g\/dL|ug\/dL|mcg\/dL|nmol\/L|mL\/min|%)\b/i.test(rawLine);
  if (hasUnits) {
    let cleaned = rawLine;
    cleaned = cleaned.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, ' ');          // dates
    cleaned = cleaned.replace(/\b\d{4}\b/g, ' ');                            // 4-digit years
    cleaned = cleaned.replace(/\d+\.?\d*\s*[-–]\s*\d+\.?\d*/g, ' ');        // ref ranges X-Y
    cleaned = cleaned.replace(/[<>]\s*\d+\.?\d*/g, ' ');                     // <N >N
    cleaned = cleaned.replace(/\b(High|Low|H|L|Abnormal|Normal|Critical)\b/gi, ' ');
    cleaned = cleaned.replace(/\b[A-Z]?,?\s*0[0-9]\b/g, ' ');               // flag codes
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

// Main parser: works line-by-line to avoid index-alignment bugs from normalization.
// Joins adjacent lines to handle multi-line test names (e.g. LabCorp TPO across 2 lines).
export function parseTextForMarkers(rawText) {
  const found = {};
  const lines = rawText.split(/\r?\n/);

  for (const marker of MARKERS) {
    if (found[marker.id] !== undefined) continue;

    // Longest aliases first — more specific matches win
    const sortedAliases = [...marker.aliases].sort((a, b) => b.length - a.length);

    for (const alias of sortedAliases) {
      const normalAlias = normalize(alias);
      let matched = false;

      for (let i = 0; i < lines.length; i++) {
        // Join current + next line to catch split test names like:
        //   "Thyroid Peroxidase (TPO)"
        //   "Ab   01   63   High   23   ..."
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

// Extract text from a PDF using pdf.js (client-side, no server needed)
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Preserve row breaks by detecting Y-position changes
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
  }

  return fullText;
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
