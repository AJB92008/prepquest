// SAT Math's own "hub" island, Function Fields — the same walkable-hub
// treatment ACT Math's Numeria Peaks (mathHub.js) and SAT Reading &
// Writing's Lexicon Shoals (satRwHub.js) already get, combining a piece
// of each: Numeria Peaks' own territory-tiled archipelago of separate
// islands (the right fit here too — sat-math's 4 real reporting
// categories are just as uneven, 5/3/7/4, as ACT Math's own categories),
// reskinned for SAT's own Sky Islands theme (.sky-scene in style.css,
// reused as-is, unchanged, the same class satRwHub.js's own header
// comment points to) instead of Numeria Peaks' ocean: these islands
// float in open sky, so there's no water to paint between them — open
// .sky-scene backdrop shows straight through every gap, the same trick
// satRwHub.js's own ring already relies on (`landmass: () => ""`) — and
// rope/plank bridges (hubWorld.js's shared renderPlankBridge, the same
// bridges islandHub.js's own Wordwood Isle already uses) connect
// neighboring islands instead of Numeria Peaks' sand causeways, since a
// flat sand strip reads as "resting on water" in a way that makes no
// sense with open air on either side.
//
// One graph/grid visual language ties every island together rather than
// each zone getting its own unrelated landmark family (mountains vs
// shale vs spires vs flats, the way Numeria Peaks' own 4 zones do): every
// island's interior gets a faint graph-paper grid overlay, and every
// island's own central landmark is the *same* axis-cross-plus-one-plotted
// shape, always drawn in the same cream "chalk" ink — only *which* shape
// is plotted (a rising line, a curve, a scatter, a circle) changes
// zone to zone, echoing what that reporting category actually tests
// without turning the map into four different genres of prop.
import { gameState } from "../state.js";
import { hudHTML, wireHud } from "./hud.js";
import { monsterSVG } from "./monster.js";
import { getBossMonster } from "../data/bossMonsters.js";
import { getLessonCount } from "../data/questions/index.js";
import { glowVars } from "./pathTrail.js";
import {
  CENTER,
  BOSS_POS,
  BOSS_TRIGGER_RADIUS,
  WORLD_W,
  WORLD_H,
  WALK_MARGIN,
  renderWorldSvg,
  renderPlankBridge,
  pointInPolygon,
  wireMovement,
  wireFullscreenToggle,
  joystickHTML,
} from "./hubWorld.js";
import { closedBlobPath } from "./lessonTerrain.js";

const SKILL_TRIGGER_RADIUS = 58;

// Real College Board content-domain sizes for sat-math (see
// satSkills.js's own REPORTING_CATEGORIES["sat-math"]): 5/3/7/4 — just as
// uneven as ACT Math's own 4 categories, which is exactly why this file
// follows Numeria Peaks' territory-tiling approach (computeTerritories/
// gridPositions below) rather than satRwHub.js's ring (computeRingLayout
// radiates every zone's markers from one shared center, a natural fit
// for quadrants fanning around a round atoll, not for a spread-out,
// unevenly-sized set of separate islands — see mathHub.js's own header
// comment for the full reasoning, unchanged here).
const ZONES = [
  { id: "algebra", name: "Slope Fields", categories: ["algebra"], fill: "#6b8fc9", description: "Algebra", decorations: [] },
  { id: "advmath", name: "Curve Reach", categories: ["advmath"], fill: "#4f9e8f", description: "Advanced Math", decorations: [] },
  { id: "psda", name: "Scatter Banks", categories: ["psda"], fill: "#d4a64a", description: "Problem-Solving & Data Analysis", decorations: [] },
  { id: "geotrig", name: "Angle Reach", categories: ["geotrig"], fill: "#b4694f", description: "Geometry & Trigonometry", decorations: [] },
];
const BOSS_FILL = "#3c3450";

function renderLegend() {
  return `
    <div class="hub-legend" aria-hidden="true">
      <p class="hub-legend-title">Island regions</p>
      ${ZONES.map(
        (zone) => `
        <div class="hub-legend-row">
          <span class="hub-legend-swatch" style="background:${zone.fill}"></span>
          <span>
            <span class="hub-legend-name">${zone.name}</span><br>
            <span class="hub-legend-desc">${zone.description}</span>
          </span>
        </div>
      `
      ).join("")}
    </div>
  `;
}

// Same tiling mathHub.js's own computeTerritories uses, copied rather
// than imported — every walkable hub keeps its own copy of this engine
// (see scienceHub.js's own header comment for why: each hub is its own
// file on purpose, not a parameterized branch of another one).
const TOP_BAND = { y0: WALK_MARGIN, y1: 1120 };
const BOSS_BAND = { y0: 1170, y1: WORLD_H - WALK_MARGIN };
const GUTTER = 44;

