# Launch Readiness Status

**Started:** 2026-08-10  
**Authority:** Active launch instructions are subordinate to `../v1.1/README.md`
and its authority chain, with the recorded M9/Guides substitutions and Feedback
deferral. `docs/product/quilt_FINAL_*` is historical V1 evidence.

## Current conclusion

Recorded source validation passes the portable release gate, installed-browser
smoke gate, and dated V1.1 M10 competitive launch gate. This documentation
checkpoint does not constitute a fresh runtime release run. Guides/help implementation and
technical validation are complete, and owner cases MT-U01/MT-U02 passed on
2026-09-30 under the approved substitution (not independent novice evidence).
Continuation-document reconciliation is complete on 2026-09-30; scope and
evidence are in `../architecture/project-status.md`. Static deployment, apex/www
redirects, HTTPS enforcement, hosted CI and first automatic Cloudflare deployment
passed on 2026-10-01. Full public Chrome/Edge mobile viewport and clean PDF
print audits pass on the same date. Search Console setup is complete per owner
(robots detected 2026-10-05); indexing remains monitoring work. Production
measurement passed 2026-10-02. Owner accepted iPhone/tablet PDF 2026-10-03 and
waived Firefox acceptance 2026-10-05; Firefox remains untested, not PASS.
Latest print/PDF changes are published in runtime commit 9d7d342 (2026-10-05).
Hosted CI, automatic deployment and full public Chrome/Edge acceptance pass
2026-10-05; audit-only follow-up 9dbd2ba preserves runtime output. No current
release blocker remains. See the Resume Checkpoint for versions and evidence.
Local source identity activation is complete
on 2026-10-01 under `../decisions/site-identity-activation.md`: verify (215 tests),
42-page build and fresh installed Chrome/Edge metadata/mobile/print audits pass.
The owner confirmed on 2026-10-01 that trademark search and purchase of
`quiltclarity.com` had already completed. The earlier pre-purchase next step
was stale; it must not be repeated.

The active regression gate covers V1.1 G01-G45, properties, and separate legacy
diagnostics D01-D05. Older G01-G27 and V1 baseline language is historical.

## V1.1 competitive gate verified on 2026-08-31

- The required same-job C1-C5 cases pass in QuiltClarity without outside
  spreadsheet or scrap reconciliation.
- Current first-party evidence was refreshed for QuiltSandwich, Quilt Geek,
  Gibson Threads, NiftyFifty, The Quilters Retreat, PreQuilt, QuiltButler, and
  Quiltler. Newly discovered ScrapFit was added because it is a strong exact
  remnant/grain-aware nesting alternative.
- ScrapFit stops at placed/unplaced stock pieces; The Quilters Retreat stops at
  fresh-bolt multi-set planning; QuiltSandwich calculates different pieces
  independently and represents on-hand fabric as an amount. No reviewed product
  combines the complete exact-stock plus purchase-shortfall plus pattern plus
  execution job comparably.
- No automatic competitive blocker or correctness defect was found. Current
  website claims remain accurate and do not assert exclusivity or global
  optimality.
- The gate is **PASS**, with sources, descriptive scoring, representative inputs,
  limitations, and the best-alternative boundary recorded in
  `v1.1-m10-competitive-launch-gate-2026-08-31.md`.

## Differentiation hardening verified on 2026-08-17

- The additive overlay is complete without changing the recommended optimizer selection, practical-cutting priorities, architecture, or V1 scope.
- Every multi-group fabric receives a raw recommended-versus-separate comparison; single-group fabrics return `not_applicable`, and comparison state never crosses fabric boundaries.
- D01-D05 and property tests lock three-group filling, no fake savings, directionality, WOF-strip behavior, deterministic arithmetic, safety/rounding isolation, and multiple-fabric independence.
- Result copy remains secondary to shopping quantity and cutting instructions. Positive savings language is guarded by a real positive raw-length difference.
- `optimization_completed` carries only coarse allow-listed outcome and percentage-band fields; no exact measurement or project content enters analytics.
- Typecheck and lint pass; 129 tests and the 19-page build pass. The repository-wide format step is blocked only by the unrelated, intentionally unread `docs/v2/quilt_V2_deep_research_and_design_master_brief.md`; all touched files are formatted. Chrome and Edge smoke pass the comparison UX, structured/emphasized diagram text, unit-aware waste-area display, analytics, accessibility, 390×844 mobile containment, performance fallback, and print/PDF pagination.
- The refreshed first-party competitor evidence explicitly records that cross-group optimization is not unique. The defensible launch combination is direct arbitrary piece entry, independent constrained fabrics, explicit assumptions and executable instructions, and measured joint-planning effect without design-first or account setup.

