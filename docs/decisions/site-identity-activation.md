# QuiltClarity Site Identity Activation

## Decision

On 2026-10-01 the owner confirmed that trademark search and domain purchase
had completed long ago, and named the purchased domain `quiltclarity.com`.
The public brand is `QuiltClarity` under the existing domain-derived naming
rule. This confirmation records completed work; it does not independently
assert legal clearance. Registrar, purchase/renewal dates, and the separate
trademark report location remain unrecorded and must not be invented.

## Rationale

The repository retained pre-purchase status after external owner work completed.
Using the confirmed identity consistently prevents stale branding in public
metadata and avoids losing locally saved state through a mechanical key rename.

## Consequences

Source and package identity change; calculations, routes, schema versions,
privacy and static architecture remain unchanged. Legacy keys remain narrowly
supported for local migration. Deployment evidence remains a separate gate.

## Source activation

`src/lib/site-identity.ts` owns the repeated public name and purchased origin.
Shared Astro metadata, navigation, footer, calculator/guide titles, and the
planner share fallback consume it. Public prose uses QuiltClarity; ordinary
uses of “quilter” referring to a person remain unchanged. The favicon has no
brand text and retains its existing patchwork artwork.

Astro defaults to `https://quiltclarity.com`, the apex hostname supplied by the
owner. `SITE_URL` remains a build-time override for deployment/preview origins.
Canonicals, Open Graph, JSON-LD, sitemap and robots derive from the configured
origin. `.env.example` records the purchased apex origin. This selects a local
build default, not a live redirect or DNS change. Staging retains its noindex
switch. The reserved local identity spelling is `quiltclarity.example`.

Package and automation names use `quiltclarity`, including temporary fixture
prefixes, smoke routes and `QUILTCLARITY_*` smoke/print environment switches.
The physical checkout directory retains its existing `Quilter` name;
installed hook paths referencing that real directory must remain valid.
Historical documents and Git prose retain their original names.

## Persistence and analytics compatibility

Current runtime keys are `quiltclarity:planner-state`, `quiltclarity:theme`,
and `quiltclarity:analytics-first-used-date`. The analytics DOM event is
`quiltclarity:analytics`; the typed taxonomy and data-layer payloads are unchanged.

Legacy `quilter:*` storage entries are compatibility inputs, not active write
namespaces. Read them only when the corresponding current key is absent.
Current state wins, including corrupt current project envelopes that require
explicit recovery rather than silent replacement with an older project.

Supported V0/V1/V2 projects and structurally recoverable numeric envelopes use
the existing schema migration/recovery contract and are saved under the new
key. Corrupt legacy raw state is preserved. Failed writes do not prevent use
of a valid restored project. Reset removes the legacy project key before the
current key, reports a failure if removal fails, and cannot report successful
reset while leaving a fallback that resurrects old data.

Valid legacy light/dark preferences still apply when copying to the new key
fails. Only a date-shaped legacy first-use marker is copied; arbitrary content
is not. Marker failures return the existing non-returning category and never
block tools. Old entries remain available as compatibility residue except
when a successful project reset clears both namespaces. Migration is local
to each browser origin; it introduces no network or cross-origin storage access.

## Verification and remaining launch boundaries

Meaningful regressions cover key precedence, old envelope versions, corrupt
state, failed writes, reset behavior, date-only marker migration, and real
Chrome/Edge theme migration including blocked writes. The browser audit also
checks final brand metadata and configured canonical/sitemap origin on every
audited static route. Golden/domain behavior and placement geometry are unchanged.

Integrated gate evidence and the fresh browser/print results belong in
`../architecture/project-status.md`. Production hosting, remote/hosted CI,
DNS/redirects, Search Console and public-origin validation still require actual
deployment evidence; local source activation does not claim they are complete.
