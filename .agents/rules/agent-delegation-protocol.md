---
trigger: model_decision
description: "Use when work is broad, parallelizable, research-heavy, visually exploratory, or meaningfully benefits from different model strengths; avoid for small edits, secrets, billing, or tightly coupled changes where one careful editor is safer."
---

# Agent Delegation Protocol

Use this protocol when a task is broad, parallelizable, research-heavy, visually exploratory, or likely to benefit from different model strengths. The purpose is to save time and cost by routing bounded work to suitable agents while keeping the current session accountable for the final decision and patch.

Do not use this protocol for small edits, sensitive configuration, secrets, billing, auth tokens, tightly coupled changes, or work where one careful editor is safer.

## Startup

- Inspect the local repo context first. Do not delegate from a vague understanding.
- Classify the work: frontend UI/state, backend contract/API, runtime/debugging, refactor, quality sweep, docs, research, review, or visual critique.
- Check current agent/model availability before assuming a route exists.
- Smoke-test uncertain agents or models with a harmless "READY" prompt before assigning real work.
- Keep `AGENTS.md`, `.agents/rules/teamforge/`, and repo-local rules above external agent suggestions.

## Model Routing

- Use GPT-class models for implementation, architecture, backend contracts, auth/security, risky refactors, debugging, and final review.
- Use fast/cheap GPT-class models for scouting, summaries, issue grouping, narrow documentation passes, and low-risk utility work.
- Use Gemini-class visual or multimodal models for UI alternatives, screenshot critique, layout review, visual exploration, and generated design ideas.
- Use Context7 for current library/framework/API documentation.
- Use Firecrawl or web research only when live external evidence is useful.
- Do not route high-risk engineering to unverified free-tier or flaky models.

## Parallel Worker Rules

- Split work into non-overlapping file ownership areas or clearly separated deliverables.
- Give each worker a bounded prompt with objective, relevant paths, constraints, expected output, and minimum verification.
- Ask workers for findings, patches, alternatives, or reviews. Do not ask for broad rewrites without a clear acceptance gate.
- Do not send secrets, private env values, tokens, billing details, or large private code dumps.
- Prefer smaller parallel tasks over one vague mega-agent prompt.

## Lead Agent Responsibilities

- The current session remains the lead.
- Review every worker output before applying it.
- Resolve conflicts using repo evidence, tests/checks, and TeamForge product constraints.
- Apply final changes through the current workspace, not blindly from copied agent output.
- Run the smallest relevant verification after merging the work.
- Summarize which workers or model lanes were used and what their output changed.

## When To Stop Delegating

- Stop when the task has become small and local enough for direct editing.
- Stop when agents disagree because of missing evidence; gather the evidence instead of polling more agents.
- Stop when the cost, latency, or coordination overhead is larger than the work itself.
