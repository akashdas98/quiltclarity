# Quilt Utility Website — Pre-Build Dossier
**Status:** FINAL pre-build research / product dossier  
**Date:** 2026-08-06  
**Architecture:** Astro static-first; frontend-only V1  
**Working thesis:** Build a free, SEO-led quilting math and cutting-planning website whose core V1 workflow is:

> **Piece list → quilt-aware yardage calculation → shopping quantity → practical visual cutting plan**

The website is not merely a directory of calculators. The strategic wedge is to make quilt math and cutting planning easier, more transparent, and more practical than existing free tools—especially for self-drafted quilts and users who currently resort to spreadsheets, paper, or manual calculations.

---

# 1. Executive Verdict

## Recommendation: **GO — with a sharpened product definition**

The underlying problem is real and recurring. Recent quilting discussions show people:

- repeatedly recalculating fabric needs;
- creating Excel spreadsheets to avoid doing the math again;
- manually counting pieces by color;
- mapping cutting plans on graph paper;
- asking communities to check quilt math;
- saying existing free calculators are confusing;
- looking specifically for a tool that accepts fabrics, piece sizes, and intended quilt dimensions.

However, the market is **not empty**. There are many basic quilting calculators, and some competitors already provide cutting diagrams.

Therefore the product should **not** be positioned as:

> “Free quilt calculators with diagrams.”

It should be positioned as:

> **“Tell us all the pieces you need from each fabric. We’ll tell you what to buy and give you a practical cutting plan.”**

The main business uncertainty is not technical feasibility. It is **SEO demand depth**: whether the total search surface is large enough to produce the traffic required for meaningful AdSense revenue.

---

# 2. What Has Been Validated

## 2.1 The user problem exists

Recent evidence strongly supports the problem.

### August 2026: spreadsheet workaround

A user in r/quilting reported spending an entire day making an Excel fabric calculator because they had to recalculate fabric requirements multiple times for a quilt. Other users responded positively and wanted to inspect/use the calculator.

Source:  
https://www.reddit.com/r/quilting/comments/1vennkc/i_spent_the_entire_day_making_a_fabric_calculator/

### February 2026: self-drafted quilt yardage pain

A user designing a wedding quilt described difficulty calculating the yardage required for each color and explicitly said that the free calculators they found were confusing.

The discussion included manual workflows such as:

- count every piece by color;
- calculate pieces per WOF row;
- round down usable pieces per strip for safety;
- determine number of WOF strips;
- account separately for HSTs;
- consider replacing repeated same-color blocks with long strips;
- sketch cutting arrangements on graph paper.

Source:  
https://www.reddit.com/r/quilting/comments/1r18z5k/yardage_calculation_help/

### April 2026: explicit request for our basic workflow

A user asked for a site/app where they could enter:

- how many fabrics;
- what size pieces;
- intended dimensions;

and receive fabric requirements.

Source:  
https://www.reddit.com/r/quilting/comments/1sdu0g9/fabric_calculator/

### May 2026: “quilting math” remains a pain point

A highly engaged quilting discussion revolved around the difficulty of calculating the most economical way to cut blocks. The original poster later discovered an HST calculation mistake that broke the entire plan.

Source:  
https://www.reddit.com/r/quilting/comments/1tn4ouu/the_math_involved_with_quilting/

### Long-term evidence

The same need appears across older discussions:

- self-drafting patterns and needing yardage help;
- calculator recommendations;
- piece-to-yardage calculators;
- visual cutting tools;
- people manually using paper, pencil, Excel, or PowerPoint.

Examples:

https://www.reddit.com/r/quilting/comments/1eayfnw/  
https://www.reddit.com/r/quiltingblockswap/comments/klk1qu/  
https://www.reddit.com/r/quilting/comments/gea565/

## Validation conclusion

The problem is **not hypothetical**.

The strongest interpretation is:

> The arithmetic exists, but the workflow remains cognitively annoying and fragmented.

That is a better opportunity than simply discovering a missing formula.

---

