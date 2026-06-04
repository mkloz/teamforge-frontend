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
  getRefreshCookieName,
  loadAuditEnvFiles,
  loginAuditUser,
  refreshAuditTokens,
  removeAuditTokens,
  todayStamp,
  writeAuditTokens,
  writeError,
  writeJson,
  writeOutput,
  writeText,
} from "./helpers.mjs";
import { AUDIT_ROUTES } from "./routes.mjs";

/**
 * @typedef {object} SquirrelAuditOptions
 * @property {string} baseUrl Frontend base URL.
 * @property {string} coverage SquirrelScan coverage mode.
 * @property {string} outputDir Directory for `.llm` reports.
 * @property {string} projectPrefix SquirrelScan project name prefix.
 * @property {string} routePath Route path to audit.
 * @property {string} slug File-safe route identifier.
 * @property {string} squirrelBin Squirrel binary path or command name.
 */

/**
 * Runs SquirrelScan for one explicit app route.
 *
 * @param {SquirrelAuditOptions} options Audit options.
 */
function runSquirrelAudit({
  baseUrl,
  coverage,
  outputDir,
  projectPrefix,
  routePath,
  slug,
  squirrelBin,
}) {
  const url = new URL(routePath, ensureTrailingSlash(baseUrl)).href;
  const outputPath = path.join(outputDir, `${slug}.llm`);
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

  const result = spawnSync(squirrelBin, args, {
    cwd,
    stdio: "inherit",
    windowsHide: true,
  });

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
 * @param {{ baseUrl: string; coverage: string; outputDir: string }} options Index options.
 */
function writeSquirrelIndex({ baseUrl, coverage, outputDir }) {
  const rows = AUDIT_ROUTES.map(
    (route) => `| \`${route.path}\` | [${route.slug}.llm](${route.slug}.llm) |`,
  ).join("\n");

  writeJson(path.join(outputDir, "manifest.json"), {
    generatedAt: new Date().toISOString(),
    target: baseUrl,
    coverage,
    routes: AUDIT_ROUTES,
  });
  writeOutput(`Reports: ${outputDir}`);
  writeOutput(`Index: ${path.join(outputDir, "index.md")}`);

  const index = `# TeamForge Authenticated SquirrelScan

Date: ${new Date().toISOString()}
Target: \`${baseUrl}\`
Coverage: \`${coverage}\`

SquirrelScan crawls each explicit route and writes one LLM report per route. For this SPA, pair these files with the loaded-state route audit when checking protected screens.

| Route | Report |
| --- | --- |
${rows}
`;

  writeText(path.join(outputDir, "index.md"), index);
}

/**
 * Runs the authenticated route-by-route SquirrelScan audit.
 *
 * @returns {Promise<void>}
 */
async function main() {
  loadAuditEnvFiles();

  const apiUrl = getApiUrl();
  const baseUrl = getAuditBaseUrl();
  const refreshCookieName = getRefreshCookieName();
  let tokens = await loginAuditUser({ apiUrl, refreshCookieName });
  const coverage = process.env.AUDIT_COVERAGE ?? "full";
  const outputDir =
    process.env.AUDIT_OUTPUT_DIR ??
    path.join(cwd, "reports", `squirrelscan-authenticated-${todayStamp()}`);
  const projectPrefix =
    process.env.AUDIT_PROJECT_PREFIX ?? "teamforge-authenticated";
  const squirrelBin = process.env.SQUIRREL_BIN ?? DEFAULT_SQUIRREL_BIN;
  const keepTokenFile = process.env.AUDIT_KEEP_TOKEN_FILE === "true";

  if (!existsSync(squirrelBin) && squirrelBin !== "squirrel") {
    throw new Error(`Squirrel binary not found: ${squirrelBin}`);
  }

  mkdirSync(outputDir, { recursive: true });
  await assertBaseUrlReachable(baseUrl);

  try {
    for (const route of AUDIT_ROUTES) {
      // eslint-disable-next-line no-await-in-loop -- Tokens intentionally rotate before each route.
      tokens = await refreshAuditTokens(tokens, {
        apiUrl,
        refreshCookieName,
      });
      writeAuditTokens(tokens);

      runSquirrelAudit({
        baseUrl,
        coverage,
        outputDir,
        projectPrefix,
        routePath: route.path,
        slug: route.slug,
        squirrelBin,
      });
    }

    writeSquirrelIndex({ baseUrl, coverage, outputDir });
    writeOutput(`DONE ${AUDIT_ROUTES.length} authenticated route audits`);
  } finally {
    if (!keepTokenFile) {
      removeAuditTokens();
    }
  }
}

main().catch((error) => {
  writeError(error);
  process.exit(1);
});
