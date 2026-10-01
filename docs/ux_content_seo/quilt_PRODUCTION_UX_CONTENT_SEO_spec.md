# Quilt Utility Website — Production UX, Content & SEO Specification

**Status:** Final pre-launch implementation specification  
**Purpose:** Hand this to Codex **after the core app is built** and **before** the Autonomous Launch Package.  
**Governing authority:** `quilt_FINAL_product_spec_v1.md` and `quilt_FINAL_golden_rules_and_tests.md`

This document does **not** expand V1 scope. It converts already-locked requirements into production-quality UX, content, and SEO behavior so Codex does not have to invent product design during the launch pass.

---

# 0. Governing UX Principle

> **The user should feel like they are using a simple quilting tool, not configuring an optimization engine.**

The product must be:

- obvious on first use;
- forgiving without hiding important assumptions;
- progressively disclosed;
- trustworthy;
- fast;
- printable;
- mobile-safe;
- calm and utilitarian rather than “software-y.”

The core micro-principle is:

> **Math should disappear; assumptions should not.**

---

# 1. Product-Level UX Hierarchy

The site has three levels of interaction:

## Level A — Static understanding

Users should understand what the page does before any JS executes.

Every page must statically contain:

- clear H1;
- one-sentence task description;
- concise trust statement;
- relevant assumptions/defaults;
- a worked example where applicable.

## Level B — Simple calculator interaction

Most users should reach a result without touching advanced settings.

## Level C — Advanced control

Expert users can override:

- usable WOF;
- seam allowance;
- rotation;
- safety buffer;
- directional behavior;
- purchase increment;
- backing overage.

Advanced controls must be discoverable but never dominate first-use UX.

---

# 2. Global Design Behavior

## Visual tone

Use:

- clean;
- light;
- high contrast;
- spacious;
- practical;
- modern but not trendy.

Avoid:

- excessive card nesting;
- gradients for decoration;
- glassmorphism;
- gamification;
- dense dashboard aesthetics;
- icon-only controls;
- aggressive animations.

## Interaction density

Prefer:

- one primary action per section;
- short labels;
- inline explanation near the decision it affects;
- expandable advanced controls.

Avoid:

- full-page forms with 20 visible fields;
- modals for routine editing;
- hidden assumptions behind “settings” with no summary.

## Motion

Use motion only for:

- state changes;
- adding/removing fabric/piece groups;
- expanding advanced sections;
- highlighting recalculated results.

Respect reduced-motion preferences.

---

# 3. Homepage UX

## Above fold

### H1

**Quilt Fabric Math, Without the Math**

### Supporting copy

> Calculate fabric yardage, plan your cuts, and turn a quilt piece list into a practical shopping and cutting plan.

### Primary CTA

**Plan My Fabric**

### Secondary CTA

**Use a Calculator**

### Supporting trust line

> Free · No account · Editable quilting assumptions

Do not clutter hero with calculator inputs.

---

# 4. Fabric Cutting Planner — Screen Structure

The planner should be one continuous task page, not a multi-page wizard.

## Desktop layout

Recommended:

- left/main column: project inputs;
- right/sticky result summary once results exist;
- full-width cutting diagram below results.

## Mobile layout

Order:

1. project/fabric inputs;
2. calculate CTA;
3. shopping result;
4. warnings/assumptions;
5. cutting instructions;
6. cutting diagram;
7. print/share.

Do not use side-by-side input/result on narrow screens.

---

# 5. Planner First-Use State

On first open:

Show:

- project unit selector;
- one Fabric card;
- one Piece row;
- concise example placeholder values;
- advanced controls collapsed.

Do **not** show empty charts or placeholder result panels.

Suggested first-use helper:

> **Start with one fabric. Add the pieces you need from it, then add more fabrics if your quilt uses them.**

Dismissible but not intrusive.

---

# 6. Fabric Card UX

Each Fabric card should show in its header:

- Fabric name;
- usable WOF summary;
- directional status;
- remove button only if more than one fabric exists.

Example:

> **Fabric A**  
> 40" usable WOF · Non-directional

Primary editable fields:

- Fabric name
- Usable WOF

Advanced:

- Nominal width
- Directional
- default rotation
- safety allowance
- purchase increment

The distinction between nominal and usable width must be explained inline:

> **Usable WOF** is the width available after removing selvages.

Do not make nominal width mandatory for packing.

---

# 7. Piece Row UX

Each piece group row should contain:

- label
- quantity
- width
- height
- Finished / Cut toggle
- optional rotation indicator

Recommended compact layout:

`Label | Qty | Width | Height | Finished/Cut`

Advanced per-piece controls behind a small disclosure:

- rotation override
- orientation
- WOF strip

Example label placeholder:

> Blue corner square

Do not require meaningful labels; auto-name unlabeled groups as:

- Piece 1
- Piece 2

---

# 8. Finished vs Cut UX

Use a segmented toggle:

**Finished size | Cut size**

When Finished is selected, display the computed cut size inline:

> Cut size used: **4½" × 4½"**  
> Based on ¼" seam allowance.

The user must never wonder which size the optimizer used.

---

# 9. Advanced Settings UX

Advanced settings should appear as:

> **Advanced settings** ▾

When collapsed, show a concise current assumptions line:

> 40" usable WOF · ¼" seam · 5% buffer · ⅛ yd rounding

When expanded, each setting must include:

- label;
- current value;
- one short explanation;
- reset-to-default behavior.

Do not use a global settings modal for routine calculator decisions.

---

# 10. Primary CTA Behavior

Button:

> **Calculate Cutting Plan**

Disabled only for clearly incomplete/invalid required inputs.

After first calculation:

- retain button;
- relabel optionally to **Recalculate Plan** only if inputs change.

Do not auto-recalculate on every keystroke for the complex planner.

Reason:

- avoids visual churn;
- makes calculation feel intentional;
- reduces performance surprises.

Simple standalone calculators may calculate live if interaction remains stable.

---

# 11. Validation UX

Errors should appear:

- next to the affected field;
- with plain-language recovery instructions.

Bad:

> Invalid dimension.

Good:

> **This piece cannot fit across your 40" usable fabric width unless rotation is allowed.**

If a result cannot be generated:

- preserve entered data;
- scroll/focus to the first blocking issue;
- show summary message above CTA.

Do not clear the form.

---

# 12. Result Hierarchy

Once calculation completes, display results in this order:

## 1. Shopping quantity

Largest visual result.

Example:

> **Buy 1¾ yd of Fabric A**

Below:

> Calculated layout: 1.54 yd · With 5% buffer: 1.62 yd

## 2. Assumptions chip/summary

Example:

> 40" usable WOF · ¼" seam · 5% buffer · rotation allowed  
> **Change**

## 3. Cutting instructions

Readable numbered list.

## 4. Visual cutting plan

## 5. Waste / efficiency details

Secondary, not hero information.

The user’s main question is:

> “How much do I buy?”

Answer that first.

---

# 13. Shopping List UX for Multiple Fabrics

Display one compact table/list:

| Fabric   |   Buy | Minimum | Buffer |
| -------- | ----: | ------: | -----: |
| Fabric A | 1¾ yd | 1.54 yd |     5% |
| Fabric B |  ⅞ yd | 0.78 yd |     5% |

Actions:

- Print all
- Copy shopping list

Do not hide per-fabric cutting plans.

Each fabric expands into:

- instructions;
- diagram;
- assumptions.

---

# 14. Cutting Instructions UX

Instructions must be actionable at a cutting table.

Example:

1. Cut **6 strips at 3½" × WOF**.
2. Subcut those strips into **48 squares at 3½" × 3½"**.
3. From the remaining area, cut **8 rectangles at 3½" × 6½"**.

Use:

- inches/fractions formatted naturally;
- group labels when helpful.

Avoid:

- optimizer jargon;
- coordinate references;
- “place item A at x=…” language.

---

# 15. Cutting Diagram UX

The SVG must answer:

- which direction is WOF?
- how much fabric length is shown?
- which pieces belong to which group?
- where are strip boundaries?
- what is waste?

Required:

- top legend;
- usable-width marker;
- length scale;
- group labels;
- direction arrow if directional;
- zoom on small screens;
- textual cutting-list equivalent.

For dense layouts:

- abbreviate labels;
- use keyed legend;
- do not render unreadable text inside tiny pieces.

The diagram is explanatory, not decorative.

---

# 16. Print UX

Print view should remove:

- nav;
- footer;
- unrelated guide content;
- ads;
- nonessential controls.

Print should include:

- project name if present;
- date;
- shopping list;
- assumptions;
- cutting instructions;
- cutting diagram;
- warnings.

Must remain understandable in grayscale.

---

# 17. Standalone Calculator UX Pattern

All simple calculator pages should share one interaction pattern:

1. H1 + short explanation
2. calculator panel
3. result
4. “Why this answer?” explanation
5. worked example
6. relevant guide
7. related tool
8. planner CTA

Do not use seven different UI paradigms.

---

# 18. Backing Calculator UX

Inputs:

- quilt width
- quilt length
- usable backing width
- overage per side
- directional toggle

Advanced:

- panel seam allowance
- safety/rounding

Result:

> **Recommended: 5 yd · Vertical seam · 2 panels**

Also show alternative valid candidate:

> Horizontal seam: 5¾ yd

Explain:

> Lower yardage is recommended. Confirm your longarmer’s required overage before purchase.

Do not imply the lower-yardage option is always aesthetically preferred.

---

# 19. Binding Calculator UX

Result hero:

> **8 strips · Buy ⅝ yd**

Then:

- total binding length;
- strip width;
- joining allowance;
- formula explanation.

Explicit note:

> Straight/cross-grain binding only. Bias binding is not included in this V1 calculator.

---

# 20. HST Calculator UX

Method selector must be prominent:

- 2 at a time
- 4 at a time
- 8 at a time

Default sizing option:

> **Trim-friendly**

Secondary:

> Exact

Result example:

> Cut **5" starting squares**  
> 5 squares from each fabric  
> Produces 10 HSTs

For 4-at-a-time:
show warning:

> Outer edges are on the bias. Handle carefully to avoid stretching.

Do not bury method yield.

---

# 21. Block Count UX

Show both:

> **6 × 8 blocks = 48 blocks**

and:

> Resulting quilt size: **60" × 80"**

If target cannot be hit exactly:

> Your nearest whole-block layout is **70" × 90"**, which is 8" larger in each direction.

Do not silently imply exact target match.

---

# 22. Border Calculator UX

State assumption near top:

> Straight, non-mitered borders · Side borders first

Result:

- cut strip width;
- number of WOF strips;
- nominal border lengths;
- yardage;
- final quilt size.

Warning:

> Measure the actual quilt top through the center before cutting final border lengths.

---

# 23. Sashing Calculator UX

State assumption:

> Row-wise sashing · No cornerstones · No outer sashing

Result:

- vertical piece count;
- horizontal row strips;
- WOF strip count;
- yardage;
- final size.

If horizontal strip must be pieced:

> This horizontal sashing row is wider than your usable WOF and will need to be joined.

---

# 24. Loading / Calculation State

For normal calculations:

- show no full-screen loader;
- button may show inline progress;
- result area can use a subtle skeleton only if optimization is noticeable.

If optimizer exceeds a normal threshold:

> Optimizing a larger cutting plan…

Never imply network activity since computation is local.

---

# 25. Empty / Error / Recovery States

## No saved project

Normal first-use state, no “empty-state illustration” needed.

## localStorage incompatible

Message:

> Your saved project used an older format and couldn’t be restored. Your calculator defaults have been kept where possible.

## impossible optimization

Explain exact blocking group and reason.

Never show:

> Something went wrong.

unless there is genuinely an unexpected application error.

---

# 26. Mobile UX Rules

- minimum tap targets ~44 CSS px;
- no horizontally scrolling form grids;
- piece rows stack cleanly;
- numeric inputs use appropriate mobile input mode;
- result cards remain readable;
- diagram has horizontal zoom/pan container if necessary;
- sticky CTA only if it does not obscure content;
- no sticky ad near inputs.

---

# 27. Accessibility Rules

Required:

- visible labels;
- errors associated to controls;
- proper fieldsets for grouped options;
- keyboard-accessible disclosures;
- no color-only piece differentiation;
- SVG has accessible name/description;
- textual equivalent exists;
- focus moves logically after calculation errors;
- reduced-motion respected;
- print CSS does not hide critical data.

