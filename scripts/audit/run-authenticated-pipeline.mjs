// @ts-check

import { spawn } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
} from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  cwd,
  ensureTrailingSlash,
  envFlag,
  getApiUrl,
  getAuditBaseUrl,
  getAuditCredentialsFromEnv,
  getRefreshCookieName,
  getSpawnInvocation,
  loadAuditEnvFiles,
  loginAuditUser,
  removeAuditTokens,
  resolveAuditPreviewHttps,
  runCommand,
  todayStamp,
  waitForHttpOk,
  writeError,
  writeJson,
  writeOutput,
  writeText,
} from "./helpers.mjs";
import {
  AUDIT_ROUTES,
  LIGHTHOUSE_PUBLIC_ROUTE_SLUGS,
  LIGHTHOUSE_ROUTE_SLUGS,
} from "./routes.mjs";

/**
 * @typedef {object} PreviewServer
 * @property {import("node:child_process").ChildProcess} child Preview process.
 * @property {number} errFile Open stderr file descriptor.
 * @property {number} outFile Open stdout file descriptor.
 *
 * @typedef {object} PipelinePreviewConfig
 * @property {string | undefined} previewCertPath Preview TLS certificate path.
 * @property {boolean} previewHttps Whether the local preview uses HTTPS.
 * @property {string | undefined} previewKeyPath Preview TLS private-key path.
 * @property {number} previewPort Local preview port.
 *
 * @typedef {object} PipelineApiConfig
 * @property {string} apiProxyPath Same-origin API proxy mount path.
 * @property {string} apiProxyTarget Backend API target for the preview proxy.
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {string} browserApiUrl API URL baked into the audit build.
 *
 * @typedef {PipelinePreviewConfig & PipelineApiConfig & { outputRoot: string }} PipelineConfig
 *
 * @typedef {object} PipelineStageFlags
 * @property {boolean} keepPreview Whether to leave the preview process running.
 * @property {boolean} runBuild Whether to run the Vite build first.
 * @property {boolean} runLighthouse Whether to run Lighthouse.
 * @property {boolean} runLoaded Whether to run the loaded browser audit.
 * @property {boolean} runPlaywright Whether to run Playwright route health.
 * @property {boolean} runSquirrel Whether to run SquirrelScan.
 * @property {boolean} startPreview Whether the pipeline starts preview itself.
 *
 * @typedef {object} AuditSessionRequirement
 * @property {boolean} needsAuditSession Whether selected lanes need auth tokens.
 * @property {boolean} useLighthouseAuthSession Whether Lighthouse needs auth tokens.
 *
 * @typedef {object} StartPreviewServerOptions
 * @property {string} apiProxyPath Same-origin API proxy mount path.
 * @property {string} apiProxyTarget Backend API target for the preview proxy.
 * @property {string} [certPath] Preview TLS certificate path.
 * @property {string} [keyPath] Preview TLS private-key path.
 * @property {number} port Local preview port.
 * @property {boolean} useHttps Whether to serve HTTPS.
 *
 * @typedef {object} AuditBrowserApiUrlOptions
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {string} proxyPath Same-origin API proxy mount path.
 * @property {boolean} previewHttps Whether the local preview uses HTTPS.
 *
 * @typedef {object} ChildAuditStage
 * @property {"loaded" | "browser" | "squirrel"} batch Execution batch. Stages in the same batch may run together.
 * @property {boolean} enabled Whether the child stage is selected.
 * @property {string} label Friendly stage label for logs.
 * @property {string} outputDirName Directory name under the combined output root.
 * @property {string} outputEnvName Environment variable consumed by the child script.
 * @property {string} scriptPath Absolute path to the child script.
 *
 * @typedef {ChildAuditStage[]} ChildAuditStageBatch
 *
 * @typedef {object} ChildAuditEnvOptions
 * @property {string} auditSessionJson Serialized audit session JSON.
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {string} outputRoot Combined report root directory.
 * @property {Pick<ChildAuditStage, "outputDirName" | "outputEnvName">} stage Child stage output settings.
 *
 * @typedef {object} ChildAuditStageOptions
 * @property {string} auditSessionJson Serialized audit session JSON.
 * @property {string} baseUrl Frontend base URL under audit.
 * @property {string} outputRoot Combined report root directory.
 * @property {ChildAuditStage} stage Child stage to run.
 *
 * @typedef {object} RunEnabledChildAuditStagesOptions
 * @property {string} auditSessionJson Serialized audit session JSON.
 * @property {PipelineConfig} config Resolved pipeline config.
 * @property {PipelineStageFlags} stages Selected stage flags.
 *
 * @typedef {object} LoadedAuditSummary
 * @property {number} blocked Routes that ended at the auth guard.
 * @property {number} consoleEvents Console warnings/errors captured.
 * @property {number} failedRequests Failed/error network requests captured.
 * @property {number} loading Routes still in loading state.
 * @property {number} routes Number of routes audited.
 *
 * @typedef {object} PipelineIndexOptions
 * @property {string} baseUrl Frontend base URL.
 * @property {string} browserApiUrl Frontend API URL baked into the audit build.
 * @property {boolean} buildRan Whether the pipeline built the app.
 * @property {string} outputRoot Combined report root directory.
 * @property {boolean} previewStarted Whether the pipeline started preview.
 * @property {boolean} runLighthouse Whether the Lighthouse audit ran.
 * @property {boolean} runLoaded Whether the loaded browser audit ran.
 * @property {boolean} runPlaywright Whether the Playwright route-health audit ran.
 * @property {boolean} runSquirrel Whether SquirrelScan ran.
 */

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const loadedAuditScript = path.join(
  cwd,
  "scripts",
  "audit",
  "run-loaded-route.mjs",
);
const lighthouseAuditScript = path.join(
  cwd,
  "scripts",
  "audit",
  "run-lighthouse.mjs",
);
const squirrelAuditScript = path.join(
  cwd,
  "scripts",
  "audit",
  "run-squirrel.mjs",
);
const playwrightAuditScript = path.join(
  cwd,
  "scripts",
  "audit",
  "run-playwright.mjs",
);
const staticPreviewServerScript = path.join(
  cwd,
  "scripts",
  "audit",
  "static-preview-server.mjs",
);
const defaultApiProxyPath = "/__audit_api";
const childAuditStageBatchOrder = ["loaded", "browser", "squirrel"];
const loadedAuditResultsSchema = z.array(
  z
    .object({
      consoleErrors: z.array(z.unknown()),
      failedRequests: z.array(z.unknown()),
      requestedPath: z.string().optional(),
      routeBlocked: z.boolean(),
      slug: z.string().optional(),
      stillLoading: z.boolean(),
    })
    .passthrough(),
);
const routeInventorySchema = z.object({
  routes: z.array(
    z
      .object({
        path: z.string(),
        slug: z.string(),
      })
      .passthrough(),
  ),
});
/**
 * Resolves static pipeline config from environment variables.
 *
 * @returns {PipelineConfig} Pipeline config.
 */
