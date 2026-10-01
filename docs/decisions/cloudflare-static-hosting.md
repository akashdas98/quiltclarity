# Cloudflare Static Hosting

## Decision

The owner reaffirmed the already selected stack on 2026-10-01:
**Cloudflare hosting + Astro**. Do not reopen provider selection. Astro remains
configured with `output: 'static'`; the deployed artifact is `dist/`, with all
calculations and project persistence in the browser.

The public GitHub repository is <https://github.com/akashdas98/quiltclarity>;
the reviewed source is pushed and hosted CI passes as of 2026-10-01.
Cloudflare account, application/project identifiers,
and existing domain-zone configuration have not been established in this
session. Missing local configuration does not imply the owner lacks accounts.

## Rationale

This records the owner choice separately from the stale generic host-selection
checkpoint. It preserves the locked static architecture and the purchased
`quiltclarity.com` / QuiltClarity identity.

## Consequences

The deployment implementation uses Workers Static Assets via `wrangler.jsonc`,
with automatic trailing-slash routing and the built `404.html` returned with
404 status. It contains no Worker script, SSR adapter or application bindings.
Wrangler 4.145.0 local dry run passes on 2026-10-01; account authorization and
actual deployment remain pending. Local Wrangler output and secret variable
files are ignored by Git.

README owns deployment operation; launch readiness owns outstanding account,
repository, DNS and public-origin checks. Source activation and local release
verification are already complete. No account, remote, DNS, external application,
or production deployment was created by this documentation correction.

Cloudflare's current guidance recommends Workers for new projects and supports
an assets-only deployment of Astro's static output. Cloudflare Pages also
documents Astro static output. The owner's statement selected Cloudflare, not
a specific Cloudflare service; do not claim that Pages or a Workers application
has already been provisioned. No SSR adapter or application-server handler is
required merely to host this static output. Sources checked 2026-10-01:
[Astro Cloudflare deployment](https://docs.astro.build/en/guides/deploy/cloudflare/)
and [Cloudflare Astro Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/).
