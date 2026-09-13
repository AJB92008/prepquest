// Function Fields' own theme for Odds Maker, Scatter Banks' skill on
// probability and conditional probability (see lessonTerrain.js for the
// shared engine, and duneScatter.js's own header comment for why
// Scatter Banks' 7 skills each get a bespoke desert environment). An
// old frontier gambling table set up in the dust: every stop is a
// three-legged stand holding two dice, their own pip counts cycling
// through a small fixed set of real rolls — a literal, countable
// outcome rather than an abstract probability diagram. The boss
// clearing is a canvas gambling tent. Every stand sits on the same
// fixed vertical band above `p` (see canyonRail.js's own header comment
// for why that, not an alternating one, is what keeps a new theme's own
// marker/boss clearance safe from the start).
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };

const SKY_TOP = "#f3e2c4";
const SKY_BOTTOM = "#c68a52";
const FLAT_FILL = "#d9a865";
const GLOW = "#fff2d4";

const WOOD = "#7a5636";
const WOOD_DARK = "#4a331e";
const TABLE_TOP = "#8a6a42";
const DIE_FACE = "#f0e6d0";
const DIE_DARK = "#8a3226";
const PIP = "#3a2a1c";

const ROCK = "#a4917a";
const ROCK_HILITE = "#c7b39a";
const CARD = "#c9584a";
const CARD_DARK = "#7a3226";
const TENT = "#c9a86a";
const TENT_DARK = "#8a6a42";

function defs() {
  return `
    <defs>
      <linearGradient id="desertGambitSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="desertGambitGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.55" />
        <stop offset="100%" stop-color="${GLOW}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

const FLAT_SPACING = 300;
const FLAT_CYCLE = [
  { fx: 0.18, rx: 270, ry: 55 },
  { fx: 0.82, rx: 290, ry: 60 },
  { fx: 0.5, rx: 250, ry: 50 },
];
function renderFlats(totalHeight) {
  const count = Math.max(FLAT_CYCLE.length, Math.round(totalHeight / FLAT_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const f = FLAT_CYCLE[i % FLAT_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<ellipse cx="${(f.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" rx="${f.rx}" ry="${f.ry}" fill="${FLAT_FILL}" opacity="0.5" />`;
  }).join("");
}

