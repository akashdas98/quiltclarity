# V1.1 Guides and Contextual Help Manual Tests

**Execution date:** 2026-09-01  
**Build:** local production build from base commit `1f2901a` plus the uncommitted
Guides/help checkpoint  
**Technical environments:** installed Chrome and Edge on Windows; 1200 × 900
desktop; 390 × 844 touch emulation; keyboard-only paths; generated PDFs  
**Owner environment:** Chrome on a computer, fresh private window, 2026-09-30;
viewport and input method not reported. Local development site on port 4322,
base commit `1f2901a3db3fcc663d004c64a3c282116fea6b22` plus the uncommitted
Guides/help working tree. No screenshot or immutable working-tree snapshot was captured.

This is the repository execution record required by
`docs/v1.1_GUIDES_HELP/09_MANUAL_TEST_PLAN.md`. Each row supplies the required
ID, area, route, viewport/device, preconditions, steps, expected result, status,
evidence/notes, and last checked build. `PASS` means Codex executed a technical
or browser-observable check. It does not claim independent novice comprehension.

## Guides and novice learning

| ID     | Area                  | Route                               | Viewport/device              | Preconditions             | Steps                                                    | Expected                                                                             | Status           | Evidence/notes                                                                                                        | Last checked commit/build                   |
| ------ | --------------------- | ----------------------------------- | ---------------------------- | ------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| MT-G01 | Learning hub          | `/guides/`                          | Chrome + Edge desktop/mobile | Production build          | Open and inspect categories and primary paths            | Start Here, Quick Start, tutorial, workflows, and reference are distinct             | PASS             | Browser harness asserts the three groups and both primary links; source review confirms learning-first card hierarchy | `1f2901a` + Guides working tree, 2026-09-01 |
| MT-G02 | Quick Start           | `/guides/getting-started/`          | Chrome + Edge desktop/mobile | Clean planner state       | Follow the worked Blue-fabric example into planner       | Project, fabric, cuts, Buy now, and cutting plan are all taught                      | PASS (technical) | Exact example and planner CTA reviewed; final comprehension remains gated by MT-U01/U02                               | Same build                                  |
| MT-G03 | Tutorial order        | `/guides/project-planner-tutorial/` | Source + browser             | Production build          | Follow all numbered sections                             | Sequence matches planner from setup through print                                    | PASS             | Thirty ordered sections mirror current planner DOM and result order                                                   | Same build                                  |
| MT-G04 | Field education       | Tutorial                            | Source review                | Current planner labels    | Review each field section                                | Meaning, entry/default, consequence, and examples are sufficient                     | PASS             | Stable field anchors cover project, fabrics, WOF, stock, cuts, pattern, safety, and rounding                          | Same build                                  |
| MT-G05 | Result education      | Tutorial                            | Source review                | Current result labels     | Review result sections                                   | Pattern, fresh plan, Buy now, allocation, layout, cuts, safety/rounding are distinct | PASS             | Tutorial and contextual registry use the same controlled concepts                                                     | Same build                                  |
| MT-G06 | Sequential navigation | Guide sequence                      | Chrome + Edge                | Production build          | Traverse Previous/Next, Back to Guides, and browser Back | Logical progression with no dead end                                                 | PASS             | Normal anchors and browser history were exercised; route/link tests cover continuity                                  | Same build                                  |
| MT-G07 | Direct entry          | Tutorial/workflow/reference routes  | Chrome + Edge                | No prior guide navigation | Open deep URLs directly                                  | Page is self-contained with tool CTA and next action                                 | PASS             | Browser harness opens exact tutorial anchor directly; static route/content tests cover every guide class              | Same build                                  |

## Planner contextual help

