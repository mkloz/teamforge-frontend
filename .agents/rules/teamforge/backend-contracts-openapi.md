---
trigger: model_decision
description: "Use when adding, reviewing, or changing TeamForge backend REST contracts, OpenAPI paths, request/response DTOs, frontend Zod schemas, error envelopes, pagination, filtering, API adapters, or cache/realtime consequences."
---

# TeamForge Backend Contracts And OpenAPI

Use this when a backend change must line up with the frontend contract. In this frontend repo, `docs/open-api.yaml` is the exact backend contract copy; `docs/api-data-models.md` is helpful context but can lag.

## Files To Open First

- `docs/open-api.yaml` for exact paths, response schemas, status codes, tags, and generated endpoint metadata.
- `docs/api-data-models.md` for domain overview and endpoint intent.
- `src/shared/schemas/` for canonical frontend Zod schemas that validate backend responses.
- Target feature `api/` modules for command/query factory/cache conventions.
- `src/shared/api/api-errors.ts` and `src/shared/types/api-error.ts` for the error envelope the frontend actually parses.

## Contract Rules

- OpenAPI paths include `/api/v1`; frontend `apiClient` already uses a `/api/v1` base URL, so frontend adapters call paths without that prefix.
- Every backend response consumed by UI should have a matching Zod schema or feature mapper before it reaches components.
- Preserve the standard API error envelope: `status`, optional `message`, `timestamp`, `method`, optional `path`, optional `requestId`, plus the `x-request-id` header.
- Use cursor pagination for message history and infinite feeds; use page/limit only where the existing endpoint family already does.
- Keep validation semantics aligned across backend DTOs, OpenAPI, frontend schemas, and form schemas; do not silently widen one layer.
- Treat `docs/open-api.yaml` as generated or backend-owned. If backend code is not in this workspace, update frontend schemas/adapters only when the contract already supports it and call out backend follow-up separately.

## Endpoint Change Checklist

- Auth mode: public, authenticated, member-only, owner-only, admin/moderator, or system-only.
- Request shape: params, query, body, file upload, and normalization rules.
- Response shape: success status, nullable fields, timestamps, request IDs, and whether the response is authoritative for cache updates.
- Error model: 400 validation, 401 unauthenticated, 403 unauthorized, 404 hidden/not found, 409 conflict/state transition, 429 rate limit.
- Cache impact: which `APP_QUERY_KEYS` or invalidation helpers should update after mutation.
- Realtime impact: whether the mutation should emit an event or only rely on refetch.

## Handoff Check

- OpenAPI, frontend schema, and adapter agree on names, nullability, enum values, and date formats.
- New or changed mutations have explicit cache/realtime consequences.
- Error text can be mapped by `getApiErrorMessage` without leaking stack traces or internal reasons.
- If backend implementation was not present, the handoff names the exact backend contract work still required.
