# QuiltClarity — Codex Differentiation Hardening Overlay Guide

**Status:** Implemented and verified 2026-08-17 as an additive overlay on the current V1  
**Purpose:** Strengthen and expose the differentiation already present in the product without redesigning the product or expanding V1 into a quilt-design suite.  
**Authority:** This guide is subordinate to the governing V1 agenda and the Golden Domain Rules. If anything here conflicts with those documents, the governing documents win.

## 0. Read this first

The current product direction remains valid.

The product is still:

> **A free, SEO-led quilting math and cutting-planning website whose core workflow is: piece list → quilt-aware yardage calculation → practical cutting optimization → shopping quantity → visual cutting plan.**

The current differentiator is **not** any one of the following by itself:

- quilting calculators;
- yardage calculation;
- cutting diagrams;
- shopping quantities;
- a collection of many quilting tools;
- free access;
- no-login access.

Competitors already provide some or all of those capabilities.

The differentiating product behavior to protect and make obvious is:

> **The user can enter an arbitrary set of piece groups for each fabric, and the planner jointly optimizes those different pieces under quilting-specific constraints into one practical cutting plan, without requiring the user to design the quilt inside the software first.**

This guide strengthens that behavior. It does **not** authorize scope expansion.

---

# 1. Governing divergence check

This work **does not require a product-agenda divergence**.

It strengthens existing locked V1 requirements:

- multi-piece planning;
- multiple fabrics;
- practical deterministic optimization;
- leftover-space reuse;
- quilting-aware rotation/orientation rules;
- visible assumptions;
- cutting instructions;
- visual cutting plans;
- optimizer trust/explainability;
- evidence-driven validation.

Do not use this work as justification to add:

- a visual quilt designer;
- arbitrary polygons/curves;
- pattern import;
- PDF/image interpretation;
- stash management;
- user accounts;
- cloud projects;
- AI;
- community features;
- a premium tier;
- dozens of new calculators merely for feature parity.

If implementation reveals that one of those is genuinely required, stop and emit the normal **DIVERGENCE FLAG** rather than silently expanding scope.

---

# 2. Main objective

The product already contains the important algorithmic wedge: **different piece groups can share the same fabric space instead of being calculated independently**.

The problem is that this advantage can remain invisible to the user. A user may simply see another yardage number and another cutting diagram.

Implement two changes:

1. **Make combined-planning value measurable and visible in the result UX.**
2. **Make mixed-piece joint optimization a hard tested product contract, not merely an optimizer intention.**

Everything else in this document supports those two changes.

---

# 3. Add a deterministic “separate-group baseline”

## 3.1 Purpose

For each fabric, calculate a comparison baseline representing the same piece groups planned **separately**, with no sharing of leftover width/space between different piece groups.

This baseline exists only to answer:

> **What did planning these pieces together materially improve compared with treating each piece group independently?**

It is not a claim about what every quilter would otherwise do, and it is not a claim about the global mathematical optimum.

## 3.2 Baseline rules

The baseline must use the **same resolved input constraints** as the actual planner:

- usable WOF;
- cut dimensions after finished-size conversion;
- piece quantity;
- rotation permission;
- directional-fabric restrictions;
- orientation constraints;
- WOF-strip designation;
- deterministic behavior.

For each piece group independently:

1. resolve the legal orientation(s);
2. produce a valid practical layout for only that group using the existing V1 packing logic where applicable;
3. record that group’s raw required fabric length;
4. sum those raw lengths across all groups belonging to the fabric.

Call the result internally something explicit such as:

`separateGroupBaselineLength`

Do **not** include safety allowance or purchase rounding in the comparison baseline. Compare raw layout length to raw layout length so the effect of joint planning is isolated from purchase policy.

## 3.3 Do not corrupt the real optimizer

The comparison baseline is diagnostic information.

Do not make the real optimizer optimize for “beating the baseline.”

The real optimizer keeps its locked priority order:

1. valid layout;
2. practical strip-based cutting;
3. low total fabric length;
4. low cutting complexity;
5. low fragmentation;
6. low waste.

A plan that saves another 1/2 inch but is materially worse to cut should not win merely so that a marketing number looks larger.

## 3.4 Comparison result model

For each fabric return enough structured information for the UI to render:

- `recommendedPlanLength`
- `separateGroupBaselineLength`
- `lengthDifference`
- `differencePercent`
- `comparisonOutcome`

Suggested `comparisonOutcome` enum:

- `combined_shorter`
- `same_length`
- `recommended_longer_for_practicality`
- `not_applicable`

`not_applicable` is appropriate when there is only one piece group or when a meaningful baseline cannot be produced under the same constraints.

Do not force the comparison to say “saved” when it did not save.

---

# 4. Result UX: expose what the optimizer accomplished

The existing result hierarchy remains:

1. shopping quantity;
2. assumptions;
3. cutting instructions;
4. visual cutting plan;
5. waste / efficiency details.

Do **not** move the new comparison above the shopping quantity. The user’s primary question remains “How much do I buy?”

Add the comparison inside the existing **Waste / efficiency details** area or immediately adjacent to it.

## 4.1 When combined planning is shorter

Render concise language conceptually equivalent to:

> **Combined planning uses 8.5\" less fabric length**  
> Recommended plan: 31.5\" · Separate piece groups: 40\"

Optional secondary percentage:

> 21% less fabric length than planning each piece group separately.

Do not call this “money saved” unless the system actually knows fabric price and purchase rounding makes that statement true.

Do not call it “minimum possible fabric.”

## 4.2 When lengths are equal

Do not manufacture a win.

Either omit the comparison from the default compact view or state neutrally:

> Combining these piece groups does not reduce fabric length for this plan.

## 4.3 When the recommended plan is longer for practicality

This is permitted by the product’s optimization philosophy.

State the tradeoff honestly, e.g.:

> The recommended plan uses 1.5\" more fabric length than the separate-group baseline because the planner prioritizes a practical cutting sequence over minimum raw length.

Only use this state if the implementation can identify that the recommended candidate won because of the existing practicality/complexity scoring. Do not invent a reason after the fact.

## 4.4 Single piece-group projects

Do not show the comparison module. There is no joint-planning advantage to demonstrate.

## 4.5 Multiple fabrics

Compute and display the comparison **per fabric**.

Do not combine inches from unrelated fabrics into a single “total fabric saved” number unless units, material identity, and purchase behavior make that aggregation semantically valid. V1 does not need such aggregation.

---

# 5. Make joint optimization a tested contract

The existing G05 fixture is important because it proves leftover filling across different piece groups:

- usable WOF: 40\"
- A: 30\" × 10\", qty 2
- B: 10\" × 10\", qty 2
- expected practical combined layout: 20\"
- a separated 30\" result is valid but inferior.

Keep G05 unchanged.

Add new fixtures after the existing authoritative fixtures. Do not renumber old fixtures.

## D01 — Three-group exact leftover filling

Input:

- usable WOF: 40\"
- A: 25\" × 10\", qty 2
- B: 10\" × 10\", qty 2
- C: 5\" × 10\", qty 2
- rotation disabled
- safety: 0%

Expected recommended combined layout:

- 2 rows;
- each row contains 1 × A + 1 × B + 1 × C;
- row width = 40\";
- recommended plan length = 20\".

Expected separate-group baseline:

- A alone = 20\";
- B alone = 10\";
- C alone = 10\";
- separate-group baseline length = 40\";
- combined difference = 20\" shorter;
- comparison outcome = `combined_shorter`.

This fixture verifies that the core benefit scales beyond a two-group toy case.

## D02 — No fake savings when groups already pack efficiently

Input:

- usable WOF: 40\"
- A: 20\" × 10\", qty 4
- B: 20\" × 10\", qty 4
- rotation disabled
- safety: 0%

Expected:

- valid recommended plan;
- joint planning must not claim savings unless its raw length is actually below the separately computed baseline;
- `lengthDifference` must equal the arithmetic difference between the two real lengths;
- no positive “saved” copy is allowed when the difference is zero.

The exact candidate arrangement may follow the existing deterministic optimizer, but the comparison arithmetic and messaging state are strict.

## D03 — Directional constraint survives joint optimization

Create a mixed-piece fixture in which rotating one group would reduce combined length, then mark that fabric/group directional or non-rotatable under the existing domain model.

Required properties:

- forbidden rotation never occurs;
- combined planner does not cheat to create a savings result;
- baseline and recommended plan use identical orientation constraints;
- comparison remains mathematically truthful.

Choose simple dimensions with a manually verifiable expected layout and add the exact expected geometry to the fixture before merging.

## D04 — WOF strips coexist with ordinary rectangles

Create a fixture containing:

- at least one `isWofStrip` group;
- at least two ordinary rectangular groups;
- at least one legal leftover-filling opportunity.