function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 3.7) * 43758.5453;
  return x - Math.floor(x);
}

function computeTerritories(subject) {
  const zoneSkills = ZONES.map((zone) => subject.skills.filter((s) => zone.categories.includes(s.reportingCategory)));
  const fullWidth = WORLD_W - WALK_MARGIN * 2;
  const colWidth = fullWidth / ZONES.length;
  return ZONES.map((zone, i) => {
    const isFirst = i === 0;
    const isLast = i === ZONES.length - 1;
    const rawX0 = WALK_MARGIN + i * colWidth;
    const rawX1 = WALK_MARGIN + (i + 1) * colWidth;
    return {
      zone,
      skills: zoneSkills[i],
      x0: isFirst ? rawX0 : rawX0 + GUTTER / 2,
      x1: isLast ? rawX1 : rawX1 - GUTTER / 2,
      y0: TOP_BAND.y0,
      y1: TOP_BAND.y1,
    };
  });
}

function jitterFor(id, maxX, maxY) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  const hx = (Math.sin(h) * 43758.5453) % 1;
  const hy = (Math.sin(h * 1.37 + 4.1) * 12543.789) % 1;
  return { dx: (hx - Math.floor(hx) - 0.5) * 2 * maxX, dy: (hy - Math.floor(hy) - 0.5) * 2 * maxY };
}

// No ACT Math-style pinned corner skill — sat-math has no skill whose
// grid slot happens to collide with a bridge attachment the way ACT
// Math's own Root Cause (ma-alg2) did, so there's nothing to reorder for
// (mathHub.js's own ROOT_CAUSE_ID/orderForCornerPlacement would be dead
// code here if copied verbatim — left out on purpose).
const BRIDGE_Y_CLEARANCE = 80;

function gridPositions(territory) {
  const { skills, zone, x0, y0, x1, y1 } = territory;
  const n = skills.length;
  const width = x1 - x0;
  const height = y1 - y0;
  const prefCols = Math.max(1, Math.min(n, Math.round(width / 220)));
  let rows = n ? Math.ceil(n / prefCols) : 0;
  if (n >= 3 && rows < 3) rows = 3;
  const cols = rows ? Math.ceil(n / rows) : prefCols;
  const insetX = Math.min(115, width * 0.22);
  const insetY = Math.min(115, height * 0.22);
  const innerX0 = x0 + insetX;
  const innerX1 = x1 - insetX;
  const innerY0 = y0 + insetY;
  const innerY1 = y1 - insetY;
  const colSpacing = cols > 1 ? (innerX1 - innerX0) / (cols - 1) : innerX1 - innerX0;
  const rowSpacing = rows > 1 ? (innerY1 - innerY0) / (rows - 1) : innerY1 - innerY0;
  const jitterX = Math.min(20, Math.max(0, colSpacing) * 0.25);
  const jitterY = Math.min(20, Math.max(0, rowSpacing) * 0.25);
  const bridgeRow = rows >= 3 && rows % 2 === 1 ? (rows - 1) / 2 : -1;
  const bridgeShift = Math.min(BRIDGE_Y_CLEARANCE, rowSpacing * 0.4);
  const positions = [];
  let idx = 0;
  for (let row = 0; row < rows; row++) {
    const itemsInRow = Math.floor(n / rows) + (row < n % rows ? 1 : 0);
    const baseY = rows > 1 ? innerY0 + (row / (rows - 1)) * (innerY1 - innerY0) : (innerY0 + innerY1) / 2;
    const y = row === bridgeRow ? baseY + bridgeShift : baseY;
    for (let c = 0; c < itemsInRow; c++) {
      const x = itemsInRow > 1 ? innerX0 + (c / (itemsInRow - 1)) * (innerX1 - innerX0) : (innerX0 + innerX1) / 2;
      const { dx, dy } = jitterFor(skills[idx].id, jitterX, jitterY);
      const jx = x + dx;
      const jy = y + dy;
      positions.push({ item: skills[idx], zone, x: jx, y: jy, dockX: jx, dockY: jy + 34, row });
      idx++;
    }
  }
  return positions;
}

function buildLayout(territories) {
  return territories.flatMap(gridPositions);
}

function computeSpawnPoint(layout) {
  const byZone = new Map();
  for (const p of layout) {
    if (!byZone.has(p.zone)) byZone.set(p.zone, []);
    byZone.get(p.zone).push(p);
  }
  let best = null;
  let bestDist = Infinity;
  for (const pts of byZone.values()) {
    const cx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
    const cy = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;
    const dist = Math.abs(cx - CENTER.x);
    if (dist < bestDist) {
      bestDist = dist;
      best = { x: cx, y: cy };
    }
  }
  return best || CENTER;
}

