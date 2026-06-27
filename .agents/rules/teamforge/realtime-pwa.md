---
trigger: model_decision
description: "Use when changing TeamForge frontend realtime, Socket.IO session sync, event handlers, PWA runtime, service-worker messages, web push, app badges, diagnostics, resume/reconnect refresh, offline UX, or download/install behavior."
---

# TeamForge Realtime And PWA: Runtime Playbook

Use this for runtime coupling that crosses features. Realtime, PWA refresh, notification badges, and offline behavior share session, visibility, network, query, and diagnostic paths.

## Files To Open First

- `src/shared/api/realtime-client.ts` for namespace URL, socket path derivation, auth token sync, handler replay, and connect callbacks.
- `src/app/runtime/app-realtime-sync.tsx` for route-aware realtime startup, idle import, focus/online/pageshow/visibility reconnect, and cleanup.
- `src/app/runtime/app-realtime-events.ts` for app-wide `notification.new` and `group.updated` handlers.
- `src/app/runtime/pwa-runtime.tsx` for service-worker registration, update/offline toasts, install prompt capture, launch-source cleanup, and offline banner.
- `src/app/runtime/pwa-authenticated-runtime.tsx` for service-worker messages, badge counts, reconnect refresh, resume query invalidation, and cooldowns.

## Realtime Event Placement

- App-wide events belong in `app-realtime-events.ts` only when multiple routes need the same cache/UI effect.
- Chat, read, typing, presence, plan, and route-specific group events stay inside `activity` or `group-plan-detail` hooks.
- Validate payloads with shared realtime schemas before touching cache.
- Use `shouldApplyRealtimeEvent` before applying server-pushed changes, so old or duplicate events do not regress local state.
- If an event affects multiple surfaces, reuse shared invalidation helpers or feature realtime handlers instead of hand-invalidating random keys.

## Session And Lifecycle Safety

- Realtime connects only from an authenticated session token and disconnects on missing token, page hide, or cleanup.
- Preserve socket URL rules: `/realtime` namespace and socket path derived from `VITE_API_URL` with `/api/v*` stripped.
- When adding listeners, return unsubscribe functions and verify they run on effect cleanup.
- Reconnect and PWA resume refresh paths are cooldown-protected; do not add parallel focus/online handlers without checking the existing cooldown variables.

## PWA Runtime Decisions

- Service-worker push or notification-click messages should invalidate notification surfaces and resume queries only after authentication is known.
- Add query keys to `PWA_RESUME_QUERY_KEYS` only for active surfaces that need refresh after push, reconnect, app foreground, or page restore.
- Keep user-facing install diagnostics in `/download`; runtime should capture prompts, updates, offline status, badges, and refresh mechanics.
- Regenerate icons only when the task explicitly asks for PWA asset regeneration.

## Handoff Check

- Realtime still starts lazily and only for authenticated realtime routes.
- Event payloads are parsed, deduplicated, and scoped to app-wide or route-local ownership.
- Focus, online, pageshow, visibility, service-worker message, and socket reconnect paths do not double-refresh aggressively.
- Diagnostics and telemetry calls still describe the runtime reason for refresh/update behavior.