Required properties:

- WOF strips retain their locked cross-width semantics;
- ordinary pieces may use compatible remaining regions only if the resulting instructions remain physically executable under the existing V1 cutting model;
- the optimizer must not rotate WOF strips into lengthwise strips automatically;
- comparison baseline uses the same WOF semantics.

If the current planner architecture intentionally reserves whole WOF strips and therefore does not allow same-row subpacking around them, preserve that behavior and encode the fixture accordingly. This guide does not invent a new quilting construction rule.

## D05 — Multiple fabrics are compared independently

Input:

- at least two fabrics;
- Fabric A has multiple groups with a real joint-planning saving;
- Fabric B has one group or multiple groups with zero saving.

Expected:

- two independent comparison results;
- Fabric A may show positive combined-planning benefit;
- Fabric B must not inherit or display Fabric A’s savings;
- no cross-fabric packing or aggregation.

---

# 6. Add property/invariant tests

In addition to exact fixtures, add these properties:

1. For any comparison result, both compared plans must obey the same resolved fabric/piece constraints.
2. `lengthDifference = separateGroupBaselineLength - recommendedPlanLength` within the project’s numeric tolerance.
3. Positive “saved” UI is impossible unless `lengthDifference > 0`.
4. A single piece group yields `not_applicable` rather than invented savings.
5. Multiple fabrics never share baseline or savings state.
6. Comparison calculation does not alter the selected recommended layout.
7. Same input produces the same baseline and the same comparison result.
8. Safety allowance and purchase rounding do not alter the raw comparison arithmetic.
9. Forbidden rotation can never appear in either the recommended plan or its baseline.
10. No comparison copy may imply mathematically proven global optimality.

---

# 7. Strengthen the optimizer benchmark, not the V1 feature count

Before deployment, keep the existing competitor benchmark and add these explicit questions:

1. Can the competitor start from an **arbitrary user-entered piece list**, or must the user first construct/design a quilt/pattern inside its ecosystem?
2. Can different piece groups from the same fabric be **jointly packed into shared fabric space**?
3. Does it exploit leftover width/regions across groups?
4. Can the user specify multiple fabrics independently?
5. Are rotation, direction, usable WOF, finished-vs-cut sizing, and other relevant assumptions visible rather than hidden?
6. Does the result show an executable cutting sequence as well as geometry?
7. Can the user understand what the optimization improved?
8. Is the relevant workflow fully free, partly free, trial-based, one-time paid, or subscription-gated?
9. Is login/account creation required for the relevant workflow?
10. Is the workflow design-first, pattern-first, or piece-list-first?

The benchmark question becomes:

> **Is our arbitrary-piece, joint-planning workflow noticeably easier, more transparent, and more useful for someone who already knows the pieces they need?**

Do not benchmark V1 by counting total features or total calculators.

---

# 8. Minimal positioning changes

Do not replace the current broad positioning or homepage hierarchy merely for novelty.

Keep the existing concrete promise around knowing what fabric to buy and how to cut it.

Add one short mechanism-level line in the planner/homepage context so users understand why this is not just a collection of independent calculators.

Preferred concept:

> **Plan all the pieces from each fabric together—not one piece calculation at a time.**

Equivalent wording is acceptable if it is clearer in the existing visual system.

Do not claim:

- “the only quilt cutting optimizer”;
- “guaranteed minimum fabric”;
- “unique cutting diagrams”;
- “no other tool does this”;
- “completely free unlike every competitor.”

Those claims are either too strong or not necessary.

---

# 9. Update the existing SEO/content layer only where relevant

Do not create a large new content cluster for this change.

Update the Fabric Cutting Planner page and any directly supporting copy to make these concepts legible:

- multiple different piece groups can be planned together;
- the planner may reuse otherwise wasted space between groups;
- quilting constraints still apply;
- the result is a practical optimized plan, not a globally proven mathematical optimum;
- the user can inspect assumptions;
- the user does not need to create a full digital quilt design first.

The standalone calculators remain useful SEO entry points and should continue to funnel complex multi-piece jobs into the planner.

Do not turn basic calculator pages into thin advertisements for the planner.

---

# 10. Analytics: validate the differentiator without collecting project content

Extend the existing `optimization_completed` analytics event with coarse, non-identifying properties if the analytics adapter supports properties cleanly.

Recommended properties:

- `comparison_outcome`: `combined_shorter | same_length | recommended_longer_for_practicality | not_applicable`
- `savings_band`: `none | under_5_percent | 5_to_10_percent | 10_to_20_percent | over_20_percent`

Do not send:

- piece dimensions;
- fabric names;
- project names;
- free-text labels/notes;
- exact cutting geometry;
- exact monetary value.

Purpose:

After launch, we should be able to answer whether joint optimization produces a material advantage often enough to deserve stronger product/SEO emphasis.

If the current analytics architecture intentionally avoids event properties, do not add a new analytics dependency just for this. Record the limitation and keep the product change.

---

# 11. UX safeguards

The new efficiency comparison is secondary information.

Do not:

- add another mandatory input;
- make first-use UX more complex;
- make users understand bin packing;
- add optimizer jargon;
- make users choose an “optimization strategy”;
- hide the main shopping quantity below technical metrics;
- introduce a dashboard-like result screen.

The current UX principle remains:

> **Math should disappear; assumptions should not.**

And the new comparison should feel like a useful explanation of the result, not an engineering diagnostic panel.

---

# 12. Implementation sequence

1. Read the governing V1 agenda and Golden Domain Rules before touching code.
2. Locate the current planner domain result model and optimizer result model.
3. Add the separate-group baseline as a pure deterministic calculation.
4. Add comparison fields without changing existing optimizer candidate selection.
5. Add unit/property tests for baseline arithmetic.
6. Add D01–D05 or equivalent exact fixtures consistent with the existing diagnostic-test format.
7. Add the comparison presentation to existing waste/efficiency details.
8. Add minimal positioning copy around joint planning.
9. Extend the pre-deployment competitor benchmark questions.
10. Add coarse analytics properties only if they fit the existing adapter cleanly.
11. Run the complete existing test suite plus all new tests.
12. Manually verify print layout and mobile result layout.
13. Benchmark the finished planner against the named competitors before deployment.

---

# 13. Acceptance criteria for this overlay

This overlay is complete only when all of the following are true:

- [x] Existing V1 behavior and all existing golden fixtures still pass.
- [x] The planner still accepts multiple fabrics and multiple piece groups.
- [x] The recommended layout is still selected by the existing practical-optimization philosophy.
- [x] A deterministic separate-group baseline exists per fabric.
- [x] Comparison arithmetic is test-backed.
- [x] Positive savings language appears only for a real positive raw-length difference.
- [x] G05 still demonstrates leftover filling.
- [x] At least one new 3-group fixture demonstrates material joint-planning benefit.
- [x] Directional/rotation constraints are proven in a mixed-group fixture.
- [x] Multiple fabrics keep comparison state independent.
- [x] The result UX makes meaningful combined-planning benefit visible without displacing the shopping result.
- [x] The UI does not imply global mathematical optimality.
- [x] The planner/homepage communicates that piece groups are planned together.
- [x] No account/backend/AI/new paid dependency has been introduced.
- [x] No quilt-designer/stash/pattern-import scope has been absorbed.
- [x] Full regression suite passes.
- [x] Pre-deployment competitor benchmark explicitly evaluates arbitrary piece-list and joint-packing behavior.

---

# 14. What Codex must report back

Return a concise implementation report containing:

1. files changed;
2. data-model changes;
3. baseline algorithm used;
4. new fixtures/tests added and exact results;
5. UI copy/placement changes;
6. analytics changes, if any;
7. full test-suite result;
8. any discovered conflict with the Golden Domain Rules;
9. any divergence flag triggered;
10. competitor benchmark findings for the finished implementation.

If any requested change would weaken practical cutting behavior merely to increase the displayed “savings” number, **do not do it**. Flag the conflict instead.

---

# 15. Current-state handoff

Current strategic decision after competitor re-check:

- Do **not** redesign the product.
- Do **not** chase feature-count parity with larger quilt-design products.
- Preserve the piece-list-first product center.
- Treat standalone calculators as correct, useful SEO entry points rather than the moat.
- Treat **joint practical optimization of different piece groups from the same fabric** as the primary algorithmic differentiator to prove and expose.
- Treat visible/editable assumptions and executable cutting instructions as supporting trust differentiators.
- Free/no-login access remains valuable friction reduction, but must not be treated as uniquely differentiating on its own.

Next decision gate after implementation:

> Benchmark the finished V1 against the closest current products and ask whether a user who already knows their required pieces gets a noticeably easier, more transparent, and more materially efficient path from piece list to purchase quantity and cutting table.
