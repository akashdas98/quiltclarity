# Quilt Utility Website — Deployment Review Checklist

**V1.1 use:** Check `launch-readiness-status.md` for dated evidence and open dependencies. These items are confirmation at their stated stage, not claims that unrun public-origin work has passed. Owner confirmed on 2026-10-01 that trademark search and purchase of `quiltclarity.com` are complete. Local source activation is complete for public brand `QuiltClarity`; hosting/public-origin acceptance remains separate.

## Governing docs

- [ ] Relevant V1.1 agenda, product spec, golden rules, SEO, analytics, competitive gate, and architecture contracts checked
- [ ] Required milestone divergence reviews and accepted substitutions are recorded in project status
- [ ] M9 guided-operator substitution is stated honestly: external U01–U05 did not occur
- [ ] Post-M10 Guides/help owner MT-U01/MT-U02 PASS is recorded as owner evidence, not independent novice validation
- [ ] M10 same-job competitive gate PASS and its dated evidence remain valid

## Golden behavior

- [ ] G01–G45 and separate D01–D05 automated regressions pass
- [ ] invariant/property tests pass
- [ ] no overlap
- [ ] no forbidden rotation
- [ ] deterministic output
- [ ] strict upward purchase rounding
- [ ] each placement fits its identified finite stock bin or purchased bolt, with no overlap and every required instance accounted for
- [ ] stock-aware reconciliation minimizes raw additional purchase within practical cutting priorities; zero shortfall yields zero recommended purchase
- [ ] optional pattern comparison uses a separate fresh-fabric scenario that ignores stock
- [ ] cutting list, diagrams, text equivalent, and printed output agree with actual placement geometry
- [ ] backing coverage valid
- [ ] HST yields valid

## Product

- [ ] multiple fabrics
- [ ] mixed piece groups
- [ ] tabular cut-list preview/confirmation and explicit units work
- [ ] multiple finite stock pieces and joint stock-plus-purchase planning work
- [ ] finished/cut mode
- [ ] editable assumptions
- [ ] useful optimizer result
- [ ] visual plan matches geometry
- [ ] shopping quantity shown
- [ ] warnings correct
- [ ] print usable

## Architecture

- [ ] Astro static-first
- [ ] no backend
- [ ] no DB/auth
- [ ] no AI API
- [ ] simple calculators minimal JS
- [ ] framework-independent domain calculation and Astro/static HTML boundaries hold
- [ ] localStorage schema migration and corrupt-state recovery work
- [ ] static deploy works

## SEO

- [ ] titles
- [ ] descriptions
- [ ] canonical
- [ ] sitemap
- [ ] robots
- [ ] static content
- [ ] crawlable links
- [ ] intentional `/corrections/` `noindex` and sitemap exclusion hold while the static Feedback coming-soon page and footer link remain available
- [ ] no staging URL leakage
- [ ] 404
- [ ] OG basics

## UX/accessibility

- [ ] mobile usable
- [ ] keyboard usable
- [ ] labels associated
- [ ] errors actionable
- [ ] diagram text equivalent
- [ ] no color-only meaning
- [ ] grayscale print usable
- [ ] clean paginated PDF has diagram title, wrapped legend, and SVG together, with no orphaning or overlap, one isolated correctly oriented page per diagram, and no paint outside the print-safe box

## Measurement

- [ ] implemented analytics events and exact allow-listed properties match `src/lib/analytics/analytics.ts`; no arbitrary metadata, project content, exact dimensions, or identifiers
- [ ] date-only `quilter:analytics-first-used-date` marker yields only the allowed returning-user boolean; storage/analytics failure does not block tools
- [ ] production provider decision is made without widening the closed schema
- [ ] after public activation: Search Console ownership, sitemap submission, and production-domain analytics delivery are confirmed

## AdSense readiness

- [ ] original useful content
- [ ] clear navigation
- [ ] About
- [ ] public operator/contact and legal content reflects real identity, host, provider, and monetization choices; no V1.1 feedback inbox is required
- [ ] Privacy
- [ ] ownership/control
- [ ] no deceptive placements
- [ ] apply only after live-site quality review

## Launch

- [x] trademark search and `quiltclarity.com` purchase complete per owner confirmation on 2026-10-01
- [x] final source brand replacement and purchased-origin build defaults verified on 2026-10-01
- [ ] production host variables and live canonical/redirect policy match the activated identity
- [x] Cloudflare + Astro hosting stack selected, reaffirmed by owner 2026-10-01
- [x] Cloudflare static application deployed, public repository pushed and hosted CI passes; Cloudflare Builds automatic deployment connection remains pending
- [x] HTTPS apex and WWW are served with valid TLS; Always Use HTTPS still needs enabling for HTTP apex
- [x] production build with purchased apex origin, verified 2026-10-01
- [x] local `npm run smoke:browser` passes on installed Windows Chrome and Edge after the build, including print/PDF checks, 2026-10-01
- [x] public crawl check: 38 sitemap pages, canonicals, retained noindex routes, robots and real 404, 2026-10-01
- [x] focused public Chrome Fabric Yardage calculator interaction, 2026-10-01
- [ ] mobile smoke test
- [ ] print smoke test
- [ ] on the deployed origin, verify HTTPS, redirects, canonicals, sitemap, robots, real 404, and representative planner/calculator/guide routes; check Firefox/Safari where available

## First 72 hours

- [ ] uptime
- [ ] index discoverability
- [ ] sitemap accepted
- [ ] analytics events
- [ ] JS errors
- [ ] calculator errors
- [ ] canonicals/robots correct
