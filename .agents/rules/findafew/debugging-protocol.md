---
trigger: model_decision
description: "Use for Findafew bugs, failing checks, runtime errors, broken builds, environment issues, deployment problems, auth/session failures, realtime or PWA issues, performance regressions, or production-readiness debugging."
---

# Findafew Debugging Protocol

Use this for bugs, failing checks, runtime errors, broken builds, environment issues, deployment problems, auth/session failures, realtime/PWA issues, performance regressions, or "make this production-ready" requests.

This is the repository's authoritative debugging workflow for Findafew's frontend architecture.

## Debugging Rules

- Reproduce or localize before fixing.
- Prefer direct evidence over plausible guesses.
- Follow one hypothesis at a time.
- Fix the root cause, not only the visible symptom.
- Keep fixes scoped to the failing path unless the root cause is shared.
- After a fix, run the smallest relevant verification.
- State remaining unknowns honestly.

## Capture Facts First

Collect the smallest useful evidence set:

- Exact error message, failing command, console output, stack trace, or screenshot.
- Route, viewport, auth state, online/offline state, and environment.
- Expected behavior and actual behavior.
- Recent changed files if available.
- Backend contract or API response shape when data is involved.
- Whether the issue is local dev, preview, production, PWA install, service worker, or browser-specific.

## Findafew Failure Classes

Classify the issue before editing:

- **Route/guard:** `src/app/router/*`, `src/router.tsx`, onboarding guard variants, `returnTo`, canonical search.
- **Auth/session:** `src/shared/api/api.ts`, `auth-session.ts`, `current-user-query.ts`, refresh retry, cached user fallback.
- **API/query:** endpoint adapter, Zod parsing, query keys, invalidation, mutation metadata, request IDs.
- **Form:** RHF defaults/reset, Zod resolver, offline guard, server errors, mutation side effects, navigation order.
- **Realtime:** Socket.IO token sync, namespace/path, handler cleanup, event schema, stale event dedupe, route-local ownership.
- **PWA/runtime:** service worker, push messages, badges, resume refresh cooldown, install prompt, offline banner.
- **UI/render:** layout, accessibility, responsive breakpoints, loading/error/empty states, feature colocation.
- **Env/build:** Vite env values, production base paths, missing keys, generated PWA assets, package scripts.

## Files To Open First

Pick only the relevant lane:

- Routes: `src/app/router/`, `src/router.tsx`, and the feature route lib.
- API/query: `src/shared/api/`, target feature `api/`, and relevant `src/shared/schemas/`.
- Forms: target feature `schemas/`, `hooks/`, `api/`, and closest existing form flow.
- Realtime/PWA: `src/shared/api/realtime-client.ts`, `src/app/runtime/`, `src/shared/schemas/realtime.ts`, web-push schemas/hooks.
- UI: nearby feature components, `docs/visual-style-guide.md`, shared components, route loading/error components.
- Contracts: `docs/open-api.yaml`, `docs/api-data-models.md`, relevant feature contracts.

## Fix Loop

1. State the current hypothesis in plain terms.
2. Identify the evidence that supports it and the evidence that could disprove it.
3. Make the smallest code or docs change that addresses the root cause.
4. Run the smallest relevant check.
5. If the check fails, read the failure before changing direction.
6. Add or recommend regression coverage when the bug touches auth, data, validation, routing, realtime, PWA runtime, or state transitions.

## Verification Matrix

| Change area | Minimum useful check |
| --- | --- |
| Docs/rules only | `npm run check:changed` |
| TypeScript logic | `npm run check:changed`; targeted test when existing |
| Route/guard | `npm run check:changed`; route smoke if a server is already running or UI risk is high |
| API/query/form | `npm run check:changed`; inspect schemas, cache keys, mutation side effects |
| Realtime/PWA | `npm run check:changed`; manual lifecycle/event reasoning; browser smoke when behavior is visible |
| Visual UI | `npm run check:changed`; Browser/Chrome screenshot and interaction check when rendered quality matters |
| Release/PWA surface | relevant release/preflight command only when blast radius justifies it |

## Red Flags

- "Fixed" without reproduction, localization, or verification.
- Broad refactor while debugging a narrow failure.
- Auth/data bug resolved only in the UI.
- API error swallowed or logged without user recovery.
- Query cache invalidation added broadly because the exact affected surfaces were not understood.
- Realtime/PWA listener added without cleanup or cooldown review.
- Production path/cookie/CORS change made without local and production base-path reasoning.

## Handoff Shape

```md
## Root Cause
<evidence-backed explanation>

## Fix
- `path`: change made

## Verification
- Ran: `command` -> result

## Remaining Risk
- ...
```