const SAND = "#ecdfb8";

// Same organic-outline construction mathHub.js's own organicIslandPoints
// uses (see that file's much longer doc comment for the full reasoning:
// base radius is the rect's own real per-angle edge distance, pad only
// ever adds outward, bulge jitter is seeded not random). `halfW`/`halfH`
// floor to 50px for a degenerate single-column/row box — see computeBox
// below for why the *caller* now also widens its own box to match that
// floor before computing gaps off it, which mathHub.js's own version
// never needed to do (every narrow zone it has ever shipped sat at one
// end of the chain, with only one neighbor to worry about; sat-math's
// own Advanced Math zone is the first narrow zone sandwiched between two
// neighbors at once).
function organicIslandPoints(bbox, pad, seed, n = 48) {
  const cx = (bbox.x0 + bbox.x1) / 2;
  const cy = (bbox.y0 + bbox.y1) / 2;
  const p = typeof pad === "number" ? { left: pad, right: pad, top: pad, bottom: pad } : pad;
  const halfW = Math.max(50, (bbox.x1 - bbox.x0) / 2);
  const halfH = Math.max(50, (bbox.y1 - bbox.y0) / 2);
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const tx = dirX !== 0 ? halfW / Math.abs(dirX) : Infinity;
    const ty = dirY !== 0 ? halfH / Math.abs(dirY) : Infinity;
    const hitsVerticalEdge = tx <= ty;
    const rectR = hitsVerticalEdge ? tx : ty;
    const padSide = hitsVerticalEdge ? (dirX >= 0 ? p.right : p.left) : dirY >= 0 ? p.bottom : p.top;
    const bulge = 1 + pseudoRandom(seed * 31 + i) * 0.3;
    const r = rectR + padSide * bulge;
    return { x: cx + dirX * r, y: cy + dirY * r };
  });
}

