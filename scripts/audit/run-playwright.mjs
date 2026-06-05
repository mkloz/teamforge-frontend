import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  assertBaseUrlReachable,
  cwd,
  getApiUrl,
  getAuditBaseUrl,
  getAuditSession,
  getRefreshCookieName,
  loadAuditEnvFiles,
  removeAuditTokens,
  todayStamp,
  writeAuditTokens,
  writeError,
  writeJson,
  writeOutput,
  writeText,
} from "./helpers.mjs";
import {
  PLAYWRIGHT_ACCESSIBILITY_ROUTE_SLUGS,
  PLAYWRIGHT_AUTHENTICATED_ROUTE_SLUGS,
  PLAYWRIGHT_SMOKE_ROUTE_SLUGS,
  resolveAuditRoutes,
} from "./routes.mjs";

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const playwrightConfigPath = path.join(
  cwd,
  "test",
  "audit",
  "playwright.config.ts",
);
const playwrightRouteResultSchema = z
  .object({
    consoleErrors: z.array(z.unknown()).optional(),
    expectedFailedRequests: z.array(z.unknown()).optional(),
    failedRequests: z.array(z.unknown()).optional(),
    finalPath: z.string().optional(),
    requestedPath: z.string().optional(),
    screenshot: z.string().optional(),
    slug: z.string().optional(),
  })
  .passthrough();
const playwrightAccessibilityNodeSchema = z
  .object({
    failureSummary: z.string().optional(),
    html: z.string().optional(),
    target: z.array(z.string()).optional(),
  })
  .passthrough();
const playwrightAccessibilityViolationSchema = z
  .object({
    description: z.string().optional(),
    help: z.string().optional(),
    helpUrl: z.string().optional(),
    id: z.string().optional(),
    impact: z.string().nullable().optional(),
    nodeCount: z.number().optional(),
    nodes: z.array(playwrightAccessibilityNodeSchema).optional(),
  })
  .passthrough();
const playwrightAccessibilityResultSchema = z
  .object({
    failingViolationCount: z.number().optional(),
    failingViolations: z
      .array(playwrightAccessibilityViolationSchema)
      .optional(),
    finalPath: z.string().optional(),
    incompleteCount: z.number().optional(),
    requestedPath: z.string().optional(),
    slug: z.string().optional(),
    violationCount: z.number().optional(),
    violations: z.array(playwrightAccessibilityViolationSchema).optional(),
  })
  .passthrough();
const playwrightLaneSchema = z.enum(["route-health", "accessibility"]);
const playwrightRouteSetSchema = z.enum(["authenticated", "smoke"]);
const defaultPlaywrightLanes = ["route-health"];

/**
 * Normalizes commands that Windows cannot spawn directly in some shells.
 *
 * @param {string} command Command executable.
 * @param {string[]} args Command arguments.
 * @returns {{ command: string; args: string[] }} Spawn-ready invocation.
 */
function getSpawnInvocation(command, args) {
  if (process.platform !== "win32" || !command.endsWith(".cmd")) {
    return { command, args };
  }

  return {
    command: "cmd.exe",
    args: ["/d", "/s", "/c", command.slice(0, -4), ...args],
  };
}

/**
 * Runs Playwright and rejects on a failing route-health check.
 *
 * @param {{ baseUrl: string; lanes: string[]; outputDir: string; routeFilePath: string }} options Run options.
 * @returns {Promise<void>}
 */
