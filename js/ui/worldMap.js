import { getTest, getTestSubjects, isSubjectPlayable } from "../data/tests.js";
import { getState, getStateSubjects } from "../data/stateTests.js";
import { gameState } from "../state.js";
import { hudHTML, wireHud } from "./hud.js";
import { monsterSVG } from "./monster.js";
import { pathPositions, pathHeight, renderPathSvg, renderDecorations, glowVars } from "./pathTrail.js";
import { wireHeldKeys, wireJoystickStick, joystickHTML } from "./hubWorld.js";

const ROW_HEIGHT = 200;

// Decorations specific to each solar system's own theme (see each test's
// icon/tagline in data/tests.js) — replaces pathTrail.js's generic
// cloud/leaf/rock/sparkle/wave scatter so a planet-picker page itself
// looks like "this test's home turf," not just a recolored copy of every
// other one. Falls back to a neutral scatter for any test id not listed
// (there is currently no such case in practice).
const TEST_DECORATIONS = {
  // Wave marks plus real sea life along the path itself — a wider mix
  // than an earlier pass at this (just 2 wave marks, reasoning that
  // .ocean-scene's own background already carried the "water" idea on
  // its own); per direction, the path itself reading as almost empty
  // open water was the actual problem, not too little restraint.
  act: ["〰️", "〰️", "🐠", "🐚", "⭐"],
  // SAT's own Sky Islands (see WORLD_MAP_THEMES below) — clouds drifting
  // past at path level, not just up on the horizon (see ambientSceneHTML).
  sat: ["☁️", "☁️", "🕊️", "✨"],
  psat: ["🌗", "✨", "🌘"],
  stateAssessments: ["🌍", "🗺️", "✨"],
};

// Every themed test's World Map (see .sky-scene/.ocean-scene etc. in
// style.css) — the round planet-sphere/generic-blob picker every
// unthemed test (currently just State Assessments, whose 50-state list
// has no fixed small set of "islands" to hand-design art for) still
// uses. `sceneClass` picks the backdrop; `vehicle` names which
// VEHICLE_CONFIG entry roams this test's own map (a boat doesn't suit a
// sky or mountain scene, so each theme gets its own). Each themed
// subject's own island art lives in SUBJECT_ISLAND_ART below, keyed by
// subject id directly rather than nested per test — every subject id in
// this app is already globally unique (see tests/stateTests.test.js's
// own "no state subject id collides..." check for the same assumption
// applied elsewhere), so one flat map covers every themed test at once.
const WORLD_MAP_THEMES = {
  act: { sceneClass: "ocean-scene", vehicle: "boat" },
  sat: { sceneClass: "sky-scene", vehicle: "balloon" },
};

// Fixed-position ambient scenery per theme (ship sails/gulls for the
// ocean, drifting clouds/a stray balloon for the sky) sits near the top
// of the screen "on the horizon," not tied to the path's own length, so
// it reads as background detail glimpsed once rather than more path
// decorations repeating down the page. The ocean's own set is deliberately
// fuller than an earlier pass at it, which kept everything at 0.32
// opacity and to just 3 elements on purpose, reasoning that a livelier
// scene would read as "twee" — per direction, that read as flat and empty
// instead, so every theme's own set leans into an actually lived-in feel:
// more elements, real depth via layered opacity/size rather than one
// uniform faint tone. Fixed pixel offsets, not percentages — these need
// to sit in the open sky beside the heading regardless of how tall the
// rest of the page ends up (which varies with subject count), not drift
// based on total scrollable height.
const AMBIENT_SCENE_HTML = {
  act: `
    <span class="map-ambient map-ambient-accent" style="left:14%;top:55px;font-size:46px;" aria-hidden="true">☀️</span>
    <span class="map-ambient" style="left:78%;top:120px;font-size:40px;" aria-hidden="true">⛵</span>
    <span class="map-ambient" style="left:20%;top:150px;font-size:26px;" aria-hidden="true">⛵</span>
    <span class="map-ambient" style="left:60%;top:65px;font-size:18px;" aria-hidden="true">🕊️</span>
    <span class="map-ambient" style="left:65%;top:92px;font-size:14px;" aria-hidden="true">🕊️</span>
    <span class="map-ambient" style="left:52%;top:78px;font-size:13px;" aria-hidden="true">🕊️</span>
    <span class="map-ambient" style="left:90%;top:180px;font-size:22px;" aria-hidden="true">🐬</span>
    <span class="map-ambient" style="left:8%;top:210px;font-size:20px;" aria-hidden="true">🐟</span>
  `,
  sat: `
    <span class="map-ambient map-ambient-accent" style="left:16%;top:50px;font-size:44px;" aria-hidden="true">☀️</span>
    <span class="map-ambient" style="left:74%;top:70px;font-size:38px;" aria-hidden="true">☁️</span>
    <span class="map-ambient" style="left:30%;top:135px;font-size:30px;" aria-hidden="true">☁️</span>
    <span class="map-ambient" style="left:56%;top:195px;font-size:24px;" aria-hidden="true">☁️</span>
    <span class="map-ambient" style="left:62%;top:60px;font-size:18px;" aria-hidden="true">🕊️</span>
    <span class="map-ambient" style="left:68%;top:88px;font-size:14px;" aria-hidden="true">🕊️</span>
    <span class="map-ambient" style="left:10%;top:180px;font-size:22px;" aria-hidden="true">🎈</span>
  `,
};

