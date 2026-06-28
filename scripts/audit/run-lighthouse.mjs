// @ts-check

import { mkdirSync } from "node:fs";
import path from "node:path";
import { launch } from "chrome-launcher";
import lighthouse, { desktopConfig, generateReport } from "lighthouse";
import {
  assertBaseUrlReachable,
  cwd,
  envFlag,
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
import { escapeMarkdownTableCell, formatScore } from "./markdown-report.mjs";
import {
  LIGHTHOUSE_PUBLIC_ROUTE_SLUGS,
  LIGHTHOUSE_ROUTE_SLUGS,
  resolveAuditRoutes,
} from "./routes.mjs";

/**
 * @typedef {object} CommaSeparatedEnvListOptions
 * @property {string} emptyMessage Error message when the env value is empty.
 * @property {string[]} fallback Values used when the env variable is absent.
 * @property {string} name Environment variable name.
 *
 * @typedef {object} LighthouseRouteResolveOptions
 * @property {string} accessToken Audit access token.
 * @property {string} apiUrl Backend API URL that includes `/api/v1`.
 * @property {string[]} routeSlugs Selected route slugs.
 *
 * @typedef {object} LighthouseRouteUrlOptions
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {string} routePath Route path to navigate.
 *
 * @typedef {object} LighthouseReportPaths
 * @property {string} htmlReportPath HTML report path.
 * @property {string} jsonReportPath JSON report path.
 * @property {string} summaryReportPath Summary JSON report path.
 *
 * @typedef {object} LighthouseCategoryScores
 * @property {number | null} accessibility Accessibility score percentage.
 * @property {number | null} bestPractices Best Practices score percentage.
 * @property {number | null} performance Performance score percentage.
 * @property {number | null} seo SEO score percentage.
 *
 * @typedef {object} LighthouseTimingSummaries
 * @property {string} cumulativeLayoutShift Cumulative layout shift display value.
 * @property {string} firstContentfulPaint First contentful paint display value.
 * @property {string} largestContentfulPaint Largest contentful paint display value.
 * @property {string} speedIndex Speed index display value.
 * @property {string} totalBlockingTime Total blocking time display value.
 *
 * @typedef {object} LighthouseRouteSummary
 * @property {number | null} accessibility Accessibility score percentage.
 * @property {number | null} bestPractices Best Practices score percentage.
 * @property {string[]} categories Lighthouse category ids.
 * @property {string} cumulativeLayoutShift Cumulative layout shift display value.
 * @property {string} finalUrl Final displayed URL.
 * @property {string} firstContentfulPaint First contentful paint display value.
 * @property {string} htmlReport HTML report filename.
 * @property {string} jsonReport JSON report filename.
 * @property {string} largestContentfulPaint Largest contentful paint display value.
 * @property {number | null} performance Performance score percentage.
 * @property {string} requestedPath Requested app route path.
 * @property {string} requestedUrl Requested absolute URL.
 * @property {number | null} seo SEO score percentage.
 * @property {string} slug Route slug.
 * @property {string} speedIndex Speed index display value.
 * @property {string[]} topOpportunities Top Lighthouse opportunity titles.
 * @property {string} totalBlockingTime Total blocking time display value.
 *
 * @typedef {object} LighthouseRouteAuditOptions
 * @property {string[]} categories Lighthouse category ids.
 * @property {number} chromePort Chrome debugging port.
 * @property {string} outputDir Output directory.
 * @property {import("./routes.mjs").AuditRoute} route Route under audit.
 * @property {string} url Absolute route URL.
 *
 * @typedef {object} LighthouseNavigationOptions
 * @property {string[]} categories Lighthouse category ids.
 * @property {number} chromePort Chrome debugging port.
 * @property {string} url Absolute route URL.
 *
 * @typedef {object} LighthouseRouteSummaryOptions
 * @property {string[]} categories Lighthouse category ids.
 * @property {import("lighthouse").Result} lhr Lighthouse result.
 * @property {LighthouseReportPaths} reportPaths Report output paths.
 * @property {import("./routes.mjs").AuditRoute} route Route under audit.
 * @property {string} url Absolute route URL.
 *
 * @typedef {object} LighthouseRouteArtifactOptions
 * @property {string} htmlReport Rendered HTML report.
 * @property {import("lighthouse").Result} lhr Lighthouse result.
 * @property {LighthouseReportPaths} reportPaths Report output paths.
 * @property {LighthouseRouteSummary} summary Route summary.
 *
 * @typedef {object} LighthouseRunnerResult
 * @property {import("lighthouse").Result} [lhr] Lighthouse result.
 *
 * @typedef {object} LaunchedLighthouseChrome
 * @property {() => void} kill Stops the Chrome process.
 * @property {number} port Chrome debugging port.
 *
 * @typedef {object} LighthouseIndexOptions
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {string[]} categories Lighthouse category ids.
 * @property {string} outputDir Output directory.
 * @property {LighthouseRouteSummary[]} results Route summaries.
 *
 * @typedef {object} LighthouseIndexMarkdownOptions
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {string[]} categories Lighthouse category ids.
 * @property {LighthouseRouteSummary[]} results Route summaries.
 *
 * @typedef {object} LighthouseRunConfig
 * @property {string} apiUrl Backend API URL that includes `/api/v1`.
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {string[]} categories Lighthouse category ids.
 * @property {boolean} keepTokenFile Whether to leave audit tokens on disk.
 * @property {string} outputDir Output directory.
 * @property {string} refreshCookieName Refresh cookie name.
 * @property {string[]} routeSlugs Selected route slugs.
 * @property {boolean} useAuthSession Whether Lighthouse needs auth tokens.
 *
 * @typedef {object} LighthouseAuditTokenOptions
 * @property {string} apiUrl Backend API URL that includes `/api/v1`.
 * @property {string} refreshCookieName Refresh cookie name.
 * @property {boolean} useAuthSession Whether Lighthouse needs auth tokens.
 *
 * @typedef {object} LighthouseAuditTokens
 * @property {string} accessToken Audit access token.
 * @property {string} [refreshToken] Optional refresh token.
 *
 * @typedef {object} LighthouseRunRoutesOptions
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {string[]} categories Lighthouse category ids.
 * @property {number} chromePort Chrome debugging port.
 * @property {string} outputDir Output directory.
 * @property {import("./routes.mjs").AuditRoute[]} routes Routes under audit.
 */

/** @type {string[]} */
const defaultLighthouseCategories = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
];
/** @type {string[]} */
const defaultChromeFlags = [
  "--headless=new",
  "--disable-dev-shm-usage",
  "--disable-extensions",
  "--disable-gpu",
  "--no-first-run",
  "--window-size=1365,768",
];

