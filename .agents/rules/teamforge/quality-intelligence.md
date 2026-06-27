---
trigger: model_decision
description: "Use for TeamForge broad quality sweeps, refactor prioritization, dead-code cleanup, duplication review, complexity hotspots, changed-code risk, architecture-boundary review, or interpreting Fallow/React Doctor diagnostics."
---

# TeamForge Quality Intelligence

Use this for broad quality sweeps, refactor prioritization, dead-code cleanup, duplication review, complexity hotspots, changed-code risk, architecture-boundary review, or when Fallow/React Doctor output should guide work.

This rule adapts `fallow` for TeamForge. Treat tools as triage signals, not as automatic change requests.

## When To Use

- The user asks for a quality sweep, code health review, cleanup plan, refactor target, or PR risk pass.
- Work spans multiple feature folders or shared architecture.
- A proposed deletion or refactor needs import/export/blast-radius evidence.
- `npm run agent:health`, `npm run agent:pack`, or `node scripts/quality/intelligence.mjs` is relevant.

Do not run broad quality tooling for tiny edits unless the user asks.

## Preferred Commands

- `npm run agent:health` for broad local health context before delegating or sweeping.
- `npm run agent:pack` when workers need a compact repo context bundle.
- `node scripts/quality/intelligence.mjs` when Fallow plus React Doctor diagnostics should guide prioritization.
- `npm run check:changed` for ordinary verification after edits.
- `npm run check:local` or `npm run check:pr` only when blast radius justifies broader checks.

If using raw Fallow commands, follow the bundled `fallow` skill. In this repo, prefer existing npm scripts first.

## Interpretation Rules

- Confirm every finding against local code before editing.
- Separate product risk from cleanup opportunity.
- Prefer changed-file and hot-path risks over low-impact cosmetic cleanup.
- Do not remove exports, files, dependencies, or routes without tracing live usage and scripts.
- Do not treat complexity scores as a mandate for abstraction; refactor only when it improves maintainability without changing behavior.
- Do not mix broad cleanup with feature work unless the cleanup directly reduces risk for that feature.
- Put generated reports in `reports/`; put scratch outputs in `temp/`.

## Prioritization

High priority:

- Auth/session/security boundary risk.
- Runtime, PWA, or realtime behavior that can break active users.
- API contract/schema/cache drift.
- Route guard or canonical URL bugs.
- Dead code that hides duplicate implementations of active behavior.
- Complexity in frequently changed or high-blast-radius shared files.

Medium priority:

- Feature-local duplication that blocks a current change.
- Stale suppressions or unused exports with clear trace evidence.
- Components that repeatedly violate TeamForge UI/accessibility patterns.

Low priority:

- Pure style churn.
- Refactors that only satisfy a metric.
- Large migrations without user-facing or maintenance payoff.

## Review Workflow

1. Define the sweep boundary: feature folder, shared API, PWA/runtime, route layer, or docs/config.
2. Gather tool signals only inside or relevant to that boundary.
3. For each candidate, inspect files manually and classify risk.
4. Batch changes by ownership area.
5. Verify with the smallest relevant command.
6. Report skipped findings and why they were not worth changing.

## Output Shape

```md
## Quality Findings
| Priority | Finding | Evidence | Action |
| --- | --- | --- | --- |

## Changes Made
- `path`: ...

## Verification
- Ran: ...

## Deferred
- ...
```

## Red Flags

- Auto-fixing tool output without reading the affected code.
- Deleting a dependency because imports are absent while scripts or generated tooling still use it.
- Moving feature code across boundaries and creating cross-feature imports.
- Reporting a quality score as product truth.
- Running release-scale checks for a small markdown or feature-local edit.
