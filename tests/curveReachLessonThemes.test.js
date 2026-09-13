// Regression tests for Function Fields' Curve Reach lesson-path terrain
// themes (see skillPathHub.js's own LESSON_THEMES map and
// js/ui/lessonThemes/ for each skill's bespoke scene) — same coverage
// slopeFieldsLessonThemes.test.js already gives Slope Fields, scoped to
// Curve Reach's own 3 skills. Curve Shaper still uses this zone's own
// "Rolling Curve" family (rolling hills, a tiled wave pattern); Root
// Finder and Expression Rebuilder's own first themes in that family
// read poorly enough that both were replaced outright with their own
// unrelated, literal environments instead — underground tree roots and
// a factory assembly line, respectively — so this file's own tests
// span three genuinely different visual constructions, not variations
// on one shared family.
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

const CURVE_REACH_SKILL_IDS = ["satmath-nonlinearfunc", "satmath-nonlineareq", "satmath-equivexpr"];
const BOSS_NAME = "The Asymptote Warden";

test("every one of Curve Reach's 3 skills has its own lesson-path theme", () => {
  CURVE_REACH_SKILL_IDS.forEach((id) => {
    assertTrue(id in LESSON_THEMES, `expected a LESSON_THEMES entry for Curve Reach skill "${id}"`);
  });
});

test("every Curve Reach theme renders through the full screen (real lesson count from the actual question bank) without throwing", () => {
  CURVE_REACH_SKILL_IDS.forEach((skillId) => {
    freshGameState();
    const root = document.createElement("div");
    renderThemedLessonPath(root, () => {}, { skillId, subjectId: "sat-math" });
    const svg = root.querySelector(".lesson-terrain-svg");
    assertTrue(!!svg, `expected a rendered <svg> for skill "${skillId}"`);
    assertTrue((svg.getAttribute("viewBox") || "").length > 0, `expected a real viewBox for skill "${skillId}"`);
  });
});

