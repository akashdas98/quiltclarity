# Domain and Brand Selection and Activation Runbook

## Status and governing rule

This runbook is required before production deployment. The V1.1 authority chain
starts with `docs/v1.1/00_GOVERNING_AGENDA.md`,
`docs/v1.1/02_GOLDEN_RULES_AND_TESTS.md`, and
`docs/v1.1/01_PRODUCT_SPEC.md`; the remaining V1.1 specifications govern UX,
content, analytics, competitive acceptance, and migration. The older
`docs/product/quilt_FINAL_*` package is historical V1 evidence, not current
authority. This runbook does not change V1.1 scope or domain behavior.

The public identity must describe the current product: enter external cut
requirements, reconcile exact project-local stock with any new purchase, and
receive one practical cutting plan. Optional pattern comparison is a separate
fresh-fabric calculation that ignores stock. The site requires no signup.

V1.1 M0-M10 are complete, with the approved M9 guided-operator substitution.
The post-M10 Guides/help owner cases `MT-U01` and `MT-U02` passed on 2026-09-30
under the accepted owner-validation substitution; neither is independent novice
or target-quilter evidence. Public activation still depends on the gates below.

**Owner-confirmed status, 2026-10-01:** Trademark search and domain purchase
were completed long ago. Purchased domain: `quiltclarity.com`; public brand:
`QuiltClarity`. This is owner completion evidence, not an independent claim of
legal clearance. Phases 1-4 are retained historical process and must not be
repeated as pending work. Phase 5 local source activation is complete on
2026-10-01 under `../decisions/site-identity-activation.md`; proceed to actual
hosting configuration and Phase 6 public-origin checks.

**The source public brand is now `QuiltClarity`.** The public brand is the
human-readable brand form selected with the purchased domain. For example, if the
purchased domain were `examplebrand.com`, the public brand spelling would be
recorded alongside it (such as `ExampleBrand`) and would replace `Quilter` across
the public site before launch.

Do not purchase a domain until the selection checks below pass. Do not deploy to
production until the post-purchase activation checks pass.

## Decision record

Complete this block when the decision is made:

```text
Final public brand: QuiltClarity (domain-derived naming rule)
Purchased domain: quiltclarity.com (owner confirmed 2026-10-01)
Canonical HTTPS origin: https://quiltclarity.com (source/build default)
Canonical host: apex (source/build default; live www redirect not configured here)
Registrar:
Initial registration price and term:
Normal renewal price:
Registrant/account owner:
Purchase date:
Renewal date:
Trademark/confusion review completed by: Completion confirmed by owner 2026-10-01; report location not recorded
Decision notes:
```

Do not store account passwords, recovery codes, registrar tokens, DNS secrets, or
Search Console verification tokens in this repository.

## Phase 1 — Set the naming brief

A candidate must:

- be easy to spell, pronounce, hear, and type;
- be recognizably adjacent to quilting;
- accommodate the V1.1 workflow: external cut requirements, project-local exact
  stock, additional purchase shortfall, and one cutting plan;
- leave room for the standalone calculators and Guides;
- avoid implying a full visual quilt designer or a backing-only product;
- avoid hyphens, numbers, awkward plurals, and confusing deliberate misspellings;
- have low confusion with existing quilting, craft, calculator, and software brands;
- preferably have a normally priced `.com`; and
- work naturally as a site name.

Do not buy an expensive aftermarket exact-match domain. Do not use `QuiltMath` as
a clean brand direction because `quiltmath.net` already exists.

## Phase 2 — Build and score a shortlist

Create 8–12 serious candidates rather than choosing the first available name.
The existing research directions are:

- QuiltLogic
- QuiltMeasure
- QuiltPlanner / QuiltPlan variants
- QuiltCut
- QuiltYardage
- QuiltNumbers
- QuiltMap
- QuiltCalc variants

These are exploration directions, not pre-cleared brands.

Score each candidate from 1–5 and retain the evidence links or notes:

| Candidate | Low conflict risk (25%) | Spelling/pronunciation (20%) | Product fit (20%) | Room to grow (15%) | Domain quality (10%) | Cost (10%) | Result |
| --------- | ----------------------: | ---------------------------: | ----------------: | -----------------: | -------------------: | ---------: | -----: |
|           |                         |                              |                   |                    |                      |            |        |

A material legal or incumbent-confusion concern is a rejection regardless of the
weighted score.

## Phase 3 — Screen every serious candidate

### Market and confusion screen

Search for:

- the exact name in quotes and without spaces;
- close spellings, plurals, and phonetic equivalents;
- existing quilting sites, apps, calculators, pattern businesses, shops, social
  accounts, and creator channels;
- matching or confusing domains across common extensions; and
- app-store and software-product usage.

Record what was searched and why each finalist is unlikely to be confused with an
incumbent. Search-engine absence is not proof of domain availability or trademark
clearance.

### Trademark screen

Search the exact and similar marks in:

- WIPO Global Brand Database;
- IP India's official Trade Mark Public Search; and
- the national/regional registers of important target markets, including the
  United States if the site will actively target US quilters.

Review relevant software, online-tool, education/content, and craft-related goods
and services rather than searching only for exact text. A self-service screen is
not legal clearance. Escalate a valuable, ambiguous, or close-match finalist to a
qualified trademark professional before purchase or public branding.

Use ChatGPT Work with browser/computer-use capability for this interactive screen.
The active candidate review contains the required inputs, exact handoff prompt,
evidence schema, and return path. ChatGPT performs the interactive research and
produces a source-linked review; it must not purchase the domain or claim legal
clearance. Return that review to Codex for reconciliation with this runbook and the
repository. Codex remains responsible for durable documentation and all
post-purchase code, identifier, test, build, and deployment changes.

### Domain status and history screen

For every finalist:

1. Check current registration data with ICANN Lookup/RDAP.
2. Check exact live availability at the intended registrar immediately before
   purchase.
3. Inspect prior site use through web archives and ordinary search results.
4. Reject a domain with material spam, malware, counterfeit, gambling, deceptive,
   or unrelated reputation history.
5. If registered or aftermarket-priced, prefer another clean candidate unless the
   user explicitly approves the cost and conflict risk.

## Phase 4 — Final purchase gate

Before checkout, confirm:

- [ ] the ChatGPT trademark-review handoff is complete and its return artifact has
      been reconciled into the candidate review;
- [ ] final spelling has passed the market/confusion screen;
- [ ] trademark screens are recorded for relevant markets;
- [ ] domain status and history are acceptable;
- [ ] the final public brand spelling is recorded with the hostname;
- [ ] first-year and normal renewal prices are understood;
- [ ] transfer-out, expiry, redemption, privacy, and DNS policies are acceptable;
- [ ] the registrar is ICANN-accredited or an identified reseller of one;
- [ ] the registrant/account will be controlled by the site owner;
- [ ] a durable recovery email and payment method are available; and
- [ ] no password, recovery code, or token will enter the repository.

At purchase:

- enable multi-factor authentication;
- save recovery codes outside the repository;
- enable auto-renewal and confirm the payment method;
- record the renewal date and normal renewal price; and
- decline unrelated hosting, certificate, email-trial, and site-builder upsells
  unless separately selected for the deployment plan.

## Phase 5 — Mandatory post-purchase repository pass

The following changes happen **after the domain and final brand are known** and
**before production deployment**. Source activation completed 2026-10-01;
the checklist remains the regression contract for that pass. Registrar/operator
records and live host acceptance still require actual external evidence.

### Record the durable decision

- Complete the decision record at the top of this file.
- Update `CONTEXT.md`, `docs/architecture/project-status.md`, and the appropriate
  decision/architecture documentation with the final brand, hostname, canonical
  host, and deployment status.
- Keep registrar secrets and verification tokens outside Git.

### Replace the provisional public brand

- Create or update one shared site-identity source so brand spelling is not
  duplicated unnecessarily.
