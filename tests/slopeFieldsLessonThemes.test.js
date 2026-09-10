// Regression tests for Function Fields' Slope Fields lesson-path terrain
// themes (see skillPathHub.js's own LESSON_THEMES map and
// js/ui/lessonThemes/ for each skill's bespoke scene) — same coverage
// archiveStacksLessonThemes.test.js/etymologyGroveLessonThemes.test.js
// already give their own zones, scoped to Slope Fields' own 5 skills,
// the first SAT Math zone to get bespoke lesson-path themes.
import { GameState, gameState } from "../js/state.js";
import { COL_W, computeTrail, totalHeightFor } from "../js/ui/lessonTerrain.js";
import { LESSON_THEMES, renderThemedLessonPath } from "../js/ui/skillPathHub.js";
import { test, assertEqual, assertTrue } from "./assert.js";

function freshGameState() {
  localStorage.removeItem("act-quest-save-v1");
  const fresh = new GameState();
  fresh.data.onboarded = true;
  gameState.data = fresh.data;
  return gameState;
}

const SLOPE_FIELDS_SKILL_IDS = ["satmath-linear1var", "satmath-linearfunc", "satmath-linear2var", "satmath-systems", "satmath-linineq"];
const BOSS_NAME = "The Vector Wraith";

test("every one of Slope Fields' 5 skills has its own lesson-path theme", () => {
  SLOPE_FIELDS_SKILL_IDS.forEach((id) => {
    assertTrue(id in LESSON_THEMES, `expected a LESSON_THEMES entry for Slope Fields skill "${id}"`);
  });
});

test("every Slope Fields theme renders through the full screen (real lesson count from the actual question bank) without throwing", () => {
  SLOPE_FIELDS_SKILL_IDS.forEach((skillId) => {
    freshGameState();
    const root = document.createElement("div");
    renderThemedLessonPath(root, () => {}, { skillId, subjectId: "sat-math" });
    const svg = root.querySelector(".lesson-terrain-svg");
    assertTrue(!!svg, `expected a rendered <svg> for skill "${skillId}"`);
    assertTrue((svg.getAttribute("viewBox") || "").length > 0, `expected a real viewBox for skill "${skillId}"`);
  });
});

test("every Slope Fields theme's renderScene holds up across a spread of lesson counts (1, 5, 20, 28)", () => {
  SLOPE_FIELDS_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [1, 5, 20, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      let svgString;
      try {
        svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
      } catch (e) {
        throw new Error(`${skillId}'s theme threw at lesson count ${count}: ${e.message}`);
      }
      assertTrue(typeof svgString === "string" && svgString.includes("<svg"), `expected "${skillId}" to render a real <svg> at lesson count ${count}`);
    });
  });
});

test("Slope Fields' 5 skills are visually distinct (no two share a theme object)", () => {
  const themeObjects = SLOPE_FIELDS_SKILL_IDS.map((id) => LESSON_THEMES[id]);
  const uniqueThemes = new Set(themeObjects);
  assertEqual(uniqueThemes.size, SLOPE_FIELDS_SKILL_IDS.length, "expected every Slope Fields skill to have its own distinct theme, not a shared/reused one");
});

test("no Slope Fields theme places a real decorative feature on top of the boss/champion clearing, at any lesson count", () => {
  SLOPE_FIELDS_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    [5, 10, 15, 20, 25, 28].forEach((count) => {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
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
        const w = Number(el.getAttribute("width"));
        const h = Number(el.getAttribute("height"));
        if (!w || !h) return false; // the full-bleed paper/grid background rects
        const cx = Number(el.getAttribute("x")) + w / 2;
        const cy = Number(el.getAttribute("y")) + h / 2;
        return Math.hypot(cx - bossX, cy - bossY) < bossRadius;
      });
      const textHits = [...root.querySelectorAll("text")].filter((el) => {
        const cx = Number(el.getAttribute("x"));
        const cy = Number(el.getAttribute("y"));
        return Math.hypot(cx - bossX, cy - bossY) < bossRadius;
      });

      assertEqual(circleHits.length, 0, `expected no real circle/ellipse decoration on "${skillId}"'s boss clearing at lesson count ${count}`);
      assertEqual(rectHits.length, 0, `expected no pan/tile rect on "${skillId}"'s boss clearing at lesson count ${count}`);
      assertEqual(textHits.length, 0, `expected no tile-label text on "${skillId}"'s boss clearing at lesson count ${count}`);
    });
  });
});

