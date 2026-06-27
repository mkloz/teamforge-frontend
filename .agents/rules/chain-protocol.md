---
trigger: model_decision
description: "Use when a broad goal should be broken into reviewable, approval-gated steps, or when the task is too large or risky to execute safely in one response and each completed step should end with one suggested next step."
---

# Chain Protocol

Use this protocol when the user explicitly asks to work through a broad goal as a sequence of manageable tasks, or when a goal is too broad to execute safely in one response. The purpose is to keep scope reviewable, complete one useful slice at a time, and end each response by suggesting the next best step.

## Phase 1: Initialization

- Analyze the user's end goal and the relevant repo/product context.
- Briefly review the goal with practical concerns, dependencies, risks, and likely architecture.
- Propose the first logical task only.
- Pause and wait for approval before executing the first task.

## Phase 2: Execution Loop

Once the user approves the proposed task, usually by replying "next", "go", or with adjustments:

- Execute only the approved task.
- Keep the work grounded in the repo's current files, conventions, and verification rules.
- Report what changed and what was verified.
- End the response with one suggested next task.
- Pause for approval before starting that next task.

## Task Scoping Rules

- Tasks should be large enough to create meaningful progress, but small enough to review without losing the thread.
- Aim for a cohesive slice that touches a clear ownership area, produces roughly 200 to 600 lines of code, or takes about 2 to 3 minutes to mentally process.
- Split tasks by feature folder, route, API surface, form, state slice, or verification layer when possible.
- Do not bundle multiple complex steps just to finish faster.
- If the goal becomes too broad, re-scope the next task before continuing.

## Response Contract

- Do not skip ahead to unapproved later tasks.
- Do not ask the user to choose from a long menu unless there are genuinely several viable paths.
- End with `Suggested next step:` followed by one concrete next task, unless the chain goal is complete.
