# Quilt Utility Website — Codex Technical Handoff

**Purpose:** FINAL V1 implementation brief — Astro/static architecture  
**Sources of truth, in priority order:**
1. `quilt_golden_rules_and_test_fixtures.md`
2. `quilt_product_spec_v1_final.md`

The quilting-domain ambiguity pass is complete for V1. Do not reinterpret the locked rules. If implementation uncovers a true contradiction not covered by the golden rules, flag it rather than inventing behavior.

# 1. Objective

Implement:

> **Piece list → yardage → practical optimized cutting plan → visual layout → shopping quantity**

Supporting calculators should use shared domain/calculation primitives wherever possible.

# 2. Locked V1 Stack

- **Astro** — static-first site framework
- **TypeScript** — all domain, calculation, and optimizer logic
- **vanilla browser TypeScript** — preferred for simple calculator interactions
- **React** — permitted only for the Fabric Cutting Planner if its stateful UI materially benefits; use one cohesive island rather than hydrating the whole site
- **SVG** — cutting-plan visualization
- **localStorage** — V1 persistence
- static Astro output for SEO/content pages
- no application backend
- no database
- no authentication
- no AI
- no paid APIs

Keep all authoritative quilting/domain logic framework-agnostic.

## Architecture intent

Astro is chosen because this is primarily an SEO/content website with bounded interactive utilities.

Rules:
- do not turn the site into a client-rendered SPA;
- do not hydrate static content;
- do not use React for a simple calculator merely for consistency;
- the complex planner may be a React island if justified by UI/state complexity;
- calculations and optimization always run locally in the browser;
- V1 must remain deployable as a static site.

# 3. Suggested Astro Structure

```text
src/
  lib/
    domain/
      units/
      fabric/
      pieces/
      seam/
      backing/
      binding/
      hst/
      borders/
      sashing/
      blocks/

    optimizer/
      normalize.ts
      constraints.ts
      candidates.ts
      pack.ts
      score.ts
      explain.ts

    calculators/
      fabric-yardage/
      backing/
      binding/
      hst/
      block-count/
      borders/
      sashing/

  components/
    calculators/
      *.astro
      client/
        *.ts
    planner/
      Planner.tsx        # only if React is justified
      cutting-diagram/
      print/

  pages/
    index.astro
    fabric-cutting-planner.astro
    calculators/
      fabric-yardage.astro
      quilt-backing.astro
      quilt-binding.astro
      half-square-triangle.astro
      quilt-block-count.astro
      borders.astro
      sashing.astro
    guides/
      width-of-fabric.astro
      finished-vs-cut-size.astro
      quilt-seam-allowance.astro
      backing-overage.astro
      how-to-calculate-quilt-yardage.astro

  analytics/
```

No Astro/React/UI component owns authoritative quilting formulas.

Simple calculators should progressively enhance static Astro pages with minimal client TypeScript.

If the planner uses React, keep it as one cohesive interactive island and keep SEO copy/content outside the island as static Astro HTML.

# 4. Core Types

```ts
type UnitSystem = "imperial" | "metric";
type DimensionMode = "cut" | "finished";
type OrientationConstraint = "none" | "crosswise" | "lengthwise";

interface FabricSpec {
  id: string;
  name: string;
  fabricWidth: number;
  usableWidth: number;
  directional: boolean;
  defaultRotationAllowed: boolean;
  safetyAllowancePercent: number;
  purchaseIncrement: number;
  notes?: string;
}

interface PieceGroup {
  id: string;
  label: string;
  quantity: number;
  width: number;
  height: number;
  dimensionMode: DimensionMode;
  rotationAllowed?: boolean;
  orientationConstraint?: OrientationConstraint;
  isWofStrip?: boolean;
  notes?: string;
}

interface PlannerProject {
  unitSystem: UnitSystem;
  seamAllowance: number;
  fabrics: Array<{
    fabric: FabricSpec;
    pieces: PieceGroup[];
  }>;
}
```

Semantics matter more than exact code shape.

# 5. Internal Units

Use one canonical internal unit; millimetres as integer/fixed precision is recommended.

Avoid floating-point equality problems with fractional inches.

Conversions:
- 1 in = 25.4 mm
- 1 yd = 914.4 mm
- 1 m = 1000 mm

UI may format imperial values as common fractions.

# 6. Normalization

Convert all piece groups into explicit cut dimensions before optimization.

