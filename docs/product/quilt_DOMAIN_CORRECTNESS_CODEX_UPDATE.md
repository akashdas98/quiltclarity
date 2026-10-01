# Quilt Utility Website — Post-Build Domain Correctness Remediation Brief

**Status:** AUTHORITATIVE targeted post-build correction memo  
**Date:** 2026-08-06  
**Use:** Give this document to Codex **now, before** the Production UX/Content/SEO package.  
**Scope:** Audit and patch the already-built V1 for quilting-domain correctness only.

## Authority

The existing V1 package remains authoritative except for the specific corrections in this memo.

For the numbered corrections below, this memo is an **intentional Evidence-over-agenda revision** and supersedes any conflicting wording or fixture in:

1. `quilt_FINAL_product_spec_v1.md`
2. `quilt_FINAL_golden_rules_and_tests.md`
3. `quilt_FINAL_codex_handoff.md`
4. `quilt_FINAL_prebuild_dossier.md`

Everything not explicitly changed here remains locked.

Codex must **implement and re-test**, not merely produce an audit report.

---

# 1. Audit Verdict

The existing domain contract is mostly sound.

The following core rules remain valid:

- 1/4" default piecing seam allowance;
- distinct nominal vs usable WOF;
- usable WOF controls packing;
- 42" nominal / 40" usable as editable conservative defaults;
- directional fabric disables rotation by default;
- WOF strips run across usable WOF;
- safety allowance is applied after layout calculation;
- purchase quantity rounds upward;
- 4" backing overage per side as an editable **longarm-oriented planning default**, with instruction to confirm the actual longarmer requirement;
- 1/2" backing-panel seam allowance;
- comparison of vertical and horizontal backing layouts when direction permits;
- straight/cross-grain double-fold binding as V1 scope;
- 2-at-a-time and 8-at-a-time HST standard formulas;
- 4-at-a-time HST bias-edge warning;
- no partial blocks in Block Count;
- straight, non-mitered border scope;
- row-wise no-cornerstone/no-outer-sashing scope;
- deterministic practical optimizer rather than a claimed global optimum.

However, one formula is materially wrong as an “exact” rule, and several assumptions need stronger implementation semantics so the product cannot overclaim quilting certainty.

---

# 2. P0 — Replace the 4-at-a-Time HST `÷ 0.64` Formula

## Problem

The current Golden Rules use:

`startingSquare = unfinishedHST / 0.64`

then round upward to 1/4".

This is a **common quilting chart shortcut**, but it is not an exact geometric formula. The factor is not constant across sizes.

It can:

- produce an undersized starting square at small HST sizes;
- become increasingly conservative/wasteful at larger sizes.

Therefore it must not remain the authoritative mathematical rule.

## Correct geometry

Let:

- `U` = desired unfinished HST side length;
- `SA` = seam allowance used when sewing around the perimeter;
- V1 default `SA = 1/4"`.

For the 4-at-a-time construction:

`U = (S - 2SA) / sqrt(2)`

Therefore:

`S_geometric = U * sqrt(2) + 2SA`

For the V1 default 1/4" seam:

`S_geometric = U * sqrt(2) + 1/2"`

Because quilters cut with ruler-friendly increments, the production starting size should then be rounded **up** to the selected practical increment.

V1 standard increment:

`1/4"`

So:

`S_standard = ceilToQuarter(S_geometric)`

Trim-friendly mode:

`S_trimFriendly = S_standard + 1/4"`

## UI naming

Do **not** call the ruler-rounded value “mathematically exact.”

Use:

- **Standard**
- **Trim-friendly**

Optional methodology text may show the geometric minimum.

The existing 2-at-a-time `F + 7/8"` and 8-at-a-time `2 × (F + 7/8")` formulas are established ruler-friendly quilting formulas. They may remain, but user-facing copy should prefer **Standard** over **Exact**, because those formulas themselves are practical rounded conventions.

## Revised G12

Input:

