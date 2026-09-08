// SAT Reading & Writing's own "hub" island, Lexicon Shoals — the same
// big-walkable-island treatment ACT's 4 subjects already get (see
// islandHub.js's own header comment for the original brief), reskinned
// for SAT's own Sky Islands theme (see .sky-scene in style.css and
// worldMap.js's own WORLD_MAP_THEMES) instead of ACT's ocean: this
// island floats in open sky rather than open water, so its own
// <main>/.hub-viewport use .sky-scene's palette instead of .ocean-scene's.
// Structurally its own thing among the walkable hubs, not just a
// reskin: a closed ring of land — an atoll — with a real hole of open
// sky at its own center, rather than an open-ended spine (Wordwood
// Isle's spiral), lobes fused around a shared point (Athenaeum Reef), or
// separate causeway-linked islands (Numeria Peaks/Lab Archipelago). See
// hubWorld.js's own computeRingLayout/renderRingIsland doc comments for
// the shared math and art this shape is built from. The boss himself
// sits on his own small islet floating in the exact middle of that
// hollow center — the lagoon of open sky stays open everywhere else —
// reached by one bridge per zone rather than a single bridge off one
// particular side, so every zone's own path converges on the same
// shared boss. Still simpler than Wordwood Isle in one real way beyond
// the shape itself — no bonus landmark, since SAT Reading & Writing has
// no separate "vocabulary builder" feature the way ACT English does, so
// this island is just its 4 zones and the boss, nothing more.
import { gameState } from "../state.js";
import { hudHTML, wireHud, showToast } from "./hud.js";
import { showDevPanel, toggleDevPanel } from "./devPanel.js";
import { monsterSVG } from "./monster.js";
import { getBossMonster } from "../data/bossMonsters.js";
import { getLessonCount } from "../data/questions/index.js";
import { glowVars } from "./pathTrail.js";
import { closedBlobPath } from "./lessonTerrain.js";
import {
  BOSS_TRIGGER_RADIUS,
  WORLD_W,
  WORLD_H,
  decorationPos,
  zoneCenter,
  computeRingLayout,
  ringBoundaryPoints,
  sampleClosedBlobPath,
  organicRingPoints,
  renderWorldSvg,
  renderRingIsland,
  renderCurveTrails,
  renderPlankBridge,
  wireMovement,
  wireFullscreenToggle,
  joystickHTML,
  pointInPolygon,
} from "./hubWorld.js";

// The ring's own geometry — one shared center, an outer shore radius and
// an inner hole radius (INNER_RADIUS > 0, unlike every other hub's own
// shape, is what actually makes this a loop rather than a disc).
// OUTER_RADIUS keeps the ring's own worst-case jittered edge (organicRing
// Points' own default ±10%, see RING_JITTER below) safely inside
// WORLD_W/H's own WALK_MARGIN on every side; INNER_RADIUS keeps the hole
// a real, clearly-open gap rather than a pinhole. computeRingLayout's own
// SHORE_RING_WIDTH-aware inset keeps every skill marker on real land
// regardless of that same jitter — see this file's own render call and
// that function's doc comment in hubWorld.js.
const RING_CENTER = { x: 1100, y: 780 };
const OUTER_RADIUS = 520;
const INNER_RADIUS = 230;
const SHORE_RING_WIDTH = 46;
const RING_JITTER = 0.1;
const RING_SEED = 3;
const BOSS_BRIDGE_WIDTH = 68;

// The boss's own islet, floating dead center in the ring's own hollow
// middle. BOSS_ISLET_RADIUS (100) is this islet's *outer*, sand-shore
// radius — same role OUTER_RADIUS plays for the ring itself, i.e. this
// is also the radius bridges anchor against and isWalkable checks —
// comfortably smaller than INNER_RADIUS (230) even at both radii's own
// worst-case ±10% jitter (worst-case islet edge ~110 vs worst-case hole
// edge ~207), leaving real open sky for the 4 bridges to visibly cross.
const BOSS_ISLET_RADIUS = 100;
const BOSS_ISLET_RIM = 14;
const BOSS_ISLET_SEED = 7;
// How far each bridge's own two ends get pulled past the coastline
// vertex they're anchored to — one end deeper into the ring's own land,
// the other deeper into the islet's — so each end genuinely overlaps
// real walkable ground instead of just grazing a single boundary point.
// See this file's own render call for the full reasoning (same problem,
// and same fix, as the single external bridge this design replaced).
const BRIDGE_INSET = 40;

