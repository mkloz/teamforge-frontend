// @ts-check

import { existsSync, readFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { resolveRepoPath } from "./config.mjs";
import { sleep, writeOutput } from "./logging.mjs";

/**
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
 */

const HTTP_OK_RETRY_DELAY_MS = 500;
const CERTIFICATE_TRUST_ERROR_MARKERS = [
  "certificate",
  "cert",
  "self-signed",
  "unable to verify",
];

/**
 * Reads the configured local audit preview certificate as a CA bundle.
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
