---
trigger: model_decision
description: Use to select the narrow TeamForge frontend playbook for API/query, forms, routing, realtime/PWA, UI quality, copy, or debugging work.
---

# TeamForge frontend rules

These rules capture durable project-specific constraints. Keep them concise,
aligned with current code, and free of model-routing or agent-orchestration
instructions.

- `api-client-and-query.md` — API boundary parsing, query keys, mutations,
  invalidation, and optimistic state.
- `forms-rhf-zod-query.md` — React Hook Form, Zod, server errors, offline
  behavior, and navigation.
- `router-and-guards.md` — TanStack Router composition, guards, search state,
  lazy routes, and route errors.
- `realtime-pwa.md` — Socket.IO, service workers, push, offline, badges, and
  resume refresh.
- `ui-quality-gate.md` — TeamForge hierarchy, spacing, responsive behavior,
  states, accessibility, and rendered verification.
- `copy-guardrails.md` — approved product terminology and voice.
- `debugging-protocol.md` — reproduction-first diagnosis across UI, API,
  authentication, realtime, PWA, and builds.

Read only the rules relevant to the active task. If a rule conflicts with the
implementation or generated OpenAPI contract, investigate and update the stale
rule rather than assuming it is correct.