/**
 * Reads a comma-separated env list with a fallback.
 *
 * @param {CommaSeparatedEnvListOptions} options Env list options.
 * @returns {string[]} Resolved values.
 */
function getCommaSeparatedEnvList({ emptyMessage, fallback, name }) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const values = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length === 0) {
    throw new Error(emptyMessage);
  }

  return values;
}

/**
 * Selects route slugs for this Lighthouse run.
 *
 * @returns {string[]} Route slugs.
 */
function getLighthouseRouteSlugs() {
  return getCommaSeparatedEnvList({
    emptyMessage: "AUDIT_LIGHTHOUSE_ROUTE_SLUGS did not include any slugs.",
    fallback: LIGHTHOUSE_ROUTE_SLUGS,
    name: "AUDIT_LIGHTHOUSE_ROUTE_SLUGS",
  });
}

/**
 * Selects Lighthouse categories for this run.
 *
 * @returns {string[]} Lighthouse category ids.
 */
function getLighthouseCategories() {
  return getCommaSeparatedEnvList({
    emptyMessage: "AUDIT_LIGHTHOUSE_CATEGORIES did not include any categories.",
    fallback: defaultLighthouseCategories,
    name: "AUDIT_LIGHTHOUSE_CATEGORIES",
  });
}

/**
 * Returns whether Chrome should ignore certificate errors.
 *
 * @returns {boolean} Whether certificate errors are ignored.
 */
function shouldIgnoreLighthouseCertificateErrors() {
  return process.env.AUDIT_LIGHTHOUSE_IGNORE_CERT_ERRORS !== "false";
}

/**
 * Returns whether Chrome should run with no-sandbox.
 *
 * @returns {boolean} Whether no-sandbox is enabled.
 */
function shouldUseChromeNoSandbox() {
  return process.env.CI === "true";
}

/**
 * Resolves the Chrome flags used by Lighthouse.
 *
 * @returns {string[]} Chrome launch flags.
 */
