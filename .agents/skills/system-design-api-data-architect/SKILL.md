---
name: system-design-api-data-architect
description: Use automatically for backend architecture, API contracts, data modelling, Prisma/database schema changes, auth/authorization boundaries, service design, migrations, transactions, validation, error models, and cross-layer contracts between frontend and backend. Especially relevant before implementing new resources, complex CRUD, search/filtering, payments, notifications, tickets, calendar/event systems, user-generated content, or any feature that changes persistent data.
---

# System Design, API, and Data Architect

## Mission

Design full-stack contracts that are stable, secure, testable, and maintainable before code is written. This skill prevents mismatched frontend/backend assumptions, weak database schemas, unsafe migrations, and authorization gaps.

## Activation conditions

Use this skill when the task involves any of these:

- New API endpoint, route, controller, resolver, or server action.
- New database table/model/collection, relation, index, enum, migration, or seed data.
- Changes to auth, roles, permissions, ownership, access control, sessions, JWT, cookies, OAuth, or user identity.
- Request/response DTOs, validation schemas, Zod/class-validator schemas, OpenAPI docs.
- Search, filtering, sorting, pagination, caching, idempotency, or transactions.
- Data lifecycle: create/update/delete/archive/restore/expire.
- Multi-step workflows such as checkout, ticket purchase, invite flow, notifications, bookings, calendar events, or file processing.

Do not use this skill for purely visual frontend changes unless they depend on backend/data contracts.

## Design principles

1. Start from user behaviour, not database tables.
2. Define the contract before implementing both sides.
3. Treat authorization as part of the contract, not a later middleware detail.
4. Make invalid states hard to represent.
5. Prefer boring, explicit models over clever abstractions.
6. Design migrations to protect existing data.
7. Model failure cases as deliberately as success cases.
8. Keep the first version simple, but avoid choices that block obvious next steps.

## Workflow

### 1. Behaviour definition

Clarify:

- Who performs the action?
- What resource changes?
- What is visible to whom?
- What can fail?
- What must be atomic?
- What should be idempotent?
- What data must be auditable?

### 2. Domain model

Define entities and relationships:

- Resource names.
- Ownership model.
- Required fields.
- Optional fields.
- Enums/state machines.
- Unique constraints.
- Foreign keys and cascade behaviour.
- Created/updated/deleted timestamps.

Check for invalid states:

- Can a child exist without a valid parent?
- Can a resource have two owners?
- Can a status transition skip required steps?
- Can duplicate records be created by double-clicking or retrying?
- Does deletion break historical data?

### 3. API contract

For each endpoint/action, define:

- Method and path.
- Auth required or public.
- Required permission/ownership rule.
- Request params/query/body.
- Response body.
- Success status code.
- Error status codes.
- Validation rules.
- Pagination/filter/sort behaviour if relevant.

Use conventional HTTP status codes:

- `200` successful read/update.
- `201` successful creation.
- `204` successful deletion with no body.
- `400` invalid input.
- `401` unauthenticated.
- `403` authenticated but not allowed.
- `404` not found or intentionally hidden.
- `409` conflict/duplicate/invalid state transition.
- `422` semantically invalid when the project already uses it.
- `429` rate limited.
- `500` unexpected server failure.

### 4. Validation contract

Validation must be consistent across layers:

- Frontend form schema.
- Backend DTO/schema.
- Database constraints.
- API documentation/types.

Validation checklist:

- Required vs optional.
- Empty string handling.
- Min/max length.
- Numeric ranges.
- Date/time timezone rules.
- Enum values.
- File size/type when relevant.
- Cross-field validation.
- Normalization: trim, lowercase, slugify, sanitize.

### 5. Authorization contract

For every action, specify:

- Public, authenticated, owner-only, role-based, or system-only.
- Whether `404` should hide existence from unauthorized users.
- Whether list endpoints filter by ownership automatically.
- Whether nested resources inherit parent permissions.
- Whether admin/moderator actions need audit logging.

Common full-stack bugs to prevent:

- Frontend hides a button but backend allows the action.
- User can update another user's resource by changing an ID.
- List endpoint leaks private records.
- File URL exposes private uploads.
- Role check exists on update but not delete.

### 6. Database and Prisma review

For relational schemas, check:

- Correct cardinality: one-to-one, one-to-many, many-to-many.
- Required vs optional relation fields.
- `onDelete` behaviour: restrict, cascade, set null.
- Indexes for common filters, ownership, foreign keys, search fields, and sorting.
- Unique constraints for natural uniqueness.
- Composite indexes for common query patterns.
- Migration safety for existing data.
- Backfill strategy for new required columns.

Prisma-specific checklist:

- Use `select` when only a subset is needed.
- Avoid over-fetching with broad `include`.
- Use transactions for multi-write workflows.
- Use `connect` only after permission checks.
- Avoid relation filters that produce surprising counts.
- Check generated Prisma Client implications after schema changes.
- Keep DTO types separate from raw Prisma input types when security matters.

### 7. Transactions and concurrency

Use transactions or guards when:

- Multiple writes must succeed/fail together.
- Creating dependent records.
- Updating inventory, tickets, balance, counters, booking slots, or quotas.
- Enforcing one active item per user/resource.
- Retrying requests could create duplicates.

Consider:

- Unique constraints as final protection.
- Idempotency keys for external/payment-style workflows.
- Optimistic concurrency if stale updates matter.
- Database-level constraints over app-only assumptions.

### 8. Error model

Errors should be predictable:

```json
{
  "message": "Human readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```

Follow the existing project format if one exists. Do not introduce a second error shape unnecessarily.

### 9. Test matrix

For each contract, define tests:

- Valid success case.
- Invalid input.
- Unauthenticated request.
- Unauthorized user.
- Not found.
- Conflict/duplicate.
- Edge case around dates/status/ownership.
- Transaction rollback if relevant.

## Output contract

When designing before implementation:

```md
## Contract summary
<short explanation>

## Data model
- Entity:
- Relations:
- Constraints/indexes:

## API contract
| Method | Path | Auth | Request | Response | Errors |
|---|---|---|---|---|---|

## Authorization rules
- ...

## Validation rules
- ...

## Migration notes
- ...

## Test cases
- ...
```

When reviewing an existing design:

```md
## Verdict
Safe / Needs changes / Risky

## Critical issues
1. ...

## Recommended changes
1. ...

## Acceptance criteria
- ...
```

## Red flags

Pause and call out risk when you see:

- Schema changes without migration/backfill plan.
- User-controlled IDs used without ownership checks.
- Required columns added to existing tables without defaults.
- Cascade delete on valuable historical data.
- Money, ticket, booking, or inventory logic without transactions.
- Search/filter endpoint with no pagination.
- API returns raw internal models containing private fields.
- Frontend and backend validation are different.
- Auth status depends only on client-side checks.
