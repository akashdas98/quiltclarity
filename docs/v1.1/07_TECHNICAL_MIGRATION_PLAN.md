# QuiltClarity V1.1 — Technical Migration & Implementation Plan

**Status:** Repository execution plan  
**Date:** 2026-08-17

# 1. Principle

This is an **evolution of the existing repository**, not permission for a ground-up rewrite.

Preserve proven:

- Astro setup;
- TypeScript domain primitives;
- unit/fraction helpers;
- existing calculators;
- corrected HST rules;
- joined-WOF helper;
- optimizer invariants;
- SVG result pipeline;
- tests;
- accessibility/SEO infrastructure.

Replace or extend only where required by the new product job.

# 2. First Codex action: repository audit

Before modifying code, map:

- actual current project schema;
- optimizer modules;
- placement model;
- localStorage schema/version;
- current routes;
- calculator modules;
- Golden tests implemented;
- stale copy/UX;
- domain remediation status.

Output an audit before major refactor.

# 3. Data-model migration

Introduce a new local schema version.

Conceptual new types:

```ts
type StockPiece = {
  id: string;
  fabricId: string;
  label: string;
  widthMm: number;
  lengthMm: number;
  quantity: number;
  sourceType: 'preset' | 'custom' | 'partial-yardage';
};

type FabricPlan = {
  id: string;
  name: string;
  nominalWidthMm: number;
  usableWidthMm: number;
  directional: boolean;
  defaultRotationAllowed: boolean;
  safetyPercent: number;
  purchaseIncrementMm: number;
  patternStatedAmountMm?: number;
  patternAssumedUsableWidthMm?: number;
  stockPieces: StockPiece[];
};

type CutRequirement = {
  id: string;
  fabricId: string;
  label: string;
  quantity: number;
  widthMm: number;
  heightMm: number;
  dimensionMode: 'cut' | 'finished';
  rotationAllowed?: boolean;
  orientation: 'none' | 'crosswise' | 'lengthwise';
  isWofStrip: boolean;
};
```

Adjust to existing code conventions rather than duplicating equivalent types.

# 4. Old-state migration

Old valid planner state must not be discarded.

Migration:

- old Fabric → new FabricPlan;
- old PieceGroup → CutRequirement;
- `stockPieces=[]`;
- no pattern comparison by default;
- all former fresh-bolt behavior remains possible.

After migration, a project with no stock/pattern inputs should produce behavior equivalent to the corrected old planner for the same inputs.

If an old field cannot migrate:

- preserve all safe fields;
- report a user-visible migration issue;
- never silently zero/change a dimension.

# 5. Module boundaries

Recommended conceptual ownership:

```text
domain/
  units
  dimensions
  quiltingDefaults
  purchase
  joinedWof
  hst
  qst
  flyingGeese
  backing
  batting
  binding
  borders
  sashing

optimizer/
  geometry
  freshBolt
  finiteStock
  candidateGeneration
  scoring
  invariants

planning/
  normalizeProject
  freshFabricScenario
  reconcileFabric
  reconcileProject
  patternComparison
  cuttingInstructions
  leftovers

persistence/
  schema
  migrate

ui/
  planner...
  calculators...
```

Do not force this exact folder tree if repository structure already has clear equivalents.

# 6. Finite-stock engine

Represent each physical stock instance as a bounded rectangular bin.

Purchased bolt:

- width fixed at usable WOF;
- variable positive length;
- conceptually a special bin whose length is solved.

Candidate generation must explore meaningful alternative piece-to-stock assignments.

At minimum include strategies emphasizing:

- most constrained piece first;
- largest area;
- largest crosswise dimension;
- strip-friendly groups;
- stock pieces ordered smallest useful fit first;
- stock pieces ordered largest first;
- preserve WOF-capable stock for WOF requirements;
- alternative stock-vs-purchase assignment where purchase length may differ.

Do not brute-force factorial search for realistic projects.

# 7. Reconciliation scoring

Use lexicographic stages rather than a single opaque numeric score for the critical business objective.

First compare:

1. validity;
2. raw additional purchase length.

Only when purchase length is tied/near-equivalent under deterministic rules compare: 3. cutting complexity; 4. leftover usefulness/fragmentation; 5. waste; 6. stable strategy order.

This prevents “saved a prettier remnant but made user buy more fabric.”

# 8. Leftover representation

Exact arbitrary maximal-free-rectangle decomposition can become unstable/overcomplicated.

For this release:

- placement geometry is authoritative;
- report unused area;
- report practical rectangular leftover regions using the same deterministic free-rectangle representation if available;
- never promise those leftovers form one contiguous piece if they do not.

# 9. Pattern comparison engine

Implement independently:

`freshFabricScenario(requirements, fabricAssumptions)`

No stock parameter.

Then:
`patternComparison(patternStated, patternWof?, freshScenario, currentWof)`.

