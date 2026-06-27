---
trigger: model_decision
description: "Use for TeamForge frontend UI implementation, visual review, accessibility review, responsive layout checks, polish, complete loading/error/empty/success states, and rendered verification decisions."
---

# TeamForge UI Quality Gate

Use this for frontend UI implementation, visual review, accessibility review, polish, responsive layout checks, loading/error/empty states, and final rendered verification.

This rule adapts `frontend-product-ui-engineer`, `accessibility-a11y`, and `polish` for TeamForge.

## Source Of Truth

- `AGENTS.md` product, routing, architecture, validation, and copy rules.
- `docs/visual-style-guide.md` for color, type, spacing, components, and motion.
- Nearby feature components for local patterns.
- shadcn/Radix primitives and Lucide icons.
- TeamForge playbooks for API/query, forms, router/guards, realtime/PWA, and copy.

Generic design skills are inspiration only. They do not override TeamForge tokens, copy constraints, route ownership, or architecture.

## UI Workflow

1. Define the primary user action and secondary actions.
2. Locate the nearest existing screen/component pattern.
3. Classify data/state ownership: local, RHF, TanStack Query, Zustand, URL search, or route loader.
4. Implement complete states: loading, empty, error, pending/disabled, success, offline when relevant.
5. Check accessibility and keyboard behavior while building, not after.
6. Verify rendered behavior when the change has visual or interaction risk.

## TeamForge Visual Rules

- Use semantic tokens and existing Tailwind utilities; do not add new hue families or fonts.
- Keep teal and amber restrained; do not create one-note teal/amber screens.
- No gradient blobs, abstract decorative SVG fills, or unrelated background ornaments.
- Use Lucide icons, not emoji icons.
- Cards use `rounded-2xl`; pills/avatars use `rounded-full`; avoid `rounded-none` on user-facing controls.
- Use `gap-*` for spacing; avoid mixing margins with gap for the same layout relationship.
- Avoid inline styles and arbitrary values when the 4px scale works.
- Text must fit at mobile and desktop sizes without overlapping, clipping awkwardly, or pushing controls into unusable states.

## Accessibility Gate

Minimum expectations:

- Interactive elements are native buttons/links or Radix/shadcn components.
- Inputs have visible labels or clear accessible names.
- Field and form errors are readable and programmatically associated when the local pattern supports it.
- Dialogs, menus, popovers, and drawers preserve focus behavior.
- Keyboard navigation works for all visible actions.
- Focus indicators are visible.
- Icons without text have an accessible label or are hidden from assistive tech.
- Color is not the only status signal.
- Touch targets are practical on mobile.
- Motion respects reduced-motion expectations.

## Product-State Gate

Every user-facing async surface should answer:

- What is happening while data loads?
- What can the user do when no data exists?
- What happened when an error occurred, and how can the user recover?
- What is disabled during submission or mutation?
- What updates after success: route, cache, toast, inline status, realtime event, or all of these?
- What happens offline if the flow can be attempted offline?

Forms should follow `.agents/rules/teamforge/forms-rhf-zod-query.md`.

## Responsive Gate

- Check small mobile, typical laptop, and wide desktop when layout changes are meaningful.
- Maintain readable line lengths and stable fixed-format elements.
- Avoid horizontal scroll unless the component intentionally owns it, such as a data table.
- Ensure bottom navigation, drawers, modals, and sticky actions do not obscure content.
- Do not scale font size directly with viewport width.

## Rendered Verification

Use Browser/Chrome/Playwright screenshots or interaction checks when:

- A new page, modal, drawer, wizard step, or complex responsive layout was changed.
- A visual bug was fixed.
- The change affects focus, keyboard, dialogs, popovers, or scroll behavior.
- The feature includes canvas/3D/media-heavy rendering.
- The final answer would otherwise rely on visual guessing.

For small copy/docs or non-rendered logic changes, `npm run check:changed` is enough.

## Handoff Check

- Visual system: tokens, spacing, radius, icons, typography, and dark/light behavior align.
- UX states: loading, empty, error, pending, success, disabled, and offline paths are handled where relevant.
- Accessibility: keyboard/focus/labels/status semantics are covered.
- Architecture: feature colocation, API/query ownership, and route ownership are respected.
- Verification: local checks and any rendered smoke checks are reported honestly.
