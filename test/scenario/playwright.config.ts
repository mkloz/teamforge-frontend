import path from "node:path";
import { defineConfig } from "@playwright/test";

const outputRoot =
  process.env.SCENARIO_SCREENSHOT_OUTPUT ??
  path.join(process.cwd(), "temp", "scenario-screenshots", "smoke");
const skipWebServer = process.env.SCENARIO_SKIP_WEBSERVER === "1";
const interactionBaselineSpec = "**/mobile-interaction-baseline.spec.ts";
const navigationRestorationSpec = "**/navigation-scroll-restoration.spec.ts";
const focusedContractSpecs = [
  interactionBaselineSpec,
  navigationRestorationSpec,
];
const interactionMobileUse = {
  colorScheme: "dark" as const,
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
  viewport: { height: 844, width: 390 },
};

export default defineConfig({
  expect: { timeout: 12_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  outputDir: path.join(outputRoot, "artifacts"),
  projects: [
    {
      name: "small-mobile",
      testIgnore: focusedContractSpecs,
      use: {
        colorScheme: "dark",
        hasTouch: true,
        isMobile: true,
        viewport: { height: 800, width: 360 },
      },
    },
    {
      name: "mobile",
      testIgnore: focusedContractSpecs,
      use: {
        colorScheme: "dark",
        hasTouch: true,
        isMobile: true,
        viewport: { height: 844, width: 390 },
      },
    },
    {
      name: "tablet",
      testIgnore: focusedContractSpecs,
      use: { colorScheme: "dark", viewport: { height: 1180, width: 820 } },
    },
    {
      name: "tablet-landscape",
      testIgnore: focusedContractSpecs,
      use: { colorScheme: "dark", viewport: { height: 768, width: 1024 } },
    },
    {
      name: "desktop",
      testIgnore: focusedContractSpecs,
      use: { colorScheme: "dark", viewport: { height: 1000, width: 1440 } },
    },
    {
      name: "light-mobile",
      testIgnore: focusedContractSpecs,
      use: {
        colorScheme: "light",
        hasTouch: true,
        isMobile: true,
        viewport: { height: 844, width: 390 },
      },
    },
    {
      name: "light-tablet",
      testIgnore: focusedContractSpecs,
      use: {
        colorScheme: "light",
        viewport: { height: 1180, width: 820 },
      },
    },
    {
      name: "light-desktop",
      testIgnore: focusedContractSpecs,
      use: {
        colorScheme: "light",
        viewport: { height: 1000, width: 1440 },
      },
    },
    {
      name: "interaction-mobile-normal",
      testMatch: interactionBaselineSpec,
      use: {
        ...interactionMobileUse,
        contextOptions: { reducedMotion: "no-preference" },
        reducedMotion: "no-preference",
      },
    },
    {
      name: "interaction-mobile-reduced",
      testMatch: interactionBaselineSpec,
      use: {
        ...interactionMobileUse,
        contextOptions: { reducedMotion: "reduce" },
        reducedMotion: "reduce",
      },
    },
    {
      name: "navigation-restoration-normal",
      testMatch: navigationRestorationSpec,
      use: {
        colorScheme: "dark",
        contextOptions: { reducedMotion: "no-preference" },
        reducedMotion: "no-preference",
        viewport: { height: 560, width: 1280 },
      },
    },
    {
      name: "navigation-restoration-reduced",
      testMatch: navigationRestorationSpec,
      use: {
        colorScheme: "dark",
        contextOptions: { reducedMotion: "reduce" },
        reducedMotion: "reduce",
        viewport: { height: 560, width: 1280 },
      },
    },
  ],
  reporter: process.env.SCENARIO_SANITIZED_REPORTER_OUTPUT
    ? [
        ["line"],
        [path.join(process.cwd(), "scripts/scenario/sanitized-reporter.mjs")],
      ]
    : [["line"]],
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
