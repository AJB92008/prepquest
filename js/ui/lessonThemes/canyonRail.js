// Function Fields' own theme for Rate Tracker, Scatter Banks' skill on
// ratios, rates, proportions, and unit conversions (see lessonTerrain.js
// for the shared engine every lesson-path theme renders through, and
// duneScatter.js's own header comment for why Scatter Banks' 7 skills
// each get a bespoke desert-family environment rather than one shared
// backdrop). A mining rail line through a rust-red canyon: the rail
// track itself is the walkable path (rails are already a path), and
// every stop parks a small ore cart carrying two colors of ore in a
// real fixed ratio — a literal, countable ratio rather than an abstract
// diagram. The boss clearing is the canyon's own mine entrance.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };

const SKY_TOP = "#f6ddc6";
const SKY_BOTTOM = "#c9764f";
const CANYON_FILL = "#a8523a";
const GLOW = "#ffe9c9";

const RAIL = "#5a5248";
const RAIL_DARK = "#332e28";
const TIE = "#6b4a30";
const CART_BODY = "#7a5638";
const CART_DARK = "#4a3320";
const ORE_A = "#c9622f";
const ORE_A_DARK = "#8a3e1c";
const ORE_B = "#8fa4a8";
const ORE_B_DARK = "#556468";

const ROCK = "#8d7460";
const ROCK_HILITE = "#b09880";
const SAGE = "#7a9068";
const SAGE_DARK = "#546848";

function defs() {
  return `
    <defs>
      <linearGradient id="canyonRailSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="canyonRailGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.5" />
        <stop offset="100%" stop-color="${GLOW}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

// Tall canyon-wall silhouettes alternating left/right, standing in for
// curveArc.js's own rolling hills — the same "big background shape,
// needs no per-stop clearance check" convention (rx/ry both large).
const WALL_SPACING = 300;
const WALL_CYCLE = [
  { fx: -0.05, rx: 210, ry: 260 },
  { fx: 1.05, rx: 220, ry: 280 },
  { fx: -0.02, rx: 200, ry: 250 },
  { fx: 1.02, rx: 215, ry: 270 },
];
function renderWalls(totalHeight) {
  const count = Math.max(WALL_CYCLE.length, Math.round(totalHeight / WALL_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const w = WALL_CYCLE[i % WALL_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<ellipse cx="${(w.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" rx="${w.rx}" ry="${w.ry}" fill="${CANYON_FILL}" opacity="0.4" />`;
  }).join("");
}

