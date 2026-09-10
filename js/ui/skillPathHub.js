// The dispatch table for every skill with its own zoomed-in lesson-path
// terrain (see lessonTerrain.js for the shared engine they all render
// through, and js/ui/lessonThemes/ for each skill's own "skin" — a
// distinct composition, not a recolor of another one). Each skill's own
// look is meant to match where its node actually sits on Wordwood Isle's
// own map. The forest zone: Idiom Instinct gets open plains with a
// river, Phrase Finder gets dense jungle, Fix the Fracture gets a canyon
// split by a literal crack, In Formation gets an orchard planted in
// strict rows (parallel structure), Modifier Mix-Up gets a tangled
// bramble thicket (misplaced modifiers), Stay on Topic gets a wide-open,
// uncluttered clearing with an unusually direct trail (staying on
// topic, not wandering), and Writer's Goal gets a misty swamp crossed by
// a built wooden boardwalk (a clear, deliberate path laid straight
// through otherwise murky terrain). The meadow zone: Comma Sense gets a
// composite scene, a brief run of mountains right at the top giving way
// to plains dominating the rest (a comma's own brief pause between two
// things — plains-dominant so the scene still reads as Sunny Meadow),
// Apostrophe Ally gets a plains scene built entirely from paired/twin
// features (ponds, hills, grass tufts, flowers — an "ally," always in
// twos — denser than a first pass at the idea, so the field doesn't
// read as empty between pairs),
// Semicolon Signal gets a plains scene centered on a windmill landmark
// (now with a proper base and roof) with more frequent signal flags
// along the trail and ambient wheat texture filling the field, Colon
// Call gets a plains
// scene full of calling birds and a bell tower (a colon "calls out"
// what follows), Dash Dash gets a windswept prairie whose trail is
// drawn in long chunky dashes instead of dots, Full Stop gets its own
// hushed swamp variant meeting the coast — one still cove reaching in
// from the edge instead of a landlocked pool, and a fully unbroken
// trail line (a period is one definitive stop, echoed by the one
// singular body of water too), and Case Closed gets a wide-open grassy
// field (no water feature) with a suitcase abandoned in the grass (a
// literal "case"). The hillside zone: Who's There? gets one continuous
// mountain wall (not alternating blocks) with one deliberate low pass
// guarded by a watchtower, receding into a small clearing near the
// bottom, and a narrow sliver of sea along the opposite edge the whole
// way down (coast with mountains, one coherent scene); Match Makers
// gets an all-mountain valley lined with
// matching peak PAIRS, each pair sharing the same height and the same
// colored pennant; Clear Antecedent gets an all-mountain scene where
// the exact same landmark peak recurs, identical, with signposts
// pointing back to it every time; Time Traveler gets a mountain wall
// whose cliff strata visibly age from weathered to vivid down its
// length (the mountain showing its own past, present, and future),
// with only a narrow, quiet sliver of sea along the opposite edge —
// enough to read as coastal without competing with the strata for
// attention;
// Number Match gets a plain all-mountain valley, same template as Match
// Makers and Clear Antecedent, its walls topped with recurring ridge
// silhouettes and foothill scree instead of any water feature;
// Apples to Apples gets a rocky mountain wall mirrored to the other
// side (no water feature either), with matching pairs of twin rock
// arches carved from the wall and a few literal apple trees;
// and Sound-Alike Showdown flips the coastal balance entirely — open
// water dominates, with matching cliffs (and mountain peaks cresting
// above them) on both the left and right edges, sound-wave arcs echoing
// between them. The dock zone: Bridge Builder gets sandy plains crossed
// again and again by dry gullies spanned with built plank bridges
// (transitions between ideas, one deliberate crossing at a time); Big
// Picture Builder gets a sandy mountain valley with built overlook
// platforms recurring up both walls (seeing the whole structure at
// once); Trim the Fat gets a stark, bleached desert with pruned cacti
// and almost nothing else (concision — everything unnecessary cut
// away); and Tone Tuner gets a dune desert meeting the sea along one
// edge — finally giving Tidewater Dock some actual tidewater — whose
// light, dune color, AND the water itself all shift once from warm
// sunrise gold to cool dusk purple down its whole length, with a tuning
// dial recurring along the trail (matching tone consistently, retuned
// deliberately rather than at random). Numeria Peaks' own Ironroot
// Algebra zone: Line Crossing gets an Ironroot valley crossed again and
// again by the same dead-straight diagonal line, the same slope every
// time, each crossing spanned by a plank bridge (linear — a constant
// rate of change, unlike every wandering trail/wall edge elsewhere);
// Curve Ball gets two actual parabolic ridgelines sweeping wall to
// wall, their genuine intersection points (solved algebraically, not
// guessed) each marked with a boulder — up to two per pair, the same
// as a real quadratic system; Algebra Toolkit gets a mining valley
// worked with a different tool at every stop (pickaxe, crate, ore
// cart, lantern, coiled rope) rather than one repeated prop, a toolkit
// holding several different tools rather than five of the same one;
// Root Cause goes underground into a mine cavern threaded with the
// peaks' own roots reaching down from above and braced by wooden shaft
// supports, digging past the surface for what's actually at the root
// of things; and Final Five gets one continuous wall carrying exactly
// five numbered peaks, each taller and darker than the last, right up
// to the boss's own clearing — the ACT's own toughest final stretch,
// getting harder one peak at a time. Numeria Peaks' own Shalefoot
// Geometry zone: Angle Anchor gets a valley anchored at intervals by a
// real square-on-each-side Pythagorean proof (an actual a²+b²=c²
// picture, not an icon) plus smaller angle-tick marks between them;
// Round Trip gets a valley where the trail itself breaks off through a
// real stone ring and back at every stop, a genuine loop rather than a
// circle drawn nearby; Triangle Mastery gets a valley floor scattered
// with crystal shards cut into a different triangle type at every
// stop — right, equilateral, isosceles, scalene — fluency across all
// of them rather than one shape repeated; Shape Shifter gets a valley
// where the same landmark polygon reappears with a different vertex
// count every time (a square, then a pentagon, a hexagon, and on);
// Angle & Arc gets a valley where a real stone circle and a genuine
// secant line (drawn from two actual points on the circle's own
// circumference, not eyeballed) cross at every stop; and Solid Ground
// gets a valley planted with a different real 3D solid at every
// stop — a cube, a cylinder, a cone, a sphere — each shaded with real
// faces so it reads as a volume, not a flat icon. Numeria Peaks' own
// Skyline Functions zone flips its own hub map's balance: the hub
// itself leads with spires and treats purple trees as a secondary
// accent, but every one of these four lesson paths leads with a real
// purple forest instead, the spires only a faint distant skyline above
// the canopy. Coordinate Compass gets that forest laid over a faint
// coordinate grid, a compass rose at intervals, and small plotted-point
// markers along the trail itself; Graph Architect gets trees planted
// into real conic shapes rather than scattered at random — a circle, an
// ellipse, a parabola's own arc, built from trees instead of drawn;
// Grid & Log gets trees arranged into an actual row-by-column grid
// between real matrix brackets at some stops, and a real logarithmic
// spiral (r = ae^(bθ)) growing through the trees at others; and Trig
// Trailhead opens at a real trailhead signpost planted at the very
// first lesson, threaded the rest of the way by a real sine wave and
// marked at intervals by a circle split into its four quadrants, each
// carrying its own sign. Numeria Peaks' own Goldtally Flats zone keeps
// its hub map's own low-profile identity here too — no rock walls, no
// forest canopy, just open flat gold-flecked ground with cracked-earth
// texture, the same "Flats" logic the hub's own nugget-and-tally motif
// already follows. Power Surge gets a nugget cluster whose own count
// doubles at every stop (two, then four, then eight, then sixteen — an
// actual exponential surge, not a fixed pile) plus real lightning-
// shaped cracks in the dry earth; Odds & Ends gets a genuinely varied
// assortment at every stop — a die, a coin, a tally mark, never the
// same one twice in a row — "odds" and "ends" both at once; and Number
// Detective gets a real footprint trail alongside the path, numbered
// evidence tags (circled if the number's prime) planted at intervals,
// and one magnifying glass over the biggest piece of evidence. Athenaeum
// Reef's own Coral Stacks zone (the reef's first two skills, see
// readingHub.js's own ZONES) starts a matching pair of themes: Big
// Picture gets one oversized coral crown formation the trail winds
// around, with only a few small satellite corals kept well clear of it,
// so that one central shape reads as unmissable the way a main idea
// should; Detail Detective gets the deliberate opposite — no dominant
// shape at all, just a dense sandy-floor mosaic of small anemones,
// shells, and coral polyps covering the whole scene, rewarding a close
// look the same way the skill itself does. Driftwood Cove (the reef's
// last two skills) gets its own matching pair: Claim Check gets a
// half-collapsed dock of weathered driftwood pylons in shallow water,
// with one piece of actual evidence (a bottle, a key, an anchor, a
// compass) washed up alongside every other stop — checking a claim
// against something concrete, not generic scenery; Two Texts, One Story
// gets two distinct currents, each carrying its own drifting log,
// physically merging into one wider current partway down, the trail
// itself crossing right at the confluence — two separate things
// becoming one, rendered literally. Tide Pool Terrace gets its own
// pair: Time Order gets the moon's own real phases, in their real
// order, one per stop against a night sky — new, crescent, quarter,
// gibbous, full, and back — the one sequence every player already
// knows by heart, and the actual real-world cause of tides in the
// first place; Side by Side gets a pool sitting right next to another
// pool at every stop, each holding different contents, built to be
// read as a pair rather than individually. Lighthouse
// Point: Cause & Effect gets a rock struck by breaking spray at every
// stop — cause and effect drawn as one inseparable unit — under a
// lighthouse standing over the whole scene as the one fixed thing every
// pair traces back to; Word Watch gets a tideline of driftwood letter
// tiles (meaningless alone, the same way a word means nothing pulled
// out of its passage) watched over by recurring spyglasses. Sunken
// Archive: Big Conclusions gets one large cracked urn whose shards,
// scattered down the trail, still carry its own clay color and rim
// pattern — proof on sight that scattered pieces still add up to one
// whole; Voice & Method keeps a brass speaking trumpet (voice, with
// real sound-wave rings) on one side of the trail and real navigation
// tools — a compass, a spyglass, a logbook (method) — on the other,
// the whole way down. That's all ten of Athenaeum Reef's skills — see
// readingHub.js's ZONES for how each pair maps to that zone's own
// legend entry. Lab Archipelago's own three zones share one visual
// environment per zone rather than a distinct concept per skill (see
// scienceHub.js's own ZONES) — a narrower, more literal set of zone
// identities than Reading's five reef zones, so one setting per zone
// with a skill-specific focal feature reads better than six unrelated
// ideas would: Data Deck's own server-room floor gets a monitor
// screen at every stop for Graph Gazer (a different real chart type
// each time — bar, line, scatter, pie) and a column of streaming data
// figures with one value circled for Data Diver (pulling a value out,
// not just reading a chart); Field Station's own grassy research camp
// gets a numbered logbook post counting up at every stop for Lab Log
// (a step-by-step procedure, read start to finish) and a fenced test
// plot holding one plain "control" sprout beside a taller "variable"
// one for Variable Vault; Observatory Ridge's own night sky gets two
// rival orbit diagrams squared off on opposite sides of the trail for
// Theory Throwdown (competing models of the same system) and a
// telescope aimed along a dashed predicted trajectory toward a target
// star for Prediction Station. Lexicon Shoals' own Archive Stacks zone
// (the first of SAT Reading & Writing's four zones, see satRwHub.js's
// own ZONES) starts its own Celestial Archive family — a floating
// archive under a violet night sky, warm gold starlight standing in for
// candlelight — with five skills, not a matching pair: Core Idea Finder
// gets one oversized glowing codex floating open mid-scene, everything
// else kept small and dim, the same "one unmissable shape" idea
// Athenaeum Reef's own Big Picture uses; Evidence Hunter gets a field of
// ordinary dim scrolls with one lantern-lit, open, marked scroll singled
// out at every stop; Chart Reader gets a row of brass astrolabes, each
// tracing a different real chart type — bar, line, scatter, pie — in
// starlight; Read Between the Lines gets a dimmer, quieter variant of
// the family where each stop's own page fragment carries two solid ink
// lines with one faint glowing line hidden in the gap between them, the
// meaning the passage never states outright; and Detail Sorter gets the
// zone's own deliberate opposite of Core Idea Finder's single codex — a
// dense drift of small index cards, mini scrolls, and wax seals that
// reads visibly messier near the top and settles into calmer rows by
// the time it reaches the boss. Lexicon Shoals' own Grammar Garrison
// zone (its fourth and last zone, see satRwHub.js's own ZONES) starts
// its own Sky Bastion family — open daytime sky (deliberately not
// Archive Stacks' own night violet, a different zone with its own time
// of day), weathered stone, and crimson banners — across its own four
// skills: Sentence Boundaries gets one continuous rampart running the
// whole scene, solid everywhere except a real gate with its own banner
// at every stop — a fragment or a run-on both reading as wrong the same
// way an unbroken or randomly-crumbled wall would; Punctuation Precision
// gets a row of watch-posts, each flying a different punctuation mark's
// own glyph stitched onto its banner — comma, semicolon, colon, dash —
// cycling in order; Agreement Check gets two sentry turrets at every
// stop, always built identical to each other in height and banner
// color, the same "paired, always matching" idea Athenaeum Reef's own
// Side by Side/twinPonds/twinTidepools already use; and Verb Form Fix
// gets a watchtower beacon stepping through the four real times of day
// in order — dawn, midday, dusk, night — the same "step through a real
// sequence" idea Time Order's own moon phases use, a tower keeping watch
// across a whole day standing in for a verb changing across a timeline.
// Lexicon Shoals' own Scriptorium zone (its third zone, see satRwHub.js's
// own ZONES) starts its own Cartographer's Table family — aged
// parchment, sepia ink, wax-seal red, and compass gold, the whole scene
// read as a chart spread out and studied from directly above rather
// than any sky or room, Scriptorium's own answer to Archive Stacks'
// night violet and Grammar Garrison's open-air stone — across its own
// three skills: Transition Tracker gets one inked trade route with a
// small route-junction pennant at every stop, its own shape and color
// naming which family of transition connects it to the next —
// continuation, contrast, or cause and effect — cycling in order;
// Bullet Point Builder gets 2-3 loose torn note-scraps bound by ribbon
// into one sealed, wax-stamped note at every stop, several things
// visibly becoming one; and Logical Order gets a small brass waypoint
// tile turning square with the chart at every stop, a fainter crooked
// tile behind it showing the wrong placement it was corrected from — a
// revision actually shown happening, not just implied. (An earlier
// version of Logical Order spelled this out with literal sequence
// numbers instead; dropped after it read as visually confusing in the
// actual game, since those numbers sat right on top of the game's own
// "Lesson 1/2/3" markers, which render at that exact same stop
// position — see expeditionRoute.js's own header comment.) Lexicon
// Shoals' own Etymology Grove zone (its second zone, see satRwHub.js's
// own ZONES) starts its own Root & Branch family — warm forest green,
// bark brown, and a small wooden root-origin tag at every stop naming
// the real language a word's own root traces back to (cycling through
// Latin, Greek, Old English, French) — across its own five skills:
// Context Clues gets a sapling flanked by two different context
// blossoms, its own canopy color always matching exactly one of the
// two, never the other, alternating which side is the real match;
// Blueprint Reader gets a tree with its own dashed structural skeleton
// left visible behind the finished canopy, the scaffold a shape is
// actually built on top of; Author's Angle gets a tree leaning at its
// own deliberate angle, its ground-shadow cast the same way and a
// small wind-pennant naming the direction, alternating which way
// stop to stop; Paired Passage Bridge gets two trees, one on each side
// of the trail, their canopies reaching toward each other to form a
// real bridge grown over it, the same "two things, always meeting in
// the middle" idea Agreement Check's own twin sentries use; and Figure
// It Out gets a topiary tree pruned into a shape that isn't a tree at
// all — a spiral or a five-point star, alternating stop to stop — the
// surface shape never being the literal thing, grown instead of
// stated. Function Fields' own Slope Fields zone (its first zone, see
// satMathHub.js's own ZONES) starts its own "Graph Paper" family — pale
// grid-ruled paper and one dark ink blue pulled straight from the hub's
// own fill for this zone, continuing the hub's own graph/grid visual
// language down into its lessons rather than switching to an unrelated
// look — across its own five skills: Equation Solver gets a balance
// scale at every stop holding an x tile and a numeral tile in perfect
// balance, alternating which pan holds x; Line Reader gets a plotted
// line segment with its own real rise/run triangle drawn in beside it,
// alternating a rising line and a falling one; Graph Plotter gets two
// real plotted points on the same line the lesson marker itself already
// sits on (a third dot drawn directly under that marker never actually
// showed), the newer one ringed as just placed, rather than one
// finished line with nothing showing how it got there;
// Crossing Point gets two lines in two different inks, each built as a
// mirror pair of offsets around the same center point so they
// genuinely intersect exactly there — the same "solved algebraically,
// not guessed" standard Numeria Peaks' own Curve Ball already holds its
// own parabola intersections to; and Boundary Setter gets a real
// boundary line with its own solution half-plane shaded to one side,
// alternating a solid boundary and a dashed one and which side is
// shaded. Every one of Slope Fields' five files keeps its own real
// content clear of (or, for a thin line/stroke, comfortably accepts
// passing through) the game's own "Lesson N" marker button — at a
// realistic mobile width that marker's own radius runs to ≈38 local
// units, not the few pixels it measures in this project's own oversized
// automation viewport, which is what let a real overlap on Equation
// Solver's own fulcrum (and an uselessly small intersection ring on
// Crossing Point, since removed) both ship looking fine in a
// standalone check before being caught against the real in-game render.
// Add a
// new skill here (plus one line in skillPath.js's dispatch) rather
// than writing a whole new file — that's the point of the shared
// engine.
import { renderLessonTerrainPath } from "./lessonTerrain.js";
import { plainsTheme } from "./lessonThemes/plains.js";
import { jungleTheme } from "./lessonThemes/jungle.js";
import { canyonTheme } from "./lessonThemes/canyon.js";
import { orchardTheme } from "./lessonThemes/orchard.js";
import { brambleTheme } from "./lessonThemes/bramble.js";
import { overlookTheme } from "./lessonThemes/overlook.js";
import { swampTheme } from "./lessonThemes/swamp.js";
import { peaksTheme } from "./lessonThemes/peaks.js";
import { twinPondsTheme } from "./lessonThemes/twinPonds.js";
import { beaconTheme } from "./lessonThemes/beacon.js";
import { birdsongTheme } from "./lessonThemes/birdsong.js";
import { windsweptTheme } from "./lessonThemes/windswept.js";
import { stillwaterTheme } from "./lessonThemes/stillwater.js";
import { shorelineTheme } from "./lessonThemes/shoreline.js";
import { sentryPassTheme } from "./lessonThemes/sentryPass.js";
import { matchedPeaksTheme } from "./lessonThemes/matchedPeaks.js";
import { clearPeakTheme } from "./lessonThemes/clearPeak.js";
import { strataPeaksTheme } from "./lessonThemes/strataPeaks.js";
import { seaStacksTheme } from "./lessonThemes/seaStacks.js";
import { twinCliffsTheme } from "./lessonThemes/twinCliffs.js";
import { echoBayTheme } from "./lessonThemes/echoBay.js";
import { causewayTheme } from "./lessonThemes/causeway.js";
import { vistaPeakTheme } from "./lessonThemes/vistaPeak.js";
import { barrensTheme } from "./lessonThemes/barrens.js";
import { duneShiftTheme } from "./lessonThemes/duneShift.js";
import { faultLineTheme } from "./lessonThemes/faultLine.js";
import { archCrossingTheme } from "./lessonThemes/archCrossing.js";
import { minersCacheTheme } from "./lessonThemes/minersCache.js";
import { rootCavernTheme } from "./lessonThemes/rootCavern.js";
import { fivePeaksTheme } from "./lessonThemes/fivePeaks.js";
import { pythagoreanAnchorTheme } from "./lessonThemes/pythagoreanAnchor.js";
import { roundTripLoopTheme } from "./lessonThemes/roundTripLoop.js";
import { triangleGalleryTheme } from "./lessonThemes/triangleGallery.js";
import { shapeShifterTheme } from "./lessonThemes/shapeShifter.js";
import { angleArcTheme } from "./lessonThemes/angleArc.js";
import { solidGroundGeoTheme } from "./lessonThemes/solidGroundGeo.js";
import { coordinateForestTheme } from "./lessonThemes/coordinateForest.js";
import { graphArchitectForestTheme } from "./lessonThemes/graphArchitectForest.js";
import { gridLogForestTheme } from "./lessonThemes/gridLogForest.js";
import { trigTrailheadTheme } from "./lessonThemes/trigTrailhead.js";
import { powerSurgeFlatsTheme } from "./lessonThemes/powerSurgeFlats.js";
import { oddsEndsFlatsTheme } from "./lessonThemes/oddsEndsFlats.js";
import { numberDetectiveFlatsTheme } from "./lessonThemes/numberDetectiveFlats.js";
import { reefCrownTheme } from "./lessonThemes/reefCrown.js";
import { coralMosaicTheme } from "./lessonThemes/coralMosaic.js";
import { driftwoodLockerTheme } from "./lessonThemes/driftwoodLocker.js";
import { confluenceCoveTheme } from "./lessonThemes/confluenceCove.js";
import { moonSequenceTheme } from "./lessonThemes/moonSequence.js";
import { twinTidepoolsTheme } from "./lessonThemes/twinTidepools.js";
import { beaconSweepTheme } from "./lessonThemes/beaconSweep.js";
import { tidelineGlossaryTheme } from "./lessonThemes/tidelineGlossary.js";
import { mosaicRuinsTheme } from "./lessonThemes/mosaicRuins.js";
import { captainsQuartersTheme } from "./lessonThemes/captainsQuarters.js";
import { graphGazerDeckTheme } from "./lessonThemes/graphGazerDeck.js";
import { dataDiveDeckTheme } from "./lessonThemes/dataDiveDeck.js";
import { fieldLogCampTheme } from "./lessonThemes/fieldLogCamp.js";
import { variableVaultPlotsTheme } from "./lessonThemes/variableVaultPlots.js";
import { theoryOrbitTheme } from "./lessonThemes/theoryOrbit.js";
import { predictionRidgeTheme } from "./lessonThemes/predictionRidge.js";
import { celestialCodexTheme } from "./lessonThemes/celestialCodex.js";
import { lanternFoliosTheme } from "./lessonThemes/lanternFolios.js";
import { starChartGalleryTheme } from "./lessonThemes/starChartGallery.js";
import { umbralArchiveTheme } from "./lessonThemes/umbralArchive.js";
import { catalogDriftTheme } from "./lessonThemes/catalogDrift.js";
import { rampartGatesTheme } from "./lessonThemes/rampartGates.js";
import { pennantWatchTheme } from "./lessonThemes/pennantWatch.js";
import { twinSentriesTheme } from "./lessonThemes/twinSentries.js";
import { turningWatchTheme } from "./lessonThemes/turningWatch.js";
import { tradeRoutesTheme } from "./lessonThemes/tradeRoutes.js";
import { pinnedNotesTheme } from "./lessonThemes/pinnedNotes.js";
import { expeditionRouteTheme } from "./lessonThemes/expeditionRoute.js";
import { rootedMeaningTheme } from "./lessonThemes/rootedMeaning.js";
import { branchBlueprintTheme } from "./lessonThemes/branchBlueprint.js";
import { windwardBoughTheme } from "./lessonThemes/windwardBough.js";
import { canopyBridgeTheme } from "./lessonThemes/canopyBridge.js";
import { topiaryTwistTheme } from "./lessonThemes/topiaryTwist.js";
import { equationScaleTheme } from "./lessonThemes/equationScale.js";
import { slopeTriangleTheme } from "./lessonThemes/slopeTriangle.js";
import { plottedLineTheme } from "./lessonThemes/plottedLine.js";
import { crossingLinesTheme } from "./lessonThemes/crossingLines.js";
import { boundaryLineTheme } from "./lessonThemes/boundaryLine.js";

