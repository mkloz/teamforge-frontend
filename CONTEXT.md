# TeamForge Frontend Context

TeamForge is a React frontend for forming small, compatible groups around real-world activities. It targets students and young professionals who want to meet people through shared plans without scrolling, swiping, or random group selection.

## Domain Language

- **Forge**: the primary product action. A user asks TeamForge to form one compatible group.
- **Group**: the small set of people selected for a shared activity.
- **Plan**: the concrete activity proposal attached to a group.
- **Activity**: the app area for conversations, saved notes, group chat, direct chat, presence, typing, read state, and plan-related chat work.
- **Explore**: discovery for groups and people before a user joins or connects.
- **Home**: the authenticated dashboard and attention queue.
- **Profile**: user identity, preferences, social graph actions, and public user detail surfaces.
- **Onboarding**: required setup before the authenticated app is usable.
- **Public site**: the unauthenticated landing, download, privacy, and terms surfaces.

Avoid dating-app language such as "match", "swipe", "like", and "heart". Avoid gamification language such as "level up" and "achievement". Do not expose algorithm terms to users.

## Architecture Vocabulary

- **Feature internal**: any module under `src/features/<feature>/` that is not inside `public/`. It belongs to that feature only.
- **Feature public seam**: a narrow module under `src/features/<feature>/public/` that another feature may import. It should expose contracts, route-facing helpers, query summaries, or action entry points, not arbitrary internals.
- **Shared navigation contract**: a feature-independent route builder, route-search parser, or auth return helper under `src/shared/navigation/`. Navigation contracts are app product contracts, not private feature implementation.
- **Shared primitive**: reusable API, UI, hook, schema, store, or utility code under `src/shared/` that does not import features or app composition.
- **App composition**: providers, router creation, runtime side effects, and route guards under `src/app/` plus `src/router.tsx`.

## Import Direction

- `src/shared/*` must not import `src/features/*` or `src/app/*`.
- `src/features/*` must not import `src/app/*`.
- A feature may import its own internals.
- A feature importing another feature must use that feature's `public/` seam.
- Cross-feature navigation should prefer `src/shared/navigation/*`.
- App composition may import feature pages, feature public seams, and shared modules.

Temporary migration shims are allowed only when a refactor wave needs a safe transition. Shims should be removed once callers have moved to the new public seam.

## Refactor Priorities

The global refactor should first make interfaces explicit, then reshape large modules:

1. Establish feature public seams and shared navigation contracts.
2. Add advisory diagnostics for cross-feature internal imports.
3. Migrate route builders and notification destination logic to shared navigation.
4. Extract public-site shell modules from landing.
5. Split oversized feature modules by change reason.
6. Centralize duplicated backend command seams only where multiple features truly share a stable command.

Preserve auth, onboarding, realtime, PWA, API contracts, query cache behavior, and UI semantics during every wave.