If finished:

`cutWidth = finishedWidth + 2 * seamAllowance`

`cutHeight = finishedHeight + 2 * seamAllowance`

The optimizer should never care whether the source was finished or cut size.

# 7. Constraint Resolution

Effective rotation:

```text
piece.rotationAllowed ?? fabric.defaultRotationAllowed
```

Directional fabric should default to no rotation unless explicitly permitted under a compatible orientation rule.

Never violate an orientation constraint to improve score.

# 8. Optimizer Contract

Conceptually:

```ts
optimizeFabric(
  fabric: FabricSpec,
  pieces: NormalizedPieceGroup[]
): FabricOptimizationResult
```

Result:

```ts
interface FabricOptimizationResult {
  usedLength: number;
  wasteArea: number;
  candidateScore: number;
  placements: Placement[];
  cutInstructions: CutInstruction[];
  warnings: Warning[];
}
```

# 9. Placement Model

```ts
interface Placement {
  pieceGroupId: string;
  instanceIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}
```

The visualizer must render these placements directly. Do not implement a second layout engine in the UI.

# 10. Candidate Algorithm

Minimum deterministic strategies:

1. constrained-first
2. area-descending
3. width-descending
4. height-descending
5. quantity-descending
6. strip-friendly-first

For each:

1. normalize/group pieces;
2. create strip/row candidates;
3. test legal rotations;
4. pack smaller legal pieces into available row remainder;
5. compute used length;
6. compute waste;
7. compute cut complexity;
8. score.

Same input must produce the same output.

# 11. Score

Conceptual form:

```text
score =
  A * normalizedUsedLength +
  B * normalizedWaste +
  C * cutComplexity +
  D * fragmentation
```

Invalid candidates are discarded.

Weights must be configurable so practical behavior can be tuned without rewriting the packing algorithm.

# 12. Cut Complexity

Possible penalties:
- number of unique strip widths
- number of partial rows
- non-strip placements
- number of rotations
- isolated leftover placements

Do not over-engineer V1. The purpose is simply to avoid grotesque jigsaw layouts that save negligible fabric.

# 13. Purchase Calculation

```text
planLength = optimizer.usedLength
buffered = planLength * (1 + safetyAllowancePercent / 100)
recommended = ceilToIncrement(buffered, purchaseIncrement)
```

Never nearest-round purchase quantity.

# 14. Backing Calculator

Use simpler domain math rather than forcing generic rectangle packing.

Inputs:
- quilt width/length
- backing fabric width
- overage per side
- directional state

Generate viable vertical/horizontal panel configurations where relevant.

Return:
- target backing dimensions
- every valid candidate with panel count, seam orientation, required length, and yardage
- the lowest-yardage candidate labeled “Uses least fabric” or “Lowest-yardage option”
- warnings

Longarm-oriented default: 4 in per side, editable. State that requirements vary and users should confirm with their quilter. Seam-orientation guidance must mention print direction, quilting setup, and confirming a professional longarmer's preferences.

# 15. Binding Calculator

V1 straight-grain only.

```text
perimeter = 2 * (width + length)
requiredBindingLength = perimeter + joiningAllowance
strips = ceil(requiredBindingLength / usableWof)
fabricLength = strips * stripWidth
```

Joining allowance must be configurable.

# 16. HST Calculator

Model methods separately:

```ts
type HstMethod = "two-at-a-time" | "four-at-a-time" | "eight-at-a-time";
```

Each strategy owns:
- starting-square formula
- yield
- quantity rounding

Trim-friendly allowance is separate from the base method formula.

For 4-at-a-time, use `U = finished + 1/2"`, `S_geometric = U × √2 + 2SA`, Standard = upward quarter-inch rounding, and Trim-friendly = Standard + 1/4". User-facing sizing labels are Standard and Trim-friendly.

# 17. Block Count

Return:
- whole blocks across/down
- total block count
- resulting quilt size

Do not silently create partial blocks.

# 18. Border Calculator

Implement exactly from the Golden Domain Rules.

V1 scope:
- rectangular tops
- straight, non-mitered borders
- equal-width repeated layers
- cross-grain WOF strips
- side borders first, then top/bottom

Expose:
- cut border width
- per-layer nominal lengths
- required joined length, join loss, and effective joined capacity
- WOF strip count
- planning yardage
- final quilt dimensions
- final-measurement warning using the assembled quilt top through the center in multiple places

