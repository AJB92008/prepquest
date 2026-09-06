// Lab Log's own theme (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through) — Field Station's own grassy
// research camp, an open field notebook propped on an easel at every
// stop, its checklist filling in one more line each time (step 1, step
// 2, step 3...) — Research Summaries passages are exactly this, a
// numbered procedure read start to finish, so the trail itself counts
// up the same way. An earlier version of this file used a wooden
// signpost with a small clipboard instead — replaced because it didn't
// look good, not because the underlying "counts up one step at a time"
// idea was wrong. Shares its grass/tent styling with
// variableVaultPlots.js (Variable Vault, sc-investigation's own theme,
// same Field Station zone — see scienceHub.js's own ZONES), kept a
// separate self-contained file per this folder's own convention.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 70, max: COL_W - 70 };
const GRASS = "#d9e4c8";
const GREEN = "#6f9a52";

function renderTentSmall(x, y, seed) {
  const stripe = seed % 2 === 0;
  return `
    <ellipse cx="${x}" cy="${y + 16}" rx="22" ry="5" fill="rgba(20,40,10,0.16)" />
    <path d="M${x - 22},${y + 14} L${x},${y - 20} L${x + 22},${y + 14} Z" fill="${stripe ? "#e8dcc0" : "#cfe0b8"}" stroke="#7a6a48" stroke-width="2" />
    <path d="M${x - 6},${y + 14} L${x},${y + 2} L${x + 6},${y + 14} Z" fill="#4a4038" />
  `;
}

// An open notebook on an easel, its own checklist filling in one more
// checked line per step — the "step N" idea drawn as an actual
// in-progress log rather than a static numbered sign. The 5 checklist
// rows plus a checkmark's own downward stroke need real headroom inside
// the page: an earlier version of this spaced them past the page's own
// bottom edge, so the last row (and its checkmark, once checked) stuck
// out below the notebook itself.
function renderFieldNotebook(x, y, step) {
  const rows = Math.min(step, 5);
  const rings = [0, 1, 2, 3, 4].map((i) => `<circle cx="${x - 15 + i * 7.5}" cy="${y - 28.5}" r="1.6" fill="none" stroke="#a89468" stroke-width="1.2" />`).join("");
  const lines = Array.from({ length: 5 }, (_, i) => {
    const ly = y - 20 + i * 5.5;
    const checked = i < rows;
    return `
      <line x1="${x - 13}" y1="${ly}" x2="${x - 2}" y2="${ly}" stroke="#c2b48c" stroke-width="1.2" />
      ${checked ? `<path d="M${x - 1},${ly - 0.5} l1.6,1.8 l3.4,-4.2" stroke="${GREEN}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />` : ""}
    `;
  }).join("");
  return `
    <ellipse cx="${x}" cy="${y + 25}" rx="17" ry="5" fill="rgba(20,40,10,0.16)" />
    <line x1="${x - 15}" y1="${y + 23}" x2="${x - 4}" y2="${y - 7}" stroke="#7a6a48" stroke-width="2.2" />
    <line x1="${x + 15}" y1="${y + 23}" x2="${x + 4}" y2="${y - 7}" stroke="#7a6a48" stroke-width="2.2" />
    <rect x="${x - 18}" y="${y - 30}" width="36" height="36" rx="2" fill="#f7f2e4" stroke="#a89468" stroke-width="2" />
    ${rings}
    ${lines}
    <circle cx="${x + 16}" cy="${y - 27}" r="8" fill="${GREEN}" />
    <text x="${x + 16}" y="${y - 23.5}" font-size="9" font-weight="700" text-anchor="middle" fill="#f7f2e4">${step}</text>
  `;
}

function computeNotebooks(positions) {
  const mid = (BAND.min + BAND.max) / 2;
  return positions.slice(0, -1).map((p, i) => {
    const side = p.x < mid ? 1 : -1;
    return { x: clamp(p.x + side * 85, BAND.min + 25, BAND.max - 25), y: p.y, step: i + 1 };
  });
}

function renderNotebooks(positions) {
  return computeNotebooks(positions)
    .map(({ x, y, step }) => renderFieldNotebook(x, y, step))
    .join("");
}

function renderTents(totalHeight) {
  const count = Math.max(4, Math.round(totalHeight / 480));
  return Array.from({ length: count }, (_, i) => {
    const x = i % 2 === 0 ? BAND.min - 32 : BAND.max + 32;
    const y = ((i + 0.5) / count) * totalHeight;
    return renderTentSmall(clamp(x, 24, COL_W - 24), y, i);
  }).join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#f4ecd8" stroke="${GREEN}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lab Archipelago's Field Station: a grassy research camp with an open notebook on an easel at every stop, its checklist filling in one more line each time, connecting every Lab Log lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${GRASS}" />
      <g>${renderTents(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GREEN}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.8" />
      <g>${renderNotebooks(positions)}</g>
    </svg>
  `;
}

export const fieldLogCampTheme = {
  trailBand: BAND,
  mapBg: GRASS,
  hintColor: "rgba(50, 65, 30, 0.78)",
  renderScene,
};
