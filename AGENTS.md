# Quilter Agent Guide

## Session Start and Recovery

At session startup, read only `CONTEXT.md`'s Current Status and Context Routing
sections when they are missing from active context; reuse valid instructions
already loaded. Retrieve relevant Active Gaps, approval/issue rows, routed
requirements, and source evidence on demand before affected work. Inspect Git
before edits and preserve existing work. Saved runtime observations are
historical, not proof of current health.

## Execution Style

Spend work where it can materially change the implementation or confidence in
the requested outcome. Reuse sufficient evidence; investigate as deeply as the
uncertainty and consequences warrant, and finish when the outcome and applicable
acceptance requirements are satisfied. This applies across task sizes without
fixed tool budgets or reasoning caps.

Adaptive worker-model selection and economical delegation are authorized. Select
model capability and reasoning effort as independent axes for the initial route
and every reassessment. Model choice answers which capability profile and ceiling
the work needs; effort answers how much inference, search, branching, and
verification that model should perform. Work class is descriptive, not an
allocation ladder: a stronger model need not use higher effort, and higher effort
cannot compensate for a capability mismatch. Consider uncertainty, consequences,
context, and total handoff/review cost. Avoid compulsory delegation, full-history
handoffs, duplicated investigation, and repeated verification once the affected
boundary has sufficient evidence. Keep tool reads and output focused.

Reading, planning, verification and recordkeeping support the task; they are not
separate deliverables unless requested or required by a project acceptance gate.
Preserve scope and approvals, correct contradicted diagnoses, and state what the
evidence actually establishes.
Before substantial work, record separate model-demand and effort-demand
rationales plus acceptance checks; reassess either axis independently at
meaningful handoffs. Before spawning, use the structured routing contract in
`scripts/agent-routing/README.md`. Automatically select useful
installed skills/tools; discover missing capabilities only for a concrete need.
Task-justified installation from a reviewed, pinned trusted source is authorized
within existing permissions; account consent and expanded access still require
their actual approval. Preserve stronger capabilities when evidence warrants them.
The local hook is a guardrail, not protected parent/spending enforcement; never
claim complete governance or measured savings from its presence.

## Architecture Overview

Load the complete architecture overview from
`docs/architecture/context-loading.md` when implementation location, ownership,
dependencies, or a cross-module contract is relevant. The hard boundaries below
remain always active.

## Context Loading Rule

Use the startup/recovery rule above. `CONTEXT.md` is the compact map of authority, product status, gaps and routes; reuse it when already known.

Do not bulk-read all project documents by default. Use the routing index in `CONTEXT.md` and `rg` to load only the smallest relevant source-of-truth sections, architecture notes, decisions, source files, and tests.

For task/roadmap questions, load `docs/architecture/continuation-roadmap.md`.
For cross-package questions or uncertain routes, use
`docs/architecture/documentation-index.md` and its complete section catalog.
Search the routed source text before calling information absent; unlocated is
not proof of deletion. Preserve a catalog/topic route when docs are added or
renamed, including pending and conditional post-launch work. Historical and
research files stay findable without overriding active authority.

Authority order:

1. `docs/v1.1/00_GOVERNING_AGENDA.md` governs strategy, scope, and reason-to-win.
2. `docs/v1.1/02_GOLDEN_RULES_AND_TESTS.md` governs quilting-domain behavior and fixtures G01-G45.
3. `docs/v1.1/01_PRODUCT_SPEC.md` governs functional acceptance.
4. `docs/v1.1/03_UX_IA_SPEC.md` governs interaction and information architecture.
5. `docs/v1.1/04_CONTENT_SEO_ROUTES.md` governs content and search behavior.
6. `docs/v1.1/05_ANALYTICS_VALIDATION.md` governs measurement and usability validation.
7. `docs/v1.1/06_COMPETITIVE_BENCHMARK_GATE.md` governs pre-launch competitive acceptance.
8. `docs/v1.1/07_TECHNICAL_MIGRATION_PLAN.md` governs implementation sequence.

The older `docs/product/quilt_FINAL_*` package is historical V1 baseline evidence. It does not override V1.1.

Supplemental archives under `docs/` are not part of the active authority chain. Do not inspect or extract them unless the user explicitly asks.

