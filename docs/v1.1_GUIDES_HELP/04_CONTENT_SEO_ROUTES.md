# QuiltClarity V1.1 — Content, SEO & Route Specification

**Status:** Production acquisition/content contract  
**Date:** 2026-08-17  
**Guides/help revision:** 2026-08-21

# 1. SEO role

The business shape is:

> **searchable quilting utility surface + deeper integrated project workflow**

The differentiated planner does not need one giant head keyword. Standalone calculators and focused guides acquire task-specific search users; the product earns preference and repeat use by solving the deeper project job.

# 2. Search principles

- Build pages for real user tasks.
- Every indexed page must provide materially useful unique information or functionality.
- Static explanatory content should render before hydration.
- Do not create numeric/permutation pages merely to inflate index size.
- Use crawlable internal links.
- Canonicals belong in source HTML.
- Maintain sitemap and Search Console.
- Optimize for real speed/stability, not just lab scores.
- Use structured data only when the page actually satisfies supported types/guidelines.

Current Google guidance supports people-first content and still recommends server-side/pre-rendered output as helpful for speed and crawlers.

# 3. Initial route map

## Product

- `/`
- `/project-planner`
- `/calculators`
- `/guides`
- `/how-it-works`

## Calculators

- `/calculators/fabric-yardage`
- `/calculators/quilt-backing`
- `/calculators/quilt-batting`
- `/calculators/quilt-binding`
- `/calculators/half-square-triangle`
- `/calculators/quarter-square-triangle`
- `/calculators/flying-geese`
- `/calculators/quilt-block-count`
- `/calculators/borders`
- `/calculators/sashing`
- `/calculators/pieces-from-fabric`

## Guides — product learning

- `/guides`
- `/guides/getting-started`
- `/guides/project-planner-tutorial`
- `/guides/enter-a-cut-list`
- `/guides/add-fabric-you-have`
- `/guides/check-pattern-yardage`
- `/guides/read-your-shopping-plan`
- `/guides/read-your-cutting-plan`
- `/guides/print-your-project-plan`

## Guides — workflow help

- `/guides/turn-pattern-cut-list-into-plan`
- `/guides/do-i-have-enough-fabric`
- `/guides/use-remnants-before-buying`

## Guides — quilting reference

- `/guides/width-of-fabric`
- `/guides/finished-vs-cut-size`
- `/guides/quilt-seam-allowance`
- `/guides/how-much-extra-backing`
- `/guides/how-much-extra-batting`
- `/guides/how-to-calculate-quilt-fabric`
- `/guides/directional-fabric-cutting`
- `/guides/fat-quarter-size`

The product-learning routes are the primary Guides IA. Reference pages remain important SEO/trust surfaces.

This is a launch-quality set, not permission to mass-produce pages.

# 4. Homepage search/content intent

Primary purpose: explain product and route users quickly.

H1 direction:
**Plan the Fabric for the Quilt You’re Already Making**

Must contain:

- what inputs are needed;
- what the planner outputs;
- calculator links;
- transparent practical-optimizer claim;
- no unsupported “best/only” competitor assertions.

# 5. Project Planner page

Static before hydration:

- H1;
- short description;
- what a cut list means;
- what fabric-on-hand geometry means;
- pattern comparison caveat;
- worked example;
- privacy/no-account note;
- practical-optimization disclosure;
- links to WOF, finished-vs-cut, yardage guides.

Title direction:
`Quilt Fabric Planner: Use What You Have & Calculate What to Buy | QuiltClarity`

Avoid trying to rank by stuffing every calculator keyword into this page.

# 6. Calculator-page template

Each calculator page:

1. task H1;
2. concise value statement;
3. interactive calculator near top;
4. result explanation;
5. assumptions/defaults;
6. worked example;
7. method/formula section;
8. limitations;
9. useful FAQ based on actual user questions;
10. related calculator/guide links.

Do not write filler around a form.

# 7. Content clusters

## 7.1 Fabric planning / yardage

- fabric yardage;
- usable WOF;
- finished vs cut;
- directional constraints;
- pattern yardage checking;
- safety allowances;
- purchase increments.

Natural internal path:
`fabric-yardage → WOF guide → project planner`.

## 7.2 Use what you own

- pieces from fabric;
- fat-quarter dimensions;
- remnants;
- whether required pieces fit actual stock;
- buying the shortfall.

Natural path:
`fat-quarter guide / pieces-from-fabric → project planner`.

Do not frame this as maintaining a permanent stash database.

## 7.3 Quilt sandwich / finishing

- backing;
- batting;
- binding;
- backing/batting overage.

## 7.4 Common units

- HST;
- QST;
- Flying Geese;
- block count.

## 7.5 Quilt-top structure

- borders;
- sashing;
- seam allowances;
- finished/cut sizes.

# 8. Query families to validate/target

Examples, not guaranteed keyword-volume claims:

- quilt fabric yardage calculator
- quilt cutting planner
- quilt fabric cutting layout
- how much fabric for quilt pieces
- quilt pattern yardage calculator/check
- do I have enough fabric for a quilt
- how many squares from a fat quarter
- how many pieces can I cut from fabric
- quilt remnant cutting calculator
- quilt backing calculator
- quilt batting calculator
- quilt binding calculator
- HST calculator
- quarter square triangle calculator
- flying geese calculator
- quilt block count calculator
- quilt border calculator
- quilt sashing calculator
- usable width of fabric quilting
- finished vs cut size quilting