function getLighthouseChromeFlags() {
  const flags = [...defaultChromeFlags];

  if (shouldIgnoreLighthouseCertificateErrors()) {
    flags.push("--ignore-certificate-errors");
  }

  if (shouldUseChromeNoSandbox()) {
    flags.push("--no-sandbox");
  }

  return flags;
}

/**
 * Reads an explicit Lighthouse auth requirement override.
 *
 * @returns {boolean | null} Auth override or null when unset.
 */
function getExplicitLighthouseAuthRequirement() {
  if (process.env.AUDIT_LIGHTHOUSE_AUTH_REQUIRED === undefined) {
    return null;
  }

  return envFlag("AUDIT_LIGHTHOUSE_AUTH_REQUIRED", true);
}

/**
 * Returns whether selected Lighthouse routes include private routes.
 *
 * @param {string[]} routeSlugs Selected route slugs.
 * @returns {boolean} Whether any selected slug is private.
 */
function hasPrivateLighthouseRoutes(routeSlugs) {
  const publicRouteSlugs = new Set(LIGHTHOUSE_PUBLIC_ROUTE_SLUGS);

  return routeSlugs.some((slug) => !publicRouteSlugs.has(slug));
}

/**
 * Checks whether selected Lighthouse routes need an authenticated session.
 *
 * @param {string[]} routeSlugs Selected route slugs.
 * @returns {boolean} Whether auth is required.
 */
function shouldUseAuthSession(routeSlugs) {
  const explicitRequirement = getExplicitLighthouseAuthRequirement();

  return explicitRequirement ?? hasPrivateLighthouseRoutes(routeSlugs);
}

/**
 * Resolves and filters routes for the Lighthouse lane.
 *
 * @param {LighthouseRouteResolveOptions} options Route options.
 * @returns {Promise<import("./routes.mjs").AuditRoute[]>} Lighthouse route inventory.
 */
async function resolveLighthouseRoutes({ accessToken, apiUrl, routeSlugs }) {
  const selectedRouteSlugs = new Set(routeSlugs);
  const routes = await resolveAuditRoutes({ accessToken, apiUrl });
  const selectedRoutes = routes.filter((route) =>
    selectedRouteSlugs.has(route.slug),
  );

  if (selectedRoutes.length === 0) {
    throw new Error("No Lighthouse routes were selected.");
  }

  return selectedRoutes;
}

/**
 * Returns the route URL for a Lighthouse navigation.
 *
 * @param {LighthouseRouteUrlOptions} options URL options.
 * @returns {string} Absolute URL.
 */
function getRouteUrl({ baseUrl, routePath }) {
  return new URL(routePath.replace(/^\/+/u, ""), ensureUrlSlash(baseUrl)).href;
}

/**
 * Ensures a URL ends with a slash for URL resolution.
 *
 * @param {string} value URL value.
 * @returns {string} Slash-terminated URL.
 */
function ensureUrlSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

/**
 * Converts a Lighthouse category score to a display percentage.
 *
 * @param {unknown} score Lighthouse score.
 * @returns {number | null} Score percentage.
 */
function getScorePercent(score) {
  return typeof score === "number" ? Math.round(score * 100) : null;
}

/**
 * Reads a Lighthouse audit display value.
 *
 * @param {import("lighthouse").Result} lhr Lighthouse result.
 * @param {string} auditId Audit id.
 * @returns {string} Display value.
 */
function getAuditDisplayValue(lhr, auditId) {
  return lhr.audits[auditId]?.displayValue ?? "n/a";
}

/**
 * Returns top Lighthouse opportunities for a route.
 *
 * @param {import("lighthouse").Result} lhr Lighthouse result.
 * @returns {string[]} Opportunity summaries.
 */
function getTopOpportunities(lhr) {
  return Object.values(lhr.audits)
    .filter((audit) => audit.details?.type === "opportunity")
    .filter((audit) => typeof audit.numericValue === "number")
    .filter((audit) => (audit.numericValue ?? 0) > 0)
    .sort((leftAudit, rightAudit) => {
      return (rightAudit.numericValue ?? 0) - (leftAudit.numericValue ?? 0);
    })
    .slice(0, 3)
    .map((audit) => audit.title);
}

/**
 * Runs Lighthouse for one route and writes route artifacts.
 *
 * @param {LighthouseRouteAuditOptions} options Audit options.
 * @returns {Promise<LighthouseRouteSummary>} Route summary.
 */
