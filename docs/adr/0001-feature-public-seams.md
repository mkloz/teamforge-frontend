# ADR 0001: Feature Public Seams

## Status

Accepted

## Context

TeamForge uses feature colocation under `src/features/<feature>/`, but several features currently import another feature's internal modules. That makes folders look isolated while coupling them through route helpers, UI actions, query helpers, and domain utilities.

The architecture guide already says feature internals should not be imported across features. The missing piece is an explicit public seam vocabulary and a migration path that does not force a large all-at-once move.

## Decision

Each feature owns its internals by default. Cross-feature imports must use one of these boundaries:

- `src/features/<feature>/public/*` for narrow feature-owned contracts.
- `src/shared/navigation/*` for feature-independent route and route-search contracts.
- `src/shared/*` for genuinely reusable feature-agnostic primitives.

Feature public seams should expose only stable contracts that other features need. They must not become barrels that export everything from the feature.

Allowed examples:

```ts
import { getActivityChatSummaryOptions } from "@/features/activity/public/activity-chat-summary-query";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
```

Disallowed examples:

```ts
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
```

## Consequences

- Feature internals can be renamed or split without surprising unrelated callers.
- Large features such as Activity can still offer a small public contract before any folder reshaping.
- Dependency enforcement can start as advisory and later become blocking after violations are migrated.
- Temporary re-export shims are acceptable during migration, but they should have a clear removal point.
