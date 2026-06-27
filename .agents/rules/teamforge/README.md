---
trigger: model_decision
description: "Use when selecting the right TeamForge rule, onboarding an agent to the TeamForge rule set, resolving rule conflicts, or deciding where durable TeamForge guidance should live."
---

# TeamForge Rule Set

This directory is the source of truth for TeamForge-specific agent guidance. Keep durable product, architecture, workflow, and review rules here. The old `teamforge-*` skills were folded into these playbooks; do not recreate duplicate skill bodies unless a future tool requires that shape.

## Playbooks

- `agent-driven-pipeline.md` - multi-agent routing, model selection, MCP choice, and verification strategy.
- `agent-failure-diagnostics.md` - post-failure analysis for context drift, tool confusion, instruction drift, and repeated bad loops.
- `api-client-and-query.md` - `apiClient`, TanStack Query, query keys, mutations, parsing, and cache updates.
- `debugging-protocol.md` - TeamForge reproduction-first debugging across routes, auth, API/query, forms, realtime, PWA, UI, env, and build issues.
- `evidence-review.md` - claim extraction, source checking, and adversarial verification for high-risk factual claims.
- `forms-rhf-zod-query.md` - React Hook Form, Zod, mutations, offline guards, errors, and navigation.
- `quality-intelligence.md` - Fallow/React Doctor interpretation, code-health triage, and quality sweep boundaries.
- `router-and-guards.md` - TanStack Router route modules, guards, canonical search, lazy routes, and route errors.
- `ui-quality-gate.md` - TeamForge visual, accessibility, responsive, state, and rendered-verification gate.
- `realtime-pwa.md` - frontend realtime, service worker, push, badges, resume refresh, and offline runtime.
- `copy-guardrails.md` - TeamForge user-facing voice, naming, product language, and copy exceptions.
- `backend-contracts-openapi.md` - backend REST contract, OpenAPI, schemas, DTOs, error envelopes, and cache/realtime impacts.
- `backend-auth-security.md` - authentication, sessions, authorization, privacy boundaries, and account safety.
- `backend-domain-data.md` - domain invariants, persistent models, migrations, transactions, groups, plans, chats, invites, ratings, and trust.
- `backend-realtime-notifications.md` - backend Socket.IO events, rooms, notifications, push delivery, and event idempotency.
- `backend-production-runtime.md` - production paths, cookies, CORS, health, uploads, rate limits, request IDs, and observability.
- `model-routing-notes.md` - local model routing observations and safe billing/smoke-test notes.
- `skill-adaptation-roadmap.md` - which remaining generic skills are worth emphasizing, rewriting, or leaving as opt-in helpers.

## Usage Rules

- Rules trigger by model decision from their `description` metadata. Do not add slash-command requirements or keyword gates.
- Read the narrowest playbook that matches the work before editing related code.
- When playbooks conflict with generic bundled skills, follow `AGENTS.md` and this TeamForge rule set.
- When playbooks conflict with actual code or generated contracts, inspect the code/contract and update the stale guidance rather than guessing.
- Update these rule files when TeamForge-specific guidance changes.
- Do not store secrets, private env values, tokens, billing details, or user-specific credentials in this directory.
