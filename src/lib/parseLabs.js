import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { MARKERS } from '../data/markers.js';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Unicode-aware normalize: keeps letters from ALL scripts (Cyrillic, Arabic,
// CJK, Devanagari, etc.) so non-Latin lab reports can match translated aliases.
function normalize(str) {
  return str.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')   // keep Unicode letters & digits, drop punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

// Detect the dominant Unicode script in a block of text so we can load the
// right Tesseract language pack for canvas OCR.
function detectOcrLangs(text) {
  if (!text || text.trim().length < 20) return 'eng+spa+fra+deu+por';
  const langs = new Set(['eng']);
  if (/[Ѐ-ӿ]/.test(text)) langs.add('rus');          // Cyrillic (Russian)
  if (/[؀-ۿ]/.test(text)) langs.add('ara');          // Arabic
  if (/[ऀ-ॿ]/.test(text)) langs.add('hin');          // Devanagari (Hindi)
  if (/[぀-ヿ]/.test(text)) langs.add('jpn');          // Japanese kana
  if (/[一-鿿㐀-䶿]/.test(text)) langs.add('chi_sim'); // CJK (Chinese/Japanese kanji)
  if (/[가-힯]/.test(text)) langs.add('kor');          // Korean Hangul
  if (/[ঀ-৿]/.test(text)) langs.add('ben');          // Bengali
  // If only Latin characters detected, load the common Latin-script language packs
  if (langs.size === 1) {
    langs.add('spa'); langs.add('fra'); langs.add('deu'); langs.add('por');
  }
  return [...langs].join('+');
}

// Known unit strings — used to detect value lines and strip them during cleanup.
const UNIT_PATTERN = /\b(mg\/dL|pg\/mL|ng\/mL|ng\/dL|mIU\/L|uIU\/mL|IU\/mL|IU\/L|mmol\/L|g\/dL|ug\/dL|mcg\/dL|mcg\/L|nmol\/L|mL\/min|%|mlU\/L)\b/i;

// Lines that should be skipped when looking for a value near a matched test name.
// Includes common status words in English + the 11 supported languages.
const SKIP_LINE = /^(normal|abnormal|high|low|critical|final|preliminary|pending|in\s+range|out\s+of\s+range|reference\s+range|ref\s+range|units?|component|your\s+value|standard\s+range|flag|status|result\s+type|anormal|alto|baja|bajo|alta|cr[ii]tico|eleve|bas|critique|hoch|niedrig|kritisch|норма|нормально|высокий|низкий|正常|异常|高|低|정상|비정상|높음|낙음|طبيعي|مرتفع|منخفض|सामान्य|असामान्य)$/iu;

// Remove a reference range like "0.40 - 4.50" or "0.40-4.50" from a string.
function stripRanges(str) {
  return str
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, ' ')          // dates  mm/dd/yyyy
    .replace(/\b\d{4}\b/g, ' ')                            // 4-digit years
    .replace(/\d+\.?\d*\s*[-–]\s*\d+\.?\d*/g, ' ')        // ref ranges X-Y
    .replace(/[<>]\s*\d+\.?\d*/g, ' ')                     // <N >N
    .replace(/\b(High|Low|H|L|Abnormal|Normal|Critical)\b/gi, ' ')
    .replace(/\b[A-Z]?,?\s*0[0-9]\b/g, ' ')               // LabCorp flag codes "01"
    .replace(new RegExp(UNIT_PATTERN.source, 'gi'), ' ');
}

// Pull a plausible numeric value from a single raw line.
function extractValue(rawLine) {
  // Strategy 1: LabCorp/Quest flag code pattern "01 VALUE" or "A, 02 VALUE"
  const flagMatch = rawLine.match(/\b(?:[A-Z],?\s*)?0[0-9]\b\s*([<>]?\s*\d+\.?\d*)/);
  if (flagMatch) {
    const num = parseFloat(flagMatch[1].replace(/[<>]/g, ''));
    if (!isNaN(num) && num >= 0) return num;
  }

  // Strategy 2a: Explicit "Result: X", "Value: X", "Level: X"
  const labelMatch = rawLine.match(/(?:result|value|level)[:\s]+([<>]?\s*\d+\.?\d*)/i);
  if (labelMatch) {
    const num = parseFloat(labelMatch[1].replace(/[<>]/g, ''));
    if (!isNaN(num)) return num;
  }

  // Strategy 2b: Colon-separated "Test Name: 2.35 mIU/L" — Epic & hospital portals
  if (UNIT_PATTERN.test(rawLine)) {
    const colonMatch = rawLine.match(/:\s*([<>]?\s*\d+\.?\d*)\s*(?:mIU\/L|ng\/dL|pg\/mL|IU\/mL|ng\/mL|mg\/L|mcg\/L|ug\/dL|nmol\/L|%|uIU\/mL)/i);
    if (colonMatch) {
      const num = parseFloat(colonMatch[1].replace(/[<>]/g, ''));
      if (!isNaN(num)) return num;
    }
  }

  // Strategy 3: Strip known non-value tokens, then grab the first plausible number.
  // Only attempt when we can confirm there are known units on the line.
  if (UNIT_PATTERN.test(rawLine)) {
    const cleaned = stripRanges(rawLine);
    const nums = [...cleaned.matchAll(/\b(\d+\.?\d*)\b/g)];
    for (const m of nums) {
      const num = parseFloat(m[1]);
      if (isNaN(num)) continue;
      if (num >= 1900 && num <= 2099 && Number.isInteger(num)) continue; // years
      if (num > 50000) continue;
      return num;
    }
  }

  return null;
}

// After confirming an alias match on line `matchIdx`, look ahead up to `lookahead`
// lines for the actual numeric result.  Handles Epic's multi-row table format where
// the value (and sometimes the unit) are on separate lines from the test name.
function extractNearby(lines, matchIdx, lookahead = 5) {
  for (let offset = 0; offset <= lookahead; offset++) {
    const line = (lines[matchIdx + offset] || '').trim();
    if (!line) continue;
    if (SKIP_LINE.test(line)) continue;
    // Skip pure ref-range lines "0.40 - 4.50"
    if (/^\d+\.?\d*\s*[-–]\s*\d+\.?\d*$/.test(line)) continue;
    // Skip lines that are only a unit string
    if (/^[a-z%\/]+$/i.test(line) && line.length < 12) continue;

    const val = extractValue(line);
    if (val !== null) return val;

    // Bare number — a line that is just a number, possibly with a < or >
    // Common in Epic where value and unit are in separate columns → separate lines
    const bareMatch = line.match(/^([<>]?\s*\d+\.?\d*)$/);
    if (bareMatch) {
      const num = parseFloat(bareMatch[1].replace(/[<>]/g, ''));
      if (!isNaN(num) && num >= 0 && num < 100000) return num;
    }
  }
  return null;
}

// Main parser.  Works line-by-line and uses a wider lookahead so it handles
// LabCorp (inline), Quest (inline), and Epic/hospital (multi-row table) formats.
export function parseTextForMarkers(rawText) {
  const found = {};
  const lines = rawText.split(/\r?\n/);

  for (const marker of MARKERS) {
    if (found[marker.id] !== undefined) continue;

    // Longest aliases first — more specific matches win
    const sortedAliases = [...marker.aliases].sort((a, b) => b.length - a.length);

    outer:
    for (const alias of sortedAliases) {
      const normalAlias = normalize(alias);

      for (let i = 0; i < lines.length; i++) {
        // Build a sliding window of 4 lines so split test names are captured
        const windowLines = [
          lines[i]     || '',
          lines[i + 1] || '',
          lines[i + 2] || '',
          lines[i + 3] || '',
        ];
        const normWindow = normalize(windowLines.join(' '));

        if (!normWindow.includes(normalAlias)) continue;

        // First try extracting from the 2-line window (LabCorp / Quest inline format)
        const twoLineRaw = windowLines[0] + ' ' + windowLines[1];
        let value = extractValue(twoLineRaw);

        // If that failed, scan the nearby lines individually (Epic multi-row format)
        if (value === null) {
          value = extractNearby(lines, i, 5);
        }

        if (value !== null) {
          found[marker.id] = value;
          break outer;
        }
      }
    }
  }

  return found;
}

// ─── PDF helpers ─────────────────────────────────────────────────────────────

// Render a single PDF page to a canvas data URL for Tesseract OCR.
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
// Pass nativeText (if any) so we can detect the document's script and load
// the right language pack — e.g. Russian, Arabic, CJK, etc.
async function ocrPdfPages(pdf, nativeText = '') {
  const { createWorker } = await import('tesseract.js');
  const langs = detectOcrLangs(nativeText);
  console.log('[LabParser] OCR language packs:', langs);
  const worker = await createWorker(langs);
  let fullText = '';
  const pageLimit = Math.min(pdf.numPages, 6);
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

// Extract text from a PDF.  Tries native pdf.js extraction first; if that
// fails or returns no text (image-based / Epic XFA PDF), falls back to canvas OCR.
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
    if (err?.name === 'PasswordException' || err?.message?.toLowerCase().includes('password')) {
      throw new Error(
        'This PDF is password-protected. Open it in Preview or your PDF viewer, then take a screenshot and upload that as a JPG or PNG instead.'
      );
    }
    console.warn('[LabParser] pdf.js failed to load PDF:', err?.message);
    throw new Error(
      "This PDF format isn't supported. Try taking a screenshot of your lab results and uploading that as an image instead."
    );
  }

  // ── Attempt 1: native text extraction ──────────────────────────────────────
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
      console.log('[LabParser] PDF native text extracted, length:', fullText.length);
      return fullText;
    }

    console.log('[LabParser] PDF has no native text — falling back to canvas OCR');
  } catch (err) {
    console.warn('[LabParser] Native text extraction failed, trying canvas OCR:', err?.message);
  }

  // ── Attempt 2: canvas OCR ──────────────────────────────────────────────────
  // Pass whatever native text we scraped (even if empty) so detectOcrLangs
  // can pick the right Tesseract language pack.
  try {
    const text = await ocrPdfPages(pdf, '');
    console.log('[LabParser] Canvas OCR complete, length:', text.length);
    return text;
  } catch (ocrErr) {
    console.error('[LabParser] Canvas OCR also failed:', ocrErr);
    throw new Error(
      "We couldn't read this PDF automatically. Try taking a screenshot of your lab results and uploading that as a JPG or PNG instead."
    );
  }
}

// Extract text from an image using Tesseract.js (client-side OCR).
// Runs a quick English-only pass first to detect the script, then re-runs
// with the appropriate language pack if non-Latin characters are found.
export async function extractTextFromImage(file) {
  const { createWorker } = await import('tesseract.js');
  const url = URL.createObjectURL(file);
  try {
    // First pass: English only (fast) — used purely for script detection
    const probe = await createWorker('eng');
    let probeText = '';
    try {
      const { data } = await probe.recognize(url);
      probeText = data.text;
    } finally {
      await probe.terminate();
    }

    const langs = detectOcrLangs(probeText);
    if (langs === 'eng') return probeText; // Latin only — reuse probe result

    // Second pass: full multilingual OCR
    const worker = await createWorker(langs);
    try {
      const { data: { text } } = await worker.recognize(url);
      return text;
    } finally {
      await worker.terminate();
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}
