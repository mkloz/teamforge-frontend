# AGENTS.md — TeamForge Frontend

This file provides authoritative context for AI coding agents (Copilot, Claude, Cursor, v0, etc.) working on the **TeamForge** frontend codebase. Read it in full before making any changes.

---

## Project Overview

**TeamForge** is an intelligent social platform that forms small, compatible groups of people for shared real-world activities. It targets students and young professionals aged 18–28 who want to meet like-minded people without the friction of traditional social discovery.

The core mechanic is simple: press one button ("Forge my group") and receive one algorithmically selected, compatible group. No endless scrolling, no random matching — every connection is purposeful and mathematically computed.

The platform uses a multi-factor scoring system combining:

- **Personality type compatibility** (4-letter type code)
- **Interest similarity**
- **Social graph proximity**
- **Age alignment**
- **Exponential-smoothing trust score**

---

## Tech Stack

| Layer         | Technology                                                               |
| ------------- | ------------------------------------------------------------------------ |
| Framework     | React 19.2 + TypeScript 5.9                                              |
| Build tool    | Vite 7.3                                                                 |
| Routing       | TanStack Router v1.162 (manually defined route tree in `src/router.tsx`) |
| URL state     | nuqs v2 with the TanStack Router adapter                                 |
| Server state  | TanStack Query v5.90                                                     |
| Client state  | Zustand v5                                                               |
| Forms         | React Hook Form v7.71 + Zod v4.3                                         |
| Styling       | Tailwind CSS v4.2                                                        |
| UI primitives | shadcn/ui + Radix UI                                                     |
| HTTP client   | ky v1.14 (with auto token refresh)                                       |
| Realtime      | Socket.IO client v4                                                      |
| Animations    | Framer Motion v12.34                                                     |
| Data viz      | Recharts v3 + D3 through charting dependencies                           |
| Icons         | Lucide React                                                             |
| Analytics     | Vercel Analytics                                                         |
| Linting       | Oxlint                                                                   |
| Formatting    | Biome                                                                    |
| Git hooks     | Husky + lint-staged                                                      |

---

## Repository Structure

```
src/
├── app/                 # App composition, runtime side effects, route helpers
│   ├── router/          # App-shell route wrappers, lazy-page helper, guards
│   ├── runtime/         # Global listeners, realtime sync, auth redirects
│   └── app.tsx          # Providers + RouterProvider composition
├── assets/              # Static assets (logo SVG component)
├── config/              # App-wide runtime config (env vars)
│   └── config.ts        # VITE_API_URL, VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_MAPS_API_KEY
├── features/            # All product features, co-located by domain
│   ├── activity/        # Unified conversation feed, direct chats, group detail panels
│   ├── app-shell/       # Persistent layout: sidebar and bottom nav
│   ├── auth/            # Login, registration, activation, password recovery
│   ├── design-system/   # Internal component showcase / visual QA route
│   ├── explore/         # User/group discovery
│   ├── forge/           # The core "Forge my group" wizard
│   ├── home/            # Authenticated home/dashboard
│   ├── landing/         # Public marketing landing page
│   ├── notifications/   # Notification bell, drawer, and notification data hooks
│   ├── onboarding/      # Personality test (IPIP/MBTI) + interests selection
│   ├── profile/         # User profile with MBTI/OCEAN visualizations
│   ├── settings/        # Account & app settings
│   └── user-menu/       # User avatar menu (profile, settings, logout)
├── shared/
│   ├── api/             # Configured ky API client, session, and query client
│   ├── components/      # Generic reusable UI components
│   ├── constants/       # Shared constants
│   ├── hooks/           # Shared hooks
│   ├── lib/             # Shared utilities and mappers
│   ├── providers/       # App-wide providers
│   ├── schemas/         # Canonical backend-aligned domain schemas
│   ├── store/           # Shared UI stores
│   ├── types/           # Shared TypeScript contracts
│   ├── utils/           # Low-level shared helpers
│   └── validators/      # Reusable validation helpers
├── styles/              # Tailwind theme, base, utilities, and animation CSS
├── index.css            # Tailwind v4 directives + CSS custom properties
├── main.tsx             # React app entry point
└── router.tsx           # Full TanStack Router tree
```