function getPipelineConfig() {
  const previewConfig = getPipelinePreviewConfig();
  const apiConfig = getPipelineApiConfig(previewConfig.previewHttps);

  return {
    ...apiConfig,
    ...previewConfig,
    outputRoot: getPipelineOutputRoot(),
  };
}

/**
 * Resolves the combined pipeline output root.
 *
 * @returns {string} Output root directory.
 */
function getPipelineOutputRoot() {
  return (
    process.env.AUDIT_OUTPUT_ROOT ??
    path.join(cwd, "temp", `authenticated-audit-${todayStamp()}`)
  );
}

/**
 * Resolves the flat human report path for the combined audit pipeline.
 *
 * @returns {string} Markdown report path.
 */
function getPipelineReportPath() {
  return (
    process.env.AUDIT_PIPELINE_REPORT_PATH ??
    path.join(cwd, "reports", "authenticated-audit.md")
  );
}

/**
 * Resolves preview server settings from environment variables.
 *
 * @returns {PipelinePreviewConfig} Preview config.
 */
function getPipelinePreviewConfig() {
  const previewCertPath = process.env.AUDIT_PREVIEW_CERT_PATH;
  const previewKeyPath = process.env.AUDIT_PREVIEW_KEY_PATH;

  return {
    previewCertPath,
    previewHttps: resolveAuditPreviewHttps({
      certPath: previewCertPath,
      keyPath: previewKeyPath,
    }),
    previewKeyPath,
    previewPort: Number(process.env.AUDIT_PREVIEW_PORT ?? "4173"),
  };
}

