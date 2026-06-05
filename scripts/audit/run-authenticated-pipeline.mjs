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
  loadAuditEnvFiles,
  loginAuditUser,
  removeAuditTokens,
  resolveAuditPreviewHttps,
  todayStamp,
  waitForHttpOk,
  writeError,
  writeJson,
  writeOutput,
  writeText,
} from "./helpers.mjs";
import { AUDIT_ROUTES } from "./routes.mjs";

/**
 * @typedef {object} CommandOptions
 * @property {NodeJS.ProcessEnv} [env] Environment for the spawned command.
 * @property {string} [label] Friendly command label for logs.
 * @property {"inherit" | "pipe" | "ignore"} [stdio] Stdio mode.
 *
 * @typedef {object} PreviewServer
 * @property {import("node:child_process").ChildProcess} child Preview process.
 * @property {number} errFile Open stderr file descriptor.
 * @property {number} outFile Open stdout file descriptor.
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
 * @property {boolean} runLoaded Whether the loaded browser audit ran.
 * @property {boolean} runSquirrel Whether SquirrelScan ran.
 */

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const loadedAuditScript = path.join(
  cwd,
  "scripts",
  "audit",
  "run-loaded-route.mjs",
);
const squirrelAuditScript = path.join(
  cwd,
  "scripts",
  "audit",
  "run-squirrel.mjs",
);
const staticPreviewServerScript = path.join(
  cwd,
  "scripts",
  "audit",
  "static-preview-server.mjs",
);
const defaultApiProxyPath = "/__audit_api";
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
 * Runs a child command and rejects on non-zero exit.
 *
 * @param {string} command Command executable.
 * @param {string[]} args Command arguments.
 * @param {CommandOptions} [options] Spawn options.
 * @returns {Promise<void>}
 */