async function runLighthouseRoute({
  categories,
  chromePort,
  outputDir,
  route,
  url,
}) {
  const lhr = await runLighthouseNavigation({ categories, chromePort, url });
  const htmlReport = generateReport(lhr, "html");
  const reportPaths = getLighthouseReportPaths(outputDir, route.slug);
  const summary = buildLighthouseRouteSummary({
    categories,
    lhr,
    reportPaths,
    route,
    url,
  });

  writeLighthouseRouteArtifacts({
    htmlReport,
    lhr,
    reportPaths,
    summary,
  });

  return summary;
}

/**
 * Runs one Lighthouse navigation and returns the Lighthouse result.
 *
 * @param {LighthouseNavigationOptions} options Navigation options.
 * @returns {Promise<import("lighthouse").Result>} Lighthouse result.
 */
async function runLighthouseNavigation({ categories, chromePort, url }) {
  const runnerResult = await lighthouse(
    url,
    {
      logLevel: "error",
      onlyCategories: categories,
      output: "json",
      port: chromePort,
    },
    desktopConfig,
  );

  return getLighthouseResult(runnerResult, url);
}

/**
 * Extracts the Lighthouse result from the runner response.
 *
 * @param {LighthouseRunnerResult | undefined} runnerResult Lighthouse runner result.
 * @param {string} url URL used for the run.
 * @returns {import("lighthouse").Result} Lighthouse result.
 */
function getLighthouseResult(runnerResult, url) {
  if (runnerResult?.lhr) {
    return runnerResult.lhr;
  }

  throw new Error(`Lighthouse did not return a result for ${url}`);
}

/**
 * Builds the report paths for one route.
 *
 * @param {string} outputDir Output directory.
 * @param {string} slug Route slug.
 * @returns {LighthouseReportPaths} Report paths.
 */
function getLighthouseReportPaths(outputDir, slug) {
  return {
    htmlReportPath: path.join(outputDir, `${slug}.html`),
    jsonReportPath: path.join(outputDir, `${slug}.json`),
    summaryReportPath: path.join(outputDir, `${slug}-summary.json`),
  };
}

/**
 * Builds the serializable route summary written beside reports.
 *
 * @param {LighthouseRouteSummaryOptions} options Summary options.
 * @returns {LighthouseRouteSummary} Route summary.
 */
function buildLighthouseRouteSummary({
  categories,
  lhr,
  reportPaths,
  route,
  url,
}) {
  return {
    ...getLighthouseCategoryScores(lhr),
    categories,
    ...getLighthouseTimingSummaries(lhr),
    finalUrl: lhr.finalDisplayedUrl ?? lhr.finalUrl,
    jsonReport: path.basename(reportPaths.jsonReportPath),
    htmlReport: path.basename(reportPaths.htmlReportPath),
    requestedPath: route.path,
    requestedUrl: url,
    slug: route.slug,
    topOpportunities: getTopOpportunities(lhr),
  };
}

/**
 * Extracts all tracked Lighthouse category scores.
 *
 * @param {import("lighthouse").Result} lhr Lighthouse result.
 * @returns {LighthouseCategoryScores} Category score summary.
 */
function getLighthouseCategoryScores(lhr) {
  return {
    accessibility: getLighthouseCategoryScore(lhr, "accessibility"),
    bestPractices: getLighthouseCategoryScore(lhr, "best-practices"),
    performance: getLighthouseCategoryScore(lhr, "performance"),
    seo: getLighthouseCategoryScore(lhr, "seo"),
  };
}

/**
 * Extracts one Lighthouse category score.
 *
 * @param {import("lighthouse").Result} lhr Lighthouse result.
 * @param {string} categoryId Lighthouse category id.
 * @returns {number | null} Category score percentage.
 */
function getLighthouseCategoryScore(lhr, categoryId) {
  return getScorePercent(lhr.categories[categoryId]?.score);
}

/**
 * Extracts tracked Lighthouse timing display values.
 *
 * @param {import("lighthouse").Result} lhr Lighthouse result.
 * @returns {LighthouseTimingSummaries} Timing display values.
 */
function getLighthouseTimingSummaries(lhr) {
  return {
    cumulativeLayoutShift: getAuditDisplayValue(lhr, "cumulative-layout-shift"),
    firstContentfulPaint: getAuditDisplayValue(lhr, "first-contentful-paint"),
    largestContentfulPaint: getAuditDisplayValue(
      lhr,
      "largest-contentful-paint",
    ),
    speedIndex: getAuditDisplayValue(lhr, "speed-index"),
    totalBlockingTime: getAuditDisplayValue(lhr, "total-blocking-time"),
  };
}