// This screen is a solar system's own planet-picker: each subject/category
// is a planet (see data/tests.js), and picking one hands off to island.js,
// which plays the same role one level down (each skill within that
// subject is an island). State Assessments is the one planet-picker this
// screen never actually renders — see the testId==="stateAssessments"
// branch below, which redirects to the rocket-themed state picker instead,
// since that solar system's planets are the 50 states, not a fixed
// subject list.
//
// Shortcut nodes above the planet path — styled like the planets
// themselves (circular icon + colored ring + label) rather than generic
// list cards, so they read as part of the same map instead of a bolted-on
// menu. Each gets its own accent color, distinct from every planet's and
// from each other, so they stay visually distinguishable at a glance.
const SHORTCUTS = [
  { screen: "diagnostic", icon: "🧪", name: "Placement Diagnostic", blurb: "A quick cross-subject sample", color: "#2a6df5", bg: "#eaf1ff" },
  { screen: "weakReview", icon: "🎯", name: "Weak Skill Review", blurb: "Your lowest-accuracy skills", color: "#22b8a3", bg: "#e8fbf7" },
  { screen: "adaptivePractice", icon: "🧭", name: "Adaptive Practice", blurb: "Your weakest question patterns", color: "#c2410c", bg: "#fff1e8" },
  { screen: "reviewQueue", icon: "🧠", name: "Review Queue", blurb: "Spaced repetition, due now", color: "#7c5cff", bg: "#f1eeff" },
  { screen: "drillBuilder", icon: "🎛️", name: "Custom Drill", blurb: "Pick your own skills", color: "#ff9f38", bg: "#fff4e6" },
];

// Score-focused shortcuts: only for planets with a real full-length
// Practice Test behind them (see each test's practiceTest config in
// data/tests.js) — State Assessments has none yet, so these simply don't
// apply there. Writing is further gated on supportsWriting (ACT only —
// the real SAT dropped its essay in 2021, PSAT never had one). These
// render in *this planet's own* color (see the "Test Day" group below),
// not a color of their own, so no color/bg fields here.
function scoreShortcutsFor(test) {
  if (!test.practiceTest) return [];
  const shortcuts = [
    { screen: "practiceTest", icon: "📝", name: "Practice Test", blurb: "A full-length, timed test" },
    { screen: "scoreReport", icon: "📄", name: "Score Report", blurb: "Your latest score, shareable" },
  ];
  if (test.practiceTest.supportsWriting) {
    shortcuts.splice(1, 0, { screen: "essay", icon: "✍️", name: "Writing", blurb: "Optional essay practice" });
  }
  return shortcuts;
}

// Shared markup for both shortcut groups below — `color`/`bg` are passed
// explicitly per group (the 5 practice shortcuts keep their own distinct
// colors; the Test Day trio all share this planet's own color) rather than
// read off `s` itself, so one render path works for both.
function shortcutButtonHTML(s, color, bg, badge = "") {
  return `
    <button class="map-shortcut" data-shortcut="${s.screen}" style="--island-color:${color};--island-bg:${bg}">
      <span class="map-island-node map-shortcut-node">
        <span class="map-island-ring" style="--ring-pct:100%"></span>
        <span class="map-island-icon">${s.icon}</span>
        ${badge}
      </span>
      <span class="map-island-label">
        <h3>${s.name}</h3>
        <p class="map-island-place">${s.blurb}</p>
      </span>
    </button>
  `;
}

