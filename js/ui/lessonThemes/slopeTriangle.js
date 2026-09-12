// Function Fields' own theme for Line Reader, Slope Fields' second
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and equationScale.js's own header comment for
// this zone's own "Graph Paper" family — pale grid-ruled paper and one
// dark ink blue, pulled from the hub's own fill for this zone). Line
// Reader is about reading a slope straight off a line, so every stop
// plots one line segment with its own real rise/run triangle drawn in
// beside it — a dashed run leg, then a dashed rise leg, the two
// measurements a slope is actually built from rather than a bare
// diagonal with nothing to read it by. Alternates a rising line and a
// falling one stop to stop, since a slope reader has to handle both.
// The line's own two endpoint dots sit `half`/`rise` away from the real
// stop point on purpose, not at it — the game's own real "Lesson N"
// marker button renders centered exactly there, and at a realistic
// mobile width its own radius runs to ≈38 local units (see
// equationScale.js's own header comment for the arithmetic, and
// tests/slopeFieldsLessonThemes.test.js's own MARKER_RADIUS_LOCAL,
// which this file's own dots are checked against). The line itself is
// safe passing straight through that point regardless (a thin stroke,
// the same "Line Crossing" look Numeria Peaks' own Ironroot Algebra
// zone already ships), but a filled dot needs real distance to actually
// read as its own point rather than vanish under the button — `half`/
// `rise` clear that radius with several units to spare even at this
// zone's original, smaller offsets, and sit further out here for extra
// margin on a narrower phone still. Each dot casts its own small flat
// contact shadow (the same convention windwardBough.js already uses
// for its own leaning trees) so the two endpoints read as real pinned
// points on the paper, not flat ink floating with nothing holding them
// down. Swept against every real lesson count these skills' own
// question banks produce (not a hand estimate), the closer shadow's
// own real closest point never comes within 99.0 local units of a boss
// clearing — comfortably past its own 86-unit radius — so this file
// carries none of crossingLines.js's/boundaryLine.js's own near-boss
// risk.
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
      <linearGradient id="slopeTrianglePaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PAPER_TOP}" />
        <stop offset="100%" stop-color="${PAPER_BOTTOM}" />
      </linearGradient>
      <pattern id="slopeTriangleGrid" width="34" height="34" patternUnits="userSpaceOnUse">
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

// One plotted line segment plus its own real rise/run triangle: `rising`
// picks which corner the right angle sits at (bottom-right for a rising
// line reading left to right, top-right for a falling one), so the
// dashed legs always measure the *actual* line drawn, never a
// mismatched one.
function renderSlopeStop(p, i) {
  const rising = i % 2 === 0;
  const half = 52;
  const rise = 32;
  const x0 = p.x - half;
  const x1 = p.x + half;
  const y0 = rising ? p.y + rise : p.y - rise;
  const y1 = rising ? p.y - rise : p.y + rise;
  const vertexY = y0;
  return `
    <ellipse cx="${x0.toFixed(1)}" cy="${(y0 + 4).toFixed(1)}" rx="12" ry="5" fill="${BOSS_FILL}" opacity="0.35" />
    <ellipse cx="${x1.toFixed(1)}" cy="${(y1 + 4).toFixed(1)}" rx="12" ry="5" fill="${BOSS_FILL}" opacity="0.35" />
    <line x1="${x0.toFixed(1)}" y1="${vertexY.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${vertexY.toFixed(1)}" stroke="${ACCENT}" stroke-width="2.5" stroke-dasharray="4 5" opacity="0.85" />
    <line x1="${x1.toFixed(1)}" y1="${vertexY.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${ACCENT}" stroke-width="2.5" stroke-dasharray="4 5" opacity="0.85" />
    <line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${INK}" stroke-width="4" stroke-linecap="round" />
    <circle cx="${x0.toFixed(1)}" cy="${y0.toFixed(1)}" r="4.5" fill="${INK}" />
    <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="4.5" fill="${INK}" />
  `;
}

function renderSlopes(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderSlopeStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Slope Fields: a plotted line segment at every stop with its own real rise/run triangle drawn beside it, alternating rising and falling lines, connecting every Line Reader lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#slopeTrianglePaper)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#slopeTriangleGrid)" opacity="0.6" />
      ${renderAxisWatermark(totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderSlopes(positions)}</g>
    </svg>
  `;
}

export const slopeTriangleTheme = {
  trailBand: BAND,
  mapBg: PAPER_TOP,
  hintColor: "rgba(44, 63, 99, 0.8)",
  renderScene,
};
