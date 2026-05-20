import { STATUS, analyzeMarker } from '../lib/analyze.js';

// ── Chart constants ───────────────────────────────────────────────────────────
const W = 560, H = 210;
const PAD = { t: 20, r: 20, b: 50, l: 54 };
const CW = W - PAD.l - PAD.r;
const CH = H - PAD.t - PAD.b;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toX(i, n) {
  return PAD.l + (n > 1 ? (i / (n - 1)) * CW : CW / 2);
}
function toY(v, yMin, yMax) {
  if (yMax === yMin) return PAD.t + CH / 2;
  return PAD.t + (1 - (v - yMin) / (yMax - yMin)) * CH;
}

function niceY(yMin, yMax, ticks = 5) {
  const raw = (yMax - yMin) / (ticks - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = Math.ceil(raw / mag) * mag;
  const start = Math.floor(yMin / step) * step;
  const result = [];
  for (let v = start; v <= yMax + step * 0.01; v = parseFloat((v + step).toFixed(10))) {
    if (v >= yMin - step * 0.1) result.push(parseFloat(v.toFixed(6)));
  }
  return result;
}

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

const DOT_COLOR = {
  [STATUS.CRITICAL]: '#f43f5e',
  [STATUS.CONCERN]:  '#f59e0b',
  [STATUS.OPTIMAL]:  '#10b981',
  [STATUS.UNKNOWN]:  '#94a3b8',
};

// ── TrendChart ────────────────────────────────────────────────────────────────
export function TrendChart({ snapshots, marker, optimalOverride }) {
  // Build sorted data points that have a value for this marker
  const points = snapshots
    .map(s => ({ date: s.date, value: parseFloat(s.values[marker.id]) }))
    .filter(p => !isNaN(p.value))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-stone-400 text-sm">
        No data saved yet for {marker.name}
      </div>
    );
  }

  const opt = optimalOverride || marker.optimal;
  const stdLow  = marker.standard.low  ?? 0;
  const stdHigh = marker.standard.high ?? 0;
  const optLow  = opt?.low  ?? stdLow;
  const optHigh = opt?.high ?? stdHigh;

  const allVals = points.map(p => p.value);
  const dataMin = Math.min(...allVals);
  const dataMax = Math.max(...allVals);
  const rawMin  = Math.min(stdLow, optLow, dataMin);
  const rawMax  = Math.max(stdHigh, optHigh, dataMax);
  const buf     = Math.max((rawMax - rawMin) * 0.18, rawMax * 0.05, 0.1);
  const yMin    = Math.max(0, rawMin - buf);
  const yMax    = rawMax + buf;

  const yTicks = niceY(yMin, yMax);
  const n = points.length;

  // Polyline points string
  const linePoints = points.map((p, i) => `${toX(i, n)},${toY(p.value, yMin, yMax)}`).join(' ');

  // Optimal band y coordinates
  const bandTop    = toY(Math.min(optHigh, yMax), yMin, yMax);
  const bandBottom = toY(Math.max(optLow,  yMin), yMin, yMax);

  // Status per point
  const statuses = points.map(p => analyzeMarker(marker, p.value, optimalOverride).status);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ minWidth: 300, maxHeight: 240 }}
        aria-label={`${marker.name} trend chart`}
      >
        {/* ── Background ─────────────────────────────────────────────────── */}
        <rect x={PAD.l} y={PAD.t} width={CW} height={CH} fill="#f8fafc" rx="4" />

        {/* ── Optimal range band ──────────────────────────────────────────── */}
        {optHigh > optLow && (
          <rect
            x={PAD.l}
            y={bandTop}
            width={CW}
            height={Math.max(0, bandBottom - bandTop)}
            fill="#d1fae5"
            opacity={0.7}
          />
        )}

        {/* ── Gridlines + Y-axis ticks ────────────────────────────────────── */}
        {yTicks.map(v => {
          const y = toY(v, yMin, yMax);
          if (y < PAD.t - 2 || y > PAD.t + CH + 2) return null;
          return (
            <g key={v}>
              <line x1={PAD.l} x2={PAD.l + CW} y1={y} y2={y} stroke="#e2e8f0" strokeWidth={1} />
              <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
                {v % 1 === 0 ? v : v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* ── Std range boundary lines (dashed) ──────────────────────────── */}
        {[stdLow, stdHigh].map((v, i) => {
          const y = toY(v, yMin, yMax);
          if (y < PAD.t || y > PAD.t + CH) return null;
          return (
            <line
              key={i}
              x1={PAD.l} x2={PAD.l + CW}
              y1={y} y2={y}
              stroke="#f43f5e"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.45}
            />
          );
        })}

        {/* ── Chart border ────────────────────────────────────────────────── */}
        <rect x={PAD.l} y={PAD.t} width={CW} height={CH} fill="none" stroke="#e2e8f0" strokeWidth={1} rx="4" />

        {/* ── Line ────────────────────────────────────────────────────────── */}
        {n > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#0d9488"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* ── Dots ────────────────────────────────────────────────────────── */}
        {points.map((p, i) => {
          const cx = toX(i, n);
          const cy = toY(p.value, yMin, yMax);
          const fill = DOT_COLOR[statuses[i]] || DOT_COLOR[STATUS.UNKNOWN];
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={6} fill="white" stroke={fill} strokeWidth={2.5} />
              <circle cx={cx} cy={cy} r={3} fill={fill} />
              {/* Value label above dot */}
              <text
                x={cx}
                y={cy - 10}
                textAnchor="middle"
                fontSize={10}
                fontWeight="700"
                fill={fill}
              >
                {p.value % 1 === 0 ? p.value : parseFloat(p.value.toFixed(2))}
              </text>
            </g>
          );
        })}

        {/* ── X-axis date labels ──────────────────────────────────────────── */}
        {points.map((p, i) => (
          <text
            key={i}
            x={toX(i, n)}
            y={H - 6}
            textAnchor="middle"
            fontSize={10}
            fill="#94a3b8"
            transform={n > 4 ? `rotate(-35, ${toX(i, n)}, ${H - 6})` : undefined}
          >
            {fmtDate(p.date)}
          </text>
        ))}

        {/* ── Y-axis unit label ────────────────────────────────────────────── */}
        <text
          x={12}
          y={PAD.t + CH / 2}
          textAnchor="middle"
          fontSize={10}
          fill="#94a3b8"
          transform={`rotate(-90, 12, ${PAD.t + CH / 2})`}
        >
          {marker.unit}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-2 px-1 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-300" />
          Optimal range
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" /></svg>
          Standard limit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-rose-400" /> Out of range
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-400" /> Below optimal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-400" /> Optimal
        </span>
      </div>
    </div>
  );
}