/**
 * Resolves frontend/backend API settings for the pipeline.
 *
 * @param {boolean} previewHttps Whether the local preview uses HTTPS.
 * @returns {PipelineApiConfig} API config.
 */
function getPipelineApiConfig(previewHttps) {
  const baseUrl = process.env.AUDIT_BASE_URL ?? getAuditBaseUrl();
  const apiProxyPath = getAuditApiProxyPath(process.env.AUDIT_API_PROXY_PATH);
  const browserApiUrl = getAuditBrowserApiUrl({
    baseUrl,
    proxyPath: apiProxyPath,
    previewHttps,
  });

  return {
    apiProxyPath,
    apiProxyTarget: getPipelineApiProxyTarget(),
    baseUrl,
    browserApiUrl,
  };
}

/**
 * Resolves the backend API target for the preview proxy.
 *
 * @returns {string} Backend API proxy target.
 */
function getPipelineApiProxyTarget() {
  return (
    process.env.AUDIT_API_PROXY_TARGET ??
    process.env.AUDIT_API_URL ??
    getApiUrl()
  );
}

/**
 * Resolves pipeline stage flags from environment variables.
 *
 * @returns {PipelineStageFlags} Stage flags.
 */
function getPipelineStageFlags() {
  return {
    keepPreview: envFlag("AUDIT_KEEP_PREVIEW", false),
    runBuild: envFlag("AUDIT_RUN_BUILD", true),
    runLighthouse: envFlag("AUDIT_RUN_LIGHTHOUSE", false),
    runLoaded: envFlag("AUDIT_RUN_LOADED", true),
    runPlaywright: envFlag("AUDIT_RUN_PLAYWRIGHT", false),
    runSquirrel: envFlag("AUDIT_RUN_SQUIRREL", true),
    startPreview: envFlag("AUDIT_START_PREVIEW", true),
  };
}

/**
 * Resolves whether any selected stage needs an authenticated audit session.
 *
 * @param {PipelineStageFlags} stages Stage flags.
 * @returns {AuditSessionRequirement} Session requirements.
 */
function getAuditSessionRequirement({
  runLighthouse,
  runLoaded,
  runPlaywright,
  runSquirrel,
}) {
  const useLighthouseAuthSession = shouldRunLighthouseWithAuth({
    runLighthouse,
  });

  return {
    needsAuditSession: needsAuthenticatedAuditSession(
      {
        runLoaded,
        runPlaywright,
        runSquirrel,
      },
      useLighthouseAuthSession,
    ),
    useLighthouseAuthSession,
  };
}

/**
 * Returns whether Lighthouse should run with an authenticated session.
 *
 * @param {Pick<PipelineStageFlags, "runLighthouse">} stages Stage flags.
 * @returns {boolean} Whether Lighthouse needs auth.
 */
function shouldRunLighthouseWithAuth({ runLighthouse }) {
  return runLighthouse && shouldUseLighthouseAuthSession();
}

/**
 * Returns whether any selected child stage needs audit credentials.
 *
 * @param {Pick<PipelineStageFlags, "runLoaded" | "runPlaywright" | "runSquirrel">} stages Stage flags.
 * @param {boolean} useLighthouseAuthSession Whether Lighthouse needs auth.
 * @returns {boolean} Whether an audit session is required.
 */
function needsAuthenticatedAuditSession(
  { runLoaded, runPlaywright, runSquirrel },
  useLighthouseAuthSession,
) {
  return [runLoaded, runPlaywright, useLighthouseAuthSession, runSquirrel].some(
    Boolean,
  );
}

/**
 * Runs the Vite production build for audit.
 *
 * @param {string} browserApiUrl Browser-visible API URL.
 * @returns {Promise<void>}
 */
async function runAuditBuild(browserApiUrl) {
  await runCommand(npmCommand, ["run", "build"], {
    env: {
      ...process.env,
      VITE_AUDIT_AUTH_ENABLED: "true",
      VITE_API_URL: browserApiUrl,
      VITE_GOOGLE_CLIENT_ID: "",
      VITE_GOOGLE_MAPS_API_KEY: "",
    },
    label: "npm run build",
  });
}

