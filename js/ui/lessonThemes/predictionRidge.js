// Prediction Station's own theme (see lessonTerrain.js for the shared
// engine every lesson-path theme renders through) — Observatory Ridge's
// own night sky, shared with theoryOrbit.js (Theory Throwdown,
// sc-conflicting's own theme, same zone — see scienceHub.js's own
// ZONES), themed around a telescope at every stop aimed along a dashed
// predicted trajectory toward a target star — evaluating a model's own
// predicted outcome, drawn as the actual act of aiming and predicting
// rather than an abstract checkmark.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const NIGHT = "#101a30";
const BLUE = "#8fa8d6";
const GOLD = "#f0d97a";

function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 3.7) * 43758.5453;
  return x - Math.floor(x);
}

function renderStars(totalHeight) {
  const count = Math.max(20, Math.round((totalHeight / COL_W) * 22));
  return Array.from({ length: count }, (_, i) => {
    const y = (i * 173 + 40) % totalHeight;
    const x = (i * 151) % COL_W;
    const r = 1 + (i % 2) * 0.5;
    const opacity = (0.3 + ((i * 17) % 40) / 100).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#f0e4c0" opacity="${opacity}" />`;
  }).join("");
}

// Returns the telescope's own markup plus its tube-tip coordinates, so
// the caller can aim a matching predicted trajectory from that exact
// point rather than guessing at it separately.
function renderTelescopeSmall(x, y, tilt) {
  const rad = (tilt * Math.PI) / 180;
  const tubeLen = 34;
  const tipX = x + Math.cos(rad) * tubeLen;
  const tipY = y - 14 - Math.sin(rad) * tubeLen;
  const body = `
    <ellipse cx="${x}" cy="${y + 12}" rx="12" ry="4" fill="rgba(10,15,30,0.3)" />
    <line x1="${x - 10}" y1="${y + 10}" x2="${x}" y2="${y - 6}" stroke="#4a4a5a" stroke-width="2.2" />
    <line x1="${x + 10}" y1="${y + 10}" x2="${x}" y2="${y - 6}" stroke="#4a4a5a" stroke-width="2.2" />
    <line x1="${x}" y1="${y - 14}" x2="${tipX.toFixed(1)}" y2="${tipY.toFixed(1)}" stroke="#8a8fae" stroke-width="6" stroke-linecap="round" />
    <circle cx="${x}" cy="${y - 14}" r="5" fill="#6a6f8e" />
  `;
  return { body, tipX, tipY };
}

// A dashed predicted trajectory from the telescope's own tip out to a
// target star, plus the star itself — the "predict, then check the
// outcome" idea, aim and target both drawn.
function renderTrajectory(tipX, tipY, targetX, targetY) {
  return `
    <path d="M${tipX.toFixed(1)},${tipY.toFixed(1)} L${targetX.toFixed(1)},${targetY.toFixed(1)}" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="3 5" opacity="0.7" fill="none" />
    <circle cx="${targetX.toFixed(1)}" cy="${targetY.toFixed(1)}" r="4" fill="${GOLD}" />
    <circle cx="${targetX.toFixed(1)}" cy="${targetY.toFixed(1)}" r="8" fill="none" stroke="${GOLD}" stroke-width="1.2" opacity="0.5" />
  `;
}

// Side, offset distance, and tilt are all independently randomized
// (rather than side/offset both being a fixed function of which half of
// the trail band the point fell in) so consecutive telescopes don't all
// mirror each other into the same two poses — an earlier version of
// this file looked too regular precisely because those three things all
// moved together.
function computeStations(positions) {
  return positions.slice(0, -1).map((p, i) => {
    const side = pseudoRandom(i * 3 + 1) > 0.5 ? 1 : -1;
    const offset = 45 + pseudoRandom(i * 5 + 2) * 65;
    const x = clamp(p.x + side * offset, BAND.min + 25, BAND.max - 25);
    const tilt = 12 + pseudoRandom(i * 7 + 3) * 75;
    return { x, y: p.y, tilt, side, seed: i };
  });
}

function renderStations(positions) {
  return computeStations(positions)
    .map(({ x, y, tilt, side, seed }) => {
      const { body, tipX, tipY } = renderTelescopeSmall(x, y, tilt);
      const targetDist = 22 + pseudoRandom(seed * 11 + 5) * 48;
      const targetX = clamp(tipX + side * targetDist, 20, COL_W - 20);
      const targetY = tipY - 12 - pseudoRandom(seed * 17 + 9) * 40;
      return body + renderTrajectory(tipX, tipY, targetX, targetY);
    })
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#182642" stroke="${GOLD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lab Archipelago's Observatory Ridge at night: a telescope at every stop aimed along a dashed predicted path toward a target star, connecting every Prediction Station lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${NIGHT}" />
      <g>${renderStars(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${BLUE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderStations(positions)}</g>
    </svg>
  `;
}

export const predictionRidgeTheme = {
  trailBand: BAND,
  mapBg: NIGHT,
  hintColor: "rgba(143, 168, 214, 0.9)",
  renderScene,
};
