# QuiltClarity V1.1 — Golden Domain Rules & Test Fixtures

**Status:** Authoritative executable domain contract  
**Date:** 2026-08-17

If this file conflicts with implementation convenience, this file wins on domain behavior.

# 1. Governing principle

> **Defaults are convenience, not truth.**

Use three categories:

1. mathematical invariants;
2. editable product defaults;
3. warnings/advice.

# 2. Canonical units

Use millimetres internally.

Exact:

- 1 inch = 25.4 mm
- 1 yard = 914.4 mm
- 1 metre = 1000 mm

Do not round internal metric values to imperial-style fractions.

# 3. Fabric axes and width

For bolt fabric:

- nominal width is descriptive;
- usable width is the crosswise packing boundary;
- length runs down the bolt.

Defaults:

- imperial nominal 42";
- imperial usable 40";
- metric nominal 107 cm;
- metric usable 102 cm.

Editable.

For finite stock:

- `width` = crosswise/across-fabric axis;
- `length` = lengthwise axis.

A stock preset merely fills these values; edited geometry is authoritative.

# 4. Seam allowance for simple rectangles

Default SA = 1/4".

Finished rectangle:
`cutW = finishedW + 2SA`
`cutH = finishedH + 2SA`.

Cut-size input bypasses conversion.

# 5. Rotation/direction

Non-directional default: rotation allowed.

Directional default: rotation disabled.

Precedence:
`piece.rotationAllowed ?? fabric.defaultRotationAllowed`,
subject always to orientation constraints.

Explicit `false` wins.

No optimizer saving may violate resolved orientation.

# 6. WOF strips

`isWofStrip` means the strip spans usable WOF crosswise.

- crosswise extent = usable WOF;
- strip width consumes bolt length;
- never auto-rotate into a lengthwise strip;
- a finite stock bin narrower than usable WOF cannot satisfy a WOF strip merely because its other dimension is long enough.

# 7. Safety allowance

Fresh/purchased fabric only:

`buffered = rawLength × (1 + safetyPercent/100)`.

Default 5%; presets 0/5/10/custom.

For stock-aware planning:

- existing stock geometry is not inflated;
- safety applies to the additional purchased-bolt length;
- if raw additional purchase is 0, recommended purchase remains 0.

# 8. Purchase rounding

Default:

- imperial: upward to 1/8 yard = 4.5";
- metric: upward to 0.1 m.

`recommended = ceil(buffered / increment) × increment`.

Never nearest; never down.

# 9. Practical rectangle packing

Hard invariants:

- every placed required instance appears exactly once;
- no overlap;
- inside its bin;
- rotation/orientation constraints respected;
- fabric identity respected.

Fresh-bolt recommended objective:

1. valid;
2. strip-practical;
3. low total bolt length;
4. low cutting complexity;
5. low fragmentation;
6. low waste;
7. stable strategy tie-break.

Disclosure:

> “This is a practical optimized plan, not a mathematically proven global optimum.”

Same input → same output.

# 10. Finite-stock + purchase reconciliation

For one fabric:

- required pieces are considered jointly;
- finite stock bins and an optional purchased bolt are candidate material;
- total area alone is never sufficient proof of fit;
- do not independently optimize each piece group then sum.

Lexicographic objective:

1. valid accounting of every requirement;
2. lowest raw additional purchase length;
3. practical cutting sequence;
4. preserve useful leftover stock / low fragmentation;
5. low overall waste;
6. deterministic stable strategy.

The algorithm must consider alternative assignments of pieces to stock where assignment affects purchase length. A naive “fill first bin greedily” implementation is insufficient.

If new purchase is disabled:

- return whether requirements fit supplied stock;
- return unallocated requirements if not;
- do not fabricate a purchase.

# 11. Pattern comparison

Pattern-stated amount is an external reference, not a packing constraint.

Compute a separate fresh-bolt scenario from all entered requirements using current assumptions and **ignoring stock**.

Comparison:

