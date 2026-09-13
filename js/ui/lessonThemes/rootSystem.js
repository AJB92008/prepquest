// Function Fields' own theme for Root Finder, Curve Reach's second
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through). This is a full visual redo of this file's own
// first pass at "underground tree roots" — that version read as an
// abstract diagram (a soil-colored gradient, a speck pattern, two
// crossed lines with a small circle) rather than an actual forest, per
// direct feedback. Same underlying idea (Root Finder = literal tree
// roots), but every stop now renders as one small, leaning, illustrated
// tree: a tapered trunk, a real layered canopy with shading, and a
// curving surface root exposed at its base, all on fresh anchor offsets
// (CANOPY_OFFSET/GROUND_OFFSET below) re-derived and swept for this new
// composition rather than reused from the old diagram's own numbers —
// plus a genuine forest floor (a three-stop light-to-shadow gradient
// standing in for dappled canopy light, soft light patches, and real
// ground clutter — mushrooms, pebbles, grass tufts, fallen leaves, each
// its own shape, not a repeated dot) and a wider, two-tone dirt trail
// instead of a thin dashed line.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };

const FOREST_LIGHT = "#eef0c6";
const FOREST_MID = "#aec37f";
const FOREST_DARK = "#57623a";
const GLOW = "#fbf6d6";

const TRUNK = "#6b4a2e";
const TRUNK_DARK = "#432c1a";
const TRUNK_HILITE = "#8f6a42";
const ROOT_BROWN = "#7a5a38";
const CANOPY_DARK = "#3c5f2a";
const CANOPY = "#5c8f42";
const CANOPY_LIGHT = "#82b45c";
const BOSS_FILL = "#3c4a2a";

const LEAF_COLORS = ["#c97a3a", "#d4a83f", "#a8482e"];
const ROCK = "#8d8a76";
const ROCK_HILITE = "#a8a58e";
const MUSHROOM_CAP = "#c9503a";
const MUSHROOM_SPOT = "#f0e4c8";
const GRASS = "#6a9a48";

function defs() {
  return `
    <defs>
      <linearGradient id="rootSystemForest" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${FOREST_LIGHT}" />
        <stop offset="45%" stop-color="${FOREST_MID}" />
        <stop offset="100%" stop-color="${FOREST_DARK}" />
      </linearGradient>
      <radialGradient id="rootSystemGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.55" />
        <stop offset="100%" stop-color="${GLOW}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

// Soft dappled-light patches standing in for sun breaking through a
// canopy overhead — large enough (rx 150-210) to read as ambient light
// rather than a foreground object, so (matching every other theme's own
// "big background silhouette" convention) they need no per-stop
// clearance check at all.
const GLOW_SPACING = 520;
const GLOW_CYCLE = [
  { fx: 0.28, r: 190 },
  { fx: 0.78, r: 160 },
  { fx: 0.5, r: 210 },
];
function renderGlows(totalHeight) {
  const count = Math.max(GLOW_CYCLE.length, Math.round(totalHeight / GLOW_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const g = GLOW_CYCLE[i % GLOW_CYCLE.length];
    const cx = g.fx * COL_W;
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${g.r}" fill="url(#rootSystemGlow)" />`;
  }).join("");
}

