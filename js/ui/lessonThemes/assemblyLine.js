// Function Fields' own theme for Expression Rebuilder, Curve Reach's
// third and final skill (see lessonTerrain.js for the shared engine
// every lesson-path theme renders through). Expression Rebuilder's own
// first theme, expressionSwap (two tiles and an arrow on pale wave-
// paper, continuing the hub's own "Rolling Curve" family Curve Shaper
// still uses), is replaced outright here with a real factory — a
// literal "rebuilder," since Expression Rebuilder is about rewriting
// one expression into a genuine equivalent, not solving or plotting
// anything: every stop is a short conveyor-belt run feeding one real
// expression tile into a gear, which reshapes it into its own real
// equivalent tile on the far side. This keeps the same real "one form,
// one genuine equivalent" structure the old theme's two tiles had
// (still checked as a real algebraic identity, not made-up text) —
// only the packaging (paper diagram vs. factory line) changed.
import { COL_W, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const STEEL_TOP = "#e4e8ec";
const STEEL_BOTTOM = "#b9c2cc";
const PANEL_LINE = "#8a96a3";
const PLATE_FILL = "#eef1f4";
const INK = "#2b2f36";
const RUST = "#c9722e";
const CAUTION = "#e8b93a";
const BOSS_FILL = "#1a1d22";

const EXPR_PAIRS = [
  ["(x+1)²", "x²+2x+1"],
  ["2(x+3)", "2x+6"],
  ["x²-9", "(x-3)(x+3)"],
  ["3x+3y", "3(x+y)"],
];

function defs() {
  return `
    <defs>
      <linearGradient id="assemblyLineSteel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${STEEL_TOP}" />
        <stop offset="100%" stop-color="${STEEL_BOTTOM}" />
      </linearGradient>
      <pattern id="assemblyLinePanel" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M0 0 H60 M0 0 V60" stroke="${PANEL_LINE}" stroke-width="1" opacity="0.35" />
        <circle cx="0" cy="0" r="2" fill="${PANEL_LINE}" opacity="0.5" />
      </pattern>
    </defs>
  `;
}

// A faint hazard-stripe band, factory-floor caution paint standing in
// for the "one big landmark behind everything" role every other file
// in this hub gives its own recurring motif.
function renderHazardBand(totalHeight) {
  const y = totalHeight / 2;
  const h = Math.min(totalHeight * 0.1, 90);
  const stripeW = 26;
  const stripes = [];
  for (let x = -stripeW; x < COL_W + h; x += stripeW * 2) {
    stripes.push(`<path d="M${x},${(y + h / 2).toFixed(1)} L${(x + h).toFixed(1)},${(y - h / 2).toFixed(1)} L${(x + h + stripeW).toFixed(1)},${(y - h / 2).toFixed(1)} L${(x + stripeW).toFixed(1)},${(y + h / 2).toFixed(1)} Z" fill="${CAUTION}" />`);
  }
  return `<g opacity="0.15"><rect x="0" y="${(y - h / 2).toFixed(1)}" width="${COL_W}" height="${h}" fill="${INK}" />${stripes.join("")}</g>`;
}

// Small background factory silhouettes (crates, pipe stubs) down the
// whole scene, spaced by real height (see curveArc.js's own header
// comment for why a fixed handful of fractional positions goes sparse
// at this zone's own real, much taller lesson counts).
const PROP_SPACING = 300;
const PROP_CYCLE = [
  { fx: 0.1, kind: "crate" },
  { fx: 0.9, kind: "pipe" },
  { fx: 0.2, kind: "pipe" },
  { fx: 0.85, kind: "crate" },
];
function renderProp(fx, cy, kind) {
  const cx = fx * COL_W;
  if (kind === "crate") {
    return `<rect x="${(cx - 22).toFixed(1)}" y="${(cy - 18).toFixed(1)}" width="44" height="36" fill="${PANEL_LINE}" opacity="0.3" /><path d="M${(cx - 22).toFixed(1)},${(cy - 18).toFixed(1)} L${(cx + 22).toFixed(1)},${(cy + 18).toFixed(1)} M${(cx + 22).toFixed(1)},${(cy - 18).toFixed(1)} L${(cx - 22).toFixed(1)},${(cy + 18).toFixed(1)}" stroke="${PANEL_LINE}" stroke-width="1.5" opacity="0.3" />`;
  }
  return `<rect x="${(cx - 9).toFixed(1)}" y="${(cy - 30).toFixed(1)}" width="18" height="60" rx="9" fill="${PANEL_LINE}" opacity="0.3" />`;
}
// Skips any prop that would land within the boss clearing itself
// (radius 86, plus each prop's own half-size so its own edge clears
// too) — unlike the hills in curveArc.js/rootSystem.js's own
// equivalents, these props are real visible foreground shapes, not
// huge, mostly-decorative background silhouettes exempt from the
// "nothing drawn on the boss clearing" rule every other zone holds to.
// halfSize deliberately uses the LARGER of each prop's two half-extents
// (crate is 44x36 -> 22; pipe is 18x60 -> 30), since this is a vertical
// (cy-to-bossY) distance check and the larger half-extent is the
// conservative one regardless of which axis it actually measures.
function renderProps(totalHeight, bossY) {
  const count = Math.max(PROP_CYCLE.length, Math.round(totalHeight / PROP_SPACING));
  return Array.from({ length: count }, (_, i) => {
    const p = PROP_CYCLE[i % PROP_CYCLE.length];
    const cy = ((i + 0.5) / count) * totalHeight;
    const halfSize = p.kind === "crate" ? 22 : 30;
    if (Math.abs(cy - bossY) < 86 + halfSize) return "";
    return renderProp(p.fx, cy, p.kind);
  }).join("");
}

// A metal plate holding a real expression, riveted at each corner —
// sized generously enough (84 wide) for the longest real pair in
// EXPR_PAIRS at a legible font size, not measured dynamically (this
// project's SVG strings never measure text at render time; every other
// tile-label file in this hub, e.g. equationScale.js's own pans, picks
// one fixed width the same way).
function renderPlate(cx, cy, label) {
  const w = 84;
  const h = 30;
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const rivet = (rx, ry) => `<circle cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="1.8" fill="${PANEL_LINE}" />`;
  return `
    <ellipse cx="${cx.toFixed(1)}" cy="${(cy + h / 2 + 4).toFixed(1)}" rx="${w / 2 + 2}" ry="5" fill="${BOSS_FILL}" opacity="0.35" />
    <rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${w}" height="${h}" rx="4" fill="${PLATE_FILL}" stroke="${INK}" stroke-width="2" />
    ${rivet(x0 + 6, y0 + 6)}${rivet(x0 + w - 6, y0 + 6)}${rivet(x0 + 6, y0 + h - 6)}${rivet(x0 + w - 6, y0 + h - 6)}
    <text x="${cx.toFixed(1)}" y="${(cy + 5).toFixed(1)}" font-size="13" font-weight="700" fill="${INK}" text-anchor="middle">${label}</text>
  `;
}

// A short conveyor-belt run, one segment feeding each plate, split
// around the gear rather than one continuous bar under it — a
// continuous belt spanning the middle would pass close enough under
// `p` to fail its own real marker clearance (the gap keeps the belt's
// own inner edge a real 7.5 local units past that radius; see tests/
// curveReachLessonThemes.test.js's own dedicated sweep).
function renderBeltSegment(x0, x1, y) {
  const ticks = [];
  for (let x = x0 + 8; x < x1; x += 14) {
    ticks.push(`<line x1="${x.toFixed(1)}" y1="${(y - 3).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + 3).toFixed(1)}" stroke="${STEEL_TOP}" stroke-width="1.5" opacity="0.6" />`);
  }
  return `<rect x="${x0.toFixed(1)}" y="${(y - 3).toFixed(1)}" width="${(x1 - x0).toFixed(1)}" height="6" rx="3" fill="${INK}" />${ticks.join("")}`;
}

// A simple gear silhouette — a ringed body plus `teeth` small rotated
// teeth — standing in for "the machine doing the rebuilding."
function renderGear(cx, cy, angleOffset) {
  const bodyR = 9;
  const toothW = 5;
  const toothH = 5;
  const teethCount = 8;
  const teeth = Array.from({ length: teethCount }, (_, i) => {
    const angle = (360 / teethCount) * i + angleOffset;
    const ty = cy - bodyR - toothH / 2;
    return `<rect x="${(cx - toothW / 2).toFixed(1)}" y="${(ty - toothH / 2).toFixed(1)}" width="${toothW}" height="${toothH}" fill="${RUST}" transform="rotate(${angle.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})" />`;
  }).join("");
  return `
    ${teeth}
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${bodyR}" fill="${RUST}" stroke="${INK}" stroke-width="1.5" />
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${bodyR * 0.4}" fill="${INK}" />
  `;
}

// Both plates sit on a baseline `CLEARANCE` above `p` (never below it) —
// the same unconditional-boss-safety reasoning curveArc.js's own header
// comment gives for keeping a whole composition on one fixed side of
// `p`. `mirror` only swaps which plate holds the starting form (so the
// belt's own real direction of travel alternates); it never changes
// where anything sits, so both plates clear the real ≈38-unit mobile-
// scale marker radius (see equationScale.js's own header comment for
// the arithmetic) by the same wide margin every stop.
const CLEARANCE = 60;
const GAP = 68;
function renderAssemblyStop(p, i) {
  const [from, to] = EXPR_PAIRS[i % EXPR_PAIRS.length];
  const mirror = i % 2 === 0;
  const y = p.y - CLEARANCE;
  const leftLabel = mirror ? from : to;
  const rightLabel = mirror ? to : from;
  const leftX = p.x - GAP;
  const rightX = p.x + GAP;
  const beltY = y + 18;
  return `
    ${renderBeltSegment(leftX - 45, leftX + 45, beltY)}
    ${renderBeltSegment(rightX - 45, rightX + 45, beltY)}
    ${renderGear(p.x, y, i * 15)}
    ${renderPlate(leftX, y, leftLabel)}
    ${renderPlate(rightX, y, rightLabel)}
  `;
}

function renderAssembly(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderAssemblyStop(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="${BOSS_FILL}" stroke="${RUST}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Function Fields' Curve Reach, in a factory: a real expression plate riding a short conveyor into a gear at every stop, coming out the other side as its own genuine equivalent, alternating which side holds the starting form, connecting every Expression Rebuilder lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#assemblyLineSteel)" />
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#assemblyLinePanel)" opacity="0.7" />
      ${renderProps(totalHeight, last.y)}
      ${renderHazardBand(totalHeight)}
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.6" />
      <g>${renderAssembly(positions)}</g>
    </svg>
  `;
}

export const assemblyLineTheme = {
  trailBand: BAND,
  mapBg: STEEL_TOP,
  hintColor: "rgba(43, 47, 54, 0.8)",
  renderScene,
};