- pattern-stated;
- fresh plan raw;
- fresh plan buffered;
- fresh plan purchase-rounded;
- delta.

Separately compute:

- stock used;
- additional purchase now.

If known pattern WOF != current assumed usable WOF:

- show a comparison warning.

Do not infer designer error from a positive delta.

# 12. Backing

Required:
`RW = QW + 2O`
`RL = QL + 2O`.

Default `O = 4"` per side, editable.

Use usable backing width.

Panel join SA default 1/2".

For `n` panels:
`coverage(n) = nU - (n-1) × 2 × joinSA`.

Generate valid vertical/horizontal candidates subject to directionality.

Label low-yardage:
**Uses least fabric** / **Lowest-yardage option**.

Do not call it universally recommended.

# 13. Binding

Straight/cross-grain double-fold only.

Inputs:

- quilt W/L;
- strip width `SW`, default 2.5";
- usable WOF `U`;
- joining/corner allowance `A`, default 12".

`perimeter = 2(W+L)`
`requiredBinding = perimeter + A`
`strips = ceil(requiredBinding/U)`
`fabricLength = strips × SW`.

Then optional safety + upward purchase rounding.

# 14. HST

Let `F` = finished HST side.
Unfinished/trim size `U = F + 0.5"`.

Options: **Standard**, **Trim-friendly**. Default Trim-friendly.

## 14.1 Two at a time

Yield 2.

Standard:
`S = F + 7/8"`.

Trim-friendly:
`S = F + 1"`.

## 14.2 Four at a time

Yield 4; bias outer-edge warning.

With seam allowance `SA`:
`S_geometric = U × sqrt(2) + 2SA`.

Standard:
`S = ceil upward to next 1/4"` of geometric.

Trim-friendly:
`S = Standard + 1/4"`.

Do not use the old constant `/0.64` shortcut as the authoritative rule.

## 14.3 Eight at a time

Yield 8.

Standard:
`S = 2(F + 7/8")`.

Trim-friendly:
`S = 2(F + 1")`.

For yield `Y`:
`batches = ceil(N/Y)`
`produced = batches×Y`
`excess = produced-N`.

# 15. QST

Scope: classic two-color QST/hourglass batch.

Let `F` = desired finished QST side.

Standard starting square:
`S = F + 1.25"`.

Trim-friendly:
`S = F + 1.5"`.

Default Trim-friendly.

Each batch:

- 2 starting squares from fabric A;
- 2 starting squares from fabric B;
- produces 4 QSTs.

`batches = ceil(N/4)`
`produced = 4×batches`
`excess = produced-N`
`startingSquaresPerFabric = 2×batches`.

Display unfinished/trim target `F + 0.5"`.

This rule does not claim to cover every multi-color QST construction.

# 16. Flying Geese

Scope: conventional finished `W = 2H`.

Trim/unfinished result is `(W+0.5") × (H+0.5")`.

Options: Standard / Trim-friendly. Default Trim-friendly.

## 16.1 One at a time

Yield 1.

Standard:

- body rectangle `(W+0.5") × (H+0.5")`;
- two background squares `(H+0.5")`.

Trim-friendly:

- body `(W+0.75") × (H+0.75")`;
- two background squares `(H+0.75")`.

## 16.2 Four at a time

Yield 4.

Standard:

- one body square `W + 1.25"`;
- four background squares `H + 0.875"`.

Trim-friendly:

- one body square `W + 1.5"`;
- four background squares `H + 1.125"`.

`batches = ceil(N/Y)`.

Do not label the trim-friendly version “no-waste.”

# 17. Batting

Required batting rectangle:
`RW = QW + 2O`
`RL = QL + 2O`.

Default `O=4"` per side, editable and explicitly a convenience.

If a roll width `U` is entered:

- orientation A valid if `RW <= U`, consumes `RL`;
- orientation B valid if rotation allowed and `RL <= U`, consumes `RW`;
- show each valid orientation;
- low-linear-length candidate may be labeled as using less roll length.

No pieced-batting calculation in this scope.

# 18. Block count