// The fix organicIslandPoints' own mathHub.js ancestor names but never
// needed: a zone's tight node bbox narrower than 100px renders *wider*
// than its own raw edges (organicIslandPoints' 50px half-extent floor),
// so sizing a neighbor gap off the raw bbox edges is optimistic by
// exactly that difference. Widening the box itself here, before any gap
// math runs, keeps the two in agreement — a box already wider than
// 100px is untouched (Math.min/Math.max below are no-ops), so this only
// ever affects a zone narrow enough to actually hit the floor (sat-math's
// own 3-skill Advanced Math zone, forced into a single column by
// gridPositions' own >=3-rows rule above).
function computeBox(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const rawX0 = Math.min(...xs);
  const rawX1 = Math.max(...xs);
  const rawY0 = Math.min(...ys);
  const rawY1 = Math.max(...ys);
  const cx = (rawX0 + rawX1) / 2;
  const cy = (rawY0 + rawY1) / 2;
  const x0 = Math.min(rawX0, cx - 50);
  const x1 = Math.max(rawX1, cx + 50);
  const y0 = Math.min(rawY0, cy - 50);
  const y1 = Math.max(rawY1, cy + 50);
  return { x0, x1, y0, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

// One shared, recurring landmark system — a short axis cross, always in
// the same cream ink, sized off computeMotifBounds' own headroom budget
// the same way every one of mathHub.js's 4 motifs is (see that file's
// own doc comment on computeMotifBounds for why bbox.y0 alone isn't
// enough and why the width gets a floor too).
const GRID_INK = "#fdf8ec";
const NODE_CLEARANCE = 45;
function computeMotifBounds(bbox, headroom) {
  const bottomY = bbox.y0 - NODE_CLEARANCE;
  const budget = Math.max(35, Math.min(100, headroom - NODE_CLEARANCE));
  const cx = (bbox.x0 + bbox.x1) / 2;
  const w = Math.max(250, bbox.x1 - bbox.x0);
  return { bottomY, budget, cx, w };
}

function renderAxisCross(cx, baseY, armLen, vArm) {
  return `
    <line x1="${(cx - armLen).toFixed(1)}" y1="${baseY.toFixed(1)}" x2="${(cx + armLen).toFixed(1)}" y2="${baseY.toFixed(1)}" stroke="${GRID_INK}" stroke-width="2" opacity="0.5" />
    <line x1="${cx.toFixed(1)}" y1="${(baseY + armLen * 0.15).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(baseY - vArm).toFixed(1)}" stroke="${GRID_INK}" stroke-width="2" opacity="0.5" />
  `;
}

// Slope Fields (Algebra) — a straight rising line with two plotted
// points, the most literal "linear function" graph there is, echoing
// Equation Solver/Line Reader/Graph Plotter/Crossing Point/Boundary
// Setter all at once.
function renderLinePlot(bbox, seed, headroom = 150) {
  const { bottomY, budget, cx, w } = computeMotifBounds(bbox, headroom);
  const armLen = Math.min(w * 0.32, 95);
  const x0 = cx - w * 0.26;
  const y0 = bottomY - budget * 0.12;
  const x1 = cx + w * 0.26;
  const y1 = bottomY - budget * 0.85;
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  return `
    ${renderAxisCross(cx, bottomY, armLen, budget * 0.95)}
    <line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${GRID_INK}" stroke-width="4" stroke-linecap="round" />
    <circle cx="${midX.toFixed(1)}" cy="${midY.toFixed(1)}" r="4.5" fill="${GRID_INK}" />
    <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="4.5" fill="${GRID_INK}" />
  `;
}

// Curve Reach (Advanced Math) — a smooth arc with its own vertex marked,
// echoing Curve Shaper/Root Finder/Expression Rebuilder's nonlinear
// functions instead of Slope Fields' straight line.
function renderCurvePlot(bbox, seed, headroom = 150) {
  const { bottomY, budget, cx, w } = computeMotifBounds(bbox, headroom);
  const armLen = Math.min(w * 0.32, 95);
  const halfW = w * 0.26;
  const base = bottomY - budget * 0.12;
  const top = bottomY - budget * 0.85;
  return `
    ${renderAxisCross(cx, bottomY, armLen, budget * 0.95)}
    <path d="M${(cx - halfW).toFixed(1)},${base.toFixed(1)} Q${cx.toFixed(1)},${top.toFixed(1)} ${(cx + halfW).toFixed(1)},${base.toFixed(1)}" fill="none" stroke="${GRID_INK}" stroke-width="4" stroke-linecap="round" />
    <circle cx="${cx.toFixed(1)}" cy="${top.toFixed(1)}" r="4.5" fill="${GRID_INK}" />
  `;
}

// Scatter Banks (Problem-Solving & Data Analysis) — a literal scatter of
// plotted points, no connecting line, echoing Scatter Scout/Spread
// Sense/Sample Says' own data-cloud shape rather than one clean function.
function renderScatterPlot(bbox, seed, headroom = 150) {
  const { bottomY, budget, cx, w } = computeMotifBounds(bbox, headroom);
  const armLen = Math.min(w * 0.32, 95);
  const dots = Array.from({ length: 7 }, (_, i) => {
    const fx = pseudoRandom(seed * 19 + i);
    const fy = pseudoRandom(seed * 23 + i + 1);
    const x = cx - w * 0.28 + fx * w * 0.56;
    const y = bottomY - budget * 0.1 - fy * budget * 0.75;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${GRID_INK}" />`;
  }).join("");
  return renderAxisCross(cx, bottomY, armLen, budget * 0.95) + dots;
}

// Angle Reach (Geometry & Trigonometry) — a circle with one radius drawn
// in, echoing Circle Logic/Triangle Ratios/Angle Chase's own shapes
// instead of a plotted function at all.
function renderCirclePlot(bbox, seed, headroom = 150) {
  const { bottomY, budget, cx, w } = computeMotifBounds(bbox, headroom);
  const armLen = Math.min(w * 0.32, 95);
  const r = Math.min(budget * 0.4, w * 0.22);
  const cy = bottomY - budget * 0.45;
  const angle = -35;
  const px = cx + r * Math.cos((angle * Math.PI) / 180);
  const py = cy + r * Math.sin((angle * Math.PI) / 180);
  return `
    ${renderAxisCross(cx, bottomY, armLen, budget * 0.95)}
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${GRID_INK}" stroke-width="4" />
    <line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${GRID_INK}" stroke-width="3" />
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="${GRID_INK}" />
  `;
}

const ZONE_TERRAIN = {
  algebra: renderLinePlot,
  advmath: renderCurvePlot,
  psda: renderScatterPlot,
  geotrig: renderCirclePlot,
};

// Every zone's own scattered ring accents are the *same* small cream
// dot, not a zone-specific prop — same placement math as mathHub.js's
// own renderZoneScatter (seeded angle + radial pad between the tight
// node bbox and the shoreline), just one shared dot instead of 4
// different per-zone decorations, so "plotted points drifting near the
// shore" reads as one consistent idea everywhere instead of 4 unrelated
// ones.
function renderZoneScatter(bbox, seed, ringCap) {
  const max = Math.min(85, ringCap);
  const min = Math.min(50, max - 15);
  if (max <= 0) return "";
  const cx = (bbox.x0 + bbox.x1) / 2;
  const cy = (bbox.y0 + bbox.y1) / 2;
  const halfW = (bbox.x1 - bbox.x0) / 2;
  const halfH = (bbox.y1 - bbox.y0) / 2;
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 + (pseudoRandom(seed * 17 + i) - 0.5) * 0.9;
    const pad = min + pseudoRandom(seed * 23 + i) * (max - min);
    const x = cx + Math.cos(angle) * (halfW + pad);
    const y = cy + Math.sin(angle) * (halfH + pad);
    const r = 3 + pseudoRandom(seed * 29 + i) * 2;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${GRID_INK}" opacity="0.75" />`;
  }).join("");
}

