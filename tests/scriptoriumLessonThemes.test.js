// Regression tests for Lexicon Shoals' Scriptorium lesson-path terrain
// themes (see skillPathHub.js's own LESSON_THEMES map and
// js/ui/lessonThemes/ for each skill's bespoke scene) — same coverage
// archiveStacksLessonThemes.test.js and grammarGarrisonLessonThemes.test.js
// already give their own zones, scoped to Scriptorium's own 3 skills.
// SAT Reading & Writing's last remaining zone, Etymology Grove, still
// has no themes of its own yet.
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

const SCRIPTORIUM_SKILL_IDS = ["satrw-transitions", "satrw-rhetoricalsynth", "satrw-organization"];

test("every one of Scriptorium's 3 skills has its own lesson-path theme", () => {
  SCRIPTORIUM_SKILL_IDS.forEach((id) => {
    assertTrue(id in LESSON_THEMES, `expected a LESSON_THEMES entry for Scriptorium skill "${id}"`);
  });
});

test("every Scriptorium theme renders through the full screen (real lesson count from the actual question bank) without throwing", () => {
  SCRIPTORIUM_SKILL_IDS.forEach((skillId) => {
    freshGameState();
    const root = document.createElement("div");
    renderThemedLessonPath(root, () => {}, { skillId, subjectId: "sat-rw" });
    const svg = root.querySelector(".lesson-terrain-svg");
    assertTrue(!!svg, `expected a rendered <svg> for skill "${skillId}"`);
    assertTrue((svg.getAttribute("viewBox") || "").length > 0, `expected a real viewBox for skill "${skillId}"`);
  });
});

test("every Scriptorium theme's renderScene holds up across a spread of lesson counts (1, 5, 20, 28)", () => {
  SCRIPTORIUM_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [1, 5, 20, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      let svgString;
      try {
        svgString = theme.renderScene(positions, totalHeight, "The Chief Archivist");
      } catch (e) {
        throw new Error(`${skillId}'s theme threw at lesson count ${count}: ${e.message}`);
      }
      assertTrue(typeof svgString === "string" && svgString.includes("<svg"), `expected "${skillId}" to render a real <svg> at lesson count ${count}`);
    });
  });
});

test("Scriptorium's 3 skills are visually distinct (no two share a theme object)", () => {
  const themeObjects = SCRIPTORIUM_SKILL_IDS.map((id) => LESSON_THEMES[id]);
  const uniqueThemes = new Set(themeObjects);
  assertEqual(uniqueThemes.size, SCRIPTORIUM_SKILL_IDS.length, "expected every Scriptorium skill to have its own distinct theme, not a shared/reused one");
});

// Same regression class archiveStacksLessonThemes.test.js's own version
// of this check guards against — only elements with a real radius
// (r >= 3) count, since a sub-pixel ambient detail landing near the
// clearing by coincidence is visually inconsequential. tradeRoutes.js
// and pinnedNotes.js both build their own boss clearing from several
// concentric circles (a wax-seal ring plus the seal itself, all sharing
// the boss's own exact cx/cy) rather than one plain circle — those
// aren't a decorative feature landing on the boss, they *are* the boss,
// so exact-center matches are excluded from the collision check the
// same way `el === boss` already excludes the r=86 circle itself. That
// exact-equality check only holds because tradeRoutes.js/pinnedNotes.js
// interpolate the same unformatted `${last.x}`/`${last.y}` into every
// ring's own cx/cy (see each file's own bossClearing) — if a later edit
// ever runs one of those through `.toFixed()` while leaving the others
// alone, the two would stop comparing exactly equal and this exclusion
// would silently stop matching real boss-ring elements.
test("no Scriptorium theme places a real decorative feature on top of the boss/champion clearing, at any lesson count", () => {
  SCRIPTORIUM_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [5, 10, 15, 20, 25, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      const svgString = theme.renderScene(positions, totalHeight, "The Chief Archivist");
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
        if (cx === bossX && cy === bossY) return false;
        return Math.abs(cx - bossX) < 8 && Math.abs(cy - bossY) < 8;
      });
      assertTrue(!collision, `expected no real decorative feature on "${skillId}"'s boss clearing at lesson count ${count}`);
    });
  });
});

// Logical Order's own real waypoint number and its discarded "ghost"
// number are both just `i + 1`/`i + 2` — never derived from any shared
// skip/selection seed the way catalogDrift.js's own pieces once were —
// but they must still always differ, at every position, or the "here's
// the correction" idea collapses into two identical numbers side by
// side. Real algebra, not modulus-based, so this isn't the same bug
// class; still worth locking down given it's the one Scriptorium theme
// that depends on two derived values staying different from each other.
// Rendering order per stop is always [ghost, real] (see
// expeditionRoute.js's own renderWaypoints), so the flat <text> list
// pairs up the same way; count 1 is its own edge case — the single
// position *is* the boss, so there's no stop before it and no text at
// all, same as every other Scriptorium/Grammar Garrison theme's own
// boss-excluding filter.
test("expeditionRouteTheme's real waypoint number and its discarded ghost number always differ, at every lesson count", () => {
  const theme = LESSON_THEMES["satrw-organization"];
  [2, 5, 20, 28].forEach((count) => {
    const positions = computeTrail(count, theme.trailBand);
    const totalHeight = totalHeightFor(count);
    const svgString = theme.renderScene(positions, totalHeight, "The Chief Archivist");
    const root = document.createElement("div");
    root.innerHTML = svgString;
    const texts = [...root.querySelectorAll("text")].map((t) => t.textContent);
    const expectedStops = count - 1;
    assertEqual(texts.length, expectedStops * 2, `expected one ghost + one real number per stop at lesson count ${count}`);
    for (let i = 0; i < texts.length; i += 2) {
      const ghost = Number(texts[i]);
      const real = Number(texts[i + 1]);
      assertEqual(ghost, real + 1, `expected the ghost number to be exactly one past the real number at stop ${i / 2}, lesson count ${count}`);
    }
  });
  const positions = computeTrail(1, theme.trailBand);
  const svgString = theme.renderScene(positions, totalHeightFor(1), "The Chief Archivist");
  const root = document.createElement("div");
  root.innerHTML = svgString;
  assertEqual(root.querySelectorAll("text").length, 0, "expected no waypoint numbers at lesson count 1, since the single position is the boss itself");
});
