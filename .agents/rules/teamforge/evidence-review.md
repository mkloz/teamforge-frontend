---
trigger: model_decision
description: "Use when TeamForge factual accuracy matters: API/security claims, backend contract interpretation, release readiness, legal/privacy copy, current external facts, research summaries, or AI-generated conclusions that need source-backed verification."
---

# TeamForge Evidence Review

Use this when factual accuracy matters more than speed: API/security claims, backend contract interpretation, release readiness, legal/privacy copy, current external facts, research summaries, or any AI-generated conclusion that should be checked before acting.

This rule adapts `doublecheck` for TeamForge. It is lighter than a full research report, but stricter than ordinary confidence checking.

## When To Run

- The user asks to verify, double-check, cite, fact-check, or pressure-test a claim.
- A recommendation depends on current docs, provider behavior, pricing, policies, browser/PWA support, or third-party APIs.
- A change affects auth, sessions, authorization, web push, production env, CORS/cookies, OpenAPI contracts, or legal/privacy copy.
- A generated review mentions precise metrics, dates, versions, vulnerabilities, standards, legal requirements, or external services.
- Consensus review finds disagreement or an unsupported assumption.

Do not run this for every routine code edit. For local implementation, repo inspection plus `npm run check:changed` is usually the better verification path.

## Evidence Priority

1. Local source files, generated contracts, package scripts, and committed docs.
2. Official docs, specs, standards, or provider status/changelog pages.
3. Reproducible local commands and browser/devtools evidence.
4. Credible secondary sources when primary sources are unavailable.
5. Model opinion, only as a hypothesis.

When evidence conflicts, trust the highest-priority source and state the conflict.

## Claim Audit Loop

1. Extract verifiable claims.
   - Separate local repo claims from external factual claims.
   - Flag precise numbers, exact dates, version behavior, security statements, legal/privacy language, and "latest/current" claims.
2. Check local claims against files or commands.
   - Use `rg`, direct file reads, package scripts, OpenAPI, schemas, and route files.
   - Do not infer missing backend implementation from frontend contract files.
3. Check external claims against primary sources.
   - Use Context7 or official docs for library/API behavior.
   - Use Firecrawl/web search for live web facts, public docs discovery, competitor/reference research, or policy/current-state claims.
   - For OpenAI product/API questions, use official OpenAI docs only unless the user asks otherwise.
4. Adversarially review the result.
   - Ask what would make the claim wrong.
   - Look for fabricated citations, outdated docs, wrong-version examples, unsupported statistics, and overbroad security/legal conclusions.
5. Synthesize the finding.
   - Mark each important claim as verified, plausible, unverified, contradicted, or fabrication-risk.
   - Include source links when external sources were used.
   - Preserve uncertainty rather than smoothing it away.

## TeamForge-Specific Red Flags

- Claiming a backend behavior exists when only `docs/open-api.yaml` or frontend schema files are present.
- Treating hidden UI controls as authorization.
- Claiming realtime or PWA push behavior works without checking auth/session, service worker, event schema, and cache invalidation paths.
- Citing generic Tailwind/shadcn/UI guidance that conflicts with `docs/visual-style-guide.md`.
- Treating Fallow, React Doctor, Lighthouse, or model review as proof rather than prioritization evidence.
- Presenting placeholder/mock stats as product truth.

## Output Shape

For short checks:

```md
## Verification
- Verified:
- Plausible:
- Unverified or risky:
- Sources:
```

For high-risk checks, use a fuller report:

```md
## Evidence Review
- Decision:
- Highest-risk claim:

## Claims Checked
| Claim | Rating | Evidence |
| --- | --- | --- |

## Contradictions Or Gaps
- ...

## Next Verification Step
<one concrete command, file check, source, or review>
```

## Limits

- A source link is evidence, not certainty.
- A local command proves only the checked local state.
- Web sources can be stale, incomplete, or blocked.
- If the claim matters for production, pair evidence review with the relevant TeamForge playbook and the smallest local verification command.