Read the relevant V1.1 product-spec and golden-rule sections whenever a task affects product behavior, architecture, domain calculations, acceptance criteria, or non-goals.

## Domain and Optimizer Boundaries

- Use millimetres internally and preserve exact conversion constants.
- Keep domain code independent from Astro and React.
- Make calculation and optimizer output deterministic: identical input must produce identical output.
- Every placement must stay within its purchased or finite-stock material bin, not overlap, obey orientation constraints, preserve fabric/bin identity, and account for every requested piece exactly once.
- Piece-level constraints override project defaults.
- Purchase rounding always rounds upward using the selected increment; never round to nearest or down.
- Fresh-bolt planning optimizes first for validity and practical cutting, then lower fabric length/complexity/fragmentation/waste. Stock-aware reconciliation uses a lexicographic objective: validity, lower raw additional purchase, practical cutting, useful leftovers/low fragmentation, low waste, then deterministic tie-breaks.
- Pattern comparison is a separate fresh-fabric scenario that ignores stock. Stock-aware purchase shortfall must never be substituted into the pattern comparison.
- Keep finite-stock allocation in `src/lib/domain/optimizer/finite-stock.ts` as a bounded physical-bin subsystem distinct from the variable-length fresh-bolt optimizer. Stock placements and practical leftover rectangles must retain material-bin identity; stock-only shortfalls return exact unallocated instances and must not synthesize purchased fabric.
- `src/lib/domain/reconciliation.ts` owns stock-plus-purchase candidate evaluation, while `src/lib/domain/pattern-comparison.ts` owns the stock-free fresh scenario and optional pattern reference comparison. `reconcileProject` composes those contracts and is the planner controller's authoritative result. The retained `planProject` contract remains a fresh-bolt regression boundary; do not combine its placements with reconciled stock-aware shopping output.
- The optimizer is a bounded practical heuristic, not a claim of global optimality.
- Performance caps must prevent large valid inputs from freezing the browser; fall back to a simpler grouped heuristic with a warning.
- Diagrams must use the optimizer's actual geometry and include a textual equivalent.
- Errors block results; warnings preserve usable results while explaining assumptions or limitations.

Do not invent or silently alter quilting rules. If implementation exposes a domain ambiguity, record the conflict and escalate it against the golden contract before proceeding.

## UX, Privacy, and Content Rules

- Keep the primary workflow beginner-first while exposing expert overrides in advanced settings.
- Important results must expose assumptions, reasoning, warnings, a cutting list, and accessible diagram alternatives.
- Do not require signup.
- Calculator pages must render useful static content before hydration.
- Analytics must not contain personally identifying planner content or detailed project data, and analytics failures must never block calculations.
- Analytics events may contain only fixed taxonomy fields and allow-listed tool identifiers; never add arbitrary metadata bags or user-entered values.
- Repeat-use measurement may use only the separate date-only `quiltclarity:analytics-first-used-date` local marker and emit a boolean returning-user category. The old `quilter:analytics-first-used-date` key is a local migration input only. Storage failure must remain contained; never add cross-site identifiers, fingerprints, or project content.
- Preserve print usability, keyboard access, semantic forms, labels, and field-specific errors.
- Do not create thin mass-generated SEO pages.

## Testing and Phase Gates

- V1.1 M9 is complete under the explicit product-authority decision recorded in
  `docs/decisions/v1.1-m9-validation-substitution.md`: because five eligible
  target quilters were unavailable, the completed redesign and exhaustive guided
  operator suite substitute for the originally planned five-user gate. Preserve
  the limitation honestly; do not claim that U01-U05 occurred or reopen them as
  a pre-M10 blocker unless the user explicitly changes this decision.
- The post-M10 Guides/help checkpoint uses the owner-only validation substitution
  recorded in `docs/decisions/v1.1-guides-owner-validation-substitution.md`.
  Codex may execute and record technical cases, but only the owner may pass
  `MT-U01` and `MT-U02`; never claim this as independent novice or target-quilter
  evidence.
