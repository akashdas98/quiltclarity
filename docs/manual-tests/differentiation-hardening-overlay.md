# Differentiation Hardening Overlay — Manual Test Guide

Use this checklist to manually review the user-facing changes introduced by `docs/product/quilt_CODEX_differentiation_hardening_overlay.md` and the later review corrections to efficiency details, units, emphasis, and the text version of the cutting diagram.

This guide does not cover the later SVG piece/scrap label rotation and scaling work.

## 1. Start with a clean planner

1. Run `npm run dev` from the repository root.
2. Open the local URL printed by Astro, then visit `/fabric-cutting-planner/`.
3. Use a private browser window or clear the site's stored planner data before starting.
4. Set **Measurements** to **Inches and yards**.
5. Leave **Seam allowance** at `0.25`. Every fixture below uses **Cut size**, so seam allowance must not change the entered dimensions.

For every imperial fixture unless stated otherwise, configure the fabric as follows:

- Fabric name: `Fabric A`
- Usable width: `40`
- Advanced settings → Nominal fabric width: `42`
- Directional fabric: off
- Allow piece rotation by default: off
- Safety allowance: `0`
- Purchase increment: `0.125 yd`

For every ordinary piece group:

- Entered size: **Cut size**
- Rotation: **Do not allow**
- Orientation: **No constraint**
- Width-of-fabric strip: off

## 2. Confirm the positioning copy

1. Visit the homepage.
2. Confirm the hero says that pieces from each fabric are planned together rather than calculated one at a time.
3. Confirm the Fabric cutting planner card explains that different rectangular piece groups are jointly planned so compatible leftover space can become useful cuts.
4. Return to the planner.
5. Confirm the introduction says that fabrics remain separate while each fabric's different piece groups are planned together.
6. Confirm the page still leads with the normal planner workflow; there is no new required optimization setting, account prompt, or optimizer-strategy control.

## 3. Primary UI review: 30″ versus 40″

This is the main visual-review fixture. The quantity for **C is 4**. If C is entered as 2, the correct result is the different fixture in section 4.

Add these piece groups to Fabric A:

| Label | Quantity | Width | Height |
| ----- | -------: | ----: | -----: |
| A     |        2 |   25″ |    10″ |
| B     |        2 |   10″ |    10″ |
| C     |        4 |    5″ |    10″ |

Then select **Calculate Cutting Plan**.

### Shopping result

Confirm:

- The shopping quantity remains the first and most prominent result.
- It says **Buy 7/8 yd of Fabric A**.
- Calculated plan length and the 0% buffered length are both **30″**.
- The recommendation is 7/8 yd because 30″ must round upward to the next 1/8-yard increment: 31.5″.

### Efficiency and method details

Open **Efficiency and method details** and confirm the highlighted summary contains all of the following:

- **Combined planning uses 10″ less fabric length**
- Recommended plan: **30″** · Separate piece groups: **40″**
- **25%** less raw fabric length than planning each piece group separately.
- Used length: **30″**
- Waste area: **300 in²**

Also confirm:

- The percentage sentence has the same font size as the recommended/separate-plan sentence.
- The comparison and used/waste facts are inside one highlighted block.
- The important numbers are bold.
- No `mm²` value appears anywhere in the visible result.
- The comparison appears below the shopping result, not above it.

Under **Why this result?**, confirm the text explains that the planner:

- chose the valid practical strip-based candidate with the best deterministic score;
- added safety allowance and rounded upward to the purchase increment; and
- describes the result as a practical optimized plan, not a mathematically proven global optimum.

### Text version of cutting diagram

Open **Text version of cutting diagram** and confirm it is divided into readable sections rather than one dense paragraph:

- overview facts;
- piece groups; and
- strip-by-strip placement.

The overview should report:

- Usable width: **40″**
- Used length: **30″**
- Pieces: **8**
- Strips: **3**

Confirm labels, quantities, dimensions, strip numbers, positions, and unused-width values are bold where important. The cards/lists should have enough spacing to scan comfortably.

## 4. Legacy D01 check: 20″ versus 40″

Starting from section 3, change only C's quantity from `4` to `2`, then recalculate.

Confirm:

- Shopping quantity: **Buy 5/8 yd of Fabric A**.
- Combined planning uses **20″** less fabric length.
- Recommended plan: **20″** · Separate piece groups: **40″**.
- **50%** less raw fabric length than planning separately.
- Used length: **20″**.
- The summary says **No unused area**; it must not say `0 mm²`, `0 in²`, or `Waste area: 0`.
- The text version reports **6 pieces** and **2 strips**.
- Each strip contains one A, one B, and one C and uses the full 40″ usable width.

This is legacy diagnostic D01. A 20″/40″ result is correct only when C has quantity 2; it is not the expected result for section 3.

## 5. Unit-aware waste display

1. Restore the section 3 fixture by changing C's quantity back to `4` and recalculate.
2. Confirm imperial waste is **300 in²**.
3. Change **Measurements** to **Centimetres and metres**.
4. Recalculate if the results are cleared.
5. Open **Efficiency and method details**.

