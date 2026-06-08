# Test Architecture

The `test/` folder is split by test lane first, then by product area.

```text
test/
  unit/
    features/
    shared/
  audit/
    README.md
    specs/
    fixtures/
    assertions/
    contracts/
    support/
  support/
    factories/
```

## Lanes

`unit/` contains fast Vitest coverage for pure logic, schemas, reducers, mappers, and feature-facing contracts. It mirrors `src/` so a test is easy to find from the production module it protects.

`audit/` is reserved for browser-backed audit coverage: authenticated route health, accessibility, user flows, screenshots, traces, and loaded-state assertions. It should be run by the audit pipeline, not by the unit test command.

`support/` contains reusable test modules. Keep factories and shared builders here when they are useful across more than one lane or product area.

## Import Rules

Use `@/` for production modules.

Use `@test/` for shared test support:

```ts
import { createUser } from "@test/support/factories/user";
```

Avoid deep relative imports into `support/`; they make nested tests brittle when folders move.

## Script Ownership

`npm run test:unit` runs `test/unit`.

Audit orchestration, preview serving, authentication, route inventory, and report assembly belong in `scripts/audit/`. Browser-level audit assertions belong in `test/audit/`.