# 3. Market Reality: Existing Competition

## 3.1 Basic calculator competition is high

There are many free or freemium tools covering common calculations such as:

- backing;
- binding;
- borders;
- sashing;
- HSTs;
- block counts;
- pieces from yardage;
- fabric yardage.

Examples:

- Quilt Calculator — https://quiltcalculator.com/
- Fabric Math Tools — https://fabricmathtools.com/
- QuiltMetric — https://quiltmetric.com/
- Designed to Quilt / Quilt Geek — https://designedtoquilt.com/
- QuiltKeeper — https://quiltkeeperstudio.com/
- MakersMath — https://www.makersmath.com/

Therefore, ranking solely for “quilt backing calculator” or “quilt binding calculator” should not be assumed easy.

---

## 3.2 Cutting diagrams already exist

This is the most important correction to the initial concept.

Competitors already offer some form of cutting diagram:

### PreQuilt

Provides recommended fabric cutting diagrams and allows WOF/orientation adjustments.

https://help.prequilt.com/prequilt-101/fabric-calculator/calculations-explained/fabric-cutting-diagrams

### QuiltSandwich

An iOS/iPad app that calculates fabric requirements and produces cutting diagrams.

https://apps.apple.com/in/app/quiltsandwich/id906118786

### Gibson Threads

A free tool described by its creator as accepting quilt components and returning fabric estimates plus cutting diagrams/instructions.

Community evidence:  
https://www.reddit.com/r/quilting/comments/1sdu0g9/fabric_calculator/

### QuiltButler

Offers yardage requirements, visual cutting diagrams, shopping lists, visualization, and project-cost estimation.

https://quiltbutler.com/

### Quiltler

Offers fabric requirements, cutting instructions, and efficient cutting diagrams as part of a broader quilt design product.

https://quiltler.com/quilt-fabric-calculator

## Competitive conclusion

**“Visual cutting diagram” by itself is not a defensible killer feature.**

The stronger feature is the complete workflow:

> **arbitrary multi-piece input + multiple fabrics + quilt-aware practical optimization + shopping list + explainable visual cutting plan + no signup + free web access**

---

# 4. Product Thesis

## Product promise

> **Tell us what pieces you need. We’ll tell you how much fabric to buy and exactly how to cut it.**

The user should not need to understand yardage formulas.

The tool should understand:

- cut dimensions vs finished dimensions;
- seam allowance;
- usable WOF;
- orientation;
- directional fabric;
- repeated pieces;
- WOF strips;
- safety margin;
- purchase rounding;
- practical cutting sequences.

---

# 5. V1 Definition

## 5.1 Main product: Fabric Cutting Planner

### User creates one or more fabrics

Each fabric may include:

- name / label;
- total fabric width;
- usable fabric width;
- directional / non-directional;
- safety allowance;
- purchasing increment.

### User adds required pieces

For each piece:

- name;
- quantity;
- width;
- height;
- dimensions type:
  - finished;
  - cut;
- rotation allowed;
- optional grain/orientation constraint;
- optional WOF-strip designation.

### Output

#### Shopping list

Example:

- Fabric A — buy 1⅞ yd
- Fabric B — buy ¾ yd
- Fabric C — buy 2¼ yd

#### Cutting list

Example:

- Cut 6 × 3½" WOF strips
- Subcut 48 × 3½" squares
- Cut 4 × 6½" WOF strips
- Subcut 24 × 3½" × 6½" rectangles

#### Visual cutting plan

The diagram must correspond to the user’s actual inputs.

It should show:

- fabric width;
- row/strip boundaries;
- piece positions;
- waste areas;
- labels;
- dimensions;
- orientation;
- total used length.

#### Explanation

Every result should expose its assumptions.

Example:

- Usable WOF: 40"
- Seam allowance: ¼"
- Rotation: allowed
- Directional fabric: no
- Safety allowance: 5%
- Purchase rounding: nearest ⅛ yd upward

#### Print/share

A clean print layout suitable for taking to a cutting table or fabric store.

---

