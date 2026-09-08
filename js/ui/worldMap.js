import { getTest, getTestSubjects, isSubjectPlayable } from "../data/tests.js";
import { getState, getStateSubjects } from "../data/stateTests.js";
import { gameState } from "../state.js";
import { hudHTML, wireHud } from "./hud.js";
import { monsterSVG } from "./monster.js";
import { pathPositions, pathHeight, renderPathSvg, renderDecorations, glowVars } from "./pathTrail.js";
import { WORLD_W, WORLD_H, CENTER, wireMovement, wireFullscreenToggle, joystickHTML } from "./hubWorld.js";

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
  sat: ["🌕", "⭐", "🌙"],
  psat: ["🌗", "✨", "🌘"],
  stateAssessments: ["🌍", "🗺️", "✨"],
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
};

function renderSubjectIslandArt(subjectId, color) {
  const art = SUBJECT_ISLAND_ART[subjectId];
  return art ? art(color) : "";
}

// Hand-placed world coordinates for the 4 ACT islands inside the shared
// hubWorld.js canvas (WORLD_W x WORLD_H — the same fixed-pixel space
// Wordwood Isle/Numeria Peaks/Athenaeum Reef/Lab Archipelago each walk
// their own player through). A loose rectangle spread well inside
// WALK_MARGIN on every side, so the boat can sail right up to any of
// them with room to spare — not derived from hubWorld.js's own
// lobe/curve layout helpers (those lay out many zones along one shape;
// this is 4 unrelated, separate destinations, closer to Numeria Peaks'
// or Lab Archipelago's own hand-placed islands than to a formula).
const ISLAND_WORLD_POS = {
  english: { x: 500, y: 420 },
  math: { x: 1700, y: 420 },
  reading: { x: 1700, y: 1180 },
  science: { x: 500, y: 1180 },
};

// A simple rowboat hull for the player's own avatar on the ocean scene —
// replacing the plain floating-monster .map-mascot every other test's
// map still uses (see the isOceanScene branch in the planets map below).
function renderBoatHull() {
  return `
    <svg class="map-boat-hull" viewBox="0 0 100 46" width="100" height="46" aria-hidden="true">
      <ellipse cx="50" cy="43" rx="46" ry="5" fill="rgba(20,40,60,0.18)" />
      <path d="M6,20 Q50,42 94,20 L86,8 Q50,16 14,8 Z" fill="#a9713f" stroke="#7a4f28" stroke-width="2" stroke-linejoin="round" />
      <path d="M14,8 Q50,16 86,8" fill="none" stroke="#c98f56" stroke-width="2" />
    </svg>
  `;
}

