// Function Fields' own theme for Crossing Point, Slope Fields' fourth
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and equationScale.js's own header comment for
// this zone's own "Graph Paper" family). Crossing Point is about solving
// a system of two linear equations, so every stop crosses two solid
// rods — thick, rounded bars with their own fill and border, read as
// real crossed objects rather than two more thin ink lines — pivoting
// around the same real stop point so they genuinely intersect exactly
// there rather than just passing near each other, the same "solved
// algebraically, not guessed" standard Numeria Peaks' own Curve Ball
// already holds its own parabola intersections to. An earlier draft
// here used plain thin lines (twice — first with a small ring at the
// intersection, then without after the ring proved too small to survive
// the real marker's own mobile-scale footprint); both versions still
// read as a smaller variant of slopeTriangle.js's own diagonal, so this
// one trades line weight for real solidity instead of adding another
// accessory. A thin line is safe pivoting through the marker's own
// point because its *identity* (length, direction) survives the button
// sitting on top of it, the Numeria Peaks "Line Crossing" precedent —
// but a crossing's identity *is* its center, so a rod has to actually
// reach past the marker and still show real length on both sides, not
// merely clear the marker at its own (pre-rotation) width the way a
// tile/dot would. ROD_LENGTH (140, half-length 70) is sized against the
// real ~38-unit mobile-scale marker radius (see equationScale.js's own
// header comment) so a real fraction of each rod's own half-length
// survives past it — a visible tab on each of the X's four arms, not a
// stub — and this length never shrinks: the marker-clearance concern is
// purely radial (half-length vs. marker radius), so a shorter rod would
// have quietly cost every stop the same visible tab, not just the one
// this file actually has a problem at.
// The one lesson stop immediately before the boss clearing has a
// second, unrelated concern: it sits only one row (ROW_H, 140) above
// the boss circle (its own radius 86), and a wide-angle (62°) rod's own
// rotated corner can land as close as ~75 local units from the boss
// center — inside it — for lesson counts this zone's own real question
// banks actually produce (up to 50 lessons). The fix is the angle, not
// the length: forcing that one stop's rods to the narrow angle (24°,
// already used every other stop half the time) drops the corner's own
// vertical reach enough that it clears the boss by a wide, count-
// independent margin (~20 units, verified across every real lesson
// count) while keeping the same ROD_LENGTH and the same visible tab
// every other stop gets. Every earlier stop sits at least two rows from
// the boss, always safe regardless of angle. See tests/slopeFields
// LessonThemes.test.js's own dedicated boss-clearance check (which
// sweeps every real lesson count, not just a handful) for the numbers.
// Alternates a wide-angle crossing and a narrow one stop to stop.
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

const ROD_LENGTH = 140;
const NARROW_ANGLE = 24;
const WIDE_ANGLE = 62;
const ROD_THICKNESS = 13;

// A single rod, centered exactly on (cx, cy) before rotation — pivoting
// it around its own center via `transform="rotate(...)"` is what keeps
// two rods sharing one real intersection point by construction, the
// same guarantee the old mirrored-offset lines gave, just built from a
// rotation instead of mirrored coordinates.
function renderRod(cx, cy, angleDeg, fill, stroke) {
  const x = cx - ROD_LENGTH / 2;
  const y = cy - ROD_THICKNESS / 2;
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${ROD_LENGTH}" height="${ROD_THICKNESS}" rx="${ROD_THICKNESS / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" transform="rotate(${angleDeg} ${cx.toFixed(1)} ${cy.toFixed(1)})" />`;
}

// Two rods, symmetric around horizontal (+angle/-angle) so they cross
// in a clean X centered on `p` — `wide` alternates a wide-angle
// crossing and a narrow one stop to stop, except at the one stop right
// before the boss clearing (`nearBoss` — see this file's own header
// comment), which is always forced to the narrow angle regardless of
// `i`'s own parity, to keep its own rods' reach clear of the boss.
function renderCrossingStop(p, i, nearBoss) {
  const wide = !nearBoss && i % 2 === 0;
  const angle = wide ? WIDE_ANGLE : NARROW_ANGLE;
  return renderRod(p.x, p.y, angle, INK, BOSS_FILL) + renderRod(p.x, p.y, -angle, ACCENT, INK);
}

function renderCrossings(positions) {
  const bossIndex = positions.length - 1;
  const stops = positions.filter((_, i) => i !== bossIndex);
  return stops.map((p, i) => renderCrossingStop(p, i, i === stops.length - 1)).join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Slope Fields: two solid crossed rods pivoting on a real, exact intersection point at every stop, alternating a wide-angle crossing and a narrow one (the stop right before ${bossName}'s own clearing is always the narrow crossing), connecting every Crossing Point lesson up to that clearing">
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
