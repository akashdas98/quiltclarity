# QuiltClarity V1.1 — Product Specification

**Status:** Implementation-ready functional specification  
**Date:** 2026-08-17  
**Governing strategy:** `00_GOVERNING_AGENDA.md`  
**Governing domain contract:** `02_GOLDEN_RULES_AND_TESTS.md`

# 1. Product definition

QuiltClarity is a free, SEO-led quilting utility site whose main workflow converts an external project cut list and project-local fabric availability into a verified shopping-and-cutting plan.

Core promise:

> **Know what your project needs. Use what you already have. Buy only the planned shortfall. Cut from one clear plan.**

Do not market the product as a unique generic rectangle optimizer.

# 2. Core user journey

1. Open **Fabric Cutting Planner**.
2. Choose unit system.
3. Name project optionally.
4. Add/rename fabrics used by the project.
5. Enter cut requirements rapidly in a table.
6. For each fabric, optionally add:
   - pattern-stated yardage;
   - pattern-assumed WOF;
   - actual stock pieces on hand.
7. Calculate project plan.
8. System validates and jointly reconciles requirements.
9. Results show, per fabric:
   - whether on-hand stock is sufficient;
   - planned fresh-fabric requirement;
   - pattern-stated comparison if supplied;
   - additional purchase required;
   - allocations into existing stock;
   - purchased-bolt layout if required;
   - cutting instructions;
   - remaining usable stock where practical;
   - assumptions and warnings.
10. User edits inputs, recalculates, prints, or copies a shopping summary.

No signup.

# 3. Project model

## 3.1 Project

Fields:

- `id` local identifier;
- `schemaVersion`;
- `name?`;
- `unitSystem`: imperial | metric;
- `defaultSeamAllowance`;
- `fabrics[]`;
- `cutRequirements[]`;
- timestamps for local persistence only.

## 3.2 Fabric plan

Fields:

- `id`;
- `name`;
- `nominalWidth`;
- `usableWidth`;
- `directional`;
- `defaultRotationAllowed`;
- `safetyPercent`;
- `purchaseIncrement`;
- `patternStatedAmount?`;
- `patternAssumedUsableWidth?`;
- `stockPieces[]`;
- `notes?` local-only.

## 3.3 Cut requirement

Fields:

- `id`;
- `fabricId`;
- `label`;
- `quantity`;
- `width`;
- `height`;
- `dimensionMode`: cut | finished;
- `rotationAllowed?` override;
- `orientation`: none | crosswise | lengthwise;
- `isWofStrip`;
- `multiplier` or repeated-group support where implemented;
- `notes?` local-only.

The calculation engine consumes normalized cut dimensions.

## 3.4 Stock piece

A stock piece is **project-local physical geometry**, not a stash record.

Fields:

- `id`;
- `fabricId`;
- `label`;
- `sourceType`: preset | custom | partial-yardage;
- `width` = across-fabric/crosswise dimension;
- `length` = lengthwise dimension;
- `quantity`;
- optional preset metadata for display only.

Presets populate editable dimensions. The edited dimensions are authoritative.

Initial useful presets:

- fat quarter;
- fat eighth;
- quarter yard;
- half yard;
- custom rectangle.

Do not assume every commercial/precut piece has perfectly identical real-world dimensions; label presets as editable.

# 4. Rapid cut-list compiler

Input friction is a core product requirement.

Desktop/table behavior:

- spreadsheet-like rows;
- keep each field's visible label directly above its control instead of relying
  on a header that can scroll out of view;
- group validation messages beneath the complete affected row, prefix each with
  its field label, and list simultaneous row errors vertically while retaining
  focus on the first invalid control;
- fast Tab/Shift+Tab navigation;
- Enter/add-row path;
- duplicate row;
- duplicate multiple selected rows if practical;
- quantity multiplier;
- easy fabric assignment;
- reorder only if it helps readability; calculation must not depend on UI row order.

Bulk paste:

- accept tab/newline-separated rows copied from spreadsheets and comma-separated
  CSV values;
- auto-detect tab-separated versus CSV input deterministically, including quoted
  CSV fields, without guessing prose;
- provide explicit expected columns;
- parse into a preview;
- require confirmation before adding;
- flag malformed/ambiguous rows;
- never infer dimensions/fabric meanings from prose.

Recommended paste columns:
`Fabric | Label | Qty | Width | Height | Size mode`

Optional supported columns can be added only when unambiguous.

Mobile:

- rows may render as compact editable cards;
- preserve the semantic containers for fabrics, stock, cuts, allocations, and
  text alternatives; retain card chrome and padding for first-level Project,
  Fabric, Cut requirements, summary, and per-fabric result groups, but render
  their subordinate and sub-subordinate containers as full-width vertically
  separated sections rather than accumulating four-sided borders and horizontal
  padding;
- return validation beneath the affected control at card breakpoints while its
  label remains beside it and omit the redundant field-name prefix; at the
  narrowest breakpoint stack the label above a full-width control and place its
  unprefixed error below;
- remove an edited field's stale validation presentation without clearing other
  field errors, and clear all validation state before focusing successful
  recalculated results;
- preserve efficient add/duplicate;
- do not force a wide desktop grid off-screen as the only method.

# 5. Finished vs cut dimensions

Cut mode:

- dimensions are used exactly.

Finished mode:

- rectangular piece receives seam allowance on all four edges:
  `cutWidth = finishedWidth + 2SA`
  `cutHeight = finishedHeight + 2SA`.

UI shows the resolved cut size.

# 6. Pattern yardage comparison

Pattern information is optional.

Per fabric user may enter:

- pattern-stated purchase amount;
- pattern-assumed usable WOF if known.

System computes a separate **fresh-fabric planning scenario** ignoring project stock, using the current entered cut requirements and current assumptions.

Display concepts:

- **Pattern says**
- **Planned cuts require**
- **With your safety allowance**
- **Recommended purchase**
- **Difference**
- **You already have / Buy now** separately.

Important:

- pattern comparison is not the same as purchase shortfall;
- stock on hand must not make the pattern look “wrong” by reducing the comparison basis to zero;
- if supplied pattern WOF differs materially from current usable WOF, warn that the comparison is not like-for-like;
- discrepancies are informational.

Forbidden default copy:

- “pattern is wrong”;
- “true minimum”;
- “exact minimum.”

Explain possible legitimate reasons for larger pattern allowances: construction method, trimming, shrinkage/prewash, squaring, miscuts, fussy cutting, directional placement, designer preference.

# 7. Stock-aware project reconciliation

For each fabric, the system has:

- normalized required piece instances/groups;
- zero or more finite stock bins;
- optional newly purchased bolt fabric with fixed usable width and variable required length.

The planner must evaluate requirements jointly.

It must not:

- calculate each piece type independently and add the results;
- simply subtract “yardage owned” from “yardage required”;
- assume total area proves fit;
- greedily consume stock without considering how that affects additional purchase.

Required result:

- placements into each stock piece;
- remaining unmet requirements;
- additional bolt layout if needed;
- raw additional length;
- safety-adjusted additional length;
- rounded purchase amount;
- leftover regions/summary where practical.

# 8. Purchase-shortfall semantics

Existing stock is already owned physical material. Safety percentages cannot create more of it.

If raw additional purchase length is `P`:

`bufferedPurchase = P × (1 + safetyPercent/100)`

`recommendedPurchase = roundUp(bufferedPurchase, purchaseIncrement)`

If `P = 0`:

- recommended purchase = 0;
- do not add a fictitious safety purchase automatically.

If user has nonzero safety and stock fits with no spare room, show guidance such as:

> “Your entered stock fits the planned cuts. The safety setting applies to new fabric purchases; it cannot add margin to fabric already on hand.”

# 9. Plan output hierarchy

Project result:

1. **Project status**
   - all fabrics covered / additional purchase needed / blocking issue.
2. **Shopping list**
   - each fabric and buy quantity;
   - “No additional purchase” where applicable.
3. **Fabric comparison cards**
   - pattern says if entered;
   - fresh-fabric plan;
   - on-hand allocation;
   - buy now.
4. **Existing-stock allocations**
5. **Purchased-fabric layouts**
6. **Cutting instructions**
7. **Leftover summary**
8. **Assumptions and warnings**
9. **Methodology / practical optimizer disclosure**

# 10. Cutting execution

Cutting instructions must be derived from the chosen placements/strip grouping, not invented by a separate contradictory engine.

Prefer human-readable instructions:

- cut WOF strips;
- subcut repeated rectangles/squares;
- identify when a piece comes from a specific remnant/stock item;
- preserve labels/group IDs.

Avoid coordinate-only instructions.

When placements cannot be cleanly expressed as strip operations:

- still provide exact diagram + piece list;
- do not fabricate a simpler cutting sequence that no longer matches geometry.

# 11. Visual plan

SVG from actual placements.

Every stock/purchased segment view shows as applicable:

- stock label;
- dimensions;
- usable width;
- piece group labels;
- dimensions;
- orientation/direction marker;
- strip boundaries;
- unused regions;
- length scale.

Dense plans use legend/key rather than unreadable tiny text.

Textual equivalent is required for accessibility.

# 12. Persistence

localStorage only.

Persist:

- latest project;
- user defaults where useful;
- schema version.

Do not sync to a server.

Migration from old planner state is specified in `07_TECHNICAL_MIGRATION_PLAN.md`.

# 13. Standalone calculators

## 13.1 Fabric Yardage

Preserve current behavior:

- one repeated rectangular piece type;
- usable WOF;
- quantity;
- rotation;
- finished/cut;
- safety;
- purchase rounding.

Outputs raw layout, buffered requirement, recommended purchase, explanation.

## 13.2 Quilt Backing

Preserve authoritative rules:

- editable overage per side, default 4";
- usable backing width;
- 1/2" default panel-join seam allowance;
- compare vertical/horizontal valid candidates;
- directional restrictions.

Label the lowest-yardage candidate:

- **Uses least fabric** or
- **Lowest-yardage option**.

Never imply it is aesthetically/machine universally preferred.

## 13.3 Quilt Batting

Inputs:

- quilt width/length;
- overage per side, default 4" and editable;
- optional batting roll/precut width;
- rotation allowed when relevant.

Basic required size:
`requiredWidth = quiltWidth + 2O`
`requiredLength = quiltLength + 2O`.

If a supplied roll width can cover one required dimension, calculate linear length for valid orientations and show the lower-length option with orientation disclosed.

This calculator does **not** calculate pieced batting. If neither orientation fits:

> “Choose a wider batting width/precut or piece batting separately; piecing is not calculated here.”

The 4" default is a conservative product convenience common in longarm guidance, not universal practice.

## 13.4 Binding

Straight/cross-grain double-fold binding only. Preserve authoritative current formula/defaults.

## 13.5 HST

Methods:

- 2-at-a-time;
- 4-at-a-time;
- 8-at-a-time.

Sizing options:

- **Standard**
- **Trim-friendly** (default)

Never label Standard as “Exact.”

Preserve corrected geometric 4-at-a-time rule in Golden Rules.

## 13.6 QST

Scope:

- classic two-color hourglass / quarter-square-triangle batch method;
- finished square input;
- requested quantity.

Sizing:

- Standard starting square = `F + 1.25"`
- Trim-friendly starting square = `F + 1.5"` (default).

One batch starts from 2 squares of each of two fabrics (4 total) and produces 4 QST units.

Outputs:

- finished size;
- trim/unfinished size `F + 0.5"`;
- starting-square size;
- batches;
- starting squares per fabric;
- produced;
- excess.

