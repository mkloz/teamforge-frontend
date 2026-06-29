# ADR 0002: Shared Navigation Contracts

## Status

Accepted

## Context

Navigation helpers are currently scattered across feature internals. Notification destination resolution, app shell actions, home cards, group plan detail, Activity banners, and profile actions all need to build routes that belong to product-level navigation rather than one private feature implementation.

Moving those helpers into `src/app/` would be the wrong dependency direction because features must not import app composition. Keeping them in feature internals keeps cross-feature coupling alive.

## Decision

Create `src/shared/navigation/` for feature-independent navigation contracts:

- route builders
- route-search parsers and serializers
- auth return target helpers
- notification destination route types

`src/shared/navigation/` must stay narrow. It may know route paths and serializable search state, but it must not import feature components, feature schemas, feature stores, TanStack Query objects, or app runtime wiring.

Existing feature route modules may temporarily re-export shared navigation helpers while callers migrate.

## Consequences

- Notification routing and cross-feature navigation can stop importing feature internals.
- Features keep using navigation without depending on `src/app/`.
- Route behavior becomes easier to test and review as a product contract.
- If a route helper needs feature-owned constants or schemas, keep that logic in the feature public seam until it can be made feature-independent.