- finished HST: 4"
- desired quantity: 10
- seam allowance: 1/4"

Expected:

- unfinished `U = 4.5"`
- geometric starting square:
  `4.5 × sqrt(2) + 0.5 = 6.863961..."`
- standard quarter-inch cut:
  `7"`
- trim-friendly:
  `7.25"`
- batches = 3
- produced = 12
- excess = 2
- starting squares per fabric = 3
- total starting squares = 6
- warning: outer edges are bias

The previous expected `7.25" standard / 7.5" trim-friendly` must be replaced.

## New regression test — small HST

Input:

- finished HST: 1"
- unfinished: 1.5"
- SA: 1/4"

Expected:

- geometric = `1.5 × sqrt(2) + 0.5 = 2.62132..."`
- standard = `2.75"`
- trim-friendly = `3"`

Purpose:

- catches the old `/0.64` shortcut, which can round too small here.

## New regression test — larger HST

Input:

- finished HST: 8"
- unfinished: 8.5"
- SA: 1/4"

Expected:

- geometric = `8.5 × sqrt(2) + 0.5 = 12.5208..."`
- standard = `12.75"`
- trim-friendly = `13"`

Purpose:

- prevents the old `/0.64` shortcut from wasting unnecessary fabric at larger sizes.

## Source basis

Common-chart shortcut:

- https://haileystitches.com/half-square-triangle-charts/
- https://shannonfraserdesigns.ca/2022/04/12/4-at-a-time-half-square-triangle-tutorial-math-cheat-sheet/

Evidence that `0.64` is only an approximation and varies with starting-square size:

- https://www.reddit.com/r/quilting/comments/1m5d380/

The geometric formula above should be implemented directly and independently tested.

---

# 3. P0 — Remove False “Minimum” Language from Heuristic Planner Results

## Problem

The optimizer is explicitly heuristic and is not globally optimal, but parts of the product contract use terms such as:

- “Calculated minimum”

for the chosen layout length.

That can be interpreted as a mathematically proven lower bound.

## Required update

For heuristic planner output, use:

- **Calculated plan length**
- **Layout requirement**
- **This plan uses X**
- **Recommended purchase**

Do not use:

- minimum possible;
- exact minimum;
- optimal minimum;
- guaranteed least fabric.

Keep the existing disclosure:

> This is a practical optimized plan, not a mathematically proven global optimum.

## Important distinction

Standalone formulas can still say “exact” when the value is actually deterministic from the selected assumptions.

The generic packing planner cannot claim global minimum fabric.

---

# 4. P1 — Backing: Rename the Automatic Recommendation

## Existing math

The current backing math is sound for the stated model:

- editable overage;
- usable backing width;
- 1/2" panel seam allowance;
- vertical/horizontal candidate calculation;
- directionality filtering.

Keep it.

## Problem

“Recommended” or “lower-waste” can imply that the lowest-yardage seam orientation is universally the best quilting choice.

It is not.

Backing seam orientation and placement can depend on:

- longarm loading;
- fabric print direction;
- aesthetics;
- desire to avoid a seam directly down the center;
- a specific longarmer’s preferences.

## Required UI/output change

Show:

> **Uses least fabric**

or:

> **Lowest-yardage option**

Do not present it as an unconditional quilting recommendation.

Show every valid candidate.

Add concise guidance:

> Seam orientation can also depend on print direction and your quilting setup. If using a professional longarmer, confirm their preferences.

For two-panel backings, optionally add:

> Many quilters prefer not to place a backing seam directly on the quilt centerline.

This is guidance, not a blocking calculation rule.

## Source basis

- APQS backing guidance: https://www.apqs.com/how-to-piece-quilt-backs/
- American Patchwork & Quilting backing guidance:
  https://www.allpeoplequilt.com/how-to-quilt/finishing/plan-your-quilt-back-and-determine-yardage

Both support 1/2" backing seams and practical seam-placement considerations.

---

