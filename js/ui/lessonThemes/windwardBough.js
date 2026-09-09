// Lexicon Shoals' own theme for Author's Angle, Etymology Grove's third
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and rootedMeaning.js for this zone's own
// shared Root & Branch palette). Author's Angle is about naming an
// author's own purpose and the deliberate rhetorical choices behind
// it, so every tree here leans at a real, deliberate angle rather than
// standing straight or slumping randomly — its own ground-shadow cast
// at that same angle, a small wind-pennant at the canopy naming the
// direction — a tree shaped on purpose, the same way a passage is
// built toward one. Lean direction alternates stop to stop so the
// "which way" itself keeps varying, never just one fixed slant.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const CANOPY_TOP = "#bcd98f";
const CANOPY_BOTTOM = "#789950";
const BARK = "#6b4a34";
const BARK_DARK = "#4a3020";
const TAG_WOOD = "#c98a3e";
const TAG_WOOD_DARK = "#8f5f28";
const LEAF = "#7fa856";
const SHADOW = "#4a5c34";

const ROOT_TAGS = ["L.", "Gr.", "OE", "Fr."];

function defs() {
  return `
    <defs>
      <linearGradient id="windwardBoughCanopy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${CANOPY_TOP}" />
        <stop offset="100%" stop-color="${CANOPY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

function renderDappledLight(totalHeight) {
  const spots = [
    { fx: 0.14, fy: 0.16, r: 26 },
    { fx: 0.86, fy: 0.3, r: 24 },
    { fx: 0.2, fy: 0.58, r: 28 },
    { fx: 0.82, fy: 0.84, r: 22 },
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

// The leaning tree itself — a curved trunk bowing toward `sign`, its
// own canopy carried along in the same direction, plus a flat ground-
// shadow cast the same way so the lean reads as deliberate weight, not
// a drawing error.
function renderLeaningTree(x, y, sign) {
  const lean = sign * 22;
  const top = y - 34;
  const trunkPath = `M${x},${y} Q${(x + lean * 0.5).toFixed(1)},${(y - 18).toFixed(1)} ${(x + lean).toFixed(1)},${top.toFixed(1)}`;
  const canopyX = x + lean;
  const flagX = canopyX + sign * 20;
  return `
    <ellipse cx="${(x + lean * 0.6).toFixed(1)}" cy="${(y + 4).toFixed(1)}" rx="24" ry="6" fill="${SHADOW}" opacity="0.35" />
    <path d="${trunkPath}" stroke="${BARK}" stroke-width="5" fill="none" stroke-linecap="round" />
    <circle cx="${canopyX.toFixed(1)}" cy="${(top - 5).toFixed(1)}" r="14" fill="${LEAF}" stroke="${BARK_DARK}" stroke-width="1.2" />
    <circle cx="${(canopyX - 11).toFixed(1)}" cy="${(top + 4).toFixed(1)}" r="10" fill="${LEAF}" stroke="${BARK_DARK}" stroke-width="1.2" />
    <circle cx="${(canopyX + 11).toFixed(1)}" cy="${(top + 4).toFixed(1)}" r="10" fill="${LEAF}" stroke="${BARK_DARK}" stroke-width="1.2" />
    <line x1="${canopyX.toFixed(1)}" y1="${(top - 16).toFixed(1)}" x2="${flagX.toFixed(1)}" y2="${(top - 20).toFixed(1)}" stroke="${TAG_WOOD_DARK}" stroke-width="1.4" />
    <path d="M${flagX.toFixed(1)},${(top - 20).toFixed(1)} L${(flagX + sign * 12).toFixed(1)},${(top - 16).toFixed(1)} L${flagX.toFixed(1)},${(top - 12).toFixed(1)} Z" fill="${TAG_WOOD}" stroke="${TAG_WOOD_DARK}" stroke-width="1" />
  `;
}

function renderTrees(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => {
      const sign = i % 2 === 0 ? 1 : -1;
      return renderLeaningTree(p.x, p.y, sign) + renderRootTag(p.x, p.y, ROOT_TAGS[i % ROOT_TAGS.length], -sign);
    })
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#4a5c34" stroke="${TAG_WOOD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Etymology Grove: a tree at every stop leaning at its own deliberate angle, its ground-shadow cast the same way and a small wind-pennant naming the direction, connecting every Author's Angle lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#windwardBoughCanopy)" />
      <g>${renderDappledLight(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${BARK_DARK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.85" />
      <g>${renderTrees(positions)}</g>
    </svg>
  `;
}

export const windwardBoughTheme = {
  trailBand: BAND,
  mapBg: CANOPY_TOP,
  hintColor: "rgba(58, 42, 24, 0.8)",
  renderScene,
};