- Implement golden fixtures G01-G45 as automated regression tests at the milestones specified by the V1.1 migration plan. The separate legacy differentiation diagnostics are D01-D05; V1.1 G31-G35 exclusively identify finite-stock rules.
- Add property/invariant tests for conversions, placement validity, orientation, purchase bounds, and determinism.
- Test `localStorage` schema migration and corrupt-state recovery when persistence is introduced.
- Test static rendering, accessibility, print output, analytics privacy, and performance guardrails where relevant.
- At release boundaries, build first and run `npm run smoke:browser` on Windows with Chrome and Edge installed; this installed-browser audit is intentionally separate from the portable CI gate.
- `npm run smoke:browser` rebuilds the static output, uses test-only Playwright Core to launch the installed Chrome/Edge binaries, uses PDF.js to inspect generated print text and geometry, and uses `@napi-rs/canvas` to prove rendered paint remains inside the declared print-safe box. A diagram title, wrapped legend, and SVG are one atomic print requirement. Print regressions must be asserted against the clean paginated PDF outcome (including their co-location, orphaning, diagram-page isolation, overlap, typography, and painted bounds), not inferred only from computed CSS or page counts.

A milestone is complete only when implementation exists, required tests pass, its definition of done passes, a milestone divergence review is recorded, and no blocking contradiction remains. Do not begin the next milestone merely because code exists.

Use this review format at each milestone boundary:

```text
MILESTONE DIVERGENCE REVIEW
Milestone:
Relevant agenda clauses:
Relevant golden rules/tests:
Observed divergence: None | [specific divergence]
Reason:
Resolution:
```

## Coding Rules

- Keep modules focused and dependencies explicit.
- Prefer explicit, typed code over clever abstractions.
- Share domain primitives instead of duplicating formulas across calculators.
- Keep standalone calculator formulas and explanation-ready result contracts in `src/lib/domain/calculators`; Fabric Yardage must reuse the repeated-rectangle yardage engine, and Pieces from Fabric must reuse the finite-stock geometry engine.
- Borders and Sashing must share the joined-WOF capacity primitive so join seam loss and handling buffer cannot diverge.
- Keep the calculation engine free of framework, DOM, storage, and analytics dependencies.
- Keep generated explanations structured and derived from the same calculation result as the displayed numbers.
- Keep bulk cut-list parsing deterministic and tabular: known headers or documented positions only, explicit unit/fraction parsing, preview validation, and confirmed imports. Never infer cut requirements from prose.
- Keep `src/lib/presentation` dependent on domain result contracts only; presentation code must not normalize, optimize, or alter placements.
- Avoid nondeterministic search and unbounded backtracking.
- Do not add dependencies, services, or architecture beyond V1 requirements without a documented divergence decision.

## Mandatory Update Protocol

Keep restart state useful: what is done, what remains, approval limits and
relevant dated evidence. Update the existing owner when those facts change or
unfinished work needs a handoff; link detailed evidence instead of duplicating it.
An unchanged state or a read-only reply needs no checkpoint. A validation result
does not create another documentation-and-validation cycle.

At a completed or safely handed-off task boundary, proactively recommend `/clear`
when accumulated conversation is disposable and a compact restart would reduce
future context cost. Recommend it only after the latest meaningful change is
checkpointed and there are no unresolved items, active tools/processes/workers,
pending approvals, or context-dependent next steps that would be lost. For
substantial work, use the lifecycle checker for a machine-readable readiness
decision. The user invokes `/clear`; never claim or assume it occurred.

Context placement rules:

- `docs/architecture/project-status.md` owns the Resume Checkpoint, milestone
  evidence and required milestone divergence reviews; CONTEXT holds the summary.
- Decisions own stable scope; architecture owns contracts; README owns operation.
- Keep AGENTS <=16 KiB, CONTEXT <=12 KiB and at most three recent entries.
- `scripts/check_context.ps1` validates memory; `scripts/test_context.ps1`
  exercises the checker when its behavior changes.

## Do Not

- Do not add a backend, database, authentication, cloud persistence, or server-side calculations in V1.1, except the owner-approved optional analytics-only ingestion and telemetry contract in `docs/decisions/cloudflare-analytics-engine.md`.
- Do not add AI, accounts, paid tiers, image/PDF ingestion, pattern generation, stash inventory, community features, arbitrary polygon packing, or a full quilt designer.
- Do not change the locked stack or domain behavior silently.
- Do not claim the heuristic optimizer is globally optimal.
- Do not duplicate calculation or placement logic in UI or visualization code.
- Do not skip required golden fixtures, invariants, phase gates, or divergence reviews.