Stock-aware:
`reconcileFabric(requirements, stock, purchaseSettings)`.

UI combines the two result models; domain must not conflate them.

# 10. Cutting instructions

Use one placement result.

No independent re-layout for prose.

Generate:

- recognized strip groups when placement geometry supports them;
- explicit stock-bin references;
- fallback exact piece list + visual layout when strip simplification would lie.

# 11. Bulk paste

Implement a deterministic tabular parser, not NLP.

Pipeline:

1. tokenize rows/cells;
2. match known headers/column positions;
3. parse dimensions using existing fraction/unit parser;
4. validate;
5. preview;
6. user resolves mapping/errors;
7. confirm import.

No auto-correction of ambiguous dimensions.

# 12. Calculator additions

Implement in this order:

1. Batting — simple rectangle/roll orientation.
2. QST — deterministic formula/batch.
3. Flying Geese — deterministic formula/batch.
4. Pieces from Fabric — shared finite-stock engine.

All require Golden fixtures before UI completion.

# 13. UX migration

Replace old planner mental model where necessary:

- from fabric cards containing piece subforms
- toward project-level rapid cut-list compilation plus per-fabric stock/settings.

Do not preserve old UI structure merely because it exists if it makes 20-row external pattern entry painful.

Preserve styling primitives and accessibility where still useful.

# 14. SEO/content migration

Update:

- homepage proposition;
- planner route/title/content;
- calculator index;
- add four calculator routes;
- add necessary guides;
- remove any unsupported “unique optimizer/minimum” claims;
- correct HST labels;
- correct backing low-yardage wording.

Redirect old route `/fabric-cutting-planner` to `/project-planner` only if the route is actually renamed. Prefer a permanent redirect and preserve canonical consistency. If keeping old route avoids needless migration risk, keep it and update its content; the URL name is less important than product behavior.

# 15. Analytics migration

Keep existing compatible events where useful; add new taxonomy from `05_ANALYTICS_VALIDATION.md`.

Never emit free-text fields.

# 16. Implementation milestones

## M0 — Audit & baseline

- run current tests/build;
- verify corrected G12/G28–G30;
- document current architecture;
- no product changes yet.

## M1 — Schema migration + normalized project model

- migration tests;
- old fresh-bolt project regression.

## M2 — Finite-stock optimizer

- G31, G34–G36, G39–G40;
- properties.

## M3 — Purchase shortfall + pattern comparison

- G32–G33, G37–G38;
- integrated project result.

## M4 — New calculator domain

- G41–G45.

## M5 — Cut-list compiler + paste

- desktop keyboard path;
- mobile path;
- validation.

## M6 — Results / cutting execution / print

- stock allocation;
- purchase plan;
- comparison;
- no duplicated layout engine.

## M7 — Content/SEO/routes

- static content;
- metadata;
- canonicals/sitemap;
- internal links.

## M8 — Analytics/privacy

- event tests;
- no free-text leakage.

## M9 — Full regression and usability

- G01–G45;
- properties;
- browser/build/accessibility/print;
- target-user usability gate.

Execution status: complete under the explicit validation substitution recorded
in `../decisions/v1.1-m9-validation-substitution.md`. The five-user study did not
occur because eligible target quilters were unavailable; the completed redesign,
automated gate, installed-browser audit, and exhaustive guided operator suite are
the accepted M9 evidence, with the external-comprehension limitation preserved.

## M10 — Competitive launch gate

- execute `06_COMPETITIVE_BENCHMARK_GATE.md`.
- no launch without PASS.

# 17. Performance guardrails

Measure before adding complexity.

Possible implementation tools:

- grouped piece instances;
- bounded candidate strategies;
- limited deterministic backtracking;
- memoized feasibility checks;
- Web Worker only if measured UI blocking warrants it.

A Web Worker is an implementation mechanism, not a product architecture change.

Do not add server compute.

# 18. Testing layers

- unit tests for formulas/parsers;
- Golden fixtures;
- optimizer properties;
- state migration tests;
- UI interaction tests for paste/table;
- end-to-end representative projects;
- print snapshot/manual checks;
- accessibility checks.

# 19. Divergence review per milestone

```text
MILESTONE DIVERGENCE REVIEW

Milestone:
Relevant agenda:
Relevant Golden fixtures:

Observed divergence:
Reason:
Evidence:
Impact:
Recommendation:
- proceed
- fix
- defer
- request intentional spec revision
```

No milestone closes with an unexplained divergence.

# 20. Completion report

Codex final report must contain:

- files/modules changed;
- schema migration;
- tests by fixture range;
- property tests;
- build/typecheck/lint;
- planner E2E cases;
- print/accessibility;
- SEO routes;
- analytics privacy check;
- known limitations;
- divergence list;
- competitive gate status.

Do not say “launch ready” until competitive gate is PASS.
