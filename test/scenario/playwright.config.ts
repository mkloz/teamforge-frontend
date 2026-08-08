import path from "node:path";
import { defineConfig } from "@playwright/test";

const outputRoot =
  process.env.SCENARIO_SCREENSHOT_OUTPUT ??
  path.join(process.cwd(), "temp", "scenario-screenshots", "smoke");
const skipWebServer = process.env.SCENARIO_SKIP_WEBSERVER === "1";

export default defineConfig({
  expect: { timeout: 12_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  outputDir: path.join(outputRoot, "artifacts"),
  projects: [
    {
      name: "small-mobile",
      use: {
        colorScheme: "dark",
        hasTouch: true,
        isMobile: true,
        viewport: { height: 800, width: 360 },
      },
    },
    {
      name: "mobile",
      use: {
        colorScheme: "dark",
        hasTouch: true,
        isMobile: true,
        viewport: { height: 844, width: 390 },
      },
    },
    {
      name: "tablet",
      use: { colorScheme: "dark", viewport: { height: 1180, width: 820 } },
    },
    {
      name: "tablet-landscape",
      use: { colorScheme: "dark", viewport: { height: 768, width: 1024 } },
    },
    {
      name: "desktop",
      use: { colorScheme: "dark", viewport: { height: 1000, width: 1440 } },
    },
    {
      name: "light-mobile",
      use: {
        colorScheme: "light",
        hasTouch: true,
        isMobile: true,
        viewport: { height: 844, width: 390 },
      },
    },
    {
      name: "light-tablet",
      use: {
        colorScheme: "light",
        viewport: { height: 1180, width: 820 },
      },
    },
    {
      name: "light-desktop",
      use: {
        colorScheme: "light",
        viewport: { height: 1000, width: 1440 },
      },
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
  webServer: skipWebServer
    ? undefined
    : {
        command: "npm run scenario:preview -- --port 4174 --strictPort",
        reuseExistingServer: false,
        timeout: 30_000,
        url: "http://127.0.0.1:4174",
      },
  workers: 1,
});
