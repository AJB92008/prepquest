// Variable Vault's own theme (see lessonTerrain.js for the shared
// engine every lesson-path theme renders through) — Field Station's own
// grassy research camp, shared with fieldLogCamp.js (Lab Log,
// sc-research's own theme, same zone — see scienceHub.js's own ZONES),
// themed around a fenced test plot at every stop holding two sprouts
// side by side: one plain "control" sitting in shade, one
// taller/differently colored "variable" sitting under its own sun lamp
// — the lamp is the actual independent variable causing the difference,
// not just two sprouts that happen to differ, which is what an earlier
// version of this file showed.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 70, max: COL_W - 70 };
const GRASS = "#d9e4c8";
const GREEN = "#6f9a52";

function renderSproutSmall(x, y, tall, color) {
  const h = tall ? 28 : 16;
  return `
    <path d="M${x},${y} Q${(x + (tall ? 5 : -3)).toFixed(1)},${(y - h * 0.6).toFixed(1)} ${x},${(y - h).toFixed(1)}" stroke="#4a7a3a" stroke-width="2" fill="none" />
    <path d="M${x},${(y - h * 0.6).toFixed(1)} Q${(x - 8).toFixed(1)},${(y - h * 0.7).toFixed(1)} ${(x - 2).toFixed(1)},${(y - h * 0.9).toFixed(1)} Z" fill="${color}" />
    <path d="M${x},${(y - h * 0.4).toFixed(1)} Q${(x + 8).toFixed(1)},${(y - h * 0.5).toFixed(1)} ${(x + 2).toFixed(1)},${(y - h * 0.7).toFixed(1)} Z" fill="${color}" />
  `;
}

// A small sun lamp shining down — the independent variable itself,
// drawn as the actual light source rather than left implied.
function renderSunLamp(x, y) {
  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 20}" stroke="#8a8fae" stroke-width="2" />
    <circle cx="${x}" cy="${y - 24}" r="6" fill="#ffe9a8" stroke="#e0b84f" stroke-width="1.5" />
    <line x1="${(x - 9).toFixed(1)}" y1="${(y - 28).toFixed(1)}" x2="${(x - 13).toFixed(1)}" y2="${(y - 32).toFixed(1)}" stroke="#ffe9a8" stroke-width="1.5" opacity="0.85" />
    <line x1="${(x + 9).toFixed(1)}" y1="${(y - 28).toFixed(1)}" x2="${(x + 13).toFixed(1)}" y2="${(y - 32).toFixed(1)}" stroke="#ffe9a8" stroke-width="1.5" opacity="0.85" />
    <line x1="${x}" y1="${(y - 30).toFixed(1)}" x2="${x}" y2="${(y - 35).toFixed(1)}" stroke="#ffe9a8" stroke-width="1.5" opacity="0.85" />
    <path d="M${(x - 4).toFixed(1)},${(y - 18).toFixed(1)} L${(x - 8).toFixed(1)},${(y + 4).toFixed(1)} M${(x + 4).toFixed(1)},${(y - 18).toFixed(1)} L${(x + 8).toFixed(1)},${(y + 4).toFixed(1)}" stroke="#ffe9a8" stroke-width="1" opacity="0.5" />
  `;
}

// A small shade cloth over the control sprout — the deliberate absence
// of the variable, drawn just as explicitly as the lamp is.
function renderShadeCloth(x, y) {
  return `
    <line x1="${(x - 10).toFixed(1)}" y1="${y}" x2="${(x - 10).toFixed(1)}" y2="${(y - 16).toFixed(1)}" stroke="#8a8fae" stroke-width="1.6" />
    <line x1="${(x + 10).toFixed(1)}" y1="${y}" x2="${(x + 10).toFixed(1)}" y2="${(y - 16).toFixed(1)}" stroke="#8a8fae" stroke-width="1.6" />
    <rect x="${(x - 13).toFixed(1)}" y="${(y - 20).toFixed(1)}" width="26" height="6" rx="2" fill="#6f7a8a" opacity="0.85" />
    <ellipse cx="${x}" cy="${y}" rx="14" ry="5" fill="rgba(30,30,30,0.12)" />
  `;
}

// A small fenced plot holding one plain "control" sprout in shade and
// one taller, differently-colored "variable" sprout under its own lamp
// — the comparison, and its own cause, side by side.
function renderTestPlot(x, y) {
  return `
    <ellipse cx="${x}" cy="${y + 22}" rx="32" ry="7" fill="rgba(20,40,10,0.14)" />
    <rect x="${x - 30}" y="${y - 14}" width="60" height="34" fill="none" stroke="#a89468" stroke-width="2.5" stroke-dasharray="4 3" />
    ${renderShadeCloth(x - 13, y - 2)}
    ${renderSproutSmall(x - 13, y + 18, false, "#7fbf60")}
    ${renderSunLamp(x + 13, y - 2)}
    ${renderSproutSmall(x + 13, y + 18, true, "#e08a4a")}
  `;
}

function computePlots(positions) {
  const mid = (BAND.min + BAND.max) / 2;
  return positions.slice(0, -1).map((p) => {
    const side = p.x < mid ? 1 : -1;
    return { x: clamp(p.x + side * 90, BAND.min + 32, BAND.max - 32), y: p.y };
  });
}

function renderPlots(positions) {
  return computePlots(positions)
    .map(({ x, y }) => renderTestPlot(x, y))
    .join("");
}

function renderPetriDishSmall(x, y, seed) {
  const colonyColor = ["#8fd0a0", "#e0a860", "#c98fb8"][seed % 3];
  return `
    <ellipse cx="${x}" cy="${y + 8}" rx="15" ry="5" fill="rgba(20,40,10,0.14)" />
    <ellipse cx="${x}" cy="${y}" rx="15" ry="7" fill="#eef2ee" stroke="#b8c0c4" stroke-width="1.5" />
    <circle cx="${(x - 3).toFixed(1)}" cy="${(y - 1).toFixed(1)}" r="2.8" fill="${colonyColor}" opacity="0.85" />
  `;
}

function renderDishes(totalHeight) {
  const count = Math.max(4, Math.round(totalHeight / 480));
  return Array.from({ length: count }, (_, i) => {
    const x = i % 2 === 0 ? BAND.min - 32 : BAND.max + 32;
    const y = ((i + 0.5) / count) * totalHeight;
    return renderPetriDishSmall(clamp(x, 24, COL_W - 24), y, i);
  }).join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#f4ecd8" stroke="${GREEN}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lab Archipelago's Field Station: a grassy research camp with a fenced test plot at every stop holding a shaded control sprout beside a taller variable one growing under its own sun lamp, connecting every Variable Vault lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${GRASS}" />
      <g>${renderDishes(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GREEN}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.8" />
      <g>${renderPlots(positions)}</g>
    </svg>
  `;
}

export const variableVaultPlotsTheme = {
  trailBand: BAND,
  mapBg: GRASS,
  hintColor: "rgba(50, 65, 30, 0.78)",
  renderScene,
};
