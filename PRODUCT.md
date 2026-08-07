# TeamForge

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who want help forming a small, compatible group around a real shared activity or plan. The product supports both first-time members choosing interests and returning members coordinating groups, plans, conversations, and safety settings.

## Product Purpose

TeamForge helps people move from an activity they want to do to a small group and a practical plan. Success means the product makes discovery, group formation, coordination, and follow-through feel understandable and safe.

## Positioning

TeamForge combines interests, personality, social context, and concrete activity planning so compatible people can form a group around something they intend to do, rather than browsing profiles as an end in itself.

## Operating Context

Members use TeamForge across mobile and desktop for onboarding, browsing open plans, forging a group, messaging, checking upcoming activity, managing profiles, and adjusting privacy, safety, notification, and appearance preferences. The product is an installable PWA and must remain usable in low-light, bright-light, offline, compact, and assistive-technology contexts.

## Capabilities and Constraints

- React 19, TypeScript, Vite, TanStack Router and Query, Zustand, Tailwind CSS v4, Radix/shadcn primitives, Socket.IO, and Scenario Mode are established implementation constraints.
- Scenario Mode is the deterministic source for synthetic product states and must not ship in production.
- Appearance preferences currently support account-backed mode, style, and palette values. The redesign must migrate old values safely and apply changes without reloads or hydration flashes.
- Authorization remains enforced by the backend. UI restrictions are explanatory, not a security boundary.
- Product terminology prefers group, people, fit, plan, activity, invite, and conversation. The experience must not drift into dating-app or gamification language.

## Brand Commitments

- The product name is TeamForge.
- The visual identity is calm, human, and structurally clear: neutral light surfaces, a true-black default dark background, refined teal interaction color, and restrained amber emphasis. Theme work preserves the product's established UI anatomy.
- Light, dark, and System modes are first-class.
- Illustrations use hand-drawn editorial characters with organic outlines, simple relaxed poses, white or black grounds, teal as the primary accent, amber as the restrained secondary accent, and gray only for minimal focus lines. No additional hues or paper wash are part of the family. The supplied reference image is binding stylistic evidence.
- Appearance choices must be understandable, immediate, persistent, reversible, keyboard accessible, and safe when stored preferences are invalid or outdated.

## Evidence on Hand

- The current production UI, semantic CSS tokens, shared components, and route behavior live under `src/`.
- Deterministic states and screenshot tooling live under `src/dev/scenarios/`, `test/scenario/`, and `scripts/scenario/`.
- The supplied editorial character image is preserved at
  `.impeccable/references/illustration-style-reference.png` (SHA-256
  `4A040387E175C578154140AD1A66729A2755D9A1E83C5CAF3D4940E193C0EAB1`) as the
  reference for any future commissioned illustration family; it is not currently
  authorized for product integration.
- No customer claims, benchmarks, testimonials, or commercial proof were supplied and none may be invented.

## Product Principles

1. Help people take a clear next step toward a real shared activity.
2. Make states, boundaries, and recovery paths understandable without blame or alarm.
3. Preserve calm, legibility, and focus across modes, palettes, devices, and long sessions.
4. Treat accessibility, responsive behavior, offline handling, and complete async states as correctness.
5. Personalization should provide practical comfort and clarity without becoming a cosmetic control panel.

## Accessibility & Inclusion

Meet WCAG AA for important combinations, preserve visible keyboard focus and semantic controls, support screen-reader navigation, 200% zoom, System color changes, increased contrast, and reduced motion/effects. Color and shadow may not be the only state indicators.
