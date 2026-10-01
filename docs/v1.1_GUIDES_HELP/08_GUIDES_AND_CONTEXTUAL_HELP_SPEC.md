# QuiltClarity V1.1 — Guides & Contextual Help Specification

**Status:** Governing product-learning contract  
**Revision date:** 2026-08-21

# 1. Objective

A person who has never used QuiltClarity must be able to open **Guides** and learn the app from scratch.

The Guides system is not primarily a quilting-fundamentals library.

Its primary purpose is:

> **Teach users how to use QuiltClarity to complete real quilting jobs.**

Quilting fundamentals remain a supporting Reference layer and SEO/trust surface.

# 2. Teaching principle

> **Teach in the same order the user uses the product.**

Do not make users learn abstract theory before showing them the job.

When theory matters, introduce it at the exact step where it affects an input or result, then link to deeper reference.

# 3. Three-layer Guides IA

## 3.1 Start Here / Learn QuiltClarity

Prominent first section on `/guides`.

Required:

1. **Getting Started / Quick Start**
   - what QuiltClarity is;
   - what it is not;
   - what you need before starting;
   - one complete representative example from blank project to shopping/cutting output;
   - intentionally short enough to complete in one sitting.

2. **Full Project Planner Tutorial**
   - authoritative field-by-field;
   - result-by-result;
   - table of contents;
   - stable anchored subsections;
   - all important fields/settings;
   - complete result interpretation;
   - common mistakes;
   - special cases;
   - print/use flow.

3. Focused product guides:
   - Enter a Cut List
   - Add Fabric You Already Have
   - Check Pattern Yardage
   - Read Your Shopping Plan
   - Read Your Cutting Plan
   - Print Your Project Plan

## 3.2 Common Workflow Guides

Teach jobs rather than controls:

- Turn a Pattern Cut List into One Plan
- Do I Have Enough Fabric?
- Use Remnants Before Buying More

These may reuse the same domain engine; the guide is a different user entry point, not a new feature.

## 3.3 Quilting Reference

Secondary category:

- Width of Fabric / usable WOF
- Finished vs Cut Size
- Seam Allowance
- Backing Overages
- Batting Overages
- Directional Fabric
- Fat Quarter Size
- other locked reference content

Reference explains the quilting concept; product tutorial explains how QuiltClarity uses it.

# 4. Quick Start contract

Route:
`/guides/getting-started`

A novice should finish with:

- a project created;
- at least one fabric;
- at least several cut requirements;
- optional existing fabric entered;
- calculation performed;
- Buy now understood;
- cutting plan located.

Use one consistent worked example.

Quick Start should not explain every advanced setting.

Each advanced concept links to the full tutorial/reference.

End with:

- **Next: Full Project Planner Tutorial**
- **Open Project Planner**

# 5. Full Project Planner Tutorial contract

Route:
`/guides/project-planner-tutorial`

This is the canonical field/result manual.

Required top-level order:

1. Before you begin
2. Project and units
3. Fabrics
4. Nominal vs usable WOF
5. Directional fabric / rotation
6. Purchase safety and rounding
7. Fabric you already have
8. Stock presets and custom dimensions
9. Cut requirements
10. Piece label
11. Quantity
12. Width / height
13. Cut vs finished dimensions
14. WOF strips / orientation constraints when exposed
15. Spreadsheet paste
16. Pattern yardage comparison
17. Calculate / recalculate
18. Project status
19. Shopping list
20. Buy now
21. Fresh-fabric plan
22. Pattern says
23. Existing-stock allocations
24. Purchased-fabric layout
25. Cutting instructions
26. Leftovers
27. Assumptions/warnings
28. Print
29. Common errors
30. Common special cases

Use stable IDs, including at minimum:

- `#usable-wof`
- `#directional-fabric`
- `#purchase-safety`
- `#fabric-you-have`
- `#cut-vs-finished`
- `#paste-cut-list`
- `#pattern-yardage`
- `#buy-now`
- `#fresh-fabric-plan`
- `#pattern-says`
- `#stock-allocation`
- `#cutting-plan`
- `#print-plan`

Contextual help may depend on these anchors.

Do not rename/remove them casually.

# 6. Field-by-field tutorial template

For each important field:

## Field name

**What it means**  
Plain language.

**What to enter**  
Concrete instruction.

**Default**  
If relevant.

**When to change it**  
Real situations.

**What it changes**  
Calculation/result consequence.

**Example**  
One realistic value.

**Common mistake**  
Only when useful.

**Related reference**  
Optional deeper quilting concept.

Do not pad obvious fields with unnecessary prose.

# 7. Result-by-result tutorial template

For each important result:

**What this number/section means**

**What it includes**

**What it does not mean**

**What to do with it**

**Why it may differ from another number**

Required distinctions:

- Pattern says ≠ Fresh-fabric plan
- Fresh-fabric plan ≠ Buy now
- Raw planned purchase ≠ purchase-rounded amount
- Existing-stock fit ≠ extra safety material

# 8. Contextual help registry

Implement contextual help from a controlled registry/data structure rather than ad-hoc inconsistent strings where practical.

Each entry conceptually contains:

- stable `helpKey`;
- short title;
- concise explanation;
- optional caveat;
- exact guide/reference URL;
- optional analytics-safe key.

Examples:

```text
usableWof
cutVsFinished
directionalFabric
purchaseSafety
patternSays
freshFabricPlan
buyNow
practicalOptimization
backingLeastFabric
hstSizingMode
qstSizingMode
flyingGeeseSizingMode
```

Do not use user-entered text as a help key.

# 9. Contextual-help UI contract

Use a `?`/help control where appropriate.

It must:

- be focusable;
- have a meaningful accessible name;
- work with mouse, touch and keyboard;
- not rely on hover;
- remain readable at mobile widths;
- not cover the field/control being explained when avoidable;
- close predictably;
- maintain logical focus;
- expose a normal crawlable/deep-linkable **Learn more** anchor when deeper content exists.

Hover may open/show on desktop as a convenience, but hover cannot be the only trigger.

# 10. Essential-info rule

If misunderstanding can directly cause an incorrect calculation or dangerously misleading interpretation, do not hide the entire warning behind `?`.

Keep the critical instruction/caveat visible.

Examples:

- pattern comparison does not prove pattern error;
- directional constraints;
- method scope limitations;
- safety applies to new purchase, not magically to existing stock.

The help popover may elaborate.

# 11. Tool-page educational contract

Every calculator/tool page should be self-sufficient for normal use.

A search visitor must not need to visit Guides before they can act correctly.

Each tool page contains:

- concise what-this-tool-does copy;
- inline help for crucial assumptions;
- contextual help on unfamiliar fields/results;
- “Why this answer?” / methodology;
- worked example;
- limitations;
- deeper guide/reference links.

Do not duplicate the entire full tutorial on the tool page.

# 12. Contextual help coverage — Project Planner

At minimum evaluate/add help for:

- Unit system when non-obvious consequences exist
- Nominal width
- Usable WOF
- Directional fabric
- Rotation
- Safety allowance
- Purchase increment
- Stock piece dimensions
- Fat quarter/fat eighth presets
- Cut vs finished
- WOF strip
- Pattern says
- Pattern-assumed WOF
- Fresh-fabric plan
- Buy now
- Existing-stock allocation
- Practical optimized plan
- Leftover summary

Not every row-control needs a help icon.

# 13. Contextual help coverage — Calculators

## Fabric Yardage

- usable WOF
- rotation/directional
- finished/cut
- safety/rounding

## Backing

- overage
- usable backing width
- panel join SA
- seam orientation
- Uses least fabric

## Batting

- overage
- roll width
- no pieced-batting scope

## Binding

- strip width
- straight/cross-grain scope
- extra allowance

## HST/QST/Flying Geese

- finished size
- unfinished/trim size
- Standard vs Trim-friendly
- batch yield
- method-specific warnings

## Borders/Sashing

- finished vs cut widths
- assembly-scope assumptions
- WOF join behavior where shown

## Pieces from Fabric

- stock geometry
- rotation
- directional constraints
- “How many fit?” vs “Can I cut this many?”

# 14. Guide continuity

Sequential product-learning guides:

- Previous / Next links;
- “Back to Guides”;
- relevant tool CTA;
- stable page titles;
- clear category label.

Workflow/reference pages do not need forced sequence when no natural sequence exists.

# 15. Search-entry behavior

A user who lands directly on:

- a product tutorial;
- workflow guide;
- reference article

from search must understand:

- the immediate topic;
- why QuiltClarity is relevant;
- what next action is available.

Do not write guide introductions that only make sense if the user came from `/guides`.

# 16. State-preservation rule

Contextual Learn more links may navigate away from the planner.

Before navigation:

- current valid project state must already be persisted according to existing local-persistence rules.

Returning must not silently erase work.

Do not require opening new tabs to preserve state.

# 17. Content source-of-truth rule

The app, Guides and Golden/domain docs must not drift.

When a guide explains a domain rule:

- use the current Golden Rules;
- distinguish default from truth;
- avoid inventing new quilting conventions.

When UI names change:

- update the guide and contextual registry in the same change.

# 18. Accessibility

Required:

- help buttons accessible by keyboard;
- focus visible;
- popover content associated with the trigger;
- Escape/close behavior;
- no hover-only content;
- headings/TOC semantic;
- anchored sections land with content visible below sticky headers;
- Previous/Next labels descriptive;
- diagrams have textual alternatives.

# 19. Guide manual-test requirement

All behavior in this document must be represented in `09_MANUAL_TEST_PLAN.md`.

Codex must not mark this overhaul complete after only route/build/unit tests.

# 20. Acceptance

PASS only when:

- `/guides` clearly presents Start Here / Common Workflows / Quilting Reference;
- Quick Start takes a novice from zero to one completed representative plan;
- full planner tutorial covers all important fields and outputs;
- contextual help exists at important confusion points;
- help works on touch + keyboard, not just hover;
- exact deep links land correctly;
- tool pages remain independently understandable;
- app/guide terminology agrees;
- project state survives guide navigation;
- manual tests pass;
- the owner-operated from-zero and result-comprehension cases pass under the
  analytics validation gate; automation alone cannot pass them, and the result
  must not be represented as independent novice evidence.
