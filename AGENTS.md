# AGENTS.md — TeamForge Frontend

This file provides authoritative context for AI coding agents (Copilot, Claude, Cursor, v0, etc.) working on the **TeamForge** frontend codebase. Read it in full before making any changes.

---

## Project Overview

**TeamForge** is an intelligent social platform that forms small, compatible groups of people for shared real-world activities. It targets students and young professionals aged 18–28 who want to meet like-minded people without the friction of traditional social discovery.

The core mechanic is simple: press one button ("Forge my group") and receive one algorithmically selected, compatible group. No endless scrolling, no random matching — every connection is purposeful and mathematically computed.

The platform uses a multi-factor scoring system combining:

- **MBTI personality** (4-dimensional vector)
- **OCEAN Big Five** psychometric scores
- **Interest similarity**
- **Social graph proximity**
- **Age alignment**
- **Exponential-smoothing trust score**

---

## Tech Stack

| Layer         | Technology                                                         |
| ------------- | ------------------------------------------------------------------ |
| Framework     | React 19.2 + TypeScript 5.9                                        |
| Build tool    | Vite 7                                                             |
| Routing       | TanStack Router v1 (file-based, type-safe)                         |
| Server state  | TanStack Query v5                                                  |
| Client state  | Zustand v5                                                         |
| Forms         | React Hook Form v7 + Zod v4                                        |
| Styling       | Tailwind CSS v4                                                    |
| UI primitives | shadcn/ui + Radix UI                                               |
| HTTP client   | ky (with auto token refresh)                                       |
| Animations    | Framer Motion v12                                                  |
| Data viz      | Recharts + D3 (color, delaunay, voronoi, ease, interpolate, timer) |
| Icons         | Lucide React (primary), React Icons (fallback)                     |
| Linting       | ESLint 9 + typescript-eslint                                       |
| Formatting    | Prettier 3.8                                                       |
| Git hooks     | Husky + lint-staged                                                |

---

## Repository Structure

```
src/
├── assets/              # Static assets (logo SVG component)
├── config/              # App-wide runtime config (env vars)
│   └── config.ts        # VITE_API_URL, VITE_GOOGLE_CLIENT_ID
├── features/            # All product features, co-located by domain
│   ├── activity/        # Unified conversation activity feed
│   ├── app-shell/       # Persistent layout: sidebar, topbar, bottom nav
│   ├── auth/            # Login + multi-step registration (OTP, profile)
│   ├── direct-chats/    # 1-on-1 messaging
│   ├── explore/         # User/group discovery
│   ├── forge/           # The core "Forge my group" wizard
│   ├── groups/          # Group conversations, plan management
│   ├── home/            # Authenticated home/dashboard
│   ├── landing/         # Public marketing landing page
│   ├── notifications/   # Notification bell, drawer, store
│   ├── onboarding/      # Personality test (IPIP/MBTI) + interests selection
│   ├── profile/         # User profile with MBTI/OCEAN visualizations
│   ├── settings/        # Account & app settings
│   └── user-menu/       # User avatar menu (profile, settings, logout)
├── shared/
│   ├── api/             # Configured ky API client with JWT refresh logic
│   └── components/      # Generic reusable UI components
├── index.css            # Tailwind v4 directives + CSS custom properties
├── main.tsx             # React app entry point
└── router.tsx           # Full TanStack Router tree
```

---

## Routing Architecture

Routes are defined in `src/router.tsx`. There are two route groups:

**Public routes** (no app shell, full-page layouts):
| Path | Component |
|---|---|
| `/` | `LandingPage` |
| `/auth/login` | `AuthPage` (login view) |
| `/auth/register` | `AuthPage` (register view) |
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

All authenticated pages are lazy-loaded via `React.lazy` + `Suspense` for optimal bundle splitting.

---

## Feature Architecture Pattern

Every feature follows the same internal structure. Do not deviate from this pattern when adding or modifying features.

```
src/features/<feature-name>/
├── <feature-name>-page.tsx       # Top-level page component (route target)
├── components/                   # Feature-specific components
│   └── <sub-feature>/
│       └── component.tsx
├── hooks/                        # Custom hooks (data fetching, UI state)
├── store/                        # Zustand stores (client state only)
├── types/                        # TypeScript interfaces and type unions
├── schemas/                      # Zod validation schemas
├── constants/                    # Static data, config constants
├── data/                         # Mock data (temporary, until API is wired)
└── lib/                          # Pure utility functions
```

**Rules:**

- Keep all feature code co-located. Never import one feature's internals into another feature.
- Cross-feature shared code belongs in `src/shared/`.
- Page components are thin orchestrators — business logic goes in hooks.
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
- If the refresh fails (or we are already on the refresh endpoint), tokens are cleared and the user is redirected to `/`.
- Base URL is set from `VITE_API_URL` in the environment config.
- Never call `fetch` directly. Always use `apiClient`.

