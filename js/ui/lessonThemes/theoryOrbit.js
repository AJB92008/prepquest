// Theory Throwdown's own theme (see lessonTerrain.js for the shared
// engine every lesson-path theme renders through) — Observatory Ridge's
// own night sky, two competing orbit diagrams squared off on opposite
// sides of the trail at every stop — literally two rival models of the
// same system, the actual "conflicting viewpoints" this skill is about,
// not an abstract stand-in. Shares its starfield/night styling with
// predictionRidge.js (Prediction Station, sc-evaluate's own theme, same
// Observatory Ridge zone — see scienceHub.js's own ZONES), kept a
// separate self-contained file per this folder's own convention.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const NIGHT = "#101a30";
const BLUE = "#8fa8d6";
const RIVAL = "#e0a860";

function renderStars(totalHeight) {
  const count = Math.max(20, Math.round((totalHeight / COL_W) * 22));
  return Array.from({ length: count }, (_, i) => {
    const y = (i * 191) % totalHeight;
    const x = (i * 137) % COL_W;
    const r = 1 + (i % 2) * 0.5;
    const opacity = (0.3 + ((i * 13) % 40) / 100).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#f0e4c0" opacity="${opacity}" />`;
  }).join("");
}

// One small orbit diagram — a ring, a central body, and one orbiting
// point — tinted per rival theory (blue vs. amber) so two on opposite
// sides of the trail read as genuinely opposed, not just duplicated.
function renderOrbitDiagram(x, y, color, rot) {
  return `
    <ellipse cx="${x}" cy="${y}" rx="22" ry="9" fill="none" stroke="${color}" stroke-width="2" opacity="0.85" transform="rotate(${rot} ${x} ${y})" />
    <circle cx="${x}" cy="${y}" r="6" fill="${color}" />
    <circle cx="${(x + 22).toFixed(1)}" cy="${y}" r="3" fill="#f0e4c0" transform="rotate(${rot} ${x} ${y})" />
  `;
}

function computeThrowdowns(positions) {
  const mid = (BAND.min + BAND.max) / 2;
  return positions.slice(0, -1).map((p, i) => ({
    leftX: clamp(mid - 70, BAND.min + 20, mid - 20),
    rightX: clamp(mid + 70, mid + 20, BAND.max - 20),
    y: p.y,
    rot: (i * 23) % 40,
  }));
}

function renderThrowdowns(positions) {
  return computeThrowdowns(positions)
    .map(
      ({ leftX, rightX, y, rot }) => `
      ${renderOrbitDiagram(leftX, y, BLUE, rot)}
      ${renderOrbitDiagram(rightX, y, RIVAL, -rot)}
      <path d="M${leftX + 22},${y} L${rightX - 22},${y}" stroke="rgba(240,228,192,0.35)" stroke-width="1.5" stroke-dasharray="2 5" />
    `
    )
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#182642" stroke="${BLUE}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lab Archipelago's Observatory Ridge at night: two rival orbit diagrams squared off on either side of the trail at every stop, connecting every Theory Throwdown lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${NIGHT}" />
      <g>${renderStars(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${BLUE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderThrowdowns(positions)}</g>
    </svg>
  `;
}

export const theoryOrbitTheme = {
  trailBand: BAND,
  mapBg: NIGHT,
  hintColor: "rgba(143, 168, 214, 0.9)",
  renderScene,
};
