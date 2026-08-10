---
trigger: model_decision
description: "Use when adding or changing Findafew API adapters, ky apiClient calls, response parsing, TanStack Query options, query keys, cache updaters, invalidation helpers, mutations, or session-sensitive data flows."
---

# Findafew API Client And Query: Integration Playbook

Use this when the hard part is not "fetch data" but preserving Findafew's request, auth-refresh, parsing, telemetry, and cache contracts.

## Files To Open First

- `src/shared/api/api.ts` for `apiClient`, refresh retry, request context, request IDs, and session clearing.
- `src/shared/api/query-client.ts` for default retry rules, global error toasts, and mutation telemetry metadata.
- `src/shared/api/query-keys.ts`, `query-invalidation.ts`, and `query-cache-updaters.ts` before inventing new cache keys.
- `src/shared/api/current-user-query.ts` for session-gated queries and `ensureQueryData` guard usage.
- The target feature `api/` folder for command, query factory, cache updater, and realtime handler conventions.

## Endpoint Adapter Shape

- Use `apiClient`; only set `context.auth` or `retryOnUnauthorized` when the endpoint is explicitly public, refresh-backed, or must not trigger refresh.
- Parse unknown JSON through the closest Zod schema or feature mapper before returning domain data.
- Use `parseJsonWithRequestId` when the caller or telemetry needs the backend request ID.
- Keep endpoint functions backend-facing. They should not know about React hooks, component state, toasts, or navigation.
- Keep feature-facing projection in `lib/*-contract.ts` or a feature mapper when backend shape and UI shape differ.

## Query Shape

- Put stable keys in `APP_QUERY_KEYS` when they are shared across features, realtime, PWA resume refresh, or invalidation helpers.
- Use feature query factories or `queryOptions` helpers for reusable reads; hooks call `useQuery` with those options rather than rebuilding keys inline.
- Let `query-client.ts` defaults handle stale time, retry, and common error toasts unless the feature has a concrete reason to override.
- For session-sensitive data, gate with `useAuthSessionState` or follow `useCurrentUserQuery`; do not rely on a component being hidden as the only guard.

## Mutation And Cache Decisions

- Prefer targeted `setQueryData` when the new value is authoritative and cheap to apply.
- Prefer shared invalidation helpers when one action affects multiple surfaces, especially groups, invitations, friendships, notifications, and current user.
- Add `mutationKey`, `meta.errorToastMessage`, and `meta.telemetryName` for user actions where query-client global handling should produce telemetry/toasts.
- Avoid broad query resets unless logout/session clearing or a real cross-app invalidation requires it.

## Handoff Check

- No raw `fetch` slipped in.
- Response parsing is explicit and happens before data reaches UI.
- Query keys are shared where realtime/PWA/cache helpers need them.
- Mutation side effects update all surfaces the user can already have open.
