// Theory Throwdown's own theme (see lessonTerrain.js for the shared
// engine every lesson-path theme renders through) — Observatory Ridge's
// own night sky, two rival theory placards squared off with a bold VS
// between them at every stop — a literal "throwdown," replacing an
// earlier version of this file where two small, near-identical orbit
// icons sat calmly side by side and read as confusing rather than as
// opposed. Shares its starfield/night styling with predictionRidge.js
// (Prediction Station, sc-evaluate's own theme, same Observatory Ridge
// zone — see scienceHub.js's own ZONES), kept a separate self-contained
// file per this folder's own convention.
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

// A small orbit-model icon — a ring with a few dots riding along its
// own rim, no dot at the center at all. A first pass at this put a dot
// dead-center in the ring (or even just off to one side), and at this
// icon's small size a ring plus any center-ish dot reads as an eye —
// the classic pupil-in-an-iris shape is too strong a pattern match to
// fight with a subtle tweak. Dots only on the rim itself sidesteps that
// entirely.
function renderOrbitIcon(x, y, color) {
  const dots = [10, 150, 260]
    .map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const dx = x + Math.cos(rad) * 14;
      const dy = y + Math.sin(rad) * 6;
      return `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="2.6" fill="${color}" />`;
    })
    .join("");
  return `<ellipse cx="${x}" cy="${y}" rx="14" ry="6" fill="none" stroke="${color}" stroke-width="2" />${dots}`;
}

// A wave-model icon — a visibly different kind of theory, not just a
// recolor of the orbit one, so the two placards read as genuinely
// opposed rather than the same shape twice.
function renderWaveIcon(x, y, color) {
  return `<path d="M${x - 15},${y} Q${x - 7},${y - 9} ${x},${y} Q${x + 7},${y + 9} ${x + 15},${y}" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" />`;
}

// One placard, its own rival diagram inside — a squared-off card reads
// as "a position being argued" far more than a bare icon floating in
// open space did.
function renderPlacard(x, y, color, iconFn) {
  return `
    <rect x="${(x - 25).toFixed(1)}" y="${(y - 20).toFixed(1)}" width="50" height="40" rx="5" fill="#182642" stroke="${color}" stroke-width="2.5" />
    ${iconFn(x, y, color)}
  `;
}

function renderVsMark(x, y) {
  return `
    <circle cx="${x}" cy="${y}" r="15" fill="#0c1526" stroke="#f0e4c0" stroke-width="2" />
    <text x="${x}" y="${(y + 5).toFixed(1)}" font-size="14" font-weight="800" text-anchor="middle" font-family="sans-serif" fill="#f0e4c0">VS</text>
  `;
}

function computeThrowdowns(positions) {
  const mid = (BAND.min + BAND.max) / 2;
  return positions.slice(0, -1).map((p) => ({
    leftX: clamp(mid - 58, BAND.min + 25, mid - 34),
    rightX: clamp(mid + 58, mid + 34, BAND.max - 25),
    y: p.y,
  }));
}

function renderThrowdowns(positions) {
  return computeThrowdowns(positions)
    .map(
      ({ leftX, rightX, y }) => `
      ${renderPlacard(leftX, y, BLUE, renderOrbitIcon)}
      ${renderPlacard(rightX, y, RIVAL, renderWaveIcon)}
      <line x1="${leftX + 25}" y1="${y}" x2="${rightX - 25}" y2="${y}" stroke="rgba(240,228,192,0.3)" stroke-width="2" />
      ${renderVsMark((leftX + rightX) / 2, y)}
    `
    )
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#182642" stroke="${BLUE}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lab Archipelago's Observatory Ridge at night: two rival theory placards squared off with a bold VS between them at every stop, connecting every Theory Throwdown lesson up to ${bossName}'s own clearing">
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