function runCommand(
  command,
  args,
  { env = process.env, label, stdio = "inherit" } = {},
) {
  writeOutput(`RUN ${label ?? [command, ...args].join(" ")}`);

  return new Promise((resolve, reject) => {
    const invocation = getSpawnInvocation(command, args);
    const child = spawn(invocation.command, invocation.args, {
      cwd,
      env,
      stdio,
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label ?? command} failed with exit code ${code}`));
    });
  });
}

/**
 * Starts the audit static preview server for the built app.
 *
 * @param {{ apiProxyPath: string; apiProxyTarget: string; certPath?: string; keyPath?: string; port: number; useHttps: boolean }} options Preview options.
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
 * @param {{ baseUrl: string; proxyPath: string; previewHttps: boolean }} options Resolution options.
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
 * Reads and validates a generated JSON report.
 *
 * @param {string} filePath JSON file path.
 * @param {z.ZodType} schema Schema used to validate the parsed payload.
 * @returns {unknown} Validated payload.
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
      .filter(Boolean);

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
 * Writes the combined pipeline manifest and markdown index.
 *
 * @param {PipelineIndexOptions} options Pipeline report options.
 */
function writePipelineIndex({
  baseUrl,
  browserApiUrl,
  buildRan,
  outputRoot,
  previewStarted,
  runLoaded,
  runSquirrel,
}) {
  const loadedSummary = summarizeLoadedAudit(outputRoot);
  const routes = getPipelineRouteInventory(outputRoot);
  const routeRows = routes
    .map((route) => `| \`${route.path}\` | \`${route.slug}\` |`)
    .join("\n");
  const loadedLine = loadedSummary
    ? `Loaded audit: ${loadedSummary.routes} routes, ${loadedSummary.blocked} blocked, ${loadedSummary.loading} still loading, ${loadedSummary.consoleEvents} console warnings/errors, ${loadedSummary.failedRequests} failed/error requests.`
    : "Loaded audit: not run or no report found.";
  const squirrelLine = runSquirrel
    ? "SquirrelScan: one LLM report per explicit route."
    : "SquirrelScan: skipped.";
  const outputLinks = [
    runLoaded ? "- [Loaded browser route audit](loaded/index.md)" : null,
    runSquirrel
      ? "- [Authenticated SquirrelScan reports](squirrel/index.md)"
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  writeJson(path.join(outputRoot, "manifest.json"), {
    generatedAt: new Date().toISOString(),
    target: baseUrl,
    browserApiUrl,
    buildRan,
    previewStarted,
    runLoaded,
    runSquirrel,
    refreshCookieName: getRefreshCookieName(),
    routeCount: routes.length,
    routes,
    loadedSummary,
  });

  writeText(
    path.join(outputRoot, "index.md"),
    `# TeamForge Authenticated Audit Pipeline

Date: ${new Date().toISOString()}
Target: \`${baseUrl}\`

## Outputs

${outputLinks || "- No audit stages were run."}

## Summary

- Build step: ${buildRan ? "ran with `VITE_AUDIT_AUTH_ENABLED=true`" : "skipped"}
- Browser API URL: \`${browserApiUrl}\`
- Preview server: ${previewStarted ? "started by pipeline" : "external server expected"}
- ${loadedLine}
- ${squirrelLine}

## Route Inventory

| Route | Slug |
| --- | --- |
${routeRows}

## Notes

- Copy \`.env.audit.example\` to \`.env.audit.local\`, then set \`AUDIT_USER_EMAIL\` and \`AUDIT_USER_PASSWORD\` for the local audit test account.
- The runner writes \`audit-auth-tokens.json\` only while auditing, refreshes sessions during the loaded browser audit when a refresh cookie/token exists, gives SquirrelScan a fresh batch login, and removes token files at the end.
- SquirrelScan is still crawler-oriented; use the loaded browser audit to confirm authenticated SPA routes were not blocked by guards.
`,
  );
}

/**
 * Runs the full authenticated audit pipeline.
 *
 * @returns {Promise<void>}
 */
async function main() {
  loadAuditEnvFiles();

  const outputRoot =
    process.env.AUDIT_OUTPUT_ROOT ??
    path.join(cwd, "reports", `authenticated-audit-${todayStamp()}`);
  const previewPort = Number(process.env.AUDIT_PREVIEW_PORT ?? "4173");
  const previewCertPath = process.env.AUDIT_PREVIEW_CERT_PATH;
  const previewKeyPath = process.env.AUDIT_PREVIEW_KEY_PATH;
  const previewHttps = resolveAuditPreviewHttps({
    certPath: previewCertPath,
    keyPath: previewKeyPath,
  });
  const baseUrl = process.env.AUDIT_BASE_URL ?? getAuditBaseUrl();
  const apiProxyPath = getAuditApiProxyPath(process.env.AUDIT_API_PROXY_PATH);
  const apiProxyTarget =
    process.env.AUDIT_API_PROXY_TARGET ??
    process.env.AUDIT_API_URL ??
    getApiUrl();
  const browserApiUrl = getAuditBrowserApiUrl({
    baseUrl,
    proxyPath: apiProxyPath,
    previewHttps,
  });
  const runBuild = envFlag("AUDIT_RUN_BUILD", true);
  const startPreview = envFlag("AUDIT_START_PREVIEW", true);
  const runLoaded = envFlag("AUDIT_RUN_LOADED", true);
  const runSquirrel = envFlag("AUDIT_RUN_SQUIRREL", true);
  const keepPreview = envFlag("AUDIT_KEEP_PREVIEW", false);
  let auditSessionJson = "";

  if (runLoaded || runSquirrel) {
    getAuditCredentialsFromEnv();
  }

  mkdirSync(outputRoot, { recursive: true });

  let preview;

  try {
    if (runBuild) {
      await runCommand(npmCommand, ["run", "build"], {
        env: {
          ...process.env,
          VITE_AUDIT_AUTH_ENABLED: "true",
          VITE_API_URL: browserApiUrl,
        },
        label: "npm run build",
      });
    }

    if (startPreview) {
      preview = startPreviewServer({
        apiProxyPath,
        apiProxyTarget,
        certPath: previewCertPath,
        keyPath: previewKeyPath,
        port: previewPort,
        useHttps: previewHttps,
      });
      await waitForHttpOk(baseUrl, 45_000);
      writeOutput(`PREVIEW ${baseUrl}`);
    } else {
      await waitForHttpOk(baseUrl, 10_000);
    }

    if (runLoaded || runSquirrel) {
      auditSessionJson = JSON.stringify(
        await loginAuditUser({
          apiUrl: getApiUrl(),
          refreshCookieName: getRefreshCookieName(),
        }),
      );
    }

    if (runLoaded) {
      await runCommand(process.execPath, [loadedAuditScript], {
        env: {
          ...process.env,
          AUDIT_SESSION_JSON: auditSessionJson,
          AUDIT_BASE_URL: baseUrl,
          LOADED_AUDIT_OUTPUT_DIR: path.join(outputRoot, "loaded"),
        },
        label: "loaded route audit",
      });
    }

    if (runSquirrel) {
      await runCommand(process.execPath, [squirrelAuditScript], {
        env: {
          ...process.env,
          AUDIT_SESSION_JSON: auditSessionJson,
          AUDIT_BASE_URL: baseUrl,
          AUDIT_OUTPUT_DIR: path.join(outputRoot, "squirrel"),
        },
        label: "authenticated SquirrelScan",
      });
    }

    writePipelineIndex({
      baseUrl,
      browserApiUrl,
      buildRan: runBuild,
      outputRoot,
      previewStarted: startPreview,
      runLoaded,
      runSquirrel,
    });
    writeOutput(`DONE authenticated audit pipeline: ${outputRoot}`);
  } finally {
    removeAuditTokens();

    if (!keepPreview) {
      stopPreviewServer(preview);
    }
  }
}

main().catch((error) => {
  removeAuditTokens();
  writeError(error);
  process.exit(1);
});
