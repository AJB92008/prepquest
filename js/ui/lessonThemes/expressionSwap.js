// Function Fields' own theme for Expression Rebuilder, Curve Reach's
// third and final skill (see lessonTerrain.js for the shared engine
// every lesson-path theme renders through, and curveArc.js's own header
// comment for this zone's own "Rolling Curve" family — rolling-hill
// silhouettes and a tiled wave pattern in place of Slope Fields' flat
// grid paper). Expression Rebuilder is about rewriting an expression
// into an equivalent form, not solving anything or plotting a curve —
// so unlike Curve Shaper's arc or Root Finder's line-meets-curve, every
// stop here draws two small real expression tiles connected by a
// transform arrow, one form becoming its own genuine equivalent (a
// real algebraic identity, not made-up text) — the same "give it its
// own real shape" standard this hub's own Slope Fields zone settled on
// rather than another curve-based variant. Alternates which side (left/
// right) holds the starting form, so the arrow itself doesn't always
// point the same way.
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

const EXPR_PAIRS = [
  ["(x+1)²", "x²+2x+1"],
  ["2(x+3)", "2x+6"],
  ["x²-9", "(x-3)(x+3)"],
  ["3x+3y", "3(x+y)"],
];

function defs() {
  return `
    <defs>
      <linearGradient id="expressionSwapPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PAPER_TOP}" />
        <stop offset="100%" stop-color="${PAPER_BOTTOM}" />
      </linearGradient>
      <pattern id="expressionSwapWave" width="140" height="70" patternUnits="userSpaceOnUse">
        <path d="M0,35 Q35,5 70,35 T140,35" fill="none" stroke="${WAVE_LINE}" stroke-width="2" />
      </pattern>
      <marker id="expressionSwapArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 Z" fill="${INK}" />
      </marker>
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

// One labeled tile holding a real expression — sized generously enough
// (84 wide) for the longest real pair in EXPR_PAIRS at a legible font
// size, not measured dynamically (this project's SVG strings never
// measure text at render time; every other tile-label file in this hub,
// e.g. equationScale.js's own pans, picks one fixed width the same way).
function renderTile(cx, cy, label) {
  const w = 84;
  const h = 30;
  return `
    <ellipse cx="${cx.toFixed(1)}" cy="${(cy + h / 2 + 4).toFixed(1)}" rx="${w / 2 + 2}" ry="5" fill="${BOSS_FILL}" opacity="0.35" />
    <rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="6" fill="#ffffff" stroke="${INK}" stroke-width="2" />
    <text x="${cx.toFixed(1)}" y="${(cy + 5).toFixed(1)}" font-size="13" font-weight="700" fill="${INK}" text-anchor="middle">${label}</text>
  `;
}

// Both tiles sit on a baseline `CLEARANCE` above `p` (never below it) —
// the same unconditional-boss-safety reasoning curveArc.js's own header
// comment gives for keeping a whole composition on one fixed side of
// `p`. `mirror` only swaps which tile holds the starting form (so the
// transform arrow's own direction alternates); it never changes where
// anything sits, so both tiles clear the real ≈38-unit mobile-scale
// marker radius (see equationScale.js's own header comment for the
// arithmetic, and curveArc.js's own header comment for the too-tight-
// margin mistake a direct sweep caught there) by a real, swept 14.2
// local units every stop, not a hand estimate.
const CLEARANCE = 60;
const GAP = 68;
function renderExpressionStop(p, i) {
  const [from, to] = EXPR_PAIRS[i % EXPR_PAIRS.length];
  const mirror = i % 2 === 0;
  const y = p.y - CLEARANCE;
  const leftLabel = mirror ? from : to;
  const rightLabel = mirror ? to : from;
  const leftX = p.x - GAP;
  const rightX = p.x + GAP;
  const arrowX0 = leftX + 44;
  const arrowX1 = rightX - 44;
  return `
    <line x1="${arrowX0.toFixed(1)}" y1="${y.toFixed(1)}" x2="${arrowX1.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${ACCENT}" stroke-width="3" stroke-linecap="round" marker-end="url(#expressionSwapArrow)" />
    ${renderTile(leftX, y, leftLabel)}
    ${renderTile(rightX, y, rightLabel)}
  `;
}

function renderExpressions(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderExpressionStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Curve Reach, its own rolling curved landscape: two real expression tiles connected by a transform arrow at every stop, one form rewritten into its own genuine equivalent, alternating which side holds the starting form, connecting every Expression Rebuilder lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#expressionSwapPaper)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#expressionSwapWave)" opacity="0.6" />
      ${renderHills(totalHeight)}
      ${renderArcWatermark(totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderExpressions(positions)}</g>
    </svg>
  `;
}

export const expressionSwapTheme = {
  trailBand: BAND,
  mapBg: PAPER_TOP,
  hintColor: "rgba(31, 74, 66, 0.8)",
  renderScene,
};
