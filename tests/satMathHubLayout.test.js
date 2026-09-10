// Regression tests for SAT Math's own hub (Function Fields, satMathHub.js)
// — the first walkable hub in this codebase built as a territory-tiled
// archipelago AND reskinned into open sky at once (Numeria Peaks'
// mathHub.js is archipelago-in-ocean, Lexicon Shoals' satRwHub.js is
// sky-but-one-continuous-ring), so neither existing hub test (there are
// none yet for either) would have caught the two failure modes unique to
// this combination: a narrow zone's shoreline reaching past a neighbor
// on *both* sides at once (mathHub.js's own organicIslandPoints doc
// comment names this risk but every zone it has ever shipped only had
// one neighbor to worry about), and a plank bridge whose own walkable
// polygon misses the shore it's supposed to land on.
import { SAT_SUBJECTS, REPORTING_CATEGORIES } from "../js/data/satSkills.js";
import { pointInPolygon } from "../js/ui/hubWorld.js";
import {
  ZONES,
  SKILL_TRIGGER_RADIUS,
  organicIslandPoints,
  computePads,
  computeFieldsLayout,
  computeSpawnPoint,
  bridgePolygon,
  BRIDGE_HALF_WIDTH,
  BOSS_FILL,
} from "../js/ui/satMathHub.js";
import { test, assertEqual, assertTrue } from "./assert.js";

const subject = SAT_SUBJECTS.find((s) => s.id === "sat-math");
const categories = REPORTING_CATEGORIES["sat-math"];

test("every zone holds exactly its own real reporting-category skills (5/3/7/4, not an assumed even split)", () => {
  const { zoneGroups } = computeFieldsLayout(subject);
  ZONES.forEach((zone, i) => {
    const real = subject.skills.filter((s) => s.reportingCategory === categories[i].id);
    const group = zoneGroups.find((g) => g.zone === zone);
    assertEqual(group.points.length, real.length, `expected "${zone.id}" to hold ${real.length} skills (category "${categories[i].id}"), got ${group.points.length}`);
    const cats = new Set(group.points.map((p) => p.item.reportingCategory));
    assertEqual(cats.size, 1, `expected "${zone.id}" to hold exactly one reporting category, got ${[...cats].join(", ")}`);
    assertEqual([...cats][0], categories[i].id, `expected "${zone.id}" (position ${i}) to hold reporting category "${categories[i].id}"`);
  });
});

test("the 4 zones together account for every one of sat-math's own skills, none left over and none duplicated", () => {
  const { layout } = computeFieldsLayout(subject);
  assertEqual(layout.length, subject.skills.length, "expected one marker per real skill");
  const ids = new Set(layout.map((p) => p.item.id));
  assertEqual(ids.size, subject.skills.length, "expected no skill to appear twice across zones");
});

// Uses organicIslandPoints' own raw 48 control points as each shoreline's
// polygon, not the smoothed curve closedBlobPath actually renders from
// them — a deliberate over-approximation, not a gap: closedBlobPath
// draws each segment as a quadratic curve that pulls *toward* a control
// point without ever fully reaching it (it ends at the midpoint to the
// next point instead), so the real rendered shoreline always sits
// slightly inside this test's own control polygon. If the control
// polygons below don't overlap, the real, slightly-smaller rendered
// shapes can't either.
//
// This is the regression computeBox (satMathHub.js) exists to prevent:
// organicIslandPoints floors a narrow zone's own half-extent to 50px, so
// a box wider than its own raw node spread renders wider than plain gap
// math off the raw bbox would assume. Advanced Math (3 skills, forced
// into a single column by gridPositions' own >=3-rows rule) is the
// first zone in this app narrow enough to hit that floor while sitting
// between two neighbors instead of at a chain's own end. Checked here by
// replaying the exact real pads (computePads) through the exact real
// organicIslandPoints this file renders with, then testing the resulting
// polygons for actual overlap — not by re-deriving the gap arithmetic a
// second time, which could drift from the real version without this
// test ever noticing.
test("no two of the 5 rendered shorelines (4 topic islands + the boss islet) overlap", () => {
  const { boxes, bossBbox } = computeFieldsLayout(subject);
  const { pads, bossPadTop, bossBottomPad } = computePads(boxes, bossBbox);
  const shapes = [];
  boxes.forEach((box, i) => {
    if (!box) return;
    shapes.push({ id: ZONES[i].id, pts: organicIslandPoints(box, pads[i], i + 1) });
  });
  shapes.push({
    id: "boss",
    pts: organicIslandPoints(bossBbox, { left: 150, right: 150, top: bossPadTop, bottom: bossBottomPad }, 99),
  });

  for (let i = 0; i < shapes.length; i++) {
    for (let j = 0; j < shapes.length; j++) {
      if (i === j) continue;
      const intrusion = shapes[i].pts.some((p) => pointInPolygon(p.x, p.y, shapes[j].pts));
      assertTrue(!intrusion, `expected "${shapes[i].id}"'s own shoreline to stay clear of "${shapes[j].id}"'s, but at least one of its boundary points landed inside it`);
    }
  }
});

