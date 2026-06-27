# AGENTS.md - TeamForge Frontend

Authoritative context for AI coding agents working in this repo. Read before making changes.

---

## Product

**TeamForge** forms small, compatible groups for shared real-world activities. It targets students and young professionals aged 18-28 who want purposeful social discovery without scrolling, swiping, or random matching.

Core mechanic: press **"Forge my group"** and receive one algorithmically selected group. Compatibility combines personality type, interest similarity, social graph proximity, age alignment, and an exponential-smoothing trust score.

---

## Stack

- **App:** React 19.2, TypeScript 5.9, Vite 7.3, TanStack Router v1.162, nuqs v2
- **State/data:** TanStack Query v5.90, Zustand v5, React Hook Form v7.71, Zod v4.3
- **UI:** Tailwind CSS v4.2, shadcn/ui, Radix UI, Lucide React, Framer Motion v12.34, Recharts v3/D3
- **Network/runtime:** ky v1.14, Socket.IO client v4
- **Quality:** Oxlint, Biome, Husky, lint-staged

---

## Project Map

- `src/app/` - providers, router helpers, route guards, runtime side effects, realtime sync
- `src/features/` - product features, co-located by domain: `activity`, `app-shell`, `auth`, `design-system`, `download`, `explore`, `forge`, `group-plan-detail`, `home`, `landing`, `legal`, `notifications`, `onboarding`, `profile`, `settings`, `user-menu`
- `src/shared/` - reusable API, components, constants, hooks, providers, schemas, stores, types, utilities, validators
- `src/config/` - runtime config from Vite env variables
- `src/styles/`, `src/index.css` - Tailwind theme, base styles, utilities, animations
- `src/router.tsx` - complete manually defined TanStack route tree
- `public/icons/`, `public/download/` - generated PWA assets

---

## Routing

Routes are defined manually in `src/router.tsx`.

- **Public full-page:** `/`, `/download`, `/privacy`, `/terms`, `/auth` redirects to `/auth/login`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password/$token`, `/auth/activate/$token`
- **Onboarding, guarded, no shell:** `/onboarding/profile`, `/onboarding/personality`, `/onboarding/interests`
- **Authenticated app shell:** `/home`, `/explore`, `/groups/$groupId`, `/activity`, `/profile`, `/users/$userId`, `/settings`, `/forge`
- **Development only:** `/design-system/icon-notice-variants`

Authenticated routes are protected by the app-shell `beforeLoad`; onboarding routes use canonical onboarding guards. App pages are lazy-loaded through the shared lazy-route wrappers. Group and plan briefing lives in `src/features/group-plan-detail/`; conversation feed and direct/group chat workspace stay in `src/features/activity/`.

---

## Runtime, Realtime, and PWA

- Runtime side effects live in `src/app/runtime/`: auth redirects, route-aware realtime sync, authenticated PWA behavior, and global listeners.
- Realtime connects to the Socket.IO `/realtime` namespace only after an auth session exists.
- Socket path derives from `VITE_API_URL`: local `http://localhost:6969/api/v1` maps to `/socket.io`; production `https://api.mkloz.com/teamforge/api/v1` maps to `/teamforge/socket.io`.
- App-wide realtime handles `notification.new` and `group.updated` in `src/app/runtime/app-realtime-events.ts`.
- Activity and group-plan detail routes handle chat, read, typing, presence, plan, and group events locally.
- The app is a PWA via `vite-plugin-pwa`; `/download` owns install guidance, diagnostics, and push-notification readiness.
- Use `scripts/pwa/generate-icons.js` only when intentionally regenerating PWA icons.

---

## Architecture and State

- Keep feature code co-located in `src/features/<feature>/`. Never import another feature's internals.
- Put cross-feature code in `src/shared/`.
- Use the smallest readable feature structure. Add `api/`, `components/`, `hooks/`, `store/`, `schemas/`, `constants/`, `data/`, `lib/`, or `types/` only when the feature needs them.
- Page components are thin orchestration. Business logic belongs in hooks, reducers, API modules, or pure `lib/` helpers.
- Feature `api/` modules are backend-facing only: raw adapters, commands, query keys/options/factories, and cache helpers. They must not contain UI state or React component logic.
- Query hooks live in `hooks/` or page orchestration; query keys/options and cache update helpers stay in `api/`.
- TanStack Query is the server-state source of truth. Do not replace query/mutation flows with React `useActionState`; use React 19 actions only for isolated local form workflows.
- React 19 APIs such as `useOptimistic`, `useEffectEvent`, `Activity`, and ref-as-prop are available when they simplify code.
- Zustand stores are for feature/client UI state. React Hook Form owns form state. `useState`/`useReducer` are fine for local ephemeral state.
- Do not use `localStorage` or `sessionStorage` for persisted data; persistence goes through the API.
- Prefer `lib/*-contract.ts` for feature-facing domain contracts and projections.
- Use Zod schemas near the forms/contracts they validate and infer types from schemas.
- Component folders are only for multi-file components with private children/hooks/helpers. Single components stay as `<component-name>.tsx`.
- Avoid feature-internal barrel re-exports unless the feature intentionally owns a public `index.ts`.
- Mock data in `data/mock-*.ts` is temporary scaffolding; replace it with TanStack Query hooks when the backend is ready.

