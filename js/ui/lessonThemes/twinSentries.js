// Lexicon Shoals' own theme for Agreement Check, Grammar Garrison's
// third skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through, and rampartGates.js for this
// zone's own shared Sky Bastion palette). Agreement Check is about two
// things matching — a subject and its verb, a pronoun and its
// antecedent — so every stop gets exactly two sentry turrets standing
// side by side, always built identical to each other (same height, same
// stone shade, same banner), the same "paired, always matching" idea
// Athenaeum Reef's own Side by Side and twinPonds/twinTidepools already
// use elsewhere in this app, just re-skinned as matched guards instead
// of matched pools. What varies is which pair-height/banner-color
// combination a given stop gets — never whether the two sentries in it
// agree with each other.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SKY_TOP = "#7fb0e8";
const SKY_BOTTOM = "#eef3f7";
const STONE = "#9098a6";
const STONE_DARK = "#5f6674";
const GOLD_TRIM = "#d4af5a";
const CLOUD = "#ffffff";

const BANNER_SET = ["#b8433f", "#3f6fb8", "#3f9a5c"];
const HEIGHT_SET = [56, 72, 64];

function defs() {
  return `
    <defs>
      <linearGradient id="sentrySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

function renderClouds(totalHeight) {
  const spots = [
    { fx: 0.5, fy: 0.1, r: 28 },
    { fx: 0.2, fy: 0.4, r: 22 },
    { fx: 0.8, fy: 0.6, r: 26 },
    { fx: 0.4, fy: 0.88, r: 24 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.55).toFixed(1)}" fill="${CLOUD}" opacity="0.6" />`;
    })
    .join("");
}

// One small crenellated turret at a given base point — `h` is its own
// full height, `banner` its own flag color. Used twice per stop, always
// with identical `h`/`banner`, so the pair reads as matched on sight.
function renderTurret(x, baseY, h, banner) {
  const w = 34;
  const top = baseY - h;
  return `
    <rect x="${(x - w / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${w}" height="${h.toFixed(1)}" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="2" />
    <rect x="${(x - w / 2).toFixed(1)}" y="${top.toFixed(1)}" width="7" height="${h.toFixed(1)}" fill="#b7bdc8" opacity="0.5" />
    <rect x="${(x - w / 2 - 3).toFixed(1)}" y="${(top - 10).toFixed(1)}" width="10" height="12" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="1.4" />
    <rect x="${(x + w / 2 - 7).toFixed(1)}" y="${(top - 10).toFixed(1)}" width="10" height="12" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="1.4" />
    <line x1="${x.toFixed(1)}" y1="${(top - 10).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(top - 34).toFixed(1)}" stroke="${STONE_DARK}" stroke-width="2" />
    <path d="M${x.toFixed(1)},${(top - 34).toFixed(1)} L${(x + 18).toFixed(1)},${(top - 28).toFixed(1)} L${x.toFixed(1)},${(top - 22).toFixed(1)} Z" fill="${banner}" stroke="${GOLD_TRIM}" stroke-width="1" />
  `;
}

// The pair itself — same turret drawn twice, mirrored around the stop's
// own x, both sharing one height/banner picked from this stop's index so
// consecutive stops still look different from each other even though
// each stop's own two sentries never do.
function renderPair(p, i) {
  const h = HEIGHT_SET[i % HEIGHT_SET.length];
  const banner = BANNER_SET[i % BANNER_SET.length];
  const gap = 46;
  return renderTurret(p.x - gap, p.y + 30, h, banner) + renderTurret(p.x + gap, p.y + 30, h, banner);
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
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#4a5060" stroke="${GOLD_TRIM}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Grammar Garrison under open daytime sky: a pair of identical sentry turrets — always matched in height and banner color — standing at every stop, connecting every Agreement Check lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#sentrySky)" />
      <g>${renderClouds(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_TRIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.9" />
      <g>${renderPairs(positions)}</g>
    </svg>
  `;
}

export const twinSentriesTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(30, 35, 45, 0.75)",
  renderScene,
};