Without sashing:
`across = ceil(TW/BW)`
`down = ceil(TL/BH)`
`total = across×down`
`actualW = across×BW`
`actualL = down×BH`.

No partial blocks silently.

# 19. Border planning

Scope:

- rectangular tops;
- straight non-mitered borders;
- cross-grain WOF strips;
- side borders first;
- equal-width layers.

Defaults:

- SA 1/4";
- handling/cutting buffer 10";
- straight WOF join SA 1/4".

Cut border width:
`B + 2SA`.

For layer `i`:
`currentW = W + 2B(i-1)`
`currentL = L + 2B(i-1)`
`sideFinished = currentL`
`topBottomFinished = currentW + 2B`
`layerDemand = 2×sideFinished + 2×topBottomFinished`.

Total nominal demand sums layers.

Joined WOF capacity:
`effectiveJoinedLength(n) = nU - (n-1)×2×joinSA`.

Find smallest `n` with:
`effectiveJoinedLength(n) >= nominalDemand + handlingBuffer`.

Fabric down bolt:
`n × cutBorderWidth`.

Always warn user to measure actual quilt through center before final border cuts; calculator lengths are planning/nominal.

# 20. Sashing

Scope:

- rectangular block grid;
- row-wise assembly;
- internal sashing;
- no cornerstones;
- no outer sashing.

Defaults:

- SA 1/4";
- handling buffer 10";
- WOF join SA 1/4".

`cutSashingWidth = S + 2SA`
`blockCutHeight = BH + 2SA`.

Short vertical:
`count = R(C-1)`
size = `cutSashingWidth × blockCutHeight`.

Finished row width:
`C×BW + (C-1)×S`.

Horizontal row cut length:
`finishedRowWidth + 2SA`.

Horizontal count:
`R-1`.

Linear demands:
`vertical = verticalCount × blockCutHeight`
`horizontal = horizontalCount × horizontalCutLength`.

Required joined length:
`vertical + horizontal + handlingBuffer`.

Use the same seam-loss-aware WOF capacity function from borders.

Finished:
`W = C×BW + (C-1)S`
`L = R×BH + (R-1)S`.

# 21. Golden fixtures

All G01–G45 are mandatory unless an intentional domain revision changes them.

## G01 — Finished square

4" finished, SA .25 → 4.5" cut.

## G02 — Identical squares

U40; 4.5×4.5 qty20; rotate; safety0:

- 8/row;
- 3 rows;
- length13.5.
  With 5% and 1/8yd → buffered14.175; purchase18"=.5yd.

## G03 — Rotation saves

U40; 21×6 qty6:

- no rotate 36";
- rotate → six across, length21";
- select21.

## G04 — Directional blocks rotation

G03 directional/no rotation →36.

## G05 — Joint leftover fill

U40; A30×10 qty2; B10×10 qty2; no rotate:

- two rows each A+B;
- length20.
  30" separate-group plan is inferior.

## G06 — Impossible width

U40; 41×5; no rotate → blocking error.

## G07 — Valid by rotation

U40; 41×5; rotate → 5 across axis ×41 long; length41.

## G08 — Metric equivalence

U101.6cm; 20×11.43cm squares; safety0:

- 8/row;
- 3 rows;
- 34.29cm;
- 0.4m purchase at .1m increment.

## G09 — Backing 60×80

O4; U40; joinSA.5; nondirectional:
required68×88.
Vertical: 2 panels; coverage79; raw176"=4.8889yd; purchase5yd.
Horizontal: 3 panels; coverage118; raw204"=5.6667yd; purchase5.75yd.
Label vertical as lowest-yardage/uses least fabric.

## G10 — Binding

60×80; U40; strip2.5; extra12:
perimeter280; required292; 8 strips; raw20"; purchase22.5"=5/8yd.

## G11 — HST 2-at-a-time

F4; N10:
U4.5; Standard4.875; Trim5; batches5; produced10; excess0; 5 squares/fabric.

## G12 — Corrected HST 4-at-a-time

