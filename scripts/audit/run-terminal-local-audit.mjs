#!/usr/bin/env node

// @ts-check

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { launch } from "chrome-launcher";
import lighthouse, { desktopConfig } from "lighthouse";
import { hashTree } from "../evidence/hash-tree.mjs";

const cwd = process.cwd();
const failImpacts = ["critical", "serious"];
const sourceInputs = [
  "index.html",
  "package-lock.json",
  "package.json",
  "public",
  "scripts",
  "src",
  "test",
  "tsconfig.app.json",
  "tsconfig.json",
  "tsconfig.node.json",
  "vite.config.ts",
];
const reportRoot = path.join(
  cwd,
  "..",
  "reports",
  "findafew-implementation",
  "phase-3",
);
const staticPreviewScript = path.join(
  cwd,
  "scripts",
  "audit",
  "static-preview-server.mjs",
);

const auditModes = {
  "final-dist": {
    buildDirectory: "dist",
    buildLabel: "finalDist",
    evidenceClass: "production-exact",
    includeLighthouse: true,
    outputPath: path.join(reportRoot, "final-dist-public-audit-summary.json"),
    port: 4185,
    routes: [
      {
        expectedFinalPaths: ["/"],
        navigationPath: "/",
        path: "/",
        slug: "landing",
      },
      {
        expectedFinalPaths: ["/download"],
        navigationPath: "/download",
        path: "/download",
        slug: "download",
      },
      {
        browserSignalDisposition: "known-live-api-cors-phase-4-gate",
        expectedFinalPaths: ["/auth/login"],
        navigationPath: "/home",
        path: "/home",
        slug: "home-unauthenticated",
      },
    ],
  },
  synthetic: {
    buildDirectory: "dev-dist/scenario",
    buildLabel: "auditBuild",
    evidenceClass: "synthetic-deep-surface",
    includeLighthouse: false,
    outputPath: path.join(
      reportRoot,
      "synthetic-accessibility-audit-summary.json",
    ),
    port: 4186,
    routes: [
      {
        browserSignalDisposition:
          "synthetic-public-shell-uninstrumented-refresh",
        expectedFinalPaths: ["/"],
        navigationPath: "/",
        path: "/",
        slug: "landing",
      },
      {
        expectedFinalPaths: ["/download"],
        navigationPath: "/download",
        path: "/download",
        slug: "download",
      },
      {
        expectedFinalPaths: ["/home"],
        navigationPath: "/home?__scenario=home-dense",
        path: "/home",
        slug: "home",
      },
      {
        expectedFinalPaths: ["/explore"],
        navigationPath: "/explore?__scenario=explore-standard",
        path: "/explore",
        slug: "explore",
      },
      {
        expectedFinalPaths: ["/activity"],
        navigationPath: "/activity?__scenario=activity-standard",
        path: "/activity",
        slug: "activity",
      },
      {
        expectedFinalPaths: ["/plans/new"],
        navigationPath: "/plans/new?__scenario=plan-creation-standard",
        path: "/plans/new",
        slug: "plan-creation",
      },
    ],
  },
};

function getAuditMode() {
  const modeName = process.argv[2];
  const mode = auditModes[modeName];

  if (!mode) {
    throw new Error(`Unknown terminal audit mode: ${modeName ?? "missing"}`);
  }

  return { mode, modeName };
}

function assertFailImpactPolicy() {
  const configuredImpacts = (process.env.AUDIT_AXE_FAIL_IMPACTS ?? "")
    .split(",")
    .map((impact) => impact.trim())
    .filter(Boolean)
    .sort();

  if (configuredImpacts.join(",") !== [...failImpacts].sort().join(",")) {
    throw new Error(
      "AUDIT_AXE_FAIL_IMPACTS must be exactly critical,serious for terminal evidence.",
    );
  }
}

function startPreview({ buildDirectory, port }) {
  return spawn(
    process.execPath,
    [
      staticPreviewScript,
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--root",
      buildDirectory,
    ],
    {
      cwd,
      env: process.env,
      stdio: "ignore",
      windowsHide: true,
    },
  );
}