## 5.2 Supporting V1 calculators

These exist primarily as SEO entry points and simple utilities:

1. Fabric Yardage Calculator
2. Quilt Backing Calculator
3. Quilt Binding Calculator
4. Half-Square Triangle Calculator
5. Border Calculator
6. Sashing Calculator
7. Quilt Size / Block Count Calculator

Each should eventually offer a bridge such as:

> **Add this result to my Cutting Planner**

This makes the calculators acquisition funnels into the main product.

---

# 6. Explicit V1 Non-Features

Do **not** build these initially:

- full quilt visual designer;
- block pattern marketplace;
- fabric photo simulation;
- fabric-stash manager;
- account system;
- cloud saves;
- community/social features;
- AI;
- image recognition;
- PDF pattern ingestion;
- arbitrary freeform polygons;
- curved-piece optimization;
- appliqué planning;
- foundation paper-piecing optimization;
- hundreds of predefined quilt blocks;
- premium tier.

These features would push the product into direct competition with larger design environments such as PreQuilt, Quiltler, QuiltButler, and EQ-style software.

The initial territory should remain:

> **Quilt math + fabric cutting.**

---

# 7. Quilting Domain Model Required for V1

The developer does **not** need to become a quilter, but the product specification must understand the following concepts.

## Quilt anatomy

- quilt top;
- batting;
- backing;
- binding;
- blocks;
- borders;
- sashing.

## Measurement concepts

- finished size;
- unfinished/cut size;
- seam allowance;
- width of fabric (WOF);
- usable WOF;
- selvage;
- length of fabric;
- yard / metre;
- purchase increments.

## Orientation concepts

- crosswise grain;
- lengthwise grain;
- bias;
- directional prints;
- rotation allowed / disallowed.

## Common units/components

- squares;
- rectangles;
- WOF strips;
- half-square triangles (HST);
- quarter-square triangles (later if desired);
- flying geese (later if desired).

---

# 8. Defaults and Assumptions

These should **never be hidden hard-coded truths**. They should be sensible defaults that users can change.

## 8.1 WOF

Quilting cotton is commonly sold around 42–44" wide, but usable width after selvage trimming may be lower.

Current calculators differ:

- some use 42";
- some use 44";
- some treat roughly 40" as usable;
- PreQuilt defaults WOF to 42" but allows users to override it.

Recommended product behavior:

- Fabric width default: **42"**
- Usable width default: **40"**
- Both editable
- UI explains the distinction

Do not silently assume that all fabric has the same usable width.

Sources:

https://quiltmetric.com/en/fabric-yardage-calculator  
https://help.prequilt.com/prequilt-101/fabric-calculator/calculations-explained/fabric-cutting-diagrams

---

## 8.2 Seam allowance

Standard quilt piecing commonly uses **¼" seam allowance**.

For a rectangular finished piece, the usual default cut dimension is:

> finished width + ½"  
> finished height + ½"

because ¼" is required on both sides.

Default:

- seam allowance: **¼"**
- user override available
- allow direct “cut size” entry to bypass conversion entirely

---

## 8.3 Backing overage

This is not universal.

A common longarm requirement is approximately **4" per side**, but actual requirements vary by longarmer and method.

Recommended options:

- Longarm: default 4" per side
- Domestic machine: default 2" per side
- Hand quilting: default 2" per side
- Custom

UI copy should explicitly say:

> Check your longarmer’s requirement before purchasing fabric.

Sources:

https://scissortailquilting.com/glossary/overage/  
https://www.doreensquiltingcreations.com/faq-prep-guide  
https://www.reddit.com/r/quilting/comments/1v6qpcg/longarm_service_and_backing_size/

---

## 8.4 Safety / waste allowance

There is no universal “correct” percentage.

Different tools use 5%, 10%, or no automatic extra.

Recommended behavior:

- default: **5%**
- quick options: 0%, 5%, 10%, custom
- distinguish:
  - exact calculated minimum;
  - recommended purchase amount.

Example:

> Exact calculated requirement: 31.5"  
> Recommended purchase with 5% buffer: 33.1"  
> Rounded purchase quantity: 1 yd

This preserves mathematical transparency.

---

## 8.5 Purchase rounding

Fabric stores commonly sell in fractional-yard increments, but policy varies.

Recommended:

- default upward rounding to **⅛ yard**
- option for ¼ yard
- metric equivalent for metre-based markets

Never round to the nearest value; always round **up**.

---

# 9. HST Rules

The HST calculator needs explicit method selection.

At minimum:

## 2-at-a-time

A common precise formula is:

> starting square = finished HST size + ⅞"

Many quilters intentionally cut slightly larger and trim down.

Therefore the product should offer:

- precise mode;
- trim-friendly mode.

## 4-at-a-time and 8-at-a-time

These require different formulas and should be treated as separate construction methods, not simple multiples of the 2-at-a-time method.

Reference:

https://sewcalcs.uk/quilting/half-square-triangle-calculator/  
https://www.scrapish.com/half-square-triangles.html

---

# 10. Cutting Optimizer Specification

## 10.1 Problem class

For rectangular pieces, this is related to the **two-dimensional cutting-stock / packing** family.

Exact global optimality can be computationally difficult in the general case.

That is **not a blocker**.

The product does not need to mathematically prove the globally minimum possible fabric length.

It needs to produce a **practical, efficient quilting plan**.

Reference overview:

https://arxiv.org/abs/2004.12619

---

## 10.2 Objective function

Do **not** optimize only for fabric waste.

A technically minimal layout may be horrible to cut.

The default objective should approximately prioritize:

1. validity;
2. practical WOF-strip cutting;
3. low fabric length;
4. low number of cutting operations;
5. low fragmentation;
6. low waste.

Conceptually:

> **minimize yardage while penalizing impractical cutting complexity**

---

## 10.3 Suggested heuristic approach

For each fabric:

1. normalize pieces to cut dimensions;
2. enforce rotation/grain restrictions;
3. group identical pieces;
4. identify WOF-compatible strip strategies;
5. sort larger / more restrictive pieces first;
6. create candidate layouts using several deterministic orderings;
7. fill leftover row spaces with smaller compatible pieces;
8. compare rotations where allowed;
9. score candidate plans;
10. choose the best practical plan;
11. add safety allowance;
12. round purchase quantity upward.

Possible candidate orderings:

- height descending;
- width descending;
- area descending;
- quantity descending;
- constrained pieces first;
- strip-friendly groups first.

Running multiple small heuristic passes client-side should be computationally cheap for normal quilt inputs.

---

# 11. UX Principles

## 11.1 Beginner-first, expert-capable

Use progressive disclosure.

### Simple mode

Ask only what most users understand.

Example:

- How many pieces?
- Finished or cut size?
- Width?
- Height?
- Fabric width?

### Advanced settings

Expose:

- usable WOF;
- seam allowance;
- grain;
- rotation;
- directional print;
- safety percentage;
- purchase increment.

This avoids recreating the “free calculators are confusing” problem.

---

## 11.2 Explain every important result

Bad:

> 1.75 yd

Good:

> **Buy 1¾ yd**
>
> 11 pieces fit across your usable 40" width.  
> You need 9 rows.  
> 9 × 3½" = 31½" minimum fabric length.  
> With your 5% safety allowance and store rounding, buy 1 yd.

The exact explanation will differ by problem, but the principle is constant:

> **The user should be able to audit the answer.**

This is both a trust feature and an SEO/content advantage.

---

## 11.3 No forced signup

A quilting discussion about a visual web calculator included explicit resistance to creating an account for a simple calculator.

Source:

https://www.reddit.com/r/quilting/comments/d6ii7q/

V1 should therefore require **no login**.

Use browser storage if persistence is useful.

---

# 12. SEO Demand Map

Precise search-volume numbers are **not currently available from a reliable free source**, so this dossier does not fabricate them.

Instead, the launch map is based on:

- repeated SERP presence;
- number/type of competitors;
- recurring user questions;
- query specificity;
- product fit;
- ability to provide genuinely differentiated content.

## Tier 1 — obvious calculator queries

- quilt fabric calculator
- fabric yardage calculator quilting
- quilt backing calculator
- quilt binding calculator
- half square triangle calculator
- quilt border calculator
- quilt sashing calculator
- quilt block calculator
- quilt size calculator

These are proven query categories but competitive.

---

## Tier 2 — high-value problem queries

Potentially better early targets:

- how much fabric do I need for quilt blocks
- how much fabric for X quilt blocks
- how many squares can I cut from a yard
- how many 5 inch squares in a yard
- how many 10 inch squares in a yard
- fabric needed for 100 quilt squares
- quilt backing yardage for queen quilt
- quilt backing 42 inch fabric
- 108 backing vs pieced backing
- how many quilt blocks for queen size
- how many quilt blocks for throw size
- calculate fabric for self drafted quilt
- how to calculate quilt yardage by color
- quilt cutting layout calculator
- quilt fabric cutting diagram

---

## Tier 3 — educational/supporting queries

- what is WOF in quilting
- usable width of quilting fabric
- finished vs unfinished quilt block size
- why add half inch to quilt blocks
- quilt seam allowance
- how much extra backing for longarm quilting
- directional fabric quilting cutting
- grain direction quilting
- how much extra fabric should I buy for quilting

These pages build topical authority and support calculator use.

---

# 13. Recommended Launch Pages

The first launch should be deliberately small.

## Product pages

1. `/fabric-cutting-planner`
2. `/calculators/fabric-yardage`
3. `/calculators/quilt-backing`
4. `/calculators/quilt-binding`
5. `/calculators/half-square-triangle`
6. `/calculators/quilt-block-count`
7. `/calculators/borders`
8. `/calculators/sashing`

## Foundational guide pages

9. `/guides/width-of-fabric`
10. `/guides/finished-vs-cut-size`
11. `/guides/quilt-seam-allowance`
12. `/guides/backing-overage`
13. `/guides/how-to-calculate-quilt-yardage`

This is enough initial surface area to establish the site without producing thin mass content.

---

# 14. Programmatic SEO Rules

Do **not** launch hundreds of pages solely by swapping numbers or quilt sizes into templates.

Google explicitly warns against scaled low-value content.

Official guidance:

https://developers.google.com/search/docs/essentials/spam-policies  
https://developers.google.com/search/docs/fundamentals/using-gen-ai-content

A dynamic page is defensible only when it provides meaningfully different utility.

Potential future examples:

- standard quilt-size references;
- specific block-size planning pages;
- square-count tables;
- backing comparison pages.

But only create them when:

1. Search Console shows demand;
2. the page has useful unique computed data;
3. the page answers a real user task independently.

---

# 15. AdSense Strategy

Google states that content-rich pages improve contextual ad targeting.

Official guidance:

https://support.google.com/adsense/answer/81554

Therefore each tool page should include:

- immediately usable tool;
- short explanation;
- assumptions;
- worked example;
- relevant FAQs;
- links to related tools/guides.

Avoid pages that consist almost entirely of a form.

## Placement principles

Do not interrupt the main calculation flow.

Good candidates:

- after result;
- below explanation;
- between substantial guide sections;
- desktop side rail if layout permits.

Avoid:

- ads between user input and result;
- ad-heavy above-the-fold layouts;
- deceptive placement near calculation buttons.

The product must remain more pleasant than competitors.

---

# 16. Affiliate Revenue

Secondary, not core.

Potential natural adjacency:

- quilting rulers;
- rotary cutters;
- cutting mats;
- batting;
- backing fabric;
- wide-back fabric;
- quilting notions.

Affiliate links should only appear where they solve the next user task.

Example:

> Your quilt requires 94" backing width. A 108" wide backing avoids piecing.

This is commercially relevant without turning the site into an affiliate blog.

---

# 17. Technical Cost Model

The project can begin extremely close to **zero operating cost**.

