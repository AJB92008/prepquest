// Lexicon Shoals' own theme for Read Between the Lines, Archive Stacks'
// fourth skill (see lessonTerrain.js for the shared engine every
// lesson-path theme renders through, and celestialCodex.js for this
// zone's own shared palette). The skill is named for exactly what the
// scene draws literally: at every stop, a small floating page fragment
// carries two solid, definite ink lines with a gap between them — and
// sitting right in that gap, a faint gold line only visible by its own
// soft glow, the inferred idea the passage never actually states. The
// family's usual warm-on-violet palette leans darker and quieter here
// than its Archive Stacks siblings — this is the one skill in the zone
// about reading what ISN'T directly lit, so the whole scene stays a
// little dimmer on purpose. "Dimmer" isn't "emptier" though: the
// background carries real density of its own — a sparse field of small
// book-spine silhouettes glimpsed in shadow throughout, shadow-stack
// towers now textured with their own faint shelf lines instead of flat
// blobs, and a rare handful of warm distant glimmers (an unseen light
// two rows over) mixed in among the cool starlight — all of it kept
// low-opacity/desaturated so none of it competes with the one thing
// actually meant to draw the eye: the gold line hidden in each
// fragment's own gap.
import { COL_W, clamp, blobPoints, closedBlobPath, renderTrailPath } from "../lessonTerrain.js";

const BAND = { min: 90, max: COL_W - 90 };
const SKY_TOP = "#211d47";
const SKY_BOTTOM = "#0f0e28";
const GOLD = "#f0cf86";
const GOLD_DIM = "#c9a668";
const PARCHMENT = "#f3ecd6";
const INK = "#3a3060";
const SHADOW = "#191636";

function defs() {
  return `
    <defs>
      <linearGradient id="umbralSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}" />
        <stop offset="60%" stop-color="#171540" />
        <stop offset="100%" stop-color="${SKY_BOTTOM}" />
      </linearGradient>
      <radialGradient id="umbralGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.6" />
        <stop offset="100%" stop-color="${GOLD}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;
}

// Sparser than a typical Archive Stacks star field, but fuller than this
// theme's own first pass — this skill's own scene stays quieter on
// purpose (see the header comment), just not bare.
function renderStars(totalHeight) {
  const count = Math.max(14, Math.round((totalHeight / COL_W) * 15));
  return Array.from({ length: count }, (_, i) => {
    const y = (i * 181) % totalHeight;
    const x = (i * 157) % COL_W;
    const opacity = (0.1 + ((i * 9) % 25) / 100).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="1.2" fill="${PARCHMENT}" opacity="${opacity}" />`;
  }).join("");
}

// A rare handful of small, warm-toned points mixed in among the cool
// starlight — unlike a star, each one gets its own faint glow, reading
// as a distant, unseen light source somewhere deeper in the stacks (a
// candle two rows over) rather than the sky itself. Deliberately sparse
// — three or four per scene at most — so each one still registers as a
// small discovery, not another layer of uniform texture.
function renderGlimmers(totalHeight) {
  const spots = [0.09, 0.31, 0.58, 0.79];
  return spots
    .map((f, i) => {
      const x = ((i * 233) % (COL_W - 60)) + 30;
      const y = f * totalHeight;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="url(#umbralGlow)" opacity="0.6" /><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="${GOLD}" opacity="0.7" />`;
    })
    .join("");
}

// Taller, more numerous, and now textured with their own faint shelf
// lines (short horizontal strokes at a few heights within each
// silhouette) instead of a flat, featureless blob — still read as
// distant archive towers glimpsed in shadow, not in any real detail, but
// dense enough now that the background itself reads as "an archive,"
// not just empty dark. Alternating opacity/size across the row sells a
// little depth (some stacks nearer, some further back) rather than one
// flat plane of silhouettes.
function renderShadowStacks(totalHeight) {
  const spots = [
    { fx: 0.1, fy: 0.24, rx: 30, ry: 100, o: 0.55 },
    { fx: 0.24, fy: 0.5, rx: 22, ry: 74, o: 0.36 },
    { fx: 0.9, fy: 0.4, rx: 26, ry: 96, o: 0.5 },
    { fx: 0.76, fy: 0.68, rx: 20, ry: 70, o: 0.34 },
    { fx: 0.06, fy: 0.78, rx: 30, ry: 84, o: 0.55 },
    { fx: 0.94, fy: 0.86, rx: 22, ry: 66, o: 0.38 },
  ];
  return spots
    .map((s, i) => {
      const cx = s.fx * COL_W;
      const cy = s.fy * totalHeight;
      const pts = blobPoints(cx, cy, s.rx, 10, i * 5.1 + 4).map((p) => ({ x: p.x, y: cy + (p.y - cy) * (s.ry / s.rx) }));
      const body = `<path d="${closedBlobPath(pts)}" fill="${SHADOW}" opacity="${s.o}" />`;
      const shelfCount = Math.round(s.ry / 20);
      const shelves = Array.from({ length: shelfCount }, (_, j) => {
        const ly = cy - s.ry + ((j + 1) / (shelfCount + 1)) * s.ry * 2;
        const lw = s.rx * (0.7 + 0.2 * Math.sin(j * 2.1 + i));
        return `<line x1="${(cx - lw).toFixed(1)}" y1="${ly.toFixed(1)}" x2="${(cx + lw).toFixed(1)}" y2="${ly.toFixed(1)}" stroke="${INK}" stroke-width="1.5" opacity="${(s.o * 0.5).toFixed(2)}" />`;
      }).join("");
      return body + shelves;
    })
    .join("");
}

// A sparse field of small, dark book-spine silhouettes scattered through
// the whole scene — never bright, never a focal shape, but real density
// where the first pass had bare sky between the trail's own fragments.
// Same jittered-grid-with-skips technique coralMosaic.js's own
// renderMosaic uses, at a far lower opacity and a much coarser grid so
// it reads as "more archive, still in shadow" rather than competing with
// the fragments themselves.
function renderBookField(totalHeight) {
  const cols = 5;
  const rows = Math.max(6, Math.round(totalHeight / 100));
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = r * 9 + c * 5;
      if ((r * 11 + c * 7) % 3 !== 1) continue;
      const jitterX = ((seed * 31) % 50) - 25;
      const jitterY = ((seed * 23) % 40) - 20;
      const x = clamp((COL_W / cols) * (c + 0.5) + jitterX, 20, COL_W - 20);
      const y = clamp((totalHeight / rows) * (r + 0.5) + jitterY, 20, totalHeight - 20);
      const w = 6 + (seed % 4);
      const h = 16 + (seed % 5) * 2;
      const rot = ((seed * 17) % 16) - 8;
      out.push(`<rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="1.5" fill="${SHADOW}" opacity="0.4" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})" />`);
    }
  }
  return out.join("");
}