| ID | Area | Route | Viewport/device | Preconditions | Steps | Expected | Status | Evidence/notes | Last checked commit/build |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MT-H01 | Usable WOF | Planner | Chrome + Edge, keyboard/mouse | Planner loaded | Open `Help: Usable WOF`; follow Learn more | Concise definition, nominal-width distinction, exact anchor | PASS | Browser asserts definition text and `/guides/project-planner-tutorial/#usable-wof` | Same build |
| MT-H02 | Cut vs Finished | Planner | Source + browser | Cut row present | Open both size concepts | Seam-allowance consequence and exact guide link are clear | PASS | Registry and planner mapping reviewed; links covered by registry tests | Same build |
| MT-H03 | Purchase safety | Planner/results | Source + domain tests | Stock-only and shortfall fixtures | Open help and calculate both cases | Safety affects purchase only and never grows owned stock | PASS | Text states boundary; G31–G45/reconciliation tests retain zero-purchase behavior | Same build |
| MT-H04 | Pattern says | Planner/results | Source + browser | Pattern reference entered | Open help | External reference is informational, not an error claim | PASS | Registry definition and exact tutorial anchor reviewed | Same build |
| MT-H05 | Fresh-fabric plan | Results | Source + browser | Valid plan | Open help | Hypothetical all-new scenario remains separate | PASS | Dynamic result help comes from controlled registry; reconciliation remains unchanged | Same build |
| MT-H06 | Buy now | Results | Source + browser | Partial stock fixture | Open help | Stock-aware shortfall is distinguishable | PASS | Controlled result help and Quick Start 3/8 yd example reviewed | Same build |
| MT-H07 | Practical optimization | Results | Source + browser | Valid optimized plan | Open help | Practical/deterministic, no global-minimum claim | PASS | Registry explicitly states bounded deterministic heuristic | Same build |
| MT-H08 | Stock preset | Planner | Chrome + Edge + domain tests | Add fat quarter | Inspect/edit dimensions and calculate | Preset is editable convenience; edited geometry is used | PASS | Existing planner smoke and finite-stock tests pass; help mapping is present | Same build |

## Help interaction and accessibility

| ID | Area | Route | Viewport/device | Preconditions | Steps | Expected | Status | Evidence/notes | Last checked commit/build |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MT-A01 | Pointer/touch | Planner | Mouse + 390 × 844 touch emulation | Help trigger visible | Activate with click/touch | Both open without hover | PASS | Chrome/Edge desktop and touch-emulated harness paths pass | Same build |
| MT-A02 | Keyboard | Planner | Keyboard only | Focus help trigger | Activate, read, press Escape | Visible focus; open/close; focus returns | PASS | Browser asserts `aria-expanded`, Escape close, and trigger focus restoration | Same build |
| MT-A03 | Accessible names | Planner/calculators | DOM inspection | Help controls rendered | Inspect accessible names | Topic-specific `Help: …` names | PASS | Plain `?` marks retain topic-specific `aria-label`; tests reject unlabeled generic controls | Same build |
| MT-A04 | Mobile fit | Planner | Chrome + Edge 390 × 844 touch | Narrow viewport | Open help near viewport edge and result/field positions | Popover contained, closeable, control unobstructed | PASS | Browser asserts clamped bounds, 44 × 44 trigger, transparent mark, and a non-breaking final-word tail | Same build |
| MT-A05 | Progressive disclosure | Planner/results | Source review | JavaScript delayed/available | Review critical warnings and help | Essential correctness is visible outside popovers | PASS | Existing inline errors/warnings remain canonical; help adds definitions only | Same build |
| MT-A06 | Deep-link visibility | Tutorial anchors | Chrome + Edge | Direct URL with hash | Open exact anchors | Target heading is visible below header | PASS | Browser asserts `#usable-wof`; CSS gives anchored sections scroll margin | Same build |

## State, compiler, and project results

