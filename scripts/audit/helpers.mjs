// @ts-check

import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import path from "node:path";
import { z } from "zod";

/**
 * @typedef {object} AuditCredentials
 * @property {string} email Local audit account email.
 * @property {string} password Local audit account password.
 *
 * @typedef {object} AuditTokens
 * @property {string} accessToken JWT used by the frontend audit bootstrap.
 * @property {string} [refreshToken] Refresh token captured from JSON or cookie rotation.
 *
 * @typedef {object} AuditTokenPayload
 * @property {string} accessToken JWT returned by the backend auth endpoint.
 * @property {string} [refreshToken] Optional refresh token returned in JSON.
 *
 * @typedef {object} AuditLoginOptions
 * @property {string} [apiUrl] Backend API URL that includes `/api/v1`.
 * @property {string} [refreshCookieName] Cookie name used by the backend refresh flow.
 *
 * @typedef {object} AuditLoginAttemptResult
 * @property {string} body Raw response body.
 * @property {Response} response Fetch response for the login attempt.
 * @property {AuditTokens} [tokens] Parsed tokens when the attempt succeeded.
 *
 * @typedef {object} AuditLoginAttemptOptions
 * @property {AuditCredentials} credentials Audit account credentials.
 * @property {URL} loginUrl Backend login URL.
 * @property {string} refreshCookieName Refresh cookie name.
 *
 * @typedef {object} AuditSessionFailureOptions
 * @property {number} attempt Zero-based retry attempt.
 * @property {string} body Raw failed response body.
 * @property {URL} loginUrl Backend login URL.
 * @property {number} maxRetries Maximum retry count.
 * @property {Response} response Failed login response.
 *
 * @typedef {object} EnvFileEntry
 * @property {string} key Environment variable name.
 * @property {string} value Environment variable value.
 *
 * @typedef {object} RefreshAuditTokensOptions
 * @property {string} [apiUrl] Backend API URL that includes `/api/v1`.
 * @property {string} [refreshCookieName] Cookie name used by the backend refresh flow.
 * @property {boolean} [requireRefreshToken] Whether missing refresh material should fail.
 *
 * @typedef {object} RefreshAuditTokensRequestOptions
 * @property {string} refreshCookieName Cookie name used by the backend refresh flow.
 * @property {string} refreshToken Refresh token sent as bearer and cookie auth.
 * @property {URL} refreshUrl Backend refresh URL.
 *
 * @typedef {object} RefreshedAuditTokensOptions
 * @property {string | undefined} currentRefreshToken Current refresh token fallback.
 * @property {AuditTokenPayload} payload Parsed refresh response payload.
 * @property {string} refreshCookieName Cookie name used by the backend refresh flow.
 * @property {Response} response Backend refresh response.
 *
 * @typedef {object} RefreshedRefreshTokenOptions
 * @property {string | undefined} currentRefreshToken Current refresh token fallback.
 * @property {AuditTokenPayload} payload Parsed refresh response payload.
 * @property {string} refreshCookieName Cookie name used by the backend refresh flow.
 * @property {Response} response Backend refresh response.
 *
 * @typedef {object} ResolveAuditPreviewHttpsOptions
 * @property {string | undefined} [certPath] Preview TLS certificate path.
 * @property {string | undefined} [explicitValue] Explicit HTTPS env value.
 * @property {string | undefined} [keyPath] Preview TLS private key path.
 *
 * @typedef {object} AuditProbeResult
 * @property {number} status HTTP status code.
 *
 * @typedef {object} HttpOkAttempt
 * @property {unknown} [error] Probe error when the request failed.
 * @property {boolean} ok Whether the probe returned a 2xx response.
 *
 * @typedef {object} CertificateTimeoutDetails
 * @property {string} causeMessage Nested certificate error message.
 * @property {string} errorMessage Searchable error/cause text.
 * @property {string} message Top-level error message.
 *
 * @typedef {object} CommandOptions
 * @property {NodeJS.ProcessEnv} [env] Environment for the spawned command.
 * @property {string} [label] Friendly command label for logs.
 * @property {boolean} [log] Whether to log the command before running.
 * @property {"inherit" | "pipe" | "ignore"} [stdio] Stdio mode.
 *
 * @typedef {object} SpawnInvocation
 * @property {string} command Executable passed to `spawn`.
 * @property {string[]} args Arguments passed to `spawn`.
 */

export const cwd = process.cwd();
export const DEFAULT_API_URL = "http://localhost:6969/api/v1";
export const DEFAULT_SQUIRREL_BIN =
  process.platform === "win32"
    ? path.join(cwd, "temp", "squirrel", "squirrel.exe")
    : "squirrel";
