// Lexicon Shoals' own theme for Sentence Boundaries, Grammar Garrison's
// first skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through). Sentence Boundaries is about
// correctly marking where one sentence stops and the next starts, so the
// scene draws that literally: one continuous stone rampart running the
// whole length of the trail down the left edge, solid and unbroken
// everywhere except at a real, deliberately-built gate at every stop — a
// fragment (a wall with no real gate at all, just rubble) and a run-on
// (a wall that never breaks) both read as wrong the same way an
// unbroken or randomly-crumbled wall would. This zone's own Sky Bastion
// family — a bright open-air daytime sky (deliberately not Archive
// Stacks' own night violet; this is a different zone with its own time
// of day), weathered blue-gray stone, and crimson banners — carries
// across all four of Grammar Garrison's skills; see the other three
// files in this directory for the same palette used toward very
// different compositions.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 150, max: COL_W - 60 };
const SKY_TOP = "#7fb0e8";
const SKY_BOTTOM = "#eef3f7";
const STONE = "#9098a6";
const STONE_DARK = "#5f6674";
const STONE_LIGHT = "#b7bdc8";
const BANNER = "#b8433f";
const BANNER_DARK = "#8a2f2c";
const GOLD_TRIM = "#d4af5a";
const CLOUD = "#ffffff";
// A fixed, flat stand-in for "open sky showing through the gate" — not
// `url(#rampartSky)`. That gradient's `gradientUnits` default to the
// *element's own* bounding box, and a gate arch is only ~60px tall, so
// painted with it directly, every gate would render the whole top-to-
// bottom sky ramp compressed into itself — looking right near the
// scene's top purely by coincidence, then showing an incongruously
// saturated blue cap deep into a tall scene where the real sky around it
// has long since faded toward `SKY_BOTTOM`. A single flat tone avoids
// that drift entirely; it reads as "opening," not as a literal window
// onto this exact point in the sky.
const GATE_OPENING = "#d8e8f5";

const WALL_X0 = 24;
const WALL_X1 = 118;

