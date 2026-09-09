// Lexicon Shoals' own theme for Figure It Out, Etymology Grove's fifth
// and last skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through, and rootedMeaning.js for this
// zone's own shared Root & Branch palette). Figure It Out is about
// reading figurative language and tone — a phrase that isn't literally
// about what it names — so every tree here is pruned into topiary,
// its own canopy shaped into something that isn't a tree at all:
// a spiral or a five-point star, alternating stop to stop, the same
// "the surface shape isn't the literal thing" idea the skill itself
// tests for, grown instead of stated.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const CANOPY_TOP = "#bcd98f";
const CANOPY_BOTTOM = "#789950";
const BARK = "#6b4a34";
const BARK_DARK = "#4a3020";
const TAG_WOOD = "#c98a3e";
const TAG_WOOD_DARK = "#8f5f28";
const LEAF = "#6f9a48";

const ROOT_TAGS = ["L.", "Gr.", "OE", "Fr."];

function defs() {
  return `
    <defs>
      <linearGradient id="topiaryTwistCanopy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${CANOPY_TOP}" />
        <stop offset="100%" stop-color="${CANOPY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

function renderDappledLight(totalHeight) {
  const spots = [
    { fx: 0.18, fy: 0.1, r: 26 },
    { fx: 0.82, fy: 0.3, r: 22 },
    { fx: 0.24, fy: 0.58, r: 28 },
    { fx: 0.78, fy: 0.84, r: 24 },
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

// A pruned spiral canopy — one continuous stroked path winding inward,
// filled leaf-green, reading as a topiary swirl rather than a plain
// round crown.
function renderSpiralCanopy(cx, cy) {
  const turns = 2.4;
  const steps = 40;
  const maxR = 17;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * Math.PI * 2;
    const r = maxR * (1 - t * 0.82);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return `<path d="${d}" stroke="${LEAF}" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.92" /><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4" fill="${LEAF}" />`;
}

// A pruned 5-point star canopy — same leaf color and bark outline as
// every other tree in the zone, just clipped into a star silhouette
// instead of a round crown.
function renderStarCanopy(cx, cy) {
  const outerR = 17;
  const innerR = 7;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${LEAF}" stroke="${BARK_DARK}" stroke-width="1.2" />`;
}

const CANOPY_SHAPES = [renderSpiralCanopy, renderStarCanopy];

function renderTopiary(x, y, i) {
  const top = y - 30;
  const shapeFn = CANOPY_SHAPES[i % CANOPY_SHAPES.length];
  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${top.toFixed(1)}" stroke="${BARK}" stroke-width="5" stroke-linecap="round" />
    ${shapeFn(x, top - 4)}
  `;
}

function renderTopiaries(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      return renderTopiary(p.x, p.y, i) + renderRootTag(p.x, p.y, ROOT_TAGS[i % ROOT_TAGS.length], side);
    })
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#4a5c34" stroke="${TAG_WOOD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Etymology Grove: a pruned topiary tree at every stop, its own canopy shaped into a spiral or a star instead of a plain round crown, connecting every Figure It Out lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#topiaryTwistCanopy)" />
      <g>${renderDappledLight(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${BARK_DARK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.85" />
      <g>${renderTopiaries(positions)}</g>
    </svg>
  `;
}

export const topiaryTwistTheme = {
  trailBand: BAND,
  mapBg: CANOPY_TOP,
  hintColor: "rgba(58, 42, 24, 0.8)",
  renderScene,
};