---

## Routing Architecture

Routes are defined manually in `src/router.tsx`. There are two main route groups plus an internal design-system route:

**Public routes** (no app shell, full-page layouts):
| Path | Component |
|---|---|
| `/` | `LandingPage` |
| `/auth/login` | `AuthPage` (login view) |
| `/auth/register` | `AuthPage` (register view) |
| `/auth/forgot-password` | `ForgotPasswordPage` |
| `/auth/reset-password/$token` | `ResetPasswordPage` |
| `/auth/activate/$token` | `ActivateAccountPage` |
| `/onboarding/profile` | `ProfileBasicsPage` |
| `/onboarding/personality` | `PersonalityTestPage` |
| `/onboarding/interests` | `InterestsPage` |

**Authenticated routes** (wrapped in `AppLayout` shell with sidebar/topbar/bottom nav):
| Path | Component |
|---|---|
| `/home` | `HomePage` |
| `/explore` | `ExplorePage` |
| `/activity` | `ActivityPage` |
| `/profile` | `ProfilePage` |
| `/settings` | `SettingsPage` |
| `/forge` | `ForgePage` |

**Internal route**:
| Path | Component |
|---|---|
| `/design-system` | `DesignSystemPage` |

The design-system route is registered only in development. Authenticated routes are protected through the `app-shell` route `beforeLoad`, onboarding routes use canonical onboarding guards, and app pages are lazy-loaded through `React.lazy` + the shared `LazyPage` wrapper for bundle splitting and loading states.

---

## Feature Architecture Pattern

Features are co-located and should stay structurally consistent, but not every feature needs every folder. Prefer the smallest structure that keeps the feature readable. Add folders when there is a real module group, not as ceremony.

```
src/features/<feature-name>/
├── <feature-name>-page.tsx          # Top-level route component; thin orchestration only
├── api/                             # Backend-facing feature modules
│   ├── <feature-name>.api.ts        # Raw API adapter functions using apiClient
│   ├── <feature-name>-commands.ts   # Mutating commands and command DTO mapping
│   ├── <feature-name>-query-keys.ts # Stable TanStack Query key factories
│   ├── <feature-name>-query-options.ts
│   ├── <feature-name>-query-factory.ts
│   └── cache/                       # Query cache update helpers, when needed
├── components/                      # Feature-specific UI, grouped by owner/surface
│   ├── standalone-component.tsx     # Single-file component: keep it as a file
│   └── grouped-component/           # Multi-file component group only
│       ├── index.tsx                # Main component for this folder
│       ├── subcomponent.tsx         # Private subcomponent used by index.tsx
│       ├── use-local-behavior.ts    # Private hook used by index.tsx
│       └── component-helpers.ts     # Private helpers used by this group
├── hooks/                           # Feature hooks that compose state, query, and UI behavior
├── store/                           # Zustand stores for feature client state only
├── schemas/                         # Feature-local Zod schemas and inferred form/input types
├── constants/                       # Static options, labels, and feature configuration
├── data/                            # Temporary mock/static data only
├── lib/                             # Feature contracts, projections, reducers, and pure domain helpers
└── types/                           # Feature-only type aliases when they do not belong beside schemas/lib
```

**Rules:**

