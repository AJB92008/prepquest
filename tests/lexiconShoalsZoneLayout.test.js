// Regression tests for Lexicon Shoals' (SAT Reading & Writing) own ring
// layout, specifically the zone-assignment bug fixed in satRwHub.js/
// hubWorld.js: computeRingLayout used to cut the 17 sat-rw skills into 4
// equal-ish quarters by raw array position (Math.ceil(17/4) = 5 per
// zone), not by each reporting category's own real size (5/5/3/4) —
// silently handing Scriptorium (meant for Expression of Ideas' 3 skills)
// 2 extra Standard English Conventions skills (Sentence Boundaries,
// Punctuation Precision) that really belong in Grammar Garrison, which
// was left with only 2 of its own 4. Fixed by having satRwHub.js derive
// each category's own real size straight from the data
// (reportingCategoryGroupSizes) and pass it to computeRingLayout as
// `zoneSizes`, so a zone's own item count is never assumed.
import { SAT_SUBJECTS, REPORTING_CATEGORIES } from "../js/data/satSkills.js";
import { computeRingLayout, ringBoundaryPoints, sampleClosedBlobPath, zoneCenter, decorationPos } from "../js/ui/hubWorld.js";
import {
  ZONES,
  reportingCategoryGroupSizes,
  computeGoatPos,
  RING_CENTER,
  OUTER_RADIUS,
  INNER_RADIUS,
  SHORE_RING_WIDTH,
  RING_SEED,
  RING_JITTER,
  SKILL_TRIGGER_RADIUS,
} from "../js/ui/satRwHub.js";
import { test, assertEqual, assertTrue } from "./assert.js";

const subject = SAT_SUBJECTS.find((s) => s.id === "sat-rw");
const categories = REPORTING_CATEGORIES["sat-rw"];

function pointInPolygon(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect = yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function realLayout() {
  const zoneSizes = reportingCategoryGroupSizes(subject.skills);
  return computeRingLayout(subject.skills, ZONES, {
    center: RING_CENTER,
    outerRadius: OUTER_RADIUS,
    innerRadius: INNER_RADIUS,
    shoreRingWidth: SHORE_RING_WIDTH,
    zoneSizes,
  });
}

test("reportingCategoryGroupSizes matches each real reporting category's own skill count", () => {
  const sizes = reportingCategoryGroupSizes(subject.skills);
  categories.forEach((cat, i) => {
    const real = subject.skills.filter((s) => s.reportingCategory === cat.id).length;
    assertEqual(sizes[i], real, `expected group ${i} ("${cat.id}") to have ${real} skills`);
  });
});

test("reportingCategoryGroupSizes sums to the subject's own total skill count and has one entry per zone", () => {
  const sizes = reportingCategoryGroupSizes(subject.skills);
  assertEqual(
    sizes.reduce((a, b) => a + b, 0),
    subject.skills.length,
    "expected group sizes to add up to the real total skill count"
  );
  assertEqual(sizes.length, ZONES.length, "expected one group per zone");
});

test("every zone's own markers share one real reporting category, and that category matches the zone's own order", () => {
  const layout = realLayout();
  ZONES.forEach((zone, zoneIndex) => {
    const items = layout.filter((p) => p.zone === zone).map((p) => p.item);
    assertTrue(items.length > 0, `expected zone "${zone.id}" to have at least one skill`);
    const cats = new Set(items.map((s) => s.reportingCategory));
    assertEqual(cats.size, 1, `expected zone "${zone.id}" to hold exactly one reporting category, got ${[...cats].join(", ")}`);
    assertEqual([...cats][0], categories[zoneIndex].id, `expected zone "${zone.id}" (position ${zoneIndex}) to hold reporting category "${categories[zoneIndex].id}"`);
  });
});

test("Grammar Garrison holds all 4 of its own Standard English Conventions skills, not just an even quarter of the total 17", () => {
  const layout = realLayout();
  const garrison = ZONES.find((z) => z.id === "garrison");
  const ids = layout.filter((p) => p.zone === garrison).map((p) => p.item.id);
  assertEqual(ids.length, 4, "expected Grammar Garrison to hold exactly 4 skills");
  ["satrw-boundaries", "satrw-punctuation", "satrw-agreement", "satrw-verbforms"].forEach((id) => {
    assertTrue(ids.includes(id), `expected Grammar Garrison to include "${id}"`);
  });
});

test("Scriptorium holds only its own 3 Expression of Ideas skills, not 2 extra Standard English Conventions skills", () => {
  const layout = realLayout();
  const scriptorium = ZONES.find((z) => z.id === "scriptorium");
  const ids = layout.filter((p) => p.zone === scriptorium).map((p) => p.item.id);
  assertEqual(ids.length, 3, "expected Scriptorium to hold exactly 3 skills");
  assertTrue(!ids.includes("satrw-boundaries"), "Sentence Boundaries belongs to Grammar Garrison, not Scriptorium");
  assertTrue(!ids.includes("satrw-punctuation"), "Punctuation Precision belongs to Grammar Garrison, not Scriptorium");
});

test("every pair of the 17 real skill markers stays past the combined 2x50px hitbox overlap threshold", () => {
  const layout = realLayout();
  let minDist = Infinity;
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      minDist = Math.min(minDist, Math.hypot(layout[i].x - layout[j].x, layout[i].y - layout[j].y));
    }
  }
  assertTrue(minDist > SKILL_TRIGGER_RADIUS * 2, `expected every marker pair further apart than ${SKILL_TRIGGER_RADIUS * 2}px, got as close as ${minDist.toFixed(1)}px`);
});