const GLOW_SPACING = 480;
const GLOW_CYCLE = [
  { fx: 0.3, r: 170 },
  { fx: 0.72, r: 150 },
];
function renderGlows(totalHeight) {
  const count = Math.max(GLOW_CYCLE.length, Math.round(totalHeight / GLOW_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const g = GLOW_CYCLE[i % GLOW_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<circle cx="${(g.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" r="${g.r}" fill="url(#desertGambitGlow)" />`;
  }).join("");
}

const CLUTTER_SPACING = 150;
function renderPebble(x, y, scale) {
  const rx = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1.2).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.58).toFixed(1)}" fill="${ROCK}" stroke="${WOOD_DARK}" stroke-width="0.5" />
    <ellipse cx="${(x - rx * 0.25).toFixed(1)}" cy="${(y - rx * 0.15).toFixed(1)}" rx="${(rx * 0.4).toFixed(1)}" ry="${(rx * 0.22).toFixed(1)}" fill="${ROCK_HILITE}" opacity="0.75" />
  `;
}
function renderCardScrap(x, y, scale, rot) {
  const w = 9 * scale;
  const h = 13 * scale;
  return `<rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1.4" fill="${CARD}" stroke="${CARD_DARK}" stroke-width="0.8" opacity="0.85" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})" />`;
}
function renderClutter(positions, totalHeight) {
  const count = Math.max(6, Math.round(totalHeight / CLUTTER_SPACING));
  const bossIdx = positions.length - 1;
  const items = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * totalHeight;
    const x = BAND.min + 20 + ((i * 71) % (BAND.max - BAND.min - 40));
    return { i, x, y };
  }).filter(({ x, y }) => positions.every((p, idx) => Math.hypot(x - p.x, y - p.y) >= (idx === bossIdx ? 100 : 55)));

  return items
    .map(({ i, x, y }) => {
      const scale = 0.85 + ((i * 7) % 5) * 0.08;
      return i % 2 === 0 ? renderPebble(x, y, scale) : renderCardScrap(x, y, scale, ((i * 37) % 40) - 20);
    })
    .join("");
}

const PIP_LAYOUTS = {
  1: [[0.5, 0.5]],
  2: [[0.28, 0.28], [0.72, 0.72]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
  6: [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]],
};
function renderDie(x, y, size, pips) {
  const layout = PIP_LAYOUTS[pips];
  const dots = layout
    .map(([fx, fy]) => `<circle cx="${(x - size / 2 + fx * size).toFixed(1)}" cy="${(y - size / 2 + fy * size).toFixed(1)}" r="${(size * 0.09).toFixed(1)}" fill="${PIP}" />`)
    .join("");
  return `
    <rect x="${(x - size / 2).toFixed(1)}" y="${(y - size / 2).toFixed(1)}" width="${size}" height="${size}" rx="2.4" fill="${DIE_FACE}" stroke="${DIE_DARK}" stroke-width="1" />
    ${dots}
  `;
}

// Rolls cycle through a small fixed set of real, distinct pip counts
// rather than a random pair every stop — deterministic, no Math.random,
// same convention every other Scatter Banks file uses.
const ROLLS = [
  [3, 4],
  [1, 6],
  [5, 2],
  [6, 6],
  [2, 3],
];
const CLEARANCE = 66;
const SPAN = 13;
function renderStandStop(p, i) {
  const mirror = i % 2 === 0 ? 1 : -1;
  const cx = p.x + mirror * 6;
  const topY = p.y - (CLEARANCE + SPAN);
  const tableY = p.y - (CLEARANCE - SPAN);
  const [a, b] = ROLLS[i % ROLLS.length];
  const dieSize = 13;

  return `
    <ellipse cx="${cx.toFixed(1)}" cy="${(tableY + 6).toFixed(1)}" rx="20" ry="5" fill="${WOOD_DARK}" opacity="0.28" />
    <line x1="${(cx - 14).toFixed(1)}" y1="${(tableY + 4).toFixed(1)}" x2="${(cx - 14).toFixed(1)}" y2="${tableY.toFixed(1)}" stroke="${WOOD}" stroke-width="2.4" />
    <line x1="${(cx + 14).toFixed(1)}" y1="${(tableY + 4).toFixed(1)}" x2="${(cx + 14).toFixed(1)}" y2="${tableY.toFixed(1)}" stroke="${WOOD}" stroke-width="2.4" />
    <line x1="${cx.toFixed(1)}" y1="${(tableY + 4).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${tableY.toFixed(1)}" stroke="${WOOD}" stroke-width="2.4" />
    <ellipse cx="${cx.toFixed(1)}" cy="${tableY.toFixed(1)}" rx="19" ry="6" fill="${TABLE_TOP}" stroke="${WOOD_DARK}" stroke-width="1.2" />
    ${renderDie(cx - 10, topY + 8, dieSize, a)}
    ${renderDie(cx + 9, topY + 5, dieSize, b)}
  `;
}

function renderStands(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderStandStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `
    <circle cx="${last.x}" cy="${last.y}" r="86" fill="${TENT_DARK}" stroke="${WOOD_DARK}" stroke-width="5" />
    <path d="M${(last.x - 60).toFixed(1)},${(last.y + 30).toFixed(1)} L${last.x.toFixed(1)},${(last.y - 55).toFixed(1)} L${(last.x + 60).toFixed(1)},${(last.y + 30).toFixed(1)} Z" fill="${TENT}" stroke="${WOOD_DARK}" stroke-width="2" opacity="0.9" />
  `;
  const trailD = renderTrailPath(positions);

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A frontier gambling flat in Function Fields' Scatter Banks: a three-legged stand holding two dice at a real fixed roll at every stop, past playing cards and pebbles, up to ${bossName}'s own canvas gambling tent">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#desertGambitSky)" />
      ${renderFlats(totalHeight)}
      ${renderGlows(totalHeight)}
      ${renderClutter(positions, totalHeight)}
      ${bossClearing}
      <path d="${trailD}" stroke="${WOOD_DARK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.4" />
      <path d="${trailD}" stroke="#b9895a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" />
      <path d="${trailD}" stroke="#f0dcae" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 9" fill="none" opacity="0.85" />
      <g>${renderStands(positions)}</g>
    </svg>
  `;
}

export const desertGambitTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(74, 51, 30, 0.85)",
  renderScene,
};
