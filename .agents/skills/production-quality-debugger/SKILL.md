---
name: production-quality-debugger
description: Use automatically for bugs, failing tests, runtime errors, broken builds, deployment issues, environment/config problems, CI failures, performance regressions, dependency risk, security review, quality gates, and final pre-merge verification. Especially relevant when the user asks to debug, fix, review, harden, make production-ready, optimise, or verify a full-stack change.
---

# Production Quality Debugger

## Mission

Find root causes, fix them safely, and verify production readiness. This skill combines bug forensics, testing strategy, security review, performance review, environment diagnosis, and final quality gates.

## Activation conditions

Use this skill when the task involves:

- Error messages, stack traces, failing tests, broken builds, or unexpected behaviour.
- "It does not work", "fix this", "debug", "why is this happening".
- CI/CD, deployment, Vercel/Render/Railway/Docker/PM2, environment variables, build output, or startup issues.
- Security-sensitive areas: auth, permissions, secrets, CORS, cookies, file uploads, payments, user data.
- Performance: slow page/API/query, bundle size, N+1 queries, unnecessary renders, missing indexes.
- Final review before merge/deploy.
- Requests to make something "production ready".

Do not use this skill for early brainstorming unless the user is explicitly asking about risk/quality.

## Debugging rules

1. Reproduce or localise before fixing.
2. Prefer evidence over guesses.
3. Fix root cause, not just the symptom.
4. Make one hypothesis at a time.
5. After each fix, run the smallest relevant verification.
6. Add or recommend a regression test for non-trivial bugs.
7. If a command fails, read the failure; do not blindly retry.
8. Do not hide uncertainty. State remaining unknowns.

## Bug forensics workflow

### 1. Capture facts

Collect:

- Exact error message.
- Stack trace location.
- Reproduction steps.
- Expected vs actual behaviour.
- Recent changes if available.
- Environment: local/dev/prod/test.
- Inputs/data that trigger it.

### 2. Classify the bug

Common classes:

- Type/runtime mismatch.
- API contract mismatch.
- Validation mismatch.
- Auth/permission failure.
- Database relation/query issue.
- Async race condition.
- State management bug.
- Environment/config issue.
- Build/transpilation/module resolution issue.
- Deployment/startup issue.
- Dependency version incompatibility.

### 3. Trace the path

Follow the request/data path:

- UI event.
- Form validation.
- API client.
- Route/controller.
- Service/business logic.
- Database query/transaction.
- Response mapping.
- Cache/state update.
- UI render.

Stop at the first place where expected and actual diverge.

### 4. Hypothesis and minimal fix

For each hypothesis:

- What evidence supports it?
- What evidence would disprove it?
- What is the smallest code change to test it?
- What regression could this change cause?

Do not apply multiple speculative fixes at once unless they are clearly part of one root cause.

### 5. Regression test

Add or recommend a test when:

- The bug affected business logic.
- The bug could easily come back.
- The fix changes auth, data, validation, calculations, or state transitions.
- The bug was caused by an edge case.

## Testing strategy

Choose tests by risk:

| Area | Useful tests |
|---|---|
| Pure logic | Unit tests with edge cases |
| API service/controller | Integration tests with auth + validation |
| DB queries | Integration tests with realistic relations |
| React form | Component tests or manual form-state matrix |
| Critical user flow | E2E test or guided manual QA |
| Bug fix | Regression test proving the previous failure |
| Deployment/config | Build/startup/env validation smoke check |

Minimum production checks before handoff:

- Typecheck or build for TypeScript changes.
- Tests for changed business logic.
- Lint if the project uses it and changes are broad.
- Manual state review for UI changes.
- Migration review for schema changes.
- Security review for auth/user-data changes.

## Security review checklist

Apply when auth, data, files, secrets, user input, or deployment is involved:

### Auth and authorization

- Backend enforces permissions; UI-only checks are not security.
- Ownership checks exist on read/update/delete/list.
- Role checks are centralised or consistent.
- Sensitive resources are hidden with `404` where appropriate.
- Refresh/session logic avoids leaking tokens.

### Input and API

- All user input is validated server-side.
- IDs are checked for ownership, not just existence.
- Rate limits exist or are considered for expensive/abusable endpoints.
- Errors do not leak secrets, stack traces, or internal data in production.

### Files

- MIME/type and size are validated.
- Storage permissions are intentional.
- Private files are not exposed through public URLs.
- File names/paths cannot cause traversal or overwrite issues.

### Secrets and config

- No secrets are committed, printed, or included in client bundles.
- `.env.example` documents required variables without real values.
- Production config differs safely from development config.

### Database

- Raw queries are parameterised.
- Cascades do not delete valuable data unexpectedly.
- Sensitive fields are excluded from public responses.

## Performance review checklist

Check when pages/API/data feel slow or changes touch heavy paths:

### Frontend

- Avoid unnecessary global state updates.
- Avoid re-rendering large trees on every keystroke.
- Memoise only when there is a measured or obvious need.
- Use pagination/virtualisation for large lists.
- Avoid shipping heavy dependencies for small tasks.
- Keep images sized/lazy-loaded where appropriate.

### Backend/database

- Avoid N+1 queries.
- Use indexes for common filters/sorts/foreign keys.
- Paginate list endpoints.
- Select only needed fields.
- Cache only after correctness and invalidation are understood.
- Use transactions for multi-write workflows.

## Deployment/environment doctor

When deployment fails, inspect in this order:

1. Build command and output.
2. Start command and server entrypoint.
3. Node/package manager version.
4. Environment variables and validation.
5. Database connection/migrations.
6. File paths and case sensitivity.
7. Static assets/public path.
8. CORS/cookie/domain settings.
9. Platform-specific limitations.
10. Logs after startup.

Common deployment mistakes:

- Works locally because `.env` exists, fails remotely because env var is missing.
- Build script differs from dev script.
- Wrong output directory.
- Server binds to fixed port instead of platform port.
- Prisma client not generated.
- Migrations not applied.
- Frontend points to localhost in production.
- Cookies use wrong `secure`, `sameSite`, or domain settings.

## Final quality gate

Before saying the work is production-ready, check:

- Scope completed.
- Acceptance criteria met.
- Tests/checks run or honestly listed as not run.
- No secrets/log spam/debug leftovers.
- Error states handled.
- Auth/data access reviewed.
- Migration/deployment implications noted.
- No unrelated changes.
- Remaining risks stated.

## Output contract

For debugging:

```md
## Root cause
<evidence-based explanation>

## Fix
- `path`: change made/recommended

## Verification
- Ran: ...
- Result: ...

## Regression coverage
- Added/recommended:

## Remaining risks
- ...
```

For production readiness review:

```md
## Verdict
Ready / Almost ready / Not ready

## Blocking issues
1. ...

## Non-blocking improvements
1. ...

## Verification matrix
| Check | Status | Notes |
|---|---|---|

## Next safest action
<one concrete action>
```

## Red flags

Call out immediately:

- "Fixed" without reproduction or verification.
- Broad refactor while debugging.
- Auth/data bug without negative test case.
- Migration without rollback/backfill thought.
- Production deployment with unknown env vars.
- Performance claim without evidence or obvious reasoning.
- Security-sensitive change treated as UI-only.
