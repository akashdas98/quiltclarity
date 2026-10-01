# QuiltClarity

[![CI](https://github.com/akashdas98/quiltclarity/actions/workflows/ci.yml/badge.svg)](https://github.com/akashdas98/quiltclarity/actions/workflows/ci.yml)

QuiltClarity is a static-first quilting utility website. Its
V1.1 workflow turns an external cut list and exact project-local fabric stock
into additional purchase needs and one practical cutting plan. Optional pattern
yardage comparison uses a separate fresh-fabric scenario that ignores stock.
The owner confirmed on 2026-10-01 that trademark search and domain purchase
were already completed for `quiltclarity.com` (public brand `QuiltClarity`).
Source identity, metadata, storage namespaces, and build defaults now use that
identity. Legacy saved state migrates locally; the older candidate review is
not current purchase status. See the
[activation decision](docs/decisions/site-identity-activation.md) for compatibility
and deployment boundaries.

## What it does

- Reconciles a quilt cut list with fabric you already have and calculates the
  additional purchase needed.
- Produces a deterministic cutting plan with diagrams, cutting instructions,
  warnings, and a printable project summary.
- Compares pattern yardage against a separate fresh-fabric scenario.
- Provides eleven standalone calculators, a learning hub, and contextual help.
- Keeps saved projects in your browser, with no signup or server-side calculations.

Built with Astro and TypeScript. The calculation engine is independent of the UI,
uses millimetres internally, and is covered by golden fixtures and invariant tests.
The release checks include 215 automated tests and installed Chrome/Edge audits of
mobile layouts, accessibility contracts, persistence, and rendered print output.

The planned public address is **quiltclarity.com**; production deployment is pending.

## Development

Requires Node.js 24 or newer and npm 10 or newer.

```powershell
npm install
npm run dev
```

Run the complete local verification pipeline:

```powershell
npm run verify
```

After building, run the release browser smoke audit on a Windows machine with
Chrome and Edge installed:

```powershell
npm run smoke:browser
```

Production static builds set `SITE_URL` to the public HTTPS origin. They may
also set `PUBLIC_GOOGLE_SITE_VERIFICATION` to emit the Search Console ownership
meta tag. Feedback currently has a static coming-soon page; the Feedback System
is a [planned V2 milestone](docs/v2/feedback-system-milestone.md), with no V1.1
submission channel to configure. Staging builds may set `PUBLIC_ROBOTS_NOINDEX=true`; production must
leave it false. Copy `.env.example` to a local `.env` when configuring a
deployment.

## Cloudflare deployment

The selected hosting stack is **Cloudflare + static Astro**, reaffirmed by the
owner on 2026-10-01. The public GitHub repository is connected and hosted CI
passes. The Cloudflare account/application still needs to be connected. The
[hosting decision](docs/decisions/cloudflare-static-hosting.md) preserves scope.

| Setting              | Repository requirement                         |
| -------------------- | ---------------------------------------------- |
| Production branch    | `main`                                         |
| Node version         | 24 or newer, matching `package.json` and CI    |
| Release verification | `npm run verify`                               |
| Static build         | `npm run build` (also included in verify)      |
| Static artifact      | `dist/`                                        |
| Canonical origin     | `SITE_URL=https://quiltclarity.com`            |
| Preview indexing     | `PUBLIC_ROBOTS_NOINDEX=true` on preview builds |
| Production indexing  | `PUBLIC_ROBOTS_NOINDEX=false`                  |

Cloudflare's current recommended route for a new project is Workers Static
Assets. Its Astro guide includes an assets-only configuration pointing at
`./dist`; retain static output. Follow the
[official Astro deployment instructions](https://docs.astro.build/en/guides/deploy/cloudflare/)
once account/project access is established. Cloudflare Pages also supports
the existing build and `dist` output through its
[Astro deployment settings](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/).
The provider choice does not establish that either application already exists.

After the repository release gate passes, configure the Cloudflare application
and purchased domain, verify apex/www redirects and HTTPS, then complete
[public-origin acceptance](docs/launch/launch-readiness-status.md). Do not put
account tokens or registrar secrets in the repository.

## Project authority

Read `AGENTS.md` and `CONTEXT.md` before making changes. The
`docs/v1.1/README.md` routes the governing V1.1 strategy, domain behavior,
acceptance, and implementation sequence. The `docs/product/quilt_FINAL_*`
package is historical V1 evidence. Launch continuation starts at
[`docs/launch/quilt_LAUNCH_manifest.md`](docs/launch/quilt_LAUNCH_manifest.md);
current dependencies are in
[`docs/launch/launch-readiness-status.md`](docs/launch/launch-readiness-status.md).
