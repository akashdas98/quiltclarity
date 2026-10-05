# Client print-ready PDF

Date: 2026-10-02; corrected 2026-10-03. Status: published 2026-10-05;
owner iPhone/tablet PDF acceptance passed 2026-10-03. Desktop first-click font
readiness correction is included in runtime commit 9d7d342.

## Decision

The owner requests PDF export exclusively on phones/tablets, a button labelled
"export PDF" with subtitle "for print", and PC-consistent formatting. Desktop
devices retain native Print. The owner clarified on 2026-10-03 that selection is
by device type, not a screen breakpoint; the previous universal-export wording
was an incorrect interpretation and is superseded.

Keep one mounted action and the existing printable HTML. Use reported mobile
client hints or mobile/tablet user-agent tokens, with Mac-platform multi-touch as
the iPad desktop-user-agent fallback. Viewport width and generic touch capability
do not choose the action. A narrow desktop remains Print; a wide tablet remains
PDF. This explicit owner requirement justifies the scoped device heuristic.
Signals stay local and are neither stored nor added to analytics.

Device detection is approximate: [WebKit reports that iPadOS can present the
same user agent as macOS](https://bugs.webkit.org/show_bug.cgi?id=212937).
The fallback combines the Mac signature with multi-touch; it does not classify
Windows touch PCs as mobile. Spoofed or fully masked device signals can choose
the wrong action. Revisit the heuristic if browser device reporting changes or
the owner adopts a device-independent action policy.

## Rationale

Native iPhone printing failed named page orientation and efficient fit after
pagination/content fixes. Browser-generated PDF owns page dimensions, boundaries,
prose pagination and diagram fitting. Export remains local; no backend, project
upload, external runtime CDN or domain recomputation is allowed. Reuse the rendered
result's ordered content and existing SVG primitives, not screenshot rasterization
or a separate placement engine. Preserve shopping, cutting instructions, remaining
regions, assumptions and warnings. Each diagram title/legend/geometry is atomic.

Parity correction (2026-10-02): the complete print-visible `.page` is the content
source, including its introduction, first-use note and result heading. Focused
semantic blocks preserve row-rule shopping tables, side-by-side decision facts
and inline emphasis. Planner print and export share the self-hosted Noto fonts so
platform font selection does not change the print document. Screen fonts remain
unchanged. Native/export content and rendered-layout comparisons supplement the
existing completeness and paint gates; a hand-picked subset is not parity proof.

First-click readiness correction (2026-10-05): print-only font faces were still
unloaded when desktop invoked native Print. Both faces used font-display:block,
allowing invisible text during the initial print snapshot. Desktop Print now
explicitly loads the regular/bold faces and waits for their settled readiness
before invoking the browser, with busy state and duplicate-click containment.
Waiting for screen document.fonts.ready alone would not initiate these unused
print-only faces. Both faces use font-display:swap so failed loads and browser
menu/keyboard printing can use visible fallback text. Font failures explain the
fallback without blocking native Print; they may alter typography and fit.
No result data, domain geometry, mobile PDF generation or device routing changes.

## Consequences

Approved scope justifies pinned jsPDF 4.2.1 and svg2pdf.js 2.8.1 (official repositories
parallax/jsPDF and yWorks/svg2pdf.js; MIT). Install without lifecycle scripts and keep
lockfile integrity metadata. Lazy-load export code; self-host licensed font assets.
The fixed actionExportPdf help key joins the controlled help allowlist; export
reuses the existing print_result intent event and sends no project content.
Dependency addition is an explicit print-output divergence from the prior test-only
PDF stack, required by the authorized mobile print contract. No optimizer, domain,
arbitrary analytics fields, persistence or hosting change is authorized by this decision.

Acceptance: mobile exact button text/subtitle; desktop native Print; routing
independent of viewport width; iPad desktop UA and Windows touch PC coverage;
matching action help and lazy PDF loading; fixed physical page
sizes matching PC A4/margins/hierarchy; maximal aspect-preserving diagram fit; no
blank/missing pages or title/legend splitting; grayscale patterns, vector geometry,
searchable text; all result content and labels preserved; short/multi-fabric,
stock-plus-purchase, tall/wide, Unicode, repeated export and failure recovery cases;
no project-data network requests; lazy loading and performance containment; existing
Chrome/Edge browser and clean PDF text/paint contracts plus rendered visual review.
Physical iPhone/tablet export/viewer acceptance passed per owner 2026-10-03.
This is owner evidence. Owner waived Firefox acceptance on 2026-10-05; Firefox
remains untested and is not a pending release requirement. Owner authorized
publication of the validated changes on 2026-10-05; deployment evidence is owned
by the Resume Checkpoint in ../architecture/project-status.md.

Bundled Noto Sans supports common Latin accents, fractions, Greek and Cyrillic.
Unsupported characters (including many CJK characters and emoji) stop export with
an actionable label error; never silently replace them. Arbitrary Unicode font
coverage remains a limitation. Additional font coverage requires a reviewed,
self-hosted fallback; the planner's original screen text remains intact.