function defs() {
  return `
    <defs>
      <linearGradient id="rampartSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

// A few soft clouds drifting in the open sky the trail wanders through —
// fixed positions, not tied to any stop, the same "ambient depth, not a
// marker to track" role every other Lexicon Shoals theme's own cloud
// wisps play.
function renderClouds(totalHeight) {
  const spots = [
    { fx: 0.55, fy: 0.12, r: 30 },
    { fx: 0.82, fy: 0.3, r: 22 },
    { fx: 0.62, fy: 0.55, r: 26 },
    { fx: 0.88, fy: 0.78, r: 24 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `
        <ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.55).toFixed(1)}" fill="${CLOUD}" opacity="0.7" />
        <ellipse cx="${(cx - s.r * 0.5).toFixed(1)}" cy="${(cy + s.r * 0.18).toFixed(1)}" rx="${(s.r * 0.6).toFixed(1)}" ry="${(s.r * 0.4).toFixed(1)}" fill="${CLOUD}" opacity="0.6" />
        <ellipse cx="${(cx + s.r * 0.55).toFixed(1)}" cy="${(cy + s.r * 0.14).toFixed(1)}" rx="${(s.r * 0.55).toFixed(1)}" ry="${(s.r * 0.36).toFixed(1)}" fill="${CLOUD}" opacity="0.6" />
      `;
    })
    .join("");
}

// The wall's own crenellations — a repeating rectangular tooth pattern
// along the top edge only, the classic castle-battlement silhouette.
function renderCrenellations() {
  const teeth = 5;
  const toothW = (WALL_X1 - WALL_X0) / (teeth * 2 - 1);
  const parts = [];
  for (let i = 0; i < teeth; i++) {
    const x = WALL_X0 + i * toothW * 2;
    parts.push(`<rect x="${x.toFixed(1)}" y="-14" width="${toothW.toFixed(1)}" height="18" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="1.5" />`);
  }
  return parts.join("");
}

// A brick/mortar texture across the whole wall's own height — a
// deterministic offset-row pattern (every other row shifted half a
// brick), not a repeating tile, so it reads as coursed stonework rather
// than wallpaper.
function renderBrickTexture(totalHeight) {
  const rowH = 22;
  const rows = Math.ceil(totalHeight / rowH) + 1;
  const brickW = 30;
  const lines = [];
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    lines.push(`<line x1="${WALL_X0}" y1="${y}" x2="${WALL_X1}" y2="${y}" stroke="${STONE_DARK}" stroke-width="1" opacity="0.35" />`);
    const offset = r % 2 === 0 ? 0 : brickW / 2;
    for (let x = WALL_X0 + offset; x < WALL_X1; x += brickW) {
      lines.push(`<line x1="${x.toFixed(1)}" y1="${y}" x2="${x.toFixed(1)}" y2="${(y + rowH).toFixed(1)}" stroke="${STONE_DARK}" stroke-width="1" opacity="0.3" />`);
    }
  }
  return lines.join("");
}

// One real, deliberately-built gate at this stop's own height — an
// arched opening cut clean through the wall (rendered in the sky's own
// color so it reads as a real passage, not a shadow), flanked by two
// gate-bar uprights, with a small crimson banner mounted just above it.
// No gate at the boss stop — its own clearing is the destination, not
// another boundary along the way.
function renderGate(y, i) {
  const cx = (WALL_X0 + WALL_X1) / 2;
  const archR = 26;
  const gateTop = y - archR - 10;
  const gateBottom = y + 24;
  const gateHalfW = 20;
  const archPath = `M${(cx - gateHalfW).toFixed(1)},${(gateTop + archR).toFixed(1)} A${archR},${archR} 0 0 1 ${(cx + gateHalfW).toFixed(1)},${(gateTop + archR).toFixed(1)} L${(cx + gateHalfW).toFixed(1)},${gateBottom.toFixed(1)} L${(cx - gateHalfW).toFixed(1)},${gateBottom.toFixed(1)} Z`;
  const bars = [0.32, 0.68]
    .map((f) => {
      const bx = cx - gateHalfW + gateHalfW * 2 * f;
      return `<line x1="${bx.toFixed(1)}" y1="${(gateTop + archR * 0.4).toFixed(1)}" x2="${bx.toFixed(1)}" y2="${gateBottom.toFixed(1)}" stroke="${STONE_DARK}" stroke-width="2.4" opacity="0.6" />`;
    })
    .join("");
  const flagX = cx;
  const flagTopY = gateTop - 22;
  const wave = i % 2 === 0 ? 1 : -1;
  const banner = `
    <line x1="${flagX}" y1="${flagTopY}" x2="${flagX}" y2="${(gateTop - 2).toFixed(1)}" stroke="${GOLD_TRIM}" stroke-width="2" />
    <path d="M${flagX},${flagTopY} L${(flagX + wave * 20).toFixed(1)},${(flagTopY + 6).toFixed(1)} L${flagX},${(flagTopY + 12).toFixed(1)} Z" fill="${BANNER}" stroke="${BANNER_DARK}" stroke-width="1" />
  `;
  return `<path d="${archPath}" fill="${GATE_OPENING}" stroke="${GOLD_TRIM}" stroke-width="2.5" />${bars}${banner}`;
}

function renderGates(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderGate(p.y, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#4a5060" stroke="${GOLD_TRIM}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Grammar Garrison under open daytime sky: one continuous stone rampart running the length of the scene, solid everywhere except a real gate at every stop with its own small banner, connecting every Sentence Boundaries lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#rampartSky)" />
      <g>${renderClouds(totalHeight)}</g>
      <rect x="${WALL_X0}" y="0" width="${WALL_X1 - WALL_X0}" height="${totalHeight}" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="2" />
      <rect x="${WALL_X0}" y="0" width="6" height="${totalHeight}" fill="${STONE_LIGHT}" opacity="0.5" />
      <g>${renderBrickTexture(totalHeight)}</g>
      <g>${renderCrenellations()}</g>
      <g>${renderGates(positions)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_TRIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.9" />
    </svg>
  `;
}

export const rampartGatesTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(30, 35, 45, 0.75)",
  renderScene,
};
