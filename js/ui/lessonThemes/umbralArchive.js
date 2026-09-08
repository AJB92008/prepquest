// Lexicon Shoals' own theme for Read Between the Lines, Archive Stacks'
// fourth skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through, and celestialCodex.js for this
// zone's own shared palette). The skill is named for exactly what the
// scene draws literally: at every stop, a small floating page fragment
// carries two solid, definite ink lines with a gap between them — and
// sitting right in that gap, a faint gold line only visible by its own
// soft glow, the inferred idea the passage never actually states. The
// family's usual warm-on-violet palette leans darker and quieter here
// than its Archive Stacks siblings (dimmer stars, no bright cloud wisps,
// a few large, barely-there shadow-stack silhouettes drifting in the
// distance instead) — this is the one skill in the zone about reading
// what ISN'T directly lit, so the whole scene stays a little dimmer than
// its neighbors on purpose.
import { COL_W, blobPoints, closedBlobPath, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SKY_TOP = "#211d47";
const SKY_BOTTOM = "#0f0e28";
const GOLD = "#f0cf86";
const GOLD_DIM = "#c9a668";
const PARCHMENT = "#f3ecd6";
const INK = "#3a3060";
const SHADOW = "#191636";

function defs() {
  return `
    <defs>
      <linearGradient id="umbralSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="60%" stop-color="#171540" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="umbralGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.6" />
        <stop offset="100%" stop-color="${GOLD}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

// Dimmer and sparser than a typical Archive Stacks star field — this
// skill's own scene stays quieter on purpose, see the header comment.
function renderStars(totalHeight) {
  const count = Math.max(10, Math.round((totalHeight / COL_W) * 11));
  return Array.from({ length: count }, (_, i) => {
    const y = (i * 181) % totalHeight;
    const x = (i * 157) % COL_W;
    const opacity = (0.12 + ((i * 9) % 25) / 100).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="1.2" fill="${PARCHMENT}" opacity="${opacity}" />`;
  }).join("");
}

// A few large, barely-there silhouettes drifting far in the background —
// distant archive towers glimpsed, not read in any detail — the same
// "ambient depth, not a marker to track" role reefCrown's kelp/light
// rays play, just shadow instead of light here.
function renderShadowStacks(totalHeight) {
  const spots = [
    { fx: 0.14, fy: 0.3, rx: 34, ry: 90 },
    { fx: 0.86, fy: 0.55, rx: 28, ry: 110 },
    { fx: 0.08, fy: 0.82, rx: 30, ry: 80 },
  ];
  return spots
    .map((s, i) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      const pts = blobPoints(cx, cy, s.rx, 10, i * 5.1 + 4).map((p) => ({ x: p.x, y: cy + (p.y - cy) * (s.ry / s.rx) }));
      return `<path d="${closedBlobPath(pts)}" fill="${SHADOW}" opacity="0.5" />`;
    })
    .join("");
}

// The scene's one real feature: a small torn-parchment fragment, two
// solid ink lines a real reader would actually see, and — sitting right
// in the gap between them — one faint gold line, visible only by its own
// glow, the meaning the passage implies but never states outright.
// Alternates sides of the trail by index parity; boss stop excluded (its
// own clearing is the destination, not another fragment).
function renderInferenceFragment(p, i) {
  const side = i % 2 === 0 ? 1 : -1;
  const cx = p.x + side * 58;
  const cy = p.y;
  const w = 78;
  const h = 46;
  const rot = ((i * 11) % 12) - 6;
  const lineW = w - 20;
  return `
    <g transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})">
      <rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="4" fill="${PARCHMENT}" opacity="0.92" stroke="${GOLD_DIM}" stroke-width="1.6" />
      <line x1="${(cx - lineW / 2).toFixed(1)}" y1="${(cy - 12).toFixed(1)}" x2="${(cx + lineW / 2).toFixed(1)}" y2="${(cy - 12).toFixed(1)}" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="20" fill="url(#umbralGlow)" />
      <line x1="${(cx - lineW / 2 + 6).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + lineW / 2 - 6).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="3 5" opacity="0.95" />
      <line x1="${(cx - lineW / 2).toFixed(1)}" y1="${(cy + 12).toFixed(1)}" x2="${(cx + lineW / 2).toFixed(1)}" y2="${(cy + 12).toFixed(1)}" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
    </g>
  `;
}

function renderFragments(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderInferenceFragment(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#1a1740" stroke="${GOLD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Archive Stacks under a dim violet night sky, distant shadowed stacks barely visible: floating page fragments, each carrying two solid ink lines with one faint glowing line hidden in the gap between them, connecting every Read Between the Lines lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#umbralSky)" />
      <g>${renderStars(totalHeight)}</g>
      <g>${renderShadowStacks(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_DIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.85" />
      <g>${renderFragments(positions)}</g>
    </svg>
  `;
}

export const umbralArchiveTheme = {
  trailBand: BAND,
  mapBg: SKY_BOTTOM,
  hintColor: "rgba(243, 236, 214, 0.85)",
  renderScene,
};