const SHORE_RING_WIDTH = 55;
function innerPadFor(outerPad) {
  if (typeof outerPad === "number") return Math.max(20, outerPad - SHORE_RING_WIDTH);
  return {
    left: Math.max(20, outerPad.left - SHORE_RING_WIDTH),
    right: Math.max(20, outerPad.right - SHORE_RING_WIDTH),
    top: Math.max(20, outerPad.top - SHORE_RING_WIDTH),
    bottom: Math.max(20, outerPad.bottom - SHORE_RING_WIDTH),
  };
}

// Every island's interior is painted twice: once in its own zone color,
// once more in the exact same shape with the shared graph-paper pattern
// on top at low opacity — same `d` both times (the pattern path is
// never re-sampled from a separately-padded set of points), so the grid
// can never drift out of register with the island's own outline the way
// two independently-seeded paths could.
function renderIsland(bbox, fill, seed, outerPad, centralMotif) {
  const innerPad = innerPadFor(outerPad);
  const outerPts = organicIslandPoints(bbox, outerPad, seed);
  const innerPts = organicIslandPoints(bbox, innerPad, seed);
  const headroom = typeof innerPad === "number" ? innerPad : innerPad.top;
  const d = closedBlobPath(innerPts);
  return `
    <path d="${closedBlobPath(outerPts)}" fill="${SAND}" />
    <path d="${d}" fill="${fill}" />
    <path d="${d}" fill="url(#fieldsGrid)" opacity="0.45" />
    ${centralMotif ? centralMotif(bbox, seed, headroom) : ""}
  `;
}

// The Vector Wraith's own islet gets a literal pair of crossing vectors
// instead of this family's usual axis-cross-plus-one-shape — its own
// boss is named for exactly this shape, and every other islet in this
// file already breaks from its zone's own motif family on the boss spot
// (mathHub.js's watchtower, satRwHub.js's scorched-ground islet) to read
// as "boss territory," not a 5th zone.
function renderVectorMark(cx, cy) {
  return `
    <defs>
      <marker id="satMathVectorArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 Z" fill="#e3879c" />
      </marker>
    </defs>
    <line x1="${(cx - 34).toFixed(1)}" y1="${(cy + 14).toFixed(1)}" x2="${(cx + 22).toFixed(1)}" y2="${(cy - 40).toFixed(1)}" stroke="#e3879c" stroke-width="4" stroke-linecap="round" marker-end="url(#satMathVectorArrow)" opacity="0.9" />
    <line x1="${(cx + 18).toFixed(1)}" y1="${(cy + 22).toFixed(1)}" x2="${(cx - 30).toFixed(1)}" y2="${(cy - 22).toFixed(1)}" stroke="#e3879c" stroke-width="4" stroke-linecap="round" marker-end="url(#satMathVectorArrow)" opacity="0.75" />
  `;
}

const GAP_GUTTER = 26;
const MIN_SHORE_PAD = 20;
const MAX_BULGE = 1.3;
const DEFAULT_SHORE_PAD = 150;
function safeShorePad(gap) {
  if (gap == null) return DEFAULT_SHORE_PAD;
  return Math.max(MIN_SHORE_PAD, Math.min(DEFAULT_SHORE_PAD, (gap / 2 - GAP_GUTTER) / MAX_BULGE));
}
function safeEdgePad(headroom) {
  return Math.max(MIN_SHORE_PAD, Math.min(DEFAULT_SHORE_PAD, (headroom - GAP_GUTTER) / MAX_BULGE));
}

const BOSS_BOTTOM_REACH = 70;
function computeBossBbox() {
  return { x0: BOSS_POS.x - 220, x1: BOSS_POS.x + 220, y0: BOSS_POS.y - 180, y1: BOSS_POS.y + BOSS_BOTTOM_REACH };
}

