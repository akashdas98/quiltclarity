# V1 Static Architecture Decision

## Decision

V1 is an Astro static-first site with a framework-independent TypeScript domain engine, vanilla client TypeScript for simple calculators where practical, and no more than one React island for the complex planner when justified. Core calculations run client-side and versioned `localStorage` is the only project persistence. A separate allow-listed `quilter:theme` value may persist the local light/dark interface preference; it contains no project data and creates no new state service.

V1 has no application backend, database, authentication, server persistence, AI endpoint, or runtime server calculation dependency.

Owner amendment (2026-10-02): a narrowly scoped optional Cloudflare analytics
ingestion endpoint and provider telemetry storage are permitted under
[the analytics-only exception](../decisions/cloudflare-analytics-engine.md).
Core calculations and project persistence remain static/browser-only.

## Rationale

This architecture serves the product's core planner and calculator workflow with crawlable content, low operational cost, minimal JavaScript, local privacy, and static-hosting compatibility. A narrowly scoped planner island preserves maintainability without turning content and simple calculators into a full SPA.

## Consequences

- Domain modules cannot depend on Astro, React, the DOM, storage, or analytics.
- Static pages must remain useful before hydration.
- The shared Astro shell may initialize a small local presentation preference before paint; unavailable storage must not hide content or block navigation.
- Diagrams and explanations derive from domain outputs rather than independent UI logic.
- Features that require accounts, cloud synchronization, or runtime application-server state require an explicit product-spec revision and divergence decision.
