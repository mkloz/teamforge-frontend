#!/usr/bin/env node
// @ts-check

import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  colorText,
  excerpt,
  formatDuration,
  formatStatusBadge,
  isRecord,
  parseFirstJsonObject,
  ROOT,
  readJsonObject,
  renderBullets,
  renderKeyValues,
  renderMarkdownTable,
  resolveNodeScript,
  resolvePackageBin,
  resolvePathBin,
  runCommand,
  sectionTitle,
  tailLines,
  toRepoRelativePath,
  writeTextFile,
} from "../shared/command-utils.mjs";

/**
 * @typedef {{ badge?: string; commandLine?: string; details?: string[]; durationMs: number; name: string; output?: string; status: number; summary: string }} HealthCommandSummary
 */

const REPORT_PATH = path.join(ROOT, "reports", "agent-health.md");
const QUALITY_SUMMARY_PATH = path.join(
  ROOT,
  "reports",
  "quality-intelligence",
  "summary.json",
);
const numberFormatter = new Intl.NumberFormat("en-US");

/**
 * @param {string[]} args Git arguments.
 * @returns {string} Git stdout.
 */
function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

/**
 * @returns {{ branch: string; changed: number; mergeBase: string; status: string[] }} Git summary.
 */
function getGitSummary() {
  const branch = git(["branch", "--show-current"]) || "unknown";
  const status = git(["status", "--short"]).split(/\r?\n/u).filter(Boolean);
  const mergeBase = git(["merge-base", "HEAD", "origin/main"]) || "unknown";

  return {
    branch,
    changed: status.length,
    mergeBase,
    status,
  };
}

/**
 * @returns {Promise<HealthCommandSummary>} Quality intelligence summary.
 */
async function runQualityIntelligence() {
  const result = await runCommand({
    args: ["context"],
    name: "quality intelligence",
    spec: resolveNodeScript("scripts/quality/intelligence.mjs"),
  });
  const qualitySummary = readQualityHealthSummary();

  if (qualitySummary) {
    return {
      badge: qualitySummary.hasFindings ? "review" : "pass",
      commandLine: result.commandLine,
      details: qualitySummary.details,
      durationMs: result.durationMs,
      name: result.name,
      output: `${result.stdout}${result.stderr}`,
      status: result.status,
      summary: qualitySummary.summary,
    };
  }

  return {
    ...summarizeCommand(
      result.name,
      result.status,
      result.durationMs,
      [result.stdout, result.stderr],
      "quality summary unavailable",
    ),
    commandLine: result.commandLine,
  };
}

/**
 * @returns {Promise<HealthCommandSummary>} Dependency-cruiser summary.
 */
async function runArchitectureSummary() {
  const result = await runCommand({
    args: [
      "--config",
      ".dependency-cruiser.cjs",
      "--output-type",
      "err",
      "src",
      "vite.config.ts",
    ],
    name: "architecture",
    spec: resolvePackageBin("dependency-cruiser", "depcruise"),
  });

  return {
    ...summarizeCommand(
      result.name,
      result.status,
      result.durationMs,
      [result.stdout, result.stderr],
      "no dependency violations",
    ),
    commandLine: result.commandLine,
  };
}

/**
 * @returns {Promise<HealthCommandSummary>} Knip summary.
 */
async function runKnipSummary() {
  const result = await runCommand({
    args: [],
    name: "knip",
    spec: resolveNodeScript("scripts/lint/knip.mjs"),
  });
  const summary = {
    ...summarizeCommand(
      result.name,
      result.status,
      result.durationMs,
      [result.stdout, result.stderr],
      "no unused files, dependencies, or exports",
    ),
    commandLine: result.commandLine,
  };

  return result.status === 0
    ? { ...summary, summary: "no unused files, dependencies, or exports" }
    : summary;
}

/**
 * @returns {Promise<HealthCommandSummary>} npm audit summary.
 */
async function runAuditSummary() {
  const result = await runCommand({
    args: ["audit", "--audit-level=high", "--json"],
    name: "npm audit",
    spec: resolvePathBin("npm"),
  });
  const summary = getAuditSummary(result.stdout);

  return {
    commandLine: result.commandLine,
    durationMs: result.durationMs,
    name: result.name,
    output: `${result.stdout}${result.stderr}`,
    status: result.status,
    summary: summary || excerpt(result.stderr || result.stdout),
  };
}

/**
 * @param {string} stdout npm audit JSON stdout.
 * @returns {string} Audit summary.
 */
function getAuditSummary(stdout) {
  if (!stdout.trim()) {
    return "";
  }

  try {
    const payload = parseFirstJsonObject(stdout);
    const vulnerabilities = payload.metadata;

    if (!isAuditMetadata(vulnerabilities)) {
      return "";
    }

    const counts = vulnerabilities.vulnerabilities;

    return `${counts.total ?? 0} total (${counts.critical ?? 0} critical, ${counts.high ?? 0} high, ${counts.moderate ?? 0} moderate)`;
  } catch {
    return "";
  }
}

