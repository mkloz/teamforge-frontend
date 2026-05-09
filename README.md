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

| Layer                | Technology                                                 |
| -------------------- | ---------------------------------------------------------- |
| Framework            | React 19.2 + TypeScript 5.9                                |
| Build tool           | Vite 7                                                     |
| Routing              | TanStack Router v1 (manual route tree in `src/router.tsx`) |
| Server state         | TanStack Query v5                                          |
| Client state         | Zustand v5                                                 |
| Forms                | React Hook Form v7 + Zod v4                                |
| Styling              | Tailwind CSS v4                                            |
| UI primitives        | shadcn/ui + Radix UI                                       |
| HTTP client          | ky (with auto token refresh)                               |
| Animations           | Framer Motion v12                                          |
| Data viz             | Recharts + D3 through charting dependencies                |
| Icons                | Lucide React                                               |
| Linting / Formatting | Oxlint + Biome                                             |
| Git hooks            | Husky + lint-staged                                        |

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

The app will be available at `http://localhost:3000`.

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
│   │   ├── activity/            # Unified conversation feed, direct chats, group detail panels
│   │   ├── app-shell/           # Persistent layout: sidebar and bottom nav
│   │   ├── auth/                # Login + multi-step registration (OTP, profile)
│   │   ├── design-system/       # Internal component showcase / visual QA route
│   │   ├── explore/             # User/group discovery
│   │   ├── forge/               # Core "Forge my group" multi-step wizard
│   │   ├── home/                # Authenticated home/dashboard
│   │   ├── landing/             # Public marketing landing page
│   │   ├── notifications/       # Notification bell, drawer, and data hooks
│   │   ├── onboarding/          # Personality test (IPIP/MBTI) + interests selection
│   │   ├── profile/             # User profile with MBTI/OCEAN visualizations
│   │   ├── settings/            # Account and app settings
│   │   └── user-menu/           # User avatar menu (profile, settings, logout)
│   ├── shared/
│   │   ├── api/                 # Configured ky client, session, query client
│   │   ├── components/          # Generic reusable UI components
│   │   ├── hooks/               # Shared hooks
│   │   ├── lib/                 # Shared utilities and mappers
│   │   ├── providers/           # App-wide providers
│   │   ├── schemas/             # Canonical backend-aligned domain schemas
│   │   └── store/               # Shared UI stores
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
├── api/                  # Feature-local services, adapters, query factories
├── hooks/                # Custom hooks (data fetching, UI state)
├── store/                # Zustand stores (client state only)
├── types/                # TypeScript interfaces and type unions
├── schemas/              # Zod validation schemas
├── constants/            # Static data and config constants
├── data/                 # Temporary mock data (replaced by API hooks when ready)
└── lib/                  # Pure utility functions
```

Not every feature uses every folder, but backend-facing data seams should live in feature-local `api/` modules. Conversation and group UI currently live inside `src/features/activity/`, not separate `direct-chats/` or `groups/` feature folders.

---

## Environment Variables

Create a `.env.local` file at the project root. **Never commit this file.**

| Variable                | Required | Description                                                          |
| ----------------------- | -------- | -------------------------------------------------------------------- |
| `VITE_API_URL`          | Yes      | Base URL for the backend REST API (e.g. `https://api.teamforge.app`) |
| `VITE_GOOGLE_CLIENT_ID` | Yes      | Google OAuth 2.0 client ID for social login                          |

---

## Available Scripts

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Vite development server with HMR    |
| `npm run build`     | Type-check and build for production (`dist/`) |
| `npm run preview`   | Preview the production build locally          |
| `npm run lint`      | Run the full lint gate: Oxlint, React Compiler tracker, Biome, dependency-cruiser, and TypeScript |
| `npm run lint:changed` | Run the fast lint gate against staged, unstaged, and untracked changed files |
| `npm run lint:fix`  | Apply Biome safe fixes across the repo        |
| `npm run check`     | Alias for `npm run lint`                      |

Pre-commit hooks (via Husky + lint-staged) automatically run React Compiler tracking, Biome safe fixes, and Oxlint on staged files before every commit. Use `npm run lint:changed` for a fast local pass on all changed files, including unstaged edits; its changed-file Oxlint stage disables type-aware analysis and JS plugins by default. Use `node scripts/lint-changed.mjs --full-oxlint` when you need the full Oxlint config on changed files, and use `npm run lint` before a final commit or pull request.

---

## Contributing

1. Fork the repository and create a branch from `main`.
2. Follow the feature co-location pattern described in [Project Structure](#project-structure).
3. Use the `@/` path alias — never relative `../../` imports.
4. Use named exports for all components except route-level page files.
5. Run `npm run lint:changed` while iterating, then `npm run lint` and `npm run build` before opening a pull request.
6. Never use `localStorage` for persistent data — all state goes through the API layer.

For AI agent contributors, read [`AGENTS.md`](AGENTS.md) in full before making any changes.
