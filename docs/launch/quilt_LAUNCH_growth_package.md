# Quilt Utility Website — Launch & Growth Package

**Status:** Pre-deployment V1.1 companion package, reconciled 2026-09-30 and corrected 2026-10-01. Owner confirmed trademark search and purchase of `quiltclarity.com` completed long ago. Public brand is `QuiltClarity`; local source activation is complete under `../decisions/site-identity-activation.md`.
**Date:** 2026-08-06
**Governing sources:** `docs/v1.1/00_GOVERNING_AGENDA.md` through `06_COMPETITIVE_BENCHMARK_GATE.md`, with approved validation and Feedback decisions. Shipped routes and the closed event schema are authoritative in `src/pages/sitemap.xml.ts` and `src/lib/analytics/analytics.ts`.

## Launch objective

Deploy a trustworthy, fast, static-first quilting utility site that:

1. turns externally sourced cut requirements and real fabric availability into one executable project plan;
2. is immediately understandable;
3. is crawlable and measurable;
4. can be considered for optional AdSense review after a live-site quality review;
5. uses real Search Console and product data to drive expansion.

> Useful product first → indexation → real Search Console data → evidence-driven expansion → monetization optimization

## Positioning

Primary promise:

> **Turn the cuts your quilt requires into a practical plan for the fabric you have and the fabric you need to buy.**

Supporting copy:

> Enter or paste a tabular cut list, assign fabrics, add actual rectangular pieces on hand, and get a stock-aware shopping plan and cutting instructions. Compare pattern-stated yardage with a separate fresh-fabric scenario when useful.

Do not position this as AI, a full quilt designer, a marketplace, or a generic calculator directory.

## Homepage structure

1. Hero
   - H1 direction: **Plan the Fabric for the Quilt You’re Already Making**
   - Copy direction: Start from a pattern or other cut list, account for the fabric you have, and see what to buy and how to cut it.
   - Primary CTA: **Plan My Fabric**
   - Secondary CTA: **Use a Calculator**
2. “From piece list to cutting table”
   - enter or paste cut requirements and assign fabrics
   - add exact stock pieces and optional pattern yardage
   - reconcile stock and additional purchase
   - print the geometry-backed cutting plan
3. Calculator entry points
   - Fabric Yardage
   - Backing and Batting
   - Binding
   - HST, QST, and Flying Geese
   - Block Count
   - Borders
   - Sashing and Pieces from Fabric
4. Trust section
   - editable WOF
   - editable seam allowance
   - directional fabric respected
   - practical optimizer, not fake global-optimum claims
5. Guide links
6. Footer
   - About
   - Feedback (coming soon at `/corrections/`)
   - Privacy
   - Terms / Disclaimer as appropriate to the real operator and deployment
   - tool + guide navigation

## Initial SEO routes

Product/tool pages:

- `/fabric-cutting-planner/`
- `/calculators/` and the 11 calculator routes in `src/pages/sitemap.xml.ts`, including batting, QST, flying geese, and pieces from fabric.

Guides:

- `/guides/` and the shipped foundational and Guides/help routes in `src/pages/sitemap.xml.ts`.
- `/corrections/` remains an accessible static Feedback coming-soon page, marked `noindex` and excluded from the sitemap. The Feedback System is deferred to V2; no inbox is a V1.1 launch dependency.

The current build has 39 page routes and 38 sitemap entries. Use shipped pages for current title, description, and H1 wording; the working copy below is historical direction, not an instruction to revert V1.1 content.

Do not mass-generate numeric pages at launch.

## Working titles / meta

### Fabric Cutting Planner

Title: **Quilt Fabric Cutting Planner — Yardage & Cutting Layout**
Description direction: Enter a pattern or other cut list, use exact fabric pieces on hand, see additional purchase and practical cutting instructions, and compare pattern yardage with a separate fresh-fabric plan.

### Fabric Yardage

Title: **Quilt Fabric Yardage Calculator — Pieces to Fabric**
Description: Calculate how much quilting fabric you need from piece size, quantity, usable fabric width, seam allowance, and safety margin.

