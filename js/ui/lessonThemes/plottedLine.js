// Function Fields' own theme for Graph Plotter, Slope Fields' third
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and equationScale.js's own header comment for
// this zone's own "Graph Paper" family). Graph Plotter is about reading
// a point's own coordinates and locating it on a graph, so every stop
// draws a real x-axis and y-axis meeting at a corner, with two dashed
// guide lines projecting straight from the real stop point down to a
// tick on the x-axis and across to a tick on the y-axis — the textbook
// "plot this point" diagram, not just a line with dots on it. An
// earlier draft here was two dots connected by a plain diagonal, which
// read as a smaller, plainer version of slopeTriangle.js's own rise/run
// triangle rather than its own thing; this version's real subject is
// the axes themselves, perpendicular rather than diagonal, with the
// dashes converging on the point from two directions instead of
// measuring one line's own length. Alternates which corner the axes
// meet at (so the guide lines approach from a different side) stop to
// stop.
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
      <marker id="plottedLineAxisArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 Z" fill="${INK}" />
      </marker>
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

// The axes' own corner sits `offsetX`/`offsetY` away from the real stop
// point, never at it — the same clearance reasoning as every other file
// in this zone (see equationScale.js's own header comment for the real
// mobile-scale marker radius, ≈38 local units): the corner itself and
// both tick dots sit comfortably past that, and the two dashed guides
// are safe crossing near the marker regardless (a thin stroke, the same
// "Line Crossing" look this whole zone already accepts). `mirror`
// flips which corner the axes meet at — left-and-below vs right-and-
// below — so the guides approach the point from a different direction
// stop to stop rather than always the same one.
function renderAxisPlotStop(p, i) {
  const mirror = i % 2 === 0 ? 1 : -1;
  const originX = p.x - 54 * mirror;
  const originY = p.y + 46;
  const axisLen = 100;
  const xEnd = originX + axisLen * mirror;
  const yEnd = originY - axisLen;
  return `
    <line x1="${originX.toFixed(1)}" y1="${originY.toFixed(1)}" x2="${xEnd.toFixed(1)}" y2="${originY.toFixed(1)}" stroke="${INK}" stroke-width="3" stroke-linecap="round" marker-end="url(#plottedLineAxisArrow)" />
    <line x1="${originX.toFixed(1)}" y1="${originY.toFixed(1)}" x2="${originX.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="${INK}" stroke-width="3" stroke-linecap="round" marker-end="url(#plottedLineAxisArrow)" />
    <line x1="${p.x.toFixed(1)}" y1="${originY.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${ACCENT}" stroke-width="2.5" stroke-dasharray="4 5" />
    <line x1="${originX.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${ACCENT}" stroke-width="2.5" stroke-dasharray="4 5" />
    <circle cx="${p.x.toFixed(1)}" cy="${originY.toFixed(1)}" r="3.5" fill="${INK}" />
    <circle cx="${originX.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${INK}" />
  `;
}

function renderPlots(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderAxisPlotStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Slope Fields: a real x-axis and y-axis meeting at a corner at every stop, with dashed guide lines projecting from the lesson marker's own point down to a tick on each axis, alternating which corner the axes meet at, connecting every Graph Plotter lesson up to ${bossName}'s own clearing">
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