---

# 28. Content Voice

Tone:

- clear;
- practical;
- calm;
- non-patronizing;
- precise.

Good:

> “We assumed 40" usable width. Change it if your fabric differs.”

Bad:

> “Don’t worry—we’ve got the math handled!”

Good:

> “This layout is optimized for practical cutting, not mathematically guaranteed minimum waste.”

Avoid marketing adjectives like:

- revolutionary;
- perfect;
- genius;
- effortless.

---

# 29. Guide Production Standard

Every guide must:

- answer one concrete quilting question;
- explain why it matters in the tools;
- include a worked example;
- link directly to a relevant calculator;
- cite authoritative/practical references where a convention varies;
- avoid generic history/inspiration filler.

Target depth is whatever fully solves the task. No arbitrary word-count target.

---

# 30. Finished Guide Copy Requirements

Codex should turn the existing SEO briefs into final production copy.

At launch, the following five guides must be complete:

1. What Does WOF Mean in Quilting?
2. Finished Size vs Cut Size in Quilting
3. Quilt Seam Allowance: Why 1/4 Inch Matters
4. How Much Extra Backing Does a Quilt Need?
5. How to Calculate Fabric Yardage for a Quilt

Each guide must:

- include correct examples from the Golden Rules;
- avoid unsupported universal claims;
- use human-readable tables where useful;
- include “Use this calculator” contextual links.

---

# 31. Trust / Authorship Layer

To strengthen trust:

## About page

Explain:

- what the site does;
- that calculations are based on explicit quilting conventions;
- assumptions are editable;
- practical optimizer is deterministic;
- how corrections can be reported.

Do not pretend the operator is a professional quilter unless factually true.

## Methodology page or methodology sections

Explain:

- formulas;
- defaults;
- optimizer philosophy;
- global-optimum disclaimer;
- source conventions.

## Change / correction policy

Provide a simple path for reporting a calculation issue.

Trust is more valuable here than pretending expertise.

---

# 32. SEO 10/10 Standard

“10/10 SEO” does **not** mean stuffing more keywords or creating more pages.

It means every SEO layer is deliberately optimized while preserving people-first usefulness.

Google explicitly emphasizes original, substantial, people-first content, clear site focus, trust, and satisfying task completion. It also recommends pre-rendering/server rendering because it is faster for users and crawlers, even though Google can render JavaScript. This directly supports our Astro/static-first architecture.

The following are required.

---

# 33. SEO Layer 1 — Query-to-Page Mapping

Every launch page must have one primary task/query family.

No two pages should compete for the same main intent.

Example:

- `/calculators/quilt-backing` → calculator/task intent
- `/guides/backing-overage` → explanatory intent

If two pages would answer the same searcher equally well:

- merge;
- or clearly differentiate intent.

Maintain a query map:

| Page                  | Primary intent           | Secondary intents          | Conversion target |
| --------------------- | ------------------------ | -------------------------- | ----------------- |
| Backing calculator    | calculate backing        | yardage, panel orientation | result            |
| Backing overage guide | understand extra backing | longarm requirement        | calculator        |

This prevents cannibalization.

---

# 34. SEO Layer 2 — Search Intent Completeness

For each page:

- inspect the current SERP before finalizing content;
- identify what users expect;
- identify what competitors omit;
- answer the task more completely.

A calculator page must not merely contain a calculator.

It should also explain:

- what inputs mean;
- why defaults exist;
- worked example;
- edge cases;
- how to audit the result.

Original product-generated value is the strongest content advantage.

---

# 35. SEO Layer 3 — Original Information

Our SEO moat should come from things competitors cannot copy trivially:

- actual cutting layouts;
- transparent assumption summaries;
- optimizer output;
- side-by-side backing candidates;
- exact/trim-friendly HST methods;
- practical worked examples;
- reusable calculation methodology;
- test-backed formulas.

Do not rely on paraphrasing existing quilting blogs.

Google's current guidance explicitly asks whether content provides original information, substantial value, and information beyond the obvious.

---

# 36. SEO Layer 4 — Trust / E-E-A-T Signals

