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
import {
  LIGHTHOUSE_PUBLIC_ROUTE_SLUGS,
  LIGHTHOUSE_ROUTE_SLUGS,
  resolveAuditRoutes,
} from "./routes.mjs";

const defaultLighthouseCategories = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
];
const defaultChromeFlags = [
  "--headless=new",
  "--disable-dev-shm-usage",
  "--disable-extensions",
  "--disable-gpu",
  "--no-first-run",
  "--window-size=1365,768",
];

/**
 * Selects route slugs for this Lighthouse run.
 *
 * @returns {string[]} Route slugs.
 */
function getLighthouseRouteSlugs() {
  const rawValue = process.env.AUDIT_LIGHTHOUSE_ROUTE_SLUGS;

  if (!rawValue) {
    return LIGHTHOUSE_ROUTE_SLUGS;
  }

  const routeSlugs = rawValue
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  if (routeSlugs.length === 0) {
    throw new Error("AUDIT_LIGHTHOUSE_ROUTE_SLUGS did not include any slugs.");
  }

  return routeSlugs;
}

/**
 * Selects Lighthouse categories for this run.
 *
 * @returns {string[]} Lighthouse category ids.
 */
function getLighthouseCategories() {
  const rawValue = process.env.AUDIT_LIGHTHOUSE_CATEGORIES;

  if (!rawValue) {
    return defaultLighthouseCategories;
  }

  const categories = rawValue
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);

  if (categories.length === 0) {
    throw new Error(
      "AUDIT_LIGHTHOUSE_CATEGORIES did not include any categories.",
    );
  }

  return categories;
}

/**
 * Resolves the Chrome flags used by Lighthouse.
 *
 * @returns {string[]} Chrome launch flags.
 */
function getLighthouseChromeFlags() {
  const flags = [...defaultChromeFlags];
  const ignoreCertificateErrors =
    process.env.AUDIT_LIGHTHOUSE_IGNORE_CERT_ERRORS !== "false";

  if (ignoreCertificateErrors) {
    flags.push("--ignore-certificate-errors");
  }

  if (process.env.CI === "true") {
    flags.push("--no-sandbox");
  }

  return flags;
}

/**
 * Checks whether selected Lighthouse routes need an authenticated session.
 *
 * @param {string[]} routeSlugs Selected route slugs.
 * @returns {boolean} Whether auth is required.
 */
function shouldUseAuthSession(routeSlugs) {
  if (process.env.AUDIT_LIGHTHOUSE_AUTH_REQUIRED !== undefined) {
    return envFlag("AUDIT_LIGHTHOUSE_AUTH_REQUIRED", true);
  }

  const publicRouteSlugs = new Set(LIGHTHOUSE_PUBLIC_ROUTE_SLUGS);

  return routeSlugs.some((slug) => !publicRouteSlugs.has(slug));
}

/**
 * Resolves and filters routes for the Lighthouse lane.
 *
 * @param {{ accessToken: string; apiUrl: string; routeSlugs: string[] }} options Route options.
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
 * @param {{ baseUrl: string; routePath: string }} options URL options.
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
 * Formats a nullable Lighthouse score for markdown.
 *
 * @param {number | null} score Score percentage.
 * @returns {string} Display score.
 */
function formatScore(score) {
  return score === null ? "n/a" : String(score);
}

/**
 * Runs Lighthouse for one route and writes route artifacts.
 *
 * @param {{ categories: string[]; chromePort: number; outputDir: string; route: import("./routes.mjs").AuditRoute; url: string }} options Audit options.
 * @returns {Promise<object>} Route summary.
 */
async function runLighthouseRoute({
  categories,
  chromePort,
  outputDir,
  route,
  url,
}) {
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

  if (!runnerResult?.lhr) {
    throw new Error(`Lighthouse did not return a result for ${url}`);
  }

  const { lhr } = runnerResult;
  const htmlReport = generateReport(lhr, "html");
  const jsonReportPath = path.join(outputDir, `${route.slug}.json`);
  const htmlReportPath = path.join(outputDir, `${route.slug}.html`);
  const summary = {
    accessibility: getScorePercent(lhr.categories.accessibility?.score),
    bestPractices: getScorePercent(lhr.categories["best-practices"]?.score),
    categories,
    cumulativeLayoutShift: getAuditDisplayValue(lhr, "cumulative-layout-shift"),
    firstContentfulPaint: getAuditDisplayValue(lhr, "first-contentful-paint"),
    finalUrl: lhr.finalDisplayedUrl ?? lhr.finalUrl,
    jsonReport: path.basename(jsonReportPath),
    htmlReport: path.basename(htmlReportPath),
    largestContentfulPaint: getAuditDisplayValue(
      lhr,
      "largest-contentful-paint",
    ),
    performance: getScorePercent(lhr.categories.performance?.score),
    requestedPath: route.path,
    requestedUrl: url,
    seo: getScorePercent(lhr.categories.seo?.score),
    slug: route.slug,
    speedIndex: getAuditDisplayValue(lhr, "speed-index"),
    topOpportunities: getTopOpportunities(lhr),
    totalBlockingTime: getAuditDisplayValue(lhr, "total-blocking-time"),
  };

  writeJson(jsonReportPath, lhr);
  writeText(htmlReportPath, htmlReport);
  writeJson(path.join(outputDir, `${route.slug}-summary.json`), summary);

  return summary;
}