Do not claim this covers every multi-color QST construction variant.

## 13.7 Flying Geese

Scope:

- conventional finished proportion `W = 2H`;
- one-at-a-time and four-at-a-time methods;
- Standard and Trim-friendly sizing;
- Trim-friendly default.

If user enters non-2:1 finished proportions, block or clearly state that this calculator does not model that construction.

### One at a time — Standard

For finished `W × H`:

- body rectangle `W + 0.5"` by `H + 0.5"`;
- 2 background squares `H + 0.5"`;
- yield 1.

### One at a time — Trim-friendly

- body rectangle `W + 0.75"` by `H + 0.75"`;
- 2 background squares `H + 0.75"`;
- yield 1.

### Four at a time — Standard

- 1 body square `W + 1.25"`;
- 4 background squares `H + 0.875"`;
- yield 4.

### Four at a time — Trim-friendly

- 1 body square `W + 1.5"`;
- 4 background squares `H + 1.125"`;
- yield 4.

Outputs batch counts, pieces required, produced/excess, and method guidance.

Avoid calling the trim-friendly four-at-a-time method “no-waste.”

## 13.8 Block Count / Size

Preserve current whole-block rules.

## 13.9 Borders

Preserve current straight, non-mitered, cross-grain, side-first planning scope and joined-WOF seam-loss correction.

## 13.10 Sashing

Preserve row-wise, no-cornerstones, no-outer-sashing scope and joined-WOF seam-loss correction.

## 13.11 Pieces from Fabric / Stock Fit

Inputs:

- one finite rectangular stock piece;
- one repeated piece size;
- quantity optional:
  - if absent: return maximum practical yield;
  - if present: return whether requested quantity fits and placements;
- rotation/directional constraints;
- finished/cut mode.

Output:

- pieces that fit;
- requested-vs-fit if quantity entered;
- visual layout;
- leftover summary;
- assumptions.

This calculator must use the same finite-stock geometry engine as the project planner.

# 14. Validation

Block calculation for:

- nonpositive dimensions/quantities;
- usable width <= 0;
- usable width > nominal width where both are supplied;
- impossible WOF/orientation constraints;
- invalid stock dimensions;
- missing fabric assignment;
- malformed paste rows not explicitly confirmed/corrected;
- non-2:1 Flying Geese input in the locked method scope.

Never silently alter user input to “make it work.”

# 15. Error vs warning

Errors block a correct plan.

Warnings allow calculation but disclose uncertainty/practice:

- pattern WOF differs;
- directional rotation restriction;
- current stock fits without extra safety margin;
- longarmer/batting overage varies;
- backing seam orientation may depend on print/equipment;
- practical heuristic is not globally proven optimal.

# 16. Accessibility

Required:

- semantic labels;
- full keyboard input path;
- visible focus;
- no color-only meaning;
- field-specific errors;
- table/card mobile equivalence;
- textual equivalents to diagrams;
- print output understandable in grayscale.

# 17. Performance

Core planning must not freeze the browser.

Requirements:

- grouped representations;
- deterministic strategy caps;
- workload guardrails;
- large plans may use a simpler documented heuristic;
- preserve correctness invariants under fallback.

Do not introduce random search whose output changes across runs.

# 18. Privacy

Do not transmit:

- project name;
- fabric notes;
- piece labels/free text;
- pasted cut lists.

Analytics uses categorical/count/bucketed properties only.

# 19. Acceptance criteria

Functional completion requires:

- all Golden fixtures and properties pass;
- old valid planner projects migrate;
- a fresh-bolt-only project can reproduce prior valid behavior;
- multiple finite stock pieces can be allocated;
- stock shortfall produces correct additional purchase;
- pattern comparison remains separate from stock shortfall;
- cutting diagrams match placement geometry;
- input table supports rapid entry and safe paste;
- all 11 calculators work and expose assumptions;
- print is coherent;
- no backend/account dependency;
- competitor acceptance gate passes before public launch.
