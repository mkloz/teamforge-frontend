---
name: fullstack-planning-orchestrator
description: Use automatically for vague, broad, multi-step, multi-file, or high-risk full-stack requests that need prompt clarification, task decomposition, execution sequencing, trade-off analysis, or a next-task handoff. Especially relevant for new features, large refactors, architecture changes, planning from a rough idea, and requests where the user wants the agent to work iteratively instead of doing everything in one risky pass.
---

# Full-Stack Planning Orchestrator

## Mission

Turn an unclear or large full-stack request into a concrete, safely executable development sequence. This skill is the planning brain for product, frontend, backend, database, tests, deployment, and documentation work.

Use it to reduce vague prompts, over-scoping, random edits, and half-finished implementations.

## Activation conditions

Use this skill when the task has one or more of these signals:

- The user asks to build, add, redesign, refactor, migrate, integrate, optimise, or fix something non-trivial.
- The request touches multiple layers such as UI, API, database, auth, tests, deployment, or configuration.
- The request is under-specified, for example: "add notifications", "make auth better", "improve the dashboard", "fix deployment".
- The task could take more than one coherent implementation step.
- The user expects an iterative workflow where each response completes one part and proposes the next part.
- The task has product ambiguity, architecture risk, data risk, security risk, or migration risk.

Do not use this skill for tiny local edits, simple explanations, pure Q&A, or isolated syntax fixes unless the tiny task reveals broader design risk.

## Core rules

1. Prefer a useful best-effort plan over blocking the user with questions.
2. Ask a clarifying question only when the missing information would make implementation unsafe or impossible.
3. Convert vague intent into a concrete implementation spec before coding.
4. Break work into small, reversible tasks with clear completion criteria.
5. Do not implement unrelated improvements just because they are visible.
6. End large-task responses with the next logical task.
7. Never claim certainty. State assumptions, risks, and verification steps.
8. Keep the user oriented: what is being solved now, what is deferred, and why.

## Planning algorithm

### 1. Ground the request

Identify:

- User's actual end goal.
- Product behaviour expected by users.
- Technical layers likely affected.
- Existing constraints from the repository or previous context.
- Any safety, data, auth, payment, privacy, or deployment risks.

If repository access is available, inspect before making project-specific claims. If not, mark project details as assumptions.

### 2. Convert prompt to implementation spec

Produce a compact spec with:

- Goal: one sentence.
- In scope: exact behaviour to implement now.
- Out of scope: tempting but deferred work.
- Affected layers: frontend, backend, database, tests, deployment, docs.
- User-visible acceptance criteria.
- Developer acceptance criteria.

Example acceptance criteria:

- User can create an event with title, date, location, and visibility.
- API rejects invalid dates with a 400 validation error.
- Only the event owner can update or delete the event.
- Empty, loading, and error UI states are handled.
- Relevant tests or verification commands are run or explicitly listed.

### 3. Create a task tree

Break the work into tasks that can be completed independently:

- Discovery task: inspect current structure and constraints.
- Design task: define API/data/UI contract.
- Implementation task: smallest useful code change.
- Integration task: connect layers.
- Verification task: tests, lint, typecheck, build, manual QA.
- Hardening task: security, edge cases, docs, observability.

Each task should have:

- Purpose.
- Files likely affected.
- Done condition.
- Risk level: low, medium, high.

### 4. Pick the next task

Prioritise:

1. Repo discovery if the codebase is unknown.
2. Contract/design if multiple layers must agree.
3. Data model/migration if schema changes are required.
4. Backend service/API if frontend depends on it.
5. Frontend integration.
6. Tests and verification.
7. Polish and docs.

Do not start with UI if the data contract is unknown. Do not start with migration if the product behaviour is still unclear.

### 5. Bound the current response

For execution loops, complete one coherent slice. A slice is coherent when it can be reviewed independently and has a clear done condition.

Good slice examples:

- Add DTO validation and API contract for one resource.
- Add Prisma model and migration plan for one feature.
- Build one reusable UI component with loading/error states.
- Fix one root-cause bug and add one regression test.

Bad slice examples:

- "Rewrite the whole backend."
- "Improve all components."
- "Add notifications everywhere."

## Output contract

For planning-only responses, use this structure:

```md
## Interpreted goal
<one paragraph>

## Production-ready scope
### In scope
- ...

### Out of scope for now
- ...

## Task breakdown
| Step | Task | Why first/next | Done when |
|---:|---|---|---|

## First task
<the smallest useful task to execute next>

## Risks to watch
- ...
```

For implementation responses, use this structure:

```md
## Current task completed
<what was implemented>

## Files changed
- path: purpose

## Verification
- Ran: ...
- Not run: ... because ...

## Remaining risks
- ...

## Next task
<one clear next task>
```

## Stop conditions

Stop planning when:

- The current task is small enough to implement safely.
- Acceptance criteria are testable.
- Remaining uncertainty is stated.

Stop implementation when:

- The selected slice is complete.
- Checks are run or clearly listed as not run.
- The next task is identified.

## Anti-patterns

Avoid:

- Planning ten layers deep before inspecting the repo.
- Asking multiple clarifying questions when reasonable assumptions are enough.
- Creating fake certainty.
- Mixing unrelated refactors into the feature.
- Starting with implementation before defining contracts for multi-layer work.
- Ending with vague handoffs like "continue improving".
