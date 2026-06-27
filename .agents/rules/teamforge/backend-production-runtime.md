---
trigger: model_decision
description: "Use when reviewing or changing TeamForge backend production readiness, environment variables, health checks, CORS/cookies, deployment paths, uploads, rate limits, request IDs, observability, Redis/PostgreSQL dependencies, web push, or PWA support."
---

# TeamForge Backend Production Runtime

Use this for backend changes that can work locally but fail in production because of paths, cookies, CORS, health, uploads, push, or observability.

## Files To Open First

- `docs/open-api.yaml` health, file-upload, auth, and web-push endpoints.
- `docs/architecture-guide.md` environment and production realtime path notes.
- `AGENTS.md` environment section for frontend `VITE_API_URL` expectations.
- `src/shared/api/api.ts` for timeout, credentials, refresh retry, and `x-request-id` handling.
- `src/shared/api/realtime-client.ts` for production Socket.IO path derivation.
- `src/features/download/components/pwa-diagnostics-panel.tsx` for backend push diagnostics surfaced to users.

## Runtime Contract

- Production frontend expects `VITE_API_URL=https://api.mkloz.com/teamforge/api/v1`; backend REST, refresh cookies, CORS, and Socket.IO path must agree with that base path.
- Realtime namespace remains `/realtime`; production socket path maps to `/teamforge/socket.io`.
- API responses and errors should include or propagate `x-request-id` for frontend telemetry and debugging.
- Health endpoints should separately reveal API, database, Redis, and frontend reachability status without leaking secrets.
- File upload endpoints must validate MIME, size, dimensions when relevant, private/public access, and storage failure behavior.
- Web push diagnostics must distinguish disabled backend push, missing VAPID config, unsupported browser, permission denied, and delivery failure.
- Rate limiting should protect auth, OTP, password reset, uploads, link preview, message send, web push test, and expensive Forge/search endpoints.

## Production Readiness Review

- CORS allows the deployed frontend origin and supports credentials where refresh cookies are used.
- Cookies use secure production attributes and do not break local development.
- Logs include request IDs and user/resource context without tokens, passwords, OTPs, refresh tokens, push keys, or full private payloads.
- Background jobs or queues are used for expensive notification/push/email work when user-facing latency would suffer.
- Database and Redis failures degrade predictably: health reports failure, auth refresh does not spin, realtime reconnect does not storm, and frontend gets parseable errors.

## Handoff Check

- Local and production base paths are both accounted for.
- Secrets and tokens are never printed or sent to frontend bundles.
- Health, telemetry, and request IDs can explain production failures.
- Rate limits, upload limits, and push diagnostics are covered before release.
