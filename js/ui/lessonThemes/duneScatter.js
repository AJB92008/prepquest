// Function Fields' own theme for Scatter Scout, Scatter Banks' skill on
// two-variable data and scatterplots (see lessonTerrain.js for the
// shared engine every lesson-path theme renders through, and
// satMathHub.js's own ZONES for Scatter Banks itself, sat-math's
// Problem-Solving & Data Analysis zone). This is the zone's first real
// lesson-path theme, and per direct instruction it opens Scatter Banks'
// own desert visual language with a bespoke environment per skill
// (dunes/mesa palette shared as a family resemblance, not one identical
// backdrop reused 7 times the way Curve Reach's "Rolling Curve" family
// ties its own 3 skills together — see curveArc.js's own header
// comment for why that shared-backdrop approach read poorly for 2 of
// Curve Reach's own 3 skills once their own content didn't fit it).
//
// Full visual cleanup per direct feedback: the walkable trail used to
// carry a dashed cream center-stripe that read as a literal highway,
// competing with the per-stop scatter-of-stones-and-trend-line for
// "which one is the actual route" — the trail is now the one clear
// route (a plain two-tone dirt trail, no center dash, plus a soft teal
// underglow so it still reads as special against the sand) and the
// scatter-of-stones is demoted to quiet background scenery: drawn
// *behind* the trail, at reduced opacity, and recolored from a brown
// "twig" to a muted teal mineral-vein streak (a dried-up trace of the
// oasis water below) rather than a second foreground line competing
// with the path. The teal itself is the zone's one secondary accent
// color, tying the boss's own oasis into the rest of the scene instead
// of leaving the whole palette flat brown/tan.
import { COL_W, distanceToTrail, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };

const SAND_TOP = "#fbe9c9";
const SAND_BOTTOM = "#dc9a52";
const MESA_FILL = "#c9754a";
const GLOW = "#fff3d6";
const GLOW_TEAL = "#cdeee7";

const STONE = "#a8927a";
const STONE_DARK = "#6b5642";
const STONE_HILITE = "#d8c7ac";
const TREND = "#4a8a86";
const TREND_DARK = "#2e5f5c";
const CACTUS = "#5c8a52";
const CACTUS_DARK = "#3d6238";
const BONE = "#e8dcc0";
const BONE_HILITE = "#fff8ea";
const TUMBLEWEED = "#8a7248";

// The walkable trail's own palette — a neutral packed-dirt brown/tan,
// distinct from both the warm orange sand gradient and the terracotta
// mesa silhouettes so it still reads as "the path" against either. No
// dashed center stripe (that read as a literal highway) — a soft teal
// underglow (this zone's own secondary accent, tied to the oasis) gives
// it presence instead.
const PATH_BASE = "#5c4630";
const PATH_MID = "#9c7a4e";

const OASIS_FILL = "#2f7d78";
const OASIS_RING = "#8fd9c4";

function defs() {
  return `
    <defs>
      <linearGradient id="duneScatterSand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SAND_TOP}" />
        <stop offset="100%" stop-color="${SAND_BOTTOM}" />
      </linearGradient>
      <radialGradient id="duneScatterGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.55" />
        <stop offset="100%" stop-color="${GLOW}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="duneScatterGlowTeal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GLOW_TEAL}" stop-opacity="0.5" />
        <stop offset="100%" stop-color="${GLOW_TEAL}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

// Big mesa/butte silhouettes down the whole scene, the same role
// curveArc.js's own rolling hills play for Curve Reach — spaced by real
// height (not a fixed handful of fractional spots) so the landscape
// keeps reading as desert country at this zone's own tallest real
// lesson counts, not just at a short preview.
const MESA_SPACING = 340;
const MESA_CYCLE = [
  { fx: 0.15, rx: 240, ry: 75 },
  { fx: 0.85, rx: 260, ry: 80 },
  { fx: 0.5, rx: 230, ry: 70 },
  { fx: -0.05, rx: 250, ry: 78 },
  { fx: 1.05, rx: 245, ry: 76 },
];
function renderMesas(totalHeight) {
  const count = Math.max(MESA_CYCLE.length, Math.round(totalHeight / MESA_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const m = MESA_CYCLE[i % MESA_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<ellipse cx="${(m.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" rx="${m.rx}" ry="${m.ry}" fill="${MESA_FILL}" opacity="0.35" />`;
  }).join("");
}

