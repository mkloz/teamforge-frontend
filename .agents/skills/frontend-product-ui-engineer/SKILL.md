---
name: frontend-product-ui-engineer
description: Use automatically for React, Next.js, Vite, Tailwind, ShadCN, component architecture, forms, React Hook Form, Zod, client/server state, Zustand, React Query, routing, dashboards, calendars, event apps, UI polish, accessibility, loading/error/empty states, responsive layouts, and frontend integration with APIs. Especially relevant when turning rough UI ideas into production-ready product interfaces.
---

# Frontend Product UI Engineer

## Mission

Build frontend features that are usable, maintainable, accessible, and consistent with the existing design system. This skill balances engineering structure with product polish.

## Activation conditions

Use this skill when the task involves:

- React/Next/Vite components.
- UI layouts, pages, dashboards, calendars, forms, modals, tables, cards, search, filters, or navigation.
- Tailwind or ShadCN component work.
- React Query, Zustand, Context, URL state, or local component state.
- Form validation with React Hook Form, Zod, server errors, or multi-step forms.
- Loading, error, empty, disabled, optimistic, or skeleton states.
- Responsive design or accessibility.
- Connecting frontend to backend APIs.

Do not use it for backend-only work unless frontend contract/state implications matter.

## Product-first rules

1. Start from the user's action, not from components.
2. Every async UI needs loading, error, empty, and success behaviour.
3. Every form needs validation, disabled/loading submission state, and server-error display.
4. State should live in the smallest place that can own it correctly.
5. URL state is best for shareable filters/search/pagination.
6. Server state belongs in a server-state tool such as React Query when available.
7. Global stores are for cross-page app state, not every input.
8. Use existing design primitives before creating new ones.
9. Accessibility is not optional polish; it is part of correctness.
10. Do not add visual noise that does not serve hierarchy or usability.

## Frontend workflow

### 1. Understand the screen/flow

Define:

- Primary user goal.
- Secondary actions.
- Data needed before render.
- Mutations/actions user can perform.
- Error and empty states.
- Mobile and desktop layout needs.
- Permission/role-based UI behaviour.

### 2. Locate existing design language

Inspect nearby examples:

- Page layout structure.
- Card/list/table patterns.
- Button variants.
- Modal/drawer patterns.
- Form fields and validation patterns.
- Toast/notification usage.
- Spacing, border radius, typography, icon style.

Match the project. Do not introduce a new mini-design-system unless asked.

### 3. Component architecture

Prefer this split:

- Page/container: routing, data fetching, permissions, composition.
- Feature component: business UI for one feature.
- Presentational component: reusable visual block.
- Form component: validation/submission/error mapping.
- Hook: complex state/data behaviour shared across components.
- Utility: pure formatting or transformation.

Avoid:

- One giant component with data fetching, form state, mutation logic, and presentation mixed together.
- Over-splitting every `<div>` into components.
- Duplicating API shape transformations inside multiple components.

### 4. State ownership decision

Use this decision table:

| State type | Preferred home |
|---|---|
| Input value used only in one component | Local state or form library |
| Form validation/submission | React Hook Form + schema if project uses it |
| API data/cache | React Query/server-state layer if available |
| Filters/search/page in URL | URL search params |
| UI toggle/modal local to a screen | Local state |
| Cross-page user preference | Store/local storage if already used |
| Authenticated user/session | Existing auth/session layer |
| Derived values | Compute from source state, do not duplicate |

### 5. API integration

Before connecting UI:

- Confirm endpoint path and method.
- Confirm request/response shape.
- Confirm auth behaviour.
- Confirm validation and error format.
- Confirm pagination/filter conventions.

Handle:

- Loading state.
- Empty state.
- Error state.
- Retry if appropriate.
- Mutation disabled state.
- Optimistic updates only when rollback is clear.
- Cache invalidation after mutation.

### 6. Form quality checklist

For every form:

- Client schema matches backend validation as closely as practical.
- Required fields are visually clear.
- Field-level errors are close to fields.
- Server errors are mapped into field/global errors.
- Submit button disables during submission.
- Double-submit is prevented.
- Success state is clear.
- Dangerous actions require confirmation.
- Keyboard submit/focus order works.

### 7. Accessibility checklist

Minimum checks:

- Interactive elements are real buttons/links unless there is a strong reason.
- Inputs have labels or accessible names.
- Focus states are visible.
- Keyboard navigation works for menus, modals, and forms.
- Dialogs trap focus and restore focus when closed if the UI library does not handle it.
- Icons without text have accessible labels or are hidden from screen readers.
- Colour is not the only way to communicate status.
- Text contrast is reasonable.
- Error messages are programmatically associated when project patterns support it.

### 8. Visual polish checklist

Review:

- Clear hierarchy: title, primary action, secondary actions.
- Consistent spacing scale.
- Consistent alignment and width constraints.
- Mobile layout before assuming desktop only.
- Long text truncation/wrapping.
- Empty state helps the user take next action.
- Loading state does not cause layout jumps when avoidable.
- Table/card actions remain usable on small screens.

## Output contract

When implementing/reviewing frontend work:

```md
## UI behaviour
- Primary flow:
- States handled:
- Responsive behaviour:

## Components changed
- `path`: purpose

## State/data decisions
- Local state:
- Server state:
- URL/global state:

## Accessibility checks
- ...

## Verification
- Typecheck/lint/build/tests/manual states reviewed:
```

## Red flags

Call these out immediately:

- API errors are ignored or only logged.
- Loading state blocks the whole page unnecessarily.
- Empty state looks like a broken page.
- Client-only authorization is treated as security.
- Form can be submitted multiple times.
- Server state is copied into global store without need.
- Components fetch data at many levels with no cache strategy.
- UI introduces inconsistent spacing/components unrelated to existing design.
- Accessibility is broken by clickable divs, missing labels, or focus traps.
