---
trigger: model_decision
description: "Use for broad, ambiguous, multi-agent, model-routing, OpenCode, Oh My OpenAgent, MCP-selection, UI-generation routing, verification-strategy, or quality-orchestration work in TeamForge."
---

# TeamForge Agent-Driven Pipeline

Use this before broad, ambiguous, multi-agent, or model-routing work in TeamForge. Keep the pipeline evidence-based: inspect the repo, verify available providers, and route work by model strengths rather than novelty.

## Ground Rules

- Treat `AGENTS.md`, `.agents/rules/teamforge/`, and local repo conventions as higher priority than external examples.
- Use GPT as the default engineering workhorse unless a task clearly benefits from Gemini visual/multimodal strengths.
- Use Gemini for UI generation, visual exploration, screenshots, layout critique, multimodal inspection, and quick visual alternatives.
- Do not route core implementation, security review, backend contracts, auth, migrations, or high-risk refactors to unverified free-tier models.
- Never put secrets, API keys, tokens, or billing details into prompts, reports, screenshots, or skill files.
- Verify configured models with tiny smoke prompts before adding them to active routing.

## Pipeline

1. Classify the task.
   - Backend/API/data/auth: use `system-design-api-data-architect`, relevant TeamForge backend playbooks, then implementation/review agents.
   - Frontend/product UI: use `frontend-product-ui-engineer`, relevant TeamForge playbooks, then visual/UI agents only for design alternatives or critique.
   - Debugging/build/runtime: use `debugging-protocol.md`; reproduce before changing code.
   - Refactoring/readability: use `repo-grounded-implementation-engineer` and `code-refactoring`; preserve behavior first.
   - Quality sweep: use `quality-intelligence.md` before changing files based on tool output.
   - UI quality/review: use `ui-quality-gate.md` for visual, accessibility, responsive, and rendered verification.
   - Research/docs/API syntax: use Context7 for library docs and Firecrawl/web only when current external evidence is needed.

### Decision Matrix

| Work type | Primary lane | Model bias | Verification |
| --- | --- | --- | --- |
| Backend contracts, auth, Prisma/data, security | Direct OpenCode or Codex manual | GPT high | Typecheck/test or targeted backend check |
| Frontend state/data/query/forms | Direct OpenCode or Codex manual | GPT high | `npm run check:changed`, route smoke if needed |
| UI generation, layout alternatives, visual critique | Direct `ui-designer` or OMO visual category | Gemini 3.5 Flash | Chrome/Playwright screenshot and a11y snapshot |
| Quick visual option scanning | Direct `visual-scout` | Gemini 3.1 Flash Lite | Human review or screenshot comparison |
| Broad multi-step orchestration | OMO `hephaestus`/`sisyphus`/`atlas` | GPT, with Gemini only for visual subwork | OMO completion plus local checks |
| Code review / risk pass | Direct `reviewer` or OMO `oracle` | GPT high | Findings with file/line evidence |
| Quality intelligence | Manual Codex or focused reviewer | GPT high | `quality-intelligence.md` plus local evidence |
| Library/API docs | Codex + Context7 | Current docs over model intuition | Source link or doc excerpt |
| Live page/debugging | Chrome DevTools / Playwright | Tool evidence first | Console/network/screenshot evidence |

2. Pick the execution lane.
   - Direct OpenCode agents: use for focused, reliable one-agent tasks.
   - OMO agents: use for broader orchestration, team mode, planning plus execution, or background task completion enforcement.
   - Manual Codex flow: use when the current Codex session has richer local tools, app connectors, or direct workspace context.

3. Route by model strength.
   - `gpt-5.5 high`: implementation, architecture, review, debugging, backend contracts, complex frontend state, risky refactors.
   - `gpt-5.5`: general research/synthesis and normal engineering.
   - `gpt-5.5-fast`: scouting, summaries, title/compaction, low-risk utility work.
   - `gemini-3.5-flash`: UI generation, visual-engineering, artistry, multimodal-looking, screenshot/page critique.
   - `gemini-3.1-flash-lite`: quick visual scouting and cheap first-pass aesthetic feedback.
   - Avoid `gemini-3.1-pro-preview` unless a smoke test proves the active key can run it.

