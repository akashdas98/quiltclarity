# Product and Runtime Boundaries

## Product Shape

The main V1.1 workflow is: compile an external project cut list, define fabrics and exact project-local stock, optionally enter pattern yardage, jointly reconcile stock and purchased fabric, inspect the shopping shortfall and executable cutting plan, then print or save locally. Standalone calculators reuse the same domain and finite-stock primitives where applicable.

## Layer Responsibilities

- Astro owns routes, static content, metadata, and page shells.
- The shared Astro shell owns early light/dark theme selection and its accessible switch; theme handling changes presentation tokens only and never enters domain, planner, calculator, analytics, or diagram geometry contracts.
- Framework-independent TypeScript owns normalization, validation, formulas, optimizer candidates, placement validation, scoring, purchase rounding, and structured explanations.
- Framework-independent presentation TypeScript owns read-only SVG, textual diagram, and cutting-instruction projections from completed domain results.
- Vanilla client controllers own planner and calculator form translation, interaction state, local persistence calls, and rendering of returned result contracts.
- React is not installed. A future change may replace only the planner controller with the single permitted island when measured state complexity justifies it; that change requires a divergence review.
- SVG rendering projects placements supplied by the optimizer with one uniform scale; it never normalizes pieces or chooses/recomputes a layout.
- A versioned storage adapter owns `localStorage` serialization, migration, and corrupt-state recovery.
- An analytics adapter emits privacy-safe events without blocking product behavior.
- `src/lib/help` owns a controlled definition/link registry. Astro and vanilla
  controllers may project those entries, but help content may not calculate,
  mutate domain results, or hide correctness-critical warnings. Each trigger is
  a plain primary-color question mark grouped with the final label word while
  retaining a semantic 44px-target button and topic-specific accessible name.

## Runtime Boundary

V1.1 must deploy to static hosting and remain functional without application-server state. Astro build-time behavior is allowed; runtime APIs, server calculations, databases, authentication, and cloud project storage are not.

Playwright Core, PDF.js, and `@napi-rs/canvas` are test-only dependencies. Browser smoke rebuilds the static output, launches the locally installed Chrome/Edge executable, generates the browser's clean paginated PDF, validates that each diagram title, wrapped legend, and SVG remain one atomic page unit, checks extracted text/page geometry, and raster-scans painted bounds against the declared print-safe box. None ships an application runtime service or enters planner/domain code.

## Dependency Direction

UI, persistence, visualization, and analytics may depend on domain contracts. The domain engine must not depend on those outer layers. Calculator formulas should not be reimplemented in page components.

## Current UI Baseline and V1.1 Migration Contract

- Astro emits the home page, retained `/fabric-cutting-planner/` shell, calculator index, and all eleven calculator forms plus explanatory copy as static HTML. Batting, QST, Flying Geese, and Pieces from Fabric use the shared calculator controller and completed domain contracts.
- Browser controllers convert displayed inches/centimetres and yards/metres to canonical millimetres before calling domain contracts; they do not contain quilting formulas, purchase rounding, normalization, optimization, or diagram layout logic.
- The planner controller edits schema-version-2 top-level fabrics and cut requirements directly. Each requirement uses one semantic six-column input row followed by one full-width in-flow companion row; only its advanced fields are expandable, while reset/duplicate/delete remain visible. The paired rows become a labeled joined card on mobile. Add/duplicate/delete/undo and advanced-field actions remain delegated without owning domain formulas, and no viewport uses an absolute-positioned row-action popup.
- Fabric cards expose editable project-local stock presets/custom rectangles and optional pattern amount/WOF fields while storing canonical millimetres. Preset labels never override edited physical dimensions.
- `src/lib/domain/cut-list-compiler.ts` owns deterministic tab-separated/CSV format detection and tokenization, standard quoted CSV fields, known header/position matching, explicit fraction/unit parsing, validation, and confirmed requirement compilation. The controller owns preview and explicit unmatched-fabric mapping; neither layer parses prose or imports before confirmation.
- The planner controller permits an empty cut list as a transient editable state so a starter row can be removed before manual entry or import. It owns the empty-state and undo interaction; project validation still blocks calculation until a cut requirement exists.
- Cut-row validation remains controller presentation over domain errors: desktop groups field-prefixed messages in the affected row's single full-width error region; mid-width cards align each unprefixed message beneath its control; and narrow cards keep the unprefixed message beneath the stacked full-width control. The controller removes only an edited field's linked stale state and clears all residual validation state before successful results receive focus; no validation rule is duplicated in CSS or the view.
- Planner input/result semantics retain their existing fieldset, section, article, table-row, and disclosure containers at every width. One `planner-page` wrapper owns the centered 64rem width for the intro, helper, form, results, and supporting content; children do not set competing width caps. Presentation CSS keeps four-sided card chrome/padding on first-level Project, Fabric, Cut requirements, summary, and per-fabric result groups; nested stock/cut-option/allocation/comparison/text-plan containers use top separators, transparent backgrounds, and zero side padding so semantic depth does not consume horizontal content width.
- V1.1 controllers expose project-local stock, optional pattern references, joint reconciliation, buy-now results, per-bin allocation, and placement-derived instructions without adding calculation logic to the UI.
- The planner keeps a valid prior result visible after edits and marks it “Plan needs recalculation”; only an explicit calculation replaces it. Reconciled output follows the locked project-status, shopping, fabric-decision, stock, purchase, instruction/diagram, leftover, assumptions/warnings, and methodology hierarchy.
- Calculator controllers call the standalone contracts and may transfer compatible structured requirements to the locally saved project without sending user data to a server.
- Print, copy, and share actions use browser capabilities and remain non-blocking when unavailable.

