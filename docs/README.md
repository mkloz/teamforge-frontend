# Frontend documentation

Use this index instead of treating every old planning note as authoritative.

- [`architecture-guide.md`](architecture-guide.md) — current feature, routing,
  data, realtime, and PWA architecture.
- [`api-data-models.md`](api-data-models.md) — frontend-facing API and domain
  models.
- [`open-api.yaml`](open-api.yaml) — generated backend contract consumed by
  frontend tooling.
- [`visual-style-guide.md`](visual-style-guide.md) — design tokens, component
  hierarchy, grouped surfaces, responsive behavior, imagery, motion, states,
  and rendered verification.
- [`research-workflow.md`](research-workflow.md) — local-only Firecrawl,
  `last30days` routing, and evidence-backed Consensus Mode.
- [`adr/`](adr/) — durable architectural decisions.

Historical roadmaps, speculative feature specifications, one-off redesign
briefs, and chat handoff documents do not belong here. Git history preserves
them when they are no longer operational.

Repository agent rules and the routed skill catalog are documented in
[`../AGENTS.md`](../AGENTS.md). Skills are task-specific references, not an
alternative source of product or architecture truth.

For visual work, use the style guide for durable product decisions and Scenario
Mode for deterministic states. Do not preserve screenshot archives as product
documentation; keep generated captures under ignored `temp/` or `reports/`.