Confirm:

- Waste area is **1935.5 cm²**.
- The result does not expose `193548 mm²`.
- Lengths use metric display units consistently.

Return to **Inches and yards** before continuing.

## 6. D02: do not manufacture savings

Replace the piece groups with:

| Label | Quantity | Width | Height |
| ----- | -------: | ----: | -----: |
| A     |        4 |   20″ |    10″ |
| B     |        4 |   20″ |    10″ |

Recalculate and open **Efficiency and method details**.

Confirm:

- The copy says **Combined planning uses the same fabric length**.
- Recommended plan: **40″** · Separate piece groups: **40″**.
- There is no positive-savings headline or percentage.
- Used length is **40″**.
- The summary says **No unused area**.

## 7. Single-group behavior

Remove B so only A remains, and change A to `10″ × 10″`, quantity `4`. Recalculate.

Confirm:

- The shopping and cutting results still work normally.
- No **Combined planning comparison** section appears because there is only one piece group.
- Efficiency facts still show used length and unused area correctly.
- No joint-planning savings claim appears.

## 8. D03: directional constraints remain truthful

Create a fresh Fabric A fixture with:

- Directional fabric: on
- Allow piece rotation by default: off
- Safety allowance: `0`

Add:

| Label | Quantity | Width | Height |
| ----- | -------: | ----: | -----: |
| A     |        2 |   30″ |    20″ |
| B     |        2 |   15″ |    10″ |

Use **Cut size** and **Do not allow** rotation for both groups. Recalculate.

Confirm:

- Used length is **50″**.
- Recommended and separate-group lengths are both **50″**.
- The comparison is neutral; it does not claim savings.
- Neither the cutting instructions nor the structured text placement marks a piece as rotated.
- The assumptions identify the directional/no-rotation constraint.

## 9. D04: WOF strips retain their semantics

Create a fresh non-directional Fabric A fixture with:

| Label     | Quantity | Width | Height | WOF strip |
| --------- | -------: | ----: | -----: | --------- |
| WOF strip |        2 |   40″ |   2.5″ | on        |
| A         |        2 |   30″ |    10″ | off       |
| B         |        2 |   10″ |    10″ | off       |

Disable rotation for the ordinary pieces and recalculate.

Confirm:

- Each WOF strip occupies a whole 40″-wide row and is never rotated.
- The two ordinary rows each combine one A and one B.
- Recommended plan: **25″**.
- Separate piece groups: **35″**.
- Combined planning uses **10″** less fabric length.
- The displayed percentage is **29%** after whole-number display rounding.
- Used length is **25″** and the summary says **No unused area**.

## 10. D05: comparison state stays per fabric

Create two fabrics.

Fabric A:

| Label | Quantity | Width | Height |
| ----- | -------: | ----: | -----: |
| A     |        2 |   30″ |    10″ |
| B     |        2 |   10″ |    10″ |

Fabric B:

| Label      | Quantity | Width | Height |
| ---------- | -------: | ----: | -----: |
| Only group |        4 |   10″ |    10″ |

Use the common 40″-usable-width, 0%-safety, no-rotation settings for both fabrics. Recalculate.

Confirm:

- Fabric A reports recommended **20″**, separate groups **30″**, and **10″** less raw length.
- Fabric B has no comparison module because it contains one group.
- Fabric B does not inherit Fabric A's savings text or values.
- No project-level “total fabric saved” number combines the two fabrics.
- Each fabric retains its own shopping result, cutting instructions, diagram, text version, and efficiency facts.

## 11. Optional analytics privacy check

Perform this only when reviewing analytics behavior locally.

1. Give the project, fabric, pieces, and notes obviously private test strings.
2. Calculate a plan with a real positive comparison, such as section 3.
3. In browser developer tools, inspect the latest `optimization_completed` entry in `window.dataLayer`.

Confirm it contains only the coarse fields:

- `name: "optimization_completed"`
- `comparison_outcome: "combined_shorter"`
- `savings_band: "over_20_percent"`

Confirm it does not contain project names, fabric names, piece labels, notes, dimensions, quantities, exact lengths, waste area, cutting geometry, or monetary values.

## 12. Responsive and print review

Using the section 3 fixture:

1. Review the result at a desktop width.
2. Review it near a 390 × 844 mobile viewport or on a comparable phone.
3. Open print preview.

Confirm:

- Shopping quantity remains first.
- Efficiency details remain secondary and collapsed by default.
- The highlighted efficiency block does not overflow or become cramped.
- Bold values remain visually distinct without breaking line wrapping.
- The structured text version remains readable on mobile.
- Each fabric result and its visual cutting plan print without clipped content, duplicated sections, or trailing blank pages.
- The comparison language never claims a guaranteed global optimum or monetary savings.

## Completion record

Record the browser, operating system, viewport/device, date, and any deviations found. A failure should include the fixture section, exact entered values, actual text/value, expected text/value, and a screenshot when the issue is visual.
