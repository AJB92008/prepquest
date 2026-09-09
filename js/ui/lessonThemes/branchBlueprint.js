// Lexicon Shoals' own theme for Blueprint Reader, Etymology Grove's
// second skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through, and rootedMeaning.js for this
// zone's own shared Root & Branch palette). Blueprint Reader is about
// seeing how a text is actually built and why the author structured it
// that way, so every stop shows a tree with its own structural
// skeleton left visible — dashed graphite branch-lines fanning out
// from the trunk, the scaffold a finished leafy canopy is built on top
// of — rather than just a finished tree with no explanation for its
// own shape.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const CANOPY_TOP = "#bcd98f";
const CANOPY_BOTTOM = "#789950";
const BARK = "#6b4a34";
const BARK_DARK = "#4a3020";
const TAG_WOOD = "#c98a3e";
const TAG_WOOD_DARK = "#8f5f28";
const LEAF = "#6f9a48";
const GRAPHITE = "#3f4a3a";

const ROOT_TAGS = ["L.", "Gr.", "OE", "Fr."];

function defs() {
  return `
    <defs>
      <linearGradient id="branchBlueprintCanopy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${CANOPY_TOP}" />
        <stop offset="100%" stop-color="${CANOPY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

function renderDappledLight(totalHeight) {
  const spots = [
    { fx: 0.16, fy: 0.14, r: 24 },
    { fx: 0.84, fy: 0.32, r: 28 },
    { fx: 0.22, fy: 0.6, r: 22 },
    { fx: 0.8, fy: 0.86, r: 26 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.6).toFixed(1)}" fill="#f4e8b8" opacity="0.16" />`;
    })
    .join("");
}

function renderRootTag(x, y, label, side) {
  const tx = x + side * 30;
  const ty = y + 40;
  return `
    <rect x="${(tx - 12).toFixed(1)}" y="${(ty - 9).toFixed(1)}" width="24" height="18" rx="2" fill="${TAG_WOOD}" stroke="${TAG_WOOD_DARK}" stroke-width="1.4" />
    <text x="${tx.toFixed(1)}" y="${(ty + 4).toFixed(1)}" font-size="10" font-weight="700" fill="#3a2a18" text-anchor="middle">${label}</text>
  `;
}

// The dashed structural skeleton — a fixed 5-branch fan of guide-lines
// radiating from the top of the trunk, drawn first so the finished
// canopy sits over it. Angles are fixed (not per-stop random), the same
// "one real, legible structure" reasoning tradeRoutes.js's own compass
// watermark uses — this is meant to read as a blueprint, not noise.
function renderSkeleton(x, topY) {
  const angles = [-70, -35, 0, 35, 70];
  return angles
    .map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const len = 26;
      const ex = x + Math.sin(rad) * len;
      const ey = topY - Math.cos(rad) * len;
      return `<line x1="${x}" y1="${topY.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${GRAPHITE}" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.55" />`;
    })
    .join("");
}

// A small architect's corner bracket — the one non-organic mark in the
// whole zone, naming this specifically as a blueprint rather than just
// another tree.
function renderCornerMark(x, y) {
  return `
    <path d="M${(x - 10).toFixed(1)},${(y - 2).toFixed(1)} L${(x - 10).toFixed(1)},${(y - 10).toFixed(1)} L${(x - 2).toFixed(1)},${(y - 10).toFixed(1)}" stroke="${GRAPHITE}" stroke-width="1.4" fill="none" opacity="0.6" />
  `;
}

function renderTreeWithSkeleton(x, y) {
  const top = y - 32;
  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${top.toFixed(1)}" stroke="${BARK}" stroke-width="5" stroke-linecap="round" />
    ${renderSkeleton(x, top)}
    <circle cx="${x.toFixed(1)}" cy="${(top - 4).toFixed(1)}" r="15" fill="${LEAF}" stroke="${BARK_DARK}" stroke-width="1.2" />
    <circle cx="${(x - 13).toFixed(1)}" cy="${(top + 6).toFixed(1)}" r="11" fill="${LEAF}" stroke="${BARK_DARK}" stroke-width="1.2" />
    <circle cx="${(x + 13).toFixed(1)}" cy="${(top + 6).toFixed(1)}" r="11" fill="${LEAF}" stroke="${BARK_DARK}" stroke-width="1.2" />
    ${renderCornerMark(x - 24, top - 18)}
  `;
}

function renderTrees(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      return renderTreeWithSkeleton(p.x, p.y) + renderRootTag(p.x, p.y, ROOT_TAGS[i % ROOT_TAGS.length], side);
    })
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#4a5c34" stroke="${TAG_WOOD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Etymology Grove: a tree at every stop with its own dashed structural skeleton left visible behind the finished canopy, connecting every Blueprint Reader lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#branchBlueprintCanopy)" />
      <g>${renderDappledLight(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${BARK_DARK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.85" />
      <g>${renderTrees(positions)}</g>
    </svg>
  `;
}

export const branchBlueprintTheme = {
  trailBand: BAND,
  mapBg: CANOPY_TOP,
  hintColor: "rgba(58, 42, 24, 0.8)",
  renderScene,
};