/**
 * Starts the audit static preview server for the built app.
 *
 * @param {StartPreviewServerOptions} options Preview options.
 * @returns {PreviewServer} Preview process and log descriptors.
 */
function startPreviewServer({
  apiProxyPath,
  apiProxyTarget,
  certPath,
  keyPath,
  port,
  useHttps,
}) {
  mkdirSync(path.join(cwd, "temp"), { recursive: true });

  const outFile = openSync(
    path.join(cwd, "temp", "audit-preview.out.log"),
    "a",
  );
  const errFile = openSync(
    path.join(cwd, "temp", "audit-preview.err.log"),
    "a",
  );
  const args = [
    staticPreviewServerScript,
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--root",
    "dist",
    "--api-proxy-path",
    apiProxyPath,
    "--api-proxy-target",
    apiProxyTarget,
  ];

  if (useHttps) {
    args.push("--https");
  }

  if (certPath) {
    args.push("--cert", certPath);
  }

  if (keyPath) {
    args.push("--key", keyPath);
  }

  const invocation = getSpawnInvocation(process.execPath, args);
  const child = spawn(invocation.command, invocation.args, {
    cwd,
    env: process.env,
    stdio: ["ignore", outFile, errFile],
    windowsHide: true,
  });

  return { child, errFile, outFile };
}

/**
 * Normalizes the same-origin audit API proxy mount path.
 *
 * @param {string | undefined} value Raw environment value.
 * @returns {string} Proxy path.
 */
function getAuditApiProxyPath(value) {
  if (!value?.trim()) {
    return defaultApiProxyPath;
  }

  return `/${value.trim().replace(/^\/+/u, "").replace(/\/+$/u, "")}`;
}

/**
 * Resolves the API URL that Vite should bake into the audit bundle.
 *
 * HTTPS local previews use a same-origin API proxy so crawlers do not see
 * mixed content while the local backend can continue serving plain HTTP.
 *
 * @param {AuditBrowserApiUrlOptions} options Resolution options.
 * @returns {string} Browser-visible API URL.
 */
function getAuditBrowserApiUrl({ baseUrl, proxyPath, previewHttps }) {
  if (process.env.AUDIT_BROWSER_API_URL) {
    return process.env.AUDIT_BROWSER_API_URL;
  }

  if (previewHttps) {
    return new URL(
      proxyPath.replace(/^\/+/u, ""),
      ensureTrailingSlash(baseUrl),
    ).href.replace(/\/$/u, "");
  }

  return process.env.VITE_API_URL ?? getApiUrl();
}

/**
 * Stops a preview server started by the pipeline.
 *
 * @param {PreviewServer | undefined} preview Preview process to stop.
 */
function stopPreviewServer(preview) {
  if (!preview) {
    return;
  }

  if (!preview.child.killed) {
    preview.child.kill();
  }

  closeSync(preview.outFile);
  closeSync(preview.errFile);
}

/**
 * Starts or validates the audit preview target.
 *
 * @param {PipelineConfig} config Pipeline config.
 * @param {Pick<PipelineStageFlags, "startPreview">} stages Stage flags.
 * @returns {Promise<PreviewServer | undefined>} Started preview server, if any.
 */
async function prepareAuditPreview(config, stages) {
  if (!stages.startPreview) {
    await waitForHttpOk(config.baseUrl, 10_000);
    return undefined;
  }

  const preview = startPreviewServer({
    apiProxyPath: config.apiProxyPath,
    apiProxyTarget: config.apiProxyTarget,
    certPath: config.previewCertPath,
    keyPath: config.previewKeyPath,
    port: config.previewPort,
    useHttps: config.previewHttps,
  });

  await waitForHttpOk(config.baseUrl, 45_000);
  writeOutput(`PREVIEW ${config.baseUrl}`);

  return preview;
}

/**
 * Logs in once for child audit stages when a session is required.
 *
 * @param {boolean} needsAuditSession Whether selected stages need auth.
 * @returns {Promise<string>} Serialized audit session JSON.
 */
