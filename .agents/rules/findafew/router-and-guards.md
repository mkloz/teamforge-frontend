---
trigger: model_decision
description: "Use when adding or changing Findafew TanStack Router routes, beforeLoad guards, auth/onboarding redirects, lazy route modules, preload strategy, canonical URL/search validation, route errors, or nuqs-backed route state."
---

# Findafew Router And Guards: Integration Playbook

Route work in this repo is mostly coupling work: route tree placement, lazy module preload, canonical search, auth/onboarding redirects, and route-level error recovery.

## Files To Open First

- `src/app/router/app-routes.tsx`, `public-routes.tsx`, or `onboarding-routes.tsx` depending on route ownership.
- `src/app/router/route-guards.impl.ts` for auth restore, offline fallback, canonical redirect, and return-to sanitization.
- `src/app/router/lazy-route-module.ts`, `lazy-page-route.tsx`, and `lazy-route-loading.tsx` for the Suspense/preload pattern.
- `src/router.tsx` only to confirm assembly; most route edits belong in the route modules.

## Add Or Change A Route

- Classify it first: public full-page, onboarding guarded/no-shell, or authenticated app-shell child.
- Create a `createLazyRouteModule` entry and add it to the matching `*RouteModules` export so shared preloading still sees it.
- Use a loader that preloads the route module; add data or image preloads only when nearby routes already do that for perceived performance.
- Use `createLazyPageRoute(module.Component, <RouteLoading />)` and a route-specific loading component when the feature has one.
- Add an `errorComponent` with a route telemetry scope and a recovery destination that keeps users inside the right product area.
- Add the route to the matching `*Routes` export; do not introduce file-based routing.

## Search And Canonical URL State

- Put route search parsing/builders in `src/features/<feature>/lib/<feature>-route.ts`.
- Validate route search with small parser helpers that coerce strings safely and drop invalid values instead of throwing.
- If the route can be used as `returnTo`, mirror its search canonicalization in `route-guards.impl.ts`; otherwise auth redirects may preserve stale or unsafe query params.
- Use `nuqs` for shareable UI state inside the feature, but keep the route-level contract in the feature route lib.

## Guard Safety

- App pages inherit `requireCanonicalAppRoute` from `appShellRoute`; do not add per-page auth checks.
- Onboarding routes intentionally use canonical/editable guard variants; preserve the edit-mode exception for personality/interests.
- Keep offline fallback behavior: restore session, use cached current user if network fails, otherwise redirect to login with a sanitized return path.
- Opportunistic preloads may catch and ignore errors; real route loaders should let errors reach the route error boundary.

## Handoff Check

- Route lives in exactly one route module and one exported route array.
- Lazy module, loading UI, route error, and optional preload are wired consistently.
- Search validation and guard canonicalization agree.
- Return-to behavior still strips invalid search and preserves global app flags such as `notifications`.