## Verified locally on 2026-08-10

- `npm run verify`: zero Astro diagnostics, clean lint/formatting, 109 passing tests, and a successful 19-page static build.
- `npm run smoke:browser`: Chrome and Edge pass across 18 indexable routes, crawl controls, planner/calculator flows, persistence, analytics, accessibility checks, bounded fallback, and print output.
- The browser harness also passes a 390x844 touch viewport in Chrome and Edge, covering page overflow, stacked header/forms, 44px controls, contained planner results/diagrams, and calculator stacking.
- Static architecture remains Astro-first with framework-independent domain TypeScript, no backend, database, authentication, AI endpoint, or runtime calculation service.
- The generated site includes unique metadata, pathname canonicals, static content, crawlable navigation, an 18-route sitemap, production/staging-aware robots output, and a noindex 404.
- Analytics uses the closed privacy-safe event contract and contains provider failures.
- No content placeholders or broken `href="#"` links were found. The planner's example input placeholder is intentional form guidance.
- The missing favicon identified by the launch checklist was added as `/favicon.svg` and linked from the shared layout.
- The live public-evidence competitor review is recorded in `competitor-benchmark-2026-08-10.md`. It found meaningful differentiation for the locked piece-list workflow and no justification for expanding V1 into a design canvas, pattern library, accounts, cloud sync, image ingestion, community, arbitrary shapes, or PDF generation.

## Activation state and remaining decisions

- Guides/help owner acceptance is complete; execution evidence and limits are
  in `../manual-tests/V1_1_GUIDES_HELP_MANUAL_TESTS.md`.
- Trademark search and domain purchase are complete per owner confirmation.
  Purchased identity: `quiltclarity.com` / `QuiltClarity`. Local source Phase 5
  is complete, including public names, metadata, apex origin and local legacy-key
  migration. Separate report location and registrar,
  purchase/renewal details are not recorded. Apex is the canonical live host;
  WWW permanently redirects to it with path/query retained.
  Do not treat missing repository records as incomplete search or purchase.
- Cloudflare + Astro is already selected per owner confirmation on 2026-10-01.
  Active zone and assets-only apex/www Workers are verified and deployed. Use the
  [hosting decision](../decisions/cloudflare-static-hosting.md) and README setup.
- Feedback System is deferred to V2 under the
  [owner-approved decision](../decisions/v1.1-feedback-system-deferral.md).
  The retained `/corrections/` page conveys coming-soon availability; a feedback
  inbox is not a V1.1 launch dependency.
- Public GitHub repository is pushed, hosted CI passes, and Cloudflare Builds
  automatically deploys `main`; first automatic build and active version pass.
- Confirm host configuration uses the purchased apex `SITE_URL` default (or an
  explicitly selected canonical origin); configure `PUBLIC_GOOGLE_SITE_VERIFICATION`
  when Search Console supplies it. HTTP-to-HTTPS enforcement passes.
- Owner selected Simple Analytics on 2026-10-02. Default-disabled integration
  is prepared; register the production site, confirm plan event/property support,
  then activate and verify dashboard receipt. Do not expand the payload schema.

