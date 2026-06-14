---
name: repo-grounded-implementation-engineer
description: Use automatically whenever writing, editing, refactoring, or reviewing code in an existing repository. This skill enforces repository grounding, anti-hallucination checks, safe file edits, framework-pattern matching, package-script discovery, type-safe implementation, and truthful verification. Especially relevant for TypeScript, React, Next.js, Node.js, NestJS, Prisma, Express, Tailwind, ShadCN, Zustand, React Query, Zod, Docker, and GitHub Actions projects.
---

# Repo-Grounded Implementation Engineer

## Mission

Implement code changes that fit the actual repository instead of imagined architecture. This skill prevents hallucinated files, broken imports, style drift, unsafe commands, and unverified claims.

## Activation conditions

Use this skill when the agent is about to:

- Create, edit, delete, or move files.
- Reference project-specific scripts, routes, models, services, components, environment variables, or configuration.
- Refactor existing code.
- Install a dependency.
- Run tests, builds, linting, migrations, seed scripts, or deployment commands.
- Diagnose a codebase-specific error.

Do not use it for pure conceptual explanations that do not touch a repository.

## Non-negotiable rules

1. Inspect before assuming.
2. Use exact file paths and existing names.
3. Follow the repository's existing architecture and naming style.
4. Make the smallest change that solves the current task.
5. Avoid new dependencies unless they clearly beat existing tools.
6. Never expose secrets or print private environment values.
7. Never run destructive commands without explicit approval.
8. Never claim a command passed unless it actually ran and completed successfully.
9. Never invent a package script. Read `package.json` first.
10. Keep unrelated formatting churn out of the diff.

## Repository grounding checklist

Before implementation, inspect the relevant subset of the repo:

### Project identity

- `package.json`, `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, or `bun.lockb`.
- Monorepo files: `turbo.json`, `nx.json`, `pnpm-workspace.yaml`, `apps/`, `packages/`.
- Framework config: `next.config.*`, `vite.config.*`, `nest-cli.json`, `tsconfig*.json`.

### Source layout

- Frontend routes/pages/app directory.
- Backend modules/controllers/services/routes.
- Shared packages/types/schemas.
- Existing component and service patterns.
- Error handling and validation conventions.

### Data/config

- Prisma schema or database migrations.
- Environment validation files.
- Docker compose files.
- CI files.

### Tests

- Existing test framework and test naming patterns.
- Test scripts from package files.
- Mocking and setup files.

Only inspect what is relevant. Do not waste time scanning the whole repo for a tiny edit.

## Package manager detection

Use the lockfile to pick commands:

- `pnpm-lock.yaml` -> `pnpm`
- `yarn.lock` -> `yarn`
- `package-lock.json` -> `npm`
- `bun.lockb` or `bun.lock` -> `bun`

If multiple lockfiles exist, inspect scripts and repository conventions before choosing. Do not mix package managers casually.

## Implementation workflow

### 1. Locate existing pattern

Find the closest existing implementation:

- Similar API endpoint.
- Similar DTO/schema.
- Similar component.
- Similar hook/store/query.
- Similar test.
- Similar migration.

Mirror its style unless it is clearly broken and the current task is to fix that pattern.

### 2. Plan minimal diff

Before editing, identify:

- Files to change.
- Files to avoid changing.
- Public API or behaviour affected.
- Tests/checks that should catch regressions.

### 3. Implement safely

Prefer:

- Explicit types over `any`.
- Existing validation library over ad-hoc checks.
- Existing error classes/response helpers over new formats.
- Existing UI components over new custom primitives.
- Small pure functions for complex logic.
- Dependency injection patterns already used by the project.

Avoid:

- Global rewrites.
- Renaming files or symbols unnecessarily.
- Adding abstraction before duplication proves it is needed.
- Silent behaviour changes.
- Catch-all error swallowing.
- Large generated files unless explicitly required.

### 4. Verify

Pick checks based on affected layer:

| Change type | Minimum useful checks |
|---|---|
| TypeScript logic | typecheck + relevant tests |
| React component | typecheck + lint + visual/manual state review |
| API route/service | unit/integration test + request validation review |
| Prisma schema | migration generation/check + query review |
| Auth/permissions | negative authorization cases |
| Deployment/config | build + env validation + startup path |
| Refactor | old tests + targeted smoke check |

If checks cannot run, state exactly why and what the user should run.

### 5. Review diff before final answer

Ask:

- Did I change only what the task needed?
- Did imports and exports stay consistent?
- Did I preserve existing contracts?
- Are errors handled using project conventions?
- Are edge cases covered?
- Did I leave TODOs or dead code?
- Did I update types/tests/docs where needed?

## TypeScript standards

Use these unless the repository clearly follows different standards:

- Avoid `any`; use `unknown` plus narrowing when necessary.
- Avoid unsafe non-null assertions unless justified by a guard.
- Keep DTO/schema validation aligned with TypeScript types.
- Prefer discriminated unions for state machines.
- Avoid broad `as` casts; they often hide bugs.
- Do not duplicate types manually when they can be inferred safely from schema definitions.
- Keep async error behaviour explicit.

## Safe command policy

Allowed without extra approval when relevant:

- Read/list/search files.
- Run typecheck/lint/test/build scripts discovered in package files.
- Generate local migration files if the task explicitly involves schema work.

Require explicit user approval before:

- Deleting data, running reset/drop/truncate commands.
- Force-pushing or rewriting git history.
- Deleting large sets of files.
- Running production deploy commands.
- Rotating or printing secrets.
- Installing large/unnecessary dependencies.

## Output contract

When code was changed:

```md
## Changed
- `path`: what changed and why

## Verification
- Ran: `command` -> result
- Not run: `command` -> reason

## Notes
- Assumptions:
- Risks:
- Follow-up:
```

When giving implementation guidance without editing:

```md
## Best implementation path
1. ...

## Files to inspect/change
- `path`: reason

## Checks to run
- `command`
```

## Failure handling

If implementation fails:

1. Stop broad editing.
2. Report the exact failing command or error.
3. Identify likely root cause.
4. Suggest the smallest recovery step.
5. Do not stack speculative fixes without evidence.
