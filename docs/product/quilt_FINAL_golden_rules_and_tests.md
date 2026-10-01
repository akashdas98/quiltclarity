# Quilt Utility Website — Golden Domain Rules & Test Fixtures

**Status:** Authoritative V1 domain contract  
**Version:** 1.1 — FINAL V1 domain contract  
**Date:** 2026-08-06

This document exists to remove quilting-domain interpretation from implementation.

If this document conflicts with an earlier draft, **this document wins for V1 domain behavior**.

---

# 1. Governing Principle

> **Defaults are convenience, not truth.**

Quilting practice varies. V1 therefore distinguishes:

1. **Hard mathematical rules** — deterministic.
2. **Product defaults** — editable conveniences.
3. **Warnings/advice** — domain guidance, not calculation invariants.

Engineering must not silently turn a default into a universal quilting rule.

---

# 2. Canonical Units

Use millimetres internally.

Exact conversions:

- 1 inch = 25.4 mm
- 1 yard = 36 inches = 914.4 mm
- 1 metre = 1000 mm

Imperial UI should support common quilting fractions at least to 1/8".

Metric calculations should not round internally merely to imitate imperial fractions.

---

# 3. Fabric Width

## V1 rule

Planner fabric has two distinct fields:

- **nominal fabric width**
- **usable fabric width**

Only **usable fabric width** participates in packing.

Default imperial values:

- nominal width: 42"
- usable width: 40"

These are editable.

Reason: quilting cotton is commonly described around 42–44", while trimming selvages reduces the usable width. Existing calculators make different assumptions, so the product must expose the distinction.

Sources:

- https://www.makersmath.com/quilt-backing-calculator
- https://help.prequilt.com/prequilt-101/fabric-calculator/calculations-explained/fabric-cutting-diagrams

---

# 4. Seam Allowance for Basic Rectangles

Default piecing seam allowance:

- **1/4"**

For a simple rectangular/square piece entered by **finished size**:

`cutWidth = finishedWidth + 2 × seamAllowance`

`cutHeight = finishedHeight + 2 × seamAllowance`

Therefore with the default 1/4" seam:

- 4" finished square → 4.5" cut square
- 3" × 6" finished rectangle → 3.5" × 6.5" cut rectangle

Source:

- https://www.famcut.com/blogs/updates/quilt-block-size-chart

If the user enters **cut size**, do not add seam allowance.

---

# 5. Rotation and Direction

## Non-directional fabric

Default:
- rotation allowed

## Directional fabric

Default:
- rotation disabled

The user may explicitly override rotation where appropriate.

A placement is invalid if it violates the resolved rotation/orientation constraint.

Do not rotate pieces merely because doing so saves fabric.

---

# 6. WOF Strips

A piece marked `isWofStrip` represents a strip intended to run across usable width of fabric.

For V1:

- strip length across fabric = usable WOF
- strip width consumes fabric length
- WOF-strip pieces are not rotated into lengthwise strips automatically

If a user wants lengthwise strips, they must select a lengthwise orientation mode rather than rely on optimizer rotation.

---

# 7. Safety Allowance

Safety allowance is applied **after** the chosen layout length is known.

Default:
- 5%

Quick options:
- 0%
- 5%
- 10%
- custom

Formula:

`bufferedLength = layoutLength × (1 + safetyPercent / 100)`

Display both:
- calculated plan length / layout requirement
- buffered requirement

Do not hide the buffer inside the optimizer.

---

# 8. Purchase Rounding

Imperial default:
- round upward to next **1/8 yard**
- 1/8 yard = 4.5"

Metric default:
- round upward to next **0.1 m**

Formula:

`recommended = ceil(buffered / increment) × increment`

Never round to nearest.

Never round down.

---

# 9. Generic Rectangle Packing

## Hard constraints

Every required piece instance must:

- appear exactly once;
- lie fully inside usable fabric width;
- not overlap another piece;
- obey rotation/orientation constraints.

## Optimization objective

Default mode is **Recommended**.

Priority order:

1. valid layout;
2. practical strip-based cutting;
3. low total fabric length;
4. low cutting complexity;
5. low fragmentation;
6. low waste.

Exact global optimality is not required.