/**
 * Writes JSON, HTML, and summary route artifacts.
 *
 * @param {LighthouseRouteArtifactOptions} options Artifact write options.
 */
function writeLighthouseRouteArtifacts({
  htmlReport,
  lhr,
  reportPaths,
  summary,
}) {
  writeJson(reportPaths.jsonReportPath, lhr);
  writeText(reportPaths.htmlReportPath, htmlReport);
  writeJson(reportPaths.summaryReportPath, summary);
}

/**
 * Formats opportunity titles for a markdown table cell.
 *
 * @param {string[]} opportunities Opportunity titles.
 * @returns {string} Markdown table cell content.
 */
function formatLighthouseOpportunityList(opportunities) {
  if (opportunities.length === 0) {
    return "n/a";
  }

  return opportunities.map(escapeMarkdownTableCell).join(", ");
}

/**
 * Formats one Lighthouse result as a markdown table row.
 *
 * @param {LighthouseRouteSummary} result Route summary.
 * @returns {string} Markdown table row.
 */
function formatLighthouseResultRow(result) {
  const opportunities = formatLighthouseOpportunityList(
    result.topOpportunities,
  );

  return `| \`${result.requestedPath}\` | [HTML](${result.htmlReport}) / [JSON](${result.jsonReport}) | ${formatScore(result.performance)} | ${formatScore(result.accessibility)} | ${formatScore(result.bestPractices)} | ${formatScore(result.seo)} | ${escapeMarkdownTableCell(result.largestContentfulPaint)} | ${escapeMarkdownTableCell(result.cumulativeLayoutShift)} | ${opportunities} |`;
}

/**
 * Formats all Lighthouse results as markdown table rows.
 *
 * @param {LighthouseRouteSummary[]} results Route summaries.
 * @returns {string} Markdown table rows.
 */
function formatLighthouseResultRows(results) {
  return results.map(formatLighthouseResultRow).join("\n");
}

/**
 * Writes the Lighthouse manifest.
 *
 * @param {LighthouseIndexOptions} options Manifest options.
 */
function writeLighthouseManifest({ baseUrl, categories, outputDir, results }) {
  writeJson(path.join(outputDir, "manifest.json"), {
    generatedAt: new Date().toISOString(),
    target: baseUrl,
    categories,
    results,
  });
}

/**
 * Builds the Lighthouse markdown index.
 *
 * @param {LighthouseIndexMarkdownOptions} options Index options.
 * @returns {string} Markdown index.
 */
function formatLighthouseIndexMarkdown({ baseUrl, categories, results }) {
  const resultRows = formatLighthouseResultRows(results);

  return `# TeamForge Lighthouse Audit

Date: ${new Date().toISOString()}
Target: \`${baseUrl}\`
Categories: ${categories.map((category) => `\`${category}\``).join(", ")}

This is a report-only Lighthouse lane. Scores and opportunities are collected for trend review; no threshold fails the pipeline yet.