const ISLAND_SAND = "#ecdfb8";

// A small, iconic island silhouette per ACT subject — one for each of
// the 4 hub screens behind this map (islandHub.js/mathHub.js/
// readingHub.js/scienceHub.js), so picking a subject here starts to
// look like picking the actual island waiting on the other side, not a
// plain colored blob under a circular button (this map's own generic
// node-area-blob, still used as-is by every non-ACT test's map). Small
// and iconic on purpose — these render at ~140x120px, so each is a
// silhouette plus one or two signature details, not a scene.
const SUBJECT_ISLAND_ART = {
  // Wordwood Isle: a curved, ribbon-like landmass echoing its own
  // spiral shape, with a single small tree.
  english: (color) => `
    <svg viewBox="0 0 140 120" width="140" height="120" aria-hidden="true">
      <path d="M18,72 Q8,42 34,26 Q64,6 96,20 Q122,32 112,56 Q102,82 70,88 Q38,94 18,72 Z" fill="${ISLAND_SAND}" />
      <path d="M27,69 Q19,44 40,31 Q65,16 90,26 Q109,35 101,54 Q93,74 68,79 Q43,84 27,69 Z" fill="${color}" />
      <path d="M58,52 L62,52 L62,44 L65,44 L59,32 L53,44 L56,44 Z" fill="#3c6b30" />
    </svg>
  `,
  // Numeria Peaks: an island base topped with 3 jagged mountains.
  math: (color) => `
    <svg viewBox="0 0 140 120" width="140" height="120" aria-hidden="true">
      <path d="M14,80 Q9,50 34,36 Q60,18 90,27 Q118,36 116,60 Q114,86 86,93 Q50,100 14,80 Z" fill="${ISLAND_SAND}" />
      <path d="M22,78 Q18,52 40,40 Q62,24 87,32 Q109,40 107,60 Q106,84 82,90 Q52,96 22,78 Z" fill="${color}" />
      <path d="M40,62 L52,32 L64,62 Z" fill="#4a3f6b" />
      <path d="M58,64 L72,26 L86,64 Z" fill="#3a3054" />
      <path d="M78,62 L88,38 L98,62 Z" fill="#4a3f6b" />
    </svg>
  `,
  // Athenaeum Reef: three fused, overlapping reef lobes with a tiny
  // lighthouse, echoing the hub's own fused-lobe shape.
  reading: (color) => `
    <svg viewBox="0 0 140 120" width="140" height="120" aria-hidden="true">
      <circle cx="48" cy="58" r="32" fill="${ISLAND_SAND}" />
      <circle cx="82" cy="52" r="30" fill="${ISLAND_SAND}" />
      <circle cx="66" cy="80" r="27" fill="${ISLAND_SAND}" />
      <circle cx="48" cy="58" r="25" fill="${color}" />
      <circle cx="82" cy="52" r="23" fill="${color}" opacity="0.9" />
      <circle cx="66" cy="80" r="20" fill="${color}" opacity="0.8" />
      <rect x="76" y="30" width="7" height="17" fill="#e0935f" />
      <polygon points="73,30 86,30 79.5,21" fill="#e0935f" />
    </svg>
  `,
  // Lab Archipelago: two separate islands linked by a short causeway,
  // with a tiny antenna, echoing the hub's own archipelago layout.
  science: (color) => `
    <svg viewBox="0 0 140 120" width="140" height="120" aria-hidden="true">
      <ellipse cx="44" cy="66" rx="30" ry="24" fill="${ISLAND_SAND}" />
      <ellipse cx="98" cy="58" rx="28" ry="22" fill="${ISLAND_SAND}" />
      <rect x="64" y="56" width="24" height="12" fill="${ISLAND_SAND}" />
      <ellipse cx="44" cy="66" rx="21" ry="16" fill="${color}" />
      <ellipse cx="98" cy="58" rx="19" ry="14" fill="${color}" />
      <line x1="98" y1="46" x2="98" y2="32" stroke="#2a323e" stroke-width="2.5" />
      <circle cx="98" cy="29" r="3.5" fill="#2a323e" />
    </svg>
  `,
  // SAT's own Sky Islands (WORLD_MAP_THEMES) — every island here floats,
  // so unlike the ACT set above (a flat silhouette resting on its own
  // sand), each one gets a tapered, chunk-of-earth underside (rocky,
  // roots-and-all) instead of a shoreline, plus a soft cloud wisp
  // drifting just beneath it to sell "hovering" rather than "sitting."
  // Lexicon Shoals: a small flat-topped island with a raised open-book
  // shape, echoing a reading passage lying open.
  "sat-rw": (color) => `
    <svg viewBox="0 0 140 120" width="140" height="120" aria-hidden="true">
      <ellipse cx="70" cy="98" rx="34" ry="7" fill="#ffffff" opacity="0.55" />
      <path d="M32,54 L24,68 L32,82 L48,94 L70,104 L92,94 L108,82 L116,68 L108,54 Z" fill="#8a6a48" />
      <path d="M70,104 L92,94 L108,82 Z" fill="#6b4d30" opacity="0.4" />
      <path d="M66,103 L61,116 M70,104 L70,119 M74,103 L79,115" fill="none" stroke="#6b4d30" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
      <path d="M32,54 Q26,34 52,24 Q70,16 88,24 Q114,34 108,54 Q98,66 70,68 Q42,66 32,54 Z" fill="${ISLAND_SAND}" />
      <path d="M40,52 Q35,36 56,28 Q70,22 84,28 Q105,36 100,52 Q92,60 70,62 Q48,60 40,52 Z" fill="${color}" />
      <path d="M70,38 L70,54 M70,38 Q58,36 52,42 M70,38 Q82,36 88,42" fill="none" stroke="#fdf8ec" stroke-width="3" stroke-linecap="round" />
    </svg>
  `,
  // Function Fields: a small flat-topped island with a raised triangle
  // (a graph's own rising line) and a scatter of grid dots.
  "sat-math": (color) => `
    <svg viewBox="0 0 140 120" width="140" height="120" aria-hidden="true">
      <ellipse cx="70" cy="98" rx="34" ry="7" fill="#ffffff" opacity="0.55" />
      <path d="M32,54 L24,68 L32,82 L48,94 L70,104 L92,94 L108,82 L116,68 L108,54 Z" fill="#8a6a48" />
      <path d="M70,104 L92,94 L108,82 Z" fill="#6b4d30" opacity="0.4" />
      <path d="M66,103 L61,116 M70,104 L70,119 M74,103 L79,115" fill="none" stroke="#6b4d30" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
      <path d="M32,54 Q26,34 52,24 Q70,16 88,24 Q114,34 108,54 Q98,66 70,68 Q42,66 32,54 Z" fill="${ISLAND_SAND}" />
      <path d="M40,52 Q35,36 56,28 Q70,22 84,28 Q105,36 100,52 Q92,60 70,62 Q48,60 40,52 Z" fill="${color}" />
      <path d="M50,50 L64,30 L78,50 Z" fill="#fdf8ec" />
      <circle cx="50" cy="42" r="2" fill="#fdf8ec" />
      <circle cx="90" cy="46" r="2" fill="#fdf8ec" />
      <circle cx="60" cy="34" r="1.6" fill="#fdf8ec" />
    </svg>
  `,
};

