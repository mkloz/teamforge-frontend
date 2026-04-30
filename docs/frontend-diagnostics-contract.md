# Frontend Diagnostics Contract

This document defines the current TeamForge frontend diagnostics model.

It exists for one reason: new features should plug into the same production-readiness seams instead of inventing their own logging, error boundaries, or mutation tracking.

## Source Of Truth

Use these files as the canonical implementation:

- [`src/shared/lib/telemetry-contract.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/shared/lib/telemetry-contract.ts:1)
- [`src/shared/lib/telemetry.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/shared/lib/telemetry.ts:1)
- [`src/shared/api/query-client.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/shared/api/query-client.ts:1)
- [`src/shared/components/route-error-state.tsx`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/shared/components/route-error-state.tsx:1)

`telemetry-contract.ts` is the naming contract.

`telemetry.ts` is the runtime helper layer.

`query-client.ts` is the central catch-all for React Query failures.

`route-error-state.tsx` is the route-level fallback surface.

## Global Capture

The app currently captures these failure classes globally:

- `window.error`
- `window.unhandledrejection`
- `query.error`
- `mutation.error`
- `route.error`

Those are emitted from:

- [`src/shared/providers/app-providers.tsx`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/shared/providers/app-providers.tsx:1)
- [`src/shared/api/query-client.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/shared/api/query-client.ts:1)
- [`src/shared/components/route-error-state.tsx`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/shared/components/route-error-state.tsx:1)

## Route Error Scopes

These are the current named route fallback scopes:

- `root`
- `auth.login`
- `auth.register`
- `auth.forgot-password`
- `auth.reset-password`
- `auth.activate-account`
- `activity`
- `forge`

These are wired in:

- [`src/router.tsx`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/router.tsx:1)

## Tracked Mutation Names

These are the explicit mutation outcomes currently tracked:

### Auth

- `auth.login.email`
- `auth.register.email`
- `auth.verify-email-otp`
- `auth.resend-email-otp`
- `auth.google`
- `auth.forgot-password`
- `auth.reset-password`
- `auth.activate-account`

### Activity

- `activity.message.send`
- `activity.message.edit`

### Forge

- `forge.auto`
- `forge.manual`

These are currently emitted from:

- [`src/features/auth/hooks/use-login-form.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/features/auth/hooks/use-login-form.ts:1)
- [`src/features/auth/hooks/use-register-form.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/features/auth/hooks/use-register-form.ts:1)
- [`src/features/auth/hooks/use-google-auth.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/features/auth/hooks/use-google-auth.ts:1)
- [`src/features/auth/forgot-password-page.tsx`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/features/auth/forgot-password-page.tsx:1)
- [`src/features/auth/reset-password-page.tsx`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/features/auth/reset-password-page.tsx:1)
- [`src/features/auth/activate-account-page.tsx`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/features/auth/activate-account-page.tsx:1)
- [`src/features/activity/hooks/use-activity-composer.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/features/activity/hooks/use-activity-composer.ts:1)
- [`src/features/forge/hooks/use-forge-wizard.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/features/forge/hooks/use-forge-wizard.ts:1)

## Event Shapes

The current analytics event names are:

- `client_error`
- `mutation_outcome`

### `client_error`

Expected fields:

- `scope`
- `errorName`
- `errorMessage`
- `errorStatus`
- `requestId` when the backend provided one
- optional contextual fields like `routeScope`, `queryKey`, `mutationName`, `conversationKind`, `selectedActivity`, `emailDomain`

### `mutation_outcome`

Expected fields:

- `mutation`
- `status`
- `requestId` when the successful mutation returned a backend request ID
- optional contextual fields like `intent`, `result`, `attachmentCount`, `hasReply`, `conversationKind`, `emailDomain`

## Current Failure Surfaces

The current user-visible failure model is intentionally split:

- Inline form/banner errors for `auth`, `settings`, and focused list actions like home invitations
- Toasts for quick multi-surface actions like explore joins, friend-request decisions, and proposal votes
- Route-level fallback cards for route crashes or render failures
- Optimistic recovery in `activity` where failed messages remain in-thread and can be retried

## Rules For New Features

When you add a new production-significant flow:

1. Add a named mutation key to [`telemetry-contract.ts`](/C:/Users/micha/Documents/petproject/teamforge-frontend/src/shared/lib/telemetry-contract.ts:1) if the action matters to product health.
2. Emit `trackMutationOutcome(..., "success" | "error")` at the feature seam when the flow is not already fully represented by a React Query mutation.
3. Call `captureException(...)` when the failure has debugging value beyond a local message.
4. Add a route error scope if the route is high value and should not fail into a blank screen.
5. Choose one user-facing failure surface on purpose:
   - inline message
   - toast
   - route fallback
   - optimistic failed state with retry

Do not add silent failures, raw `console.error` calls, or one-off analytics event names when an existing contract already fits.

## Gaps Still Worth Closing

The diagnostics model is useful now, but it is not complete.

The next likely additions are:

- explicit telemetry names for high-value `settings` mutations
- explicit telemetry names for `explore` joins and friend-request decisions
- route fallbacks for `home`, `explore`, and `settings` if those screens become more mutation-heavy
- backend request IDs propagated into every major success path too, not just error responses
