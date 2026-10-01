# Guides/help last-fix visual review

**Saved:** 2026-09-22  
**Purpose:** Owner review checklist for the final contextual-help coverage,
wrapping, tooltip, responsive, and print corrections. Return this checklist to
the owner when requested.

Use the local site at `http://localhost:4322/` while the development server is
running.

## 1. Planner fields and actions

Open `/fabric-cutting-planner/`. Confirm every input, select, checkbox, and
textarea has a nearby `?`. Action buttons must not have a separate `?`;
hovering them or focusing them with the keyboard should show a short tooltip.
Check advanced settings, stock pieces, cut rows, import, calculate, reset,
duplicate, delete, print, copy, share, and edit.

## 2. Planner results

Calculate a plan and confirm help appears for the major result concepts:

- Shopping list
- Buy now
- Raw additional plan
- With safety
- Fresh-fabric plan
- Pattern comparison
- Existing-stock allocations
- Purchased fabric and cutting instructions
- Leftovers, assumptions, warnings, and efficiency details

Repeated rows need help only at their shared heading, not on every item.

## 3. Other calculators

Open several calculators, ideally Fabric Yardage, Backing, and Pieces from
Fabric. Confirm:

- Every field has `?` help.
- Buttons have no separate `?`; the button itself shows a short tooltip on
  hover or keyboard focus.
- After calculation, each distinct result label has help.
- Copy, print, reset, calculate, and Add to planner buttons expose their short
  tooltip where present.

## 4. Wrapping

Check desktop and a narrow/mobile window:

- `Buy now ?` remains together.
- Other short label-plus-help combinations do not split awkwardly.
- Every visible `?` shares the rendered line of the target's final text; none
  appears alone on the following line.
- Every `?` sits immediately after its target text without a large flexible
  gap.
- Every `?` is vertically centered with the target text; check both headings
  and smaller labels for upward or downward offsets.
- Long labels may wrap normally without causing horizontal page overflow.
- The page remains within the mobile viewport.

For repeated content, confirm help appears once in the table header. If there
is no shared header, confirm it appears only in the first repeated fabric,
stock piece, cut-options group, result card, or material plan rather than in
every repeated item.

## 5. Tooltip behavior

Open help near the left, right, top, and bottom edges. Confirm:

- Text wraps inside the tooltip.
- There is no horizontal tooltip scrollbar.
- The tooltip remains inside the viewport.
- Long content scrolls vertically only when the available height requires it.
- Escape closes it and returns keyboard focus to the `?`.
- Clicking elsewhere closes it.

For action buttons, confirm the tooltip has no Learn more link and does not
interfere with clicking or keyboard activation.

## 6. Print preview

Generate a planner result and open Print. Confirm no `?` buttons or tooltip
text appear in the printed plan and the existing diagram/page layout remains
intact.

## Reporting a failure

Record the route, label or button name, viewport size, observed behavior, and a
screenshot when practical.