const DEV_MODE_CLICKS = 10;
const DEV_MODE_WINDOW_MS = 5000;
// Module-level (not per-render) so rapid clicks keep counting across the
// innerHTML rebuild every navigate() triggers — same reasoning
// islandHub.js's own goat click tracking uses.
let goatClickTimestamps = [];

// computeRingLayout's own alternating-row placement keeps every pair of
// markers on this ring at least ~127px apart at these exact
// RING_CENTER/OUTER_RADIUS/INNER_RADIUS/SHORE_RING_WIDTH values (checked
// by hand against the real 17-skill sat-rw array, not just eyeballed —
// change any of those four and re-check), comfortably past two 50px
// hitboxes' own 2*50=100 overlap threshold.
const SKILL_TRIGGER_RADIUS = 50;

// Four wedges around the ring, in the same order as SAT_SUBJECTS' own
// sat-rw skill array (Information and Ideas, Craft and Structure,
// Expression of Ideas, Standard English Conventions — see
// REPORTING_CATEGORIES["sat-rw"] in data/satSkills.js) — computeRingLayout
// slices the skills array sequentially across ZONES in array order, same
// as computeCurveLayout does for islandHub.js's own 4 zones, so keeping
// that order here means each wedge lines up with its own real reporting
// category the same way.
// `description` is what the legend shows for each zone — a plain
// description of what it covers, not the official College Board category
// name, matching islandHub.js's own reasoning for its own zones.
// Archive Stacks' own fill is a soft twilight violet, not the plain
// khaki every other zone here still uses — it's the one zone whose
// actual lesson-path scenes (see lessonThemes/celestialCodex.js and its
// four siblings) all share a specific "Celestial Archive" palette, a
// violet night sky lit by warm gold starlight, so the wedge itself reads
// as a piece of that same sky rather than clashing with what a player
// actually sees once they walk in. Kept at roughly the same lightness/
// saturation as its 3 sibling wedges below (all light, fairly
// desaturated pastels) rather than the lesson scenes' own much darker
// background tones, so it reads as "this zone's own hue" without
// looking like a heavy dark patch dropped into an otherwise pastel ring.
const ZONES = [
  { id: "stacks", name: "Archive Stacks", fill: "#a99bd8", description: "Main ideas & evidence", decorations: [] },
  { id: "grove", name: "Etymology Grove", fill: "#8fbf7a", description: "Word choice & structure", decorations: [] },
  { id: "scriptorium", name: "Scriptorium", fill: "#8fb8d9", description: "Organizing your writing", decorations: [] },
  { id: "garrison", name: "Grammar Garrison", fill: "#9aa3ad", description: "Grammar & sentence rules", decorations: [] },
];

function renderLegend() {
  return `
    <div class="hub-legend" aria-hidden="true">
      <p class="hub-legend-title">Shoal regions</p>
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

// Grammar Garrison's own goat is the dev-mode unlock: 10 clicks within
// 5s, same mechanic islandHub.js's own goat uses — sits at
// decorationPos' own spot #0 off that zone's center.
function computeGoatPos(layout) {
  const garrison = ZONES.find((z) => z.id === "garrison");
  const points = layout.filter((p) => p.zone === garrison);
  if (!points.length) return null;
  const { avgX, avgY } = zoneCenter(points);
  return decorationPos(avgX, avgY, 0, 1);
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
    <div class="hub-marker-wrap" style="left:${RING_CENTER.x}px;top:${RING_CENTER.y}px;">
      <button class="hub-boss-marker is-grammar-golem ${bossStateClass}" data-boss ${locked ? "disabled" : ""}
        aria-label="${boss.name}, ${subject.name} Boss Quiz${cleared ? " (cleared)" : locked ? `: locked until every skill on this island is mastered` : ""}">
        ${monsterSVG(boss.avatar, { size: 92 })}
        ${cleared ? `<span class="hub-boss-crown">👑</span>` : locked ? `<span class="hub-boss-lock">🔒</span>` : ""}
      </button>
      <span class="hub-skill-name hub-boss-name">${locked ? "🔒 " : ""}${boss.name}</span>
    </div>
  `;
}