---

## API Client

Use the configured ky client from `src/shared/api/api.ts`:

```ts
import { apiClient } from "@/shared/api/api";
```

`apiClient` attaches bearer tokens, sends credentials for cookie-backed refresh, attempts `POST auth/refresh` on `401`, clears tokens and redirects to `/auth/login` when refresh fails, and uses `VITE_API_URL` as the `/api/v1` base URL. Never call `fetch` directly for backend API work.

---

## Domain Notes

- User profile contracts live in `src/features/profile/lib/profile-contract.ts` and `src/shared/schemas/user.ts`. `PersonalityType` is the 4-letter code such as `INFP`.
- Canonical group, plan, message, and chat models live in `src/shared/schemas/`.
- Activity-specific validated projections live in `src/features/activity/schemas/activity.schemas.ts`; feature-facing activity contracts are re-exported from `src/features/activity/lib/activity-contract.ts`.
- Forge contracts live in `src/features/forge/lib/forge-contract.ts` and `src/features/forge/schemas/forge.schemas.ts`: `ForgeMode`, `FixedGroupSize` (`2-8`), `GroupSizeMode` (`"RANGE" | "FIXED"`), `Visibility`, and `ForgeResult` (`"IDLE" | "SUCCESS" | "FAILED"`).

---

## Core Flows

**Forge wizard:** `/forge`, implemented in `src/features/forge/`, managed by `src/features/forge/hooks/use-forge-wizard.ts`, triggered from `src/features/app-shell/components/forge-trigger-button.tsx`. Steps: Activity, Plan, Group, Result, Identity, Invite.

**Onboarding:** profile basics (`/onboarding/profile`), personality test (`/onboarding/personality`), and interests (`/onboarding/interests`). Key files include `src/features/onboarding/components/profile-basics/`, `hooks/use-profile-basics-form.ts`, `schemas/profile-basics.schema.ts`, `data/ipip-questions.ts`, `utils/score-calculator.ts`, `utils/interest-logic.ts`, `lib/interests-browser-state.ts`, and onboarding state in `store/`.

---

## Environment

Required Vite env variables:

- `VITE_APP_URL` - public frontend base URL
- `VITE_API_URL` - backend REST base URL including `/api/v1`
- `VITE_MEDIA_BASE_URL` - public media asset base URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_GOOGLE_MAPS_API_KEY` - address autocomplete
- `VITE_GIPHY_API_KEY` - GIF search in chat

Use `.env.local` locally and never commit it. Local app/API usually uses `VITE_APP_URL=http://localhost:3000` and `VITE_API_URL=http://localhost:6969/api/v1`; production uses `VITE_APP_URL=https://teamforge.app` and `VITE_API_URL=https://api.mkloz.com/teamforge/api/v1`.

Before a production PWA build, run the browser-env preflight with the same values Vite will bake into the bundle:

```bash
VITE_APP_URL=https://teamforge.app \
VITE_API_URL=https://api.mkloz.com/teamforge/api/v1 \
VITE_MEDIA_BASE_URL=https://mkloz-teamforge.s3.us-east-1.amazonaws.com \
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id \
VITE_GOOGLE_MAPS_API_KEY=your-production-maps-key \
VITE_GIPHY_API_KEY=your-production-giphy-key \
npm run pwa:release
```

---

## Design System

Follow `docs/visual-style-guide.md`. Key enforced rules:

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-forge-teal` | `#0D9488` | `#0D9488` | Brand teal, active states, icons, progress, selected states |
| `--primary` | `#0F766E` | `#0D9488` | Solid semantic primary surfaces where text contrast matters |
| `--color-spark-amber` / `--accent` | `#F59E0B` | `#FBBF24` | Trust scores, notifications, highlights |
| `--background` | `#F1F4F1` | `#0B0F0E` | Body background and floating navigation bases |
| `--color-canvas` | `#F7F8F4` | `#111716` | Main page and long-session reading surfaces |
| `--card` / `--popover` | `#FFFEFA` | `#18201E` | Cards, menus, dialogs, elevated panels |
| `--input` | `#EEF2ED` | `#202927` | Text fields, selects, radios, tactile controls |
| `--color-ink` | `#1C1F1D` | `#F2F5F1` | Headings and body text |
| `--color-slate-muted` | `#68756F` | `#A4B2AC` | Secondary text, captions, placeholders |

