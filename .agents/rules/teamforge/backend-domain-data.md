---
trigger: model_decision
description: "Use when changing or reviewing TeamForge persistent domain models, Prisma/data invariants, Forge groups, memberships, plans, proposals, chats, friendships, invites, ratings, trust, interests, migrations, indexes, or transactions."
---

# TeamForge Backend Domain Data

Use this for persistent model and workflow changes. The danger is not just a bad table; it is breaking the product invariant that groups, plans, chats, invites, ratings, and trust move together.

## Files To Open First

- `docs/api-data-models.md` core domain models and workflow endpoints.
- `docs/architecture-guide.md` backend service boundaries, conceptual matching flow, and trust model.
- `docs/open-api.yaml` for exact DTOs and enums.
- `src/shared/schemas/enums.ts`, `activity.ts`, `group-api.ts`, `plan.ts`, `chat-api.ts`, `friendship-api.ts`, `rating-api.ts`, and `notification.ts`.
- Feature contracts such as `src/features/forge/lib/forge-contract.ts`, `src/features/activity/lib/activity-contract.ts`, and `src/features/group-plan-detail/schemas/group-plan-detail.schema.ts`.

## Core Invariants

- Group size is 2-8 and must stay consistent across Forge request, group max members, membership rules, and UI display.
- Activity, group, plan, chat, and membership creation for successful Forge should be atomic.
- Manual and auto Forge flows have different state transitions; do not let retry/double-click create duplicate groups or chats.
- A group membership change affects group detail, activity feed, home, explore, chat access, invitations, notifications, and realtime events.
- Plan proposals are state machines. Votes, approval/rejection, withdrawal, and plan updates must preserve history and eligible-voter counts.
- Trust ratings are post-activity, rater/ratee-scoped, and should be idempotent or conflict-protected per group relationship.
- Friendship/blocking affects direct chat, profile visibility, invites, notifications, and matching/search candidates.
- Interest hierarchy changes can affect onboarding, explore filters, activity creation, and matching; preserve slug/alias stability.

## Database And Transaction Review

- Use unique constraints for one membership per active group/user, one direct chat per user pair, one rating per rater/ratee/group where applicable, and one active push subscription per endpoint/user if backend supports it.
- Add indexes for ownership filters, membership joins, unread/message ordering, notification reads, active sessions, explore filters, and matching candidate queries.
- Use transactions for Forge, invite accept, join/open request approval, disband/leave/remove member, plan proposal approval, rating submission, and account deletion.
- Prefer soft-delete/status transitions for user-visible history such as messages, groups, plans, invites, and notifications unless product policy explicitly removes data.
- Backfill and deploy migrations safely: nullable first, backfill, enforce not-null/unique, then update application logic.

## Handoff Check

- New states and enum values are reflected in backend DTOs, OpenAPI, frontend Zod schemas, and copy.
- Multi-write workflows are transactional and idempotent enough for retries.
- Cache invalidation and realtime events cover every surface affected by the model change.
- Migration notes explain existing data, indexes, backfills, and rollback risk.
