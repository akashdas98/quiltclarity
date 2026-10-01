# Quilt Utility Website — V1 Product Specification

**Status:** Implementation-ready product specification  
**Version:** 1.1 — FINAL V1 baseline  
**Date:** 2026-08-06

---


# 0. Governing Product Agenda & Divergence Control

This section is the **crystallized V1 agenda** and is the governing baseline for all future decisions.

## 0.1 Crystallized V1 agenda

The product is:

> **A free, SEO-led quilting math and cutting-planning website whose core workflow is: piece list → quilt-aware yardage calculation → practical cutting optimization → shopping quantity → visual cutting plan.**

The product is **not** primarily:
- a generic calculator directory;
- a full quilt designer;
- a pattern marketplace;
- a stash/inventory app;
- an AI quilting assistant;
- a social/community product.

The core V1 value proposition is:

> **Tell us what pieces you need. We’ll tell you how much fabric to buy and exactly how to cut it.**

Supporting calculators exist to:
1. solve common quilting-math tasks well;
2. acquire organic search traffic;
3. funnel relevant users into the Fabric Cutting Planner.

The planner remains the product center.

## 0.2 V1 strategic constraints

All new decisions must preserve these constraints unless this specification is deliberately revised:

- free web access;
- no required account;
- no paid API dependency;
- no application backend, database, or authentication in V1;
- Astro static-first architecture;
- JavaScript shipped only where interaction requires it;
- deterministic math for core results;
- practical cutting plans rather than mathematically exotic packing;
- explicit, editable assumptions instead of hidden quilting “truths”;
- beginner-friendly default UX with expert overrides;
- SEO pages must provide real utility, not scaled thin content;
- V1 remains focused on quilt math + fabric cutting;
- post-launch expansion is driven by real Search Console and product-usage evidence.

## 0.3 Divergence check

Before accepting any new:
- feature;
- UX decision;
- domain rule;
- engineering shortcut;
- SEO page type;
- monetization decision;
- new dependency;
- data model expansion;
- V1 scope addition;
- product positioning change;

perform this check:

### A. Does it strengthen the core workflow?
If yes, continue evaluation.

### B. Is it required for a locked V1 acceptance criterion?
If yes, it is likely in scope.

### C. Does it pull the product toward a deferred category?
Examples:
- full design software;
- accounts/cloud projects;
- AI;
- marketplace/community;
- stash management;
- arbitrary shape/PDF interpretation.

If yes, treat it as **scope divergence**.

### D. Does it alter a locked domain rule?
If yes, compare against the Golden Domain Rules & Test Fixtures before proceeding.

### E. Does it introduce cost or operational complexity that V1 does not need?
If yes, reject unless there is a concrete requirement.

### F. Is the justification based on evidence or merely “this would be nice”?
Nice-to-have alone is insufficient for V1.

## 0.4 Required divergence response

If a proposed decision diverges from this agenda, do **not** silently evolve the product.

Instead record:

> **DIVERGENCE FLAG**  
> Proposed change:  
> Current agenda/spec rule:  
> Why this diverges:  
> Evidence/requirement motivating the change:  
> Recommendation: reject / defer / intentionally revise spec

Only after an intentional product decision should the governing agenda itself be changed.

## 0.5 Decision hierarchy

When resolving future questions, use this order:

1. **Crystallized V1 agenda**
2. **Golden Domain Rules & Test Fixtures**
3. **V1 Product Specification**
4. **Codex Technical Handoff**
5. implementation convenience

Engineering convenience must never override product intent or domain correctness.

## 0.6 Anti-drift rule

The fact that implementation has begun does not make an implementation choice part of the product.

If code, architecture, or a newly discovered competitor pressures the product away from the agenda, stop and evaluate the divergence explicitly.

The default action for an attractive but nonessential addition is:

> **defer, do not absorb.**

## 0.7 Post-launch revision rule

The agenda may evolve after launch, but only from evidence such as:

- Search Console query/impression patterns;
- calculator/planner completion rates;
- print/share behavior;
- repeat usage;
- recurring user confusion;
- observed cutting-plan failures;
- strong unmet adjacent demand.

