#!/usr/bin/env node
// @ts-check

import path from "node:path";
import {
  cwd,
  runCommand,
  todayStamp,
  writeError,
  writeOutput,
} from "./helpers.mjs";

/**
 * @typedef {"release" | "nightly"} BrowserAuditProfile
 */

const auditPipelineScript = path.join(
  cwd,
  "scripts",
  "audit",
  "run-authenticated-pipeline.mjs",
);
const lighthouseRouteSlugsByProfile = {
  release: "01-landing,02-download,14-home",
  nightly: "01-landing,02-download,14-home,15-explore,17-activity,21-forge",
};

/**
 * Checks whether a string is a supported browser audit profile.
 *
 * @param {string} profile Candidate profile.
 * @returns {profile is BrowserAuditProfile} Whether the profile is supported.
 */
function isBrowserAuditProfile(profile) {
  return profile === "release" || profile === "nightly";
}

/**
 * Reads the requested browser audit profile.
 *
 * @param {string[]} argv CLI arguments.
 * @returns {BrowserAuditProfile} Browser audit profile.
 */
function parseProfile(argv) {
  const profile = argv[0] ?? "release";

  if (isBrowserAuditProfile(profile)) {
    return profile;
  }

  throw new Error(`Unknown browser audit profile: ${profile}`);
}

/**
 * Resolves the default report root for one profile.
 *
 * @param {BrowserAuditProfile} profile Browser audit profile.
 * @returns {string} Report root.
 */
function getDefaultOutputRoot(profile) {
  return path.join(cwd, "temp", `browser-audit-${profile}-${todayStamp()}`);
}

/**
 * Builds default environment values for the browser-only audit policy.
 *
 * Existing exported environment values still win, so focused local or CI runs
 * can narrow route sets without changing the script.
 *
 * @param {BrowserAuditProfile} profile Browser audit profile.
 * @returns {NodeJS.ProcessEnv} Default environment.
 */
function getBrowserAuditDefaults(profile) {
  return {
    AUDIT_LIGHTHOUSE_CATEGORIES: "performance,accessibility,best-practices,seo",
    AUDIT_LIGHTHOUSE_ROUTE_SLUGS: lighthouseRouteSlugsByProfile[profile],
    AUDIT_OUTPUT_ROOT: getDefaultOutputRoot(profile),
    AUDIT_PIPELINE_REPORT_PATH: path.join(cwd, "reports", "browser-audit.md"),
    AUDIT_PLAYWRIGHT_LANES: "route-health,accessibility",
    AUDIT_PLAYWRIGHT_ROUTE_SET: "authenticated",
    AUDIT_RUN_LIGHTHOUSE: "true",
    AUDIT_RUN_LOADED: "false",
    AUDIT_RUN_PLAYWRIGHT: "true",
    AUDIT_RUN_SQUIRREL: "false",
    AUDIT_START_PREVIEW: "true",
  };
}

/**
 * Applies profile defaults without overriding caller-provided values.
 *
 * @param {BrowserAuditProfile} profile Browser audit profile.
 * @returns {NodeJS.ProcessEnv} Child process environment.
 */
function getBrowserAuditEnv(profile) {
  const defaults = getBrowserAuditDefaults(profile);
  const env = {
    ...defaults,
    ...process.env,
  };

  if (!env.AUDIT_OUTPUT_ROOT) {
    env.AUDIT_OUTPUT_ROOT = defaults.AUDIT_OUTPUT_ROOT;
  }

  return env;
}

/**
 * Logs the selected audit policy before the heavier pipeline starts.
 *
 * @param {BrowserAuditProfile} profile Browser audit profile.
 * @param {NodeJS.ProcessEnv} env Browser audit environment.
 */
function writeBrowserAuditPlan(profile, env) {
  writeOutput(
    `BROWSER_AUDIT ${profile}: Playwright ${env.AUDIT_PLAYWRIGHT_LANES}, Lighthouse ${env.AUDIT_LIGHTHOUSE_ROUTE_SLUGS}`,
  );
  writeOutput(`REPORT_ROOT ${env.AUDIT_OUTPUT_ROOT}`);
}

/**
 * Runs the browser-only audit policy.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const profile = parseProfile(process.argv.slice(2));
  const env = getBrowserAuditEnv(profile);

  writeBrowserAuditPlan(profile, env);

  await runCommand(process.execPath, [auditPipelineScript], {
    env,
    label: `browser audit (${profile})`,
  });
}

main().catch((error) => {
  writeError(error);
  process.exit(1);
});