The UI must say:

> “This is a practical optimized plan, not a mathematically proven global optimum.”

Same input must produce the same result.

---

# 10. Backing Calculator — Authoritative V1 Rules

## 10.1 Required backing dimensions

Inputs:

- quilt top width `QW`
- quilt top length `QL`
- overage per side `O`

Formula:

`requiredWidth = QW + 2O`

`requiredLength = QL + 2O`

## 10.2 Default overage

V1 generic default:
- **4" per side**

Do **not** encode “domestic = 2 inches” as an authoritative rule.

Reason: published guidance varies, while 4" per side is a common conservative recommendation. Longarm services can request different amounts.

Always show:

> “If using a professional longarmer, confirm their required backing size.”

Sources:

- https://quiltkeeperstudio.com/calculators/backing
- https://www.makersmath.com/quilt-backing-calculator
- https://toolsfast.app/crafts/quilt-backing-calculator/

## 10.3 Backing input width

The calculator should use **usable backing width**.

Recommended preset labels:

- 40" usable (about 42" nominal)
- 42" usable (about 44" nominal)
- 106" usable (about 108" nominal)
- custom

Avoid pretending that “42-inch fabric” always yields exactly 42 usable inches.

## 10.4 Backing panel seam allowance

V1 default panel-join seam allowance:
- **1/2" per panel edge**

Each join therefore consumes:
- 1" total coverage

For `n` panels of usable width `U`:

`coverage(n) = nU - (n - 1) × 1"`

More generally:

`coverage(n) = nU - (n - 1) × 2 × seamAllowance`

Source for 1/2" backing seam practice:

- https://fibrecalcs.com/quilting/quilt-backing-calculator
- https://www.thecreativefolk.com/best-fabric-for-quilt-backing/

## 10.5 Candidate orientations

Generate two candidates when allowed:

### Vertical-seam layout
Panels run the required backing length.

Find minimum `n` satisfying:

`coverage(n) >= requiredWidth`

Fabric consumed:

`n × requiredLength`

### Horizontal-seam layout
Panels run the required backing width.

Find minimum `n` satisfying:

`coverage(n) >= requiredLength`

Fabric consumed:

`n × requiredWidth`

Compare purchase requirements.

If backing fabric is directional and orientation would rotate the print undesirably, disable incompatible candidate(s).

Return:
- every valid candidate;
- lowest-yardage candidate, labeled “Uses least fabric” or “Lowest-yardage option” rather than as an unconditional recommendation;
- seam direction;
- panel count.

Do not assume one seam direction is universally preferable.

The UI must also state:

> “Seam orientation can also depend on print direction and your quilting setup. If using a professional longarmer, confirm their preferences.”

The editable 4" overage is a longarm-oriented default, not a universal requirement.

---

# 11. Binding Calculator — Authoritative V1 Rules

V1 supports **straight-grain / cross-grain double-fold binding**, not bias binding.

Inputs:

- quilt width `W`
- quilt length `L`
- strip width `SW`
- usable WOF `U`
- extra joining/corner allowance `A`

Default:
- strip width: 2.5"
- joining/corner allowance: 12"

Formulas:

`perimeter = 2(W + L)`

`requiredBindingLength = perimeter + A`

`strips = ceil(requiredBindingLength / U)`

`fabricLength = strips × SW`

Then apply optional safety buffer and purchase rounding.

Source confirming the same general perimeter → extra → strips → yardage workflow:

- https://www.makersmath.com/quilt-backing-calculator
- https://calcory.app/everyday/quilt-binding-calculator

The allowance is an editable product default, not a theorem.

---

# 12. HST Calculator — Authoritative V1 Rules

Terminology:

- `F` = desired **finished** HST size
- `U = F + 1/2"` = unfinished/trim size
- each construction batch uses two starting squares, normally one from each of two fabrics

The UI must show:
- finished size;
- unfinished/trim size;
- starting square size;
- number of batches;
- HSTs produced;
- excess HSTs.

## 12.1 Two-at-a-time

Yield:
- 2 HSTs per batch

Standard starting square:

`S = F + 7/8"`

Trim-friendly starting square:

`S = F + 1"`

