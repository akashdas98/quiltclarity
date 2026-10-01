# QuiltClarity V1.1 — UX & Information Architecture Specification

**Status:** Production UX contract  
**Date:** 2026-08-17  
**Guides/help revision:** 2026-08-21

# 1. Governing UX principle

> **Make a complicated fabric decision feel like filling in a clean cutting worksheet.**

And preserve:

> **Math should disappear; assumptions should not.**

The product must be calm, practical, obvious, keyboard-efficient, mobile-safe, and trustworthy.

# 2. Site-level IA

Primary navigation:

- **Project Planner**
- **Calculators**
- **Guides**
- **How QuiltClarity Calculates**

Do not organize the site as a software dashboard.

## Homepage hierarchy

### H1 direction

**Plan the Fabric for the Quilt You’re Already Making**

### Supporting direction

> Enter the cuts your pattern or project needs, add the fabric you already have, and get one clear shopping and cutting plan.

### Primary CTA

**Plan a Quilt Project**

### Secondary CTA

**Choose a Calculator**

### Trust line

> Free · No account · Editable quilting assumptions

Avoid uniqueness/optimality claims.

Below hero:

1. three-step explanation;
2. key planner outcome example;
3. calculator grid;
4. trust/methodology section;
5. related guides.

# 3. Main planner structure

One continuous task page with visible sections, not a forced multi-screen wizard:

1. **Project**
2. **Fabrics**
3. **What fabric do you already have?** per fabric
4. **Cut requirements**
5. **Pattern yardage** optional
6. **Calculate plan**
7. **Results**

Users should be able to skip stock and pattern comparison and receive a fresh-bolt plan.

# 4. Desktop layout

Before results:

- main central work area;
- fabric summary side panel only if genuinely helpful;
- cut-list table gets width priority.

After results:

- compact/sticky project result summary may appear;
- detailed outputs remain in normal reading flow.

Do not squeeze the cut-list compiler into narrow cards just to preserve a sidebar.

# 5. Mobile layout

Order:

1. project basics;
2. fabrics;
3. stock;
4. cut list;
5. optional pattern info;
6. Calculate;
7. project status;
8. shopping;
9. comparisons;
10. allocations;
11. cutting plan;
12. assumptions/warnings;
13. print/copy.

No horizontal-only table interaction. Rows become editable cards or a purpose-built compact responsive table.

# 6. Fabric UX

Fabric header:

> **Background**  
> 40" usable WOF · Non-directional · 2 stock pieces

Primary visible:

- fabric name;
- usable WOF;
- add stock;
- pattern amount optional entry.

Advanced:

- nominal width;
- directional;
- default rotation;
- safety;
- purchase increment;
- pattern-assumed WOF.

Explain:

> **Usable WOF** is the width available for cutting after any selvage you plan to remove.

# 7. Stock UX

Do not call the feature “stash management.”

Section language:
**Fabric you already have**

Actions:

- Add fat quarter
- Add fat eighth
- Add partial yardage
- Add custom piece

Every preset shows editable dimensions immediately.

Example:

> Fat quarter  
> 18" × 21"  
> **Edit dimensions**

Multiple pieces must be visually distinct:

- Remnant 1
- Remnant 2
- Fat quarter 1

Quantity can duplicate identical physical pieces, but result allocations must still identify each resulting bin/instance.

# 8. Cut-list compiler UX

This is the highest-priority interaction.

Columns desktop:
`Fabric | Piece | Qty | Width | Height | Cut/Finished | More`

Requirements:

- fast keyboard sequence;
- default next row inherits sensible unit/fabric context but never hidden dimensions;
- duplicate row;
- delete with undo/toast where practical;
- paste spreadsheet rows.

The user must be able to enter a 20–40-row pattern without feeling like they are filling 20–40 separate web forms.

## Paste flow

CTA:
**Paste from spreadsheet**

Show expected layout.

Paste → preview table:

- valid rows;
- highlighted invalid cells;
- explicit fabric mapping if a pasted fabric name does not match;
- Confirm import.

Never parse arbitrary prose/PDF text in this workflow.

# 9. Pattern yardage UX

Optional, per fabric.

Collapsed by default:
**Compare with pattern yardage (optional)**

Fields:

- Pattern says
- Pattern usable WOF (if known)

Helper:

> QuiltClarity compares this with a fresh-fabric plan based on the cuts and assumptions you entered. A difference does not necessarily mean the pattern is wrong.

# 10. Calculate behavior

Primary:
**Calculate Project Plan**

Do not recompute the complex planner on each keystroke.

After input change:

- keep existing result visible but mark **Plan needs recalculation**;
- primary button **Recalculate**.

Preserve data on error.