Search Console decides later expansion; do not fabricate page variants from this list.

# 9. Programmatic/indexing guardrail

Do not index:

- arbitrary calculator states;
- user projects;
- query-parameter result pages;
- thousands of size permutations;
- every possible quilt dimension;
- thin AI-generated FAQ variants.

A page merits indexing when it independently answers a stable task with useful, materially different content/data.

# 10. Metadata

Every indexable page:

- unique title;
- unique meta description;
- self-referencing canonical;
- one clear H1;
- descriptive crawlable internal links;
- OG basics where useful.

Avoid title boilerplate that makes every page indistinguishable.

# 11. Structured data

Implement only valid supported markup.

Possible:

- `SoftwareApplication` on the main application/planner if eligibility requirements are actually satisfied;
- `BreadcrumbList` where valid;
- organization/site markup as appropriate.

Do not add FAQ structured data merely because a page has FAQs; use only currently supported/eligible markup according to Google guidance.

Validate with Rich Results Test.

# 12. Static-first rendering

Astro pages should render:

- task description;
- assumptions;
- examples;
- methodology;
- related links

without waiting for client JavaScript.

Interactive calculators hydrate only where needed.

# 13. Performance

Targets:

- no heavyweight site-wide JS for simple pages;
- lazy/partial hydration;
- avoid layout shifts around tools/ads;
- diagrams load after interaction where appropriate;
- keep form response immediate.

Measure Core Web Vitals after deployment.

# 14. Ads

Ads must never:

- interrupt data entry;
- sit between a label and its control;
- split result numbers from explanations;
- appear in print output;
- cause significant layout movement.

Monetization cannot degrade tool trust.

# 15. Content trust

Methodology page should explain:

- editable assumptions;
- usable WOF;
- safety/purchase rounding;
- practical vs globally proven optimization;
- how stock geometry is handled;
- why pattern comparisons are not error verdicts.

Calculator methodology should link to relevant sources where claims concern quilting practice.

# 16. Internal linking principles

Links follow user decisions, not SEO graph theory alone.

Examples:

- backing → batting → binding;
- HST → QST → Flying Geese;
- pieces-from-fabric → project planner;
- fat-quarter guide → pieces-from-fabric;
- pattern-yardage guide → project planner;
- WOF guide → yardage/planner.

# 17. Content claim restrictions

Never publish:

- “QuiltClarity always finds the minimum fabric.”
- “All quilt patterns overestimate yardage.”
- “This is the only tool that…”
- competitor comparisons as evergreen fact unless periodically revalidated.

Allowed:

- describe exactly what QuiltClarity does;
- explain observed calculation differences;
- state assumptions.

# 18. Google source trail

- Helpful people-first content:
  https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Search Essentials:
  https://developers.google.com/search/docs/essentials
- JavaScript SEO / pre-rendering:
  https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Canonicals:
  https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Structured-data gallery:
  https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- SoftwareApplication:
  https://developers.google.com/search/docs/appearance/structured-data/software-app
- Core Web Vitals:
  https://developers.google.com/search/docs/appearance/core-web-vitals
- Spam policies:
  https://developers.google.com/search/docs/essentials/spam-policies

# 19. Guides content role

Guides have two distinct jobs:

## 19.1 Product learning

Primarily teach users how to use QuiltClarity from zero and complete real jobs.

This content should:

- use actual current field/result names;
- follow the app's real sequence;
- contain screenshots/illustrations only when they materially clarify the interface;
- use worked examples;
- link directly into the relevant tool;
- provide Previous/Next learning flow;
- keep anchors stable when contextual-help buttons deep-link to them.

The authoritative guide-flow/help contract is `08_GUIDES_AND_CONTEXTUAL_HELP_SPEC.md`.

## 19.2 Quilting reference / SEO

Explain underlying concepts such as:

- WOF;
- finished vs cut;
- seam allowance;
- backing/batting overage;
- directionality;
- fat-quarter dimensions.

These pages can rank independently and support trust.

They must not become the dominant meaning of the Guides hub.

# 20. Calculator/tool page education

A user landing directly on a calculator from search must be able to use it correctly without first reading Guides.

Every feature page therefore carries the relevant subset of guide knowledge:

- concise inline helper text;
- accessible contextual help;
- assumptions;
- result interpretation;
- exact deep link to deeper guide/reference when useful.

Do not paste the entire guide onto the tool page.

Use progressive disclosure:
**enough here to act correctly; deeper material one click away.**

# 21. Guide SEO guardrail

Product tutorial pages may be indexed when they are independently useful, but they are not created for keyword permutations.

Do not create one indexed page for every field merely because contextual help exists.

Use stable anchored sections inside the full planner tutorial for narrow field-level help unless a concept has a genuine independent search/reference job.

# 22. Guide discoverability

`/guides` must visibly separate:

1. **Start Here / Learn QuiltClarity**
2. **Common Workflows**
3. **Quilting Reference**

A first-time user must not have to identify which quilting-theory article to read before learning the product.
