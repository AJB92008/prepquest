// Lexicon Shoals' own theme for Chart Reader, Archive Stacks' third
// skill (see lessonTerrain.js for the shared engine every lesson-path
// theme renders through, and celestialCodex.js for this zone's own
// shared palette). Chart Reader is about reading real data displays —
// bar, line, scatter, and pie — so each stop gets a different one of
// those four real chart types, cycling in order, the same "a different
// real chart type each time" idea Lab Archipelago's own Graph Gazer uses
// (see graphGazerDeck.js), just redrawn as a floating brass astrolabe
// with the chart's own shape traced in starlight instead of a monitor
// screen.
import { COL_W, renderTrailPath, blobPoints, closedBlobPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SKY_TOP = "#2b2657";
const SKY_BOTTOM = "#141233";
const GOLD = "#f0cf86";
const GOLD_DIM = "#c9a668";
const PARCHMENT = "#f3ecd6";
const CLOUD = "#e9e6f5";
const BRASS = "#a9873f";

function defs() {
  return `
    <defs>
      <linearGradient id="chartSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="55%" stop-color="#1d1a45" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
    </defs>
  `;
}

function renderStars(totalHeight) {
  const count = Math.max(16, Math.round((totalHeight / COL_W) * 18));
  return Array.from({ length: count }, (_, i) => {
    const y = (i * 149) % totalHeight;
    const x = (i * 163) % COL_W;
    const r = 1 + (i % 2) * 0.5;
    const opacity = (0.22 + ((i * 17) % 40) / 100).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${PARCHMENT}" opacity="${opacity}" />`;
  }).join("");
}

function renderClouds(totalHeight) {
  const spots = [
    { fx: 0.1, fy: 0.28, r: 38 },
    { fx: 0.88, fy: 0.16, r: 32 },
    { fx: 0.2, fy: 0.62, r: 44 },
    { fx: 0.78, fy: 0.9, r: 36 },
  ];
  return spots
    .map((s, i) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      const pts = blobPoints(cx, cy, s.r, 12, i * 4.4 + 3);
      return `<path d="${closedBlobPath(pts)}" fill="${CLOUD}" opacity="0.07" />`;
    })
    .join("");
}

// One point of an SVG arc, `r` out from `cx,cy` at angle `a` (radians,
// 0 = straight up, clockwise) — the shared building block every wedge
// below traces its own path from.
function arcPoint(cx, cy, r, a) {
  return { x: cx + Math.sin(a) * r, y: cy - Math.cos(a) * r };
}

const R = 52;

function chartBar(cx, cy) {
  const heights = [0.3, 0.7, 0.48, 0.9];
  const baseY = cy + R * 0.55;
  const spacing = (R * 1.5) / (heights.length - 1);
  const startX = cx - R * 0.75;
  return heights
    .map((h, i) => {
      const x = startX + i * spacing;
      const topY = baseY - h * R * 1.1;
      return `
        <line x1="${x.toFixed(1)}" y1="${baseY.toFixed(1)}" x2="${x.toFixed(1)}" y2="${topY.toFixed(1)}" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" opacity="0.75" />
        <circle cx="${x.toFixed(1)}" cy="${topY.toFixed(1)}" r="4" fill="${PARCHMENT}" />
      `;
    })
    .join(`<line x1="${(startX - 6).toFixed(1)}" y1="${baseY.toFixed(1)}" x2="${(startX + R * 1.5 + 6).toFixed(1)}" y2="${baseY.toFixed(1)}" stroke="${GOLD_DIM}" stroke-width="2" opacity="0.5" />`);
}