# 11. Results hierarchy

## 11.1 Project status

Examples:

> **You have enough fabric for every planned cut.**

or

> **You need additional fabric for 2 of 4 fabrics.**

## 11.2 Shopping list

Largest actionable commercial output.

Example:

| Fabric     | Buy now |
| ---------- | ------: |
| Background |    ⅜ yd |
| Blue print | Nothing |
| Binding    |    ⅝ yd |

Use **No additional purchase** rather than `0 yd` where conversationally clearer.

## 11.3 Per-fabric decision card

Order:

- Buy now
- You entered on hand
- Fresh-fabric plan
- Pattern says (if supplied)
- Difference/explanation
- assumptions

Example conceptual copy:

> **Background — Buy ⅜ yd**  
> Your entered remnants cover 42 of 48 pieces. The remaining 6 fit in a 10" bolt-length plan; with your purchase increment, buy ⅜ yd.

## 11.4 Existing-stock allocation

Tabs/sections per physical stock piece.

Show:

- stock label/dimensions;
- placed pieces;
- useful remaining regions where practical.

## 11.5 Purchased fabric

Show exact raw planned length and rounded buy amount separately.

## 11.6 Cutting instructions + diagram

Instructions first enough to be actionable, diagram alongside/below.

# 12. Yardage comparison language

Allowed:

- Pattern says
- Based on your entered cuts
- Planned fresh-fabric requirement
- With 5% safety
- Recommended purchase
- Difference

Avoid:

- Wrong
- Error
- True amount
- Exact minimum
- Pattern overcharged you

If assumptions differ:

> “The pattern appears to assume 44" usable WOF; your plan uses 40", so the amounts are not directly comparable.”

# 13. Safety UX with stock

When stock fully fits:

> **No additional purchase needed**

If safety >0:

> Your 5% safety setting applies to new fabric purchases. It does not add extra material to fabric you already own.

Do not turn a fully covered project into a nonzero purchase solely because of safety.

# 14. Standalone calculator pattern

Every calculator:

1. H1/task description
2. calculator near top
3. result
4. assumptions
5. “Why this answer?”
6. worked example
7. related guide/tool
8. relevant project-planner bridge only when natural

Calculators are useful even if the user never opens the planner.

# 15. Specific calculator UX changes

## Backing

Hero:

> **Uses least fabric: 5 yd · Vertical seams · 2 panels**

Also show alternative.

Never:

> Recommended: 5 yd

without qualification.

## Batting

Hero:

> **Batting size: 68" × 88"**

If roll width:

> **Cut 88" from a 72" roll**

Overage helper:

> 4" per side is an editable longarm-oriented default; check your quilting setup or longarmer.

## HST / QST / Flying Geese

Sizing selector:

- **Trim-friendly** default
- **Standard**

Never “Exact.”

Always display:

- finished;
- unfinished/trim;
- starting cut sizes;
- batch yield;
- requested;
- produced;
- excess.

Flying Geese additionally shows method and 2:1 scope.

## Pieces from Fabric

Two modes:

- **How many fit?**
- **Can I cut this many?**

Show visual layout.

# 16. Advanced settings

Collapsed by default but summarized inline:

> 40" usable WOF · ¼" seam · 5% purchase safety · ⅛ yd rounding

Settings must be near the object they affect; avoid one giant global settings modal.

# 17. Validation

Errors adjacent to fields and summarized near Calculate.

Examples:

> This piece cannot fit across the available width in any allowed orientation.

> “Blue” from your pasted list does not match a project fabric. Choose a fabric before importing.

> Flying Geese in this calculator must use a 2:1 finished width-to-height ratio.

# 18. Loading/performance state

Local calculation:

- inline progress;
- no network-looking spinner language;
- for large plans:
  > **Planning a larger project…**

If guardrail fallback is used:

> This larger project used the practical grouped planning mode.

Do not imply lower correctness.

# 19. Print

Remove:

- navigation;
- ads;
- irrelevant guide text;
- editing controls.

Include:

- project name;
- date;
- shopping list;
- pattern comparison if used;
- assumptions;
- each stock allocation;
- purchased layout;
- cutting instructions;
- warnings.

Must work in grayscale.

# 20. Accessibility

- semantic table headers on desktop;
- mobile cards preserve labels;
- keyboard ordering follows visual task;
- visible focus;
- errors announced;
- diagram has text equivalent;
- zoom/pan does not trap keyboard;
- no color-only fabric identification.

# 21. Empty/recovery states

Old saved project migration:

- restore automatically when compatible;
- if migration fails, do not silently discard;
- show recovery explanation and preserve any safely recoverable inputs.

No decorative empty-state artwork required.

# 22. Product copy guardrails

Do not claim:

- mathematically perfect cutting;
- guaranteed minimum yardage;
- the only quilting optimizer;
- patterns are generally inaccurate;
- stock is “saved” merely by area math.

Prefer:

- practical plan;
- based on your inputs;
- uses least fabric among displayed candidates;
- additional purchase;
- planned requirement;
- editable assumptions.

# 23. Guides as the product learning system

The Guides area is a first-class part of product UX.

Its primary question is:

> **How do I use QuiltClarity to get this quilting job done?**

not merely:

> “What does this quilting term mean?”

The full IA/content contract is `08_GUIDES_AND_CONTEXTUAL_HELP_SPEC.md`.

## 23.1 Learning order

A first-time user should naturally move through:

1. What QuiltClarity does
2. Quick Start: plan one example project
3. Start a project
4. Add/configure fabrics
5. Enter cut requirements
6. Add fabric already owned
7. Optional pattern yardage comparison
8. Calculate/recalculate
9. Read shopping/fresh-plan/pattern results
10. Read stock allocations
11. Read the cutting plan
12. Print/use the plan
13. Common special cases
14. Deeper quilting reference when needed

Teach in the order the product is used.

## 23.2 Layered help model

Use four levels.

### Level 1 — Visible inline guidance

Use when misunderstanding can easily produce a wrong input/result.

Examples:

- usable WOF;
- finished vs cut dimensions where the mode is chosen;
- safety only affecting new purchases;
- pattern comparison caveat where the comparison is shown.

### Level 2 — Contextual `?` help

Use for important concepts that benefit from explanation but should not dominate the form.

The control must:

- be a real focusable button;
- have a specific accessible name such as `Help: Usable WOF`;
- work on click/tap;
- work by keyboard;
- support focus/hover as supplementary desktop behavior;
- close predictably by Escape and/or the same control;
- not require pointer hover to obtain important information.

Popover content:

- plain-language definition;
- what the field/result changes;
- one important caveat when necessary;
- optional **Learn more** link.

### Level 3 — Exact guide deep link

`Learn more` must go to the exact relevant guide or anchor, not merely `/guides`.

Examples:

- `.../project-planner-tutorial#usable-wof`
- `.../project-planner-tutorial#finished-vs-cut`
- `.../project-planner-tutorial#purchase-safety`
- `.../project-planner-tutorial#pattern-says`
- `.../project-planner-tutorial#buy-now`

Persist planner state before navigation so returning does not destroy the user's work.

### Level 4 — Full guide/reference

Contains:

- complete explanation;
- worked example;
- edge cases;
- related settings/results;
- next step.

## 23.3 Help-density rule

Do not put a `?` icon beside every label.

Add contextual help when at least one is true:

- term is quilting-specific;
- term has a non-obvious QuiltClarity meaning;
- wrong interpretation affects calculation;
- result labels are easy to confuse;
- default is a convention rather than truth;
- users need to understand why the output differs from a pattern or another calculator.

Keep obvious controls obvious.

# 24. Contextual help on results

Results need help too.

At minimum provide contextual explanation for:

- **Fresh-fabric plan**
- **Pattern says**
- **Recommended purchase**
- **Buy now / No additional purchase**
- **You entered on hand**
- **Safety allowance**
- **Practical optimized plan**
- **Uses least fabric / Lowest-yardage option**

Important example distinction:

**Fresh-fabric plan**

> What these entered cuts would require if this fabric were purchased new under the current assumptions.

**Buy now**

> What remains to purchase after QuiltClarity accounts for the fabric you entered as already owned.

**Pattern says**

> The amount supplied from the pattern, shown for comparison. A difference does not automatically mean the pattern is wrong.

# 25. Calculator-page contextual help

Each calculator must teach enough to use it correctly without requiring a separate guide visit.

For each important field/result:

- visible helper when correctness demands it;
- `?` help where extra context is useful;
- exact guide/reference link where a deeper explanation exists.

Calculator-specific method/scope warnings remain visible, not tooltip-only.

Examples:

- Backing: usable width, overage, panel join SA, “uses least fabric.”
- Batting: overage and roll width.
- Binding: strip width, straight-grain scope.
- HST/QST/Flying Geese: finished size, Trim-friendly vs Standard, batch yield.
- Pieces from Fabric: stock dimensions, directionality/rotation.

# 26. Guide navigation UX

Sequential learning pages:

- show **Previous** and **Next** at the bottom;
- show a compact learning-path indicator or section label near the top;
- do not trap users into a wizard—every guide remains directly addressable by URL;
- preserve normal browser back/forward behavior;
- avoid huge sidebars on mobile.

A Guide landing from search must still make sense independently and provide a clear route into the relevant product/tool.
