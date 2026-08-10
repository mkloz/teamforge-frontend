// @ts-check

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import process from "node:process";

/**
 * @typedef {Record<string, string | undefined>} EnvMap
 * @typedef {"VITE_API_URL" | "VITE_APP_URL"} RequiredEnvKey
 * @typedef {"VITE_GIPHY_API_KEY" | "VITE_GOOGLE_CLIENT_ID" | "VITE_GOOGLE_MAPS_API_KEY"} OptionalProviderEnvKey
 * @typedef {{ detail: string; name: string; passed: boolean }} EnvCheck
 * @typedef {{ envFile: string | null }} CliArgs
 * @typedef {{ url: URL; value: string | undefined }} ParsedEnvUrl
 */

/** @type {readonly RequiredEnvKey[]} */
const REQUIRED_ENV_KEYS = ["VITE_APP_URL", "VITE_API_URL"];
/** @type {readonly OptionalProviderEnvKey[]} */
const OPTIONAL_PROVIDER_ENV_KEYS = [
  "VITE_GOOGLE_CLIENT_ID",
  "VITE_GOOGLE_MAPS_API_KEY",
  "VITE_GIPHY_API_KEY",
];

const API_PREFIX_PATTERN = /\/api\/v\d+$/u;
const LOCAL_HOSTS = new Set(["0.0.0.0", "127.0.0.1", "localhost"]);
const PLACEHOLDER_PATTERN =
  /^(your-|replace-|changeme$|change-me$|example$|example-|todo$|test$)/iu;
const PRODUCTION_API_URL = "https://api.findafew.today/findafew/api/v1";
const PRODUCTION_APP_URL = "https://findafew.today";
const EXPECTED_PRODUCTION_SOCKET_PATH = "/findafew/socket.io";

/** @type {EnvCheck[]} */
const checks = [];

/**
 * Adds one production-env preflight check.
 *
 * @param {string} name Check label.
 * @param {boolean} passed Whether the check passed.
 * @param {string} detail Human-readable detail.
 */
function addCheck(name, passed, detail) {
  checks.push({ detail, name, passed });
}

/**
 * Parses CLI flags for the env preflight.
 *
 * @param {string[]} argv Process arguments after the script path.
 * @returns {CliArgs} Parsed args.
 */
function parseArgs(argv) {
  /** @type {CliArgs} */
  const args = { envFile: null };

  for (let index = 0; index < argv.length; index += 1) {
    const envFileArg = parseEnvFileArg(argv[index], argv[index + 1]);

    if (!envFileArg) {
      continue;
    }

    args.envFile = envFileArg.envFile;

    if (envFileArg.consumesNext) {
      index += 1;
    }
  }

  return args;
}

/**
 * Parses one env-file CLI flag.
 *
 * @param {string} arg Current CLI arg.
 * @param {string | undefined} nextArg Next CLI arg.
 * @returns {{ consumesNext: boolean; envFile: string | null } | null} Parsed flag.
 */
function parseEnvFileArg(arg, nextArg) {
  if (arg === "--env-file") {
    return { consumesNext: true, envFile: nextArg ?? null };
  }

  if (arg.startsWith("--env-file=")) {
    return {
      consumesNext: false,
      envFile: arg.slice("--env-file=".length),
    };
  }

  return null;
}

/**
 * Removes wrapping quotes from a dotenv value.
 *
 * @param {string} value Raw value.
 * @returns {string} Unquoted value.
 */
