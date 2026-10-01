# QuiltClarity V1.1 — Manual Test Plan

**Status:** Mandatory human-readable acceptance suite  
**Revision date:** 2026-08-21

# 1. Requirement

Codex must add this manual-test suite to the actual repository.

Preferred location if no repository convention already exists:

`docs/manual-tests/V1_1_MANUAL_TESTS.md`

If the repository already has a manual-test directory/file convention, use it instead and preserve the test IDs below.

This document is not replaced by automated tests.

Codex should execute technical/browser checks where its tools permit and record:

- `PASS`
- `FAIL`
- `BLOCKED`
- `OWNER REQUIRED`

with notes/evidence.

Do **not** mark genuine target-user usability studies as PASS using simulated behavior.

# 2. Repository manual-test record format

Each test in the repository must have:

```text
ID:
Area:
Route:
Viewport/device:
Preconditions:
Steps:
Expected:
Status:
Evidence/notes:
Last checked commit/build:
```

# 3. Test environments

At minimum:

- desktop Chromium current;
- one additional desktop browser if available;
- mobile-width/touch-emulation;
- keyboard-only path;
- print preview/PDF;
- production-like build, not dev-only behavior.

Where a real iOS/Safari/Android test is unavailable, mark the gap honestly.

# 4. Guides / novice learning

## MT-G01 — Guides hub communicates the learning system

Route: `/guides`

Steps:

1. Open as a first-time visitor.
2. Inspect above-the-fold and main categories.

Expected:

- obvious **Start Here / Learn QuiltClarity** path;
- Quick Start prominent;
- Full Project Planner Tutorial discoverable;
- Common Workflows separated;
- Quilting Reference separated;
- page does not look like an undifferentiated blog archive.

## MT-G02 — Quick Start works from zero

Route: `/guides/getting-started`

Steps:

1. Follow the guide without consulting another source.
2. Open planner when instructed.
3. Complete the worked example.

Expected:

- user can create project;
- enter fabric/cuts;
- calculate;
- identify Buy now;
- locate cutting plan;
- no required field appears unexplained.

Technical execution may validate links/flow. Final comprehension PASS also
depends on the owner-operated MT-U01/MT-U02 run; automation alone cannot pass it.

## MT-G03 — Full tutorial follows product order

Route: `/guides/project-planner-tutorial`

Expected order matches real planner sequence from project setup through print.
No important UI section is taught before prerequisites without explanation.

## MT-G04 — Full tutorial is field-by-field

Verify all important planner fields/settings have:

- meaning;
- what to enter;
- default where relevant;
- consequence;
- example where useful.

## MT-G05 — Full tutorial is result-by-result

Verify explanation of:

- Pattern says;
- Fresh-fabric plan;
- Buy now;
- stock allocation;
- purchased layout;
- cutting plan;
- safety/rounding.

## MT-G06 — Previous/Next flow

Starting at Quick Start, follow sequential Previous/Next controls.

Expected:

- logical progression;
- no dead end;
- Back to Guides works;
- normal browser Back works.

## MT-G07 — Search-entry independence

Open a deep tutorial/workflow/reference URL directly.

Expected:

- page makes sense without prior context;
- relevant tool CTA exists;
- user can identify next action.

# 5. Contextual help — planner

## MT-H01 — Usable WOF help

Open `Help: Usable WOF`.

Expected:

- concise definition;
- explains why it can be below nominal width;
- Learn more links exactly to `project-planner-tutorial#usable-wof` or authoritative reference;
- no contradictory default.

## MT-H02 — Cut vs Finished help

Expected:

- clearly distinguishes entered cut size from finished size;
- explains seam allowance consequence;
- exact guide link works.

## MT-H03 — Purchase safety help

Expected:

- says safety applies to new purchases;
- does not imply owned stock grows;
- if stock fully covers project, no nonzero purchase is invented.

## MT-H04 — Pattern says help

Expected:

- explains external reference;
- does not imply pattern error;
- links to exact guide section.

## MT-H05 — Fresh-fabric plan help

Expected:

- explains hypothetical all-new-fabric scenario;
- does not conflate with Buy now.

## MT-H06 — Buy now help

Expected:

- explains shortfall after owned-stock allocation;
- user can distinguish it from pattern/fresh-plan amounts.

## MT-H07 — Practical optimization help

Expected:

- says practical/deterministic;
- does not claim global optimum/minimum.

## MT-H08 — Stock preset help/editability

Add a fat quarter preset.

Expected:

- dimensions visible/editable;
- help explains preset is convenience;
- edited geometry is used.

# 6. Contextual help interaction/accessibility

## MT-A01 — Mouse/touch

Open help with mouse click and touch/emulation.

Expected:

- both work;
- hover is not required.

## MT-A02 — Keyboard

Tab to help button; activate by keyboard.

Expected:

- visible focus;
- opens;
- content readable;
- Escape/specified close closes;
- focus returns sensibly.

## MT-A03 — Accessible names

Inspect important help controls.

Expected:

- specific names like `Help: Usable WOF`;
- not eleven indistinguishable buttons all announced only as “question mark.”

## MT-A04 — Mobile fit

At narrow viewport open help near:

- top;
- middle;
- right edge;
- bottom/result area.

Expected:

- no off-screen unreadable popover;
- no blocked control;
- user can close it.

## MT-A05 — No essential hover-only information

Review all correctness-critical warnings.

Expected:

- core warning/instruction visible outside hover-only help.

## MT-A06 — Deep-link anchor visibility

Open exact tutorial anchors.

Expected:

- correct heading/content visible;
- sticky header does not hide target.

# 7. State preservation

## MT-S01 — Planner state survives Learn more

1. Enter project data.
2. Open contextual help.
3. Navigate via Learn more to a Guide.
4. Return to planner.

Expected:

- valid entered project state remains;
- no silent row/fabric loss.

## MT-S02 — Browser refresh persistence

Enter a valid project and refresh.

Expected:

- behavior matches current local-persistence spec;
- Guide/help implementation did not break migration/persistence.

# 8. Cut-list compiler

## MT-P01 — 20-row desktop entry

Enter at least 20 cut-list rows using keyboard.

Expected:

- usable without opening 20 isolated dialogs;
- tab order sensible;
- duplicate/add/delete paths work.

## MT-P02 — Paste workflow

Paste tabular cut list.

Expected:

- preview;
- malformed cells flagged;
- unmapped fabric requires resolution;
- confirm imports correctly.

## MT-P03 — Mobile cut-list editing

At mobile width add/edit/duplicate rows.

Expected:

- no required horizontal-only interaction;
- labels remain clear.

# 9. Project results

## MT-R01 — Stock fully covers project

Use a Golden-equivalent finite-stock case.

Expected:

- No additional purchase;
- safety note correct;
- allocations visible.

## MT-R02 — Stock + shortfall

Use a case where stock covers only part.

Expected:

- correct stock allocations;
- Buy now generated;
- fresh-fabric plan remains separate.

## MT-R03 — Pattern + stock + buy-now

Enter pattern amount and stock.

Expected three concepts remain visibly distinct:

- Pattern says;
- Fresh-fabric plan;
- Buy now.

## MT-R04 — Directional fabric

Expected:

- no illegal rotation;
- contextual help explains constraint.

## MT-R05 — Cutting diagram/instructions agree

Compare visible placements with prose instructions.

Expected:

- no contradictory independent layout.

# 10. Calculator pages + contextual education

## MT-C01 — Fabric Yardage

Verify important input/result help and Learn more links.

## MT-C02 — Backing

Verify:

- overage help;
- usable width;
- join SA;
- lowest-yardage wording;
- no unconditional “recommended.”

## MT-C03 — Batting

Verify:

- overage is editable;
- roll-width behavior;
- no pieced-batting claim;
- contextual explanation.

## MT-C04 — Binding

Verify method scope and important assumptions visible/helped.

## MT-C05 — HST

Verify:

- Trim-friendly / Standard;
- no stale “Exact” option;
- batch/result explanation.

