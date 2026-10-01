# QuiltClarity V1.1 — Analytics & Product Validation Plan

**Status:** Measurement contract  
**Date:** 2026-08-17  
**Guides/help revision:** 2026-08-21

# 1. Purpose

Analytics answers:

- can people complete tools;
- do they reach the distinctive project workflow;
- where does input friction occur;
- do results lead to print/copy/use;
- which search surfaces attract useful users;
- do users return.

Analytics does not prove correctness; tests do that.

# 2. Privacy rule

Never send:

- project/fabric names;
- notes;
- pasted rows;
- piece labels;
- exact free-text pattern content.

Use:

- counts;
- booleans;
- categorical modes;
- coarse buckets.

Analytics failure must never block a calculation.

# 3. Core event taxonomy

## Planner

- `planner_started`
- `fabric_added`
- `fabric_removed`
- `stock_piece_added`
- `stock_piece_removed`
- `cut_requirement_added`
- `cut_requirement_removed`
- `cutlist_paste_opened`
- `cutlist_paste_previewed`
- `cutlist_paste_completed`
- `cutlist_paste_failed`
- `pattern_yardage_added`
- `plan_calculation_started`
- `plan_calculation_completed`
- `plan_calculation_failed`
- `on_hand_sufficient`
- `purchase_shortfall_generated`
- `stock_allocation_viewed`
- `yardage_comparison_viewed`
- `cutting_plan_viewed`
- `print_result`
- `copy_shopping_list`

## Calculators

- `calculator_started`
- `calculator_completed`
- `calculator_error`
- `calculator_result_printed`
- `calculator_to_project` only where a meaningful bridge exists.

# 4. Safe properties

Examples:

- tool name;
- unit system;
- number of fabrics bucket: 1 / 2–3 / 4+;
- requirement-row bucket: 1–5 / 6–15 / 16–30 / 31+;
- has stock: bool;
- stock-piece bucket;
- has pattern comparison: bool;
- directional used: bool;
- purchase needed: bool;
- completion status;
- error category;
- paste rows bucket.

Do not send exact dimensions unless there is a clear privacy/measurement need; generally unnecessary.

# 5. Activation metrics

## Project activation

`plan_calculation_completed / planner_started`

Secondary:

- completion among users with 6+ cut rows;
- completion among users using stock;
- completion among paste users.

## Distinctive-workflow use

Share of completed plans with:

- stock;
- pattern comparison;
- purchase shortfall.

This shows whether the reason-to-win is actually used.

# 6. Friction metrics

Track stage drop-off:

- started;
- fabric configured;
- first requirement;
- 5+ requirements;
- stock added;
- calculate attempted;
- complete.

Paste:

- preview → completed;
- failure categories.

Do not infer causality merely from event drop-off; use it to identify pages for usability inspection.

# 7. Value signals

Strong:

- print result;
- copy shopping list;
- stock allocation viewed;
- cutting plan viewed;
- repeat planner use.

Medium:

- yardage comparison viewed;
- second calculator in same session.

Weak:

- pageviews alone.

# 8. Repeat use

Use a local anonymous first-used timestamp/flag or analytics-native non-identifying returning-user mechanism.

Do not create an account solely to measure retention.

Measure:

- returning tool users;
- returning planner users;
- number of planner sessions per anonymous browser over coarse periods where privacy-safe.

# 9. Search measurement

Google Search Console:

- clicks/impressions by page;
- query clusters;
- CTR;
- average position only as context;
- new query families;
- calculator vs guide landing pages.

Important question:
Which acquisition pages produce engaged calculator/planner users?

Do not chase impressions that never produce useful interactions.

# 10. Pre-launch usability gate

Because the product asks users to transcribe/compile real cut lists, spreadsheet-like usability must be validated before launch.

For this owner-operated project, use one exhaustive guided operator run by the
product owner. Give the owner a representative project task without step-by-step
facilitation. The owner must complete the core plan and correctly identify:

- what fabric is covered by stock;
- what to buy;
- where to find the cutting plan.

Record `PASS`, `FAIL`, or `ASSISTED`. Any procedural or conceptual hint makes
the run `ASSISTED`; fix the product and rerun from a clean state before PASS.
This is an owner acceptance gate, not independent novice or target-user
evidence. Do not describe it as a recruited-quilter study.

Also observe:

- confusion between finished/cut sizes;
- stock-dimension entry;
- pattern-vs-buy-now comparison;
- paste/table friction;
- trust in assumptions.

Blocking issue:
If users repeatedly cannot understand whether “pattern says,” “fresh plan,” and “buy now” are different concepts, UX must be fixed before launch.

# 11. Correctness gate

Independent of analytics:

- all G01–G45;
- all property tests;
- full application test/build/typecheck/lint;
- cross-browser smoke;
- print;
- accessibility;
- storage migration.

# 12. Product reason-to-win gate

See `06_COMPETITIVE_BENCHMARK_GATE.md`.

This gate is mandatory immediately before launch, because competitors can change during implementation.

# 13. Post-launch interpretation

Do not declare product failure from low early traffic alone; acquisition takes time.

Do distinguish:

- low impressions → SEO/distribution problem;
- impressions but low clicks → search proposition/snippet problem;
- clicks but low tool start → landing-page/tool relevance;
- starts but low completion → UX/input problem;
- completion but low action/repeat → weak delivered value or one-off task.

# 14. Expansion evidence

Any new substantial feature should point to evidence such as:

- recurring Search Console query class;
- repeated calculator usage path;
- user-session drop-off caused by a missing adjacent step;
- usability feedback;
- repeated support/user request;
- competitor/market change.

Do not expand because a feature is easy to code.

# 15. Guides and contextual-help validation

The Guides overhaul adds a product-learning question:

> Can a first-time user teach themselves QuiltClarity and recover from confusion without external support?

## 15.1 Events

Keep instrumentation coarse; do not log every tooltip hover.

Useful events:

- `guide_started`
- `guide_next_clicked`
- `guide_to_tool_clicked`
- `context_help_opened`
- `context_help_learn_more`
- `quick_start_completed`

Safe properties:

- guide slug/category;
- help key (controlled enum, never free text);
- tool name;
- device class if analytics already supplies it.

Do not capture:

- project data;
- field values;
- labels;
- guide search free text unless separately privacy-reviewed.

## 15.2 Learning activation

Measure:

- Getting Started → planner start;
- planner tutorial → planner start;
- guide → tool completion where available;
- contextual help → successful recalculation only as exploratory correlation.

Do not treat high tooltip usage as automatically bad; it may mean help is discoverable.

## 15.3 Owner-operated usability gate extension

The owner acceptance gate must include one **from-zero learning task**:

Give the owner the site with no verbal product tutorial and ask them to use the
Guides area to learn enough to complete a representative planner job.

Observe whether the owner can:

- find the correct starting guide;
- understand the flow;
- identify usable WOF / cut-vs-finished / fabric-on-hand;
- distinguish Pattern says / Fresh-fabric plan / Buy now;
- locate the cutting plan;
- recover from a question using contextual help.

This remains an owner-performed usability test and must not be marked passed
solely by Codex/browser automation. Preserve the limitation that it is not
independent novice or external target-quilter evidence.