// The scene's one real feature: a small torn-parchment fragment, two
// solid ink lines a real reader would actually see, and — sitting right
// in the gap between them — one faint gold line, visible only by its own
// glow, the meaning the passage implies but never states outright.
// Alternates sides of the trail by index parity; boss stop excluded (its
// own clearing is the destination, not another fragment).
function renderInferenceFragment(p, i) {
  const side = i % 2 === 0 ? 1 : -1;
  const cx = p.x + side * 58;
  const cy = p.y;
  const w = 78;
  const h = 46;
  const rot = ((i * 11) % 12) - 6;
  const lineW = w - 20;
  return `
    <g transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})">
      <rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="4" fill="${PARCHMENT}" opacity="0.92" stroke="${GOLD_DIM}" stroke-width="1.6" />
      <line x1="${(cx - lineW / 2).toFixed(1)}" y1="${(cy - 12).toFixed(1)}" x2="${(cx + lineW / 2).toFixed(1)}" y2="${(cy - 12).toFixed(1)}" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="20" fill="url(#umbralGlow)" />
      <line x1="${(cx - lineW / 2 + 6).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + lineW / 2 - 6).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="3 5" opacity="0.95" />
      <line x1="${(cx - lineW / 2).toFixed(1)}" y1="${(cy + 12).toFixed(1)}" x2="${(cx + lineW / 2).toFixed(1)}" y2="${(cy + 12).toFixed(1)}" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
    </g>
  `;
}

function renderFragments(positions) {
  const bossIndex = positions.length - 1;
  return positions
    .filter((_, i) => i !== bossIndex)
    .map((p, i) => renderInferenceFragment(p, i))
    .join("");
}

function renderScene(positions, totalHeight, bossName) {
  const last = positions[positions.length - 1];
  const bossClearing = `<circle cx="${last.x}" cy="${last.y}" r="86" fill="#1a1740" stroke="${GOLD}" stroke-width="4" />`;

  return `
    <svg viewBox="0 0 ${COL_W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" class="lesson-terrain-svg" role="img"
      aria-label="A corner of Lexicon Shoals' Archive Stacks under a dim violet night sky: rows of shadowed archive towers with their own faint shelf lines, a scattered field of small dark book spines, and a few rare warm glimmers of unseen distant light, with floating page fragments — each carrying two solid ink lines and one faint glowing line hidden in the gap between them — connecting every Read Between the Lines lesson up to ${bossName}'s own clearing">
      ${defs()}
      <rect x="0" y="0" width="${COL_W}" height="${totalHeight}" fill="url(#umbralSky)" />
      <g>${renderStars(totalHeight)}</g>
      <g>${renderShadowStacks(totalHeight)}</g>
      <g>${renderBookField(totalHeight)}</g>
      <g>${renderGlimmers(totalHeight)}</g>
      ${bossClearing}
      <path d="${renderTrailPath(positions)}" stroke="${GOLD_DIM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14" fill="none" opacity="0.85" />
      <g>${renderFragments(positions)}</g>
    </svg>
  `;
}

export const umbralArchiveTheme = {
  trailBand: BAND,
  mapBg: SKY_BOTTOM,
  hintColor: "rgba(243, 236, 214, 0.85)",
  renderScene,
};
