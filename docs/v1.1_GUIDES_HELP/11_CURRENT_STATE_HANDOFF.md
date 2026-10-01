# QuiltClarity V1.1 — Current State Handoff

**Revision date:** 2026-08-21

## Decision state

The old launch product is intentionally superseded.

The current product direction is:

> **QuiltClarity turns an external quilt cut list plus the fabric the quilter actually has into one verified purchase-and-cut plan—without requiring the quilt itself to be recreated.**

Reason-to-win:

- whole-project joint reconciliation;
- exact finite stock;
- purchase shortfall;
- optional pattern/fresh-fabric comparison;
- consolidated execution.

## Research conclusion carried into the specs

Broad “external-pattern user who does not use design software” is not itself a valid segment advantage; those users can adopt existing products.

The narrower target job survives because current alternatives solve important subsets but leave the compound workflow fragmented/manual enough to justify implementation and a final same-job competitive gate.

## Existing work intentionally preserved

- Astro/static-first architecture;
- deterministic TypeScript math;
- no backend/accounts;
- nominal vs usable WOF;
- finished-to-cut conversion;
- practical deterministic optimizer;
- directional constraints;
- safety and upward purchase rounding;
- backing/binding/HST/block/border/sashing domain rules;
- corrected HST 4-at-a-time geometry;
- joined-WOF seam-loss calculation;
- Golden regression approach;
- localStorage;
- SVG from actual placements;
- print/accessibility/static SEO foundations.

## New implementation work

- data model for project-local finite stock;
- stock-aware allocation;
- purchase-shortfall engine;
- pattern comparison kept independent of stock;
- rapid cut-list compiler and spreadsheet paste;
- consolidated stock + purchase cutting plan;
- Batting;
- QST;
- Flying Geese;
- Pieces-from-Fabric;
- revised homepage/planner IA/content;
- revised analytics;
- competitive launch gate.

## Launch rule

Do not launch merely because implementation is complete.

Launch is allowed only after:

- G01–G45 + properties;
- full QA;
- usability gate;
- current competitive same-job benchmark PASS.

## Bundle

This handoff belongs with the entire specification package. Start Codex from `10_CODEX_ENTRY_POINT.md`.

## Pre-launch Guides / help overhaul

Before implementation is considered complete, the Guides area must become QuiltClarity's self-service learning system.

Required:

- novice Quick Start;
- complete field-by-field/result-by-result planner tutorial;
- intuitive sequential learning flow;
- focused workflow guides;
- quilting fundamentals retained as secondary Reference;
- concise contextual help on important planner/calculator fields/results;
- accessible `?` controls with click/tap/keyboard behavior;
- exact Learn more links into guide sections;
- essential correctness information not hover-only;
- project state preserved across guide navigation.

## Manual tests

The repository must contain a maintained human-readable V1.1 manual-test suite based on `09_MANUAL_TEST_PLAN.md`.

Codex must run the technical/browser checks it can perform and record status/evidence.

The from-zero and result-comprehension cases remain `OWNER REQUIRED` until the
product owner performs them. They must not be represented as independent novice
or recruited target-quilter evidence.

## Updated implementation entry

Start Codex from `10_CODEX_ENTRY_POINT.md`.
