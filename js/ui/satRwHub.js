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
// the shared math and art this shape is built from. Still simpler than
// Wordwood Isle in one real way beyond the shape itself — no bonus
// landmark, since SAT Reading & Writing has no separate "vocabulary
// builder" feature the way ACT English does, so this island is just its
// 4 zones and the boss, nothing more.
import { gameState } from "../state.js";
import { hudHTML, wireHud, showToast } from "./hud.js";
import { showDevPanel, toggleDevPanel } from "./devPanel.js";
import { monsterSVG } from "./monster.js";
import { getBossMonster } from "../data/bossMonsters.js";
import { getLessonCount } from "../data/questions/index.js";
import { glowVars } from "./pathTrail.js";
import {
  BOSS_POS,
  BOSS_TRIGGER_RADIUS,
  WORLD_W,
  WORLD_H,
  decorationPos,
  zoneCenter,
  computeRingLayout,
  ringBoundaryPoints,
  sampleClosedBlobPath,
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
const ZONES = [
  { id: "stacks", name: "Archive Stacks", fill: "#d9c896", description: "Main ideas & evidence", decorations: [] },
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
    <div class="hub-marker-wrap" style="left:${BOSS_POS.x}px;top:${BOSS_POS.y}px;">
      <button class="hub-boss-marker is-grammar-golem ${bossStateClass}" data-boss ${locked ? "disabled" : ""}
        aria-label="${boss.name}, ${subject.name} Boss Quiz${cleared ? " (cleared)" : locked ? `: locked until every skill on this island is mastered` : ""}">
        ${monsterSVG(boss.avatar, { size: 92 })}
        ${cleared ? `<span class="hub-boss-crown">👑</span>` : locked ? `<span class="hub-boss-lock">🔒</span>` : ""}
      </button>
      <span class="hub-skill-name hub-boss-name">${locked ? "🔒 " : ""}${boss.name}</span>
    </div>
  `;
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
// top of the ring — an arbitrary but stable point on the loop (there's
// no "start" the way a spine has two distinct ends), chosen so a fresh
// spawn reads as "on the ring, roughly opposite the boss bridge at the
// bottom" rather than right on top of either.
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
  // Whichever of the outer shore's own points sits physically closest to
  // BOSS_POS (bottom-middle of the world, well outside the ring itself,
  // same fixed spot every hub's own boss uses) — the bridge's own anchor
  // on this island's actual rendered coastline, not a hand-guessed
  // coordinate that could drift out of sync if the ring's own geometry
  // ever changes. Pulled BRIDGE_INSET back toward RING_CENTER before use
  // below (both for the rendered bridge and its own walkable polygon) —
  // an anchor sitting exactly *on* the coastline is a single grazing
  // point of the walkable annulus, not a real overlap with it, so the
  // bridge's own near end needs to actually reach a few steps onto real
  // land the way islandHub.js's own pullBackToEdge does for its bridges,
  // or the two walkable regions can share only that one knife-edge point
  // and leave the avatar stuck right at the shore.
  const bridgeAnchor = ringOuter.reduce((best, p) => (Math.hypot(p.x - BOSS_POS.x, p.y - BOSS_POS.y) < Math.hypot(best.x - BOSS_POS.x, best.y - BOSS_POS.y) ? p : best));
  const BRIDGE_INSET = 40;
  const bridgeStart = (() => {
    const dx = RING_CENTER.x - bridgeAnchor.x;
    const dy = RING_CENTER.y - bridgeAnchor.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: bridgeAnchor.x + (dx / len) * BRIDGE_INSET, y: bridgeAnchor.y + (dy / len) * BRIDGE_INSET };
  })();

  const sceneSvg = renderWorldSvg(layout, {
    ariaLabel:
      "Lexicon Shoals, one ring-shaped atoll of floating land looped around a hollow gap of open sky at its own center, split into four wedges around the loop — Archive Stacks, Etymology Grove, the Scriptorium, and Grammar Garrison — with a short plank bridge off its southern rim leading to the boss's own floating platform",
    landmass: () => "",
    regionShapes: (zoneGroups) => renderRingIsland(zoneGroups, { center: RING_CENTER, outerRadius: OUTER_RADIUS, innerRadius: INNER_RADIUS, seed: RING_SEED, shoreRingWidth: SHORE_RING_WIDTH }),
    trails: renderCurveTrails,
    // Same "dressed-up bridge" idea as islandHub.js's own Wordwood Isle
    // bridges, just without that file's own ominous mist/torch treatment
    // (this island stays plain otherwise, see this file's own header
    // comment) — a plain plank bridge, plus the same dark boss-lair
    // clearing every other hub's own default bossBridge-less path already
    // draws under BOSS_POS, reproduced by hand here since supplying a
    // custom bossBridge callback replaces that default entirely.
    bossBridge: () =>
      renderPlankBridge(bridgeStart.x, bridgeStart.y, BOSS_POS.x, BOSS_POS.y, { width: BOSS_BRIDGE_WIDTH }) +
      `<circle cx="${BOSS_POS.x}" cy="${BOSS_POS.y}" r="118" fill="#2c211c" opacity="0.22" />`,
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
  // DOM), plus a rectangular strip for the boss bridge, same
  // "bridgePolygon alongside the real shore polygons" idea islandHub.js's
  // own vocab/boss bridges use — a bridge itself isn't a sand-colored
  // path, so without its own walkable strip the avatar would hit
  // invisible sky the moment it stepped off the ring onto it.
  const bridgeWalkablePoly = bridgePolygon(bridgeStart.x, bridgeStart.y, BOSS_POS.x, BOSS_POS.y, BOSS_BRIDGE_WIDTH / 2 - 6);
  const isWalkable = (px, py) => (pointInPolygon(px, py, ringOuter) && !pointInPolygon(px, py, ringInner)) || pointInPolygon(px, py, bridgeWalkablePoly);

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