// One span per adjacent topic-island pair, left to right, plus one down
// to whichever topic island sits horizontally closest to the boss's own
// island — endpoints anchor at each box's own tight-bbox edge (the
// solid heart of that island's rendered shoreline, well inside its own
// padding), not the rendered shoreline's outer edge itself, so a bridge
// polygon built from these same endpoints (see BRIDGE_HALF_WIDTH below)
// is guaranteed to overlap both islands' own walkable regions by
// construction — exactly mathHub.js's own causewaysMarkup anchoring,
// kept unchanged because the reasoning (not the material) is what
// carries over to a bridge.
function computeBridgeSpans(boxes, bossBbox) {
  const present = boxes.filter(Boolean);
  const adjacent = present.slice(0, -1).map((box, i) => ({ ax: box.x1, ay: box.cy, bx: present[i + 1].x0, by: present[i + 1].cy }));
  const toBoss = present.length
    ? [
        (() => {
          const nearest = present.reduce((best, b) => (Math.abs(b.cx - BOSS_POS.x) < Math.abs(best.cx - BOSS_POS.x) ? b : best));
          return { ax: nearest.cx, ay: nearest.y1, bx: BOSS_POS.x, by: bossBbox.y0 };
        })(),
      ]
    : [];
  return [...adjacent, ...toBoss];
}

// A little under renderPlankBridge's own default width/2 (34/2=17), per
// hubWorld.js's own doc comment on bridgePolygon: keeps the walkable
// strip inside the rendered rails rather than hanging just past them.
const BRIDGE_HALF_WIDTH = 15;
function bridgePolygon(ax, ay, bx, by, halfWidth) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * halfWidth;
  const py = (dx / len) * halfWidth;
  return [
    { x: ax + px, y: ay + py },
    { x: bx + px, y: by + py },
    { x: bx - px, y: by - py },
    { x: ax - px, y: ay - py },
  ];
}

const FIELDS_GRID_DEFS = `
  <defs>
    <pattern id="fieldsGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M0 0 H40 M0 0 V40" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
    </pattern>
  </defs>
`;

// Split out from makeRegionShapes below so a test can compute the exact
// same per-side shoreline pads the real render uses (to then feed them
// into the same exported organicIslandPoints and check the resulting
// shoreline polygons for real overlap) without re-deriving this gap
// math a second time in the test file, where it could silently drift
// out of sync with the real version.
function computePads(boxes, bossBbox) {
  const bossBottomPad = safeEdgePad(WORLD_H - bossBbox.y1);
  const pads = boxes.map((box, i) => {
    if (!box) return DEFAULT_SHORE_PAD;
    const leftGap = boxes[i - 1] ? box.x0 - boxes[i - 1].x1 : null;
    const rightGap = boxes[i + 1] ? boxes[i + 1].x0 - box.x1 : null;
    const bottomGap = bossBbox.y0 - box.y1;
    return { left: safeShorePad(leftGap), right: safeShorePad(rightGap), top: DEFAULT_SHORE_PAD, bottom: safeShorePad(bottomGap) };
  });
  const presentBoxes = boxes.filter(Boolean);
  const bossPadTop = safeShorePad(Math.min(...presentBoxes.map((b) => bossBbox.y0 - b.y1)));
  return { pads, bossPadTop, bossBottomPad };
}

// Returns a regionShapes callback closing over `boxes`/`bridgeSpans`/
// `bossBbox`, computed once by renderSatMathHub itself (not recomputed
// here) — so the exact same bridge endpoints this draws are also the
// ones renderSatMathHub turns into walkable bridgePolygons; computing
// them twice (once for drawing, once for walkability) would risk the
// two drifting apart at a seam, which is exactly how a bridge's own
// walkable strip can miss the shore it's supposed to land on.
function makeRegionShapes(boxes, bridgeSpans, bossBbox) {
  return (zoneGroups) => {
    const { pads, bossPadTop, bossBottomPad } = computePads(boxes, bossBbox);

    const bridgesMarkup = bridgeSpans.map((s) => renderPlankBridge(s.ax, s.ay, s.bx, s.by)).join("");

    const islands = zoneGroups
      .map(({ zone }, i) => {
        const bbox = boxes[i];
        if (!bbox) return "";
        const seed = i + 1;
        const innerPad = innerPadFor(pads[i]);
        const ringCap = Math.max(25, Math.min(innerPad.left, innerPad.right, innerPad.top, innerPad.bottom) - 10);
        return renderIsland(bbox, zone.fill, seed, pads[i], ZONE_TERRAIN[zone.id]) + renderZoneScatter(bbox, seed, ringCap);
      })
      .join("");

    const bossIsland =
      renderIsland(bossBbox, BOSS_FILL, 99, { left: DEFAULT_SHORE_PAD, right: DEFAULT_SHORE_PAD, top: bossPadTop, bottom: bossBottomPad }, null) +
      renderVectorMark((bossBbox.x0 + bossBbox.x1) / 2, (bossBbox.y0 + bossBbox.y1) / 2);

    return FIELDS_GRID_DEFS + bridgesMarkup + islands + bossIsland;
  };
}

