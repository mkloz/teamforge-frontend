---
trigger: model_decision
description: "Use when TeamForge form work connects React Hook Form, Zod schemas, DTO mapping, backend commands, offline guards, TanStack Query mutations, cache updates, navigation, or user-visible root/field errors."
---

# TeamForge Forms: Integration Playbook

Use this for the parts `AGENTS.md` does not spell out: where form values become DTOs, which cache or route changes happen after submit, and how errors/offline behavior reach the UI.

## Start From The Closest Flow

- Auth login: `src/features/auth/hooks/use-login-form.ts` for local command submission, progress, password visibility, telemetry, and root errors.
- Onboarding profile: `src/features/onboarding/hooks/use-profile-basics-form.ts` for RHF plus mutation, cache update, canonical next-route navigation, and flow search state.
- Settings profile: `src/features/settings/hooks/use-settings-profile-form/use-settings-profile-base.ts` for resetting from `currentUser`, mutation `meta`, current-user invalidation, success toast, and local save errors.
- If none fit, search for `zodResolver`, `useOfflineActionGuard`, `getApiErrorMessage`, and `errorToastMessage` near the target feature.

## Implementation Shape

- Put validation in feature `schemas/` and infer the form value type from the schema.
- Put DTO/default/progress mapping in feature `lib/` when it is more than a direct field pass-through.
- Keep backend calls in feature `api/*-commands` or existing API modules; the hook orchestrates form state, mutation, cache, and navigation.
- Use `useForm` with explicit `defaultValues`; when editing existing server data, reset from query data in an effect and be deliberate about whether dirty local edits may be overwritten.
- For submits, clear local errors first, run the offline guard before the mutation, then call `mutateAsync` or the feature command and handle the success route/cache path before showing final UI feedback.
- Prefer local root error state for form-level failures; use `form.setError` only when the backend failure maps to a specific field.
- Use `getApiErrorMessage` or a feature-specific error mapper instead of exposing raw backend text.
- Add mutation `meta.errorToastMessage` and `meta.telemetryName` when global query-client handling should report the failure; avoid duplicate toasts if the form already owns the visible error.

## High-Risk Edges

- Do not replace these flows with React 19 actions or `useActionState` unless the form is isolated local UI with no query mutation, cache update, or route side effect.
- Do not navigate before cache updates that the destination expects.
- Do not hide pending/offline state only in the button; return `isOnline`, `isSaving`, and visible error state from the hook when the component needs them.
- Do not put UI state in `api/` modules or backend payload mapping inside page JSX.

## Handoff Check

- The schema, DTO mapper, command, hook, and component each own one layer.
- Offline, pending, root/field error, and success paths are visible.
- Current-user or feature caches are updated or invalidated intentionally.
- Global mutation toasts and local inline errors do not double-report the same failure.
