---
trigger: model_decision
description: "Use for high-stakes claims, architecture decisions, broad research, product strategy, security-sensitive reasoning, or plausible-but-unproven explanations where independent critique and evidence checks reduce hallucination risk."
---

# Consensus Review Protocol

Use this protocol for high-stakes claims, architecture decisions, broad research, product strategy, security-sensitive reasoning, or any idea where independent critique would reduce hallucination risk and widen the explored area.

The purpose is not to vote. The purpose is to expose weak assumptions, missing evidence, alternative interpretations, and hidden risks before acting.

For TeamForge-specific factual verification, pair this with `.agents/rules/teamforge/evidence-review.md`.

## When To Use

- The user explicitly asks for consensus, critique, adversarial review, or multiple AI opinions.
- A decision depends on external facts that may be current, niche, or easy to misremember.
- A proposed architecture or plan has meaningful blast radius.
- A research summary could be biased by a narrow search path.
- A bug explanation is plausible but not yet proven by code, logs, or tests.

## Reviewer Setup

- Use at least two independent reviewers when tools/models are available; use three when the decision is high-impact.
- Assign different roles, such as skeptic, domain specialist, implementation reviewer, visual reviewer, or research verifier.
- Give each reviewer the same concise brief, the current hypothesis, relevant local paths or source links, known constraints, and the exact critique requested.
- Ask reviewers to identify unsupported assumptions, likely failure modes, missing sources, edge cases, and stronger alternatives.
- Keep prompts secret-safe: no tokens, private env values, billing details, or unnecessary private code dumps.

## Evidence Rules

- Local repo files, official documentation, reproducible commands, and direct source evidence outrank model opinions.
- For current library/API behavior, use Context7 or official documentation.
- For live web claims, use Firecrawl or web search and cite sources in the final synthesis when relevant.
- For TeamForge claims, use `.agents/rules/teamforge/evidence-review.md` to classify claims and evidence priority.
- If reviewers disagree, do not average the answers. Identify which claims are evidence-backed and which remain uncertain.
- If evidence is missing, state the uncertainty and choose the smallest next check.

## Synthesis Contract

- Summarize agreement, disagreement, and newly discovered risks.
- Name the decision or recommendation and why it follows from the evidence.
- Preserve minority objections when they reveal real risk.
- Do not present consensus as proof.
- End with the next verification or implementation step when the work should continue.