function renderSubjectIslandArt(subjectId, color) {
  const art = SUBJECT_ISLAND_ART[subjectId];
  return art ? art(color) : "";
}

// A simple rowboat hull for ACT's own boat vehicle.
function renderBoatHull() {
  return `
    <svg class="map-boat-hull" viewBox="0 0 100 46" width="100" height="46" aria-hidden="true">
      <ellipse cx="50" cy="43" rx="46" ry="5" fill="rgba(20,40,60,0.18)" />
      <path d="M6,20 Q50,42 94,20 L86,8 Q50,16 14,8 Z" fill="#a9713f" stroke="#7a4f28" stroke-width="2" stroke-linejoin="round" />
      <path d="M14,8 Q50,16 86,8" fill="none" stroke="#c98f56" stroke-width="2" />
    </svg>
  `;
}

// SAT's own hot air balloon — envelope, gore-line stripes, and a small
// basket the rider sits in (same "rider layered over the vehicle's own
// resting spot" idea as the boat's hull, just a basket instead).
function renderBalloonEnvelope() {
  return `
    <svg class="map-balloon-envelope" viewBox="0 0 90 110" width="90" height="110" aria-hidden="true">
      <ellipse cx="45" cy="98" rx="20" ry="4" fill="rgba(60,40,20,0.18)" />
      <path d="M45,4 C66,4 76,30 66,52 C60,68 54,72 45,80 C36,72 30,68 24,52 C14,30 24,4 45,4 Z" fill="#e8b04a" stroke="#b8791f" stroke-width="2" stroke-linejoin="round" />
      <path d="M45,6 C54,8 60,26 57,46" fill="none" stroke="#b8791f" stroke-width="1.5" opacity="0.55" />
      <path d="M45,6 C36,8 30,26 33,46" fill="none" stroke="#b8791f" stroke-width="1.5" opacity="0.55" />
      <circle cx="45" cy="6" r="4" fill="#b8791f" />
      <line x1="34" y1="70" x2="27" y2="90" stroke="#7a5a34" stroke-width="1.6" />
      <line x1="56" y1="70" x2="63" y2="90" stroke="#7a5a34" stroke-width="1.6" />
      <rect x="25" y="88" width="40" height="18" rx="3" fill="#a9713f" stroke="#7a4f28" stroke-width="2" />
      <line x1="25" y1="97" x2="65" y2="97" stroke="#7a4f28" stroke-width="1.2" opacity="0.6" />
    </svg>
  `;
}

