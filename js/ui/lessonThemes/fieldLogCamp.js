// Lab Log's own theme (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through) — Field Station's own grassy
// research camp, a numbered logbook post standing at every stop (step
// 1, step 2, step 3...) — Research Summaries passages are exactly this,
// a numbered procedure read start to finish, so the trail itself counts
// up the same way. Shares its grass/tent styling with
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

// A numbered clipboard post — the "step N" idea drawn literally, one
// per lesson stop, counting up the whole way down.
function renderLogPost(x, y, step) {
  return `
    <ellipse cx="${x}" cy="${y + 30}" rx="14" ry="5" fill="rgba(20,40,10,0.18)" />
    <rect x="${x - 3}" y="${y - 4}" width="6" height="30" fill="#7a6a48" />
    <rect x="${x - 17}" y="${y - 26}" width="34" height="26" rx="2" fill="#f4ecd8" stroke="#a89468" stroke-width="2" />
    <line x1="${x - 12}" y1="${y - 18}" x2="${x + 6}" y2="${y - 18}" stroke="#a89468" stroke-width="1.5" />
    <line x1="${x - 12}" y1="${y - 12}" x2="${x + 10}" y2="${y - 12}" stroke="#a89468" stroke-width="1.5" />
    <text x="${x}" y="${y - 2}" font-size="14" font-weight="700" text-anchor="middle" fill="${GREEN}">${step}</text>
  `;
}

function computeLogPosts(positions) {
  const mid = (BAND.min + BAND.max) / 2;
  return positions.slice(0, -1).map((p, i) => {
    const side = p.x < mid ? 1 : -1;
    return { x: clamp(p.x + side * 85, BAND.min + 25, BAND.max - 25), y: p.y, step: i + 1 };
  });
}

function renderLogPosts(positions) {
  return computeLogPosts(positions)
    .map(({ x, y, step }) => renderLogPost(x, y, step))
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
      aria-label="A corner of Lab Archipelago's Field Station: a grassy research camp with a numbered logbook post at every stop counting up one step at a time, connecting every Lab Log lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${GRASS}" />
      <g>${renderTents(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GREEN}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.8" />
      <g>${renderLogPosts(positions)}</g>
    </svg>
  `;
}

export const fieldLogCampTheme = {
  trailBand: BAND,
  mapBg: GRASS,
  hintColor: "rgba(50, 65, 30, 0.78)",
  renderScene,
};
