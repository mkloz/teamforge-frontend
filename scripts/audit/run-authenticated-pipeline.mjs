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
  envFlag,
  getAuditBaseUrl,
  getAuditCredentialsFromEnv,
  getRefreshCookieName,
  loadAuditEnvFiles,
  removeAuditTokens,
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
const loadedAuditResultsSchema = z.array(
  z
    .object({
      consoleErrors: z.array(z.unknown()),
      failedRequests: z.array(z.unknown()),
      routeBlocked: z.boolean(),
      stillLoading: z.boolean(),
    })
    .passthrough(),
);

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
    const child = spawn(command, args, {
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
 * Starts Vite preview for the audit-enabled build.
 *
 * @param {{ port: number }} options Preview options.
 * @returns {PreviewServer} Preview process and log descriptors.
 */
function startPreviewServer({ port }) {
  mkdirSync(path.join(cwd, "temp"), { recursive: true });

  const outFile = openSync(
    path.join(cwd, "temp", "audit-preview.out.log"),
    "a",
  );
  const errFile = openSync(
    path.join(cwd, "temp", "audit-preview.err.log"),
    "a",
  );
  const child = spawn(
    npmCommand,
    ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd,
      env: {
        ...process.env,
        VITE_AUDIT_AUTH_ENABLED: "true",
      },
      stdio: ["ignore", outFile, errFile],
      windowsHide: true,
    },
  );

  return { child, errFile, outFile };
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
 * Writes the combined pipeline manifest and markdown index.
 *
 * @param {PipelineIndexOptions} options Pipeline report options.
 */
function writePipelineIndex({
  baseUrl,
  buildRan,
  outputRoot,
  previewStarted,
  runLoaded,
  runSquirrel,
}) {
  const loadedSummary = summarizeLoadedAudit(outputRoot);
  const routeRows = AUDIT_ROUTES.map(
    (route) => `| \`${route.path}\` | \`${route.slug}\` |`,
  ).join("\n");
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
    buildRan,
    previewStarted,
    runLoaded,
    runSquirrel,
    refreshCookieName: getRefreshCookieName(),
    routeCount: AUDIT_ROUTES.length,
    routes: AUDIT_ROUTES,
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
- Preview server: ${previewStarted ? "started by pipeline" : "external server expected"}
- ${loadedLine}
- ${squirrelLine}

## Route Inventory

| Route | Slug |
| --- | --- |
${routeRows}

## Notes

- Copy \`.env.audit.example\` to \`.env.audit.local\`, then set \`AUDIT_USER_EMAIL\` and \`AUDIT_USER_PASSWORD\` for the local audit test account.
- The runner logs in at the start of each audit stage, writes \`audit-auth-tokens.json\` only while auditing, refreshes before each route when a refresh cookie/token exists, and removes token files at the end.
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

  const baseUrl = getAuditBaseUrl();
  const outputRoot =
    process.env.AUDIT_OUTPUT_ROOT ??
    path.join(cwd, "reports", `authenticated-audit-${todayStamp()}`);
  const previewPort = Number(process.env.AUDIT_PREVIEW_PORT ?? "4173");
  const runBuild = envFlag("AUDIT_RUN_BUILD", true);
  const startPreview = envFlag("AUDIT_START_PREVIEW", true);
  const runLoaded = envFlag("AUDIT_RUN_LOADED", true);
  const runSquirrel = envFlag("AUDIT_RUN_SQUIRREL", true);
  const keepPreview = envFlag("AUDIT_KEEP_PREVIEW", false);

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
        },
        label: "npm run build",
      });
    }

    if (startPreview) {
      preview = startPreviewServer({ port: previewPort });
      await waitForHttpOk(baseUrl, 45_000);
      writeOutput(`PREVIEW ${baseUrl}`);
    } else {
      await waitForHttpOk(baseUrl, 10_000);
    }

    if (runLoaded) {
      await runCommand(process.execPath, [loadedAuditScript], {
        env: {
          ...process.env,
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
          AUDIT_BASE_URL: baseUrl,
          AUDIT_OUTPUT_DIR: path.join(outputRoot, "squirrel"),
        },
        label: "authenticated SquirrelScan",
      });
    }

    writePipelineIndex({
      baseUrl,
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