// Soft sun-glow patches standing in for desert heat haze — same role
// (and same "big enough it needs no per-stop clearance check")
// rootSystem.js's own dappled-light spots play for its forest. One in
// three is tinted with this zone's own teal accent instead of warm
// cream, a faint hint of the oasis' own presence before the trail
// actually reaches it.
const GLOW_SPACING = 480;
const GLOW_CYCLE = [
  { fx: 0.25, r: 170, teal: false },
  { fx: 0.75, r: 150, teal: true },
  { fx: 0.5, r: 190, teal: false },
];
function renderGlows(totalHeight) {
  const count = Math.max(GLOW_CYCLE.length, Math.round(totalHeight / GLOW_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const g = GLOW_CYCLE[i % GLOW_CYCLE.length];
    const cx = g.fx * COL_W;
    const cy = ((i + 0.5) / count) * totalHeight;
    const fill = g.teal ? "url(#duneScatterGlowTeal)" : "url(#duneScatterGlow)";
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${g.r}" fill="${fill}" />`;
  }).join("");
}

// Ground clutter cycling 3 desert shapes — a saguaro cactus, a
// sun-bleached stone, and a loose tumbleweed — each with its own
// size/rotation jitter (deterministic, seeded off `i`, no Math.random),
// skipped outright wherever it would land on top of a real stop or the
// boss clearing (same guard rootSystem.js's own clutter uses).
const CLUTTER_SPACING = 150;
const PATH_CLEARANCE = 20;
function renderCactus(x, y, scale) {
  const h = 22 * scale;
  const w = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 2).toFixed(1)}" rx="${(w * 1.3).toFixed(1)}" ry="2.2" fill="${CACTUS_DARK}" opacity="0.25" />
    <rect x="${(x - w / 2).toFixed(1)}" y="${(y - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(w / 2).toFixed(1)}" fill="${CACTUS}" stroke="${CACTUS_DARK}" stroke-width="0.8" />
    <ellipse cx="${(x - w * 1.1).toFixed(1)}" cy="${(y - h * 0.58).toFixed(1)}" rx="${(w * 0.55).toFixed(1)}" ry="${(w * 1.1).toFixed(1)}" fill="${CACTUS}" stroke="${CACTUS_DARK}" stroke-width="0.7" />
    <ellipse cx="${(x + w * 1.15).toFixed(1)}" cy="${(y - h * 0.72).toFixed(1)}" rx="${(w * 0.5).toFixed(1)}" ry="${(w * 0.95).toFixed(1)}" fill="${CACTUS}" stroke="${CACTUS_DARK}" stroke-width="0.7" />
  `;
}
function renderBoneStone(x, y, scale) {
  const rx = 8 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1.5).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.55).toFixed(1)}" fill="${BONE}" stroke="${STONE_DARK}" stroke-width="0.6" opacity="0.85" />
    <ellipse cx="${(x - rx * 0.3).toFixed(1)}" cy="${(y - rx * 0.18).toFixed(1)}" rx="${(rx * 0.4).toFixed(1)}" ry="${(rx * 0.22).toFixed(1)}" fill="${BONE_HILITE}" opacity="0.7" />
  `;
}
function renderTumbleweed(x, y, scale, seed) {
  const r = 8 * scale;
  const lines = [0, 60, 120]
    .map((deg) => {
      const rad = ((deg + (seed % 30)) * Math.PI) / 180;
      const dx = Math.cos(rad) * r;
      const dy = Math.sin(rad) * r;
      return `<line x1="${(x - dx).toFixed(1)}" y1="${(y - dy).toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}" stroke="${TUMBLEWEED}" stroke-width="1.2" opacity="0.6" />`;
    })
    .join("");
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${TUMBLEWEED}" stroke-width="1.4" opacity="0.55" />${lines}`;
}
function renderClutter(positions, totalHeight) {
  const count = Math.max(6, Math.round(totalHeight / CLUTTER_SPACING));
  const bossIdx = positions.length - 1;
  const items = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * totalHeight;
    const x = BAND.min + 22 + ((i * 83) % (BAND.max - BAND.min - 44));
    return { i, x, y };
  }).filter(
    ({ x, y }) =>
      positions.every((p, idx) => Math.hypot(x - p.x, y - p.y) >= (idx === bossIdx ? 100 : 55)) &&
      distanceToTrail(x, y, positions) >= PATH_CLEARANCE
  );

  return items
    .map(({ i, x, y }) => {
      const kind = i % 3;
      const scale = 0.85 + ((i * 7) % 5) * 0.08;
      if (kind === 0) return renderCactus(x, y, scale);
      if (kind === 1) return renderBoneStone(x, y, scale);
      return renderTumbleweed(x, y, scale, i * 17);
    })
    .join("");
}

