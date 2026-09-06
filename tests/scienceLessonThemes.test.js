// Regression tests for Lab Archipelago's lesson-path terrain themes (see
// skillPathHub.js's own LESSON_THEMES map and js/ui/lessonThemes/ for
// each skill's bespoke scene). Same two things worth protecting as
// readingLessonThemes.test.js checks for Reading's own ten: every
// Science skill actually has a theme (so a future skill added to
// data/skills.js doesn't silently fall back to the plain generic path
// without anyone noticing), and every one of those themes actually
// renders a real SVG scene without throwing, across a range of lesson
// counts (a skill's bank size isn't fixed — see BANK_SIZE_OVERRIDES in
// data/questions/index.js — so a theme's own geometry has to hold up at
// more than just whatever count it happened to be eyeballed at).
import { GameState, gameState } from "../js/state.js";
import { SUBJECTS } from "../js/data/skills.js";
import { computeTrail, totalHeightFor } from "../js/ui/lessonTerrain.js";
import { LESSON_THEMES, renderThemedLessonPath } from "../js/ui/skillPathHub.js";
import { test, assertEqual, assertTrue } from "./assert.js";

function freshGameState() {
  localStorage.removeItem("act-quest-save-v1");
  const fresh = new GameState();
  fresh.data.onboarded = true;
  gameState.data = fresh.data;
  return gameState;
}

const SCIENCE_SKILL_IDS = SUBJECTS.find((s) => s.id === "science").skills.map((s) => s.id);

test("every one of Science's 6 skills has its own lesson-path theme", () => {
  assertEqual(SCIENCE_SKILL_IDS.length, 6);
  SCIENCE_SKILL_IDS.forEach((id) => {
    assertTrue(id in LESSON_THEMES, `expected a LESSON_THEMES entry for Science skill "${id}"`);
  });
});

test("every Science theme renders through the full screen (real lesson count from the actual question bank) without throwing", () => {
  SCIENCE_SKILL_IDS.forEach((skillId) => {
    freshGameState();
    const root = document.createElement("div");
    renderThemedLessonPath(root, () => {}, { skillId, subjectId: "science" });
    const svg = root.querySelector(".lesson-terrain-svg");
    assertTrue(!!svg, `expected a rendered <svg> for skill "${skillId}"`);
    assertTrue((svg.getAttribute("viewBox") || "").length > 0, `expected a real viewBox for skill "${skillId}"`);
  });
});

// A skill's own bank size isn't fixed, so each theme's own geometry has
// to hold up at more than just whatever count the bank happens to be
// today. Calling renderScene directly (bypassing gameState/
// getLessonCount entirely) lets this test that across a spread of
// counts cheaply, real bank size notwithstanding.
test("every Science theme's renderScene holds up across a spread of lesson counts (1, 5, 20, 28)", () => {
  SCIENCE_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [1, 5, 20, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      let svgString;
      try {
        svgString = theme.renderScene(positions, totalHeight, "The Lab Director");
      } catch (e) {
        throw new Error(`${skillId}'s theme threw at lesson count ${count}: ${e.message}`);
      }
      assertTrue(typeof svgString === "string" && svgString.includes("<svg"), `expected "${skillId}" to render a real <svg> at lesson count ${count}`);
    });
  });
});

// Data Deck and Field Station and Observatory Ridge each intentionally
// share one visual environment across their own 2 skills (see
// skillPathHub.js's own header comment) — but "shared environment"
// means each pair still gets its own theme object with its own focal
// feature, not the literal same object reused twice.
test("no two Science skills share the exact same theme object, even within a shared-environment zone", () => {
  const themeObjects = SCIENCE_SKILL_IDS.map((id) => LESSON_THEMES[id]);
  const uniqueThemes = new Set(themeObjects);
  assertEqual(uniqueThemes.size, SCIENCE_SKILL_IDS.length, "expected every Science skill to have its own distinct theme object, not a shared/reused one");
});
