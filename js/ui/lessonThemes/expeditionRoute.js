// Lexicon Shoals' own theme for Logical Order, the Scriptorium's third
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and tradeRoutes.js for this zone's own shared
// Cartographer's Table palette). Logical Order is about revising a
// sentence or paragraph's own order for the clearest logic, so every
// stop on this chart shows a small brass waypoint tile turning into its
// own correct alignment: a faded, crooked "wrong" tile behind it, a
// curved arrow sweeping from that crooked angle to the real tile
// sitting square with the route — the correction itself shown
// happening, not implied. An earlier version of this file spelled the
// same idea out with literal sequence numbers (a real "1, 2, 3…" flag
// plus a struck-through "wrong" number beside it) — dropped after it
// read as visually confusing in the actual game: those numbers sat
// right where the game's own "Lesson 1/2/3" markers already are, so the
// scene carried two competing numbering systems in the same spot,
// louder than the graph. Turning geometry names the same "wrong,
// corrected" idea without ever touching a digit.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const PARCHMENT_TOP = "#ecdba8";
const PARCHMENT_BOTTOM = "#d3b478";
const INK = "#3b2b1f";
const INK_FAINT = "#6b5238";
const WAX_RED = "#9c3b2e";
const GOLD_TRIM = "#c9a24b";

function defs() {
  return `
    <defs>
      <linearGradient id="expeditionRouteParchment" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PARCHMENT_TOP}" />
        <stop offset="100%" stop-color="${PARCHMENT_BOTTOM}" />
      </linearGradient>
      <marker id="expeditionRouteArrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="${INK_FAINT}" opacity="0.8" />
      </marker>
    </defs>
  `;
}

function renderGrid(totalHeight) {
  const rowH = 90;
  const rows = Math.ceil(totalHeight / rowH) + 1;
  const lines = [];
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    lines.push(`<line x1="0" y1="${y}" x2="${COL_W}" y2="${y}" stroke="${INK_FAINT}" stroke-width="1" opacity="0.18" />`);
  }
  [0.22, 0.5, 0.78].forEach((f) => {
    const x = f * COL_W;
    lines.push(`<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${totalHeight}" stroke="${INK_FAINT}" stroke-width="1" opacity="0.15" />`);
  });
  return lines.join("");
}

function renderAgeSpots(totalHeight) {
  const spots = [
    { fx: 0.16, fy: 0.12, r: 30 },
    { fx: 0.84, fy: 0.34, r: 26 },
    { fx: 0.2, fy: 0.62, r: 32 },
    { fx: 0.8, fy: 0.9, r: 24 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.7).toFixed(1)}" fill="${INK_FAINT}" opacity="0.1" />`;
    })
    .join("");
}

// One small square waypoint tile with a single arrow-notch on its own
// "forward" edge — drawn upright (angle 0), the notch points straight
// down. `rotate(deg, x, y)` is what turns it crooked for the ghost copy
// below; the real copy always renders at literal angle 0, so "square
// with the chart" and "correct" are the same fact, not two facts a
// reader has to reconcile.
function renderTile(x, y, deg, { size, fill, stroke, opacity }) {
  const half = size / 2;
  const notch = size * 0.28;
  return `
    <g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${deg})" opacity="${opacity}">
      <rect x="${(-half).toFixed(1)}" y="${(-half).toFixed(1)}" width="${size}" height="${size}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" />
      <path d="M${(-notch / 2).toFixed(1)},${half.toFixed(1)} L0,${(half + notch).toFixed(1)} L${(notch / 2).toFixed(1)},${half.toFixed(1)} Z" fill="${stroke}" />
    </g>
  `;
}

// The curved turn itself — a dashed arc sweeping from the ghost tile's
// own position toward the real tile's, capped with an arrowhead so the
// motion reads as "became this," not just "near this." Pulled back
// `pullback` short of the real tile's own exact center rather than
// ending there: the actual clickable lesson-marker button (see
// renderLessonMarker in lessonTerrain.js) renders on top of this SVG at
// that same point — its circle alone is 23px in radius at desktop,
// 20px under the mobile breakpoint, plus a "Lesson N" label extending
// further below that — and an arrowhead landing under any of it would
// be invisible. 30px clears the circle at both sizes; if a later edit
// ever shrinks `pullback` back down, re-check against those two radii,
// not just eyeball it.
function renderTurnArc(fromX, fromY, toX, toY, bow, pullback = 30) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy) || 1;
  const endX = toX - (dx / dist) * pullback;
  const endY = toY - (dy / dist) * pullback;
  const mx = (fromX + endX) / 2 + bow;
  const my = (fromY + endY) / 2 - Math.abs(bow) * 0.4;
  return `<path d="M${fromX.toFixed(1)},${fromY.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}" stroke="${INK_FAINT}" stroke-width="1.6" fill="none" stroke-dasharray="3 4" opacity="0.6" marker-end="url(#expeditionRouteArrow)" />`;
}

// Ghost angle and offset side alternate stop to stop purely for visual
// variety — plain alternation, not a shared seed with anything else
// this file skips or selects, so there's no catalogDrift-style
// correlation risk here.
function renderTurningWaypoint(p, i) {
  const sign = i % 2 === 0 ? -1 : 1;
  const ghostDeg = sign * 36;
  const ghostX = p.x + sign * -30;
  const ghostY = p.y - 22;
  const ghost = renderTile(ghostX, ghostY, ghostDeg, { size: 18, fill: "#e8cfa0", stroke: WAX_RED, opacity: 0.55 });
  const arc = renderTurnArc(ghostX, ghostY, p.x, p.y, sign * -18);
  const real = renderTile(p.x, p.y, 0, { size: 24, fill: "#f4e8c8", stroke: GOLD_TRIM, opacity: 1 });
  return ghost + arc + real;
}

function renderWaypoints(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderTurningWaypoint(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `
    <circle cx="${last.x}" cy="${last.y}" r="86" fill="${PARCHMENT_BOTTOM}" stroke="${INK}" stroke-width="4" />
    <circle cx="${last.x}" cy="${last.y}" r="58" fill="none" stroke="${GOLD_TRIM}" stroke-width="3" />
    <path d="M${(last.x - 14).toFixed(1)},${(last.y - 14).toFixed(1)} L${(last.x + 14).toFixed(1)},${(last.y + 14).toFixed(1)} M${(last.x + 14).toFixed(1)},${(last.y - 14).toFixed(1)} L${(last.x - 14).toFixed(1)},${(last.y + 14).toFixed(1)}" stroke="${GOLD_TRIM}" stroke-width="3" />
  `;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Scriptorium, spread out as a cartographer's chart: a small brass waypoint tile turning square with the route at every stop, a faded crooked tile behind it showing the wrong placement it was corrected from, connecting every Logical Order lesson up to ${bossName}'s own marked destination">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#expeditionRouteParchment)" />
      <g>${renderAgeSpots(totalHeight)}</g>
      <g>${renderGrid(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 8" fill="none" opacity="0.85" />
      <g>${renderWaypoints(positions)}</g>
    </svg>
  `;
}

export const expeditionRouteTheme = {
  trailBand: BAND,
  mapBg: PARCHMENT_TOP,
  hintColor: "rgba(59, 43, 31, 0.8)",
  renderScene,
};
