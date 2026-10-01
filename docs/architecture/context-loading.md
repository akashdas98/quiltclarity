# Context Loading Architecture

## Purpose

Root memory provides fast orientation; routed documents provide task-specific detail while the coordinated V1.1 package retains authority.

The authoritative core product package lives in `docs/v1.1/`. For the active
post-M10 learning checkpoint, `docs/v1.1_GUIDES_HELP/` governs Guides,
contextual help, its closed analytics additions, and its manual suite, subject to
the recorded owner-validation substitution. The older `docs/product/` package
is historical V1 baseline evidence. Other supplemental archives under `docs/`
remain deferred unless explicitly authorized.

## Architecture Overview

QuiltClarity is a static-first quilting utility website centered on reconciling an external project cut list with exact project-local fabric stock, additional purchase needs, optional pattern yardage, and one executable cutting plan.

The required V1.1 architecture is:

- Astro for static, crawlable page shells and content.
- Plain TypeScript for shared domain calculations and optimization.
- Framework-independent TypeScript for deterministic tabular cut-list parsing and import compilation.
- Framework-independent presentation TypeScript for SVG/text projections that consume domain results without recalculating them.
- A controlled `src/lib/help` registry and reusable Astro contextual-help component for definitions and exact guide anchors; help must not replace visible correctness warnings.
- Vanilla client TypeScript for the current planner and calculator controllers; React remains limited to one planner island only if measured interaction complexity warrants it.
- A typed browser analytics adapter with a closed, privacy-safe event schema and contained provider failures.
- React remains an allowed ceiling of one planner island only if later state complexity materially justifies replacing the current controller; it is not currently installed.
- SVG diagrams projected directly from optimizer placements.
- Versioned `localStorage` for project persistence and migration plus a separate allow-listed site-theme preference.
- Static-hosting-compatible deployment with no application backend, database, authentication, server persistence, AI endpoint, or runtime calculation service.

Do not turn the whole site into a React application or create a second layout engine for diagrams.

## Startup Sources

At startup, load only Current Status and Context Routing from `CONTEXT.md` when
they are missing from active context. Reuse valid loaded instructions. Load
Active Gaps, approval/issue records, routed requirements, source, and tests only
when the current task makes them relevant.

Codex discovers root `AGENTS.md`; no custom launcher or user reminder is
required when normal instruction discovery is active. A client that does not
load AGENTS needs its own explicit bootstrap; this repository does not claim to
install a universal startup hook.

## Recovery and Writeback

`AGENTS.md` owns recovery and memory behavior. This document maps authoritative
project sources; it adds no separate execution or writeback procedure.

## Context and Verification Budgets

AGENTS is bounded at 16 KiB, CONTEXT at 12 KiB and three recent entries.
`scripts/check_context.ps1` checks structure, routes and checkpoint fields;
`scripts/test_context.ps1` contains its isolated regression fixtures.
Historical context remains in `docs/architecture/context-history-through-2026-09-02.md`.
These tools and archives support the root contract; they are not an additional
handoff process or evidence of product acceptance.

## Selective Loading

- Domain/calculator work: load `docs/architecture/domain-contracts.md`, relevant sections of `docs/v1.1/02_GOLDEN_RULES_AND_TESTS.md` and `01_PRODUCT_SPEC.md`, the active migration milestone, domain source, and tests.
- Optimizer/planning work: also load V1.1 Golden sections 9-11 and the finite-stock, scoring, pattern-comparison, performance, and property-test requirements in `07_TECHNICAL_MIGRATION_PLAN.md`.
- UI work: load affected sections of `01_PRODUCT_SPEC.md` and `03_UX_IA_SPEC.md` plus the active source/components.
- SEO/content work: load `04_CONTENT_SEO_ROUTES.md` and affected static routes.
- Analytics work: load `05_ANALYTICS_VALIDATION.md` and the corresponding migration milestone.
- Guides/help work: load `docs/v1.1_GUIDES_HELP/README.md`, its Guides/help spec,
  manual plan, the Guides audit, and the owner-validation decision; retain the
  core Golden/domain authority in `docs/v1.1/`.
- Runtime/deployment work: load `docs/decisions/v1-static-architecture.md` and `docs/architecture/product-and-runtime-boundaries.md`.
- Milestone completion: load the milestone's full handoff section, acceptance requirements, tests, and `docs/architecture/project-status.md`.

Use `rg` to locate precise headings and requirements before opening long files.

## Authority Conflict Handling

The V1.1 governing agenda controls strategy/scope, the Golden Rules win for domain behavior, the product specification controls functional acceptance, and the remaining documents control their named areas according to `docs/v1.1/README.md`. If a real contradiction remains, document and escalate it rather than choosing silently.

## New Documentation

Create routed documentation only for durable decisions, stable contracts, or useful mutable status. Tests and source remain the executable record of implementation behavior.
