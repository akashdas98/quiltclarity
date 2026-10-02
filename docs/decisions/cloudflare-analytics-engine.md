# Cloudflare Analytics Engine

## Decision

On 2026-10-02 the owner approved replacing Simple Analytics with Cloudflare
Analytics Engine and private local reports, then explicitly requested implementation.

## Rationale

Simple Analytics' free plan excludes custom event collection, goals and metadata
analysis; its paid-only events conflict with the owner's free/no-card preference.

This is a narrow exception to V1.1's no-backend/server-persistence boundary:
an optional same-origin analytics ingestion handler and provider telemetry storage
are allowed. All calculations, project persistence and content rendering retain
their static/browser-only contracts. No database, user accounts, authentication
system, cloud project state or runtime calculation service is authorized.

## Consequences

### Collection contract

The existing static-assets Worker accepts POST /api/analytics, version 1, a fixed
canonical indexable path and an event projected through the existing closed
taxonomy. Both client and server validate values. A pageview is the sole additional
transport event. The server accepts production-origin JSON only, caps bodies at
4 KiB, and never stores arbitrary properties, IP addresses, user agents, cookies,
referrers, URL queries/fragments, identifiers, project content or error text.
Provider infrastructure still receives ordinary network metadata; this is not a
claim of anonymous transport or zero personal-data processing.

The dataset quiltclarity_events_v1 uses blob1 schema version, blob2 canonical path,
blob3 event name, blob4 projected categorical properties as JSON, index1 event name
and double1 count 1. Analytics Engine supplies receipt timestamps and sampling
intervals. No individual visitor/session index is created.

Production client opt-in is PUBLIC_CLOUDFLARE_ANALYTICS_ENABLED; server opt-in is
ANALYTICS_ENABLED. DNT/GPC, staging, local and noindex exclusions remain. Bounded
delivery has no retries/offline persistence and failures never block tools.
Simple Analytics is removed from active source, not dual-collected. Its account
is retained without payment, cancellation or deletion.

## Reporting and activation gates

Private local reports use an account-scoped Analytics Read token kept outside
Git/browser code. Queries weight totals with _sample_interval. Ratios describe
event counts, not unique-user funnels or causal drop-off. Public submissions can
be forged. Analytics Engine retention is three months; no new archival service
or scheduled export is added.

Only Workers Free is authorized. Verify account activation without payment method
or paid upgrade; stop and report any such requirement. The currently limited
OAuth login can read Worker account settings and deploy Workers, but the
Analytics SQL read check returned HTTP 403 on 2026-10-02. Do not silently expand
account consent. Endpoint acceptance alone is not proof of SQL receipt.

## Sources

- [Simple Analytics pricing](https://www.simpleanalytics.com/pricing)
- [Analytics Engine setup](https://developers.cloudflare.com/analytics/analytics-engine/get-started/)
- [Pricing/free allowances](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [Retention limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)
- [SQL and sampling](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)

## Implementation routing

Model demand: substantive typed browser/edge implementation with untrusted input
privacy boundaries routes to Sol; explicit independent Node reporting routes to
Luna. Effort demand: medium dependency tracing and focused failure verification
for each worker; parent owns architecture approval, production delivery and
release review. Existing projector, Playwright Core, Vitest, Node and pinned
Wrangler tooling are reused; no runtime package is required.

Acceptance: closed values only at browser/server/storage boundaries; static routes
and tools continue under collector failure; report credentials remain private;
focused, full repository and installed Chrome/Edge print gates pass; distinguish
activation, HTTP acceptance and authenticated SQL/report receipt.