/**
 * Writes a compact markdown index for the Lighthouse lane.
 *
 * @param {{ baseUrl: string; categories: string[]; outputDir: string; results: object[]; routes: import("./routes.mjs").AuditRoute[] }} options Index options.
 */
function writeLighthouseIndex({ baseUrl, categories, outputDir, results }) {
  const resultRows = results
    .map((result) => {
      const opportunities =
        result.topOpportunities.length > 0
          ? result.topOpportunities
              .map((opportunity) => escapeMarkdownTableCell(opportunity))
              .join(", ")
          : "n/a";

      return `| \`${result.requestedPath}\` | [HTML](${result.htmlReport}) / [JSON](${result.jsonReport}) | ${formatScore(result.performance)} | ${formatScore(result.accessibility)} | ${formatScore(result.bestPractices)} | ${formatScore(result.seo)} | ${escapeMarkdownTableCell(result.largestContentfulPaint)} | ${escapeMarkdownTableCell(result.cumulativeLayoutShift)} | ${opportunities} |`;
    })
    .join("\n");

  writeJson(path.join(outputDir, "manifest.json"), {
    generatedAt: new Date().toISOString(),
    target: baseUrl,
    categories,
    results,
  });

  writeText(
    path.join(outputDir, "index.md"),
    `# TeamForge Lighthouse Audit

Date: ${new Date().toISOString()}
Target: \`${baseUrl}\`
Categories: ${categories.map((category) => `\`${category}\``).join(", ")}

This is a report-only Lighthouse lane. Scores and opportunities are collected for trend review; no threshold fails the pipeline yet.

| Route | Reports | Perf | A11y | Best Practices | SEO | LCP | CLS | Top opportunities |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
${resultRows || "| n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |"}
`,
  );
}

/**
 * Runs the Lighthouse report-only lane.
 */
async function main() {
  loadAuditEnvFiles();

  const apiUrl = getApiUrl();
  const baseUrl = getAuditBaseUrl();
  const refreshCookieName = getRefreshCookieName();
  const outputDir =
    process.env.AUDIT_LIGHTHOUSE_OUTPUT_DIR ??
    path.join(cwd, "reports", `lighthouse-audit-${todayStamp()}`);
  const categories = getLighthouseCategories();
  const routeSlugs = getLighthouseRouteSlugs();
  const useAuthSession = shouldUseAuthSession(routeSlugs);
  const keepTokenFile = process.env.AUDIT_KEEP_TOKEN_FILE === "true";

  mkdirSync(outputDir, { recursive: true });

  const tokens = useAuthSession
    ? await getAuditSession({ apiUrl, refreshCookieName })
    : { accessToken: "public-lighthouse-audit" };
  const routes = await resolveLighthouseRoutes({
    accessToken: tokens.accessToken,
    apiUrl,
    routeSlugs,
  });

  await assertBaseUrlReachable(baseUrl);

  if (useAuthSession) {
    writeAuditTokens(tokens);
  }

  const chrome = await launch({
    chromeFlags: getLighthouseChromeFlags(),
    chromePath: process.env.AUDIT_LIGHTHOUSE_CHROME_PATH,
  });

  try {
    writeOutput(
      `LIGHTHOUSE ${baseUrl} ${categories.join(",")} ${routes.length} route(s)`,
    );

    const results = [];

    for (const route of routes) {
      const url = getRouteUrl({ baseUrl, routePath: route.path });

      writeOutput(`LIGHTHOUSE ROUTE ${route.path}`);
      // eslint-disable-next-line no-await-in-loop -- Lighthouse runs must be sequential against one Chrome port.
      const result = await runLighthouseRoute({
        categories,
        chromePort: chrome.port,
        outputDir,
        route,
        url,
      });

      results.push(result);
    }

    writeLighthouseIndex({ baseUrl, categories, outputDir, results, routes });
    writeOutput(`DONE Lighthouse audit: ${outputDir}`);
  } finally {
    try {
      chrome.kill();
    } catch (error) {
      writeOutput(
        `WARN Lighthouse Chrome cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (useAuthSession && !keepTokenFile) {
      removeAuditTokens();
    }
  }
}

main().catch((error) => {
  removeAuditTokens();
  writeError(error);
  process.exit(1);
});
