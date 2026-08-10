// @ts-check

import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
  runCommand,
  todayStamp,
  writeAuditTokens,
  writeError,
  writeJson,
  writeOutput,
  writeText,
} from "./helpers.mjs";
import {
  escapeMarkdownTableCell,
  formatMarkdownCode,
} from "./markdown-report.mjs";
import {
  PLAYWRIGHT_ACCESSIBILITY_ROUTE_SLUGS,
  PLAYWRIGHT_AUTHENTICATED_ROUTE_SLUGS,
  PLAYWRIGHT_SMOKE_ROUTE_SLUGS,
  resolveAuditRoutes,
} from "./routes.mjs";

const playwrightCliPath = fileURLToPath(
  import.meta.resolve("@playwright/test/cli"),
);
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

/**
 * @typedef {"route-health" | "accessibility"} PlaywrightLane
 * @typedef {"authenticated" | "smoke"} PlaywrightRouteSet
 * @typedef {z.infer<typeof playwrightRouteResultSchema>} PlaywrightRouteResult
 * @typedef {z.infer<typeof playwrightAccessibilityNodeSchema>} PlaywrightAccessibilityNode
 * @typedef {z.infer<typeof playwrightAccessibilityViolationSchema>} PlaywrightAccessibilityViolation
 * @typedef {z.infer<typeof playwrightAccessibilityResultSchema>} PlaywrightAccessibilityResult
 *
 * @typedef {object} PlaywrightRunOptions
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {PlaywrightLane[]} lanes Selected Playwright lanes.
 * @property {string} outputDir Output directory.
 * @property {string} routeFilePath Route manifest path.
 *
 * @typedef {object} PlaywrightRouteSelector
 * @property {(options: { routeSet: PlaywrightRouteSet }) => string[]} getSlugs Route slug resolver.
 * @property {PlaywrightLane} lane Lane that consumes the selected slugs.
 *
 * @typedef {object} PlaywrightRouteSlugOptions
 * @property {PlaywrightLane[]} lanes Selected Playwright lanes.
 * @property {PlaywrightRouteSet} routeSet Selected route set.
 *
 * @typedef {object} PlaywrightRouteResolveOptions
 * @property {string} accessToken Audit access token.
 * @property {string} apiUrl Backend API URL that includes `/api/v1`.
 * @property {PlaywrightLane[]} lanes Selected Playwright lanes.
 * @property {PlaywrightRouteSet} routeSet Selected route set.
 *
 * @typedef {object} PlaywrightRouteFileOptions
 * @property {PlaywrightLane[]} lanes Selected Playwright lanes.
 * @property {string} outputDir Output directory.
 * @property {PlaywrightRouteSet} routeSet Selected route set.
 * @property {import("./routes.mjs").AuditRoute[]} routes Route inventory.
 *
 * @typedef {object} PlaywrightAccessibilityRuleRouteSummary
 * @property {number} nodeCount Number of affected nodes for this route.
 * @property {string} path Route path.
 *
 * @typedef {object} PlaywrightAccessibilityRuleSummary
 * @property {string} description Axe rule description.
 * @property {string} help Axe help text.
 * @property {string} helpUrl Axe help URL.
 * @property {string} id Axe rule id.
 * @property {Set<string>} impacts Axe impacts observed for this rule.
 * @property {number} nodeCount Total affected node count.
 * @property {Map<string, PlaywrightAccessibilityRuleRouteSummary>} routes Affected routes by path.
 *
 * @typedef {"description" | "help" | "helpUrl"} PlaywrightAccessibilityRuleTextField
 *
 * @typedef {object} PlaywrightRouteResultRowFields
 * @property {number} consoleErrors Console error count.
 * @property {number} failedRequests Failed request count.
 * @property {string} finalPath Final route path.
 * @property {string} requestedPath Requested route path.
 * @property {string} screenshot Screenshot filename.
 * @property {string} slug Route slug.
 *
 * @typedef {object} PlaywrightAccessibilityResultRowFields
 * @property {number} failingViolationCount Count of failing violations.
 * @property {string} finalPath Final route path.
 * @property {number} incompleteCount Count of incomplete checks.
 * @property {string} requestedPath Requested route path.
 * @property {string} slug Route slug.
 * @property {number} violationCount Count of violations.
 *
 * @typedef {Record<string, unknown>} PlaywrightReportRow
 *
 * @typedef {object} PlaywrightRouteHealthSectionOptions
 * @property {PlaywrightLane[]} lanes Selected Playwright lanes.
 * @property {PlaywrightRouteResult[]} routeResults Route-health lane results.
 *
 * @typedef {object} PlaywrightAccessibilitySectionOptions
 * @property {PlaywrightAccessibilityResult[]} accessibilityResults Accessibility lane results.
 * @property {PlaywrightLane[]} lanes Selected Playwright lanes.
 *
 * @typedef {object} PlaywrightManifestOptions
 * @property {PlaywrightAccessibilityResult[]} accessibilityResults Accessibility lane results.
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {PlaywrightLane[]} lanes Selected Playwright lanes.
 * @property {string} outputDir Output directory.
 * @property {PlaywrightRouteResult[]} routeResults Route-health lane results.
 * @property {PlaywrightRouteSet} routeSet Selected route set.
 * @property {import("./routes.mjs").AuditRoute[]} routes Route inventory.
 *
 * @typedef {object} PlaywrightIndexOptions
 * @property {PlaywrightAccessibilityResult[]} accessibilityResults Accessibility lane results.
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {PlaywrightLane[]} lanes Selected Playwright lanes.
 * @property {PlaywrightRouteResult[]} routeResults Route-health lane results.
 * @property {PlaywrightRouteSet} routeSet Selected route set.
 * @property {import("./routes.mjs").AuditRoute[]} routes Route inventory.
 */