const DEFAULT_AUDIT_BASE_URL = "http://127.0.0.1:4173";
const DEFAULT_REFRESH_COOKIE_NAME = "teamforge_refresh_token";
const HTTP_OK_RETRY_DELAY_MS = 500;
const CERTIFICATE_TRUST_ERROR_MARKERS = [
  "certificate",
  "cert",
  "self-signed",
  "unable to verify",
];
const AUDIT_ENV_TRUE_VALUES = ["true", "1", "yes"];
const AUDIT_ENV_FALSE_VALUES = ["false", "0", "no"];

const refreshResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
  })
  .passthrough();
const loginResponseSchema = refreshResponseSchema;

/**
 * Returns a stable date stamp for report folder names.
 *
 * @returns {string} Current date in YYYY-MM-DD format.
 */
export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Writes an informational line to stdout.
 *
 * @param {string} message Message to print.
 */
export function writeOutput(message) {
  process.stdout.write(`${message}\n`);
}

/**
 * Writes an error with stack details when available.
 *
 * @param {unknown} error Error-like value to print.
 */
export function writeError(error) {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  process.stderr.write(`${message}\n`);
}

/**
 * Normalizes commands that Windows cannot spawn directly in some shells.
 *
 * @param {string} command Command executable.
 * @param {string[]} args Command arguments.
 * @returns {SpawnInvocation} Spawn-ready invocation.
 */