Do not invent mitered-border behavior.

# 19. Sashing Calculator

Implement exactly from the Golden Domain Rules.

V1 scope:
- row-wise assembly
- no cornerstones
- no outer sashing

Expose:
- short vertical-piece count/cut size
- horizontal-row count/cut length
- required joined strip-length demand, join loss, and effective joined capacity
- WOF strip count
- yardage
- final quilt dimensions
- warning when horizontal sashing must be pieced

Do not infer cornerstone or outer-sashing behavior.

Borders and sashing must share one joined-WOF capacity primitive. With usable width `U`, join seam allowance `JSA`, linear requirement `L`, and handling buffer `H`, choose the smallest `n` satisfying `nU - (n - 1) × 2JSA >= L + H`. Defaults are `JSA = 1/4"` and `H = 10"`.

# 20. SVG Cutting Diagram

Requirements:
- use optimizer placements directly
- fabric width horizontal
- fabric length vertical
- optional usable-width/selvage indication
- piece groups distinguishable without color alone
- labels/dimensions
- direction arrow
- print safe

Dense layouts may abbreviate repeated labels, but the cutting list remains complete.

# 21. Explanation Data

Calculation functions should expose intermediate values, not just final numbers.

Example:

```ts
interface YardageExplanation {
  piecesPerRow: number;
  rowsRequired: number;
  rawLength: number;
  safetyPercent: number;
  bufferedLength: number;
  purchaseIncrement: number;
  recommendedLength: number;
}
```

Do not reconstruct formulas in presentation code.

# 22. Errors vs Warnings

Errors block results:
- impossible dimensions
- unusable fabric width
- piece cannot fit in any legal orientation

Warnings allow results:
- directional fabric increases yardage
- zero safety margin
- longarmer requirement should be verified
- optimizer is practical/heuristic rather than globally proven optimal

# 23. localStorage

Persist project state with a schema version.

```ts
{
  schemaVersion: 1,
  project: ...
}
```

Migrate or safely discard incompatible state after breaking changes.

# 24. Testing

Required unit tests:
- unit conversions
- fraction formatting
- finished→cut conversion
- purchase rounding
- validation
- standalone calculators
- orientation constraints
- scoring
- deterministic selection

Useful invariants:
- no placements overlap
- placements stay within usable width
- requested instances placed exactly once
- non-rotatable pieces never rotate
- recommended purchase >= buffered requirement
- same input → same output
- joined-strip count is adequate and one fewer strip is insufficient
- user-facing heuristic copy does not claim a proven minimum

# 25. Manual Test Fixtures

Before production include at least:

1. identical squares
2. rectangles exactly filling WOF
3. rotation-saving case
4. directional no-rotation case
5. mixed square + rectangle case
6. near-WOF-width piece
7. impossible piece
8. finished-size conversion
9. zero safety
10. 5% safety + 1/8-yard rounding
11. longarm backing example
12. binding example
13. one HST fixture per method
14. metric equivalent

Compare optimizer output against hand-worked practical plans, not merely mathematical validity.

# 26. SEO

Calculator routes must render useful indexable content before hydration.

Each page requires:
- title
- description
- canonical
- static explanatory content
- internal links

Do not mass-generate arbitrary numeric pages.

# 27. Analytics

Events:
- calculator_started
- calculator_completed
- planner_started
- fabric_added
- piece_added
- optimization_completed
- diagram_viewed
- advanced_settings_opened
- print_result
- share_result
- add_to_planner

Do not transmit user project names, notes, or unnecessary free-text content.

# 28. Performance Guardrails

Define caps for:
- total piece instances
- candidate strategies
- optional backtracking depth

If inputs exceed safe workload:
- warn
- use simpler/grouped heuristic
- never freeze the browser

# 29. Accessibility

- semantic forms
- keyboard navigation
- associated labels
- field-specific errors
- textual equivalent for diagram
- no color-only meaning
- print-friendly CSS

# 30. Definition of Done

Technical V1 is done when:
- product-spec acceptance criteria pass
- formulas have unit coverage
- optimizer passes invariants
- diagram matches actual placements
- print works
- no application backend/API exists in V1
- calculator pages render useful static content
- analytics works without project-data leakage

# 31. Explicit Non-Goals

