# Quilt Utility Website — Initial SEO Content Briefs

**V1.1 scope:** These briefs are subordinate to `docs/v1.1/04_CONTENT_SEO_ROUTES.md` and shipped static pages. Use `src/pages/sitemap.xml.ts` for exact current routes and the page source for live metadata. `Quilter` is a provisional public name. The current build has 39 page routes and 38 sitemap entries; the retained `/corrections/` Feedback coming-soon page is intentionally `noindex` and omitted from the sitemap under the approved V2 deferral.

## Homepage

H1 direction: **Plan the Fabric for the Quilt You’re Already Making**
Message: Begin with cut requirements from a pattern or other source, account for actual fabric on hand, see any additional purchase, and follow one practical cutting plan.
Must communicate: free, no account, exact project-local stock geometry, planner-first, editable assumptions, and useful standalone calculators.

## Fabric Cutting Planner

Intent: reconcile an existing cut list across fabrics, finite stock pieces, and any newly purchased fabric into one executable plan.
H1: **Quilt Fabric Cutting Planner**
Must explain: tabular cut-list entry/import; finished vs cut size; usable WOF; directional constraints; joint allocation of different cuts within each fabric; stock-bin identity and geometry; raw additional purchase plus upward-rounded shopping quantity; purchased-bolt and stock cutting instructions; and practical, bounded optimization without a global-optimality claim. An optional pattern-stated yardage comparison uses a separate fresh-fabric scenario that ignores stock. It must never compare pattern yardage with the stock-aware purchase shortfall as if those were the same quantity.

## Fabric Yardage Calculator

Queries: quilt fabric calculator; fabric yardage calculator quilting; how much fabric for quilt pieces.
Must explain: pieces per WOF, rows, safety, purchase rounding.

## Quilt Backing Calculator

Queries: quilt backing calculator; backing yardage; how much backing for quilt.
Must explain: overage, usable width, panel count, vertical/horizontal seams, verify longarmer requirement.

## Quilt Batting Calculator

Must explain: batting overage, roll or package dimensions, coverage, and the selected purchase unit. Link to `/guides/how-much-extra-batting/`.

## Quilt Binding Calculator

Queries: quilt binding calculator; binding yardage; how many binding strips.
Must explain: perimeter, joining allowance, WOF strips, yardage.
State: straight/cross-grain binding only in V1.

## HST Calculator

Queries: HST calculator; half square triangle calculator; 2/4/8 at a time.
Must explain: exact vs trim-friendly, yield, starting squares, excess units, 4-at-a-time bias warning.

## QST Calculator

Must explain: starting-square size, yield, trim-friendly vs exact mode, and practical method limits.

## Flying Geese Calculator

Must explain: one-at-a-time and four-at-a-time methods, exact vs trim-friendly sizes, yield, and waste/handling tradeoffs.

## Block Count Calculator

Queries: quilt block calculator; how many blocks for queen quilt.
Must explain: whole blocks, across/down, resulting size, overshoot.

## Border Calculator

Queries: quilt border calculator; border yardage.
Must explain: straight non-mitered borders, side-first assumption, strip count, centre-measurement warning.

## Sashing Calculator

Queries: quilt sashing calculator; sashing yardage.
Must explain: row-wise model, no cornerstones/outer sashing, vertical pieces, horizontal strips, final dimensions.

## Pieces from Fabric Calculator

Must explain: how many specified pieces physically fit one finite rectangle, orientation and grain constraints, and usable leftovers. Use the planner's finite-stock geometry contract; equal area alone does not prove fit.

## WOF Guide

H1: **What Does WOF Mean in Quilting?**
Sections: definition, nominal vs usable width, selvage, common widths, editable defaults, worked example.

## Finished vs Cut Guide

H1: **Finished Size vs Cut Size in Quilting**
Sections: definitions, seam allowance, square example, pattern terminology, tool behavior.

## Seam Allowance Guide

H1: **Quilt Seam Allowance: Why 1/4 Inch Matters**
Sections: common default, conversion, cumulative effects, overrides.

## Backing Overage Guide

H1: **How Much Extra Backing Does a Quilt Need?**
Route: `/guides/how-much-extra-backing/`. Sections: why extra exists, 4"/side planning default, longarm variation, usable width.

## Yardage Guide

H1: **How to Calculate Fabric Yardage for a Quilt**
Route: `/guides/how-to-calculate-quilt-fabric/`. Sections: piece count, cut dimensions, usable WOF, pieces/row, rows, mixed pieces, safety, rounding.
Close with planner for multi-piece projects.

## Guides/help workflow

The shipped Guides hub and contextual help cover getting started, planner tutorial, entering a cut list, adding actual fabric pieces, checking pattern yardage, interpreting shopping and cutting plans, printing, and related task guides. Link each topic to its real route in `src/pages/sitemap.xml.ts`; preserve static content and accurate examples. The owner-operated MT-U01/MT-U02 cases passed on 2026-09-30, but they are not independent novice evidence.