| ID | Area | Route | Viewport/device | Preconditions | Steps | Expected | Status | Evidence/notes | Last checked commit/build |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MT-S01 | Learn-more state | Planner → tutorial → planner | Chrome + Edge | Enter project name/data | Follow Learn more; browser Back | Entered state remains | PASS | Browser asserts saved project name after round trip | Same build |
| MT-S02 | Refresh persistence | Planner | Chrome + Edge | Valid persisted project | Refresh | Current versioned persistence behavior remains | PASS | Existing isolated-session and refresh smoke paths pass | Same build |
| MT-P01 | Large manual entry | Planner | Desktop keyboard | Empty project | Create/edit at least 20 requirements; add/duplicate/delete | Table remains usable with sensible keyboard paths | PASS | Existing controller/browser coverage exercises dense rows, Enter/add, duplicate, delete/undo; guide changes did not alter row controller | Same build |
| MT-P02 | Paste import | Planner | Chrome + Edge | Tabular fixture | Paste valid/malformed/unmapped rows; confirm | Preview, errors, mapping, and import behave correctly | PASS | Existing compiler tests and browser CSV/import audit remain green | Same build |
| MT-P03 | Mobile editing | Planner | 390 × 844 touch | Cut row present | Add/edit/duplicate rows | Labeled cards; no page-level horizontal dependency | PASS | Existing mobile smoke verifies labeled responsive rows and containment | Same build |
| MT-R01 | Stock-only result | Planner | Domain + browser | Finite stock covers all cuts | Calculate | No purchase; correct allocation/safety note | PASS | G31–G45 and reconciliation regression suite pass | Same build |
| MT-R02 | Stock shortfall | Planner | Domain + browser | Stock covers part | Calculate | Allocation and Buy now shown; fresh plan separate | PASS | Quick Start fixture and authoritative reconciliation tests pass | Same build |
| MT-R03 | Three-way comparison | Planner | Browser/source | Pattern + stock + shortfall entered | Calculate and inspect result | Pattern says, Fresh-fabric plan, Buy now remain distinct | PASS | Result hierarchy and tutorial use three separate labels/contracts | Same build |
| MT-R04 | Directional fabric | Planner | Domain + browser | Directional fabric enabled | Calculate and inspect help/layout | No illegal rotation; constraint explained | PASS | Orientation property/golden tests remain green; mapped help present | Same build |
| MT-R05 | Layout consistency | Planner/print | Browser + presentation tests | Valid result | Compare SVG, text, and instructions | All derive from the same placements | PASS | Architecture unchanged; presentation and browser/PDF checks pass | Same build |

## Calculator contextual education

| ID | Area | Route | Viewport/device | Preconditions | Steps | Expected | Status | Evidence/notes | Last checked commit/build |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MT-C01 | Fabric Yardage | `/calculators/fabric-yardage/` | Chrome + Edge/source | Production build | Inspect inputs/results/help links | Important concepts are explained and linked | PASS | Controlled field/result mappings plus calculator smoke pass | Same build |
| MT-C02 | Backing | `/calculators/backing/` | Chrome + Edge/source | Production build | Check overage, width, join SA, option wording | Least-fabric wording is conditional and assumptions clear | PASS | Registry mappings and static content reviewed; domain/browser tests pass | Same build |
| MT-C03 | Batting | `/calculators/batting/` | Chrome + Edge/source | Production build | Edit overage/roll width and inspect help | No unsupported pieced-batting claim | PASS | Field mappings/content and calculator result audit pass | Same build |
| MT-C04 | Binding | `/calculators/binding/` | Chrome + Edge/source | Production build | Inspect method inputs and assumptions | Scope and assumptions visible/helped | PASS | Calculator mapping and static content reviewed | Same build |
| MT-C05 | HST | `/calculators/hst/` | Chrome + Edge/source | Production build | Inspect sizing modes and batch result | Standard/Trim-friendly only; yield explained | PASS | Current labels and calculator tests pass; no stale Exact option | Same build |
| MT-C06 | QST | `/calculators/qst/` | Chrome + Edge/source | Production build | Inspect sizing modes and scope | Standard/Trim-friendly and scope clear | PASS | Current content/help mapping and result audit pass | Same build |
| MT-C07 | Flying Geese | `/calculators/flying-geese/` | Chrome + Edge/source | Production build | Inspect ratio, method, mode, yield | No false no-waste claim | PASS | Static content, mappings, and domain tests reviewed | Same build |
| MT-C08 | Block Count | `/calculators/block-count/` | Chrome + Edge/source | Direct search entry | Use calculator and read result | Meaning sufficient without prior guide | PASS | Static-first explanation and browser calculator audit pass | Same build |
| MT-C09 | Borders | `/calculators/borders/` | Chrome + Edge/source | Production build | Inspect scope and joined-WOF help | Scope/join behavior explained | PASS | Shared joined-WOF contract retained; mapped help reviewed | Same build |
| MT-C10 | Sashing | `/calculators/sashing/` | Chrome + Edge/source | Production build | Inspect scope | No-cornerstone/no-outer-sashing boundary is clear | PASS | Static content/help mapping reviewed; domain tests pass | Same build |
| MT-C11 | Pieces from Fabric | `/calculators/pieces-from-fabric/` | Chrome + Edge/source | Production build | Exercise fit/yield, direction, diagram | Geometry and contextual explanation agree | PASS | Reuses finite-stock geometry; mapping, diagram, and calculator smoke pass | Same build |