Live activation, 2026-10-02 supersedes the preparation status above: owner
confirms quiltclarity.com is registered. Selective source commit e5c4026 enables
the public-only .env.production profile; Cloudflare automatic deployment serves
the analytics shell and disclosure. Live pageview/tool-view/start/completion
requests receive HTTP 201 with success:true from the provider and exclude
query/hash secrets, referrer and cookies. Actual dashboard reports/onboarding
detection await owner confirmation; API receipt alone does not establish that
view. Hosted CI passes after the independent fixture correction in 6282258;
local verify (219 tests), enabled intercepted privacy audit and full installed
Chrome/Edge mobile/print suites pass. No standard SDK was added. Override
PUBLIC_SIMPLE_ANALYTICS_ENABLED=false in the build process and rebuild to roll
back; production profile remains durable across automatic Builds.

Production measurement review, 2026-10-01 (historical recommendation; owner
selected Simple Analytics preparation on 2026-10-02):
Simple Analytics is the preferred candidate for the existing closed workflow
events. Its [event API](https://docs.simpleanalytics.com/events) and
[metadata API](https://docs.simpleanalytics.com/metadata) support event counts
and categorical properties; its [collection documentation](https://docs.simpleanalytics.com/data-collection)
states that IP addresses are neither stored nor hashed. This fits the current
no-fingerprint requirement more closely than the alternatives reviewed. Verify
the selected plan supports required events/properties before adoption. The
[pricing page](https://www.simpleanalytics.com/pricing) currently displays a
self-serve price of GBP 20/month at 100k pageviews and a free hobby plan with
one-month history and a required badge; currency, billing frequency, eligibility
and event-feature entitlement need confirmation in the owner's account. No
subscription, trial or account was created.

[Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/faq/)
does not support custom events. It can supply traffic/performance evidence but
cannot establish planner completion, stock use or print/copy actions; choosing
it alone leaves workflow measurement pending. [GA4](https://developers.google.com/analytics/devguides/collection/ga4/events)
supports custom events, but its standard cookie/identifier behavior would require
an explicit privacy-contract decision and consent design before integration.
[Plausible](https://plausible.io/data-policy) supports events but derives daily
visitor identifiers from IP/User-Agent hashes, so it is not recommended under
the current prohibition on fingerprints. These are product-fit judgments, not
legal compliance determinations or claims that all provider configurations were
tested.

Proposed integration acceptance after owner selection: install one optional
static browser bridge before controller events fire, consuming only
`quiltclarity:analytics` and the exact typed event/field allow-list in
`src/lib/analytics/analytics.ts`. Do not forward an arbitrary dataLayer, DOM
content, project storage, URL queries/fragments, free-text referrers, automatic
click/form collection or vendor visitor identifiers. Review the provider's
automatic pageview/referrer/campaign collection and disable or sanitize it to
the approved static routes before production use. Preserve the local date-only
returning-user boolean and contain blocked-script/network/queue failures.
Count activation as event ratios, not unique-user conversion: repeated attempts
can inflate counts and no cross-visit user funnel is promised. Verify delivery
in the actual provider dashboard with controlled planner/calculator/guide cases,
inspect every network payload for prohibited content, test delayed/blocked
loading and sink failures, and run the affected release/browser gates. Update
operator/privacy disclosures to the actual chosen configuration. No application
code or hosting setting was changed by this review; provider delivery remains
pending until an owner-selected account/plan is configured and verified.

Setup preparation, 2026-10-02: The vendor's
[ignore-metrics settings](https://docs.simpleanalytics.com/ignore-metrics)
can disable referrer, campaign parameters, page-load IDs, engagement, browser,
viewport and language collection. Start with all optional metrics disabled;
do not enable the separate automated-events helper. A fixed canonical path
must be supplied from the static page shell, not arbitrary browser pathname
input. The documented [path overwriter](https://docs.simpleanalytics.com/overwrite-path)
falls back to the original path on an error or falsy result, so it cannot be
treated as a fail-closed privacy filter without verification of the selected
script. Keep hash collection disabled and verify query/hash/referrer handling
against the actual vendor payload, including on shared planner URLs.
The [placeholder event function](https://docs.simpleanalytics.com/events)
supports early events, but the stock example queue is unbounded; any adopted
bridge must cap its queue and contain delayed/blocked vendor loading. These
are reviewed integration requirements, not implemented or runtime-tested
settings. Owner subsequently selected Simple Analytics and authorized disabled
integration preparation. Account/plan confirmation and activation remain pending.
Source inspection supersedes the SDK setup proposal: latest and pinned SRI v11
append client-hint fields despite the ignored-useragent setting and report
arbitrary error text/runtime paths. Preparation therefore uses the
[documented JSON endpoint](https://docs.simpleanalytics.com/events/server-side)
directly from the static browser client; no vendor SDK or backend is added.
A non-submitting CORS OPTIONS check returns 204 and permits POST/Content-Type
from the production origin. This proves browser transport support only;
dashboard receipt requires the actual owner account and controlled activation.

Preparation completion, 2026-10-02: The direct browser bridge is implemented
and remains disabled by default. Full verify (219 tests), static build and
installed Chrome/Edge browser/print gates pass. Intercepted enabled-build tests
verify canonical pageviews, startup/tool-completion payloads, secret query/hash
exclusion, privacy-signal/noindex suppression and failed-network usability;
default builds send no provider requests. Activation instructions and the
intercepted audit are in README. Account/plan confirmation, production rollout
and real dashboard receipt remain pending. No actual events were submitted by
the audit and no public deployment was performed.

## Pending on the deployed origin

- Public release acceptance, 2026-10-05: Current main 9dbd2ba, runtime 9d7d342,
  is automatically deployed at 100%; hosted CI and full public Chrome/Edge
  native-print/mobile-PDF audit pass, including first-click font readiness and
  privacy. This supersedes local-only/deployment-pending rows below. Firefox is
  waived, untested; next work is post-launch monitoring and ads review/design.
- Search Console closure, 2026-10-05: Owner confirms robots is finally detected.
  Ownership, sitemap Success and robots detection are complete; the earlier
  missing-robots report is superseded. Continue post-launch indexing/crawl review.
- Owner local PDF acceptance, 2026-10-03: iPhone/tablet PDF works. This closes
  the deferred physical export/viewer check for the local implementation;
  Firefox and production deployment remain pending. Earlier native-print
  failures below are historical evidence, not a failed PDF-export retest.
- HTTPS, apex canonicals, all 38 sitemap routes, robots, real 404 and WWW 301
  pass the focused public check on 2026-10-01. HTTP-to-HTTPS 301 passes with
  path/query preservation; post-automatic-deploy apex and sitemap checks pass.
- Update 2026-10-02: Owner reports sitemap Success, superseding the earlier
  fetch failure below. Settings still says "No robots.txt file"; fresh apex
  robots returns HTTP200 text/plain with Allow: / and the correct sitemap.
  Recheck robots/crawl reporting October 3; no site change justified.
- Owner confirmed Search Console ownership verification complete on 2026-10-01.
  Domain property confirmed; submitted sitemap reports "Couldn't fetch". Direct
  HTTP 200/XML/38-entry and robots checks pass. Owner subsequently reports test
  success only for Test live URL; Sitemaps remains "Couldn't fetch". Leave the
  submission in place, recheck processing status, and inspect representative pages. No site/security setting was changed during diagnosis.
- Public recheck, 2026-10-02: sitemap returns HTTP 200 application/xml with
  38 entries; robots returns HTTP 200 text/plain, allows crawling and points to
  the exact apex sitemap. This does not establish Google's processing outcome.
  Browser automation initialization failed twice with a trusted Node runtime
  exit; current signed-in Search Console status could not be inspected. Owner
  report of status, Last read and detailed error remains pending.
- Confirm production analytics delivery without planner-content leakage.
- Latest owner local retest, 2026-10-02: Print isolation fixes blank sheets and
  missing final content. Labels also pass. Diagram orientation and efficient
  page fit still fail; native Print versus additional print-ready PDF preference
  is pending. No production deployment. Earlier failure details remain below.
- Physical iPhone print failure, 2026-10-02: Owner used QuiltClarity's Print
  button in Chrome and Safari; both lose dedicated pages/mixed orientation and
  clip diagrams. This supersedes the prior absence of device print evidence.
  Local CSS now adds explicit diagram page breaks and containing-width limits;
  local retest FAIL: extra blank sheet, orientation unchanged, final remaining
  regions/related content missing. Deployment remains pending; inspect actual
  print isolation correction locally; device PDF is optional evidence. Physical
  retest and mixed orientation remain unresolved. See the
  Resume Checkpoint for technical verification and evidence limits.
- Full public-origin Chrome/Edge suite passes on 2026-10-01, including narrow
  mobile viewport layouts, workflows, keyboard, persistence, closed analytics
  adapter and clean PDF geometry/paint. These are desktop-engine checks; physical
  mobile Safari and Firefox evidence remain pending. Provider delivery is unproven.
- Monitor field Core Web Vitals and indexing; local synthetic checks cannot establish real-user performance or canonical selection.

## Deferred until monetization review

- Owner selected AdSense for readiness preparation and requested account review
  on 2026-10-07. Verification-only meta tag 7434e05 is live; approval is pending.
  Owner-locked placements and sizing have a verified isolated local mockup.
  Contact/privacy, consent and project-data compatibility remain before ad
  serving. No production loader or slots are implemented. The recovered August
  agreement, design, evidence and rollout limits are in `postlaunch-ads-review.md`.
- Contact, privacy, and terms/disclaimer content must reflect the real operator, host, analytics provider, jurisdiction, and monetization configuration. Do not invent legal identity or policy details before those inputs exist.
- Apply for AdSense only after a live-site quality review confirms the package's readiness conditions.

## Next launch-prep task

M9 and M10 are complete, with M9's external-user-evidence limitation preserved.
The Guides/help checkpoint is accepted and continuation documents are
reconciled as of 2026-09-30, with purchase status corrected on 2026-10-01.
Trademark search, domain purchase and local source activation are complete.
The public [GitHub repository](https://github.com/akashdas98/quiltclarity) is
connected and pushed; [hosted CI](https://github.com/akashdas98/quiltclarity/actions/runs/36860209033)
passes on 2026-10-01. Static deployment is live at <https://quiltclarity.com>.
HTTPS enforcement and the first automatic Cloudflare build/deployment pass.
Finish Search Console and remaining launch checks.

## Cloudflare measurement preparation � 2026-10-02

Owner approved replacing the paid-only Simple Analytics event feature with
free-only Analytics Engine. Local commit 2816237 implements the collector and
private reports; 222 application tests, six report tests, installed Chrome/Edge
workflow/print and intercepted privacy audits, disabled profile and Wrangler
dry run pass. Account SQL/subscription reads are 403 with the current limited
OAuth login. Owner Workers Free confirmation and Analytics Read token are
needed for activation and actual report receipt. The commit is not yet pushed
or deployed; live Simple Analytics measurement remains the prior production
state. No billing or account permission changed.

Owner confirms Workers Free on 2026-10-02. Deployment rejects version creation
with code 10089 because account Analytics Engine is not enabled; uploaded assets
did not activate a new version. Active production version is
49803d53-f5b8-438a-a753-ed516bd61ceb; prior Simple Analytics disclosure remains
served with HTTP 200. Browser initialization is unavailable (Windows sandbox ACL
failure). Owner service enablement and an Analytics Read token remain required.

## Cloudflare measurement live � 2026-10-02

Owner-enabled Analytics Engine now uses quiltclarity_analytics_engine binding
and quiltclarity_analytics_events dataset. Commits 2816237/7968157 are published;
manual deployment and subsequent automatic Builds pass. Active version
099c01fd-b34c-468b-b80e-61f6e6fb3a71 is at100%; hosted CI36976754157 passes.
Live canonical pageview/tool/calculation fetches resolve204 and private SQL reports
prove stored events without private sentinels. Zero Simple Analytics traffic is
observed. HTTP/www301, real404 and38-route sitemap remain correct. The read token
stays in ignored local .env.analytics; no billing or permissions expanded. Early
counts include technical audit events. The browser CDP abort diagnostic after204
is superseded by actual fetch-promise success and confirmed SQL receipt.
