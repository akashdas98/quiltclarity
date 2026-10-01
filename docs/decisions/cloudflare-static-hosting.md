# Cloudflare Static Hosting

## Decision

The owner reaffirmed the already selected stack on 2026-10-01:
**Cloudflare hosting + Astro**. Do not reopen provider selection. Astro remains
configured with `output: 'static'`; the deployed artifact is `dist/`, with all
calculations and project persistence in the browser.

The public GitHub repository is <https://github.com/akashdas98/quiltclarity>;
the reviewed source is pushed and hosted CI passes as of 2026-10-01.
Cloudflare login and the active `quiltclarity.com` zone were verified on
2026-10-01. The static `quiltclarity` Worker serves the apex custom domain;
`quiltclarity-www` serves the permanent redirect to it. GitHub Builds integration
and its first automatic deployment passed on 2026-10-01; the new version is
active at 100%. HTTP-to-HTTPS 301 is verified with path/query preservation.

## Rationale

This records the owner choice separately from the stale generic host-selection
checkpoint. It preserves the locked static architecture and the purchased
`quiltclarity.com` / QuiltClarity identity.

## Consequences

The deployment implementation uses Workers Static Assets via `wrangler.jsonc`,
with automatic trailing-slash routing and the built `404.html` returned with
404 status. It contains no Worker script, SSR adapter or application bindings.
Wrangler 4.145.0 local dry run and authenticated deployments pass on 2026-10-01.
The owner explicitly approved limited read/deployment/route/certificate/refresh
OAuth access. Local Wrangler output and secret variable
files are ignored by Git.

README owns deployment operation; launch readiness owns outstanding account,
repository, DNS and public-origin checks. Source activation and local release
verification are already complete. No account, remote, DNS, external application,
or production deployment was created by this documentation correction.

Cloudflare's current guidance recommends Workers for new projects and supports
an assets-only deployment of Astro's static output. Cloudflare Pages also
documents Astro static output. The owner's statement selected Cloudflare, not
a specific Cloudflare service; do not claim that Pages or a Workers application
was already provisioned before this session. Workers Static Assets is now deployed.
The separate static `www` redirect deployment preserves the no-backend boundary;
Cloudflare's `_redirects` does not support domain-level matching. No SSR adapter or application-server handler is
required merely to host this static output. Sources checked 2026-10-01:
[Astro Cloudflare deployment](https://docs.astro.build/en/guides/deploy/cloudflare/)
and [Cloudflare Astro Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/).
