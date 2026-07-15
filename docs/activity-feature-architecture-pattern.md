# Activity Feature Architecture Pattern

This document captures the Activity refactor pattern that should be used when
refactoring other large TeamForge frontend features. The goal is senior-level
locality: each module should have one clear reason to change, while callers use
small stable interfaces.

## Current Activity Verdict

Activity is a useful reference for API and hook architecture. Complete the
remaining component cleanup before using the pattern unchanged elsewhere.

Architecture health:

| Area | Status | Notes |
| --- | --- | --- |
| API transport | Good | `activity.api.ts` is transport-only and validates responses/payloads with Zod. |
| Query options | Good | `activity-query-options.ts` owns TanStack Query options and key selection. |
| Actions | Good | `activity-actions.ts` is a facade; message workflows live in `activity-message-actions.ts`; outgoing message payload/resource handling lives in `activity-outgoing-message.ts`. |
| Cache writes | Good | `api/cache/*` owns focused TanStack Query cache updates. |
| Projections | Good | `api/projections/*` owns DTO-to-UI mapping by domain. |
| Realtime | Good | `activity-realtime.ts` applies events through cache/action adapters. |
| Hooks | Good | `use-activity-selection.ts` delegates selected conversation and timeline concerns to focused hooks. |
| Store | Acceptable | `activity.store.ts` is UI state only, but still a single flat Zustand store. Split only if it grows further. |
| Components | Needs one more pass | A few components still own `useMutation` setup for proposals/group identity. Move those into focused hooks before copying the pattern fully. |
| Lib | Acceptable | Pure helpers are mostly clean; `activity-identities.ts` reads query cache and should be treated as an adapter, not a pure helper. |

## Repeatable Feature Layout

Use this folder shape for large data-driven features:

```text
src/features/<feature>/
├── <feature>-page.tsx
├── api/
│   ├── <feature>.api.ts
│   ├── <feature>.queries.ts
│   ├── <feature>-query-options.ts
│   ├── <feature>-query-data.ts
│   ├── <feature>-actions.ts
│   ├── <feature>-action-context.ts
│   ├── <feature>-context.ts
│   ├── <feature>-realtime.ts
│   ├── cache/
│   │   └── <domain>-cache.ts
│   └── projections/
│       └── <domain>-projections.ts
├── hooks/
│   ├── use-<feature>.ts
│   ├── use-<feature>-<domain>.ts
│   └── use-<feature>-<action>.ts
├── components/
│   └── <domain>/
├── schemas/
├── store/
├── lib/
└── types/
```

Small features do not need every folder. Add a module only when it buys
locality or keeps a public interface small.

## Module Rules

### `api/<feature>.api.ts`

Owns HTTP transport only.

- Use `apiClient`, never direct `fetch`.
- Validate backend responses with shared or feature Zod schemas.
- Validate mutation payloads at the API boundary.
- Do not update TanStack Query cache here.
- Do not map API DTOs into UI models here.

### `api/<feature>-query-options.ts`

Owns TanStack Query option factories.

- Use `queryOptions` / `infiniteQueryOptions`.
- Use shared `APP_QUERY_KEYS` factories.
- Include every query dependency in the query key.
- Keep `queryFn` focused on fetching and immediate projection.
- Do not put UI state or toast behavior here.

### `api/<feature>.queries.ts`

Acts as the stable public API facade for hooks.

- Keep this as delegation only.
- Expose query options, derived data helpers, and action methods.
- Do not let it grow implementation logic.
- Components should prefer hooks over calling this directly.

### `api/<feature>-actions.ts`

Owns feature mutation workflows.

- Coordinate transport, cache invalidation, optimistic updates, and returned results.
- Split by domain once a file becomes broad, for example message actions, group actions, proposal actions.
- Keep reusable action context types in `<feature>-action-context.ts`.
- Do not call React hooks here.

### `api/cache/*`

Owns TanStack Query cache writes.