## MT-C06 — QST

Same requirements; scope clear.

## MT-C07 — Flying Geese

Verify:

- 2:1 scope;
- method;
- sizing mode;
- yield;
- no false no-waste claim for trim-friendly.

## MT-C08 — Block Count

Verify input/result meaning sufficient for direct search visitor.

## MT-C09 — Borders

Verify scope assumptions and joined-WOF behavior explanation.

## MT-C10 — Sashing

Verify no-cornerstones/no-outer-sashing scope where relevant.

## MT-C11 — Pieces from Fabric

Verify:

- stock dimensions;
- fit/yield modes;
- directionality;
- visual layout;
- contextual help.

# 11. Guide/tool consistency

## MT-X01 — Terminology consistency

Search app + guides for:

- Usable WOF
- Standard
- Trim-friendly
- Pattern says
- Fresh-fabric plan
- Buy now
- Uses least fabric / Lowest-yardage option

Expected:

- no stale/conflicting naming.

## MT-X02 — Help registry links are live

Exercise every registered Learn more URL.

Expected:

- no 404;
- correct topic;
- exact anchor where intended.

## MT-X03 — Guide UI names match actual UI

Full tutorial screenshots/text/labels must match current controls.

If UI label changed, tutorial must not retain old label.

# 12. Print

## MT-PR01 — Project print

Expected:

- no nav/ads/edit controls;
- shopping + comparisons + allocations + cutting plan + assumptions visible;
- grayscale understandable.

## MT-PR02 — Guide print/readability

At least Quick Start and Full Tutorial should remain readable when printed/saved to PDF; interactive help controls may be omitted but linked concepts remain understandable.

# 13. SEO/content routing

## MT-SEO01 — Guide routes resolve

All locked guide URLs return correct content and canonical.

## MT-SEO02 — Guide hub links are crawlable

Important guide links are normal anchors in source-rendered HTML.

## MT-SEO03 — No field-page explosion

Confirm no indexable route was created merely for every tooltip/help key.

## MT-SEO04 — Tool content pre-renders

Core explanation/assumptions/guide links exist before hydration.

# 14. Responsive / browser smoke

## MT-B01 — Desktop planner

No layout regression caused by help buttons/popovers.

## MT-B02 — Mobile planner

No overlap/off-screen issue.

## MT-B03 — Calculator grid/pages

Help controls do not cause label wrapping that obscures inputs.

## MT-B04 — Guides mobile

TOC, Previous/Next and anchors usable without giant sticky sidebar.

# 15. Owner-required usability tests

These are not passable by Codex simulation. The product owner executes them
using the recorded clean-state fixture and prompts.

## MT-U01 — Owner from-zero self-teaching

Owner starts from a clean browser state and receives no verbal product tutorial.

Prompt:

> “Use only the site’s Guides and contextual help to learn enough to plan this
> sample quilt project.”

PASS target is governed by `05_ANALYTICS_VALIDATION.md`. Record the exact path,
confusion, assistance, and final result. Any hint makes the run `ASSISTED` and
requires a product correction plus a clean rerun before PASS.

Observe:

- starting-guide discovery;
- comprehension;
- successful planner completion;
- help recovery.

Status after Codex implementation:
`OWNER REQUIRED` until the owner performs the run.

## MT-U02 — Result comprehension

Without coaching, ask the owner:

- What does the pattern say?
- What would the cuts require if buying new?
- What do you need to buy now?
- Where do you see how to cut it?

Status:
`OWNER REQUIRED` until the owner performs the run. Record `PASS`, `FAIL`, or
`ASSISTED` afterward. This result is owner acceptance, not independent novice or
target-quilter evidence.

# 16. Completion rule

Codex may report implementation complete only when:

- repository manual-test file exists;
- technical manual tests are executed and recorded;
- failures are fixed or explicitly blocking;
- owner-required cases remain clearly marked until the owner executes them;
- automated tests/G01–G45 remain green;
- no manual-test change silently weakens a Golden/domain rule.

A blanket statement such as “manual tests look good” is insufficient.
