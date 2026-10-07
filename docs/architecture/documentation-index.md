# Documentation and Task Routing

This is the second-level map for all available project documentation. Startup
still reads only CONTEXT's Current Status and Context Routing. Read the relevant
row here when a question or task spans packages; then open its source sections.
The complete file/section inventory is `documentation-catalog.json`. Search it
with `rg`, including synonyms, before concluding that existing information is
absent. An index is navigation, not new product authority or implementation approval.

## Task routes

Security hardening, analytics rate limiting, WAF/bot rules and response headers:
`continuation-roadmap.md`, immediately after ad work; owner sequence and dated
evidence in `project-status.md`. No hardening implementation is complete.

Mobile/planner print-ready PDF, page orientation, safe fit and local-only generation:
`../decisions/client-print-ready-pdf.md`; current device/technical evidence in
`project-status.md`.

| Question or work                                                     | Read first                                                                            | Supporting detail and limits                                                                                                                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next task, milestone history, launch versus post-launch              | `continuation-roadmap.md`                                                             | `project-status.md` owns current evidence; V1.1 migration defines M0-M10 only. Launch is not the end of continuation work.                                                                |
| Ads, AdSense, reserved space, monetization, affiliate links          | `../launch/postlaunch-ads-review.md`                                                  | Growth package AdSense/placement/affiliate headings, launch readiness deferred decisions, V1.1 content section 14; distinguish agreed review from proposed design and unfinished runbook. |
| Search Console, indexing, traffic, growth, outreach, pruning         | `../launch/quilt_LAUNCH_postlaunch_framework.md`                                      | Growth package dashboard/cadence, SEO content briefs, production UX/SEO sections 43-47, analytics privacy decision.                                                                       |
| Deployment, Cloudflare, Astro, GitHub CI, apex/www, HTTPS            | `../../README.md`, `../decisions/cloudflare-static-hosting.md`                        | Launch readiness and project-status dated deployment evidence; provider selection, source activation and deployment are complete.                                                         |
| Domain purchase, trademark, brand, namespaces, saved-state migration | `../decisions/site-identity-activation.md`                                            | Domain activation runbook/candidate review are historical research and subordinate to owner confirmation; do not repeat purchase/search.                                                  |
| Product strategy, scope, reason to win, competitive acceptance       | `../v1.1/README.md`                                                                   | Agenda, product spec, competitive gate, M10 dated report; old product research is historical evidence.                                                                                    |
| Domain calculations, stock, purchase, pattern, optimizer, fixtures   | `domain-contracts.md`                                                                 | V1.1 Golden Rules and product spec, relevant domain decisions; stock-aware shortfall and stock-free pattern comparison stay separate.                                                     |
| Runtime ownership, dependency direction, UI/presentation/persistence | `context-loading.md`, `product-and-runtime-boundaries.md`                             | Relevant decisions and source; domain remains independent, static Astro plus vanilla controllers.                                                                                         |
| Guides, help, tutorials, learning, deep links, help analytics        | `../v1.1_GUIDES_HELP/README.md`                                                       | Guides audit, owner substitution, manual suite; core V1.1 domain authority retained.                                                                                                      |
| Owner validation, usability, manual test evidence                    | `../manual-tests/V1_1_GUIDES_HELP_MANUAL_TESTS.md`                                    | M9 guided record and both substitution decisions; unused external-user protocol is optional, not an active blocker.                                                                       |
| Feedback, corrections, coming-soon, V2 milestone                     | `../decisions/v1.1-feedback-system-deferral.md`, `../v2/feedback-system-milestone.md` | No current collection channel; V2 research brief does not authorize a backend or implementation.                                                                                          |
| V2 research and candidate features                                   | `../v2/`                                                                              | UPDATED research brief (either preserved filename); proposals are not approved milestones. Feedback has a separate approved planned milestone.                                            |
| Historical V1 rules, remediations, differentiation                   | `../product/quilt_FINAL_manifest.md`                                                  | Domain-correctness update and differentiation overlay, legacy D01-D05; overridden by V1.1 where conflicting.                                                                              |
| Agent workflow, model/effort routing, hooks, capabilities, lifecycle | `../../AGENTS.md`, `../decisions/workflow-context-memory.md`                          | `../../scripts/agent-routing/README.md` and VERIFICATION; local guardrails are not protected governance or measured savings.                                                              |
| Old context, migration evidence, dated observations                  | `context-history-through-2026-09-02.md`, `project-status.md`                          | Historical status is not current health; use latest dated evidence and recorded owner decisions.                                                                                          |
| Original ZIP bundles                                                 | Catalog archive entries and reconciliation report                                     | Local historical snapshots, optional in public checkout; explicitly authorized audit read them. Do not silently promote their older versions to active authority.                         |

## Finding and preserving information

1. Use the topic route and the catalog's file titles, classification and full
   section headings. Search related terms (for example ads, AdSense,
   monetization, growth, post-launch), then read the matched source.
2. For a status question, compare requirements with the current roadmap,
   Resume Checkpoint and relevant approved decisions. Requirements describe
   what must happen; old handoffs often describe what was pending then.
3. If no match appears, search the relevant package text with `rg` before saying
   it is absent. If a prior agreement is claimed, inspect preserved history and
   relevant available project conversation evidence. Report the actual search
   boundary; unlocated does not mean deleted or unrecoverable.
4. New or renamed documentation must retain a catalog entry, authority label,
   useful topic/section metadata and a task route when it changes continuation.
   Reconcile superseded next-step claims at their active owners. Preserve dated
   evidence and decisions rather than rewriting historical observations.

`scripts/check_context.ps1` checks catalog coverage and destinations as well as
root memory. It detects structural omissions, not semantic completeness or
whether a future assistant actually read the right source. The dated audit is
`documentation-reconciliation-2026-10-01.md`.