/** @type {PlaywrightLane[]} */
const defaultPlaywrightLanes = ["route-health"];
/** @type {Map<PlaywrightRouteSet, string[]>} */
const playwrightRouteHealthSlugsByRouteSet = new Map([
  ["authenticated", PLAYWRIGHT_AUTHENTICATED_ROUTE_SLUGS],
  ["smoke", PLAYWRIGHT_SMOKE_ROUTE_SLUGS],
]);
/** @type {PlaywrightRouteSelector[]} */
const playwrightRouteSlugSelectors = [
  {
    getSlugs: ({ routeSet }) =>
      playwrightRouteHealthSlugsByRouteSet.get(routeSet) ??
      PLAYWRIGHT_AUTHENTICATED_ROUTE_SLUGS,
    lane: "route-health",
  },
  {
    getSlugs: () => PLAYWRIGHT_ACCESSIBILITY_ROUTE_SLUGS,
    lane: "accessibility",
  },
];

/**
 * Runs Playwright and rejects on a failing route-health check.
 *
 * @param {PlaywrightRunOptions} options Run options.
 * @returns {Promise<void>}
 */
function runPlaywright({ baseUrl, lanes, outputDir, routeFilePath }) {
  return runCommand(
    process.execPath,
    [
      playwrightCliPath,
      "test",
      "--config",
      playwrightConfigPath,
      "--project",
      "chromium",
      "--grep",
      lanes.join("|"),
    ],
    {
      env: {
        ...process.env,
        AUDIT_BASE_URL: baseUrl,
        AUDIT_PLAYWRIGHT_OUTPUT_DIR: outputDir,
        AUDIT_PLAYWRIGHT_ROUTES_FILE: routeFilePath,
      },
      label: "Playwright audit",
      log: false,
    },
  );
}

/**
 * Selects the Playwright route set for this run.
 *
 * @returns {PlaywrightRouteSet} Route set name.
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
 * @returns {PlaywrightLane[]} Lane names.
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
    .filter(isPlaywrightLane);

  if (lanes.length === 0) {
    throw new Error(
      'No valid Playwright lanes selected. Use "route-health", "accessibility", or "all".',
    );
  }

  return [...new Set(lanes)];
}

/**
 * Narrows optional parsed lane values to real Playwright lanes.
 *
 * @param {PlaywrightLane | undefined} lane Parsed lane candidate.
 * @returns {lane is PlaywrightLane} Whether the lane parsed successfully.
 */
function isPlaywrightLane(lane) {
  return lane !== undefined;
}

/**
 * Adds route slugs to the selected route set.
 *
 * @param {Set<string>} routeSlugs Selected route slugs.
 * @param {string[]} slugs Route slugs to add.
 */
function addPlaywrightRouteSlugs(routeSlugs, slugs) {
  for (const slug of slugs) {
    routeSlugs.add(slug);
  }
}