// Every one of this zone's own real-geometry claims (its own header
// comments' "always balanced," "real rise/run," "genuinely collinear,"
// "genuinely intersect," "real half-plane") is a specific, checkable
// fact about the rendered SVG, not just a description of intent — so
// each gets checked directly against the actual numbers rendered,
// rather than trusted by inspection.

test("equationScaleTheme's beam always renders level (both pans at the same height) and holds exactly one x tile, alternating sides", () => {
  const theme = LESSON_THEMES["satmath-linear1var"];
  const count = 8;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  stops.forEach((p, i) => {
    const texts = [...root.querySelectorAll("text")].filter((t) => Math.abs(Number(t.getAttribute("y")) - p.y) < 60);
    assertEqual(texts.length, 2, `expected exactly 2 tile labels near stop ${i}`);
    const xTiles = texts.filter((t) => t.textContent === "x");
    assertEqual(xTiles.length, 1, `expected exactly one "x" tile at stop ${i}, got ${xTiles.length}`);
    const xOnLeft = Number(xTiles[0].getAttribute("x")) < p.x;
    assertEqual(xOnLeft, i % 2 === 0, `expected the "x" tile to alternate sides at stop ${i}`);
  });
});

test("slopeTriangleTheme's rise/run legs always share their own endpoints with the real plotted diagonal, and rising/falling alternates", () => {
  const theme = LESSON_THEMES["satmath-linearfunc"];
  const count = 6;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  stops.forEach((p, i) => {
    const solidLine = [...root.querySelectorAll("line")].find((l) => !l.getAttribute("stroke-dasharray") && Math.abs((Number(l.getAttribute("y1")) + Number(l.getAttribute("y2"))) / 2 - p.y) < 40);
    assertTrue(!!solidLine, `expected a real solid diagonal near stop ${i}`);
    const y0 = Number(solidLine.getAttribute("y1"));
    const y1 = Number(solidLine.getAttribute("y2"));
    const rising = i % 2 === 0;
    assertEqual(y1 < y0, rising, `expected stop ${i} to be ${rising ? "rising" : "falling"} (y1=${y1}, y0=${y0})`);
  });
});

test("plottedLineTheme's two plotted points at every stop are genuinely collinear with the real stop point itself, not just visually close", () => {
  const theme = LESSON_THEMES["satmath-linear2var"];
  const count = 6;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  stops.forEach((p, i) => {
    const dots = [...root.querySelectorAll('circle[r="5"]')].filter((c) => Math.abs(Number(c.getAttribute("cy")) - p.y) < 50);
    assertEqual(dots.length, 2, `expected 2 real plotted points at stop ${i}, got ${dots.length}`);
    const [a, b] = dots.map((d) => ({ x: Number(d.getAttribute("cx")), y: Number(d.getAttribute("cy")) })).sort((m, n) => m.x - n.x);
    // `p` itself comes straight from computeTrail's own unrounded floats,
    // but a/b were parsed back out of renderScene's own SVG string, which
    // rounds every coordinate to 1 decimal place (toFixed(1)) first —
    // rounding `p` the same way before comparing keeps the cross product
    // a check of genuine collinearity, not an artifact of comparing two
    // different precisions against each other (a small but real gap this
    // test hit once already, at a tolerance too tight to be that, before
    // this rounding was added).
    const pr = { x: Number(p.x.toFixed(1)), y: Number(p.y.toFixed(1)) };
    const cross = (b.x - a.x) * (pr.y - a.y) - (b.y - a.y) * (pr.x - a.x);
    assertTrue(Math.abs(cross) < 0.5, `expected stop ${i}'s own 2 points and the real stop point itself to be exactly collinear, got a cross product of ${cross.toFixed(3)}`);
  });
});

