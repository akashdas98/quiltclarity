# QuiltClarity V1.1 — Codex Specification Bundle

**Status:** Governing implementation package  
**Date:** 2026-08-17  
**Product:** QuiltClarity (`quiltclarity.com`)

This package intentionally revises the previous launch product after competitive revalidation. It is a coordinated specification set: do not implement one document in isolation.

## Read order

This is the full-bundle adoption/audit order. Routine maintenance uses root
`AGENTS.md` and `CONTEXT.md` followed by relevant sections in this authority order;
the completed M0 audit is not a recurring prerequisite for every edit.

1. `00_GOVERNING_AGENDA.md`
2. `02_GOLDEN_RULES_AND_TESTS.md`
3. `01_PRODUCT_SPEC.md`
4. `03_UX_IA_SPEC.md`
5. `04_CONTENT_SEO_ROUTES.md`
6. `05_ANALYTICS_VALIDATION.md`
7. `06_COMPETITIVE_BENCHMARK_GATE.md`
8. `07_TECHNICAL_MIGRATION_PLAN.md`
9. `08_CODEX_ENTRY_POINT.md`

## Authority

- Strategic scope / reason-to-win: `00_GOVERNING_AGENDA.md`
- Mathematical and domain behavior: `02_GOLDEN_RULES_AND_TESTS.md`
- Functional acceptance: `01_PRODUCT_SPEC.md`
- Interaction and information architecture: `03_UX_IA_SPEC.md`
- Search/content behavior: `04_CONTENT_SEO_ROUTES.md`
- Measurement and validation: `05_ANALYTICS_VALIDATION.md`
- Pre-launch competitive acceptance: `06_COMPETITIVE_BENCHMARK_GATE.md`
- Repository migration and implementation order: `07_TECHNICAL_MIGRATION_PLAN.md`

If documents conflict, do not guess. Apply the authority above and record a divergence if ambiguity remains.

## One-sentence product

> **QuiltClarity turns an external quilt cut list plus the fabric the quilter actually has into one verified purchase-and-cut plan—without requiring the quilt itself to be recreated.**

The important product advantage is not merely “no design software,” a cutting diagram, or mixed-size packing. It is the complete project-level reconciliation workflow:
**mixed requirements → exact finite stock → joint allocation → purchase shortfall → yardage comparison → executable cutting plan.**

## Hard implementation constraints

- Astro static-first.
- Deterministic TypeScript domain logic.
- Core calculations run in the browser.
- No required account.
- No application backend/database/authentication.
- No paid runtime API dependency.
- Local persistence only.
- No automatic PDF/image/pattern interpretation.
- No AI in the authoritative calculation path.
- No permanent stash-management product.
- No full quilt designer.
- No arbitrary polygon/curved-piece optimizer.
- Do not claim global mathematical optimality.

## Before code changes

Codex must first audit the existing repository against these documents and report:

- what already conforms;
- what is reusable;
- what is stale;
- what must be migrated;
- any conflict with the Golden Rules.

Do not rewrite working domain code merely because this is a product revision.
