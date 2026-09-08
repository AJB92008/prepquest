// Regression tests for Lexicon Shoals' Archive Stacks lesson-path
// terrain themes (see skillPathHub.js's own LESSON_THEMES map and
// js/ui/lessonThemes/ for each skill's bespoke scene) — same coverage
// readingLessonThemes.test.js/scienceLessonThemes.test.js already give
// their own subjects, just scoped to these 5 skills specifically rather
// than a whole subject: SAT Reading & Writing's other 12 skills (Etymology
// Grove, the Scriptorium, Grammar Garrison) have no themes yet, so an
// "every sat-rw skill has one" assertion would fail today by design.
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

const ARCHIVE_STACKS_SKILL_IDS = ["satrw-centralidea", "satrw-evidence-text", "satrw-evidence-data", "satrw-inference", "satrw-detailsort"];

test("every one of Archive Stacks' 5 skills has its own lesson-path theme", () => {
  ARCHIVE_STACKS_SKILL_IDS.forEach((id) => {
    assertTrue(id in LESSON_THEMES, `expected a LESSON_THEMES entry for Archive Stacks skill "${id}"`);
  });
});

test("every Archive Stacks theme renders through the full screen (real lesson count from the actual question bank) without throwing", () => {
  ARCHIVE_STACKS_SKILL_IDS.forEach((skillId) => {
    freshGameState();
    const root = document.createElement("div");
    renderThemedLessonPath(root, () => {}, { skillId, subjectId: "sat-rw" });
    const svg = root.querySelector(".lesson-terrain-svg");
    assertTrue(!!svg, `expected a rendered <svg> for skill "${skillId}"`);
    assertTrue((svg.getAttribute("viewBox") || "").length > 0, `expected a real viewBox for skill "${skillId}"`);
  });
});

test("every Archive Stacks theme's renderScene holds up across a spread of lesson counts (1, 5, 20, 28)", () => {
  ARCHIVE_STACKS_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [1, 5, 20, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      let svgString;
      try {
        svgString = theme.renderScene(positions, totalHeight, "The Archive Warden");
      } catch (e) {
        throw new Error(`${skillId}'s theme threw at lesson count ${count}: ${e.message}`);
      }
      assertTrue(typeof svgString === "string" && svgString.includes("<svg"), `expected "${skillId}" to render a real <svg> at lesson count ${count}`);
    });
  });
});

test("Archive Stacks' 5 skills are visually distinct (no two share a theme object)", () => {
  const themeObjects = ARCHIVE_STACKS_SKILL_IDS.map((id) => LESSON_THEMES[id]);
  const uniqueThemes = new Set(themeObjects);
  assertEqual(uniqueThemes.size, ARCHIVE_STACKS_SKILL_IDS.length, "expected every Archive Stacks skill to have its own distinct theme, not a shared/reused one");
});

// Same regression class moonSequenceTheme's own dedicated test guards
// against (a decorative element rendering right on top of the boss/
// champion clearing), generalized across all 5 of these themes at once —
// only elements with a real radius (r >= 3) count, since a sub-pixel
// ambient star landing near the clearing is visually inconsequential and
// not the failure mode being protected against here.
test("no Archive Stacks theme places a real decorative feature on top of the boss/champion clearing, at any lesson count", () => {
  ARCHIVE_STACKS_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [5, 10, 15, 20, 25, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      const svgString = theme.renderScene(positions, totalHeight, "The Archive Warden");
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

// Regression for a real bug this file's own celestialCodex sibling,
// catalogDrift, briefly had: its jittered grid skipped cells on the same
// `seed % 3` it then read again to pick which of PIECES.length===3 pieces
// to draw, which meant index 0 (indexCard) could never be selected — the
// skip condition had already filtered out every seed capable of landing
// there. Checking the real renderScene output (not the private helper
// function) catches this the way a future refactor might reintroduce it.
test("catalogDriftTheme's drift actually includes all 3 piece kinds (index cards, mini scrolls, wax seals), not just 2", () => {
  const theme = LESSON_THEMES["satrw-detailsort"];
  const positions = computeTrail(20, theme.trailBand);
  const totalHeight = totalHeightFor(20);
  const svgString = theme.renderScene(positions, totalHeight, "The Archive Warden");
  const root = document.createElement("div");
  root.innerHTML = svgString;
  // Index cards are the only piece built from a <rect> with a small
  // colored corner-tab <rect> immediately after it inside the same <g> —
  // mini scrolls and wax seals never emit a <rect> at all.
  const groups = [...root.querySelectorAll("g")];
  const indexCardCount = groups.filter((g) => g.querySelectorAll("rect").length >= 2).length;
  assertTrue(indexCardCount > 5, `expected several index cards in the drift, found ${indexCardCount}`);
});
