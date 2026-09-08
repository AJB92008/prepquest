// Lexicon Shoals' own theme for Core Idea Finder, Archive Stacks' first
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through). Core Idea Finder asks "what's the central
// idea," so the scene leans into exactly one dominant idea the same way
// Athenaeum Reef's own Big Picture does (see reefCrown.js) — here, one
// oversized glowing codex floating open mid-scene, radiating enough
// light that the trail visibly winds *around* it rather than through
// it, with only a few small, deliberately dim scrolls kept well clear of
// its own glow so nothing competes with it for attention. The Celestial
// Archive family's own vocabulary (a violet night sky, warm gold
// starlight, soft cloud wisps everything in the scene rests on) carries
// through all five of Archive Stacks' skills — see the other four files
// in this directory for the same palette used toward very different
// compositions.
import { COL_W, clamp, blobPoints, closedBlobPath, renderTrailPath, nearestPosition } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SKY_TOP = "#2b2657";
const SKY_BOTTOM = "#141233";
const GOLD = "#f0cf86";
const GOLD_DIM = "#c9a668";
const PARCHMENT = "#f3ecd6";
const CLOUD = "#e9e6f5";

// Same nearest-position-aware placement as reefCrown's own crownCenter —
// the codex sits near the trail's own vertical midpoint, offset to
// whichever side the trail isn't using right there.
function codexCenter(positions, totalHeight) {
  const cy = totalHeight * 0.42;
  const nearest = nearestPosition(positions, cy);
  const mid = (BAND.min + BAND.max) / 2;
  const side = nearest.x < mid ? 1 : -1;
  const cx = clamp(mid + side * (BAND.max - BAND.min) * 0.3, BAND.min + 100, BAND.max - 40);
  return { x: cx, y: cy };
}

function defs() {
  return `
    <defs>
      <linearGradient id="codexSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="55%" stop-color="#1d1a45" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="codexGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.5" />
        <stop offset="100%" stop-color="${GOLD}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

// A light, sparse star scatter — deterministic (no Math.random, same
// reasoning every other theme's ambient scatter uses).
function renderStars(totalHeight) {
  const count = Math.max(16, Math.round((totalHeight / COL_W) * 18));
  return Array.from({ length: count }, (_, i) => {
    const y = (i * 191) % totalHeight;
    const x = (i * 137) % COL_W;
    const r = 1 + (i % 2) * 0.5;
    const opacity = (0.25 + ((i * 13) % 40) / 100).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${PARCHMENT}" opacity="${opacity}" />`;
  }).join("");
}

// A few soft, translucent cloud wisps at fixed positions — the shared
// "this whole scene is floating" cue every Celestial Archive theme
// carries, same "ambient depth, not another marker to track" spirit as
// reefCrown's own light rays/kelp.
function renderClouds(totalHeight) {
  const spots = [
    { fx: 0.12, fy: 0.18, r: 46 },
    { fx: 0.82, fy: 0.3, r: 36 },
    { fx: 0.22, fy: 0.72, r: 40 },
    { fx: 0.7, fy: 0.86, r: 50 },
  ];
  return spots
    .map((s, i) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      const pts = blobPoints(cx, cy, s.r, 12, i * 2.1 + 1);
      return `<path d="${closedBlobPath(pts)}" fill="${CLOUD}" opacity="0.08" />`;
    })
    .join("");
}

// The codex itself: a soft cloud pedestal underneath (every focal object
// in this family rests on one, selling "floating," not "sitting"), a
// warm glow behind it, two curved page-fans meeting at a spine (an open
// book, abstracted the same way reefCrown's crown is an abstracted coral
// tower rather than a literal photo-real one), a few short text-line
// strokes on each page, and a gold rim on both pages so the silhouette
// reads clearly against the sky.
function renderCodex(center) {
  const { x: cx, y: cy } = center;
  const pedestal = `<ellipse cx="${cx}" cy="${cy + 60}" rx="150" ry="26" fill="${CLOUD}" opacity="0.16" />`;
  const glow = `<circle cx="${cx}" cy="${cy}" r="190" fill="url(#codexGlow)" />`;
  const W = 168;
  const H = 106;
  const leftPage = `M${cx},${cy - H / 2} Q${cx - W},${cy - H * 0.62} ${cx - W},${cy} Q${cx - W},${cy + H * 0.62} ${cx},${cy + H / 2} Z`;
  const rightPage = `M${cx},${cy - H / 2} Q${cx + W},${cy - H * 0.62} ${cx + W},${cy} Q${cx + W},${cy + H * 0.62} ${cx},${cy + H / 2} Z`;
  const pages = `
    <path d="${leftPage}" fill="${PARCHMENT}" stroke="${GOLD_DIM}" stroke-width="3" stroke-linejoin="round" />
    <path d="${rightPage}" fill="${PARCHMENT}" stroke="${GOLD_DIM}" stroke-width="3" stroke-linejoin="round" />
  `;
  const spine = `<line x1="${cx}" y1="${cy - H / 2}" x2="${cx}" y2="${cy + H / 2}" stroke="${GOLD_DIM}" stroke-width="3" />`;
  // A handful of short "text line" strokes on each page, shorter toward
  // the outer edge (the way a page's own text runs shorter as it nears
  // the curved fore-edge) rather than uniform-width bars.
  const lines = [0.72, 0.86, 1.0, 1.1].map((f, i) => {
    const ly = cy - 34 + i * 22;
    const len = 46 * f;
    return `
      <line x1="${(cx - 18).toFixed(1)}" y1="${ly}" x2="${(cx - 18 - len).toFixed(1)}" y2="${ly}" stroke="#8a7440" stroke-width="2.4" stroke-linecap="round" opacity="0.5" />
      <line x1="${(cx + 18).toFixed(1)}" y1="${ly}" x2="${(cx + 18 + len).toFixed(1)}" y2="${ly}" stroke="#8a7440" stroke-width="2.4" stroke-linecap="round" opacity="0.5" />
    `;
  }).join("");
  return pedestal + glow + pages + spine + lines;
}

// A few small, deliberately dim satellite scrolls, kept outside the
// codex's own glow footprint so nothing competes with it — same
// reasoning reefCrown's own satellite corals use.
function renderSatellites(positions, codex) {
  return positions
    .filter((_, i) => i % 2 === 0)
    .map((p, i) => {
      const dist = Math.hypot(p.x - codex.x, p.y - codex.y);
      if (dist < 210) return "";
      const x = p.x + (i % 2 === 0 ? 36 : -36);
      const y = p.y + 6;
      const w = 22;
      const h = 14;
      return `<rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="3" fill="${PARCHMENT}" opacity="0.35" transform="rotate(${((i * 13) % 20) - 10} ${x.toFixed(1)} ${y.toFixed(1)})" />`;
    })
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const codex = codexCenter(positions, totalHeight);
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#241f45" stroke="${GOLD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Archive Stacks under a violet night sky: one large glowing open codex floating mid-scene with a handful of small dim scrolls kept clear of its light, and a trail connecting every Core Idea Finder lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#codexSky)" />
      <g>${renderStars(totalHeight)}</g>
      <g>${renderClouds(totalHeight)}</g>
      <g>${renderSatellites(positions, codex)}</g>
      <g>${renderCodex(codex)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_DIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.9" />
    </svg>
  `;
}

export const celestialCodexTheme = {
  trailBand: BAND,
  mapBg: SKY_BOTTOM,
  hintColor: "rgba(243, 236, 214, 0.9)",
  renderScene,
};