# 5. P1 — Backing Overage Must Be Labeled as a Default, Not a Universal Requirement

Keep default:

- `4" per side`

But the UI/help copy must make clear that this is a common longarm-oriented planning default.

Required wording direction:

> **Backing overage per side**  
> Default: 4"  
> Longarm requirements vary. Confirm with your quilter before purchasing.

Do not encode separate “domestic = 2"” or “hand quilting = 2"” presets as authoritative behavior.

If the built app currently contains those presets because they appeared in older research notes, remove or relabel them as non-authoritative suggestions.

Source basis:

- https://scissortailquilting.com/glossary/overage/
- longarm-prep guidance commonly requests 4" per side
- actual longarm requirements vary by provider

---

# 6. P1 — Border Calculator: Treat It as Planning Math, Not Final Cutting Measurement

## Problem

The existing calculator uses nominal quilt dimensions to plan borders.

In real construction, reliable border lengths should be based on the **actual assembled quilt top**, measured through the center (often in multiple places), not blindly cut from theoretical dimensions.

The existing warning is correct, but the output language must not undermine it.

## Required behavior

Keep the V1 planning formulas and G16 unless another implementation bug is found.

However:

### Inputs

Label dimensions clearly as planning/current quilt-top dimensions.

### Results

Use:

- **Nominal side-border length**
- **Nominal top/bottom-border length**
- **Planning yardage**

Do not call these:

- guaranteed final cut lengths;
- exact measured border lengths.

### Required warning

> Before cutting the final border lengths, measure the assembled quilt top through the center in multiple places and use the chosen measured/averaged length.

## V1 construction assumption

Make this visible:

> Straight, non-mitered borders · WOF/cross-grain strips · side borders first

This is a **V1 planning model**, not a claim that cross-grain or side-first construction is the only correct quilting method.

## Source basis

Utah State University Extension:

- https://extension.usu.edu/sewing/research/straight-grain-quilt-borders

American Patchwork & Quilting:

- https://www.allpeoplequilt.com/how-to-quilt/finishing/border-and-corner-blocks

Both emphasize measuring the actual quilt center; published guidance varies on grain preference, which is why V1 must expose its cross-grain assumption rather than call it universal best practice.

---

# 7. P1 — Border and Sashing: Model WOF Join Loss Explicitly

## Problem

The current Golden Rules use a fixed `J = 10"` “strip-joining allowance” and then:

`strips = ceil(totalStripLength / U)`

A fixed buffer is useful, but it is not a mathematical substitute for the length lost in every end-to-end strip join.

Near a strip-count boundary, the current formula can theoretically return too few WOF strips.

## V1 correction

Define a shared straight end-to-end WOF join model.

Default join seam allowance:

`joinSA = 1/4"`

For `n` WOF strips, straight-joined end-to-end:

`effectiveJoinedLength(n) = n × U - (n - 1) × 2 × joinSA`

With the default 1/4":

`effectiveJoinedLength(n) = nU - (n - 1) × 0.5"`

Find the **smallest integer n** such that:

`effectiveJoinedLength(n) >= requiredLinearLength + handlingBuffer`

## Rename `J`

Do not call the fixed 10" value the seam/join allowance.

Rename conceptually to:

- **handling/cutting buffer**
- or **planning buffer**

Default may remain 10" for V1.

Actual join loss is calculated separately.

## Border

For V1 straight WOF border strips:

- use straight end-to-end strip joins in the calculation;
- model the 1/4" join seam explicitly;
- then apply the editable/default planning buffer.

Utah State University explicitly describes end-to-end border-strip joins using a 1/4" seam.

## Sashing

Use the same shared joined-strip-capacity primitive.

The current row-wise sashing piece dimensions remain valid:

- cut width = finished sashing + 2SA;
- short vertical pieces match unfinished block height;
- long horizontal rows match unfinished row width.

But strip-count logic must prove enough effective joined WOF length exists after join losses.

