import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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
  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Audit user login failed (${response.status}) at ${loginUrl.href}. Check AUDIT_USER_EMAIL and AUDIT_USER_PASSWORD.`,
    );
  }

  const parsedPayload = loginResponseSchema.safeParse(JSON.parse(body));

  if (!parsedPayload.success) {
    throw new Error("Audit user login response did not include accessToken.");
  }

  const rotatedCookieRefreshToken = readRefreshTokenFromSetCookie(
    response.headers,
    refreshCookieName,
  );

  return {
    accessToken: parsedPayload.data.accessToken,
    refreshToken:
      parsedPayload.data.refreshToken ?? rotatedCookieRefreshToken ?? undefined,
  };
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
  return process.env.AUDIT_BASE_URL ?? DEFAULT_AUDIT_BASE_URL;
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
 * Fails when the audit target does not respond with a success status.
 *
 * @param {string} baseUrl Frontend base URL.
 * @returns {Promise<void>}
 */
export async function assertBaseUrlReachable(baseUrl) {
  const response = await fetch(baseUrl, { cache: "no-store" });

  if (!response.ok) {
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

  while (Date.now() - startedAt < timeoutMs) {
    try {
      // eslint-disable-next-line no-await-in-loop -- Polling must wait between preview readiness checks.
      const response = await fetch(url, { cache: "no-store" });

      if (response.ok) {
        return;
      }
    } catch (error) {
      if (process.env.AUDIT_DEBUG === "true") {
        writeOutput(
          `WAIT ${url}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // eslint-disable-next-line no-await-in-loop -- Polling must stay sequential.
    await sleep(500);
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