Default mode:
- **trim-friendly**

Reason: the Standard formula is +7/8", while +1" provides trimming room and is widely recommended for easier accuracy.

Source:

- https://haileystitches.com/half-square-triangle-charts/

## 12.2 Four-at-a-time

Yield:
- 4 HSTs per batch

This method produces bias outer edges; show a warning.

Calculation:

1. `U = F + 1/2"`
2. with perimeter seam allowance `SA`, calculate `S_geometric = U × √2 + 2SA`
3. Standard starting square = **round `S_geometric` upward to nearest 1/4"**
4. Trim-friendly starting square = Standard + 1/4"

Formula:

`S_standard = ceilToQuarter(U × √2 + 2SA)`

Default mode:
- **trim-friendly**

The UI labels are **Standard** and **Trim-friendly**; it must not present an “Exact” mode.

## 12.3 Eight-at-a-time / Magic 8

Yield:
- 8 HSTs per batch

Standard starting square:

`S = 2 × (F + 7/8")`

Equivalent:

`S = 2F + 1.75"`

Trim-friendly starting square:

`S = 2 × (F + 1")`

Equivalent:

`S = 2F + 2"`

Default mode:
- **trim-friendly**

Source:

- https://haileystitches.com/half-square-triangle-charts/

## 12.4 Batch quantity

For requested HST quantity `N` and method yield `Y`:

`batches = ceil(N / Y)`

`produced = batches × Y`

`excess = produced - N`

For a standard two-fabric HST pair:
- starting squares required **per fabric** = `batches`
- total starting squares = `2 × batches`

---

# 13. Block Count Calculator

Inputs:

- target width `TW`
- target length `TL`
- finished block width `BW`
- finished block height `BH`

Without sashing:

`blocksAcross = ceil(TW / BW)`

`blocksDown = ceil(TL / BH)`

`totalBlocks = blocksAcross × blocksDown`

`actualWidth = blocksAcross × BW`

`actualLength = blocksDown × BH`

Return actual size and difference from target.

Never create partial blocks silently.

Sashing adjustments should be modeled explicitly when enabled.

---

# 14. Border Calculator — Authoritative V1 Rules

V1 supports:
- rectangular quilt tops;
- straight, non-mitered borders;
- cross-grain WOF strips joined end-to-end as necessary.

Inputs:
- quilt-top finished width `W`
- quilt-top finished length `L`
- finished border width `B`
- number of equal-width border layers `N`
- seam allowance `SA`
- usable WOF `U`
- handling/cutting buffer `H`
- join seam allowance `JSA`

Defaults:
- `SA = 1/4"`
- `H = 10"`
- `JSA = 1/4"`

Cut strip width for every layer:

`cutBorderWidth = B + 2SA`

For each layer `i`, starting at 1:

`currentWidth = W + 2B(i - 1)`

`currentLength = L + 2B(i - 1)`

V1 default construction order is:
1. side borders first;
2. top/bottom borders second.

Therefore:

`sideBorderFinishedLength = currentLength`

After side borders are attached:

`topBottomFinishedLength = currentWidth + 2B`

Total finished strip length for the layer:

`layerStripLength = 2 × sideBorderFinishedLength + 2 × topBottomFinishedLength`

Across all layers:

`requiredJoinedLength = Σ layerStripLength + H`

WOF strips:

`effectiveJoinedLength(n) = nU - (n - 1) × 2JSA`

Choose the smallest integer `n` for which:

`effectiveJoinedLength(n) >= requiredJoinedLength`

Fabric length down the bolt:

`fabricLength = strips × cutBorderWidth`

Then apply any selected safety allowance and purchase rounding.

Final quilt dimensions:

`finalWidth = W + 2BN`

`finalLength = L + 2BN`

Important practical warning:

> Before cutting the final border lengths, measure the assembled quilt top through the center in multiple places and use the chosen measured/averaged length.

Input dimensions are planning/current quilt-top dimensions. Results use the labels “Nominal side-border length”, “Nominal top/bottom-border length”, and “Planning yardage”. The visible V1 assumption is: “Straight, non-mitered borders · WOF/cross-grain strips · side borders first”.

