// Data Diver's own theme (see lessonTerrain.js for the shared engine
// every lesson-path theme renders through) — Data Deck's own server-
// room floor, shared with graphGazerDeck.js (Graph Gazer, sc-datarep's
// own theme, in the same zone — see scienceHub.js's own ZONES). A
// scattered handful of data points at every stop, with a magnifying
// glass zoomed in on one of them, glowing — the "dive in and find the
// value that matters" idea drawn as an actual search-and-find rather
// than a column of stacked digits (an earlier version of this file),
// which read as visually busy rather than as one clear target.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 70, max: COL_W - 70 };
const FLOOR = "#1c2430";
const AMBER = "#e8b84f";
const CYAN = "#5fd0c0";

function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 3.7) * 43758.5453;
  return x - Math.floor(x);
}

// A loose scatter of plain data points around a center, with one of
// them singled out under a magnifying glass — the point actually being
// "interpreted" made the visual focus, everything else just context.
function renderScatterFind(cx, cy, seed) {
  const count = 7;
  const points = Array.from({ length: count }, (_, i) => {
    const angle = pseudoRandom(seed * 7 + i) * Math.PI * 2;
    const r = 12 + pseudoRandom(seed * 13 + i) * 26;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r * 0.7 };
  });
  const pickIndex = Math.floor(pseudoRandom(seed) * count);
  const pick = points[pickIndex];

  const dots = points
    .map((p, i) => (i === pickIndex ? "" : `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.4" fill="${AMBER}" opacity="0.55" />`))
    .join("");

  const lensR = 20;
  const lens = `
    <circle cx="${pick.x.toFixed(1)}" cy="${pick.y.toFixed(1)}" r="${lensR}" fill="rgba(15,26,32,0.55)" stroke="${CYAN}" stroke-width="3" />
    <circle cx="${pick.x.toFixed(1)}" cy="${pick.y.toFixed(1)}" r="6.5" fill="${CYAN}" />
    <line x1="${(pick.x + lensR * 0.68).toFixed(1)}" y1="${(pick.y + lensR * 0.68).toFixed(1)}" x2="${(pick.x + lensR * 1.35).toFixed(1)}" y2="${(pick.y + lensR * 1.35).toFixed(1)}" stroke="${CYAN}" stroke-width="5" stroke-linecap="round" />
  `;
  return dots + lens;
}

function computeFinds(positions) {
  const mid = (BAND.min + BAND.max) / 2;
  return positions.slice(0, -1).map((p, i) => {
    const side = p.x < mid ? 1 : -1;
    return { x: clamp(p.x + side * 85, BAND.min + 35, BAND.max - 35), y: p.y, seed: i + 1 };
  });
}

function renderFinds(positions) {
  return computeFinds(positions)
    .map(({ x, y, seed }) => renderScatterFind(x, y, seed))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#0f1a20" stroke="${CYAN}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lab Archipelago's Data Deck: a server-room floor where a scatter of data points sits at every stop, one singled out under a magnifying glass, connecting every Data Diver lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${FLOOR}" />
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${AMBER}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderFinds(positions)}</g>
    </svg>
  `;
}

export const dataDiveDeckTheme = {
  trailBand: BAND,
  mapBg: FLOOR,
  hintColor: "rgba(95, 208, 192, 0.85)",
  renderScene,
};
