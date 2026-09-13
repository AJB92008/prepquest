// Function Fields' own theme for Sample Says, Scatter Banks' skill on
// drawing conclusions from sample statistics and margin of error (see
// lessonTerrain.js for the shared engine, and duneScatter.js's own
// header comment for why Scatter Banks' 7 skills each get a bespoke
// desert environment). A dry riverbed cutting through the sand: every
// stop is a prospector's pan holding a real scooped sample of gravel
// with a few gold flecks — a literal sample standing in for the much
// larger riverbed it was drawn from, the same "small real thing,
// standing in for something bigger" idea the skill itself teaches. The
// boss clearing is the motherlode, a glittering pool. Every pan sits on
// the same fixed vertical band above `p` (see canyonRail.js's own
// header comment for why that, not an alternating one, is what keeps a
// new theme's own marker/boss clearance safe from the start).
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };

const SKY_TOP = "#f0e6d4";
const SKY_BOTTOM = "#c9a06a";
const WASH_FILL = "#e4d3ae";
const GLOW = "#fff6e2";

const PAN = "#6b6258";
const PAN_DARK = "#3a352e";
const GRAVEL = "#8a7a64";
const GRAVEL_DARK = "#5a4f3e";
const GOLD = "#e8b830";
const GOLD_DARK = "#a87a1a";

const RIVER_STONE = "#9a9082";
const RIVER_STONE_HILITE = "#c2bcae";
const SHRUB = "#7a9068";
const SHRUB_DARK = "#546848";

function defs() {
  return `
    <defs>
      <linearGradient id="prospectorsPanSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="prospectorsPanGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.5" />
        <stop offset="100%" stop-color="${GLOW}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

// A winding pale dry-riverbed band down the whole scene — this zone's
// own big background landmark, standing in for canyonRail.js's cliffs
// or duneHistogram.js's dune crests.
const WASH_SPACING = 320;
const WASH_CYCLE = [
  { fx: 0.4, rx: 300, ry: 60 },
  { fx: 0.6, rx: 320, ry: 65 },
  { fx: 0.5, rx: 280, ry: 55 },
];
function renderWash(totalHeight) {
  const count = Math.max(WASH_CYCLE.length, Math.round(totalHeight / WASH_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const w = WASH_CYCLE[i % WASH_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<ellipse cx="${(w.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" rx="${w.rx}" ry="${w.ry}" fill="${WASH_FILL}" opacity="0.5" />`;
  }).join("");
}

