// Function Fields' own theme for Crossing Point, Slope Fields' fourth
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and equationScale.js's own header comment for
// this zone's own "Graph Paper" family). Crossing Point is about solving
// a system of two linear equations, so every stop draws two real lines
// in two different inks, each one built symmetrically around the same
// center point so they genuinely intersect exactly there rather than
// just passing near each other — the same "solved algebraically, not
// guessed" standard Numeria Peaks' own Curve Ball already holds its own
// parabola intersections to. No separate ring drawn at the real
// intersection itself (an earlier draft added one) — the game's own
// real "Lesson N" marker button already renders centered exactly there,
// and at a realistic mobile width it's ≈38 local units in radius (see
// equationScale.js's own header comment for the arithmetic this whole
// zone now accounts for), big enough to swallow a small ring outright
// rather than frame it. The two crossing lines themselves are
// safe left alone: a thin stroke passing at or through the marker's own
// position is already an established, accepted look in this app —
// Numeria Peaks' own Line Crossing zone is one continuous diagonal line
// doing exactly that at every stop. Alternates a steep crossing and a
// shallow one stop to stop.
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
      <linearGradient id="crossingLinesPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PAPER_TOP}" />
        <stop offset="100%" stop-color="${PAPER_BOTTOM}" />
      </linearGradient>
      <pattern id="crossingLinesGrid" width="34" height="34" patternUnits="userSpaceOnUse">
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

// Two lines, each built as a mirror pair of offsets around `p` itself
// (±half on x, ±rise on y) — the center point is always exactly the
// true midpoint of both segments, so the two lines share that point by
// construction, not by eyeballing two segments that merely look close.
function renderCrossingStop(p, i) {
  const half = 46;
  const steep = i % 2 === 0;
  const riseA = steep ? 34 : 16;
  const riseB = steep ? 16 : 34;
  return `
    <line x1="${(p.x - half).toFixed(1)}" y1="${(p.y - riseA).toFixed(1)}" x2="${(p.x + half).toFixed(1)}" y2="${(p.y + riseA).toFixed(1)}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" />
    <line x1="${(p.x - half).toFixed(1)}" y1="${(p.y + riseB).toFixed(1)}" x2="${(p.x + half).toFixed(1)}" y2="${(p.y - riseB).toFixed(1)}" stroke="${ACCENT}" stroke-width="3.5" stroke-linecap="round" />
  `;
}

function renderCrossings(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderCrossingStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Slope Fields: two lines in two different inks crossing at a real, exact intersection point at every stop, alternating a steep crossing and a shallow one, connecting every Crossing Point lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#crossingLinesPaper)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#crossingLinesGrid)" opacity="0.6" />
      ${renderAxisWatermark(totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderCrossings(positions)}</g>
    </svg>
  `;
}

export const crossingLinesTheme = {
  trailBand: BAND,
  mapBg: PAPER_TOP,
  hintColor: "rgba(44, 63, 99, 0.8)",
  renderScene,
};