A new idea by itself is not sufficient evidence.

---


## 0.8 Evidence-over-agenda rule

The governing agenda exists to prevent accidental drift, **not to protect a mistaken strategy**.

If new evidence materially demonstrates that the current agenda is wrong, suboptimal, or incompatible with the actual goal of building a successful product, the agenda **may and should be changed deliberately**.

Examples of sufficient evidence may include:

- real user behavior contradicting a core product assumption;
- Search Console data showing materially different demand than expected;
- repeated user failure or confusion around the core workflow;
- competitor or market changes that invalidate the original positioning;
- domain research revealing that a locked rule produces impractical outcomes;
- monetization evidence showing the current product shape cannot support the intended business model;
- technical constraints that make the current agenda materially inferior to a better validated approach.

When this happens:

1. flag the conflict explicitly;
2. state which agenda assumption has been disproved or weakened;
3. show the evidence;
4. propose the revised agenda;
5. update the governing specification intentionally.

The hierarchy is therefore:

> **Goal of a successful product > validated evidence > current agenda > implementation convenience**

The agenda is authoritative **until evidence justifies revising it**.

---

# 1. Product Definition

## Core promise

> **Tell us what pieces you need. We’ll tell you how much fabric to buy and exactly how to cut it.**

The product is a free, SEO-led quilting utility website.

Its core V1 differentiator is the full workflow:

> **Piece list → quilt-aware yardage calculation → practical cutting optimization → shopping quantity → visual cutting plan**

The supporting calculators exist as both useful standalone tools and SEO acquisition surfaces.

# 2. V1 Goals

V1 must prove three things:

1. Quilters can successfully use the planner without needing to understand fabric-yardage math.
2. The generated cutting plans are practical enough to trust and print.
3. Search engines surface the site for a growing set of quilting-math queries.

V1 does **not** need to prove monetization at scale.

# 3. Primary User

A quilter who:

- has a quilt design or piece list;
- knows how many pieces of each fabric are required;
- does not want to manually calculate yardage;
- may be self-drafting a quilt;
- may understand quilting terminology but not the arithmetic;
- wants to know what to buy before visiting a fabric shop;
- wants a cutting plan they can actually follow.

Secondary users:

- beginners using simple calculators;
- experienced quilters checking their math;
- pattern designers validating yardage;
- quilters planning backing/binding/HSTs.

# 4. Core User Journey

1. User opens **Fabric Cutting Planner**.
2. User chooses inches/yards or centimetres/metres.
3. User creates Fabric A.
4. User enters fabric settings.
5. User adds required pieces.
6. User optionally creates more fabrics.
7. User clicks **Calculate cutting plan**.
8. System validates inputs.
9. System computes candidate layouts.
10. System returns the calculated plan length, recommended purchase quantity, cutting list, visual cutting layout, assumptions, warnings, and waste estimate.
11. User may change assumptions, recalculate, print, share, or add results from standalone calculators.

No signup is required.

# 5. Planner Inputs

## 5.1 Project-level

Required:
- unit system

Optional:
- project name

Default state:
- one fabric;
- one piece group.

## 5.2 Fabric entity

Required:
- name
- fabric width
- usable width

Advanced:
- directional / non-directional
- default rotation allowed
- safety allowance
- purchase increment
- notes

Recommended imperial defaults:
- fabric width: 42 in
- usable width: 40 in
- directional: false
- default rotation allowed: true
- safety allowance: 5%
- purchase increment: 1/8 yard

Recommended metric defaults:
- fabric width: 107 cm
- usable width: 102 cm
- directional: false
- safety allowance: 5%
- purchase increment: 0.1 m

All defaults are editable convenience values, not universal truths.

# 6. Piece Entity

Required:
- label
- quantity
- width
- height
- dimension mode: `cut` or `finished`

Advanced:
- rotation allowed
- orientation constraint: `none`, `crosswise`, `lengthwise`
- WOF-strip designation
- notes

Do not model arbitrary print alignment or freeform pattern pieces in V1.

# 7. Finished vs Cut Size

If the user enters cut size, use dimensions exactly as entered.

