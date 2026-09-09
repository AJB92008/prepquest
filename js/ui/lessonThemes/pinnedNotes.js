// Lexicon Shoals' own theme for Bullet Point Builder, the Scriptorium's
// second skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through, and tradeRoutes.js for this zone's
// own shared Cartographer's Table palette). Bullet Point Builder is
// about combining several separate notes into one sentence that meets a
// specific rhetorical goal, so every stop on this chart shows exactly
// that happening: 2 or 3 loose, torn note-scraps — each its own ragged
// scrap of parchment with a scratch of handwriting on it — pinned
// together and bound by one ribbon into a single sealed note. The
// scraps' own count and rough position vary stop to stop; the "several
// things becoming one" shape never does.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const PARCHMENT_TOP = "#ecdba8";
const PARCHMENT_BOTTOM = "#d3b478";
const INK = "#3b2b1f";
const INK_FAINT = "#6b5238";
const WAX_RED = "#9c3b2e";
const WAX_RED_DARK = "#742a20";
const GOLD_TRIM = "#c9a24b";
const SCRAP_FILLS = ["#f4e8c8", "#eddcb0", "#f7efd6"];

function defs() {
  return `
    <defs>
      <linearGradient id="pinnedNotesParchment" x1="0" y1="0" x2="0" y2="1">
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
    { fx: 0.18, fy: 0.1, r: 28 },
    { fx: 0.82, fy: 0.3, r: 32 },
    { fx: 0.24, fy: 0.58, r: 26 },
    { fx: 0.78, fy: 0.78, r: 30 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.7).toFixed(1)}" fill="${INK_FAINT}" opacity="0.1" />`;
    })
    .join("");
}

// One torn scrap of parchment, rotated, with a few short ink scratches
// standing in for handwriting — a jagged (not rectangular) outline so it
// reads as torn from something larger rather than a clean printed card.
function renderScrap(cx, cy, angle, fillIndex) {
  const w = 30;
  const h = 22;
  const jag = 3;
  const corners = [
    [-w / 2, -h / 2],
    [w / 2 - jag, -h / 2 + jag],
    [w / 2, h / 2],
    [-w / 2 + jag, h / 2 - jag],
  ];
  const rad = (angle * Math.PI) / 180;
  const pts = corners
    .map(([x, y]) => {
      const rx = cx + (x * Math.cos(rad) - y * Math.sin(rad));
      const ry = cy + (x * Math.sin(rad) + y * Math.cos(rad));
      return `${rx.toFixed(1)},${ry.toFixed(1)}`;
    })
    .join(" ");
  const lineRad = rad;
  const scratches = [-4, 0, 4]
    .map((dy) => {
      const lx1 = cx + (-w / 2 + 5) * Math.cos(lineRad) - dy * Math.sin(lineRad);
      const ly1 = cy + (-w / 2 + 5) * Math.sin(lineRad) + dy * Math.cos(lineRad);
      const lx2 = cx + (w / 2 - 5) * Math.cos(lineRad) - dy * Math.sin(lineRad);
      const ly2 = cy + (w / 2 - 5) * Math.sin(lineRad) + dy * Math.cos(lineRad);
      return `<line x1="${lx1.toFixed(1)}" y1="${ly1.toFixed(1)}" x2="${lx2.toFixed(1)}" y2="${ly2.toFixed(1)}" stroke="${INK}" stroke-width="1.2" opacity="0.55" />`;
    })
    .join("");
  return `<polygon points="${pts}" fill="${SCRAP_FILLS[fillIndex % SCRAP_FILLS.length]}" stroke="${INK}" stroke-width="1.3" />${scratches}`;
}

// One consolidated note — a small solid card with a wax seal — sitting
// at the stop's own exact position, the single thing every scrap around
// it is shown converging into.
function renderSealedNote(x, y) {
  return `
    <rect x="${(x - 15).toFixed(1)}" y="${(y - 11).toFixed(1)}" width="30" height="22" rx="2" fill="#f7efd6" stroke="${INK}" stroke-width="1.6" />
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${WAX_RED}" stroke="${WAX_RED_DARK}" stroke-width="1" />
  `;
}

// The ribbon binding each loose scrap to the sealed note at center —
// a thin ink-brown line per scrap, same "several things, one
// destination" shape as the scraps themselves converging.
function renderRibbon(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2 + (y1 - y2) * 0.12;
  const my = (y1 + y2) / 2 + (x2 - x1) * 0.12;
  return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${GOLD_TRIM}" stroke-width="1.6" fill="none" opacity="0.75" />`;
}

// Two or three scraps at fixed offsets around the stop, alternating so
// consecutive stops don't look identical, each bound by its own ribbon
// to one sealed note at the stop's own real position.
const SCRAP_LAYOUTS = [
  [
    { dx: -46, dy: -20, angle: -18 },
    { dx: 42, dy: -26, angle: 14 },
  ],
  [
    { dx: -44, dy: 18, angle: 12 },
    { dx: 46, dy: -14, angle: -10 },
    { dx: 6, dy: -34, angle: 4 },
  ],
];

function renderCluster(p, i) {
  const layout = SCRAP_LAYOUTS[i % SCRAP_LAYOUTS.length];
  const ribbons = layout.map((s) => renderRibbon(p.x + s.dx, p.y + s.dy, p.x, p.y)).join("");
  const scraps = layout.map((s, si) => renderScrap(p.x + s.dx, p.y + s.dy, s.angle, si)).join("");
  return ribbons + scraps + renderSealedNote(p.x, p.y);
}

function renderClusters(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderCluster(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `
    <circle cx="${last.x}" cy="${last.y}" r="86" fill="${PARCHMENT_BOTTOM}" stroke="${INK}" stroke-width="4" />
    <circle cx="${last.x}" cy="${last.y}" r="58" fill="none" stroke="${WAX_RED}" stroke-width="3" />
    <circle cx="${last.x}" cy="${last.y}" r="30" fill="${WAX_RED}" opacity="0.85" />
  `;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Scriptorium, spread out as a cartographer's chart: loose torn note-scraps bound by ribbon into one sealed note at every stop, connecting every Bullet Point Builder lesson up to ${bossName}'s own wax-sealed destination">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#pinnedNotesParchment)" />
      <g>${renderAgeSpots(totalHeight)}</g>
      <g>${renderGrid(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 8" fill="none" opacity="0.85" />
      <g>${renderClusters(positions)}</g>
    </svg>
  `;
}

export const pinnedNotesTheme = {
  trailBand: BAND,
  mapBg: PARCHMENT_TOP,
  hintColor: "rgba(59, 43, 31, 0.8)",
  renderScene,
};