const GLOW_SPACING = 500;
const GLOW_CYCLE = [
  { fx: 0.3, r: 160 },
  { fx: 0.7, r: 180 },
];
function renderGlows(totalHeight) {
  const count = Math.max(GLOW_CYCLE.length, Math.round(totalHeight / GLOW_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const g = GLOW_CYCLE[i % GLOW_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<circle cx="${(g.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" r="${g.r}" fill="url(#canyonRailGlow)" />`;
  }).join("");
}

// Ground clutter cycling a loose rock pile and a sagebrush shrub,
// skipped near any real stop or the boss clearing (same guard every
// Scatter Banks file uses).
const CLUTTER_SPACING = 150;
function renderRockPile(x, y, scale) {
  const r = 6 * scale;
  return `
    <ellipse cx="${(x - r * 0.6).toFixed(1)}" cy="${(y + 1).toFixed(1)}" rx="${(r * 0.7).toFixed(1)}" ry="${(r * 0.45).toFixed(1)}" fill="${ROCK}" stroke="${RAIL_DARK}" stroke-width="0.5" />
    <ellipse cx="${(x + r * 0.5).toFixed(1)}" cy="${(y + 1.5).toFixed(1)}" rx="${(r * 0.6).toFixed(1)}" ry="${(r * 0.4).toFixed(1)}" fill="${ROCK}" stroke="${RAIL_DARK}" stroke-width="0.5" />
    <ellipse cx="${x.toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" rx="${(r * 0.55).toFixed(1)}" ry="${(r * 0.4).toFixed(1)}" fill="${ROCK_HILITE}" stroke="${RAIL_DARK}" stroke-width="0.5" />
  `;
}
function renderSage(x, y, scale, rot) {
  const blades = [-20, -7, 7, 20];
  return blades
    .map((deg) => {
      const rad = ((deg + rot) * Math.PI) / 180;
      const len = 10 * scale;
      const ex = x + Math.sin(rad) * len;
      const ey = y - Math.cos(rad) * len;
      return `<path d="M${x.toFixed(1)},${y.toFixed(1)} Q${(x + Math.sin(rad) * len * 0.5).toFixed(1)},${(y - Math.cos(rad) * len * 0.6).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" stroke="${SAGE}" stroke-width="2" fill="none" stroke-linecap="round" />`;
    })
    .join("") + `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${SAGE_DARK}" />`;
}
function renderClutter(positions, totalHeight) {
  const count = Math.max(6, Math.round(totalHeight / CLUTTER_SPACING));
  const bossIdx = positions.length - 1;
  const items = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * totalHeight;
    const x = BAND.min + 20 + ((i * 89) % (BAND.max - BAND.min - 40));
    return { i, x, y };
  }).filter(({ x, y }) => positions.every((p, idx) => Math.hypot(x - p.x, y - p.y) >= (idx === bossIdx ? 100 : 55)));

  return items
    .map(({ i, x, y }) => {
      const scale = 0.85 + ((i * 7) % 5) * 0.08;
      return i % 2 === 0 ? renderRockPile(x, y, scale) : renderSage(x, y, scale, ((i * 23) % 24) - 12);
    })
    .join("");
}

// Every cart sits on a fixed vertical band CLEARANCE±SPAN above `p`
// (never alternating how far it reaches, only which side and which
// ratio it shows) — this keeps both real constraints satisfied with
// margin to spare: the near edge (CLEARANCE-SPAN) clears this stop's
// own ~38-unit marker radius, and the far edge (CLEARANCE+SPAN) stays
// far enough from the *previous* stop's own marker one ROW_H(140)
// above (see duneScatter.js's own header comment for the real
// cross-row mistake this exact shape of bug caused there — checked
// directly rather than assumed here).
const CLEARANCE = 68;
const SPAN = 14;
const RATIOS = [
  [2, 1],
  [1, 2],
  [3, 2],
  [1, 3],
];
function renderCartStop(p, i) {
  const mirror = i % 2 === 0 ? 1 : -1;
  const cx = p.x + mirror * 8;
  const topY = p.y - (CLEARANCE + SPAN);
  const botY = p.y - (CLEARANCE - SPAN);
  const railTieY = p.y - 26;

  const [a, b] = RATIOS[i % RATIOS.length];
  const total = a + b;
  const cartW = 30;
  const cartH = botY - topY;
  const oreRows = [];
  let filled = 0;
  for (let r = 0; r < total; r++) {
    const rowY = botY - 3 - (r + 0.5) * (cartH / total);
    const isA = r < a;
    oreRows.push(
      `<ellipse cx="${cx.toFixed(1)}" cy="${rowY.toFixed(1)}" rx="${(cartW * 0.36).toFixed(1)}" ry="${(cartH / total / 2.3).toFixed(1)}" fill="${isA ? ORE_A : ORE_B}" stroke="${isA ? ORE_A_DARK : ORE_B_DARK}" stroke-width="0.8" />`
    );
    filled++;
  }

  return `
    <ellipse cx="${cx.toFixed(1)}" cy="${(botY + 5).toFixed(1)}" rx="14" ry="3" fill="${RAIL_DARK}" opacity="0.3" />
    <rect x="${(cx - cartW / 2).toFixed(1)}" y="${topY.toFixed(1)}" width="${cartW}" height="${cartH.toFixed(1)}" rx="2" fill="${CART_BODY}" stroke="${CART_DARK}" stroke-width="1.4" />
    <g>${oreRows.join("")}</g>
    <circle cx="${(cx - cartW / 2 + 3).toFixed(1)}" cy="${(botY + 4).toFixed(1)}" r="4" fill="${CART_DARK}" stroke="${RAIL_DARK}" stroke-width="0.8" />
    <circle cx="${(cx + cartW / 2 - 3).toFixed(1)}" cy="${(botY + 4).toFixed(1)}" r="4" fill="${CART_DARK}" stroke="${RAIL_DARK}" stroke-width="0.8" />
    <line x1="${(p.x - 44).toFixed(1)}" y1="${railTieY.toFixed(1)}" x2="${(p.x + 44).toFixed(1)}" y2="${railTieY.toFixed(1)}" stroke="${TIE}" stroke-width="5" opacity="0.5" />
  `;
}

function renderCarts(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderCartStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `
    <ellipse cx="${last.x}" cy="${last.y}" rx="90" ry="86" fill="${RAIL_DARK}" stroke="${TIE}" stroke-width="6" />
    <ellipse cx="${last.x}" cy="${(last.y - 10).toFixed(1)}" rx="58" ry="50" fill="#1c1712" />
  `;
  const trailD = renderTrailPath(positions);

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A rust-red canyon corner of Function Fields' Scatter Banks: a mining rail line past rock piles and sagebrush, an ore cart in its own fixed ratio of two colors at every stop, up to ${bossName}'s own mine entrance">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#canyonRailSky)" />
      ${renderWalls(totalHeight)}
      ${renderGlows(totalHeight)}
      ${renderClutter(positions, totalHeight)}
      ${bossClearing}
      <path d="${trailD}" stroke="${RAIL_DARK}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.4" />
      <path d="${trailD}" stroke="${TIE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 7" fill="none" opacity="0.9" />
      <path d="${trailD}" stroke="${RAIL}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" transform="translate(-4 0)" />
      <path d="${trailD}" stroke="${RAIL}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" transform="translate(4 0)" />
      <g>${renderCarts(positions)}</g>
    </svg>
  `;
}

export const canyonRailTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(51, 46, 40, 0.85)",
  renderScene,
};
