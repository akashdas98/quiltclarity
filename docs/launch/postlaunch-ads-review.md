# Post-launch Ads and Monetization Review

## Recovered agreement

On 2026-08-24 local time (2026-08-23 UTC), the owner asked whether the existing
roadmap would bring up defining and mapping the ads work after launch. The final
clarification was: “somewhere along the line we will come across it and you will
tell me that we should define and map out the ads part right?” The assistant
answered yes, during the explicitly deferred post-deployment monetization review.

Recovered on 2026-10-01 from project conversation
`01a03033-71ca-71f3-9c4b-3d52deb813e8`, titled “where do the ads go? how does that
work? have we made room for ads?” Relevant response records: 52, 63, 74, 85 and
94; final assurance timestamp `2026-08-23T20:05:36.609Z`. Raw local conversation
records remain local; this document preserves only the relevant project agreement.

The agreement was to surface and define the post-launch ad work. The same
conversation described a proposed implementation approach and the questions a
production runbook still needed to settle. It did not record completed ad
infrastructure, provider approval, final unit dimensions or an approved rollout.
The earlier 2026-10-01 assertion that this scope was unrecoverable was incorrect.

## Pending review and design

This is required continuation visibility, not automatic authorization to insert
ads, select a provider, change tracking or submit an application. The existing
launch package makes AdSense application and affiliate adoption optional post-live
decisions. Review the live site's usefulness and policies, Search Console/indexing,
Core Web Vitals and traffic baseline before selecting an implementation rollout.
Those baseline prerequisites were proposed in the recovered discussion; they are
not newly invented traffic thresholds or proof that the owner approved every detail.

The recovered design discussion proposed:

- Provider-neutral reusable slots with controlled manual responsive placements.
- One slot after the complete calculator explanation/result experience; one after
  the entire planner output; a guide slot after substantial article content and
  before the planner CTA.
- Inline mobile placements with stable reserved geometry. A desktop rail only
  after a deliberate layout and supporting traffic/layout measurements.
- No placement above the primary tool, between form and result, inside output
  cards, near action controls or in print; no initial homepage ads.
- No visible production placeholder for empty/unconfigured slots; explicit
  Advertisement labeling, lazy loading and contained provider failure.
- Responsive containment, layout-shift, print, accessibility, performance and
  provider-failure checks using the existing affected browser/print gates.

These are recovered recommendations to evaluate and finalize during the review,
not a claim that ad slots currently exist or every recommendation was approved.

## Runbook questions preserved from the discussion

Define route/template inventory, device placements and reserved dimensions,
maximum density, timing and any evidence thresholds; application/verification and
`ads.txt`; applicable consent/privacy/operator disclosures; provider-neutral
integration and blocked/empty/failure behavior; performance budgets; privacy-safe
measurement; rollout stages, monitoring, success/stop criteria and operational
ownership. Provider setup was described as following live quality review and
approval, with one provider script and controlled slots.

Before implementation, finalize these choices and record scope/approval. Before
completion, implementation must exist and pass its relevant definition of done,
privacy, browser/print and divergence gates. No ad work is marked complete here.

## Owner-locked placement scope, 2026-10-06

Current placement authority is
[Owner-Locked Ad Placement Scope](../decisions/v1.1-ad-placement-scope.md).
Owner locks desktop rails as default across page templates, with multiple units
and both margins available for layout review; four planner inline placements
after Project, Fabrics, Cut Requirements/Calculate and complete final result
apply on mobile and desktop. Rails supplement, rather than replace, inline ads.
Calculator directory also has two locked inline slots: after the introduction,
before the whole calculator list, and after the whole list, on mobile/desktop.
These sit outside `src/pages/calculators/index.astro`'s `.card-grid` and do not
change individual calculator-page placements. Separate owner instruction locks
three slots on each individual calculator page: immediately above
`.calculator-shell` after the header, and before and after the complete
"How this calculator works" section in `CalculatorPage.astro`, outside the
form/result block and explanation body. All three apply on mobile/desktop and
supersede the initial single calculator-end recommendation. Rails are additional.
Main Guides directory locks three inline slots after its complete Start Here,
Common Workflows and Quilting Reference sections, mobile/desktop plus rails.
They are outside each guide-card grid; individual articles are not changed.
Guide article placements are also locked: Quick Start before Before you start
and before You completed the Quick Start; other short articles before the first
real step and after the last. Long articles add one at each ten-step block
boundary (before11,21,etc), with coincident end/block boundaries deduplicated.
The current 30-step tutorial has four slots; Common Workflows and Quilting
Reference follow the same rule. All layouts plus rails; see the decision for
exact anchors and step semantics. These replace the original sole guide-end slot.
Creative formats must fit actual container space; count, size/spacing, provider,
consent and rollout remain to be finalized. No runtime change or live serving.
Earlier one-unit caps, homepage exclusions, rail replacement and section-banner
rejections below are historical proposals, not active constraints.

## Responsive local mockup, 2026-10-07

The isolated preview is implemented in `../../scripts/ad-layout-preview.mjs`,
with companion client/CSS files. With the existing site on port 4322, run
`node scripts/ad-layout-preview.mjs` and open `http://127.0.0.1:4323/`.
It binds only to loopback, proxies the existing local pages/assets and adds
clearly labeled placeholders. Its toolbar selects filled/empty/failed states;
`?adState=empty` or `?adState=failed` also selects the initial state.
Production source, provider integration and deployment are unchanged.

All locked inline placements are represented, including the four tutorial
boundaries and result-dependent final planner slot. Informational pages share
an article CSS class with guides, but receive only rails; guide inline rules
are explicitly restricted to guide routes. Current general guide articles have
three or four authored substantive sections, so each uses start/end slots.
This preview does not infer additional steps from headings or nested lists.

Candidate inline reservations are full container width, 136px tall above the
650px breakpoint and 100px below it, with 24px/16px outer margins. These are
placeholder envelopes, not provider-approved creative sizes. Rails choose
300x250 rectangles where both margins fit, otherwise 160x600 skyscrapers where
both fit, with a 12px content gap and at least 8px viewport clearance. Rectangle
tops are spaced 1220px apart; skyscraper tops 1700px apart, following the owner's
2026-10-07 request to halve rail density. Each stack keeps its first unit and
rounds odd counts upward; locked inline placements are unchanged. Each stack ends inside
the existing page height and never creates page length. Rails are mounted once
per unit and removed when margins cannot fit them. Content width is unchanged.
For the current 1216px-wide planner, transitions are 1576px and 1856px viewport
widths; narrower article frames can fit rails sooner. These are measured mockup
geometry, not universal breakpoints or final unit counts.

Verification: installed Chrome covers 42 routes at 390/1440/1920px (126 cases);
installed Edge covers seven representative routes at those widths (21 cases).
Slot counts, boundary presence, unique IDs, horizontal containment, unchanged
content width, visible-control clearance and rail containment pass. Chrome
also checks 320px and both planner rail transitions. All eleven calculators
produce their default result and focus it with slots present. Both browsers
verify successful planner result focus/scroll, stable document-space geometry
for all three slot states, rail removal on resize, and ad-free clean PDFs at
390/1920px with identical paginated text and text geometry to the baseline.
Screenshots were inspected for mobile inline and wide desktop rails.

