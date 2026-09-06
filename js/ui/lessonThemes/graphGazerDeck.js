// Graph Gazer's own theme (see lessonTerrain.js for the shared engine
// every lesson-path theme renders through) — Data Deck's own server-
// room floor, a monitor screen standing at every stop, each one showing
// a different chart type in rotation (bar, line, scatter, pie) — the
// actual ACT Science "which chart is this passage even showing you"
// skill, drawn literally rather than abstracted into an unrelated
// motif. Shares its floor/circuit-trace styling with dataDiveDeck.js
// (Data Diver, sc-interpret's own theme) since both sit in the same
// Data Deck zone — see scienceHub.js's own ZONES — but each file stays
// self-contained rather than importing from the other, same convention
// every lesson theme in this folder already follows.
import { COL_W, clamp, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 70, max: COL_W - 70 };
const FLOOR = "#1c2430";
const AMBER = "#e8b84f";

function renderServerRack(x, y) {
  const lights = [0, 1, 2].map((i) => {
    const on = (Math.sin(x * 0.7 + i * 3.1) + 1) / 2 > 0.4;
    return `<circle cx="${(x + 9).toFixed(1)}" cy="${(y - 18 + i * 9).toFixed(1)}" r="2.2" fill="${on ? "#7fe08a" : "#2c3440"}" />`;
  });
  return `
    <ellipse cx="${x}" cy="${y + 26}" rx="14" ry="5" fill="rgba(0,0,0,0.35)" />
    <rect x="${x - 12}" y="${y - 24}" width="24" height="52" rx="2" fill="#2a323e" stroke="#10151c" stroke-width="2" />
    ${lights.join("")}
  `;
}

function renderBarChart(x, y) {
  const bars = [0.4, 0.75, 0.55, 0.9];
  const barsSvg = bars
    .map((h, i) => `<rect x="${(x - 18 + i * 10).toFixed(1)}" y="${(y + 12 - h * 26).toFixed(1)}" width="7" height="${(h * 26).toFixed(1)}" fill="${AMBER}" />`)
    .join("");
  return `<rect x="${x - 24}" y="${y - 20}" width="48" height="40" rx="2" fill="#12222a" stroke="#0a1218" stroke-width="2" />${barsSvg}`;
}

function renderLineChart(x, y) {
  const pts = [0, 1, 2, 3, 4].map((i) => `${(x - 20 + i * 10).toFixed(1)},${(y + 8 - Math.sin(i * 1.3 + x) * 10).toFixed(1)}`);
  return `<rect x="${x - 24}" y="${y - 20}" width="48" height="40" rx="2" fill="#12222a" stroke="#0a1218" stroke-width="2" /><polyline points="${pts.join(" ")}" stroke="${AMBER}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
}

function renderScatterChart(x, y) {
  const dots = [0, 1, 2, 3, 4, 5].map((i) => {
    const dx = (Math.sin(i * 12.9 + x) * 0.5 + 0.5) * 40 - 20;
    const dy = (Math.sin(i * 7.3 + x * 1.7) * 0.5 + 0.5) * 30 - 15;
    return `<circle cx="${(x + dx).toFixed(1)}" cy="${(y + dy).toFixed(1)}" r="2.6" fill="${AMBER}" />`;
  });
  return `<rect x="${x - 24}" y="${y - 20}" width="48" height="40" rx="2" fill="#12222a" stroke="#0a1218" stroke-width="2" />${dots.join("")}`;
}

function renderPieChart(x, y) {
  const r = 16;
  return `
    <rect x="${x - 24}" y="${y - 20}" width="48" height="40" rx="2" fill="#12222a" stroke="#0a1218" stroke-width="2" />
    <circle cx="${x}" cy="${y}" r="${r}" fill="#3a4048" />
    <path d="M${x},${y} L${x},${y - r} A${r},${r} 0 0 1 ${(x + r * 0.95).toFixed(1)},${(y - r * 0.31).toFixed(1)} Z" fill="${AMBER}" />
  `;
}

const CHARTS = [renderBarChart, renderLineChart, renderScatterChart, renderPieChart];

function renderMonitorAt(x, y, index) {
  const chart = CHARTS[index % CHARTS.length](x, y - 4);
  return `
    <ellipse cx="${x}" cy="${y + 30}" rx="26" ry="7" fill="rgba(0,0,0,0.3)" />
    <rect x="${x - 5}" y="${y + 18}" width="10" height="10" fill="#3a3f4a" />
    <rect x="${x - 16}" y="${y + 26}" width="32" height="5" rx="2" fill="#3a3f4a" />
    ${chart}
  `;
}

function computeMonitors(positions) {
  const mid = (BAND.min + BAND.max) / 2;
  return positions.slice(0, -1).map((p, i) => {
    const side = p.x < mid ? 1 : -1;
    return { x: clamp(p.x + side * 95, BAND.min + 30, BAND.max - 30), y: p.y, index: i };
  });
}

function renderMonitors(positions) {
  return computeMonitors(positions)
    .map(({ x, y, index }) => renderMonitorAt(x, y, index))
    .join("");
}

// A scattered handful of server racks, independent of lesson count —
// texture for the floor, not one per stop the way the monitors are.
function renderRacks(totalHeight) {
  const count = Math.max(5, Math.round(totalHeight / 420));
  return Array.from({ length: count }, (_, i) => {
    const x = (i % 2 === 0 ? BAND.min - 30 : BAND.max + 30) + (i % 2 === 0 ? -1 : 1) * 10;
    const y = ((i + 0.5) / count) * totalHeight;
    return renderServerRack(clamp(x, 20, COL_W - 20), y);
  }).join("");
}

// Amber circuit-board traces running the length of the floor — Data
// Deck's own brand color threaded through the ground itself.
function renderCircuitTraces(totalHeight) {
  const count = Math.max(3, Math.round(totalHeight / 500));
  return Array.from({ length: count }, (_, i) => {
    const x = 40 + ((i * 173) % (COL_W - 80));
    const y0 = (i * 251) % totalHeight;
    const y1 = clamp(y0 + 120, 0, totalHeight);
    return `<path d="M${x},${y0} L${x + 30},${(y0 + y1) / 2} L${x},${y1}" stroke="${AMBER}" stroke-width="2" fill="none" opacity="0.25" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#12222a" stroke="${AMBER}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lab Archipelago's Data Deck: a server-room floor lit by amber circuit traces, a monitor showing a different chart at every stop, connecting every Graph Gazer lesson up to ${bossName}'s own clearing">
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="${FLOOR}" />
      <g>${renderCircuitTraces(totalHeight)}</g>
      <g>${renderRacks(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${AMBER}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.7" />
      <g>${renderMonitors(positions)}</g>
    </svg>
  `;
}

export const graphGazerDeckTheme = {
  trailBand: BAND,
  mapBg: FLOOR,
  hintColor: "rgba(232, 184, 79, 0.85)",
  renderScene,
};
