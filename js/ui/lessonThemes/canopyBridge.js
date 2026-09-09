// Lexicon Shoals' own theme for Paired Passage Bridge, Etymology
// Grove's fourth skill (see lessonTerrain.js for the shared engine
// every lesson-path theme renders through, and rootedMeaning.js for
// this zone's own shared Root & Branch palette). Paired Passage Bridge
// is about comparing and connecting ideas across two related passages,
// so every stop plants two trees, one on each side of the trail, whose
// canopies reach toward each other and touch directly over the trail —
// a real bridge grown out of two separate trees, not a single tree
// standing alone. Always paired, the same "two things, always meeting
// in the middle" idea Athenaeum Reef's own Side by Side/twinPonds/
// twinTidepools and Grammar Garrison's own Agreement Check already use
// elsewhere in this app, just grown instead of built or matched.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const CANOPY_TOP = "#bcd98f";
const CANOPY_BOTTOM = "#789950";
const BARK = "#6b4a34";
const BARK_DARK = "#4a3020";
const TAG_WOOD = "#c98a3e";
const TAG_WOOD_DARK = "#8f5f28";
const LEAF_A = "#7fa856";
const LEAF_B = "#5c9a6a";

const ROOT_TAGS = ["L.", "Gr.", "OE", "Fr."];

function defs() {
  return `
    <defs>
      <linearGradient id="canopyBridgeCanopy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${CANOPY_TOP}" />
        <stop offset="100%" stop-color="${CANOPY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

function renderDappledLight(totalHeight) {
  const spots = [
    { fx: 0.16, fy: 0.12, r: 24 },
    { fx: 0.84, fy: 0.34, r: 26 },
    { fx: 0.2, fy: 0.62, r: 22 },
    { fx: 0.8, fy: 0.86, r: 28 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.6).toFixed(1)}" fill="#f4e8b8" opacity="0.16" />`;
    })
    .join("");
}

// Root tags for this file carry each side's own origin — the two
// trees really do trace back to two different sources, reinforcing
// "two passages" rather than one tree split in half. `side * 8` here,
// not the `side * 30` every sibling file in this zone uses — the two
// trunks are only 84px apart (see `gap` below), so a 30px sideways
// push would land the tags almost on top of each other or spill past
// the neighboring stop; 8px is enough to separate the two tags without
// leaving this pair's own footprint.
function renderRootTag(x, y, label, side) {
  const tx = x + side * 8;
  const ty = y + 40;
  return `
    <rect x="${(tx - 12).toFixed(1)}" y="${(ty - 9).toFixed(1)}" width="24" height="18" rx="2" fill="${TAG_WOOD}" stroke="${TAG_WOOD_DARK}" stroke-width="1.4" />
    <text x="${tx.toFixed(1)}" y="${(ty + 4).toFixed(1)}" font-size="10" font-weight="700" fill="#3a2a18" text-anchor="middle">${label}</text>
  `;
}

// One tree, its own canopy centered `reach` px toward the stop's own
// center rather than straight above its trunk — the lean that makes
// two separate trees actually meet.
function renderReachingTree(trunkX, y, reach, leafColor) {
  const top = y - 30;
  const canopyX = trunkX + reach;
  return `
    <line x1="${trunkX}" y1="${y}" x2="${trunkX}" y2="${top.toFixed(1)}" stroke="${BARK}" stroke-width="5" stroke-linecap="round" />
    <circle cx="${canopyX.toFixed(1)}" cy="${(top - 4).toFixed(1)}" r="15" fill="${leafColor}" stroke="${BARK_DARK}" stroke-width="1.2" />
    <circle cx="${(canopyX - 10).toFixed(1)}" cy="${(top + 5).toFixed(1)}" r="11" fill="${leafColor}" stroke="${BARK_DARK}" stroke-width="1.2" />
    <circle cx="${(canopyX + 10).toFixed(1)}" cy="${(top + 5).toFixed(1)}" r="11" fill="${leafColor}" stroke="${BARK_DARK}" stroke-width="1.2" />
  `;
}

// The trees render at `p.y + 12`, not the stop's own plain `p.y`, so
// their canopies sit a little lower and read as reaching down into the
// trail rather than floating above it. The two root tags deliberately
// don't inherit that +12 — passed `p.y` directly instead — because a
// tag offset by both the trees' own +12 and its own further +40 (see
// renderRootTag) landed close enough to the boss clearing at real
// lesson counts (10, 20, 28) to actually overlap it, caught by
// tests/etymologyGroveLessonThemes.test.js's own boss-collision check.
function renderPair(p, i) {
  const gap = 42;
  const leftX = p.x - gap;
  const rightX = p.x + gap;
  const left = renderReachingTree(leftX, p.y + 12, 30, LEAF_A);
  const right = renderReachingTree(rightX, p.y + 12, -30, LEAF_B);
  const leftTag = renderRootTag(leftX, p.y, ROOT_TAGS[i % ROOT_TAGS.length], -1);
  const rightTag = renderRootTag(rightX, p.y, ROOT_TAGS[(i + 1) % ROOT_TAGS.length], 1);
  return left + right + leftTag + rightTag;
}

function renderPairs(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderPair(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#4a5c34" stroke="${TAG_WOOD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Etymology Grove: two trees at every stop, one on each side of the trail, their canopies reaching toward each other to form a real bridge grown over it, connecting every Paired Passage Bridge lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#canopyBridgeCanopy)" />
      <g>${renderDappledLight(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${BARK_DARK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.85" />
      <g>${renderPairs(positions)}</g>
    </svg>
  `;
}

export const canopyBridgeTheme = {
  trailBand: BAND,
  mapBg: CANOPY_TOP,
  hintColor: "rgba(58, 42, 24, 0.8)",
  renderScene,
};
