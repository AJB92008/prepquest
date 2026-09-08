// Regression tests for the World Map's per-test themes (WORLD_MAP_THEMES
// in ui/worldMap.js) — ACT's ocean, SAT's Sky Islands, and (once built)
// PSAT's Alpine Highlands each get their own backdrop, island art per
// subject, and a themed roaming vehicle, all still inside the original
// scrolling path/shortcuts layout every test's World Map has always used
// (a full walkable-hub-engine rebuild of this screen was tried and
// explicitly reverted — see this feature's own chat history). State
// Assessments has no theme at all (its 50-state list has no fixed small
// set of "islands" to hand-design art for) and must keep rendering the
// original round planet-sphere/generic-blob picker.
import { getTestSubjects } from "../js/data/tests.js";
import { GameState, gameState } from "../js/state.js";
import { renderWorldMap } from "../js/ui/worldMap.js";
import { test, assertEqual, assertTrue } from "./assert.js";

function freshGameState() {
  localStorage.removeItem("act-quest-save-v1");
  const fresh = new GameState();
  fresh.data.onboarded = true;
  gameState.data = fresh.data;
  return gameState;
}

// The themed tests actually built so far — extend this list as each new
// theme (PSAT, etc.) is added, so this file's own coverage grows with
// WORLD_MAP_THEMES instead of needing a parallel list kept in sync by hand.
const THEMED_TEST_IDS = ["act", "sat"];

THEMED_TEST_IDS.forEach((testId) => {
  test(`${testId}'s World Map keeps the original scrolling path container and adds a themed vehicle + fixed joystick to it`, () => {
    freshGameState();
    const root = document.createElement("div");
    renderWorldMap(root, () => {}, { testId });
    assertTrue(!!root.querySelector(".map-path-container"), `${testId} should still render the original path container`);
    assertTrue(!!root.querySelector("#mapRoamer"), `expected ${testId}'s own roaming vehicle`);
    assertTrue(!!root.querySelector("#mapRoamerJoystick"), `expected ${testId}'s own roamer joystick`);
    assertTrue(root.querySelector("#mapRoamer").closest(".map-path-container") !== null, "the vehicle should sit inside .map-path-container, not a separate canvas");
  });

  test(`every one of ${testId}'s own subjects resolves to real (non-empty) island art`, () => {
    freshGameState();
    const root = document.createElement("div");
    renderWorldMap(root, () => {}, { testId });
    const subjects = getTestSubjects(testId);
    subjects.forEach((subject) => {
      const art = root.querySelector(`[data-subject="${subject.id}"] .map-island-art`);
      assertTrue(!!art, `expected an island-art button for "${subject.id}"`);
      assertTrue(art.innerHTML.trim().length > 0, `"${subject.id}" resolved to empty island art — its id is likely missing from SUBJECT_ISLAND_ART`);
    });
  });
});

test("PSAT's World Map has no themed vehicle yet and still uses the plain planet-sphere picker", () => {
  freshGameState();
  const root = document.createElement("div");
  renderWorldMap(root, () => {}, { testId: "psat" });
  assertTrue(!!root.querySelector(".map-path-container"), "PSAT should still render the original path container");
  assertTrue(!root.querySelector("#mapRoamer"), "PSAT should not render a roaming vehicle yet");
  assertTrue(!root.querySelector("#mapRoamerJoystick"), "PSAT should not render a roamer joystick yet");
});

test("State Assessments' World Map has no theme at all — no roaming vehicle, still the plain planet-sphere picker", () => {
  const gs = freshGameState();
  gs.setHomeState("WI");
  const root = document.createElement("div");
  renderWorldMap(root, () => {}, { testId: "stateAssessments" });
  assertTrue(!!root.querySelector(".map-path-container"), "State Assessments should still render the original path container");
  assertTrue(!!root.querySelector(".map-planet-circle"), "State Assessments should still render the plain planet-sphere backdrop");
  assertTrue(!root.querySelector("#mapRoamer"), "State Assessments should not render a roaming vehicle");
  assertTrue(!root.querySelector("#mapRoamerJoystick"), "State Assessments should not render a roamer joystick");
});

test("clicking an ACT island still navigates there directly, even though its own boat can now sail up to it", () => {
  freshGameState();
  const root = document.createElement("div");
  let navigated = null;
  renderWorldMap(root, (screen, params) => (navigated = { screen, params }), { testId: "act" });
  root.querySelector('[data-subject="math"]').click();
  assertEqual(navigated.screen, "island");
  assertEqual(navigated.params.subjectId, "math");
});

test("clicking a SAT island still navigates there directly, even though its own balloon can now sail up to it", () => {
  freshGameState();
  const root = document.createElement("div");
  let navigated = null;
  renderWorldMap(root, (screen, params) => (navigated = { screen, params }), { testId: "sat" });
  root.querySelector('[data-subject="sat-math"]').click();
  assertEqual(navigated.screen, "island");
  assertEqual(navigated.params.subjectId, "sat-math");
});