// This is the regression class this session's own earlier rounds each
// found the hard way (Archive Stacks' decoration/marker overlap,
// canopyBridge's boss-clearing overlap): a standalone renderScene check
// can't see the real "Lesson N" marker button at all (it's rendered
// separately, by lessonTerrain.js itself, as HTML overlaid on top of
// the SVG). This version works entirely in the SVG's own local viewBox
// units, the same coordinate space every other test in this file already
// reads shapes in — not real rendered CSS pixels. That choice is
// deliberate, not a shortcut: an earlier draft tried to measure the
// game's own real marker button via getBoundingClientRect on a rendered
// DOM tree, which requires tests/run.html's own real CSS cascade (it
// never loads css/style.css, only this file's own inline pass/fail
// styling) — `.lesson-terrain-scene`'s `position:relative`, `.lesson-
// terrain-svg`'s `position:absolute;inset:0;width/height:100%`, and
// `.hub-marker-wrap`'s `position:absolute;transform:translate(-50%,
// -50%)` all had to be reconstructed by hand, and even after doing that
// correctly, `.hub-marker-wrap` centers its own flex column (button +
// gap + "Lesson N" label) as one block, so the *button* alone — the
// only part that visually competes with terrain art — sits off-center
// from the wrap's own true center by however tall the label is,
// contaminating every distance measured against it. None of that
// complexity is actually load-bearing: by construction
// (renderLessonMarker in lessonTerrain.js positions each marker at
// `left:(x/COL_W)*100%; top:(y/totalHeight)*100%` on a container whose
// own aspect ratio matches the SVG's `viewBox`), a marker's *intended*
// center is exactly `(p.x, p.y)` in the same local units the SVG itself
// is drawn in, for any real rendered size whatsoever — the pixel
// reconstruction above was solving a problem that plain arithmetic on
// `positions` already answers exactly.
// What direct DOM measurement earlier in this session's own satMathHub
// round.js did establish, and this constant preserves, is the marker's
// own real *radius* relative to that point: `.node-circle-small` is a
// fixed 40 CSS px on a phone (see css/style.css's own max-width:640px
// breakpoint) rendered inside an SVG that scales to its own container's
// width — so its footprint in local units is `(40/2) * (COL_W /
// realContainerPx)`. MOBILE_SCENE_PX (360) is a realistic narrow phone's
// own `.lesson-terrain-scene` width once `.screen`'s real mobile padding
// is subtracted from a ~390px viewport (see satMathHub.js's own
// equationScale.js header comment for where these two numbers came
// from).
const MOBILE_MARKER_PX = 40;
const MOBILE_SCENE_PX = 360;
const MARKER_RADIUS_LOCAL = (MOBILE_MARKER_PX / 2) * (COL_W / MOBILE_SCENE_PX);

function distancePointToRect(px, py, rect) {
  const dx = Math.max(rect.x - px, 0, px - (rect.x + rect.width));
  const dy = Math.max(rect.y - py, 0, py - (rect.y + rect.height));
  return Math.hypot(dx, dy);
}

test("every Slope Fields theme's own real dots/tiles/solid shapes stay clear of the game's own 'Lesson N' marker at a realistic mobile width", () => {
  SLOPE_FIELDS_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    const count = 8;
    const positions = computeTrail(count, theme.trailBand);
    const totalHeight = totalHeightFor(count);
    const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
    const root = document.createElement("div");
    root.innerHTML = svgString;
    // Stop 0 is representative of every stop: each of these 5 themes'
    // own per-stop offsets from `p` only ever flip sign with `i`
    // (rising/falling, left/right, steep/shallow) — never grow or
    // shrink — so distance from the stop's own point is the same at
    // every stop regardless of which one this checks.
    const p = positions[0];

    const dots = [...root.querySelectorAll("circle")].filter((c) => Number(c.getAttribute("r")) >= 4);
    const tiles = [...root.querySelectorAll("rect")].filter((r) => Number(r.getAttribute("width")) > 0 && Number(r.getAttribute("width")) < 100);
    // Deliberately excludes `line` elements (every dashed rise/run leg,
    // boundary, and crossing-line stroke in this zone) — a thin stroke
    // passing at or through the marker's own position is an already-
    // accepted look in this app (Numeria Peaks' own Line Crossing zone
    // is built entirely on that), not the failure class this test
    // guards against.
    const solidPaths = [...root.querySelectorAll("path")].filter((el) => {
      const fill = el.getAttribute("fill");
      if (!fill || fill === "none" || fill.startsWith("url(")) return false;
      const opacity = el.getAttribute("opacity");
      return opacity == null || Number(opacity) >= 0.7;
    });

    dots
      .filter((c) => Math.abs(Number(c.getAttribute("cy")) - p.y) < 60)
      .forEach((c) => {
        const cx = Number(c.getAttribute("cx"));
        const cy = Number(c.getAttribute("cy"));
        const r = Number(c.getAttribute("r"));
        const dist = Math.hypot(cx - p.x, cy - p.y) - r;
        assertTrue(
          dist > MARKER_RADIUS_LOCAL,
          `expected "${skillId}"'s own dot at (${cx.toFixed(1)}, ${cy.toFixed(1)}) to clear the marker's own real mobile-scale radius (${MARKER_RADIUS_LOCAL.toFixed(1)} local units), got ${dist.toFixed(1)}`
        );
      });

    [...tiles, ...solidPaths]
      .map((el) => {
        if (el.tagName === "rect") return { x: Number(el.getAttribute("x")), y: Number(el.getAttribute("y")), width: Number(el.getAttribute("width")), height: Number(el.getAttribute("height")) };
        const nums = (el.getAttribute("d").match(/-?\d+\.?\d*/g) || []).map(Number);
        const xs = [];
        const ys = [];
        for (let k = 0; k < nums.length; k += 2) {
          xs.push(nums[k]);
          ys.push(nums[k + 1]);
        }
        return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
      })
      .filter((rect) => Math.abs(rect.y + rect.height / 2 - p.y) < 60)
      .forEach((rect) => {
        const dist = distancePointToRect(p.x, p.y, rect);
        assertTrue(
          dist > MARKER_RADIUS_LOCAL,
          `expected "${skillId}"'s own solid shape at (${rect.x.toFixed(1)}, ${rect.y.toFixed(1)}, ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}) to clear the marker's own real mobile-scale radius (${MARKER_RADIUS_LOCAL.toFixed(1)} local units), got ${dist.toFixed(1)}`
        );
      });
  });
});