// Same boustrophedon (non-crossing) connector mathHub.js's own
// serpentineOrder/renderMathTrails use, copied for the same reason every
// other piece of this engine is: each zone's own nodes get one clean
// winding line through just that zone, not one radiating from the
// world's shared CENTER.
function serpentineOrder(points) {
  const rows = new Map();
  for (const p of points) {
    if (!rows.has(p.row)) rows.set(p.row, []);
    rows.get(p.row).push(p);
  }
  const rowIndices = [...rows.keys()].sort((a, b) => a - b);
  const ordered = [];
  rowIndices.forEach((r, i) => {
    const rowPts = rows.get(r).sort((a, b) => a.x - b.x);
    if (i % 2 === 1) rowPts.reverse();
    ordered.push(...rowPts);
  });
  return ordered;
}

function renderFieldsTrails(zoneGroups) {
  return zoneGroups
    .map(({ points }) => {
      if (points.length < 2) return "";
      const ordered = serpentineOrder(points);
      const d = ordered.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
      return `<path d="${d}" stroke="#5c4a3a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.85" />`;
    })
    .join("");
}

function renderSkillMarker({ item: skill, x, y }, subject) {
  const progress = gameState.getSkillProgress(skill.id);
  const totalLessons = getLessonCount(skill.id);
  const stateClass = progress.mastered ? "is-mastered" : "is-open";
  return `
    <div class="hub-marker-wrap" style="left:${x}px;top:${y}px;">
      <button class="hub-skill-marker node-circle node-circle-small ${stateClass}" data-skill="${skill.id}"
        style="--node-color:${subject.color}"
        aria-label="${skill.name}: ${progress.mastered ? "mastered" : `${progress.lessonsCompleted} of ${totalLessons} lessons complete`}">
        ${progress.mastered ? "✓" : ""}
      </button>
      <span class="hub-skill-name">${skill.name}</span>
    </div>
  `;
}

function renderBossMarker(boss, bossStateClass, subject) {
  const locked = bossStateClass === "is-locked";
  const cleared = bossStateClass === "is-cleared";
  return `
    <div class="hub-marker-wrap" style="left:${BOSS_POS.x}px;top:${BOSS_POS.y}px;">
      <button class="hub-boss-marker ${bossStateClass}" data-boss ${locked ? "disabled" : ""}
        aria-label="${boss.name}, ${subject.name} Boss Quiz${cleared ? " (cleared)" : locked ? `: locked until every skill on this island is mastered` : ""}">
        ${monsterSVG(boss.avatar, { size: 74 })}
        ${cleared ? `<span class="hub-boss-crown">👑</span>` : locked ? `<span class="hub-boss-lock">🔒</span>` : ""}
      </button>
      <span class="hub-skill-name hub-boss-name">${locked ? "🔒 " : ""}${boss.name}</span>
    </div>
  `;
}

// Samples the live rendered shoreline paths — same technique as
// mathHub.js's own buildIslandPolygons (and hubWorld.js's shared
// buildShorelinePolygons, predated by both private copies): any island
// shape works here as long as it's drawn as one or more filled `SAND`
// paths, so this never needs to know this file's own organicIslandPoints
// math to stay correct.
function buildIslandPolygons(root) {
  const sandPaths = root.querySelectorAll(`.hub-scene-svg path[fill="${SAND}"]`);
  const samplesPerIsland = 48;
  return Array.from(sandPaths).map((path) => {
    const len = path.getTotalLength();
    return Array.from({ length: samplesPerIsland }, (_, i) => {
      const p = path.getPointAtLength((i / samplesPerIsland) * len);
      return { x: p.x, y: p.y };
    });
  });
}