F4; N10; SA.25:
U4.5; geometric6.863961...; Standard7; Trim7.25;
batches3; produced12; excess2; 3 squares/fabric; bias warning.

## G13 — HST 8-at-a-time

F4; N10:
Standard9.75; Trim10; batches2; produced16; excess6; 2 squares/fabric.

## G14 — Block count

target60×80; blocks10×10 →6×8=48; actual60×80.

## G15 — Block overshoot

target62×82; blocks10 →7×9=63; actual70×90; +8 each dimension.

## G16 — Border

top60×80; B2.5; layers1; SA.25; U40; handling10; joinSA.25; safety0:
cut width3; side80; top/bottom65; nominal290; required300;
8 strips effective316.5; 7 effective277; raw fabric24"; purchase27"=.75yd; final65×85.

## G17 — Sashing

4 columns ×5 rows; blocks10; S2; SA.25; U40; handling10; joinSA.25:
cut width2.5; block cut height10.5;
vertical pieces15 at2.5×10.5;
finished row width46;
horizontal cut length46.5; rows4;
vertical demand157.5; horizontal186; +buffer =353.5;
9 WOF strips; raw22.5"=.625yd; purchase22.5"; final46×58;
horizontal rows require piecing.

## G18 — Mixed packing

U40; A20×10 qty2; B10×10 qty4; no rotate:
two 40×10 rows each A+2B; length20.

## G19 — Multi-fabric independence

Fabric A U40, eight5×5; Fabric B U40, four10×10:
optimize separately; no cross-fabric placement; separate shopping outputs.

## G20 — Imperial rounding boundary

buffered36.01; increment4.5 →40.5"=1.125yd.

## G21 — Exact increment

buffered36; increment4.5 →36"=1yd.

## G22 — Usable width authoritative

nominal42; usable36; 9×9 qty8 →4/row, 2 rows, length18.

## G23 — Directional backing candidate filtering

G09 directional rule disallows horizontal → only vertical valid.

## G24 — Metric rounding

.401m at .1m →.5m.

## G25 — Deterministic tie

Equal configured score → tie:
1 lower used length;
2 lower complexity;
3 lower waste;
4 stable strategy order.

## G26 — Large grouped input

500 identical2.5×2.5; U40:
completes under guardrails; exactly500 accounted.

## G27 — Piece override

fabric default rotation true; piece false → piece never rotates.

## G28 — Small HST four-at-a-time

F1; SA.25:
U1.5; geometric2.621320...; Standard2.75; Trim3.

## G29 — Large HST four-at-a-time

F8; SA.25:
U8.5; geometric12.520815...; Standard12.75; Trim13.

## G30 — Joined WOF boundary

U40; joinSA.25; required79.75; buffer0:
2 strips effective79.5 insufficient; 3 effective119 sufficient.

## G31 — Finite stock fully covers

Stock20×20; pieces10×10 qty4; no rotate; safety5:
all four placed in stock; raw additional purchase0; recommended purchase0.

## G32 — Finite stock creates precise shortfall

Stock20×10; required10×10 qty4; purchased bolt U40; safety0; increment4.5":
stock covers2; 2 remain; purchased raw length10"; purchase rounds to13.5"=3/8yd.

## G33 — Safety only on purchased shortfall

Same G32, safety10:
stock unchanged; raw purchase10; buffered11; rounded13.5.

## G34 — Multiple stock bins stay identifiable

Stock A10×10 and Stock B10×10; required10×10 qty2:
one placement per bin; purchase0; placement result retains bin IDs.

## G35 — Finite stock geometry beats equal area

Stock width10×length20; required piece width20×length10; rotation disabled:
piece does not fit existing stock despite equal area.
If rotation enabled and no other orientation constraint, it may fit.

## G36 — WOF strip cannot use narrow remnant

Fabric usable WOF40; stock width20×length40; requirement one WOF strip width2.5:
narrow stock cannot satisfy it as WOF; purchase/other full-width stock required.

## G37 — Pattern comparison independent of stock

