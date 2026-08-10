import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const DEFAULT_FIRECRAWL_URL = "http://localhost:3002";
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "[::1]", "localhost"]);
const BLOCKED_OPTIONS = ["--api-key", "--api-url", "-k"];

try {
  await main();
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}

async function main() {
  const args = process.argv.slice(2);
  const endpoint = resolveLocalEndpoint(
    process.env.FINDAFEW_FIRECRAWL_URL ?? DEFAULT_FIRECRAWL_URL,
  );

  assertNoConnectionOverrides(args);
  await assertLocalServer(endpoint);

  if (args.length === 1 && args[0] === "--check") {
    process.stdout.write(`Local Firecrawl is ready at ${endpoint}\n`);
    return;
  }

  if (args.length === 0) {
    process.stderr.write(
      "Usage: node scripts/research/firecrawl-local.mjs <command> [options]\n" +
        'Example: node scripts/research/firecrawl-local.mjs search "query" --limit 5\n',
    );
    process.exitCode = 2;
    return;
  }

  const childEnvironment = { ...process.env, FIRECRAWL_API_URL: endpoint };
  delete childEnvironment.FIRECRAWL_API_KEY;

  const { command, prefixArgs } = resolveFirecrawlCommand();
  const child = spawn(
    command,
    [...prefixArgs, "--api-url", endpoint, ...args],
    {
      env: childEnvironment,
      stdio: "inherit",
      windowsHide: true,
    },
  );

  await new Promise((resolve, reject) => {
    child.on("error", (error) => {
      reject(new Error(`Unable to start the Firecrawl CLI: ${error.message}`));
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Firecrawl stopped after receiving ${signal}.`));
        return;
      }

      process.exitCode = code ?? 1;
      resolve();
    });
  });
}

function resolveLocalEndpoint(value) {
  let url;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("FINDAFEW_FIRECRAWL_URL must be a valid loopback URL.");
  }

  if (!LOOPBACK_HOSTS.has(url.hostname)) {
    throw new Error(
      `Refusing non-local Firecrawl endpoint: ${url.origin}. ` +
        "Only localhost, 127.0.0.1, or ::1 is allowed.",
    );
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("The local Firecrawl endpoint must use HTTP or HTTPS.");
  }

  return url.origin;
}

function assertNoConnectionOverrides(commandArgs) {
  const blocked = commandArgs.find((argument) =>
    BLOCKED_OPTIONS.some(
      (option) => argument === option || argument.startsWith(`${option}=`),
    ),
  );

  if (blocked) {
    throw new Error(
      `Connection override ${blocked} is not allowed. ` +
        "This command is locked to the local Firecrawl server.",
    );
  }
}

async function assertLocalServer(url) {
  let response;

  try {
    response = await fetch(`${url}/`, {
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    throw new Error(
      `Local Firecrawl is unavailable at ${url}. ` +
        `Start the local server and retry; hosted fallback is disabled. (${error.message})`,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new Error(
      `Local Firecrawl health check failed with HTTP ${response.status}. ` +
        "Hosted fallback is disabled.",
    );
  }

  const payload = await response.json().catch(() => null);

  if (payload?.message !== "Firecrawl API") {
    throw new Error(
      `The service at ${url} did not identify itself as Firecrawl. ` +
        "Hosted fallback is disabled.",
    );
  }
}

function resolveFirecrawlCommand() {
  if (process.platform !== "win32") {
    return { command: "firecrawl", prefixArgs: [] };
  }

  const appData = process.env.APPDATA;
  const scriptPath = appData
    ? path.join(appData, "npm", "firecrawl.ps1")
    : null;

  if (!scriptPath || !existsSync(scriptPath)) {
    throw new Error(
      "Unable to find the Firecrawl CLI launcher under the Windows npm directory.",
    );
  }

  return {
    command: "powershell.exe",
    prefixArgs: [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
    ],
  };
}
