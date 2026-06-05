import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test as base } from "@playwright/test";
import {
  getAccessibilityResultPath,
  getAuditOutputDir,
} from "../support/artifact-paths";

interface AuditFixtures {
  auditOutputDir: string;
}

export const test = base.extend<AuditFixtures>({
  auditOutputDir: async ({ browserName: _browserName }, use) => {
    const outputDir = getAuditOutputDir();

    mkdirSync(outputDir, { recursive: true });

    await use(outputDir);
  },
});

export { expect } from "@playwright/test";

export function writeRouteJson(
  outputDir: string,
  slug: string,
  payload: unknown,
) {
  const routeDir = path.join(outputDir, "routes");

  mkdirSync(routeDir, { recursive: true });
  writeFileSync(
    path.join(routeDir, `${slug}.json`),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
}

export function writeAccessibilityJson(
  outputDir: string,
  slug: string,
  payload: unknown,
) {
  writeFileSync(
    getAccessibilityResultPath(outputDir, slug),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
}
