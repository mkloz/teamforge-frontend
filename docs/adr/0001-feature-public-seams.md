# ADR 0001: Feature Public Seams

## Status

Accepted

## Context

Findafew uses feature colocation under `src/features/<feature>/`, but feature folders are only useful boundaries when their internals stay private. The frontend refactor plan identified cross-feature imports of route helpers, query helpers, UI actions, and domain utilities as a source of hidden coupling.

The architecture guide already says feature internals should not be imported across features. The missing decision record is the explicit public seam vocabulary and the migration path that lets the codebase move gradually instead of through one large folder reshuffle.

## Decision

Each feature owns its internals by default. Cross-feature imports must use one of these boundaries:

- `src/features/<feature>/public/*` for narrow feature-owned contracts.
- `src/shared/navigation/*` for feature-independent route and route-search contracts.
- `src/shared/*` for genuinely reusable feature-agnostic primitives.

Feature public seams expose only stable contracts another feature needs: route-facing helpers, query summaries, action entry points, public types, or projections. They must not become broad barrels that export a whole feature.

Allowed examples:

```ts
import { getActivityChatSummaryOptions } from "@/features/activity/public/activity-chat-summary-query";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
```

Disallowed examples:

```ts
import { ActivityBaseQueryFactory } from "@/features/activity/api/query-factory/activity-base-query-factory";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
```

Temporary re-export shims are acceptable during migration when they keep a refactor reviewable. Each shim should have an obvious removal point once callers have moved to the public seam.

## Consequences

- Feature internals can be renamed or split without surprising unrelated callers.
- Large features such as Activity can expose a small public contract before any folder reshaping.
- Dependency enforcement can start as advisory and become blocking after violations are migrated.
- Public seams need active review; if a seam starts exporting arbitrary internals, move the behavior back into the owning feature or promote only the genuinely shared contract.