async function getAuditSessionJson(needsAuditSession) {
  if (!needsAuditSession) {
    return "";
  }

  return JSON.stringify(
    await loginAuditUser({
      apiUrl: getApiUrl(),
      refreshCookieName: getRefreshCookieName(),
    }),
  );
}

/**
 * Returns enabled child audit stages in pipeline execution order.
 *
 * @param {PipelineStageFlags} stages Stage flags.
 * @returns {ChildAuditStage[]} Enabled child stages.
 */
function getEnabledChildAuditStages(stages) {
  return [
    {
      batch: "loaded",
      enabled: stages.runLoaded,
      label: "loaded route audit",
      outputDirName: "loaded",
      outputEnvName: "LOADED_AUDIT_OUTPUT_DIR",
      scriptPath: loadedAuditScript,
    },
    {
      batch: "browser",
      enabled: stages.runPlaywright,
      label: "Playwright route health audit",
      outputDirName: "playwright",
      outputEnvName: "AUDIT_PLAYWRIGHT_OUTPUT_DIR",
      scriptPath: playwrightAuditScript,
    },
    {
      batch: "browser",
      enabled: stages.runLighthouse,
      label: "Lighthouse report-only audit",
      outputDirName: "lighthouse",
      outputEnvName: "AUDIT_LIGHTHOUSE_OUTPUT_DIR",
      scriptPath: lighthouseAuditScript,
    },
    {
      batch: "squirrel",
      enabled: stages.runSquirrel,
      label: "authenticated SquirrelScan",
      outputDirName: "squirrel",
      outputEnvName: "AUDIT_OUTPUT_DIR",
      scriptPath: squirrelAuditScript,
    },
  ].filter((stage) => stage.enabled);
}

/**
 * Builds the environment for a child audit script.
 *
 * @param {ChildAuditEnvOptions} options Env options.
 * @returns {NodeJS.ProcessEnv} Child process environment.
 */
function getChildAuditEnv({ auditSessionJson, baseUrl, outputRoot, stage }) {
  return {
    ...process.env,
    AUDIT_KEEP_TOKEN_FILE: "true",
    AUDIT_SESSION_JSON: auditSessionJson,
    AUDIT_BASE_URL: baseUrl,
    [stage.outputEnvName]: path.join(outputRoot, stage.outputDirName),
  };
}

/**
 * Runs one child audit script.
 *
 * @param {ChildAuditStageOptions} options Stage options.
 * @returns {Promise<void>}
 */
async function runChildAuditStage({
  auditSessionJson,
  baseUrl,
  outputRoot,
  stage,
}) {
  await runCommand(process.execPath, [stage.scriptPath], {
    env: getChildAuditEnv({ auditSessionJson, baseUrl, outputRoot, stage }),
    label: stage.label,
  });
}

/**
 * Groups enabled child stages into ordered execution batches.
 *
 * Loaded-route and SquirrelScan lanes keep their historical isolated slots,
 * while the browser-owned Playwright and Lighthouse lanes can run in parallel
 * against the same preview.
 *
 * @param {PipelineStageFlags} stages Stage flags.
 * @returns {ChildAuditStageBatch[]} Ordered stage batches.
 */
function getEnabledChildAuditStageBatches(stages) {
  const enabledStages = getEnabledChildAuditStages(stages);

  return childAuditStageBatchOrder
    .map((batch) => enabledStages.filter((stage) => stage.batch === batch))
    .filter((batch) => batch.length > 0);
}

/**
 * Returns the first rejected stage reason from a settled batch.
 *
 * @param {PromiseSettledResult<void>[]} results Batch results.
 * @returns {unknown} First rejection reason or null.
 */
function getRejectedAuditStageReason(results) {
  return results.find((result) => result.status === "rejected")?.reason ?? null;
}

/**
 * Runs one execution batch and waits for every child before reporting failure.
 *
 * @param {{ auditSessionJson: string; baseUrl: string; batch: ChildAuditStageBatch; outputRoot: string }} options Batch options.
 */
async function runChildAuditStageBatch({
  auditSessionJson,
  baseUrl,
  batch,
  outputRoot,
}) {
  const results = await Promise.allSettled(
    batch.map((stage) =>
      runChildAuditStage({
        auditSessionJson,
        baseUrl,
        outputRoot,
        stage,
      }),
    ),
  );
  const rejectionReason = getRejectedAuditStageReason(results);

  if (rejectionReason) {
    throw rejectionReason;
  }
}