This is not YMYL, but trust still matters.

Required:

- About page;
- methodology;
- source references;
- correction/contact channel;
- visible last-updated date only when genuinely updated;
- truthful authorship/operator information;
- no fake expertise.

Google's current guidance explicitly encourages clear “Who, How, and Why” information around content.

---

# 37. SEO Layer 5 — Static HTML and JS Restraint

Meaningful content must exist in Astro-generated HTML.

Do not rely on client JS for:

- headings;
- explanatory content;
- internal links;
- metadata;
- worked examples.

Google can render JS, but its current JS guidance still says server-side/pre-rendering is a great idea because it is faster for users/crawlers and not all bots run JS.

Our architecture should therefore:

- ship zero/minimal JS on guides;
- minimal vanilla TS on simple calculators;
- React only for the planner where justified.

---

# 38. SEO Layer 6 — Titles and SERP Presentation

For every page:

- unique `<title>`;
- H1 closely aligned with task;
- descriptive meta description;
- consistent prominent page heading;
- relevant internal anchor text.

Google derives title links from title elements, H1s, prominent content, anchor text, and other signals. Keep those consistent.

Avoid:

- keyword repetition;
- boilerplate titles;
- sensational titles.

---

# 39. SEO Layer 7 — Site Name / Brand Signals

When final brand is chosen:

- use consistent brand name in homepage title/footer/about;
- add `WebSite` structured data on homepage;
- set `name` and `alternateName` appropriately;
- keep logo/site identity consistent.

Google currently recommends `WebSite` structured data to indicate preferred site name.

## Mandatory post-purchase domain and brand implementation step

The working name **Quilter** is provisional. The final public brand must be the
human-readable brand form of the purchased domain name. Domain purchase therefore
triggers a required implementation pass before production deployment.

Complete the post-purchase checklist in
`../launch/domain-brand-selection-and-activation.md`. At minimum, that pass must:

- record the purchased hostname, final public brand spelling, and canonical-host
  choice;
- replace provisional `Quilter` public identity copy throughout page titles,
  navigation, footer, About, Methodology, Corrections, guides, planner copy,
  calculator copy, sharing defaults, and error pages;
- update `WebSite` `name`/`alternateName`, `og:site_name`, visible logo/wordmark,
  favicon identity, and any other brand-bearing metadata;
- replace the provisional local origin with the production HTTPS origin through
  `SITE_URL`, then verify canonicals, sitemap, robots, Open Graph URLs, and
  structured-data URLs;
- configure the monitored corrections address and Search Console verification;
- rename every product-name-prefixed internal identifier before launch, including
  storage keys, analytics event names, package metadata, test fixtures, and
  automation identifiers, while preserving behavior and adding a persisted-state
  migration if public data exists; and
- run repository-wide, built-output, and public-origin checks proving that no
  provisional public brand or origin remains.

The domain/brand pass is a deployment gate. Purchasing the domain does not, by
itself, complete the site-name or production-origin acceptance criteria.

---

# 40. SEO Layer 8 — Internal Linking

Every page should be reachable through normal HTML links.

Create intentional topic paths:

### Yardage cluster

WOF → finished/cut → yardage calculator → planner

### Quilt finishing cluster

Backing overage → backing calculator → binding calculator

### Construction math cluster

HST → block count → borders/sashing → planner

Use descriptive anchors:

> Calculate quilt backing yardage

not:

> Click here

Avoid orphan pages.

---

# 41. SEO Layer 9 — Crawl / Index Hygiene

Required:

- XML sitemap;
- canonical URLs;
- correct 200/404 behavior;
- robots.txt;
- no staging indexation;
- no accidental noindex;
- redirect one canonical host;
- HTTPS;
- avoid duplicate parameter URLs;
- no indexable internal-search/result pages unless deliberately useful.

Search Console should be used to verify:

- indexation;
- canonical selection;
- crawl issues.

---

# 42. SEO Layer 10 — Structured Data Restraint

Use structured data only when:

- supported;
- visible page content matches markup;
- feature remains current.

Potential:

- WebSite
- BreadcrumbList
- WebApplication / SoftwareApplication if valid

