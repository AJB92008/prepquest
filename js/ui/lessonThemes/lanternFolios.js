// Lexicon Shoals' own theme for Evidence Hunter, Archive Stacks' second
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and celestialCodex.js for this zone's own
// shared palette). Evidence Hunter is about locating the one specific
// piece of text that actually supports an answer, so the scene scatters
// a field of ordinary, dim, closed scrolls throughout — the noise of a
// whole archive — and singles out exactly one open, glowing scroll lit
// by its own hovering lantern at every stop, the same "one real piece of
// evidence alongside every other stop" idea Athenaeum Reef's own Claim
// Check uses (see driftwoodLocker.js), just re-lit for a floating
// archive instead of a driftwood dock.
import { COL_W, clamp, blobPoints, closedBlobPath, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SKY_TOP = "#2b2657";
const SKY_BOTTOM = "#141233";
const GOLD = "#f0cf86";
const GOLD_DIM = "#c9a668";
const PARCHMENT = "#f3ecd6";
const CLOUD = "#e9e6f5";
const DIM_SCROLL = "#4a4478";

function defs() {
  return `
    <defs>
      <linearGradient id="lanternSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="55%" stop-color="#1d1a45" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.65" />
        <stop offset="100%" stop-color="${GOLD}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

function renderStars(totalHeight) {
  const count = Math.max(16, Math.round((totalHeight / COL_W) * 18));
  return Array.from({ length: count }, (_, i) => {
    const y = (i * 173) % totalHeight;
    const x = (i * 151) % COL_W;
    const r = 1 + (i % 2) * 0.5;
    const opacity = (0.25 + ((i * 11) % 40) / 100).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${PARCHMENT}" opacity="${opacity}" />`;
  }).join("");
}

function renderClouds(totalHeight) {
  const spots = [
    { fx: 0.15, fy: 0.22, r: 42 },
    { fx: 0.85, fy: 0.4, r: 34 },
    { fx: 0.3, fy: 0.8, r: 46 },
  ];
  return spots
    .map((s, i) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      const pts = blobPoints(cx, cy, s.r, 12, i * 3.3 + 2);
      return `<path d="${closedBlobPath(pts)}" fill="${CLOUD}" opacity="0.08" />`;
    })
    .join("");
}

// A dim, closed scroll — a small rolled cylinder (rounded rect) with two
// end-caps — deliberately muted and small so it reads as "just more
// archive," never competing with the one lit scroll at each stop.
function renderDimScroll(x, y, seed) {
  const w = 26 + (seed % 4) * 3;
  const h = 11;
  const rot = ((seed * 17) % 30) - 15;
  return `<g transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})">
    <rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="${h / 2}" fill="${DIM_SCROLL}" opacity="0.4" />
  </g>`;
}

// Scattered across the whole floor, jittered off a coarse grid with
// every third spot skipped — same "scattered, not wallpaper" technique
// coralMosaic.js's own renderMosaic uses, just far sparser here since
// this layer is meant to read as quiet background noise, not the scene's
// own focal detail.
function renderScrollField(totalHeight) {
  const cols = 5;
  const rows = Math.max(8, Math.round(totalHeight / 70));
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = r * 11 + c * 5;
      if (seed % 3 !== 0) continue;
      const jitterX = ((seed * 29) % 44) - 22;
      const jitterY = ((seed * 17) % 30) - 15;
      const x = clamp((COL_W / cols) * (c + 0.5) + jitterX, 24, COL_W - 24);
      const y = clamp((totalHeight / rows) * (r + 0.5) + jitterY, 24, totalHeight - 24);
      out.push(renderDimScroll(x, y, seed));
    }
  }
  return out.join("");
}

// A small hovering lantern — a warm glow disc, a darker frame ring, and
// a thin hanging loop — beside the one glowing, unrolled scroll at this
// stop. Alternates sides of the trail by index parity, boss stop
// excluded (its own clearing is the scene's real destination, not
// another piece of evidence).
function renderLanternScroll(p, i) {
  const side = i % 2 === 0 ? 1 : -1;
  const lx = p.x + side * 54;
  const ly = p.y - 10;
  const sx = p.x + side * 54;
  const sy = p.y + 20;
  const glow = `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="30" fill="url(#lanternGlow)" />`;
  const lantern = `
    <line x1="${lx.toFixed(1)}" y1="${(ly - 14).toFixed(1)}" x2="${lx.toFixed(1)}" y2="${(ly - 8).toFixed(1)}" stroke="${GOLD_DIM}" stroke-width="2" />
    <rect x="${(lx - 7).toFixed(1)}" y="${(ly - 8).toFixed(1)}" width="14" height="16" rx="3" fill="${GOLD}" stroke="${GOLD_DIM}" stroke-width="1.6" />
  `;
  // An unrolled, open scroll — wider and flatter than the dim rolled
  // ones scattered elsewhere, with a couple of glowing "marked" lines
  // (the actual evidence, called out in a brighter tone than the
  // surrounding parchment) instead of the dim scrolls' plain fill.
  const scrollW = 44;
  const scrollH = 20;
  const scroll = `
    <rect x="${(sx - scrollW / 2).toFixed(1)}" y="${(sy - scrollH / 2).toFixed(1)}" width="${scrollW}" height="${scrollH}" rx="4" fill="${PARCHMENT}" stroke="${GOLD}" stroke-width="2" />
    <line x1="${(sx - 14).toFixed(1)}" y1="${(sy - 4).toFixed(1)}" x2="${(sx + 14).toFixed(1)}" y2="${(sy - 4).toFixed(1)}" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round" />
    <line x1="${(sx - 14).toFixed(1)}" y1="${(sy + 4).toFixed(1)}" x2="${(sx + 6).toFixed(1)}" y2="${(sy + 4).toFixed(1)}" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round" />
  `;
  return glow + lantern + scroll;
}

function renderEvidence(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderLanternScroll(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#241f45" stroke="${GOLD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Archive Stacks under a violet night sky: a field of ordinary dim scrolls with one lantern-lit, open, marked scroll picked out at every stop, connecting every Evidence Hunter lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#lanternSky)" />
      <g>${renderStars(totalHeight)}</g>
      <g>${renderClouds(totalHeight)}</g>
      <g>${renderScrollField(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_DIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.9" />
      <g>${renderEvidence(positions)}</g>
    </svg>
  `;
}

export const lanternFoliosTheme = {
  trailBand: BAND,
  mapBg: SKY_BOTTOM,
  hintColor: "rgba(243, 236, 214, 0.9)",
  renderScene,
};