test("Grammar Garrison's own dev-mode goat still lands on real walkable land, clear of every skill marker's own hitbox", () => {
  const layout = realLayout();
  const goat = computeGoatPos(layout);
  assertTrue(!!goat, "expected a goat position now that Grammar Garrison has skills");

  const { outer, inner } = ringBoundaryPoints({ center: RING_CENTER, outerRadius: OUTER_RADIUS, innerRadius: INNER_RADIUS, seed: RING_SEED, jitter: RING_JITTER });
  const outerCurve = sampleClosedBlobPath(outer);
  const innerCurve = sampleClosedBlobPath(inner);
  assertTrue(pointInPolygon(goat, outerCurve) && !pointInPolygon(goat, innerCurve), "expected the goat to sit on real land, inside the outer shore and outside the inner hole");

  layout.forEach((p) => {
    const dist = Math.hypot(p.x - goat.x, p.y - goat.y);
    assertTrue(dist > SKILL_TRIGGER_RADIUS, `expected the goat to stay clear of "${p.item.id}"'s own hitbox, got ${dist.toFixed(1)}px`);
  });
});

// decorationPos spirals a zone's own decorations outward by raw array
// index, not by how many *real* (non-empty) emoji come before it — so
// whether a given index lands clear of a marker depends on that zone's
// own real skill layout, not on anything about the emoji itself. Found
// by hand for Archive Stacks: its own original 3-entry decorations
// array put index 1 close enough to Detail Sorter's own marker to
// really overlap it in the rendered DOM (confirmed via
// getBoundingClientRect, not just estimated distance) — fixed by
// burning that index with an empty-string spacer (see Archive Stacks'
// own comment in satRwHub.js) rather than assuming any 3-entry array is
// automatically safe. This generalizes that same check to every zone's
// own real (non-empty) decorations, against every marker in that zone
// and the goat, so the next zone to get its own decorations array
// can't quietly ship the same collision.
test("every zone's own real decorations land on real walkable land, clear of every skill marker's own hitbox and the goat", () => {
  const layout = realLayout();
  const { outer, inner } = ringBoundaryPoints({ center: RING_CENTER, outerRadius: OUTER_RADIUS, innerRadius: INNER_RADIUS, seed: RING_SEED, jitter: RING_JITTER });
  const outerCurve = sampleClosedBlobPath(outer);
  const innerCurve = sampleClosedBlobPath(inner);
  const goat = computeGoatPos(layout);

  ZONES.forEach((zone) => {
    const points = layout.filter((p) => p.zone === zone);
    if (!points.length) return;
    const { avgX, avgY } = zoneCenter(points);
    zone.decorations.forEach((emoji, i) => {
      if (!emoji) return; // a deliberate empty-string spacer slot — nothing renders there, nothing to check
      const pos = decorationPos(avgX, avgY, i, zone.decorations.length);
      assertTrue(pointInPolygon(pos, outerCurve) && !pointInPolygon(pos, innerCurve), `expected "${zone.id}"'s own "${emoji}" decoration to land on real land, inside the outer shore and outside the inner hole`);
      // Checked against every one of the 17 real markers, not just this
      // zone's own — decorationPos throws a decoration 130-210px out
      // from its own zone's centroid, and each wedge only spans 90° of
      // the ring, so a decoration landing close to a *neighboring*
      // zone's marker is real, plausible geometry, not a hypothetical.
      layout.forEach((p) => {
        const dist = Math.hypot(p.x - pos.x, p.y - pos.y);
        assertTrue(dist > SKILL_TRIGGER_RADIUS, `expected "${zone.id}"'s own "${emoji}" decoration to stay clear of "${p.item.id}"'s own hitbox, got ${dist.toFixed(1)}px`);
      });
      if (goat) {
        const goatDist = Math.hypot(goat.x - pos.x, goat.y - pos.y);
        assertTrue(goatDist > SKILL_TRIGGER_RADIUS, `expected "${zone.id}"'s own "${emoji}" decoration to stay clear of the goat, got ${goatDist.toFixed(1)}px`);
      }
    });
  });
});