Do not chase FAQ rich results. Google currently limits FAQ rich results mainly to authoritative government/health sites.

Do not add obsolete HowTo markup solely for SEO.

---

# 43. SEO Layer 11 — Core Web Vitals / Page Experience

Target excellent real-world performance.

Codex must optimize:

- LCP;
- INP;
- CLS;
- total JS;
- font loading;
- image dimensions;
- lazy-loading where appropriate;
- responsive layout.

Do not treat Lighthouse 100 as the product goal; prioritize actual user experience and field data once available.

---

# 44. SEO Layer 12 — Content Pruning Discipline

Do not publish a page simply because a keyword exists.

A page must have:

- distinct intent;
- useful standalone answer;
- sufficient unique data/tool value;
- a real place in internal linking.

If a page fails to attract meaningful impressions and cannot be improved:

- merge;
- redirect;
- remove where appropriate.

Do not keep weak pages merely to inflate page count.

---

# 45. SEO Layer 13 — Image / Diagram Search Opportunity

The cutting diagram gives us an original visual asset.

For relevant indexable examples:

- use descriptive SVG/title/context;
- provide accessible text;
- avoid rendering important text only as an image;
- consider static example diagrams in guides where they genuinely teach the concept.

Do not create mass image pages.

---

# 46. SEO Layer 14 — Search Console Feedback Loop

Post-launch, Search Console becomes the source of truth.

Every 2–4 weeks:

1. group queries by task;
2. identify page/query mismatch;
3. identify position 8–20 opportunities;
4. identify new recurring query families;
5. improve existing pages first;
6. create new pages only where distinct intent exists.

A page with growing impressions but weak CTR:

- inspect title/snippet/intent.

A page with clicks but poor tool completion:

- fix UX/product, not just SEO copy.

---

# 47. SEO Layer 15 — Backlinks / Distribution

Do not run spammy outreach.

Earn links by making genuinely reference-worthy utilities.

Potential organic link magnets:

- HST method calculator;
- WOF reference;
- visual cutting planner;
- transparent formulas/tables;
- printable outputs.

Later, legitimate outreach may target:

- quilting educators;
- pattern designers;
- quilting resource pages;
- sewing guild/resource directories.

No paid link schemes.

---

# 48. SEO Acceptance Criteria Before Deployment

Codex must confirm:

- every launch URL has distinct primary intent;
- no query cannibalization obvious from page design;
- complete titles/meta/canonicals;
- meaningful static HTML;
- internal linking graph has no orphan launch pages;
- sitemap/robots correct;
- 404/redirect behavior correct;
- structured data validates where used;
- brand/site-name markup configured once domain/brand is final;
- mobile performance is strong;
- no thin programmatic pages;
- About/methodology/correction path exists;
- all launch guide copy is final;
- all calculator pages contain enough explanation to satisfy intent independently.

---

# 49. Production Content Acceptance Criteria

A page is not “done” merely because text exists.

It must pass:

### Clarity

Can a first-time quilter understand the task?

### Completeness

Does the page answer the likely follow-up questions?

### Originality

Does it add calculator/product-specific value?

### Trust

Are assumptions/sources clear?

### Actionability

Can the user do the next step immediately?

### Brevity

Is anything present merely to make the page longer?

Delete filler.

---

# 50. Codex Execution Order for This Document

After core V1 implementation:

1. read this document;
2. audit current UX against it;
3. change planner/calculator UX as needed;
4. write/integrate final guide and tool-page copy;
5. implement SEO 10/10 checklist;
6. run accessibility/mobile/print QA;
7. produce a divergence report;
8. then move to the Autonomous Launch Package.

Do not begin deployment until this spec passes.

---

# 51. Human Action Blockers

This document should require no human action unless:

- real contact/legal identity copy is needed;
- brand/domain choice has not been finalized;
- a product change would violate the governing agenda.

Codex should make implementation/content decisions within the constraints above without repeatedly asking for stylistic approval.

---

# 52. Final UX Principle

> **A beginner should get a trustworthy answer without knowing the math. An expert should be able to inspect and change every assumption that matters.**

# 53. Final SEO Principle

> **Be the best answer because the tool genuinely solves the task better—not because the page says the keyword more often.**