async function waitForPreview(baseUrl) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    try {
      // eslint-disable-next-line no-await-in-loop -- readiness polling must remain sequential.
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }
      // Fetch reports a TypeError while the local preview is still binding.
    }

    // eslint-disable-next-line no-await-in-loop -- readiness polling uses a bounded backoff.
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Preview did not become ready: ${baseUrl}`);
}

function createBrowserSignals(page) {
  const signals = {
    consoleErrors: 0,
    consoleWarnings: 0,
    failedRequests: 0,
    pageErrors: 0,
    requests: 0,
    responses4xx: 0,
    responses5xx: 0,
  };

  page.on("console", (message) => {
    if (message.type() === "error") {
      signals.consoleErrors += 1;
    } else if (message.type() === "warning") {
      signals.consoleWarnings += 1;
    }
  });
  page.on("pageerror", () => {
    signals.pageErrors += 1;
  });
  page.on("request", () => {
    signals.requests += 1;
  });
  page.on("requestfailed", () => {
    signals.failedRequests += 1;
  });
  page.on("response", (response) => {
    if (response.status() >= 500) {
      signals.responses5xx += 1;
    } else if (response.status() >= 400) {
      signals.responses4xx += 1;
    }
  });

  return signals;
}

function sanitizeAxeViolations(violations) {
  return violations
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? "unknown",
      nodeCount: violation.nodes.length,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function countBlockingAxeNodes(rules) {
  return rules
    .filter((rule) => failImpacts.includes(rule.impact))
    .reduce((total, rule) => total + rule.nodeCount, 0);
}

async function readPageMetadata(page) {
  return page.evaluate(() => ({
    canonical:
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
      null,
    description:
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ?? null,
    headingLevelOneCount: document.querySelectorAll("h1").length,
    manifest:
      document.querySelector('link[rel="manifest"]')?.getAttribute("href") ??
      null,
    robots:
      document.querySelector('meta[name="robots"]')?.getAttribute("content") ??
      null,
    title: document.title,
  }));
}

function getRouteStatus({
  browserSignalDisposition,
  expectedPath,
  rules,
  signals,
}) {
  const blockingAxeNodeCount = countBlockingAxeNodes(rules);
  const browserSignalFailureCount =
    signals.consoleErrors + signals.pageErrors + signals.failedRequests;
  const browserSignalsAccepted =
    browserSignalFailureCount === 0 || Boolean(browserSignalDisposition);

  return {
    blockingAxeNodeCount,
    browserSignalFailureCount,
    browserSignalDisposition:
      browserSignalFailureCount === 0
        ? "clean"
        : (browserSignalDisposition ?? "unresolved"),
    status:
      expectedPath && blockingAxeNodeCount === 0 && browserSignalsAccepted
        ? "passed"
        : "failed",
  };
}

async function auditRoute(browser, baseUrl, route) {
  const context = await browser.newContext({
    viewport: { height: 900, width: 1365 },
  });
  const page = await context.newPage();
  const signals = createBrowserSignals(page);
  const response = await page.goto(
    new URL(route.navigationPath, baseUrl).href,
    {
      timeout: 30_000,
      waitUntil: "domcontentloaded",
    },
  );

  await page
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch(() => {});
  await page.waitForTimeout(500);

  const finalPath = new URL(page.url()).pathname;
  const metadata = await readPageMetadata(page);
  const axeResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const rules = sanitizeAxeViolations(axeResults.violations);
  const expectedPath = route.expectedFinalPaths.includes(finalPath);
  const status = getRouteStatus({
    browserSignalDisposition: route.browserSignalDisposition,
    expectedPath,
    rules,
    signals,
  });

  await context.close();

  return {
    axe: {
      blockingImpacts: failImpacts,
      incompleteCount: axeResults.incomplete.length,
      rules,
      ...status,
    },
    documentStatus: response?.status() ?? null,
    expectedFinalPaths: route.expectedFinalPaths,
    finalPath,
    metadata,
    path: route.path,
    signals,
    slug: route.slug,
    status: status.status,
  };
}

async function runBrowserAudit(baseUrl, routes) {
  const browser = await chromium.launch({ headless: true });

  try {
    const results = [];
    for (const route of routes) {
      // eslint-disable-next-line no-await-in-loop -- route audits share one bounded local browser.
      results.push(await auditRoute(browser, baseUrl, route));
    }
    return results;
  } finally {
    await browser.close();
  }
}

function getScore(category) {
  return typeof category?.score === "number"
    ? Math.round(category.score * 100)
    : null;
}

function getAuditDisplayValue(lhr, id) {
  return lhr.audits[id]?.displayValue ?? "n/a";
}

async function runLighthouseAudit(baseUrl, routes) {
  const chrome = await launch({
    chromeFlags: [
      "--headless=new",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-gpu",
      "--no-first-run",
      "--window-size=1365,768",
    ],
  });

  try {
    const results = [];

    for (const route of routes) {
      // eslint-disable-next-line no-await-in-loop -- Lighthouse navigations share one Chrome port.
      const runner = await lighthouse(
        new URL(route.navigationPath, baseUrl).href,
        {
          logLevel: "error",
          onlyCategories: [
            "performance",
            "accessibility",
            "best-practices",
            "seo",
          ],
          output: "json",
          port: chrome.port,
        },
        desktopConfig,
      );
      const lhr = runner?.lhr;

      if (!lhr) {
        throw new Error(`Lighthouse returned no result for ${route.path}`);
      }

      results.push({
        accessibility: getScore(lhr.categories.accessibility),
        bestPractices: getScore(lhr.categories["best-practices"]),
        cumulativeLayoutShift: getAuditDisplayValue(
          lhr,
          "cumulative-layout-shift",
        ),
        finalPath: new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl).pathname,
        largestContentfulPaint: getAuditDisplayValue(
          lhr,
          "largest-contentful-paint",
        ),
        path: route.path,
        performance: getScore(lhr.categories.performance),
        seo: getScore(lhr.categories.seo),
        slug: route.slug,
      });
    }

    return results;
  } finally {
    chrome.kill();
  }
}

function aggregateAxeRules(routes) {
  const rulesByKey = new Map();

  for (const route of routes) {
    for (const rule of route.axe.rules) {
      const key = `${rule.id}\0${rule.impact}`;
      const current = rulesByKey.get(key) ?? {
        id: rule.id,
        impact: rule.impact,
        nodeCount: 0,
        routes: [],
      };
      current.nodeCount += rule.nodeCount;
      current.routes.push({ nodeCount: rule.nodeCount, path: route.path });
      rulesByKey.set(key, current);
    }
  }

  return [...rulesByKey.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}

function summarizeRouteStatuses(routes) {
  return {
    failed: routes.filter((route) => route.status === "failed").length,
    passed: routes.filter((route) => route.status === "passed").length,
    total: routes.length,
  };
}

async function writeSummary({ mode, modeName }) {
  assertFailImpactPolicy();
  mkdirSync(reportRoot, { recursive: true });

  const baseUrl = `http://127.0.0.1:${mode.port}`;
  const sourceHash = await hashTree(cwd, sourceInputs);
  const beforeBuildHash = await hashTree(cwd, [mode.buildDirectory]);
  const preview = startPreview(mode);
  let routeResults = [];
  let lighthouseResults = [];
  let browserExitCode = 1;
  let lighthouseExitCode = mode.includeLighthouse ? 1 : null;

  try {
    await waitForPreview(baseUrl);
    routeResults = await runBrowserAudit(baseUrl, mode.routes);
    browserExitCode = routeResults.every((route) => route.status === "passed")
      ? 0
      : 1;

    if (mode.includeLighthouse) {
      lighthouseResults = await runLighthouseAudit(baseUrl, mode.routes);
      lighthouseExitCode = 0;
    }
  } finally {
    preview.kill();
  }

  const afterBuildHash = await hashTree(cwd, [mode.buildDirectory]);
  const buildUnchanged = beforeBuildHash.digest === afterBuildHash.digest;
  const routeStatuses = summarizeRouteStatuses(routeResults);
  const exitStatus =
    browserExitCode === 0 &&
    (lighthouseExitCode === 0 || lighthouseExitCode === null) &&
    buildUnchanged
      ? "passed"
      : "failed";
  const summary = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    mode: modeName,
    evidenceClass: mode.evidenceClass,
    hashes: {
      source: sourceHash,
      [mode.buildLabel]: beforeBuildHash,
      postAuditBuild: afterBuildHash,
      buildUnchanged,
    },
    policy: {
      axeFailImpacts: failImpacts,
      authCredentialsUsed: false,
      instrumentationEnabled: modeName === "synthetic",
      rawTraceRetained: false,
    },
    commands: {
      browser: { exitCode: browserExitCode },
      lighthouse: { exitCode: lighthouseExitCode },
    },
    routes: routeResults,
    routeStatuses,
    axeRuleSummary: aggregateAxeRules(routeResults),
    lighthouse: lighthouseResults,
    exitStatus,
  };

  writeFileSync(
    mode.outputPath,
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );
  process.stdout.write(`TERMINAL_AUDIT ${modeName} ${exitStatus}\n`);
  process.stdout.write(`SUMMARY ${mode.outputPath}\n`);
  process.stdout.write(`BUILD_SHA256 ${beforeBuildHash.digest}\n`);

  if (exitStatus !== "passed") {
    process.exitCode = 1;
  }
}

writeSummary(getAuditMode()).catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