Do not implement unless the product spec is revised:
- accounts
- backend/database/auth of any kind
- paid tier
- full quilt designer
- image/PDF ingestion
- arbitrary polygon optimizer
- AI
- pattern generation
- stash inventory
- community

# 32. Escalation Rule

If implementation exposes a quilting-domain ambiguity, record:

```text
OPEN DOMAIN QUESTION:
- context
- competing interpretations
- affected calculation
- proposed options
```

Return it for product/domain resolution. Do not invent quilting conventions inside the engineering layer.


---

# 33. Final Domain-Lock Requirements

Before implementation begins, load and treat `quilt_golden_rules_and_test_fixtures.md` as executable product law.

The following are no longer open questions:

- nominal vs usable WOF;
- finished-to-cut conversion;
- default seam allowance;
- directional rotation behavior;
- safety-buffer ordering;
- purchase rounding;
- generic backing overage;
- backing panel join seam allowance;
- backing orientation comparison;
- straight-grain binding formula;
- HST 2/4/8 method formulas and yields;
- 4-at-a-time HST quarter-inch upward rounding;
- HST trim-friendly defaults;
- block-count rounding;
- straight-border planning logic;
- row-wise sashing logic;
- optimizer validity invariants;
- practical-vs-global-optimality policy.

Implement the G01–G17 fixtures as automated tests.

A build is not domain-correct until those fixtures and the required property tests pass.

Engineering may choose implementation mechanisms, but not alter the behavioral outputs specified by the golden contract.


# 34. Expanded Golden Fixture Requirements

In addition to the existing G01–G17 fixtures in `quilt_golden_rules_and_test_fixtures.md`, implementation must add and pass the following supplementary fixtures before V1 is considered complete.

## G18 — Multi-piece mixed packing

Input:
- usable WOF: 40"
- A: 20" × 10", qty 2
- B: 10" × 10", qty 4
- rotation disabled
- safety: 0%

Expected:
- practical arrangement should fill two 40" × 10" rows
- each row: one A + two B
- total used length = 20"

Purpose:
- verifies mixed-group leftover filling.

## G19 — Multi-fabric independence

Input:
- Fabric A: usable WOF 40", pieces 8 × 5" × 5"
- Fabric B: usable WOF 40", pieces 4 × 10" × 10"
- safety: 0%

Expected:
- Fabric A and Fabric B optimized independently
- no cross-fabric packing
- shopping result returned separately per fabric

Purpose:
- verifies project-level aggregation without contaminating fabric-level optimization.

## G20 — Purchase-rounding boundary

Input:
- buffered requirement = 36.01"
- imperial purchase increment = 1/8 yd = 4.5"

Expected:
- recommended purchase = 40.5" = 1.125 yd
- must not round to 36"

Purpose:
- verifies strict upward rounding.

## G21 — Exact purchase increment

Input:
- buffered requirement = 36"
- imperial purchase increment = 1/8 yd

Expected:
- recommended purchase = 36" = 1 yd

Purpose:
- verifies exact multiples are preserved.

## G22 — Narrow usable width

Input:
- nominal width: 42"
- usable width: 36"
- piece: 9" × 9", qty 8
- safety: 0%

Expected:
- packing uses 36", not 42"
- 4 pieces per row
- 2 rows
- used length = 18"

Purpose:
- verifies usable width is authoritative.

## G23 — Directional backing restriction

Input:
- quilt top: 60" × 80"
- overage: 4"/side
- usable backing width: 40"
- directional: true
- directional rule disallows horizontal orientation

Expected:
- only vertical-seam candidate is valid
- no horizontal candidate should be recommended

Purpose:
- verifies backing candidate filtering by directionality.

## G24 — Metric rounding boundary

Input:
- buffered requirement = 0.401 m
- purchase increment = 0.1 m

Expected:
- recommended purchase = 0.5 m

Purpose:
- verifies metric upward rounding.

## G25 — Deterministic optimizer tie

Input:
- two candidate layouts with equal score under configured weights

Expected:
- deterministic tie-break rule selects the same candidate every run

Tie-break priority:
1. lower used length
2. lower cut complexity
3. lower waste
4. stable strategy order

Purpose:
- guarantees same input → same output.

## G26 — Large-but-valid grouped input

Input:
- 500 identical 2.5" × 2.5" pieces
- usable WOF: 40"
- rotation allowed
- safety: 0%

Expected:
- optimizer completes without expanding into pathological search
- grouped/strip logic may be used
- all 500 pieces accounted for exactly once