// Each themed test's own roaming vehicle — a shared markup shape (a
// resting spot the monster rides in/on, see wireRoamer below), but each
// with its own art, own wrapper sizing, and own rider size, since a
// basket holds the rider very differently than a boat's hull does.
const VEHICLE_CONFIG = {
  boat: { wrapClass: "map-boat", riderClass: "map-boat-rider", riderSize: 64, render: renderBoatHull },
  balloon: { wrapClass: "map-balloon", riderClass: "map-balloon-rider", riderSize: 42, render: renderBalloonEnvelope },
};

// The vehicle's own markup — sits directly inside .map-path-container
// (see the theme branch further down), free to roam that container's
// entire scrollable area rather than a fixed-canvas "hub world": this
// map's own layout/scrolling/click-to-enter-an-island is the original,
// unchanged one every unthemed test still uses (see this feature's own
// chat history — a full walkable-hub-engine rebuild was tried and
// explicitly reverted in favor of keeping this screen's original look).
// No bob animation, since it's actively steerable rather than idle.
function renderVehicleRoamer(kind) {
  const cfg = VEHICLE_CONFIG[kind];
  return `
    <div class="map-roamer map-vehicle-${kind}" id="mapRoamer" aria-hidden="true">
      <div class="${cfg.wrapClass}">
        ${cfg.render()}
        <div class="${cfg.riderClass}">${monsterSVG(gameState.getDisplayAvatar(), { size: cfg.riderSize })}</div>
      </div>
    </div>
  `;
}