---

## State Management

| Concern                           | Tool                      | Location                  |
| --------------------------------- | ------------------------- | ------------------------- |
| Server data (API responses)       | TanStack Query            | Feature `hooks/` files    |
| UI state shared across components | Zustand store             | Feature `store/` files    |
| Form state                        | React Hook Form           | Inline in form components |
| Local ephemeral state             | `useState` / `useReducer` | Component level           |

**Do not use `localStorage` for persistence.** All persistent state must go through the API layer.

---

## Key Domain Types

### User Profile (`src/features/profile/types/profile.types.ts`)

- `UserProfile` — full user entity with MBTI, OCEAN scores, interests, trust score
- `MBTIType` — union of all 16 MBTI types
- `DimensionScore` — per-axis score (0–100) for EI, SN, TF, JP
- `OceanScores` — Big Five scores (openness, conscientiousness, extraversion, agreeableness, neuroticism)

### Groups (`src/features/groups/types/groups.types.ts`)

- `Group` — full group entity with embedded `Plan`, `GroupIdentity`, and `GroupMember[]`
- `GroupPreview` — lightweight denormalized version for list rendering
- `Plan` — what the group will do: title, category, datetime, location, proposals, comments
- `PlanProposal` — a member-proposed change to a plan field with voting
- `GroupStatus` — `FORMING | PENDING | ACTIVE | COMPLETED | DISSOLVED`
- `PlanStatus` — `DRAFT | CONFIRMED | COMPLETED`
- `Message` — a single chat message with type, sender, and read receipts

### Forge (`src/features/forge/types/forge.types.ts`)

- `ForgeMode` — `"auto"` (algorithm picks group) | `"manual"` (user selects members)
- `FixedGroupSize` — `4 | 6 | 8`
- `Visibility` — `"public" | "friends" | "invite"`
- `ForgeResult` — `"idle" | "success" | "failed"`

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

New users complete two onboarding steps before accessing the app:

1. **Personality test** (`/onboarding/personality`) — an IPIP-NEO questionnaire that derives both MBTI type and OCEAN scores. Questions are in `src/features/onboarding/data/ipip-questions.ts`. The scorer lives in `src/features/onboarding/utils/score-calculator.ts`.
2. **Interests selection** (`/onboarding/interests`) — users browse and select interest tags across categories. Logic is in `src/features/onboarding/utils/interest-logic.ts`.

Both steps store their state via Zustand stores in `src/features/onboarding/store/`.

---

## Environment Variables

| Variable                | Required | Description                                                           |
| ----------------------- | -------- | --------------------------------------------------------------------- |
| `VITE_API_URL`          | Yes      | Base URL for the backend REST API (e.g., `https://api.teamforge.app`) |
| `VITE_GOOGLE_CLIENT_ID` | Yes      | Google OAuth client ID for social login                               |

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

- **Lucide React** is the primary icon library. Use `react-icons` only for icons unavailable in Lucide.
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
- **Type imports:** Use `import type { Foo }` when importing only types to prevent accidental runtime imports.
- **No barrel re-exports** unless a feature explicitly has an `index.ts` file.
- **Zod schemas** live in `schemas/` directories adjacent to the forms that use them. Infer types from schemas (`z.infer<typeof schema>`) — do not duplicate type definitions.
- **No inline styles.** Use Tailwind utility classes. Avoid arbitrary values (`px-[13px]`) — prefer the 4px-base Tailwind scale.
- **Spacing:** Use `gap-*` for spacing between flex/grid children. Never use `space-*` classes or mix `margin` with `gap` on the same element.

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

| Context        | Tone                 | Example                                                     |
| -------------- | -------------------- | ----------------------------------------------------------- |
| Headline / CTA | Confident, direct    | "Find your people, intelligently."                          |
| Onboarding     | Encouraging, curious | "Let's find out how you tick."                              |
| MBTI result    | Affirming, warm      | "You're an ENTJ — a natural organiser with bold ideas."     |
| Group formed   | Celebratory          | "Your group is ready. Here's why they're perfect for you."  |
| Empty state    | Gentle, activating   | "No groups yet. Let's forge your first one."                |
| Error / limit  | Honest, constructive | "You've used your 3 searches today. Fresh starts tomorrow." |

Primary slogan: **"Find your people, intelligently."**

---

## Further Reading

- `docs/brand-overview.md` — brand concept, mission, values, logo usage rules
- `docs/visual-style-guide.md` — full color system, typography scale, spacing grid, component patterns, animation principles
