// Function Fields' own theme for Percent Play, Scatter Banks' skill on
// percentages, percent change, and percent error (see lessonTerrain.js
// for the shared engine, and duneScatter.js's own header comment for
// why Scatter Banks' 7 skills each get a bespoke desert environment).
// A sun-parched flat dotted with stone wells: every stop is a canteen
// standing beside its own well, its fill line marking a real percentage
// (a literal, readable gauge rather than an abstract bar chart) — the
// percentage cycles through a small fixed set so the fill line visibly
// moves stop to stop without ever needing to alternate how far the
// whole composition reaches from `p` (see canyonRail.js's own header
// comment on why a fixed vertical band, not an alternating one, is what
// keeps a new theme's own marker/boss clearance safe from the start).
import { COL_W, distanceToTrail, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };

const SKY_TOP = "#fdf1d9";
const SKY_BOTTOM = "#e3b06a";
const FLAT_FILL = "#eccb8f";
const GLOW = "#fff8e2";

const STONE = "#b7a488";
const STONE_DARK = "#7a6a50";
const CANTEEN_BODY = "#8a7452";
const CANTEEN_DARK = "#4f4230";
const WATER = "#3f8f9e";
const WATER_LIGHT = "#7fc4cf";
const ROPE = "#6b4a30";

const ROCK = "#a4917a";
const ROCK_HILITE = "#c7b39a";
const GRASS = "#8a9a52";

function defs() {
  return `
    <defs>
      <linearGradient id="canteenGaugeSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="canteenGaugeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.6" />
        <stop offset="100%" stop-color="${GLOW}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

// Broad, low, sun-flattened dune swells rather than tall mesas — this
// zone is a flat, open plain, not canyon or dune country.
const FLAT_SPACING = 300;
const FLAT_CYCLE = [
  { fx: 0.2, rx: 280, ry: 55 },
  { fx: 0.8, rx: 300, ry: 60 },
  { fx: 0.5, rx: 260, ry: 50 },
];
function renderFlats(totalHeight) {
  const count = Math.max(FLAT_CYCLE.length, Math.round(totalHeight / FLAT_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const f = FLAT_CYCLE[i % FLAT_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<ellipse cx="${(f.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" rx="${f.rx}" ry="${f.ry}" fill="${FLAT_FILL}" opacity="0.5" />`;
  }).join("");
}

