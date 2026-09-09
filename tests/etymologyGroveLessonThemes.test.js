// Regression tests for Lexicon Shoals' Etymology Grove lesson-path
// terrain themes (see skillPathHub.js's own LESSON_THEMES map and
// js/ui/lessonThemes/ for each skill's bespoke scene) — same coverage
// archiveStacksLessonThemes.test.js, grammarGarrisonLessonThemes.test.js,
// and scriptoriumLessonThemes.test.js already give their own zones,
// scoped to Etymology Grove's own 5 skills. With this zone done, every
// skill across all 4 SAT Reading & Writing zones now has its own
// bespoke lesson-path theme.
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

const GROVE_SKILL_IDS = ["satrw-wordsincontext", "satrw-textstructure", "satrw-purpose", "satrw-crosstext", "satrw-figurative"];

test("every one of Etymology Grove's 5 skills has its own lesson-path theme", () => {
  GROVE_SKILL_IDS.forEach((id) => {
    assertTrue(id in LESSON_THEMES, `expected a LESSON_THEMES entry for Etymology Grove skill "${id}"`);
  });
});

test("every Etymology Grove theme renders through the full screen (real lesson count from the actual question bank) without throwing", () => {
  GROVE_SKILL_IDS.forEach((skillId) => {
    freshGameState();
    const root = document.createElement("div");
    renderThemedLessonPath(root, () => {}, { skillId, subjectId: "sat-rw" });
    const svg = root.querySelector(".lesson-terrain-svg");
    assertTrue(!!svg, `expected a rendered <svg> for skill "${skillId}"`);
    assertTrue((svg.getAttribute("viewBox") || "").length > 0, `expected a real viewBox for skill "${skillId}"`);
  });
});

test("every Etymology Grove theme's renderScene holds up across a spread of lesson counts (1, 5, 20, 28)", () => {
  GROVE_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [1, 5, 20, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      let svgString;
      try {
        svgString = theme.renderScene(positions, totalHeight, "The Grovekeeper");
      } catch (e) {
        throw new Error(`${skillId}'s theme threw at lesson count ${count}: ${e.message}`);
      }
      assertTrue(typeof svgString === "string" && svgString.includes("<svg"), `expected "${skillId}" to render a real <svg> at lesson count ${count}`);
    });
  });
});

test("Etymology Grove's 5 skills are visually distinct (no two share a theme object)", () => {
  const themeObjects = GROVE_SKILL_IDS.map((id) => LESSON_THEMES[id]);
  const uniqueThemes = new Set(themeObjects);
  assertEqual(uniqueThemes.size, GROVE_SKILL_IDS.length, "expected every Etymology Grove skill to have its own distinct theme, not a shared/reused one");
});

// Same regression class archiveStacksLessonThemes.test.js's own version
// of this check guards against — only elements with a real radius
// (r >= 3) count for circle/ellipse, since a sub-pixel ambient detail
// landing near the clearing by coincidence is visually inconsequential.
// Every Etymology Grove boss clearing is a single plain circle (no
// concentric extras the way tradeRoutes.js/pinnedNotes.js build
// theirs), so this needs no exact-center exclusion the way
// scriptoriumLessonThemes.test.js's own version does. Also checks
// rect/text — every Grove file's own renderRootTag renders both — since
// a circle/ellipse-only version of this exact check is what let
// canopyBridge.js's own root tags land inside the boss clearing at real
// lesson counts (10, 20, 28, all already in the spread below) before
// its `p.y + 12` offset was found and fixed: the tags were invisible to
// a selector that never looked at rect or text. Measured as real
// Euclidean distance from the boss's own center against its own actual
// radius, not the fixed-8px box the circle-only version used to use —
// a box check has no obvious meaning for a rectangular tag, distance
// against the real clearing radius does. topiaryTwist.js's own star
// canopy is a <polygon>, checked by its own test below.
test("no Etymology Grove theme places a real decorative feature on top of the boss/champion clearing, at any lesson count", () => {
  GROVE_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [5, 10, 15, 20, 25, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      const svgString = theme.renderScene(positions, totalHeight, "The Grovekeeper");
      const root = document.createElement("div");
      root.innerHTML = svgString;
      const boss = root.querySelector('circle[r="86"]');
      assertTrue(!!boss, `expected a boss clearing circle for "${skillId}" at count ${count}`);
      const bossX = Number(boss.getAttribute("cx"));
      const bossY = Number(boss.getAttribute("cy"));
      const bossRadius = Number(boss.getAttribute("r"));

      const circleHits = [...root.querySelectorAll("circle,ellipse")].filter((el) => {
        if (el === boss) return false;
        const r = Number(el.getAttribute("r") || el.getAttribute("rx") || 0);
        if (r < 3) return false;
        const cx = Number(el.getAttribute("cx"));
        const cy = Number(el.getAttribute("cy"));
        return Math.hypot(cx - bossX, cy - bossY) < bossRadius;
      });
      const rectHits = [...root.querySelectorAll("rect")].filter((el) => {
        const cx = Number(el.getAttribute("x")) + Number(el.getAttribute("width")) / 2;
        const cy = Number(el.getAttribute("y")) + Number(el.getAttribute("height")) / 2;
        return Math.hypot(cx - bossX, cy - bossY) < bossRadius;
      });
      const textHits = [...root.querySelectorAll("text")].filter((el) => {
        const cx = Number(el.getAttribute("x"));
        const cy = Number(el.getAttribute("y"));
        return Math.hypot(cx - bossX, cy - bossY) < bossRadius;
      });

      assertEqual(circleHits.length, 0, `expected no real circle/ellipse decoration on "${skillId}"'s boss clearing at lesson count ${count}`);
      assertEqual(rectHits.length, 0, `expected no root-tag rect on "${skillId}"'s boss clearing at lesson count ${count}`);
      assertEqual(textHits.length, 0, `expected no root-tag text on "${skillId}"'s boss clearing at lesson count ${count}`);
    });
  });
});

