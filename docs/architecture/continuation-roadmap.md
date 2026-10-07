# Project Continuation Roadmap

Updated 2026-10-08. This routes existing work and distinguishes completion,
pending review, conditional growth and future proposals. It does not create new
product approvals or renumber the governed milestones. `project-status.md` owns
dated execution evidence and divergence reviews. Launch is not the final project
checkpoint. For any “next?” or milestone-list question, read this map and the
relevant current evidence before using an old handoff.

## Completed governed milestones

The V1.1 sequence in `../v1.1/07_TECHNICAL_MIGRATION_PLAN.md` is M0-M10:

| Milestone | Scope                                                  | State                               |
| --------- | ------------------------------------------------------ | ----------------------------------- |
| M0        | Repository audit and migration baseline                | Complete                            |
| M1        | Normalized project schema and local migration          | Complete                            |
| M2        | Exact finite-stock allocation                          | Complete                            |
| M3        | Purchase shortfall and independent pattern comparison  | Complete                            |
| M4        | New standalone calculator domain contracts             | Complete                            |
| M5        | Rapid cut-list compiler and import UX                  | Complete                            |
| M6        | Stock/pattern entry and reconciled executable results  | Complete                            |
| M7        | Static calculator/routes/content expansion             | Complete                            |
| M8        | Closed analytics and validation instrumentation        | Complete                            |
| M9        | Guided operator validation under approved substitution | Complete; no U01-U05 external study |
| M10       | Same-job competitive launch gate                       | PASS, 2026-08-31                    |

The last ten numbered V1.1 milestones are M1-M10. The project continued after
them: Guides/help review, implementation and owner MT-U01/MT-U02 acceptance;
Feedback coming-soon and V2 deferral; continuation-document reconciliation;
QuiltClarity source activation; public GitHub/CI; Cloudflare static apex/www,
HTTPS and first automatic deployment. Those checkpoints are recorded in
`project-status.md`, the corresponding decisions and launch readiness. Do not
treat original Guides “M0-M11” wording as another defined migration milestone.

## Pending and conditional continuation

These entries are sourced tasks/workstreams, not previously approved
numbered milestones. Timing can overlap; optional items require a decision and
future implementation must satisfy its own scope/acceptance gate.