/**
 * @returns {{ details: string[]; hasFindings: boolean; summary: string } | null} Quality health summary.
 */
function readQualityHealthSummary() {
  try {
    const payload = readJsonObject(QUALITY_SUMMARY_PATH);
    const fallow = getRecord(payload, "fallow");
    const reactDoctor = getRecord(payload, "reactDoctor");
    const sharedHotspots = getStringArray(payload, "sharedHotspots");
    const fallowFiles = getStringArray(fallow, "files");
    const reactFiles = getStringArray(reactDoctor, "affectedFiles");
    const affectedFiles = new Set([...fallowFiles, ...reactFiles]);
    const fallowTotal = getNumber(fallow, "totalFindings");
    const reactTotal = getNumber(reactDoctor, "diagnostics");

    return {
      details: [
        `Fallow: ${formatNumber(fallowTotal)} findings (${formatNumber(
          getNumber(fallow, "cleanupIssues"),
        )} cleanup, ${formatNumber(
          getNumber(fallow, "cloneGroups"),
        )} clone groups, ${formatNumber(
          getNumber(fallow, "structuralComplexity"),
        )} structural, ${formatNumber(getNumber(fallow, "crapRisk"))} CRAP)`,
        `React Doctor: ${formatNumber(reactTotal)} diagnostics (${formatNumber(
          getNumber(reactDoctor, "errors"),
        )} errors, ${formatNumber(getNumber(reactDoctor, "warnings"))} warnings)`,
        `Shared hotspots: ${formatNumber(sharedHotspots.length)} files`,
      ],
      hasFindings: fallowTotal + reactTotal > 0,
      summary: `${formatNumber(fallowTotal + reactTotal)} findings across ${formatNumber(
        affectedFiles.size,
      )} files`,
    };
  } catch {
    return null;
  }
}

/**
 * @param {Record<string, unknown>} record Source record.
 * @param {string} key Field key.
 * @returns {Record<string, unknown>} Nested record.
 */
function getRecord(record, key) {
  const value = record[key];

  return isRecord(value) ? value : {};
}

/**
 * @param {Record<string, unknown>} record Source record.
 * @param {string} key Field key.
 * @returns {string[]} String array.
 */
function getStringArray(record, key) {
  const value = record[key];

  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];
}

/**
 * @param {Record<string, unknown>} record Source record.
 * @param {string} key Field key.
 * @returns {number} Numeric field.
 */
function getNumber(record, key) {
  const value = Number(record[key]);

  return Number.isFinite(value) ? value : 0;
}

/**
 * @param {number} value Number value.
 * @returns {string} Locale-formatted number.
 */
function formatNumber(value) {
  return numberFormatter.format(value);
}

/**
 * @param {unknown} value Candidate metadata.
 * @returns {value is { vulnerabilities: Record<string, number> }} Whether this is audit metadata.
 */
function isAuditMetadata(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    "vulnerabilities" in value &&
    typeof value.vulnerabilities === "object" &&
    value.vulnerabilities !== null
  );
}

/**
 * @param {string} name Command name.
 * @param {number} status Exit status.
 * @param {number} durationMs Duration.
 * @param {string[]} outputs Output candidates.
 * @param {string} [fallback="no output"] Summary when there is no output.
 * @returns {HealthCommandSummary} Summary.
 */
function summarizeCommand(
  name,
  status,
  durationMs,
  outputs,
  fallback = "no output",
) {
  const output = outputs.find((value) => value.trim()) ?? "";

  return {
    details: status === 0 || !output ? [] : [tailLines(output, 12, 1600)],
    durationMs,
    name,
    output,
    status,
    summary: output ? excerpt(output, 180) : fallback,
  };
}

/**
 * @param {ReturnType<typeof getGitSummary>} gitSummary Git summary.
 * @param {HealthCommandSummary[]} commandSummaries Command summaries.
 * @returns {string} Markdown report.
 */
function formatReport(gitSummary, commandSummaries) {
  const needsReview = commandSummaries.some(
    (summary) => summary.status !== 0 || summary.badge === "review",
  );

  return [
    "# Agent Health",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Git",
    "",
    renderMarkdownBullets([
      `Branch: ${gitSummary.branch}`,
      `Changed files: ${formatNumber(gitSummary.changed)}`,
      `Merge base: ${gitSummary.mergeBase}`,
    ]),
    "",
    "## Commands",
    "",
    renderMarkdownTable(
      ["Command", "Status", "Time", "Command line", "Summary"],
      commandSummaries.map((summary) => [
        summary.name,
        summary.badge ??
          (summary.status === 0 ? "pass" : `status ${summary.status}`),
        formatDuration(summary.durationMs),
        summary.commandLine ?? "-",
        summary.summary,
      ]),
    ),
    "",
    "## Command Details",
    "",
    commandSummaries.map(formatCommandDetail).join("\n\n"),
    "",
    "## Related Reports",
    "",
    renderMarkdownBullets([
      "`reports/quality-intelligence/index.md`: detailed Fallow and React Doctor correlation report.",
      "`reports/quality-intelligence/summary.json`: machine-readable quality metrics consumed by agent health.",
      "`reports/react-doctor/index.md`: detailed React Doctor diagnostics when diagnostics exist.",
    ]),
    "",
    "## Changed Files",
    "",
    ...(gitSummary.status.length === 0
      ? ["No changed files."]
      : gitSummary.status.map((line) => `- \`${line}\``)),
    "",
    "## Command Execution Summary",
    "",
    renderMarkdownBullets(
      getAgentHealthCommandSummary(gitSummary, commandSummaries, needsReview),
    ),
    "",
  ].join("\n");
}

