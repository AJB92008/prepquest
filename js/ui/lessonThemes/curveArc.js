// Function Fields' own theme for Curve Shaper, Curve Reach's first
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and satMathHub.js's own header comment for
// this hub's own graph/grid visual language — Curve Reach's own island
// icon is already a smooth arc with its own vertex marked). Rather than
// continue Slope Fields' own flat "Graph Paper" family, Curve Reach
// starts its own "Rolling Curve" family: a landscape actually built out
// of curves — soft rolling-hill silhouettes and a tiled wave pattern
// standing in for straight grid lines and flat paper — since a zone
// about nonlinear, curved functions reads better sitting IN curved
// terrain than laid flat on a diagram. Curve Shaper is about analyzing
// quadratics and exponentials, so every stop plants a real parabola arc
// with its own vertex marked — alternating a hill (opens down, vertex
// on top) and a valley (opens up, vertex lower) stop to stop, echoing
// the rolling terrain itself rather than one fixed shape repeated.
import { COL_W, distanceToTrail, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const PAPER_TOP = "#f2faf6";
const PAPER_BOTTOM = "#cdeee2";
const WAVE_LINE = "#9fd6c4";
const WAVE_LINE_BOLD = "#6fb9a4";
const HILL_FILL = "#bfe6d8";
const INK = "#1f4a42";
const ACCENT = "#4f9e8f";
const BOSS_FILL = "#153b34";

// The walkable trail's own warm palette — deliberately outside the
// scene's cool teal/mint family (paper, waves, hills, watermark, and
// every per-stop parabola arc all sit in that family) so the path reads
// as its own distinct thing rather than just another dark curved line
// doing double duty as both ground and decoration.
const PATH_BASE = "#a8763a";
const PATH_MID = "#e0a94f";
const PATH_HILITE = "#f6dfa0";

// Ground clutter's own palette: pebbles/grass echo the rolling-hill
// silhouettes, bubbles echo the tiled wave pattern — this zone's own
// two motifs, not a copy of another zone's forest floor.
const PEBBLE = "#9db8ab";
const PEBBLE_HILITE = "#cfe3da";
const GRASS = "#5fa88f";
const BUBBLE_LINE = "#bfe3d6";
const BUBBLE_HILITE = "#f2fbf7";

function defs() {
  return `
    <defs>
      <linearGradient id="curveArcPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PAPER_TOP}" />
        <stop offset="100%" stop-color="${PAPER_BOTTOM}" />
      </linearGradient>
      <pattern id="curveArcWave" width="140" height="70" patternUnits="userSpaceOnUse">
        <path d="M0,35 Q35,5 70,35 T140,35" fill="none" stroke="${WAVE_LINE}" stroke-width="2" />
      </pattern>
    </defs>
  `;
}

// Soft rolling-hill silhouettes down the whole scene — this is what
// makes the landscape itself read as curved, not just a flat backdrop
// with curve diagrams pinned on top of it. Spaced by real height
// (HILL_SPACING, ~2.3 rows apart) rather than a fixed handful of
// fractional positions the way windwardBough.js's own dappled-light
// spots are: a fixed count stretched across the WHOLE height reads
// fine at the short counts this was first checked at, but at this
// zone's own real lesson counts (up to 50, a scene 5x taller than the
// count-10 preview this was first eyeballed against) six fixed spots
// spread that thin leave most of the path as bare wave-pattern paper,
// not rolling hills. The tiled wave pattern in `defs()` still covers
// "curves everywhere" at any height regardless (a `<pattern>` tiles
// forever); these bigger, slower shapes are what sells an actual
// landscape underneath it, and only work doing that if their own
// spacing holds steady as the scene gets taller.
const HILL_SPACING = 320;
const HILL_CYCLE = [
  { fx: 0.5, rx: 220, ry: 70 },
  { fx: -0.1, rx: 260, ry: 85 },
  { fx: 1.05, rx: 250, ry: 80 },
  { fx: 0.15, rx: 230, ry: 75 },
  { fx: 0.9, rx: 260, ry: 85 },
  { fx: 0.4, rx: 240, ry: 78 },
];
function renderHills(totalHeight) {
  const count = Math.max(HILL_CYCLE.length, Math.round(totalHeight / HILL_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const h = HILL_CYCLE[i % HILL_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    return `<ellipse cx="${(h.fx * COL_W).toFixed(1)}" cy="${cy.toFixed(1)}" rx="${h.rx}" ry="${h.ry}" fill="${HILL_FILL}" opacity="0.4" />`;
  }).join("");
}

// One big, faint arc behind everything else — Curve Reach's own recurring
// "rolling landscape" landmark, the same role Slope Fields' axis-cross
// watermark plays for its own zone, but built from the hub's own curve
// motif instead of a grid cross.
function renderArcWatermark(totalHeight) {
  const cx = COL_W / 2;
  const cy = totalHeight / 2;
  const halfW = COL_W * 0.42;
  const depth = Math.min(totalHeight * 0.18, 170);
  const y0 = cy + depth * 0.5;
  const vertexY = cy - depth * 0.5;
  const ctrlY = 2 * vertexY - y0;
  return `<path d="M${(cx - halfW).toFixed(1)},${y0.toFixed(1)} Q${cx.toFixed(1)},${ctrlY.toFixed(1)} ${(cx + halfW).toFixed(1)},${y0.toFixed(1)}" fill="none" stroke="${WAVE_LINE_BOLD}" stroke-width="3" opacity="0.3" />`;
}

// Ground clutter scattered across the whole scene — smooth pebbles and
// grass tufts echo the rolling-hill silhouettes, small drifting bubbles
// echo the tiled wave pattern, so the sprinkle reads as this zone's own
// material rather than borrowing Root Finder's forest floor. Cycles 3
// shapes with their own size/rotation jitter (deterministic, seeded off
// `i`, no Math.random — same convention rootSystem.js's own clutter
// uses), and is skipped outright wherever it would land on top of a
// real stop or the boss clearing rather than trusting placement math
// alone to stay clear (same guard rootSystem.js's own clutter uses).
const CLUTTER_SPACING = 150;
const PATH_CLEARANCE = 20;
function renderPebble(x, y, scale) {
  const rx = 6 * scale;
  return `
    <ellipse cx="${x.toFixed(1)}" cy="${(y + 1.2).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.6).toFixed(1)}" fill="${PEBBLE}" stroke="${INK}" stroke-width="0.6" opacity="0.7" />
    <ellipse cx="${(x - rx * 0.25).toFixed(1)}" cy="${(y - rx * 0.15).toFixed(1)}" rx="${(rx * 0.42).toFixed(1)}" ry="${(rx * 0.24).toFixed(1)}" fill="${PEBBLE_HILITE}" opacity="0.75" />
  `;
}
function renderGrassTuft(x, y, scale, rot) {
  const blades = [-13, -4, 5, 14];
  return blades
    .map((deg) => {
      const rad = ((deg + rot) * Math.PI) / 180;
      const len = 11 * scale;
      const ex = x + Math.sin(rad) * len;
      const ey = y - Math.cos(rad) * len;
      return `<path d="M${x.toFixed(1)},${y.toFixed(1)} Q${(x + Math.sin(rad) * len * 0.5).toFixed(1)},${(y - Math.cos(rad) * len * 0.6).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" stroke="${GRASS}" stroke-width="2" fill="none" stroke-linecap="round" />`;
    })
    .join("");
}
function renderBubble(x, y, scale) {
  const r = 5 * scale;
  return `
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${BUBBLE_LINE}" stroke-width="1.4" opacity="0.6" />
    <circle cx="${(x - r * 0.32).toFixed(1)}" cy="${(y - r * 0.32).toFixed(1)}" r="${(r * 0.28).toFixed(1)}" fill="${BUBBLE_HILITE}" opacity="0.85" />
  `;
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
      if (kind === 0) return renderPebble(x, y, scale);
      if (kind === 1) return renderGrassTuft(x, y, scale, ((i * 31) % 20) - 10);
      return renderBubble(x, y, scale);
    })
    .join("");
}