### Backing

Title: **Quilt Backing Calculator — Backing Size & Yardage**
Description: Calculate quilt backing dimensions, panel layout, seams, and yardage with editable backing overage and fabric width.

### Binding

Title: **Quilt Binding Calculator — Strips & Yardage**
Description: Calculate binding length, strip count, and fabric yardage for straight-grain quilt binding.

### HST

Title: **Half Square Triangle Calculator — 2, 4 & 8 at a Time**
Description: Calculate starting-square sizes and quantities for 2-at-a-time, 4-at-a-time, and Magic 8 half-square triangles.

### Block count

Title: **Quilt Block Calculator — Blocks for Any Quilt Size**

### Borders

Title: **Quilt Border Calculator — Strip Count & Yardage**

### Sashing

Title: **Quilt Sashing Calculator — Strip Count & Yardage**

## Page content standard

Every calculator/tool page should include:

1. clear H1;
2. calculator near top;
3. short task explanation;
4. assumptions/defaults;
5. worked example;
6. methodology;
7. edge cases;
8. related tools;
9. planner CTA where relevant;
10. references where a domain convention warrants them.

The planner must also explain stock geometry, purchase shortfall, fresh-fabric pattern comparison, and why its diagrams and text refer to the same placements. No generic filler.

## Supporting guides

### WOF

Explain nominal vs usable width, selvage, why defaults differ, and how to measure/override.

### Finished vs cut size

Explain seam allowance and finished-to-cut conversion.

### Seam allowance

Explain common 1/4" default, cumulative effects, and user override.

### Backing overage

Explain why backing is larger, the 4"/side planning default, longarmer variation, and wide-back fabric.

### Yardage calculation

Teach the manual logic, then show why multi-piece/multi-fabric projects benefit from the planner.

## Internal linking

Planner → cut-list, stock, pattern-comparison, shopping/cutting, WOF, finished/cut, seam allowance, and relevant calculators.

Each calculator → planner + relevant guide + 1–2 adjacent tools.

Avoid bloated repetitive related-link blocks.

## Technical SEO launch checklist

- unique title + description
- canonical
- correct lang
- semantic headings
- meaningful static HTML
- crawlable links
- sitemap
- robots.txt
- no accidental noindex
- preserve intentional `noindex` on the Feedback coming-soon page and omit it from the sitemap
- no staging canonicals
- no broken internal links
- Open Graph basics
- favicon
- 404
- HTTPS
- Core Web Vitals check
- minimal JS on guide pages

## Search Console setup

At launch:

1. verify domain property;
2. submit sitemap;
3. inspect homepage;
4. inspect planner;
5. inspect calculator pages;
6. monitor indexation;
7. monitor Performance by Query/Page/Country/Device.

Track impressions, clicks, CTR, and average position.

## Analytics

`src/lib/analytics/analytics.ts` is the closed event and property contract. It includes calculator start/completion/error, planner configuration and calculation, stock sufficiency and purchase shortfall, pattern and cutting views, printing/copying, Guides/help interactions, and an allow-listed `returning_user` boolean. Consume only the implemented event names and their exact typed properties; do not add `piece_added`, `diagram_viewed`, `add_to_planner`, arbitrary dimensions, or user-entered metadata. Never send project or fabric names, notes, pasted rows, piece labels, exact dimensions, or identifiers. The returning-user category uses only the separate date-only `quiltclarity:analytics-first-used-date` (legacy `quilter:*` is migration input only) local marker. Analytics failure must never block a calculation.

## Weekly launch dashboard

SEO:

- organic impressions
- clicks
- indexed pages
- number of queries
- top-20 / top-10 queries
- CTR by landing page

Product:

- calculator completions
- planner starts/completions using `planner_started` and `plan_calculation_completed`
- optimization completions
- stock-allocation, yardage-comparison, and cutting-plan views
- print rate
- copy-shopping-list use and the allowed returning-tool-user category

Diagnostics:

- validation-error rate
- JS errors
- observed mobile usability issues
- impression-rich pages with weak CTR
- pages ranking 8–20

## Post-launch cadence

### First 72 hours

Check reachability, canonicals, sitemap, robots/noindex including the intentional Feedback exception, analytics delivery/privacy, calculator errors, mobile UX, and print.

### End of week 1

Check indexation, first impressions, unexpected queries, obvious UX failures.

### Weeks 2–4

Classify queries:

- existing page / correct intent
- existing page / missing sub-answer
- distinct new recurring task
- irrelevant

### Month 2+

Expand only from evidence.

## AdSense readiness

AdSense is an optional post-live decision. At the time of an application, check current primary provider guidance on original useful content, navigation, ownership, UX, and policy compliance. Do not use an arbitrary article-count gate.

Apply when the site is complete and useful, not when an arbitrary page count is reached.

Before applying:

- custom domain
- working core calculators + planner
- foundational guides
- clear navigation
- About
- operator contact information only when a real channel is configured; the V1.1 Feedback page is coming soon
- Privacy
- Terms/Disclaimer as appropriate
- no placeholders
- no empty/thin pages
- good mobile UX
- crawlable site

## Initial ad-placement principles

After approval, begin conservatively.

Good:

- below completed result
- after methodology/explanation
- between substantive guide sections
- desktop side area if unobtrusive

Avoid:

- between input and result
- near buttons in a way that encourages accidental clicks
- misleading labels
- fake navigation
- aggressive above-fold density

## Affiliate strategy

Optional upside only.

Natural categories:

- wide-back fabric
- rulers
- rotary cutters
- mats
- batting
- notions

Only add where it solves the next user task.

## Competitor benchmark before deployment

The V1.1 M10 same-job C1–C5 competitive gate passed on 2026-08-31. Use `v1.1-m10-competitive-launch-gate-2026-08-31.md` for its first-party sources, limits, and PASS conclusion. Refresh the comparison if material new evidence changes the same-job boundary; do not reopen it as an unperformed initial V1 gate.

Evaluate:

1. time to answer
2. account requirement
3. confusing fields
4. assumption visibility
5. mixed-piece support
6. multiple fabrics
7. cutting diagram
8. cutting instructions
9. mobile
10. print
11. trust/explanation
12. speed
13. free/paid boundary

Question:

> **Can a quilter take externally sourced cuts through exact stock, additional purchase, optional fresh-fabric pattern comparison, and executable cutting without an outside reconciliation step?**

## Domain / brand rules

Do not buy an expensive aftermarket exact-match domain.

Prefer:

- easy spelling/pronunciation
- quilting adjacency
- room for planner + calculators
- low incumbent confusion
- ideally `.com`

Avoid “QuiltMath” because quiltmath.net already exists.

`quiltclarity.com` is purchased and trademark search is complete per owner confirmation on 2026-10-01. Follow Phase 5 of `domain-brand-selection-and-activation.md` for post-purchase replacement. The old candidate review and pre-purchase handoff are historical, not pending tasks. Completion confirmation does not assert legal clearance.

Do not repeat the completed search or domain purchase.

## Deployment gate

Ready when:

1. M0–M10 and required divergence reviews remain complete under their recorded decisions; M9 used the approved guided-operator substitution without external U01–U05 sessions, and the Guides/help owner MT-U01/MT-U02 cases passed on 2026-09-30 without independent novice evidence;
2. current G01–G45 and separate D01–D05 regression coverage plus invariant tests pass;
3. the recorded M10 competitive gate remains valid;
4. launch content complete;
5. technical SEO passes;
6. the closed analytics contract is verified; Search Console ownership and sitemap submission are completed at the public-origin stage;
7. mobile/print QA passes;
8. no placeholders;
9. the final domain and brand are selected, purchased, connected, and reflected in `SITE_URL` and public copy;
10. no known trust-breaking blocker.

## Final principle

> **Launch a small site that is exceptionally useful, measurable, and trustworthy. Let real search demand decide how large it becomes.**