| Entry                                        | State and trigger                                                                                                                                                                                                                                                                                                                                                                | Source                                                                                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Search Console ownership and discovery       | Setup complete per owner: ownership 2026-10-01, sitemap Success 2026-10-02, robots detected 2026-10-05. Continue crawl/indexing monitoring                                                                                                                                                                                                                                       | `../launch/launch-readiness-status.md`, Pending on the deployed origin; growth package, Search Console setup                  |
| Production measurement choice and delivery   | Complete 2026-10-02: Workers Free, enabled Engine, 2816237/7968157 published; live HTTP204 and private SQL report receipt pass; no Simple Analytics traffic                                                                                                                                                                                                                      | Launch readiness; `../decisions/milestone-9-analytics-privacy.md`                                                             |
| Remaining public browser acceptance          | Full public Chrome/Edge mobile viewport and PDF print suite passed 2026-10-01; local print-ready PDF parity passes Chrome/Edge 2026-10-02; owner confirms iPhone/tablet PDF works 2026-10-03. Firefox acceptance waived by owner 2026-10-05 (untested, not PASS); mobile PDF/desktop Print and first-click fonts published 2026-10-05 (runtime 9d7d342; audit follow-up 9dbd2ba) | Launch readiness; `../launch/quilt_LAUNCH_deployment_QA.md`                                                                   |
| First 72-hour operational monitoring         | Post-live: reachability, sitemap/robots/canonicals, JS/calculation errors and chosen measurement                                                                                                                                                                                                                                                                                 | Growth package, Post-launch cadence; deployment QA, First 72 hours                                                            |
| Week-one indexation and UX review            | After initial observation: indexing, impressions, query surprises and observed UX issues; field CWV as evidence becomes available                                                                                                                                                                                                                                                | Growth package, End of week 1; V1.1 content, Performance                                                                      |
| Define and map post-launch ads website work  | Placements/sizes finalized; updated isolated mockup Chrome168/Edge28 geometry/focus/print gates pass 2026-10-07. Owner selected AdSense; verification-only meta tag 7434e05 is live and account review was requested. Approval, privacy/contact/consent and project-data review remain; no production integration or rollout.                                                    | `../launch/postlaunch-ads-review.md`; launch readiness, Deferred until monetization review                                    |
| Ad/provider rollout and policy configuration | Conditional on provider approval and readiness: implement/verify chosen slots, consent/privacy, ads.txt, rollout and stop criteria. AdSense account review was requested; only the verification meta tag is live.                                                                                                                                                                | Recovered ads review; growth package, AdSense readiness and Initial ad-placement principles                                   |
| Security hardening after ads                 | Owner-sequenced 2026-10-07: immediately after ad-related work is complete. Audit actual Cloudflare WAF/bot/rate rules, rate-limit /api/analytics and add/test appropriate security headers against ads/consent, calculations, crawlers and print. No implementation yet; dashboard-only rules unverified.                                                                        | `project-status.md`, Owner sequence 2026-10-07; existing Cloudflare hosting/analytics decisions                               |
| Weeks 2-4 search/content iteration           | Evidence-driven: classify queries A-E, improve near-miss existing pages, evaluate distinct recurring tasks; recurring Search Console review                                                                                                                                                                                                                                      | Growth package, Weeks 2-4; `../launch/quilt_LAUNCH_postlaunch_framework.md`; production UX/SEO, Post-launch SEO feedback loop |
| Month-two growth or narrow/stop decision     | Conditional: expand only with evidence; evaluate page pruning, useful diagrams, legitimate outreach and optional affiliates. No automatic feature/page approval                                                                                                                                                                                                                  | Growth package, Month 2+ and Affiliate strategy; postlaunch framework, Expansion rules and Kill/narrow review                 |
| Feedback System                              | Planned V2 milestone; service/architecture/implementation not selected or authorized. Reassess `/corrections/` indexing when shipped                                                                                                                                                                                                                                             | `../v2/feedback-system-milestone.md`; approved Feedback deferral decision                                                     |

## Research and standing obligations

The V2 deep-research/design brief is an instruction for future research, not an
approved feature backlog. Its calculator, navigation, SEO and interaction
candidates must be evaluated before becoming implementation scope. The catalog
routes either preserved filename of that brief. Feedback is separately planned.

Golden/invariant correctness, help/guide synchronization, accessibility, print,
performance and analytics privacy remain change-time obligations. Optional
external-quilter testing may add evidence later; its absence does not reopen M9
or completed owner Guides acceptance. Registrar/renewal/report-location record
gaps do not mean that search or purchase are unfinished.

Contact delivery is owner-confirmed 2026-10-08. A dedicated Privacy page and
footer contact/privacy links are prepared locally with isolated build and
Chrome/Edge/print checks passing; publication is pending. CMP selection/account
configuration and same-origin project-storage compatibility remain open before
provider integration. Preparation does not authorize ad serving. Latest evidence
and limits are in `project-status.md` and the ads review.

Latest owner steering2026-10-08 pauses publication. Shared article/Guide widths,
inline-link spacing, a real Contact page and email Feedback are fixed locally;
the clean44-page build and full Chrome/Edge/static/print checks pass.
Google CMP draft is saved; its runtime/compatibility gate remains open. The
email invitation supersedes unavailable Feedback copy, while its full V2
form/service and current noindex behavior remain separately governed.

Current next work is post-launch Search Console monitoring and AdSense readiness;
the owner sequences security hardening after ad work. For ads questions, load
the review and latest checkpoint. Completed public release acceptance stays
closed unless new evidence reveals a regression.
