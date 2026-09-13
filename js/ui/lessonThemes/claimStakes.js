// Function Fields' own theme for Study Skeptic, Scatter Banks' skill on
// evaluating statistical claims from observational studies and
// experiments (see lessonTerrain.js for the shared engine, and
// duneScatter.js's own header comment for why Scatter Banks' 7 skills
// each get a bespoke desert environment). A flat dotted with old mining
// claim stakes — the same pun the skill's own name invites: a
// statistical "claim" is exactly the kind of thing a prospector's paper
// claim also needs, and not every stake in the ground is trustworthy.
// Every stop plants two claim notices side by side, one sturdy and
// upright, one visibly crooked and cracked — the same "one real, one
// suspect, judge for yourself" contrast expeditionRoute.js's own
// real-tile/ghost-tile pair already uses for a different skill. The
// boss clearing is the old assay office. Every stake pair sits on the
// same fixed vertical band above `p` (see canyonRail.js's own header
// comment for why that, not an alternating one, is what keeps a new
// theme's own marker/boss clearance safe from the start).
import { COL_W, distanceToTrail, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };

const SKY_TOP = "#f2e6cc";
const SKY_BOTTOM = "#cb8f58";
const FLAT_FILL = "#dcb37a";
const GLOW = "#fff2d8";

const WOOD = "#8a6238";
const WOOD_DARK = "#4a331e";
const WOOD_CRACKED = "#6b4a2a";
const NOTICE = "#e8d9ae";
const NOTICE_DARK = "#a89268";
const INK = "#3a2c1c";

const ROCK = "#a4917a";
const ROCK_HILITE = "#c7b39a";
const SHRUB = "#7a9068";
const SHRUB_DARK = "#546848";

function defs() {
  return `
    <defs>
      <linearGradient id="claimStakesSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="claimStakesGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.5" />
        <stop offset="100%" stop-color="${GLOW}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

const FLAT_SPACING = 300;
const FLAT_CYCLE = [
  { fx: 0.2, rx: 280, ry: 55 },
  { fx: 0.8, rx: 300, ry: 60 },
  { fx: 0.5, rx: 260, ry: 50 },
];
function renderFlats(totalHeight) {
  const count = Math.max(FLAT_CYCLE.length, Math.round(totalHeight / FLAT_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const f = FLAT_CYCLE[i % FLAT_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<ellipse cx="${(f.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" rx="${f.rx}" ry="${f.ry}" fill="${FLAT_FILL}" opacity="0.5" />`;
  }).join("");
}