| Route | Reports | Perf | A11y | Best Practices | SEO | LCP | CLS | Top opportunities |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
${resultRows || "| n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |"}
`;
}

/**
 * Writes a compact markdown index for the Lighthouse lane.
 *
 * @param {LighthouseIndexOptions} options Index options.
 */
function writeLighthouseIndex({ baseUrl, categories, outputDir, results }) {
  writeLighthouseManifest({
    baseUrl,
    categories,
    outputDir,
    results,
  });

  writeText(
    path.join(outputDir, "index.md"),
    formatLighthouseIndexMarkdown({ baseUrl, categories, results }),
  );
}

/**
 * Resolves Lighthouse run config from environment variables.
 *
 * @returns {LighthouseRunConfig} Run config.
 */
function getLighthouseRunConfig() {
  const apiUrl = getApiUrl();
  const baseUrl = getAuditBaseUrl();
  const refreshCookieName = getRefreshCookieName();
  const outputDir =
    process.env.AUDIT_LIGHTHOUSE_OUTPUT_DIR ??
    path.join(cwd, "temp", `lighthouse-audit-${todayStamp()}`);
  const categories = getLighthouseCategories();
  const routeSlugs = getLighthouseRouteSlugs();
  const useAuthSession = shouldUseAuthSession(routeSlugs);
  const keepTokenFile = process.env.AUDIT_KEEP_TOKEN_FILE === "true";

  return {
    apiUrl,
    baseUrl,
    categories,
    keepTokenFile,
    outputDir,
    refreshCookieName,
    routeSlugs,
    useAuthSession,
  };
}

/**
 * Gets audit tokens only when the selected Lighthouse routes require auth.
 *
 * @param {LighthouseAuditTokenOptions} options Token options.
 * @returns {Promise<LighthouseAuditTokens>} Audit token object.
 */
async function getLighthouseAuditTokens({
  apiUrl,
  refreshCookieName,
  useAuthSession,
}) {
  return useAuthSession
    ? await getAuditSession({ apiUrl, refreshCookieName })
    : { accessToken: "public-lighthouse-audit" };
}

/**
 * Writes audit tokens for the audit bootstrap when private routes are selected.
 *
 * @param {LighthouseAuditTokens} tokens Audit token object.
 * @param {boolean} useAuthSession Whether Lighthouse needs auth tokens.
 */
function writeLighthouseAuditTokensIfNeeded(tokens, useAuthSession) {
  if (useAuthSession) {
    writeAuditTokens(tokens);
  }
}

/**
 * Launches Chrome for the Lighthouse run.
 *
 * @returns {Promise<LaunchedLighthouseChrome>} Launched Chrome instance.
 */
function launchLighthouseChrome() {
  return launch({
    chromeFlags: getLighthouseChromeFlags(),
    chromePath: process.env.AUDIT_LIGHTHOUSE_CHROME_PATH,
  });
}

/**
 * Runs Lighthouse across the resolved route inventory.
 *
 * @param {LighthouseRunRoutesOptions} options Route run options.
 * @returns {Promise<LighthouseRouteSummary[]>} Route summaries.
 */
async function runLighthouseRoutes({
  baseUrl,
  categories,
  chromePort,
  outputDir,
  routes,
}) {
  const results = [];

  for (const route of routes) {
    const url = getRouteUrl({ baseUrl, routePath: route.path });

    writeOutput(`LIGHTHOUSE ROUTE ${route.path}`);
    // eslint-disable-next-line no-await-in-loop -- Lighthouse runs must be sequential against one Chrome port.
    const result = await runLighthouseRoute({
      categories,
      chromePort,
      outputDir,
      route,
      url,
    });

    results.push(result);
  }

  return results;
}

/**
 * Attempts to stop the launched Chrome instance.
 *
 * @param {LaunchedLighthouseChrome} chrome Launched Chrome instance.
 */
function cleanupLighthouseChrome(chrome) {
  try {
    chrome.kill();
  } catch (error) {
    writeOutput(
      `WARN Lighthouse Chrome cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Removes audit token files when they were created only for this run.
 *
 * @param {Pick<LighthouseRunConfig, "keepTokenFile" | "useAuthSession">} options Token cleanup options.
 */
function cleanupLighthouseAuthTokens({ keepTokenFile, useAuthSession }) {
  if (useAuthSession && !keepTokenFile) {
    removeAuditTokens();
  }
}

/**
 * Runs the Lighthouse report-only lane.
 */
async function main() {
  loadAuditEnvFiles();

  const config = getLighthouseRunConfig();

  mkdirSync(config.outputDir, { recursive: true });

  const tokens = await getLighthouseAuditTokens(config);
  const routes = await resolveLighthouseRoutes({
    accessToken: tokens.accessToken,
    apiUrl: config.apiUrl,
    routeSlugs: config.routeSlugs,
  });

  await assertBaseUrlReachable(config.baseUrl);

  writeLighthouseAuditTokensIfNeeded(tokens, config.useAuthSession);

  const chrome = await launchLighthouseChrome();

  try {
    writeOutput(
      `LIGHTHOUSE ${config.baseUrl} ${config.categories.join(",")} ${routes.length} route(s)`,
    );

    const results = await runLighthouseRoutes({
      baseUrl: config.baseUrl,
      categories: config.categories,
      chromePort: chrome.port,
      outputDir: config.outputDir,
      routes,
    });

    writeLighthouseIndex({
      baseUrl: config.baseUrl,
      categories: config.categories,
      outputDir: config.outputDir,
      results,
    });
    writeOutput(`DONE Lighthouse audit: ${config.outputDir}`);
  } finally {
    cleanupLighthouseChrome(chrome);
    cleanupLighthouseAuthTokens(config);
  }
}

main().catch((error) => {
  removeAuditTokens();
  writeError(error);
  process.exit(1);
});
