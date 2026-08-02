---
name: frontend-product-ui-engineer
description: Implement, redesign, or polish TeamForge React product UI using the existing feature architecture and design language. Use for pages, forms, grouped menus, drawers, modals, responsive layouts, states, API integration, or visual fixes where production-ready behavior and rendered quality both matter.
---

# Frontend Product UI Engineer

## Mission

Build frontend features that are usable, maintainable, accessible, and consistent with the existing design system. This skill balances engineering structure with product polish.

Read `AGENTS.md`, `docs/visual-style-guide.md`, and the narrow TeamForge rule for the feature before editing. Inspect the rendered surface at mobile and desktop widths when browser access is available.

## Activation conditions

Use this skill when the task involves:

- React/Vite components and TanStack Router screens.
- UI layouts, pages, dashboards, calendars, forms, modals, tables, cards, search, filters, or navigation.
- Tailwind or ShadCN component work.
- React Query, Zustand, Context, URL state, or local component state.
- Form validation with React Hook Form, Zod, server errors, or multi-step forms.
- Loading, error, empty, disabled, optimistic, or skeleton states.
- Responsive design or accessibility.
- Connecting frontend to backend APIs.

Do not use it for backend-only work unless frontend contract/state implications matter.

## TeamForge visual decisions

- Prefer compact hierarchy and meaningful whitespace over generic enclosing cards, nested boxes, or repeated separators.
- Reuse grouped-menu, collapsible, notice, input, button, modal, drawer, and activity-mosaic primitives. Grouped items use the established narrow gap separator; dividers must not stop arbitrarily inside a visual group.
- Unboxed icons inherit text colour. Accent icons only for status or an intentional icon background.
- Dark surfaces should remain dark; selection uses subtle state contrast rather than a bright card.
- Remove duplicated labels and metadata. Let typography, layout, imagery, maps, calendars, and progress cues present information when they communicate it better than database-like rows.
- Design mobile behavior deliberately, including text wrapping, touch targets, swipe affordances, sticky/drawer behavior, and safe-area spacing.
- Cover empty, loading, error, success, restricted, missing-media, dense, long-copy, and pagination states without custom decorative SVGs by default.
- Keep headings and navigation labels in sentence case unless content semantics require uppercase. Do not use uppercase merely as visual styling.
- Avoid blur transitions. Use restrained glass treatment only when real imagery or color behind the surface makes the material legible.

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
11. Preserve working behavior while redesigning presentation; do not silently remove data, states, or controls.
12. Prefer one coherent reusable pattern over several one-off variants that only differ cosmetically.

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

When the user provides a screenshot, identify the structural issue first: hierarchy, grouping, density, alignment, wrapping, responsive behavior, or state feedback. Reproduce the intended relationship rather than copying incidental pixel values.

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

When Scenario Mode is active, exercise the same API adapters, schemas, query keys, and mutations. Do not add component branches solely to make a synthetic state render.

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

## Visual iteration contract

For meaningful visual work:

1. Inspect the current rendered state before editing when browser access is available.
2. Verify at representative mobile and desktop widths; add tablet when the composition changes there.
3. Exercise wrapping, empty, dense, and relevant permission/error states through Scenario Mode or real interactions.
4. Check the console and network for errors introduced by the change.
5. Compare the result with the user's latest direction, not an older screenshot that has since been superseded.

Report the outcome first, then the important behavior/state decisions and the checks performed. Do not emit a large templated report unless the user asks for one.

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