Sources:
- Utah State University Extension: straight-grain quilt borders
- QuiltKeeper border calculator
- SewCalcs border calculator

---

# 15. Sashing Calculator — Authoritative V1 Rules

V1 supports:
- rectangular block grids;
- row-wise assembly;
- sashing between blocks/rows;
- **no cornerstones**;
- **no outer sashing**.

Inputs:
- columns `C`
- rows `R`
- finished block width `BW`
- finished block height `BH`
- finished sashing width `S`
- seam allowance `SA`
- usable WOF `U`
- handling/cutting buffer `H`
- join seam allowance `JSA`

Defaults:
- `SA = 1/4"`
- `H = 10"`
- `JSA = 1/4"`

Cut sashing width:

`cutSashingWidth = S + 2SA`

Unfinished/cut block dimensions:

`blockCutWidth = BW + 2SA`

`blockCutHeight = BH + 2SA`

## Short vertical sashing pieces inside each block row

Count:

`verticalPieceCount = R × (C - 1)`

Cut size:

`cutSashingWidth × blockCutHeight`

## Horizontal sashing rows between completed block rows

Finished row width:

`finishedRowWidth = C × BW + (C - 1) × S`

Cut horizontal sashing length must match the unfinished row width:

`horizontalStripCutLength = finishedRowWidth + 2SA`

Count:

`horizontalStripCount = R - 1`

If `horizontalStripCutLength > U`, the horizontal sashing strip must be pieced from WOF segments.

## Total strip-length demand

`verticalDemand = verticalPieceCount × blockCutHeight`

`horizontalDemand = horizontalStripCount × horizontalStripCutLength`

`requiredJoinedLength = verticalDemand + horizontalDemand + H`

WOF strips:

Choose the smallest integer `n` for which:

`nU - (n - 1) × 2JSA >= requiredJoinedLength`

Fabric length down the bolt:

`fabricLength = strips × cutSashingWidth`

Then apply safety allowance and purchase rounding.

Finished quilt dimensions:

`finishedQuiltWidth = C × BW + (C - 1) × S`

`finishedQuiltLength = R × BH + (R - 1) × S`

The UI must state:

> “Row-wise sashing · No cornerstones · No outer sashing.”

The UI must warn when a horizontal row must be pieced and state that yardage includes join loss.

Cornerstones, outer sashing, and alternative assembly methods are deferred.

Source:
- QuiltMetric sashing calculator (same row-wise/no-cornerstone distinction and cut-width logic)

---

# 16. Golden Test Fixtures

These fixtures are part of the product contract.

Codex tests must reproduce them unless a later product decision explicitly changes the rule.

---

## G01 — Finished square conversion

Input:
- finished square: 4"
- seam allowance: 1/4"

Expected:
- cut square = 4.5" × 4.5"

---

## G02 — Identical squares / strip packing

Input:
- usable WOF: 40"
- piece: 4.5" × 4.5"
- quantity: 20
- rotation: allowed
- safety: 0%

Expected:
- 8 pieces per row
- 3 rows
- layout length = 13.5"
- unused piece slots in final row = 4

With 5% safety and 1/8-yard purchase increment:
- buffered = 14.175"
- purchase increment = 4.5"
- recommended purchase = 18" = 0.5 yd

---

## G03 — Rotation materially saves fabric

Input:
- usable WOF: 40"
- piece: 21" × 6"
- quantity: 6
- rotation allowed
- safety: 0%

Candidate without rotation:
- 1 across
- 6 rows
- length = 36"

Candidate rotated:
- piece becomes 6" × 21"
- 6 across
- 1 row
- length = 21"

Expected recommended layout:
- rotated
- layout length = 21"

---

## G04 — Directional fabric prevents saving rotation

Same as G03, except:
- directional = true
- rotation = disabled

Expected:
- no rotation
- layout length = 36"

---

## G05 — Leftover filling

Input:
- usable WOF: 40"
- A: 30" × 10", qty 2
- B: 10" × 10", qty 2
- rotation disabled
- safety 0%

Expected practical layout:
- 2 rows
- each row contains one A + one B
- each row width = 40"
- total layout length = 20"

A plan consuming 30" by placing groups separately is valid but inferior.