/**
 * Returns route slugs for the selected Playwright route set.
 *
 * @param {PlaywrightRouteSlugOptions} options Route options.
 * @returns {string[]} Route slugs.
 */
function getPlaywrightRouteSlugs({ lanes, routeSet }) {
  const routeSlugs = new Set();

  for (const selector of playwrightRouteSlugSelectors) {
    if (lanes.includes(selector.lane)) {
      addPlaywrightRouteSlugs(routeSlugs, selector.getSlugs({ routeSet }));
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
 * @param {PlaywrightRouteResolveOptions} options Route options.
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
 * @param {PlaywrightRouteFileOptions} options Route file options.
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
 * @template T
 * @param {string} outputDir Playwright audit output directory.
 * @param {string} resultDirName Result directory name.
 * @param {z.ZodType<T>} schema Result schema.
 * @param {string} resultLabel Human-readable result label.
 * @returns {T[]} Result payloads.
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
 * @returns {PlaywrightRouteResult[]} Route result payloads.
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
 * @returns {PlaywrightAccessibilityResult[]} Accessibility result payloads.
 */
function readAccessibilityResults(outputDir) {
  return readJsonResults(
    outputDir,
    "accessibility",
    playwrightAccessibilityResultSchema,
    "accessibility",
  );
}

/** @type {Map<string, number>} */
const axeImpactRanks = new Map([
  ["critical", 4],
  ["serious", 3],
  ["moderate", 2],
  ["minor", 1],
  ["unknown", 0],
]);

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
 * @param {PlaywrightAccessibilityViolation} violation Axe violation.
 * @returns {number} Node count.
 */
function getAxeViolationNodeCount(violation) {
  return violation.nodeCount ?? violation.nodes?.length ?? 0;
}

/**
 * Extracts CSS targets from one serialized axe node.
 *
 * @param {PlaywrightAccessibilityNode} node Axe node.
 * @returns {string[]} CSS targets.
 */
function getAxeNodeTargets(node) {
  return node.target ?? [];
}

/**
 * Adds CSS targets from one axe node into the target set.
 *
 * @param {Set<string>} targets Accumulated CSS targets.
 * @param {PlaywrightAccessibilityNode} node Axe node.
 */
function addAxeNodeTargets(targets, node) {
  for (const target of getAxeNodeTargets(node)) {
    targets.add(target);
  }
}

/**
 * Extracts unique CSS targets from a serialized axe violation.
 *
 * @param {PlaywrightAccessibilityViolation} violation Axe violation.
 * @returns {string[]} CSS targets.
 */
function getAxeViolationTargets(violation) {
  /** @type {Set<string>} */
  const targets = new Set();

  for (const node of violation.nodes ?? []) {
    addAxeNodeTargets(targets, node);
  }

  return [...targets];
}

/**
 * Resolves the route path used in accessibility summaries.
 *
 * @param {PlaywrightAccessibilityResult} result Accessibility result.
 * @returns {string} Route path.
 */
function getAccessibilityRoutePath(result) {
  return result.requestedPath ?? result.finalPath ?? result.slug;
}

/**
 * Creates an empty accessibility rule summary.
 *
 * @param {string} id Axe rule id.
 * @returns {PlaywrightAccessibilityRuleSummary} Rule summary.
 */
function createAccessibilityRuleSummary(id) {
  return {
    description: "",
    help: "",
    helpUrl: "",
    id,
    impacts: new Set(),
    nodeCount: 0,
    routes: new Map(),
  };
}

/**
 * Gets or creates the aggregate summary for one axe rule.
 *
 * @param {Map<string, PlaywrightAccessibilityRuleSummary>} summaries Rule summaries by id.
 * @param {string} id Axe rule id.
 * @returns {PlaywrightAccessibilityRuleSummary} Rule summary.
 */
function getAccessibilityRuleSummary(summaries, id) {
  const existingSummary = summaries.get(id);

  if (existingSummary) {
    return existingSummary;
  }

  const summary = createAccessibilityRuleSummary(id);
  summaries.set(id, summary);
  return summary;
}

/**
 * Gets or creates the route-level portion of a rule summary.
 *
 * @param {PlaywrightAccessibilityRuleSummary} summary Rule summary.
 * @param {string} routePath Route path.
 * @returns {PlaywrightAccessibilityRuleRouteSummary} Route summary.
 */
function getAccessibilityRuleRouteSummary(summary, routePath) {
  return (
    summary.routes.get(routePath) ?? {
      nodeCount: 0,
      path: routePath,
    }
  );
}

/**
 * Resolves an axe rule id from a serialized violation.
 *
 * @param {PlaywrightAccessibilityViolation} violation Axe violation.
 * @returns {string} Rule id.
 */
function getAxeViolationRuleId(violation) {
  return violation.id ?? "unknown-rule";
}

/**
 * Resolves an axe impact from a serialized violation.
 *
 * @param {PlaywrightAccessibilityViolation} violation Axe violation.
 * @returns {string} Axe impact.
 */
function getAxeViolationImpact(violation) {
  return violation.impact ?? "unknown";
}

/**
 * Fills a summary text field once, preserving the first non-empty value.
 *
 * @param {PlaywrightAccessibilityRuleSummary} summary Rule summary.
 * @param {PlaywrightAccessibilityRuleTextField} field Summary field.
 * @param {unknown} value Candidate field value.
 */
function fillAccessibilityRuleText(summary, field, value) {
  if (summary[field]) {
    return;
  }

  summary[field] = typeof value === "string" ? value : "";
}

/**
 * Adds node counts to the aggregate rule and route summaries.
 *
 * @param {PlaywrightAccessibilityRuleSummary} summary Rule summary.
 * @param {PlaywrightAccessibilityRuleRouteSummary} routeSummary Route summary.
 * @param {number} nodeCount Node count.
 */
function addAccessibilityRuleNodeCount(summary, routeSummary, nodeCount) {
  summary.nodeCount += nodeCount;
  routeSummary.nodeCount += nodeCount;
}

/**
 * Adds one axe violation into the grouped rule summary map.
 *
 * @param {Map<string, PlaywrightAccessibilityRuleSummary>} summaries Rule summaries by id.
 * @param {string} routePath Route path.
 * @param {PlaywrightAccessibilityViolation} violation Axe violation.
 */
function addAccessibilityRuleViolation(summaries, routePath, violation) {
  const id = getAxeViolationRuleId(violation);
  const nodeCount = getAxeViolationNodeCount(violation);
  const summary = getAccessibilityRuleSummary(summaries, id);
  const routeSummary = getAccessibilityRuleRouteSummary(summary, routePath);

  fillAccessibilityRuleText(summary, "description", violation.description);
  fillAccessibilityRuleText(summary, "help", violation.help);
  fillAccessibilityRuleText(summary, "helpUrl", violation.helpUrl);
  summary.impacts.add(getAxeViolationImpact(violation));
  addAccessibilityRuleNodeCount(summary, routeSummary, nodeCount);
  summary.routes.set(routePath, routeSummary);
}

/**
 * Sorts accessibility rule summaries by impact, node count, then rule id.
 *
 * @param {PlaywrightAccessibilityRuleSummary} leftSummary Left summary.
 * @param {PlaywrightAccessibilityRuleSummary} rightSummary Right summary.
 * @returns {number} Sort order.
 */
function compareAccessibilityRuleSummaries(leftSummary, rightSummary) {
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
}

/**
 * Groups axe findings by rule across all scanned routes.
 *
 * @param {PlaywrightAccessibilityResult[]} accessibilityResults Accessibility results.
 * @returns {PlaywrightAccessibilityRuleSummary[]} Rule summaries.
 */
function getAccessibilityRuleSummaries(accessibilityResults) {
  /** @type {Map<string, PlaywrightAccessibilityRuleSummary>} */
  const summaries = new Map();

  for (const result of accessibilityResults) {
    const routePath = getAccessibilityRoutePath(result);

    for (const violation of result.violations ?? []) {
      addAccessibilityRuleViolation(summaries, routePath, violation);
    }
  }

  return [...summaries.values()].sort(compareAccessibilityRuleSummaries);
}

/**
 * Writes markdown rows for the accessibility rule summary table.
 *
 * @param {PlaywrightAccessibilityResult[]} accessibilityResults Accessibility results.
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
          leftRoute.path.localeCompare(rightRoute.path),
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
 * @param {PlaywrightAccessibilityResult[]} accessibilityResults Accessibility results.
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
 * Checks whether a parsed report row supports keyed field access.
 *
 * @param {unknown} result Parsed report row.
 * @returns {result is PlaywrightReportRow} Whether the value is a report row.
 */
function isPlaywrightReportRow(result) {
  return (
    Boolean(result) && typeof result === "object" && !Array.isArray(result)
  );
}

/**
 * Normalizes parsed report rows to an object for field access.
 *
 * @param {unknown} result Parsed report row.
 * @returns {PlaywrightReportRow} Report row object.
 */
function getReportRowObject(result) {
  if (isPlaywrightReportRow(result)) {
    return result;
  }

  return {};
}

/**
 * Reads a string field while preserving the old `in` fallback behavior.
 *
 * @param {PlaywrightReportRow} row Report row object.
 * @param {string} field Field name.
 * @param {string} fallback Fallback value.
 * @returns {string} Field value.
 */
function getReportStringField(row, field, fallback) {
  if (field in row) {
    return String(row[field]);
  }

  return fallback;
}

/**
 * Reads a number field while preserving the old `in` fallback behavior.
 *
 * @param {PlaywrightReportRow} row Report row object.
 * @param {string} field Field name.
 * @param {number} fallback Fallback value.
 * @returns {number} Field value.
 */
function getReportNumberField(row, field, fallback) {
  if (field in row) {
    return Number(row[field]);
  }

  return fallback;
}

/**
 * Counts an array field on a report row.
 *
 * @param {PlaywrightReportRow} row Report row object.
 * @param {string} field Field name.
 * @returns {number} Array length.
 */
function getReportArrayFieldCount(row, field) {
  const value = row[field];

  if (Array.isArray(value)) {
    return value.length;
  }

  return 0;
}

/**
 * Extracts route-health row fields.
 *
 * @param {unknown} result Route health result.
 * @returns {PlaywrightRouteResultRowFields} Row fields.
 */
function getPlaywrightRouteResultRowFields(result) {
  const route = getReportRowObject(result);

  return {
    consoleErrors: getReportArrayFieldCount(route, "consoleErrors"),
    failedRequests: getReportArrayFieldCount(route, "failedRequests"),
    finalPath: getReportStringField(route, "finalPath", ""),
    requestedPath: getReportStringField(route, "requestedPath", ""),
    screenshot: getReportStringField(route, "screenshot", "screenshots"),
    slug: getReportStringField(route, "slug", "unknown"),
  };
}

/**
 * Extracts accessibility row fields.
 *
 * @param {unknown} result Accessibility result.
 * @returns {PlaywrightAccessibilityResultRowFields} Row fields.
 */
function getPlaywrightAccessibilityResultRowFields(result) {
  const route = getReportRowObject(result);

  return {
    failingViolationCount: getReportNumberField(
      route,
      "failingViolationCount",
      0,
    ),
    finalPath: getReportStringField(route, "finalPath", ""),
    incompleteCount: getReportNumberField(route, "incompleteCount", 0),
    requestedPath: getReportStringField(route, "requestedPath", ""),
    slug: getReportStringField(route, "slug", "unknown"),
    violationCount: getReportNumberField(route, "violationCount", 0),
  };
}

/**
 * Writes one route-health result row for the Playwright index.
 *
 * @param {unknown} result Route health result.
 * @returns {string} Markdown table row.
 */
function formatPlaywrightRouteResultRow(result) {
  const {
    consoleErrors,
    failedRequests,
    finalPath,
    requestedPath,
    screenshot,
    slug,
  } = getPlaywrightRouteResultRowFields(result);

  return `| \`${requestedPath}\` | \`${finalPath}\` | [${slug}](${screenshot}) | ${consoleErrors} | ${failedRequests} |`;
}

/**
 * Writes route-health result rows for the Playwright index.
 *
 * @param {PlaywrightRouteResult[]} routeResults Route health results.
 * @returns {string} Markdown table rows.
 */
function formatPlaywrightRouteResultRows(routeResults) {
  return routeResults.map(formatPlaywrightRouteResultRow).join("\n");
}

/**
 * Writes one accessibility result row for the Playwright index.
 *
 * @param {unknown} result Accessibility result.
 * @returns {string} Markdown table row.
 */
function formatPlaywrightAccessibilityResultRow(result) {
  const {
    failingViolationCount,
    finalPath,
    incompleteCount,
    requestedPath,
    slug,
    violationCount,
  } = getPlaywrightAccessibilityResultRowFields(result);

  return `| \`${requestedPath}\` | \`${finalPath}\` | [${slug}](accessibility/${slug}.json) | ${violationCount} | ${failingViolationCount} | ${incompleteCount} |`;
}

/**
 * Writes accessibility result rows for the Playwright index.
 *
 * @param {PlaywrightAccessibilityResult[]} accessibilityResults Accessibility results.
 * @returns {string} Markdown table rows.
 */
function formatPlaywrightAccessibilityResultRows(accessibilityResults) {
  return accessibilityResults
    .map(formatPlaywrightAccessibilityResultRow)
    .join("\n");
}

/**
 * Returns whether a Playwright lane is selected.
 *
 * @param {PlaywrightLane[]} lanes Selected lanes.
 * @param {PlaywrightLane} lane Lane to check.
 * @returns {boolean} Whether the lane is selected.
 */
function hasPlaywrightLane(lanes, lane) {
  return lanes.includes(lane);
}

/**
 * Formats the route list shown in the markdown introduction.
 *
 * @param {import("./routes.mjs").AuditRoute[]} routes Route inventory.
 * @returns {string} Markdown route summary.
 */
function formatPlaywrightRouteSummary(routes) {
  return routes.map((route) => `\`${route.path}\``).join(", ");
}

/**
 * Formats the route-health markdown section.
 *
 * @param {PlaywrightRouteHealthSectionOptions} options Section options.
 * @returns {string} Markdown section.
 */
function formatRouteHealthSection({ lanes, routeResults }) {
  if (!hasPlaywrightLane(lanes, "route-health")) {
    return "## Route Health\n\nSkipped.\n";
  }

  const routeRows = formatPlaywrightRouteResultRows(routeResults);

  return `## Route Health

| Requested route | Final route | Screenshot | Console errors | Failed requests |
| --- | --- | --- | ---: | ---: |
${routeRows || "| n/a | n/a | n/a | 0 | 0 |"}
`;
}

/**
 * Formats the accessibility markdown section.
 *
 * @param {PlaywrightAccessibilitySectionOptions} options Section options.
 * @returns {string} Markdown section.
 */
function formatAccessibilitySection({ accessibilityResults, lanes }) {
  if (!hasPlaywrightLane(lanes, "accessibility")) {
    return "## Accessibility\n\nSkipped.\n";
  }

  const accessibilityRows =
    formatPlaywrightAccessibilityResultRows(accessibilityResults);

  return `## Accessibility

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
`;
}

/**
 * Writes the JSON manifest for the Playwright audit.
 *
 * @param {PlaywrightManifestOptions} options Manifest options.
 */
function writePlaywrightManifest({
  accessibilityResults,
  baseUrl,
  lanes,
  outputDir,
  routeResults,
  routeSet,
  routes,
}) {
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
}

/**
 * Formats the markdown index for the Playwright audit.
 *
 * @param {PlaywrightIndexOptions} options Index options.
 * @returns {string} Markdown index.
 */
function formatPlaywrightIndex({
  accessibilityResults,
  baseUrl,
  lanes,
  routeResults,
  routeSet,
  routes,
}) {
  const routeSummary = formatPlaywrightRouteSummary(routes);
  const routeHealthSection = formatRouteHealthSection({
    lanes,
    routeResults,
  });
  const accessibilitySection = formatAccessibilitySection({
    accessibilityResults,
    lanes,
  });

  return `# Findafew Playwright Audit

Date: ${new Date().toISOString()}
Target: \`${baseUrl}\`
Lanes: ${lanes.map((lane) => `\`${lane}\``).join(", ")}

This ${routeSet} run checks ${routeSummary}.

${routeHealthSection}
${accessibilitySection}
`;
}

/**
 * Writes a compact markdown index for the Playwright lane.
 *
 * @param {PlaywrightManifestOptions} options Index options.
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
  writePlaywrightManifest({
    accessibilityResults,
    baseUrl,
    lanes,
    outputDir,
    routeResults,
    routeSet,
    routes,
  });

  writeText(
    path.join(outputDir, "index.md"),
    formatPlaywrightIndex({
      accessibilityResults,
      baseUrl,
      lanes,
      routeResults,
      routeSet,
      routes,
    }),
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
    path.join(cwd, "temp", `playwright-audit-${todayStamp()}`);
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