function runPlaywright({ baseUrl, lanes, outputDir, routeFilePath }) {
  return new Promise((resolve, reject) => {
    const args = [
      "playwright",
      "test",
      "--config",
      playwrightConfigPath,
      "--project",
      "chromium",
      "--grep",
      lanes.join("|"),
    ];
    const invocation = getSpawnInvocation(npxCommand, args);
    const child = spawn(invocation.command, invocation.args, {
      cwd,
      env: {
        ...process.env,
        AUDIT_BASE_URL: baseUrl,
        AUDIT_PLAYWRIGHT_OUTPUT_DIR: outputDir,
        AUDIT_PLAYWRIGHT_ROUTES_FILE: routeFilePath,
      },
      stdio: "inherit",
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Playwright audit failed with exit code ${code}`));
    });
  });
}

/**
 * Selects the Playwright route set for this run.
 *
 * @returns {"authenticated" | "smoke"} Route set name.
 */
function getPlaywrightRouteSet() {
  return (
    playwrightRouteSetSchema.safeParse(process.env.AUDIT_PLAYWRIGHT_ROUTE_SET)
      .data ?? "authenticated"
  );
}

/**
 * Selects which Playwright audit lanes to run.
 *
 * @returns {("route-health" | "accessibility")[]} Lane names.
 */
function getPlaywrightLanes() {
  const rawValue = process.env.AUDIT_PLAYWRIGHT_LANES;

  if (!rawValue) {
    return defaultPlaywrightLanes;
  }

  if (rawValue === "all") {
    return ["route-health", "accessibility"];
  }

  const lanes = rawValue
    .split(",")
    .map((lane) => lane.trim())
    .filter(Boolean)
    .map((lane) => playwrightLaneSchema.safeParse(lane))
    .map((parsedLane) => parsedLane.data)
    .filter(Boolean);

  if (lanes.length === 0) {
    throw new Error(
      'No valid Playwright lanes selected. Use "route-health", "accessibility", or "all".',
    );
  }

  return [...new Set(lanes)];
}

/**
 * Returns route slugs for the selected Playwright route set.
 *
 * @param {{ lanes: string[]; routeSet: "authenticated" | "smoke" }} options Route options.
 * @returns {string[]} Route slugs.
 */
function getPlaywrightRouteSlugs({ lanes, routeSet }) {
  const routeSlugs = new Set();

  if (lanes.includes("route-health")) {
    const healthRouteSlugs =
      routeSet === "smoke"
        ? PLAYWRIGHT_SMOKE_ROUTE_SLUGS
        : PLAYWRIGHT_AUTHENTICATED_ROUTE_SLUGS;

    for (const slug of healthRouteSlugs) {
      routeSlugs.add(slug);
    }
  }

  if (lanes.includes("accessibility")) {
    for (const slug of PLAYWRIGHT_ACCESSIBILITY_ROUTE_SLUGS) {
      routeSlugs.add(slug);
    }
  }

  return [...routeSlugs];
}

/**
 * Checks whether a dynamic Playwright route has a concrete local ID.
 *
 * @param {import("./routes.mjs").AuditRoute} route Route metadata.
 * @returns {boolean} Whether the route is runnable in Playwright.
 */
function hasResolvedPlaywrightRoutePath(route) {
  if (route.slug === "16-group-detail-sample") {
    return !route.path.includes("audit-group-id");
  }

  if (route.slug === "19-user-detail-sample") {
    return !route.path.includes("audit-user-id");
  }

  return true;
}

/**
 * Resolves and filters the route inventory for the Playwright lane.
 *
 * @param {{ accessToken: string; apiUrl: string; lanes: string[]; routeSet: "authenticated" | "smoke" }} options Route options.
 * @returns {Promise<import("./routes.mjs").AuditRoute[]>} Playwright route inventory.
 */
async function resolvePlaywrightRoutes({
  accessToken,
  apiUrl,
  lanes,
  routeSet,
}) {
  const routeSlugs = new Set(getPlaywrightRouteSlugs({ lanes, routeSet }));
  const routes = await resolveAuditRoutes({ accessToken, apiUrl });
  const selectedRoutes = routes.filter(
    (route) =>
      routeSlugs.has(route.slug) && hasResolvedPlaywrightRoutePath(route),
  );

  if (selectedRoutes.length === 0) {
    throw new Error("No Playwright route-health routes were selected.");
  }

  return selectedRoutes;
}

/**
 * Writes the Playwright route handoff consumed by the spec process.
 *
 * @param {{ lanes: string[]; outputDir: string; routeSet: "authenticated" | "smoke"; routes: import("./routes.mjs").AuditRoute[] }} options Route file options.
 * @returns {string} Route file path.
 */
function writePlaywrightRouteFile({ lanes, outputDir, routeSet, routes }) {
  const routeFilePath = path.join(outputDir, "route-contracts.json");

  writeJson(routeFilePath, {
    generatedAt: new Date().toISOString(),
    lanes,
    routeSet,
    routes,
  });

  return routeFilePath;
}

/**
 * Reads JSON results written by the Playwright specs.
 *
 * @param {string} outputDir Playwright audit output directory.
 * @param {string} resultDirName Result directory name.
 * @param {z.ZodType} schema Result schema.
 * @param {string} resultLabel Human-readable result label.
 * @returns {unknown[]} Result payloads.
 */
function readJsonResults(outputDir, resultDirName, schema, resultLabel) {
  const resultDir = path.join(outputDir, resultDirName);

  if (!existsSync(resultDir)) {
    return [];
  }

  return readdirSync(resultDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => {
      const parsedResult = schema.safeParse(
        JSON.parse(readFileSync(path.join(resultDir, fileName), "utf8")),
      );

      if (!parsedResult.success) {
        throw new Error(
          `Could not parse generated Playwright ${resultLabel} result: ${fileName}`,
        );
      }

      return parsedResult.data;
    });
}

/**
 * Reads JSON route-health results written by the Playwright specs.
 *
 * @param {string} outputDir Playwright audit output directory.
 * @returns {unknown[]} Route result payloads.
 */
function readRouteResults(outputDir) {
  return readJsonResults(
    outputDir,
    "routes",
    playwrightRouteResultSchema,
    "route-health",
  );
}

/**
 * Reads JSON accessibility results written by the Playwright specs.
 *
 * @param {string} outputDir Playwright audit output directory.
 * @returns {unknown[]} Accessibility result payloads.
 */
function readAccessibilityResults(outputDir) {
  return readJsonResults(
    outputDir,
    "accessibility",
    playwrightAccessibilityResultSchema,
    "accessibility",
  );
}

const axeImpactRanks = new Map([
  ["critical", 4],
  ["serious", 3],
  ["moderate", 2],
  ["minor", 1],
  ["unknown", 0],
]);

/**
 * Escapes content used inside markdown table cells.
 *
 * @param {unknown} value Cell value.
 * @returns {string} Markdown-safe cell text.
 */
function escapeMarkdownTableCell(value) {
  const text =
    typeof value === "string"
      ? value
      : typeof value === "number" || typeof value === "boolean"
        ? String(value)
        : "";

  return text.replace(/\r?\n/g, " ").replaceAll("|", "\\|").trim();
}

/**
 * Formats compact markdown inline code for generated reports.
 *
 * @param {unknown} value Inline code value.
 * @param {number} maxLength Maximum display length.
 * @returns {string} Markdown inline code.
 */
function formatMarkdownCode(value, maxLength = 80) {
  const text = escapeMarkdownTableCell(value).replaceAll("`", "\\`");

  if (text.length <= maxLength) {
    return `\`${text}\``;
  }

  return `\`${text.slice(0, maxLength - 3).trimEnd()}...\``;
}

/**
 * Returns a sortable rank for an axe impact.
 *
 * @param {string | null | undefined} impact Axe impact.
 * @returns {number} Sort rank.
 */
function getAxeImpactRank(impact) {
  return axeImpactRanks.get(impact ?? "unknown") ?? 0;
}

/**
 * Returns the highest impact label represented by a set of impacts.
 *
 * @param {Set<string>} impacts Axe impacts.
 * @returns {string} Highest impact label.
 */
function getHighestAxeImpact(impacts) {
  return (
    [...impacts].sort(
      (leftImpact, rightImpact) =>
        getAxeImpactRank(rightImpact) - getAxeImpactRank(leftImpact),
    )[0] ?? "unknown"
  );
}

/**
 * Counts nodes for a serialized axe violation.
 *
 * @param {{ nodeCount?: number; nodes?: unknown[] }} violation Axe violation.
 * @returns {number} Node count.
 */
function getAxeViolationNodeCount(violation) {
  return violation.nodeCount ?? violation.nodes?.length ?? 0;
}

/**
 * Extracts unique CSS targets from a serialized axe violation.
 *
 * @param {{ nodes?: { target?: string[] }[] }} violation Axe violation.
 * @returns {string[]} CSS targets.
 */
function getAxeViolationTargets(violation) {
  const targets = new Set();

  for (const node of violation.nodes ?? []) {
    for (const target of node.target ?? []) {
      targets.add(target);
    }
  }

  return [...targets];
}

/**
 * Groups axe findings by rule across all scanned routes.
 *
 * @param {z.infer<typeof playwrightAccessibilityResultSchema>[]} accessibilityResults Accessibility results.
 * @returns {object[]} Rule summaries.
 */
function getAccessibilityRuleSummaries(accessibilityResults) {
  const summaries = new Map();

  for (const result of accessibilityResults) {
    const routePath = result.requestedPath ?? result.finalPath ?? result.slug;

    for (const violation of result.violations ?? []) {
      const id = violation.id ?? "unknown-rule";
      const nodeCount = getAxeViolationNodeCount(violation);
      const summary = summaries.get(id) ?? {
        description: "",
        help: "",
        helpUrl: "",
        id,
        impacts: new Set(),
        nodeCount: 0,
        routes: new Map(),
      };
      const routeSummary = summary.routes.get(routePath) ?? {
        nodeCount: 0,
        path: routePath,
      };

      summary.description ||= violation.description ?? "";
      summary.help ||= violation.help ?? "";
      summary.helpUrl ||= violation.helpUrl ?? "";
      summary.impacts.add(violation.impact ?? "unknown");
      summary.nodeCount += nodeCount;
      routeSummary.nodeCount += nodeCount;
      summary.routes.set(routePath, routeSummary);
      summaries.set(id, summary);
    }
  }

  return [...summaries.values()].sort((leftSummary, rightSummary) => {
    const impactDelta =
      getAxeImpactRank(getHighestAxeImpact(rightSummary.impacts)) -
      getAxeImpactRank(getHighestAxeImpact(leftSummary.impacts));

    if (impactDelta !== 0) {
      return impactDelta;
    }

    return (
      rightSummary.nodeCount - leftSummary.nodeCount ||
      leftSummary.id.localeCompare(rightSummary.id)
    );
  });
}

/**
 * Writes markdown rows for the accessibility rule summary table.
 *
 * @param {z.infer<typeof playwrightAccessibilityResultSchema>[]} accessibilityResults Accessibility results.
 * @returns {string} Markdown table rows.
 */
function formatAccessibilityRuleRows(accessibilityResults) {
  const summaries = getAccessibilityRuleSummaries(accessibilityResults);

  if (summaries.length === 0) {
    return "| No axe violations | n/a | n/a | 0 | n/a |";
  }

  return summaries
    .map((summary) => {
      const rule = summary.helpUrl
        ? `[${escapeMarkdownTableCell(summary.id)}](${summary.helpUrl})`
        : escapeMarkdownTableCell(summary.id);
      const routes = [...summary.routes.values()]
        .sort((leftRoute, rightRoute) =>
          String(leftRoute.path).localeCompare(String(rightRoute.path)),
        )
        .map(
          (route) => `${formatMarkdownCode(route.path)} (${route.nodeCount})`,
        )
        .join(", ");
      const help =
        escapeMarkdownTableCell(summary.help || summary.description) || "n/a";

      return `| ${rule} | ${getHighestAxeImpact(summary.impacts)} | ${routes} | ${summary.nodeCount} | ${help} |`;
    })
    .join("\n");
}

/**
 * Writes markdown rows for route-level accessibility findings.
 *
 * @param {z.infer<typeof playwrightAccessibilityResultSchema>[]} accessibilityResults Accessibility results.
 * @returns {string} Markdown table rows.
 */
function formatAccessibilityRouteFindingRows(accessibilityResults) {
  const rows = accessibilityResults
    .map((result) => {
      const violations = result.violations ?? [];
      const nodeCount = violations.reduce(
        (total, violation) => total + getAxeViolationNodeCount(violation),
        0,
      );

      return {
        nodeCount,
        path: result.requestedPath ?? result.finalPath ?? result.slug,
        rules: violations
          .map(
            (violation) =>
              `${escapeMarkdownTableCell(violation.id ?? "unknown-rule")} (${getAxeViolationNodeCount(violation)})`,
          )
          .join(", "),
        targets: violations.flatMap((violation) =>
          getAxeViolationTargets(violation),
        ),
      };
    })
    .filter((row) => row.nodeCount > 0)
    .sort((leftRow, rightRow) => {
      return (
        rightRow.nodeCount - leftRow.nodeCount ||
        String(leftRow.path).localeCompare(String(rightRow.path))
      );
    });

  if (rows.length === 0) {
    return "| No routes with axe violations | n/a | 0 | n/a |";
  }

  return rows
    .map((row) => {
      const targets = [...new Set(row.targets)]
        .slice(0, 3)
        .map((target) => formatMarkdownCode(target, 56))
        .join(", ");

      return `| ${formatMarkdownCode(row.path)} | ${row.rules || "n/a"} | ${row.nodeCount} | ${targets || "n/a"} |`;
    })
    .join("\n");
}

/**
 * Writes a compact markdown index for the Playwright lane.
 *
 * @param {{ accessibilityResults: unknown[]; baseUrl: string; lanes: string[]; outputDir: string; routeResults: unknown[]; routeSet: string; routes: import("./routes.mjs").AuditRoute[] }} options Index options.
 */
function writePlaywrightIndex({
  accessibilityResults,
  baseUrl,
  lanes,
  outputDir,
  routeResults,
  routeSet,
  routes,
}) {
  const routeSummary = routes.map((route) => `\`${route.path}\``).join(", ");
  const routeRows = routeResults
    .map((result) => {
      const route = result && typeof result === "object" ? result : {};
      const slug = "slug" in route ? String(route.slug) : "unknown";
      const requestedPath =
        "requestedPath" in route ? String(route.requestedPath) : "";
      const finalPath = "finalPath" in route ? String(route.finalPath) : "";
      const consoleErrors = Array.isArray(route.consoleErrors)
        ? route.consoleErrors.length
        : 0;
      const failedRequests = Array.isArray(route.failedRequests)
        ? route.failedRequests.length
        : 0;
      const screenshot =
        "screenshot" in route ? String(route.screenshot) : "screenshots";

      return `| \`${requestedPath}\` | \`${finalPath}\` | [${slug}](${screenshot}) | ${consoleErrors} | ${failedRequests} |`;
    })
    .join("\n");
  const accessibilityRows = accessibilityResults
    .map((result) => {
      const route = result && typeof result === "object" ? result : {};
      const slug = "slug" in route ? String(route.slug) : "unknown";
      const requestedPath =
        "requestedPath" in route ? String(route.requestedPath) : "";
      const finalPath = "finalPath" in route ? String(route.finalPath) : "";
      const violationCount =
        "violationCount" in route ? Number(route.violationCount) : 0;
      const failingViolationCount =
        "failingViolationCount" in route
          ? Number(route.failingViolationCount)
          : 0;
      const incompleteCount =
        "incompleteCount" in route ? Number(route.incompleteCount) : 0;

      return `| \`${requestedPath}\` | \`${finalPath}\` | [${slug}](accessibility/${slug}.json) | ${violationCount} | ${failingViolationCount} | ${incompleteCount} |`;
    })
    .join("\n");
  const routeHealthSection = lanes.includes("route-health")
    ? `## Route Health

| Requested route | Final route | Screenshot | Console errors | Failed requests |
| --- | --- | --- | ---: | ---: |
${routeRows || "| n/a | n/a | n/a | 0 | 0 |"}
`
    : "## Route Health\n\nSkipped.\n";
  const accessibilitySection = lanes.includes("accessibility")
    ? `## Accessibility

The axe lane scans WCAG A/AA tags and writes detailed JSON for each route. It runs in report-only mode unless \`AUDIT_AXE_FAIL_IMPACTS\` is set, for example \`critical,serious\`.

| Requested route | Final route | Result JSON | Axe violations | Enforced violations | Incomplete |
| --- | --- | --- | ---: | ---: | ---: |
${accessibilityRows || "| n/a | n/a | n/a | 0 | 0 | 0 |"}

### Findings By Rule

| Rule | Highest impact | Routes (nodes) | Nodes | Help |
| --- | --- | --- | ---: | --- |
${formatAccessibilityRuleRows(accessibilityResults)}

### Findings By Route

| Route | Rules (nodes) | Nodes | Example targets |
| --- | --- | ---: | --- |
${formatAccessibilityRouteFindingRows(accessibilityResults)}
`
    : "## Accessibility\n\nSkipped.\n";

  writeJson(path.join(outputDir, "manifest.json"), {
    accessibility: accessibilityResults,
    generatedAt: new Date().toISOString(),
    lanes,
    target: baseUrl,
    routeSet,
    routeSlugs: routes.map((route) => route.slug),
    routeInventory: routes,
    routes: routeResults,
  });

  writeText(
    path.join(outputDir, "index.md"),
    `# TeamForge Playwright Audit

Date: ${new Date().toISOString()}
Target: \`${baseUrl}\`
Lanes: ${lanes.map((lane) => `\`${lane}\``).join(", ")}

This ${routeSet} run checks ${routeSummary}.

${routeHealthSection}
${accessibilitySection}
`,
  );
}

/**
 * Runs the Playwright authenticated route-health lane.
 */
async function main() {
  loadAuditEnvFiles();

  const apiUrl = getApiUrl();
  const baseUrl = getAuditBaseUrl();
  const refreshCookieName = getRefreshCookieName();
  const outputDir =
    process.env.AUDIT_PLAYWRIGHT_OUTPUT_DIR ??
    path.join(cwd, "reports", `playwright-audit-${todayStamp()}`);
  const keepTokenFile = process.env.AUDIT_KEEP_TOKEN_FILE === "true";
  const lanes = getPlaywrightLanes();
  const routeSet = getPlaywrightRouteSet();

  mkdirSync(outputDir, { recursive: true });

  const tokens = await getAuditSession({ apiUrl, refreshCookieName });
  const routes = await resolvePlaywrightRoutes({
    accessToken: tokens.accessToken,
    apiUrl,
    lanes,
    routeSet,
  });
  const routeFilePath = writePlaywrightRouteFile({
    lanes,
    outputDir,
    routeSet,
    routes,
  });

  await assertBaseUrlReachable(baseUrl);
  writeAuditTokens(tokens);

  try {
    writeOutput(
      `PLAYWRIGHT ${baseUrl} ${lanes.join(",")} ${routeSet} ${routes.length} route(s)`,
    );
    await runPlaywright({ baseUrl, lanes, outputDir, routeFilePath });
    writePlaywrightIndex({
      accessibilityResults: readAccessibilityResults(outputDir),
      baseUrl,
      lanes,
      outputDir,
      routeResults: readRouteResults(outputDir),
      routeSet,
      routes,
    });
    writeOutput(`DONE Playwright route health audit: ${outputDir}`);
  } finally {
    if (!keepTokenFile) {
      removeAuditTokens();
    }
  }
}

main().catch((error) => {
  removeAuditTokens();
  writeError(error);
  process.exit(1);
});