If the user enters finished size, convert with seam allowance.

Default seam allowance:
- 1/4 in imperial
- 6.35 mm metric

For a rectangular piece:

`cutWidth = finishedWidth + 2 × seamAllowance`

`cutHeight = finishedHeight + 2 × seamAllowance`

The UI must display the conversion used.

# 8. Validation Rules

Block calculation for:
- quantity <= 0
- width <= 0
- height <= 0
- usable width <= 0
- usable width > fabric width
- piece exceeds usable width in every permitted orientation
- WOF strip conflicts with orientation constraint
- invalid finished dimensions
- non-numeric values

Never silently modify invalid input.

# 9. Cutting Optimizer

## Goal

Produce a **practical, efficient quilting layout**, not merely a theoretical packing optimum.

Priority order:
1. valid placement
2. practical strip-based cutting
3. low fabric length
4. low cutting complexity
5. low fragmentation
6. low waste

# 10. Candidate Generation

For each fabric:

1. normalize pieces to cut dimensions;
2. enforce orientation constraints;
3. group identical pieces;
4. identify strip-friendly groups;
5. generate deterministic candidate orderings;
6. attempt row/strip packing;
7. fill compatible leftover spaces;
8. test legal rotations;
9. score candidates;
10. select the best practical plan.

Candidate orderings should include at least:
- largest area first
- tallest first
- widest first
- most constrained first
- highest quantity first
- strip-friendly first

Exact global optimality is not required. The UI must state: “This is a practical optimized plan, not a mathematically proven global optimum.”

# 11. Optimization Mode

V1 exposes one mode:

## Recommended

Balance fabric efficiency with cutting simplicity.

Do not add “minimum yardage” or “simplest cuts” modes until the default workflow is validated.

# 12. Yardage Result Model

For every fabric show:

1. **Calculated plan length** — raw length used by the chosen layout.
2. **Safety-adjusted requirement** — after selected buffer.
3. **Recommended purchase quantity** — rounded upward to the selected purchase increment.

Never round to the nearest increment; always round up.

# 13. Visual Cutting Plan

The diagram must be generated from actual placement geometry.

Show:
- usable fabric width
- total used length
- piece rectangles
- labels / group IDs
- dimensions
- strip boundaries
- waste / unused regions
- fabric-direction indicator when relevant

SVG is appropriate for V1.

Requirements:
- scalable
- printable
- readable on desktop
- labels avoid overlap where possible
- tiny repeated pieces may use group notation

# 14. Cutting List

Generate practical instructions such as:

> Cut 6 × 3½" WOF strips.  
> Subcut 48 × 3½" squares.  
> Cut 4 × 6½" WOF strips.  
> Subcut 24 × 3½" × 6½" rectangles.

If smaller pieces are placed in leftovers, identify exactly where/how rather than using vague language.

# 15. Trust / Explainability Layer

Every result shows:

## Assumptions used
- fabric width
- usable width
- seam allowance
- safety allowance
- purchase rounding
- directional state
- rotation state

## Why this result?
Concise explanation of the relevant math/layout.

## Warnings
Examples:
- directional fabric disabled rotation
- piece cannot fit in current WOF
- verify longarmer backing requirement
- plan is heuristic/practical, not globally proven optimal

# 16. Standalone Calculators

## 16.1 Fabric Yardage Calculator

Inputs:
- piece width/height
- quantity
- usable WOF
- rotation
- safety allowance
- finished/cut mode

Outputs:
- pieces per row
- rows required
- calculated plan length
- recommended purchase
- compact layout

CTA: **Add to Cutting Planner**

## 16.2 Quilt Backing Calculator

Inputs:
- quilt width/length
- usable backing fabric width
- overage per side
- directional fabric

Default overage:
- 4 in per side, editable

The UI may explain that professional longarmers often specify their own requirement, but V1 does not encode separate domestic/hand presets as authoritative rules.

Outputs:
- target backing dimensions
- panel count
- vertical-seam option
- horizontal-seam option where applicable
- yardage for each candidate
- every valid candidate
- lowest-yardage option, labeled “Uses least fabric” or “Lowest-yardage option”
- warning that seam orientation depends on print direction and quilting setup, with longarmer preferences confirmed before purchase