function chartLine(cx, cy) {
  const pts = [-0.8, -0.35, 0.05, 0.4, 0.8].map((f, i) => {
    const x = cx + f * R;
    const wobble = [0.2, -0.5, 0.15, -0.35, 0.5][i];
    const y = cy + wobble * R * 0.7;
    return { x, y };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const dots = pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${PARCHMENT}" />`).join("");
  return `<path d="${path}" stroke="${GOLD}" stroke-width="3" fill="none" opacity="0.8" />${dots}`;
}

function chartScatter(cx, cy, seed) {
  const axis = `
    <line x1="${(cx - R * 0.85).toFixed(1)}" y1="${(cy + R * 0.55).toFixed(1)}" x2="${(cx + R * 0.85).toFixed(1)}" y2="${(cy + R * 0.55).toFixed(1)}" stroke="${GOLD_DIM}" stroke-width="2" opacity="0.45" />
    <line x1="${(cx - R * 0.85).toFixed(1)}" y1="${(cy + R * 0.55).toFixed(1)}" x2="${(cx - R * 0.85).toFixed(1)}" y2="${(cy - R * 0.75).toFixed(1)}" stroke="${GOLD_DIM}" stroke-width="2" opacity="0.45" />
  `;
  const dots = Array.from({ length: 9 }, (_, i) => {
    const a = i * 27 + seed;
    const dx = ((a * 13) % 160) - 80;
    const dy = ((a * 31) % 130) - 65;
    return `<circle cx="${(cx + (dx / 80) * R * 0.85).toFixed(1)}" cy="${(cy + (dy / 65) * R * 0.6).toFixed(1)}" r="3.4" fill="${PARCHMENT}" opacity="0.85" />`;
  }).join("");
  return axis + dots;
}

function chartPie(cx, cy) {
  const wedges = [
    { frac: 0.4, fill: GOLD },
    { frac: 0.25, fill: "#dab263" },
    { frac: 0.2, fill: "#b9925a" },
    { frac: 0.15, fill: "#8a7440" },
  ];
  let a = 0;
  return wedges
    .map((w) => {
      const a0 = a;
      a += w.frac * Math.PI * 2;
      const p0 = arcPoint(cx, cy, R * 0.85, a0);
      const p1 = arcPoint(cx, cy, R * 0.85, a);
      const large = a - a0 > Math.PI ? 1 : 0;
      return `<path d="M${cx},${cy} L${p0.x.toFixed(1)},${p0.y.toFixed(1)} A${(R * 0.85).toFixed(1)},${(R * 0.85).toFixed(1)} 0 ${large} 1 ${p1.x.toFixed(1)},${p1.y.toFixed(1)} Z" fill="${w.fill}" stroke="${SKY_BOTTOM}" stroke-width="1.5" opacity="0.9" />`;
    })
    .join("");
}

const CHART_KINDS = [chartBar, chartLine, chartScatter, chartPie];

// A brass astrolabe ring around whichever chart this stop gets — two
// concentric circles plus four short tick marks, so every disc reads as
// "an instrument," not just a floating icon.
function renderAstrolabe(cx, cy, chartFn, seed) {
  const ticks = [0, 90, 180, 270]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      const inner = arcPoint(cx, cy, R + 6, a);
      const outer = arcPoint(cx, cy, R + 14, a);
      return `<line x1="${inner.x.toFixed(1)}" y1="${inner.y.toFixed(1)}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="${BRASS}" stroke-width="2.5" />`;
    })
    .join("");
  return `
    <circle cx="${cx}" cy="${cy}" r="${R + 16}" fill="#1c1a45" stroke="${BRASS}" stroke-width="3" />
    <circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="none" stroke="${BRASS}" stroke-width="1.5" opacity="0.6" />
    ${ticks}
    ${chartFn(cx, cy, seed)}
  `;
}

function renderCharts(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderAstrolabe(p.x, p.y, CHART_KINDS[i % CHART_KINDS.length], i * 7 + 1))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#241f45" stroke="${GOLD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Archive Stacks under a violet night sky: a row of brass astrolabes, each tracing a different real chart type — bar, line, scatter, pie — in starlight, connecting every Chart Reader lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#chartSky)" />
      <g>${renderStars(totalHeight)}</g>
      <g>${renderClouds(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_DIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.9" />
      <g>${renderCharts(positions)}</g>
    </svg>
  `;
}

export const starChartGalleryTheme = {
  trailBand: BAND,
  mapBg: SKY_BOTTOM,
  hintColor: "rgba(243, 236, 214, 0.9)",
  renderScene,
};