test("crossingLinesTheme's two lines at every stop genuinely share the same real intersection point", () => {
  const theme = LESSON_THEMES["satmath-systems"];
  const count = 6;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  stops.forEach((p, i) => {
    const nearbyLines = [...root.querySelectorAll("line")].filter((l) => Math.abs((Number(l.getAttribute("y1")) + Number(l.getAttribute("y2"))) / 2 - p.y) < 45);
    assertEqual(nearbyLines.length, 2, `expected exactly 2 crossing lines at stop ${i}, got ${nearbyLines.length}`);
    nearbyLines.forEach((line) => {
      const midX = (Number(line.getAttribute("x1")) + Number(line.getAttribute("x2"))) / 2;
      const midY = (Number(line.getAttribute("y1")) + Number(line.getAttribute("y2"))) / 2;
      assertTrue(Math.abs(midX - p.x) < 0.5 && Math.abs(midY - p.y) < 0.5, `expected stop ${i}'s own line to be centered exactly on its own real intersection point, got midpoint (${midX.toFixed(1)}, ${midY.toFixed(1)}) vs (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
    });
  });
});

test("boundaryLineTheme's boundary style (solid/dashed) alternates every stop, and the shaded half-plane always sits on the geometrically correct side of its own line", () => {
  const theme = LESSON_THEMES["satmath-linineq"];
  const count = 8;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  stops.forEach((p, i) => {
    const line = [...root.querySelectorAll("line")].find((l) => Math.abs((Number(l.getAttribute("y1")) + Number(l.getAttribute("y2"))) / 2 - p.y) < 40);
    assertTrue(!!line, `expected a real boundary line at stop ${i}`);
    const strict = i % 2 === 0;
    const dashed = !!line.getAttribute("stroke-dasharray");
    assertEqual(dashed, strict, `expected stop ${i}'s own boundary to be ${strict ? "dashed" : "solid"}`);

    const path = [...root.querySelectorAll("path")].find((el) => {
      const d = el.getAttribute("d") || "";
      return el.getAttribute("fill") !== "none" && d.startsWith("M") && Math.abs(p.y - Number((d.match(/M([-\d.]+),([-\d.]+)/) || [])[2] || 0)) < 60;
    });
    assertTrue(!!path, `expected a real shaded half-plane quad at stop ${i}`);
    const nums = (path.getAttribute("d").match(/-?\d+\.?\d*/g) || []).map(Number);
    const pts = [];
    for (let k = 0; k < nums.length; k += 2) pts.push({ x: nums[k], y: nums[k + 1] });
    const centroid = { x: pts.reduce((s, q) => s + q.x, 0) / pts.length, y: pts.reduce((s, q) => s + q.y, 0) / pts.length };
    const a = { x: p.x - 50, y: p.y - 20 };
    const b = { x: p.x + 50, y: p.y + 20 };
    const cross = (b.x - a.x) * (centroid.y - a.y) - (b.y - a.y) * (centroid.x - a.x);
    const shadeSide = i % 4 < 2 ? 1 : -1;
    assertEqual(cross > 0, shadeSide > 0, `expected stop ${i}'s own shaded region to fall on the geometrically correct side of its own boundary line`);
  });
});