## Consistency, print, SEO, and responsive/browser

| ID | Area | Route | Viewport/device | Preconditions | Steps | Expected | Status | Evidence/notes | Last checked commit/build |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MT-X01 | Terminology | App + guides | Repository search | Current source | Search controlled terms and deprecated wording | Current names are consistent | PASS | Source review and guide tests lock current labels | Same build |
| MT-X02 | Registry links | All registered help links | Build + route tests | Registry loaded | Resolve every Learn more path/hash | No 404; correct topic/anchor | PASS | Registry test validates every href against source routes and tutorial IDs | Same build |
| MT-X03 | UI/tutorial labels | Planner + tutorial | Source review | Current UI | Compare tutorial names with controls/results | No stale labels | PASS | Shared controlled vocabulary and direct source comparison pass | Same build |
| MT-PR01 | Project print | Planner print result | Chrome + Edge PDF | Valid project result | Generate PDF and inspect text/geometry | Navigation/edit controls omitted; complete grayscale plan | PASS | Existing atomic print and PDF.js/canvas smoke checks remain green | Same build |
| MT-PR02 | Guide print | Quick Start + tutorial | Chrome + Edge PDF | Production build | Generate/read PDFs | Readable; no blank sheets; controls nonessential | PASS | Full tutorial PDF is parsed and every sheet must contain text; print CSS hides help controls | Same build |
| MT-SEO01 | Guide routes | All guide URLs | Static build + Chrome/Edge | Production build | Resolve routes/canonicals | Correct content and canonical | PASS | 39 indexable-route crawl/canonical audit passes | Same build |
| MT-SEO02 | Crawlable hub | `/guides/` | Generated HTML | JavaScript irrelevant | Inspect primary guide links | Normal source-rendered anchors | PASS | Astro source and browser DOM use ordinary anchors | Same build |
| MT-SEO03 | Route restraint | Sitemap/source | Repository inspection | Current route set | Compare help keys with pages | No tooltip-per-route explosion | PASS | Controlled registry has no generated help routes; only ten purposeful new guides | Same build |
| MT-SEO04 | Pre-rendering | Planner/calculators/guides | JS-disabled source inspection | Static build | Inspect generated HTML | Core explanations/links exist before hydration | PASS | Astro static output tests pass; help enhances rather than hides canonical content | Same build |
| MT-B01 | Desktop planner | Planner | Chrome + Edge 1200 × 900 | Production build | Exercise form/help/results | No layout regression | PASS | Installed-browser desktop smoke passes | Same build |
| MT-B02 | Mobile planner | Planner | Chrome + Edge 390 × 844 touch | Production build | Exercise form/help/results | No overlap/off-screen content | PASS | Narrow-layout, 44px help target, popover containment, and page overflow assertions pass | Same build |
| MT-B03 | Calculator layout | Calculator index + all calculators | Chrome + Edge desktop/mobile | Production build | Inspect grid, fields, help controls | Labels/inputs remain readable | PASS | All eleven calculator routes and responsive breakpoints pass smoke | Same build |
| MT-B04 | Guide mobile | Hub/tutorial | Chrome + Edge 390 × 844 | Production build | Use TOC, anchors, Previous/Next | Usable without sticky-sidebar obstruction | PASS | Responsive CSS/source review and complete mobile route crawl pass | Same build |

## Owner-only acceptance

