# Verification: 2026-09-11

Installed identically in three local projects: a portfolio, Quilter, and a Unity project.
Existing product changes and approval gates were preserved.

- Node 24.18.0: all 10 evaluator/CLI/launcher tests passed. Covered malformed
  input, routine expensive-route denial, escalation evidence, stronger initial
  allocation, nested input, history limits, resume context, audit failure/privacy,
  capability eligibility/consent/fallback, and checked parent launch arguments.
- Codex 0.154.0 app-server `hooks/list` and `skills/list` succeeded for all three
  repositories under both the primary and secondary local Codex homes.
  Each repository exposes the three expected hooks with no hook parse errors.
  All nine definitions are **untrusted** in each home; normal runtime execution
  is therefore inactive until the user reviews/trusts them using `/hooks`.
- All three project memory checkers passed. No application build or Unity run
  was needed for these tooling-only changes.

Handler tests are not live model-call interception evidence. Actual nested-agent
execution, resume behavior with trusted hooks, and activation after configuration
changes remain unverified. Disabled/untrusted hooks, missing Node/handler modules,
direct CLI/app/provider launches, and parent selection bypass this guard. No
protected fail-closed boundary, spending enforcement, or total-usage aggregator
has been implemented. Agent-supplied evidence is validated structurally, not
independently authenticated. Full governance needs a controlled runtime/request
gateway with credentials and egress outside agent control.

Capability selection/use remains agent-driven. Existing skills were discovered;
the eligibility evaluator was tested, but it is not an automatic remote installer.
No missing capability justified installing a third-party plugin in this task.
End-to-end discovery/install/activation and measured task efficiency remain open.

Official runtime boundary and trust contract:
https://learn.chatgpt.com/docs/hooks

Local raw inventory snapshots are retained in Portfolio's
`.tmp-contour-audit/routing-inventory-primary.json` and
`.tmp-contour-audit/routing-inventory-secondary.json` (not commit artifacts).

## Quilter synchronization follow-up: 2026-09-22

- Quilter's shared routing/runtime implementation, tests, lifecycle tooling and
  installer were synchronized with the Portfolio implementation. Quilter's
  existing `.codex/hooks.json` was not rewritten.
- The combined routing, capability and lifecycle suite passes 23/23 tests in
  Quilter. Installer and synchronized modules also pass Node syntax checks.
- Routing schema version 2 independently validates model capability demand and
  reasoning-work demand, supports Luna, Sol, Terra and Astra, and derives
  initial, model-only, effort-only, both, or neither allocation transitions.
- Runtime capability resolution now uses canonical paths and instruction hashes,
  enforces protected roots/allowlists and consent boundaries, and can verify
  post-install discovery without claiming that instructions were loaded.
- Lifecycle evaluation checks declared checkpoint freshness, completion,
  unresolved work and active operations before `/clear` can be recommended. It
  remains advisory and cannot observe undeclared work or invoke `/clear`.
- After synchronization, the owner inspected the runtime hook view and confirmed
  that all installed hooks are active. This establishes current activation by
  owner observation; it does not remove the documented bypass and protected-
  governance limitations, and activation must be rechecked after relevant runtime
  or configuration changes.
