// Regression tests for ACT's World Map boat — WASD/joystick lets the
// player's boat roam freely around .map-path-container (see
// renderBoatRoamer/wireBoatRoam in ui/worldMap.js), but this screen's own
// layout/scrolling/click-to-enter-an-island is the same original one
// every other test's World Map still uses (a full walkable-hub-engine
// rebuild of this screen was tried and explicitly reverted — see this
// feature's own chat history).
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

test("ACT's World Map keeps the original scrolling path container and adds a boat + fixed joystick to it", () => {
  freshGameState();
  const root = document.createElement("div");
  renderWorldMap(root, () => {}, { testId: "act" });
  assertTrue(!!root.querySelector(".map-path-container"), "ACT should still render the original path container");
  assertTrue(!!root.querySelector("#mapBoatRoamer"), "expected the boat");
  assertTrue(!!root.querySelector("#mapBoatJoystick"), "expected the boat's own joystick");
  assertTrue(root.querySelector("#mapBoatRoamer").closest(".map-path-container") !== null, "the boat should sit inside .map-path-container, not a separate canvas");
});

test("SAT's World Map has no boat or boat joystick, untouched by ACT's own boat feature", () => {
  freshGameState();
  const root = document.createElement("div");
  renderWorldMap(root, () => {}, { testId: "sat" });
  assertTrue(!!root.querySelector(".map-path-container"), "SAT should still render the original path container");
  assertTrue(!root.querySelector("#mapBoatRoamer"), "SAT should not render a boat");
  assertTrue(!root.querySelector("#mapBoatJoystick"), "SAT should not render the boat's joystick");
});

test("clicking an ACT island still navigates there directly, even though the boat can now sail up to it", () => {
  freshGameState();
  const root = document.createElement("div");
  let navigated = null;
  renderWorldMap(root, (screen, params) => (navigated = { screen, params }), { testId: "act" });
  root.querySelector('[data-subject="math"]').click();
  assertEqual(navigated.screen, "island");
  assertEqual(navigated.params.subjectId, "math");
});
