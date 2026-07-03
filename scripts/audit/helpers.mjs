// @ts-check

/**
 * @typedef {import("./helpers/auth-session.mjs").AuditCredentials} AuditCredentials
 * @typedef {import("./helpers/auth-session.mjs").AuditTokens} AuditTokens
 * @typedef {import("./helpers/auth-session.mjs").AuditTokenPayload} AuditTokenPayload
 * @typedef {import("./helpers/auth-session.mjs").AuditLoginOptions} AuditLoginOptions
 * @typedef {import("./helpers/auth-session.mjs").AuditLoginAttemptResult} AuditLoginAttemptResult
 * @typedef {import("./helpers/auth-session.mjs").AuditLoginAttemptOptions} AuditLoginAttemptOptions
 * @typedef {import("./helpers/auth-session.mjs").AuditSessionFailureOptions} AuditSessionFailureOptions
 * @typedef {import("./helpers/auth-session.mjs").RefreshAuditTokensOptions} RefreshAuditTokensOptions
 * @typedef {import("./helpers/auth-session.mjs").RefreshAuditTokensRequestOptions} RefreshAuditTokensRequestOptions
 * @typedef {import("./helpers/auth-session.mjs").RefreshedAuditTokensOptions} RefreshedAuditTokensOptions
 * @typedef {import("./helpers/auth-session.mjs").RefreshedRefreshTokenOptions} RefreshedRefreshTokenOptions
 * @typedef {import("./helpers/command.mjs").CommandOptions} CommandOptions
 * @typedef {import("./helpers/command.mjs").SpawnInvocation} SpawnInvocation
 * @typedef {import("./helpers/config.mjs").ResolveAuditPreviewHttpsOptions} ResolveAuditPreviewHttpsOptions
 * @typedef {import("./helpers/env.mjs").EnvFileEntry} EnvFileEntry
 * @typedef {import("./helpers/http-probe.mjs").AuditProbeResult} AuditProbeResult
 * @typedef {import("./helpers/http-probe.mjs").HttpOkAttempt} HttpOkAttempt
 * @typedef {import("./helpers/http-probe.mjs").CertificateTimeoutDetails} CertificateTimeoutDetails
 */

export {
  getAuditCredentialsFromEnv,
  getAuditSession,
  loginAuditUser,
  refreshAuditTokens,
} from "./helpers/auth-session.mjs";
export { getSpawnInvocation, runCommand } from "./helpers/command.mjs";
export {
  ensureTrailingSlash,
  getApiUrl,
  getAuditBaseUrl,
  getRefreshCookieName,
  resolveAuditPreviewHttps,
} from "./helpers/config.mjs";
export {
  cwd,
  DEFAULT_API_URL,
  DEFAULT_SQUIRREL_BIN,
} from "./helpers/constants.mjs";
export { envFlag, loadAuditEnvFiles } from "./helpers/env.mjs";
export {
  removeAuditTokens,
  writeAuditTokens,
  writeJson,
  writeText,
} from "./helpers/files.mjs";
export {
  assertBaseUrlReachable,
  waitForHttpOk,
} from "./helpers/http-probe.mjs";
export {
  sleep,
  todayStamp,
  writeError,
  writeOutput,
} from "./helpers/logging.mjs";
