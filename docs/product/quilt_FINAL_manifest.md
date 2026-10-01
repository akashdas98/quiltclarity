# Quilt Utility Website — FINAL V1 Document Set

**Date:** 2026-08-07

This is the authoritative V1 package.

The targeted domain-correctness revision is synchronized into the Product Spec, Golden Rules and Tests, and Codex Handoff. The active fixture range is G01-G30.

## Authority order

1. `quilt_FINAL_product_spec_v1.md` — governing agenda, scope, architecture, UX, acceptance criteria
2. `quilt_FINAL_golden_rules_and_tests.md` — authoritative quilting-domain rules and golden fixtures
3. `quilt_FINAL_codex_handoff.md` — Codex execution plan
4. `quilt_FINAL_prebuild_dossier.md` — research rationale, competitive context, SEO/business thesis

## Locked architecture

- Astro static-first
- TypeScript domain/calculation engine
- vanilla client TypeScript for simple calculators where practical
- React only for the complex Fabric Cutting Planner if justified
- no application backend/database/auth in V1
- localStorage persistence
- static-hosting-compatible deployment

## Governance

Every new decision must be checked against the crystallized agenda in the product specification.

If new evidence shows that agenda is wrong for the goal of a successful product, flag the conflict and deliberately revise the agenda rather than preserving it dogmatically.