## Boundary regression test

Input:

- usable WOF = 40"
- straight join SA = 1/4"
- required linear length = 79.75"
- handling buffer = 0

Two strips nominally provide 80", but after one join:

`2 × 40 - 0.5 = 79.5"`

Expected:

- 2 strips are insufficient
- 3 strips required

This test should exist on the shared joined-strip primitive.

## Existing G16/G17

Re-run them after this correction.

Their expected strip counts should remain valid with the current 10" planning buffer:

- G16 remains 8 WOF strips
- G17 remains 9 WOF strips

If implementation produces different results, investigate before changing the fixture.

---

# 8. P1 — Sashing Assumptions Must Be Explicit

The current V1 math is intentionally for:

- rectangular block grids;
- row-wise assembly;
- sashing between blocks and rows;
- no cornerstones;
- no outer sashing.

Keep this model.

The UI must visibly state:

> Row-wise sashing · No cornerstones · No outer sashing

If a long horizontal sashing row exceeds usable WOF:

- show that it must be pieced;
- yardage must account for WOF join loss as specified above.

Do not silently invent cornerstones or alternate assembly methods.

Source basis:

- https://quiltmetric.com/en/sashing-calculator
- https://designedtoquilt.com/calculate-sashing-for-a-quilt/

---

# 9. P2 — Keep These Defaults, but Classify Them Correctly

The following should **not** be changed merely because practice varies.

They are valid editable product defaults:

## WOF

- nominal 42"
- usable 40"

These are conservative defaults, not fabric facts.

WOF varies by manufacturer/fabric.

References:

- Moda notes usable quilting-cotton width is around 40" give or take.
- Fat Quarter Shop defines WOF as selvage-to-selvage and commonly around 44".
- current patterns may explicitly assume 42" usable WOF.

## Piecing seam allowance

- 1/4" default

Strong quilting convention, still editable where the product allows.

## Safety allowance

- 5% default
- 0/5/10/custom

This is a product convenience, not a quilting theorem.

## Purchase rounding

- 1/8 yd imperial
- 0.1 m metric

Store policy varies, so keep editable.

## Binding

- V1 straight/cross-grain double-fold only
- 2.5" strip width default
- 12" corner/end allowance default

These are reasonable defaults.

Utah State University gives:

- 7–12" extra for joining/corners;
- 2.25" or 2.5" binding width depending on quilt thickness.

Therefore:

- keep 12";
- keep 2.5";
- label/edit them as defaults.

Reference:

- https://extension.usu.edu/sewing/research/double-crosswise-grain-binding
- https://extension.usu.edu/sewing/research/binding-a-quilt

---

# 10. P2 — HST Terminology Cleanup

For user-facing copy:

Prefer:

- **Standard**
- **Trim-friendly**

over:

- **Exact**
- **Beginner**

Reason:

“Exact” overstates the ruler-friendly conventional formulas, while “Beginner” incorrectly implies experienced quilters do not oversize-and-trim.

The calculation outputs should still expose:

- finished size;
- unfinished/trim size;
- starting-square size;
- yield;
- batches;
- produced;
- excess.

4-at-a-time must retain the bias-edge warning.

---

# 11. P2 — Directionality / Rotation Audit

No domain-rule change.

Codex must verify the built app actually implements:

`piece.rotationAllowed ?? fabric.defaultRotationAllowed`

and:

- directional fabric defaults to rotation disabled;
- an explicit piece-level `false` always wins;
- WOF strips are never auto-rotated lengthwise;
- orientation constraints cannot be violated to improve optimizer score.

Re-run:

- G03
- G04
- G07
- G23
- G27

---

# 12. P2 — WOF Audit

Verify that every calculator distinguishes where appropriate between:

- nominal fabric width;
- usable fabric width.

Packing and piece-count math must use **usable width**.

Do not silently subtract a fixed selvage amount from a value the user already identified as usable.

Re-run:

- G02
- G08
- G22
- G24