// topiaryTwist.js's own star canopy is a <polygon>, not a <circle>, so
// it needs its own version of the same boss-collision check — a star
// point landing on the boss clearing would be exactly as wrong as any
// other decoration doing it, just invisible to a selector scoped to
// circle/ellipse.
test("topiaryTwistTheme's star canopy never lands on the boss/champion clearing, at any lesson count", () => {
  const theme = LESSON_THEMES["satrw-figurative"];
  [5, 10, 15, 20, 25, 28].forEach((count) => {
    const positions = computeTrail(count, theme.trailBand);
    const totalHeight = totalHeightFor(count);
    const svgString = theme.renderScene(positions, totalHeight, "The Grovekeeper");
    const root = document.createElement("div");
    root.innerHTML = svgString;
    const boss = root.querySelector('circle[r="86"]');
    const bossX = Number(boss.getAttribute("cx"));
    const bossY = Number(boss.getAttribute("cy"));
    const collision = [...root.querySelectorAll("polygon")].some((poly) => {
      const pts = poly.getAttribute("points").split(" ").map((pair) => pair.split(",").map(Number));
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      return Math.abs(cx - bossX) < 8 && Math.abs(cy - bossY) < 8;
    });
    assertTrue(!collision, `expected no star canopy on the boss clearing at lesson count ${count}`);
  });
});

// rootedMeaning.js's own "match" idea only works if the sapling's own
// canopy color really is identical to exactly one flanking blossom's
// color, never both and never neither — otherwise "context decides the
// meaning" collapses into either "everything matches" or "nothing
// does." Checked directly against the theme's own rendered fills
// rather than trusting the source's own alternation logic by eye.
test("rootedMeaningTheme's sapling canopy color always matches exactly one flanking blossom, never zero or two", () => {
  const theme = LESSON_THEMES["satrw-wordsincontext"];
  [5, 10, 20, 28].forEach((count) => {
    const positions = computeTrail(count, theme.trailBand);
    const totalHeight = totalHeightFor(count);
    const svgString = theme.renderScene(positions, totalHeight, "The Grovekeeper");
    const root = document.createElement("div");
    root.innerHTML = svgString;
    const stops = positions.length - 1;
    assertTrue(stops > 0, `expected at least one non-boss stop at lesson count ${count}`);
    // Each stop renders 3 left-blossom circles (center + 2 petals, all
    // one color), then 3 right-blossom circles, then 3 canopy-leaf
    // circles, in that fixed order — see rootedMeaning.js's own
    // renderContextStop/renderBlossom/renderSapling. 9 circles per stop
    // total, grouped into 3 same-colored triplets.
    const fills = [...root.querySelectorAll("circle")].map((c) => c.getAttribute("fill"));
    // Ambient dappled-light ellipses aren't circles; the boss clearing
    // circle and each blossom's own cream center dot are neither
    // context color, so filtering to just the two known context colors
    // isolates exactly the blossom/canopy fills in render order.
    const contextFills = fills.filter((f) => f === "#c96a3e" || f === "#5c7fc9");
    assertEqual(contextFills.length, stops * 9, `expected 3 left-blossom + 3 right-blossom + 3 canopy-leaf circles per stop at lesson count ${count}`);
    for (let i = 0; i < stops; i++) {
      const triplet = contextFills.slice(i * 9, i * 9 + 9);
      const [leftTriplet, rightTriplet, canopyTriplet] = [triplet.slice(0, 3), triplet.slice(3, 6), triplet.slice(6, 9)];
      assertTrue(leftTriplet.every((c) => c === leftTriplet[0]), `expected the left blossom's own 3 circles to share one color at stop ${i}, lesson count ${count}`);
      assertTrue(rightTriplet.every((c) => c === rightTriplet[0]), `expected the right blossom's own 3 circles to share one color at stop ${i}, lesson count ${count}`);
      assertTrue(canopyTriplet.every((c) => c === canopyTriplet[0]), `expected the canopy's own 3 leaves to share one color at stop ${i}, lesson count ${count}`);
      const leftBlossom = leftTriplet[0];
      const rightBlossom = rightTriplet[0];
      const canopyColor = canopyTriplet[0];
      const matchesLeft = canopyColor === leftBlossom;
      const matchesRight = canopyColor === rightBlossom;
      assertTrue(matchesLeft !== matchesRight, `expected the canopy to match exactly one flanking blossom at stop ${i}, lesson count ${count} (left=${leftBlossom}, right=${rightBlossom}, canopy=${canopyColor})`);
    }
  });
});