- Do not introduce new hue families or fonts. Use semantic tokens and opacity modifiers for lighter teal when needed.
- Teal and amber must not exceed 15% of any screen surface.
- Do not introduce gradient blobs, abstract shapes, or decorative SVG fills as backgrounds.
- Use Inter through `--font-sans`; minimum font size is 12px; body line-height is 1.4-1.6.
- Use Lucide React icons. Default stroke: `1.5` at 20-24px, `2` at 16px. Add another icon package only when Lucide cannot represent the icon well. Never use emojis as icons.
- Cards use `rounded-2xl`; pills/avatars use `rounded-full`; never use `rounded-none` on user-facing interactive elements.

---

## MCP Design and Research Stack

Preferred MCP stack: **21st.dev**, **Chrome DevTools MCP**, **Context7**, **Firecrawl**, and **sequential-thinking**. Use them to improve research, planning, implementation, and verification; never let external snippets or references override this file, `docs/visual-style-guide.md`, or local architecture.

| MCP | Use when | Can do | Limits |
| --- | --- | --- | --- |
| **21st.dev (`21dev`)** | Component-level inspiration for cards, forms, dialogs, tables, sidebars, wizards, onboarding, profiles, dashboards, or empty states. | Search UI examples, return React snippets, refine focused components, fetch brand logos. | Inspiration only. Convert to TeamForge tokens, shadcn/Radix, Lucide, and accessibility expectations. |
| **Chrome DevTools MCP** | Inspect a running page, debug runtime behavior, or verify UI quality. | Screenshots, accessibility snapshots, console/network inspection, interaction checks, viewport emulation, Lighthouse-style audits, performance traces. | Requires a running app or reachable URL. Pair browser signals with code inspection. |
| **Context7** | Need current library docs or API examples. | Resolve docs/examples for React, TanStack, Tailwind, shadcn/ui, Radix, Framer Motion, RHF, Zod, Zustand, ky, Vite, etc. | Documentation support, not product/design truth. Do not send secrets or large private code excerpts. |
| **Firecrawl** | Live web research, competitor/reference analysis, scraping, site mapping, or structured extraction. | Search, scrape, map, crawl bounded sites, extract JSON, run research agents, monitor pages when requested. | Results can be incomplete, blocked, stale, or off-brand. Prefer official sources for technical decisions. |
| **sequential-thinking** | Complex, ambiguous, high-risk, or multi-step work needs careful planning. | Break down problems, compare approaches, track assumptions, revise plans. | Reasoning aid, not evidence. Still read code, verify sources, and run local checks. |

UI workflow: read local code and design docs, use sequential-thinking for complex planning, use 21st.dev/Firecrawl for inspiration, Context7 for API details, implement with TeamForge conventions, then verify rendered behavior in Chrome DevTools when it matters.

## Agentic Lead Development

TeamForge uses an agentic lead flow for broad refactors, quality sweeps, research-heavy work, and multi-surface implementation. The current session remains accountable for the final patch: delegate for speed, but merge only changes that fit this repo and pass review.

Default loop:

1. Classify the work before spawning agents: frontend UI/state, backend contract/API, runtime/debugging, refactor/readability, quality sweep, documentation, or visual review.
2. Establish local context first with code inspection. For broad work, run `npm run agent:health`; use `npm run agent:pack` when workers need a compact repo context bundle.
3. Use `node scripts/quality/intelligence.mjs` when Fallow plus React Doctor diagnostics should guide prioritization. Treat those tools as indicators, not truth; fix only findings that represent real product or maintainability risk.
4. Split work into isolated bundles with non-overlapping file ownership. Good slices are feature folders, script families, API/client contracts, PWA/runtime, or docs/config. Avoid assigning multiple workers to the same files unless one is explicitly reviewing the other.
5. Give workers bounded prompts: objective, relevant paths, constraints from this file, expected output, and the smallest useful verification. Ask for findings or patches, not broad rewrites.
6. Review worker output before applying it. Preserve behavior, UI appearance, routing, API contracts, env handling, and TeamForge copy/design rules unless the task explicitly changes them.
7. Verify with the smallest relevant command. Use `npm run check:changed` for ordinary code/doc changes, `npm run check:local` or `npm run check:pr` for larger changes, and `npm run check:release` or `npm run pwa:release` only when the release/PWA surface is affected.
8. Do not commit unless the user explicitly asks. When asked to commit, use the Conventional Commit rules below.

Routing expectations:

- Manual Codex flow is preferred for small, sensitive, or tightly coupled edits where one accountable editor is safer.
- Direct OpenCode agents are suitable for focused implementation, research, review, or visual alternatives.
- Oh My OpenAgent/team mode is suitable for broad multi-file work that benefits from planner, worker, reviewer, and visual roles.
- Use GPT-class models for implementation, architecture, backend contracts, security, debugging, and risky refactors. Use Gemini-class visual agents for UI generation, layout alternatives, screenshot critique, and multimodal inspection only.
- Do not send secrets, private env values, auth tokens, billing details, or large private code dumps to external agents or research tools.

## Skill Bundle Governance

- Treat `.agents/skills/` as a mixed local plus bundled skill library.
- `AGENTS.md` and any `teamforge-*` skill override generic bundled skills on conflict.
- Specialist bundled skills are opt-in, not default. Use them when the user explicitly asks for that specialty or when the task is primarily about that specialty.
- Use `teamforge-agent-driven-pipeline` before broad, ambiguous, multi-agent, OpenCode, Oh My OpenAgent, model-routing, or quality-orchestration work.
- For routine TeamForge work, prefer this order: `repo-grounded-implementation-engineer`, `frontend-product-ui-engineer`, the relevant `teamforge-*` wrapper, then stack-specific helpers such as `tanstack-query-best-practices`, `zod`, `zustand`, `shadcn-ui`, `react-19`, `playwright-best-practices`, or `pwa-development`.
- For backend/API contract work, prefer this order: `system-design-api-data-architect`, the relevant `teamforge-backend-*` wrapper, then stack-specific helpers. This repo contains the frontend and a copy of the backend contract; do not claim backend implementation changes unless the backend files are actually present.
- Broad design bundle skills such as `frontend-design`, `impeccable`, and `ui-ux-pro-max` are reference tools for explicit design exploration or critique. They are not the default path for everyday TeamForge product UI implementation.
- Never let bundled skill guidance override TeamForge rules on fonts, color tokens, copy constraints, routing, `apiClient`, TanStack Query ownership, PWA behavior, or realtime session handling.

---

## Code Conventions

- Use `@/` path alias instead of relative `../../` imports.
- Use named component exports except at route/page level.
- Use `import type { Foo }` for type-only imports.
- Do not add inline styles. Use Tailwind utilities and avoid arbitrary values when the 4px scale works.
- Use `gap-*` for flex/grid spacing; do not use `space-*` or mix margins with gap on the same element.
- Do not add `useMemo`/`useCallback` by default. Use them only for stable dependency boundaries, external subscriptions, expensive derived values, or APIs that require referential stability.
- Clean up timers, subscriptions, animation frames, observers, and DOM listeners.

---

## Validation

- Do not add frontend tests unless the user explicitly asks.
- For small changes, run `npm run check:changed` before handing work back.
- Do not run `npm run build`, full `npm run lint`, tests, audits, or full-system commands for ordinary changes. Use them only for large refactors or changes that clearly need broad verification.

---

## Git and Commits

- When naming commits, use Conventional Commit format: `<type>: <message>`, such as `feat: add forge group invite step`.
- Keep commit messages lowercase, concise, and imperative. Use the most accurate type, including `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, or `test:`.

---

## Agent Artifacts

- Put generated audits, reviews, implementation notes, and migration plans in `reports/`.
- Put scratch files, temporary scripts, and one-off command outputs in `temp/`.
- Do not put agent-generated reports or temporary work in `docs/`; it is for durable human-maintained docs.
- `reports/` and `temp/` are git-ignored and should remain untracked.

---

## Product and Copy Constraints

- Do not use dating-app language in copy or identifiers: "match", "swipe", "like", "heart".
- Do not use gamification language in copy or identifiers: "level up", "achievement".
- Do not expose algorithm terminology to users: "k-NN", "cosine similarity", "MGS", "Euclidean distance".
- Do not display placeholder/mock statistics as live data.
- Do not write a single large page file; split into focused components, hooks, and utilities.

TeamForge speaks like a knowledgeable peer, never a corporation. Voice should be confident/direct for CTAs, encouraging during onboarding, affirming for personality results, celebratory when a group is formed, gentle but activating for empty states, and honest/constructive for errors.

Primary slogan: **"Find your people, intelligently."**

---

## Further Reading

- `docs/brand-overview.md` - brand concept, mission, values, logo usage
- `docs/visual-style-guide.md` - full color, type, spacing, component, and animation rules
- `docs/architecture-guide.md` - frontend architecture, routes, state, realtime, PWA notes
- `docs/api-data-models.md` - backend domain model and API contract guide
- `docs/open-api.yaml` - frontend copy of the backend OpenAPI contract