---

## G06 — Piece cannot fit

Input:
- usable WOF: 40"
- piece: 41" × 5"
- rotation disabled

Expected:
- blocking validation error
- no layout

Message meaning:
> Piece is wider than usable fabric width in every allowed orientation.

---

## G07 — Oversized piece becomes valid by rotation

Input:
- usable WOF: 40"
- piece: 41" × 5"
- rotation allowed

Expected:
- rotate to 5" across WOF × 41" fabric length
- valid layout
- used length = 41"

---

## G08 — Metric equivalence

Input:
- usable WOF: 101.6 cm
- 20 pieces: 11.43 cm × 11.43 cm
- safety: 0%
- purchase increment: 0.1 m

Expected:
- 8 pieces per row
- 3 rows
- layout length = 34.29 cm
- recommended purchase = 0.4 m

Small display differences caused only by unit formatting are acceptable; internal conversion must remain equivalent.

---

## G09 — Backing: 60 × 80 throw

Input:
- quilt top: 60" × 80"
- overage: 4"/side
- usable backing width: 40"
- backing join SA: 1/2"
- directional: false
- purchase increment: 1/8 yd

Required backing:
- 68" × 88"

Vertical-seam candidate:
- 2 panels
- coverage = 79"
- raw fabric length = 176"
- raw yardage = 4.8889 yd
- rounded purchase = 5 yd

Horizontal-seam candidate:
- 3 panels
- coverage = 118"
- raw fabric length = 204"
- raw yardage = 5.6667 yd
- rounded purchase = 5.75 yd

Expected recommendation:
- vertical seam
- buy 5 yd

---

## G10 — Binding: 60 × 80 quilt

Input:
- quilt: 60" × 80"
- usable WOF: 40"
- binding strip width: 2.5"
- extra allowance: 12"
- safety: 0%
- purchase increment: 1/8 yd

Expected:
- perimeter = 280"
- required binding length = 292"
- strips = ceil(292 / 40) = 8
- fabric length = 8 × 2.5 = 20"
- raw yardage = 0.5556 yd
- rounded purchase = 22.5" = 0.625 yd = 5/8 yd

---

## G11 — HST 2-at-a-time

Input:
- finished HST: 4"
- desired quantity: 10

Expected:
- unfinished size = 4.5"
- Standard starting square = 4.875" = 4 7/8"
- Trim-friendly starting square = 5"
- batches = 5
- HSTs produced = 10
- excess = 0
- starting squares per fabric = 5
- total starting squares = 10

---

## G12 — HST 4-at-a-time

Input:
- finished HST: 4"
- desired quantity: 10
- seam allowance: 0.25"

Expected:
- unfinished = 4.5"
- geometric starting square = `4.5 × √2 + 0.5 = 6.863961..."`
- Standard starting square = 7"
- Trim-friendly starting square = 7.25"
- batches = 3
- HSTs produced = 12
- excess = 2
- starting squares per fabric = 3
- total starting squares = 6
- warning: outer edges are bias

---

## G13 — HST 8-at-a-time

Input:
- finished HST: 4"
- desired quantity: 10

Expected:
- unfinished = 4.5"
- Standard starting square = 2 × 4.875 = 9.75"
- Trim-friendly = 10"
- batches = 2
- HSTs produced = 16
- excess = 6
- starting squares per fabric = 2
- total starting squares = 4

---

## G14 — Block count

Input:
- target quilt: 60" × 80"
- finished blocks: 10" × 10"
- no sashing

Expected:
- blocks across = 6
- blocks down = 8
- total = 48
- actual size = 60" × 80"

---

## G15 — Block count overshoot

Input:
- target quilt: 62" × 82"
- finished blocks: 10" × 10"
- no sashing

Expected:
- blocks across = 7
- blocks down = 9
- total = 63
- actual = 70" × 90"
- overshoot = 8" width, 8" length

No partial blocks.

---

## G16 — Single straight border

Input:
- quilt top: 60" × 80"
- finished border width: 2.5"
- layers: 1
- seam allowance: 0.25"
- usable WOF: 40"
- handling/cutting buffer: 10"
- join seam allowance: 0.25"
- safety: 0%
- purchase increment: 1/8 yd

