// @ts-check

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import {
  assertBaseUrlReachable,
  cwd,
  DEFAULT_SQUIRREL_BIN,
  ensureTrailingSlash,
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
import { resolveAuditRoutes } from "./routes.mjs";

/**
 * @typedef {object} AuditRoute
 * @property {string[]} [expectedFailedRequestPatterns] URL/text fragments for expected failed requests.
 * @property {string} path App route path to audit.
 * @property {string} slug File-safe route identifier used for reports.
 *
 * @typedef {object} AuditTokens
 * @property {string} accessToken JWT used by the frontend audit bootstrap.
 * @property {string} [refreshToken] Refresh token captured from JSON or cookie rotation.
 *
 * @typedef {object} SquirrelAuditContext
 * @property {string} apiUrl Backend API URL that includes `/api/v1`.
 * @property {string} baseUrl Frontend base URL.
 * @property {string} coverage SquirrelScan coverage mode.
 * @property {boolean} keepTokenFile Whether to leave audit token files in place.
 * @property {string} outputDir Directory for `.llm` reports.
 * @property {string} projectPrefix SquirrelScan project name prefix.
 * @property {AuditTokens} routeDiscoveryTokens Tokens used for route discovery and per-route bootstrap.
 * @property {AuditRoute[]} routes Routes to audit.
 * @property {boolean} skipExisting Whether to keep an existing route report.
 * @property {string} squirrelBin Squirrel binary path or command name.
 */

/**
 * @typedef {object} SquirrelAuditOptions
 * @property {string} baseUrl Frontend base URL.
 * @property {string} coverage SquirrelScan coverage mode.
 * @property {string} outputDir Directory for `.llm` reports.
 * @property {string} projectPrefix SquirrelScan project name prefix.
 * @property {string} routePath Route path to audit.
 * @property {boolean} skipExisting Whether to keep an existing route report.
 * @property {string} slug File-safe route identifier.
 * @property {string} squirrelBin Squirrel binary path or command name.
 */

/**
 * Runs SquirrelScan for one explicit app route.
 *
 * @param {SquirrelAuditOptions} options Audit options.
 * @returns {void}
 */
function runSquirrelAudit({
  baseUrl,
  coverage,
  outputDir,
  projectPrefix,
  routePath,
  skipExisting,
  slug,
  squirrelBin,
}) {
  const url = new URL(routePath, ensureTrailingSlash(baseUrl)).href;
  const outputPath = path.join(outputDir, `${slug}.llm`);

  if (skipExisting && existsSync(outputPath)) {
    writeOutput(`SKIP ${slug} ${outputPath}`);
    return;
  }

  const args = [
    "audit",
    url,
    "--coverage",
    coverage,
    "--format",
    "llm",
    "--output",
    outputPath,
    "--refresh",
    "-n",
    `${projectPrefix}-${slug}`,
  ];

  writeOutput(`AUDIT ${slug} ${url}`);

  assertSquirrelAuditResult({
    result: spawnSquirrelAudit(squirrelBin, args),
    url,
  });
}

/**
 * @param {string} squirrelBin Squirrel binary path or command name.
 * @param {string[]} args Squirrel CLI arguments.
 * @returns {import("node:child_process").SpawnSyncReturns<Buffer>}
 */
function spawnSquirrelAudit(squirrelBin, args) {
  return spawnSync(squirrelBin, args, {
    cwd,
    stdio: "inherit",
    windowsHide: true,
  });
}

/**
 * @param {{ result: import("node:child_process").SpawnSyncReturns<Buffer>; url: string }} options Result options.
 * @returns {void}
 */
function assertSquirrelAuditResult({ result, url }) {
  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`SquirrelScan failed for ${url}`);
  }
}

/**
 * Writes a route-to-report index for the SquirrelScan output folder.
 *
 * @param {{ baseUrl: string; coverage: string; outputDir: string; routes: AuditRoute[] }} options Index options.
 * @returns {void}
 */
