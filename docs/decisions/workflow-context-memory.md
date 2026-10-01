# Workflow ownership

## Decision

Root `AGENTS.md` owns the operating rule. CONTEXT holds compact restart state;
routed project documents own requirements and detailed evidence. They do not
create parallel execution or checkpoint procedures.

## Rationale

The 2026-09-10 revision removes overlapping process obligations. Effort follows
useful uncertainty and applicable acceptance requirements, with freedom to do
difficult work. Adaptive cheaper-worker model selection and delegation are
explicitly authorized when complexity, uncertainty, consequences, and total
handoff/review cost justify them. Model capability and reasoning effort are
independent decisions at the initial route and every reassessment: model demand
describes the required capability profile and ceiling, while effort demand
describes inference depth, branching, search, and verification. Work class is
descriptive rather than an allocation ladder. Changed model and effort axes each
require their own evidence, including downgrades. Startup reads only the
current-status and routing sections, then retrieves relevant gaps,
approvals/issues, requirements,
and evidence on demand. Focused reads, context handoffs, and verification avoid
duplicated work. Actual savings must be judged through ordinary work, not another
audit.

## Consequences

V1.1 authority, deterministic domain/golden contracts, owner-only MT-U01/MT-U02 and milestone/print/release acceptance remain binding.

Memory checkers remain structural tools. They do not establish runtime behavior,
user acceptance or quota savings. Application/engine runs serve affected product
verification, not instruction editing.

## Adaptive routing guard

Implemented locally on 2026-09-11 at the user's request. Source, route contract,
checks, capability-install eligibility and limitations are in
`scripts/agent-routing/README.md`; runtime discovery is
`scripts/agent-runtime/inspect.mjs`. Project `.codex/hooks.json` registers
startup/resume, prompt and worker-allocation hooks. Hook trust is a separate
runtime state: installation alone does not establish activation. Check it in each
active Codex home with the inspector or `/hooks`.

Protected parent/descendant/spending governance remains incomplete: the stock
runtime has alternative launch paths, hook disablement and handler failures.
The opt-in launcher validates declared parent decisions, not every app launch.
A protected request gateway/controlled runtime with credentials and egress outside
agent control is required for full enforcement. No spending cap was supplied.
Capability eligibility does not grant account consent or prove source provenance;
actual installation must use reviewed sources and normal runtime permissions.
Quota savings and total-task quality remain unmeasured. Product gates and approvals
are unchanged.

The 2026-09-22 update adopts routing schema v2, explicit initial/reassessment
transitions, Terra support, inventory-derived capability resolution with protected
root and exact hash/allowlist checks, post-install discovery verification, and an
advisory lifecycle evaluator. The lifecycle evaluator permits a `/clear`
recommendation only from declared fresh checkpoint state with completed work, no
unresolved items or active operations, and an explicit clear-candidate judgment.
It cannot discover unrecorded work or invoke `/clear`; only the user does that.
Capability discovery verification proves only an exact enabled path/hash match,
not that instructions were loaded or followed. These additions remain local,
agent-editable guardrails and do not close the protected-runtime limitations above.