The editable 4-inch backing overage is a longarm-oriented default. Requirements vary; the UI must tell users to confirm with their quilter before purchasing.

## 16.3 Binding Calculator

Inputs:
- quilt width/length
- binding strip width
- usable fabric width
- joining allowance

Outputs:
- perimeter
- strips required
- total binding length
- yardage

V1: straight-grain binding only.

## 16.4 HST Calculator

Methods:
- 2-at-a-time
- 4-at-a-time
- 8-at-a-time

Inputs:
- finished HST size
- quantity
- method
- sizing mode: Standard or Trim-friendly
- seam allowance (default 1/4")

Outputs:
- starting-square size
- starting squares required
- HSTs produced
- optional fabric estimate

Each method owns its own formula/yield logic.

## 16.5 Block Count Calculator

Inputs:
- target quilt width/length
- finished block width/height
- optional sashing

Outputs:
- blocks across/down
- total blocks
- resulting quilt size
- under/over target difference

## 16.6 Borders Calculator

V1 supports straight, cross-grain, non-mitered borders.

Inputs:
- quilt-top dimensions
- finished border width
- number of equal-width border layers
- usable WOF
- seam allowance
- handling/cutting buffer (default 10")
- join seam allowance (default 1/4")

Default construction order:
- side borders first
- top/bottom borders second

Outputs:
- cut strip width
- nominal side-border and top/bottom-border lengths by layer
- total WOF strips required
- planning yardage
- final quilt dimensions
- warning: “Before cutting the final border lengths, measure the assembled quilt top through the center in multiple places and use the chosen measured/averaged length.”

Visible assumption: “Straight, non-mitered borders · WOF/cross-grain strips · side borders first”. Input dimensions are planning/current quilt-top dimensions.

## 16.7 Sashing Calculator

V1 supports row-wise sashing **without cornerstones or outer sashing**.

Inputs:
- block columns/rows
- finished block dimensions
- finished sashing width
- usable WOF
- seam allowance
- handling/cutting buffer (default 10")
- join seam allowance (default 1/4")

Outputs:
- short vertical sashing piece count and cut size
- horizontal sashing row count and cut size
- total strip length
- WOF strips required
- yardage
- resulting finished quilt dimensions

Cornerstones, outer sashing, and alternative assembly models are deferred.

The UI must state “Row-wise sashing · No cornerstones · No outer sashing”, warn when long horizontal rows require piecing, and explain that yardage includes join loss.

# 17. Simple vs Advanced UX

Simple mode exposes only minimum inputs.

Advanced settings contain:
- usable WOF
- seam allowance
- orientation
- safety allowance
- purchase increment
- fabric direction

Core principle:

> The user should not need to know quilting math to use the product.

# 18. Result Actions

V1:
- Print
- Copy summary
- Share link if practical without backend
- Add calculator result to planner
- Edit assumptions

No account required.


# 18A. Locked V1 Architecture

This is an intentional V1 architecture decision and must be checked against the governing agenda like any other major choice.

## Site framework

- **Astro**
- static-first rendering
- SEO/content pages emitted as crawlable HTML by default

## Interactive code

- shared quilting/domain/optimizer logic: **plain TypeScript**
- simple calculators: **vanilla browser TypeScript where practical**
- Fabric Cutting Planner: may use **one React island** if its stateful UI is materially easier to maintain that way
- do not convert the entire site into a React application
- do not split one tightly coupled planner into many islands merely to maximize “Astro purity”

The goal is minimal JavaScript without sacrificing maintainability.

## Backend

**None in V1.**

Core functionality must not require:
- application server;
- database;
- authentication;
- server API;
- AI API.

Calculations, optimization, SVG generation, and planner state all run client-side.

## Persistence

V1 persistence is localStorage only.

## Hosting model

V1 should be deployable as a static Astro site on a free static-hosting tier.

## Backend introduction rule

A backend is deferred. It may be introduced only if validated evidence creates a requirement such as:
- cloud-saved projects;
- cross-device sync;
- persistent server-backed share links;
- accounts;
- payments;
- community features.

Adding a backend merely because it is conventional is a **scope divergence**.


# 19. Persistence

V1 uses localStorage only.

Save:
- most recent planner state
- user defaults where useful

No cloud persistence.

# 20. SEO Page Requirements

Every calculator page contains:
1. task-focused H1
2. usable calculator near the top
3. one-sentence value proposition
4. assumptions explanation
5. worked example
6. short methodology section
7. real FAQs when available
8. related-tool links
9. planner CTA
10. unique metadata

No filler copy.

# 21. Initial Routes

- `/`
- `/fabric-cutting-planner`
- `/calculators/fabric-yardage`
- `/calculators/quilt-backing`
- `/calculators/quilt-binding`
- `/calculators/half-square-triangle`
- `/calculators/quilt-block-count`
- `/calculators/borders`
- `/calculators/sashing`
- `/guides/width-of-fabric`
- `/guides/finished-vs-cut-size`
- `/guides/quilt-seam-allowance`
- `/guides/backing-overage`
- `/guides/how-to-calculate-quilt-yardage`

# 22. Analytics

Track:
- tool viewed
- tool started
- result generated
- planner started
- fabric added
- piece added
- optimization completed
- diagram viewed
- advanced settings opened
- print
- share
- add-to-planner

Do not send personally identifying project content in analytics.

# 23. Accessibility

Requirements:
- keyboard operable
- visible form labels
- field-linked errors
- sufficient contrast
- textual equivalent for the SVG cutting plan via cutting list
- no color-only meaning
- readable grayscale print output

# 24. Performance

- SEO/content pages statically rendered by Astro
- client-side calculation/optimization
- no application backend in V1
- no AI calls
- no blocking external API
- minimal JavaScript on non-interactive pages
- simple calculators prefer vanilla TypeScript over unnecessary React hydration
- cap unusually large optimization workloads rather than freezing the browser

# 25. V1 Acceptance Criteria

V1 is shippable when:

1. multiple fabrics can be defined;
2. multiple rectangular piece groups can be defined;
3. finished-size conversion works;
4. directional/rotation constraints are respected;
5. a valid practical layout is generated;
6. exact and purchase yardage are shown;
7. a readable cutting list is generated;
8. an actual visual cutting diagram is generated;
9. assumptions are visible/editable;
10. planner prints cleanly;
11. standalone calculators work;
12. calculator results can feed planner where relevant;
13. no account is required;
14. analytics/Search Console setup is ready;
15. core formulas have automated tests;
16. manually verified quilting test cases pass.

# 26. Deferred Decisions

Not blockers:
- paid tier
- accounts
- exact global optimization
- arbitrary polygon packing
- cloud saves
- full quilt visual designer
- PDF/image import
- community
- stash tracking

# 27. Business Validation After Launch

Decision signals:
- Search Console impressions
- ranking movement
- planner completion
- print rate
- return usage
- query expansion

Do not expand because features are imaginable. Expand in response to actual search/user behavior.

# 28. Product Principle

> **Math should disappear; assumptions should not.**

The user experiences a simple planner while retaining visibility into how recommendations were produced.


---

# 29. Authoritative Domain Contract

The implementation must also comply with:

`quilt_golden_rules_and_test_fixtures.md`

If an earlier section of this product specification conflicts with that document, the Golden Domain Rules document wins for V1.

Important reconciliations:

- backing generic overage default is 4" per side; do not hard-code a 2" domestic-machine preset as authoritative;
- backing calculations operate on explicitly usable backing width;
- backing panel joins default to 1/2" seam allowance per joined panel edge;
- 2-, 4-, and 8-at-a-time HST behavior is fully specified in the Golden Domain Rules;
- 4-at-a-time HSTs use `unfinished size × √2 + 2 × seam allowance`; Standard rounds upward to the next 1/4", and Trim-friendly adds 1/4";
- trim-friendly HST sizes are the default UI recommendation while exact sizes remain visible;
- V1 sashing follows an explicitly stated row-wise construction assumption.

With the Golden Domain Rules and fixtures present, quilting-domain decisions are no longer delegated to engineering.
