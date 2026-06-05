import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const auditOutputDir =
  process.env.AUDIT_PLAYWRIGHT_OUTPUT_DIR ??
  path.join(process.cwd(), "reports", "playwright-audit");
const browserChannel = process.env.AUDIT_PLAYWRIGHT_CHANNEL;

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: !process.env.CI,
  fullyParallel: false,
  outputDir: path.join(auditOutputDir, "artifacts"),
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: browserChannel || undefined,
      },
    },
  ],
  reporter: [
    ["line"],
    ["json", { outputFile: path.join(auditOutputDir, "results.json") }],
  ],
  retries: process.env.CI ? 1 : 0,
  testDir: path.join(import.meta.dirname, "specs"),
  timeout: 30_000,
  use: {
    baseURL: process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:4173",
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1365, height: 900 },
  },
  workers: 1,
});