Purpose:
- verifies performance guardrails.

## G27 — Advanced-setting override

Input:
- project default rotation allowed
- one piece group explicitly rotationAllowed = false

Expected:
- piece-level false wins
- no rotation for that group

Purpose:
- verifies precedence rules.

## G28 — Small four-at-a-time HST

For a 1" finished HST with 1/4" seam allowance, expect a 2.621320..." geometric square, 2.75" Standard square, and 3" Trim-friendly square.

## G29 — Large four-at-a-time HST

For an 8" finished HST with 1/4" seam allowance, expect a 12.520815..." geometric square, 12.75" Standard square, and 13" Trim-friendly square.

## G30 — Joined WOF seam-loss boundary

For 40" usable WOF, 1/4" join seam allowance, 79.75" required length, and no handling buffer, two strips provide only 79.5"; three strips are required.

These supplementary fixtures are mandatory regression tests. G30 also requires the property that the returned strip count is adequate and one fewer strip is insufficient.

---

# 35. Ordered Implementation Plan

Codex must implement V1 in the following milestone order unless an explicit product decision revises this plan.

Do not begin later milestones while an earlier milestone has unresolved correctness failures.

## Milestone 0 — Astro repository and test harness

Deliver:
- Astro project scaffold;
- TypeScript configuration;
- React integration only if/when planner implementation demonstrates a real need for it;
- test framework;
- lint/format setup;
- basic CI;
- canonical unit helpers;
- fixture-loading structure;
- static-build/deploy verification.

Definition of done:
- tests execute in CI;
- unit-conversion tests pass;
- no product UI required yet.

Divergence check:
- no backend/database/auth;
- no AI dependency;
- no account system;
- no paid service introduced.

---

## Milestone 1 — Domain primitives

Implement:
- FabricSpec
- PieceGroup
- normalized piece types
- unit conversion
- imperial fraction formatting
- finished→cut conversion
- validation
- purchase rounding
- safety allowance

Definition of done:
- relevant golden tests pass;
- invalid input behavior is explicit;
- domain code has no Astro or React dependency.

Divergence check:
- defaults remain editable;
- no hidden quilting rules added.

---

## Milestone 2 — Single-piece yardage engine

Implement:
- repeated identical rectangle calculation;
- legal rotation;
- pieces-per-row;
- row count;
- calculated plan length;
- buffered length;
- purchase rounding;
- explanation payload.

Definition of done:
- G01–G04, G06–G08, G20–G22, G24, G27 pass where applicable;
- result is deterministic.

Divergence check:
- engine is still practical quilting math, not a generic unrelated packing framework.

---

## Milestone 3 — Multi-piece single-fabric optimizer

Implement:
- grouped pieces;
- candidate strategies;
- strip-friendly heuristics;
- leftover filling;
- scoring;
- deterministic tie-breaks;
- performance caps.

Definition of done:
- G05, G18, G25, G26 pass;
- no overlaps;
- all pieces placed once;
- invalid layouts rejected;
- same input gives same output.

Divergence check:
- do not chase exact global optimality;
- do not add arbitrary polygons;
- do not add random nondeterministic search.

---

## Milestone 4 — Visual cutting plan

Implement:
- SVG projection from optimizer placements;
- labels;
- dimensions;
- direction marker;
- waste regions;
- zoom or scalable display;
- print-safe rendering;
- textual equivalent.

Definition of done:
- visualization uses optimizer geometry directly;
- no second layout engine exists;
- print output is readable;
- dense layouts degrade gracefully.

Divergence check:
- visualization remains a result view, not a full quilt designer.

---

## Milestone 5 — Multi-fabric project planner

Implement:
- multiple fabrics;
- independent optimization per fabric;
- project shopping list;
- aggregate summary;
- per-fabric cutting plan;
- localStorage persistence.

Definition of done:
- G19 passes;
- project can be restored after reload;
- each fabric retains independent settings;
- no login required.

Divergence check:
- local persistence only;
- no cloud/account scope introduced.

---

## Milestone 6 — Standalone calculators

Implement using shared domain primitives where possible:

1. Fabric Yardage
2. Quilt Backing
3. Quilt Binding
4. HST 2/4/8
5. Block Count
6. Borders
7. Sashing

Definition of done:
- G09–G17 and G23 pass;
- formulas are not duplicated inconsistently;
- each calculator emits explanation-ready outputs;
- each relevant result can feed planner state where defined.

