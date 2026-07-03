# ADR 0002: Shared Navigation Contracts

## Status

Accepted

## Context

Navigation helpers were spread across feature internals while being consumed by other product surfaces. Notification destination resolution, app shell actions, home cards, group plan detail, Activity banners, profile actions, and onboarding flows all need route contracts that are broader than one private feature implementation.

Moving those helpers into `src/app/` would create the wrong dependency direction because features must not import app composition. Keeping them in feature internals keeps cross-feature coupling alive.

## Decision

Feature-independent navigation contracts live in `src/shared/navigation/`.

This seam may contain:

- route builders
- route-search parsers and serializers
- auth return target helpers
- notification destination route types
- stable navigation constants that do not depend on feature implementation

`src/shared/navigation/` must stay narrow. It may know route paths and serializable search state, but it must not import feature components, feature schemas, feature stores, TanStack Query objects, or app runtime wiring.

Existing feature route modules may temporarily re-export shared navigation helpers while callers migrate. If a route helper requires feature-owned constants, schemas, query state, or UI behavior, keep that logic in the feature public seam until it can be made feature-independent.

## Consequences

- Notification routing and cross-feature navigation can stop importing feature internals.
- Features can build product routes without depending on `src/app/`.
- Route behavior becomes easier to review as a product contract.
- `src/shared/navigation/` is not a generic utility drawer; route-aware UI behavior remains in the owning feature or app router.
