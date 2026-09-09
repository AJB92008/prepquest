// Regression tests for Lexicon Shoals' Grammar Garrison lesson-path
// terrain themes (see skillPathHub.js's own LESSON_THEMES map and
// js/ui/lessonThemes/ for each skill's bespoke scene) — same coverage
// archiveStacksLessonThemes.test.js already gives Archive Stacks, scoped
// to Grammar Garrison's own 4 skills instead of a whole subject: SAT
// Reading & Writing's other zones (Etymology Grove, the Scriptorium)
// still have no themes of their own yet.
import { GameState, gameState } from "../js/state.js";
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

const GARRISON_SKILL_IDS = ["satrw-boundaries", "satrw-punctuation", "satrw-agreement", "satrw-verbforms"];

test("every one of Grammar Garrison's 4 skills has its own lesson-path theme", () => {
  GARRISON_SKILL_IDS.forEach((id) => {
    assertTrue(id in LESSON_THEMES, `expected a LESSON_THEMES entry for Grammar Garrison skill "${id}"`);
  });
});

test("every Grammar Garrison theme renders through the full screen (real lesson count from the actual question bank) without throwing", () => {
  GARRISON_SKILL_IDS.forEach((skillId) => {
    freshGameState();
    const root = document.createElement("div");
    renderThemedLessonPath(root, () => {}, { skillId, subjectId: "sat-rw" });
    const svg = root.querySelector(".lesson-terrain-svg");
    assertTrue(!!svg, `expected a rendered <svg> for skill "${skillId}"`);
    assertTrue((svg.getAttribute("viewBox") || "").length > 0, `expected a real viewBox for skill "${skillId}"`);
  });
});

test("every Grammar Garrison theme's renderScene holds up across a spread of lesson counts (1, 5, 20, 28)", () => {
  GARRISON_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [1, 5, 20, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      let svgString;
      try {
        svgString = theme.renderScene(positions, totalHeight, "The Garrison Sergeant");
      } catch (e) {
        throw new Error(`${skillId}'s theme threw at lesson count ${count}: ${e.message}`);
      }
      assertTrue(typeof svgString === "string" && svgString.includes("<svg"), `expected "${skillId}" to render a real <svg> at lesson count ${count}`);
    });
  });
});

test("Grammar Garrison's 4 skills are visually distinct (no two share a theme object)", () => {
  const themeObjects = GARRISON_SKILL_IDS.map((id) => LESSON_THEMES[id]);
  const uniqueThemes = new Set(themeObjects);
  assertEqual(uniqueThemes.size, GARRISON_SKILL_IDS.length, "expected every Grammar Garrison skill to have its own distinct theme, not a shared/reused one");
});

// Same regression class archiveStacksLessonThemes.test.js's own version
// of this check guards against — only elements with a real radius
// (r >= 3) count, since a sub-pixel ambient detail landing near the
// clearing by coincidence is visually inconsequential.
test("no Grammar Garrison theme places a real decorative feature on top of the boss/champion clearing, at any lesson count", () => {
  GARRISON_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [5, 10, 15, 20, 25, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      const svgString = theme.renderScene(positions, totalHeight, "The Garrison Sergeant");
      const root = document.createElement("div");
      root.innerHTML = svgString;
      const boss = root.querySelector('circle[r="86"]');
      assertTrue(!!boss, `expected a boss clearing circle for "${skillId}" at count ${count}`);
      const bossX = Number(boss.getAttribute("cx"));
      const bossY = Number(boss.getAttribute("cy"));
      const collision = [...root.querySelectorAll("circle,ellipse")].some((el) => {
        if (el === boss) return false;
        const r = Number(el.getAttribute("r") || el.getAttribute("rx") || 0);
        if (r < 3) return false;
        const cx = Number(el.getAttribute("cx"));
        const cy = Number(el.getAttribute("cy"));
        return Math.abs(cx - bossX) < 8 && Math.abs(cy - bossY) < 8;
      });
      assertTrue(!collision, `expected no real decorative feature on "${skillId}"'s boss clearing at lesson count ${count}`);
    });
  });
});
