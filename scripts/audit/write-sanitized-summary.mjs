// @ts-check
/* eslint-disable no-await-in-loop -- route summaries preserve the frozen inventory order */

import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { hashTree } from "../evidence/hash-tree.mjs";
import { AUDIT_ROUTES } from "./routes.mjs";

const accessibilitySlugs = [
  "01-landing",
  "02-download",
  "14-home",
  "15-explore",
  "17-activity",
  "21-plan-creation",
];
const routeHealthSlugs = [
  "14-home",
  "15-explore",
  "16-group-detail-sample",
  "17-activity",
  "18-profile",
  "19-user-detail-sample",
  "20-settings",
  "21-plan-creation",
];
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
const jsonPayloadSchema = z.unknown();

/**
 * Writes the only retained browser-audit artifact. Raw screenshots, traces,
 * reports, tokens and headers remain excluded from this aggregate and are
 * removed before it is persisted.
 *
 * @param {{ cwd: string; outputRoot: string; pipelineExitCode: number; profile: "release" | "nightly"; summaryPath: string }} options
 */
export async function writeSanitizedBrowserAuditSummary(options) {
  const generatedAt = new Date().toISOString();
  const playwrightRoot = path.join(options.outputRoot, "playwright");
  const accessibility = await readAccessibilitySummary(playwrightRoot);
  const routeHealth = await readRouteHealthSummary(playwrightRoot);
  const lighthouse = await readLighthouseSummary(
    path.join(options.outputRoot, "lighthouse"),
  );
  const corsOptions = await probeProductionCors();
  const [sourceHash, buildHash] = await Promise.all([
    hashTree(options.cwd, sourceInputs),
    hashTree(options.cwd, ["dist"]),
  ]);
  const rawArtifacts = await removeRawArtifacts(
    options.cwd,
    options.outputRoot,
  );
  const summary = {
    schemaVersion: "1.0.0",
    generatedAt,
    profile: options.profile,
    hashes: {
      source: sourceHash,
      build: buildHash,
    },
    commands: [
      {
        command: `browser-audit:${options.profile}`,
        exitCode: options.pipelineExitCode,
        status: options.pipelineExitCode === 0 ? "passed" : "failed",
      },
      {
        command: "production-cors-options-probe",
        exitCode: corsOptions.commandExitCode,
        status: corsOptions.commandExitCode === 0 ? "completed" : "failed",
      },
      {
        command: "sanitize-and-delete-raw-browser-artifacts",
        exitCode: rawArtifacts.deleted ? 0 : 1,
        status: rawArtifacts.deleted ? "passed" : "failed-closed",
      },
    ],
    accessibility,
    lighthouse,
    authenticatedRouteHealth: {
      ...routeHealth,
      legacyDataDisposition: {
        clientBehaviour: "reject incompatible pre-cutover objects",
        compatibilityReader: "prohibited",
        requiredAction:
          "reset or migrate unreleased backend data before launch",
        releaseStatus:
          routeHealth.passed === routeHealth.expected
            ? "clear"
            : "blocked-until-current-producer-data-is-verified",
      },
    },
    corsOptions: {
      apexOriginAllowed: corsOptions.apexOriginAllowed,
      commandExitCode: corsOptions.commandExitCode,
      method: "OPTIONS",
      origin: "https://findafew.today",
      path: "/findafew/api/v1/health/ok",
      status: corsOptions.status,
    },
    rawArtifacts,
    overallStatus:
      options.pipelineExitCode === 0 &&
      routeHealth.passed === routeHealth.expected &&
      corsOptions.apexOriginAllowed
        ? "passed"
        : "release-blocked",
  };

  await mkdir(path.dirname(options.summaryPath), { recursive: true });
  await writeFile(
    options.summaryPath,
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );

  return summary;
}

async function readAccessibilitySummary(playwrightRoot) {
  const routes = [];

  for (const slug of accessibilitySlugs) {
    const route = getRoute(slug);
    const payload = await readJsonIfPresent(
      path.join(playwrightRoot, "accessibility", `${slug}.json`),
    );
    const failingViolations = numberOrNull(payload?.failingViolationCount);
    routes.push({
      path: route.path,
      slug,
      status:
        failingViolations === 0 && payload?.finalPath === route.path
          ? "passed"
          : "failed-or-missing",
      failingViolationCount: failingViolations,
      incompleteCount: numberOrNull(payload?.incompleteCount),
      violationCount: numberOrNull(payload?.violationCount),
    });
  }

  const passed = routes.filter((route) => route.status === "passed").length;
  return {
    expected: accessibilitySlugs.length,
    passed,
    failedOrMissing: accessibilitySlugs.length - passed,
    surfaces: routes,
  };
}

