// SAT Reading & Writing's own "hub" island, Lexicon Shoals — the same
// big-walkable-island treatment ACT's 4 subjects already get (see
// islandHub.js's own header comment for the original brief), reskinned
// for SAT's own Sky Islands theme (see .sky-scene in style.css and
// worldMap.js's own WORLD_MAP_THEMES) instead of ACT's ocean: this
// island floats in open sky rather than open water, so its own
// <main>/.hub-viewport use .sky-scene's palette instead of .ocean-scene's.
// Simpler than Wordwood Isle in two real ways, not just cosmetically:
// a single gentle crescent spine instead of a tight spiral (a real
// coastal shoal is usually one broad bow, not a spiral, and it sidesteps
// needing the same careful self-intersection tuning islandHub.js's own
// comments describe), and no bonus landmark — SAT Reading & Writing has
// no separate "vocabulary builder" feature the way ACT English does, so
// this island is just its 4 zones and the boss, nothing more.
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
  computeCurveLayout,
  pointOnCurve,
  renderWorldSvg,
  renderRibbonIsland,
  renderCurveTrails,
  wireMovement,
  wireFullscreenToggle,
  joystickHTML,
  pointInPolygon,
  buildShorelinePolygons,
} from "./hubWorld.js";

// A single broad, shallow crescent — a straight line from CURVE_START to
// CURVE_END, bowed outward by up to CURVE_BOW at its own midpoint (0 at
// both ends, following a sine curve in between). A real coastal shoal is
// usually one simple bow like this rather than a tight spiral, and the
// gentle single bend keeps this curve's own radius of curvature
// (~970px at its tightest, well over RIBBON_WIDTH below) nowhere close
// to self-intersecting the way islandHub.js's own spiral had to be
// carefully tuned to avoid — see that file's own CURVE_FN comment for
// what happens when a curve's bend gets tighter than its own ribbon is
// wide.
const CURVE_START = { x: 480, y: 1120 };
const CURVE_END = { x: 1720, y: 480 };
const CURVE_BOW = 320;
const CURVE_DX = CURVE_END.x - CURVE_START.x;
const CURVE_DY = CURVE_END.y - CURVE_START.y;
const CURVE_LEN = Math.hypot(CURVE_DX, CURVE_DY);
const CURVE_PERP = { x: -CURVE_DY / CURVE_LEN, y: CURVE_DX / CURVE_LEN };
function CURVE_FN(t) {
  const baseX = CURVE_START.x + t * CURVE_DX;
  const baseY = CURVE_START.y + t * CURVE_DY;
  const bow = Math.sin(t * Math.PI) * CURVE_BOW;
  return { x: baseX + CURVE_PERP.x * bow, y: baseY + CURVE_PERP.y * bow };
}
// Narrower than Wordwood Isle's 330 — a shoal reads as a slimmer strip
// of land than a proper island — with real margin left over to the
// shoreline itself past computeCurveLayout's own marker offsets (up to
// ~230px out from the spine), same reasoning as islandHub.js's own
// RIBBON_WIDTH comment.
const RIBBON_WIDTH = 280;
const RIBBON_SHORE_WIDTH = 50;
const BOSS_BRIDGE_WIDTH = 68;

const DEV_MODE_CLICKS = 10;
const DEV_MODE_WINDOW_MS = 5000;
// Module-level (not per-render) so rapid clicks keep counting across the
// innerHTML rebuild every navigate() triggers — same reasoning
// islandHub.js's own goat click tracking uses.
let goatClickTimestamps = [];

// computeCurveLayout's own greedy placement guarantees every pair of
// markers on this crescent is at least MIN_MARKER_DIST=100px apart —
// same trigger radius as islandHub.js's own spiral, tuned there so two
// 50px hitboxes (2*50=100) never quite overlap even at that tightest
// gap.
const SKILL_TRIGGER_RADIUS = 50;

// Four zones along the crescent's own spine, in the same order as
// SAT_SUBJECTS' own sat-rw skill array (Information and Ideas, Craft and
// Structure, Expression of Ideas, Standard English Conventions — see
// REPORTING_CATEGORIES["sat-rw"] in data/satSkills.js) — computeCurveLayout
// slices the skills array sequentially across ZONES in array order, so
// keeping that same order here means each zone lines up 1:1 with its own
// real reporting category, same trick islandHub.js's own 4 zones rely on.
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

export function renderSatRwHub(root, navigate, subject) {
  const layout = computeCurveLayout(subject.skills, ZONES, CURVE_FN);
  const goatPos = computeGoatPos(layout);

  const allMastered = subject.skills.every((skill) => gameState.isMastered(skill.id));
  const bossCleared = gameState.isBossCleared(subject.id);
  const boss = getBossMonster(subject.id, gameState.level);
  const bossStateClass = bossCleared ? "is-cleared" : allMastered ? "is-unlocked" : "is-locked";

  // No bossBridge callback here (unlike islandHub.js's own dressed-up
  // bridge) — renderWorldSvg's own default plain dashed path from CENTER
  // to BOSS_POS is what every other ACT hub besides Wordwood Isle already
  // uses as-is.
  const sceneSvg = renderWorldSvg(layout, {
    ariaLabel:
      "Lexicon Shoals, one broad crescent-shaped sandbar split into four bands along its own spine — Archive Stacks, Etymology Grove, the Scriptorium, and Grammar Garrison — with a dashed path leading to the boss's own platform",
    landmass: () => "",
    regionShapes: (zoneGroups) => renderRibbonIsland(zoneGroups, CURVE_FN, { baseWidth: RIBBON_WIDTH, shoreRingWidth: RIBBON_SHORE_WIDTH }),
    trails: renderCurveTrails,
  });

  root.innerHTML = `
    ${hudHTML("map")}
    <main class="screen island-screen hub-island-screen sky-scene" style="--island-color:${subject.color};--island-bg:${subject.bg};${glowVars(subject.color)}">
      <button class="back-btn" data-back>&larr; Back to Map</button>
      <h1 class="island-heading">${subject.icon} ${subject.place}</h1>
      <p class="map-subtitle hub-hint" id="hubHint">🧭 Walk your monster with WASD (or the joystick) along the shoal — every trail leads to a skill</p>
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

  // The avatar's walkable ground is the actual rendered shore (built
  // fresh off the live DOM, so it can never drift out of sync with
  // whatever CURVE_FN/RIBBON_WIDTH actually drew this render) — no
  // bridges to add here, unlike islandHub.js's own vocab/boss bridges,
  // since this island has neither a landmark nor a dressed boss bridge.
  const shorePolygons = buildShorelinePolygons(root);
  const isWalkable = (px, py) => shorePolygons.some((poly) => pointInPolygon(px, py, poly));

  const stopMovement = wireMovement({
    avatarEl: root.querySelector("#hubAvatar"),
    worldEl: root.querySelector("#hubWorld"),
    viewportEl: root.querySelector("#hubViewport"),
    hintEl: root.querySelector("#hubHint"),
    joystickEl: root.querySelector("#hubJoystick"),
    isWalkable,
    spawn: (() => {
      const p = pointOnCurve(CURVE_FN, 0.5);
      return { x: p.x, y: p.y };
    })(),
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