Expected:
- cut border width = 3"
- side border finished lengths = 80" each
- top/bottom finished lengths = 65" each
- total nominal border length = 290"
- required joined length with handling buffer = 300"
- 8 WOF strips provide 316.5" after 7 joins; 7 strips provide only 277"
- fabric length = 8 × 3" = 24"
- raw yardage = 0.6667 yd
- rounded purchase = 27" = 0.75 yd
- final quilt size = 65" × 85"
- required final-measurement warning before cutting

---

## G17 — Row-wise sashing without cornerstones

Input:
- grid: 4 columns × 5 rows
- finished blocks: 10" × 10"
- finished sashing width: 2"
- seam allowance: 0.25"
- usable WOF: 40"
- handling/cutting buffer: 10"
- join seam allowance: 0.25"
- safety: 0%
- purchase increment: 1/8 yd

Expected:
- cut sashing width = 2.5"
- block cut height = 10.5"
- short vertical pieces = 5 × 3 = 15
- short vertical cut size = 2.5" × 10.5"
- finished row width = 4×10 + 3×2 = 46"
- horizontal sashing cut length = 46.5"
- horizontal sashing rows = 4
- vertical strip-length demand = 157.5"
- horizontal strip-length demand = 186"
- required joined length with handling buffer = 353.5"
- 9 WOF strips provide 356" after 8 joins; 8 strips provide only 316.5"
- fabric length = 9 × 2.5" = 22.5"
- raw yardage = 0.625 yd
- rounded purchase = 22.5" = 0.625 yd
- finished quilt size = 46" × 58"
- note that each horizontal sashing row must be pieced because 46.5" exceeds 40" usable WOF

---

## G28 — Small four-at-a-time HST

Input:
- finished HST: 1"
- seam allowance: 0.25"

Expected:
- unfinished = 1.5"
- geometric starting square = `1.5 × √2 + 0.5 = 2.621320..."`
- Standard = 2.75"
- Trim-friendly = 3"

---

## G29 — Large four-at-a-time HST

Input:
- finished HST: 8"
- seam allowance: 0.25"

Expected:
- unfinished = 8.5"
- geometric starting square = `8.5 × √2 + 0.5 = 12.520815..."`
- Standard = 12.75"
- Trim-friendly = 13"

---

## G30 — Joined WOF seam-loss boundary

Input:
- usable WOF: 40"
- join seam allowance: 0.25"
- required linear length: 79.75"
- handling buffer: 0"

Expected:
- 2 strips provide only `80 - 0.5 = 79.5"`, so they are insufficient
- 3 strips are required and provide 119"

---

## D01 — Three-group exact leftover filling

Input:
- usable WOF: 40"
- A: 25" × 10", qty 2
- B: 10" × 10", qty 2
- C: 5" × 10", qty 2
- rotation disabled
- safety: 0%

Expected recommended combined layout:
- 2 rows
- each row contains 1 × A + 1 × B + 1 × C
- each row width = 40"
- recommended plan length = 20"

Expected separate-group baseline:
- A alone = 20"
- B alone = 10"
- C alone = 10"
- separate-group baseline length = 40"
- combined difference = 20" shorter (50%)
- comparison outcome = `combined_shorter`

---

## D02 — No fake savings when groups already pack efficiently

Input:
- usable WOF: 40"
- A: 20" × 10", qty 4
- B: 20" × 10", qty 4
- rotation disabled
- safety: 0%

Expected:
- 4 valid 40" × 10" recommended rows
- recommended plan length = 40"
- separate-group baseline length = 40"
- length difference = 0
- difference percent = 0
- comparison outcome = `same_length`
- no positive savings copy

---

## D03 — Directional constraint survives joint optimization

Input:
- usable WOF: 40"
- directional fabric with default rotation disabled
- A: 30" × 20", qty 2
- B: 15" × 10", qty 2
- safety: 0%

Expected:
- no placement is rotated
- two 30" × 20" rows for A plus one 30" × 10" row containing both B pieces
- recommended plan length = 50"
- separate-group baseline length = 50"
- comparison outcome = `same_length`