/**
 * @param {HealthCommandSummary} summary Command summary.
 * @returns {string} Markdown command detail.
 */
function formatCommandDetail(summary) {
  const output = summary.output?.trim()
    ? tailLines(summary.output, 80, 12_000)
    : "No captured output.";

  return [
    `### ${summary.name}`,
    "",
    renderMarkdownBullets([
      `Status: ${
        summary.badge ??
        (summary.status === 0 ? "pass" : `status ${summary.status}`)
      }`,
      `Duration: ${formatDuration(summary.durationMs)}`,
      `Command: \`${summary.commandLine ?? "-"}\``,
      `Summary: ${summary.summary}`,
    ]),
    "",
    ...(summary.details && summary.details.length > 0
      ? ["Details:", "", ...summary.details.map((detail) => `- ${detail}`), ""]
      : []),
    "Captured output:",
    "",
    "```text",
    output,
    "```",
  ].join("\n");
}

/**
 * @param {string[]} items Summary items.
 * @returns {string} Markdown bullets.
 */
function renderMarkdownBullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

/**
 * @param {ReturnType<typeof getGitSummary>} gitSummary Git summary.
 * @param {HealthCommandSummary[]} commandSummaries Command summaries.
 * @param {boolean} needsReview Whether the run has review signals.
 * @returns {string[]} Command execution summary bullets.
 */
function getAgentHealthCommandSummary(
  gitSummary,
  commandSummaries,
  needsReview,
) {
  const failedCommands = commandSummaries.filter(
    (summary) => summary.status !== 0,
  );

  return [
    "`npm run agent:health` completed and wrote this report.",
    `Overall status: ${needsReview ? "review" : "pass"}.`,
    `Child commands run: ${formatNumber(commandSummaries.length)}.`,
    `Child command failures: ${formatNumber(failedCommands.length)}.`,
    `Branch: ${gitSummary.branch}; changed files: ${formatNumber(
      gitSummary.changed,
    )}.`,
    `Report path: \`${toRepoRelativePath(REPORT_PATH)}\``,
  ];
}

/**
 * @param {ReturnType<typeof getGitSummary>} gitSummary Git summary.
 * @param {HealthCommandSummary[]} commandSummaries Command summaries.
 */
function printSummary(gitSummary, commandSummaries) {
  const needsReview = commandSummaries.some(
    (summary) => summary.status !== 0 || summary.badge === "review",
  );

  process.stdout.write(`${sectionTitle("Agent Health")}\n`);
  process.stdout.write(
    `${formatStatusBadge(needsReview ? "review" : "pass")} ${commandSummaries.length} checks on ${gitSummary.branch}\n`,
  );
  process.stdout.write(
    `${renderKeyValues([
      { label: "Changed files", value: formatNumber(gitSummary.changed) },
      { label: "Merge base", value: gitSummary.mergeBase },
    ])}\n\n`,
  );

  process.stdout.write(`${colorText("Checks", "accent")}\n`);
  for (const summary of commandSummaries) {
    process.stdout.write(
      `${formatStatusBadge(summary.badge ?? summary.status)} ${summary.name} ${colorText(
        formatDuration(summary.durationMs),
        "muted",
      )}\n`,
    );
    process.stdout.write(`  ${colorText(summary.summary, "muted")}\n`);

    for (const detail of summary.details ?? []) {
      process.stdout.write(`  - ${detail}\n`);
    }
  }

  if (gitSummary.status.length > 0) {
    process.stdout.write(`\n${colorText("Changed files", "accent")}\n`);
    process.stdout.write(`${renderBullets(gitSummary.status, 8)}\n`);
  }

  process.stdout.write(
    `\n${colorText("Report", "accent")}\n  - ${toRepoRelativePath(REPORT_PATH)}\n`,
  );
}

/**
 * Runs agent health.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const gitSummary = getGitSummary();
  const commandSummaries = await Promise.all([
    runQualityIntelligence(),
    runArchitectureSummary(),
    runKnipSummary(),
    runAuditSummary(),
  ]);

  await writeTextFile(REPORT_PATH, formatReport(gitSummary, commandSummaries));
  printSummary(gitSummary, commandSummaries);
}

main().catch((error) => {
  process.stderr.write(
    `Agent health failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