/**
 * Runs selected child audit stages in ordered batches.
 *
 * @param {RunEnabledChildAuditStagesOptions} options Stage runner options.
 * @returns {Promise<void>}
 */
async function runEnabledChildAuditStages({
  auditSessionJson,
  config,
  stages,
}) {
  for (const batch of getEnabledChildAuditStageBatches(stages)) {
    // eslint-disable-next-line no-await-in-loop -- Stage batches preserve audit ordering while allowing safe browser lanes to run together.
    await runChildAuditStageBatch({
      auditSessionJson,
      baseUrl: config.baseUrl,
      batch,
      outputRoot: config.outputRoot,
    });
  }
}

function ensureAuditCredentialsIfRequired(needsAuditSession) {
  if (needsAuditSession) {
    getAuditCredentialsFromEnv();
  }
}

function ensurePipelineOutputRoot(outputRoot) {
  mkdirSync(outputRoot, { recursive: true });
}

async function runAuthenticatedAuditPipeline({
  config,
  needsAuditSession,
  stages,
}) {
  let preview;

  try {
    if (stages.runBuild) {
      await runAuditBuild(config.browserApiUrl);
    }

    preview = await prepareAuditPreview(config, stages);

    await runEnabledChildAuditStages({
      auditSessionJson: await getAuditSessionJson(needsAuditSession),
      config,
      stages,
    });

    writePipelineRunSummary(config, stages);
  } finally {
    cleanupAuditPipeline(preview, stages.keepPreview);
  }
}

function writePipelineRunSummary(config, stages) {
  writePipelineIndex({
    baseUrl: config.baseUrl,
    browserApiUrl: config.browserApiUrl,
    buildRan: stages.runBuild,
    outputRoot: config.outputRoot,
    previewStarted: stages.startPreview,
    runLighthouse: stages.runLighthouse,
    runLoaded: stages.runLoaded,
    runPlaywright: stages.runPlaywright,
    runSquirrel: stages.runSquirrel,
  });
  writeOutput(`DONE authenticated audit pipeline: ${config.outputRoot}`);
}

function cleanupAuditPipeline(preview, keepPreview) {
  removeAuditTokens();

  if (!keepPreview) {
    stopPreviewServer(preview);
  }
}

/**
 * Reads and validates a generated JSON report.
 *
 * @template T
 * @param {string} filePath JSON file path.
 * @param {z.ZodType<T>} schema Schema used to validate the parsed payload.
 * @returns {T} Validated payload.
 */
function readJsonFile(filePath, schema) {
  const parsedPayload = schema.safeParse(
    JSON.parse(readFileSync(filePath, "utf8")),
  );

  if (!parsedPayload.success) {
    throw new Error(`Could not parse generated audit report: ${filePath}`);
  }

  return parsedPayload.data;
}

/**
 * Checks whether a loaded audit row can become a route inventory entry.
 *
 * @param {{ path: string; slug: string } | null} route Route candidate.
 * @returns {route is import("./routes.mjs").AuditRoute} Whether the route is complete.
 */
function isAuditRouteInventoryEntry(route) {
  return route !== null;
}

/**
 * Summarizes the loaded browser route audit if it exists.
 *
 * @param {string} outputRoot Combined pipeline output root.
 * @returns {LoadedAuditSummary | null} Loaded-audit summary.
 */
function summarizeLoadedAudit(outputRoot) {
  const loadedJsonPath = path.join(
    outputRoot,
    "loaded",
    "loaded-route-audit.json",
  );

  if (!existsSync(loadedJsonPath)) {
    return null;
  }

  const results = readJsonFile(loadedJsonPath, loadedAuditResultsSchema);
  const blocked = results.filter((result) => result.routeBlocked).length;
  const loading = results.filter((result) => result.stillLoading).length;
  const consoleEvents = results.reduce(
    (total, result) => total + result.consoleErrors.length,
    0,
  );
  const failedRequests = results.reduce(
    (total, result) => total + result.failedRequests.length,
    0,
  );

  return {
    routes: results.length,
    blocked,
    loading,
    consoleEvents,
    failedRequests,
  };
}

