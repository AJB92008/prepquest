// Regression tests for ACT's World Map ocean-scene rebuild — a real
// walkable hubWorld.js canvas (WORLD_W x WORLD_H, camera-follow via
// wireMovement, a boat avatar) replacing the plain scrolling path/
// mascot every other test's World Map still uses. See ISLAND_WORLD_POS
// in ui/worldMap.js: each ACT subject gets its own hand-placed world
// coordinate — a subject id missing from that map would silently fall
// back to sharing hubWorld.js's own CENTER with whichever other subject
// (if any) also missed it, stacking two islands on top of each other
// with no visual cue that anything's wrong.
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

test("every ACT subject island sits at its own distinct world position (none silently fell back to sharing CENTER)", () => {
  freshGameState();
  const root = document.createElement("div");
  renderWorldMap(root, () => {}, { testId: "act" });
  const wraps = [...root.querySelectorAll(".map-node-wrap")];
  assertTrue(wraps.length >= 4, `expected at least 4 ACT islands, got ${wraps.length}`);
  const positions = wraps.map((w) => w.style.left + "," + w.style.top);
  const unique = new Set(positions);
  assertEqual(unique.size, positions.length, `two or more ACT islands share the exact same world position: [${positions.join(" | ")}]`);
});

test("ACT's World Map renders a walkable ocean canvas with a boat avatar, not the plain scrolling path", () => {
  freshGameState();
  const root = document.createElement("div");
  renderWorldMap(root, () => {}, { testId: "act" });
  assertTrue(!!root.querySelector("#mapHubViewport"), "expected the ocean scene's own #mapHubViewport");
  assertTrue(!!root.querySelector("#mapBoatAvatar"), "expected the boat avatar");
  assertTrue(!root.querySelector(".map-path-container"), "ACT should no longer render the old scrolling path container");
});

test("SAT's World Map still renders the original scrolling path and plain mascot, untouched by the ocean-scene rebuild", () => {
  freshGameState();
  const root = document.createElement("div");
  renderWorldMap(root, () => {}, { testId: "sat" });
  assertTrue(!!root.querySelector(".map-path-container"), "SAT should still render the original path container");
  assertTrue(!root.querySelector("#mapHubViewport"), "SAT should not render the ocean scene's walkable canvas");
  assertTrue(!root.querySelector("#mapBoatAvatar"), "SAT should not render a boat avatar");
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