// Anchors at each box's own tight edge (computeBridgeSpans), well inside
// its own padded shoreline — this checks that guarantee actually holds
// against the real rendered shoreline, not just the reasoning behind it.
test("every bridge (topic-to-topic and the final topic-to-boss span) anchors on real solid ground at both ends", () => {
  const { boxes, bossBbox, bridgeSpans } = computeFieldsLayout(subject);
  const { pads, bossPadTop, bossBottomPad } = computePads(boxes, bossBbox);
  const presentBoxes = boxes.filter(Boolean);
  const presentIndices = boxes.map((b, i) => (b ? i : null)).filter((i) => i !== null);
  const islandPolys = presentBoxes.map((box, k) => organicIslandPoints(box, pads[presentIndices[k]], presentIndices[k] + 1));
  const bossPoly = organicIslandPoints(bossBbox, { left: 150, right: 150, top: bossPadTop, bottom: bossBottomPad }, 99);

  bridgeSpans.forEach((span, i) => {
    const isLast = i === bridgeSpans.length - 1;
    const startsOnIsland = islandPolys.some((poly) => pointInPolygon(span.ax, span.ay, poly));
    assertTrue(startsOnIsland, `expected bridge ${i}'s own start (${span.ax.toFixed(1)}, ${span.ay.toFixed(1)}) to land on a real topic island's shoreline`);
    if (isLast) {
      assertTrue(pointInPolygon(span.bx, span.by, bossPoly), `expected the final bridge's own end (${span.bx.toFixed(1)}, ${span.by.toFixed(1)}) to land on the boss islet's own shoreline`);
    } else {
      const endsOnIsland = islandPolys.some((poly) => pointInPolygon(span.bx, span.by, poly));
      assertTrue(endsOnIsland, `expected bridge ${i}'s own end (${span.bx.toFixed(1)}, ${span.by.toFixed(1)}) to land on a real topic island's shoreline`);
    }
  });
});

// The actual walkability guarantee this whole bridge system exists for:
// every point along a bridge's own centerline, not just its two named
// endpoints, stays inside the union of (that bridge's own walkable
// polygon) and (every island's own shoreline) — sampled every ~20px, the
// same resolution the avatar's own per-frame movement would cross this
// seam at. A gap here is exactly how a real player would hit invisible
// sky mid-bridge despite both ends looking fine.
test("every bridge stays continuously walkable along its own centerline, not just at its two named endpoints", () => {
  const { boxes, bossBbox, bridgeSpans } = computeFieldsLayout(subject);
  const { pads, bossPadTop, bossBottomPad } = computePads(boxes, bossBbox);
  const presentBoxes = boxes.filter(Boolean);
  const presentIndices = boxes.map((b, i) => (b ? i : null)).filter((i) => i !== null);
  const islandPolys = presentBoxes.map((box, k) => organicIslandPoints(box, pads[presentIndices[k]], presentIndices[k] + 1));
  const bossPoly = organicIslandPoints(bossBbox, { left: 150, right: 150, top: bossPadTop, bottom: bossBottomPad }, 99);
  const allPolys = [...islandPolys, bossPoly];

  bridgeSpans.forEach((span, i) => {
    const poly = bridgePolygon(span.ax, span.ay, span.bx, span.by, BRIDGE_HALF_WIDTH);
    const walkable = [...allPolys, poly];
    const len = Math.hypot(span.bx - span.ax, span.by - span.ay);
    const steps = Math.max(2, Math.round(len / 20));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = span.ax + (span.bx - span.ax) * t;
      const y = span.ay + (span.by - span.ay) * t;
      const ok = walkable.some((p) => pointInPolygon(x, y, p));
      assertTrue(ok, `expected bridge ${i} to stay walkable at ${(t * 100).toFixed(0)}% along its own centerline (${x.toFixed(1)}, ${y.toFixed(1)})`);
    }
  });
});

test("every pair of the 19 real skill markers stays past the combined 2x58px hitbox overlap threshold", () => {
  const { layout } = computeFieldsLayout(subject);
  let minDist = Infinity;
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      minDist = Math.min(minDist, Math.hypot(layout[i].x - layout[j].x, layout[i].y - layout[j].y));
    }
  }
  assertTrue(minDist > SKILL_TRIGGER_RADIUS * 2, `expected every marker pair further apart than ${SKILL_TRIGGER_RADIUS * 2}px, got as close as ${minDist.toFixed(1)}px`);
});

test("the computed spawn point lands on a real topic island's own shoreline", () => {
  const { layout, boxes, bossBbox } = computeFieldsLayout(subject);
  const { pads } = computePads(boxes, bossBbox);
  const spawn = computeSpawnPoint(layout);
  const presentBoxes = boxes.filter(Boolean);
  const presentIndices = boxes.map((b, i) => (b ? i : null)).filter((i) => i !== null);
  const islandPolys = presentBoxes.map((box, k) => organicIslandPoints(box, pads[presentIndices[k]], presentIndices[k] + 1));
  const onAnyIsland = islandPolys.some((poly) => pointInPolygon(spawn.x, spawn.y, poly));
  assertTrue(onAnyIsland, `expected the spawn point (${spawn.x.toFixed(1)}, ${spawn.y.toFixed(1)}) to land on a real topic island`);
});

test("the boss islet's own fill is distinct from every one of the 4 zones' own fills", () => {
  ZONES.forEach((zone) => {
    assertTrue(zone.fill !== BOSS_FILL, `expected "${zone.id}"'s own fill to differ from the boss islet's, so the boss reads as its own territory rather than a 5th zone`);
  });
});
