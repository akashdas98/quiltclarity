# Milestone 7 Vanilla UI Decision

## Status

Accepted for V1 on 2026-08-06.

## Decision

Use static Astro page shells plus vanilla TypeScript controllers for both the Fabric Cutting Planner and the seven standalone calculators. Do not install React for the current V1 interaction model.

The planner uses one delegated controller for its coupled form state. It translates display units to canonical millimetres, calls the existing project planner, persistence adapter, and diagram projector, and renders their returned contracts. It does not own quilting formulas, normalization, optimization, purchase rounding, or diagram geometry.

## Rationale

The completed domain, persistence, and presentation contracts make planner UI state mostly ordered form editing and result projection. Event delegation keeps multi-fabric and multi-piece interactions focused without adding a framework runtime or hydration integration. Simple calculators share one small controller and remain statically useful before JavaScript runs.

## Consequences

- React and an Astro React integration are not dependencies.
- The site remains static-hosting compatible and non-interactive content remains unhydrated.
- The single React planner-island allowance remains available only if later measured complexity materially exceeds the current controller; adopting it requires updating this decision and recording divergence.
- UI tests check static route, semantic form, action, and framework-boundary contracts; domain and presentation tests remain the authority for calculation and diagram behavior.
