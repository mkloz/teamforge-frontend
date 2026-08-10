# Findafew frontend agent guide

This file is the repository-level source of truth for work in `frontend/`.
Prefer it over generic framework advice. Read the narrow rule or skill named
below only when it applies to the task.

## Product and stack

Findafew helps people form small groups around real activity plans. The
frontend is a React 19 + TypeScript + Vite PWA using TanStack Router, TanStack
Query, React Hook Form, Zod, Zustand, Tailwind CSS v4, Radix/shadcn primitives,
Socket.IO, and Vitest/Playwright.

## Working agreement

- Inspect the existing route, feature, shared primitives, and rendered state
  before changing a product surface.
- Make the requested change directly when scope is clear. Do not require a
  discovery interview for ordinary implementation or polish work.
- Preserve unrelated user changes in a dirty worktree.
- Do not commit unless the user explicitly asks.
- Add new dependencies only when the existing stack cannot solve the problem
  cleanly.
- Keep generated screenshots, audits, reports, and scenario artifacts under
  ignored `temp/` or `reports/` paths; never commit screenshot archives.
- Use current code and generated contracts as evidence. If guidance disagrees
  with them, update the stale guidance rather than coding to fiction.

## Architecture boundaries

- `src/app/` owns providers, the authenticated shell, route guards, and global
  runtime effects.
- `src/features/<feature>/` owns feature API adapters, query options, hooks,
  components, schemas, routes, and local state.
- `src/shared/` contains genuinely cross-feature primitives, contracts, hooks,
  schemas, and utilities.
- Cross-feature imports must use the target feature's `public/` seam or an
  intentional shared navigation contract. Do not reach into another feature's
  internal `api/`, `components/`, or `lib/` folders.
- TanStack Query owns server state. Zustand is for durable cross-page client
  state, not copied API responses. Use URL search state for shareable filters,
  pagination, and modes.
- Parse external data at the boundary and keep query keys, invalidation, and
  optimistic rollback feature-local.
- Authorization is enforced by the backend. UI guards improve navigation but
  are never a security boundary.

## UI contract

Read `docs/visual-style-guide.md` for visual work and
`.agents/rules/findafew/copy-guardrails.md` for product copy. In particular:

- Build mobile-first, then verify representative tablet and desktop widths.
- Prefer a clear hierarchy, compact density, and intentional whitespace over
  generic cards, nested boxes, or divider-heavy layouts.
- Use shared grouped-menu, input, button, notice, collapsible, drawer, and
  modal primitives before creating one-off variants.
- Use gaps to separate grouped items when that is the established pattern.
  Avoid borders that stop midway through a component.
- Keep card surfaces darker than the page hierarchy expects; do not brighten
  dark-mode cards by default.
- Use icons sparingly. Unboxed icons inherit the adjacent text colour; reserve
  accent colours for status or icons with intentional backgrounds.
- Do not repeat information in headings, descriptions, badges, and detail
  rows. Remove labels when the value and icon are already unambiguous.
- Treat long copy, missing media, empty, loading, error, success, disabled,
  restricted, dense, and pagination states as part of the design.
- Preserve focus visibility, semantic controls, keyboard behavior, contrast,
  and touch targets.
- Motion should explain expansion, selection, navigation, or state change.
  Respect reduced motion and avoid blur-heavy transitions.

When the user supplies a screenshot, reproduce the underlying hierarchy and
behavior rather than copying incidental pixels. Verify the actual rendered
result after meaningful UI work.

## Scenario Mode

Scenario Mode is the frontend source of deterministic synthetic product states.
It must not depend on backend demo population seeds.

- Keep scenario implementation under `src/dev/scenarios/` and expose it to
  normal code only through the Vite virtual facade.
- Production builds must contain no scenario runtime, fixtures, activation
  query parameters, or scenario assets.
- Scenario projectors must return the real API shapes and reject unmatched
  requests instead of silently reaching the backend.
- Keep worlds deterministic, internally consistent, and stateful across
  mutations. Use overlays for meaningful boundaries rather than arbitrary
  object patches.
- Local UI states such as open drawers or focused validation errors should be
  reached through interaction recipes when practical.

## Research and decision analysis

Read `docs/research-workflow.md` before current web research, market or
literature research, or evidence-heavy product analysis.