// The arc's own two endpoints sit on a baseline `CLEARANCE` above `p`
// (never below it, regardless of hill/valley) — the same real mobile-
// scale marker-radius reasoning every Function Fields file already
// carries (see equationScale.js's own header comment for the ≈38-unit
// arithmetic): a hill's own vertex swings further up (safe, moving away
// from `p`), but a valley's vertex swings back down toward the
// baseline, and if the baseline itself weren't clear of the marker by
// more than DEPTH plus the vertex dot's own radius, a valley's vertex
// would land back on top of the button — an early draft here (70/25,
// leaving only 2.7 local units of real margin once the dot's own 4.5-
// unit radius is subtracted) made exactly that mistake, caught by a
// direct sweep rather than by eye. CLEARANCE (78) minus DEPTH (25)
// leaves the valley's own vertex, dot radius included, clearing the
// ≈38-unit marker radius by a real 10.7 local units — swept across
// every real lesson count, not a hand estimate. Keeping the whole arc
// on one fixed side of `p` (always above, never alternating toward the
// boss clearing one row below) is also what keeps this file boss-safe
// unconditionally, without needing the near-boss special-casing
// crossingLines.js/boundaryLine.js required — see tests/
// curveReachLessonThemes.test.js's own dedicated sweep for both checks.
const CLEARANCE = 78;
const DEPTH = 25;
const HALF_W = 58;
function renderCurveStop(p, i) {
  const hill = i % 2 === 0;
  const baseline = p.y - CLEARANCE;
  const vertexY = hill ? baseline - DEPTH : baseline + DEPTH;
  const x0 = p.x - HALF_W;
  const x1 = p.x + HALF_W;
  const ctrlY = 2 * vertexY - baseline;
  return `
    <ellipse cx="${p.x.toFixed(1)}" cy="${(vertexY + 4).toFixed(1)}" rx="14" ry="5" fill="${BOSS_FILL}" opacity="0.35" />
    <path d="M${x0.toFixed(1)},${baseline.toFixed(1)} Q${p.x.toFixed(1)},${ctrlY.toFixed(1)} ${x1.toFixed(1)},${baseline.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" />
    <circle cx="${p.x.toFixed(1)}" cy="${vertexY.toFixed(1)}" r="4.5" fill="${INK}" />
  `;
}

function renderCurves(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderCurveStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${ACCENT}" stroke-width="4" />`;
  const trailD = renderTrailPath(positions);

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Curve Reach, its own rolling curved landscape: a sandy trail past pebbles, grass, and drifting bubbles, with a real parabola arc at every stop with its own marked vertex, alternating a hill and a valley, connecting every Curve Shaper lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#curveArcPaper)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#curveArcWave)" opacity="0.6" />
      ${renderHills(totalHeight)}
      ${renderArcWatermark(totalHeight)}
      ${renderClutter(positions, totalHeight)}
      ${bossClearing}
      <path d="${trailD}" stroke="${PATH_BASE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.5" />
      <path d="${trailD}" stroke="${PATH_MID}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1" />
      <path d="${trailD}" stroke="${PATH_HILITE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 9" fill="none" opacity="0.85" />
      <g>${renderCurves(positions)}</g>
    </svg>
  `;
}

export const curveArcTheme = {
  trailBand: BAND,
  mapBg: PAPER_TOP,
  hintColor: "rgba(31, 74, 66, 0.8)",
  renderScene,
};
