import path from "node:path";
import { defineConfig } from "@playwright/test";

const outputRoot =
  process.env.SCENARIO_SCREENSHOT_OUTPUT ??
  path.join(process.cwd(), "temp", "scenario-screenshots", "smoke");

export default defineConfig({
  expect: { timeout: 12_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  outputDir: path.join(outputRoot, "artifacts"),
  projects: [
    {
      name: "mobile",
      use: { viewport: { height: 844, width: 390 } },
    },
    {
      name: "tablet",
      use: { viewport: { height: 1180, width: 820 } },
    },
    {
      name: "desktop",
      use: { viewport: { height: 1000, width: 1440 } },
    },
  ],
  reporter: [["line"]],
  retries: process.env.CI ? 1 : 0,
  testDir: import.meta.dirname,
  timeout: 35_000,
  use: {
    baseURL: process.env.SCENARIO_BASE_URL ?? "http://127.0.0.1:4174",
    locale: "en-GB",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    timezoneId: "Europe/London",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run scenario:preview -- --port 4174 --strictPort",
    reuseExistingServer: false,
    timeout: 30_000,
    url: "http://127.0.0.1:4174",
  },
  workers: 1,
});