## Free / open-source initially

- Astro as the static-first site framework
- TypeScript for all quilting/domain logic
- vanilla browser TypeScript for simple calculators where practical
- React only for the Fabric Cutting Planner if its stateful UI warrants it
- browser-side calculation engine
- SVG cutting diagrams
- GitHub
- Search Console
- Google Analytics
- localStorage
- SSL
- free static hosting tier
- AdSense application
- affiliate programs
- open-source math/optimization libraries if required

### Why Astro

This product is primarily an SEO/content site with bounded interactive tools. Astro preserves static HTML by default and allows JavaScript only where interaction requires it. Simple calculators should not incur a framework runtime merely for convenience. The complex planner may be implemented as a single React island if that materially simplifies state/UI management.

This architecture supports the product agenda:
- crawlable static content;
- minimal JavaScript;
- strong performance;
- no server dependency for core functionality.

## No required AI API

All core functionality should be deterministic.

This is preferable because it gives:

- zero inference cost;
- predictable answers;
- easier testing;
- faster UI;
- better trust.

## Likely unavoidable early cost

- domain registration

## Backend decision for V1

**There is no application backend in V1.**

The core product runs entirely in the browser:
- calculations;
- optimization;
- cutting-plan generation;
- project state;
- printing.

Persistence uses localStorage only.

V1 therefore requires:
- no database;
- no authentication;
- no application API;
- no server-side business logic;
- no AI API.

A backend may be introduced later only if a validated product requirement emerges, such as cloud saves, cross-device sync, persistent shared projects, accounts, payments, or community features. That future decision must pass the governing agenda's divergence/evidence check.

## Possible future costs

Only after growth or validated new requirements:

- hosting/bandwidth beyond free limits;
- database/auth if cloud features are deliberately added;
- email;
- advanced analytics;
- paid SEO tooling.

No paid API or proprietary dataset has emerged as necessary.

---

# 18. Analytics Plan

## Acquisition

Track:

- landing page;
- referrer;
- country;
- device.

## Calculator events

- calculator_view
- calculator_started
- calculator_completed
- advanced_settings_opened
- result_generated
- add_to_planner
- print_result
- share_result

## Planner events

- planner_started
- fabric_added
- piece_added
- optimization_started
- optimization_completed
- diagram_viewed
- planner_printed
- planner_shared

## SEO

Use Search Console for:

- query impressions;
- clicks;
- CTR;
- average position;
- page-level performance;
- country/device differences.

Official Search Console guidance confirms query-level analysis and filtering are available:

https://support.google.com/webmasters/answer/17010961  
https://support.google.com/webmasters/answer/17011259

---

# 19. Success Signals

Do not use pageviews alone.

Important product signals:

## Strong signals

- users complete calculations;
- users generate cutting plans;
- users print plans;
- users return;
- users use more than one calculator;
- users transfer results into planner;
- organic impressions expand into adjacent quilt-math queries.

## Especially valuable signal: print rate

Printing strongly implies:

> “I intend to use this output at my cutting table or fabric store.”

That is much more meaningful than a generic pageview.

---

# 20. Initial Evaluation Thresholds

These are operating guidelines, not universal statistical truths.

## After indexing

### Positive

- Search Console begins showing impressions across multiple quilt-math query clusters;
- some pages move toward top-20 positions;
- long-tail queries appear that were not explicitly targeted;
- users complete tools at meaningful rates;
- planner users print/share/save results.

### Warning

- pages are indexed but receive negligible impressions after a meaningful observation period;
- impressions exist but CTR is very weak due to dominant SERP incumbents;
- users abandon planner before result;
- cutting layouts are frequently overridden or distrusted.

### Strong negative

- arbitrary-piece planning turns out to be rarely used;
- existing free tools satisfy users just as well;
- practical cutting decisions require human judgment too often;
- broad query surface fails to materialize.

---

# 21. Kill / Narrow Criteria

Do not become emotionally attached to the niche.

Reconsider or narrow if:

1. indexed high-quality pages receive almost no relevant impressions;
2. the main planner receives traffic but poor completion;
3. users repeatedly reject the recommended cutting layouts;
4. quilting conventions create too many ambiguous cases to automate reliably;
5. our SEO footprint cannot grow beyond a handful of saturated calculator queries;
6. the site requires expensive paid acquisition to generate meaningful traffic.

Possible narrowing options if needed:

- self-drafted quilt yardage planning only;
- backing/binding authority site;
- quilt cutting optimizer only;
- precut-focused calculators;
- quilting math reference engine.

---

# 22. Moat

The code is **not** the moat.

Potential moat layers:

## 1. Unified calculation model

All calculators use one consistent domain engine rather than disconnected formulas.

## 2. Practical optimization

The planner produces usable cutting plans, not merely area calculations.

## 3. Explainability

Every result exposes assumptions and reasoning.

## 4. UX

Beginner-friendly defaults with expert overrides.

## 5. Domain knowledge encoded over time

Each discovered edge case improves the engine.

## 6. Search footprint

A growing set of genuinely useful pages around quilt math.

## 7. Habit

The long-term goal is:

> **“Before I buy fabric, I check this site.”**

That is much more durable than ranking one calculator page.

---

# 23. Domain / Brand Direction

Exact live domain availability should be checked at a registrar immediately before purchase; search-engine absence is not sufficient proof of availability.

## Avoid

- names that lock the site into backing only;
- names implying a full visual quilt designer;
- expensive aftermarket exact-match domains.

## Brand qualities

The name should communicate some combination of:

- quilting;
- planning;
- math;
- cutting;
- yardage;
- clarity.

## Naming directions to explore

- QuiltLogic
- QuiltMeasure
- QuiltPlanner / QuiltPlan variants
- QuiltCut
- QuiltYardage
- QuiltMath variants
- QuiltNumbers
- QuiltMap
- QuiltCalc variants

**Important:** “QuiltMath” is already in use at quiltmath.net, so it should not be treated as an available clean brand.

Source:

https://quiltmath.net/binding-calculator/

A separate naming/domain pass should be performed before purchase.

---

# 24. Key Competitive Matrix

| Competitor | Basic calculators | Multi-piece planning | Cutting diagrams | Quilt design | Free web | Main weakness/opportunity |
|---|---:|---:|---:|---:|---:|---|
| Quilt Calculator | Yes | Limited | Some | No | Yes | Mostly discrete calculators |
| Fabric Math Tools | Yes | Limited | Some | No | Yes | Calculator-directory feel |
| QuiltMetric | Yes | Mostly simple | Limited | No | Yes | Single-problem focus |
| Quilt Geek | Extensive | Stronger | Some | Some | Freemium/app | Paid product complexity |
| PreQuilt | Strong | Yes | Yes | Yes | Partial | Larger design workflow / paid features |
| QuiltSandwich | Yes | Yes | Yes | Limited | No | App purchase, not open web |
| Gibson Threads | Yes | Yes | Yes | Limited | Yes | Opportunity likely in UX/optimization depth |
| QuiltButler | Yes | Pattern-led | Yes | Yes | Partial | Pattern-centric rather than arbitrary-piece-first |
| Quiltler | Yes | Yes | Yes | Extensive | Freemium | Broad app scope / subscription |

**Interpretation:** The niche is competitive but fragmented. Our opportunity depends on being better at the specific **arbitrary piece-list → practical cutting plan** workflow and using SEO as distribution.

---

# 25. Remaining Research Limitation / Blocker

## Precise keyword volume

A reliable free source for exact monthly search volume has not been established.

Therefore:

- do not invent volume numbers;
- use SERP evidence for launch prioritization;
- launch a focused set of high-quality pages;
- let Search Console reveal actual query impressions;
- optionally use a paid Ahrefs/Semrush month later if the data would materially change investment decisions.

This is currently the **main unresolved business-confidence limitation**.

It is not a technical blocker.

---

# 26. Product-Owner Quilting Primer Required