// The islet's own art: an outer sand-colored shore (same style, same
// jitter treatment, as the ring's own coastline) with a darker, inset
// fill reading as scorched or ominous ground — this islet is the one
// spot on the whole map that's deliberately *not* one of the 4 zones'
// own colors, so it reads as its own distinct "boss territory" the
// moment it comes into view rather than a 5th zone.
function renderBossIslet(outerCtrl) {
  const innerPts = organicRingPoints(RING_CENTER, BOSS_ISLET_RADIUS - BOSS_ISLET_RIM, BOSS_ISLET_SEED + 3, 60, [-0.1, 0.1]);
  return `<path d="${closedBlobPath(outerCtrl)}" fill="#ecdfb8" /><path d="${closedBlobPath(innerPts)}" fill="#2c211c" opacity="0.82" />`;
}

// A point's own angle around `center`, and the shortest angular distance
// between two such angles (0..π, wraparound-safe) — used below to find
// each zone's own bridge anchor by direction rather than raw distance,
// since a jittery boundary's own nearest-by-distance point can otherwise
// belong to a neighboring zone.
function angleAround(center, p) {
  return Math.atan2(p.y - center.y, p.x - center.x);
}
function angularDist(a, b) {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}
function nearestByAngle(pts, center, targetAngle) {
  return pts.reduce((best, p) => (angularDist(angleAround(center, p), targetAngle) < angularDist(angleAround(center, best), targetAngle) ? p : best));
}
// Moves `p` along its own center->p ray by `dist` — positive pushes it
// further from `center` (deeper into the ring's own land, past the
// hole's edge), negative pulls it toward `center` (deeper into the
// islet's own land) — see BRIDGE_INSET's own comment for why either
// bridge end needs this at all.
function offsetFromCenter(p, center, dist) {
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / len) * dist, y: p.y + (dy / len) * dist };
}

// A rectangle polygon for the boss bridge's own walkable span — a bridge
// itself isn't a sand-colored path pointInPolygon's own ring checks would
// otherwise recognize as land, so without this the avatar would hit
// invisible sky the moment it stepped off the ring onto the bridge,
// unable to reach the boss despite the visible crossing right there.
// Same shape islandHub.js's own private copy of this exact helper
// builds for its own two bridges; `halfWidth` should stay a little under
// the bridge's own rendered `width / 2` so the walkable strip stays
// inside the rails rather than hanging just past them.
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

// Where an avatar first spawns: the middle of the walkable band, at the
// top of the ring — an arbitrary but stable point on the loop, since
// there's no "start" the way a spine has two distinct ends.
const SPAWN_ANGLE = -Math.PI / 2;
const SPAWN_RADIUS = (INNER_RADIUS + OUTER_RADIUS) / 2;

