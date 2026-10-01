# QuiltClarity V1.1 — Codex Specification Bundle

**Status:** Governing implementation package — Guides/help overhaul incorporated  
**Revision date:** 2026-08-21  
**Product:** QuiltClarity (`quiltclarity.com`)

This is the complete replacement-ready V1.1 specification package for updating the existing QuiltClarity repository.

It includes the earlier V1.1 product redesign **plus a pre-launch Guides and contextual-help overhaul**.

The Guides change is not cosmetic documentation work. QuiltClarity must teach a first-time user how to use the product from scratch, in the same order they use it, while important fields/results must provide concise help at the point of confusion.

The package also adds a required **human-readable manual-test suite** that Codex must add to the repository, keep current, and execute before considering the implementation complete.

## Read order

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
11. `10_CODEX_ENTRY_POINT.md`
12. `11_CURRENT_STATE_HANDOFF.md`

## Authority

- Strategic scope / reason-to-win: `00_GOVERNING_AGENDA.md`
- Mathematical/domain behavior: `02_GOLDEN_RULES_AND_TESTS.md`
- Functional acceptance: `01_PRODUCT_SPEC.md`
- Interaction / IA: `03_UX_IA_SPEC.md`
- Product-learning system, guide flow and contextual help: `08_GUIDES_AND_CONTEXTUAL_HELP_SPEC.md`
- Search/content/routes: `04_CONTENT_SEO_ROUTES.md`
- Measurement/usability validation: `05_ANALYTICS_VALIDATION.md`
- Technical/manual browser acceptance: `09_MANUAL_TEST_PLAN.md`
- Pre-launch competitive acceptance: `06_COMPETITIVE_BENCHMARK_GATE.md`
- Repository migration and implementation sequence: `07_TECHNICAL_MIGRATION_PLAN.md`

If documents conflict, do not guess. Apply the most specific governing authority above and record a divergence if ambiguity remains.

## One-sentence product

> **QuiltClarity turns an external quilt cut list plus the fabric the quilter actually has into one verified purchase-and-cut plan—without requiring the quilt itself to be recreated.**

The reason-to-win remains the project-level reconciliation workflow:
**mixed requirements → exact finite stock → joint allocation → purchase shortfall → yardage comparison → executable cutting plan.**

The Guides/help overhaul strengthens **learnability and trust**; it does not replace the product reason-to-win.

## Learning-system requirement

A user who has never used QuiltClarity must be able to enter the Guides area and learn the app from zero through an intuitive sequence:

> **What QuiltClarity does → Quick Start → enter a project → understand fields/settings → calculate → read results → use the cutting plan → handle common special cases.**

The app itself must also explain important concepts where they matter through:

- essential inline helper text;
- accessible `?` help buttons / popovers;
- concise field/result explanations;
- deep links to the exact relevant guide section.

No essential information may be hover-only.

## Manual-test requirement

Codex must:

1. add a human-readable manual-test file to the repository using the repository's existing docs/test convention, or `docs/manual-tests/V1_1_MANUAL_TESTS.md` if none exists;
2. populate it from `09_MANUAL_TEST_PLAN.md`;
3. keep it synchronized with implemented routes/controls;
4. execute the technical manual checks where tooling permits;
5. record PASS / FAIL / BLOCKED plus notes/evidence;
6. leave the owner-operated usability cases clearly marked `OWNER REQUIRED`
   until the owner executes them; automation must not be presented as owner
   comprehension evidence.

Automated tests do not replace these manual checks.

## Hard implementation constraints

- Astro static-first.
- Deterministic TypeScript domain logic.
- Core calculations in browser.
- No required account.
- No application backend/database/auth.
- No paid runtime API dependency.
- Local persistence only.
- No automatic PDF/image/pattern interpretation.
- No AI in the authoritative calculation path.
- No permanent stash-management product.
- No full quilt designer.
- No arbitrary polygon/curved-piece optimizer.
- Do not claim global mathematical optimality.

## Before code changes

Codex must audit the existing repository against this full package and report:

- what already conforms;
- what is reusable;
- what is stale;
- what must be migrated;
- the current Guides/help implementation;
- any existing manual-test convention;
- any conflict with Golden Rules or this learning-system contract.

Do not rewrite working domain code merely because this is a product revision.
