# QuiltClarity V1.1 — Codex Entry Point

You are updating an existing QuiltClarity repository to the product specified in this bundle.

This package includes:

1. the V1.1 product redesign;
2. a Guides/product-learning overhaul;
3. contextual field/result help on planner/calculator pages;
4. a mandatory repository manual-test suite.

## 1. Read before editing

Read, in order:

1. `00_GOVERNING_AGENDA.md`
2. `02_GOLDEN_RULES_AND_TESTS.md`
3. `01_PRODUCT_SPEC.md`
4. `03_UX_IA_SPEC.md`
5. `08_GUIDES_AND_CONTEXTUAL_HELP_SPEC.md`
6. `04_CONTENT_SEO_ROUTES.md`
7. `05_ANALYTICS_VALIDATION.md`
8. `09_MANUAL_TEST_PLAN.md`
9. `06_COMPETITIVE_BENCHMARK_GATE.md`
10. `07_TECHNICAL_MIGRATION_PLAN.md`
11. `11_CURRENT_STATE_HANDOFF.md`

Then inspect the repository.

## 2. Do not assume the repository matches historical documentation

Current code may contain:

- correct later domain remediations;
- stale old UX/copy;
- an old Guides structure;
- incomplete tests;
- implementation choices that differ from historical docs.

Treat current code/tests as implementation evidence, but this bundle defines intended behavior.

## 3. First deliverable — repository audit

Before major edits, produce:

```text
V1.1 REPOSITORY AUDIT

Current architecture:
Current planner model:
Current optimizer:
Current persistence schema:
Current calculators/routes:

Current Guides:
- route structure:
- product tutorials:
- quilting-reference content:
- contextual field help:
- contextual result help:
- accessibility behavior:
- current deep-link strategy:

Current manual-test convention/file:
Existing browser/manual test coverage:

Golden tests present:
- G01–G17:
- G18–G27:
- G28–G30:
- G31–G45:
Corrected HST four-at-a-time rule present:
Joined-WOF seam-loss helper present:

Reusable without change:
Needs extension:
Stale/needs replacement:

Conflicts with bundle:
Open domain ambiguity:
```

Do not ask product questions already resolved in the docs.

## 4. Hard product locks

Do not:

- add backend/database/auth;
- add accounts;
- add AI;
- add automatic pattern/PDF/image interpretation;
- add full quilt designer;
- add permanent stash system;
- add arbitrary-shape packing;
- chase exact global optimization;
- make unsupported uniqueness/competitor claims;
- revert corrected domain rules.

## 5. Core implementation objective

Implement the V1.1 project reconciliation flow:

> external cut requirements + exact project-local stock → joint allocation → additional purchase → optional pattern/fresh-plan comparison → consolidated cutting execution.

Do not replace it with yardage subtraction or independent piece-group totals.

## 6. Learning-system objective

The product must teach itself.

A brand-new user starting at `/guides` must have a clear route to learn QuiltClarity from zero.

Implement:

- Guides hub with **Start Here / Common Workflows / Quilting Reference**;
- Quick Start;
- full field-by-field/result-by-result planner tutorial;
- focused workflow/product guides;
- Previous/Next learning flow;
- stable anchored subsections;
- contextual `?` help on important planner/calculator fields/results;
- exact Learn more deep links;
- state preservation when navigating to guides.

Essential correctness warnings must not be hidden only inside hover/popovers.

## 7. Help interaction lock

Contextual help:

- real focusable buttons;
- click/tap;
- keyboard;
- hover supplementary only;
- meaningful accessible names;
- predictable close;
- responsive popover;
- no essential hover-only content.

Do not add a help icon to every trivial field.

## 8. Test-first rule

Before UI polish:

- preserve valid existing tests;
- add/repair G01–G45;
- add properties;
- prove finite-stock and shortfall behavior.

For Guides/help:

- add appropriate automated route/interaction/accessibility tests;
- do not rely on automated tests alone.

## 9. Manual-tests rule — mandatory

You must add a manual-test file to the repository.

Use existing convention if present; otherwise create:

`docs/manual-tests/V1_1_MANUAL_TESTS.md`

Populate it from `09_MANUAL_TEST_PLAN.md`.

For every test record:

- PASS / FAIL / BLOCKED / OWNER REQUIRED;
- evidence/notes;
- checked build/commit.

Execute technical manual/browser checks using available tools.

Do **not** claim owner comprehension was validated by browser automation. The
owner must execute MT-U01 and MT-U02. Preserve the limitation that this is not
independent novice or recruited target-quilter evidence.

Owner-required cases remain explicitly outstanding until then.

Implementation is not complete if:

- the manual-test artifact does not exist;
- technical manual tests were not run;
- failures are ignored.

## 10. Migration rule

Old valid local projects should migrate.

Navigating to a Guide via Learn more must not silently destroy current valid project state.

## 11. UX rule

Cut-list table/paste remains a core feature.

Guides/help must reduce confusion without making forms visually noisy.

## 12. Copy rule

Use:

- Standard / Trim-friendly;
- Uses least fabric / Lowest-yardage option;
- Planned cuts require / Fresh-fabric plan as specified;
- Buy now;
- practical optimized plan.

Avoid:

- Exact as stale sizing-mode label;
- global optimum/minimum claims;
- “pattern is wrong”;
- unsupported uniqueness.

App copy, contextual help and Guides must use the same terminology.

## 13. Work sequence

Historical adoption sequence: the migration plan defines M0–M10, all complete.
The separate post-M10 Guides/help checkpoint is also complete under its owner
substitution. No defined M11 should be inferred from the original entry-point
wording. Continue through `../architecture/continuation-roadmap.md`; do not
restart implementation or owner tests from this older handoff.

Do not close a milestone with blocking earlier correctness failures.

## 14. Escalation

If a genuine unanswered quilting/domain issue appears:

```text
OPEN DOMAIN QUESTION

Context:
Affected behavior:
Why current Golden Rules do not resolve it:
Options:
Evidence:
Recommendation:
```

Do not invent a quilting convention.

If a Guides/help implementation decision would change product behavior rather than explain it, flag it instead of silently changing the domain.

## 15. Completion report

Final report must include:

- implementation summary;
- files/modules changed;
- schema migration;
- G01–G45 status;
- property tests;
- build/typecheck/lint;
- planner E2E;
- Guides routes/content;
- contextual-help keys/coverage;
- accessibility;
- print;
- SEO;
- analytics privacy;
- repository manual-test path;
- manual-test status by ID or grouped ID range;
- OWNER REQUIRED items;
- known limitations;
- divergences;
- competitive launch-gate status.

Allowed overall status:

- implementation complete; human/competitive launch gates pending;
- launch blocked by [specific issue];
- launch gate passed.

Do not equate automated test success with complete product validation.
