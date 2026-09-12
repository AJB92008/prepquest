// Function Fields' own theme for Root Finder, Curve Reach's second
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and curveArc.js's own header comment for this
// zone's own "Rolling Curve" family — rolling-hill silhouettes and a
// tiled wave pattern in place of Slope Fields' flat grid paper). Root
// Finder is about solving nonlinear equations, including systems
// pairing a line with a curve, so every stop draws exactly that: a
// straight line and a curve crossing at one real, exact point — the
// root itself, marked with its own ring — rather than a bare diagonal
// or a bare arc alone. This is genuinely different from Curve Shaper's
// own pure arc (a line is now part of the composition) and from Slope
// Fields' crossingLines.js (two straight rods; here one side is
// deliberately curved, since a root finder's whole job is pairing a
// line against a curve, not two lines against each other). Alternates
// which way the line tilts stop to stop.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const PAPER_TOP = "#f2faf6";
const PAPER_BOTTOM = "#cdeee2";
const WAVE_LINE = "#9fd6c4";
const WAVE_LINE_BOLD = "#6fb9a4";
const HILL_FILL = "#bfe6d8";
const INK = "#1f4a42";
const ACCENT = "#4f9e8f";
const BOSS_FILL = "#153b34";

function defs() {
  return `
    <defs>
      <linearGradient id="rootCrossingPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PAPER_TOP}" />
        <stop offset="100%" stop-color="${PAPER_BOTTOM}" />
      </linearGradient>
      <pattern id="rootCrossingWave" width="140" height="70" patternUnits="userSpaceOnUse">
        <path d="M0,35 Q35,5 70,35 T140,35" fill="none" stroke="${WAVE_LINE}" stroke-width="2" />
      </pattern>
    </defs>
  `;
}

// Spaced by real height (see curveArc.js's own header comment for why
// a fixed handful of fractional positions goes sparse at this zone's
// own real, much taller lesson counts).
const HILL_SPACING = 320;
const HILL_CYCLE = [
  { fx: 0.5, rx: 220, ry: 70 },
  { fx: -0.1, rx: 260, ry: 85 },
  { fx: 1.05, rx: 250, ry: 80 },
  { fx: 0.15, rx: 230, ry: 75 },
  { fx: 0.9, rx: 260, ry: 85 },
  { fx: 0.4, rx: 240, ry: 78 },
];
function renderHills(totalHeight) {
  const count = Math.max(HILL_CYCLE.length, Math.round(totalHeight / HILL_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const h = HILL_CYCLE[i % HILL_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<ellipse cx="${(h.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" rx="${h.rx}" ry="${h.ry}" fill="${HILL_FILL}" opacity="0.4" />`;
  }).join("");
}

function renderArcWatermark(totalHeight) {
  const cx = COL_W / 2;
  const cy = totalHeight / 2;
  const halfW = COL_W * 0.42;
  const depth = Math.min(totalHeight * 0.18, 170);
  const y0 = cy + depth * 0.5;
  const vertexY = cy - depth * 0.5;
  const ctrlY = 2 * vertexY - y0;
  return `<path d="M${(cx - halfW).toFixed(1)},${y0.toFixed(1)} Q${cx.toFixed(1)},${ctrlY.toFixed(1)} ${(cx + halfW).toFixed(1)},${y0.toFixed(1)}" fill="none" stroke="${WAVE_LINE_BOLD}" stroke-width="3" opacity="0.3" />`;
}

// The intersection point sits `CLEARANCE` above `p` — same reasoning as
// curveArc.js's own baseline (see its header comment for the ≈38-unit
// real mobile-scale marker radius this clears, and for the too-tight-
// margin mistake a direct sweep caught there, worth re-checking here
// too rather than trusting the same hand math). Swept across every
// real lesson count, the root marker (a filled ring, the one part of
// this composition that actually needs clearance) clears the marker by
// a real 26.2 local units, and the line/curve strokes either side of
// it are safe passing near the marker regardless (the same "Line
// Crossing" precedent every thin stroke in this hub already relies
// on). The whole composition stays on this one fixed side of `p` —
// never alternating toward the boss clearing one row below — for the exact
// unconditional-boss-safety reason curveArc.js's own header comment
// gives; see tests/curveReachLessonThemes.test.js's own dedicated
// sweep for the swept numbers, not a hand estimate.
const CLEARANCE = 70;
const LINE_HALF = 55;
const CURVE_HALF_W = 55;
const CURVE_DEPTH = 30;
function renderRootStop(p, i) {
  const mirror = i % 2 === 0 ? 1 : -1;
  const cx = p.x;
  const cy = p.y - CLEARANCE;
  const angle = mirror * 26;
  const rad = (angle * Math.PI) / 180;
  const lx0 = cx - LINE_HALF * Math.cos(rad);
  const ly0 = cy - LINE_HALF * Math.sin(rad);
  const lx1 = cx + LINE_HALF * Math.cos(rad);
  const ly1 = cy + LINE_HALF * Math.sin(rad);
  const x0 = cx - CURVE_HALF_W;
  const x1 = cx + CURVE_HALF_W;
  const baseY = cy + CURVE_DEPTH;
  const ctrlY = 2 * cy - baseY;
  return `
    <ellipse cx="${cx.toFixed(1)}" cy="${(cy + 4).toFixed(1)}" rx="12" ry="5" fill="${BOSS_FILL}" opacity="0.35" />
    <path d="M${x0.toFixed(1)},${baseY.toFixed(1)} Q${cx.toFixed(1)},${ctrlY.toFixed(1)} ${x1.toFixed(1)},${baseY.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" />
    <line x1="${lx0.toFixed(1)}" y1="${ly0.toFixed(1)}" x2="${lx1.toFixed(1)}" y2="${ly1.toFixed(1)}" stroke="${ACCENT}" stroke-width="3.5" stroke-linecap="round" />
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="none" stroke="${INK}" stroke-width="2.5" />
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.5" fill="${INK}" />
  `;
}

function renderRoots(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderRootStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Curve Reach, its own rolling curved landscape: a straight line crossing a real curve at one exact marked root at every stop, alternating which way the line tilts, connecting every Root Finder lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#rootCrossingPaper)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#rootCrossingWave)" opacity="0.6" />
      ${renderHills(totalHeight)}
      ${renderArcWatermark(totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderRoots(positions)}</g>
    </svg>
  `;
}

export const rootCrossingTheme = {
  trailBand: BAND,
  mapBg: PAPER_TOP,
  hintColor: "rgba(31, 74, 66, 0.8)",
  renderScene,
};