// The boat avatar's own markup — a .hub-avatar (same class every hub's
// own avatar uses: wireMovement's place() writes left/top on this exact
// element every frame, and .hub-avatar's base CSS already centers on
// that point and adds the light/dark contact-shadow halo every hub
// avatar needs against its own water/background) holding the hull +
// rider layering. No bob animation here, matching every other hub's own
// avatar (none of them idle-bob) — .hub-avatar's own centering transform
// and wireMovement's per-frame left/top are the only things that may
// ever touch this element's position.
function renderBoatAvatar() {
  return `
    <div class="hub-avatar map-boat-avatar" id="mapBoatAvatar" aria-hidden="true">
      <div class="map-boat">
        ${renderBoatHull()}
        <div class="map-boat-rider">${monsterSVG(gameState.getDisplayAvatar(), { size: 64 })}</div>
      </div>
    </div>
  `;
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
  // ACT's World Map is a dedicated ocean scene rather than the round
  // planet-sphere every other test still uses (see .ocean-scene in
  // style.css) — computed early so the planet nodes below can pick their
  // own art accordingly, not just the page chrome further down.
  const isOceanScene = activeTestId === "act";

  // The ocean scene lays its islands out in the shared hubWorld.js fixed-
  // pixel canvas (ISLAND_WORLD_POS, real world px) instead of this map's
  // own percentage/scroll-based path (pathPositions) every other test
  // still uses — the two are different coordinate systems, so `positions`
  // means "percent + px" for one and "world px" for the other, matching
  // whichever the `planets` markup below actually consumes.
  const positions = isOceanScene ? subjects.map((s) => ISLAND_WORLD_POS[s.id] || CENTER) : pathPositions(subjects.length, { rowHeight: ROW_HEIGHT, leftPct: 26, rightPct: 74 });
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
    // The ocean scene's own avatar is a single boat sailing the whole
    // canvas (see renderBoatAvatar/wireMovement below), not a mascot
    // pinned to one island's own node — every other test keeps the
    // original "mascot floats above whichever planet is current" mascot.
    return `
      <div class="map-node-wrap" style="left:${isOceanScene ? `${x}px` : `${x}%`};top:${y}px;">
        ${isCurrent && !isOceanScene ? `<div class="map-mascot">${monsterSVG(gameState.getDisplayAvatar(), { size: 86 })}</div>` : ""}
        <div class="node-anchor">
          ${
            isOceanScene
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

  // Fixed-position ambient scenery (ships, birds, gulls, a sun glint) sits
  // near the top of the screen "on the horizon," not tied to the path's
  // own length, so it reads as background detail glimpsed once rather
  // than more path decorations repeating down the page. Deliberately
  // fuller than an earlier pass at this scene, which kept everything at
  // 0.32 opacity and to just 3 elements on purpose, reasoning that a
  // livelier ocean would read as "twee" — per direction, that read as
  // flat and empty instead, so this version leans into an actually lived-
  // in sea: more sails, more birds, real depth via layered opacity/size
  // rather than one uniform faint tone. Fixed pixel offsets, not
  // percentages — these need to sit in the open sky beside the heading
  // regardless of how tall the rest of the page ends up (which varies
  // with subject count), not drift based on total scrollable height.
  const ambientSceneHTML = isOceanScene
    ? `
      <span class="ocean-ambient ocean-ambient-sun" style="left:14%;top:55px;font-size:46px;" aria-hidden="true">☀️</span>
      <span class="ocean-ambient" style="left:78%;top:120px;font-size:40px;" aria-hidden="true">⛵</span>
      <span class="ocean-ambient" style="left:20%;top:150px;font-size:26px;" aria-hidden="true">⛵</span>
      <span class="ocean-ambient" style="left:60%;top:65px;font-size:18px;" aria-hidden="true">🕊️</span>
      <span class="ocean-ambient" style="left:65%;top:92px;font-size:14px;" aria-hidden="true">🕊️</span>
      <span class="ocean-ambient" style="left:52%;top:78px;font-size:13px;" aria-hidden="true">🕊️</span>
      <span class="ocean-ambient" style="left:90%;top:180px;font-size:22px;" aria-hidden="true">🐬</span>
      <span class="ocean-ambient" style="left:8%;top:210px;font-size:20px;" aria-hidden="true">🐟</span>
    `
    : "";

  // The ocean scene's own walkable canvas — same hubWorld.js engine every
  // subject hub uses (fixed WORLD_W x WORLD_H world, camera-follow,
  // WASD/joystick via wireMovement below), replacing this map's own
  // scrolling path/decorations for ACT only. Reaching an island is still
  // a deliberate click on its own button (targets: [] below — see this
  // feature's own chat history for why sailing onto one doesn't enter it
  // automatically), so this is "a real place to sail," not a new way to
  // navigate. Every non-ACT test keeps the original scrolling path
  // entirely untouched, several lines down in this same template.
  const oceanCanvasHTML = isOceanScene
    ? `
      <p class="map-subtitle hub-hint" id="mapHubHint">⛵ Sail with WASD or the joystick &mdash; click an island to open it</p>
      <div class="hub-viewport ocean-map-viewport" id="mapHubViewport">
        <button class="hub-fullscreen-btn" id="mapHubFullscreenBtn" type="button" aria-label="Enter fullscreen">⛶</button>
        ${joystickHTML("mapHubJoystick")}
        <div class="hub-world" id="mapHubWorld" style="width:${WORLD_W}px;height:${WORLD_H}px;">
          ${planets}
          ${renderBoatAvatar()}
        </div>
      </div>
    `
    : "";

  root.innerHTML = `
    ${hudHTML("map")}
    <main class="screen map-screen ${isOceanScene ? "ocean-scene" : ""}" style="--test-color:${test.color};--test-bg:${test.bg};${glowVars(test.color)}">
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
      ${
        isOceanScene
          ? oceanCanvasHTML
          : `
            <div class="map-path-container" style="height:${totalHeight}px">
              <div class="map-planet-circle"></div>
              ${renderPathSvg(positions, totalHeight, { color: test.color })}
              <div class="path-decorations">${renderDecorations(totalHeight, 1, TEST_DECORATIONS[activeTestId] || TEST_DECORATIONS.act)}</div>
              ${planets}
            </div>
          `
      }
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
  // boat's rAF loop running forever against a detached node, and its WASD
  // listener still bound on whatever screen came next.
  let stopBoat = () => {};
  const goTo = (screen, params) => {
    stopBoat();
    navigate(screen, params);
  };
  wireHud(root, goTo);
  if (isOceanScene) {
    const viewportEl = root.querySelector("#mapHubViewport");
    const worldEl = root.querySelector("#mapHubWorld");
    const avatarEl = root.querySelector("#mapBoatAvatar");
    const hintEl = root.querySelector("#mapHubHint");
    const joystickEl = root.querySelector("#mapHubJoystick");
    // Spawns just off the current subject's own island, same "follows
    // the current subject" idea this feature started from — offset to
    // the side rather than dead-center on it so the boat doesn't render
    // on top of the island's own clickable button.
    const currentPos = positions[currentIndex] || CENTER;
    const spawn = { x: currentPos.x + 170, y: currentPos.y };
    const stopMovement = wireMovement({
      avatarEl,
      worldEl,
      viewportEl,
      hintEl,
      joystickEl,
      spawn,
      // Reaching another island is still a deliberate click on its own
      // button, not something sailing near it triggers — no arrival
      // targets here at all (see this feature's own chat history).
      targets: [],
    });
    const unwireFullscreen = wireFullscreenToggle(viewportEl, root.querySelector("#mapHubFullscreenBtn"));
    stopBoat = () => {
      stopMovement();
      unwireFullscreen();
    };
    // navigate() just scrolled to (0,0) before calling this render — on a
    // typical viewport that leaves the canvas well below the fold behind
    // both shortcut rows (they alone run several hundred px tall), so a
    // player arriving here would have to already know to scroll down
    // before WASD/the joystick does anything visible.
    viewportEl.scrollIntoView({ block: "center" });
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