- One file per cache surface or domain.
- Encapsulate `setQueryData`, `setQueriesData`, and merge/version rules.
- Keep cache functions deterministic and explicit about query keys.
- Avoid importing components or hooks.

### `api/projections/*`

Owns DTO-to-UI mapping.

- One file per domain: participant, message, group, direct chat, feed.
- Keep normalization rules here, not in components.
- Projection functions should be mostly pure.
- If a projection needs query cache, it is not pure and should live in an adapter module.

### `api/<feature>-context.ts`

Owns composition of adapters for actions, queries, and realtime.

- Build stable module-level context objects.
- Do not recreate contexts per call.
- Keep this file as assembly, not business logic.
- If it becomes too large, split context builders by surface.

### `hooks/`

Hooks are the feature-facing interface for pages/components.

- Page hooks compose smaller hooks and return view-ready state/actions.
- Server-state hooks call `FeatureQueryFactory`, not `FeatureApi`.
- Mutation hooks call `FeatureCommands`, not `FeatureApi`.
- Mutation hooks own toasts, telemetry, and local pending state.
- Components should not define `useMutation` unless the mutation is truly local and tiny.

### `store/`

Zustand stores own client UI state only.

- No server data mirrors.
- No localStorage/sessionStorage persistence.
- Keep actions explicit and named by user intent.
- Use selectors at call sites to avoid broad subscriptions.
- Split into slices only when state has separate change reasons.

### `components/`

Components should render.

- Prefer props and feature hooks over direct API calls.
- Avoid `FeatureQueryFactory`/`FeatureCommands` inside component bodies.
- Avoid `useMutation` in components for domain workflows.
- Co-locate tiny presentational subcomponents under the component domain folder.

### `lib/`

Pure helpers only.

- Formatting, grouping, local calculations, copy helpers.
- No query cache writes.
- No API calls.
- No Zustand access.

## Import Direction

Allowed:

```text
page -> hooks -> api public interfaces -> api internals -> shared
page -> components
components -> hooks
components -> lib/types/schemas
api internals -> shared schemas/api/query keys
```

Avoid:

```text
components -> api transport
components -> api internals
hooks -> api transport
api -> components
shared -> features, except top-level app providers that wire global realtime
feature A -> feature B internals
lib -> query client
```

## Activity Current Notes

Activity is now suitable as the feature architecture template.

- Components do not import Activity API public interfaces directly.
- Query, command, and realtime public interfaces are split:
  - `api/activity-queries.ts`
  - `api/query-factory/*`
  - `api/activity-commands.ts`
  - `api/activity-realtime-handlers.ts`
- Message query keys are stable by `chatId`; participant-aware mapping happens
  in hooks rather than fragmenting the cache.
- Treat `lib/activity-identities.ts` as an adapter because it reads query cache.
  Do not copy that into pure `lib/` modules in other features.

## Refactor Sequence For The Next Feature

Use this order for each large feature:

1. Audit imports and responsibilities.
2. Create shared query keys if missing.
3. Make transport module Zod-validated and transport-only.
4. Extract query options behind a `FeatureQueryFactory`.
5. Extract actions and invalidation/cache update logic behind
   `FeatureCommands`.
6. Extract realtime cache handlers behind `FeatureRealtimeHandlers` when the
   feature receives socket events.
6. Extract projections.
7. Extract cache writers.
8. Refactor hooks so components call hooks, not transport/facade methods.
9. Refactor oversized components by change reason.
10. Run `npm run check:changed` while iterating, then `npm run lint` and
    `npm run build` before committing.

## Done Criteria

A feature is production-level architecturally when:

- No component imports feature API transport.
- Hooks do not call API transport directly.
- Query keys are centralized and dependency-complete.
- Server state is in TanStack Query, UI state is in Zustand/local React state.
- Components do not own domain mutation workflows.
- API facade files are thin adapters.
- Projection, cache, action, and transport responsibilities are separate.
- The build and lint gates pass.
