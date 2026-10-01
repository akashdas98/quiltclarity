# QuiltClarity V1.1 — Competitive Benchmark & Launch Gate

**Status:** Mandatory pre-launch acceptance contract  
**Date:** 2026-08-17

# 1. Why this exists

The previous product thesis failed because feature overlap was mistaken for differentiation.

Therefore launch requires an end-to-end **same-job** comparison against current realistic alternatives, not a marketing feature matrix.

# 2. Competitors to re-check immediately before launch

At minimum:

- QuiltSandwich;
- Quilt Geek;
- Gibson Threads;
- NiftyFifty;
- any newly discovered product that can plausibly complete the same external-project fabric-planning job.

Design-first tools should also be included where they can realistically absorb the same start state without disproportionate recreation.

Do not rely on research screenshots/months-old feature lists for the final gate.

# 3. Benchmark principle

For each representative job compare:

- starting state;
- required setup;
- required design recreation;
- number/type of manual transformations;
- ability to enter all requirements;
- ability to model exact stock;
- cross-piece joint planning;
- shortage purchase;
- pattern comparison;
- output;
- residual manual work;
- price/account/install constraints;
- correctness/clarity.

Do not manufacture victory from “free” or “web” alone.

# 4. Required benchmark cases

## C1 — Same-fabric mixed requirements

Input concept:
One fabric feeds several different piece sizes.

Goal:

- jointly calculate requirement;
- exploit shared leftover space;
- no manual “inspect scrap and reduce yardage yourself” step.

QuiltClarity pass:

- complete joint plan;
- no independent-piece overcount;
- clear geometry/instructions.

## C2 — Multiple exact stock pieces + shortfall

User has, for one fabric:

- one fat quarter;
- one custom remnant;
- one partial-yardage rectangle.

Project requires multiple piece sizes.

Goal:

- allocate actual rectangles;
- prove fit geometrically;
- buy only remaining bolt length;
- output combined plan.

This is a central reason-to-win case.

## C3 — Pattern amount + on-hand stock + buy-now

Input:

- pattern-stated amount;
- known pattern WOF if available;
- external cut list;
- actual stock.

Goal:
show separately:

- pattern says;
- fresh-fabric plan;
- on-hand allocation;
- buy now.

No manual arithmetic required after tool output.

## C4 — Directional constraint

Same kind of project with directional fabric.

Goal:

- no illegal rotations;
- stock allocation and purchase remain correct;
- assumptions visible.

## C5 — Realistic long cut list

At least ~20 rows across multiple fabrics.

Goal:
compare input/recreation burden.

QuiltClarity should demonstrate that external requirements can be compiled without visually rebuilding the quilt.

# 5. Scoring dimensions

Use descriptive scoring, not fake precision:

- **Complete:** solves without material manual workaround.
- **Partial:** solves subset but requires meaningful reconciliation.
- **Absent:** cannot perform important step.
- **Unknown:** cannot verify; do not score as absent.

Record actual evidence.

# 6. QuiltClarity launch-pass criteria

Launch passes only if:

1. C1–C3 can be completed end-to-end in QuiltClarity without spreadsheet/manual reconciliation outside the tool.
2. Correctness is at least as trustworthy as alternatives on shared functions.
3. Input burden for the target external-project state is materially reasonable.
4. The compound combination remains meaningfully preferable for a real target segment.
5. No newly discovered competitor makes the reason-to-win merely cosmetic.
6. Claims on the website accurately reflect what was observed.

# 7. Automatic launch blockers

Block launch if:

- closest competitor now handles exact multi-remnant stock + joint external cut list + purchase shortfall + consolidated execution comparably, and QuiltClarity has no material adoption advantage;
- QuiltClarity requires more project reconstruction than the best alternative without compensating value;
- outputs still require users to manually reconcile separate piece-group scraps;
- stock fit is based on yardage/area subtraction rather than geometry;
- benchmark reveals correctness issues.

# 8. What does NOT automatically block launch

A competitor having:

- more calculators;
- a quilt designer;
- accounts/cloud;
- a mobile app;
- stash inventory;
- a paid ecosystem.

Those matter only if they make the target job better enough that users have no rational reason to choose QuiltClarity.

# 9. Benchmark report format

```text
COMPETITIVE LAUNCH GATE

Date:
QuiltClarity build/commit:

Competitor versions/URLs checked:

CASE C1 — Mixed requirements
QuiltClarity:
Competitor A:
Competitor B:
Residual work:
Verdict:

CASE C2 — Exact stock + shortfall
...

CASE C3 — Pattern + stock + buy-now
...

CASE C4 — Directional
...

CASE C5 — Long cut list
...

Best realistic alternative for target user:
Why choose QuiltClarity:
Who should choose the alternative instead:

Reason-to-win still present:
- YES / NO / UNCERTAIN

Website claims verified:
- YES / NO

LAUNCH GATE:
- PASS
- BLOCK
```

If `UNCERTAIN`, do not convert uncertainty into a PASS.
