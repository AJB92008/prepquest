// Function Fields' own theme for Boundary Setter, Slope Fields' fifth
// and final skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through, and equationScale.js's own header
// comment for this zone's own "Graph Paper" family). Boundary Setter is
// about graphing a linear inequality, so every stop draws a real
// boundary line with the solution's own half-plane shaded on one side
// of it — solid when the boundary itself is included (≤/≥), dashed
// when it's strict (</>), alternating both which style applies and
// which side is shaded so neither reads as the only possibility.
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
      <linearGradient id="boundaryLinePaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PAPER_TOP}" />
        <stop offset="100%" stop-color="${PAPER_BOTTOM}" />
      </linearGradient>
      <pattern id="boundaryLineGrid" width="34" height="34" patternUnits="userSpaceOnUse">
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

// The boundary line's own two endpoints, plus the same two points pushed
// perpendicular to one side by `depth` — a real shaded half-plane local
// to this stop (which side it pushes toward is what "which side is
// shaded" actually means here), not a decorative tint unrelated to the
// line's own direction.
function renderBoundaryStop(p, i) {
  const strict = i % 2 === 0;
  const shadeSide = i % 4 < 2 ? 1 : -1;
  const a = { x: p.x - 50, y: p.y - 20 };
  const b = { x: p.x + 50, y: p.y + 20 };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const depth = 32;
  const px = (-dy / len) * depth * shadeSide;
  const py = (dx / len) * depth * shadeSide;
  const c = { x: b.x + px, y: b.y + py };
  const d = { x: a.x + px, y: a.y + py };
  return `
    <path d="M${a.x.toFixed(1)},${a.y.toFixed(1)} L${b.x.toFixed(1)},${b.y.toFixed(1)} L${c.x.toFixed(1)},${c.y.toFixed(1)} L${d.x.toFixed(1)},${d.y.toFixed(1)} Z" fill="${ACCENT}" opacity="0.3" />
    <line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${INK}" stroke-width="4" stroke-linecap="round" ${strict ? 'stroke-dasharray="7 6"' : ""} />
  `;
}

function renderBoundaries(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderBoundaryStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Slope Fields: a boundary line at every stop with its own solution half-plane shaded to one side, alternating a solid boundary and a dashed one and which side is shaded, connecting every Boundary Setter lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#boundaryLinePaper)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#boundaryLineGrid)" opacity="0.6" />
      ${renderAxisWatermark(totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderBoundaries(positions)}</g>
    </svg>
  `;
}

export const boundaryLineTheme = {
  trailBand: BAND,
  mapBg: PAPER_TOP,
  hintColor: "rgba(44, 63, 99, 0.8)",
  renderScene,
};
