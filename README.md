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
- [Production PWA Release](#production-pwa-release)
- [Contributing](#contributing)

---

## Tech Stack

| Layer                | Technology                                                 |
| -------------------- | ---------------------------------------------------------- |
| Framework            | React 19.2 + TypeScript 5.9                                |
| Build tool           | Vite 7.3                                                   |
| Routing              | TanStack Router v1 (manual route tree in `src/router.tsx`) |
| URL state            | nuqs v2 with the TanStack Router adapter                   |
| Server state         | TanStack Query v5                                          |
| Client state         | Zustand v5                                                 |
| Forms                | React Hook Form v7 + Zod v4                                |
| Styling              | Tailwind CSS v4                                            |
| UI primitives        | shadcn/ui + Radix UI                                       |
| HTTP client          | ky (with auto token refresh)                               |
| Realtime             | Socket.IO client v4                                        |
| Animations           | Framer Motion v12                                          |
| Data viz             | Recharts + D3 through charting dependencies                |
| Icons                | Lucide React                                               |
| Analytics            | Vercel Analytics                                           |
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

Use `localhost`, not `127.0.0.1`, for local browser smoke checks when
`VITE_API_URL` points to `http://localhost:6969/api/v1`. The frontend
canonicalizes `127.0.0.1` to `localhost` in that setup so auth cookies and API
host assumptions stay consistent; the redirect is expected and should not be
counted as a broken navigation link.

---

## Project Structure

```
teamforge-frontend/
├── docs/                        # Brand and design documentation
│   ├── architecture-guide.md    # Frontend architecture and backend contract notes
│   ├── brand-overview.md        # Mission, brand voice, logo usage rules
│   ├── open-api.yaml            # Copied/generated backend OpenAPI contract
│   └── visual-style-guide.md    # Color system, typography, spacing, components
├── public/                      # Static assets served at root
├── src/
│   ├── assets/                  # Static assets (logo SVG component)
│   ├── config/
│   │   └── config.ts            # Runtime env vars (API, Google, Maps, Giphy)
│   ├── features/                # All product features, co-located by domain
│   │   ├── activity/            # Unified conversation feed, direct chats, group detail panels
│   │   ├── app-shell/           # Persistent layout: sidebar and bottom nav
│   │   ├── auth/                # Login + multi-step registration (OTP, profile)
│   │   ├── design-system/       # Internal component showcase / visual QA route
│   │   ├── download/            # Public PWA install guidance
│   │   ├── explore/             # User/group discovery
│   │   ├── forge/               # Core "Forge my group" multi-step wizard
│   │   ├── group-plan-detail/   # Group and plan briefing route
│   │   ├── home/                # Authenticated home/dashboard
│   │   ├── landing/             # Public marketing landing page
│   │   ├── legal/               # Privacy and terms pages
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

Not every feature uses every folder, but backend-facing data seams should live in feature-local `api/` modules. Conversation feed UI lives inside `src/features/activity/`, while the full group and plan briefing route lives in `src/features/group-plan-detail/`.

---

## Environment Variables

Create a `.env.local` file at the project root. **Never commit this file.**

| Variable                | Required | Description                                                          |
| ----------------------- | -------- | -------------------------------------------------------------------- |
| `VITE_APP_URL`          | Yes      | Public frontend base URL used for canonical metadata and share links  |
| `VITE_API_URL`          | Yes      | Backend REST API base URL, including the API prefix (`/api/v1`)      |
| `VITE_MEDIA_BASE_URL`   | Yes      | Public media asset base URL for seed/template imagery                 |
| `VITE_GOOGLE_CLIENT_ID` | Yes      | Google OAuth 2.0 client ID for social login                          |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes   | Google Maps API key for location autocomplete                        |
| `VITE_GIPHY_API_KEY`    | Yes      | Giphy Web SDK key for GIF search in chat                             |

Local development usually uses:

```env
VITE_APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:6969/api/v1
VITE_MEDIA_BASE_URL=https://mkloz-teamforge.s3.us-east-1.amazonaws.com
```

Production should use the public browser URL with the same API prefix:

```env
VITE_APP_URL=https://teamforge.app
VITE_API_URL=https://arm-api.mkloz.com/teamforge/api/v1
VITE_MEDIA_BASE_URL=https://mkloz-teamforge.s3.us-east-1.amazonaws.com
```

The realtime client derives the Socket.IO transport path from `VITE_API_URL`.
For the production URL above, it connects to the `/realtime` namespace through
`/teamforge/socket.io`.

Before a production PWA build, run the browser-env preflight with the same
values that Vite will bake into the bundle:

```bash
VITE_APP_URL=https://teamforge.app \
VITE_API_URL=https://arm-api.mkloz.com/teamforge/api/v1 \
VITE_MEDIA_BASE_URL=https://mkloz-teamforge.s3.us-east-1.amazonaws.com \
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id \
VITE_GOOGLE_MAPS_API_KEY=your-production-maps-key \
VITE_GIPHY_API_KEY=your-production-giphy-key \
npm run pwa:release
```

The release gate rejects local API URLs, missing `/api/v1`, and placeholder
browser keys before building, then runs the production PWA QA pass against
`dist/`.

---

## Available Scripts

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Vite development server with HMR    |
| `npm run build`       | Type-check and build for production (`dist/`) |
| `npm run preview`     | Preview the production build locally          |
| `npm run test`        | Run the unit test command                     |
| `npm run test:unit`   | Run Vitest unit tests                         |
| `npm run pwa:env`     | Validate production PWA browser environment values before build/deploy |
| `npm run pwa:qa`      | Run source and build-artifact PWA checks      |
| `npm run pwa:release` | Run the production PWA env preflight, build, and QA gate |
| `npm run lint`        | Run the full lint gate: Oxlint, React Compiler tracker, Biome, dependency-cruiser, and TypeScript |
| `npm run lint:changed` | Run the strict changed-file lint gate with full Oxlint |
| `npm run lint:fast`   | Run the faster changed-file lint gate while iterating |
| `npm run lint:fix`    | Apply Biome safe fixes, formatting, and Knip checks |

Pre-commit hooks (via Husky + lint-staged) automatically run React Compiler tracking, Biome safe fixes, and Oxlint on staged files before every commit. Use `npm run lint:fast` for a quick local pass on changed files while iterating, and `npm run lint:changed` when you need the stricter changed-file gate with the full Oxlint config.

---

## Architecture

Routes are manually composed in `src/router.tsx` from `src/app/router/*`. Route pages are lazy-loaded through the shared lazy-route helpers, and the authenticated app shell gates app routes through `beforeLoad` guards.

| Route | Surface |
| ----- | ------- |
| `/`, `/download`, `/privacy`, `/terms` | Public pages |
| `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password/$token`, `/auth/activate/$token` | Auth flows |
| `/onboarding/profile`, `/onboarding/personality`, `/onboarding/interests` | Guarded onboarding |
| `/home`, `/explore`, `/activity`, `/profile`, `/settings`, `/forge` | Authenticated app shell |
| `/groups/$groupId`, `/users/$userId` | Authenticated detail routes |
| `/design-system/icon-notice-variants` | Development-only visual QA route |

Server state belongs to TanStack Query. Feature API adapters, query keys, query options, query factories, and cache helpers stay inside feature-local `api/` folders. Cross-feature backend-aligned schemas live in `src/shared/schemas/`, while feature-specific projections stay with the feature that owns the UI.

Realtime connects to the backend Socket.IO `/realtime` namespace after an auth session exists. The client derives the Socket.IO transport path from `VITE_API_URL`, which lets local development use `/socket.io` and the current production path use `/teamforge/socket.io`.

---

## Design System

TeamForge design guidance lives in [`docs/visual-style-guide.md`](docs/visual-style-guide.md) and [`docs/brand-overview.md`](docs/brand-overview.md). The app uses Inter, Lucide React, Tailwind CSS v4 tokens, shadcn/ui, and Radix primitives.

The color system is intentionally small: forge teal, spark amber, canvas, ink, and slate muted. New UI should use those tokens and opacity modifiers rather than introducing additional hex colors.

---

## Production PWA Release

The production PWA release path is:

```bash
VITE_APP_URL=https://teamforge.app \
VITE_API_URL=https://arm-api.mkloz.com/teamforge/api/v1 \
VITE_MEDIA_BASE_URL=https://mkloz-teamforge.s3.us-east-1.amazonaws.com \
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id \
VITE_GOOGLE_MAPS_API_KEY=your-production-maps-key \
VITE_GIPHY_API_KEY=your-production-giphy-key \
npm run pwa:release
```

`npm run pwa:release` runs the browser-env preflight, production build, and PWA QA gate. It rejects local API URLs, missing `/api/v1`, placeholder browser keys, and missing production PWA assets before deployment.

### Cloudflare Pages CI/CD

Frontend deploys are handled by `.github/workflows/cloudflare-pages.yml`.
GitHub Actions runs the production browser-env preflight, the full quality gate,
unit tests, the Vite build, and PWA QA before uploading `dist/` to Cloudflare
Pages with Wrangler Direct Upload.

Required GitHub environment secrets:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
VITE_GIPHY_API_KEY
VITE_GOOGLE_CLIENT_ID
VITE_GOOGLE_MAPS_API_KEY
VITE_MEDIA_BASE_URL
```

Required GitHub environment variable:

```text
CLOUDFLARE_PAGES_PROJECT_NAME=teamforge-web
```

Optional GitHub environment variables:

```text
CLOUDFLARE_PAGES_DEPLOY_ON_PUSH=false
CLOUDFLARE_PAGES_PRODUCTION_BRANCH=main
VITE_APP_URL=https://teamforge.app
VITE_API_URL=https://arm-api.mkloz.com/teamforge/api/v1
```

Manual dispatch defaults to a preview Pages deployment. Select `production` only
when the backend smoke checks have passed on `arm-api.mkloz.com` and the
browser-baked integration keys are production-ready.

---

## Contributing

1. Fork the repository and create a branch from `main`.
2. Follow the feature co-location pattern described in [Project Structure](#project-structure).
3. Use the `@/` path alias — never relative `../../` imports.
4. Use named exports for all components except route-level page files.
5. Run `npm run lint:fast` while iterating on small changes; use `npm run lint:changed` for the stricter changed-file gate.
6. Run `npm run lint` and `npm run build` before opening a pull request.
7. Never use `localStorage` for persistent data — all state goes through the API layer.

For AI agent contributors, read [`AGENTS.md`](AGENTS.md) in full before making any changes.
