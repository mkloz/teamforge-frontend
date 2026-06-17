# Model Routing Notes

## Sources Checked

- OMO installer help, local package `oh-my-openagent 4.10.0`: provider priority is Native > Copilot > OpenCode Zen > Z.ai > Kimi > Bailian > MiniMax > Vercel.
- OMO docs/search results: core order emphasizes Sisyphus, Hephaestus, Prometheus, and Atlas; explicit config wins.
- OpenCode agents docs: primary agents can have explicit models; subagents may inherit when not configured.
- Local smoke tests in this workspace: Gemini 3.5 Flash and 3.1 Flash Lite work with the free-tier key; Gemini 3.1 Pro Preview returned 429 or hung.

## Practical Interpretation

OMO's ideal stack is provider-diverse:

- Claude native / OpenCode Zen Claude for top orchestration when available.
- GPT for reliable coding, implementation, review, and high-risk engineering.
- Gemini for visual, UI, multimodal, and creative design work.
- Kimi/Z.ai/other providers as specialty or fallback routes when credentials exist and smoke tests pass.

This TeamForge setup currently has working OpenAI and Google providers, plus MCPs. It does not have verified Claude, Kimi, or OpenCode Zen paid access. Therefore, keep GPT as the engineering default and use Gemini for visual/UI lanes.

## Smoke Test Policy

Before assigning a model to an active route:

```powershell
npx opencode run --model provider/model "Say READY and do not edit files."
```

If the model times out, returns 429, or logs billing/provider errors, do not configure it as a default. Keep it as a manual experiment only.

## Safe Billing Rules

- Do not click billing, buy credits, set up auto-reload, upgrade, or payment confirmations from browser tools unless the user explicitly asks.
- API key validity is not enough; generation can still fail because of quota, project billing tier, or prepay balance.
- Prefer free-tier Gemini models only for bounded visual/UI support, and keep paid GPT routes for core engineering.
