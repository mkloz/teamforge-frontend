---
name: teamforge-backend-auth-security
description: TeamForge backend auth, session, and authorization security playbook. Use when changing login, registration, Google OAuth, OTP, password reset, refresh tokens, cookies, sessions, ownership checks, rate limits, account deletion, or user privacy boundaries.
---

# TeamForge Backend Auth And Security

Use this when the backend change can decide who is authenticated, what they can see, or whether session state remains safe across web, PWA, and realtime.

## Files To Open First

- `docs/open-api.yaml` auth, users, sessions, health, upload, friends, groups, chats, and notifications paths.
- `docs/api-data-models.md` authentication and error sections.
- `src/shared/api/api.ts` for frontend refresh behavior, cookie-backed refresh, bearer headers, and unauthorized handling.
- `src/shared/api/auth-session.ts` and `src/shared/api/current-user-query.ts` for frontend session state expectations.
- `src/app/router/route-guards.impl.ts` for cached-current-user offline fallback and canonical redirect behavior.

## Backend Contract Expectations

- Access tokens are short-lived bearer tokens; refresh may use a stored refresh token or secure refresh cookie.
- `POST auth/refresh` must be safe for automatic retry after `401` and must not create refresh loops.
- `auth/logout`, session revoke, and revoke-others must invalidate refresh capability server-side, not just clear frontend state.
- Account activation, OTP verification, password reset, resend, and Google OAuth need rate limits and generic public error messages to avoid enumeration.
- Current-user reads and route guards assume `users/me` is authoritative for onboarding/profile completion and post-auth redirects.
- File upload, chat, group, plan, invite, friend, rating, and notification actions require backend membership/ownership checks; hidden resources should usually be `404`, not `403`.

## Authorization Review

- Identify the principal: current user, group member, group admin/moderator, message sender, invite recipient/sender, plan participant, or system job.
- Check list endpoints filter by accessible resources before pagination.
- Check nested IDs belong together, such as `messageId` within `chatId`, `planId` within `groupId`, and `proposalId` within `planId`.
- Check blocking/friendship state affects profile visibility, direct chat, invites, notifications, and search/explore where relevant.
- Check account deletion cascades or anonymizes safely and does not orphan private messages, ratings, sessions, or push subscriptions in unsafe states.

## Handoff Check

- Frontend refresh/auth-session behavior still matches backend token/cookie semantics.
- Public auth endpoints are rate-limited and avoid account enumeration.
- Every mutation has backend authorization independent of hidden UI controls.
- Session, push subscription, realtime, and route-guard behavior stay coherent after logout, revoke, delete account, or refresh failure.