// The scatter's own trend line sits on a baseline `CLEARANCE` above
// `p`, tilting by `SLOPE` either way. This has TWO real clearance
// constraints, not one: the close endpoint (baseline+SLOPE, whichever
// side depending on rising/falling) has to clear *this stop's own*
// marker, but the far endpoint (baseline-SLOPE) sits only
// ROW_H(140)-CLEARANCE-SLOPE away from the *previous* stop's own
// marker one row up — a real cross-row mistake this file's own first
// draft actually made (CLEARANCE=82/SLOPE=20 put the far side only 38
// units from the row above, well inside the ~38-unit marker radius
// once jitter and stone radius ate into it further; caught by
// tests/allLessonThemesSweep.test.js's own direct sweep at lesson count
// 50, not by eye — same category of bug curveArc.js's own header
// comment describes for its own valley-vertex margin). CLEARANCE=68/
// SLOPE=15, together with a smaller jitter (±3) and stone radius (max
// 4), clears both: the close side by a real ~8 units and the far side
// by a real ~12, both past the ≈38-unit marker radius (see
// equationScale.js's own header comment for that arithmetic).
const CLEARANCE = 68;
const SLOPE = 15;
const HALF_W = 55;
function renderScatterStop(p, i) {
  const rising = i % 2 === 0;
  const baseline = p.y - CLEARANCE;
  const leftY = rising ? baseline + SLOPE : baseline - SLOPE;
  const rightY = rising ? baseline - SLOPE : baseline + SLOPE;
  const x0 = p.x - HALF_W;
  const x1 = p.x + HALF_W;

  const stones = Array.from({ length: 5 }, (_, j) => {
    const t = (j + 0.5) / 5;
    const sx = x0 + (x1 - x0) * t;
    const perp = ((i * 31 + j * 17) % 7) - 3;
    const sy = leftY + (rightY - leftY) * t + perp;
    const r = 3 + ((i * 13 + j * 7) % 3) * 0.5;
    return `
      <ellipse cx="${sx.toFixed(1)}" cy="${(sy + 1).toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.55).toFixed(1)}" fill="${STONE_DARK}" opacity="0.25" />
      <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${r.toFixed(1)}" fill="${STONE}" stroke="${STONE_DARK}" stroke-width="0.8" />
      <circle cx="${(sx - r * 0.3).toFixed(1)}" cy="${(sy - r * 0.3).toFixed(1)}" r="${(r * 0.32).toFixed(1)}" fill="${STONE_HILITE}" opacity="0.8" />
    `;
  }).join("");

  return `
    <path d="M${x0.toFixed(1)},${leftY.toFixed(1)} L${x1.toFixed(1)},${rightY.toFixed(1)}" stroke="${TREND}" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    <path d="M${x0.toFixed(1)},${leftY.toFixed(1)} L${x1.toFixed(1)},${rightY.toFixed(1)}" stroke="${TREND_DARK}" stroke-width="1" stroke-linecap="round" opacity="0.35" />
    ${stones}
  `;
}

// Wrapped at reduced opacity as one group — this is background scenery
// now (a trace of the trend the trail itself is walking), not a second
// foreground feature meant to compete with the route for attention.
function renderScatters(positions) {
  const bossIndex = positions.length - 1;
  const stops = positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderScatterStop(p, i))
    .join("");
  return `<g opacity="0.55">${stops}</g>`;
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${OASIS_FILL}" stroke="${OASIS_RING}" stroke-width="5" />`;
  const trailD = renderTrailPath(positions);

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A sun-baked corner of Function Fields' Scatter Banks: a clear dirt trail with a teal glow, past cacti, sun-bleached stones, tumbleweed, and a faint scatter of stones tracing a trend in the background at every stop, up to ${bossName}'s own desert oasis">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#duneScatterSand)" />
      ${renderMesas(totalHeight)}
      ${renderGlows(totalHeight)}
      ${renderClutter(positions, totalHeight)}
      ${renderScatters(positions)}
      ${bossClearing}
      <path d="${trailD}" stroke="${OASIS_RING}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.22" />
      <path d="${trailD}" stroke="${PATH_BASE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.5" />
      <path d="${trailD}" stroke="${PATH_MID}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" />
    </svg>
  `;
}

export const duneScatterTheme = {
  trailBand: BAND,
  mapBg: SAND_TOP,
  hintColor: "rgba(90, 58, 34, 0.85)",
  renderScene,
};