- Firecrawl is local-only at `http://localhost:3002`. Run it exclusively through
  `node scripts/research/firecrawl-local.mjs <command>`. Never authenticate,
  call the hosted Firecrawl API, spend Firecrawl credits, or fall back to a
  hosted Firecrawl MCP, REST, or research-agent path. If the local service
  fails, report the coverage gap and stop that collection lane.
- Use the repository-local `last30days` skill for questions that depend on the
  latest 30 days of news, social discussion, adoption, or sentiment. Combine it
  with local Firecrawl primary-source collection when both current community
  signal and factual verification matter.
- For exhaustive or materially consequential research and for explicit deep or
  consensus analysis, use Consensus Mode: spawn three independent reviewer
  agents with distinct lenses, synthesize against a shared evidence pack, and
  resolve blockers by evidence rather than majority vote.

## Commands

Use the narrowest command that matches the change:

- `npm run dev` — local app.
- `npm test` — frontend unit tests.
- `npm run lint` / `npm run lint:fix` — full static checks or safe fixes.
- `npm run check:changed` — normal changed-file confidence gate.
- `npm run check:local`, `check:pr`, `check:release` — progressively broader
  verification.
- `npm run scenario:dev` — Scenario Mode development runtime.
- `npm run scenario:audit` / `scenario:audit:full` — deterministic visual
  matrices.
- `npm run pwa:release` — production PWA preflight, build, and QA.
- `npm run audit:release` / `audit:nightly` — browser quality audits.
- `node scripts/research/firecrawl-local.mjs <command>` — fail-closed local
  Firecrawl CLI.
- `npx impeccable update` — refresh the project-local unified Impeccable v4
  skill and its Codex design hook.

Do not add tests mechanically. Add or update them for risky behavior,
regressions, contracts, state machines, and logic that is cheaper to prove than
to inspect. Always report what was and was not verified.

## Focused rules

Rules in `.agents/rules/findafew/` are durable repository playbooks:

- `api-client-and-query.md` — API client, parsing, queries, mutations, caches.
- `forms-rhf-zod-query.md` — forms, validation, server errors, submission.
- `router-and-guards.md` — routes, guards, canonical search, route errors.
- `realtime-pwa.md` — Socket.IO, service worker, push, offline/resume behavior.
- `ui-quality-gate.md` — rendered visual, responsive, state, and a11y review.
- `copy-guardrails.md` — product language and user-facing voice.
- `debugging-protocol.md` — reproduction-first debugging.

## Skill routing

Repository skills are optional, progressively disclosed references. Use the
smallest set that matches the task; do not load the catalog as a checklist.
`AGENTS.md`, Findafew rules, current code, and generated contracts override
generic advice in a skill.

- Default product UI implementation: `frontend-product-ui-engineer`. Add
  `impeccable` only when the task explicitly calls for design exploration, a
  redesign, or a focused visual or copy review; follow its routed v4 workflow
  instead of loading standalone micro-skills.
- New visual direction: `impeccable`. Use `accessibility-a11y` for a11y review
  and `ui-animation` for purposeful motion. Treat `ui-ux-pro-max` and
  `web-design-guidelines` as secondary references, not competing design systems.
- Product copy: use the `impeccable` clarify workflow for comprehension and
  `humanizer` for final tone.
- Cinematic marketing or intentionally motion-led experiments: `gpt-taste`.
  Use it only when that direction is explicitly requested; experimental
  composition and motion never override Findafew's product UI, performance
  budget, accessibility, or the user's stated taste.
- React and state architecture: `react-dev`, `react-refactor`,
  `react-19`, `tanstack-query-best-practices`, `zustand`, `zod`,
  `shadcn-ui`, `tailwind-design-system`, and
  `vercel-react-best-practices`.
- Verification and platform concerns: `playwright-best-practices`,
  `pwa-development`, `seo-audit`, `fallow`,
  `improve-codebase-architecture`, and `system-design-api-data-architect`.
- Research: `firecrawl` for workflow selection, always executed through the
  local-only repository wrapper; `last30days` for recent community and news
  signals. Follow `docs/research-workflow.md`, including Consensus Mode for deep
  or high-consequence analysis.

Do not combine multiple broad design skills for one ordinary UI edit. Start
with the Findafew skill and add a specialist only when it contributes a
distinct workflow.

Do not restore the intentionally excluded generic orchestration, duplicate
global tooling, retired Impeccable v3 micro-skills, or generic
debugging/refactoring packs without a concrete repository need.
Impeccable v4 is managed by its own installer, not `skills-lock.json`.
