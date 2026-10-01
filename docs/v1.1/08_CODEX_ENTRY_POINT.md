# QuiltClarity V1.1 — Codex Entry Point

You are updating an existing QuiltClarity repository to the product specified in this bundle.

## 1. Read before editing

For initial V1.1 adoption or a full specification audit, read in order:

1. `00_GOVERNING_AGENDA.md`
2. `02_GOLDEN_RULES_AND_TESTS.md`
3. `01_PRODUCT_SPEC.md`
4. `03_UX_IA_SPEC.md`
5. `04_CONTENT_SEO_ROUTES.md`
6. `05_ANALYTICS_VALIDATION.md`
7. `06_COMPETITIVE_BENCHMARK_GATE.md`
8. `07_TECHNICAL_MIGRATION_PLAN.md`

Then inspect the repository.

For ongoing maintenance after the completed M0 audit, start with root `AGENTS.md`
and `CONTEXT.md`, then read the relevant sections in the authority order above.
The full-bundle read and initial audit below are not repeated for every task.

## 2. Do not assume the repository matches old documentation

Current code may contain:

- correct later domain remediations;
- stale old UX/copy;
- incomplete tests;
- implementation choices that differ from historical docs.

Treat actual code + current tests as evidence to audit, but the new bundle defines intended product behavior.

## 3. First deliverable

Before major edits, produce:

```text
V1.1 REPOSITORY AUDIT

Current architecture:
Current planner model:
Current optimizer:
Current persistence schema:
Current calculators/routes:

Golden tests present:
- G01–G17:
- G18–G27:
- G28–G30:
Corrected HST four-at-a-time rule present:
Joined-WOF seam-loss helper present:

Reusable without change:
Needs extension:
Stale/needs replacement:

Conflicts with new Golden Rules:
Open domain ambiguity:
```

Do not ask product questions that are already answered in these docs.

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
- make competitor/uniqueness claims in copy;
- revert corrected HST or joined-WOF rules.

## 5. Core implementation objective

The existing fresh-bolt planner becomes one mode/subsystem of a larger project reconciliation flow.

Implement:

> external cut requirements + exact project-local stock → joint allocation → additional purchase → optional pattern/fresh-plan comparison → consolidated cutting execution.

A calculation that merely subtracts owned yardage from required yardage is incorrect.

A calculation that optimizes each piece type independently and adds the totals is insufficient.

## 6. Test-first rule

Before UI polish:

- preserve existing valid tests;
- add/repair all G01–G45;
- add required properties;
- prove finite-stock and purchase-shortfall behavior.

Do not change fixture expectations to make failing code green unless a documented domain conflict is found and intentionally resolved.

## 7. Migration rule

Old valid local projects should migrate.

A migrated old project with no stock/pattern inputs should still behave like the corrected fresh-bolt planner.

## 8. UX rule

The table/paste cut-list compiler is a core feature, not optional polish.

Optimize for a user entering a real external pattern with many rows.

## 9. Copy rule

Use:

- Standard / Trim-friendly;
- Uses least fabric / Lowest-yardage option;
- Planned cuts require;
- Buy now;
- practical optimized plan.

Avoid:

- Exact sizing as an HST/QST/FG option label;
- globally optimal/minimum claims;
- “pattern is wrong”;
- unsupported uniqueness claims.

## 10. Milestones

Execute `07_TECHNICAL_MIGRATION_PLAN.md` M0–M10 in order.

Do not start a later milestone with a blocking earlier correctness failure.

## 11. Escalation

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

## 12. Final status language

Allowed final statuses:

- implementation complete; launch gate pending;
- launch blocked by [specific issue];
- launch gate passed.

Do not equate “tests pass” with “successful launch product verified.”