---

# 13. Required Domain-Test Changes

Codex must update the automated domain suite as follows.

## Modify

### G12

Replace old 4-at-a-time shortcut expectations with the exact-geometry + quarter-inch-up-rounding expectations in Section 2.

## Add

### G28 — 4-at-a-time HST small-size protection

Use the 1" finished case in Section 2.

### G29 — 4-at-a-time HST large-size efficiency

Use the 8" finished case in Section 2.

### G30 — joined-WOF boundary

Use the 79.75"/40"/1/4" case in Section 7.

### Property: joined-strip adequacy

For any returned joined-strip count `n`:

`effectiveJoinedLength(n) >= required`

and, when `n > 1`:

`effectiveJoinedLength(n - 1) < required`

### Property: heuristic language

No generic planner result model/UI test should expose a global-optimum claim such as `minimum possible`.

---

# 14. Required Documentation Synchronization

After implementation passes:

Update the repository copies of the domain documentation so there is no permanent conflict.

At minimum patch:

- Golden Rules:
  - HST 4-at-a-time rule
  - G12
  - add G28–G30
  - border/sashing joined-strip capacity rule
  - terminology around defaults/product choices

- Product Spec:
  - planner “minimum” wording
  - backing “recommended” wording
  - border output as nominal/planning length
  - joined-strip behavior

- Codex Handoff:
  - HST formula
  - strip-join primitive
  - updated test list

Do not rewrite unrelated product scope.

---

# 15. Required Codex Execution Procedure

Codex should execute in this order:

1. Read this memo and the existing FINAL documents.
2. Locate all affected domain functions.
3. Locate all affected user-facing copy.
4. Update the 4-at-a-time HST engine first.
5. Update G12 and add G28/G29.
6. Implement shared joined-WOF capacity helper.
7. Apply it to border and sashing strip-count calculations.
8. Add G30/property coverage.
9. Update backing result labels/guidance.
10. Update border planning labels/warnings.
11. Update HST Standard/Trim-friendly terminology.
12. Audit WOF/directionality rules.
13. Run G01–G30 plus all property tests.
14. Run full application test/build/typecheck/lint.
15. Manually smoke-test the affected calculators in-browser.
16. Update repository documentation copies.
17. Produce a final report.

Do not continue into UX/SEO polish until this domain remediation passes.

---

# 16. Codex Completion Report Format

```text
DOMAIN REMEDIATION REPORT

4-at-a-time HST:
- formula updated:
- G12 updated:
- G28:
- G29:

Joined WOF strip capacity:
- shared helper:
- border:
- sashing:
- G30/property tests:

Backing wording:
- lowest-yardage labeling:
- longarmer/seam-orientation guidance:

Border wording:
- nominal planning lengths:
- actual-measurement warning:
- V1 grain/construction assumption:

Defaults audit:
- WOF:
- seam allowance:
- safety:
- purchase rounding:
- binding:

Regression:
- G01–G30:
- property tests:
- typecheck:
- build:
- browser smoke tests:

Documentation synchronized:

Remaining domain ambiguity:
- None
or
- [specific item]
```

---

# 17. Residual Domain Risk After This Pass

After these corrections, the deterministic domain math should be suitable for production-level automated confidence.

What remains inherently harder to prove without real quilters is not basic arithmetic. It is **practice quality**, especially:

- whether the heuristic cutting plan feels natural at a cutting table;
- whether cutting instructions are ordered the way experienced quilters prefer;
- whether users prefer a different valid backing seam layout for aesthetic/machine reasons;
- whether terminology feels immediately natural.

Those are usability/practice-validation issues and should be handled in the later UX pass and, ideally, lightweight real-quilter testing.

They must not be “fixed” by silently changing domain formulas.

---

# 18. Final Rule

> **Mathematical rules must be mathematically valid. Variable quilting practices must be exposed as defaults or assumptions. Product heuristics must not masquerade as universal quilting truth.**
