// Function Fields' own theme for Graph Plotter, Slope Fields' third
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and equationScale.js's own header comment for
// this zone's own "Graph Paper" family). Graph Plotter is about building
// a line's own graph one point at a time, so every stop plots two real
// points on the same line the game's own "Lesson N" marker sits on —
// that marker itself reads as the third, middle point (a real dot drawn
// directly under it added nothing: at a realistic mobile width the
// marker's own radius runs to ≈38 local units, more than enough to
// swallow a plain 5-unit dot outright, see equationScale.js's own
// header comment for the arithmetic) — and rings the last one, the
// point just placed, rather than drawing one finished line with nothing
// showing how it actually got there. Alternates which way the line runs
// (rising or falling) stop to stop, same reasoning slopeTriangle.js's
// own version gives.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const PAPER_TOP = "#fbfbf6";
const PAPER_BOTTOM = "#e3ebf5";
const GRID_LINE = "#aebede";
const GRID_LINE_BOLD = "#7e97c2";
const INK = "#2c3f63";
const ACCENT = "#6b8fc9";
const BOSS_FILL = "#1c2740";

function defs() {
  return `
    <defs>
      <linearGradient id="plottedLinePaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PAPER_TOP}" />
        <stop offset="100%" stop-color="${PAPER_BOTTOM}" />
      </linearGradient>
      <pattern id="plottedLineGrid" width="34" height="34" patternUnits="userSpaceOnUse">
        <path d="M0 0 H34 M0 0 V34" stroke="${GRID_LINE}" stroke-width="1" />
      </pattern>
    </defs>
  `;
}

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

// Two real drawn points plus the real stop point itself (the marker's
// own position) — the same collinear construction as three points would
// be (the two drawn ones sit at equal, opposite offsets from `p`, so all
// three are exactly collinear by construction), just without a redundant
// dot under the marker. The last one gets an extra ring, reading as
// "just placed" rather than identical to the other. `half`/`rise`
// clear the marker's own real mobile-scale radius (≈38 local units, see
// equationScale.js's own header comment for the arithmetic) with real
// margin to spare, the same offsets slopeTriangle.js's own version uses.
function renderPlotStop(p, i) {
  const sign = i % 2 === 0 ? -1 : 1;
  const half = 52;
  const rise = 32 * sign;
  const p0 = { x: p.x - half, y: p.y + rise };
  const p2 = { x: p.x + half, y: p.y - rise };
  return `
    <line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity="0.9" />
    <circle cx="${p0.x.toFixed(1)}" cy="${p0.y.toFixed(1)}" r="5" fill="${INK}" />
    <circle cx="${p2.x.toFixed(1)}" cy="${p2.y.toFixed(1)}" r="5" fill="${INK}" />
    <circle cx="${p2.x.toFixed(1)}" cy="${p2.y.toFixed(1)}" r="9" fill="none" stroke="${ACCENT}" stroke-width="2.5" />
  `;
}

function renderPlots(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderPlotStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Slope Fields: two real plotted points at every stop, on the same line the lesson marker itself sits on, with the newer one ringed as just placed, alternating rising and falling lines, connecting every Graph Plotter lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#plottedLinePaper)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#plottedLineGrid)" opacity="0.6" />
      ${renderAxisWatermark(totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderPlots(positions)}</g>
    </svg>
  `;
}

export const plottedLineTheme = {
  trailBand: BAND,
  mapBg: PAPER_TOP,
  hintColor: "rgba(44, 63, 99, 0.8)",
  renderScene,
};
