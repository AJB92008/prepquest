// Lexicon Shoals' own theme for Transition Tracker, the Scriptorium's
// first skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through). Transition Tracker is about
// choosing the right word or phrase to connect two ideas — continuing
// one ("moreover"), reversing it ("however"), or drawing a consequence
// from it ("therefore") — so the scene draws that literally as a
// cartographer's chart: the trail itself is one continuous ink route
// across a spread parchment map, and every stop gets its own small
// route-junction pennant whose own shape and color name which of those
// three connective families it is, cycling in order the same way
// turningWatch.js's own beacon cycles through four real times of day.
// This zone's own "Cartographer's Table" family — aged parchment, sepia
// ink, wax-seal red, and compass gold — is Scriptorium's own answer to
// Archive Stacks' night-violet library and Grammar Garrison's open-air
// battlements: neither a sky nor a room, but a chart spread out and
// studied from directly above; see pinnedNotes.js and
// expeditionRoute.js, Scriptorium's other two skills, for the same
// palette used toward very different compositions.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const PARCHMENT_TOP = "#ecdba8";
const PARCHMENT_BOTTOM = "#d3b478";
const INK = "#3b2b1f";
const INK_FAINT = "#6b5238";
const WAX_RED = "#9c3b2e";
const WAX_RED_DARK = "#742a20";
const GOLD_TRIM = "#c9a24b";

function defs() {
  return `
    <defs>
      <linearGradient id="tradeRouteParchment" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PARCHMENT_TOP}" />
        <stop offset="100%" stop-color="${PARCHMENT_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

// A faint latitude/longitude grid across the whole chart — evenly spaced
// horizontal rules plus a few verticals, low-opacity ink so it reads as
// the map's own printed grid rather than a foreground element, same
// "ambient texture, not a marker to track" role rampartGates.js's own
// brick coursing plays.
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

// Ink-wash age spots — fixed, irregular soft blotches scattered down the
// chart, the same "ambient depth, fixed positions, not tied to any
// stop" role every other Lexicon Shoals theme's own cloud wisps play.
function renderAgeSpots(totalHeight) {
  const spots = [
    { fx: 0.14, fy: 0.08, r: 34 },
    { fx: 0.86, fy: 0.22, r: 26 },
    { fx: 0.66, fy: 0.5, r: 30 },
    { fx: 0.2, fy: 0.68, r: 24 },
    { fx: 0.82, fy: 0.86, r: 32 },
  ];
  return spots
    .map((s) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${s.r}" ry="${(s.r * 0.7).toFixed(1)}" fill="${INK_FAINT}" opacity="0.1" />`;
    })
    .join("");
}

// One large watermark compass rose behind everything, near the top of
// the chart — an old map's own corner ornament, oversized and faint so
// it reads as part of the paper rather than a marker in play.
function renderCompassWatermark() {
  const cx = COL_W * 0.5;
  const cy = 130;
  const spokes = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = i % 2 === 0 ? 78 : 46;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    spokes.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `
    <g opacity="0.16">
      <circle cx="${cx}" cy="${cy}" r="90" fill="none" stroke="${INK}" stroke-width="2" />
      <path d="${spokes.join(" ")} Z" fill="${INK}" />
      <circle cx="${cx}" cy="${cy}" r="10" fill="${GOLD_TRIM}" />
    </g>
  `;
}

// The three connective families, in real fixed order — continuation
// ("moreover"), contrast ("however"), and cause/effect ("therefore") —
// each with its own pennant shape and color so the difference reads at
// a glance rather than needing a label: a smooth gold triangle keeps
// going the same direction the trail already runs, a jagged red flag
// breaks that direction sharply, and a forked ink flag splits into two
// to show a result branching off the point before it.
function continuationPennant(x, y) {
  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${(y - 34).toFixed(1)}" stroke="${INK}" stroke-width="2.5" />
    <path d="M${x},${(y - 34).toFixed(1)} L${(x + 26).toFixed(1)},${(y - 27).toFixed(1)} L${x},${(y - 20).toFixed(1)} Z" fill="${GOLD_TRIM}" stroke="${INK}" stroke-width="1.2" />
  `;
}
function contrastPennant(x, y) {
  const top = y - 34;
  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${top.toFixed(1)}" stroke="${INK}" stroke-width="2.5" />
    <path d="M${x},${top.toFixed(1)} L${(x + 22).toFixed(1)},${(top + 4).toFixed(1)} L${(x + 10).toFixed(1)},${(top + 9).toFixed(1)} L${(x + 26).toFixed(1)},${(top + 14).toFixed(1)} L${x},${(top + 20).toFixed(1)} Z" fill="${WAX_RED}" stroke="${WAX_RED_DARK}" stroke-width="1.2" />
  `;
}
function causeEffectPennant(x, y) {
  const top = y - 34;
  return `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${top.toFixed(1)}" stroke="${INK}" stroke-width="2.5" />
    <path d="M${x},${top.toFixed(1)} L${(x + 24).toFixed(1)},${(top + 3).toFixed(1)} L${(x + 12).toFixed(1)},${(top + 10).toFixed(1)} Z" fill="${INK}" />
    <path d="M${x},${(top + 8).toFixed(1)} L${(x + 24).toFixed(1)},${(top + 11).toFixed(1)} L${(x + 12).toFixed(1)},${(top + 18).toFixed(1)} Z" fill="${INK}" />
  `;
}
const PENNANTS = [continuationPennant, contrastPennant, causeEffectPennant];

// A short perpendicular tick mark across the route at this stop — a
// nautical chart's own distance-scale mark, purely decorative texture
// tying the pennant back to the route line it names.
function renderRouteTick(x, y) {
  return `<line x1="${(x - 16).toFixed(1)}" y1="${(y - 6).toFixed(1)}" x2="${(x + 16).toFixed(1)}" y2="${(y + 6).toFixed(1)}" stroke="${INK}" stroke-width="2" opacity="0.5" />`;
}

function renderJunctions(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderRouteTick(p.x, p.y) + PENNANTS[i % PENNANTS.length](p.x, p.y + 20))
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
      aria-label="A corner of Lexicon Shoals' Scriptorium, spread out as a cartographer's chart: one inked trade route across aged parchment, with a small route-junction pennant at every stop naming which family of transition connects it to the next — continuation, contrast, or cause and effect — up to ${bossName}'s own wax-sealed destination">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#tradeRouteParchment)" />
      <g>${renderAgeSpots(totalHeight)}</g>
      <g>${renderGrid(totalHeight)}</g>
      ${renderCompassWatermark()}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 8" fill="none" opacity="0.85" />
      <g>${renderJunctions(positions)}</g>
    </svg>
  `;
}

export const tradeRoutesTheme = {
  trailBand: BAND,
  mapBg: PARCHMENT_TOP,
  hintColor: "rgba(59, 43, 31, 0.8)",
  renderScene,
};
