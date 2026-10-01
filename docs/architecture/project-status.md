# Project Status

## Resume Checkpoint

- Updated: 2026-10-01.
- Objective: Connect owner-selected Cloudflare hosting to the public GitHub repository; source activation and hosted CI are complete.
- Cloudflare preparation, 2026-10-01: Owner authorized hosting/domain deployment.
  Sol-medium prepared assets-only `wrangler.jsonc` and README operation; model
  demand was static-host integration, effort demand bounded official routing
  comparison. Parent owns account access, deployment and public-origin checks.
  Acceptance: static output, trailing-slash routes, real 404, no backend,
  validated config, authenticated upload, apex/www/HTTPS checks before launch.
- Deployment evidence: Official Cloudflare Wrangler 4.145.0 is installed only
  in ignored `tmp/cloudflare-cli`. `deploy --dry-run` passes, reading 92 existing
  build assets with no upload or bindings. Config/output, format and whitespace
  checks pass. Prior source/browser evidence is reused; local dev was retained.
  Public NS lookup confirms `sean.ns.cloudflare.com` and `sara.ns.cloudflare.com`;
  no apex A record was returned. Authenticated zone/application state is unknown.
- Access boundary: Browser control failed twice; plugin search found no
  Cloudflare integration. Wrangler is unauthenticated. Default OAuth login was
  canceled to narrow permissions. Automatic approval review rejected persistent
  account-write authorization because deployment intent did not specifically
  approve those scopes. Await owner approval for account/user/zone read,
  Workers/scripts/routes and certificate write, and offline refresh access,
  then resume login. No Cloudflare resources, DNS, Git integration or production
  deployment have changed.
- GitHub release checkpoint, 2026-10-01: Public repository created at
  <https://github.com/akashdas98/quiltclarity>, with `origin` connected. Reviewed
  snapshot `b500806` and checkpoint `d362c10` were pushed on `main` after the
  owner approved GitHub's workflow-scope consent. Original history is retained
  only on `release-local-history`. Only the public `main` ref is hosted. Never push the
  backup branch. No credential-shaped text findings; local paths generalized,
  ZIP bundles/hooks excluded. This release step changed records only, so prior
  complete application/browser evidence remains applicable.