- Keep all feature code co-located. Never import one feature's internals into another feature.
- Cross-feature shared code belongs in `src/shared/`.
- Page components are thin orchestrators. Business logic belongs in hooks, reducers, API modules, or pure `lib/` modules.
- Use feature-local `api/` modules for backend-facing data seams: raw API adapters, command functions, query keys/options, query factories, and cache helpers.
- TanStack Query remains the source of truth for server state. Do not replace query/mutation flows with React `useActionState`; React 19 actions are only for isolated local form workflows where they do not duplicate server-state ownership.
- `api/` modules must not contain UI state or React component logic. Query hooks live in `hooks/` or page orchestration; query keys/options and cache update helpers live in `api/`.
- `lib/*-contract.ts` is the preferred home for feature-facing domain contracts and projections when those contracts are shared across that feature.
- Use `schemas/` for backend-aligned validation and form input schemas. Infer types from schemas instead of duplicating them.
- Component grouping rule: do not create a folder just to hold a single `index.tsx`. A component folder is justified only when the main component has private subcomponents/hooks/helpers. In that case `index.tsx` is the main component and all private files live alongside it in the same folder.
- Keep parent `components/` folders clean: major surfaces and standalone components may live there, but private children of a decomposed component stay inside that component's folder.
- Avoid barrel re-exports for feature internals. Import the concrete module directly unless the feature intentionally owns a public `index.ts`.
- Mock data files (`data/mock-*.ts`) are temporary scaffolding. Replace with TanStack Query hooks when the backend is ready.

---

## API Client

The configured `ky` client lives at `src/shared/api/api.ts`.

```ts
import { apiClient } from "@/shared/api/api";
```

**Key behaviors:**

- Automatically attaches `Authorization: Bearer <accessToken>` to every request.
- On a `401` response, automatically attempts a token refresh via `POST auth/refresh`.
- If the refresh fails (or we are already on the refresh endpoint), tokens are cleared and the app redirects to `/auth/login`.
- Base URL is set from `VITE_API_URL` in the environment config.
- Never call `fetch` directly. Always use `apiClient`.

---

## State Management

| Concern                           | Tool                      | Location                  |
| --------------------------------- | ------------------------- | ------------------------- |
| Server data (API responses)       | TanStack Query            | Feature `hooks/` + `api/` |
| UI state shared across components | Zustand store             | Feature `store/` files    |
| Form state                        | React Hook Form           | Feature hooks/components  |
| Local ephemeral state             | `useState` / `useReducer` | Component level           |

**Do not use `localStorage` for persistence.** All persistent state must go through the API layer.

React 19 is enabled, including `useOptimistic`, `useEffectEvent`, `Activity`, and ref-as-prop support. Use these where they simplify code, but keep TanStack Query as the canonical server-state layer.

---

## Key Domain Types

### User Profile (`src/features/profile/lib/profile-contract.ts`, `src/shared/schemas/user.ts`)

- `UserProfile` — full user entity with personality type, interests, trust score
- `PersonalityType` — 4-letter personality type code (e.g., "INFP", "ESTJ")

### Conversations & Groups (`src/shared/schemas/group.ts`, `src/shared/schemas/chat.ts`, `src/features/activity/schemas/activity.schemas.ts`, `src/features/activity/lib/activity-contract.ts`)

- Canonical backend-aligned group, plan, message, and chat models live in `src/shared/schemas/`.
- `src/features/activity/schemas/activity.schemas.ts` contains activity-specific validated projections for groups, direct chats, participants, messages, and attachments.
- `src/features/activity/lib/activity-contract.ts` re-exports the feature-facing activity contracts used by activity hooks and components.
- Current group and direct-chat UI both live inside the `activity` feature rather than standalone `groups/` or `direct-chats/` feature folders.

### Forge (`src/features/forge/lib/forge-contract.ts`, `src/features/forge/schemas/forge.schemas.ts`)

- `ForgeMode` — backend-aligned forge mode from shared enum schemas
- `FixedGroupSize` — `2-8` members
- `GroupSizeMode` — `"RANGE" | "FIXED"`
- `Visibility` — activity visibility from shared enum schemas
- `ForgeResult` — `"IDLE" | "SUCCESS" | "FAILED"`

---

## The Forge Wizard

