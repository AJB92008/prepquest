// Theory Throwdown's own theme (see lessonTerrain.js for the shared
// engine every lesson-path theme renders through) — Observatory Ridge's
// own night sky, rival theory placards squared off with a bold VS
// between them — a literal "throwdown," replacing an earlier version of
// this file where two small, near-identical orbit icons sat calmly side
// by side and read as confusing rather than as opposed. Two more fixes
// on top of that first pass: one placard at every single stop, always
// the same orbit-vs-wave pairing, read as repetitive — now one every
// other stop (same "reduce the density" fix moonSequence.js's own
// comments describe for its moons), with the matchup itself drawn from
// 4 rival icon types and randomly paired per stop rather than fixed.
// Shares its starfield/night styling with predictionRidge.js
// (Prediction Station, sc-evaluate's own theme, same Observatory Ridge
// zone — see scienceHub.js's own ZONES), kept a separate self-contained
// file per this folder's own convention.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const NIGHT = "#101a30";

function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 3.7) * 43758.5453;
  return x - Math.floor(x);
}

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
// dead-center in the ring, and at this icon's small size a ring plus
// any center-ish dot reads as an eye — the classic pupil-in-an-iris
// shape is too strong a pattern match to fight with a subtle tweak.
// Dots only on the rim itself sidesteps that entirely.
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

function renderWaveIcon(x, y, color) {
  return `<path d="M${x - 15},${y} Q${x - 7},${y - 9} ${x},${y} Q${x + 7},${y + 9} ${x + 15},${y}" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" />`;
}

function renderParticleIcon(x, y, color) {
  return [0, 1, 2, 3, 4]
    .map((i) => {
      const angle = (i / 5) * Math.PI * 2;
      const r = i % 2 === 0 ? 12 : 6;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r * 0.6;
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.4" fill="${color}" />`;
    })
    .join("");
}

function renderSpiralIcon(x, y, color) {
  const pts = Array.from({ length: 14 }, (_, i) => {
    const t = i / 13;
    const angle = t * Math.PI * 2.4;
    const r = 2 + t * 13;
    return `${(x + Math.cos(angle) * r).toFixed(1)},${(y + Math.sin(angle) * r * 0.68).toFixed(1)}`;
  });
  return `<polyline points="${pts.join(" ")}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
}

// Four distinct rival theories, each with its own render + color, so a
// given pair reads as two genuinely different positions rather than a
// recolor of the same shape. Two of a pair are always different types
// (see pickPair below) — never the same icon facing itself.
const ICON_TYPES = [
  { render: renderOrbitIcon, color: "#8fa8d6" },
  { render: renderWaveIcon, color: "#e0a860" },
  { render: renderParticleIcon, color: "#7fd9c4" },
  { render: renderSpiralIcon, color: "#c98fd6" },
];

function pickPair(seed) {
  const a = Math.floor(pseudoRandom(seed) * ICON_TYPES.length);
  let b = Math.floor(pseudoRandom(seed + 41) * ICON_TYPES.length);
  if (b === a) b = (b + 1) % ICON_TYPES.length;
  return [ICON_TYPES[a], ICON_TYPES[b]];
}

// One placard, its own rival diagram inside — a squared-off card reads
// as "a position being argued" far more than a bare icon floating in
// open space did.
function renderPlacard(x, y, icon) {
  return `
    <rect x="${(x - 25).toFixed(1)}" y="${(y - 20).toFixed(1)}" width="50" height="40" rx="5" fill="#182642" stroke="${icon.color}" stroke-width="2.5" />
    ${icon.render(x, y, icon.color)}
  `;
}

function renderVsMark(x, y) {
  return `
    <circle cx="${x}" cy="${y}" r="15" fill="#0c1526" stroke="#f0e4c0" stroke-width="2" />
    <text x="${x}" y="${(y + 5).toFixed(1)}" font-size="14" font-weight="800" text-anchor="middle" font-family="sans-serif" fill="#f0e4c0">VS</text>
  `;
}

// Every other stop, not every single one — one placard pair at every
// stop plus the starfield behind them read as visually dense. The boss
// index is already excluded by `slice(0, -1)` before this filter runs.
function computeThrowdowns(positions) {
  const mid = (BAND.min + BAND.max) / 2;
  return positions
    .slice(0, -1)
    .filter((_, i) => i % 2 === 0)
    .map((p, i) => ({
      leftX: clamp(mid - 58, BAND.min + 25, mid - 34),
      rightX: clamp(mid + 58, mid + 34, BAND.max - 25),
      y: p.y,
      seed: i,
    }));
}

function renderThrowdowns(positions) {
  return computeThrowdowns(positions)
    .map(({ leftX, rightX, y, seed }) => {
      const [left, right] = pickPair(seed);
      return `
        ${renderPlacard(leftX, y, left)}
        ${renderPlacard(rightX, y, right)}
        <line x1="${leftX + 25}" y1="${y}" x2="${rightX - 25}" y2="${y}" stroke="rgba(240,228,192,0.3)" stroke-width="2" />
        ${renderVsMark((leftX + rightX) / 2, y)}
      `;
    })
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#182642" stroke="#8fa8d6" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lab Archipelago's Observatory Ridge at night: rival theory placards squared off with a bold VS between them every other stop, each pair a different matchup of theory icons, connecting every Theory Throwdown lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${NIGHT}" />
      <g>${renderStars(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="#8fa8d6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
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