Local evidence: `tmp/ad-layout-audit.mjs`, `tmp/ad-layout/chrome-geometry.json`,
`tmp/ad-layout/msedge-geometry.json`, planner/tutorial screenshots and baseline/
preview PDFs in `tmp/ad-layout/`. Focused syntax, ESLint and Prettier pass.
The local preview blocks external script/connection destinations and
`/cdn-cgi/`; observed preview requests stay local. Browser emulation does not
establish physical Safari behavior. These are mockup checks, not a production
release gate or third-party ad/consent/performance evidence.

Review can now assess the inline envelope, rail formats and stack spacing on
actual pages. Provider selection, creative compatibility, real operator
contact/privacy disclosures, consent and an authorized rollout remain future
work. No account submission, live ad script, ads.txt or publication occurred.

## Google sizing and best-practice review, 2026-10-07

Owner requested current Google sizing standards and best practices before
deciding final formats/breakpoints. This is research and a proposal, not a size,
provider or rollout approval. The verified mockup's fixed rail choices and
100px/136px inline envelopes prove local layout only, not AdSense compatibility.
Recommending those envelopes as final before provider sizing review was premature.

Routing: model demand is the existing parent for interpreting interacting
provider sizing, layout stability and owner placement constraints; evidence is
the need to distinguish publisher slots, advertiser creatives and loaded-ad
resize behavior. Effort demand is medium for targeted official-source comparison
and breakpoint derivation. Installed web search and repository tools suffice;
no worker, skill, dependency or provider installation is needed. Acceptance:
current primary sources, fixed/responsive limits, common formats, best practices,
space-based breakpoint proposal, explicit fill/resize limits and approval state.

Current official evidence:

- [Fixed-size restrictions](https://support.google.com/adsense/answer/9185043?hl=en):
  minimum120px width/50px height, maximum1200px per dimension, and only one
  dimension may exceed450px. Allowed dimensions do not guarantee inventory.
- [Approved responsive modifications](https://support.google.com/adsense/answer/9183363?hl=en):
  exact dimensions by media query, variable width with fixed height (Google's
  example400-970px by90px), and hiding responsive units at unsuitable widths.
  Follow the documented tag changes; external-stylesheet sizing is not officially
  supported. These examples are not mandatory website breakpoints.
- [Responsive behavior](https://support.google.com/adsense/answer/9183362?hl=en)
  and [shape controls](https://support.google.com/adsense/answer/9183460?hl=en):
  available-space sizing, rectangle/vertical/horizontal shapes, mobile full-width
  expansion controls, explicit parent width and care with constrained heights.
  Google documents orientation-change reload/cache behavior; these sources do
  not promise continuous desktop window-drag resizing of a loaded creative.
- [Common sizes](https://support.google.com/google-ads/answer/7031480?hl=en)
  and [AdSense FAQ](https://support.google.com/adsense/answer/10734935?hl=en):
  relevant rectangles300x250/336x280, rails120x600/160x600/300x600 and
  horizontal468x60/728x90/970x90. Google's responsive-code example also uses
  320x100. Advertiser size lists are inventory context, not guaranteed AdSense fill.
- [Narrow-format tradeoff](https://support.google.com/authorizedbuyers/answer/3011898?hl=en):
  Google describes120x600 as having more limited display supply than wider rails.
  This is supporting inventory guidance, not a QuiltClarity performance result.
- [Placement best practices](https://support.google.com/adsense/answer/1282097?hl=en)
  and [placement policies](https://support.google.com/adsense/answer/1346295):
  preserve navigation/content, distinguish ads, label "Advertisements" or
  "Sponsored Links", prevent accidental clicks near controls, avoid clutter and
  more advertising than content, and do not auto-refresh units.
- [Viewability](https://support.google.com/adsense/answer/6219980?hl=en):
  display impressions require50% visibility for one continuous second; responsive
  units, asynchronous loading and unobstructed content-rich placements are advised.
  More slots do not establish better viewability or revenue.
- [Layout stability](https://developers.google.com/publisher-tag/guides/minimize-layout-shift):
  reserve sufficient space before ads load; collapsing later can shift content.
  This is GPT/Ad Manager guidance used for its general layout principle, not an
  AdSense API contract. GPT's variable-height `fluid` format is distinct from
  the proposed variable-width/fixed-height AdSense display units.
- [Mobile size optimization](https://support.google.com/adsense/answer/9139818?hl=en):
  Google recommends optimization, but it can produce larger/full-width ads and
  does not work inside restricted parent dimensions. Bounded-height design trades
  that freedom for predictable tool layout; no revenue comparison is established.

Inventory-first correction after owner review, 2026-10-07: the first proposal
below inferred useful intermediate dimensions from permitted sizing controls.
That was insufficient evidence for the requested sizing best practices. It is
superseded by this inventory-informed proposal, still not approved/implemented.
[Google's Authorized Buyers size guide](https://support.google.com/authorizedbuyers/answer/3011898)
explicitly lists300x250,336x280,728x90 and160x600 as top-performing sizes with
more inventory. It warns of limited supply for120x600,250x250 and468x60.
Its mobile formats include300x50/100 and320x50/100. This is network guidance,
not an AdSense guarantee or measured performance ranking for this site.
[AdSense creation guidance](https://support.google.com/adsense/answer/9274025?hl=en)
and [coverage troubleshooting](https://support.google.com/adsense/answer/16906718?hl=en)
recommend responsive units because fixed units can reduce the available pool.
Do not equate responsive containers with a requirement to serve a custom-size
creative at every intermediate width; do not invent an AdSense multi-size API.

Revised proposal: use common creative-size boundaries for narrow inline/rail
spaces, allowing responsive sizing where documented and useful without treating
arbitrary intermediate dimensions as proven inventory. Keep units Responsive in
AdSense if selected, using its approved sizing controls; this remains a bounded
layout choice, not Google's unrestricted sizing recommendation. Below300px inline
space, decide between omission and a250x250 fallback with limited-supply/height
tradeoffs rather than assuming250x100 has good fill. Tool inline spaces favor
compact mobile banners; guide boundaries may instead use300x250/336x280 rectangles
to include Google's stronger rectangle inventory, subject to owner height review.

| Surface / usable width     | Revised candidate dimensions               | Behavior                                                 |
| -------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| Tool inline below300px     | Omit, or separately review250x250 fallback | No custom250x100 recommendation                          |
| Tool inline300-319px       | 300x100                                    | Common mobile banner                                     |
| Tool inline320-727px       | 320x100                                    | Common mobile banner, centered                           |
| Tool inline728-969px       | Available width x90px                      | Documented expandable-width approach; accommodates728x90 |
| Tool inline970px and above | 970x90 maximum                             | Centered, capped width                                   |
| Each rail below160px       | Omit by default                            | 120x600 exists but has limited supply                    |
| Each rail160-299px         | 160x600                                    | Common well-supplied sidebar format, centered            |
| Each rail300-335px         | 300x250                                    | Common well-supplied rectangle                           |
| Each rail336px and above   | 336x280 maximum                            | Common well-supplied rectangle, centered                 |

This deliberately does not request, for example,237x600 or333x280 merely because
the margin fits those dimensions. Above336px keep the rectangle capped;300x600
is a supported tall alternative to review, not established as better for this
site. Actual ad sizes, coverage, Active View and earnings must inform later
optimization. Google provides a Creative sizes report; current site/account
evidence cannot establish fill or earnings. Standard formats improve the basis
for the recommendation but do not guarantee either. Model demand unchanged;
effort demand remains medium due to the corrected inventory-vs-permission model.

Superseded initial sizing proposal (retained as review history):

| Surface / usable width   | Candidate dimensions               | Behavior                                                             |
| ------------------------ | ---------------------------------- | -------------------------------------------------------------------- |
| Inline below250px        | No request                         | Deliberate design floor, not Google's minimum                        |
| Inline250-399px          | Available width x100px             | Responsive width; sub300px inventory needs live evaluation           |
| Inline400-969px          | Available width x90px              | Google's documented expandable-width pattern                         |
| Inline970px and above    | 970x90 maximum                     | Centered, capped width                                               |
| Each rail below120px     | No rail                            | Cannot fit the fixed-size minimum                                    |
| Each rail120-159px       | Optional120x600                    | Narrow fallback with limited supply; omit by default recommendation  |
| Each rail160-299px       | Available width x600px             | Responsive width; height stable                                      |
| Each rail300px and above | Width300-336px x280px, capped336px | Responsive width with rectangle envelope; smaller creatives centered |

Use actual available width after content gap/viewport clearance, not universal
device categories. For the current1216px planner and existing20px clearance per
margin, viewport thresholds are1496px for optional120px rails,1576px for160px,
1856px for300px and1928px for336px. Formula: content width +2*(unit width+20).
These derive from saved mockup geometry, not a fresh runtime measurement;
article templates need their own corresponding thresholds. Preserve locked
inline boundaries, halved rail spacing and content width. The280px rectangle
height changes mock geometry and needs the affected browser/print checks before
acceptance. A300x600 wide rail is another supported option if owner prefers a
consistent tall rail over the rectangle family. A width cap is our layout choice,
not a Google300px or336px maximum.

Reserve creative height plus a separate label/spacing allowance from first
paint; do not retain136px as an unexplained creative height. No stretching,
cropping, repeated push calls or homemade refresh on resize. Test real provider
fill and loaded-ad breakpoint/orientation behavior before acceptance. The narrow
inline adaptation and rail width ranges are proposals based on approved sizing
controls, not a promise every intermediate width has inventory. Owner choice,
revised mockup and provider validation remain pending; no runtime or account action.

## Layout-fit plan following Google best practices, 2026-10-07

Owner requested a concrete plan using well-supported formats that fit the current
layout, then directed "follow the best practice" rather than adding special
pixel-resolution controls. Owner finalized the format/usable-width bands and
narrow fallbacks,2026-10-07 ("ok, finalise these"). The table below is the approved
sizing design; earlier proposals above are review history. Exact template viewport
breakpoints and runtime fit remain to be measured/verified. This approval does not
select a provider account or authorize live serving, application or publication.

Use AdSense Responsive display units with Google's approved sizing controls at
the owner-locked manual placements. Retain normal similar-sized display backfill
if available/enabled; do not recommend disabling it to address hypothetical image
quality. Google, not our CSS, handles creative adaptation. No transform, zoom,
image stretching, clipping, iframe manipulation or homemade refresh. Dimensions
below describe CSS ad-unit space, not image resolution or promised fill/earnings.

Model demand: existing parent for the bounded synthesis of official inventory,
backfill, responsive sizing and locked placement contracts. Effort demand: medium
for comparing these contracts and producing an implementation-ready plan; no
additional worker or capability is needed. Acceptance: one current sizing plan,
complete template placement coverage, fit formulas, stable geometry, standard
Google behavior, explicit validation/account/publication boundaries and checkpoint.

### Format selection

Measure usable inline width after existing padding and usable rail width after
the content gap/outer viewport clearance. Never reduce existing content width to
make an ad fit. Use standard layout/media-query breakpoints per template, not
device names or user-agent tests; publish those viewport thresholds after fresh
DOM/layout measurement. Exactly one mounted instance per logical slot.

| Placement family                         | Usable width    | Planned ad-unit space                           |
| ---------------------------------------- | --------------- | ----------------------------------------------- |
| Planner, calculator and directory inline | Below200px      | No request/gap: cannot fit the planned fallback |
| Same                                     | 200-249px       | 200x200, centered narrow fallback               |
| Same                                     | 250-299px       | 250x250, centered narrow fallback               |
| Same                                     | 300-319px       | 300x100                                         |
| Same                                     | 320-727px       | 320x100, centered                               |
| Same                                     | 728-969px       | Responsive available width x90px                |
| Same                                     | 970px and wider | Capped970x90, centered                          |
| Guide article inline                     | Below200px      | No request/gap: cannot fit the planned fallback |
| Same                                     | 200-249px       | 200x200, centered narrow fallback               |
| Same                                     | 250-299px       | 250x250, centered narrow fallback               |
| Same                                     | 300-335px       | 300x250, centered                               |
| Same                                     | 336px and wider | 336x280, centered                               |
| Each desktop rail                        | Below160px      | No rail request/gap                             |
| Same                                     | 160-299px       | 160x600, centered in margin                     |
| Same                                     | 300-335px       | 300x250                                         |
| Same                                     | 336px and wider | 336x280, capped and centered                    |

The rectangle/160x600/728x90 choices follow Google's stronger inventory guidance;
mobile banners and970x90 are common supported formats. Width thresholds are our
fit decisions, not a guarantee or a Google-mandated breakpoint. Do not request
custom250x100 or intermediate rail dimensions. Owner approved a smaller supported
fallback,2026-10-07: use250x250 below300px usable width, or200x200 if250px cannot
fit. Google lists both squares as supported with more limited display supply;
they are coverage fallbacks, not a claim of equal fill/earnings to larger formats.
This supersedes the baseline's original below300px omission and earlier no-square
recommendation. Inline placements remain eligible across supported mobile,
tablet and desktop widths, subject to actual fit, consent and provider fill.
Below200px usable width is outside this fallback plan and makes no request.
Verify every template at320px viewport and actual transition widths; don't claim
coverage until its measured slot fits. Preserve every owner-locked placement,
reserve the selected square height plus label/spacing before first paint, and
show the taller fallback honestly in the revised preview. No production code is
changed by this planning amendment.

For the saved1216px planner geometry and20px total per-side gap/clearance, rails
start at1576px viewport (160x600), switch at1856px (300x250) and at1928px
(336x280). Formula: content width +2*(creative width+20). Re-measure actual
content bounds before implementation; narrower templates have different viewport
thresholds. Above336px spare rail width does not enlarge the ad. Keep the owner's
halved rail top spacing:1700px for skyscrapers,1220px for rectangles. A stack
ends inside the existing document height; no artificial page length, sticky
units or overlays.300x600 and970x250 remain later experiments rather than
automatic larger replacements with unproven site-specific benefit.

### Smaller creatives and stable space

Keep similar-sized backfill enabled if the account offers it. Google explicitly
documents728x90 in970x90 without resizing,160x600 in300x600 without resizing,
and adaptation between300x250 and336x280. These examples do not establish that
every smaller ad fits every larger requested unit. A larger outer wrapper alone
does not enlarge the eligible auction. Reserve the selected unit height from
first paint, with a separate "Advertisements" label allowance and existing
16px narrow/24px wide outer spacing as the preview starting point. These gaps
are layout choices, not Google's accidental-click safe-distance certification.

Center the unit inside its wrapper; leave provider-internal creative positioning
to Google. Smaller/unfilled units retain reserved space for the page visit. An
unconfigured/disabled site has no slot or label/gap. Do not collapse after fill
failure or force a small creative to fill the wrapper. Follow Google's documented
responsive tag changes and inline/embedded sizing examples; do not assume an
external stylesheet alone is officially supported for AdSense unit sizing.
Bounded heights preserve tool usability but restrict Google's unrestricted mobile
size optimization; record that tradeoff and test actual serving. No guarantee
of continuous loaded-ad resizing during desktop window dragging.

### Route placement coverage

- Rails: supported across homepage, planner, calculator/guide directories,
  calculators, guide articles and informational templates, subject to geometry
  and separate provider eligibility.404 and Feedback/noindex surfaces are excluded
  from live serving initially, even if the preview demonstrates template rails.
- Planner: after Project, Fabrics, Cut Requirements/Calculate and the entire final
  result. Preserve successful result focus/scroll and all details/actions.
- Calculator directory: after intro and after complete list. Each of11 calculators:
  before tool, before How this calculator works, and after its complete explanation.
- Main Guides directory: after Start Here, Common Workflows and Quilting Reference.
- Guide articles: explicit authored start/end and ten-step boundaries; Quick Start
  overrides remain before Before you start and before You completed the Quick Start.
  Full tutorial retains four slots; no runtime heading counting or split sections.
- Print/PDF: exclude all ads, labels and reserved space. Canonical static content,
  forms, calculations, project storage and closed analytics remain independent.

### Execution and acceptance

1. Update only the isolated mockup to this plan; retain production source until
   the sizing review is complete. Test native-size and documented smaller-backfill
   simulations; mark them as simulations, not observed AdSense fill.
2. Measure all template widths and translate the usable-width bands into explicit
   template viewport rules. Cover320/390/650/768/1024/1440/1600/1920px plus either
   side of each actual transition. Verify bounds, labels, density, empty/failure
   geometry, existing content widths, keyboard flow and successful result focus.
3. Run affected installed Chrome/Edge and clean print/PDF comparisons against the
   no-ad baseline. Use the existing geometry/print fixtures; do not infer provider
   acceptance, physical Safari or real fill from mocks.
4. Separately resolve provider/account, actual unit IDs, disclosures/contact,
   consent, project-data privacy and route eligibility before integration. Use
   provider-approved responsive handling, one loader and explicit route controls;
   never synthesize a publisher ID or a multi-size AdSense API.
5. With authorized provider integration, verify actual served creative sizes,
   bounded heights, resize/orientation, consent/failure states, performance,
   static content and print. Use coverage, Creative sizes, Active View and earnings
   reports to guide changes rather than claiming largest always earns most.
6. Live serving/application/publication remains a separate owner-authorized step.
   Preserve the existing staged rollout/kill switch and stop criteria. No ad
   integration task is complete until the affected privacy/browser/print gates pass.

Evidence sources: [Google's inventory guide](https://support.google.com/authorizedbuyers/answer/3011898),
[AdSense responsive recommendation](https://support.google.com/adsense/answer/9274025?hl=en),
[approved sizing controls](https://support.google.com/adsense/answer/9183363?hl=en),
[similar-size backfill](https://support.google.com/adsense/answer/6191405?hl=en),
and the placement/viewability sources in the review above. Current shell reads
and context validation are blocked by a sandbox-helper ACL error; no fresh
runtime geometry or context-check PASS is claimed. Apply-patch updates preserve
the existing mockup/source and all unrelated working-tree changes.

## Finalized sizing mockup verification, 2026-10-07

The isolated preview now implements the finalized sizing plan, including200x200/
250x250 narrow fallbacks, common tool banners and article/rail rectangles. Labels
are separate from creative height, with16px/24px narrow/wide outer margins.
Only scripts/ad-layout-preview-client.js and scripts/ad-layout-preview.css were
changed; the existing proxy and production runtime remain unchanged.

Installed Chrome passes168 route/width cases (42 routes at320/390/1440/1920px);
Edge passes28 cases (seven representative routes at those widths). Checks cover
slot identity/boundaries, exact creative dimensions, content width, horizontal
containment, control clearance, result focus and stable filled/empty/failed space.
Both browsers pass rail removal on resize and clean paginated print text/geometry
parity against the no-ad baseline at390/1920px. Focused Chrome planner result
checks at320/390/1920px also verify final-slot visibility and250x250/320x100/970x90
creative dimensions after successful calculation.

Chrome verifies neighbors of usable-width thresholds across six templates:
with the current32px total inner-page allowance, viewport232/282/332/352/760/1002px
correspond to usable200/250/300/320/728/970px; article336px begins at viewport368px.
The sub320px probes establish format transitions, not whole-site usability at
those unusually narrow widths. All42 routes at320px fit a250x250 fallback in288px
usable space; at390px tools/directories use320x100 and articles336x280. Planner
rail neighbors verify1575px absent /1576px160x600,1855px160x600 /1856px300x250,
and1927px300x250 /1928px336x280. Density remains the halved owner-approved cadence.

Local evidence: tmp/ad-layout-audit.mjs, tmp/ad-sizing-breakpoints.mjs,
tmp/ad-backfill-simulation.mjs; browser geometry receipts and
tmp/ad-layout/final-breakpoints.json. Final planner/tutorial screenshots at
320/390/1920px were inspected by the worker; root also inspected planner320 and
tutorial1920. A728x90 mock creative inside a970x90 unit preserves document/slot/
unit geometry and restores the DOM; screenshot final-backfill-728-in-970.png.
This is a layout simulation, not observed Google serving or fill.

Syntax, ESLint, Prettier and whitespace checks pass. Task-owned4323 preview stopped;
owner4322 PID61080 preserved. Narrow shell escalation bypassed the intermittent
sandbox-helper ACL failure without modifying system/sandbox configuration.
Parent context/catalog checks pass after refreshing new section routes and
compacting duplicated history; final checkpoint validation PASS is recorded in
project status. No physical Safari, real provider/consent/performance acceptance,
account submission, production integration, commit or publication is claimed.
Next: provider/account direction, truthful privacy/contact disclosures, consent
and project-data compatibility before isolated provider integration and live gates.

## Initial placement and rollout proposal, 2026-10-06 (superseded where noted)

Status: initial design history; placement choices superseded by the owner-locked
decision above. Provider/runbook prerequisites remain applicable. This is not
completed implementation or provider adoption.
The owner authorized continuation into design after confirming homepage and
planner URL Inspection both report "URL is on Google". Performance export has
13 impressions and no clicks through October3; private event counts include
possible owner/audit activity. There is no reliable organic usage, revenue or
field Core Web Vitals baseline yet. This permits preparation, not a claim that
ads are commercially worthwhile or that a provider will approve the site.

Routing: model demand is the existing parent for product/privacy judgment and
template contracts; effort demand is medium for focused source tracing and
current provider-policy verification. Installed tools suffice; no new skill,
dependency or worker is needed. Acceptance: exact insertion boundaries,
responsive geometry, empty/failure behavior, disclosure/provider prerequisites,
staged rollout and measurable rollback; preserve static content, domain,
analytics and print contracts. Reassessment: neither axis changes after source
inspection; the disclosure gap changes the rollout sequence, not the model.

### Route and template map

Manual placement remains the design direction. The initial one-unit limit and
rail-instead-of-inline choice were conservative recommendations, not governing
requirements or agreed final density. Owner challenges that cap and asks about
multiple rail units and mobile section banners; compare those variants before
finalizing density. Desktop rails require unchanged content width and clear
separation. Owner explicitly requested inclusion of this
rail option on 2026-10-06; this approves its inclusion in design, not provider
setup or publication. No Auto ads, anchor/sticky ads, overlays, interstitials,
automatic refresh or initial homepage ads. These are proposed product choices,
not claims about provider mandates. A slot is not a new page or SEO content.

| Slot             | Eligible surface            | Exact source boundary                                                                                                 | Activation                                                                                                                                       |
| ---------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `guide-end`      | 19 canonical guide articles | `src/components/GuidePage.astro`, after `.article-body` and before learning-path navigation and CTA                   | First pilot: `/guides/width-of-fabric/` and `/guides/how-to-calculate-quilt-fabric/`; expand to other canonical articles only after pilot review |
| `calculator-end` | 11 standalone calculators   | `src/components/CalculatorPage.astro`, after the complete `.explanation-card`, before Keep planning                   | Second stage; outside form, result card and live region; static explanation stays uninterrupted whether a result exists or not                   |
| `planner-end`    | `/fabric-cutting-planner/`  | `src/pages/fabric-cutting-planner.astro`, after the complete static explanation section, following `#planner-results` | Last and separately reviewed stage; never among fabrics, cutting diagrams, assumptions, shopping rows or result actions                          |

Exclude `/`, `/calculators/`, `/guides/`, informational/policy pages, Feedback,
404, noindex guide aliases (`backing-overage`, `how-to-calculate-quilt-yardage`)
and nonproduction builds. Guide navigation and tool CTA stay together. Preserve
at least 32 CSS pixels of space between the ad region and neighboring content;
the actual creative must remain clearly distinct from all links/buttons.

### Geometry and lifecycle

Candidate creative sizes: 300x250 when usable slot width is 300-727 CSS pixels;
728x90 when usable width is at least 728. Below 300, omit the unit entirely.
Center within the existing content width, with a separate Advertisement label
and 32px outer spacing. These are design candidates, not tested placements or
promises of provider inventory. Use container/media queries and an approved
responsive tag; revalidate actual tag sizing with the selected provider before
implementation. Never crop a creative or hide its disclosure/controls to fit.
One mounted instance per selected logical slot; no duplicate mobile/desktop ad
trees for that slot or UA detection. Final number of slots remains undecided.

Desktop rail candidate: one nonsticky 300x250 unit, with at least32px clear
separation from the content and normal outer-page padding. Enable the rail only
when the existing right margin can accommodate all of that space without
narrowing, shifting or overlapping the current content column. Decide using
rendered container geometry/CSS breakpoints, not a device-name threshold; verify
long fabric/cut-list rows, help popovers and actual diagrams before enabling.
Below the supported width, do not mechanically stack every rail unit into the
mobile content: choose mobile placements/density separately. Compare rail-only,
rail plus completed-output banner, and mobile section-banner variants. A guide
rail sits beside substantive article
content; calculator/planner rails sit beside their explanation/result region,
not alongside data-entry controls or above the primary tool. CSS placement must
preserve meaningful reading/focus order; initialization must use the actual slot
visibility. Rails are excluded from print/PDF. Exact breakpoints remain a layout
verification result, not a guessed viewport value in this design.

Planner section proposal reviewed, 2026-10-06: owner asked about one ad after
Project, after Fabrics, after Cut requirements/Calculate, and after final result.
The first two are boundaries within `#planner-form`, but that fact alone does
not prove an interruption. Correction after owner challenge: the previous
categorical rejection overinterpreted content-spec section14. A clearly separated
banner after a completed section may preserve entry flow; evaluate actual
rendered separation, extra scrolling, accidental-click risk, layout stability
and task completion. After Fabrics is a candidate for a mock layout comparison;
after Project needs a density check because the preceding section is short.
The Calculate-to-result gap is higher risk because it delays visual access to
the requested answer; retain the default clear path while comparing alternatives.
The final-result concept remains a candidate after complete result/explanation.
Multiple units, rail plus inline and mobile section banners are unresolved
design variants, not forbidden by a one-unit rule or approved for implementation.
More available slots do not establish more revenue: actual viewability, fill,
yield and task behavior must be measured. Google's
[placement guidance](https://support.google.com/adsense/answer/1282097?hl=en)
permits multiple units subject to content and user experience, and its
[viewability guidance](https://support.google.com/adsense/answer/6219980?hl=en)
emphasizes actual visible exposure. No revenue loss or abandonment is measured
for QuiltClarity yet. Existing no-interruption/privacy/print rules remain active.

| State                          | Geometry and behavior                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Disabled/unconfigured/excluded | No DOM slot, label, reserved gap or provider request                                                                                  |
| Enabled and configured         | Reserve breakpoint-specific creative height and label/spacing before first paint; asynchronous ad work cannot move content            |
| Pending consent                | No ad request before the selected consent rules permit it; keep the initially reserved geometry stable                                |
| Loading/filled                 | Initialize once near the viewport, outside form/controller critical work, using provider-supported loading; label shown with the unit |
| Unfilled/blocked/error         | No fake ad or error message, no retry loop, no loss of tool functionality; retain the already reserved gap for that page visit        |
| Print/PDF                      | Entire region absent from native print; never passed into planner PDF projection                                                      |

Keeping an empty enabled gap is the explicit tradeoff for preventing post-load
collapse shifts. An unconfigured site has no gap. Do not promise simultaneously
zero empty space and zero shift with an asynchronous provider. If a provider
cannot support this bounded geometry and lifecycle, leave it disabled and
reassess; do not patch with timed collapse or clipped ads. Recalculation never
refreshes an ad, and no ad code belongs inside `renderResult` or domain modules.

### Provider, disclosures and privacy prerequisites

#### Readiness review, 2026-10-08

The owner confirms end-to-end delivery to `contact@quiltclarity.com` works.
This is owner-reported delivery evidence, supplementing the Cloudflare setup
receipt; Codex did not send a test email. The dedicated `/privacy/` page and
footer Privacy/contact links are prepared locally. Publication remains
separate from preparation. AdSense review is still pending in the latest known
account evidence; no fresh dashboard approval evidence or ad-serving authorization
has been supplied.

Local acceptance passes: typecheck, changed-file lint/format, eight affected
route/collector tests, isolated static build and full installed Chrome/Edge
smoke including print/PDF. The build adds one indexable route (39 total,43 HTML
pages). Focused privacy checks pass at320/390/1440px in light/dark and without
JavaScript; both privacy print PDFs contain the required disclosures. Evidence
and remaining owner decisions are in `../architecture/project-status.md`.
No provider loader was exercised; these are site-content/layout gates only.

Current source boundaries:

- `src/lib/persistence/planner-storage.ts` stores schema-v2 project state under
  `quiltclarity:planner-state`, with legacy migration. Storage is origin-scoped,
  not route-scoped. Omitting the loader from tools would reduce direct form/DOM
  exposure, but a top-level loader on a Guide or homepage could still access
  saved projects on the same origin. Neither a route allowlist nor an iframe
  creative proves isolation of the provider's top-level loader.
- `src/scripts/planner.ts` explicitly shares the project title and result summary
  through the browser share sheet, or copies the summary to the clipboard at the
  user's request. This is user-directed sharing, not an analytics payload or a
  shared-project URL-fragment feature.
- `src/lib/analytics/cloudflare-analytics.ts` sends only projected envelopes to
  `/api/analytics`, omits credentials/referrers, and disables collection for
  DNT/GPC, staging and excluded paths. The provider projection and server-side
  validation remain the authoritative closed-data boundary. Adding advertising
  must not expand that boundary or merge project content with ad reports.

The compatibility gate is **unresolved**, not a finding that AdSense currently
collects project content. No loader is installed or tested. Before enabling it,
review documented provider data behavior and the intended configuration, then
audit an isolated preview with synthetic project-name/label/cut-list sentinels,
network payloads, URL/referrer handling, local storage access, consent denial,
withdrawal, provider failure and reload/navigation. A passing bounded audit is
evidence for the tested version/configuration, not proof of future provider code
or a browser isolation boundary. If compatibility cannot be established, retain
the default-off state; changing storage architecture or privacy promises requires
its own explicit product decision. Do not silently drop the approved placements
or claim that content-only ads solve saved-project exposure.

Recommended consent candidate: Google's built-in Privacy & messaging CMP
(Google LLC CMP, ID300 on the current certified list). This is a recommendation,
not owner selection, account configuration or deployment. The current
[publisher CMP requirements](https://support.google.com/adsense/answer/13554116)
require a certified TCF-integrated CMP for personalized ads in the EEA, UK and
Switzerland; certification does not establish full legal compliance. Google's
[setup instructions](https://support.google.com/adsense/answer/10960768?hl=en)
require the site/privacy-policy URL, message choices and provider code, and note
cross-origin referrer-policy compatibility. Do not install that code merely to
prepare the message. A later reviewed integration must test the selected regional
behavior and persistent withdrawal controls before eligible ad requests. Review
[US state messaging](https://support.google.com/adsense/answer/10961479?hl=en)
and the operator's actual applicable obligations/settings separately; do not
invent an operator jurisdiction or declare universal compliance.

The local privacy draft must describe today's browser storage, Cloudflare
measurement/hosting and Cloudflare-to-Gmail contact handling truthfully. Its
conditional advertising section must distinguish proposed AdSense from active
serving, cover Google/vendor advertising cookies and personalization, and link
the relevant controls described in Google's
[required content](https://support.google.com/adsense/answer/1348695?hl=en).
Before serving, replace conditional wording with the actual enabled providers,
consent controls and configuration. Operator identity/jurisdiction, email
retention practices and account consent settings are not supplied facts; no
unsupported retention deadline or legal claim is added.

Routing: parent model demand is interacting provider/browser privacy boundaries
and authority judgment; effort demand is medium source tracing and current
official-provider review. Sol-medium owns the bounded Astro content/footer
implementation. Existing Astro, Playwright Core, route fixtures and build tooling
are sufficient; no capability installation or new dependency is justified.

Owner confirmed Google AdSense as the selected provider on 2026-10-07
("adsense confirm") for readiness preparation. Account status/approval and actual
IDs were initially unestablished. Owner subsequently created the account and
requested review; dashboard evidence confirms the request on2026-10-07. Owner
supplied ca-pub-4803184576327262 and authorized metadata-only publication:
commit7434e05 is live without an ad loader. Approval is pending; live serving
remains outside this confirmation. Release evidence: project status and
tmp/adsense-verification-live.json. Before application or integration, resolve account status,
advertising scope, contact/privacy disclosures, consent and project-data compatibility;
owner completes account, payee/tax and consent configuration where required.
Use the provider's account-specific verification and seller information, never
fabricated publisher/unit IDs. For AdSense, publish its actual authorized-seller
line at `/ads.txt`; Google recommends ads.txt, rather than making it mandatory.
Keep verification separate from enabling ad serving; approval is not guaranteed.
See [Google's ads.txt guide](https://support.google.com/adsense/answer/12171612?hl=en).

Current privacy information is in `src/pages/about.astro`; footer has no Privacy
link and there is no dedicated Privacy route. Before advertising, prepare a
truthful dedicated privacy disclosure covering the actual provider, cookies/
storage, data recipients, controls and relevant operator/contact information;
link it from the footer. No live inbox exists at Feedback. Select a real operator
contact channel without implying the planned V2 Feedback System has shipped.
Do not publish statements claiming an unconfigured provider is already active.
Google describes required advertising disclosures in
[Required content](https://support.google.com/adsense/answer/1348695?hl=en).

For AdSense, choose and validate the required certified consent solution and
regional behavior, including EEA/UK/Switzerland. Do not assume nonpersonalized
advertising eliminates consent requirements. See
[Google's publisher CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en).
No custom geolocation/fingerprint service is proposed. Consent denial, withdrawal,
storage failure, DNT/GPC policy and disabled provider must preserve calculations.
Actual regional/legal obligations and account settings must be resolved before
serving; this design does not claim legal compliance.

Keep existing closed analytics unchanged: no ad-click listener, visitor ID,
project dimension, arbitrary metadata or revenue field added. Use provider's
aggregate unit reports for revenue/fill; never merge them with planner content.
Do not read localStorage/project state or send names, measurements, cut lists,
query strings or shared fragments to ad APIs. A third-party script executing in
the page can access DOM and browser state; an iframe creative alone does not
prove its loader is isolated. Explicitly review the provider's top-level script
and data behavior against product-spec section18 before any calculator/planner
enablement. If compatibility cannot be established, keep tools ad-free rather
than silently weaken project privacy. Route-limit scripts to eligible surfaces;
do not add a global provider loader to every BaseLayout page.

### Implementation, checks and rollout

#### ads.txt and automatic experiments preparation, 2026-10-08

Owner authorizes preparing ads.txt and disabling automatic placement experiments
while consent propagation/site review remain open. Added local `public/ads.txt`:

```text
google.com, pub-4803184576327262, DIRECT, f08c47fec0942fa0
```

The publisher ID matches account/source verification. The [Google ads.txt guide](https://support.google.com/adsense/answer/12171612?hl=en)
specifies this format and root location. Isolated build44 pages PASS; source and
`dist/ads.txt` match exactly. No ad runtime/units are added; file publication is
separate from preparation and AdSense crawl status can lag after publication.

Saved Auto optimise OFF and auto-apply experiment winner OFF for quiltclarity.com.
Reopened editor readback confirms both false; By site table confirms Auto ads
still OFF. Receipt: `tmp/auto-optimise-disabled-status.yml`. This preserves the
owner's explicit placements against automatic format experiments; it does not
replace consent/privacy/runtime acceptance. [Google's experiment settings](https://support.google.com/adsense/answer/15876143?hl=en)
describe the separate controls. No commit/push/deploy in this preparation task.

#### Consent configuration and widened-layout recheck, 2026-10-08

The owner explicitly keeps Google's common partners. Retained the EU automatic
common list (198 at inspection) and US active partners (334). An individual
in-depth investigation of every selected vendor is not an acceptance requirement;
Google's CMP populates its partner disclosure and consent controls. This does not
prove isolation from saved project data.

European maximise-message-coverage is now OFF. Its fallback can use a two-button
Consent/Manage options message and its own optimization, bypassing the prepared
first-screen decline and optimization-OFF choices. Other EU account settings
remain as inspected. See [Google's fallback guidance](https://support.google.com/adsense/answer/17341119?hl=en).

Both messages are now Published in the AdSense account for isolated testing:
`QuiltClarity privacy choices` (English en, 32 listed European regions, decline
and close-to-decline ON, optimization OFF) and `QuiltClarity US privacy choices`
(English en-US, opt-out ON, all current/future supported states, 20 currently
listed). Optional logo OFF on both. The US first publication attempt failed
because the default header required an absent logo; disabling that unused logo
resolved the actual validation failure. Readbacks:
`tmp/consent-{eu,us}-published-status.yml`. Publication is account configuration;
production still has no AdSense runtime tag, no units, Auto ads OFF, and no ads.
Site approval is still Getting ready; ads.txt Not found at fresh inspection.

The widened local mockup passes 96 installed Chrome/Edge checks across12 routes
and320/390/1440/1920px. Frame bounds, locked slots, control clearance, overflow,
rail/creative containment and representative print checks pass. Contact/Privacy
now fit paired300x250 rails at1920px with no rails at1440/mobile. No placement
rule changed. Receipt: `tmp/ad-layout/width-recheck.json`. Temporary servers
stopped; untracked preview accepts an optional upstream URL, default still4322.

The prepared isolated runtime test uses fresh Chrome/Edge profiles and the real
HTTPS site origin with first-party bytes fulfilled from the verified static build.
Only synthetic project text is seeded. Its positive control detects a deliberate
planner-key read and blocks ad/sentinel-bearing requests before network. The
initial authorized discovery loaded the exact loader/versioned implementations,
with all ad/lookup/quality requests blocked; no CMP resource or message arrived,
and googlefc/TCF APIs were undefined. No observed sentinel transfer establishes
only this bounded observation. Publication can take up to an hour; propagation
and dependency on blocked requests remain unresolved. Do not permit ad endpoints
or guess a direct Funding Choices URL to force a result. Official guidance uses
the ordinary AdSense tag; the explicit Privacy & messaging tag is for ad-block
recovery, not a documented standalone consent-only deployment for this setup.
See [Google's troubleshooting](https://support.google.com/adsense/answer/14660912?hl=en)
and [API documentation](https://developers.google.com/funding-choices/fc-api-docs).
Receipts and reproducible gate: `tmp/consent-runtime/README.md`. Actual pending/
accept/refuse/withdraw/reload/failure lifecycle and project-data compatibility
remain unverified; provider serving stays off until those gates pass.
One later head-tag recheck confirmed matching publisher, top-level document and
origin Referrer in Chrome/Edge; the same absence of CMP resources/message/APIs
remained. No further provider run followed. Two test-instrumentation errors in
blocked child frames were corrected afterward with a top-frame guard; the saved
provider receipt still contains those errors. Production HTML remains untagged.

#### Selected Google CMP setup, 2026-10-08

The owner selected Google's built-in Privacy & messaging CMP and authorized
continuation of consent setup and the project-data review. This supersedes the
earlier proposed-candidate status. Owner selection is not visitor consent and
does not relax the project-data contract or authorize ungated ad serving.

Account access recovered after the owner signed in directly to the supported
fallback browser. The computer-control runtime still exits during initialization.
Codex created and verified an unpublished `QuiltClarity privacy choices` draft
for `quiltclarity.com`, English (`en`), with first-screen Do not consent enabled
in every listed European region, Close (do not consent) ON and message
optimization OFF. Site display name and the prepared privacy-policy URL were
saved. The optional logo is OFF, retaining a text QuiltClarity header; no new
brand asset was uploaded. The account Messages table confirms Draft, modified
8 October2026, with publication switch OFF. No message was published and no
loader was deployed. Account-wide settings were inspected but not changed:
common ad partners198, coverage maximization ON, legitimate-interest controls
ON and enabled by default, Google consent mode OFF, special-feature-two OFF,
owner data purposes0. These remain configuration/disclosure review inputs;
the draft preview's zero-partner placeholder is not evidence of no partners.
Reopening after saving confirms the configured choices persisted; mobile draft
preview shows equally styled Consent and Do not consent buttons, Manage options
and close-to-decline. Evidence is in project status. This is an account preview,
not live regional consent, keyboard/assistive-technology or real-device acceptance.

Prepared message settings (to apply and verify in the account):

| Field                                  | Prepared choice                                                       | Reason / dependency                                                                                        |
| -------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Message type                           | European regulations, Google CMP                                      | Selected provider-native consent manager                                                                   |
| Site                                   | `quiltclarity.com`                                                    | Verify the actual site entry and review state; do not invent a site ID                                     |
| Message name                           | `QuiltClarity privacy choices`                                        | Internal account label                                                                                     |
| Default language                       | English (`en`)                                                        | Current site language; no unreviewed extra translations                                                    |
| Privacy policy URL                     | `https://quiltclarity.com/privacy/`                                   | Local source exists; verify published HTTP200/content before publishing a message                          |
| Do not consent                         | ON on the first screen throughout EEA/UK/Switzerland                  | A direct decline choice; preserve calculations after denial                                                |
| Close (do not consent)                 | ON, if available                                                      | Dismissal must decline, not silently grant consent                                                         |
| Consent message optimization           | OFF initially                                                         | Keep the reviewed choices stable during acceptance                                                         |
| Design                                 | Readable site colors, clear focus, no obscured choices                | Check narrow mobile, keyboard, zoom, contrast and dismissal                                                |
| Other Google consent-mode integrations | Do not enable unrelated Google Ads/Analytics integrations             | QuiltClarity uses its separate closed Cloudflare measurement; no Google Analytics deployment is authorized |
| Save state                             | Draft until public policy, provider-data gate and runtime review pass | Preparation is separate from message publication and ad activation                                         |

The table describes prepared choices; the paragraph above identifies those
actually saved and the account settings left unchanged.
First inspect existing messages, partners and account-wide settings. Reuse an
appropriate existing draft rather than creating duplicate messages; do not
overwrite other sites' shared settings. Record the actual selected ad partners,
purpose/legitimate-interest options, regions and any owner-data-use request before
reviewing the published disclosure. Do not add owner data-use purposes without
an actual need. Review applicable US state messages/opt-outs and GPC handling
against the actual operator/account configuration; do not infer jurisdiction
from the development machine's timezone.

Official instructions:
[create a European regulations message](https://support.google.com/adsense/answer/10960768?hl=en),
[manage consent mode settings](https://support.google.com/adsense/answer/16053245?hl=en),
and [Privacy & messaging tests](https://support.google.com/adsense/answer/10924669?hl=en).
The account preview can review the draft UI, but live regional delivery and
withdrawal require the actual published message and supported runtime tagging.
Google documents `?fc=alwaysshow&fctype=gdpr` for testing the published European
message regardless of region; it is not an ad-test flag, a simulator of legal
location, or authorization to request real ads from a development page.

Runtime acceptance must cover pending/accept/decline/withdraw choices, repeated
visits, provider/network/storage failure and print. Declining or withdrawing must
never disable the calculators. No new global loader or custom consent popup is
added while the actual provider configuration and data behavior are unresolved.

#### Isolated loader privacy outcome, 2026-10-08

Sol's synthetic-data audit is complete in installed Chrome and Edge. It used the
isolated static build on localhost, seeded project-name/fabric-notes/piece-label/
cut-list sentinels in the actual planner storage key and a DOM node, and executed
the actual publisher loader plus its reviewed versioned implementation script.
All other external requests were captured and aborted before network. No ad unit
was pushed and no creative was served or clicked. The positive control proved
the probes recorded a deliberate planner-key read and marker-bearing request.

In this bounded run, Google code read `google_ama_config`, `__storage_test__`,
`__lsv__` and `__lsa__`, with no observed planner-key read or synthetic marker in
captured request URLs/headers/bodies. The DOM probe is partial. This establishes
only a narrow no-project-text observation, not provider isolation or a full
compatibility PASS. Ad/CMP responses were blocked, actual origin and regional
consent were not reproduced, and scripts can change. Receipts, positive control,
endpoints, version variants and SHA-256 hashes: `../../tmp/ad-privacy/README.md`,
`../../tmp/ad-privacy/loader-audit.json` and the adjacent reproducible helper.

Both browsers attempted `/pagead/ads`, lookup and ad-quality requests without a
manual unit push. These were blocked; the attempted ad URL carried publisher ID,
page URL and browser/viewport/time parameters. `format=0x0` and off-screen
geometry do not establish a displayable creative. The account's By site table
subsequently showed Auto ads **OFF**, Auto optimise **ON**, zero exclusions and
one site. No ad setting was changed. The localhost attempts therefore cannot be
attributed to Auto ads being enabled on `quiltclarity.com`; their precise cause
and actual-site serving outcome remain undetermined. Treat a bare loader as
capable of initiating provider requests even without visible/manual slots.

Google documents that
[ad tags can set cookies without a displayed ad](https://support.google.com/adsense/answer/7549925?hl=en),
and that [Auto optimize](https://support.google.com/adsense/answer/9141298?hl=en)
can experiment on Auto ads formats/settings. Before any activation, review and
lock account experiment behavior against the owner-approved explicit placements;
do not claim the current OFF setting proves no request or future placement change.
No global loader was added. Keep live serving disabled until published truthful
disclosure, actual consent configuration and configuration-specific privacy/
network/denial/withdrawal tests pass. A later compatibility conclusion must retain
the limits of dynamic third-party code and the unchanged project privacy contract.

1. Owner selected AdSense, requested account review and authorized publication
   of the verification-only meta tag on 2026-10-07. Approval is pending. Resolve
   disclosure/contact, project-data compatibility and consent before ad serving.
2. Implement a small `AdSlot.astro` plus isolated provider adapter and explicit
   build-time route allowlist/kill switch. Default off. A preview uses clearly
   identified local mock creatives, not real ad impressions or clicks. Verify
   provider-specific sizing uses only supported modifications; Google's guidance
   is [responsive tag parameters](https://support.google.com/adsense/answer/9183460?hl=en).
3. Continue provider review, actual units/ads.txt and consent setup only with
   the required owner account authorization. Record exact state. The published
   meta tag proves ownership verification setup, not provider approval or serving.
4. Before publication, run portable verify, build and affected installed
   Chrome/Edge smoke/browser/print gates. Cover enabled/disabled/empty/blocked/
   slow/error/consent states, repeated initialization, breakpoint crossing,
   narrow widths, dark mode, keyboard navigation and no-JS static content.
   All existing calculations, persistence, help and privacy fixtures must pass.
   Planner PDF and clean paginated native print must contain no ads or ad gaps,
   with existing diagram/title/legend and painted-bounds assertions preserved.
5. Capture matched no-ad versus mock/provider test measurements. Require no
   slot-induced content shift, overflow, obscured control, provider exception
   escaping into tool handlers, or regression in the existing performance gate.
   Provider scripts cannot be synchronous calculation dependencies. Field CWV
   remains unknown until enough data exists; a lab pass is not a field PASS.
6. Owner-authorized live pilot enables only the two named guide pages. Review
   after at least seven days: layout/failures, provider unit impressions/fill,
   revenue and any available field performance. Low traffic may require longer;
   no invented minimum traffic threshold or guaranteed earnings. Follow with
   remaining guides, then calculators, then a separately reviewed planner pilot.
   Each expansion needs sufficient affected checks and an explicit rollout choice.

Success: provider/policy acceptance, positive useful revenue evidence, and
preserved usability/privacy/performance. The current 13 search impressions cannot
predict revenue. Stop and disable affected routes immediately for project-data
transmission, broken consent, obscured tools, ad-caused print failures or layout
movement. Pause expansion for poor fill/revenue or uncertain performance; sparse
aggregate events cannot prove user abandonment. Owner operates the provider and
reviews reports; Codex can prepare fixes and verification within authorized scope.
Rollback is a reviewed build with the kill switch off: no slots or loader on new
page loads; do not claim an existing open tab can unload a third-party script.
Privacy text must remain truthful about the actual operational state.

### Review outcome and remaining decisions

Design recommendation is complete for review; implementation, provider choice,
account application, disclosures, consent setup and rollout are not complete.
Recommended next decision: approve conservative manual placement scope and
confirm whether to evaluate AdSense. Then prepare provider-specific privacy/
contact and consent requirements before enabling any real ads. Full Pages report
processing remains independent monitoring work, not an automatic design blocker.

## Repository source routes

- `launch-readiness-status.md`, Deferred post-live decisions: AdSense application
  and placement review, truthful policies, live-site quality review.
- `quilt_LAUNCH_growth_package.md`, AdSense/placement/affiliate headings: readiness, placement principles
  and optional affiliate directions.
- `../v1.1/04_CONTENT_SEO_ROUTES.md`, section 14: ads must not interrupt entry,
  separate labels/controls or results/explanations, print, or shift layout.
- `quilt_LAUNCH_postlaunch_framework.md`: post-live observation and improvement.
- `../architecture/continuation-roadmap.md`: visibility after launch acceptance.

The August agreement survived in conversation evidence and the deferred review
survived in repository docs. The compact task map did not make that route explicit
enough, and the session failed to follow the existing sources.