The Forge wizard is the core product interaction. It lives at `/forge` and is implemented as a multi-step wizard (`src/features/forge/`).

**Steps:**

1. **Activity** — user selects or describes what they want to do
2. **Plan** — user sets plan details (title, date, location)
3. **Group** — algorithm runs and presents a compatible group
4. **Result** — success (group formed) or failed (not enough compatible users)
5. **Identity** — group naming and avatar selection
6. **Invite** — optional manual invites

The wizard state is managed by `src/features/forge/hooks/use-forge-wizard.ts`. The Forge trigger button is accessible from the app shell via `src/features/app-shell/components/forge-trigger-button.tsx`.

---

## Onboarding Flow

New users complete three onboarding steps before accessing the app:

1. **Profile basics** (`/onboarding/profile`) — users add profile basics through `src/features/onboarding/components/profile-basics/`, `src/features/onboarding/hooks/use-profile-basics-form.ts`, and `src/features/onboarding/schemas/profile-basics.schema.ts`.
2. **Personality test** (`/onboarding/personality`) — a questionnaire that determines the user's 4-letter personality type code. Questions are in `src/features/onboarding/data/ipip-questions.ts`. Score calculation lives in `src/features/onboarding/utils/score-calculator.ts`, with flow/result orchestration helpers in `src/features/onboarding/lib/`.
3. **Interests selection** (`/onboarding/interests`) — users browse and select interest tags across categories. Core selection logic is in `src/features/onboarding/utils/interest-logic.ts`, with browse-state helpers in `src/features/onboarding/lib/interests-browser-state.ts`.

Onboarding flow state lives in `src/features/onboarding/store/`, while submission logic goes through feature API commands/hooks.

---

## Environment Variables

| Variable                   | Required | Description                                                           |
| -------------------------- | -------- | --------------------------------------------------------------------- |
| `VITE_API_URL`             | Yes      | Base URL for the backend REST API (e.g., `https://api.teamforge.app`) |
| `VITE_GOOGLE_CLIENT_ID`    | Yes      | Google OAuth client ID for social login                               |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes      | Google Maps API key for address autocomplete                          |

Set these in `.env.local` for local development. Never commit `.env.local` to version control.

---

## Design System

All visual design follows the specifications in `docs/visual-style-guide.md`. The key rules that agents must enforce:

**Colors (5 tokens, no others):**
| Token | Hex | Use |
|---|---|---|
| `--color-forge-teal` | `#0D9488` | Primary actions, active states, icons |
| `--color-spark-amber` | `#F59E0B` | Trust scores, notifications, highlights |
| `--color-canvas` | `#FAFAF8` | Light section backgrounds |
| `--color-ink` | `#1C1C1A` | Headings and body text on light |
| `--color-slate-muted` | `#6B7280` | Secondary text, captions, borders |

- Teal and Amber must not exceed 15% of any screen surface.
- Never introduce additional hex variants. Use opacity modifiers on `#0D9488` if a lighter teal is needed for a non-gradient context.

**Typography:**

- Single font family: **Inter** across the entire app.
- Map to `--font-sans` CSS token.
- Minimum font size: 12px. Body line-height: 1.4–1.6.

**Icons:**

- **Lucide React** is the icon library. Add another icon package only when a specific icon cannot be represented well with Lucide.
- Default stroke width: `1.5` at 20–24px, `2` at 16px.
- Never use emojis as icons.

**Border radius:**

- Cards: `rounded-2xl` (16px)
- Pills/avatars: `rounded-full`
- Never use `rounded-none` on user-facing interactive elements.

---

## Code Conventions

