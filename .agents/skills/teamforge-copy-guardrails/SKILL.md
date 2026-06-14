---
name: teamforge-copy-guardrails
description: TeamForge copy and naming review playbook. Use when editing user-facing copy, labels, empty states, CTAs, onboarding/results text, errors, notifications, settings labels, or product/domain identifiers where dating-app, gamification, or algorithm-language drift is possible.
---

# TeamForge Copy Guardrails: Review Playbook

Use this to make judgment calls, not to grep-and-replace the whole repo. The same words can be valid in code internals, docs, emoji metadata, regex variables, or backend contract fields but wrong in new user-facing product copy.

## Review The Changed Surface

- Check visible text, aria labels, toast text, notification text, empty states, button labels, settings labels, route error copy, and new identifiers.
- Prefer the surrounding feature's voice over a generic marketing tone.
- If broad scanning is useful, use `rg` on the changed files first and manually classify hits before renaming anything.
- Do not rename existing API fields, route IDs, schema fields, or documented backend concepts unless the task is a coordinated migration.

## Product Language Choices

- Prefer `group`, `people`, `fit`, `compatible`, `trust`, `plan`, `activity`, `invite`, `conversation`, and `Forge my group`.
- Avoid dating-app framing for new UX copy: `match`, `swipe`, `like`, and `heart`.
- Avoid game framing: `level up`, `achievement`, `leaderboard`, points-as-status, or reward loops.
- Avoid exposing algorithm internals to users: `k-NN`, `cosine similarity`, `Euclidean distance`, `MGS`, `exponential smoothing`, scoring jargon, or "the algorithm decided."
- For user-facing explanations, say what the product helps them do, not how the computation works.

## Nuanced Exceptions

- Existing internal terms such as route matching, regex matches, `matchMedia`, OpenAPI fields, and backend "matching" concepts are not automatic copy bugs.
- The Settings `matching` section and backend contract terms already exist; do not casually rename them from a copy-only task.
- Emoji picker metadata may include heart/love words because it describes Unicode emoji; do not treat that as product positioning unless the UI turns hearts into a TeamForge action pattern.
- Legal/privacy copy may mention compatibility or matching if it is explaining data use accurately; keep it plain and non-promotional.

## Voice Calibration

- CTAs: direct and confident.
- Onboarding: encouraging without overpromising.
- Personality/results: affirming, specific, and non-diagnostic.
- Group formed states: celebratory, but grounded in the plan.
- Empty states: gentle, activating, and honest about what can happen next.
- Errors: constructive, specific enough to recover, and never blamey.

## Handoff Check

- New user-facing copy avoids banned framing unless there is a documented exception.
- Identifiers do not create dating-app or gamification concepts that future UI will inherit.
- Copy does not present placeholder/mock metrics as live data.
- Error and empty-state text gives the user a next action when one exists.