const GLOW_SPACING = 480;
const GLOW_CYCLE = [
  { fx: 0.28, r: 170 },
  { fx: 0.74, r: 150 },
];
function renderGlows(totalHeight) {
  const count = Math.max(GLOW_CYCLE.length, Math.round(totalHeight / GLOW_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const g = GLOW_CYCLE[i % GLOW_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<circle cx="${(g.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" r="${g.r}" fill="url(#claimStakesGlow)" />`;
  }).join("");
}

const CLUTTER_SPACING = 150;
const PATH_CLEARANCE = 20;
function renderPebble(x, y, scale) {
  const rx = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1.2).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.58).toFixed(1)}" fill="${ROCK}" stroke="${WOOD_DARK}" stroke-width="0.5" />
    <ellipse cx="${(x - rx * 0.25).toFixed(1)}" cy="${(y - rx * 0.15).toFixed(1)}" rx="${(rx * 0.4).toFixed(1)}" ry="${(rx * 0.22).toFixed(1)}" fill="${ROCK_HILITE}" opacity="0.75" />
  `;
}
function renderShrub(x, y, scale) {
  const r = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1).toFixed(1)}" rx="${(r * 0.9).toFixed(1)}" ry="2" fill="${SHRUB_DARK}" opacity="0.25" />
    <circle cx="${x.toFixed(1)}" cy="${(y - r * 0.5).toFixed(1)}" r="${r.toFixed(1)}" fill="${SHRUB}" opacity="0.85" />
    <circle cx="${(x - r * 0.6).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${(r * 0.6).toFixed(1)}" fill="${SHRUB}" opacity="0.8" />
  `;
}
function renderClutter(positions, totalHeight) {
  const count = Math.max(6, Math.round(totalHeight / CLUTTER_SPACING));
  const bossIdx = positions.length - 1;
  const items = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * totalHeight;
    const x = BAND.min + 20 + ((i * 61) % (BAND.max - BAND.min - 40));
    return { i, x, y };
  }).filter(
    ({ x, y }) =>
      positions.every((p, idx) => Math.hypot(x - p.x, y - p.y) >= (idx === bossIdx ? 100 : 55)) &&
      distanceToTrail(x, y, positions) >= PATH_CLEARANCE
  );

  return items
    .map(({ i, x, y }) => {
      const scale = 0.85 + ((i * 7) % 5) * 0.08;
      return i % 2 === 0 ? renderPebble(x, y, scale) : renderShrub(x, y, scale);
    })
    .join("");
}

// One sturdy, upright stake and one crooked, cracked one, side by side
// — both sit on the same fixed vertical band, CLEARANCE±SPAN above `p`
// (see canyonRail.js's own header comment for why that, not an
// alternating swing, is what keeps a new theme's own marker/boss
// clearance safe from the start). Which side (left/right) gets the
// sturdy stake alternates for variety, not the band itself.
const CLEARANCE = 66;
const SPAN = 14;
function renderStakePair(p, i) {
  const sturdyOnLeft = i % 2 === 0;
  const topY = p.y - (CLEARANCE + SPAN);
  const botY = p.y - (CLEARANCE - SPAN);
  const postH = botY - topY;

  const sturdy = (cx, tilt) => `
    <ellipse cx="${cx.toFixed(1)}" cy="${(botY + 3).toFixed(1)}" rx="7" ry="2.4" fill="${WOOD_DARK}" opacity="0.3" />
    <rect x="${(cx - 2.4).toFixed(1)}" y="${topY.toFixed(1)}" width="4.8" height="${postH.toFixed(1)}" rx="1" fill="${WOOD}" stroke="${WOOD_DARK}" stroke-width="0.8" transform="rotate(${tilt} ${cx.toFixed(1)} ${botY.toFixed(1)})" />
    <rect x="${(cx - 9).toFixed(1)}" y="${(topY + 3).toFixed(1)}" width="18" height="11" rx="1.2" fill="${NOTICE}" stroke="${NOTICE_DARK}" stroke-width="0.9" transform="rotate(${tilt} ${cx.toFixed(1)} ${botY.toFixed(1)})" />
    <line x1="${(cx - 6).toFixed(1)}" y1="${(topY + 6).toFixed(1)}" x2="${(cx + 6).toFixed(1)}" y2="${(topY + 6).toFixed(1)}" stroke="${INK}" stroke-width="0.8" opacity="0.7" transform="rotate(${tilt} ${cx.toFixed(1)} ${botY.toFixed(1)})" />
    <line x1="${(cx - 6).toFixed(1)}" y1="${(topY + 9).toFixed(1)}" x2="${(cx + 3).toFixed(1)}" y2="${(topY + 9).toFixed(1)}" stroke="${INK}" stroke-width="0.8" opacity="0.7" transform="rotate(${tilt} ${cx.toFixed(1)} ${botY.toFixed(1)})" />
  `;

  const crooked = (cx, tilt) => `
    <ellipse cx="${cx.toFixed(1)}" cy="${(botY + 3).toFixed(1)}" rx="7" ry="2.4" fill="${WOOD_DARK}" opacity="0.3" />
    <rect x="${(cx - 2.4).toFixed(1)}" y="${topY.toFixed(1)}" width="4.8" height="${postH.toFixed(1)}" rx="1" fill="${WOOD_CRACKED}" stroke="${WOOD_DARK}" stroke-width="0.8" transform="rotate(${tilt} ${cx.toFixed(1)} ${botY.toFixed(1)})" />
    <line x1="${(cx - 1).toFixed(1)}" y1="${(topY + postH * 0.3).toFixed(1)}" x2="${(cx + 1.5).toFixed(1)}" y2="${(topY + postH * 0.55).toFixed(1)}" stroke="${WOOD_DARK}" stroke-width="0.6" transform="rotate(${tilt} ${cx.toFixed(1)} ${botY.toFixed(1)})" />
    <rect x="${(cx - 9).toFixed(1)}" y="${(topY + 3).toFixed(1)}" width="18" height="11" rx="1.2" fill="${NOTICE}" stroke="${NOTICE_DARK}" stroke-width="0.9" opacity="0.75" transform="rotate(${tilt} ${cx.toFixed(1)} ${botY.toFixed(1)})" />
    <line x1="${(cx - 6).toFixed(1)}" y1="${(topY + 7).toFixed(1)}" x2="${(cx + 5).toFixed(1)}" y2="${(topY + 5).toFixed(1)}" stroke="${INK}" stroke-width="0.8" opacity="0.6" transform="rotate(${tilt} ${cx.toFixed(1)} ${botY.toFixed(1)})" />
  `;

  const leftX = p.x - 14;
  const rightX = p.x + 14;
  return sturdyOnLeft ? `${sturdy(leftX, -2)}${crooked(rightX, 11)}` : `${crooked(leftX, -13)}${sturdy(rightX, 3)}`;
}

function renderStakes(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderStakePair(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `
    <circle cx="${last.x}" cy="${last.y}" r="86" fill="#6b5636" stroke="${WOOD}" stroke-width="5" />
    <rect x="${(last.x - 52).toFixed(1)}" y="${(last.y - 30).toFixed(1)}" width="104" height="58" rx="3" fill="${WOOD}" stroke="${WOOD_DARK}" stroke-width="2.4" opacity="0.9" />
  `;
  const trailD = renderTrailPath(positions);

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A dusty flat in Function Fields' Scatter Banks dotted with old mining claim stakes: one sturdy, upright notice and one crooked, cracked one side by side at every stop, up to ${bossName}'s own weathered assay office">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#claimStakesSky)" />
      ${renderFlats(totalHeight)}
      ${renderGlows(totalHeight)}
      ${renderClutter(positions, totalHeight)}
      ${bossClearing}
      <path d="${trailD}" stroke="${WOOD_DARK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.35" />
      <path d="${trailD}" stroke="#c9a56a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" />
      <path d="${trailD}" stroke="#f3e2b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 9" fill="none" opacity="0.85" />
      <g>${renderStakes(positions)}</g>
    </svg>
  `;
}

export const claimStakesTheme = {
  trailBand: BAND,
  mapBg: SKY_TOP,
  hintColor: "rgba(58, 44, 28, 0.85)",
  renderScene,
};
