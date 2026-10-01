# QuiltClarity V1.1 — UX & Information Architecture Specification

**Status:** Production UX contract  
**Date:** 2026-08-17

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

Semantic nesting must not become visual card nesting. Keep fabrics, stock
pieces, cut rows/options, allocation plans, comparison facts, and text-plan
groups encapsulated for structure and accessibility, while presenting nested
levels as full-width vertical sections with top separators and no side borders
or repeated horizontal padding. First-level Project, individual Fabric, Cut
requirements, summary, and per-fabric result groups retain their four-sided card
boundary and padding. The planner intro, helper, form, results, and supporting
content share one centered work-column width rather than independent local caps.

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
- persistent visible labels beside or above every editable control; desktop
  labels sit directly above controls rather than depending on a distant table
  header;
- default next row inherits sensible unit/fabric context but never hidden dimensions;
- duplicate row;
- delete with undo/toast where practical;
- paste spreadsheet rows.

Desktop row validation spans the complete affected row and lists simultaneous
field errors vertically with each message beginning with its visible field
name. At the card breakpoint, each message returns below its own label/control
pair but aligns to the control column. At the narrowest breakpoint, labels stack
above full-width controls. Field-local errors omit their redundant field-name
prefix at both card compositions. Editing an invalid field dismisses only that
field's stale presentation;
successful recalculation clears all invalid state and moves focus to the results.
An unsuccessful calculation keeps focus on the first invalid control.

The user must be able to enter a 20–40-row pattern without feeling like they are filling 20–40 separate web forms.

## Paste flow

CTA:
**Paste from spreadsheet**

Show expected layout.

State visibly that CSV and tab-separated spreadsheet values are supported and
that the format is detected automatically. The input keeps tabular rows intact
with horizontal scrolling on narrow screens rather than wrapping columns into
ambiguous visual rows.

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
