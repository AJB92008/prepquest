// Lexicon Shoals' own theme for Logical Order, the Scriptorium's third
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and tradeRoutes.js for this zone's own shared
// Cartographer's Table palette). Logical Order is about revising a
// sentence or paragraph's own order for the clearest logic, so every
// stop on this chart carries its own real waypoint number, in the one
// correct sequence — 1, 2, 3, all the way to the last stop before the
// champion's own destination — plus one smaller, fainter, struck-
// through "wrong" number floating just beside it: the discarded
// placement being corrected, not just a flag marking a place, the
// correction itself shown happening at every single stop.
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

// One compass rose at the very first stop, marking the expedition's own
// start the way an old chart marks its own point of departure.
function renderStartCompass(x, y) {
  return `
    <circle cx="${x}" cy="${(y - 46).toFixed(1)}" r="20" fill="none" stroke="${INK}" stroke-width="1.6" opacity="0.7" />
    <path d="M${x},${(y - 64).toFixed(1)} L${x},${(y - 28).toFixed(1)} M${(x - 18).toFixed(1)},${(y - 46).toFixed(1)} L${(x + 18).toFixed(1)},${(y - 46).toFixed(1)}" stroke="${INK}" stroke-width="1.2" opacity="0.7" />
    <circle cx="${x}" cy="${(y - 46).toFixed(1)}" r="3" fill="${GOLD_TRIM}" />
  `;
}

// The real numbered waypoint flag at this stop — the actual correct
// position in sequence, in solid ink on a small gold-trimmed pennant.
function renderRealFlag(x, y, number) {
  const top = y - 40;
  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${top.toFixed(1)}" stroke="${INK}" stroke-width="2.4" />
    <path d="M${x},${top.toFixed(1)} L${(x + 28).toFixed(1)},${(top + 8).toFixed(1)} L${x},${(top + 16).toFixed(1)} Z" fill="#f4e8c8" stroke="${GOLD_TRIM}" stroke-width="1.6" />
    <text x="${(x + 11).toFixed(1)}" y="${(top + 12).toFixed(1)}" font-size="11" font-weight="700" fill="${INK}" text-anchor="middle">${number}</text>
  `;
}

// The discarded "wrong" placement floating just beside the real flag —
// fainter, smaller, struck through — a revision actually shown, not
// just implied. Deterministic and always different from the real
// number: no shuffling or lookup table to keep in sync, just the next
// stop's own eventual number, arriving one stop too early.
function renderGhostNumber(x, y, ghostNumber) {
  const gx = x - 30;
  const gy = y + 6;
  return `
    <text x="${gx.toFixed(1)}" y="${gy.toFixed(1)}" font-size="13" fill="${WAX_RED}" opacity="0.55" text-anchor="middle">${ghostNumber}</text>
    <line x1="${(gx - 7).toFixed(1)}" y1="${(gy - 4).toFixed(1)}" x2="${(gx + 7).toFixed(1)}" y2="${(gy + 3).toFixed(1)}" stroke="${WAX_RED}" stroke-width="1.4" opacity="0.6" />
  `;
}

function renderWaypoints(positions) {
  const bossIndex = positions.length - 1;
  const stops = positions.filter((_, i) => i !== bossIndex);
  return stops
    .map((p, i) => {
      const real = i + 1;
      const ghost = i + 2;
      const start = i === 0 ? renderStartCompass(p.x, p.y) : "";
      return start + renderGhostNumber(p.x, p.y, ghost) + renderRealFlag(p.x, p.y, real);
    })
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
      aria-label="A corner of Lexicon Shoals' Scriptorium, spread out as a cartographer's chart: a numbered waypoint flag at every stop marking its own correct place in sequence, with the discarded wrong placement struck through just beside it, connecting every Logical Order lesson up to ${bossName}'s own marked destination">
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