const GLOW_SPACING = 460;
const GLOW_CYCLE = [
  { fx: 0.35, r: 180 },
  { fx: 0.65, r: 160 },
];
function renderGlows(totalHeight) {
  const count = Math.max(GLOW_CYCLE.length, Math.round(totalHeight / GLOW_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const g = GLOW_CYCLE[i % GLOW_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<circle cx="${(g.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" r="${g.r}" fill="url(#canteenGaugeGlow)" />`;
  }).join("");
}

const CLUTTER_SPACING = 150;
const PATH_CLEARANCE = 20;
function renderPebble(x, y, scale) {
  const rx = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1.2).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.58).toFixed(1)}" fill="${ROCK}" stroke="${STONE_DARK}" stroke-width="0.5" />
    <ellipse cx="${(x - rx * 0.25).toFixed(1)}" cy="${(y - rx * 0.15).toFixed(1)}" rx="${(rx * 0.4).toFixed(1)}" ry="${(rx * 0.22).toFixed(1)}" fill="${ROCK_HILITE}" opacity="0.75" />
  `;
}
function renderDryGrass(x, y, scale, rot) {
  const blades = [-11, -3, 5, 13];
  return blades
    .map((deg) => {
      const rad = ((deg + rot) * Math.PI) / 180;
      const len = 10 * scale;
      const ex = x + Math.sin(rad) * len;
      const ey = y - Math.cos(rad) * len;
      return `<path d="M${x.toFixed(1)},${y.toFixed(1)} Q${(x + Math.sin(rad) * len * 0.5).toFixed(1)},${(y - Math.cos(rad) * len * 0.6).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" stroke="${GRASS}" stroke-width="1.8" fill="none" stroke-linecap="round" />`;
    })
    .join("");
}
function renderClutter(positions, totalHeight) {
  const count = Math.max(6, Math.round(totalHeight / CLUTTER_SPACING));
  const bossIdx = positions.length - 1;
  const items = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * totalHeight;
    const x = BAND.min + 20 + ((i * 79) % (BAND.max - BAND.min - 40));
    return { i, x, y };
  }).filter(
    ({ x, y }) =>
      positions.every((p, idx) => Math.hypot(x - p.x, y - p.y) >= (idx === bossIdx ? 100 : 55)) &&
      distanceToTrail(x, y, positions) >= PATH_CLEARANCE
  );

  return items
    .map(({ i, x, y }) => {
      const scale = 0.85 + ((i * 7) % 5) * 0.08;
      return i % 2 === 0 ? renderPebble(x, y, scale) : renderDryGrass(x, y, scale, ((i * 29) % 22) - 11);
    })
    .join("");
}

// Every canteen sits on the same fixed vertical band, CLEARANCE±SPAN
// above `p` (see canteenGauge... no, see canyonRail.js's own header
// comment for why a fixed, non-alternating band is what keeps both the
// own-marker and previous-row clearance safe without hand-checking a
// swing every time). Only the fill level (a real percentage from a
// small fixed cycle) changes stop to stop.
const CLEARANCE = 66;
const SPAN = 13;
const PERCENTS = [20, 45, 65, 90, 35];
function renderCanteenStop(p, i) {
  const mirror = i % 2 === 0 ? 1 : -1;
  const cx = p.x + mirror * 10;
  const topY = p.y - (CLEARANCE + SPAN);
  const botY = p.y - (CLEARANCE - SPAN);
  const bodyW = 20;
  const bodyH = botY - topY;
  const pct = PERCENTS[i % PERCENTS.length];
  const fillH = (bodyH - 4) * (pct / 100);
  const fillY = botY - 2 - fillH;

  return `
    <ellipse cx="${cx.toFixed(1)}" cy="${(botY + 4).toFixed(1)}" rx="15" ry="4" fill="${STONE_DARK}" opacity="0.28" />
    <rect x="${(cx - 5).toFixed(1)}" y="${(topY - 5).toFixed(1)}" width="10" height="6" rx="2" fill="${CANTEEN_DARK}" />
    <rect x="${(cx - bodyW / 2).toFixed(1)}" y="${topY.toFixed(1)}" width="${bodyW}" height="${bodyH.toFixed(1)}" rx="4" fill="${CANTEEN_BODY}" stroke="${CANTEEN_DARK}" stroke-width="1.4" />
    <rect x="${(cx - bodyW / 2 + 2).toFixed(1)}" y="${fillY.toFixed(1)}" width="${(bodyW - 4).toFixed(1)}" height="${(fillH).toFixed(1)}" rx="2" fill="${WATER}" opacity="0.9" />
    <rect x="${(cx - bodyW / 2 + 2).toFixed(1)}" y="${fillY.toFixed(1)}" width="${(bodyW - 4).toFixed(1)}" height="2" fill="${WATER_LIGHT}" opacity="0.9" />
    <line x1="${(cx - bodyW / 2).toFixed(1)}" y1="${(topY + bodyH * 0.25).toFixed(1)}" x2="${(cx + bodyW / 2).toFixed(1)}" y2="${(topY + bodyH * 0.25).toFixed(1)}" stroke="${CANTEEN_DARK}" stroke-width="0.6" opacity="0.5" />
    <line x1="${(cx - bodyW / 2).toFixed(1)}" y1="${(topY + bodyH * 0.5).toFixed(1)}" x2="${(cx + bodyW / 2).toFixed(1)}" y2="${(topY + bodyH * 0.5).toFixed(1)}" stroke="${CANTEEN_DARK}" stroke-width="0.6" opacity="0.5" />
    <line x1="${(cx - bodyW / 2).toFixed(1)}" y1="${(topY + bodyH * 0.75).toFixed(1)}" x2="${(cx + bodyW / 2).toFixed(1)}" y2="${(topY + bodyH * 0.75).toFixed(1)}" stroke="${CANTEEN_DARK}" stroke-width="0.6" opacity="0.5" />
    <path d="M${(p.x - mirror * 14).toFixed(1)},${(botY + 2).toFixed(1)} Q${(p.x - mirror * 22).toFixed(1)},${(botY - 10).toFixed(1)} ${(p.x - mirror * 14).toFixed(1)},${(botY - 20).toFixed(1)}" fill="none" stroke="${ROPE}" stroke-width="2" stroke-linecap="round" opacity="0.7" />
  `;
}

function renderCanteens(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderCanteenStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `
    <circle cx="${last.x}" cy="${last.y}" r="86" fill="#2f5f6e" stroke="${STONE}" stroke-width="6" />
    <circle cx="${last.x}" cy="${last.y}" r="66" fill="${WATER}" opacity="0.9" />
  `;
  const trailD = renderTrailPath(positions);

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A sun-parched flat corner of Function Fields' Scatter Banks: a canteen at its own real percentage fill level beside a stone well at every stop, up to ${bossName}'s own deep well">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#canteenGaugeSky)" />
      ${renderFlats(totalHeight)}
      ${renderGlows(totalHeight)}
      ${renderClutter(positions, totalHeight)}
      ${bossClearing}
      <path d="${trailD}" stroke="${STONE_DARK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.4" />
      <path d="${trailD}" stroke="${STONE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" />
      <path d="${trailD}" stroke="#f3e6c8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 9" fill="none" opacity="0.85" />
      <g>${renderCanteens(positions)}</g>
    </svg>
  `;
}

export const canteenGaugeTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(79, 66, 48, 0.85)",
  renderScene,
};
