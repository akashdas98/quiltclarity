# QuiltClarity V1.1 — Governing Product Agenda

**Status:** Highest-authority strategic contract  
**Date:** 2026-08-17

# 1. Why this agenda is being revised

The previous launch thesis centered on:

> piece list → quilt-aware yardage → practical cutting optimization → shopping quantity → visual cutting plan.

Competitive revalidation showed that this is not a sufficient reason to choose QuiltClarity. Current products already offer substantial combinations of mixed-piece fabric-saving layouts, cutting diagrams, project fabric calculations, broad calculator suites, and design-to-cut workflows.

That evidence deliberately overrides the old planner-centered differentiation. Existing domain math and engineering remain valuable, but they are now infrastructure inside a stronger job.

# 2. Governing product job

QuiltClarity exists for a quilter who already has **cut requirements**—from a purchased/free pattern, book, kit instructions, self-drafted plan, spreadsheet, notes, or another source—and needs to turn those requirements plus real fabric availability into a trustworthy execution plan.

Core job:

> **Take all the cuts this project requires, reconcile them by fabric, account for the exact fabric pieces I already have, tell me what additional fabric I actually need to buy, and give me one practical plan for cutting it.**

The product must not depend on the user digitally recreating the visual quilt.

# 3. Product reason-to-win

The reason-to-win is the **integrated compound workflow**, not any one feature:

1. fast external cut-list compilation;
2. whole-fabric joint planning across different required piece types;
3. optional comparison with pattern-stated yardage;
4. exact project-local finite-stock geometry;
5. stock-aware purchase-shortfall calculation;
6. one consolidated, labeled, executable cutting plan.

Supporting qualities:

- free web access;
- no required account;
- deterministic transparent math;
- useful standalone quilting calculators;
- printable results;
- editable assumptions;
- mobile-safe UX.

Supporting qualities do not substitute for the compound workflow.

# 4. Primary target state

Primary user starts with:

- a known quilt/project;
- known or discoverable cut requirements;
- fabric labels/colors/roles;
- possibly one or more actual fabric pieces already on hand.

Primary user wants:

- confidence before buying or cutting;
- less duplicated/manual fabric arithmetic;
- less scrap-reconciliation work;
- a clear shopping shortfall;
- a cutting plan they can execute.

# 5. Users not used to justify the product

Do not justify QuiltClarity around:

- users already fully served inside an integrated quilt-design environment;
- people merely because they are “not users” of a named competitor;
- users who only need one trivial arithmetic result;
- permanent stash catalogers as a primary audience.

A segment exists only when the specific job gives a rational reason to choose QuiltClarity over the best realistic alternative.

# 6. Scope

## 6.1 Main project workflow

Required:

- project and units;
- multiple fabrics;
- rapid multi-row cut-requirement entry;
- cut/finished dimensions;
- quantities and labels;
- fabric assignment;
- directional/rotation/WOF constraints;
- optional pattern-stated yardage and pattern-assumed WOF;
- zero or more actual stock pieces per fabric;
- finite-stock presets plus custom rectangular stock;
- joint stock + purchased-bolt planning;
- purchase shortfall;
- pattern/fresh-plan comparison;
- consolidated shopping list;
- stock allocation diagrams;
- purchased-fabric cutting diagram;
- practical cutting instructions;
- warnings and assumptions;
- print output;
- local persistence.

## 6.2 Standalone calculator set

Required:

1. Fabric Yardage
2. Quilt Backing
3. Quilt Batting
4. Quilt Binding
5. Half-Square Triangle
6. Quarter-Square Triangle
7. Flying Geese
8. Quilt Block Count / Size
9. Borders
10. Sashing
11. Pieces from Fabric / Stock Fit

These are first-class utilities and search surfaces. They are not merely funnel pages.

# 7. Explicit non-goals

Do not add:

- full visual quilt design;
- pattern marketplace;
- permanent/global stash inventory;
- accounts/cloud projects;
- community/social;
- automatic PDF/image ingestion;
- AI interpretation;
- pattern generation;
- semantic whole-pattern resizing;
- arbitrary polygons or curved-piece packing;
- appliqué/foundation-paper-piecing optimization;
- hundreds of predefined blocks;
- paid subscription architecture.

# 8. Architecture constraints

Preserve:

- Astro static-first site;
- plain TypeScript domain ownership;
- React/islands only where interaction complexity warrants;
- browser-side core calculation;
- localStorage persistence;
- deterministic outputs;
- SVG diagrams from actual placement geometry;
- useful static content before hydration.

No runtime application backend is needed for this scope.

# 9. Domain philosophy

> **Defaults are convenience, not truth.**

Separate:

- mathematical invariants;
- editable product defaults;
- practice warnings/guidance.

Never convert a common quilting practice into a hidden universal rule.

# 10. Optimization philosophy

QuiltClarity must generate a **practical deterministic plan**.

For fresh-bolt planning:

1. validity;
2. practical strip-based cutting;
3. low fabric length;
4. low cutting complexity;
5. low fragmentation;
6. low waste.

For stock-aware planning:

1. valid accounting of all requirements;
2. low additional fabric purchase;
3. practical cutting;
4. useful/preserved leftovers;
5. low fragmentation/waste;
6. deterministic tie-break.

Exact global optimality is not required and must not be claimed.

# 11. Evidence-over-agenda rule

This agenda prevents accidental drift; it does not protect a bad strategy.

If implementation, user testing, or current competitive evidence materially invalidates the reason-to-win:

1. flag the conflict;
2. show evidence;
3. stop launch if necessary;
4. revise deliberately.

Goal hierarchy:

> **successful useful product > validated evidence > current agenda > implementation convenience**

# 12. Divergence protocol

For any proposed scope/product/domain departure:

```text
DIVERGENCE FLAG

Proposed change:
Relevant governing clause:
Why it diverges:
Evidence/requirement:
Impact on reason-to-win:
Impact on correctness:
Recommendation:
- reject
- defer
- intentionally revise
```

No silent product evolution.

# 13. Launch doctrine

Technical completion is not launch permission.

Launch requires:

- Golden/domain correctness;
- complete compound workflow;
- acceptable usability;
- correct production SEO/content implementation;
- privacy-safe analytics;
- competitive regression gate passed.

If current competitors can now complete the same target job comparably with no material residual advantage for QuiltClarity, launch is blocked even if implementation is finished.
