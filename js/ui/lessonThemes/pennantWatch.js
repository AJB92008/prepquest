// Lexicon Shoals' own theme for Punctuation Precision, Grammar
// Garrison's second skill (see lessonTerrain.js for the shared engine
// every lesson-path theme renders through, and rampartGates.js for this
// zone's own shared Sky Bastion palette). Punctuation Precision covers
// four specific marks — commas, semicolons, colons, and dashes — so
// each stop flies a small watch-post banner with that exact mark's own
// glyph stitched onto it, cycling through all four in order, the same
// "a different real thing each time" idea Chart Reader uses for chart
// types (see starChartGallery.js) and Graph Gazer uses for chart types
// before it — just re-skinned as signal flags instead of star-charts.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SKY_TOP = "#7fb0e8";
const SKY_BOTTOM = "#eef3f7";
const STONE = "#9098a6";
const STONE_DARK = "#5f6674";
const BANNER = "#b8433f";
const BANNER_DARK = "#8a2f2c";
const GOLD_TRIM = "#d4af5a";
const CLOUD = "#ffffff";
const GLYPH = "#f3ecd6";

function defs() {
  return `
    <defs>
      <linearGradient id="pennantSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

function renderClouds(totalHeight) {
  const spots = [
    { fx: 0.15, fy: 0.15, r: 26 },
    { fx: 0.85, fy: 0.35, r: 22 },
    { fx: 0.12, fy: 0.62, r: 28 },
    { fx: 0.9, fy: 0.85, r: 24 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.55).toFixed(1)}" fill="${CLOUD}" opacity="0.65" />`;
    })
    .join("");
}

// A short wooden watch-post: a plain vertical pole planted in a small
// stone base, tall enough for its own flag to clear the trail below.
function renderPost(x, y) {
  return `
    <rect x="${(x - 10).toFixed(1)}" y="${(y - 6).toFixed(1)}" width="20" height="12" rx="2" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="1.5" />
    <line x1="${x}" y1="${(y - 4).toFixed(1)}" x2="${x}" y2="${(y - 58).toFixed(1)}" stroke="${STONE_DARK}" stroke-width="3" stroke-linecap="round" />
  `;
}

// A rectangular pennant flag, flat (not a swallowtail) so a glyph reads
// cleanly on it, mounted at the top of the post — the flag itself always
// the same crimson-on-gold-trim shape; only the glyph stamped on it
// changes.
function flagBase(x, topY) {
  const w = 44;
  const h = 30;
  return `<rect x="${x.toFixed(1)}" y="${topY.toFixed(1)}" width="${w}" height="${h}" fill="${BANNER}" stroke="${GOLD_TRIM}" stroke-width="2" />`;
}

function commaGlyph(x, topY) {
  const cx = x + 22;
  const cy = topY + 12;
  return `
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="${GLYPH}" />
    <path d="M${cx.toFixed(1)},${(cy + 3).toFixed(1)} Q${(cx + 5).toFixed(1)},${(cy + 12).toFixed(1)} ${(cx - 1).toFixed(1)},${(cy + 16).toFixed(1)}" stroke="${GLYPH}" stroke-width="3.4" stroke-linecap="round" fill="none" />
  `;
}

function semicolonGlyph(x, topY) {
  const cx = x + 22;
  const topCy = topY + 9;
  return `
    <circle cx="${cx.toFixed(1)}" cy="${topCy.toFixed(1)}" r="3.6" fill="${GLYPH}" />
    <path d="M${cx.toFixed(1)},${(topCy + 9).toFixed(1)} Q${(cx + 5).toFixed(1)},${(topCy + 17).toFixed(1)} ${(cx - 1).toFixed(1)},${(topCy + 20).toFixed(1)}" stroke="${GLYPH}" stroke-width="3" stroke-linecap="round" fill="none" />
  `;
}

function colonGlyph(x, topY) {
  const cx = x + 22;
  return `
    <circle cx="${cx.toFixed(1)}" cy="${(topY + 9).toFixed(1)}" r="3.6" fill="${GLYPH}" />
    <circle cx="${cx.toFixed(1)}" cy="${(topY + 21).toFixed(1)}" r="3.6" fill="${GLYPH}" />
  `;
}

function dashGlyph(x, topY) {
  const cx = x + 22;
  const cy = topY + 15;
  return `<line x1="${(cx - 12).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + 12).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${GLYPH}" stroke-width="4.5" stroke-linecap="round" />`;
}

const MARKS = [commaGlyph, semicolonGlyph, colonGlyph, dashGlyph];

function renderSignal(p, i) {
  const side = i % 2 === 0 ? 1 : -1;
  const x = p.x + side * 60;
  const y = p.y;
  const flagTopY = y - 58 - 30;
  return renderPost(x, y) + flagBase(x, flagTopY) + MARKS[i % MARKS.length](x, flagTopY);
}

function renderSignals(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderSignal(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#4a5060" stroke="${GOLD_TRIM}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Grammar Garrison under open daytime sky: a row of watch-posts, each flying a crimson signal banner stitched with a different punctuation mark's own glyph — comma, semicolon, colon, dash — connecting every Punctuation Precision lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#pennantSky)" />
      <g>${renderClouds(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_TRIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.9" />
      <g>${renderSignals(positions)}</g>
    </svg>
  `;
}

export const pennantWatchTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(30, 35, 45, 0.75)",
  renderScene,
};