export function getSpawnInvocation(command, args) {
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
export function runCommand(
  command,
  args,
  { env = process.env, label, log = true, stdio = "inherit" } = {},
) {
  if (log) {
    writeOutput(`RUN ${label ?? [command, ...args].join(" ")}`);
  }

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
 * Reads a boolean environment flag.
 *
 * @param {string} name Environment variable name.
 * @param {boolean} [fallback=false] Value used when the variable is absent.
 * @returns {boolean} Parsed flag value.
 */
export function envFlag(name, fallback = false) {
  const value = process.env[name];

  if (value === undefined) {
    return fallback;
  }

  return value === "true" || value === "1" || value === "yes";
}

/**
 * Resolves whether the audit preview should use HTTPS.
 *
 * Explicit true/false env values win. When unset or set to `auto`, the preview
 * switches to HTTPS as soon as both certificate paths are configured.
 *
 * @param {ResolveAuditPreviewHttpsOptions} [options] Resolution options.
 * @returns {boolean} Whether the preview should serve HTTPS.
 */
export function resolveAuditPreviewHttps({
  certPath = process.env.AUDIT_PREVIEW_CERT_PATH,
  explicitValue = process.env.AUDIT_PREVIEW_HTTPS,
  keyPath = process.env.AUDIT_PREVIEW_KEY_PATH,
} = {}) {
  const hasCertificatePair = Boolean(certPath && keyPath);
  const explicitDecision = getExplicitAuditPreviewHttpsDecision(explicitValue);

  return explicitDecision ?? hasCertificatePair;
}

function isAutoAuditPreviewHttpsValue(value) {
  return value === undefined || value === "" || value === "auto";
}

function isAuditEnvBooleanValue(value, acceptedValues) {
  return acceptedValues.includes(value.trim().toLowerCase());
}

function getExplicitAuditPreviewHttpsDecision(value) {
  if (isAutoAuditPreviewHttpsValue(value)) {
    return null;
  }

  if (isAuditEnvBooleanValue(value, AUDIT_ENV_TRUE_VALUES)) {
    return true;
  }

  if (isAuditEnvBooleanValue(value, AUDIT_ENV_FALSE_VALUES)) {
    return false;
  }

  throw new Error(
    `Invalid AUDIT_PREVIEW_HTTPS value "${value}". Use true, false, or auto.`,
  );
}

/**
 * Loads audit env files without overriding already-exported process values.
 *
 * @param {string[]} [fileNames] Env files to load in precedence order.
 */
export function loadAuditEnvFiles(
  fileNames = [".env.audit.local", ".env.local", ".env"],
) {
  for (const fileName of fileNames) {
    loadEnvFile(fileName);
  }
}

/**
 * Loads one dotenv-style file into `process.env` if it exists.
 *
 * @param {string} fileName Repo-relative env file path.
 */
function loadEnvFile(fileName) {
  const filePath = getAuditEnvFilePath(fileName);

  if (!existsSync(filePath)) {
    return;
  }

  for (const entry of readEnvFileEntries(filePath)) {
    applyEnvFileEntry(entry);
  }
}

/**
 * Resolves an audit env file path from the repo root.
 *
 * @param {string} fileName Repo-relative env file path.
 * @returns {string} Absolute env file path.
 */
function getAuditEnvFilePath(fileName) {
  return path.join(cwd, fileName);
}

/**
 * Reads parseable dotenv entries from a file.
 *
 * @param {string} filePath Env file path.
 * @returns {EnvFileEntry[]} Parsed env entries.
 */
function readEnvFileEntries(filePath) {
  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map(parseEnvFileLine)
    .filter(isEnvFileEntry);
}

/**
 * Narrows parsed env lines to real entries.
 *
 * @param {EnvFileEntry | null} entry Parsed env entry candidate.
 * @returns {entry is EnvFileEntry} Whether the parsed line produced an entry.
 */
function isEnvFileEntry(entry) {
  return entry !== null;
}

/**
 * Applies one env file entry without overriding exported process values.
 *
 * @param {EnvFileEntry} entry Parsed env entry.
 */
function applyEnvFileEntry(entry) {
  process.env[entry.key] ??= entry.value;
}

/**
 * Parses one dotenv-style line.
 *
 * @param {string} line Raw env file line.
 * @returns {EnvFileEntry | null} Parsed entry when the line is loadable.
 */
function parseEnvFileLine(line) {
  const trimmed = line.trim();

  if (!shouldLoadEnvFileLine(trimmed)) {
    return null;
  }

  const equalsIndex = trimmed.indexOf("=");

  if (equalsIndex === -1) {
    return null;
  }

  return {
    key: trimmed.slice(0, equalsIndex).trim(),
    value: unquoteEnvFileValue(trimmed.slice(equalsIndex + 1).trim()),
  };
}

/**
 * Returns whether an env file line can contain an assignment.
 *
 * @param {string} trimmedLine Trimmed env file line.
 * @returns {boolean} Whether the line should be parsed.
 */
function shouldLoadEnvFileLine(trimmedLine) {
  return Boolean(trimmedLine) && !trimmedLine.startsWith("#");
}

/**
 * Removes matching single or double quotes around an env value.
 *
 * @param {string} value Raw env value.
 * @returns {string} Unquoted env value.
 */
function unquoteEnvFileValue(value) {
  if (isQuotedEnvFileValue(value, '"') || isQuotedEnvFileValue(value, "'")) {
    return value.slice(1, -1);
  }

  return value;
}

/**
 * Returns whether a value is wrapped in the supplied quote character.
 *
 * @param {string} value Raw env value.
 * @param {string} quote Quote character.
 * @returns {boolean} Whether the value is quoted.
 */
function isQuotedEnvFileValue(value, quote) {
  return value.startsWith(quote) && value.endsWith(quote);
}

/**
 * Reads a required environment variable.
 *
 * @param {string} name Environment variable name.
 * @returns {string} Non-empty variable value.
 */
function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/**
 * Reads the local audit account credentials.
 *
 * @returns {AuditCredentials} Credential pair used for `auth/login`.
 */
export function getAuditCredentialsFromEnv() {
  return {
    email: getRequiredEnv("AUDIT_USER_EMAIL"),
    password: getRequiredEnv("AUDIT_USER_PASSWORD"),
  };
}

/**
 * Logs in the local audit account and captures access/refresh tokens.
 *
 * @param {AuditLoginOptions} [options] Login options.
 * @returns {Promise<AuditTokens>} Tokens suitable for audit bootstrap.
 */
export async function loginAuditUser({
  apiUrl = getApiUrl(),
  refreshCookieName = getRefreshCookieName(),
} = {}) {
  const credentials = getAuditCredentialsFromEnv();
  const loginUrl = new URL("auth/login", ensureTrailingSlash(apiUrl));
  const maxRetries = getAuditLoginMaxRetries();

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop -- Login retries must honor backend rate-limit timing.
    const result = await requestAuditLoginAttempt({
      credentials,
      loginUrl,
      refreshCookieName,
    });

    if (result.tokens) {
      return result.tokens;
    }

    // eslint-disable-next-line no-await-in-loop -- Backoff must wait before retrying.
    await handleAuditLoginFailure({
      attempt,
      body: result.body,
      loginUrl,
      maxRetries,
      response: result.response,
    });
  }

  throw new Error(`Audit user login failed at ${loginUrl.href}.`);
}

/**
 * Reads the configured audit login retry count.
 *
 * @returns {number} Maximum retry count.
 */
function getAuditLoginMaxRetries() {
  return Number(process.env.AUDIT_LOGIN_RETRIES ?? "2");
}

/**
 * Throws or waits for a retry after a failed login attempt.
 *
 * @param {AuditSessionFailureOptions} options Failed attempt details.
 * @returns {Promise<void>}
 */
async function handleAuditLoginFailure({
  attempt,
  body,
  loginUrl,
  maxRetries,
  response,
}) {
  if (!shouldRetryAuditLogin(response, attempt, maxRetries)) {
    throw getAuditLoginFailureError(response, loginUrl, body);
  }

  await waitForAuditLoginRetry(response, attempt);
}

/**
 * Performs one audit login request and parses tokens on success.
 *
 * @param {AuditLoginAttemptOptions} options Login request options.
 * @returns {Promise<AuditLoginAttemptResult>} Login attempt result.
 */
async function requestAuditLoginAttempt({
  credentials,
  loginUrl,
  refreshCookieName,
}) {
  const response = await requestAuditLogin(loginUrl, credentials);
  const body = await response.text();

  if (!response.ok) {
    return { body, response };
  }

  return {
    body,
    response,
    tokens: parseAuditLoginTokens(body, response, refreshCookieName),
  };
}

/**
 * Sends the backend login request.
 *
 * @param {URL} loginUrl Backend login URL.
 * @param {AuditCredentials} credentials Audit account credentials.
 * @returns {Promise<Response>} Fetch response.
 */
function requestAuditLogin(loginUrl, credentials) {
  return fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
}

/**
 * Parses a successful login response into audit tokens.
 *
 * @param {string} body Raw login response body.
 * @param {Response} response Login fetch response.
 * @param {string} refreshCookieName Refresh cookie name.
 * @returns {AuditTokens} Parsed audit tokens.
 */
function parseAuditLoginTokens(body, response, refreshCookieName) {
  return getAuditLoginTokens(
    parseAuditTokenPayload(
      body,
      loginResponseSchema,
      "Audit user login response did not include accessToken.",
    ),
    response,
    refreshCookieName,
  );
}

/**
 * Parses and validates a backend auth token payload.
 *
 * @param {string} body Raw JSON response body.
 * @param {typeof refreshResponseSchema} schema Token response schema.
 * @param {string} errorMessage Error message when validation fails.
 * @returns {AuditTokenPayload} Parsed token payload.
 */
function parseAuditTokenPayload(body, schema, errorMessage) {
  const parsedPayload = schema.safeParse(JSON.parse(body));

  if (!parsedPayload.success) {
    throw new Error(errorMessage);
  }

  return parsedPayload.data;
}

/**
 * Combines JSON and cookie refresh material into audit tokens.
 *
 * @param {AuditTokenPayload} payload Parsed login payload.
 * @param {Response} response Login fetch response.
 * @param {string} refreshCookieName Refresh cookie name.
 * @returns {AuditTokens} Audit tokens.
 */
function getAuditLoginTokens(payload, response, refreshCookieName) {
  return {
    accessToken: payload.accessToken,
    refreshToken:
      payload.refreshToken ??
      readRefreshTokenFromSetCookie(response.headers, refreshCookieName) ??
      undefined,
  };
}

/**
 * Returns whether a failed login should retry.
 *
 * @param {Response} response Login fetch response.
 * @param {number} attempt Zero-based retry attempt.
 * @param {number} maxRetries Maximum retry count.
 * @returns {boolean} Whether to retry.
 */
function shouldRetryAuditLogin(response, attempt, maxRetries) {
  return response.status === 429 && attempt < maxRetries;
}

/**
 * Waits according to Retry-After or exponential backoff.
 *
 * @param {Response} response Login fetch response.
 * @param {number} attempt Zero-based retry attempt.
 * @returns {Promise<void>}
 */
async function waitForAuditLoginRetry(response, attempt) {
  const retryDelayMs = getLoginRetryDelayMs(response, attempt);

  writeOutput(
    `WARN Audit login was rate limited. Retrying in ${Math.ceil(retryDelayMs / 1000)}s.`,
  );
  await sleep(retryDelayMs);
}

/**
 * Builds the login failure error shown by audit scripts.
 *
 * @param {Response} response Failed login response.
 * @param {URL} loginUrl Backend login URL.
 * @param {string} body Raw failed response body.
 * @returns {Error} Login failure error.
 */
function getAuditLoginFailureError(response, loginUrl, body) {
  return new Error(
    `Audit user login failed (${response.status}) at ${loginUrl.href}: ${body}`,
  );
}

/**
 * Reads audit tokens supplied by the parent pipeline process.
 *
 * @returns {AuditTokens | null} Parsed audit session when present.
 */
function readAuditSessionFromEnv() {
  const value = getAuditSessionJsonFromEnv();

  if (!value) {
    return null;
  }

  try {
    return parseAuditSessionJson(value);
  } catch (error) {
    throw new Error(
      `Could not parse AUDIT_SESSION_JSON: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

function getAuditSessionJsonFromEnv() {
  return process.env.AUDIT_SESSION_JSON;
}

/**
 * Parses a serialized parent-provided audit session.
 *
 * @param {string} value Serialized audit session JSON.
 * @returns {AuditTokens} Parsed audit session.
 */
function parseAuditSessionJson(value) {
  const parsedPayload = refreshResponseSchema.safeParse(JSON.parse(value));

  if (!parsedPayload.success) {
    throw new Error("AUDIT_SESSION_JSON did not include accessToken.");
  }

  return {
    accessToken: parsedPayload.data.accessToken,
    refreshToken: parsedPayload.data.refreshToken,
  };
}

/**
 * Reads a parent-provided audit session or logs in when running standalone.
 *
 * @param {AuditLoginOptions} [options] Session options.
 * @returns {Promise<AuditTokens>} Tokens suitable for audit bootstrap.
 */
export async function getAuditSession(options = {}) {
  return readAuditSessionFromEnv() ?? (await loginAuditUser(options));
}

/**
 * Calculates login retry delay from `Retry-After` or exponential backoff.
 *
 * @param {Response} response Login response.
 * @param {number} attempt Zero-based retry attempt.
 * @returns {number} Delay in milliseconds.
 */
function getLoginRetryDelayMs(response, attempt) {
  const retryAfter = Number(response.headers.get("retry-after"));

  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return retryAfter * 1000;
  }

  return Math.min(30_000, 2000 * 2 ** attempt);
}

/**
 * Ensures a URL/base path string ends with a slash for `new URL()`.
 *
 * @param {string} value URL or path.
 * @returns {string} Value with trailing slash.
 */
export function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

/**
 * Writes formatted JSON, creating the parent directory first.
 *
 * @param {string} filePath Destination path.
 * @param {unknown} payload JSON-serializable payload.
 */
export function writeJson(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

/**
 * Writes text, creating the parent directory first.
 *
 * @param {string} filePath Destination path.
 * @param {string} content Text content.
 */
export function writeText(filePath, content) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

/**
 * Returns every place the frontend may read audit bootstrap tokens from.
 *
 * @returns {string[]} Token JSON paths in public/dist.
 */
function getTokenFileTargets() {
  const targets = [path.join(cwd, "public", "audit-auth-tokens.json")];
  const distDir = path.join(cwd, "dist");

  if (existsSync(distDir)) {
    targets.push(path.join(distDir, "audit-auth-tokens.json"));
  }

  return targets;
}

/**
 * Writes audit bootstrap tokens for the served frontend.
 *
 * @param {AuditTokens} tokens Tokens to expose to the audit-only client bootstrap.
 */
export function writeAuditTokens(tokens) {
  for (const target of getTokenFileTargets()) {
    writeJson(target, tokens);
  }
}

/**
 * Removes generated audit bootstrap token files.
 */
export function removeAuditTokens() {
  for (const target of getTokenFileTargets()) {
    rmSync(target, { force: true });
  }
}

/**
 * Resolves the backend API URL used by audit scripts.
 *
 * @returns {string} API base URL including `/api/v1`.
 */
export function getApiUrl() {
  return (
    process.env.AUDIT_API_URL ?? process.env.VITE_API_URL ?? DEFAULT_API_URL
  );
}

/**
 * Resolves the frontend URL under audit.
 *
 * @returns {string} Frontend base URL.
 */
export function getAuditBaseUrl() {
  const explicitBaseUrl = getExplicitAuditBaseUrl();

  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }

  const previewPort = getAuditPreviewPort();
  const protocol = getAuditPreviewProtocol();

  if (isDefaultAuditBaseUrlConfig(protocol, previewPort)) {
    return DEFAULT_AUDIT_BASE_URL;
  }

  return getLocalAuditBaseUrl(protocol, previewPort);
}

function getExplicitAuditBaseUrl() {
  return process.env.AUDIT_BASE_URL;
}

function getAuditPreviewPort() {
  return process.env.AUDIT_PREVIEW_PORT ?? "4173";
}

function getAuditPreviewProtocol() {
  return resolveAuditPreviewHttps() ? "https" : "http";
}

function isDefaultAuditBaseUrlConfig(protocol, previewPort) {
  return previewPort === "4173" && protocol === "http";
}

function getLocalAuditBaseUrl(protocol, previewPort) {
  return `${protocol}://127.0.0.1:${previewPort}`;
}

/**
 * Resolves the refresh-token cookie name.
 *
 * @returns {string} Refresh cookie name.
 */
export function getRefreshCookieName() {
  return process.env.AUDIT_REFRESH_COOKIE_NAME ?? DEFAULT_REFRESH_COOKIE_NAME;
}

/**
 * Resolves a path relative to the repo root.
 *
 * @param {string} value Path value.
 * @returns {string} Absolute path.
 */
function resolveRepoPath(value) {
  return path.isAbsolute(value) ? value : path.resolve(cwd, value);
}

/**
 * Reads the configured local audit preview certificate as a CA bundle.
 *
 * @returns {Buffer | undefined} Certificate contents when available.
 */
function getAuditPreviewCa() {
  const certPath = process.env.AUDIT_PREVIEW_CERT_PATH;

  if (!certPath) {
    return undefined;
  }

  const resolvedCertPath = resolveRepoPath(certPath);

  if (!existsSync(resolvedCertPath)) {
    return undefined;
  }

  return readFileSync(resolvedCertPath);
}

/**
 * Sends a lightweight HTTP(S) probe with local audit CA support.
 *
 * @param {string} url URL to probe.
 * @returns {Promise<AuditProbeResult>} Probe response.
 */
function probeAuditUrl(url) {
  const target = new URL(url);
  const isHttps = target.protocol === "https:";
  const request = isHttps ? httpsRequest : httpRequest;

  return new Promise((resolve, reject) => {
    const probeRequest = request(
      target,
      {
        ca: isHttps ? getAuditPreviewCa() : undefined,
        method: "GET",
        timeout: 5000,
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve({ status: response.statusCode ?? 0 });
        });
      },
    );

    probeRequest.on("timeout", () => {
      probeRequest.destroy(new Error(`Timed out probing ${url}`));
    });
    probeRequest.on("error", reject);
    probeRequest.end();
  });
}

/**
 * Fails when the audit target does not respond with a success status.
 *
 * @param {string} baseUrl Frontend base URL.
 * @returns {Promise<void>}
 */
export async function assertBaseUrlReachable(baseUrl) {
  const response = await probeAuditUrl(baseUrl);

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Audit target returned ${response.status}: ${baseUrl}`);
  }
}

/**
 * Polls until a URL returns HTTP OK.
 *
 * @param {string} url URL to poll.
 * @param {number} [timeoutMs=30000] Maximum wait time.
 * @returns {Promise<void>}
 */
export async function waitForHttpOk(url, timeoutMs = 30_000) {
  const startedAt = Date.now();
  let lastError;

  while (isWithinHttpWaitWindow(startedAt, timeoutMs)) {
    // eslint-disable-next-line no-await-in-loop -- Polling must wait between preview readiness checks.
    const attempt = await probeHttpOkAttempt(url);

    if (attempt.ok) {
      return;
    }

    if (attempt.error) {
      lastError = attempt.error;
      logHttpWaitError(url, attempt.error);
    }

    // eslint-disable-next-line no-await-in-loop -- Polling must stay sequential.
    await sleep(HTTP_OK_RETRY_DELAY_MS);
  }

  throw getHttpOkTimeoutError(url, lastError);
}

/**
 * Returns whether the current poll is still within the timeout window.
 *
 * @param {number} startedAt Poll start timestamp.
 * @param {number} timeoutMs Maximum wait time.
 * @returns {boolean} Whether polling may continue.
 */
function isWithinHttpWaitWindow(startedAt, timeoutMs) {
  return Date.now() - startedAt < timeoutMs;
}

/**
 * Probes one HTTP OK attempt without throwing.
 *
 * @param {string} url URL to probe.
 * @returns {Promise<HttpOkAttempt>} Probe attempt result.
 */
async function probeHttpOkAttempt(url) {
  try {
    const response = await probeAuditUrl(url);

    return {
      ok: isHttpOkStatus(response.status),
    };
  } catch (error) {
    return {
      error,
      ok: false,
    };
  }
}

/**
 * Returns whether a status is in the 2xx range.
 *
 * @param {number} status HTTP status code.
 * @returns {boolean} Whether the status is OK.
 */
function isHttpOkStatus(status) {
  return status >= 200 && status < 300;
}

/**
 * Logs a wait error when debug logging is enabled.
 *
 * @param {string} url URL being polled.
 * @param {unknown} error Probe error.
 */
function logHttpWaitError(url, error) {
  if (process.env.AUDIT_DEBUG !== "true") {
    return;
  }

  writeOutput(
    `WAIT ${url}: ${error instanceof Error ? error.message : String(error)}`,
  );
}

/**
 * Builds a timeout error, specializing certificate trust failures.
 *
 * @param {string} url URL that timed out.
 * @param {unknown} lastError Last probe error.
 * @returns {Error} Timeout error.
 */
function getHttpOkTimeoutError(url, lastError) {
  const certificateError = getHttpsCertificateTimeoutError(url, lastError);

  return certificateError ?? new Error(`Timed out waiting for ${url}`);
}

/**
 * Builds a certificate-specific timeout error when the failure looks TLS-related.
 *
 * @param {string} url URL that timed out.
 * @param {unknown} lastError Last probe error.
 * @returns {Error | null} Certificate timeout error when applicable.
 */
function getHttpsCertificateTimeoutError(url, lastError) {
  const details = getHttpsCertificateTimeoutDetails(url, lastError);

  if (!details) {
    return null;
  }

  return new Error(
    `Timed out waiting for HTTPS audit preview at ${url}. The configured certificate is not trusted by the runtime: ${details.causeMessage || details.message}. Trust AUDIT_PREVIEW_CERT_PATH locally, or set AUDIT_PREVIEW_HTTPS=false to run an HTTP-only audit.`,
  );
}

/**
 * Extracts certificate timeout details from the last probe error.
 *
 * @param {string} url URL that timed out.
 * @param {unknown} lastError Last probe error.
 * @returns {CertificateTimeoutDetails | null} Certificate details when applicable.
 */
function getHttpsCertificateTimeoutDetails(url, lastError) {
  if (!shouldInspectCertificateTimeout(url, lastError)) {
    return null;
  }

  const details = getCertificateErrorDetails(lastError);

  return isCertificateTrustError(details.errorMessage) ? details : null;
}

/**
 * Returns whether the timeout path should inspect certificate details.
 *
 * @param {string} url URL that timed out.
 * @param {unknown} lastError Last probe error.
 * @returns {lastError is Error} Whether certificate inspection is useful.
 */
function shouldInspectCertificateTimeout(url, lastError) {
  return url.startsWith("https://") && lastError instanceof Error;
}

/**
 * Extracts searchable details from a certificate-like error.
 *
 * @param {Error} error Probe error.
 * @returns {CertificateTimeoutDetails} Certificate error details.
 */
function getCertificateErrorDetails(error) {
  const cause = getErrorCauseObject(error);
  const causeMessage = getStringProperty(cause, "message");
  const causeCode = getStringProperty(cause, "code");

  return {
    causeMessage,
    errorMessage: getCertificateSearchText(
      error.message,
      causeMessage,
      causeCode,
    ),
    message: error.message,
  };
}

/**
 * Checks whether a value has record-like object shape.
 *
 * @param {unknown} value Candidate value.
 * @returns {value is Record<string, unknown>} Whether the value is a record.
 */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Reads an Error cause when it is object-like.
 *
 * @param {Error} error Error with optional cause.
 * @returns {Record<string, unknown>} Cause object or an empty record.
 */
function getErrorCauseObject(error) {
  return isRecord(error.cause) ? error.cause : {};
}

/**
 * Reads a string property from a record.
 *
 * @param {Record<string, unknown>} source Source record.
 * @param {string} key Property name.
 * @returns {string} String property or an empty string.
 */
function getStringProperty(source, key) {
  return key in source && typeof source[key] === "string" ? source[key] : "";
}

/**
 * Joins error fragments into lowercase searchable text.
 *
 * @param {...string} parts Error fragments.
 * @returns {string} Searchable error text.
 */
function getCertificateSearchText(...parts) {
  return parts.join(" ").toLowerCase();
}

/**
 * Returns whether the error text looks like a certificate trust failure.
 *
 * @param {string} errorMessage Searchable error text.
 * @returns {boolean} Whether it matches a known certificate marker.
 */
function isCertificateTrustError(errorMessage) {
  return CERTIFICATE_TRUST_ERROR_MARKERS.some((marker) =>
    errorMessage.includes(marker),
  );
}

/**
 * Waits for a fixed number of milliseconds.
 *
 * @param {number} ms Delay in milliseconds.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Refreshes audit tokens, including cookie-rotated refresh-token support.
 *
 * @param {AuditTokens} tokens Current token pair.
 * @param {RefreshAuditTokensOptions} [options] Refresh options.
 * @returns {Promise<AuditTokens>} Updated token pair.
 */
export async function refreshAuditTokens(
  tokens,
  {
    apiUrl = getApiUrl(),
    refreshCookieName = getRefreshCookieName(),
    requireRefreshToken = false,
  } = {},
) {
  const refreshToken = getRefreshTokenForRefresh(tokens, requireRefreshToken);

  if (!refreshToken) {
    return tokens;
  }

  const refreshUrl = new URL("auth/refresh", ensureTrailingSlash(apiUrl));
  const response = await requestAuditTokenRefresh({
    refreshCookieName,
    refreshToken,
    refreshUrl,
  });
  const body = await response.text();

  if (!response.ok) {
    throw getAuditTokenRefreshFailureError(response, refreshUrl, body);
  }

  return getRefreshedAuditTokens({
    currentRefreshToken: tokens.refreshToken,
    payload: parseAuditTokenPayload(
      body,
      refreshResponseSchema,
      "Token refresh response did not include accessToken.",
    ),
    refreshCookieName,
    response,
  });
}

/**
 * Reads a refresh token or enforces one when the caller requires refresh.
 *
 * @param {AuditTokens} tokens Current audit tokens.
 * @param {boolean} requireRefreshToken Whether missing refresh material should fail.
 * @returns {string} Refresh token or an empty string.
 */
function getRefreshTokenForRefresh(tokens, requireRefreshToken) {
  if (tokens.refreshToken) {
    return tokens.refreshToken;
  }

  if (requireRefreshToken) {
    throw new Error(
      "Cannot refresh audit auth because login did not return a refresh token or refresh cookie.",
    );
  }

  return "";
}

/**
 * Sends the backend token refresh request.
 *
 * @param {RefreshAuditTokensRequestOptions} options Refresh request options.
 * @returns {Promise<Response>} Fetch response.
 */
function requestAuditTokenRefresh({
  refreshCookieName,
  refreshToken,
  refreshUrl,
}) {
  return fetch(refreshUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      Cookie: `${refreshCookieName}=${refreshToken}`,
    },
  });
}

/**
 * Builds the token refresh failure error shown by audit scripts.
 *
 * @param {Response} response Failed refresh response.
 * @param {URL} refreshUrl Backend refresh URL.
 * @param {string} body Raw failed response body.
 * @returns {Error} Refresh failure error.
 */
function getAuditTokenRefreshFailureError(response, refreshUrl, body) {
  return new Error(
    `Token refresh failed (${response.status}) at ${refreshUrl.href}: ${body}`,
  );
}

/**
 * Combines refresh response data with cookie-rotated refresh material.
 *
 * @param {RefreshedAuditTokensOptions} options Refresh result options.
 * @returns {AuditTokens} Updated audit tokens.
 */
function getRefreshedAuditTokens({
  currentRefreshToken,
  payload,
  refreshCookieName,
  response,
}) {
  return {
    accessToken: payload.accessToken,
    refreshToken: getRefreshedRefreshToken({
      currentRefreshToken,
      payload,
      refreshCookieName,
      response,
    }),
  };
}

/**
 * Resolves the best available refresh token after a refresh response.
 *
 * @param {RefreshedRefreshTokenOptions} options Refresh token options.
 * @returns {string | undefined} Updated refresh token.
 */
function getRefreshedRefreshToken({
  currentRefreshToken,
  payload,
  refreshCookieName,
  response,
}) {
  if (typeof payload.refreshToken === "string") {
    return payload.refreshToken;
  }

  return (
    readRefreshTokenFromSetCookie(response.headers, refreshCookieName) ||
    currentRefreshToken
  );
}

/**
 * Extracts a refresh token from response `Set-Cookie` headers.
 *
 * @param {Headers} headers Fetch response headers.
 * @param {string} cookieName Cookie name to extract.
 * @returns {string | undefined} Refresh token if present.
 */
function readRefreshTokenFromSetCookie(headers, cookieName) {
  const cookiePattern = getRefreshCookiePattern(cookieName);

  for (const header of getSetCookieHeaderValues(headers)) {
    const refreshToken = getRefreshTokenFromCookieHeader(header, cookiePattern);

    if (refreshToken) {
      return refreshToken;
    }
  }

  return undefined;
}

/**
 * Reads all Set-Cookie header values supported by the runtime.
 *
 * @param {Headers} headers Fetch response headers.
 * @returns {string[]} Set-Cookie header values.
 */
function getSetCookieHeaderValues(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  return [headers.get("set-cookie")].filter(isNonEmptyHeaderValue);
}

/**
 * Narrows optional header values while preserving prior truthy filtering.
 *
 * @param {string | null} value Header value candidate.
 * @returns {value is string} Whether the header has content.
 */
function isNonEmptyHeaderValue(value) {
  return Boolean(value);
}

/**
 * Builds the cookie extraction pattern for the refresh cookie.
 *
 * @param {string} cookieName Cookie name to extract.
 * @returns {RegExp} Cookie extraction pattern.
 */
function getRefreshCookiePattern(cookieName) {
  return new RegExp(`(?:^|,\\s*)${escapeRegExp(cookieName)}=([^;,]+)`);
}

/**
 * Extracts a refresh token from one Set-Cookie header.
 *
 * @param {string} header Set-Cookie header value.
 * @param {RegExp} cookiePattern Refresh cookie extraction pattern.
 * @returns {string | undefined} Refresh token if present.
 */
function getRefreshTokenFromCookieHeader(header, cookiePattern) {
  const match = cookiePattern.exec(header);

  return match?.[1];
}

/**
 * Escapes a string for safe use in a regular expression.
 *
 * @param {string} value Raw string.
 * @returns {string} Regex-escaped string.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
