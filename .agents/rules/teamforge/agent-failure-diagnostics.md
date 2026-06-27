---
trigger: model_decision
description: "Use after repeated agent failures, context drift, tool confusion, instruction drift, hallucinated repo claims, bad delegation loops, or any workflow failure that needs diagnosis instead of another retry."
---

# TeamForge Agent Failure Diagnostics

Use this after repeated agent failures, context drift, tool confusion, bad delegation loops, hallucinated repo claims, or when a workflow needs to be improved rather than merely retried.

This rule adapts the useful parts of `interleaved-thinking` without depending on private chain-of-thought. Analyze observable behavior: prompts, tool calls, outputs, errors, diffs, checks, and missed instructions.

## When To Use

- The same blocker or mistake repeats across multiple turns.
- An agent edits before reading the relevant repo context.
- A worker ignores TeamForge rules, changes unrelated files, or invents architecture.
- Tool calls show confusion about shell, browser, MCP, plugin, or file-editing capabilities.
- A broad agent run produces conflicting, low-evidence, or unreviewable output.
- Context compaction or long work causes the original goal to drift.

Do not use this as normal planning overhead for straightforward tasks.

## Observable Trace To Capture

- Original user goal and any later corrections.
- Active repo constraints from `AGENTS.md` and relevant `.agents/rules/teamforge/` playbooks.
- Tools called, commands run, and failures.
- Files touched and whether they matched the intended scope.
- Verification attempted and actual results.
- Final answer claims that were unsupported or contradicted by evidence.
- Where the agent stopped making meaningful progress.

Do not ask models to reveal hidden reasoning. Do not store private chain-of-thought in repo files.

## Failure Patterns

- **Context degradation:** important constraints disappear after long work or compaction.
- **Tool confusion:** wrong tool for the job, wrong shell assumptions, or invalid tool arguments.
- **Instruction drift:** the agent follows generic skill advice over TeamForge rules.
- **Goal abandonment:** the agent reports progress without satisfying the latest user request.
- **Circular action:** repeated searches, retries, or reviews without new evidence.
- **Premature closure:** final answer before implementation, verification, or diff review.
- **Over-delegation:** worker orchestration costs more than direct editing.
- **Evidence inversion:** model opinion overrides local files, official docs, or command output.

## Recovery Loop

1. Restate the latest user request in one sentence.
2. Name the repeated failure pattern.
3. Identify the smallest missing evidence or decision.
4. Choose one recovery action:
   - inspect a specific file,
   - run one focused command,
   - narrow the scope,
   - update a rule,
   - ask one necessary question,
   - stop delegation and edit directly.
5. Resume with the relevant TeamForge playbook.
6. If a reusable lesson emerges, update `.agents/rules/teamforge/` rather than adding a one-off note elsewhere.

## Output Shape

```md
## Failure Pattern
- ...

## Evidence
- ...

## Recovery Action
- ...

## Rule Update Needed
- yes/no, path if yes
```

## Red Flags

- Retrying the same failed command without reading the error.
- Spawning more agents to resolve missing local evidence.
- Making a new broad plan when the next action is a narrow file check.
- Updating rules based on one-off confusion that does not generalize.
