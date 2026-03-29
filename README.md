# TeamForge — Frontend

> **"Find your people, intelligently."**

TeamForge is an intelligent social platform that forms small, compatible groups of people for shared real-world activities. It targets students and young professionals aged 18–28 who want to meet like-minded people without the friction of traditional social discovery.

The core mechanic: press one button — **"Forge my group"** — and receive one algorithmically selected, compatible group. No endless scrolling, no random matching. Every connection is purposeful and mathematically computed using MBTI personality vectors, OCEAN Big Five scores, interest similarity, social graph proximity, age alignment, and an exponential-smoothing trust score.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Design System](#design-system)
- [Contributing](#contributing)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19.2 + TypeScript 5.9 |
| Build tool | Vite 7 |
| Routing | TanStack Router v1 (file-based, type-safe) |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Forms | React Hook Form v7 + Zod v4 |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui + Radix UI |
| HTTP client | ky (with auto token refresh) |
| Animations | Framer Motion v12 |
| Data viz | Recharts + D3 |
| Icons | Lucide React (primary), React Icons (fallback) |
| Linting / Formatting | ESLint 9 + Prettier 3.8 |
| Git hooks | Husky + lint-staged |

---

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later (this project uses `package-lock.json`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mkloz/teamforge-frontend.git
cd teamforge-frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in the required values (see Environment Variables below)

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
teamforge-frontend/
├── docs/                        # Brand and design documentation
│   ├── brand-overview.md        # Mission, brand voice, logo usage rules
│   └── visual-style-guide.md    # Color system, typography, spacing, components
├── public/                      # Static assets served at root
├── src/
│   ├── assets/                  # Static assets (logo SVG component)
│   ├── config/
│   │   └── config.ts            # Runtime env vars (VITE_API_URL, VITE_GOOGLE_CLIENT_ID)
│   ├── features/                # All product features, co-located by domain
│   │   ├── activity/            # Unified conversation activity feed
│   │   ├── app-shell/           # Persistent layout: sidebar, topbar, bottom nav
│   │   ├── auth/                # Login + multi-step registration (OTP, profile)
│   │   ├── direct-chats/        # 1-on-1 messaging
│   │   ├── explore/             # User/group discovery
│   │   ├── forge/               # Core "Forge my group" multi-step wizard
│   │   ├── groups/              # Group conversations and plan management
│   │   ├── home/                # Authenticated home/dashboard
│   │   ├── landing/             # Public marketing landing page
│   │   ├── notifications/       # Notification bell, drawer, store
│   │   ├── onboarding/          # Personality test (IPIP/MBTI) + interests selection
│   │   ├── profile/             # User profile with MBTI/OCEAN visualizations
│   │   ├── settings/            # Account and app settings
│   │   └── user-menu/           # User avatar menu (profile, settings, logout)
│   ├── shared/
│   │   ├── api/                 # Configured ky client with JWT auto-refresh
│   │   └── components/          # Generic reusable UI components
│   ├── index.css                # Tailwind v4 directives + CSS custom properties
│   ├── main.tsx                 # React app entry point
│   └── router.tsx               # Full TanStack Router tree
├── AGENTS.md                    # AI agent context and coding conventions
├── package.json
└── vite.config.ts
```

Each feature follows a consistent internal layout:

```
src/features/<feature>/
├── <feature>-page.tsx    # Top-level page component (route target)
├── components/           # Feature-specific UI components
├── hooks/                # Custom hooks (data fetching, UI state)
├── store/                # Zustand stores (client state only)
├── types/                # TypeScript interfaces and type unions
├── schemas/              # Zod validation schemas
├── constants/            # Static data and config constants
├── data/                 # Temporary mock data (replaced by API hooks when ready)
└── lib/                  # Pure utility functions
```

---

## Environment Variables

Create a `.env.local` file at the project root. **Never commit this file.**

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL for the backend REST API (e.g. `https://api.teamforge.app`) |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 client ID for social login |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the entire codebase |
| `npm run lint:fix` | Auto-fix lint errors where possible |
| `npm run format` | Format all `src/` files with Prettier |

Pre-commit hooks (via Husky + lint-staged) automatically run `lint:fix` and `format` on staged `src/` files before every commit.

---

## Architecture

### Routing

Routes are defined in `src/router.tsx` using TanStack Router. All authenticated routes are lazy-loaded via `React.lazy` + `Suspense` for optimal code splitting.

**Public routes** (no shell):

| Path | Page |
|---|---|
| `/` | Landing page |
| `/auth/login` | Login |
| `/auth/register` | Registration |
| `/onboarding/personality` | MBTI/OCEAN personality test |
| `/onboarding/interests` | Interest tag selection |

**Authenticated routes** (wrapped in `AppLayout`):

| Path | Page |
|---|---|
| `/home` | Dashboard |
| `/explore` | Discover users and groups |
| `/activity` | Activity feed |
| `/forge` | Forge wizard |
| `/profile` | User profile |
| `/settings` | Settings |

### API Client

The configured `ky` instance lives at `src/shared/api/api.ts`. Always import and use `apiClient` — never call `fetch` directly.

```ts
import { apiClient } from "@/shared/api/api";
```

It handles:
- Attaching `Authorization: Bearer <token>` to every request
- Automatic token refresh on `401` responses
- Redirecting to `/` when refresh fails

### State Management

| Concern | Tool |
|---|---|
| Server / API data | TanStack Query (feature `hooks/` files) |
| Shared UI state | Zustand (feature `store/` files) |
| Form state | React Hook Form (inline in form components) |
| Ephemeral local state | `useState` / `useReducer` |

### The Forge Wizard

The primary product interaction at `/forge`. A multi-step wizard managing: activity selection, plan details, group formation, result display, group identity setup, and optional manual invites. Wizard state is managed by `src/features/forge/hooks/use-forge-wizard.ts`.

### Onboarding Flow

New users complete two required steps before accessing the app:
1. **Personality test** — IPIP-NEO questionnaire that derives MBTI type and OCEAN scores
2. **Interests selection** — browse and select interest tags across categories

---

## Design System

The full specification lives in [`docs/visual-style-guide.md`](docs/visual-style-guide.md). Key rules for contributors:

**Colors** — exactly 5 tokens, no additions:

| Token | Hex | Use |
|---|---|---|
| `--color-forge-teal` | `#0D9488` | Primary actions, active states, icons |
| `--color-spark-amber` | `#F59E0B` | Trust scores, notifications, highlights |
| `--color-canvas` | `#FAFAF8` | Light page backgrounds |
| `--color-ink` | `#1C1C1A` | Headings and body text on light |
| `--color-slate-muted` | `#6B7280` | Secondary text, captions, borders |

**Typography** — single font family: **Inter**, mapped to `--font-sans`.

**Icons** — Lucide React at `strokeWidth={1.5}` (20–24px) or `strokeWidth={2}` (16px). Never use emojis as icons.

---

## Contributing

1. Fork the repository and create a branch from `main`.
2. Follow the feature co-location pattern described in [Project Structure](#project-structure).
3. Use the `@/` path alias — never relative `../../` imports.
4. Use named exports for all components except route-level page files.
5. Run `npm run lint` and `npm run build` before opening a pull request.
6. Never use `localStorage` for persistent data — all state goes through the API layer.

For AI agent contributors, read [`AGENTS.md`](AGENTS.md) in full before making any changes.
