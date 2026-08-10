# Research and consensus workflow

Use this workflow for current web research, market or product research,
literature collection, and decisions that need evidence beyond the repository.
It is intentionally fail-closed for Firecrawl: Findafew research must never
consume hosted Firecrawl credits or fall back to the hosted Firecrawl API.

## Local-only Firecrawl policy

The Findafew Firecrawl service runs at `http://localhost:3002`. All Firecrawl
commands must go through the repository wrapper:

```powershell
node scripts/research/firecrawl-local.mjs --check
node scripts/research/firecrawl-local.mjs search "query" --scrape --limit 5 -o temp/research/search.json
node scripts/research/firecrawl-local.mjs scrape "https://example.com/page" -o temp/research/page.md
```

The wrapper:

- removes `FIRECRAWL_API_KEY` from the child process;
- pins `FIRECRAWL_API_URL` and `--api-url` to a loopback address;
- rejects `--api-key`, `-k`, and `--api-url` command-line overrides;
- verifies that the loopback service identifies itself as Firecrawl; and
- stops when the local service is unavailable.

Do not run bare `firecrawl` commands for Findafew research. Do not authenticate
the CLI, call `https://api.firecrawl.dev`, use credit-backed Firecrawl MCP or
REST fallbacks, or substitute a hosted Firecrawl research agent. A local search
or scrape failure is a coverage gap to report, not permission to use the hosted
service. `FINDAFEW_FIRECRAWL_URL` may change the port or loopback hostname, but
the wrapper rejects non-loopback hosts.

Use the `firecrawl` skill to choose the appropriate search, scrape, map, crawl,
or interaction workflow. This repository policy overrides that skill's generic
hosted-authentication, credit, and feedback instructions. Execute the selected
CLI operation through `node scripts/research/firecrawl-local.mjs` only.

## `last30days` routing

Use the repository-local `.agents/skills/last30days` skill when the question
depends on news, community discussion, adoption signals, or sentiment from the
last 30 days. Read and follow its full `SKILL.md` contract; do not imitate the
workflow from memory.

Use local Firecrawl and `last30days` as complementary evidence:

- Local Firecrawl collects primary, official, technical, and long-form sources.
- `last30days` collects recent social and community signals and preserves their
  engagement context.
- When local Firecrawl supplies the host-web supplement for a `last30days` run,
  set `LAST30DAYS_NATIVE_SEARCH=1` for that engine invocation so it does not run
  a second web-search fallback.
- Treat community signals as directional evidence. Verify factual, legal,
  medical, security, pricing, and product claims against primary sources.

The hosted Firecrawl prohibition still applies inside a `last30days` workflow.
If local Firecrawl is unavailable, continue only with sources the skill can use
without hosted Firecrawl, record the coverage limitation, and never repair it
with a Firecrawl API credential.

## Consensus Mode

Use Consensus Mode for exhaustive research and for decisions with material
product, architecture, security, privacy, safety, legal, financial, or
measurement consequences. Also use it when evidence conflicts or the user asks
for deep analysis or consensus explicitly. Ordinary code lookups and narrow
implementation questions do not need it.

1. Define the decision, scope, assumptions, and evidence-quality bar before
   collecting sources.
2. Build one shared evidence pack with repository evidence, local Firecrawl,
   and `last30days` where recency or community sentiment matters. Fetch once and
   reuse the pack across reviewers.
3. Spawn three independent reviewer agents with distinct lenses appropriate to
   the question. Typical lanes are evidence/domain validity, product and
   implementation feasibility, and risk/privacy/security/operations.
4. Keep reviewers independent through their first pass. Each must identify
   supported conclusions, weak or missing evidence, contradictions, and
   blockers rather than merely endorsing the draft.
5. The lead agent synthesizes the reviews, resolves disagreements against the
   strongest evidence, and sends only unresolved blockers back for another
   focused round.
6. Stop when all material blockers are resolved or explicitly recorded. Report
   dissent and uncertainty; do not turn a majority vote into false consensus.

Consensus means evidence-backed convergence, not three similar summaries. A
final research report should record the local Firecrawl endpoint, whether
`last30days` was used, the reviewer lenses, important disagreements, remaining
gaps, and confirmation that hosted Firecrawl access was not used.

## Failure and artifact handling

- Keep raw retrievals and reviewer scratch work under ignored `temp/` paths.
- Put only a durable final report under `reports/` when the user asks for one.
- Reuse an existing fresh scrape instead of fetching the same page again.
- Cite the source supporting each material claim and distinguish direct
  evidence, inference, and recommendation.
- If the local service, a source, or a reviewer lane fails, report the missing
  coverage. Do not silently swap in a hosted Firecrawl route.