test("every Curve Reach theme's renderScene holds up across a spread of lesson counts (1, 5, 20, 28)", () => {
  CURVE_REACH_SKILL_IDS.forEach((skillId) => {
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

test("Curve Reach's 3 skills are visually distinct (no two share a theme object)", () => {
  const themeObjects = CURVE_REACH_SKILL_IDS.map((id) => LESSON_THEMES[id]);
  const uniqueThemes = new Set(themeObjects);
  assertEqual(uniqueThemes.size, CURVE_REACH_SKILL_IDS.length, "expected every Curve Reach skill to have its own distinct theme, not a shared/reused one");
});

test("no Curve Reach theme places a real decorative feature on top of the boss/champion clearing, at any lesson count", () => {
  CURVE_REACH_SKILL_IDS.forEach((skillId) => {
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

      // Excludes this zone's own big background hill silhouettes
      // (rx >= 220, see curveArc.js's own HILLS array) — decorative
      // landscape, not a competing foreground shape, the same way the
      // Slope Fields test excludes the full-bleed paper/grid rects.
      const circleHits = [...root.querySelectorAll("circle,ellipse")].filter((el) => {
        if (el === boss) return false;
        const r = Number(el.getAttribute("r") || el.getAttribute("rx") || 0);
        if (r < 3 || r >= 100) return false;
        const cx = Number(el.getAttribute("cx"));
        const cy = Number(el.getAttribute("cy"));
        return Math.hypot(cx - bossX, cy - bossY) < bossRadius;
      });
      const rectHits = [...root.querySelectorAll("rect")].filter((el) => {
        const w = Number(el.getAttribute("width"));
        const h = Number(el.getAttribute("height"));
        if (!w || !h) return false; // the full-bleed paper/wave background rects
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
      assertEqual(rectHits.length, 0, `expected no tile rect on "${skillId}"'s boss clearing at lesson count ${count}`);
      assertEqual(textHits.length, 0, `expected no expression-tile label text on "${skillId}"'s boss clearing at lesson count ${count}`);
    });
  });
});

// Every one of this zone's own real-geometry claims (its own header
// comments' "genuinely intersects exactly there," "the curve's own
// real vertex," "one form rewritten into its own genuine equivalent")
// is a specific, checkable fact about the rendered SVG, not just a
// description of intent — checked directly against the actual numbers
// rendered, the same standard slopeFieldsLessonThemes.test.js already
// holds its own zone to.

test("curveArcTheme's vertex dot sits exactly on the arc's own real curve (not just visually near it), and hill/valley alternates", () => {
  const theme = LESSON_THEMES["satmath-nonlinearfunc"];
  const count = 6;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  // Excludes the trail path and the big background arc watermark —
  // both are also non-per-stop paths containing " Q" (the trail's own
  // single long "M x y Q x y x y Q..." string would otherwise match
  // first, its own concatenated numbers producing a nonsense "control
  // point"; the watermark's own control x, COL_W/2, can coincidentally
  // land within 1 unit of a real stop's `p.x`). Neither sets its own
  // `opacity` the way every per-stop arc leaves unset, so that's a
  // simpler, more direct exclusion than checking each one's own
  // distinguishing attribute separately.
  const paths = [...root.querySelectorAll("path")].filter((el) => (el.getAttribute("d") || "").startsWith("M") && (el.getAttribute("d") || "").includes(" Q") && !el.hasAttribute("opacity"));
  const dots = [...root.querySelectorAll("circle[r=\"4.5\"]")];
  stops.forEach((p, i) => {
    // Match on the control point's own x (the 3rd number: M x0,y0 Q
    // cx,cy x1,y1), which the curve's own construction pins exactly at
    // `p.x` — the arc's own M/L start point is offset by HALF_W and
    // can't be used to find "this stop's own arc" directly.
    const arc = paths.find((el) => {
      const nums = (el.getAttribute("d").match(/-?\d+\.?\d*/g) || []).map(Number);
      return Math.abs(p.x - nums[2]) < 1;
    });
    assertTrue(!!arc, `expected a real quadratic-curve arc near stop ${i}`);
    const nums = (arc.getAttribute("d").match(/-?\d+\.?\d*/g) || []).map(Number);
    const [x0, y0, cxCtrl, cyCtrl, x1, y1] = nums;
    // The quadratic bezier's own real midpoint (t=0.5): 0.25*P0 + 0.5*P1 + 0.25*P2.
    const trueMidY = 0.25 * y0 + 0.5 * cyCtrl + 0.25 * y1;
    const dot = dots.find((d) => Math.abs(Number(d.getAttribute("cx")) - p.x) < 1 && Math.abs(Number(d.getAttribute("cy")) - trueMidY) < 1);
    assertTrue(!!dot, `expected stop ${i}'s own vertex dot to sit exactly on the arc's own real midpoint (${p.x.toFixed(1)}, ${trueMidY.toFixed(1)}), computed from the curve's own control point, not assumed`);
    const hill = i % 2 === 0;
    assertEqual(trueMidY < y0, hill, `expected stop ${i} to be a ${hill ? "hill (vertex above its endpoints)" : "valley (vertex below its endpoints)"}, got vertex y=${trueMidY.toFixed(1)} vs endpoint y=${y0.toFixed(1)}`);
  });
});

test("rootSystemTheme's exposed root is centered on the same real x as its own tree, genuinely arcs above its own endpoints, and the canopy leans on the alternating side the trunk actually tilts toward", () => {
  const theme = LESSON_THEMES["satmath-nonlineareq"];
  const count = 6;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  // Excludes the trail path — its own single long "M x y Q x y x y
  // Q..." string also contains " Q" (see curveArcTheme's own test
  // above); this zone has no separate arc watermark, so `opacity` alone
  // (the trail sets one, no per-stop root curve does) is enough here.
  const roots = [...root.querySelectorAll("path")].filter((el) => (el.getAttribute("d") || "").includes(" Q") && !el.hasAttribute("opacity"));
  const canopyMains = [...root.querySelectorAll('ellipse[fill="#5c8f42"]')];
  stops.forEach((p, i) => {
    const rootEl = roots.find((el) => {
      const nums = (el.getAttribute("d").match(/-?\d+\.?\d*/g) || []).map(Number);
      return Math.abs((nums[0] + nums[4]) / 2 - p.x) < 1; // the curve's own two endpoints straddle p.x exactly
    });
    assertTrue(!!rootEl, `expected stop ${i}'s own exposed root to be centered on its own real p.x`);
    const nums = (rootEl.getAttribute("d").match(/-?\d+\.?\d*/g) || []).map(Number);
    const [x0, y0, cxCtrl, cyCtrl, x1] = nums;
    // Genuinely equidistant from p.x on both sides, not just "present".
    assertTrue(Math.abs(x0 - p.x) - Math.abs(x1 - p.x) < 0.5, `expected stop ${i}'s own root endpoints to sit symmetrically around p.x`);
    assertTrue(Math.abs(cxCtrl - p.x) < 0.5, `expected stop ${i}'s own root's control point to sit exactly on p.x`);
    // The curve's own real midpoint (from the quadratic bezier formula,
    // not assumed) must sit above (smaller y than) its own endpoints —
    // a genuine arc, not a straight or sagging line.
    const trueMidY = 0.25 * y0 + 0.5 * cyCtrl + 0.25 * y0;
    assertTrue(trueMidY < y0, `expected stop ${i}'s own root to genuinely arc above its own endpoints, got midpoint y=${trueMidY.toFixed(1)} vs endpoint y=${y0.toFixed(1)}`);

    const mirror = i % 2 === 0 ? 1 : -1;
    const canopy = canopyMains.find((c) => Math.abs(Number(c.getAttribute("cx")) - p.x) < 20);
    assertTrue(!!canopy, `expected stop ${i}'s own tree canopy near its own real p.x`);
    const leanSign = Math.sign(Number(canopy.getAttribute("cx")) - p.x);
    assertEqual(leanSign, mirror, `expected stop ${i}'s own canopy to lean toward the same side (${mirror > 0 ? "right" : "left"}) its own trunk actually tilts, not the opposite one`);
  });
});

// Every pair in EXPR_PAIRS is a real algebraic identity, not just
// matching-looking text — this expands each pair's own two forms at a
// handful of real x values and checks they evaluate to the same real
// number, the same standard "genuine equivalent" this file's own
// header comment claims.
// `y` defaults to a value distinct from `x` — collapsing it to `x`
// (an earlier draft here) would let "3x+3y"/"3(x+x)" (a wrong-in-y
// pair) pass as readily as the real "3(x+y)" this file actually ships,
// since both forms would only ever get checked as `6x = 6x`.
function evalExpr(form, x, y = x + 1) {
  switch (form) {
    case "(x+1)²":
      return (x + 1) ** 2;
    case "x²+2x+1":
      return x ** 2 + 2 * x + 1;
    case "2(x+3)":
      return 2 * (x + 3);
    case "2x+6":
      return 2 * x + 6;
    case "x²-9":
      return x ** 2 - 9;
    case "(x-3)(x+3)":
      return (x - 3) * (x + 3);
    case "3x+3y":
      return 3 * x + 3 * y;
    case "3(x+y)":
      return 3 * (x + y);
    default:
      throw new Error(`unrecognized expression form: "${form}"`);
  }
}

test("assemblyLineTheme's every expression pair is a genuine algebraic equivalent, not just matching-looking text", () => {
  const theme = LESSON_THEMES["satmath-equivexpr"];
  const count = 10;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const stops = positions.slice(0, -1);
  const texts = [...root.querySelectorAll("text")];
  stops.forEach((p, i) => {
    // y-window is 70, not e.g. 100: every tile's own text sits exactly
    // CLEARANCE (60) above its own stop, but an adjacent row's own
    // text is only 80 away (ROW_H 140 minus that same 60) — a window
    // of 100 wrongly pulled in a neighboring row's own pair too.
    const pair = texts.filter((t) => Math.abs(Number(t.getAttribute("x")) - p.x) < 120 && Math.abs(Number(t.getAttribute("y")) - p.y) < 70);
    assertEqual(pair.length, 2, `expected exactly 2 expression tiles near stop ${i}, got ${pair.length}`);
    const [a, b] = pair.map((t) => t.textContent);
    [1, 2, 5, -3].forEach((x) => {
      const va = evalExpr(a, x);
      const vb = evalExpr(b, x);
      assertTrue(Math.abs(va - vb) < 1e-9, `expected stop ${i}'s own pair "${a}" and "${b}" to evaluate equal at x=${x}, got ${va} vs ${vb}`);
    });
  });
});

// The real ≈38-unit mobile-scale marker radius every Function Fields
// file already carries (see equationScale.js's own header comment for
// the arithmetic) — reused here verbatim so this file's own dedicated
// checks below can't drift from that number.
const MOBILE_MARKER_PX = 40;
const MOBILE_SCENE_PX = 360;
const MARKER_RADIUS_LOCAL = (MOBILE_MARKER_PX / 2) * (COL_W / MOBILE_SCENE_PX);

function ellipseMinDistToPoint(cx, cy, rx, ry, px, py, samples = 360) {
  let min = Infinity;
  for (let k = 0; k < samples; k++) {
    const t = (k / samples) * 2 * Math.PI;
    const dist = Math.hypot(cx + rx * Math.cos(t) - px, cy + ry * Math.sin(t) - py);
    if (dist < min) min = dist;
  }
  return min;
}

// curveArcTheme's own vertex dot is the one shape whose real clearance
// actually depends on which stop it lands on (hill vs. valley change
// its own distance from `p`; every other shape in this zone sits at a
// fixed offset every stop) — see curveArc.js's own header comment for
// why a hand estimate of that margin was wrong the first time. Checks
// both parities directly rather than trusting stop 0 to represent the
// zone the way slopeFieldsLessonThemes.test.js's own equivalent check
// safely can.
test("curveArcTheme's vertex dot clears the game's own 'Lesson N' marker at a realistic mobile width, on both the hill and the valley stop", () => {
  const theme = LESSON_THEMES["satmath-nonlinearfunc"];
  const count = 8;
  const positions = computeTrail(count, theme.trailBand);
  const totalHeight = totalHeightFor(count);
  const svgString = theme.renderScene(positions, totalHeight, BOSS_NAME);
  const root = document.createElement("div");
  root.innerHTML = svgString;
  const dots = [...root.querySelectorAll('circle[r="4.5"]')];
  [positions[0], positions[1]].forEach((p, idx) => {
    const dot = dots.find((d) => Math.abs(Number(d.getAttribute("cx")) - p.x) < 1);
    assertTrue(!!dot, `expected a real vertex dot at stop ${idx}`);
    const dist = Math.hypot(Number(dot.getAttribute("cx")) - p.x, Number(dot.getAttribute("cy")) - p.y) - 4.5;
    // Requires a real 5-unit margin past MARKER_RADIUS_LOCAL, not just
    // clearing it — a bare ">" here would have let the valley stop's
    // original 2.7-unit margin (CLEARANCE=70, see curveArc.js's own
    // header comment for that mistake) pass as "safe."
    assertTrue(
      dist - MARKER_RADIUS_LOCAL > 5,
      `expected stop ${idx}'s own vertex dot to clear the marker's own real mobile-scale radius (${MARKER_RADIUS_LOCAL.toFixed(1)} local units) by a real margin, got only ${(dist - MARKER_RADIUS_LOCAL).toFixed(1)}`
    );
  });
});

function distancePointToRect(px, py, rect) {
  const dx = Math.max(rect.x - px, 0, px - (rect.x + rect.width));
  const dy = Math.max(rect.y - py, 0, py - (rect.y + rect.height));
  return Math.hypot(dx, dy);
}

test("rootSystemTheme's tree canopy, and assemblyLineTheme's expression plates/belt/gear, clear the game's own 'Lesson N' marker at a realistic mobile width", () => {
  const rootTheme = LESSON_THEMES["satmath-nonlineareq"];
  const exprTheme = LESSON_THEMES["satmath-equivexpr"];
  const count = 8;

  const rootPositions = computeTrail(count, rootTheme.trailBand);
  const rootSvg = rootTheme.renderScene(rootPositions, totalHeightFor(count), BOSS_NAME);
  const rootRoot = document.createElement("div");
  rootRoot.innerHTML = rootSvg;
  const p0 = rootPositions[0];
  // The canopy's own dark back-blob (CANOPY_DARK, the largest of the
  // three overlapping canopy ellipses) is the closest real solid shape
  // to `p` in this tree, so it's the one whose clearance actually
  // matters — checked via the real sampled ellipse contour, not a
  // straight vertical assumption, since the canopy sits offset in both
  // x and y from p.
  const canopy = [...rootRoot.querySelectorAll('ellipse[fill="#3c5f2a"]')].find((e) => Math.abs(Number(e.getAttribute("cx")) - p0.x) < 30);
  assertTrue(!!canopy, "expected a real tree canopy near stop 0");
  const canopyDist = ellipseMinDistToPoint(
    Number(canopy.getAttribute("cx")),
    Number(canopy.getAttribute("cy")),
    Number(canopy.getAttribute("rx")),
    Number(canopy.getAttribute("ry")),
    p0.x,
    p0.y
  );
  assertTrue(canopyDist > MARKER_RADIUS_LOCAL, `expected the canopy to clear the marker's own real mobile-scale radius (${MARKER_RADIUS_LOCAL.toFixed(1)}), got ${canopyDist.toFixed(1)}`);

  const exprPositions = computeTrail(count, exprTheme.trailBand);
  const exprSvg = exprTheme.renderScene(exprPositions, totalHeightFor(count), BOSS_NAME);
  const exprRoot = document.createElement("div");
  exprRoot.innerHTML = exprSvg;
  const ep0 = exprPositions[0];

  // 70, not 90 — see assemblyLineTheme's own test above for why a wider
  // window wrongly pulls in a neighboring row's own pair too.
  const tiles = [...exprRoot.querySelectorAll('rect[width="84"]')].filter((r) => Math.abs(Number(r.getAttribute("y")) + 15 - ep0.y) < 70);
  assertEqual(tiles.length, 2, "expected exactly 2 expression plates at stop 0");
  tiles.forEach((r) => {
    const rect = { x: Number(r.getAttribute("x")), y: Number(r.getAttribute("y")), width: 84, height: 30 };
    const dist = distancePointToRect(ep0.x, ep0.y, rect);
    assertTrue(dist > MARKER_RADIUS_LOCAL, `expected an expression tile to clear the marker's own real mobile-scale radius (${MARKER_RADIUS_LOCAL.toFixed(1)}), got ${dist.toFixed(1)}`);
  });

  // The belt (split into two segments around the gear specifically so
  // neither one's own inner edge gets too close to `p` — see
  // assemblyLine.js's own header comment on renderBeltSegment) and the
  // gear itself are both real solid shapes competing with the marker
  // for space the same way a tile does, unlike the old theme's own bare
  // arrow line.
  const belts = [...exprRoot.querySelectorAll('rect[height="6"]')].filter((r) => Math.abs(Number(r.getAttribute("y")) + 3 - ep0.y) < 70);
  assertEqual(belts.length, 2, "expected exactly 2 belt segments at stop 0");
  belts.forEach((r) => {
    const rect = { x: Number(r.getAttribute("x")), y: Number(r.getAttribute("y")), width: Number(r.getAttribute("width")), height: 6 };
    const dist = distancePointToRect(ep0.x, ep0.y, rect);
    assertTrue(dist > MARKER_RADIUS_LOCAL, `expected a belt segment to clear the marker's own real mobile-scale radius (${MARKER_RADIUS_LOCAL.toFixed(1)}), got ${dist.toFixed(1)}`);
  });

  const gear = [...exprRoot.querySelectorAll('circle[r="9"]')].find((c) => Math.abs(Number(c.getAttribute("cx")) - ep0.x) < 5);
  assertTrue(!!gear, "expected a real gear at stop 0");
  // The gear's own teeth (small rotated rects) reach further than its
  // body — sampled directly via their own rotated corners rather than
  // assumed, the same standard this file already holds crossingLines.js's
  // own rotated rods to.
  const teeth = [...exprRoot.querySelectorAll("rect")].filter((r) => {
    const t = r.getAttribute("transform") || "";
    const m = t.match(/rotate\([-\d.]+\s+([-\d.]+)\s+([-\d.]+)\)/);
    return m && Math.abs(Number(m[1]) - ep0.x) < 5;
  });
  assertTrue(teeth.length > 0, "expected real gear teeth at stop 0");
  let worstToothDist = Infinity;
  teeth.forEach((tooth) => {
    const m = tooth.getAttribute("transform").match(/rotate\(([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\)/);
    const angle = Number(m[1]);
    const cx = Number(m[2]);
    const cy = Number(m[3]);
    const w = Number(tooth.getAttribute("width"));
    const h = Number(tooth.getAttribute("height"));
    const x = Number(tooth.getAttribute("x"));
    const y = Number(tooth.getAttribute("y"));
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    [
      [0, 0],
      [w, 0],
      [0, h],
      [w, h],
    ].forEach(([lx, ly]) => {
      const localX = x + lx - cx;
      const localY = y + ly - cy;
      const vx = cx + localX * cos - localY * sin;
      const vy = cy + localX * sin + localY * cos;
      const dist = Math.hypot(vx - ep0.x, vy - ep0.y);
      if (dist < worstToothDist) worstToothDist = dist;
    });
  });
  assertTrue(worstToothDist > MARKER_RADIUS_LOCAL, `expected the gear's own closest tooth corner to clear the marker's own real mobile-scale radius (${MARKER_RADIUS_LOCAL.toFixed(1)}), got ${worstToothDist.toFixed(1)}`);
});

// All 3 Curve Reach themes were deliberately designed to keep their
// whole composition on one fixed side of `p` (always above it) so they
// stay boss-safe unconditionally, without Slope Fields' own near-boss
// special-casing — but "designed to be safe" is exactly the kind of
// claim this project has been burned trusting without a direct sweep
// (see curveArc.js's own header comment for the marker-clearance
// mistake that same trust already caused once this round). This sweeps
// every real lesson count for all 3 skills and checks the one stop
// that could ever be close enough to matter (immediately before the
// boss) never reaches into its own 86-unit clearance.
test("every Curve Reach theme's own shapes never reach into the boss clearing, at every real lesson count", () => {
  const BOSS_R = 86;

  CURVE_REACH_SKILL_IDS.forEach((skillId) => {
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

      // Small shapes only (rx/r < 100) — excludes this zone's own big
      // background hill silhouettes (rx >= 220), which are decorative
      // landscape, not a competing foreground shape.
      const circles = [...root.querySelectorAll("circle")].filter((c) => {
        const r = Number(c.getAttribute("r"));
        return r >= 2 && r < 100 && Math.abs(Number(c.getAttribute("cy")) - preBoss.y) < 130;
      });
      circles.forEach((c) => {
        const r = Number(c.getAttribute("r"));
        const dist = Math.hypot(Number(c.getAttribute("cx")) - boss.x, Number(c.getAttribute("cy")) - boss.y) - r;
        assertTrue(dist > BOSS_R, `expected "${skillId}"'s own circle/ring near the pre-boss stop to clear the boss clearing (radius ${BOSS_R}) at lesson count ${count}, got ${dist.toFixed(1)}`);
      });

      const ellipses = [...root.querySelectorAll("ellipse")].filter((e) => Number(e.getAttribute("rx")) < 100 && Math.abs(Number(e.getAttribute("cy")) - preBoss.y) < 130);
      ellipses.forEach((e) => {
        const cx = Number(e.getAttribute("cx"));
        const cy = Number(e.getAttribute("cy"));
        const rx = Number(e.getAttribute("rx"));
        const ry = Number(e.getAttribute("ry"));
        const dist = ellipseMinDistToPoint(cx, cy, rx, ry, boss.x, boss.y);
        assertTrue(dist > BOSS_R, `expected "${skillId}"'s own shadow ellipse near the pre-boss stop to clear the boss clearing (radius ${BOSS_R}) at lesson count ${count}, got ${dist.toFixed(1)}`);
      });

      const tiles = [...root.querySelectorAll('rect[width="84"]')].filter((r) => Math.abs(Number(r.getAttribute("y")) + 15 - preBoss.y) < 130);
      tiles.forEach((r) => {
        const rect = { x: Number(r.getAttribute("x")), y: Number(r.getAttribute("y")), width: 84, height: 30 };
        const dx = Math.max(rect.x - boss.x, 0, boss.x - (rect.x + rect.width));
        const dy = Math.max(rect.y - boss.y, 0, boss.y - (rect.y + rect.height));
        const dist = Math.hypot(dx, dy);
        assertTrue(dist > BOSS_R, `expected "${skillId}"'s own expression tile near the pre-boss stop to clear the boss clearing (radius ${BOSS_R}) at lesson count ${count}, got ${dist.toFixed(1)}`);
      });

      // assemblyLineTheme's own belt segments — the general rect check
      // above only matches `width="84"` (the plates); belts are a
      // separate solid rect (height 6, real width varies) at a similar
      // offset from `p`.
      const belts = [...root.querySelectorAll('rect[height="6"]')].filter((r) => Math.abs(Number(r.getAttribute("y")) + 3 - preBoss.y) < 130);
      belts.forEach((r) => {
        const rect = { x: Number(r.getAttribute("x")), y: Number(r.getAttribute("y")), width: Number(r.getAttribute("width")), height: 6 };
        const dx = Math.max(rect.x - boss.x, 0, boss.x - (rect.x + rect.width));
        const dy = Math.max(rect.y - boss.y, 0, boss.y - (rect.y + rect.height));
        const dist = Math.hypot(dx, dy);
        assertTrue(dist > BOSS_R, `expected "${skillId}"'s own belt segment near the pre-boss stop to clear the boss clearing (radius ${BOSS_R}) at lesson count ${count}, got ${dist.toFixed(1)}`);
      });
    }
  });
});
