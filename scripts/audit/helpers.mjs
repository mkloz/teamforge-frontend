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
 * @typedef {object} RefreshAuditTokensOptions
 * @property {string} [apiUrl] Backend API URL that includes `/api/v1`.
 * @property {string} [refreshCookieName] Cookie name used by the backend refresh flow.
 * @property {boolean} [requireRefreshToken] Whether missing refresh material should fail.
 *
 * @typedef {object} ResolveAuditPreviewHttpsOptions
 * @property {string | undefined} [certPath] Preview TLS certificate path.
 * @property {string | undefined} [explicitValue] Explicit HTTPS env value.
 * @property {string | undefined} [keyPath] Preview TLS private key path.
 *
 * @typedef {object} AuditProbeResult
 * @property {number} status HTTP status code.
 */

export const cwd = process.cwd();
export const DEFAULT_API_URL = "http://localhost:6969/api/v1";
export const DEFAULT_AUDIT_BASE_URL = "http://127.0.0.1:4173";
export const DEFAULT_REFRESH_COOKIE_NAME = "teamforge_refresh_token";
export const DEFAULT_SQUIRREL_BIN =
  process.platform === "win32"
    ? path.join(cwd, "temp", "squirrel", "squirrel.exe")
    : "squirrel";

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

  if (
    explicitValue === undefined ||
    explicitValue === "" ||
    explicitValue === "auto"
  ) {
    return hasCertificatePair;
  }

  const normalizedValue = explicitValue.trim().toLowerCase();

  if (["true", "1", "yes"].includes(normalizedValue)) {
    return true;
  }

  if (["false", "0", "no"].includes(normalizedValue)) {
    return false;
  }

  throw new Error(
    `Invalid AUDIT_PREVIEW_HTTPS value "${explicitValue}". Use true, false, or auto.`,
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
export function loadEnvFile(fileName) {
  const filePath = path.join(cwd, fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

/**
 * Reads a required environment variable.
 *
 * @param {string} name Environment variable name.
 * @returns {string} Non-empty variable value.
 */
export function getRequiredEnv(name) {
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
 * @param {{ apiUrl?: string; refreshCookieName?: string }} [options] Login options.
 * @returns {Promise<AuditTokens>} Tokens suitable for audit bootstrap.
 */
export async function loginAuditUser({
  apiUrl = getApiUrl(),
  refreshCookieName = getRefreshCookieName(),
} = {}) {
  const credentials = getAuditCredentialsFromEnv();
  const loginUrl = new URL("auth/login", ensureTrailingSlash(apiUrl));
  const maxRetries = Number(process.env.AUDIT_LOGIN_RETRIES ?? "2");

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop -- Login retries must honor backend rate-limit timing.
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    // eslint-disable-next-line no-await-in-loop -- The body is needed before a retry or failure.
    const body = await response.text();

    if (response.ok) {
      const parsedPayload = loginResponseSchema.safeParse(JSON.parse(body));

      if (!parsedPayload.success) {
        throw new Error(
          "Audit user login response did not include accessToken.",
        );
      }

      const rotatedCookieRefreshToken = readRefreshTokenFromSetCookie(
        response.headers,
        refreshCookieName,
      );

      return {
        accessToken: parsedPayload.data.accessToken,
        refreshToken:
          parsedPayload.data.refreshToken ??
          rotatedCookieRefreshToken ??
          undefined,
      };
    }

    if (response.status === 429 && attempt < maxRetries) {
      const retryDelayMs = getLoginRetryDelayMs(response, attempt);

      writeOutput(
        `WARN Audit login was rate limited. Retrying in ${Math.ceil(retryDelayMs / 1000)}s.`,
      );
      // eslint-disable-next-line no-await-in-loop -- Backoff must wait before retrying.
      await sleep(retryDelayMs);
      continue;
    }

    throw new Error(
      `Audit user login failed (${response.status}) at ${loginUrl.href}: ${body}`,
    );
  }

  throw new Error(`Audit user login failed at ${loginUrl.href}.`);
}

/**
 * Reads audit tokens supplied by the parent pipeline process.
 *
 * @returns {AuditTokens | null} Parsed audit session when present.
 */
export function readAuditSessionFromEnv() {
  const value = process.env.AUDIT_SESSION_JSON;

  if (!value) {
    return null;
  }

  try {
    const parsedPayload = refreshResponseSchema.safeParse(JSON.parse(value));

    if (!parsedPayload.success) {
      throw new Error("AUDIT_SESSION_JSON did not include accessToken.");
    }

    return {
      accessToken: parsedPayload.data.accessToken,
      refreshToken: parsedPayload.data.refreshToken,
    };
  } catch (error) {
    throw new Error(
      `Could not parse AUDIT_SESSION_JSON: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

/**
 * Reads a parent-provided audit session or logs in when running standalone.
 *
 * @param {{ apiUrl?: string; refreshCookieName?: string }} [options] Session options.
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
export function getTokenFileTargets() {
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
  if (process.env.AUDIT_BASE_URL) {
    return process.env.AUDIT_BASE_URL;
  }

  const previewPort = process.env.AUDIT_PREVIEW_PORT ?? "4173";
  const protocol = resolveAuditPreviewHttps() ? "https" : "http";

  if (previewPort === "4173" && protocol === "http") {
    return DEFAULT_AUDIT_BASE_URL;
  }

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
 * @returns {Uint8Array | undefined} Certificate contents when available.
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

  while (Date.now() - startedAt < timeoutMs) {
    try {
      // eslint-disable-next-line no-await-in-loop -- Polling must wait between preview readiness checks.
      const response = await probeAuditUrl(url);

      if (response.status >= 200 && response.status < 300) {
        return;
      }
    } catch (error) {
      lastError = error;

      if (process.env.AUDIT_DEBUG === "true") {
        writeOutput(
          `WAIT ${url}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // eslint-disable-next-line no-await-in-loop -- Polling must stay sequential.
    await sleep(500);
  }

  if (url.startsWith("https://") && lastError instanceof Error) {
    const cause =
      typeof lastError.cause === "object" && lastError.cause !== null
        ? lastError.cause
        : {};
    const causeMessage =
      "message" in cause && typeof cause.message === "string"
        ? cause.message
        : "";
    const causeCode =
      "code" in cause && typeof cause.code === "string" ? cause.code : "";
    const errorMessage = [lastError.message, causeMessage, causeCode]
      .join(" ")
      .toLowerCase();

    if (
      errorMessage.includes("certificate") ||
      errorMessage.includes("cert") ||
      errorMessage.includes("self-signed") ||
      errorMessage.includes("unable to verify")
    ) {
      throw new Error(
        `Timed out waiting for HTTPS audit preview at ${url}. The configured certificate is not trusted by the runtime: ${causeMessage || lastError.message}. Trust AUDIT_PREVIEW_CERT_PATH locally, or set AUDIT_PREVIEW_HTTPS=false to run an HTTP-only audit.`,
      );
    }
  }

  throw new Error(`Timed out waiting for ${url}`);
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
  if (!tokens.refreshToken) {
    if (requireRefreshToken) {
      throw new Error(
        "Cannot refresh audit auth because login did not return a refresh token or refresh cookie.",
      );
    }

    return tokens;
  }

  const refreshUrl = new URL("auth/refresh", ensureTrailingSlash(apiUrl));
  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.refreshToken}`,
      Cookie: `${refreshCookieName}=${tokens.refreshToken}`,
    },
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Token refresh failed (${response.status}) at ${refreshUrl.href}: ${body}`,
    );
  }

  const parsedPayload = refreshResponseSchema.safeParse(JSON.parse(body));

  if (!parsedPayload.success) {
    throw new Error("Token refresh response did not include accessToken.");
  }

  const payload = parsedPayload.data;
  const rotatedCookieRefreshToken = readRefreshTokenFromSetCookie(
    response.headers,
    refreshCookieName,
  );

  return {
    accessToken: payload.accessToken,
    refreshToken:
      typeof payload.refreshToken === "string"
        ? payload.refreshToken
        : rotatedCookieRefreshToken
          ? rotatedCookieRefreshToken
          : tokens.refreshToken,
  };
}

/**
 * Extracts a refresh token from response `Set-Cookie` headers.
 *
 * @param {Headers} headers Fetch response headers.
 * @param {string} cookieName Cookie name to extract.
 * @returns {string | undefined} Refresh token if present.
 */
function readRefreshTokenFromSetCookie(headers, cookieName) {
  const cookieHeaders =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie")].filter(Boolean);
  const cookiePattern = new RegExp(
    `(?:^|,\\s*)${escapeRegExp(cookieName)}=([^;,]+)`,
  );

  for (const header of cookieHeaders) {
    const match = cookiePattern.exec(header);

    if (match?.[1]) {
      return match[1];
    }
  }

  return undefined;
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