4. Select MCPs deliberately.
   - Context7: current docs for React, TanStack, Tailwind, shadcn/ui, Radix, Framer Motion, Zod, Zustand, ky, Vite, Prisma/Nest docs.
   - Chrome DevTools / Playwright: rendered UI, console/network, screenshots, accessibility snapshots, interaction checks.
   - Firecrawl / websearch: live web research, competitor/reference pages, public docs discovery.
   - grep.app / ast-grep / LSP: code intelligence and safe search.
   - sequential-thinking: only for complex planning and tradeoff tracking; still verify with code and tests.

5. Execute in small loops.
   - Read local context first.
   - Ask agents for bounded outputs: findings, plan, patch, review, or UI alternatives.
   - Apply changes through the current coding agent, not blindly from subagent text.
   - Run the smallest relevant verification (`npm run check:changed`, smoke prompt, targeted tests, screenshot, or API probe).
   - Escalate to broader checks only when the blast radius justifies it.
   - If agents repeat the same failure pattern, stop and use `agent-failure-diagnostics.md`.

## Current TeamForge Routing

Use this as the expected local setup unless `opencode.jsonc` or `oh-my-openagent.json` has changed:

- Direct engineering: `implementer`, `architect`, `reviewer`, `researcher`, `general` on GPT.
- Direct fast utility: `scout`, `summary`, `title`, `compaction` on GPT fast.
- Direct visual: `ui-designer` on Gemini 3.5 Flash; `visual-scout` on Gemini 3.1 Flash Lite.
- OMO core: `sisyphus`, `hephaestus`, `oracle`, `prometheus`, `metis`, `momus` on GPT high; `atlas` on GPT medium.
- OMO visual: `multimodal-looker`, `visual-engineering`, and `artistry` on Gemini 3.5 Flash.

Config files:

- Direct OpenCode: `~/.config/opencode/opencode.jsonc`
- OMO model routing: `~/.config/opencode/oh-my-openagent.json`
- Optional OMO TUI sidebar: `~/.config/opencode/tui.json`
- Provider auth: `~/.local/share/opencode/auth.json`

These are user-level OpenCode files outside the repo. Do not hard-code machine-specific absolute paths in repo-local documentation or skills.

If the setup is uncertain, run:

```powershell
npx opencode mcp list
npx oh-my-openagent doctor
npx opencode run --agent ui-designer "Say READY and do not edit files."
npx opencode run --agent architect "Say READY and do not edit files."
```

## Updating The Pipeline

1. Inspect available providers first:

```powershell
npx opencode providers list
npx opencode models
```

2. Smoke-test a model before routing to it:

```powershell
npx opencode run --model provider/model "Say READY and do not edit files."
```

3. Update direct OpenCode for focused agents and OMO config for team/orchestrated agents. Keep names aligned with purpose; avoid reserved or confusing agent names.

4. Re-verify:

```powershell
npx opencode run --agent architect "Say READY and do not edit files."
npx opencode run --agent ui-designer "Say READY and do not edit files."
npx oh-my-openagent run --agent multimodal-looker --json "Say READY and do not edit files."
npx oh-my-openagent doctor
```

5. Clean hanging failed model probes by process id only. Never kill broad `node`, `cmd`, or browser processes with loose patterns.

## Team Mode

Turn on OMO/team mode when the work benefits from role separation: planning plus execution, independent review, visual critique plus implementation, or broad multi-file cleanup. Keep direct OpenCode/Codex manual flow for small fixes, sensitive config, secrets, billing checks, or changes where one accountable editor is safer.

## When To Read The Reference

Read `model-routing-notes.md` when updating OpenCode/OMO config, changing provider subscriptions, evaluating team mode, or explaining why a model is assigned to a role.