function stripEnvQuotes(value) {
  return value.trim().replace(/^["']|["']$/gu, "");
}

/**
 * Parses a minimal dotenv file.
 *
 * @param {string} text Env file text.
 * @returns {EnvMap} Parsed key/value pairs.
 */
function parseEnvFile(text) {
  /** @type {EnvMap} */
  const result = {};

  for (const line of text.split(/\r?\n/u)) {
    const assignment = parseEnvAssignmentLine(line);

    if (!assignment) {
      continue;
    }

    result[assignment.key] = assignment.value;
  }

  return result;
}

/**
 * Parses one dotenv assignment line.
 *
 * @param {string} line Dotenv line.
 * @returns {{ key: string; value: string } | null} Parsed assignment.
 */
function parseEnvAssignmentLine(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const assignment = trimmed.startsWith("export ")
    ? trimmed.slice("export ".length)
    : trimmed;
  const separatorIndex = assignment.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  return {
    key: assignment.slice(0, separatorIndex).trim(),
    value: stripEnvQuotes(assignment.slice(separatorIndex + 1)),
  };
}

/**
 * Loads the requested env file and overlays it on the current process env.
 *
 * @param {string | null} envFile Env file path.
 * @returns {Promise<EnvMap>} Environment map.
 */
async function loadEnvironment(envFile) {
  if (!envFile) {
    return process.env;
  }

  if (!existsSync(envFile)) {
    throw new Error(`Environment file not found: ${envFile}`);
  }

  return {
    ...process.env,
    ...parseEnvFile(await readFile(envFile, "utf8")),
  };
}

/**
 * Checks whether a value is absent or still placeholder-like.
 *
 * @param {unknown} value Candidate env value.
 * @returns {boolean} Whether the value is unusable for production.
 */
function isMissingOrPlaceholder(value) {
  return (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    PLACEHOLDER_PATTERN.test(value.trim())
  );
}

/**
 * Derives the realtime namespace URL from the REST API URL.
 *
 * @param {URL} apiUrl Parsed API URL.
 * @returns {string} Realtime namespace URL.
 */
function getRealtimeUrlForApiUrl(apiUrl) {
  return new URL("/realtime", apiUrl.origin).toString();
}

/**
 * Derives the Socket.IO path from the public REST API prefix.
 *
 * @param {URL} apiUrl Parsed API URL.
 * @returns {string} Socket.IO path.
 */
function getSocketPathForApiUrl(apiUrl) {
  const publicBasePath = apiUrl.pathname
    .replace(/\/+$/u, "")
    .replace(API_PREFIX_PATTERN, "");

  return `${publicBasePath}/socket.io`.replace(/\/{2,}/gu, "/");
}

/**
 * Parses a URL-valued env key while recording the parse check.
 *
 * @param {EnvMap} env Environment map.
 * @param {"VITE_API_URL" | "VITE_APP_URL" | "VITE_MEDIA_BASE_URL"} key URL env key.
 * @returns {ParsedEnvUrl | null} Parsed URL result.
 */
function parseUrlEnvValue(env, key) {
  const value = env[key];

  try {
    const url = new URL(value ?? "");

    addCheck(`${key} parses`, true, `${value} is a valid URL.`);
    return { url, value };
  } catch {
    addCheck(`${key} parses`, false, `${value ?? ""} is not a URL.`);
    return null;
  }
}

/**
 * Validates the production URL invariants shared by public browser env URLs.
 *
 * @param {"VITE_API_URL" | "VITE_APP_URL" | "VITE_MEDIA_BASE_URL"} key URL env key.
 * @param {URL} url Parsed URL.
 */
function validateProductionUrlShape(key, url) {
  addCheck(
    `${key} uses HTTPS`,
    url.protocol === "https:",
    `${key} protocol is ${url.protocol}.`,
  );
  addCheck(
    `${key} is not local`,
    !LOCAL_HOSTS.has(url.hostname),
    `${key} host is ${url.hostname}.`,
  );
}

/**
 * Validates required browser-baked env keys.
 *
 * @param {EnvMap} env Environment map.
 */
function validateRequiredEnv(env) {
  for (const key of REQUIRED_ENV_KEYS) {
    const value = env[key];
    const valid = !isMissingOrPlaceholder(value);

    addCheck(
      `${key} is production-like`,
      valid,
      valid
        ? `${key} is set.`
        : `${key} is missing, empty, or still looks like a placeholder.`,
    );
  }
}

/**
 * Validates optional provider identities without requiring unprovisioned
 * providers for a release. Missing values keep their feature fail-closed.
 *
 * @param {EnvMap} env Environment map.
 */
function validateOptionalProviderEnv(env) {
  for (const key of OPTIONAL_PROVIDER_ENV_KEYS) {
    const value = env[key];
    const configured = Boolean(value?.trim());
    const valid = !configured || !isMissingOrPlaceholder(value);

    addCheck(
      `${key} is provider-gated`,
      valid,
      !configured
        ? `${key} is not configured; its optional feature remains disabled.`
        : valid
          ? `${key} is configured without exposing its value.`
          : `${key} is configured with a placeholder-like value.`,
    );
  }

  const staticMapsFlag = env.VITE_GOOGLE_STATIC_MAPS_ENABLED?.trim() ?? "";
  const validStaticMapsFlag =
    staticMapsFlag === "" ||
    staticMapsFlag === "false" ||
    staticMapsFlag === "true";
  addCheck(
    "VITE_GOOGLE_STATIC_MAPS_ENABLED is explicit",
    validStaticMapsFlag,
    validStaticMapsFlag
      ? `Static Maps is ${staticMapsFlag === "true" ? "enabled" : "disabled"}.`
      : "VITE_GOOGLE_STATIC_MAPS_ENABLED must be true, false, or unset.",
  );
  addCheck(
    "Static Maps has separate provider proof",
    staticMapsFlag !== "true" || Boolean(env.VITE_GOOGLE_MAPS_API_KEY?.trim()),
    staticMapsFlag === "true"
      ? "Static Maps has a configured Google Maps key."
      : "Static Maps remains disabled.",
  );
}

/**
 * Validates production app URL shape.
 *
 * @param {EnvMap} env Environment map.
 */
function validateAppUrl(env) {
  const parsed = parseUrlEnvValue(env, "VITE_APP_URL");

  if (!parsed) {
    return;
  }

  validateProductionUrlShape("VITE_APP_URL", parsed.url);
  addCheck(
    "VITE_APP_URL uses the canonical apex",
    parsed.value === PRODUCTION_APP_URL,
    `VITE_APP_URL resolves to ${parsed.url.origin}.`,
  );
}

/**
 * Validates production API URL shape and derived realtime paths.
 *
 * @param {EnvMap} env Environment map.
 */
function validateApiUrl(env) {
  const parsed = parseUrlEnvValue(env, "VITE_API_URL");

  if (!parsed) {
    return;
  }

  const { url: apiUrl, value } = parsed;

  validateProductionUrlShape("VITE_API_URL", apiUrl);
  addCheck(
    "VITE_API_URL uses the canonical public contract",
    value === PRODUCTION_API_URL,
    `VITE_API_URL path is ${apiUrl.origin}${apiUrl.pathname}.`,
  );
  addCheck(
    "VITE_API_URL includes API prefix",
    API_PREFIX_PATTERN.test(apiUrl.pathname.replace(/\/+$/u, "")),
    `VITE_API_URL path is ${apiUrl.pathname}.`,
  );

  const realtimeUrl = getRealtimeUrlForApiUrl(apiUrl);
  const socketPath = getSocketPathForApiUrl(apiUrl);

  addCheck(
    "Realtime namespace derives from API origin",
    realtimeUrl === `${apiUrl.origin}/realtime`,
    `Realtime namespace is ${realtimeUrl}.`,
  );
  addCheck(
    "Socket.IO path derives from public API prefix",
    socketPath.endsWith("/socket.io") && !socketPath.includes("//"),
    `Socket.IO path is ${socketPath}.`,
  );

  if (value === PRODUCTION_API_URL) {
    addCheck(
      "Production Socket.IO path",
      socketPath === EXPECTED_PRODUCTION_SOCKET_PATH,
      `Production Socket.IO path is ${socketPath}.`,
    );
  }
}

/**
 * Validates production media base URL shape.
 *
 * @param {EnvMap} env Environment map.
 */
function validateMediaBaseUrl(env) {
  if (!env.VITE_MEDIA_BASE_URL?.trim()) {
    addCheck(
      "VITE_MEDIA_BASE_URL is provider-gated",
      true,
      "No media host is configured; relative same-origin media URLs remain active.",
    );
    return;
  }

  const parsed = parseUrlEnvValue(env, "VITE_MEDIA_BASE_URL");

  if (!parsed) {
    return;
  }

  validateProductionUrlShape("VITE_MEDIA_BASE_URL", parsed.url);
}

/**
 * Prints all checks and sets the process exit code on failure.
 *
 * @param {string | null} envFile Env file path, if supplied.
 */
function printSummary(envFile) {
  const { failed, passed } = summarizeEnvChecks();
  const source = envFile ? ` from ${envFile}` : " from process env";

  printEnvCheckLines();
  printEnvCheckCountSummary(source, passed.length, failed.length);
  setFailureExitCode(failed);
}

/**
 * Groups env checks by outcome.
 *
 * @returns {{ failed: EnvCheck[]; passed: EnvCheck[] }} Check summary.
 */
function summarizeEnvChecks() {
  return {
    failed: checks.filter((check) => !check.passed),
    passed: checks.filter((check) => check.passed),
  };
}

/**
 * Prints each env check line.
 */
function printEnvCheckLines() {
  for (const check of checks) {
    const label = check.passed ? "PASS" : "FAIL";
    process.stdout.write(`${label} ${check.name}: ${check.detail}\n`);
  }
}

/**
 * Prints the final env check count summary.
 *
 * @param {string} source Env source label.
 * @param {number} passedCount Passing check count.
 * @param {number} failedCount Failed check count.
 */
function printEnvCheckCountSummary(source, passedCount, failedCount) {
  process.stdout.write(
    `\nPWA production env preflight${source}: ${passedCount} passed, ${failedCount} failed.\n`,
  );
}

/**
 * Sets a failing process exit code when needed.
 *
 * @param {readonly EnvCheck[]} failed Failed checks.
 */
function setFailureExitCode(failed) {
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

/**
 * Runs the production PWA env preflight.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const { envFile } = parseArgs(process.argv.slice(2));
  const env = await loadEnvironment(envFile);

  validateRequiredEnv(env);
  validateOptionalProviderEnv(env);
  validateAppUrl(env);
  validateApiUrl(env);
  validateMediaBaseUrl(env);
  printSummary(envFile);
}

await main();
