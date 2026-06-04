import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import process from "node:process";

/**
 * @typedef {Record<string, string | undefined>} EnvMap
 * @typedef {{ detail: string; name: string; passed: boolean }} EnvCheck
 * @typedef {{ envFile: string | null }} CliArgs
 */

const REQUIRED_ENV_KEYS = [
  "VITE_API_URL",
  "VITE_GOOGLE_CLIENT_ID",
  "VITE_GOOGLE_MAPS_API_KEY",
  "VITE_GIPHY_API_KEY",
];

const API_PREFIX_PATTERN = /\/api\/v\d+$/u;
const LOCAL_HOSTS = new Set(["0.0.0.0", "127.0.0.1", "localhost"]);
const PLACEHOLDER_PATTERN =
  /^(your-|replace-|changeme$|change-me$|example$|example-|todo$|test$)/iu;
const PRODUCTION_API_URL = "https://api.mkloz.com/teamforge/api/v1";
const EXPECTED_PRODUCTION_SOCKET_PATH = "/teamforge/socket.io";

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
  const args = { envFile: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--env-file") {
      args.envFile = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg.startsWith("--env-file=")) {
      args.envFile = arg.slice("--env-file=".length);
    }
  }

  return args;
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
  const result = {};

  for (const line of text.split(/\r?\n/u)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const assignment = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length)
      : trimmed;
    const separatorIndex = assignment.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = assignment.slice(0, separatorIndex).trim();
    const value = stripEnvQuotes(assignment.slice(separatorIndex + 1));

    result[key] = value;
  }

  return result;
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
 * Validates production API URL shape and derived realtime paths.
 *
 * @param {EnvMap} env Environment map.
 */
function validateApiUrl(env) {
  const value = env.VITE_API_URL;
  let apiUrl;

  try {
    apiUrl = new URL(value);
    addCheck("VITE_API_URL parses", true, `${value} is a valid URL.`);
  } catch {
    addCheck("VITE_API_URL parses", false, `${value ?? ""} is not a URL.`);
    return;
  }

  addCheck(
    "VITE_API_URL uses HTTPS",
    apiUrl.protocol === "https:",
    `VITE_API_URL protocol is ${apiUrl.protocol}.`,
  );
  addCheck(
    "VITE_API_URL is not local",
    !LOCAL_HOSTS.has(apiUrl.hostname),
    `VITE_API_URL host is ${apiUrl.hostname}.`,
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
 * Prints all checks and sets the process exit code on failure.
 *
 * @param {string | null} envFile Env file path, if supplied.
 */
function printSummary(envFile) {
  const failed = checks.filter((check) => !check.passed);
  const passed = checks.filter((check) => check.passed);
  const source = envFile ? ` from ${envFile}` : " from process env";

  for (const check of checks) {
    const label = check.passed ? "PASS" : "FAIL";
    process.stdout.write(`${label} ${check.name}: ${check.detail}\n`);
  }

  process.stdout.write(
    `\nPWA production env preflight${source}: ${passed.length} passed, ${failed.length} failed.\n`,
  );

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
  validateApiUrl(env);
  printSummary(envFile);
}

await main();