These cases implement the explicit owner-validation substitution. Codex cannot
mark them PASS. Run them from a clean browser profile or after clearing the
site's local storage. Do not read the worked-example answer below until the run
is complete, and do not accept hints while performing the task. Any hint makes
the result `ASSISTED`; correct the product and rerun cleanly.

### MT-U01 — Owner from-zero self-teaching

**ID:** MT-U01  
**Area:** Owner learning/completion  
**Route:** Start at `/guides/`  
**Viewport/device:** Record browser, viewport, and input method  
**Preconditions:** Clean site state; no verbal product tutorial; do not inspect
source/test evidence  
**Steps:** Use only Guides and contextual help to plan: fabric name **Blue**;
usable WOF **40 in**; owned custom piece **20 × 10 in**; need **four 10 × 10 in
cut squares**; optional Pattern says **1/2 yd**. Calculate and locate the cutting
plan.  
**Expected:** Discover an appropriate starting guide, enter the project, explain
what the tool says to buy, and locate how to cut stock and purchased fabric
without coaching.  
**Status:** PASS (owner, 2026-09-30)  
**Evidence/notes:** Record start/end time, navigation path, confusion, any
assistance, screenshots, and final stated Buy now amount. Sealed oracle for
post-run comparison: stock covers two squares; the raw remainder is 10 in; with
the default safety and purchase increment, **Buy now is 3/8 yd**.  
**Last checked commit/build:** `1f2901a` + Guides/help working tree, local dev
site, 2026-09-30; see owner execution evidence below.

### MT-U02 — Owner result comprehension

**ID:** MT-U02  
**Area:** Owner result comprehension  
**Route:** Result produced during MT-U01  
**Viewport/device:** Same clean owner session  
**Preconditions:** Completed result visible; no coaching or glossary prompt  
**Steps:** Answer: (1) What does Pattern says mean and show? (2) What would these
cuts require if all fabric were new? (3) What must you buy now? (4) Where does
the site show how to cut it?  
**Expected:** Correctly distinguish Pattern says, Fresh-fabric plan, and Buy now,
then identify the stock allocation/purchased layout/cutting plan.  
**Status:** PASS (owner, 2026-09-30)  
**Evidence/notes:** Record exact answers and any confusion. Use `PASS`, `FAIL`,
or `ASSISTED`; do not describe this owner acceptance as independent novice or
target-quilter evidence.  
**Last checked commit/build:** Same owner session and build as MT-U01.

## Current completion state

All technical cases are recorded PASS on the production-like local build.
`MT-U01` and `MT-U02` passed owner acceptance on 2026-09-30; the Guides/help
checkpoint is acceptance-complete under the approved owner substitution.

## Owner execution evidence — 2026-09-30

The owner reported: “it was quick and easy. took about 5 minutes.” No confusion
or outside assistance was reported. The owner confirmed Chrome, a computer,
a fresh private window, and only the site's own help and Guides. These are
permitted learning resources, not procedural coaching. Exact timestamps,
viewport, navigation sequence, and screenshots were not supplied; the owner's
written readback is the evidence for completion and the important result state.

Exact result-comprehension readback:

> pattern says is the pattern yardage. if all the fabric were new, it'd still
> fit in the 40x10 measurement. Buy 3/8 yd of Blue. From Remnant 1, cut Square
> (instance 1) at 10″ × 10″.
> From Remnant 1, cut Square (instance 2) at 10″ × 10″. Cut one 10″ × WOF strip.
> From that strip, cut 2 Square pieces at 10″ × 10″.

Assessment: MT-U01 PASS for completing the plan and locating executable cutting
instructions without outside assistance. MT-U02 PASS for distinguishing the
external pattern reference, the all-new 40 × 10 in layout, and the stock-aware
3/8 yd purchase, and identifying both remnant cuts and the purchased strip.
The pattern-reference amount was not restated, but its meaning was correctly
identified. After acceptance, the owner asked whether “shortfall” meant the
purchase was incorrect; Codex clarified that it means the remaining material
needed after stock, and that 3/8 yd is correct. This was post-run clarification,
not assistance during either case.

This is owner acceptance, not independent novice or target-quilter evidence.