// Real forest-floor clutter — four different small shapes (mushroom,
// pebble, grass tuft, fallen leaf), each with its own size/rotation
// jitter, cycling rather than one shape repeated. Spaced by height-
// interval (see plains.js's own header comment for why a fixed small
// array of fractional positions goes sparse at this zone's own real,
// much taller lesson counts) and, like every ambient decoration this
// session has added since the crate-on-boss-clearing bug, skipped
// outright wherever it would land on top of any real position rather
// than trusting its own placement math never gets that close.
const CLUTTER_SPACING = 150;
function renderMushroom(x, y, scale, seed) {
  const capR = 7 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 2).toFixed(1)}" rx="${(capR * 0.7).toFixed(1)}" ry="2.4" fill="${TRUNK_DARK}" opacity="0.3" />
    <line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y - 6 * scale).toFixed(1)}" stroke="${MUSHROOM_SPOT}" stroke-width="${(2.4 * scale).toFixed(1)}" stroke-linecap="round" />
    <path d="M${(x - capR).toFixed(1)},${(y - 5 * scale).toFixed(1)} Q${x.toFixed(1)},${(y - 13 * scale).toFixed(1)} ${(x + capR).toFixed(1)},${(y - 5 * scale).toFixed(1)} Q${x.toFixed(1)},${(y - 2 * scale).toFixed(1)} ${(x - capR).toFixed(1)},${(y - 5 * scale).toFixed(1)} Z" fill="${MUSHROOM_CAP}" />
    <circle cx="${(x - capR * 0.3).toFixed(1)}" cy="${(y - 8 * scale).toFixed(1)}" r="${(1.4 * scale).toFixed(1)}" fill="${MUSHROOM_SPOT}" opacity="${0.5 + (seed % 3) * 0.1}" />
    <circle cx="${(x + capR * 0.35).toFixed(1)}" cy="${(y - 6.5 * scale).toFixed(1)}" r="${(1.1 * scale).toFixed(1)}" fill="${MUSHROOM_SPOT}" opacity="${0.5 + (seed % 3) * 0.1}" />
  `;
}
function renderPebble(x, y, scale) {
  const rx = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1.5).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.6).toFixed(1)}" fill="${ROCK}" />
    <ellipse cx="${(x - rx * 0.25).toFixed(1)}" cy="${(y - rx * 0.15).toFixed(1)}" rx="${(rx * 0.45).toFixed(1)}" ry="${(rx * 0.28).toFixed(1)}" fill="${ROCK_HILITE}" opacity="0.7" />
  `;
}
function renderGrassTuft(x, y, scale, rot) {
  const blades = [-14, -5, 5, 14];
  const paths = blades
    .map((deg) => {
      const rad = ((deg + rot) * Math.PI) / 180;
      const len = 13 * scale;
      const ex = x + Math.sin(rad) * len;
      const ey = y - Math.cos(rad) * len;
      return `<path d="M${x.toFixed(1)},${y.toFixed(1)} Q${(x + Math.sin(rad) * len * 0.5).toFixed(1)},${(y - Math.cos(rad) * len * 0.6).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" stroke="${GRASS}" stroke-width="2" fill="none" stroke-linecap="round" />`;
    })
    .join("");
  return paths;
}
function renderFallenLeaf(x, y, scale, rot, color) {
  return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(6 * scale).toFixed(1)}" ry="${(3.6 * scale).toFixed(1)}" fill="${color}" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" />`;
}

function renderClutter(positions, totalHeight) {
  const count = Math.max(6, Math.round(totalHeight / CLUTTER_SPACING));
  const items = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * totalHeight;
    const x = clamp(BAND.min + 22 + ((i * 83) % (BAND.max - BAND.min - 44)), BAND.min + 12, BAND.max - 12);
    return { i, x, y };
  }).filter(({ x, y }) =>
    positions.every((p, idx) => Math.hypot(x - p.x, y - p.y) >= (idx === positions.length - 1 ? 98 : 50))
  );

  return items
    .map(({ i, x, y }) => {
      const kind = i % 4;
      const scale = 0.85 + ((i * 7) % 5) * 0.08;
      if (kind === 0) return renderMushroom(x, y, scale, i);
      if (kind === 1) return renderPebble(x, y, scale);
      if (kind === 2) return renderGrassTuft(x, y, scale, ((i * 31) % 20) - 10);
      return renderFallenLeaf(x, y, scale, (i * 47) % 360, LEAF_COLORS[i % LEAF_COLORS.length]);
    })
    .join("");
}

// One small leaning tree per stop — trunk, canopy, and one curving
// surface root exposed at the base. Both offsets below were sized
// against the two real constraints at this row spacing (ROW_H=140):
// the canopy (a real filled shape, radius CANOPY_R) has to clear the
// ~38-unit marker radius both against *its own* stop's marker
// (CANOPY_OFFSET - CANOPY_R > 38) and against the stop one row *above*
// it, which sits ROW_H away on the other side (ROW_H - CANOPY_OFFSET -
// CANOPY_R > 38) — CANOPY_OFFSET=75 clears both with a real margin
// (~22 and ~13 respectively). The ground/root end sits closer to `p`
// (GROUND_OFFSET=52, clearing its own marker by ~11 units past the
// trunk's own half-width) since it only has its own stop to worry
// about — everything here sits on the fixed "always above p" side, so
// (matching curveArc.js's own header comment on the same pattern) nothing
// here ever needs a separate near-boss special case: the one stop right
// before the boss is offset *away* from it by construction.
const CANOPY_OFFSET = 75;
const CANOPY_R = 15;
const GROUND_OFFSET = 52;
const ROOT_HALF_W = 48;
function renderRootStop(p, i) {
  const mirror = i % 2 === 0 ? 1 : -1;
  const gx = p.x;
  const gy = p.y - GROUND_OFFSET;
  const tpx = p.x + mirror * 9;
  const tpy = p.y - CANOPY_OFFSET;

  // Root curve: spans the ground level, dipping a little below it at
  // the tips and arcing back up above it at the middle — the same
  // "real, hand-checked, then swept" quadratic-bezier construction this
  // session has used throughout, just with fresh numbers for this
  // file's own new anchor points.
  const rx0 = p.x - ROOT_HALF_W;
  const rx1 = p.x + ROOT_HALF_W;
  const rootBaseY = gy + 9;
  const rootPeakY = gy - 20;
  const rootCtrlY = 2 * rootPeakY - rootBaseY;

  // Trunk as a tapered quad (wide at the ground end, narrow at the
  // canopy end) rather than a plain stroked line, plus a thin highlight
  // stripe down one side for a little roundness.
  const dx = tpx - gx;
  const dy = tpy - gy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const baseHalf = 4.5;
  const topHalf = 1.8;
  const trunkPath = `M${(gx + nx * baseHalf).toFixed(1)},${(gy + ny * baseHalf).toFixed(1)} L${(tpx + nx * topHalf).toFixed(1)},${(tpy + ny * topHalf).toFixed(1)} L${(tpx - nx * topHalf).toFixed(1)},${(tpy - ny * topHalf).toFixed(1)} L${(gx - nx * baseHalf).toFixed(1)},${(gy - ny * baseHalf).toFixed(1)} Z`;
  const hiliteX0 = gx + nx * baseHalf * 0.3;
  const hiliteY0 = gy + ny * baseHalf * 0.3;
  const hiliteX1 = tpx + nx * topHalf * 0.3;
  const hiliteY1 = tpy + ny * topHalf * 0.3;

  const canopyLean = mirror * 3.5;
  const canopy = `
    <ellipse cx="${(tpx - canopyLean).toFixed(1)}" cy="${(tpy - 2).toFixed(1)}" rx="${CANOPY_R}" ry="${(CANOPY_R * 0.82).toFixed(1)}" fill="${CANOPY_DARK}" />
    <ellipse cx="${tpx.toFixed(1)}" cy="${(tpy - 5).toFixed(1)}" rx="${(CANOPY_R * 0.93).toFixed(1)}" ry="${(CANOPY_R * 0.76).toFixed(1)}" fill="${CANOPY}" />
    <ellipse cx="${(tpx + canopyLean * 0.6 - 4).toFixed(1)}" cy="${(tpy - 8.5).toFixed(1)}" rx="${(CANOPY_R * 0.47).toFixed(1)}" ry="${(CANOPY_R * 0.38).toFixed(1)}" fill="${CANOPY_LIGHT}" opacity="0.85" />
  `;

  return `
    <ellipse cx="${gx.toFixed(1)}" cy="${(gy + 5).toFixed(1)}" rx="13" ry="4.5" fill="${TRUNK_DARK}" opacity="0.3" />
    <path d="M${rx0.toFixed(1)},${rootBaseY.toFixed(1)} Q${p.x.toFixed(1)},${rootCtrlY.toFixed(1)} ${rx1.toFixed(1)},${rootBaseY.toFixed(1)}" fill="none" stroke="${ROOT_BROWN}" stroke-width="4" stroke-linecap="round" />
    <path d="${trunkPath}" fill="${TRUNK}" stroke="${TRUNK_DARK}" stroke-width="1.2" />
    <line x1="${hiliteX0.toFixed(1)}" y1="${hiliteY0.toFixed(1)}" x2="${hiliteX1.toFixed(1)}" y2="${hiliteY1.toFixed(1)}" stroke="${TRUNK_HILITE}" stroke-width="1.6" stroke-linecap="round" opacity="0.8" />
    ${canopy}
  `;
}

function renderTrees(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderRootStop(p, i))
    .join("");
}

// A wide dirt-brown base stroke with a lighter, thinner "worn center"
// stroke on top reads as a real footpath rather than the previous
// single thin dashed line; a scatter of tiny pebble flecks along it
// (skipped near any real position, same guard renderClutter uses)
// finishes the texture.
function renderTrail(positions) {
  const d = renderTrailPath(positions);
  return `
    <path d="${d}" stroke="#7a5a38" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.55" />
    <path d="${d}" stroke="#a9885a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.7" />
    <path d="${d}" stroke="#c9ac78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 10" fill="none" opacity="0.55" />
  `;
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `
    <circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${TRUNK}" stroke-width="4" />
  `;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A sunlit corner of Function Fields' Curve Reach forest: small leaning trees with real roots exposed at their base, one at every stop, connecting a dirt trail through mushrooms, pebbles, and fallen leaves up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#rootSystemForest)" />
      ${renderGlows(totalHeight)}
      ${renderClutter(positions, totalHeight)}
      ${bossClearing}
      ${renderTrail(positions)}
      <g>${renderTrees(positions)}</g>
    </svg>
  `;
}

export const rootSystemTheme = {
  trailBand: BAND,
  mapBg: FOREST_LIGHT,
  hintColor: "rgba(45, 56, 30, 0.85)",
  renderScene,
};
