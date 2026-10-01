# Static SEO, Content, and Trust Routes

## Status

Superseded for the active route count and V1.1 content surface by
`v1.1-static-route-and-calculator-expansion.md` and the post-M10 Guides/help
checkpoint. The canonical-origin, structured-data, trust-route, staging, and
no-mass-generation rules below remain active. The active sitemap contains 39
indexable routes before Feedback was deferred; the current sitemap lists 38.
Contextual-help keys do not create indexable pages.

The [2026-10-01 identity activation](site-identity-activation.md) supersedes
the provisional name and reserved origin below: public identity is QuiltClarity
and the build defaults to `https://quiltclarity.com`, with a `SITE_URL` override.

The correction-report route's original contact intent is superseded by the
[2026-09-30 Feedback System deferral](v1.1-feedback-system-deferral.md).
It retains its URL as a static Feedback coming-soon page with useful help links,
is marked noindex, and is omitted from the sitemap pending an indexing review
when the Feedback System ships.

## Decision

Quilter ships the 15 initial product routes plus three production trust routes:
`/about/`, `/methodology/`, and `/corrections/`. All 18 indexable routes are
hand-authored or explicit product pages. This deliberate trust-layer extension
implements the supplemental Production UX/Content/SEO specification without
adding a new calculator, guide topic, or product capability.

Every route receives a pathname-derived canonical URL through the shared
layout. `SITE_URL` supplies the canonical, sitemap, and robots origin at build
time; the reserved `https://quilter.example` origin is used only for
deterministic local builds. A staging deployment may set
`PUBLIC_ROBOTS_NOINDEX=true`; production must not. The explicit sitemap excludes
the custom 404 route.

The homepage emits `WebSite` structured data. Indexable subpages emit
`BreadcrumbList`, and interactive tools additionally emit `WebApplication`.
Markup is limited to visible, supportable claims: no FAQ or HowTo rich-result
markup is used.

## Query-to-page map

| Page                                      | Primary intent                          | Secondary intent                | Next action                |
| ----------------------------------------- | --------------------------------------- | ------------------------------- | -------------------------- |
| `/`                                       | find quilt fabric math tools            | understand site value and trust | planner or calculator      |
| `/fabric-cutting-planner/`                | plan cuts for a quilt piece list        | shopping yardage and diagrams   | calculate/print            |
| `/calculators/`                           | choose a quilting calculator            | compare available tasks         | calculator                 |
| `/calculators/fabric-yardage/`            | calculate repeated-piece yardage        | rows, rotation, usable WOF      | result/planner             |
| `/calculators/quilt-backing/`             | calculate backing panels and yardage    | seam direction and overage      | result                     |
| `/calculators/quilt-binding/`             | calculate binding strips and yardage    | binding length                  | result                     |
| `/calculators/half-square-triangle/`      | calculate HST starting squares          | compare 2/4/8 methods           | result/planner             |
| `/calculators/quilt-block-count/`         | calculate whole quilt blocks            | resulting quilt size            | result                     |
| `/calculators/borders/`                   | calculate border strips and yardage     | final quilt size                | result/planner             |
| `/calculators/sashing/`                   | calculate row-wise sashing              | joined strips and final size    | result/planner             |
| `/guides/width-of-fabric/`                | understand WOF and usable width         | selvages and directionality     | yardage calculator         |
| `/guides/finished-vs-cut-size/`           | distinguish finished and cut size       | avoid double seam allowance     | fabric calculator          |
| `/guides/quilt-seam-allowance/`           | understand quilt seam allowance         | test nominal/scant seams        | border/sashing calculator  |
| `/guides/backing-overage/`                | understand extra quilt backing          | longarm variation               | backing calculator         |
| `/guides/how-to-calculate-quilt-yardage/` | learn piece-list yardage math           | row layout and rounding         | yardage calculator/planner |
| `/about/`                                 | understand who/what/why behind Quilter  | privacy and limitations         | methodology/corrections    |
| `/methodology/`                           | audit formulas, defaults, and optimizer | tests and practical sources     | tool/correction            |
| `/corrections/`                           | report a reproducible calculation issue | correction policy               | configured contact         |

The calculator and guide pairs intentionally separate task intent from
explanatory intent. No numeric, location, keyword, or internal-result variants
are indexable.

## Rationale

The locked product is an SEO-led utility, not a publishing farm. A small,
explicit route set makes content and internal links reviewable and ensures useful
HTML exists before client JavaScript. The three trust routes address the
production requirement for truthful authorship/operator context, transparent
methodology, and a correction policy; they do not expand quilting-domain scope.

## Consequences

- Deployments must set `SITE_URL` to the public HTTPS origin.
- The original requirement for a configured correction inbox is superseded by
  the [2026-09-30 Feedback deferral](v1.1-feedback-system-deferral.md).
  `/corrections/` now provides static coming-soon guidance; the Feedback System
  is a planned V2 milestone and is not a V1.1 launch dependency.
- New indexable routes require intent review, authored standalone value,
  internal links, and an explicit sitemap update.
- Page components may structure explanations but may not duplicate calculator
  formulas or optimizer decisions.
- Canonicals, metadata, JSON-LD, crawl directives, trust copy, and sitemap
  coverage remain testable without hydration or a server runtime.