- **Path alias:** `@/` maps to `src/`. Always use it instead of relative `../../` imports.
- **Component exports:** Use named exports (`export function MyComponent`), not default exports, except at the route/page level.
- **Component file layout:** Do not create a folder just to hold a single `index.tsx`. If an extracted component is a single file, keep it as `<component-name>.tsx` beside related files. Use a component folder with `index.tsx` only when the component has multiple private subcomponents/helpers; in that case, keep those private files alongside `index.tsx` inside the same folder.
- **Type imports:** Use `import type { Foo }` when importing only types to prevent accidental runtime imports.
- **No barrel re-exports** unless a feature explicitly has an `index.ts` file.
- **Zod schemas** live in `schemas/` directories adjacent to the forms that use them. Infer types from schemas (`z.infer<typeof schema>`) — do not duplicate type definitions.
- **No inline styles.** Use Tailwind utility classes. Avoid arbitrary values (`px-[13px]`) — prefer the 4px-base Tailwind scale.
- **Spacing:** Use `gap-*` for spacing between flex/grid children. Never use `space-*` classes or mix `margin` with `gap` on the same element.
- **React 19 cleanup:** Do not add `useMemo`/`useCallback` by default. Use them only for stable dependency boundaries, external subscriptions, expensive derived values, or referential APIs that truly require stability.
- **Effect cleanup:** Timers, subscriptions, animation frames, observers, and DOM listeners must clean themselves up.

---

## Validation Policy

- The frontend currently does not have an automated test suite by product decision.
- Use `npm run lint:changed` for a fast local pass on staged, unstaged, and untracked changed files. Its changed-file Oxlint stage skips type-aware analysis and JS plugins by default; use `node scripts/lint-changed.mjs --full-oxlint` when that full Oxlint coverage is needed before the full lint gate.
- For code changes, validate with `npm run lint` and `npm run build` unless the user explicitly asks for a narrower check.
- Do not add frontend tests unless the user explicitly asks for tests.

---

## Agent Artifacts

- Put generated audits, reviews, implementation notes, migration plans, and other agent-written reports in `reports/`.
- Put scratch files, temporary scripts, one-off command outputs, and other disposable working files in `temp/`.
- Do not put agent-generated reports or temporary work files in `docs/`. The `docs/` folder is only for durable project documentation intended to be maintained by humans.
- `reports/` and `temp/` are ignored by git and should remain untracked.

---

## What Not To Do

- Do not use `localStorage` or `sessionStorage` for any data that needs to persist.
- Do not call `fetch` directly — use `apiClient` from `src/shared/api/api.ts`.
- Do not add new colors or fonts outside the defined design tokens.
- Do not introduce gradient blobs, abstract shapes, or decorative SVG fills as background elements.
- Do not use dating-app language ("match", "swipe", "like", "heart") or gamification language ("level up", "achievement") anywhere in copy or variable names.
- Do not expose algorithm terminology to users ("k-NN", "cosine similarity", "MGS", "Euclidean distance").
- Do not break the feature co-location pattern by placing feature-specific code in `src/shared/`.
- Do not display placeholder/mock statistics as if they are live data.
- Do not write a single large page file — split into focused components, hooks, and utilities.

---

## Brand Voice (for copy changes)

TeamForge speaks like a knowledgeable peer, never a corporation.

| Context            | Tone                 | Example                                                     |
| ------------------ | -------------------- | ----------------------------------------------------------- |
| Headline / CTA     | Confident, direct    | "Find your people, intelligently."                          |
| Onboarding         | Encouraging, curious | "Let's find out how you tick."                              |
| Personality result | Affirming, warm      | "You're an ENTJ — a natural organiser with bold ideas."     |
| Group formed       | Celebratory          | "Your group is ready. Here's why they're perfect for you."  |
| Empty state        | Gentle, activating   | "No groups yet. Let's forge your first one."                |
| Error / limit      | Honest, constructive | "You've used your 3 searches today. Fresh starts tomorrow." |

Primary slogan: **"Find your people, intelligently."**

---

## Further Reading

- `docs/brand-overview.md` — brand concept, mission, values, logo usage rules
- `docs/visual-style-guide.md` — full color system, typography scale, spacing grid, component patterns, animation principles