Before implementation decisions, the product owner only needs enough domain knowledge to understand:

1. quilt top / backing / batting;
2. block;
3. finished vs cut size;
4. ¼" seam allowance;
5. WOF vs usable WOF;
6. selvage;
7. grain / bias;
8. directional fabric;
9. HST;
10. border;
11. sashing;
12. binding;
13. backing overage;
14. precuts.

This should take roughly one focused learning session, not learning quilting as a craft.

---

# 27. Codex Handoff — Required Contents

Do **not** hand Codex the conversation.

Give it a technical specification derived from this dossier.

The final handoff should include:

## Domain schema

Exact entities and fields.

## Calculator specifications

For every calculator:

- inputs;
- defaults;
- equations;
- rounding;
- outputs;
- validation;
- edge cases.

## Cutting optimizer specification

- allowed rotations;
- WOF handling;
- objective/scoring;
- deterministic heuristics;
- candidate-generation logic;
- fallbacks.

## UX flow

- simple mode;
- advanced mode;
- result presentation;
- print layout.

## Test vectors

Manually verified examples with exact expected outputs.

## Edge-case suite

Examples:

- piece wider than usable WOF;
- directional fabric;
- non-rotatable piece;
- mixed piece dimensions;
- WOF strip longer than fabric width;
- narrow fabric;
- zero safety margin;
- metric units;
- backing requiring multiple panels.

Codex should implement a resolved specification, not discover quilting conventions while coding.

---

# 28. Recommended Implementation Sequence

## Phase A — specification

1. Lock domain terminology.
2. Lock defaults and overrides.
3. Write formulas.
4. Create verified test cases.
5. Specify cutting-plan scoring.

## Phase B — core product

6. Single-piece yardage engine.
7. Multi-piece / single-fabric planner.
8. Actual cutting visualization.
9. Multiple fabrics.
10. Shopping list.
11. Explanation/assumption layer.
12. Print layout.

## Phase C — SEO tools

13. Fabric yardage calculator.
14. Backing calculator.
15. Binding calculator.
16. HST calculator.
17. Block-count calculator.
18. Borders.
19. Sashing.

## Phase D — launch content

20. WOF guide.
21. Finished vs cut-size guide.
22. Seam-allowance guide.
23. Backing-overage guide.
24. Yardage-calculation guide.

## Phase E — measurement

25. Search Console.
26. Analytics events.
27. Sitemap/indexing.
28. Launch.
29. Observe real query impressions.
30. Expand only where data justifies expansion.

---

# 29. What Not to Do

- Do not build a generic quilting blog.
- Do not publish hundreds of AI-generated pages.
- Do not require accounts.
- Do not build a quilt visualizer in V1.
- Do not chase exact global packing optimality.
- Do not hide assumptions.
- Do not claim one universal WOF/backing rule.
- Do not monetize so aggressively that the tool becomes annoying.
- Do not assume “calculator exists” means “problem solved.”
- Do not assume “people complain” means “SEO traffic is large enough.” Measure both.

---

# 30. Final Thesis

The strongest version of this business is not:

> **a website with quilting calculators**

It is:

> **the math layer for quilting**

The acquisition layer is free SEO calculators and explanatory reference pages.

The product layer is:

> **piece list → yardage → shopping quantity → practical cutting plan**

The long-term behavioral goal is:

> **“Before I buy or cut fabric, I use this site.”**

The project is technically feasible with deterministic math and heuristic rectangular cutting optimization. No paid API or expensive infrastructure is required for V1.

The problem is validated.

The competition is real.

The original “visual cutting diagram” feature is not unique, but the complete arbitrary-piece, quilt-aware, transparent, easy, free-web workflow remains a credible wedge.

The largest unresolved question is **how much organic search demand can ultimately be captured**, and the correct way to answer that without paying for questionable estimates is to launch a focused, excellent first cluster and use real Search Console impressions as the next decision signal.

## Current decision

# **GO**

—but build the focused cutting-planning workflow, not another generic calculator directory.
