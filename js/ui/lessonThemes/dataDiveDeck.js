// Data Diver's own theme (see lessonTerrain.js for the shared engine
// every lesson-path theme renders through) — Data Deck's own server-
// room floor, shared with graphGazerDeck.js (Graph Gazer, sc-datarep's
// own theme, in the same zone — see scienceHub.js's own ZONES), but
// themed around pulling a single value out of a stream of data rather
// than reading a chart: a column of falling data figures at every stop,
// with one real number circled and highlighted — the actual "dive in,
// pull the value out" skill, not a chart to glance at.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 70, max: COL_W - 70 };
const FLOOR = "#1c2430";
const AMBER = "#e8b84f";
const CYAN = "#5fd0c0";

function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 3.7) * 43758.5453;
  return x - Math.floor(x);
}

// A vertical stream of small data figures, one of them circled — the
// "dive down, pull the highlighted one out" idea drawn literally.
function renderDataStream(x, y, seed) {
  const rows = 5;
  const pickIndex = Math.floor(pseudoRandom(seed) * rows);
  const figures = Array.from({ length: rows }, (_, i) => {
    const fy = y - 44 + i * 22;
    const value = Math.round(pseudoRandom(seed * 3 + i) * 98) + 1;
    const picked = i === pickIndex;
    return `
      <text x="${x}" y="${fy}" font-size="13" text-anchor="middle" font-family="monospace" fill="${picked ? "#0f1a20" : "rgba(232,184,79,0.55)"}">${value}</text>
      ${picked ? `<circle cx="${x}" cy="${fy - 4}" r="14" fill="none" stroke="${CYAN}" stroke-width="2.5" />` : ""}
    `;
  }).join("");
  return `
    <rect x="${x - 22}" y="${y - 58}" width="44" height="112" rx="6" fill="#0f1a20" stroke="#0a1218" stroke-width="2" />
    ${figures}
  `;
}

function computeStreams(positions) {
  const mid = (BAND.min + BAND.max) / 2;
  return positions.slice(0, -1).map((p, i) => {
    const side = p.x < mid ? 1 : -1;
    return { x: clamp(p.x + side * 90, BAND.min + 25, BAND.max - 25), y: p.y, seed: i + 1 };
  });
}

function renderStreams(positions) {
  return computeStreams(positions)
    .map(({ x, y, seed }) => renderDataStream(x, y, seed))
    .join("");
}

// A diver's own descending line, planted once down the trail's own
// center rather than at every stop — the surface (the trail) connected
// down to the depths this whole theme is about.
function renderDiveLine(x, totalHeight) {
  return `<path d="M${x},0 L${x},${totalHeight}" stroke="${CYAN}" stroke-width="2" stroke-dasharray="1 6" fill="none" opacity="0.35" />`;
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#0f1a20" stroke="${CYAN}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lab Archipelago's Data Deck: a server-room floor where a column of data figures streams down at every stop, one value circled and pulled out, connecting every Data Diver lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${FLOOR}" />
      ${renderDiveLine(last.x, totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${AMBER}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderStreams(positions)}</g>
    </svg>
  `;
}

export const dataDiveDeckTheme = {
  trailBand: BAND,
  mapBg: FLOOR,
  hintColor: "rgba(95, 208, 192, 0.85)",
  renderScene,
};
