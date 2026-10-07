# QuiltClarity V1.1 — Current State Handoff

**Date:** 2026-08-17

**Continuation reconciled:** 2026-09-30. Implementation M0-M10 and the
Guides/help checkpoint are complete. M9 uses the approved guided-operator
substitution; Guides MT-U01/MT-U02 use owner evidence, not independent novice
validation. Current restart state lives in `../../CONTEXT.md` and
`../architecture/project-status.md`. Owner correction on 2026-10-01 confirms
trademark search and purchase of `quiltclarity.com` are complete. Public brand:
`QuiltClarity`; source activation completed on 2026-10-01 under
`../decisions/site-identity-activation.md`, including local legacy-key migration.

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

## V1.1 implementation work — completed

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
- M9 usability validation, including the explicit guided-validation substitution
  recorded in `../decisions/v1.1-m9-validation-substitution.md` when eligible
  target quilters were unavailable;
- current competitive same-job benchmark PASS.

These product checkpoints are recorded complete; retain their evidence limits.
They do not authorize purchase or production deployment. Continue through
`../launch/launch-readiness-status.md` and the reconciled domain/brand runbook
for dated public-origin QA and Search Console evidence. Source activation, hosted CI,
static Cloudflare deployment, redirects and automatic Builds pass as of 2026-10-01;
Search Console setup and public Chrome/Edge acceptance subsequently passed.
Post-launch continuation, including ads review, is routed through
`../architecture/continuation-roadmap.md`.
Do not repeat the already completed trademark search or domain purchase.
Feedback collection is deferred to V2 under
`../decisions/v1.1-feedback-system-deferral.md`; `/corrections/` remains a static
coming-soon page, noindex and omitted from the sitemap. No feedback inbox is a
V1.1 launch dependency.

## Bundle

This handoff belongs with the entire specification package. Start Codex from `08_CODEX_ENTRY_POINT.md`.
