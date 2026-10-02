# Milestone 9 Analytics and Privacy

Current identifier spelling is superseded by the
[2026-10-01 identity activation](site-identity-activation.md): runtime events
and marker writes use `quiltclarity:*`, with legacy local-key migration.
The historical namespace below does not override that decision or expand the
closed event/privacy contract.

## Decision

Quilter uses a small typed browser adapter with a closed event union and allow-listed calculator identifiers. The adapter emits a provider-neutral `quilter:analytics` DOM event and, only when a deployment has already created one, appends the same safe event to `window.dataLayer`. Every adapter call contains its own failure boundary.

V1.1 M8 expands the closed action taxonomy at controller-owned workflow transitions: planner start; fabric, stock, and cut-requirement add/remove; paste open/preview/complete/fail; pattern-reference presence; calculation start/complete/fail; stock sufficiency or purchase shortfall; allocation, comparison, and cutting-plan views; printing; and shopping-list copy. Calculators emit start, completion, categorized error, result print, and project-transfer events. Compatibility events for tool views, advanced settings, result sharing, and coarse joint-planning diagnostics remain closed and typed.

Planner and calculator controllers emit only the locked action taxonomy, fixed tool identifiers, booleans, fixed categories, and coarse count bands. The planner calculation context may report the unit system; fabric, requirement, and physical-stock count bands; stock/pattern/directional presence; completion category; and whether purchase is required. Paste events report only row bands and fixed outcome/error categories. The existing `optimization_completed` event retains only `comparison_outcome` and `savings_band`. Events do not send project names, fabric names, piece labels, notes, dimensions, quantities, exact counts, exact calculated values, pattern amounts, stock details, pasted content, copied/shared content, or an extensible metadata object.

Repeat-use measurement is limited to a separate local date marker, `quilter:analytics-first-used-date`. It stores only the first local `YYYY-MM-DD` date and yields a `returning_user` boolean on tool views; it is not a user identifier, is never joined to project state, and fails closed to `false` when storage is unavailable. No cross-site identifier or fingerprint is created.

Search Console readiness uses the existing static sitemap and canonicals plus an optional `PUBLIC_GOOGLE_SITE_VERIFICATION` build-time meta tag. No analytics vendor, tag manager, cookie, fingerprint, account, backend, or network endpoint is added by the application.

The owner-selected Simple Analytics preparation supersedes only the preceding
no-provider/no-network implementation state. Production measurement remains
opt-in. The owner-confirmed registered production profile enables it through
the tracked public-only `.env.production`; explicit process-environment false
disables it, and local/staging origins remain blocked. A separate static browser bridge may POST to
the [documented event endpoint](https://docs.simpleanalytics.com/events/server-side)
using only fixed provider routing fields, the canonical static page path,
a fixed application user-agent label, and an event-specific runtime projection
of the existing closed taxonomy. One canonical pageview may be counted per
eligible page load. No vendor SDK, arbitrary dataLayer forwarding, automatic
click/form collection, URL queries/fragments, referrer text, visitor identifier,
cookie or additional local marker is introduced. Browser request metadata
including IP and HTTP User-Agent remains visible to the receiving provider;
this design does not claim anonymous network transport or zero personal-data
processing. Account/plan adoption, production activation and dashboard receipt
are separate acceptance steps; preparation alone does not establish delivery.

The post-M10 Guides/help checkpoint extends the same closed adapter with fixed
guide-start, guide-next, guide-to-tool, contextual-help-open, help-learn-more,
and Quick-Start-complete actions. Payloads may contain only allow-listed guide
slugs, guide categories, and help keys. Definition text, entered values, project
content, and arbitrary URLs remain prohibited.

## Rationale

A closed discriminated event type makes privacy review concrete: new payload fields require an explicit source and test change. A provider-neutral adapter keeps the product functional before a hosting/vendor decision and permits a deployment to observe verified events without coupling controllers to a third-party SDK.

The adapter catches sink errors at its boundary because analytics is diagnostic and must remain less important than calculation, local persistence, and result actions.

The direct browser transport controls payloads without expanding the static
architecture. Inspection of latest and SRI v11 scripts found client-hint fields
outside the documented ignored-useragent control and an error-reporting path
that includes arbitrary error text/runtime pathname. Loading that SDK would
weaken the project's closed boundary. Direct documented submissions avoid
those collection paths; bounded pending delivery and contained network failures
preserve calculator/planner availability. Ratios describe event counts, not
cross-visit unique-user funnels or verified causal drop-off.

## Consequences

- A future analytics provider must consume the existing safe event envelope; adding fields requires a privacy review and updated contract tests.
- Deployments must deliberately configure any external provider and remain responsible for consent and regional compliance if that provider introduces cookies or identifiers.
- Search Console ownership verification remains pending until a public hostname and verification token exist, but requires no source-code change.
- User-entered content and calculation detail stay local even when analytics is enabled.
- Copy and share events are emitted only by their matching actions; a copy attempt is never reported as sharing, and sharing is recorded only after the native share action succeeds.
