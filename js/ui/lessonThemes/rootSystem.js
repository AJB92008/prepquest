// Function Fields' own theme for Root Finder, Curve Reach's second
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through). Root Finder's own first theme, rootCrossing
// (a line crossing a curve on pale wave-paper, continuing the hub's own
// "Rolling Curve" family Curve Shaper still uses), read poorly enough
// on its own that it's replaced outright here with a real forest —
// literally underground, since "root finder" already names its own
// visual: a cutaway of soil showing a real root system, one straight
// taproot and one curving lateral root forking at a single point, that
// point marked with a small sprouting shoot — the exact real solution a
// root finder actually finds, styled as new growth breaking ground
// rather than a bare ring. This keeps the same real "two different
// paths meeting at one exact point" structure the old theme's line-
// meets-curve pairing had (a genuine algebra idea, a system pairing a
// line against a curve), just restyled entirely rather than replaced
// with something unrelated to the skill.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SOIL_TOP = "#f0e4cf";
const SOIL_BOTTOM = "#c9a876";
const SOIL_SPECK = "#a9835a";
const TAPROOT = "#5a3a22";
const LATERAL_ROOT = "#8a6a3f";
const SPROUT = "#7fae52";
const SPROUT_DARK = "#4f7a34";
const BOSS_FILL = "#3a2414";

function defs() {
  return `
    <defs>
      <linearGradient id="rootSystemSoil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SOIL_TOP}" />
        <stop offset="100%" stop-color="${SOIL_BOTTOM}" />
      </linearGradient>
      <pattern id="rootSystemSpeck" width="46" height="46" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="10" r="2" fill="${SOIL_SPECK}" opacity="0.5" />
        <circle cx="30" cy="6" r="1.4" fill="${SOIL_SPECK}" opacity="0.4" />
        <circle cx="20" cy="28" r="2.4" fill="${SOIL_SPECK}" opacity="0.5" />
        <circle cx="40" cy="34" r="1.6" fill="${SOIL_SPECK}" opacity="0.4" />
      </pattern>
    </defs>
  `;
}

// Small stray root hairs scattered down the whole scene — the same
// "sell the environment beyond the diagram" role curveArc.js's own
// hill silhouettes play for Rolling Curve, spaced by real height (see
// curveArc.js's own header comment for why a fixed handful of
// fractional positions goes sparse at this zone's own real, much
// taller lesson counts).
const HAIR_SPACING = 260;
const HAIR_CYCLE = [
  { fx: 0.12, len: 30, angle: 35 },
  { fx: 0.88, len: 26, angle: -40 },
  { fx: 0.25, len: 22, angle: 55 },
  { fx: 0.75, len: 28, angle: -25 },
];
function renderRootHairs(totalHeight) {
  const count = Math.max(HAIR_CYCLE.length, Math.round(totalHeight / HAIR_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const h = HAIR_CYCLE[i % HAIR_CYCLE.length];
    const x = h.fx * COL_W;
    const y = ((i + 0.5) / count) * totalHeight;
    const rad = (h.angle * Math.PI) / 180;
    const x2 = x + h.len * Math.cos(rad);
    const y2 = y + h.len * Math.sin(rad);
    return `<path d="M${x.toFixed(1)},${y.toFixed(1)} Q${(x + h.len * 0.5 * Math.cos(rad + 0.6)).toFixed(1)},${(y + h.len * 0.5 * Math.sin(rad + 0.6)).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${LATERAL_ROOT}" stroke-width="1.5" opacity="0.35" stroke-linecap="round" />`;
  }).join("");
}

// The fork point sits `CLEARANCE` above `p` — same unconditional-boss-
// safety reasoning curveArc.js's own header comment gives (this whole
// composition stays on one fixed side of `p`, never alternating toward
// the boss clearing one row below). Swept across every real lesson
// count, the sprout marker (the one part of this composition that
// actually needs marker clearance) clears the real ≈38-unit mobile-
// scale marker radius (see equationScale.js's own header comment for
// the arithmetic) by a real margin — see tests/
// curveReachLessonThemes.test.js's own dedicated sweep for the number.
const CLEARANCE = 70;
const TAPROOT_HALF = 55;
const LATERAL_HALF_W = 55;
const LATERAL_DEPTH = 30;
function renderRootStop(p, i) {
  const mirror = i % 2 === 0 ? 1 : -1;
  const cx = p.x;
  const cy = p.y - CLEARANCE;
  const angle = mirror * 26;
  const rad = (angle * Math.PI) / 180;
  const tx0 = cx - TAPROOT_HALF * Math.cos(rad);
  const ty0 = cy - TAPROOT_HALF * Math.sin(rad);
  const tx1 = cx + TAPROOT_HALF * Math.cos(rad);
  const ty1 = cy + TAPROOT_HALF * Math.sin(rad);
  const x0 = cx - LATERAL_HALF_W;
  const x1 = cx + LATERAL_HALF_W;
  const baseY = cy + LATERAL_DEPTH;
  const ctrlY = 2 * cy - baseY;
  // A couple of tiny root-hair ticks off the taproot, purely decorative.
  const hairT = 0.32 * mirror;
  const hairX = cx + hairT * TAPROOT_HALF * Math.cos(rad);
  const hairY = cy + hairT * TAPROOT_HALF * Math.sin(rad);
  return `
    <ellipse cx="${cx.toFixed(1)}" cy="${(cy + 5).toFixed(1)}" rx="13" ry="5" fill="${BOSS_FILL}" opacity="0.35" />
    <path d="M${x0.toFixed(1)},${baseY.toFixed(1)} Q${cx.toFixed(1)},${ctrlY.toFixed(1)} ${x1.toFixed(1)},${baseY.toFixed(1)}" fill="none" stroke="${LATERAL_ROOT}" stroke-width="4" stroke-linecap="round" />
    <line x1="${tx0.toFixed(1)}" y1="${ty0.toFixed(1)}" x2="${tx1.toFixed(1)}" y2="${ty1.toFixed(1)}" stroke="${TAPROOT}" stroke-width="6" stroke-linecap="round" />
    <line x1="${hairX.toFixed(1)}" y1="${hairY.toFixed(1)}" x2="${(hairX + 10 * mirror).toFixed(1)}" y2="${(hairY + 12).toFixed(1)}" stroke="${TAPROOT}" stroke-width="2" stroke-linecap="round" opacity="0.6" />
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="${SPROUT}" stroke="${SPROUT_DARK}" stroke-width="1.5" />
    <path d="M${cx.toFixed(1)},${(cy - 5).toFixed(1)} Q${(cx + 7).toFixed(1)},${(cy - 16).toFixed(1)} ${cx.toFixed(1)},${(cy - 22).toFixed(1)} Q${(cx - 7).toFixed(1)},${(cy - 16).toFixed(1)} ${cx.toFixed(1)},${(cy - 5).toFixed(1)}" fill="${SPROUT}" stroke="${SPROUT_DARK}" stroke-width="1.2" />
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
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${TAPROOT}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Curve Reach, underground: a taproot and a curving lateral root forking at one exact point at every stop, a small green shoot marking the real solution there, alternating which way the fork leans, connecting every Root Finder lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#rootSystemSoil)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#rootSystemSpeck)" opacity="0.7" />
      ${renderRootHairs(totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${TAPROOT}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.6" />
      <g>${renderRoots(positions)}</g>
    </svg>
  `;
}

export const rootSystemTheme = {
  trailBand: BAND,
  mapBg: SOIL_TOP,
  hintColor: "rgba(58, 36, 20, 0.8)",
  renderScene,
};
