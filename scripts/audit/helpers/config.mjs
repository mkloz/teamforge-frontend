// @ts-check

import path from "node:path";
import {
  cwd,
  DEFAULT_API_URL,
  DEFAULT_AUDIT_BASE_URL,
  DEFAULT_REFRESH_COOKIE_NAME,
} from "./constants.mjs";

/**
 * @typedef {object} ResolveAuditPreviewHttpsOptions
 * @property {string | undefined} [certPath] Preview TLS certificate path.
 * @property {string | undefined} [explicitValue] Explicit HTTPS env value.
 * @property {string | undefined} [keyPath] Preview TLS private key path.
 */

const AUDIT_ENV_TRUE_VALUES = ["true", "1", "yes"];
const AUDIT_ENV_FALSE_VALUES = ["false", "0", "no"];

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
 * Ensures a URL/base path string ends with a slash for `new URL()`.
 *
 * @param {string} value URL or path.
 * @returns {string} Value with trailing slash.
 */
export function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
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
export function resolveRepoPath(value) {
  return path.isAbsolute(value) ? value : path.resolve(cwd, value);
}