export function renderSatMathHub(root, navigate, subject) {
  const territories = computeTerritories(subject);
  const layout = buildLayout(territories);

  // Built once, in the same ZONES order renderWorldSvg's own internal
  // zoneGroups will end up in (it derives its order from first
  // occurrence in `layout`, and `layout` is built by flatMapping
  // territories in ZONES' own order, each contributing a contiguous run
  // — so index i here always lines up with regionShapes' own zoneGroups[i]).
  const zoneGroups = ZONES.map((zone) => ({ zone, points: layout.filter((p) => p.zone === zone) }));
  const boxes = zoneGroups.map(({ points }) => (points.length ? computeBox(points) : null));
  const bossBbox = computeBossBbox();
  const bridgeSpans = computeBridgeSpans(boxes, bossBbox);
  const bridgePolygons = bridgeSpans.map((s) => bridgePolygon(s.ax, s.ay, s.bx, s.by, BRIDGE_HALF_WIDTH));

  const allMastered = subject.skills.every((skill) => gameState.isMastered(skill.id));
  const bossCleared = gameState.isBossCleared(subject.id);
  const boss = getBossMonster(subject.id, gameState.level);
  const bossStateClass = bossCleared ? "is-cleared" : allMastered ? "is-unlocked" : "is-locked";

  // No second dashed bossBridge line — the nearest topic island's own
  // plank bridge (computeBridgeSpans' own toBoss span) already reaches
  // the boss's island; see mathHub.js's own identical comment on this
  // exact option for why an empty-returning function (not simply
  // omitting it) is required.
  const sceneSvg = renderWorldSvg(layout, {
    ariaLabel:
      "Function Fields, an archipelago of separate islands floating in open sky — algebra, advanced math, problem-solving & data analysis, and geometry & trigonometry — each with its own trail of math skills, connected by rope-and-plank bridges down to the boss's own island",
    landmass: () => "",
    regionShapes: makeRegionShapes(boxes, bridgeSpans, bossBbox),
    trails: renderFieldsTrails,
    bossBridge: () => "",
  });

  root.innerHTML = `
    ${hudHTML("map")}
    <main class="screen island-screen hub-island-screen sky-scene" style="--island-color:${subject.color};--island-bg:${subject.bg};${glowVars(subject.color)}">
      <button class="back-btn" data-back>&larr; Back to Map</button>
      <h1 class="island-heading">${subject.icon} ${subject.place}</h1>
      <p class="map-subtitle hub-hint" id="hubHint">🧭 Walk your monster with WASD (or the joystick) across the islands — every bridge leads to a skill</p>
      <div class="hub-viewport" id="hubViewport">
        <button class="hub-fullscreen-btn" id="hubFullscreenBtn" type="button" aria-label="Enter fullscreen">⛶</button>
        ${renderLegend()}
        ${joystickHTML("hubJoystick")}
        <div class="hub-world" id="hubWorld" style="width:${WORLD_W}px;height:${WORLD_H}px;">
          ${sceneSvg}
          ${layout.map((p) => renderSkillMarker(p, subject)).join("")}
          ${renderBossMarker(boss, bossStateClass, subject)}
          <div class="hub-avatar" id="hubAvatar" aria-hidden="true">${monsterSVG(gameState.getDisplayAvatar(), { size: 64 })}</div>
        </div>
      </div>
    </main>
  `;

  let stop = () => {};
  const goTo = (screen, params) => {
    stop();
    navigate(screen, params);
  };

  wireHud(root, goTo);
  root.querySelector("[data-back]").addEventListener("click", () => goTo("map"));
  root.querySelectorAll("[data-skill]").forEach((btn) => {
    btn.addEventListener("click", () => goTo("skillPath", { skillId: btn.dataset.skill, subjectId: subject.id }));
  });
  root.querySelector("[data-boss]")?.addEventListener("click", () => goTo("bossQuiz", { subjectId: subject.id }));

  const unwireFullscreen = wireFullscreenToggle(root.querySelector("#hubViewport"), root.querySelector("#hubFullscreenBtn"));

  const islandPolygons = buildIslandPolygons(root);
  const walkablePolygons = [...islandPolygons, ...bridgePolygons];
  const isWalkable = (px, py) => walkablePolygons.some((poly) => pointInPolygon(px, py, poly));

  const stopMovement = wireMovement({
    avatarEl: root.querySelector("#hubAvatar"),
    worldEl: root.querySelector("#hubWorld"),
    viewportEl: root.querySelector("#hubViewport"),
    hintEl: root.querySelector("#hubHint"),
    joystickEl: root.querySelector("#hubJoystick"),
    spawn: computeSpawnPoint(layout),
    isWalkable,
    targets: [
      { x: BOSS_POS.x, y: BOSS_POS.y, radius: BOSS_TRIGGER_RADIUS, gate: () => allMastered, onArrive: () => goTo("bossQuiz", { subjectId: subject.id }) },
      ...layout.map((p) => ({
        x: p.x,
        y: p.y,
        radius: SKILL_TRIGGER_RADIUS,
        onArrive: () => goTo("skillPath", { skillId: p.item.id, subjectId: subject.id }),
      })),
    ],
  });
  stop = () => {
    stopMovement();
    unwireFullscreen();
  };
}

// Exported for tests only — lets regression tests build the same real
// layout/boxes/bridges this file computes internally without needing a
// live DOM.
export function computeFieldsLayout(subject) {
  const territories = computeTerritories(subject);
  const layout = buildLayout(territories);
  const zoneGroups = ZONES.map((zone) => ({ zone, points: layout.filter((p) => p.zone === zone) }));
  const boxes = zoneGroups.map(({ points }) => (points.length ? computeBox(points) : null));
  const bossBbox = computeBossBbox();
  const bridgeSpans = computeBridgeSpans(boxes, bossBbox);
  return { layout, zoneGroups, boxes, bossBbox, bridgeSpans };
}
export { ZONES, SKILL_TRIGGER_RADIUS, organicIslandPoints, computePads, BRIDGE_HALF_WIDTH, bridgePolygon, computeSpawnPoint, BOSS_FILL };