Pattern says1yd; requirements produce a fresh-fabric plan >0; stock fully covers requirements:

- pattern/fresh-plan comparison still reports fresh-fabric requirement;
- buy-now =0;
- comparison must not substitute0 as planned requirement.

## G38 — Pattern WOF mismatch warning

Pattern assumed usable44; current usable40; pattern amount entered:
calculation allowed; explicit not-like-for-like WOF warning.

## G39 — Editable stock preset

Fat-quarter preset initially18×21; user edits length20:
packing uses18×20, not preset21.

## G40 — Purchase is not forced when stock fits

Any exact-stock valid plan with safety>0:
recommended purchase remains0 and guidance explains safety only applies to new purchase.

## G41 — QST

F4; N10:
Standard5.25; Trim5.5;
batches3; produced12; excess2;
starting squares/fabric6; total12.

## G42 — Flying Geese one-at-a-time

F4×2; N3:
Standard body4.5×2.5; background2.5 squares;
Trim body4.75×2.75; background2.75;
3 body rectangles; 6 background squares; produced3.

## G43 — Flying Geese four-at-a-time

F4×2; N10:
Standard body square5.25; background2.875;
Trim body5.5; background3.125;
batches3; produced12; excess2;
3 body squares; 12 background squares.

## G44 — Batting roll

Top60×80; O4 → required68×88.
Roll width72; rotation allowed:
orientation with68 across is valid and consumes88;
orientation with88 across invalid;
result requires88 linear inches.

## G45 — Pieces from finite stock

Stock18×21; repeated5×5 squares; unrestricted rotation:
practical grid yield = floor(18/5)×floor(21/5)=3×4=12;
returned layout places12 with no overlap.

# 22. Required property tests

## Geometry

- no overlap within a material bin;
- every placement inside bin;
- every requested instance accounted exactly once across stock + purchase;
- no duplicate instance;
- no forbidden rotation;
- WOF semantics preserved;
- fabric identities never mix.

## Purchase

- raw additional purchase >= 0;
- recommended >= buffered >= raw additional purchase;
- if raw additional = 0, recommended = 0;
- rounding upward;
- existing-stock dimensions unaffected by safety;
- a plan with less raw purchase outranks more-purchase plan before waste/complexity.

## Stock

- equal area does not imply fit;
- every result preserves stock-bin identity;
- if “purchase disabled,” no purchased-bin placement exists;
- any unallocated list exactly equals unmet required instances.

## Pattern comparison

- independent of on-hand stock;
- no claim that positive difference proves a pattern error;
- WOF mismatch warning when known assumptions differ.

## Determinism

- same input/state → same placements, purchase, score, and instructions.

## Existing calculators

- backing coverage adequate;
- HST produced >= requested;
- QST produced >= requested;
- Flying Geese produced >= requested;
- joined-WOF strip count adequate and one fewer insufficient.

## Language

Generic optimizer UI/model must not expose global-optimum claims such as:

- “minimum possible”;
- “mathematically optimal”;
- “true minimum.”

# 23. Source basis for newly added rules

QST standard/oversized sizing:

- https://thecraftyquilter.com/2012/02/quarter-square-triangle-tutorial/
- https://www.bethanylynnemakes.com/how-to-make-quarter-square-triangles/

Flying Geese standard formulas and method behavior:

- https://modern-textiles.com/blogs/blog/flying-geese-quilt-block-calculator
- https://niftyfiftyquilting.com/calculators/flying-geese

Flying Geese trim-friendly four-at-a-time sizing:

- https://thecraftyquilter.com/2021/05/two-methods-for-oversized-flying-geese-including-cutting-charts/

Batting/backing overage variability and 4" longarm-oriented guidance:

- https://www.apqs.com/how-to-load-a-quilt-part-2/
- https://www.apqs.com/quilting-the-quilt-ready-set-quilt/

Existing domain corrections remain authoritative, including corrected 4-at-a-time HST geometry and seam-loss-aware joined WOF behavior.
