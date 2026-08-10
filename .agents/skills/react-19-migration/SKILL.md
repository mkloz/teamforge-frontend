---
name: react-19
description: React 19.2 guidance for existing React web apps. Use when the task explicitly involves React 19 APIs such as useEffectEvent, useDeferredValue, async startTransition, ref-as-prop, Activity, or React Compiler-aware patterns. In Findafew, do not treat use(), Suspense data fetching, or useActionState as defaults for TanStack Query or React Hook Form flows; prefer repo patterns first.
metadata:
  version: "19.2.0"
---

# React 19 for Findafew

Use this skill only when the task explicitly involves a React 19 API or when another Findafew skill points here.

## Findafew-first rules

- Inspect the repo and use the available tools in this environment. Ignore any older instructions that depend on unavailable agent orchestration or external helper tools.
- Prefer established repo patterns first:
  - TanStack Query for server data and cache ownership
  - React Hook Form plus Zod for forms
  - Zustand for feature UI state
  - TanStack Router plus `nuqs` for route-linked state
- Do not replace working query or mutation flows with `use()` or `useActionState`.
- Do not introduce React 19 features just because they exist. Use them only when they simplify the current code.

## Reach for these APIs first

- `useEffectEvent` for fresh callbacks inside long-lived effects, subscriptions, timers, or socket listeners
- async `startTransition` or `useDeferredValue` when a UI interaction needs to stay responsive under load
- `ref` as a prop when updating component APIs that previously needed `forwardRef`
- `Activity` only for deliberate state-preserving regions such as tabs or drawers where preserving mounted state matters
- React Compiler-aware code: avoid adding `useMemo` or `useCallback` unless there is a real dependency boundary, external subscription, or measured performance reason

## Do not use these as Findafew defaults

- `use()` or Suspense data fetching for normal API work already handled by TanStack Query
- `useActionState` for Findafew RHF plus mutation flows
- blanket rewrites from `useEffect` to newer APIs without a concrete benefit
- unavailable tool workflows or mandatory sub-agent steps

## Good repo entry points

- `src/features/auth/hooks/use-login-form.ts`
- `src/shared/api/current-user-query.ts`
- `src/app/runtime/`
- `src/app/router/`

## References

- `references/new-hooks.md`
- `references/react-compiler.md`
- `references/ref-as-prop.md`
- `references/activity-component.md`
- `references/hooks-improved.md`
