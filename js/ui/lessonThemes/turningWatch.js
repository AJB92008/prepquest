// Lexicon Shoals' own theme for Verb Form Fix, Grammar Garrison's fourth
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and rampartGates.js for this zone's own shared
// Sky Bastion palette). Verb Form Fix is about tense — when something
// happens — so the scene leans on the one thing that actually measures
// time passing: a watchtower beacon at every stop, its own glow cycling
// through four real times of day in order (dawn, midday, dusk, night),
// the same "step through a real, recognizable sequence" idea Tide Pool
// Terrace's own Time Order uses for the moon's real phases (see
// moonSequence.js) — a tower keeping watch across a whole day standing
// in for a verb changing across a whole timeline.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SKY_TOP = "#7fb0e8";
const SKY_BOTTOM = "#eef3f7";
const STONE = "#9098a6";
const STONE_DARK = "#5f6674";
const GOLD_TRIM = "#d4af5a";
const CLOUD = "#ffffff";

// Four real times of day, in real order — each with its own beacon color
// and a softer halo tone behind it, so the change reads as lighting
// shifting, not just a different-colored dot.
const TIME_STATES = [
  { name: "dawn", beacon: "#f4b98a", halo: "#f7c9a0" },
  { name: "midday", beacon: "#f0cf86", halo: "#fff6d9" },
  { name: "dusk", beacon: "#c96f45", halo: "#e0956a" },
  { name: "night", beacon: "#8fa0d9", halo: "#b9c6e8" },
];

function defs() {
  return `
    <defs>
      <linearGradient id="turningSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

function renderClouds(totalHeight) {
  const spots = [
    { fx: 0.18, fy: 0.2, r: 24 },
    { fx: 0.82, fy: 0.45, r: 28 },
    { fx: 0.22, fy: 0.7, r: 22 },
    { fx: 0.78, fy: 0.9, r: 26 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.55).toFixed(1)}" fill="${CLOUD}" opacity="0.55" />`;
    })
    .join("");
}

// A single watchtower with a beacon atop it — the tower's own stonework
// never changes stop to stop (same body, same crenellations); only the
// beacon's own state does, same "exactly one thing changing" reasoning
// moonSequence.js's own header comment gives for putting a moon directly
// on the trail rather than zigzagging position and phase at once.
function renderTower(x, baseY, state) {
  const id = `turningGlow-${Math.round(x)}-${Math.round(baseY)}`;
  const w = 30;
  const h = 62;
  const top = baseY - h;
  return `
    <defs>
      <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${state.halo}" stop-opacity="0.75" />
        <stop offset="100%" stop-color="${state.halo}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="${x.toFixed(1)}" cy="${(top - 22).toFixed(1)}" r="34" fill="url(#${id})" />
    <rect x="${(x - w / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${w}" height="${h}" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="2" />
    <rect x="${(x - w / 2).toFixed(1)}" y="${top.toFixed(1)}" width="6" height="${h}" fill="#b7bdc8" opacity="0.5" />
    <rect x="${(x - w / 2 - 3).toFixed(1)}" y="${(top - 9).toFixed(1)}" width="9" height="11" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="1.3" />
    <rect x="${(x + w / 2 - 6).toFixed(1)}" y="${(top - 9).toFixed(1)}" width="9" height="11" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="1.3" />
    <circle cx="${x.toFixed(1)}" cy="${(top - 22).toFixed(1)}" r="10" fill="${state.beacon}" stroke="${GOLD_TRIM}" stroke-width="2" />
  `;
}

// One tower every other stop, not every single one — the same pacing
// moonSequence.js's own renderMoons uses and explains at length: halving
// the count leaves real room between towers to read as its own moment,
// rather than the beacon changing on every single step. Boss stop
// excluded regardless of parity, same reasoning as that file's own
// bossIndex guard.
function renderTowers(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i % 2 === 0 && i !== bossIndex)
    .map((p, i) => renderTower(p.x, p.y + 30, TIME_STATES[i % TIME_STATES.length]))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#4a5060" stroke="${GOLD_TRIM}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Grammar Garrison: a watchtower whose own beacon steps through the four real times of day, in order — dawn, midday, dusk, night — one per stop, connecting every Verb Form Fix lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#turningSky)" />
      <g>${renderClouds(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_TRIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.9" />
      <g>${renderTowers(positions)}</g>
    </svg>
  `;
}

export const turningWatchTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(30, 35, 45, 0.75)",
  renderScene,
};