Divergence check:
- no extra calculators added merely because they are easy.

---

## Milestone 7 — Astro UI, planner island, and calculator UX

Implement:
- Astro static page shells;
- minimal vanilla TypeScript for simple calculators;
- a single React planner island only if justified by planner UI/state complexity;
- simple mode;
- advanced settings;
- validation/error states;
- warnings;
- assumption display;
- result summaries;
- add-to-planner flow;
- edit/recalculate;
- print/copy/share where practical.

Definition of done:
- a beginner can complete the primary workflow without opening advanced settings;
- expert overrides are available;
- no forced signup;
- assumptions are visible.

Divergence check:
- “math should disappear; assumptions should not.”

---

## Milestone 8 — Astro SEO page shell and content structure

Implement routes from the product spec as static Astro pages.

Each calculator page must include:
- useful static explanatory content;
- calculator near the top;
- methodology;
- worked example;
- internal links;
- planner CTA;
- metadata/canonical setup.

Definition of done:
- pages render useful indexable content before hydration;
- sitemap works;
- no mass numeric/programmatic pages created.

Divergence check:
- SEO supports the product;
- product is not distorted into thin-content publishing.

---

## Milestone 9 — Analytics and privacy

Implement:
- agreed event taxonomy;
- Search Console readiness;
- analytics adapter;
- no personally identifying planner content in events.

Definition of done:
- core events fire correctly;
- event payloads are privacy-safe;
- analytics failures do not block calculations.

Divergence check:
- no invasive tracking added.

---

## Milestone 10 — Full regression and launch readiness

Run:
- G01–G27;
- property/invariant tests;
- accessibility checks;
- performance checks;
- print checks;
- static SEO review;
- cross-browser sanity checks.

Definition of done:
- all locked acceptance criteria pass;
- no unresolved domain ambiguity remains;
- any remaining known issues are explicitly documented and non-blocking;
- V1 deploys as a static Astro site with no backend services.

Divergence check:
- compare completed build against the crystallized agenda in the product spec;
- explicitly list any differences;
- no difference is accepted silently.

---

# 36. Milestone Divergence Protocol

At the end of every milestone, Codex must produce a short review in this format:

```text
MILESTONE DIVERGENCE REVIEW

Milestone:
Relevant agenda clauses:
Relevant golden rules/tests:

Observed divergence:
- None
or
- [specific divergence]

Reason:
- implementation necessity / discovered domain conflict / optional convenience / other

Evidence:
- [tests, source rule, technical constraint, or user requirement]

Recommendation:
- proceed
- fix before proceeding
- defer feature
- request intentional product-spec revision
```

If divergence is caused only by implementation convenience, the default recommendation is **fix before proceeding**.

If new evidence shows the agenda itself is wrong for product success, do not force conformance. Flag it for intentional agenda revision under the product spec’s **Evidence-over-agenda rule**.

---

# 37. Phase Gate Rule

Codex must not treat “code exists” as completion.

A milestone is complete only when:

1. implementation exists;
2. required tests pass;
3. definition of done passes;
4. divergence review is complete;
5. no unresolved blocking contradiction remains.

The next milestone begins only after those conditions are satisfied.

---


# 38. Backend Lock for V1

There is **no application backend in V1**.

Do not create:
- server API routes;
- database schema;
- authentication;
- Supabase/Firebase;
- server persistence;
- server-side calculation services;
- AI endpoints.

All core calculations and optimization execute client-side.

Persistence is localStorage only.

Astro may perform build-time/static rendering, but V1 product functionality must not depend on runtime application-server state.

If a future requirement genuinely needs cloud persistence/accounts/payments/server-backed sharing, raise a **DIVERGENCE FLAG** and request intentional product-spec revision before adding backend infrastructure.


# 39. Final Handoff Principle

The Codex handoff is an **execution document**, not an invitation to redesign the product.

Codex may choose:
- algorithms within specified behavior;
- data structures;
- component organization;
- test implementation;
- styling mechanics;
- performance techniques.

Codex may not silently choose:
- different product scope;
- different quilting rules;
- hidden defaults;
- new paid dependencies;
- accounts/cloud infrastructure;
- AI;
- different optimizer goals;
- new V1 feature categories.

If implementation evidence genuinely disproves the existing agenda, raise a divergence flag and recommend a deliberate spec revision.