- Hosted CI evidence: [Run 36860209033](https://github.com/akashdas98/quiltclarity/actions/runs/36860209033)
  passed on 2026-10-01, with the verification job completing in 55 seconds.
  A clean Ubuntu checkout passed dependency installation, the memory checker,
  all nine isolated context cases, and `npm run verify` (types, lint, formatting,
  tests and static build). The local V2 archive rename remains untouched.
  Cloudflare provisioning, public-origin acceptance and profile pinning remain
  separate; no production deployment or live-site claim was made.
- Public repository route, 2026-10-01: Owner authorized publishing
  `akashdas98/quiltclarity` publicly for the GitHub profile. Parent model demand
  is release integration and preservation of pending work; effort demand is
  bounded staging, documentation and hosted-CI verification. Sol-medium owns a
  read-only public-disclosure scan of current files and history. Acceptance:
  no concrete secret findings, machine-local hooks excluded, unrelated V2
  archive edits preserved unstaged, public remote connected, release committed
  and pushed, hosted CI result recorded. Existing complete application/browser
  checks are reused because this step changes release records, not behavior.
  No license grant or Cloudflare deployment is authorized by this step.
- Public history boundary: Existing commits carry a personal author email.
  Publish one fresh reviewed source snapshot with GitHub no-reply attribution;
  retain the original history locally as `release-local-history` and do not push
  that branch. Machine-local `.codex/` and three unreviewed supplemental ZIP
  bundles remain local and are excluded from the public snapshot. The unrelated
  V2 archive rename remains unstaged; its previously tracked Markdown version
  remains in the snapshot. A pattern scan is bounded evidence, not proof that
  every document contains no private information.
- Hosting correction, 2026-10-01: Owner reaffirmed Cloudflare + Astro as the
  already selected stack. The [hosting decision](../decisions/cloudflare-static-hosting.md)
  supersedes generic provider-selection tasks. Direct execution model demand is
  bounded documentation consistency; effort demand is official-doc verification
  and precise separation of provider choice from account/project provisioning.
  Acceptance: Cloudflare choice preserved, static Astro unchanged, setup steps
  grounded in current official guidance, no inferred account or live deployment.
  Installed `gh` is available, Wrangler is not installed, and no Git remote is
  configured. No new capability installation is needed for this record update.
- Hosting record validation: Targeted Prettier, memory structure and diff
  whitespace checks pass. Documentation-only update; application configuration
  and prior release validation are unchanged.
- Activation route, 2026-10-01: Model demand is cross-file Astro identity
  consistency plus robust persistence migration; Sol workers own public identity
  (low effort) and saved-project/analytics migration (medium effort). Parent
  owns theme preference migration, automation/package/origin configuration,
  integrated verification, and restart state. Effort demand is direct copy
  replacement for public identity and failure/precedence reasoning for storage.
  Acceptance: final public brand everywhere, shared identity source, final
  origin derived consistently, legacy state retained/migrated without reset
  resurrection, privacy unchanged, golden/tests/type/style/build and installed
  Chrome/Edge print/browser checks. Use apex `https://quiltclarity.com` as the
  build-time canonical default; live www redirects remain a deployment gate.
- Activation evidence: Complete, 2026-10-01. `npm run verify` passes: zero
  diagnostics, clean lint/format, 215 Vitest tests in 19 files, and 42-page static
  build. `npm run smoke:browser` rebuilds and passes installed Chrome/Edge across
  38 indexable routes plus retained aliases/Feedback, final metadata/origin,
  native controls, theme migration including precedence/invalid values/failed
  writes, Guides/help, planner/persistence/analytics, mobile layout, performance
  and clean rendered-PDF geometry. Focused storage tests pass 22/22. Routing and
  lifecycle tests pass 23/23 after formatting-only changes to those modules.
  No domain formulas, placement rules, route behavior, privacy taxonomy,
  purchased-domain status or production host configuration changed.
- Final handoff: Memory checker and all nine isolated context-checker cases
  pass; final repository formatting and diff whitespace checks are clean.
  The original local dev service was stopped to prevent concurrent generated
  assets during build, then restored through the existing telemetry-disabled
  wrapper on port 4322 with network access. Live local HTML confirms QuiltClarity
  title/OG name and the purchased apex canonical. No Git remote or Sites hosting
  configuration was found; no external host/account state is inferred.
- Tooling boundary: The initial integrated lint run scanned ignored temporary
  WebKit resources and lacked Node globals for maintained scripts. ESLint now
  excludes temporary/generated surfaces and declares Node globals only for
  `.mjs` scripts. An empty shutdown catch now explains its containment purpose.
  Prettier excludes the already deferred V2 archive and temporary caches;
  maintained unformatted workflow files were formatted without logic changes.
  Full verification now passes rather than leaving that old lint issue open.
- Owner correction, 2026-10-01: Trademark search and domain purchase completed
  long ago. This supersedes repository statements that those steps remain
  pending. No separate report or purchase record was found in the targeted
  launch/decision/status search; missing repository evidence does not negate
  owner confirmation. The owner confirmed `quiltclarity.com`; the domain-derived
  public brand is `QuiltClarity`. Separate report location, registrar, purchase
  date, and canonical apex/www choice remain unrecorded. Do not rerun search or purchase.
- Correction route: Model demand is bounded factual status reconciliation;
  direct parent execution avoids a handoff. Effort demand is targeted evidence
  search and consistent removal of obsolete action instructions. Acceptance:
  completed owner work recorded, no inferred hostname/registrar/date or legal
  clearance, old handoff retained only as historical, no source rebrand or
  deployment until actual identity and current activation state are established.
- Correction evidence: Targeted repository search found stale pending labels
  and no separate completion artifact. The owner supplied authoritative
  completion and hostname confirmation; source/`.env.example` still use
  `Quilter` / `quilter.example` at that correction boundary. Active status and launch instructions then
  route to post-purchase activation, with old search/purchase instructions
  explicitly historical. No application source, identity identifiers, or live
  configuration changed in this correction.
- Correction validation: Memory structure and targeted Prettier checks pass;
  diff whitespace check is clean. The focused current-directive scan found
  no remaining candidate-only or pre-purchase-next-step assertions in the
  affected operational/status documents. No runtime rebuild was needed.
- Reconciliation route, 2026-09-30: Model demand is semantic consistency across
  product authority, launch gates, privacy, and owner approval boundaries;
  Sol-medium workers own the two domain documents and the five-file launch
  companion package. Parent owns operational authority and restart status.
  Effort demand is bounded source comparison and targeted consistency checks,
  using installed PowerShell, rg, Prettier, and memory/lifecycle scripts.
  Acceptance: V1.1 compound workflow and G01-G45 preserved; separate fresh
  pattern comparison; honest M9/Guides evidence; no feedback-inbox gate;
  provisional identity, owner purchase, and public-origin gates preserved;
  dated research not presented as refreshed availability or legal clearance.
- Feedback SEO follow-up: Owner authorized noindex and sitemap exclusion for
  the coming-soon page. Reuse the existing layout's `index={false}` switch;
  preserve the route, footer link, canonical, and crawler access. The sitemap
  now contains 38 indexable routes; V2 must reassess indexing when feedback ships.
  Model demand is bounded Astro metadata/route consistency; local execution
  avoids a handoff for this small change. Effort demand is direct configuration
  reuse and production-output checks. Acceptance: noindex in static output,
  route absent from sitemap, neighboring pages remain indexable, link preserved.
- Feedback SEO evidence: Complete, 2026-09-30. Zero typecheck diagnostics,
  14/14 affected SEO/Guides tests, targeted ESLint/Prettier, and the fresh build
  plus full installed Chrome/Edge smoke pass, including rendered print checks.
  Built HTML confirms Feedback is noindex, the homepage remains index/follow,
  the footer link remains, and Feedback is absent from the 38-route sitemap.
  Memory checks passed; no task operation remained at that boundary. Document
  reconciliation was queued then and is completed by the checkpoint below.
- Feedback scope, 2026-09-30: Owner-approved deferral is recorded in
  `../decisions/v1.1-feedback-system-deferral.md`; the planned milestone is
  `../v2/feedback-system-milestone.md`. `/corrections/` retains its URL and now
  conveys “Feedback system coming soon”, with Guides/methodology links and no
  submission form, email endpoint, signup, or delivery-date promise. Footer and
  About copy agree. The obsolete inbox variable/type and current launch/runbook
  requirements are removed; that narrow scope update preceded the separate
  continuation-document reconciliation recorded below.
- Feedback execution route: Model demand is coherent Astro UI implementation
  and neighboring-copy consistency; Sol-low handled four bounded source/test
  files. Effort demand is direct application and focused browser verification
  using installed tooling, with no new dependencies. Parent owns scope and
  documentation review. Acceptance: honest static availability, preserved route,
  accessible responsive links, consistent operational records, planned V2 milestone.
- Tooling diagnosis: Typecheck scanned ignored `tmp/playwright-browsers` vendor
  sources and exhausted Node's heap. `tsconfig.json` now excludes `tmp` alongside
  `dist`, keeping source checking intact. Typecheck then passes with zero
  diagnostics across 146 files. The full browser gate also exposed a retained
  WOF bottom-edge assertion contradicting the already accepted checkbox-center
  contract; it now checks checkbox/label centering while preserving ordinary
  control bottom alignment and the separate shared-track/wrapped-label audit.
  A second audit failure came from the native-select check persisting metric
  units before the imperial planner fixture. The planner audit now removes that
  prior draft before navigation, so its inputs and expected units agree; no
  calculation code was changed.
- Feedback verification: 206/206 tests and targeted ESLint/Prettier pass.
  Focused live Chrome/Edge checks pass at 320/390/768/1200px with no-JavaScript
  static fallback and initialized dark theme, visible keyboard-focusable help
  links, no page overflow, no form/email endpoint, and the Feedback footer label.
  Desktop/mobile light/dark screenshots in `tmp/feedback-*.png` were reviewed.
- Feedback status: Complete. The fresh 42-page build and full installed
  Chrome/Edge smoke pass, including mobile/static checks, planner/calculator
  flows, shared form and checkbox alignment, analytics, bounded fallback, and
  rendered PDF print checks. The existing development server on port 4322 serves
  the new Feedback page. No task-owned server remains; the owner's pre-existing
  development server is preserved.
- Checkbox repair: Complete, 2026-09-30. The previous bottom-edge rule placed the checkbox and label at different vertical centers (2.8046875px even on a single-line WebKit label; wrapping amplifies it). Checkbox and label now center within the shared control track, while ordinary fields retain bottom alignment. A reusable rendered regression verifies both centers against a stretched probe of the actual control track, not just the field's whole bounding box.
- Execution route: Local bounded correction. Model demand is shared CSS-grid/DOM compatibility judgment, supported by the explicit bottom-edge rule and rendered mismatch. Effort demand is focused dependency tracing and geometry verification using existing Playwright/Chrome/Edge/WebKit tooling. Acceptance: checkbox, label and shared track centers agree for natural and forced wrapping; text-control alignment, native selection and responsive behavior remain intact.
- Checkbox evidence: Focused live-site checks across the planner and eleven
  calculators at 390/768/1024/1200px pass 80 checkbox cases per engine in Chrome,
  Edge and Windows WebKit, including 43/43/45 wrapped-label cases respectively.
  Dynamic cut rows and stock controls were present and advanced sections open.
  The check is integrated into `scripts/browser_smoke.mjs`; its old intermediate
  checkbox-bottom assertion now checks label centering. No fresh complete smoke
  run is claimed for this one-rule correction. Physical iPhone/iPad confirmation
  remains distinct from Windows WebKit evidence.
- Status: Checkbox centering and shared dropdown corrections are complete. Focused Chrome/Edge/Windows-WebKit checks pass, and the owner confirmed correct dropdown height and checkbox centering on the affected iPhone/iPad on 2026-09-30. Selects retain native interaction; continuous-inline help and ordinary-field subgrid alignment are preserved.
- Device confirmation: The owner answered “yes confirm” to the combined dropdown-height and checkbox-centering check. This is owner-reported physical-device visual evidence; exact OS versions, per-browser retest details and screenshots were not supplied. It closes these reported defects, not all Safari compatibility checks.
- Constraints: Preserve V1.1 domain behavior, print output, analytics privacy, and owner-only MT-U01/MT-U02. Repeated list items inherit help from their visible concept header.
- Evidence: On 2026-09-30 the production build and installed Chrome/Edge smoke pass: all 42 built pages at 1200/390px, representative no-JavaScript pages, generated planner/calculator results, keyboard/help behavior, mobile containment, performance, and seven-page PDF print checks. Narrow-width probes from 120–320px preserve natural label wrapping, same-line help, gap <=12px and center offset <=3px. Browser assertions measure the final visible glyph and exclude deliberately CSS-clipped table headers from painted-position checks while retaining semantic checks.
- Focused verification: 23/23 Guides/help and UI-contract tests, typecheck with
  zero diagnostics, targeted ESLint/Prettier and diff whitespace checks pass.
  Mobile screenshots in `tmp/spacing-mobile-{multiline-status,buy-now,decision-details}.png`
  were visually reviewed. The original development site on port 4322 returns
  HTTP 200 with the new mark markup; the audit preview process was stopped.
- Form alignment evidence, 2026-09-30: the fresh 42-page build and installed
  Chrome/Edge smoke pass, including new rendered checks across the planner and
  all eleven calculators at desktop/mobile widths with natural/forced label
  wrapping and unequal hints/errors. Mixed-height advanced controls share the
  same bottom edge: rotation/orientation selects and the taller notes textarea
  measured 2746.83px in the diagnostic fixture. Existing help, mobile, performance
  and print/PDF checks remain green. This is CSS layout work, with no domain or
  owner-acceptance changes. Targeted Prettier/ESLint pass; the original local
  development site on port 4322 returns HTTP 200 with the subgrid CSS. No new
  task processes remain.
- Dropdown evidence, 2026-09-30: the owner reported thin controls in both Chrome
  and Safari on iPhone/iPad. Before the correction, the Windows WebKit planner
  select measured 47.59375px and Chrome measured 44px versus an input at
  44.390625px. After the appearance/line-height correction, both selects match
  the input at 44.390625px. Focused live-site checks cover 72 visible selects per
  engine (Chrome, Edge and Windows WebKit) across the planner and eleven calculators at 390/768/1024px with advanced
  details opened, plus added cut/stock rows, keyboard selection, dark theme and
  forced colors. Targeted lint/format and diff whitespace checks pass. These
  live checks do not claim a fresh full build/browser-smoke run or physical iOS
  paint confirmation. Test WebKit 26.5 revision 2336 was downloaded via the existing
  pinned Playwright Core 1.62.1 into ignored `tmp/playwright-browsers`; no package
  dependency or lockfile changed.
- Owner acceptance: MT-U01/MT-U02 PASS on 2026-09-30 in Chrome on a computer,
  fresh private window, using only shipped Guides/help; about five minutes,
  described as quick and easy. Exact readback and evidence limits are in
  `docs/manual-tests/V1_1_GUIDES_HELP_MANUAL_TESTS.md`.
- Unfinished: Establish actual Cloudflare hosting, DNS/redirects, Search Console,
  and public-origin state for the now activated identity. Registrar and renewal
  details/report location remain unrecorded; do not infer incomplete owner work.
- Next action: Obtain explicit Cloudflare OAuth scope approval and account
  authorization, then connect the public repository to selected Cloudflare
  hosting, then prepare production deployment and public-origin checks. Trademark search, purchase,
  and local source activation are complete; no live deployment was performed.

## QuiltClarity source activation — 2026-10-01

The [identity activation decision](../decisions/site-identity-activation.md)
owns the current public name, apex build default, automation namespace, and
legacy storage migration contract. Fresh integrated/browser evidence is in the
Resume Checkpoint. Canonicals, sitemap and robots derive from the purchased
origin; Feedback remains noindex and excluded from the sitemap. Remaining
`quilter` runtime matches are legacy-key compatibility and regressions or
ordinary quilting nouns. Historical documentation and physical checkout paths
retain their original spellings. No directory, hook trust, live host, DNS or
account configuration was changed.

```text
MILESTONE DIVERGENCE REVIEW
Milestone: Post-purchase QuiltClarity source activation
Relevant agenda clauses: Static architecture, privacy, deterministic transparent workflow
Relevant golden rules/tests: G01-G45, D01-D05 and existing invariants unchanged
Observed divergence: None
Reason: Identity and local namespace migration change no quilting behavior or product scope
Resolution: Local source activation accepted under verify and installed Chrome/Edge gates; live deployment acceptance remains open
```

## Continuation-document reconciliation — 2026-09-30

Scope: README operational authority, V1.1 current-state handoff, post-M10
sequencing status, launch readiness, domain activation/candidate handoff, and
the manifest's growth, SEO, deployment QA, and post-launch documents.
The dated V1 competitor benchmark and M10 report remain historical evidence;
unrelated product/V2 archives were not part of this review.

Root cause: the launch companion package and operational README retained V1
authority and a fresh-bolt-only thesis after V1.1 implementation. Its action
lists also retained incomplete fixture gates, loose analytics instructions,
and correction-channel expectations superseded by the owner decision.
Reconciliation updates those active instructions against their governing owners
rather than treating the old companion package as implementation authority.

The continuation now preserves exact finite-stock reconciliation, purchase-only
safety/rounding, independent stock-free pattern comparison, actual geometry,
G01-G45/properties and D01-D05, the closed analytics contract, Guides/help
acceptance limits, and the noindex Feedback deferral. Dated domain research
remains dated; no official register, registrar, legal, or availability check
was performed by the agent during that task. Its claim that the candidate was
unpurchased was contradicted by the owner's 2026-10-01 correction: trademark
search and purchase had already completed. Remaining activation work must be
established from the actual purchased identity and current external state.

Validation: targeted Markdown formatting, local Markdown destinations (7 links,
zero missing), active-instruction consistency review, diff whitespace checks,
and `scripts/check_context.ps1` pass. No product source or test behavior changed
in this checkpoint; no runtime rebuild was required. Prior runtime results
remain dated evidence rather than a fresh release run. The Windows sandbox
failed to initialize; the authorized fallback ran repository checks outside it.

```text
MILESTONE DIVERGENCE REVIEW
Milestone: Post-M10 continuation-document reconciliation
Relevant agenda clauses: Governing job/reason-to-win, scope locks, launch gate
Relevant golden rules/tests: Finite-stock and independent pattern contracts; G01-G45 and properties
Observed divergence: Legacy active launch instructions retained V1 authority and superseded action requirements
Reason: The companion package predated completed V1.1 and the Feedback deferral
Resolution: Active continuation instructions reconciled; implementation scope, owner gates, and evidence limits preserved
```

## Feedback deferral checkpoint — 2026-09-30

```text
MILESTONE DIVERGENCE REVIEW
Milestone: V1.1 Feedback coming-soon checkpoint; V2 Feedback System recorded, not implemented
Relevant agenda clauses: Preserve the static V1.1 product and controlled scope; owner-approved sequencing change
Relevant golden rules/tests: G01-G45 calculation contracts unchanged; 206 automated regressions pass
Observed divergence: Original configured correction channel is deferred to the V2 Feedback System milestone
Reason: Explicit owner instruction to replace the report page with coming-soon availability
Resolution: Approved deferral recorded; current navigation, configuration and launch dependencies reconciled for this scope. Full continuation-document review remains next.
```

## Agent Workflow Revision — 2026-09-09

Historical evidence; workflow instructions below are superseded by the 2026-09-10 root contract.

The scarce-compute follow-up retains Astra leadership and adds a conditional
cheaper-worker policy, explicit model/effort choices, compact briefs, bounded
repair/escalation, and tool/evidence reuse. Small or coupled tasks stay local;
delegation must save expected effort after review and rework. The existing
workflow decision owns details. No runtime configuration or product code changed.
Actual savings and worker quality remain to be observed during normal use.

The follow-up adds an internal handoff check for observed workflow friction.
Recurring issues or a serious failure justify a small evidence-backed correction;
working well is sufficient. Speculative redesign and recurring audit overhead are
explicitly avoided. The policy lives in the existing workflow decision and is
triggered by AGENTS. Documentation/context validation covers this follow-up.

The root context had accumulated overlapping status/history while its checker
enforced headings only. The revision bounds startup files, preserves the old
context in `docs/architecture/context-history-through-2026-09-02.md`, introduces
incremental recovery fields, removes mandatory chat resets, scopes full-bundle
reading to adoption/audit, and adds context validation to CI. The durable decision
is `docs/decisions/workflow-context-memory.md`. No product milestone is reopened
or completed by this operating-workflow change. Startup discovery is documented;
a separate fresh-client end-to-end startup has not been observed in this run.
The local checker and its isolated failure suite pass on Windows PowerShell;
CI now runs both scripts using PowerShell Core. The hosted run is not claimed.
Touched Markdown/YAML formatting and diff whitespace checks pass. Startup files
total 24,577 bytes after revision (about 64% below their prior combined size);
this is a byte measurement, not an exact token-use benchmark.

## Current Status

The previous V1 product completed Milestones 0-10 and its supplemental production pass. V1.1 now supersedes that launch thesis; V1.1 M0-M10 are complete, including a dated competitive-launch-gate PASS. Post-M10 Guides/help and continuation-document reconciliation are complete. Public launch remains blocked by identity, deployment, and public-origin checkpoints.

Completed pre-build assets:

- governing V1 product specification;
- authoritative domain rules and golden fixtures G01-G27;
- technical handoff with milestones 0-10;
- research and product dossier;
- layered agent context and validation architecture;
- Git repository initialized on `main` with a committed project baseline;
- Astro 7 static scaffold with strict TypeScript and no UI framework integration;
- framework-independent domain types, normalization, rotation resolution, validation, imperial fraction formatting, safety allowance, and purchase rounding;
- deterministic single-piece yardage calculation with legal row rotation, complete explanation payloads, and blocking error results;
- bounded deterministic mixed-piece optimization with six candidate strategies, practical remainder filling, configurable scoring, exact tie-breaks, candidate validation, and a grouped large-input fallback;
- framework-independent cutting-diagram projection with immutable source geometry, uniform scaling, strip boundaries, complete waste regions, orientation-aware continuously fitted labels/dimensions, directional markers, accessible text, safe SVG serialization, and grayscale print styles;
- deterministic multi-fabric project planning with independent normalization/optimization, scoped errors, per-fabric shopping results and cutting diagrams, and aggregate project totals;
- schema-version-2 top-level fabric plans and assigned cut requirements with lossless V0/V1 migration, reserved pattern references, and project-local stock geometry;
- bounded deterministic finite-stock allocation with stable physical-bin identity, exact unmet instances, practical rectangular leftovers, invariant-validated alternative assignments, and no fabricated purchase;
- raw-purchase-first stock-plus-bolt reconciliation with original cross-bin instance identity, purchase-only safety/rounding, stock-independent fresh scenarios, informational pattern comparison, and integrated multi-fabric shopping status;
- versioned local planner persistence with version-0 migration, structurally safe restoration, corrupt/incompatible-state recovery, and contained browser-storage failures;
- eleven framework-independent standalone calculator contracts covering Fabric Yardage, Backing, Batting, Binding, HST, QST, Flying Geese, Block Count, Borders, Sashing, and Pieces from Fabric with structured explanation data and shared finite-stock geometry;
- a deterministic project-level cut-list compiler with auto-detected tab-separated/CSV input, standard quoted CSV fields, known tabular headers/positions, decimal/fraction/unit parsing, cell-specific preview errors, explicit unmatched-fabric mapping, and confirmation-only imports;
- project-local editable stock presets/custom rectangles and optional pattern-reference inputs, with the planner switched to authoritative reconciled project results;
- read-only per-bin presentation over selected stock and purchased-bolt placements, including placement-derived instructions, accessible SVG/text plans, exact practical leftovers, purchase-only safety guidance, and deterministic print pagination;
- static Astro home, planner, calculator index, and eleven calculator routes with a shared accessible layout and responsive/print styling;
- vanilla TypeScript planner and calculator controllers with canonical unit translation, direct top-level fabric/cut-requirement editing, semantic desktop cut-list and labeled mobile-card paths, row add/duplicate/delete/undo, safe spreadsheet paste, local restore/save, blocking errors, warnings, assumptions, project result rendering, optimizer-backed diagrams, text alternatives, print/copy/share actions, and calculator-to-planner transfer;
- a learning-first Guides hub, Quick Start, full planner tutorial, workflow and reference guides, guide index and How It Works, expanded calculator methodology/examples/links/CTAs, three trust routes, unique canonicals, restrained JSON-LD, robots/staging controls, a custom 404, and a 38-route XML sitemap excluding the noindex Feedback coming-soon page;
- a closed typed V1.1 workflow analytics taxonomy, allow-listed tool identifiers and categorical fields, a contained date-only repeat-use marker, provider-neutral DOM/data-layer adapter, contained sink failures, controller transition wiring, and optional build-time Search Console verification metadata;
- Vitest coverage with 201 passing tests for authoritative V1.1 G01-G45, legacy differentiation diagnostics D01-D05, all prior product boundaries, the controlled help registry, exact tutorial anchors, guide sequence, static learning content, and guide/help analytics privacy;
- a Chrome/Edge release harness covering the 39 built routes, including 38 indexable routes and the noindex Feedback coming-soon page, plus Guides/contextual help, exact anchors, state restoration, keyboard/Escape focus, mobile touch-target and popover containment, controlled analytics, tutorial PDFs, and all prior product/browser/print checks;
- a shared light/dark presentation system with an accessible switch, system preference fallback, contained local persistence, cross-page synchronization, themed screen diagrams, and print-only light-color enforcement;
- ESLint, Prettier, Astro diagnostics, and cross-platform telemetry-safe scripts;
- Git/Prettier exclusions for local `.playwright-mcp/` browser-tool snapshots,
  preserving those generated artifacts without treating them as maintained
  repository source;
- GitHub Actions CI running the complete verification command;
- successful clean `npm ci`, diagnostics, lint, formatting, tests, and static build.
- authorized launch package extracted under `docs/launch/`, with a repository-backed readiness matrix and the package's missing-favicon check resolved.
- a current V1.1 same-job competitive gate covering C1-C5, the required named competitors, realistic design-first alternatives, and newly discovered ScrapFit, with a PASS recorded without exclusivity or global-optimality claims.

Current phase: V1.1 M10 complete; post-M10 Guides/help implementation and
technical validation complete. Owner-only `MT-U01` and `MT-U02` passed on
2026-09-30; the checkpoint divergence review is recorded below. Public launch
still awaits identity, deployment, and public-origin launch dependencies.
This owner acceptance must not be presented as independent novice or
target-quilter evidence.

## Post-M10 Guides/help checkpoint

- The handoff audit found the domain/runtime reusable and the prior guide grid
  insufficient as a learning system; no optimizer or calculation change was
  needed.
- The Guides hub now separates Start Here, Common Workflows, and Quilting
  Reference. Quick Start teaches a deterministic partial-stock example; the
  complete tutorial follows planner input/result order through printing with
  stable deep-link anchors.
- One controlled help registry feeds accessible planner, dynamic result, and
  calculator help. Popovers are click/touch/keyboard operable, close with Escape
  and restored focus, remain viewport-contained, and never replace inline
  correctness warnings. Plain question-mark triggers remain attached to each
  label's final word across wrapping while retaining their 44px semantic target.
- Analytics accepts only fixed guide slugs/categories/help keys and actions. No
  definition text, entered value, project content, or arbitrary URL is emitted.
- The repository manual record marks technical cases PASS in their dated runs
  and owner cases `MT-U01`/`MT-U02` PASS on 2026-09-30 under the explicit
  substitution decision. No new technical suite was run for this record update.
- The checkpoint is acceptance-complete. Owner evidence and unreported viewport,
  navigation, and screenshot details are preserved in the manual record.

```text
MILESTONE DIVERGENCE REVIEW
Milestone: Post-M10 Guides/help checkpoint, 2026-09-30
Relevant agenda clauses: V1.1 external-cut-list plus stock/purchase/execution workflow; approved post-M10 Guides sequencing.
Relevant golden rules/tests: G31-G45 finite stock/reconciliation; purchase-only safety and upward rounding; stock-free pattern comparison.
Observed divergence: Recruited novice validation replaced with owner validation by the approved 2026-09-01 decision.
Reason: The product authority approved the owner-operated substitute; technical cases retain their dated passing evidence, and the owner completed MT-U01/MT-U02 using only shipped learning/help.
Resolution: Checkpoint accepted under the recorded substitution. No independent novice or target-quilter evidence claimed. Missing viewport/navigation/screenshots are disclosed; written owner readback establishes the result state. Continue with continuation-document reconciliation; launch dependencies remain open.
```

## Known Issues

- Trademark search, domain purchase and source activation are complete. The
  confirmed `quiltclarity.com` / `QuiltClarity` identity is implemented locally;
  hosting and live configuration still require current evidence.
- Search Console ownership verification needs that public hostname and its deployment token through `PUBLIC_GOOGLE_SITE_VERIFICATION`.
- Feedback collection is deferred to V2; no corrections inbox is a V1.1 dependency.
- The GitHub Actions workflow has been locally mirrored but cannot receive a hosted run until a GitHub remote is connected and pushed.
- The installed-browser audit covers Chrome and Edge on Windows. Focused Windows WebKit checks were added on 2026-09-30 using the pinned temporary test engine; this does not establish physical Safari/iOS compatibility. Firefox and physical Safari checks remain outstanding.
- A repeated `npm ci` during the final audit encountered an environment-specific Windows unlink denial on Astro's generated native compiler binary; the lockfile install was restored with `npm install`, the dependency audit reports zero vulnerabilities, and the complete verification/build/browser gates pass. An earlier clean `npm ci` remains recorded and successful.
- Eligible target quilters were unavailable for U01-U05. The user explicitly accepted the completed redesign and exhaustive guided operator suite as the M9 substitute rather than leaving the project indefinitely blocked. This does not establish external unassisted comprehension; the unused five-user protocol remains available as an optional future study, not an active pre-M10 dependency.
- A separate comprehensive guided operator suite is ready at `docs/manual-tests/v1.1-m9-guided-manual-validation.md`. It converts the locked reconciliation fixture into exact browser actions and deterministic oracles, then adds human visual hierarchy, semantic readback, error recovery, persistence, responsive, keyboard/accessibility, theme, copy, print, and analytics-privacy checks. This suite can be executed without quilting expertise and supplies manual functional evidence, but its instructed operator is not counted as U01-U05.
- The guided operator suite began on 2026-08-24. Initial A01/A02 review passed clean-state and containment checks but exposed product/protocol naming drift, inconsistent legacy Project/Fabrics heading hierarchy, unnecessary result-section top spacing, and diagram overscroll containment that trapped page-wheel input. One coherent presentation/input-boundary correction is implemented and passes typecheck, lint, 193 tests, the 32-page build, and Chrome/Edge smoke; A01/A02 remain pending human retest on the repaired build.
- Continuing guided review exposed unreliable error navigation after Calculate: the controller focused an invalid field before hiding stale results, so the later layout collapse could leave the field outside the viewport. Error handling now establishes the final error layout before focusing and scrolling to the first invalid field, falls back to the error summary for unlinked failures, and respects reduced motion. Chrome/Edge regression coverage submits from the page bottom and requires the invalid field to finish focused and fully visible; human retest remains pending.
- The validation-copy audit moved unused-fabric detection to project validation, preventing the low-level “At least one piece group is required” invariant from leaking when only some project fabrics own cuts. Shared numeric messages now use visible labels, fit/capacity/layout failures provide remedies, assignment errors suppress derivative unused-fabric noise, planner summaries identify the affected fabric/cut/stock item, and calculators share the corrected focus/scroll ordering. Guided check F03 now covers unused fabric, width conflicts, invalid stock, impossible fit, simultaneous errors, scoping, inline linkage, focus, scroll, recovery, and data preservation. All 194 tests, build, and Chrome/Edge smoke pass; the exact unused-Fabric-C browser regression verifies summary/inline copy, focus, visibility, removal, and successful recalculation.
- The human operator confirmed the repaired A01/A02 presentation, hierarchy, spacing, diagram-wheel behavior, and targeted validation behavior on 2026-08-24. A01/A02 now pass; the complete F03 validation matrix and the remaining guided sections are still pending.
- Guided B02 setup exposed a protocol-only label mismatch: the authoritative UX and implementation say **Add custom piece**, while the manual said **Add custom remnant**. The manual now uses the rendered authoritative label; no product code or stock semantics changed.
- Resuming the F02 prerequisite fixture exposed one shared import-dialog boundary: an undefined surface token made the popup transparent, the source label/input lacked deliberate spacing, and the textarea wrapped long tabular rows into vertical overflow on narrow screens. The surface now uses the defined panel token, the field has explicit spacing, and `wrap="off"` plus no-wrap overflow preserves horizontal tabular scrolling. The compiler now deterministically auto-detects tab-separated or CSV input and supports quoted commas/escaped quotes while retaining preview/confirmation and prose-rejection boundaries. Typecheck, lint, 196 tests, the 32-page build, and Chrome/Edge smoke pass; guided C04 human retest and F02 remain pending.
- The C04 desktop import-dialog retest passed. Continuing setup exposed that a controller-only guard prevented deletion of the final starter row even though the schema/persistence permit an empty draft and project validation already blocks empty-list calculation. The guard is removed; the editor now shows an add-or-paste empty state, preserves one-step undo and row values, and persists the empty draft safely. Typecheck, lint, 196 tests, the 32-page build, and Chrome/Edge smoke pass with delete-last/empty/undo coverage; human B04 retest, responsive C04, fixture import, and F02 remain pending.
- Human B04, additive six-row import, D01/D02, and F02 pass. F02 verified blocking, scoped summary/inline copy, invalid Quantity focus/visibility, data preservation, recovery, and the restored Cream 1/4 yd oracle. Follow-up review replaced the distant visible desktop table header with field-local labels and groups field-prefixed errors vertically in a full-row desktop region. At 800px errors now align beneath their controls and omit redundant prefixes; at 650px labels stack above full-width fields and the errors remain unprefixed. An edited field clears only its stale linked error, successful recalculation clears all invalid state before results receive focus, and repeated fabric result/diagram cards have an explicit gap. A specificity defect that retained desktop percentage widths in cards was also corrected. Typecheck, lint, 196 tests, the 32-page build, and Chrome/Edge smoke pass at desktop, 800px, and 390px; human presentation retest and responsive C04 remain pending.
- Guided F03 passes in full. The five-case sweep verified scoped assign-or-remove handling for an unused fabric, visible terminology and navigation for a usable/nominal-width conflict, matching scoped stock summary/field copy, practical non-fitting-piece remedies, simultaneous cut/stock errors, first-invalid focus/visibility after results collapse, recovery, and data preservation.
- Guided G01 passes: same-window reload restored the complete two-fabric fixture, stock, both pattern references, and all six cuts, and recalculation reproduced the Blue zero-purchase/Cream 1/4 yd oracle. G02 remains deliberately deferred until all other evidence is captured.
- Guided H at 800px passes: side-by-side labels/controls retained an unprefixed error aligned beneath the invalid control, correction cleared stale state, successful recalculation focused results, and repeated Blue/Cream result-diagram cards had a visible gap. The 390 × 844 review and screenshot evidence remain pending.
- Initial H review at 390px exposed 3px of page overflow under classic-scrollbar geometry that touch emulation's overlay scrollbar had masked. Chrome/Edge diagnostics traced the scroll extent to zero-opacity dark-theme ray pseudo-elements and found the visually hidden desktop header row was also being formatted as a responsive card row. Dark mode now removes unused ray boxes with `display: none`; responsive row selectors are scoped to `tbody`, and the redundant header is absent in card mode. Browser smoke now separately emulates a 390px non-mobile classic scrollbar and requires root scroll width to equal client width with no right-edge offenders. Human 390px retest remains pending.
- The repaired 390 × 844 input/card retest and responsive C04 now pass: exact zero page overflow, stacked full-width labeled fields, visible/non-overlapping row actions, unprefixed full-width local error/focus/recovery, and the opaque, spaced, CSV/tab-aware, horizontally contained paste dialog were confirmed. The results/diagram half of H and screenshot evidence remain pending.
- Guided H is functionally complete: at 390 × 844 the shopping cards/caption, result hierarchy, Blue/Cream spacing, non-overlapping actions, contained diagram pan/zoom, and readable text alternatives all pass. The protocol's two screenshot artifacts have not been reported and remain outstanding evidence.
- Before I01, human review identified excessive nested card chrome consuming narrow-screen width. The initial correction overreached by flattening the first-level Fabric fieldset and did not explicitly center the work column; human review rejected it. DOM semantics remain unchanged. Project, individual Fabric, Cut requirements, summary, and per-fabric result groups now retain four-sided borders/padding in a centered 64rem work column, while only stock, cut-option, shopping, allocation, comparison, and text-plan descendants use transparent full-width vertical sections with top separators. Chrome/Edge mobile smoke explicitly verifies centered columns, retained first-level input/result boundaries, and zero side chrome on nested layers. Human visual retest remains pending.
- An intermediate large-screen correction introduced a planner-only centered 64rem wrapper and removed the hero's shared maximum width, making the planner diverge from other full-screen pages. Full-screen human review rejected that composition. A first correction restored the shared frame and hero but mistakenly left the primary planner work surface under the generic 64rem form cap. The completed correction removes the special wrapper, retains the shared centered 76rem page frame and 52rem left-aligned hero/helper, and gives the planner form the same full-frame width as its results and supporting content. Chrome/Edge assert those exact desktop boundaries and preserve the existing narrow-screen contract. Human visual retest remains pending.
- Cut-row follow-up exposed three declarations leaking generic table/content rhythm into the paired-row editor: the main cells retained the table divider, the companion cell had unequal vertical padding, and its `<details>` inherited a top margin. The pair now has no internal divider, the options cell has equal top/bottom padding at desktop and responsive widths, and the disclosure has no outer margin. Chrome/Edge computed-style checks lock each boundary; lint, targeted formatting, the 32-page build, and browser smoke pass. Human visual retest remains pending.
- The nested-hierarchy correction also flattened the four summary facts and every executable strip/placement item inside **Text version of this allocation**, materially reducing scanability. The outer text-plan disclosure remains a flat full-width descendant, but its fact and strip/placement groupings again use bordered, padded surface cards. Responsive Chrome/Edge computed-style coverage now distinguishes the intentionally flat outer section from the restored inner cards; lint, targeted formatting, the 32-page build, and browser smoke pass. Human visual retest remains pending.
- The same readability boundary applies to **Decision details** and **Pattern comparison**: their outer sections remain flat descendants, while each labeled fact again uses a bordered, padded surface card. The responsive Chrome/Edge fixture now supplies a pattern reference and verifies both outer sections and all inner fact cards explicitly; lint, targeted formatting, the 32-page build, and browser smoke pass. Human visual retest remains pending.
- Restoring the full 76rem planner form changed the cut-options auto-fit topology. At full width, the taller Notes textarea joins Rotation, Orientation, and WOF, so labeled fields top-align and WOF is offset to the shared input row. Below 800px, the three primary controls bottom-align on their shared row. The earlier broad `grid-column: auto` rule also unnecessarily squeezed Notes to one track at intermediate widths; Notes now spans the complete explicit grid row, which uses multiple tracks at 800px and safely collapses to the one available track at 390px without overflow. Chrome/Edge verify full-width, 800px, and 390px behavior; lint, targeted formatting, the 32-page build, and browser smoke pass. Human visual retest remains pending.
- Guided keyboard/accessibility check I01 passes: keyboard-only focus remained visible and ordered, disclosures activated correctly, the paste dialog trapped focus and closed with Escape, and no hidden responsive duplicate entered the focus order.
- Human print-preview review exposed a major regression despite green smoke checks, and the first attempted rendered-PDF sentinel correction was also rejected after it visibly overlapped sections and orphaned headings. The root pagination boundary was the screen `#fabric-results` grid remaining active under print media: `.fabric-result` page breaks were therefore grid-item fragmentation requests, which Chromium handled inconsistently across default and named pages. Print now resets that parent to normal block flow, restores one clean portrait start per fabric, leaves only `.diagram-print-page` as the named landscape/portrait owner, groups each material title/dimensions/instruction label with its first step, and removes print containment and diagram margin. A subsequent real preview showed that sizing the SVG alone still let Chromium split the legend from height-limited diagrams. The title, wrapped legend, and SVG now form one atomic inner box. The named page exposes non-painting bottom layout room for Chromium's fragmenter, while the visual unit is independently maximized inside the original 1.2cm safe box from inward PDF-point dimensions, its actual rendered diagram start, a uniform two-axis scale, downward width rounding, and the exact eight-point CSS-to-PDF paint-transform boundary; seven points fails the raster oracle, so eight is the largest verified point-grid fit. Print-only hierarchy remains compact and flat. The browser gate no longer relies on computed CSS or page count alone: `npm run smoke:browser` builds first, Playwright Core launches installed Chrome/Edge, PDF.js extracts clean-PDF text/coordinates, and `@napi-rs/canvas` scans clean diagram-page pixels. It requires no blank sheets, atomic title/legend/diagram co-location, one isolated correctly oriented sheet per diagram, no unrelated UI text, positive heading/diagram separation, fabric headings at the top safe boundary, compact purchase glyphs, and no paint outside the safe box. Human J03 preview confirmation remains pending.

## Next Checks

- Guides/help and continuation-document reconciliation are complete; preserve
  the recorded operator/owner evidence limitations.
- Trademark search, purchase and source activation are complete. Establish
  current hosting/configuration state before deployment. Feedback remains deferred to V2.
- Connect and push the repository, run hosted CI, deploy the static `dist` output, and submit `sitemap.xml` in Search Console.
- Repeat smoke checks on the public origin and add Firefox/Safari sanity checks where those engines are available.

## Milestone Divergence Reviews

## Launch Preparation

- On 2026-08-17, a durable manual review guide was added at `docs/manual-tests/differentiation-hardening-overlay.md`. It covers overlay positioning and the current result UX with reproducible inputs: the 30″/40″, 25%, 300 in², 7/8-yard review fixture; differentiation diagnostics now named D01-D05; equal and not-applicable messaging; unit-aware waste; emphasized/scannable efficiency and text-plan sections; privacy-safe analytics; mobile; and print. It explicitly excludes the later SVG label-fitting work.
- On 2026-08-17, scrap text stopped using its separate fixed 6–12px horizontal-first fitter. Waste regions now call the same whole-word orientation, controlled-growth, continuous-scale, adaptive-padding/stroke label fitter used by pieces, and both label kinds use the same stroke-width projection helper and unrotated clip boundary. Every positive-size scrap region therefore retains visible text instead of disappearing below 6px. A tiny-sliver regression raises the gate to 134 tests.
- On 2026-08-17, the fixed projected-width/height gate that suppressed labels before SVG layout was removed. Every positive-size piece now reaches a deterministic orientation-aware fitter. Follow-up real-use corrections stopped treating character-split words as a successful fit and made rotation respond before that boundary: both 12–24px whole-word layouts are evaluated, vertical wins when it uses fewer lines, and equal line counts retain horizontal orientation. If neither fits, bounded binary fitting selects the larger whole-word scale with a horizontal tie-break. A subsequent size calibration permits growth into spare room only up to 125% of the box-derived size, still capped at 24px, so small boxes do not jump from 12px straight to the global ceiling. Adaptive padding and stroke widths shrink with tight boxes, and rotated text sits inside an unrotated clip so paint remains within optimizer geometry. Focused regressions cover horizontal preference, controlled growth, reduced-wrap rotation, mid-word-failure rotation, rotate-before-shrink, rotate-and-shrink, and dense always-visible labels. Typecheck, lint, 133 tests, the 19-page build, and Chrome/Edge desktop/mobile/print smoke pass, including a real narrow-piece rotation assertion.
- On 2026-08-17, the bounded differentiation-hardening overlay completed without altering the selected optimizer layout or expanding V1 scope. Each multi-group fabric compares its selected raw length with the sum of the same normalized groups optimized separately under identical constraints; safety and rounding remain outside the comparison. Diagnostics now named D01-D05 plus invariants lock arithmetic, directionality, WOF semantics, determinism, and fabric isolation. The collapsed efficiency details expose only truthful outcomes, and `optimization_completed` adds only coarse allow-listed outcome/band fields. The current first-party competitor refresh confirms that across-set optimization is not unique, narrowing the defensible combination to direct arbitrary piece entry, independent constrained fabrics, explicit assumptions/instructions, and measured joint-planning effect. Manual review subsequently corrected canonical mm² leakage, placed used/waste facts inside the same highlighted comparison summary, equalized comparison body typography, emphasized important values, and replaced the claustrophobic plain text-plan paragraph with semantic overview, piece-group, and strip cards backed by structured presentation fields. Typecheck and lint pass; 129 tests and the 19-page build pass. The repository-wide format gate is presently blocked only by the unrelated, intentionally unread `docs/v2/quilt_V2_deep_research_and_design_master_brief.md`; all touched files are formatted. Chrome and Edge smoke pass desktop, 390×844 mobile, analytics, structured/emphasized result details, unit-aware waste display, and print/PDF checks.
- On 2026-08-12, computed styles showed the white SVG filter enabled in print, but user print-preview evidence showed Chromium did not reliably paint it. Print now disables that filter and reveals a clipped duplicate of every visible piece/scrap label as a 7px rounded paper-white vector clearance layer behind the black text. This reliably overpaints nearby pattern ink in generated PDFs without shaded ink, works when previewing from dark mode, and leaves scrap's light-grey fill unchanged.
- On 2026-08-12, the SVG label-shadow filter gained a dark-theme flood-color override: light diagram text casts a black shadow in dark mode, while light mode and print use white.
- On 2026-08-12, diagram zoom was unified to 1×–10× fitted size for every viewport, superseding the separate desktop and sub-800 ranges. Viewers initialize at 1× from 650px upward and 2× below 650px; crossing that breakpoint resets to the applicable default. Slider visibility still changes at 800px, and pinch remains available across touch-capable widths.
- On 2026-08-12, sub-800px viewers received a distinct 1×–10× zoom contract initialized at 3× fitted size; pinch is clamped to those limits and remains synchronized with the hidden range state. The square viewer now uses a non-shrinking flex SVG with auto margins on both axes, centering the diagram wherever it does not overflow—specifically correcting wide, short diagrams that previously sat against the canvas top.
- On 2026-08-12, every screen diagram viewer became an exact 1:1 square; print explicitly returns the wrapper to natural sizing. The former percentage zoom was superseded by a logarithmic −10 through +10 range centered on `0 = Fit`: the midpoint contains the complete SVG against both square dimensions, with endpoints at 0.1× and 10× that fitted size. The visible slider remains hidden at/below 800px, synchronized pinch remains active, and a screen-only pinch instruction now follows the legend.
- On 2026-08-12, cutting diagrams gained a full dark-mode screen palette for canvas, piece/waste patterns, boundaries, dimensions, and labels, with explicit print overrides preserving the existing white grayscale-safe page. The later square-canvas and fitted logarithmic zoom contract above supersedes this change's initial percentage range; zoom continues to affect only laid-out screen width, leaving optimizer coordinates, viewBox geometry, text alternatives, and print fitting unchanged.
- On 2026-08-12, the masked moon crescent was rotated 20 degrees clockwise and gained a slight `drop-shadow` glow that follows its alpha rather than outlining its former construction circle. At widths up to 800px, the switch is positioned at the header's top-right opposite the left-aligned site logo, with navigation continuing below; browser smoke verifies the angle, glow, and mobile placement.
- On 2026-08-12, the moon geometry was corrected after removing its shadow proved insufficient: the white circular construction disk itself could still expose a full-circle edge. The dark-state thumb now applies a circular radial mask directly to the same 20px circumference used by the sun, making all pixels outside the crescent transparent; both sun-ray pseudo-elements are hidden in that state. Browser smoke locks the mask, shared size, absent circular box shadow, and hidden rays.
- On 2026-08-12, the theme control's visible “Dark mode” label and nested track wrapper were removed. A compact 24px-high visual track now sits inside the switch's independent 44px hit area: its 20px thumb has a 2px outer inset, renders as a yellow sun whose eight straight orange rays begin 2px beyond the track border without touching the disk, and becomes a white crescent against a dark-blue track in dark mode. The control retains its accessible name, checked state, title, keyboard semantics, and reduced-motion handling; browser smoke locks both visual states through computed pseudo-element styles.
- On 2026-08-12, the shared static shell gained an accessible site-wide dark-mode switch. First visits follow `prefers-color-scheme`; explicit `light`/`dark` choices persist only under `quilter:theme`, synchronize across routes and tabs, and survive unavailable storage without blocking content. The palette uses deep plum-charcoal page/panel/input tokens with contrast-safe text and controls; print media forcibly resets all theme tokens to light. Cutting SVG canvases were subsequently incorporated into the screen palette as recorded above. Static contracts and Chrome/Edge smoke cover semantics, system fallback, switching, persistence, theme-color metadata, dark-mode contrast, mobile containment, and unchanged PDF pagination.
- On 2026-08-12, visible and accessible waste-region terminology changed from “Discard”/“Discard area” to the quilting-neutral “Scrap”/“Scrap area.” The existing horizontal/vertical fitter, clipping, geometry, waste accounting, text shadow, and print treatment are unchanged; regression expectations now lock the revised wording.
- On 2026-08-12, user print-preview evidence contradicted the intermediate boxless `.fabric-result` correction by showing two trailing blank sheets. The underlying unstable boundary was the pair of screen-only `<details>` siblings following the named diagram page in document order: they could make Chromium reopen default page context despite being hidden. Those disclosures now precede the diagram structurally and are flex-ordered after it only on screen; print retains a normal result box and the diagram is its final generated fragment. The Chrome/Edge harness now parses PDF page dictionaries and requires exactly three pages for one fabric (project summary, fabric details, diagram) and five for two, in addition to checking final-fragment order, named A4 ownership, fitted geometry, and valid PDF data.
- On 2026-08-12, an intermediate attempt made the outer `.fabric-result` article `display: contents` in print and moved the portrait break to its heading. Computed-style and PDF-validity checks passed, but they did not count sheets; user preview showed that the change increased the trailing blanks. The implementation and documentation now supersede that attempt with final-fragment ordering and explicit PDF page-count assertions.
- On 2026-08-12, the remaining perceived diagram-wrapper gap was traced to the SVG's symmetric 56-unit screen projection padding after its exterior labels, not the already-zero print wrapper padding. The print fitter now saves the screen viewBox, uses `getBBox()` to include every rendered diagram primitive and exterior label, replaces it with those bounds plus a 5px inset on each edge, and restores the original after print. Chrome/Edge smoke requires all four graphic-to-viewBox insets to equal 5px while retaining the optimal two-axis sizing and PDF checks.
- On 2026-08-12, conservative 17.5cm landscape and 26.2cm portrait SVG caps were replaced by a deterministic two-axis print fitter. On print-media entry and `beforeprint`, it measures the actual outer heights of the visual-plan heading and legend, calculates remaining height inside the selected 5mm-margin A4 page, compares height- and width-derived scales against the SVG viewBox, and writes the maximum safe width as a print-only custom property. Chrome/Edge smoke independently repeats the geometry calculation and requires the rendered width and height to match within one pixel, while retaining the page-ownership, border, padding, pagination, and PDF checks.
- On 2026-08-12, print-preview evidence showed that the page-filling flex viewport exceeded the named page once its heading and legend were included, fragmenting the visual section into a heading-only rotated page, a diagram page, and a trailing blank fragment. The section changed to intrinsic height, the `.fabric-result` portrait page break was restored, and temporary A4-safe SVG height caps stabilized pagination; those conservative caps were subsequently superseded by the dynamic fitter recorded above.
- On 2026-08-12, an intermediate correction moved page ownership from `.fabric-result` to `.diagram-print-page`, explicitly fixed the base and named sheets to A4, and reduced diagram-page margins to 5mm. This kept fabric details portrait, but its fixed page-filling flex viewport and removed result break were later contradicted by print-preview evidence; the superseding intrinsic sizing and restored result break are recorded above.
- On 2026-08-12, planner-result print layout stopped treating the fragmentable outer `.fabric-result` card and inner `.diagram-wrap` as bordered print cards. The initial version assigned the complete result to a named page; later print-preview corrections narrowed that ownership to the visual-plan section as recorded above. Frame/padding removal, full wrapper-width SVG rendering, aspect-derived orientation, and successful PDF generation remain in force. The full gate remains at 115 tests.
- On 2026-08-12, the white diagram-text treatment gained a 2.5px under-stroke in addition to a broader, fully opaque, downward-offset blur. The prior white blur could visually disappear against the pattern's predominantly white background; the under-stroke now guarantees a visible separation wherever dark pattern marks meet black text. Both effects remain clipped to their boxes and are removed for print; the full 115-test gate remains unchanged.
- On 2026-08-12, the diagram label shadow changed from a faint dark blur to a 95%-opaque soft white blur so black text remains distinct over dark pattern marks. The discard label clip now belongs to an unrotated wrapper while only its text rotates; this corrects transformed clip coordinates that previously reduced some vertical labels to their middle characters. A narrow-strip regression requires the complete rotated “Discard” word, bringing the full gate to 115 tests.
- On 2026-08-12, projected waste regions gained accessible “Discard area” titles plus visible fitted “Discard” labels when their geometry can hold text of at least 6px. The fitter tries horizontal placement first and rotates vertically for narrow tall scraps; piece-local clips prevent overflow. Piece and discard labels also gained a subtle shared SVG drop shadow for separation from pattern marks, with print explicitly disabling the effect. Regression coverage brings the full gate to 114 tests.
- On 2026-08-12, the alternating piece-pattern path was corrected so both diagonal orientations cross the repeating tile interior. Previously, one orientation placed its strokes primarily on tile boundaries and could therefore render a labeled piece as visually plain. The darker 1.25px interior strokes preserve non-color group differentiation, and a regression requires both orientations and one pattern mark per piece group, bringing the full gate to 113 tests.
- On 2026-08-12, cutting-diagram viewers replaced the fixed 46rem height cap with a container-query-unit maximum equal to the fabric-result content width. Short diagrams retain natural height; tall diagrams can fill a square 1:1 viewport before internal scrolling begins. Print removes the cap and overflow containment. Chrome and Edge smoke verify the behavior with a tall 64-piece mobile plan while retaining page-overflow and authored-canvas checks.
- On 2026-08-12, the cutting-diagram label fitter's fixed 12px ceiling was replaced by a deterministic starting size derived from each piece rectangle, ranging from 12px to 24px. Large boxes therefore use more of their available area while smaller boxes retain the established wrap-first, shrink-to-fit, and clip-containment behavior. A regression locks enlargement above 12px for spacious pieces, bringing the full gate to 112 tests; build and Chrome/Edge smoke pass.
- On 2026-08-12, sub-800px cutting-diagram viewers began preserving the authored 800px label-fitting canvas within the existing contained horizontal scroller. This keeps the wrap/shrink calculation and clip boundaries valid while preventing whole-SVG downscaling from making fitted labels needlessly small; print explicitly returns to page-width scaling. Chrome and Edge smoke now verify the preserved canvas, internal scrolling, and absence of page overflow.
- On 2026-08-12, all visible cutting-diagram piece labels and dimensions gained deterministic word/character wrapping at the maximum font size followed by bounded font reduction when height remains constrained. Each rendered label is clipped to an inset of its own piece rectangle as a final cross-engine containment guarantee; labels that cannot fit readably remain available through per-piece titles and the complete text alternative. Focused HST-label regressions cover wrap-first and shrink/clip behavior, bringing the complete gate to 111 tests; the 19-page build and Chrome/Edge smoke pass.
- On 2026-08-12, planner advanced-form checkbox controls were aligned to neighboring inputs, reset-action spacing was improved, wrapping Notes hints were removed, and the shopping count gained a 650px stacking breakpoint. The shared calculator form column scales proportionally from a 45rem maximum toward a 520px non-mobile minimum, is capped at two fields per row, and has consistent spacing below unit selectors and above advanced reset actions. Calculator results stack below the form at 1000px; form minimums and field grids reset to a fluid one-column layout at 800px. The browser harness explicitly verifies side-by-side layout at 1001px, result stacking with two field columns at 1000px, and one field column without overflow at 800px. The complete verification gate remains green with 111 tests, a 19-page build, and Chrome/Edge browser smoke coverage.
- On 2026-08-10, the user explicitly authorized extraction of `docs/quilt_LAUNCH_growth_package.zip` into `docs/launch/` and commencement of its pre-deployment workflow.
- The package is subordinate to the FINAL product documents. Its G01-G27 wording is superseded by the stronger current G01-G30 regression boundary.
- Fresh `npm run verify` passes with 109 tests and a 19-page static build. The final fresh `npm run smoke:browser` passes in Chrome and Edge; the 500-piece fallback rendered in 33.9 ms and 33.0 ms respectively.
- The first concrete source gap, a missing favicon, is resolved through a static SVG asset and shared layout link. Deployment-owner, live-origin, legal-identity, and monetization-dependent items remain explicitly pending in `docs/launch/launch-readiness-status.md`.
- The first-party public-evidence benchmark covers Quilt Geek, PreQuilt, Gibson Threads, QuiltButler, Quiltler, and a close dedicated calculator. It supports Quilter's narrow free/no-account/explainable workflow and records broader design/cloud/community features as deliberate non-goals rather than launch gaps.
- The browser harness now emulates a 390x844 touch viewport. Chrome and Edge pass page-overflow, stacked header/form/calculator layout, 44px control height, contained diagram/result, and standard desktop regression checks; the latest 500-piece fallback rendered in 32.5 ms and 36.9 ms respectively.

### Milestone 0

MILESTONE DIVERGENCE REVIEW

Milestone: 0 — Astro repository and test harness

Relevant agenda clauses:

- Astro static-first architecture.
- JavaScript only where interaction requires it.
- No backend, database, authentication, AI, account system, or paid service.
- Deterministic core math and explicit assumptions.

Relevant golden rules/tests:

- Canonical internal unit is millimetres.
- Exact conversions are 1 inch = 25.4 mm, 1 yard = 914.4 mm, and 1 metre = 1000 mm.
- Metric calculations are not internally rounded to imitate imperial fractions.

Observed divergence:

- None.

Reason:

- Implementation followed the locked scaffold and test-harness scope.

Evidence:

- React was not installed; no backend, database, authentication, AI, accounts, or paid service was introduced.
- `npm ci` succeeds from the committed lockfile.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 7 passing tests, and a successful static build.
- CI runs the same verification command on pushes and pull requests.

Recommendation:

- Proceed to Milestone 1 after the required context reset.

### Milestone 1

MILESTONE DIVERGENCE REVIEW

Milestone: 1 — Domain primitives

Relevant agenda clauses:

- Plain TypeScript owns shared domain calculations and remains independent from Astro and React.
- Internal lengths use millimetres and preserve exact conversion constants.
- Defaults remain editable; errors block unusable results while warnings preserve usable ones.

Relevant golden rules/tests:

- Finished rectangles add twice the seam allowance to both dimensions; cut dimensions do not.
- Directional fabric defaults to no rotation, and piece-level settings override fabric defaults.
- Safety applies after layout length; purchase rounding is always upward and preserves exact increments.
- G01, the validation primitives of G06-G07, and purchase fixtures G20-G21 and G24 apply at this boundary; G27 applies to rotation resolution.

Observed divergence:

- None.

Reason:

- The milestone implements only locked primitives and explicit validation invariants, with no optimizer or UI behavior brought forward.

Resolution:

- No resolution required.

Evidence:

- Domain types, normalization, formatting, purchase calculation, and structured validation live under `src/lib/domain` with no framework imports.
- Tests cover G01, G06-G07 primitives, G20-G21, G24, G27 rotation precedence, invalid direct calls, and representative upward-rounding and safety-ordering invariants.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 30 passing tests, and a successful static build.

Recommendation:

- Proceed to Milestone 2 after the required context reset.

### Milestone 2

MILESTONE DIVERGENCE REVIEW

Milestone: 2 — Single-piece yardage engine

Relevant agenda clauses:

- The fabric yardage calculator reports pieces per row, rows required, exact length, and recommended purchase.
- Calculation results expose assumptions and intermediate values rather than reconstructing formulas in presentation code.
- Domain calculations remain deterministic, framework-independent, and based on usable fabric width.

Relevant golden rules/tests:

- Finished-to-cut normalization, legal rotation, directional defaults, WOF-strip rotation restrictions, post-layout safety, and strict upward purchase rounding.
- G01-G04, G06-G08, G20-G22, G24, and G27 where applicable to a repeated identical rectangle.
- Required invariants for deterministic output, piece accounting, usable-width bounds, orientation, purchase bounds, and blocking impossible inputs.

Observed divergence:

- None.

Reason:

- The engine is limited to deterministic quilting row math for one repeated rectangle group and does not introduce mixed-piece packing or a generic optimization framework.

Resolution:

- No resolution required.

Evidence:

- `calculateRepeatedRectangleYardage` evaluates only legal row orientations, chooses lower raw length with an unrotated tie-break, and returns one structured explanation or blocking errors.
- Tests automate every fixture assigned to this milestone and representative determinism, accounting, usable-width, safety, and purchase invariants.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 46 passing tests, and a successful static build.

Recommendation:

- Proceed to Milestone 3 after the required context reset.

### Milestone 3

MILESTONE DIVERGENCE REVIEW

Milestone: 3 — Multi-piece single-fabric optimizer

Relevant agenda clauses:

- Each fabric is optimized independently from normalized cut-size piece groups.
- Candidate generation includes constrained, area, width, height, quantity, and strip-friendly deterministic orderings.
- Practical strip-based cutting and compatible leftover filling precede candidate scoring and selection.
- The optimizer is a bounded practical heuristic and does not claim a globally proven optimum.

Relevant golden rules/tests:

- Every requested instance appears exactly once, stays within usable width and used length, does not overlap, and obeys resolved rotation constraints.
- Identical input returns identical output; equal scores resolve by lower used length, lower cut complexity, lower waste, then stable strategy order.
- G05 and G18 require mixed-group row-remainder filling; G25 requires deterministic ties; G26 requires bounded handling of 500 grouped pieces.

Observed divergence:

- None.

Reason:

- The implementation is limited to deterministic rectangular quilting rows and bounded remainder filling. It introduces neither arbitrary polygons nor randomized or unbounded search.

Resolution:

- No resolution required.

Evidence:

- `optimizeFabric` consumes normalized groups for one fabric, generates at most six stable candidates, independently validates placement accounting and geometry, and returns the selected placements as the downstream source of truth.
- Inputs above 400 instances use one grouped strip-friendly strategy with a warning; inputs above the explicit 20,000-placement geometry ceiling return a blocking performance-limit error.
- Automated fixtures verify G05 at 20 inches, G18 as two rows containing one A plus two B pieces, G25 under equal configured scores, and G26 with all 500 instances placed in 80 inches.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 52 passing tests, and a successful static build.

Recommendation:

- Proceed to Milestone 4 after the required context reset.

### Milestone 4

MILESTONE DIVERGENCE REVIEW

Milestone: 4 — Visual cutting plan

Relevant agenda clauses:

- The cutting diagram is generated from actual optimizer placement geometry with fabric width horizontal and fabric length vertical.
- The result shows piece rectangles, labels and dimensions, strip boundaries, waste regions, and a fabric-direction marker when relevant.
- SVG output is scalable, printable, distinguishable without color alone, and paired with a textual equivalent.
- Dense layouts retain complete non-visual information; the later orientation-aware continuous fitter supersedes the original visible-label suppression fallback.

Relevant golden rules/tests:

- Placement geometry remains the optimizer's source of truth and is not recomputed in visualization code.
- Every projected piece preserves its group, instance, coordinates, dimensions, and rotation state.
- Accessibility requires a textual equivalent, no color-only meaning, and readable grayscale print output.

Observed divergence:

- None.

Reason:

- The visualization is a read-only projection and SVG serializer. It contains no packing, optimization, editing canvas, or quilt-design behavior.

Resolution:

- No resolution required.

Evidence:

- `createCuttingDiagram` copies optimizer source coordinates, applies one uniform scale, derives exact row-remainder and above-piece waste, and rejects fabric/result geometry mismatches.
- `renderCuttingDiagramSvg` emits scalable view-box geometry, labels and dimensions, patterned group fills, strip boundaries, optional direction markers, XML-escaped user content, accessible title/description elements, and grayscale print CSS.
- The original milestone allowed dense pieces to suppress visible internal labels; the later orientation-aware continuous fitter supersedes that behavior while retaining per-instance SVG titles and row-based text with grouped instance ranges.
- Tests assert source-to-projection equality, total projected waste equality, textual row coverage, direction behavior, always-visible dynamically fitted labels, safe escaping, print rules, and mismatched-geometry rejection.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 61 passing tests, and a successful static build.

Recommendation:

- Proceed to Milestone 5 after the required context reset.

### Milestone 5

MILESTONE DIVERGENCE REVIEW

Milestone: 5 — Multi-fabric project planner

Relevant agenda clauses:

- Projects support multiple fabrics with independent settings and piece groups.
- Results include a separate shopping quantity and cutting plan for every fabric plus a project aggregate summary.
- The most recent planner state is stored locally with an explicit schema version; no signup or cloud persistence is required.

Relevant golden rules/tests:

- G19 requires Fabric A and Fabric B to be optimized independently, with no cross-fabric packing and separate shopping results.
- Finished-size normalization, rotation precedence, validity, purchase rounding, determinism, and optimizer geometry continue to apply within each fabric.
- Persistence must restore valid serialized state, migrate compatible older state, and recover safely from corrupt state.

Observed divergence:

- None.

Reason:

- Project orchestration composes the existing single-fabric optimizer and presentation projector without changing domain rules, sharing placements, or introducing UI, server, account, or cloud behavior.

Resolution:

- No resolution required.

Evidence:

- `planProject` validates project structure, normalizes and optimizes each ordered fabric independently, scopes calculation errors by fabric ID, and derives per-fabric shopping entries and aggregate totals from the successful results.
- `createProjectCuttingPlans` produces exactly one diagram per successful fabric by passing that fabric's optimizer result directly to the Milestone 4 projector.
- The persistence adapter writes schema-version-1 JSON, migrates the explicit version-0 envelope, restores structurally sound in-progress state, removes malformed or incompatible state, and contains unavailable-storage failures.
- Automated tests cover G19 piece isolation, independent settings, project determinism, error scoping, source-backed diagrams, state round-trip, migration, corrupt/incompatible recovery, clearing, and unavailable storage.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 69 passing tests, and a successful static build.

Recommendation:

- Proceed to Milestone 6 after the required context reset.

### Milestone 6

MILESTONE DIVERGENCE REVIEW

Milestone: 6 — Standalone calculators

Relevant agenda clauses:

- V1 includes Fabric Yardage, Quilt Backing, Binding, HST 2/4/8, Block Count, Borders, and Sashing calculators.
- Shared domain primitives own canonical units, validation, safety allowance, purchase rounding, and reusable yardage behavior.
- Calculator results must be deterministic, explanation-ready, and able to feed the later planner flow where specified.

Relevant golden rules/tests:

- G09 and G23 govern backing panel coverage, orientation comparison, recommendation, and directional filtering.
- G10 governs straight-grain binding perimeter, strip count, fabric length, and purchase rounding.
- G11-G13 govern HST formulas, trim-friendly sizes, batch yields, excess, starting-square counts, and bias warning.
- G14-G15 govern whole-block counts and target overshoot; G16 governs straight side-first borders; G17 governs row-wise sashing without cornerstones or outer sashing.
- Required invariants include backing coverage at or above demand, HST production at or above request, upward purchase bounds, blocking invalid input, and determinism.

Observed divergence:

- None.

Reason:

- The implementation follows the locked formulas directly, adds no calculator categories or quilting heuristics, and remains framework-independent. Optional Block Count sashing uses the explicitly enabled between-block model required by the product specification.

Resolution:

- No resolution required.

Evidence:

- Fabric Yardage aliases the existing repeated-rectangle engine; the other six calculators live in focused domain modules and reuse shared validation and purchase functions.
- Backing generates coverage-safe candidates and filters horizontal orientation for directional fabric; HST methods retain distinct formulas and yields; Border and Sashing results expose every required intermediate and practical warning.
- Every success contains typed outputs plus assumptions and formula steps derived from the same result values; invalid inputs return blocking field errors without best-effort calculations.
- Automated tests cover G09-G17 and G23, all HST methods and batch bounds, backing coverage, optional block sashing, invalid input, deterministic output, and the Fabric Yardage shared-engine identity.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 85 passing tests covering G01-G27, and a successful static build.

Recommendation:

- Proceed to Milestone 7 after the required context reset.

### Milestone 7

MILESTONE DIVERGENCE REVIEW

Milestone: 7 — Astro UI, planner island, and calculator UX

Relevant agenda clauses:

- The primary workflow must let a beginner define fabrics and rectangular piece groups, calculate locally, and inspect exact and purchase yardage, cutting information, actual placement diagrams, warnings, and assumptions without signup.
- Simple mode exposes minimum inputs; usable width, seam allowance, orientation, safety allowance, purchase increment, and fabric direction remain available as advanced settings.
- V1 result actions include print, copy summary, share when practical, add calculator result to planner, and edit assumptions.
- Forms must be keyboard operable with visible associated labels and field-linked errors; diagrams require text alternatives and grayscale-readable print output.

Relevant golden rules/tests:

- All UI measurements convert to exact canonical millimetres before calling the existing domain contracts.
- Errors block results; warnings preserve usable results; purchase quantities are supplied by the domain's strict upward-rounding behavior.
- Planner diagrams must project the optimizer's actual placements and must not introduce a second layout engine.
- G01-G27 and existing invariants remain unchanged at the domain boundary.

Observed divergence:

- None.

Reason:

- The permitted React island was not required. A delegated vanilla TypeScript planner controller remains maintainable with the completed project, persistence, and presentation contracts and avoids adding a framework dependency.

Resolution:

- Record the no-React V1 UI choice in `docs/decisions/milestone-7-vanilla-ui.md`; retain the one-island ceiling only as a reviewed future option.

Evidence:

- Astro statically emits the home page, planner, calculator index, and all seven locked calculator routes with useful headings, forms, descriptions, assumptions guidance, labels, error regions, and no account gate.
- The planner supports imperial/metric display, one default fabric/piece, multiple fabrics and piece groups, simple and advanced fields, local restore/save, scoped validation, warnings, shopping summaries, cutting lists, optimizer-backed SVG, complete diagram text, visible assumptions, edit/recalculate, print, copy, and capability-checked sharing.
- Calculator pages reuse one vanilla controller, call only existing calculator contracts, expose warnings and assumptions, support unit switching and copy, and append relevant rectangular results to local planner state.
- Generated HTML inspection confirms visible calculator labels and the locked route slugs; generated CSS contains print media rules; `git diff --check` reports no whitespace errors.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 89 passing tests across 9 files, and a successful static build of 10 routes.

Recommendation:

- Proceed to Milestone 8 after the required context reset.

### Milestone 8

MILESTONE DIVERGENCE REVIEW

Milestone: 8 — Astro SEO page shell and content structure

Relevant agenda clauses:

- Every calculator page requires a task-focused H1, usable calculator near the top, value proposition, assumptions, worked example, methodology, related links, planner CTA, and unique metadata.
- The initial route set contains the home page, planner, seven calculator routes, and five named guide routes.
- SEO pages must provide real utility and useful crawlable HTML without mass-generated numeric or thin content.

Relevant golden rules/tests:

- Explanatory content must preserve the authoritative usable-width, finished-to-cut, seam-allowance, backing-overage, orientation, safety, and upward purchase-rounding rules.
- Calculator formulas remain in framework-independent domain modules; static content explains the contracts without becoming another calculation implementation.
- Errors, warnings, practical caveats, and the bounded-heuristic claim remain consistent with the golden contract.

Observed divergence:

- None.

Reason:

- The implementation adds exactly the locked routes and hand-authored content required by the milestone. It does not introduce generated keyword/numeric pages, a CMS, a backend, a content dependency, or a second source of calculator results.

Resolution:

- Record the static route, canonical-origin, sitemap, and content-boundary choices in `docs/decisions/milestone-8-static-seo-content.md`; require `SITE_URL` to replace the reserved local origin at deployment.

Evidence:

- All seven calculator routes statically render the interactive form near the top plus page-specific assumptions, methodology, worked example, related-tool links, and a planner CTA.
- Five individually authored guide routes cover usable WOF, finished versus cut size, seam allowance, backing overage, and quilt yardage; each links to relevant tools and the planner.
- Generated-output inspection confirms 15 HTML routes, 15 unique titles/descriptions/headings and canonical paths, an XML sitemap containing all 15 routes, and static explanatory content before client scripts.
- A generated-HTML whitespace review found and resolved joined words around inline Astro links; the final scan reports no adjacent anchor/text joins.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 93 passing tests across 10 files, and a successful static build of all initial routes plus `sitemap.xml`.

Recommendation:

- Proceed to Milestone 9 after the required context reset.

### Milestone 9

MILESTONE DIVERGENCE REVIEW

Milestone: 9 — Analytics and privacy

Relevant agenda clauses:

- Track tool views/starts, generated results, planner edits and optimization, diagram views, advanced settings, print, share, and calculator-to-planner actions.
- Do not send personally identifying project content in analytics.
- Analytics and Search Console setup must be ready for V1 acceptance.

Relevant golden rules/tests:

- The analytics adapter is explicitly an engineering choice outside the locked quilting-domain behavior.
- Domain calculations stay independent from analytics, and analytics failures must never block usable results.
- No backend, account, runtime calculation service, or invasive tracking is permitted.

Observed divergence:

- None.

Reason:

- The implementation uses the locked event taxonomy plus the product-spec `tool_viewed` event, with a closed payload schema that contains only fixed action and tool identifiers. It adds no provider, cookie, user identifier, backend, or user-entered/calculated content.

Resolution:

- Record the typed event, provider-neutral sink, privacy, failure-containment, and Search Console configuration boundaries in `docs/decisions/milestone-9-analytics-privacy.md`.

Evidence:

- Planner wiring covers view/start, fabric and piece additions, successful optimization, rendered diagram, advanced settings, print, and share actions; calculator wiring covers view/start/completion, advanced settings, and successful add-to-planner actions.
- Calculator identifiers are checked against a fixed allow-list before any event is constructed. Event contracts have no arbitrary metadata field and exclude names, labels, notes, measurements, quantities, counts, units, and result values.
- The adapter catches provider exceptions; tests prove a throwing sink does not escape into product behavior.
- The shared static layout supports build-time Google Search Console verification and retains the explicit sitemap, canonical URLs, and crawl directives without loading a tracking provider.
- `npm run verify` reports zero Astro diagnostics, clean lint and formatting, 97 passing tests across 11 files, and a successful 15-page static build plus `sitemap.xml`; `git diff --check` passes.

Recommendation:

- Proceed to Milestone 10 after the required context reset.

### Milestone 10

MILESTONE DIVERGENCE REVIEW

Milestone: 10 — Full regression and launch readiness

Relevant agenda clauses:

- V1 must deliver the complete multi-fabric planner journey, seven standalone calculators, local-only persistence, useful static routes, accessibility, print, analytics/Search Console readiness, and no account requirement.
- V1 uses Astro static output, plain TypeScript domain logic, minimal vanilla client controllers, local calculations, and no application backend, database, authentication, server API, AI call, or cloud state.
- The release gate requires G01-G27, invariants, accessibility, performance, print, static SEO, cross-browser sanity, all acceptance criteria, no unresolved domain ambiguity, and explicit accounting for every difference from the crystallized agenda.

Relevant golden rules/tests:

- G01-G17 are defined by the authoritative golden contract; handoff section 34 explicitly adds mandatory supplementary fixtures G18-G27 without conflicting with the golden rules.
- Required invariants cover placement bounds/non-overlap/accounting/orientation, deterministic output, upward purchase bounds, impossible-input blocking, backing coverage, and HST output bounds.
- The 14 manual fixture categories cover identical pieces, exact/near WOF, rotation/directionality, mixed pieces, impossible pieces, finished-size conversion, zero and 5% safety, backing, binding, all three HST methods, and metric equivalence.

Observed divergence:

- No product, architecture, or domain divergence is present in the completed build.
- Release activation is not performed because no hosting target or public hostname has been selected; therefore public Search Console ownership and hosted GitHub Actions remain pending external configuration.
- The local cross-browser audit covers Chrome and Edge, both Chromium-family browsers; Firefox and Safari were unavailable in this environment.
- The share action sends a result summary through the browser Web Share capability and provides a copy fallback. It does not create a persistent share URL because V1 deliberately has no backend.
- React was not installed because the completed delegated vanilla controller remained maintainable; the product specification permits but does not require the single planner island.

Reason:

- Hosting, hostname ownership, Search Console ownership, and repository connection are deployment operations requiring user-selected external resources, not missing product implementation.
- The Web Share/copy behavior is the practical backend-free interpretation of the conditional share-link requirement and does not weaken the locked no-backend boundary.
- Browser-product coverage is real but engine-limited by locally installed software; all portable automated and generated-output contracts remain browser-independent.

Resolution:

- Provide `.env.example`, static `dist` output, sitemap/canonical verification, and documented deployment variables so activation requires no source change.
- Retain Firefox/Safari and public-origin verification as explicit post-deployment checks.
- Keep the no-React and no-backend decisions; neither introduces an acceptance failure.

Evidence:

- `npm run verify` reports zero Astro diagnostics, clean lint/formatting, 100 passing tests across 11 files, and a successful 15-page static build plus `sitemap.xml`.
- G01-G27 and every required invariant pass. Additional release tests cover exact-WOF rectangles, near-WOF pieces, and zero-safety behavior; a fixture trace review maps the remaining manual categories to G01-G13/G18 as applicable and confirms their hand-worked outputs.
- `npm run smoke:browser` passes in Chrome 150.0.7871.187 and Edge 151.0.4129.59. It exercises planner and calculator flows, multi-fabric/piece editing, keyboard skip navigation, dynamic labels, accessibility-tree names, contrast ratios, field-linked errors, persistence restore, copy/print/share/edit actions, privacy-safe analytics, SVG/text results, calculator transfer, print-media visibility, and valid generated PDFs.
- The 500-piece fallback completed and rendered in 36.2 ms in Chrome and 29.2 ms in Edge during the final run, emitted its bounded-strategy warning, and kept results usable.
- Static review confirms 15 HTML routes, 15 sitemap entries, 54,452 bytes of client JavaScript and 4,948 bytes of CSS in the local build, with no application API/backend transport in `src`.
- `npm audit` reports zero production or development dependency vulnerabilities. `scripts/check_context.ps1` and `git diff --check` are release handoff gates.

Recommendation:

- Activate deployment after the user selects the static host and public hostname; then run hosted CI, public-origin smoke/canonical/sitemap checks, Search Console verification, and Firefox/Safari sanity checks.

### Domain Correctness Remediation

MILESTONE DIVERGENCE REVIEW

Milestone: Domain correctness remediation (G28-G30 contract revision)

Relevant agenda clauses:

- Four-at-a-time HST sizing must derive geometry from the unfinished diagonal plus perimeter seam allowances and expose Standard/Trim-friendly modes.
- Borders and sashing must count joined WOF capacity after seam loss, with handling buffer modeled separately.
- Planner, backing, border, and sashing wording must distinguish calculated planning output from proven optimality or universal quilting advice.

Relevant golden rules/tests:

- Revised G12 plus G28-G29 lock small, representative, and large four-at-a-time HST geometry.
- G30 and the joined-strip minimality property lock seam-loss-aware WOF capacity.
- G02/G03/G04/G07/G08/G22/G23/G24/G27 remain regression gates for usable width, directionality, rotation precedence, and WOF behavior.

Observed divergence: None.

Reason:

- The implementation now matches the targeted domain correction memo without adding scope or an alternate calculation path.

Resolution:

- Added the shared `joined-wof.ts` primitive; migrated Borders and Sashing to separate handling buffer from join seam allowance; corrected HST contracts and UI terminology; exposed every backing candidate and lowest-yardage guidance; corrected heuristic/border/sashing copy; and synchronized the Golden Rules, Product Spec, and Codex Handoff.

Evidence:

- `npm run verify` passes with zero diagnostics, clean lint/formatting, 106 passing tests across 11 files, and a successful 15-route static build.
- Chrome and Edge smoke tests pass the planner plus affected HST, Backing, Borders, and Sashing calculator checks.
- `scripts/check_context.ps1` and `git diff --check` are final handoff gates.

Recommendation:

- Domain remediation is complete. Preserve G01-G30 and the new property/language checks as release gates.

### Production UX, Content, and SEO

MILESTONE DIVERGENCE REVIEW

Milestone: Production UX, Content, and SEO pre-launch pass

Relevant agenda clauses:

- Preserve the simple, beginner-first planner while exposing editable assumptions and deterministic, inspectable results.
- Keep meaningful content and discovery metadata in static Astro HTML with minimal client JavaScript.
- Preserve mobile, keyboard, print, privacy, and no-account behavior.
- Implement the supplemental production specification's trust, intent mapping, crawl hygiene, and recommendation-first result hierarchy without expanding quilting-tool scope.

Relevant golden rules/tests:

- Finished-to-cut conversion, usable WOF, rotation/directionality, safety allowance, and strict upward purchase rounding remain controlled by shared domain contracts.
- Cutting diagrams and instructions must project the optimizer's selected geometry rather than recalculate a layout.
- Errors block results; warnings preserve usable results and explain caveats.
- The practical optimizer remains deterministic and does not claim global optimality.

Observed divergence:

- The indexable route set expands from the 15 initial product routes to 18 by adding About, Methodology, and Corrections.
- A live correction submission channel remains deployment-blocked until the operator supplies a truthful monitored address.

Reason:

- The supplemental production specification explicitly requires the three trust functions. Static informational routes do not add a calculator, domain behavior, backend, account, or other deferred product capability.
- Inventing an operator identity or unmonitored contact address would violate the specification's truthfulness requirement.

Resolution:

- Record the three-route extension and explicit query map in `docs/decisions/milestone-8-static-seo-content.md`; include all three in normal navigation, canonicals, and the sitemap.
- Configure the correction link from `PUBLIC_CORRECTIONS_EMAIL` at deployment; until then, the page publishes the reproducibility checklist and correction policy while stating the blocker.

Evidence:

- The homepage uses the locked production H1, support copy, CTAs, and trust line. Shared calculator UX provides recommendation-first results, advanced summaries, local field errors, dynamic reasoning, worked examples, related links, and planner transfer.
- Planner first-use guidance, compact fabric/assumption summaries, finished-to-cut feedback, natural imperial formatting, shopping table, print date/project identity, warnings, optimizer-derived strip instructions, diagram legend/text alternative, and secondary efficiency detail are implemented without changing optimizer geometry.
- Static output includes About, Methodology, Corrections, 18 canonical sitemap entries, `robots.txt` with staging protection, a noindex 404, and visible-content-matched WebSite/BreadcrumbList/WebApplication JSON-LD.
- `npm run verify` passes with zero Astro diagnostics, clean lint/formatting, 109 tests across 11 files, and a 19-page static build (18 indexable routes plus 404).
- `npm run smoke:browser` passes in Chrome 150 and Edge 151, including route/crawl/404 checks, planner/calculator interactions, accessibility, field-local errors, persistence, bounded fallback, print-to-PDF, analytics privacy, and calculator transfer. The final 500-piece fallback rendered in 29.1 ms in Chrome and 31.3 ms in Edge.

Recommendation:

- The Production UX/Content/SEO package is implementation-complete. The subsequently authorized Launch & Growth package now governs the remaining pre-deployment audit, while staying subordinate to the locked V1 authority chain.

### V1.1 Milestone M0

MILESTONE DIVERGENCE REVIEW

Milestone: M0 — repository audit and baseline

Relevant agenda:

- V1.1 supersedes the planner-centered launch thesis with external cut-list compilation, exact project-local stock, joint allocation, purchase shortfall, independent pattern comparison, and consolidated execution.
- The revision must evolve the existing static Astro and deterministic TypeScript repository rather than rewrite proven infrastructure.
- Technical completion of the previous V1 is not launch permission for V1.1.

Relevant Golden fixtures:

- Preserve and verify G01-G30, including corrected HST G12/G28-G29 and joined-WOF G30.
- Reserve authoritative V1.1 G31-G45 for finite stock, purchase shortfall, pattern comparison, and the four new calculator contracts.

Observed divergence:

- Existing differentiation-overlay tests use identifiers G31-G35 for unrelated joint-versus-separate comparison cases, colliding with authoritative V1.1 fixture numbers.
- `orientationConstraint` is accepted and persisted but does not affect normalization or packing.
- `isWofStrip` disables rotation but does not independently resolve its crosswise extent to usable WOF.
- Current corrupt/incompatible persistence is removed rather than preserving safely recoverable fields with a user-visible migration issue.
- `npm run verify` stops at formatting because the supplied V1.1 documents and one pre-existing V2 document do not match repository Prettier output.

Reason:

- These behaviors belong to the completed V1 baseline and predate the V1.1 governing package. The fixture collision is nomenclature, while the orientation, WOF, and recovery findings are implementation defects against explicit V1.1 rules.

Evidence:

- `docs/architecture/v1.1-repository-audit.md` maps the current schema, optimizer, persistence, routes, calculators, tests, reusable modules, gaps, and conflicts.
- `npm run typecheck` and `npm run lint` pass; `npm test` passes 134 tests across 13 files; `npm run build` emits 19 pages.
- Source tracing confirms orientation is unused outside types/persistence/UI and WOF normalization only forces rotation false.

Impact:

- Finite-stock work cannot safely begin until fixture identifiers are unambiguous and orientation/WOF semantics are locked.
- The current fresh-bolt implementation remains reusable, but it cannot serve as the stock-aware reconciliation selector or migration schema unchanged.

Recommendation:

- Proceed to M1 only after the required context reset. Rename the legacy G31-G35 identifiers, add orientation/WOF regression tests, then implement the new schema and lossless migration while proving fresh-bolt-only equivalence.

### V1.1 Milestone M1

MILESTONE DIVERGENCE REVIEW

Milestone: M1 — schema migration and normalized project model

Relevant agenda:

- Evolve the existing repository rather than rewrite proven domain, presentation, and static-site infrastructure.
- Represent fabrics, external cut requirements, optional pattern references, and exact project-local stock in one versioned local project.
- Preserve valid old projects and corrected fresh-bolt behavior.

Relevant Golden fixtures:

- G01-G30 remain regression gates at their existing domain boundaries.
- Rotation precedence and orientation constraints must be enforced; WOF strips span usable WOF crosswise and never auto-rotate.
- V1.1 G31-G45 remain reserved for M2-M4. The older differentiation diagnostics are now D01-D05.

Observed divergence:

- None in the M1 contract. The current nested fabric-card editor remains temporarily in place through an explicit controller-local draft adapter; the project-level table/paste replacement is intentionally scheduled for M5.
- Repository-wide `npm run format` remains blocked by the supplied V1.1 bundle and a pre-existing V2 document that are outside M1 source formatting. Every M1-touched file passes targeted Prettier validation.

Reason:

- Combining the M5 interaction redesign with schema migration would enlarge the correctness boundary without improving the M1 domain/persistence proof. The adapters isolate the temporary UI shape and preserve future stock/pattern fields during current-form edits.

Evidence:

- Schema version 2 stores top-level fabric plans and cut requirements assigned by `fabricId`, with reserved stock and pattern fields.
- Valid version-0 and version-1 projects migrate without changing dimensions or losing names, notes, units, fabric assumptions, piece settings, or assignments; stock defaults empty and pattern fields remain absent.
- Corrupt/incompatible state is no longer deleted automatically, and valid V2 projects inside unknown numeric envelopes recover with an explicit issue.
- Repeated-piece and mixed-piece engines both enforce crosswise/lengthwise orientation; WOF normalization derives the crosswise extent from usable WOF.
- Typecheck and lint pass; 140 tests across 13 files pass; the 19-page static build passes; Chrome and Edge browser smoke passes planner persistence, calculator transfer into the V2 schema, accessibility, performance, mobile, analytics, and print checks.

Impact:

- M2 can add finite-stock allocation directly against stable `FabricPlan.stockPieces` and top-level requirements without another persistence migration.
- Stock and pattern inputs are modeled but not yet exposed or reconciled; public launch remains blocked.

Recommendation:

- Proceed to M2 after the required context reset. Implement deterministic finite-stock bins and bin-aware placements for G31, G34-G36, and G39-G40 without altering the fresh-bolt engine or beginning M3 purchase-shortfall/pattern comparison selection.

### V1.1 Milestone M2

MILESTONE DIVERGENCE REVIEW

Milestone: M2 — finite-stock optimizer

Relevant agenda:

- Treat project-local stock as exact physical rectangular geometry with crosswise width and lengthwise length.
- Jointly allocate requirements across multiple identifiable stock bins with bounded deterministic strategies.
- Preserve orientation, WOF, accounting, fabric identity, and performance invariants without using area as proof of fit.
- If purchase is disabled, return exact unmet requirements and do not fabricate a purchase.

Relevant Golden fixtures:

- G31 locks full stock coverage and zero purchase.
- G34 locks physical stock-bin identity.
- G35 locks geometric fit and rotation constraints over equal area.
- G36 locks WOF behavior in narrow remnants.
- G39 makes edited stock geometry authoritative over preset labels.
- G40 locks zero purchase and fresh-purchase-only safety guidance when stock fits.
- Required geometry, stock, purchase-zero, performance, and determinism properties apply.

Observed divergence: None.

Reason:

- The finite-stock subsystem implements only M2 physical-bin allocation. It exports validated alternative candidates for M3 but does not calculate a purchase shortfall, pattern comparison, integrated project result, diagram, or UI.

Resolution:

- Added stable physical-bin expansion, bin-aware placements, exact unallocated instances, deterministic practical leftover rectangles, five piece orders, three bin policies, two split directions, and a disclosed bounded fallback.
- Independently validate candidate accounting, dimensions/orientation, WOF extent, bounds, non-overlap, and fabric/bin identity before selection.
- Return exact zero purchase only for full coverage; return `null` purchase fields for stock-only shortfall so no purchased material is implied.

Evidence:

- G31, G34-G36, and G39-G40 plus accounting, geometry, identity, no-purchase, bounded-candidate, fallback, and determinism properties are automated in `tests/finite-stock-optimizer.test.ts`.
- Typecheck and lint pass; 152 tests across 14 files pass; the static build emits 19 pages; Chrome and Edge smoke pass all 18 indexable routes plus planner, calculator, persistence, analytics, accessibility, performance, narrow-mobile, and print checks.

Impact:

- M3 can reconcile every validated finite-stock assignment against the existing fresh-bolt optimizer and select lexicographically by raw additional purchase before secondary qualities.
- Stock fields remain unavailable in the current planner UI until the scheduled M5 redesign; public launch remains blocked.

Recommendation:

- Proceed to M3 only after the required context reset. Add purchased-bolt shortfall and independent pattern comparison for G32-G33 and G37-G38 without changing M2 physical-bin semantics.

### V1.1 Milestone M3

MILESTONE DIVERGENCE REVIEW

Milestone: M3 — purchase shortfall and pattern comparison

Relevant agenda:

- Jointly reconcile external cut requirements across exact project-local stock and an optional variable-length purchased bolt.
- Select validity and lower raw additional purchase before practical cutting, useful leftovers, waste, and deterministic tie-breaks.
- Keep optional pattern-stated yardage comparison independent of on-hand stock and current buy-now shortfall.
- Return an integrated per-fabric and project shopping result without adding a backend or alternate layout engine.

Relevant Golden fixtures:

- G32 locks the exact two-piece stock shortfall, 10-inch raw purchased layout, and 13.5-inch upward-rounded purchase.
- G33 locks safety to the purchased shortfall while preserving stock geometry.
- G37 locks the fresh pattern basis independently of complete stock coverage and zero buy-now.
- G38 locks the explicit not-like-for-like warning for known WOF mismatch.
- Purchase ordering/bounds, exact cross-bin accounting, fabric identity, purchase-disabled unmet results, pattern independence/language, and determinism properties apply.

Observed divergence: None.

Reason:

- M3 adds a separate integrated `reconcileProject` domain result but intentionally leaves the current controller and presentation on the fresh-bolt-only `planProject` contract. Switching shopping output before stock/purchase-bin projections are ready would expose contradictory results; the result redesign remains scheduled for a later milestone.

Resolution:

- Evaluate every validated M2 finite-stock assignment against the existing fresh-bolt optimizer, translate purchased placements back to original instance IDs, independently validate complete accounting, and select lower raw purchase before secondary qualities.
- Apply safety and upward purchase rounding only to the selected purchased-bolt raw length; preserve exact stock geometry and zero purchase when stock covers all cuts.
- Add a stock-free `freshFabricScenario`, informational pattern delta against fresh recommended purchase, exact WOF mismatch warning, and independent multi-fabric project aggregation.

Evidence:

- G32-G33 and G37-G38 plus raw-purchase precedence, no-stock equivalence, purchase-disabled unmet output, accounting/bounds, stock-independent comparison, multi-fabric isolation, validation, and determinism are automated in `tests/reconciliation.test.ts`.
- Typecheck and lint pass; 163 tests across 15 files pass; the static build emits 19 pages; Chrome and Edge smoke pass all 18 indexable routes plus planner, calculator, persistence, analytics, accessibility, performance, narrow-mobile, and print checks.

Impact:

- The normalized V1.1 project can now produce a complete domain-level shopping and allocation result while preserving the previous UI behavior until its bin-aware redesign.
- M4 can reuse finite-stock geometry for Pieces from Fabric and proceed with the four new calculator contracts; public launch remains blocked.

Recommendation:

- Proceed to M4 only after the required context reset. Implement Batting, QST, Flying Geese, and Pieces from Fabric for G41-G45, reusing shared domain primitives and the M2 finite-stock engine.

### V1.1 Milestone M4

MILESTONE DIVERGENCE REVIEW

Milestone: M4 — new calculator domain

Relevant agenda:

- Expand the standalone set to eleven calculators without changing the static-first architecture or duplicating shared calculation/packing logic.
- Add Quilt Batting, QST, Flying Geese, and Pieces from Fabric with beginner-readable assumptions and blocking validation where the locked method scope is not applicable.
- Reuse exact finite-stock geometry for Pieces from Fabric and preserve canonical millimetres, deterministic results, and bounded browser work.

Relevant Golden fixtures:

- G41 locks classic two-color QST Standard/Trim-friendly sizing and four-unit batch counts.
- G42 locks one-at-a-time Flying Geese dimensions and piece counts.
- G43 locks four-at-a-time Flying Geese dimensions and batch counts.
- G44 locks Batting overage and valid roll orientation.
- G45 locks practical 12-piece yield and non-overlapping finite-stock geometry.
- Calculator produced-count, geometry, validation, and determinism properties apply.

Observed divergence: None.

Reason:

- M4 implements domain contracts and tests only. Routes, forms, navigation, analytics, and visual projections remain scheduled for later UI/content milestones.

Resolution:

- Added explanation-ready Batting, QST, and Flying Geese result contracts with locked scope, both sizing modes where applicable, batch arithmetic, and field-specific validation.
- Added Pieces from Fabric as a normalizing adapter over the existing finite-stock optimizer, returning maximum practical yield, requested-fit status, placements, and leftover rectangles.
- Corrected finite-stock boundary comparisons with a scale-relative tolerance after exact converted dimensions exposed a binary floating-point equality failure; authoritative input dimensions remain unchanged.

Evidence:

- G41-G45 plus produced-count, invalid-ratio/input, batting-orientation/no-piecing, requested-fit, finished-to-cut, rotation precedence, geometry, and determinism properties are automated in `tests/v1.1-calculators.test.ts`.
- Typecheck and lint pass; 178 tests across 16 files pass; the static build emits 19 pages; Chrome and Edge smoke pass all 18 indexable routes plus planner, calculator, persistence, analytics, accessibility, performance, narrow-mobile, and print checks.

Impact:

- All eleven V1.1 calculator domain contracts now exist. M7 can add the four routes/controllers without introducing formulas or a second stock layout engine.
- M5 can proceed to the cut-list compiler and paste workflow; public launch remains blocked.

Recommendation:

- Proceed to M5 only after the required context reset. Implement the deterministic project-level cut-list compiler, safe paste preview/mapping, and desktop/mobile entry paths without changing the normalized project schema.

### V1.1 Milestone M5

MILESTONE DIVERGENCE REVIEW

Milestone: M5 — cut-list compiler and paste

Relevant agenda clauses:

- Replace fabric-owned piece subforms with one project-level rapid cut-list compiler that remains efficient for 20–40-row external patterns.
- Provide the desktop sequence `Fabric | Piece | Qty | Width | Height | Cut/Finished | More`, fast keyboard entry, sensible visible inheritance, duplicate, delete/undo where practical, and an efficient mobile path without horizontal-only interaction.
- Implement deterministic tab/newline spreadsheet paste through tokenization, known headers/positions, explicit fraction/unit parsing, validation, preview, fabric mapping, and confirmation. Never infer cut requirements from prose or silently correct ambiguous dimensions.
- Preserve schema-version-2 fabric assignment, cut/finished normalization, piece-level orientation/WOF controls, local-only data, and field-specific errors.

Relevant golden rules/tests:

- No new G fixture is assigned to M5; G01-G45 and D01-D05 remain unchanged at their domain boundaries.
- Cut-list compiler regressions cover decimals, mixed and Unicode fractions, explicit inch/centimetre/millimetre suffixes, documented headers and positional rows, deterministic exact-name matching, explicit unmatched-fabric mapping, malformed cells, arbitrary-prose rejection, column-count rejection, and confirmation gating.
- Static UI contracts cover the canonical top-level model, semantic headers, row actions, paste entry/preview hooks, and removal of nested piece subforms.
- Chrome and Edge smoke cover mapping and confirmed paste import, privacy leakage, associated labels, persistence, desktop planning, responsive labeled cards at 390×844, no page overflow, and existing result/print/performance behavior.

Observed divergence: None.

Reason:

- M5 changes project input and import compilation only. Stock/pattern controls and the switch from coherent fresh-bolt `planProject` results to reconciled stock-plus-purchase execution remain intentionally scheduled for M6 so input and result geometry do not disagree.

Resolution:

- Added a framework-independent deterministic cut-list compiler and exported it through the domain boundary.
- Removed `PlannerDraft`, `projectToDraft`, and `draftToProject`; the controller now reads, edits, saves, restores, and plans the canonical schema-version-2 project directly.
- Added a semantic cut-list table that becomes the same mounted labeled card rows on mobile, with last-row Enter/add, explicit fabric selection, visible dimensions, inherited fabric/mode context, duplicate, guarded delete/undo, and advanced rotation/orientation/WOF/notes.
- Added a modal paste workflow with documented columns, retained source text, highlighted preview failures, explicit unmatched-fabric selectors, disabled confirmation until every row is valid, and local confirmed import. No pasted value enters analytics.
- Fabric deletion now blocks while assigned cut requirements remain, making reassignment explicit instead of orphaning or silently moving rows.

Evidence:

- Typecheck and lint pass; 185 tests across 17 files pass; the static build emits 19 pages.
- Targeted Prettier checks pass for every M5 code, test, and documentation file supported by the formatter; the known aggregate formatting exception remains confined to supplied documents outside M5.
- Chrome and Edge smoke pass all 18 indexable routes plus planner paste/mapping, desktop keyboard flow, mobile cards, validation, persistence, analytics privacy, 500-piece fallback, calculator transfer, accessibility, diagrams, and print/PDF checks.

Impact:

- External pattern entry no longer requires navigating fabric-owned piece subforms, and UI/persistence/domain planning no longer maintain competing project shapes.
- M6 can add project-local stock/pattern inputs and reconciled execution output against stable fabric and requirement identities without redesigning cut-list entry.

Recommendation:

- Proceed to M6 only after the required context reset. Expose stock/pattern inputs, switch results to the M3 reconciliation contract, and project per-bin allocation through the existing presentation geometry without duplicating optimizer or diagram logic.

### V1.1 Milestone M6

MILESTONE DIVERGENCE REVIEW

Milestone: M6 — results, cutting execution, and print

Relevant agenda clauses:

- The governing workflow combines an external cut list, project-local stock, optional pattern-stated yardage/WOF, additional purchase, and one explainable execution plan.
- Product-spec sections 8-11 require purchase-only safety/rounding, the locked result hierarchy, placement-derived cutting instructions, and SVG from actual placements.
- Technical migration M6 requires stock allocation, purchase plan, comparison, print, and no duplicated layout engine.

Relevant golden rules/tests:

- G31-G35 and G37-G40 govern stock coverage/identity, purchase shortfall, purchase-only safety, pattern independence/WOF warnings, authoritative edited geometry, and zero purchase when stock fits.
- Existing geometry, accounting, orientation, WOF, purchase-bound, fallback, and determinism properties remain mandatory.
- Reconciled presentation tests prove exact source-coordinate/bin identity for selected stock and purchase placements, direct leftover projection, textual equivalence, and deterministic output.
- Chrome and Edge smoke cover editable stock/pattern entry, stale-result recalculation state, field-linked stock errors, stock/purchase diagrams, safety guidance, independent pattern comparison, privacy, accessibility, performance, mobile layout, and print PDFs.

Observed divergence: None.

Reason:

- M6 switches the entire planner result boundary from the coherent fresh-bolt compatibility result to `reconcileProject`; shopping, allocation, instructions, diagrams, and leftovers therefore remain views of one selected reconciliation.
- The richer required printable hierarchy increases the locked two-fabric fixture from five to eight pages and its one-fabric subset from three to five. This is required content growth, not a geometry or overflow defect; named diagram pages remain fitted and deterministic.

Resolution:

- Added immediately editable stock presets/custom remnants and optional pattern amount/assumed-WOF fields to each fabric card, persisted directly in schema version 2.
- Added a read-only reconciled-project presentation adapter that preserves exact selected material-bin placements, uses existing purchased strip instructions, supplies truthful piece-by-piece finite-stock instructions, and projects domain leftovers without allocating again.
- Replaced planner output with project status, shopping list, per-fabric decisions, independent pattern comparison, stock and purchased execution plans, leftover summary, assumptions/warnings, and methodology.
- Preserved valid results after edits with an explicit “Plan needs recalculation” state; invalid submissions retain field-specific errors and do not replace results.
- Kept analytics on the closed existing taxonomy and fresh planning diagnostic, with no stock labels, dimensions, pattern values, or other project content emitted.

Evidence:

- Typecheck and lint pass; 189 tests across 18 files pass; the static build emits 19 pages.
- Targeted Prettier checks pass for every formatter-supported M6 file.
- Chrome and Edge smoke pass all 18 indexable routes plus the M6 interaction, validation, privacy, accessibility, deterministic print/PDF, mobile, persistence, and 500-piece fallback checks.

Impact:

- A quilter can now enter real stock and a pattern reference, receive an exact buy-now decision, and execute the selected plan by named stock/purchased material without contradictory geometry.
- M7 can expose the four completed calculator contracts and revised content routes without reopening reconciliation or presentation architecture.

Recommendation:

- Proceed to M7 only after the required context reset. Reuse the shared calculator shell and completed domain contracts; add no duplicate formulas, allocator, backend, or mass-generated content.

### V1.1 Milestone M7

MILESTONE DIVERGENCE REVIEW

Milestone: M7 — content, SEO, and routes

Relevant agenda clauses:

- The acquisition surface is useful standalone quilting calculators and focused guides leading naturally to the deeper external-cut-list workflow.
- The V1.1 route contract requires eleven calculator tasks, ten foundational guide tasks, static pre-hydration value, unique metadata/canonicals, crawlable decision-based links, and no thin generated variants.
- Technical migration M7 requires static content, metadata, canonicals/sitemap, and internal links while permitting the established planner slug to remain when renaming would add needless migration risk.

Relevant golden rules/tests:

- G41-G45 lock Batting, QST, Flying Geese, and Pieces from Fabric behavior before UI exposure; all G01-G45 and D01-D05 remain green.
- Static contracts require all eleven calculator pages to include assumptions, methodology, worked examples, and related links before JavaScript.
- Reconciled presentation coverage proves Pieces from Fabric preserves its calculator-selected placement and leftover coordinates through SVG/text projection.
- Chrome and Edge smoke cover all 29 sitemap routes and exercise Batting output, QST batches, Flying Geese 2:1 validation, Pieces-from-Fabric capacity/diagram/text output, analytics allow-listing, responsive layout, and prior planner/print behavior.

Observed divergence: None.

Reason:

- The migration plan explicitly allows retaining `/fabric-cutting-planner/`; doing so avoids a hosting-specific permanent-redirect dependency while preserving one self-canonical planner URL.
- The two replaced V1 guide slugs remain static noindex canonical aliases because the deployment target is not yet selected and therefore cannot promise redirect semantics. They are excluded from navigation and sitemap.

Resolution:

- Added the four calculator pages/controllers over completed M4 domain contracts, including all required result fields and field-specific Flying Geese ratio validation.
- Added a read-only Pieces-from-Fabric diagram adapter over exact finite-stock placements, practical leftovers, and a complete text alternative.
- Expanded the closed calculator analytics identifier allow-list from seven to eleven without changing event payload shapes or emitting inputs.
- Updated the homepage proposition, planner title/static explanation, calculator index, site navigation, ten canonical guide tasks, guide index, How It Works, related links, canonicals, and explicit sitemap.
- Recorded the 29-route indexable surface and prohibited generated/query-state pages; preserved the three existing trust routes and structured-data constraints.

Evidence:

- Typecheck and lint pass; 191 tests across 18 files pass; the static build emits 32 pages: 29 indexable routes, two noindex canonical guide aliases, and the custom 404.
- Targeted Prettier checks pass for all formatter-supported M7 files.
- Chrome and Edge smoke pass all 29 indexable routes plus the four new calculator flows, crawl controls, planner, persistence, privacy, accessibility, performance, narrow-mobile, and print checks.

Impact:

- Every V1.1 calculator is now independently useful and crawlable, and the focused guide cluster routes users by real decisions rather than manufactured keyword variants.
- M8 can concentrate on the revised workflow's closed analytics taxonomy without reopening formulas, finite-stock geometry, or route structure.

Recommendation:

- Proceed to M8 only after the required context reset. Add only fixed-taxonomy events and allow-listed categorical fields; retain provider failure containment and forbid project content or arbitrary metadata.

### V1.1 Milestone M8

MILESTONE DIVERGENCE REVIEW

Milestone: M8 — analytics and validation events

Relevant agenda clauses:

- The analytics plan requires funnel coverage for planner setup, stock, cut-list paste, pattern references, calculation, sufficiency/shortfall, allocation, comparison, cutting-plan use, print, copy, calculator completion/error/print, and calculator-to-project transitions.
- Event properties must be fixed taxonomy values, booleans, allow-listed identifiers, or coarse bands; project content, measurements, exact quantities/results, pasted rows, and arbitrary metadata are forbidden.
- Analytics is optional and provider-neutral, and provider or browser-storage failures must never block calculations or actions.

Relevant golden rules/tests:

- All authoritative G01-G45 and legacy D01-D05 domain regressions remain green; analytics does not enter or influence domain selection.
- Contract tests enumerate the complete discriminated event union, reject non-allow-listed payload keys, verify controller wiring, distinguish copy from share, and contain sink and date-marker storage failures.
- Chrome and Edge smoke inspect actual emitted payload keys and fixed completion categories while exercising planner success/failure, stock, cut-list paste, pattern comparison, printing/copying, calculator success/error/printing, and calculator-to-project transfer.

Observed divergence: None.

Reason:

- The existing adapter already supplied the correct provider-neutral failure boundary, but the V1 controller taxonomy was too coarse for the V1.1 workflow. Extending the one typed adapter and emitting events only at controller-owned transitions preserves the architecture while making validation measurable.
- Repeat-use classification is implemented with the permitted local anonymous date/flag approach: one first-use date produces only a boolean category and cannot identify a person or reveal a project.

Resolution:

- Expanded the closed typed planner and calculator event union with fixed categories, booleans, and coarse fabric/requirement/stock/paste bands; no extensible metadata bag was introduced.
- Wired add/remove, paste outcomes, pattern presence, calculation outcomes, stock/purchase status, result-section views, print/copy, calculator errors, result printing, and project transfer at their owning interaction boundaries.
- Added a date-only `quilter:analytics-first-used-date` marker with contained storage failure and a boolean-only `returning_user` property.
- Corrected result-action semantics so shopping-list copy emits its own event and sharing is recorded only after successful native sharing.
- Retained provider-neutral DOM/data-layer delivery, Search Console build-time configuration, and fire-and-forget failure containment.

Evidence:

- Typecheck and lint pass; 193 tests across 18 files pass; the static build emits 32 pages: 29 indexable routes, two noindex canonical aliases, and the custom 404.
- Chrome and Edge smoke pass all 29 indexable routes plus closed-payload inspection, planner completion/failure categories, paste/stock/pattern actions, calculator completion/error/print/project transfer, accessibility, persistence, performance, narrow-mobile, and print/PDF checks.
- The 500-piece browser fallback rendered in 117.2 ms in Chrome and 110.8 ms in Edge during the final M8 gate.

Impact:

- The revised workflow can now be validated as a staged funnel without exposing the user's project, exact fabric facts, pasted cut list, calculations, or copied/shared text.
- M9 can use the closed event stream for regression and usability evidence without changing formulas, reconciliation, presentation geometry, or persistence.

Recommendation:

- Proceed to M9 only after the required context reset. Run the full validation protocol and target-user usability work against this fixed taxonomy; any new payload field requires a fresh privacy review and contract update.

### V1.1 M9 Automated Regression Checkpoint

Status: automated gate passed; human usability gate pending.

- Confirmed that the automated suite names every authoritative fixture G01-G45 with no missing identifier and retains the separate D01-D05 differentiation diagnostics.
- Typecheck and lint pass; all 193 tests across 18 files pass. Coverage includes normalization/conversions, purchase bounds, geometry/overlap/orientation, deterministic selection, finite stock, stock-plus-purchase reconciliation, pattern independence, calculator formulas, presentation equivalence, persistence migration/recovery, static content, analytics privacy, and controller contracts.
- Formatter checks pass for all implementation files, tests, scripts supported by Prettier, and routed architecture/decision/manual-test documentation. Supplied source documents outside the implementation output remain excluded from this scoped formatter gate.
- The dependency audit initially exposed transitive `nanoid` 3.3.17 through PostCSS. The lockfile now resolves the compatible patched 3.3.18 release; no direct dependency or architecture changed, and `npm audit --audit-level=high` reports zero vulnerabilities.
- The static build emits 32 pages. Chrome and Edge smoke pass all 29 indexable routes plus crawl/404, theme, planner, all calculators, persistence/migration, closed analytics payloads, accessibility names/labels/contrast/errors, 500-piece fallback, narrow mobile layout, diagrams/text alternatives, print behavior, and generated PDFs. The final fallback timings were 120.9 ms in Chrome and 123.1 ms in Edge.
- Added `docs/manual-tests/v1.1-m9-usability-gate.md`, which locks participant eligibility, a neutral no-facilitation script, a six-row deterministic source project, evaluator-only expected answers, privacy-minimal records, observation questions, and the exact 4-of-5 decision rule.
- Added `docs/manual-tests/v1.1-m9-guided-manual-validation.md` as the complete instructed-operator counterpart: exact project setup and paste/error fixtures, deterministic shopping/comparison/allocation oracles, semantic readback, stale-result and validation recovery, persistence, 390 × 844 responsive review, keyboard and 200% zoom, theme/copy/print, closed analytics inspection, severity classification, and a signed completion record. It deliberately does not claim target-user evidence.
- A pre-session rendered review found that the V1.1 shopping table was still a child of the legacy metric auto-fit grid. At desktop width it occupied one narrow column and stacked header/value words while leaving most of the summary empty; the one-column mobile breakpoint had masked the underlying mismatch. The summary now has one full-width content track, desktop columns retain readable widths, and each mobile shopping row becomes a labeled semantic card without horizontal scrolling. Browser smoke locks the computed desktop span/minimum cell width and mobile card/label/caption/overflow behavior in both Chrome and Edge.
- The same review found that V1.1's project-wide cut-list migration had retained the old absolute-positioned `.cut-row-more` treatment inside a narrow desktop action cell, despite the advanced piece fields predating V1.1 as an in-flow interaction. Each requirement now renders a six-column main row plus a full-width companion row. Its `<details>` contains only rotation, orientation, WOF, and notes; reset/duplicate/delete remain visible outside the disclosure on desktop and mobile. The controller reads and delegates across the paired rows by stable requirement identity. The correction also restores the WOF checkbox's neighboring-control alignment, removes the cut-list hint's extra bottom margin, and restores bottom spacing under Paste from spreadsheet and top spacing above Reset fabric defaults. Chrome/Edge lock collapsed action visibility and 44px targets, row pairing, six-column span, static/no-shadow expansion, mobile containment, field alignment, and the restored margins.
- Homepage visual review reduced all bounds of the responsive hero block-padding clamp by 40%, scoped its inherited bottom margin to 1rem, and removed the tools-section heading's top margin. Chrome and Edge smoke lock the resulting computed desktop spacing.
- Guided keyboard check I02 passed on 2026-08-29: Enter from the last cut-row input added a row and moved focus into it; delete, undo, and final delete restored the six-row fixture.
- Guided accessibility check I03 passed on 2026-08-29: at 200% browser zoom, core input and result content remained readable, operable, and unclipped with no information loss.
- Guided theme check J01 passed on 2026-08-29: both screen themes preserved distinguishable content, controls, errors, diagram patterns, and focus, and the explicit selection persisted after reload.
- Guided copy check J02 initially failed P2 on 2026-08-29 because clipboard text included its named per-fabric purchases but omitted the overall project decision. Screen and clipboard output had independently composed the same status concept. One shared formatter now derives both from the authoritative reconciliation summary; typecheck, lint, focused UI coverage, the 32-page build, and Chrome/Edge smoke pass with direct clipboard-text inspection.
- J02 human retest passed on 2026-08-29: the copied plain text now includes the authoritative one-of-two-fabrics purchase decision, Blue and Cream's correctly named buy amounts/raw lengths, and the aggregate count without markup.
- Guided print check J03 passed on 2026-08-29: human preview confirmed exactly seven populated, non-duplicated pages with no trailing blanks; light ink-safe styling; hidden screen controls/actions; unclipped shopping/decision content; complete isolated allocations; atomic legible diagram title/legend/dimensions/SVG; and no overlap or paint beyond printable edges.
- Guided analytics check K passed on 2026-08-31: an operator-captured local `dataLayer` stream contained only closed event names, fixed categories, booleans, and coarse bands while private sentinel project, note, and stock-label values remained in the fixture. No fabric/stock names, notes, exact measurements, quantities, yardage, placement geometry, or arbitrary metadata appeared. Replacing the collector's `push` method with an intentional throw did not interrupt recalculation or normal results, confirming provider-failure containment. The absent pre-test `dataLayer` was expected because the local build has no analytics provider configured; collection remains a deployment concern, while functional containment is the application contract.
- The guided M9 manual validation suite passed in full on 2026-08-31. Playwright MCP supplied the final 390 × 844 cut-list, shopping/results, and supplemental diagram artifacts in Chrome 151: the classic-scrollbar boundary had zero page overflow, all cut and shopping rows used their mobile card composition, action targets remained at least 44px without overlap, and diagrams/text alternatives stayed contained and available. A genuinely separate browser context then opened with no planner storage, blank project identity, one default fabric/cut row, and hidden results, completing G02 without treating a shared-storage tab as isolation. Evidence is under `docs/manual-tests/evidence/m9-guided-2026-08-31/`.
- M9 is complete under the divergence review below. Five real target-user sessions did not occur; the accepted substitute and its limitation are recorded without presenting browser automation or guided operation as external-user comprehension evidence.

MILESTONE DIVERGENCE REVIEW

Milestone: M9 — full regression and usability validation

Relevant agenda clauses:

- Launch requires Golden/domain correctness, the complete compound workflow,
  acceptable usability, privacy-safe analytics, and a later competitive gate.
- Evidence outranks agenda and implementation convenience; conflicts must be
  flagged and revised deliberately rather than hidden.

Relevant golden rules/tests:

- G01-G45 and D01-D05 pass at their domain boundaries.
- The complete automated, property, build, installed-browser, accessibility,
  privacy, persistence, responsive, and print gates pass.
- The guided operator suite passed every deterministic and human-judgment check
  with no open P0-P3 issue after shared-boundary corrections and retests.

Observed divergence:

- The recommended five-target-user, four-of-five unassisted study was not run
  because eligible target quilters were unavailable.

Reason:

- The user explicitly directed that the product be redesigned and exhaustively
  validated as the practical substitute rather than remain indefinitely blocked
  on unavailable recruitment.

Resolution:

- Accept the completed redesign, automated regression, installed-browser audit,
  and passing guided operator suite as the M9 completion evidence.
- Preserve the limitation: no U01-U05 study occurred, and the evidence does not
  prove external target-user comprehension.
- Retain the five-user protocol as an optional future study rather than a pre-M10
  dependency, and proceed to M10.

### V1.1 Milestone M10

Status: complete; competitive launch gate PASS.

- Executed all five cases from
  `docs/v1.1/06_COMPETITIVE_BENCHMARK_GATE.md` against the current V1.1 domain
  build. C1 jointly placed 12 mixed pieces in 8 inches raw and a 1/4-yard
  purchase. C2 retained a fat quarter, custom remnant, and partial-yard bin,
  placed 21 of 36 pieces in those bins, and allocated the remaining 15 to a
  10-inch raw / 3/8-yard purchased plan. C3 kept stock, fresh-fabric, pattern,
  WOF-warning, and buy-now semantics separate. C4 preserved directional
  placement across stock and purchase. C5 compiled 20 rows / 80 pieces across
  four independent fabrics with no unallocated instance.
- Refreshed QuiltSandwich, Quilt Geek, Gibson Threads, NiftyFifty, The Quilters
  Retreat, PreQuilt, QuiltButler, and Quiltler from current first-party public
  product/help/store evidence. Current app-only or paywalled behavior that could
  not be executed was retained as Unknown rather than scored Absent.
- Discovered and added ScrapFit Production v1. It materially strengthens the
  exact-remnant alternative by supporting mixed required pieces, multiple
  rectangular or irregular remnants, defects, grain/rotation constraints, and
  explicit unplaced output. It does not provide bolt purchase shortfall,
  pattern comparison, or one combined stock-plus-purchase execution plan, so it
  is a strong C2/C4 partial rather than a same-job replacement.
- The Quilters Retreat remains a strong direct C1 alternative and can optimize
  multiple fresh-bolt piece sets across sets. QuiltSandwich remains the broadest
  project/shopping alternative, but its own documentation says different piece
  calculations are independent and require manual review of excess, while its
  on-hand state is an amount rather than exact multi-bin geometry.
- No automatic blocker applies: no competitor was found to complete exact
  multi-remnant stock plus joint external cut list plus bolt shortfall plus
  consolidated execution comparably; QuiltClarity does not require more design
  reconstruction for its governed start state; results do not require manual
  piece-group scrap reconciliation; stock fit remains geometric; and no
  correctness issue surfaced.
- Current website claims match the observed implementation. Copy describes the
  compound workflow and practical optimization without claiming that
  cross-group planning is unique or that the heuristic is globally optimal.
- The full report, source URLs, case evidence, descriptive scores, alternative
  user boundaries, and limitations are recorded in
  `docs/launch/v1.1-m10-competitive-launch-gate-2026-08-31.md`.

MILESTONE DIVERGENCE REVIEW

Milestone: M10 — competitive launch gate

Relevant agenda clauses:

- The governing job starts from external cut requirements and exact real fabric
  availability, without requiring digital quilt reconstruction.
- The reason-to-win is the integrated compound workflow: fast cut-list entry,
  joint planning, optional pattern comparison, exact finite stock, purchase
  shortfall, and one executable plan.
- Evidence outranks the agenda, and launch must stop if current competitors
  complete the same target job comparably without a material residual advantage.

Relevant golden rules/tests:

- G01-G45 and D01-D05 pass at their domain boundaries.
- C1-C5 were executed against the current build, including exact bin identity,
  instance accounting, orientation, purchase bounds, pattern independence,
  multi-fabric isolation, and long-list compilation.
- Typecheck and lint pass; 196 tests across 18 files pass; the static build emits
  32 pages; the installed Chrome/Edge audit passes all 29 indexable routes,
  planner/calculator, persistence, analytics, accessibility, responsive, and
  print/PDF checks. The 500-piece fallback rendered in 128.6 ms in Chrome and
  139.9 ms in Edge.

Observed divergence: None.

Reason:

- The current competitive evidence narrows rather than invalidates the product
  claim. Cross-group fresh-fabric optimization and exact remnant nesting each
  have strong alternatives, but no reviewed product combines them with exact
  stock-aware bolt shortfall, independent pattern comparison, direct external
  list entry, and consolidated execution.

Resolution:

- Record M10 PASS without an exclusivity claim or scope expansion.
- Preserve Unknown scores for unexecuted app-only/paid behavior and preserve the
  M9 external-user-evidence limitation.
- Move to the separately recorded guides-overhaul checkpoint. Do not resume
  domain/brand or deployment work until that overhaul and the following
  continuation-document reconciliation are complete.
