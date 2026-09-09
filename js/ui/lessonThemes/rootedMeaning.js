// Lexicon Shoals' own theme for Context Clues, Etymology Grove's first
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through). Context Clues is about pinning down a word's
// meaning from how it's actually used around it, so every stop plants
// one sapling flanked by two different context blossoms — the
// sapling's own canopy always matches exactly one of the two, never
// the other, alternating which side is the real match stop to stop:
// the surrounding words decide the meaning, not the word alone. This
// zone's own "Root & Branch" family — warm forest green, bark brown,
// and small wooden root-origin tags naming the language a word's own
// root actually came from — is Etymology Grove's own answer to Archive
// Stacks' night violet, Grammar Garrison's open-air stone, and
// Scriptorium's overhead parchment; see this zone's other four files
// for the same palette used toward very different compositions.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const CANOPY_TOP = "#bcd98f";
const CANOPY_BOTTOM = "#789950";
const BARK = "#6b4a34";
const BARK_DARK = "#4a3020";
const TAG_WOOD = "#c98a3e";
const TAG_WOOD_DARK = "#8f5f28";
const CONTEXT_A = "#c96a3e";
const CONTEXT_B = "#5c7fc9";

const ROOT_TAGS = ["L.", "Gr.", "OE", "Fr."];

function defs() {
  return `
    <defs>
      <linearGradient id="rootedMeaningCanopy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${CANOPY_TOP}" />
        <stop offset="100%" stop-color="${CANOPY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

// Dappled sunlight through a canopy overhead — fixed soft spots, the
// same "ambient depth, not a marker to track" role every other Lexicon
// Shoals theme's own cloud wisps or age spots play.
function renderDappledLight(totalHeight) {
  const spots = [
    { fx: 0.18, fy: 0.1, r: 26 },
    { fx: 0.82, fy: 0.28, r: 22 },
    { fx: 0.24, fy: 0.56, r: 28 },
    { fx: 0.78, fy: 0.82, r: 24 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.6).toFixed(1)}" fill="#f4e8b8" opacity="0.16" />`;
    })
    .join("");
}

// A small wooden tag at the base of a trunk, naming the real language
// family a root actually traces back to — cycling through 4 fixed
// abbreviations, offset to one side and well clear of both the
// clickable lesson-marker button and its own "Lesson N" label so the
// tag's own short text never competes with either.
function renderRootTag(x, y, label, side) {
  const tx = x + side * 30;
  const ty = y + 40;
  return `
    <rect x="${(tx - 12).toFixed(1)}" y="${(ty - 9).toFixed(1)}" width="24" height="18" rx="2" fill="${TAG_WOOD}" stroke="${TAG_WOOD_DARK}" stroke-width="1.4" />
    <text x="${tx.toFixed(1)}" y="${(ty + 4).toFixed(1)}" font-size="10" font-weight="700" fill="#3a2a18" text-anchor="middle">${label}</text>
  `;
}

// The sapling itself — trunk plus a 3-blob canopy in `leafColor`, the
// one thing that changes stop to stop besides which side is correct.
function renderSapling(x, y, leafColor) {
  const top = y - 30;
  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${top.toFixed(1)}" stroke="${BARK}" stroke-width="4" stroke-linecap="round" />
    <circle cx="${x.toFixed(1)}" cy="${(top - 6).toFixed(1)}" r="13" fill="${leafColor}" stroke="${BARK_DARK}" stroke-width="1.2" />
    <circle cx="${(x - 10).toFixed(1)}" cy="${(top + 3).toFixed(1)}" r="10" fill="${leafColor}" stroke="${BARK_DARK}" stroke-width="1.2" />
    <circle cx="${(x + 10).toFixed(1)}" cy="${(top + 3).toFixed(1)}" r="10" fill="${leafColor}" stroke="${BARK_DARK}" stroke-width="1.2" />
  `;
}

// A small 3-petal context blossom off to one side, in `color` — the
// flanking clue the sapling's own canopy either does or doesn't match.
function renderBlossom(x, y, color) {
  return `
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${color}" />
    <circle cx="${(x - 7).toFixed(1)}" cy="${(y + 4).toFixed(1)}" r="4" fill="${color}" opacity="0.85" />
    <circle cx="${(x + 7).toFixed(1)}" cy="${(y + 4).toFixed(1)}" r="4" fill="${color}" opacity="0.85" />
    <circle cx="${x.toFixed(1)}" cy="${(y + 8).toFixed(1)}" r="2.4" fill="#f4e8b8" />
  `;
}

// The real match: `matchOnLeft` decides which flanking blossom the
// sapling's own canopy color echoes, alternating stop to stop so the
// "which side" itself keeps varying, never just "always the left."
function renderContextStop(p, i) {
  const matchOnLeft = i % 2 === 0;
  const leafColor = matchOnLeft ? CONTEXT_A : CONTEXT_B;
  const leftColor = CONTEXT_A;
  const rightColor = CONTEXT_B;
  const tagLabel = ROOT_TAGS[i % ROOT_TAGS.length];
  const tagSide = matchOnLeft ? 1 : -1;
  return renderBlossom(p.x - 34, p.y + 8, leftColor) + renderBlossom(p.x + 34, p.y + 8, rightColor) + renderSapling(p.x, p.y, leafColor) + renderRootTag(p.x, p.y, tagLabel, tagSide);
}

function renderSaplings(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderContextStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#4a5c34" stroke="${TAG_WOOD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Etymology Grove: a sapling at every stop whose own canopy color matches exactly one of two flanking context blossoms, with a small root-origin tag naming the real language it traces back to, connecting every Context Clues lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#rootedMeaningCanopy)" />
      <g>${renderDappledLight(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${BARK_DARK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.85" />
      <g>${renderSaplings(positions)}</g>
    </svg>
  `;
}

export const rootedMeaningTheme = {
  trailBand: BAND,
  mapBg: CANOPY_TOP,
  hintColor: "rgba(58, 42, 24, 0.8)",
  renderScene,
};