export const LESSON_THEMES = {
  "en-idioms": plainsTheme,
  "en-verbalphrases": jungleTheme,
  "en-fragments": canyonTheme,
  "en-parallel": orchardTheme,
  "en-modifiers": brambleTheme,
  "en-relevance": overlookTheme,
  "en-authorintent": swampTheme,
  "en-commas": peaksTheme,
  "en-apostrophes": twinPondsTheme,
  "en-semicolons": beaconTheme,
  "en-colons": birdsongTheme,
  "en-dashes": windsweptTheme,
  "en-endpunct": stillwaterTheme,
  "en-subobjpronouns": shorelineTheme,
  "en-thatwho": sentryPassTheme,
  "en-pronounagreement": matchedPeaksTheme,
  "en-ambiguous": clearPeakTheme,
  "en-verbtense": strataPeaksTheme,
  "en-svagreement": seaStacksTheme,
  "en-comparisons": twinCliffsTheme,
  "en-wordchoice": echoBayTheme,
  "en-transitions": causewayTheme,
  "en-macrologic": vistaPeakTheme,
  "en-concision": barrensTheme,
  "en-tone": duneShiftTheme,
  "ma-linear": faultLineTheme,
  "ma-quadratics": archCrossingTheme,
  "ma-toolbox": minersCacheTheme,
  "ma-alg2": rootCavernTheme,
  "ma-finalfive": fivePeaksTheme,
  "ma-angles": pythagoreanAnchorTheme,
  "ma-circles": roundTripLoopTheme,
  "ma-trianglemastery": triangleGalleryTheme,
  "ma-polygons": shapeShifterTheme,
  "ma-linescircles": angleArcTheme,
  "ma-volume": solidGroundGeoTheme,
  "ma-coordinate": coordinateForestTheme,
  "ma-conics": graphArchitectForestTheme,
  "ma-matrixlog": gridLogForestTheme,
  "ma-trig": trigTrailheadTheme,
  "ma-exponents": powerSurgeFlatsTheme,
  "ma-stats": oddsEndsFlatsTheme,
  "ma-numbersense": numberDetectiveFlatsTheme,
  "re-mainidea": reefCrownTheme,
  "re-detail": coralMosaicTheme,
  "re-claims": driftwoodLockerTheme,
  "re-integrate": confluenceCoveTheme,
  "re-sequence": moonSequenceTheme,
  "re-compare": twinTidepoolsTheme,
  "re-causeeffect": beaconSweepTheme,
  "re-vocab": tidelineGlossaryTheme,
  "re-generalize": mosaicRuinsTheme,
  "re-voice": captainsQuartersTheme,
  "sc-datarep": graphGazerDeckTheme,
  "sc-interpret": dataDiveDeckTheme,
  "sc-research": fieldLogCampTheme,
  "sc-investigation": variableVaultPlotsTheme,
  "sc-conflicting": theoryOrbitTheme,
  "sc-evaluate": predictionRidgeTheme,
  "satrw-centralidea": celestialCodexTheme,
  "satrw-evidence-text": lanternFoliosTheme,
  "satrw-evidence-data": starChartGalleryTheme,
  "satrw-inference": umbralArchiveTheme,
  "satrw-detailsort": catalogDriftTheme,
  "satrw-boundaries": rampartGatesTheme,
  "satrw-punctuation": pennantWatchTheme,
  "satrw-agreement": twinSentriesTheme,
  "satrw-verbforms": turningWatchTheme,
  "satrw-transitions": tradeRoutesTheme,
  "satrw-rhetoricalsynth": pinnedNotesTheme,
  "satrw-organization": expeditionRouteTheme,
  "satrw-wordsincontext": rootedMeaningTheme,
  "satrw-textstructure": branchBlueprintTheme,
  "satrw-purpose": windwardBoughTheme,
  "satrw-crosstext": canopyBridgeTheme,
  "satrw-figurative": topiaryTwistTheme,
  "satmath-linear1var": equationScaleTheme,
  "satmath-linearfunc": slopeTriangleTheme,
  "satmath-linear2var": plottedLineTheme,
  "satmath-systems": crossingLinesTheme,
  "satmath-linineq": boundaryLineTheme,
};

export function renderThemedLessonPath(root, navigate, params) {
  renderLessonTerrainPath(root, navigate, params, LESSON_THEMES[params.skillId]);
}
