// Lexicon Shoals' own theme for Detail Sorter, Archive Stacks' fifth
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and celestialCodex.js for this zone's own
// shared palette). Unlike Core Idea Finder's single unmissable codex
// right next door (celestialCodex.js), this scene is deliberately the
// opposite composition — no one dominant shape anywhere, just a dense,
// varied drift of small index cards, mini scrolls, and wax seals
// scattered edge to edge, the same "opposite of one big thing" pairing
// Athenaeum Reef's own Big Picture/Detail Detective pair uses (see
// coralMosaic.js, whose grid-jitter-skip technique this reuses directly,
// just re-skinned as floating catalog pieces instead of reef debris).
// One extra touch matching the skill's own idea: the drift reads
// visibly messier near the top of the scene (cards at wider, more
// random angles) and settles into calmer, more aligned angles by the
// time the trail reaches the boss — sorting actually happening down the
// length of the climb, not just static clutter.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SKY_TOP = "#2b2657";
const SKY_BOTTOM = "#141233";
const GOLD = "#f0cf86";
const GOLD_DIM = "#c9a668";
const PARCHMENT = "#f3ecd6";

const TAB_FILLS = ["#e8895f", "#7fb3d9", "#8fbf7a"];

function indexCard(x, y, seed, rot) {
  const w = 22;
  const h = 14;
  const tab = TAB_FILLS[seed % TAB_FILLS.length];
  return `
    <g transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">
      <rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="2" fill="${PARCHMENT}" stroke="${GOLD_DIM}" stroke-width="1.2" opacity="0.95" />
      <rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="7" height="5" fill="${tab}" opacity="0.9" />
      <line x1="${(x - w / 2 + 3).toFixed(1)}" y1="${(y + 2).toFixed(1)}" x2="${(x + w / 2 - 3).toFixed(1)}" y2="${(y + 2).toFixed(1)}" stroke="#8a7440" stroke-width="1" opacity="0.5" />
    </g>
  `;
}

function miniScroll(x, y, seed, rot) {
  const w = 20 + (seed % 3) * 2;
  const h = 8;
  return `
    <g transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">
      <rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="${h / 2}" fill="${GOLD_DIM}" opacity="0.65" />
    </g>
  `;
}

function waxSeal(x, y, seed) {
  const r = 6 + (seed % 3);
  return `
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#c0553f" opacity="0.85" />
    <line x1="${(x - r * 0.5).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + r * 0.5).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#f3ecd6" stroke-width="1.2" opacity="0.7" />
    <line x1="${x.toFixed(1)}" y1="${(y - r * 0.5).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + r * 0.5).toFixed(1)}" stroke="#f3ecd6" stroke-width="1.2" opacity="0.7" />
  `;
}

const PIECES = [indexCard, miniScroll, waxSeal];

function renderStars(totalHeight) {
  const count = Math.max(14, Math.round((totalHeight / COL_W) * 14));
  return Array.from({ length: count }, (_, i) => {
    const y = (i * 167) % totalHeight;
    const x = (i * 139) % COL_W;
    const opacity = (0.2 + ((i * 19) % 35) / 100).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="1.3" fill="${PARCHMENT}" opacity="${opacity}" />`;
  }).join("");
}

// A jittered grid across the whole floor, every third cell skipped —
// same technique coralMosaic.js's own renderMosaic uses — with each
// piece's own rotation magnitude shrinking linearly from a wide, messy
// swing near the top row to almost none by the last row, so the drift
// itself visibly settles down the length of the climb.
function renderCatalog(totalHeight) {
  const cols = 6;
  const rows = Math.max(10, Math.round(totalHeight / 55));
  const pieces = [];
  for (let r = 0; r < rows; r++) {
    const t = rows > 1 ? r / (rows - 1) : 0;
    const rotRange = 30 - t * 26;
    for (let c = 0; c < cols; c++) {
      const seed = r * 13 + c * 7;
      // Skipped roughly one cell in three, same "scattered, not wallpaper"
      // density coralMosaic.js's own renderMosaic uses — off a *different*
      // combination of r/c than the piece-selection modulo just below, so
      // skipping never correlates with which piece index the kept cells
      // can land on (an earlier version skipped on the same `seed % 3` it
      // then read `% 3` again for PIECES.length===3, which silently made
      // index 0 — indexCard — mathematically unreachable: every seed that
      // survived the skip had already failed `seed % 3 === 0`).
      if ((r * 7 + c * 11) % 3 === 0) continue;
      const jitterX = ((seed * 37) % 40) - 20;
      const jitterY = ((seed * 19) % 30) - 15;
      const x = clamp((COL_W / cols) * (c + 0.5) + jitterX, 20, COL_W - 20);
      const y = clamp((totalHeight / rows) * (r + 0.5) + jitterY, 20, totalHeight - 20);
      const rot = ((seed * 23) % Math.round(rotRange * 2 + 1)) - rotRange;
      pieces.push(PIECES[seed % PIECES.length](x, y, seed, rot));
    }
  }
  return pieces.join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#241f45" stroke="${GOLD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Archive Stacks under a violet night sky: a dense drift of small index cards, mini scrolls, and wax seals covering the whole scene, scattered wide near the top and settling into neater rows further down, connecting every Detail Sorter lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${SKY_BOTTOM}" />
      <g>${renderStars(totalHeight)}</g>
      <g>${renderCatalog(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_DIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.9" />
    </svg>
  `;
}

export const catalogDriftTheme = {
  trailBand: BAND,
  mapBg: SKY_BOTTOM,
  hintColor: "rgba(243, 236, 214, 0.9)",
  renderScene,
};