function writeSquirrelIndex({ baseUrl, coverage, outputDir, routes }) {
  const rows = routes
    .map(
      (route) =>
        `| \`${route.path}\` | [${route.slug}.llm](${route.slug}.llm) |`,
    )
    .join("\n");

  writeJson(path.join(outputDir, "manifest.json"), {
    generatedAt: new Date().toISOString(),
    target: baseUrl,
    coverage,
    routes,
  });
  writeOutput(`Reports: ${outputDir}`);
  writeOutput(`Index: ${path.join(outputDir, "index.md")}`);

  const index = `# TeamForge Authenticated SquirrelScan

Date: ${new Date().toISOString()}
Target: \`${baseUrl}\`
Coverage: \`${coverage}\`

SquirrelScan uses one fresh audit login for the route batch and writes one LLM report per route. For this SPA, pair these files with the loaded-state route audit when checking protected screens.

| Route | Report |
| --- | --- |
${rows}
`;

  writeText(path.join(outputDir, "index.md"), index);
}

/**
 * Reads env/config, authenticates, and resolves the route list.
 *
 * @returns {Promise<SquirrelAuditContext>} Squirrel audit context.
 */
async function createSquirrelAuditContext() {
  loadAuditEnvFiles();

  const apiUrl = getApiUrl();
  const baseUrl = getAuditBaseUrl();
  const refreshCookieName = getRefreshCookieName();
  const routeDiscoveryTokens = await getAuditSession({
    apiUrl,
    refreshCookieName,
  });
  const routes = await resolveAuditRoutes({
    accessToken: routeDiscoveryTokens.accessToken,
    apiUrl,
  });

  return {
    apiUrl,
    baseUrl,
    coverage: process.env.AUDIT_COVERAGE ?? "full",
    keepTokenFile: process.env.AUDIT_KEEP_TOKEN_FILE === "true",
    outputDir:
      process.env.AUDIT_OUTPUT_DIR ??
      path.join(cwd, "reports", `squirrelscan-authenticated-${todayStamp()}`),
    projectPrefix:
      process.env.AUDIT_PROJECT_PREFIX ?? "teamforge-authenticated",
    routeDiscoveryTokens,
    routes,
    skipExisting: process.env.AUDIT_RESUME === "true",
    squirrelBin: process.env.SQUIRREL_BIN ?? DEFAULT_SQUIRREL_BIN,
  };
}

/**
 * @param {string} squirrelBin Squirrel binary path or command name.
 * @returns {void}
 */
function assertSquirrelBinaryAvailable(squirrelBin) {
  if (!existsSync(squirrelBin) && squirrelBin !== "squirrel") {
    throw new Error(`Squirrel binary not found: ${squirrelBin}`);
  }
}

/**
 * @param {SquirrelAuditContext} context Squirrel audit context.
 * @returns {Promise<void>}
 */
async function prepareSquirrelAuditRun({ baseUrl, outputDir, squirrelBin }) {
  assertSquirrelBinaryAvailable(squirrelBin);
  mkdirSync(outputDir, { recursive: true });
  await assertBaseUrlReachable(baseUrl);
}

/**
 * @param {SquirrelAuditContext} context Squirrel audit context.
 * @returns {void}
 */
function runSquirrelAuditBatch({
  baseUrl,
  coverage,
  outputDir,
  projectPrefix,
  routeDiscoveryTokens,
  routes,
  skipExisting,
  squirrelBin,
}) {
  for (const route of routes) {
    writeAuditTokens(routeDiscoveryTokens);

    runSquirrelAudit({
      baseUrl,
      coverage,
      outputDir,
      projectPrefix,
      routePath: route.path,
      skipExisting,
      slug: route.slug,
      squirrelBin,
    });
  }

  writeSquirrelIndex({ baseUrl, coverage, outputDir, routes });
  writeOutput(`DONE ${routes.length} authenticated route audits`);
}

/**
 * @param {boolean} keepTokenFile Whether to leave audit token files in place.
 * @returns {void}
 */
function removeAuditTokensUnlessKept(keepTokenFile) {
  if (!keepTokenFile) {
    removeAuditTokens();
  }
}

/**
 * Runs the authenticated route-by-route SquirrelScan audit.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const context = await createSquirrelAuditContext();
  await prepareSquirrelAuditRun(context);

  try {
    runSquirrelAuditBatch(context);
  } finally {
    removeAuditTokensUnlessKept(context.keepTokenFile);
  }
}

main().catch((error) => {
  writeError(error);
  process.exit(1);
});