const GLOW_SPACING = 480;
const GLOW_CYCLE = [
  { fx: 0.32, r: 170 },
  { fx: 0.7, r: 150 },
];
function renderGlows(totalHeight) {
  const count = Math.max(GLOW_CYCLE.length, Math.round(totalHeight / GLOW_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const g = GLOW_CYCLE[i % GLOW_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<circle cx="${(g.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" r="${g.r}" fill="url(#prospectorsPanGlow)" />`;
  }).join("");
}

const CLUTTER_SPACING = 150;
function renderRiverStone(x, y, scale) {
  const rx = 7 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1.2).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.6).toFixed(1)}" fill="${RIVER_STONE}" stroke="${PAN_DARK}" stroke-width="0.5" />
    <ellipse cx="${(x - rx * 0.28).toFixed(1)}" cy="${(y - rx * 0.16).toFixed(1)}" rx="${(rx * 0.4).toFixed(1)}" ry="${(rx * 0.22).toFixed(1)}" fill="${RIVER_STONE_HILITE}" opacity="0.75" />
  `;
}
function renderShrub(x, y, scale) {
  const r = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1).toFixed(1)}" rx="${(r * 0.9).toFixed(1)}" ry="2" fill="${SHRUB_DARK}" opacity="0.25" />
    <circle cx="${x.toFixed(1)}" cy="${(y - r * 0.5).toFixed(1)}" r="${r.toFixed(1)}" fill="${SHRUB}" opacity="0.85" />
    <circle cx="${(x - r * 0.6).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${(r * 0.6).toFixed(1)}" fill="${SHRUB}" opacity="0.8" />
  `;
}
function renderClutter(positions, totalHeight) {
  const count = Math.max(6, Math.round(totalHeight / CLUTTER_SPACING));
  const bossIdx = positions.length - 1;
  const items = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * totalHeight;
    const x = BAND.min + 20 + ((i * 67) % (BAND.max - BAND.min - 40));
    return { i, x, y };
  }).filter(({ x, y }) => positions.every((p, idx) => Math.hypot(x - p.x, y - p.y) >= (idx === bossIdx ? 100 : 55)));

  return items
    .map(({ i, x, y }) => {
      const scale = 0.85 + ((i * 7) % 5) * 0.08;
      return i % 2 === 0 ? renderRiverStone(x, y, scale) : renderShrub(x, y, scale);
    })
    .join("");
}

// Every pan sits on a fixed vertical band, CLEARANCE±SPAN above `p`
// (see canyonRail.js's own header comment for why that, not an
// alternating one, is what keeps a new theme's own marker/boss
// clearance safe from the start). Only the count of gold flecks found
// in the sample (a small fixed cycle) changes stop to stop.
const CLEARANCE = 66;
const SPAN = 13;
const GOLD_COUNTS = [1, 3, 2, 4, 1];
function renderPanStop(p, i) {
  const mirror = i % 2 === 0 ? 1 : -1;
  const cx = p.x + mirror * 6;
  const cy = p.y - CLEARANCE;
  const rx = 22;
  const ry = SPAN;
  const goldCount = GOLD_COUNTS[i % GOLD_COUNTS.length];

  const gravelBits = Array.from({ length: 7 }, (_, j) => {
    const fx = ((j * 0.31 + 0.15) % 1) * 2 - 1;
    const fy = ((j * 0.53 + 0.4) % 1) * 2 - 1;
    const gx = cx + fx * rx * 0.72;
    const gy = cy + fy * ry * 0.6;
    const r = 1.6 + ((i * 11 + j * 5) % 3) * 0.4;
    return `<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${r.toFixed(1)}" fill="${GRAVEL}" stroke="${GRAVEL_DARK}" stroke-width="0.4" />`;
  }).join("");

  const goldBits = Array.from({ length: goldCount }, (_, j) => {
    const fx = ((j * 0.41 + 0.62) % 1) * 2 - 1;
    const fy = ((j * 0.27 + 0.2) % 1) * 2 - 1;
    const gx = cx + fx * rx * 0.6;
    const gy = cy + fy * ry * 0.5;
    return `<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="1.4" fill="${GOLD}" stroke="${GOLD_DARK}" stroke-width="0.3" />`;
  }).join("");

  return `
    <ellipse cx="${cx.toFixed(1)}" cy="${(cy + ry + 4).toFixed(1)}" rx="${(rx + 2).toFixed(1)}" ry="3.5" fill="${PAN_DARK}" opacity="0.25" />
    <ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(rx + 3).toFixed(1)}" ry="${(ry + 3).toFixed(1)}" fill="none" stroke="${PAN}" stroke-width="3.4" />
    <ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx}" ry="${ry}" fill="${PAN_DARK}" opacity="0.85" />
    ${gravelBits}
    ${goldBits}
  `;
}

function renderPans(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderPanStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `
    <circle cx="${last.x}" cy="${last.y}" r="86" fill="#6b5a2e" stroke="${GOLD}" stroke-width="5" />
    <circle cx="${last.x}" cy="${last.y}" r="60" fill="${GOLD}" opacity="0.55" />
  `;
  const trailD = renderTrailPath(positions);

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A dry riverbed corner of Function Fields' Scatter Banks: a prospector's pan holding a real sample of gravel and gold flecks at every stop, past river stones and desert shrubs, up to ${bossName}'s own glittering motherlode">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#prospectorsPanSky)" />
      ${renderWash(totalHeight)}
      ${renderGlows(totalHeight)}
      ${renderClutter(positions, totalHeight)}
      ${bossClearing}
      <path d="${trailD}" stroke="${PAN_DARK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.35" />
      <path d="${trailD}" stroke="#b9a878" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" />
      <path d="${trailD}" stroke="#f0e6c8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 9" fill="none" opacity="0.85" />
      <g>${renderPans(positions)}</g>
    </svg>
  `;
}

export const prospectorsPanTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(58, 53, 46, 0.85)",
  renderScene,
};