## Static Content and Discovery Contract

- Astro emits 38 indexable V1.1 product/content/trust routes as useful static
  HTML: the product surface, eleven calculators, the learning/workflow/reference
  Guides system, How It Works, About, and Methodology. Feedback at `/corrections/`
  remains accessible but noindex while its system is coming soon. Two retired
  guide slugs remain noindex canonical aliases. There are no numeric,
  tooltip-per-key, or keyword-generated variants.
- Every route receives a unique title, description, task-focused heading, and pathname-derived canonical from the shared layout. `src/lib/site-identity.ts` owns the QuiltClarity name and purchased `https://quiltclarity.com` default. `SITE_URL` can override the build origin; staging must retain its noindex configuration.
- Calculator pages keep the usable form near the top and statically include assumptions, methodology, a worked example, related links, and a planner CTA without reimplementing domain calculations.
- `sitemap.xml` explicitly lists all 38 indexable routes, omits the coming-soon Feedback route, and uses the same configured origin as canonical links; `robots.txt` publishes that sitemap and can disallow staging through `PUBLIC_ROBOTS_NOINDEX`.
- The shared layout emits restrained `WebSite`, `BreadcrumbList`, and `WebApplication` JSON-LD plus index/follow guidance, and may include a Google Search Console verification token from `PUBLIC_GOOGLE_SITE_VERIFICATION`; these are deployment/discovery metadata, not application data.
- Feedback at `/corrections/` is a static coming-soon page and accepts no submissions. The [owner-approved deferral](../decisions/v1.1-feedback-system-deferral.md) moves the Feedback System to V2; V1.1 has no feedback inbox environment variable or launch dependency.

## Analytics Contract

- `src/lib/analytics` owns the fixed event names, allow-listed calculator identifiers, provider-neutral browser sink, and failure containment.
- V1.1 expands only the closed, typed taxonomy needed for stock, cut-list paste, pattern comparison, reconciliation, shopping, and allocation validation. Free-text project content and arbitrary metadata remain forbidden.
- Guide and help measurement adds only allow-listed guide slugs, guide
  categories, help keys, and fixed actions; definitions, project content, field
  values, and arbitrary URLs never enter event payloads.
- Event payloads contain only an action name and, where required, fixed tool identifiers, booleans, fixed completion/error categories, or coarse allow-listed count/outcome bands. They never contain project names, fabric names, piece labels, notes, measurements, quantities, exact counts, exact calculated values, pasted/copied/shared content, or arbitrary metadata.
- The browser sink dispatches `quiltclarity:analytics` and appends to an existing `window.dataLayer` when one has been deliberately configured. QuiltClarity does not install a tracking provider or make an analytics network request itself.
- Controller calls are fire-and-forget. Missing providers and thrown sink failures cannot block calculation, optimization, printing, sharing, or local persistence.

## Local Persistence Contract

- `quiltclarity:planner-state` stores only the latest planner project in a `{ schemaVersion, project }` JSON envelope; schema version 2 is the current V1.1 contract.
- The adapter accepts structurally sound editable state, including values that may not yet pass calculation validation, so an in-progress form can be restored.
- Valid version-0 and version-1 nested projects migrate to version 2 while preserving safe fields, adding empty stock arrays, leaving pattern references absent, and retaining corrected fresh-bolt behavior. Restore failures preserve the raw local value and return a user-visible status rather than deleting it; structurally valid V2 projects in unknown numeric envelopes are recovered with an explicit issue. Unavailable browser storage remains contained and cannot block calculations.
- The retired pre-M5 nested draft adapters are no longer part of the runtime. UI editing, calculator transfer, persistence, and planning share the canonical top-level project shape.
- The adapter has no network, account, cloud, analytics, Astro, React, or domain-calculation responsibility.
- `quiltclarity:theme` is a separate unversioned presentation preference containing only `light` or `dark`. Missing or invalid values fall back to `prefers-color-scheme`; storage failures leave the active page usable, and an explicit switch choice persists locally without entering analytics.
- `quiltclarity:analytics-first-used-date` is a separate date-only analytics marker used solely to derive a boolean returning-user category across calendar days. It contains no identifier or project data; storage failures return the non-returning category and cannot block tool use.
- Legacy `quilter:*` keys are read only when their current key is absent and supported state is copied locally. A valid legacy theme remains applied even if copying fails; project reset clears both namespaces. Corrupt project values are retained and current namespace precedence is preserved. The [identity activation decision](../decisions/site-identity-activation.md) owns the compatibility contract.

## Deferred Scope

Accounts, backend services, paid tiers, full quilt design, uploads, arbitrary polygons, AI, pattern generation, permanent stash inventory, and community features require deliberate revision of the V1.1 product specification.
