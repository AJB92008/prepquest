// Regression tests for Function Fields' Slope Fields lesson-path terrain
// themes (see skillPathHub.js's own LESSON_THEMES map and
// js/ui/lessonThemes/ for each skill's bespoke scene) — same coverage
// archiveStacksLessonThemes.test.js/etymologyGroveLessonThemes.test.js
// already give their own zones, scoped to Slope Fields' own 5 skills,
// the first SAT Math zone to get bespoke lesson-path themes.
import { GameState, gameState } from "../js/state.js";
import { COL_W, computeTrail, totalHeightFor } from "../js/ui/lessonTerrain.js";
import { LESSON_THEMES, renderThemedLessonPath } from "../js/ui/skillPathHub.js";
import { getLessonCount } from "../js/data/questions/index.js";
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

test("plottedLineTheme's two axes share a real origin corner and are genuinely perpendicular, and both dashed guides really reach the real stop point", () => {
  const theme = LESSON_THEMES["satmath-linear2var"];
  const count = 6;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  stops.forEach((p, i) => {
    const originY = p.y + 46;

    // Both dashed guides run from an axis tick straight to the real
    // stop point — found by an exact shared endpoint, not an assumed
    // position.
    const dashed = [...root.querySelectorAll("line")].filter((l) => {
      if (!l.getAttribute("stroke-dasharray")) return false;
      const nearRow = Math.abs(Number(l.getAttribute("y1")) - originY) < 70 || Math.abs(Number(l.getAttribute("y2")) - originY) < 70;
      const touchesStop =
        (Math.abs(Number(l.getAttribute("x1")) - p.x) < 0.5 && Math.abs(Number(l.getAttribute("y1")) - p.y) < 0.5) ||
        (Math.abs(Number(l.getAttribute("x2")) - p.x) < 0.5 && Math.abs(Number(l.getAttribute("y2")) - p.y) < 0.5);
      return nearRow && touchesStop;
    });
    assertEqual(dashed.length, 2, `expected exactly 2 dashed guides reaching stop ${i}'s own real point, got ${dashed.length}`);

    // Both solid axis lines start from the same real origin corner
    // (wherever `y1` or `y2` equals `originY`) — found by that shared
    // point, not by assuming which side of the stop the corner sits on
    // (it alternates left/right stop to stop).
    const solid = [...root.querySelectorAll("line")].filter((l) => {
      if (l.getAttribute("stroke-dasharray")) return false;
      return Math.abs(Number(l.getAttribute("y1")) - originY) < 0.5 || Math.abs(Number(l.getAttribute("y2")) - originY) < 0.5;
    });
    assertEqual(solid.length, 2, `expected exactly 2 real axis lines meeting at stop ${i}'s own origin corner, got ${solid.length}`);
    const origins = solid.map((l) => {
      const y1 = Number(l.getAttribute("y1"));
      return Math.abs(y1 - originY) < 0.5 ? { x: Number(l.getAttribute("x1")), y: y1 } : { x: Number(l.getAttribute("x2")), y: Number(l.getAttribute("y2")) };
    });
    assertTrue(Math.abs(origins[0].x - origins[1].x) < 0.5 && Math.abs(origins[0].y - origins[1].y) < 0.5, `expected stop ${i}'s own x-axis and y-axis to share the exact same real origin corner`);
    const vecs = solid.map((l) => ({ dx: Number(l.getAttribute("x2")) - Number(l.getAttribute("x1")), dy: Number(l.getAttribute("y2")) - Number(l.getAttribute("y1")) }));
    const dot = vecs[0].dx * vecs[1].dx + vecs[0].dy * vecs[1].dy;
    assertTrue(Math.abs(dot) < 1, `expected stop ${i}'s own x-axis and y-axis to be genuinely perpendicular, got a dot product of ${dot.toFixed(3)}`);
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
    // Deliberately excludes `rect[transform]` (crossingLinesTheme's own
    // rotated rods): this filter reads raw `x`/`y`/`width`/`height`,
    // which describe a rect's *pre-rotation* box, so measuring a rotated
    // rect here would check the wrong position entirely. Rods get their
    // own dedicated real-clearance check below instead.
    const tiles = [...root.querySelectorAll("rect")].filter((r) => !r.hasAttribute("transform") && Number(r.getAttribute("width")) > 0 && Number(r.getAttribute("width")) < 100);
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

function parseRotate(transform) {
  const m = transform.match(/rotate\(([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\)/);
  return { angle: Number(m[1]), cx: Number(m[2]), cy: Number(m[3]) };
}

test("crossingLinesTheme's two rods genuinely pivot on the same real intersection point and cross at two different angles", () => {
  const theme = LESSON_THEMES["satmath-systems"];
  const count = 6;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  stops.forEach((p, i) => {
    const rods = [...root.querySelectorAll("rect[transform]")].filter((r) => Math.abs(parseRotate(r.getAttribute("transform")).cy - p.y) < 60);
    assertEqual(rods.length, 2, `expected exactly 2 crossed rods at stop ${i}, got ${rods.length}`);
    rods.forEach((rod) => {
      const { cx, cy } = parseRotate(rod.getAttribute("transform"));
      // The rotate transform's own pivot must match the rect's own real
      // pre-rotation center (not some other point) for the rod to
      // actually pivot on itself rather than swing around a corner.
      const rectCx = Number(rod.getAttribute("x")) + Number(rod.getAttribute("width")) / 2;
      const rectCy = Number(rod.getAttribute("y")) + Number(rod.getAttribute("height")) / 2;
      assertTrue(Math.abs(rectCx - cx) < 0.5 && Math.abs(rectCy - cy) < 0.5, `expected stop ${i}'s own rod to rotate around its own real center`);
      assertTrue(Math.abs(cx - p.x) < 0.5 && Math.abs(cy - p.y) < 0.5, `expected stop ${i}'s own rod to pivot exactly on the real stop point (${p.x.toFixed(1)}, ${p.y.toFixed(1)}), got (${cx.toFixed(1)}, ${cy.toFixed(1)})`);
    });
    const angles = rods.map((r) => parseRotate(r.getAttribute("transform")).angle);
    assertTrue(Math.abs(angles[0] + angles[1]) < 0.5, `expected the two rods' own angles to mirror each other around horizontal, got ${angles[0]} and ${angles[1]}`);
    assertTrue(Math.abs(angles[0] - angles[1]) > 5, `expected the two rods to cross at genuinely different angles, got ${angles[0]} and ${angles[1]}`);
  });
});

// A thin line's identity (its own length and direction) survives the
// real marker button sitting on top of it — the "Line Crossing"
// precedent every other clearance check in this file leans on — but a
// rod's identity as half of a crossing does not: if the marker's own
// radius eats most of the rod's own half-length, what's left reads as a
// stubby tab, not a rod reaching through an intersection. This checks
// the actual surviving length directly against MARKER_RADIUS_LOCAL,
// the same real mobile-scale radius the clearance test above uses,
// rather than trusting ROD_LENGTH's own source-file comment to stay
// honest as the shape evolves.
test("crossingLinesTheme's rods keep real visible length on both sides of the marker, and stay clear of the neighboring row at the wide angle", () => {
  const theme = LESSON_THEMES["satmath-systems"];
  const count = 6;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const p = positions[0];
  const rods = [...root.querySelectorAll("rect[transform]")].filter((r) => Math.abs(parseRotate(r.getAttribute("transform")).cy - p.y) < 60);
  assertEqual(rods.length, 2, `expected exactly 2 crossed rods at stop 0, got ${rods.length}`);

  // ROW_H in lessonTerrain.js (not exported; 140 here is that same
  // reviewed constant) is how far apart two stops' own rows sit —
  // a rod's vertical reach at its own rotation angle has to stay under
  // half of that or it crowds the next stop's own art.
  const ROW_H = 140;

  rods.forEach((rod) => {
    const width = Number(rod.getAttribute("width"));
    const half = width / 2;
    const survives = half - MARKER_RADIUS_LOCAL;
    assertTrue(
      survives > 20,
      `expected each rod's own half-length (${half.toFixed(1)}) to clear the marker's real mobile-scale radius (${MARKER_RADIUS_LOCAL.toFixed(1)}) by a real visible margin, got only ${survives.toFixed(1)} local units surviving`
    );
    const angle = Math.abs(parseRotate(rod.getAttribute("transform")).angle);
    const verticalReach = half * Math.sin((angle * Math.PI) / 180);
    assertTrue(
      verticalReach < ROW_H / 2,
      `expected a rod at angle ${angle}° to stay within half a row (${(ROW_H / 2).toFixed(1)}) of the stop it belongs to, got a vertical reach of ${verticalReach.toFixed(1)}`
    );
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
    const a = { x: p.x - 58, y: p.y - 22 };
    const b = { x: p.x + 58, y: p.y + 22 };
    const cross = (b.x - a.x) * (centroid.y - a.y) - (b.y - a.y) * (centroid.x - a.x);
    const shadeSide = i % 4 < 2 ? 1 : -1;
    assertEqual(cross > 0, shadeSide > 0, `expected stop ${i}'s own shaded region to fall on the geometrically correct side of its own boundary line`);
  });
});

// The existing "no theme places a decorative feature on the boss
// clearing" test above only ever checks a shape's own *center* against
// the boss circle (via cx/cy for circles, x+width/2 for rects), and
// only for a handful of counts (5, 10, 15, 20, 25, 28). Neither is
// enough here: a crossingLinesTheme rod's own pre-rotation rect is
// always centered exactly on its own stop point (a full row, 140 local
// units, from the boss) no matter how the rod is rotated, so a
// center-only check can never see a rotated corner swinging in close to
// the boss — and a boundaryLineTheme wedge is a filled `path`, which
// that test never even queries for. Both shapes' own real risk is
// their own farthest *vertex*, and only for the one lesson stop
// immediately before the boss (every earlier stop sits at least two
// rows away and is always safe) — so this checks vertices directly,
// across every lesson count these two skills' own real question banks
// can actually produce (getLessonCount, not an arbitrary sample), the
// same standard this file's own "real lesson count" tests already hold
// themselves to.
test("crossingLinesTheme's rods and boundaryLineTheme's shaded wedge never reach into the boss clearing, at every real lesson count", () => {
  const BOSS_R = 86;

  const crossingCount = getLessonCount("satmath-systems");
  for (let count = 2; count <= crossingCount; count++) {
    const positions = computeTrail(count, LESSON_THEMES["satmath-systems"].trailBand);
    const totalHeight = totalHeightFor(count);
    const svgString = LESSON_THEMES["satmath-systems"].renderScene(positions, totalHeight, BOSS_NAME);
    const root = document.createElement("div");
    root.innerHTML = svgString;
    const boss = positions[positions.length - 1];
    const rods = [...root.querySelectorAll("rect[transform]")].filter((r) => Math.abs(parseRotate(r.getAttribute("transform")).cy - positions[positions.length - 2].y) < 60);
    assertEqual(rods.length, 2, `expected exactly 2 rods on the stop right before the boss at lesson count ${count}, got ${rods.length}`);
    rods.forEach((rod) => {
      const { angle, cx, cy } = parseRotate(rod.getAttribute("transform"));
      const w = Number(rod.getAttribute("width"));
      const h = Number(rod.getAttribute("height"));
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      [
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [w / 2, h / 2],
        [-w / 2, h / 2],
      ].forEach(([lx, ly]) => {
        const vx = cx + lx * cos - ly * sin;
        const vy = cy + lx * sin + ly * cos;
        const dist = Math.hypot(vx - boss.x, vy - boss.y);
        assertTrue(dist > BOSS_R, `expected the pre-boss rod's own corner at (${vx.toFixed(1)}, ${vy.toFixed(1)}) to clear the boss clearing (radius ${BOSS_R}) at lesson count ${count}, got ${dist.toFixed(1)}`);
      });
    });
  }

  const boundaryCount = getLessonCount("satmath-linineq");
  for (let count = 2; count <= boundaryCount; count++) {
    const positions = computeTrail(count, LESSON_THEMES["satmath-linineq"].trailBand);
    const totalHeight = totalHeightFor(count);
    const svgString = LESSON_THEMES["satmath-linineq"].renderScene(positions, totalHeight, BOSS_NAME);
    const root = document.createElement("div");
    root.innerHTML = svgString;
    const boss = positions[positions.length - 1];
    const preBoss = positions[positions.length - 2];
    const wedge = [...root.querySelectorAll("path")].find((el) => {
      const d = el.getAttribute("d") || "";
      return el.getAttribute("fill") !== "none" && d.startsWith("M") && Math.abs(preBoss.y - Number((d.match(/M([-\d.]+),([-\d.]+)/) || [])[2] || 0)) < 40;
    });
    assertTrue(!!wedge, `expected a real shaded wedge on the stop right before the boss at lesson count ${count}`);
    const nums = (wedge.getAttribute("d").match(/-?\d+\.?\d*/g) || []).map(Number);
    for (let k = 0; k < nums.length; k += 2) {
      const dist = Math.hypot(nums[k] - boss.x, nums[k + 1] - boss.y);
      assertTrue(dist > BOSS_R, `expected the pre-boss wedge's own corner at (${nums[k].toFixed(1)}, ${nums[k + 1].toFixed(1)}) to clear the boss clearing (radius ${BOSS_R}) at lesson count ${count}, got ${dist.toFixed(1)}`);
    }
  }
});

// A shadow ellipse's closest point to an off-center boss isn't always
// straight down from its own center — a wide, flat ellipse's own true
// nearest point can sit at an angle once the boss isn't directly below
// it. Rather than trust a `(cx, cy+ry)` shortcut to always be the worst
// case, this samples the real ellipse contour directly.
function ellipseMinDistToPoint(cx, cy, rx, ry, px, py, samples = 360) {
  let min = Infinity;
  for (let k = 0; k < samples; k++) {
    const t = (k / samples) * 2 * Math.PI;
    const dist = Math.hypot(cx + rx * Math.cos(t) - px, cy + ry * Math.sin(t) - py);
    if (dist < min) min = dist;
  }
  return min;
}

// All 5 Slope Fields themes now cast a small flat "contact shadow"
// (an <ellipse>, the same convention windwardBough.js already uses for
// its own leaning trees) at each shape's own real anchor point, so
// every object reads as resting on the paper rather than floating over
// it. Every one of those shadows was placed by hand-checking its own
// distance to a boss clearing (see each file's own header comment), but
// a hand-check is exactly the kind of claim this file's own convention
// is to verify directly rather than trust — so this sweeps every real
// lesson count for all 5 skills and checks each shadow's own real
// closest point (via ellipseMinDistToPoint, not an assumed direction)
// never lands inside the boss clearing's real radius.
test("every Slope Fields theme's own grounding shadow exists and never reaches into the boss clearing, at every real lesson count", () => {
  const BOSS_R = 86;
  const EXPECTED_SHADOWS_PER_STOP = {
    "satmath-linear1var": 1,
    "satmath-linearfunc": 2,
    "satmath-linear2var": 1,
    "satmath-systems": 2,
    "satmath-linineq": 2,
  };

  SLOPE_FIELDS_SKILL_IDS.forEach((skillId) => {
    const theme = LESSON_THEMES[skillId];
    const maxCount = getLessonCount(skillId);
    for (let count = 2; count <= maxCount; count++) {
      const positions = computeTrail(count, theme.trailBand);
      const totalHeight = totalHeightFor(count);
      const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
      const root = document.createElement("div");
      root.innerHTML = svgString;
      const boss = positions[positions.length - 1];
      const preBoss = positions[positions.length - 2];

      // 60 has to sit between two real numbers, not just "smaller than
      // 90": it must exceed every theme's own real shadow offset from
      // `preBoss` (largest is equationScale's ~48; crossingLinesTheme's
      // own near-boss shadow is only ~32, since that one stop is always
      // forced to the narrow angle — see crossingLines.js's own header
      // comment), and it must stay under ROW_H (140) minus the largest
      // offset any OTHER row's own shadow can reach, so that row's own
      // shadow can never spill into this window. That other-row ceiling
      // is crossingLinesTheme's own wide-angle (62°) shadow, ~66 units
      // from its own stop — only 74 short of an adjacent row — which is
      // exactly what made a 90 window wrongly match 3 shadows near
      // `preBoss` (2 real ones plus one spilled from the row above) at
      // some real lesson counts before this was tightened to 60.
      const nearPreBoss = [...root.querySelectorAll("ellipse")].filter((e) => Math.abs(Number(e.getAttribute("cy")) - preBoss.y) < 60);
      assertEqual(
        nearPreBoss.length,
        EXPECTED_SHADOWS_PER_STOP[skillId],
        `expected "${skillId}"'s own grounding shadow(s) on the stop right before the boss at lesson count ${count}, got ${nearPreBoss.length}`
      );
      nearPreBoss.forEach((e) => {
        const cx = Number(e.getAttribute("cx"));
        const cy = Number(e.getAttribute("cy"));
        const rx = Number(e.getAttribute("rx"));
        const ry = Number(e.getAttribute("ry"));
        const dist = ellipseMinDistToPoint(cx, cy, rx, ry, boss.x, boss.y);
        assertTrue(
          dist > BOSS_R,
          `expected "${skillId}"'s own grounding shadow at (${cx.toFixed(1)}, ${cy.toFixed(1)}) to clear the boss clearing (radius ${BOSS_R}) at lesson count ${count}, got ${dist.toFixed(1)}`
        );
      });
    }
  });
});