async function readRouteHealthSummary(playwrightRoot) {
  const report = await readJsonIfPresent(
    path.join(playwrightRoot, "results.json"),
  );
  const specs = collectPlaywrightSpecs(report);
  const routes = routeHealthSlugs.map((slug) => {
    const route = getRoute(slug);
    const spec = specs.find(
      (candidate) =>
        typeof candidate.title === "string" &&
        candidate.title.includes(slug) &&
        candidate.title.includes("@route-health"),
    );
    const status = getFinalPlaywrightStatus(spec);
    return {
      path: route.path,
      slug,
      status,
    };
  });
  const passed = routes.filter((route) => route.status === "passed").length;
  const executed = routes.filter(
    (route) => route.status !== "missing" && route.status !== "skipped",
  ).length;

  return {
    expected: routeHealthSlugs.length,
    executed,
    passed,
    failed: routes.filter((route) => route.status === "failed").length,
    skipped: routes.filter((route) => route.status === "skipped").length,
    missing: routes.filter((route) => route.status === "missing").length,
    routes,
  };
}

async function readLighthouseSummary(lighthouseRoot) {
  const manifest = await readJsonIfPresent(
    path.join(lighthouseRoot, "manifest.json"),
  );
  const results = Array.isArray(manifest?.results) ? manifest.results : [];
  return {
    routeCount: results.length,
    routes: results.map((result) => ({
      accessibility: numberOrNull(result.accessibility),
      bestPractices: numberOrNull(result.bestPractices),
      cumulativeLayoutShift: stringOrNull(result.cumulativeLayoutShift),
      largestContentfulPaint: stringOrNull(result.largestContentfulPaint),
      path: stringOrNull(result.requestedPath),
      performance: numberOrNull(result.performance),
      seo: numberOrNull(result.seo),
      slug: stringOrNull(result.slug),
    })),
  };
}

async function probeProductionCors() {
  try {
    const response = await fetch(
      "https://api.findafew.today/findafew/api/v1/health/ok",
      {
        headers: {
          "Access-Control-Request-Method": "GET",
          Origin: "https://findafew.today",
        },
        method: "OPTIONS",
        signal: AbortSignal.timeout(15_000),
      },
    );
    return {
      apexOriginAllowed:
        response.ok &&
        response.headers.get("access-control-allow-origin") ===
          "https://findafew.today",
      commandExitCode: 0,
      status: response.status,
    };
  } catch {
    return {
      apexOriginAllowed: false,
      commandExitCode: 1,
      status: null,
    };
  }
}

async function removeRawArtifacts(cwd, outputRoot) {
  const tempRoot = path.resolve(cwd, "temp");
  const resolvedOutputRoot = path.resolve(outputRoot);
  const isSafeTarget =
    resolvedOutputRoot.startsWith(`${tempRoot}${path.sep}`) &&
    path.basename(resolvedOutputRoot).startsWith("browser-audit-");

  if (!isSafeTarget) {
    return {
      deleted: false,
      retained: existsSync(resolvedOutputRoot),
      reason: "output root was outside the governed temporary audit path",
    };
  }

  await rm(resolvedOutputRoot, { force: true, recursive: true });
  return {
    deleted: !existsSync(resolvedOutputRoot),
    retained: existsSync(resolvedOutputRoot),
    reason:
      "raw screenshots, traces, reports and transient auth artifacts removed",
  };
}

function collectPlaywrightSpecs(payload) {
  const specs = [];
  const suites = Array.isArray(payload?.suites) ? payload.suites : [];
  for (const suite of suites) {
    if (Array.isArray(suite?.specs)) specs.push(...suite.specs);
    specs.push(...collectPlaywrightSpecs(suite));
  }
  return specs;
}

function getFinalPlaywrightStatus(spec) {
  const tests = Array.isArray(spec?.tests) ? spec.tests : [];
  const results = tests.flatMap((test) =>
    Array.isArray(test?.results) ? test.results : [],
  );
  const finalResult = results.at(-1);
  if (!finalResult) return "missing";
  if (finalResult.status === "passed") return "passed";
  if (finalResult.status === "skipped") return "skipped";
  return "failed";
}

function getRoute(slug) {
  const route = AUDIT_ROUTES.find((candidate) => candidate.slug === slug);
  if (!route) throw new Error(`Missing browser-audit route: ${slug}`);
  return route;
}

async function readJsonIfPresent(filePath) {
  try {
    const payload = jsonPayloadSchema.safeParse(
      JSON.parse(await readFile(filePath, "utf8")),
    );
    if (!payload.success) {
      throw new Error(`Invalid browser audit JSON: ${filePath}`);
    }
    return payload.data;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringOrNull(value) {
  return typeof value === "string" ? value : null;
}
