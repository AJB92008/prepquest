// Function Fields' own theme for Boundary Setter, Slope Fields' fifth
// and final skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through, and equationScale.js's own header
// comment for this zone's own "Graph Paper" family). Boundary Setter is
// about graphing a linear inequality, so every stop draws a real
// boundary line with the solution's own half-plane shaded on one side
// of it — solid when the boundary itself is included (≤/≥), dashed
// when it's strict (</>), alternating both which style applies and
// which side is shaded so neither reads as the only possibility. The
// shaded region is deliberately a big, bold wedge (DEPTH below), not a
// thin band hugging the line — an earlier, thinner version read as one
// more diagonal-line variant, the same complaint this zone's own three
// other line-based themes drew before slopeTriangle.js's rise/run
// triangle, plottedLine.js's axis-and-ticks diagram, and
// crossingLines.js's crossed rods each became their own real shape; a
// real region has to actually look like one to read as different from
// a line with an accessory. The one lesson stop immediately before the
// boss clearing is a real exception: it sits only one row (ROW_H, 140)
// above the boss circle (its own radius 86), and at full DEPTH the
// wedge's own far corner can land inside that circle for lesson counts
// this zone's own real question banks actually produce (up to 50
// lessons) — every earlier stop sits at least two rows away and is
// always safe regardless of DEPTH. NEAR_BOSS_DEPTH only ever applies to
// that one stop; see crossingLines.js's own header comment for the
// twin of this problem, and tests/slopeFieldsLessonThemes.test.js's own
// dedicated boss-clearance check (sweeping every real lesson count) for
// the numbers behind both constants. Each of the line's own two real
// endpoints (`a`/`b` — not the DEPTH-scaled wedge corners) casts its
// own small flat contact shadow, the same windwardBough.js convention
// every file in this zone now uses, so the boundary reads as pinned to
// the paper at both ends. `b`'s own shadow is this shape's own closest
// point to a boss clearing — swept across every real lesson count
// (not a hand estimate), its own real closest point never comes within
// 109.0 local units of one, comfortably past its own 86-unit radius —
// so unlike plottedLine.js's own tight corner this one didn't need a
// flatter, boss-safe treatment.
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
// perpendicular to one side by `DEPTH` — a real shaded half-plane local
// to this stop (which side it pushes toward is what "which side is
// shaded" actually means here), not a decorative tint unrelated to the
// line's own direction. `DEPTH` (55, up from an earlier, thinner 32) is
// still comfortably short of crowding the next row (ROW_H is 140) at
// this line's own shallow angle — see this file's own header comment
// for why the region needs to actually read as a region.
const DEPTH = 55;
const NEAR_BOSS_DEPTH = 20;
// `nearBoss` (true only for the one stop immediately before the boss
// clearing — see this file's own header comment) swaps in the
// shallower, boss-safe depth.
function renderBoundaryStop(p, i, nearBoss) {
  const strict = i % 2 === 0;
  const shadeSide = i % 4 < 2 ? 1 : -1;
  const depth = nearBoss ? NEAR_BOSS_DEPTH : DEPTH;
  const a = { x: p.x - 58, y: p.y - 22 };
  const b = { x: p.x + 58, y: p.y + 22 };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * depth * shadeSide;
  const py = (dx / len) * depth * shadeSide;
  const c = { x: b.x + px, y: b.y + py };
  const d = { x: a.x + px, y: a.y + py };
  return `
    <ellipse cx="${a.x.toFixed(1)}" cy="${(a.y + 4).toFixed(1)}" rx="12" ry="5" fill="${BOSS_FILL}" opacity="0.35" />
    <ellipse cx="${b.x.toFixed(1)}" cy="${(b.y + 4).toFixed(1)}" rx="12" ry="5" fill="${BOSS_FILL}" opacity="0.35" />
    <path d="M${a.x.toFixed(1)},${a.y.toFixed(1)} L${b.x.toFixed(1)},${b.y.toFixed(1)} L${c.x.toFixed(1)},${c.y.toFixed(1)} L${d.x.toFixed(1)},${d.y.toFixed(1)} Z" fill="${ACCENT}" opacity="0.4" />
    <line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" ${strict ? 'stroke-dasharray="7 6"' : ""} />
  `;
}

function renderBoundaries(positions) {
  const bossIndex = positions.length - 1;
  const stops = positions.filter((_, i) => i !== bossIndex);
  return stops.map((p, i) => renderBoundaryStop(p, i, i === stops.length - 1)).join("");
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
