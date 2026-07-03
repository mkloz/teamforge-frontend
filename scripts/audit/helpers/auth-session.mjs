// @ts-check

import { z } from "zod";
import {
  ensureTrailingSlash,
  getApiUrl,
  getRefreshCookieName,
} from "./config.mjs";
import { getRequiredEnv } from "./env.mjs";
import { sleep, writeOutput } from "./logging.mjs";

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
 */

const refreshResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
  })
  .passthrough();
const loginResponseSchema = refreshResponseSchema;

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