Control evidence:
- allowing rotation for B permits one rotated B to fill each A-row remainder and reduces the joint layout to 40"
- the directional fixture must retain 50" rather than rotate B to manufacture savings

---

## D04 — WOF strips coexist with ordinary rectangles

Input:
- usable WOF: 40"
- WOF strip: 40" × 2.5", qty 2
- A: 30" × 10", qty 2
- B: 10" × 10", qty 2
- ordinary-piece rotation disabled
- safety: 0%

Expected:
- two whole-width 40" × 2.5" strip rows, never rotated
- two 40" × 10" ordinary rows, each containing 1 × A + 1 × B
- recommended plan length = 25"
- separate-group baseline length = 35"
- combined difference = 10" shorter
- comparison outcome = `combined_shorter`

V1 reserves the full width for each WOF strip. The legal leftover-filling opportunity in this fixture is between the ordinary A and B groups; it does not introduce subpacking around a WOF strip.

---

## D05 — Multiple fabrics are compared independently

Input:
- Fabric A: usable WOF 40", A 30" × 10" qty 2, B 10" × 10" qty 2, rotation disabled
- Fabric B: usable WOF 40", one 10" × 10" group qty 4, rotation disabled
- safety: 0%

Expected:
- Fabric A recommended plan = 20", separate-group baseline = 30", difference = 10" shorter, outcome = `combined_shorter`
- Fabric B recommended plan = 10", outcome = `not_applicable`
- Fabric B does not inherit Fabric A's comparison
- no cross-fabric packing or savings aggregation

---

# 17. Required Property Tests

In addition to golden examples:

- no overlap;
- all pieces inside usable width;
- all requested piece instances placed exactly once;
- forbidden rotation never occurs;
- deterministic same-input/same-output;
- recommended purchase >= buffered requirement;
- buffered requirement >= calculated plan length;
- rounding always upward;
- impossible input never yields a “best effort” invalid layout;
- backing candidate panel coverage >= required backing dimension;
- HST output count >= requested count.
- joined-strip count is adequate and one fewer strip is insufficient;
- user-facing heuristic language does not claim a proven minimum.
- separate-group and recommended comparison plans obey the same resolved fabric and piece constraints;
- comparison difference equals separate-group raw length minus recommended raw length;
- positive savings language requires a positive raw-length difference;
- one piece group produces `not_applicable` comparison state;
- comparison state remains independent per fabric and does not change recommended-layout selection;
- baseline and comparison results are deterministic;
- safety allowance and purchase rounding do not change raw comparison arithmetic.

---

# 18. Resolved Ambiguities

These decisions are now locked for V1:

- 42" nominal / 40" usable are defaults, not universal facts.
- Generic backing default is 4" overage per side.
- Do not encode 2" domestic-machine overage as a rule.
- Backing panel join seam allowance default is 1/2".
- Compare vertical and horizontal backing candidates when permitted.
- Straight-grain binding only in V1.
- Binding extra allowance default is 12".
- HST calculator supports 2/4/8 methods explicitly.
- HST default presentation is Trim-friendly, with Standard also available.
- 4-at-a-time HST uses `U × √2 + 2SA`, rounds Standard upward to 1/4", and adds 1/4" for Trim-friendly.
- Directional fabric disables rotation by default.
- Optimizer targets practical efficiency, not global proof of minimal area.
- Border V1 uses straight cross-grain, non-mitered borders with side-first construction for planning.
- Sashing V1 uses row-wise assembly without cornerstones or outer sashing.
- No hidden automatic “expert quilting judgment” may be invented by engineering.

---

# 19. Remaining Non-Domain Decisions

Anything still open after this document is an engineering/design choice unless it changes the behavior above.

Examples:

- exact Astro component organization;
- whether the single complex planner benefits from a React island;
- exact optimizer data structure;
- CSS/layout;
- SVG implementation details;
- analytics adapter;
- internal state library;
- test framework.

Architecture constraints already locked elsewhere still apply:
- Astro is the V1 site framework;
- plain TypeScript owns domain logic;
- simple calculators should prefer minimal/vanilla client code;
- no application backend/database/auth exists in V1.

Those remaining implementation choices may be made by Codex without quilting-domain interpretation.
