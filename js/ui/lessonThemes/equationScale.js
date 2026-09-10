// Function Fields' own theme for Equation Solver, Slope Fields' first
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and satMathHub.js's own header comment for
// this zone's own graph/grid visual language at the hub level). Equation
// Solver is about solving a linear equation down to one true value, so
// every stop plants a balance scale sitting level — both pans always
// equal, since that's what "solved" actually looks like — holding one
// tile marked "x" and one plain numeral tile, alternating which pan
// holds which so "x" isn't always the same side. This zone's own "Graph
// Paper" family — pale grid-ruled paper and a single dark-ink blue,
// pulled straight from Function Fields' own hub fill for this zone — is
// Slope Fields' own answer to Etymology Grove's forest green and
// Scriptorium's parchment; see this zone's other four files for the
// same palette used toward very different compositions.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const PAPER_TOP = "#fbfbf6";
const PAPER_BOTTOM = "#e3ebf5";
const GRID_LINE = "#aebede";
const GRID_LINE_BOLD = "#7e97c2";
const INK = "#2c3f63";
const ACCENT = "#6b8fc9";
const BOSS_FILL = "#1c2740";

const VALUES = [4, 9, 12, 7, 15, 3, 8, 11];

function defs() {
  return `
    <defs>
      <linearGradient id="equationScalePaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PAPER_TOP}" />
        <stop offset="100%" stop-color="${PAPER_BOTTOM}" />
      </linearGradient>
      <pattern id="equationScaleGrid" width="34" height="34" patternUnits="userSpaceOnUse">
        <path d="M0 0 H34 M0 0 V34" stroke="${GRID_LINE}" stroke-width="1" />
      </pattern>
    </defs>
  `;
}

// A large, faint axis cross behind everything else — the same recurring
// "graph paper" landmark every file in this zone opens with, tying the
// five lesson paths back to the hub's own axis-cross motif without
// repeating it as a foreground prop every file would otherwise need its
// own excuse to include.
function renderAxisWatermark(totalHeight) {
  const cx = COL_W / 2;
  const cy = totalHeight / 2;
  const armX = COL_W * 0.38;
  const armY = Math.min(totalHeight * 0.28, 260);
  return `
    <line x1="${(cx - armX).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + armX).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${GRID_LINE_BOLD}" stroke-width="2" opacity="0.3" />
    <line x1="${cx.toFixed(1)}" y1="${(cy - armY).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy + armY).toFixed(1)}" stroke="${GRID_LINE_BOLD}" stroke-width="2" opacity="0.3" />
  `;
}

// One labeled tile, hanging from a beam end by a short string —
// `label` is either "x" (the variable pan) or a plain numeral (the
// solved value), never both at once.
function renderPan(x, beamY, label) {
  const panY = beamY + 26;
  return `
    <line x1="${x.toFixed(1)}" y1="${beamY.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(panY - 12).toFixed(1)}" stroke="${INK}" stroke-width="2" />
    <rect x="${(x - 16).toFixed(1)}" y="${(panY - 12).toFixed(1)}" width="32" height="24" rx="4" fill="#ffffff" stroke="${INK}" stroke-width="2" />
    <text x="${x.toFixed(1)}" y="${(panY + 5).toFixed(1)}" font-size="15" font-weight="700" fill="${ACCENT}" text-anchor="middle">${label}</text>
  `;
}

// The scale itself — a fulcrum triangle, a level beam (always level:
// that balance is the whole point, since a solved equation's two sides
// are equal by definition), and one pan per end. `xOnLeft` decides which
// end holds the variable tile, alternating stop to stop so "x" never
// just sits on the same side every time. The whole assembly stands on
// `groundY`, raised clear of `p.y` itself (a thin stem ties it back
// down to the real stop point) rather than standing directly on it —
// the game's own real "Lesson N" marker button renders centered exactly
// on `p.y`, sized in fixed CSS px against an SVG that scales to its own
// container, so its footprint in this file's own local coordinate space
// grows as that container narrows. At a realistic mobile `.lesson-map-
// area` width (360px) and the real 40px `.node-circle-small`, that comes
// out to (40/2)*(680/360) ≈ 37.8 local units — the same arithmetic
// tests/slopeFieldsLessonThemes.test.js's own MARKER_RADIUS_LOCAL uses,
// so this comment and that test can't drift apart the way two
// separately-measured numbers could. A 16-unit clearance (this file's
// own first attempt, verified only in this project's oversized
// automation viewport, where the same marker measured a mere ~3.6 local
// units) still sat the fulcrum's wide base almost entirely under it.
// GROUND_CLEARANCE matches mathHub.js's own NODE_CLEARANCE (45) for
// exactly this reason — both exist to clear a marker/node whose real
// footprint isn't knowable from local geometry alone, and this project
// has already settled on 45 as a safe number for it (a 7-unit margin
// over 37.8 at this one width — tighter, not more, on a narrower phone).
const GROUND_CLEARANCE = 45;
function renderScaleStop(p, i) {
  const xOnLeft = i % 2 === 0;
  const value = VALUES[i % VALUES.length];
  const groundY = p.y - GROUND_CLEARANCE;
  const apexY = groundY - 24;
  const halfSpan = 48;
  const leftLabel = xOnLeft ? "x" : String(value);
  const rightLabel = xOnLeft ? String(value) : "x";
  return `
    <line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${groundY.toFixed(1)}" stroke="${INK}" stroke-width="2" opacity="0.45" />
    <path d="M${(p.x - 10).toFixed(1)},${groundY.toFixed(1)} L${(p.x + 10).toFixed(1)},${groundY.toFixed(1)} L${p.x.toFixed(1)},${apexY.toFixed(1)} Z" fill="${INK}" />
    <line x1="${(p.x - halfSpan).toFixed(1)}" y1="${apexY.toFixed(1)}" x2="${(p.x + halfSpan).toFixed(1)}" y2="${apexY.toFixed(1)}" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
    ${renderPan(p.x - halfSpan, apexY, leftLabel)}
    ${renderPan(p.x + halfSpan, apexY, rightLabel)}
  `;
}

function renderScales(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderScaleStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Slope Fields: a balance scale at every stop holding an x tile and a numeral tile in perfect balance, alternating which pan holds x, connecting every Equation Solver lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#equationScalePaper)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#equationScaleGrid)" opacity="0.6" />
      ${renderAxisWatermark(totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderScales(positions)}</g>
    </svg>
  `;
}

export const equationScaleTheme = {
  trailBand: BAND,
  mapBg: PAPER_TOP,
  hintColor: "rgba(44, 63, 99, 0.8)",
  renderScene,
};