- Replace public uses of `Quilter` in:
  - shared header, navigation, footer, and logo/wordmark;
  - homepage, About, Methodology, Corrections, planner, calculator, guide, and 404
    copy;
  - page titles, descriptions, headings, share titles, and printable output;
  - `WebSite`, `WebApplication`, BreadcrumbList-visible names, and other JSON-LD;
  - `og:site_name` and other social metadata; and
  - favicon/logo accessible names and brand-bearing visual assets.
- Set `WebSite.name` to the final public brand and choose a truthful
  `alternateName`; do not retain `Quilter` as an alternate unless it is genuinely
  intended as a public alternate brand.
- Run `rg -n -i "quilter" src public tests scripts docs` and classify every
  remaining match as public copy to replace, an ordinary quilting noun, historical
  documentation, or a product-name-prefixed internal identifier that must be
  renamed. Do not retain `Quilter` as an internal product codename.

### Replace the provisional origin

- Set production `SITE_URL` to the final HTTPS origin.
- Update the `.env.example` example and reserved local `.example` fallback so they
  no longer imply that `Quilter` is the final brand.
- Confirm sitemap, robots, canonical, Open Graph, breadcrumb, and structured-data
  URLs derive from the final origin.
- Select apex or `www` as canonical and redirect the other host permanently.
- Ensure staging/preview deployments remain `noindex`.

### Replace brand-prefixed internal identifiers

Audit at least:

- the `quilter:planner-state` localStorage key;
- the `quilter:theme` and `quilter:analytics-first-used-date` localStorage keys;
- the `quilter:analytics` DOM event name;
- test fixtures, temporary-directory prefixes, smoke-test route names, and other
  technical identifiers.

Rename every product-name-prefixed runtime, package, test, automation, and repository
identifier to the final-brand slug. Preserve all behavior and update every consumer
and regression test. If any persisted key has public users by then, introduce and
test a migration rather than silently losing saved state. Historical Git prose and
ordinary uses of the noun “quilter” do not require mechanical replacement because
they are not references to the provisional product name.

### Configure public trust and ownership

- Feedback collection is deferred to V2 under the
  [2026-09-30 owner decision](../decisions/v1.1-feedback-system-deferral.md).
  No feedback inbox is required for V1.1 activation; `/corrections/` displays
  the static coming-soon state, with `noindex` and no sitemap entry. Reassess
  indexing when the V2 Feedback System ships.
- Verify a Search Console Domain property through DNS and provide
  `PUBLIC_GOOGLE_SITE_VERIFICATION` only if the selected verification method needs
  the HTML meta tag.
- Update contact, privacy, and legal/operator text only with truthful owner, host,
  jurisdiction, analytics, and monetization facts.

## Phase 6 — Deployment and acceptance

Before launch:

- [ ] run `npm run verify`;
- [ ] build with the final `SITE_URL` and deployment variables;
- [ ] inspect built HTML for the final brand and origin;
- [ ] prove no provisional public `Quilter` brand or `quilter.example` origin
      remains;
- [ ] deploy the static `dist` output behind HTTPS;
- [ ] confirm apex/`www` redirects and one canonical host;
- [ ] verify production canonicals, sitemap, robots, JSON-LD, Open Graph URLs, and
      real 404 behavior;
- [ ] verify `/corrections/` retains its Feedback link, coming-soon copy,
      `noindex`, and sitemap exclusion without a submission or email endpoint;
- [ ] submit `sitemap.xml` in Search Console;
- [ ] run the public-origin browser smoke audit;
- [ ] perform Firefox and Safari sanity checks where available; and
- [ ] run `scripts/check_context.ps1` before handoff.

The domain/brand work is complete only when the purchased domain, public brand,
source, built output, deployment configuration, and live origin agree.

## Official lookup references

- ICANN accredited registrars:
  `https://www.icann.org/en/contracted-parties/accredited-registrars`
- ICANN registration data lookup:
  `https://lookup.icann.org/`
- WIPO Global Brand Database:
  `https://www.wipo.int/en/web/global-brand-database`
- IP India trademark search:
  `https://www.ipindia.gov.in/trade-marks-before-you-apply-search-existing-trademarks`