// WASD/joystick lets the current theme's vehicle roam anywhere within
// .map-path-container's own scrollable area (bounded by its actual
// measured width and its full height, spanning every island) — no
// camera-follow: the page just scrolls the normal way, same as this map
// always has, and the player scrolls manually to keep the vehicle in
// view while traveling. Reuses hubWorld.js's own key/joystick input
// helpers (the exact same ones wireMovement itself uses) so every
// vehicle feels identical to every subject hub's own movement, just
// without the fixed-canvas/camera machinery that comes with wireMovement
// itself. Generic over which vehicle is roaming — it only moves
// `vehicleEl`, never anything about the art inside it.
function wireRoamer(vehicleEl, containerEl, joystickEl, spawn) {
  const SPEED = 372; // px/sec — matches hubWorld.js's own AVATAR_SPEED so every vehicle feels the same speed as every subject hub's own avatar
  const MARGIN = 30;
  let x = spawn.x;
  let y = spawn.y;
  const { held, stop: stopKeys } = wireHeldKeys();
  const stick = { x: 0, y: 0 };
  const unwireJoystick = wireJoystickStick(joystickEl, stick);
  let stopped = false;
  let rafId = null;
  let lastTimestamp = null;
  let boundsW = 0;
  let boundsH = 0;

  function measureBounds() {
    boundsW = containerEl.clientWidth;
    boundsH = containerEl.clientHeight;
  }
  measureBounds();
  window.addEventListener("resize", measureBounds);

  function place() {
    vehicleEl.style.left = `${x}px`;
    vehicleEl.style.top = `${y}px`;
  }
  place();

  function tick(timestamp) {
    if (stopped) return;
    // First tick has no prior timestamp to diff against — assume one
    // nominal 60fps frame rather than moving 0px.
    const elapsedMs = lastTimestamp === null ? 16.67 : Math.min(timestamp - lastTimestamp, 100);
    lastTimestamp = timestamp;
    const dtSeconds = elapsedMs / 1000;
    let dx = 0;
    let dy = 0;
    let speedScale = 1;
    if (held.w || held.arrowup) dy -= 1;
    if (held.s || held.arrowdown) dy += 1;
    if (held.a || held.arrowleft) dx -= 1;
    if (held.d || held.arrowright) dx += 1;
    if (!dx && !dy && (stick.x || stick.y)) {
      dx = stick.x;
      dy = stick.y;
      speedScale = Math.min(Math.hypot(dx, dy), 1);
    }
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      const dist = SPEED * speedScale * dtSeconds;
      x = Math.max(MARGIN, Math.min(boundsW - MARGIN, x + (dx / len) * dist));
      y = Math.max(MARGIN, Math.min(boundsH - MARGIN, y + (dy / len) * dist));
      place();
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  return function stop() {
    if (stopped) return;
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("resize", measureBounds);
    stopKeys();
    unwireJoystick();
  };
}

export function renderWorldMap(root, navigate, { testId } = {}) {
  // Arriving here *with* a testId (from the Solar System screen picking a
  // planet) switches the player's current planet; arriving without one
  // (every existing "Back to Map"/HUD "Map" click across the whole app)
  // just stays on whichever planet was already current — so none of those
  // ~15 call sites needed to change to keep working.
  if (testId) gameState.setCurrentTestId(testId);
  const activeTestId = testId || gameState.currentTestId;
  // State Assessments has no single fixed set of planets — which two show
  // up depends on which state the player lives in (see
  // data/stateTests.js). Redirect to the rocket-themed picker instead of
  // rendering an empty/wrong map when that hasn't been chosen yet; once it
  // has, show that state's own two planets instead of the solar system's
  // full 50-state subject list (getTestSubjects would return all 100 —
  // see tests.js's own comment on why that flat list exists).
  if (activeTestId === "stateAssessments" && !gameState.homeState) {
    navigate("statePicker", { returnTo: "map" });
    return;
  }
  const test = getTest(activeTestId);
  const subjects = activeTestId === "stateAssessments" ? getStateSubjects(gameState.homeState) : getTestSubjects(activeTestId);
  const isReady = subjects.some(isSubjectPlayable);
  // ACT/SAT/PSAT each get their own dedicated theme (island art, a scene
  // backdrop, a roaming vehicle — see WORLD_MAP_THEMES above) rather than
  // the round planet-sphere/generic-blob picker State Assessments still
  // uses (its 50-state list has no fixed small set of "islands" to
  // hand-design art for) — computed early so the planet nodes below can
  // pick their own art accordingly, not just the page chrome further down.
  const theme = WORLD_MAP_THEMES[activeTestId] || null;

  const positions = pathPositions(subjects.length, { rowHeight: ROW_HEIGHT, leftPct: 26, rightPct: 74 });
  const totalHeight = pathHeight(subjects.length, ROW_HEIGHT);

  const stats = subjects.map((subject) => gameState.getSubjectStats(subject.id));
  const reviewQueueDueCount = gameState.getDueQuestionKeys(99).length + gameState.getDueVocabWords(99).length;
  // Point the mascot at the first subject that isn't fully cleared yet, so
  // the map always shows "here's where to pick back up."
  let currentIndex = stats.findIndex((s) => s.masteredCount < s.totalSkills);
  if (currentIndex === -1) currentIndex = subjects.length - 1;

  const planets = subjects.map((subject, i) => {
    const { x, y } = positions[i];
    const stat = stats[i];
    const pct = stat.totalSkills > 0 ? Math.round((stat.masteredCount / stat.totalSkills) * 100) : 0;
    const isCurrent = i === currentIndex;
    // Every themed test's own roaming vehicle (see renderVehicleRoamer/
    // wireRoamer below) travels the whole map on its own, independent of
    // any one island's own node — so it replaces the plain mascot here
    // rather than sitting inside a node-wrap the way it briefly did in an
    // earlier version. State Assessments keeps the original "mascot
    // floats above whichever planet is current" mascot exactly as it
    // always has.
    return `
      <div class="map-node-wrap" style="left:${x}%;top:${y}px;">
        ${isCurrent && !theme ? `<div class="map-mascot">${monsterSVG(gameState.getDisplayAvatar(), { size: 86 })}</div>` : ""}
        <div class="node-anchor">
          ${
            theme
              ? `
                <button class="map-island-node map-island-node--art" data-subject="${subject.id}" aria-label="${subject.name} planet: ${stat.masteredCount} of ${stat.totalSkills} islands mastered" style="--island-color:${subject.color}">
                  <span class="map-island-art">${renderSubjectIslandArt(subject.id, subject.color)}</span>
                </button>
              `
              : `
                <span class="node-area-blob node-area-blob-lg map-blob-shape-${(i % 4) + 1}" style="--blob-color:${subject.color}"></span>
                <button class="map-island-node" data-subject="${subject.id}" aria-label="${subject.name} planet: ${stat.masteredCount} of ${stat.totalSkills} islands mastered" style="--island-color:${subject.color};--island-bg:${subject.bg};--ring-pct:${pct}%">
                  <span class="map-island-ring"></span>
                  <span class="map-island-icon" aria-hidden="true">${subject.icon}</span>
                </button>
              `
          }
        </div>
        <div class="map-island-label">
          <h3>${subject.name}</h3>
          <p class="map-island-place">${subject.place}</p>
          <p class="map-island-progress">${stat.masteredCount} / ${stat.totalSkills} mastered</p>
        </div>
      </div>
    `;
  }).join("");

  // The shortcut modes (diagnostic, weak review, adaptive practice, review
  // queue, custom drill) all draw from real question content behind a
  // solar system's planets — showing them on a solar system with nothing
  // playable yet would just be a row of buttons into empty screens, so
  // they only appear once at least one planet has real content (isReady),
  // same gate this screen itself uses to decide "real path" vs. "coming
  // soon" banner.
  const practiceShortcutsHTML = isReady
    ? SHORTCUTS.map((s) => shortcutButtonHTML(s, s.color, s.bg, s.screen === "reviewQueue" && reviewQueueDueCount > 0 ? `<span class="map-shortcut-badge">${reviewQueueDueCount}</span>` : "")).join("")
    : "";
  const testDayShortcutsHTML = isReady ? scoreShortcutsFor(test).map((s) => shortcutButtonHTML(s, test.color, test.bg)).join("") : "";

  const homeStateName = activeTestId === "stateAssessments" ? getState(gameState.homeState)?.name : null;

  const ambientSceneHTML = theme ? AMBIENT_SCENE_HTML[activeTestId] || "" : "";

  root.innerHTML = `
    ${hudHTML("map")}
    <main class="screen map-screen ${theme ? theme.sceneClass : ""}" style="--test-color:${test.color};--test-bg:${test.bg};${glowVars(test.color)}">
      <button class="back-btn" data-solar-system>&larr; Galaxy</button>
      ${homeStateName ? `<button class="back-btn" data-change-state>🗺️ Change State (${homeStateName})</button>` : ""}
      ${ambientSceneHTML}
      <h1 class="map-title">Choose a Planet to Explore</h1>
      <p class="map-subtitle">${
        activeTestId === "act"
          ? "Acto is ready to study. Pick a planet to begin the path."
          : activeTestId === "stateAssessments"
          ? `${test.planetName} &mdash; ${homeStateName}'s own mandated assessments.`
          : `${test.planetName} (${test.name}) &mdash; pick a planet to begin the path.`
      }</p>
      ${!isReady ? `<p class="map-coming-soon-banner">🚧 ${test.name} content is still being built &mdash; pick a planet below to see what's planned.</p>` : ""}
      ${
        practiceShortcutsHTML
          ? `
            <div class="map-shortcuts-group">
              <p class="map-shortcuts-label">Practice Modes</p>
              <div class="map-shortcuts-row">${practiceShortcutsHTML}</div>
            </div>
          `
          : ""
      }
      ${
        testDayShortcutsHTML
          ? `
            <div class="map-shortcuts-group">
              <p class="map-shortcuts-label">🏆 Test Day</p>
              <div class="map-shortcuts-row">${testDayShortcutsHTML}</div>
            </div>
          `
          : ""
      }
      <div class="map-path-container" style="height:${totalHeight}px">
        ${theme ? "" : `<div class="map-planet-circle"></div>`}
        ${renderPathSvg(positions, totalHeight, { color: test.color })}
        <div class="path-decorations">${renderDecorations(totalHeight, 1, TEST_DECORATIONS[activeTestId] || TEST_DECORATIONS.act)}</div>
        ${planets}
        ${theme ? renderVehicleRoamer(theme.vehicle) : ""}
      </div>
      ${theme ? `<div class="map-roamer-joystick-fixed">${joystickHTML("mapRoamerJoystick")}</div>` : ""}
    </main>
  `;

  // wireMovement's own WASD/joystick/resize/fullscreen listeners bind to
  // `document`/`window`, so they need tearing down before this screen
  // navigates away — same "wrap every in-screen nav in a local goTo"
  // convention the other walkable hubs use for their own wireMovement
  // (see islandHub.js etc.), not a document-wide route-change hook this
  // app doesn't have. wireHud gets this wrapper too (not the raw
  // `navigate`) since its own Home/back buttons are how a player actually
  // leaves this screen most of the time — missing that would leave the
  // vehicle's rAF loop running forever against a detached node, and its
  // WASD listener still bound on whatever screen came next.
  let stopRoamer = () => {};
  const goTo = (screen, params) => {
    stopRoamer();
    navigate(screen, params);
  };
  wireHud(root, goTo);
  if (theme) {
    const containerEl = root.querySelector(".map-path-container");
    const vehicleEl = root.querySelector("#mapRoamer");
    const joystickEl = root.querySelector("#mapRoamerJoystick");
    // Spawns just off the current subject's own island (percentage x
    // converted to this render's actual measured container width, since
    // the container itself is percentage/responsive-sized) — same
    // "follows the current subject" idea this feature started from.
    // Offset toward the container's own middle rather than dead-center on
    // the island so the vehicle doesn't render on top of its clickable
    // button, and stays clear of either edge regardless of which side
    // (left/right-alternating, see pathPositions) the current island
    // itself sits on.
    const currentPos = positions[currentIndex];
    const containerWidth = containerEl.clientWidth;
    const currentPx = (currentPos.x / 100) * containerWidth;
    const side = currentPos.x < 50 ? 1 : -1;
    const spawn = {
      x: Math.max(40, Math.min(containerWidth - 40, currentPx + side * 70)),
      y: currentPos.y,
    };
    stopRoamer = wireRoamer(vehicleEl, containerEl, joystickEl, spawn);
    // navigate() just scrolled to (0,0) before calling this render — on a
    // typical viewport that leaves the vehicle's own spawn spot below the
    // fold behind both shortcut rows, so a player arriving here would
    // have to already know to scroll down before WASD/the joystick does
    // anything visible.
    vehicleEl.scrollIntoView({ block: "center" });
  }

  root.querySelector("[data-solar-system]").addEventListener("click", () => goTo("solarSystem"));
  root.querySelector("[data-change-state]")?.addEventListener("click", () => goTo("statePicker", { returnTo: "map" }));
  root.querySelectorAll("[data-subject]").forEach((node) => {
    node.addEventListener("click", () => goTo("island", { subjectId: node.dataset.subject }));
  });
  root.querySelectorAll("[data-shortcut]").forEach((node) => {
    node.addEventListener("click", () => goTo(node.dataset.shortcut, { testId: activeTestId }));
  });
}