/**
 * Reads the concrete route inventory from generated reports when available.
 *
 * @param {string} outputRoot Combined pipeline output root.
 * @returns {import("./routes.mjs").AuditRoute[]} Concrete route inventory.
 */
function getPipelineRouteInventory(outputRoot) {
  const loadedJsonPath = path.join(
    outputRoot,
    "loaded",
    "loaded-route-audit.json",
  );
  const squirrelManifestPath = path.join(
    outputRoot,
    "squirrel",
    "manifest.json",
  );

  if (existsSync(loadedJsonPath)) {
    const results = readJsonFile(loadedJsonPath, loadedAuditResultsSchema);
    const routes = results
      .map((result) =>
        result.slug && result.requestedPath
          ? { slug: result.slug, path: result.requestedPath }
          : null,
      )
      .filter(isAuditRouteInventoryEntry);

    if (routes.length > 0) {
      return routes;
    }
  }

  if (existsSync(squirrelManifestPath)) {
    return readJsonFile(squirrelManifestPath, routeInventorySchema).routes;
  }

  return AUDIT_ROUTES;
}

/**
 * Selects route slugs for a parent-orchestrated Lighthouse run.
 *
 * @returns {string[]} Lighthouse route slugs.
 */
function getLighthouseRouteSlugs() {
  const rawValue = process.env.AUDIT_LIGHTHOUSE_ROUTE_SLUGS;

  if (!rawValue) {
    return LIGHTHOUSE_ROUTE_SLUGS;
  }

  return rawValue
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

/**
 * Checks whether the Lighthouse route set requires audit credentials.
 *
 * @returns {boolean} Whether Lighthouse needs an authenticated session.
 */
function shouldUseLighthouseAuthSession() {
  if (process.env.AUDIT_LIGHTHOUSE_AUTH_REQUIRED !== undefined) {
    return envFlag("AUDIT_LIGHTHOUSE_AUTH_REQUIRED", true);
  }

  const publicRouteSlugs = new Set(LIGHTHOUSE_PUBLIC_ROUTE_SLUGS);

  return getLighthouseRouteSlugs().some((slug) => !publicRouteSlugs.has(slug));
}

function formatPipelineRouteRows(routes) {
  return routes
    .map((route) => `| \`${route.path}\` | \`${route.slug}\` |`)
    .join("\n");
}

function formatLoadedAuditSummaryLine(loadedSummary) {
  if (!loadedSummary) {
    return "Loaded audit: not run or no report found.";
  }

  return `Loaded audit: ${loadedSummary.routes} routes, ${loadedSummary.blocked} blocked, ${loadedSummary.loading} still loading, ${loadedSummary.consoleEvents} console warnings/errors, ${loadedSummary.failedRequests} failed/error requests.`;
}

function formatPlaywrightSummaryLine(runPlaywright) {
  if (!runPlaywright) {
    return "Playwright: skipped.";
  }

  return `Playwright: ${process.env.AUDIT_PLAYWRIGHT_ROUTE_SET === "smoke" ? "smoke" : "authenticated"} route set, ${process.env.AUDIT_PLAYWRIGHT_LANES ?? "route-health"} lane(s).`;
}

function formatLighthouseSummaryLine(runLighthouse) {
  if (!runLighthouse) {
    return "Lighthouse: skipped.";
  }

  return `Lighthouse: ${process.env.AUDIT_LIGHTHOUSE_ROUTE_SLUGS ?? "01-landing,02-download,14-home"} route slug(s), ${process.env.AUDIT_LIGHTHOUSE_CATEGORIES ?? "performance,accessibility,best-practices,seo"} category set.`;
}

function formatSquirrelSummaryLine(runSquirrel) {
  return runSquirrel
    ? "SquirrelScan: one LLM report per explicit route."
    : "SquirrelScan: skipped.";
}

function formatPipelineOutputLinks(options) {
  return [
    {
      enabled: options.runLoaded,
      label: "Loaded browser route audit",
      reportPath: path.join(options.outputRoot, "loaded", "index.md"),
    },
    {
      enabled: options.runPlaywright,
      label: "Playwright route health",
      reportPath: path.join(options.outputRoot, "playwright", "index.md"),
    },
    {
      enabled: options.runLighthouse,
      label: "Lighthouse report-only audit",
      reportPath: path.join(options.outputRoot, "lighthouse", "index.md"),
    },
    {
      enabled: options.runSquirrel,
      label: "Authenticated SquirrelScan reports",
      reportPath: path.join(options.outputRoot, "squirrel", "index.md"),
    },
  ]
    .filter((entry) => entry.enabled)
    .map(
      (entry) =>
        `- ${entry.label}: \`${path.relative(cwd, entry.reportPath)}\``,
    )
    .join("\n");
}

function writePipelineManifest(options, routes, loadedSummary) {
  writeJson(path.join(options.outputRoot, "manifest.json"), {
    generatedAt: new Date().toISOString(),
    target: options.baseUrl,
    browserApiUrl: options.browserApiUrl,
    buildRan: options.buildRan,
    previewStarted: options.previewStarted,
    runLighthouse: options.runLighthouse,
    runLoaded: options.runLoaded,
    runPlaywright: options.runPlaywright,
    runSquirrel: options.runSquirrel,
    refreshCookieName: getRefreshCookieName(),
    routeCount: routes.length,
    routes,
    loadedSummary,
  });
}

function formatPipelineIndexMarkdown(options, routes, loadedSummary) {
  const outputLinks = formatPipelineOutputLinks(options);
  const routeRows = formatPipelineRouteRows(routes);
  const loadedLine = formatLoadedAuditSummaryLine(loadedSummary);
  const playwrightLine = formatPlaywrightSummaryLine(options.runPlaywright);
  const lighthouseLine = formatLighthouseSummaryLine(options.runLighthouse);
  const squirrelLine = formatSquirrelSummaryLine(options.runSquirrel);

  return `# TeamForge Authenticated Audit Pipeline

Date: ${new Date().toISOString()}
Target: \`${options.baseUrl}\`

## Outputs

${outputLinks || "- No audit stages were run."}

## Summary

- Build step: ${options.buildRan ? "ran with `VITE_AUDIT_AUTH_ENABLED=true`" : "skipped"}
- Browser API URL: \`${options.browserApiUrl}\`
- Preview server: ${options.previewStarted ? "started by pipeline" : "external server expected"}
- ${loadedLine}
- ${playwrightLine}
- ${lighthouseLine}
- ${squirrelLine}

## Route Inventory

| Route | Slug |
| --- | --- |
${routeRows}

## Notes

- Copy \`.env.audit.example\` to \`.env.audit.local\`, then set \`AUDIT_USER_EMAIL\` and \`AUDIT_USER_PASSWORD\` for the local audit test account.
- The runner writes \`audit-auth-tokens.json\` only while auditing, refreshes sessions during the loaded browser audit when a refresh cookie/token exists, gives Playwright and SquirrelScan a fresh batch login, and removes token files at the end.
- SquirrelScan is still crawler-oriented; use the loaded browser and Playwright route-health audits to confirm authenticated SPA routes were not blocked by guards.
`;
}

/**
 * Writes the combined pipeline manifest and markdown index.
 *
 * @param {PipelineIndexOptions} options Pipeline report options.
 */
function writePipelineIndex(options) {
  const loadedSummary = summarizeLoadedAudit(options.outputRoot);
  const routes = getPipelineRouteInventory(options.outputRoot);

  writePipelineManifest(options, routes, loadedSummary);
  writeText(
    getPipelineReportPath(),
    formatPipelineIndexMarkdown(options, routes, loadedSummary),
  );
}

/**
 * Runs the full authenticated audit pipeline.
 *
 * @returns {Promise<void>}
 */
async function main() {
  loadAuditEnvFiles();

  const config = getPipelineConfig();
  const stages = getPipelineStageFlags();
  const { needsAuditSession } = getAuditSessionRequirement(stages);

  ensureAuditCredentialsIfRequired(needsAuditSession);
  ensurePipelineOutputRoot(config.outputRoot);

  await runAuthenticatedAuditPipeline({
    config,
    needsAuditSession,
    stages,
  });
}

main().catch((error) => {
  removeAuditTokens();
  writeError(error);
  process.exit(1);
});
