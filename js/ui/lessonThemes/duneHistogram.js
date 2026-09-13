// Function Fields' own theme for Spread Sense, Scatter Banks' skill on
// a single data set's center, spread, and shape (see lessonTerrain.js
// for the shared engine, and duneScatter.js's own header comment for
// why Scatter Banks' 7 skills each get a bespoke desert environment). A
// rippled dune field where every stop's own dune ridge is shaped like a
// real small histogram — five bars of varying sand height, a real
// vertical marker through whichever bar is the actual center — cycling
// through a small fixed set of distributions (symmetric, skewed
// left/right, spread out, tight) so the "shape" changes stop to stop
// without ever changing how far the composition reaches from `p` (see
// canyonRail.js's own header comment on why a fixed vertical band keeps
// a new theme's own marker/boss clearance safe from the start).
import { COL_W, distanceToTrail, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };

const SKY_TOP = "#fbead6";
const SKY_BOTTOM = "#dfa15c";
const DUNE_FILL = "#e8bd80";
const GLOW = "#fff4dc";

const BAR = "#c9924f";
const BAR_DARK = "#8a5f2e";
const BAR_LIGHT = "#e8c48a";
const CENTER_LINE = "#5a3a1e";

const ROCK = "#a4917a";
const ROCK_HILITE = "#c7b39a";
const SHRUB = "#7a9068";
const SHRUB_DARK = "#546848";

function defs() {
  return `
    <defs>
      <linearGradient id="duneHistogramSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="duneHistogramGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.55" />
        <stop offset="100%" stop-color="${GLOW}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

// Rounded dune-crest silhouettes (a shallow triangle with softened
// corners) rather than mesa ellipses — this zone's own ripple-field
// look, distinct from canyonRail.js's cliffs and canteenGauge.js's flats.
const DUNE_SPACING = 300;
const DUNE_CYCLE = [
  { fx: 0.2, w: 320, h: 90 },
  { fx: 0.8, w: 360, h: 100 },
  { fx: 0.5, w: 300, h: 80 },
];
function renderDunes(totalHeight) {
  const count = Math.max(DUNE_CYCLE.length, Math.round(totalHeight / DUNE_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const d = DUNE_CYCLE[i % DUNE_CYCLE.length];
    const cx = d.fx * COL_W;
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<path d="M${(cx - d.w / 2).toFixed(1)},${(cy + d.h / 2).toFixed(1)} Q${cx.toFixed(1)},${(cy - d.h / 2).toFixed(1)} ${(cx + d.w / 2).toFixed(1)},${(cy + d.h / 2).toFixed(1)} Z" fill="${DUNE_FILL}" opacity="0.45" />`;
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
    return `<circle cx="${(g.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" r="${g.r}" fill="url(#duneHistogramGlow)" />`;
  }).join("");
}

const CLUTTER_SPACING = 150;
const PATH_CLEARANCE = 20;
function renderPebble(x, y, scale) {
  const rx = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1.2).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.58).toFixed(1)}" fill="${ROCK}" stroke="${BAR_DARK}" stroke-width="0.5" />
    <ellipse cx="${(x - rx * 0.25).toFixed(1)}" cy="${(y - rx * 0.15).toFixed(1)}" rx="${(rx * 0.4).toFixed(1)}" ry="${(rx * 0.22).toFixed(1)}" fill="${ROCK_HILITE}" opacity="0.75" />
  `;
}
function renderShrub(x, y, scale) {
  const r = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1).toFixed(1)}" rx="${(r * 0.9).toFixed(1)}" ry="2" fill="${SHRUB_DARK}" opacity="0.25" />
    <circle cx="${x.toFixed(1)}" cy="${(y - r * 0.5).toFixed(1)}" r="${r.toFixed(1)}" fill="${SHRUB}" opacity="0.85" />
    <circle cx="${(x - r * 0.6).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${(r * 0.6).toFixed(1)}" fill="${SHRUB}" opacity="0.8" />
    <circle cx="${(x + r * 0.6).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.55).toFixed(1)}" fill="${SHRUB}" opacity="0.8" />
  `;
}
function renderClutter(positions, totalHeight) {
  const count = Math.max(6, Math.round(totalHeight / CLUTTER_SPACING));
  const bossIdx = positions.length - 1;
  const items = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * totalHeight;
    const x = BAND.min + 20 + ((i * 73) % (BAND.max - BAND.min - 40));
    return { i, x, y };
  }).filter(
    ({ x, y }) =>
      positions.every((p, idx) => Math.hypot(x - p.x, y - p.y) >= (idx === bossIdx ? 100 : 55)) &&
      distanceToTrail(x, y, positions) >= PATH_CLEARANCE
  );

  return items
    .map(({ i, x, y }) => {
      const scale = 0.85 + ((i * 7) % 5) * 0.08;
      return i % 2 === 0 ? renderPebble(x, y, scale) : renderShrub(x, y, scale);
    })
    .join("");
}

