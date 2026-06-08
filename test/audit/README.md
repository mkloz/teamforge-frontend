# Audit Tests

Playwright-backed audit tests live here.

Keep orchestration, preview serving, SquirrelScan adapters, route inventory, shared audit session helpers, and report assembly in `scripts/audit/`. This folder owns browser-level test implementation only: authenticated route health, product-specific route checks, accessibility checks, user flows, screenshots, and traces.

Recommended structure:

```text
test/audit/
  README.md
  playwright.config.ts
  specs/
    route-health.spec.ts
    accessibility.spec.ts
    user-flows.spec.ts
  fixtures/
    audit-test.ts
    authenticated-page.ts
  assertions/
    accessibility.ts
    network.ts
    route-health.ts
  contracts/
    playwright-routes.ts
  support/
    artifact-paths.ts
    selectors.ts
```

## Responsibilities

`specs/` contains the readable test stories. A spec should say which route or flow is being checked and delegate reusable mechanics.

`fixtures/` creates the Playwright test interface: authenticated browser context, route navigation, console/request capture, screenshot/trace attachment, and access to the audit output root.

`assertions/` contains reusable browser-level checks. Keep assertions small and named after the behavior they protect, not after page styling.

`contracts/` contains Playwright-only route contracts, such as product-specific visible text, landmarks, or selectors. Shared route inventory and dynamic ID resolution should stay in `scripts/audit/`, because SquirrelScan and Playwright both need it.

`support/` contains tiny helpers that are not assertions or fixtures.

Use `@test/support/` for cross-lane factories and builders. Add helpers under `test/audit/support/` only when they are specific to browser-backed audit tests.

## Paired Script Structure

As the audit pipeline grows, the matching script-side structure should look like this:

```text
scripts/audit/
  core/
    audit-context.mjs
    audit-session.mjs
    report-index.mjs
    route-inventory.mjs
  stages/
    playwright-stage.mjs
    squirrel-stage.mjs
    lighthouse-stage.mjs
  static-preview-server.mjs
  setup-local-preview-cert.mjs
```

The seam between the two folders should stay simple: `scripts/audit/` starts the app, authenticates, resolves routes, and chooses output paths; `test/audit/` opens the browser and proves the loaded app state is healthy.

Run the Playwright lane with `npm run audit:playwright` against an already running audit preview, or set `AUDIT_RUN_PLAYWRIGHT=true` when running `npm run audit:auth`.

By default, Playwright runs the route-health lane over the expanded authenticated route set: `/home`, `/explore`, `/activity`, `/profile`, `/settings`, `/forge`, plus group and user detail routes when the audit runner can resolve real local IDs. Set `AUDIT_PLAYWRIGHT_ROUTE_SET=smoke` to keep the old fast loop over `/home`, `/explore`, and `/activity`.

Set `AUDIT_PLAYWRIGHT_LANES=accessibility` to run only the axe lane, or `AUDIT_PLAYWRIGHT_LANES=route-health,accessibility` to run both. The accessibility lane scans representative public and authenticated surfaces: `/`, `/download`, `/home`, `/explore`, `/activity`, and `/forge`. It writes one JSON result per route under `playwright/accessibility/` and runs report-only by default. Set `AUDIT_AXE_FAIL_IMPACTS=critical,serious` later when the team is ready to make axe findings a blocking gate.

The generated `playwright/index.md` is the triage surface: it links each route JSON file, summarizes axe findings by rule, and lists the highest-node routes with example selectors.

Run `npm run audit:lighthouse` against an already running audit preview, or set `AUDIT_RUN_LIGHTHOUSE=true` when running `npm run audit:auth`. The Lighthouse lane is intentionally report-only and narrow by default: `/`, `/download`, and `/home`, with performance, accessibility, best-practices, and SEO categories. It writes one HTML report, one JSON report, and one summary JSON per route under `lighthouse/`, plus a compact `lighthouse/index.md`.

For a focused local pipeline run that skips the legacy loaded-route and SquirrelScan stages:

```powershell
$env:AUDIT_RUN_LOADED='false'
$env:AUDIT_RUN_SQUIRREL='false'
$env:AUDIT_RUN_PLAYWRIGHT='true'
$env:AUDIT_RUN_LIGHTHOUSE='true'
$env:AUDIT_PLAYWRIGHT_LANES='route-health,accessibility'
$env:AUDIT_PLAYWRIGHT_ROUTE_SET='authenticated'
$env:AUDIT_PREVIEW_HTTPS='false'
$env:AUDIT_PLAYWRIGHT_CHANNEL='chrome'
npm run audit:auth
```

Use `AUDIT_PLAYWRIGHT_CHANNEL=chrome` when the bundled Playwright browser is not installed locally or corporate HTTPS inspection blocks `npx playwright install chromium`. For HTTPS preview runs, make sure the certificate configured by `AUDIT_PREVIEW_CERT_PATH` is trusted by Node and the browser runtime.

Keep the legacy loaded-route/CDP audit enabled when proving parity across new route contracts. Once the Playwright authenticated lane is stable in local release runs, the CDP lane can be retired route by route.
