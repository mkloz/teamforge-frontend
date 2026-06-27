# Scripts

This folder is grouped by responsibility. Keep `package.json` to public entry
points only; place orchestration and low-level helper commands in the matching
folder here.

- `audit/`: authenticated browser, Lighthouse, Playwright, SquirrelScan, and preview-server audit lanes.
- `context/`: agent context packs and compact repo health summaries.
- `lint/`: full lint, changed-file linting, Fallow, Knip, and the Vite changed-lint plugin.
- `pwa/`: production PWA release, environment, QA, and icon generation.
- `quality/`: Fallow plus React Doctor inspection reports and policy.
- `shared/`: reusable command, stage, and report helpers for Node-based scripts.
- `verify/`: parallel task graph used by `check:*` npm scripts.