// Every histogram sits on a fixed vertical band, CLEARANCE±SPAN above
// `p` (bar tops reach up to CLEARANCE+SPAN, bar baseline sits at
// CLEARANCE-SPAN — see canyonRail.js's own header comment for why a
// fixed band, not an alternating one, is what keeps a new theme's own
// marker/boss clearance safe from the start). Only each bar's own
// height (5 bars, real heights from a small fixed distribution) and
// which bar is the real center changes stop to stop.
const CLEARANCE = 66;
const SPAN = 15;
const BASE_Y_OFFSET = CLEARANCE - SPAN;
const TOP_Y_OFFSET = CLEARANCE + SPAN;
const MAX_BAR_H = TOP_Y_OFFSET - BASE_Y_OFFSET;
const DISTRIBUTIONS = [
  { heights: [0.3, 0.6, 1.0, 0.6, 0.3], center: 2 },
  { heights: [0.9, 0.7, 0.5, 0.3, 0.15], center: 0 },
  { heights: [0.15, 0.3, 0.5, 0.7, 0.9], center: 4 },
  { heights: [0.5, 0.9, 0.95, 0.85, 0.4], center: 2 },
  { heights: [0.85, 0.35, 0.9, 0.3, 0.8], center: 2 },
];
function renderHistogramStop(p, i) {
  const dist = DISTRIBUTIONS[i % DISTRIBUTIONS.length];
  const n = dist.heights.length;
  const barW = 12;
  const gap = 4;
  const totalW = n * barW + (n - 1) * gap;
  const x0 = p.x - totalW / 2;
  const baseY = p.y - BASE_Y_OFFSET;

  const bars = dist.heights
    .map((h, j) => {
      const bx = x0 + j * (barW + gap);
      const barH = 6 + h * MAX_BAR_H;
      const by = baseY - barH;
      const isCenter = j === dist.center;
      return `
        <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW}" height="${barH.toFixed(1)}" rx="1.5" fill="${isCenter ? BAR_LIGHT : BAR}" stroke="${BAR_DARK}" stroke-width="0.9" />
        <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW}" height="2" fill="${BAR_LIGHT}" opacity="0.7" />
      `;
    })
    .join("");

  const centerX = x0 + dist.center * (barW + gap) + barW / 2;
  return `
    <ellipse cx="${p.x.toFixed(1)}" cy="${(baseY + 3).toFixed(1)}" rx="${(totalW / 2 + 4).toFixed(1)}" ry="3" fill="${BAR_DARK}" opacity="0.22" />
    ${bars}
    <line x1="${centerX.toFixed(1)}" y1="${(baseY + 5).toFixed(1)}" x2="${centerX.toFixed(1)}" y2="${(baseY - MAX_BAR_H - 8).toFixed(1)}" stroke="${CENTER_LINE}" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.75" />
  `;
}

function renderHistograms(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderHistogramStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#6b4a24" stroke="${BAR_LIGHT}" stroke-width="5" />`;
  const trailD = renderTrailPath(positions);

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A rippled dune corner of Function Fields' Scatter Banks: a small sand-bar histogram with its own real center marked at every stop, cycling through symmetric and skewed shapes, past pebbles and desert shrubs, up to ${bossName}'s own dune crest">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#duneHistogramSky)" />
      ${renderDunes(totalHeight)}
      ${renderGlows(totalHeight)}
      ${renderClutter(positions, totalHeight)}
      ${bossClearing}
      <path d="${trailD}" stroke="${BAR_DARK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.4" />
      <path d="${trailD}" stroke="#c9a86a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" />
      <path d="${trailD}" stroke="#f3ddab" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 9" fill="none" opacity="0.85" />
      <g>${renderHistograms(positions)}</g>
    </svg>
  `;
}

export const duneHistogramTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(90, 58, 30, 0.85)",
  renderScene,
};
