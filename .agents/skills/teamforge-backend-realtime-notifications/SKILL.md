---
name: teamforge-backend-realtime-notifications
description: TeamForge backend realtime, notifications, and push delivery playbook. Use when changing Socket.IO events, rooms, presence, typing, chat read state, message events, plan/group event payloads, notification creation, web push subscriptions, service-worker messages, or event idempotency.
---

# TeamForge Backend Realtime And Notifications

Use this when backend behavior must reach live clients, notification inboxes, push subscriptions, or PWA resume refresh without duplicating or leaking events.

## Files To Open First

- `docs/api-data-models.md` Realtime Events section.
- `src/shared/schemas/realtime.ts` for exact client-validated event names and payload metadata.
- `src/app/runtime/app-realtime-events.ts` and `app-realtime-sync.tsx` for app-wide client handling.
- `src/features/activity/` and `src/features/group-plan-detail/` realtime hooks/handlers for route-local event ownership.
- `src/shared/api/query-invalidation.ts` and `src/app/runtime/pwa-authenticated-runtime.tsx` for event-to-cache and push/resume refresh expectations.
- `src/shared/schemas/web-push.ts` and `src/shared/hooks/use-web-push-subscription.ts` for push subscription contracts.

## Event Contract Rules

- Socket.IO namespace is `/realtime`; path is derived from API base path, local `/socket.io`, production `/teamforge/socket.io`.
- Authenticate sockets with the current access token and disconnect/reject unauthenticated sockets.
- Every persisted realtime event should include `eventId`, `occurredAt`, `entityKey`, and `entityVersion` when the frontend needs dedupe/order protection.
- App-wide events currently include `notification.new` and `group.updated`; chat/read/typing/presence/plan events are route-local unless multiple route surfaces need them.
- Do not emit private group, chat, plan, or profile payloads outside authorized rooms.
- Event payload schemas must stay compatible with `src/shared/schemas/realtime.ts`; adding a kind/reason requires frontend schema and handler updates.

## Notification And Push Decisions

- Create in-app notifications transactionally with the domain action that caused them when possible.
- Push delivery is best-effort; inbox notification state must remain the durable source of truth.
- Push subscription endpoints should handle unsupported/disabled VAPID state, duplicate endpoint refresh, disabled subscriptions, and stale/failing endpoints.
- Service-worker messages trigger frontend notification invalidation and PWA resume query refresh; backend notification routes should make those refreshes authoritative.
- Avoid notifying actors about their own action unless product copy explicitly expects it.

## Handoff Check

- Event room membership matches backend authorization and frontend route-local ownership.
- Event metadata allows `shouldApplyRealtimeEvent` to dedupe or ignore stale payloads.
- Notification, push, realtime, and cache invalidation all describe the same domain change.
- Failure of push delivery does not roll back the domain action unless the product explicitly requires that coupling.