export function renderSatRwHub(root, navigate, subject) {
  const layout = computeRingLayout(subject.skills, ZONES, {
    center: RING_CENTER,
    outerRadius: OUTER_RADIUS,
    innerRadius: INNER_RADIUS,
    shoreRingWidth: SHORE_RING_WIDTH,
  });
  const goatPos = computeGoatPos(layout);

  const allMastered = subject.skills.every((skill) => gameState.isMastered(skill.id));
  const bossCleared = gameState.isBossCleared(subject.id);
  const boss = getBossMonster(subject.id, gameState.level);
  const bossStateClass = bossCleared ? "is-cleared" : allMastered ? "is-unlocked" : "is-locked";

  // The ring's own outer/inner boundaries — independently re-derived here
  // (not read back off the DOM) from the exact same params renderRingIsland
  // below draws from, the same "same inputs, matching geometry" contract
  // ringBoundaryPoints' own doc comment describes. Sampled through
  // sampleClosedBlobPath rather than used as raw control points, so the
  // walkable check below matches the *rendered* coastline (a quad-Bézier
  // through midpoints, bulging toward these points but never quite
  // reaching them) instead of points the curve only approximates — see
  // that function's own doc comment for why the gap between the two can
  // otherwise run tens of pixels wide at a jittery seam.
  const { outer: ringOuterCtrl, inner: ringInnerCtrl } = ringBoundaryPoints({
    center: RING_CENTER,
    outerRadius: OUTER_RADIUS,
    innerRadius: INNER_RADIUS,
    seed: RING_SEED,
    jitter: RING_JITTER,
  });
  const ringOuter = sampleClosedBlobPath(ringOuterCtrl);
  const ringInner = sampleClosedBlobPath(ringInnerCtrl);

  // The islet's own outer (sand-shore) boundary, same "independently
  // re-derive matching geometry from identical params" contract as the
  // ring's own boundaries above — sampled the same way for the same
  // reason (its walkable check needs to match its own rendered curve,
  // not just the raw jittered control points).
  const isletOuterCtrl = organicRingPoints(RING_CENTER, BOSS_ISLET_RADIUS, BOSS_ISLET_SEED, 60, [-0.1, 0.1]);
  const isletOuter = sampleClosedBlobPath(isletOuterCtrl);

  // One bridge per zone, anchored at that zone's own angular midpoint —
  // the same wedge midpoint computeRingLayout uses to center its own
  // markers — so every zone's own trail visibly leads toward the same
  // bridge rather than an arbitrary or unrelated point on the ring.
  // Each end is pulled BRIDGE_INSET past its own coastline vertex (see
  // that constant's own comment) so both ends genuinely overlap real
  // land instead of grazing a single boundary point.
  const bossBridges = ZONES.map((zone, i) => {
    const targetAngle = ((i + 0.5) / ZONES.length) * Math.PI * 2;
    const ringPt = nearestByAngle(ringInner, RING_CENTER, targetAngle);
    const isletPt = nearestByAngle(isletOuter, RING_CENTER, targetAngle);
    return {
      zone,
      ringEnd: offsetFromCenter(ringPt, RING_CENTER, BRIDGE_INSET),
      isletEnd: offsetFromCenter(isletPt, RING_CENTER, -BRIDGE_INSET),
    };
  });

  const sceneSvg = renderWorldSvg(layout, {
    ariaLabel:
      "Lexicon Shoals, one ring-shaped atoll of floating land looped around a hollow gap of open sky at its own center, split into four wedges around the loop — Archive Stacks, Etymology Grove, the Scriptorium, and Grammar Garrison — with the boss's own islet floating dead center in that hollow, reached by one bridge per wedge",
    landmass: () => "",
    regionShapes: (zoneGroups) => renderRingIsland(zoneGroups, { center: RING_CENTER, outerRadius: OUTER_RADIUS, innerRadius: INNER_RADIUS, seed: RING_SEED, shoreRingWidth: SHORE_RING_WIDTH }),
    trails: renderCurveTrails,
    // Same "dressed-up bridge" idea as islandHub.js's own Wordwood Isle
    // bridges, just without that file's own ominous mist/torch treatment
    // (this island stays plain otherwise, see this file's own header
    // comment) — the islet itself plus all 4 plank bridges, since
    // supplying a custom bossBridge callback replaces renderWorldSvg's
    // own default path+lair entirely and there's no single pair of
    // points to hand it here.
    bossBridge: () =>
      renderBossIslet(isletOuterCtrl) + bossBridges.map((b) => renderPlankBridge(b.ringEnd.x, b.ringEnd.y, b.isletEnd.x, b.isletEnd.y, { width: BOSS_BRIDGE_WIDTH })).join(""),
  });

  root.innerHTML = `
    ${hudHTML("map")}
    <main class="screen island-screen hub-island-screen sky-scene" style="--island-color:${subject.color};--island-bg:${subject.bg};${glowVars(subject.color)}">
      <button class="back-btn" data-back>&larr; Back to Map</button>
      <h1 class="island-heading">${subject.icon} ${subject.place}</h1>
      <p class="map-subtitle hub-hint" id="hubHint">🧭 Walk your monster with WASD (or the joystick) around the ring — every trail leads to a skill</p>
      <div class="hub-viewport" id="hubViewport">
        <button class="hub-fullscreen-btn" id="hubFullscreenBtn" type="button" aria-label="Enter fullscreen">⛶</button>
        ${renderLegend()}
        ${joystickHTML("hubJoystick")}
        <div class="hub-world" id="hubWorld" style="width:${WORLD_W}px;height:${WORLD_H}px;">
          ${sceneSvg}
          ${layout.map((p) => renderSkillMarker(p, subject)).join("")}
          ${renderBossMarker(boss, bossStateClass, subject)}
          ${
            goatPos
              ? `<button class="hub-goat-btn" id="hubGoatBtn" type="button" style="left:${goatPos.x}px;top:${goatPos.y}px" aria-label="A goat">🐐</button>`
              : ""
          }
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

  root.querySelector("#hubGoatBtn")?.addEventListener("click", () => {
    const now = Date.now();
    goatClickTimestamps.push(now);
    goatClickTimestamps = goatClickTimestamps.filter((t) => now - t <= DEV_MODE_WINDOW_MS);
    if (goatClickTimestamps.length < DEV_MODE_CLICKS) return;
    goatClickTimestamps = [];
    if (!gameState.devModeUnlocked) {
      gameState.setDevModeUnlocked(true);
      showToast("🛠️ Developer Mode unlocked!");
      showDevPanel(goTo);
    } else {
      toggleDevPanel(goTo);
    }
  });

  const unwireFullscreen = wireFullscreenToggle(root.querySelector("#hubViewport"), root.querySelector("#hubFullscreenBtn"));

  // The avatar's walkable ground: inside the outer shore but outside the
  // inner hole (a real annulus test, not a single polygon the way every
  // other hub's own buildShorelinePolygons-sampled shore is — an "inside
  // this AND outside that" check has no single polygon to sample off the
  // DOM), OR on the boss's own islet, OR on one of the 4 bridges' own
  // rectangular strips — same "bridgePolygon alongside the real shore
  // polygons" idea islandHub.js's own vocab/boss bridges use, since a
  // bridge itself isn't a sand-colored path and would otherwise leave the
  // avatar stuck the moment it stepped off real land onto one.
  const bridgeWalkablePolys = bossBridges.map((b) => bridgePolygon(b.ringEnd.x, b.ringEnd.y, b.isletEnd.x, b.isletEnd.y, BOSS_BRIDGE_WIDTH / 2 - 6));
  const isWalkable = (px, py) =>
    (pointInPolygon(px, py, ringOuter) && !pointInPolygon(px, py, ringInner)) ||
    pointInPolygon(px, py, isletOuter) ||
    bridgeWalkablePolys.some((poly) => pointInPolygon(px, py, poly));

  const stopMovement = wireMovement({
    avatarEl: root.querySelector("#hubAvatar"),
    worldEl: root.querySelector("#hubWorld"),
    viewportEl: root.querySelector("#hubViewport"),
    hintEl: root.querySelector("#hubHint"),
    joystickEl: root.querySelector("#hubJoystick"),
    isWalkable,
    spawn: {
      x: RING_CENTER.x + Math.cos(SPAWN_ANGLE) * SPAWN_RADIUS,
      y: RING_CENTER.y + Math.sin(SPAWN_ANGLE) * SPAWN_RADIUS,
    },
    targets: [
      { x: RING_CENTER.x, y: RING_CENTER.y, radius: BOSS_TRIGGER_RADIUS, gate: () => allMastered, onArrive: () => goTo("bossQuiz", { subjectId: subject.id }) },
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
