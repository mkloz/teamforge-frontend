#!/usr/bin/env node

// @ts-check

import { rm } from "node:fs/promises";
import path from "node:path";
import {
  asNumber,
  colorText,
  ensureDirectory,
  formatDuration,
  formatStatusBadge,
  parseFirstJsonObject,
  ROOT,
  renderBullets,
  renderKeyValues,
  renderMarkdownTable,
  resolvePackageBin,
  runCommand,
  sectionTitle,
  toRepoRelativePath,
  writeJsonFile,
  writeTextFile,
} from "../shared/command-utils.mjs";
import {
  ADVISORY_REACT_DOCTOR_RULES,
  getReactDoctorBlockingPolicyText,
  getReactDoctorRuleId,
  isReactDoctorBlockingSignal,
} from "./policy.mjs";

/**
 * @typedef {"changed" | "context" | "local" | "pr" | "release"} ReactDoctorMode
 * @typedef {"calibrated" | "error" | "none" | "warning"} ReactDoctorBlockingLevel
 * @typedef {{ blocking: ReactDoctorBlockingLevel; jsonFile: string; mode: ReactDoctorMode; projects: string[]; quiet: boolean; reportDir: string; scope: string }} CliOptions
 * @typedef {{ category?: string; filePath?: string; line?: number | string; message?: string; plugin?: string; rule?: string; severity?: string; title?: string }} ReactDoctorDiagnostic
 * @typedef {{ diagnostics?: ReactDoctorDiagnostic[]; directory?: string; summary?: Record<string, unknown> }} ReactDoctorProject
 * @typedef {{ elapsedMilliseconds?: number; ok?: boolean; projects?: ReactDoctorProject[]; version?: string }} ReactDoctorPayload
 * @typedef {{ affectedFileCount: number; blockerCount: number; diagnosticCount: number; errorCount: number; warningCount: number }} ReactDoctorSummary
 */

const DEFAULT_REPORT_DIR = path.join(ROOT, "reports", "react-doctor");
const DEFAULT_JSON_FILE = path.join(DEFAULT_REPORT_DIR, "report.json");
const SEVERITY_ORDER = ["error", "warning", "info"];
const numberFormatter = new Intl.NumberFormat("en-US");

/**
 * @param {string[]} argv CLI arguments.
 * @returns {CliOptions} Parsed options.
 */
function parseArgs(argv) {
  /** @type {CliOptions} */
  const options = {
    blocking: getDefaultBlockingLevel(),
    jsonFile: process.env.REACT_DOCTOR_JSON_FILE ?? DEFAULT_JSON_FILE,
    mode: "local",
    projects: getDefaultProjects(),
    quiet: false,
    reportDir: process.env.REACT_DOCTOR_REPORT_DIR ?? DEFAULT_REPORT_DIR,
    scope: process.env.REACT_DOCTOR_SCOPE ?? "full",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (isMode(arg)) {
      options.mode = arg;
      continue;
    }

    if (arg === "--quiet") {
      options.quiet = true;
      continue;
    }

    if (arg === "--json-file") {
      options.jsonFile = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--report-dir") {
      options.reportDir = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--project" || arg === "--projects") {
      options.projects = parseProjects(readOptionValue(argv, index, arg));
      index += 1;
      continue;
    }

    if (arg === "--scope") {
      options.scope = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--blocking") {
      options.blocking = parseBlockingLevel(readOptionValue(argv, index, arg));
      index += 1;
      continue;
    }

    if (arg.startsWith("--json-file=")) {
      options.jsonFile = arg.slice("--json-file=".length);
      continue;
    }

    if (arg.startsWith("--report-dir=")) {
      options.reportDir = arg.slice("--report-dir=".length);
      continue;
    }

    if (arg.startsWith("--project=") || arg.startsWith("--projects=")) {
      options.projects = parseProjects(arg.slice(arg.indexOf("=") + 1));
      continue;
    }

    if (arg.startsWith("--scope=")) {
      options.scope = arg.slice("--scope=".length);
      continue;
    }

    if (arg.startsWith("--blocking=")) {
      options.blocking = parseBlockingLevel(arg.slice("--blocking=".length));
      continue;
    }

    throw new Error(`Unknown react-doctor wrapper argument: ${arg}`);
  }

  return options;
}

/**
 * @returns {ReactDoctorBlockingLevel} Default blocking level.
 */
function getDefaultBlockingLevel() {
  const rawValue = process.env.REACT_DOCTOR_BLOCKING;

  if (!rawValue || rawValue === "false") {
    return "none";
  }

  if (rawValue === "true") {
    return "calibrated";
  }

  return parseBlockingLevel(rawValue);
}

/**
 * @returns {string[]} Default projects.
 */
function getDefaultProjects() {
  const rawValue = process.env.REACT_DOCTOR_PROJECTS;

  return rawValue ? parseProjects(rawValue) : [];
}

/**
 * @param {string} value Candidate mode.
 * @returns {value is ReactDoctorMode} Whether the value is a mode.
 */
function isMode(value) {
  return ["changed", "context", "local", "pr", "release"].includes(value);
}

/**
 * @param {string[]} argv Arguments.
 * @param {number} index Current index.
 * @param {string} option Option name.
 * @returns {string} Option value.
 */
function readOptionValue(argv, index, option) {
  const value = argv[index + 1];

  if (!value) {
    throw new Error(`Missing value for ${option}.`);
  }

  return value;
}

/**
 * @param {string} value Comma-separated project value.
 * @returns {string[]} Project paths/names.
 */
function parseProjects(value) {
  const projects = value
    .split(",")
    .map((project) => project.trim())
    .filter(Boolean);

  if (projects.length === 0) {
    throw new Error("React Doctor project list must not be empty.");
  }

  return projects;
}

/**
 * @param {string} value Candidate blocking level.
 * @returns {ReactDoctorBlockingLevel} Blocking level.
 */
function parseBlockingLevel(value) {
  if (
    value === "calibrated" ||
    value === "error" ||
    value === "warning" ||
    value === "none"
  ) {
    return value;
  }

  throw new Error(
    "React Doctor blocking level must be calibrated, error, warning, or none.",
  );
}

/**
 * @param {CliOptions} options Wrapper options.
 * @returns {string[]} React Doctor CLI arguments.
 */
function getReactDoctorArgs(options) {
  const args = [
    ".",
    "--json",
    "--json-compact",
    "--no-score",
    "--blocking",
    getCliBlockingLevel(options),
    "--no-color",
    "-y",
    "--output-dir",
    path.join(options.reportDir, "diagnostics"),
  ];

  if (options.scope !== "full") {
    args.push("--scope", options.scope);
  }

  if (options.mode === "changed" && options.scope === "full") {
    args.push("--scope", "changed");
  }

  if (options.projects.length > 0) {
    args.push("--project", options.projects.join(","));
  }

  return args;
}

/**
 * @param {CliOptions} options Wrapper options.
 * @returns {"error" | "none" | "warning"} React Doctor CLI blocking level.
 */
function getCliBlockingLevel(options) {
  return options.blocking === "calibrated" ? "none" : options.blocking;
}

/**
 * @param {CliOptions} options Wrapper options.
 * @returns {Promise<{ payload: ReactDoctorPayload; status: number }>} Run output.
 */
async function runReactDoctor(options) {
  const result = await runCommand({
    args: getReactDoctorArgs(options),
    name: "react-doctor",
    spec: resolvePackageBin("react-doctor"),
  });

  if (result.status !== 0 && options.blocking === "none") {
    throw new Error(result.stderr || result.stdout || "React Doctor failed.");
  }

  return {
    payload: /** @type {ReactDoctorPayload} */ (
      parseFirstJsonObject(result.stdout)
    ),
    status: result.status,
  };
}

/**
 * @param {ReactDoctorPayload} payload React Doctor payload.
 * @returns {ReactDoctorDiagnostic[]} Normalized diagnostics.
 */
function getDiagnostics(payload) {
  return (payload.projects ?? []).flatMap((project) => {
    const projectRoot = project.directory ?? ROOT;

    return (project.diagnostics ?? []).map((diagnostic) => {
      const normalizedDiagnostic = Object.assign({}, diagnostic);

      normalizedDiagnostic.filePath = normalizeDiagnosticPath(
        projectRoot,
        diagnostic.filePath,
      );

      return normalizedDiagnostic;
    });
  });
}

/**
 * @param {string} projectRoot Project root.
 * @param {string | undefined} filePath Diagnostic path.
 * @returns {string} Repository-relative path.
 */
function normalizeDiagnosticPath(projectRoot, filePath) {
  if (!filePath) {
    return "unknown";
  }

  return toRepoRelativePath(filePath, projectRoot);
}

/**
 * @param {ReactDoctorPayload} payload React Doctor payload.
 * @returns {ReactDoctorSummary} Summary.
 */
function summarizePayload(payload) {
  const diagnostics = getDiagnostics(payload);
  const fileSet = new Set(diagnostics.map((diagnostic) => diagnostic.filePath));

  return {
    affectedFileCount: fileSet.size,
    blockerCount: diagnostics.filter(isReactDoctorBlockingSignal).length,
    diagnosticCount: diagnostics.length,
    errorCount: diagnostics.filter(
      (diagnostic) => diagnostic.severity === "error",
    ).length,
    warningCount: diagnostics.filter(
      (diagnostic) => diagnostic.severity === "warning",
    ).length,
  };
}

/**
 * @param {ReactDoctorDiagnostic[]} diagnostics Diagnostics.
 * @returns {Array<[string, number]>} Counts by category.
 */
function getCategoryRows(diagnostics) {
  const counts = new Map();

  for (const diagnostic of diagnostics) {
    const category = diagnostic.category ?? "Uncategorized";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return [...counts.entries()].sort(
    ([leftCategory, leftCount], [rightCategory, rightCount]) =>
      rightCount - leftCount || leftCategory.localeCompare(rightCategory),
  );
}

/**
 * @param {ReactDoctorDiagnostic[]} diagnostics Diagnostics.
 * @returns {Array<[string, number]>} Counts by rule.
 */
function getRuleRows(diagnostics) {
  const counts = new Map();

  for (const diagnostic of diagnostics) {
    const rule = getReactDoctorRuleId(diagnostic);
    counts.set(rule, (counts.get(rule) ?? 0) + 1);
  }

  return [...counts.entries()].sort(
    ([leftRule, leftCount], [rightRule, rightCount]) =>
      rightCount - leftCount || leftRule.localeCompare(rightRule),
  );
}

/**
 * @param {ReactDoctorDiagnostic} left Left diagnostic.
 * @param {ReactDoctorDiagnostic} right Right diagnostic.
 * @returns {number} Sort order.
 */
function compareDiagnostics(left, right) {
  return (
    getSeverityRank(left.severity) - getSeverityRank(right.severity) ||
    (left.filePath ?? "").localeCompare(right.filePath ?? "") ||
    (left.rule ?? "").localeCompare(right.rule ?? "")
  );
}

/**
 * @param {string | undefined} severity Severity.
 * @returns {number} Sort rank.
 */
function getSeverityRank(severity) {
  const index = SEVERITY_ORDER.indexOf(severity ?? "info");

  return index === -1 ? SEVERITY_ORDER.length : index;
}

/**
 * @param {ReactDoctorPayload} payload React Doctor payload.
 * @param {CliOptions} options CLI options.
 * @param {number} status React Doctor exit status.
 * @returns {string} Markdown report.
 */
function formatMarkdownReport(payload, options, status) {
  const diagnostics = sortDiagnostics(getDiagnostics(payload));
  const summary = summarizePayload(payload);
  const categories = getCategoryRows(diagnostics);
  const rules = getRuleRows(diagnostics);
  const affectedFiles = getAffectedFileRows(diagnostics);

  return [
    "# React Doctor Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Version: ${payload.version ?? "unknown"}`,
    `Elapsed: ${formatDuration(asNumber(payload.elapsedMilliseconds))}`,
    `Exit status: ${status}`,
    "",
    "## Run Configuration",
    "",
    renderMarkdownBullets([
      `Mode: ${options.mode}`,
      `Scope: ${options.scope}`,
      `Projects: ${formatProjects(options.projects)}`,
      `Blocking: ${options.blocking}`,
    ]),
    "",
    "## Severity Overview",
    "",
    renderMarkdownBullets([
      `Diagnostics: ${formatNumber(summary.diagnosticCount)}`,
      `Calibrated blockers: ${formatNumber(summary.blockerCount)}`,
      `Errors: ${formatNumber(summary.errorCount)}`,
      `Warnings: ${formatNumber(summary.warningCount)}`,
      `Affected files: ${formatNumber(summary.affectedFileCount)}`,
    ]),
    "",
    "## Calibrated Blocking Policy",
    "",
    renderMarkdownBullets([
      `Current mode: ${options.blocking}`,
      `Blocks on: ${getReactDoctorBlockingPolicyText()}.`,
      `Advisory only: broad performance advice such as ${[
        ...ADVISORY_REACT_DOCTOR_RULES,
      ]
        .map(formatCodeValue)
        .join(", ")}.`,
    ]),
    "",
    "## Categories By Count",
    "",
    renderMarkdownTable(
      ["Category", "Diagnostics"],
      categories.map(([category, count]) => [category, String(count)]),
    ),
    "",
    "## Rules By Count",
    "",
    renderMarkdownTable(
      ["Rule", "Diagnostics"],
      rules.map(([rule, count]) => [rule, String(count)]),
    ),
    "",
    "## Affected Files",
    "",
    renderMarkdownTable(
      ["File", "Diagnostics", "Errors", "Warnings", "Categories"],
      affectedFiles.map((row) => [
        row.filePath,
        String(row.diagnosticCount),
        String(row.errorCount),
        String(row.warningCount),
        row.categories.join(", "),
      ]),
    ),
    "",
    "## Diagnostics",
    "",
    renderMarkdownTable(
      ["Severity", "Category", "Rule", "File", "Line", "Message"],
      diagnostics.map((diagnostic) => [
        diagnostic.severity ?? "-",
        diagnostic.category ?? "-",
        getReactDoctorRuleId(diagnostic),
        diagnostic.filePath ?? "-",
        formatOptionalValue(diagnostic.line),
        diagnostic.title ?? diagnostic.message ?? "-",
      ]),
    ),
    "",
    "## Command Execution Summary",
    "",
    renderMarkdownBullets(
      getReactDoctorCommandSummary(payload, summary, options, status),
    ),
    "",
  ].join("\n");
}

/**
 * @typedef {{ categories: string[]; diagnosticCount: number; errorCount: number; filePath: string; warningCount: number }} AffectedFileRow
 */

/**
 * @param {ReactDoctorDiagnostic[]} diagnostics Diagnostics.
 * @returns {ReactDoctorDiagnostic[]} Sorted diagnostics.
 */
function sortDiagnostics(diagnostics) {
  return [...diagnostics].sort(compareDiagnostics);
}

/**
 * @param {ReactDoctorDiagnostic[]} diagnostics Diagnostics.
 * @returns {AffectedFileRow[]} Affected file rows.
 */
function getAffectedFileRows(diagnostics) {
  /** @type {Map<string, { categories: Set<string>; diagnosticCount: number; errorCount: number; warningCount: number }>} */
  const rows = new Map();

  for (const diagnostic of diagnostics) {
    const filePath = diagnostic.filePath ?? "unknown";
    const current = rows.get(filePath) ?? {
      categories: new Set(),
      diagnosticCount: 0,
      errorCount: 0,
      warningCount: 0,
    };

    current.diagnosticCount += 1;
    current.categories.add(diagnostic.category ?? "Uncategorized");

    if (diagnostic.severity === "error") {
      current.errorCount += 1;
    } else if (diagnostic.severity === "warning") {
      current.warningCount += 1;
    }

    rows.set(filePath, current);
  }

  return [...rows.entries()]
    .map(([filePath, row]) => ({
      categories: [...row.categories].sort(compareStrings),
      diagnosticCount: row.diagnosticCount,
      errorCount: row.errorCount,
      filePath,
      warningCount: row.warningCount,
    }))
    .sort(
      (left, right) =>
        right.errorCount - left.errorCount ||
        right.diagnosticCount - left.diagnosticCount ||
        left.filePath.localeCompare(right.filePath),
    );
}

/**
 * @param {string} left Left value.
 * @param {string} right Right value.
 * @returns {number} Sort order.
 */
function compareStrings(left, right) {
  return left.localeCompare(right);
}

/**
 * @param {number | string | undefined} value Optional primitive.
 * @returns {string} Printable value.
 */
function formatOptionalValue(value) {
  return value === undefined ? "-" : `${value}`;
}

/**
 * @param {string[]} items Summary items.
 * @returns {string} Markdown bullets.
 */
function renderMarkdownBullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

/**
 * @param {ReactDoctorSummary} summary React Doctor summary.
 * @param {CliOptions} options CLI options.
 * @param {number} status Exit status.
 * @returns {string[]} Command execution summary bullets.
 */
function getReactDoctorCommandSummary(payload, summary, options, status) {
  return [
    `Command: \`node scripts/quality/react-doctor.mjs ${options.mode}\``,
    `Exit status: ${status}`,
    `Duration: ${formatDuration(asNumber(payload.elapsedMilliseconds))}`,
    `Mode: ${options.mode}; scope: ${options.scope}; projects: ${formatProjects(
      options.projects,
    )}; blocking: ${options.blocking}`,
    `JSON artifact: \`${toRepoRelativePath(options.jsonFile)}\``,
    `Diagnostics in payload: ${formatNumber(
      summary.diagnosticCount,
    )} across ${formatNumber(summary.affectedFileCount)} files (${formatNumber(
      summary.errorCount,
    )} errors, ${formatNumber(summary.warningCount)} warnings, ${formatNumber(
      summary.blockerCount,
    )} calibrated blockers).`,
  ];
}

/**
 * @param {ReactDoctorPayload} payload React Doctor payload.
 * @returns {boolean} Whether the Markdown report adds useful detail.
 */
function shouldWriteMarkdownReport(payload) {
  return summarizePayload(payload).diagnosticCount > 0;
}

/**
 * @param {ReactDoctorPayload} payload React Doctor payload.
 * @param {CliOptions} options CLI options.
 * @returns {void}
 */
function printSummary(payload, options) {
  const diagnostics = getDiagnostics(payload);
  const summary = summarizePayload(payload);
  const categories = getCategoryRows(diagnostics)
    .slice(0, 5)
    .map(([category, count]) => `${category} (${formatNumber(count)})`);
  const rules = getRuleRows(diagnostics)
    .slice(0, 5)
    .map(([rule, count]) => `${rule} (${formatNumber(count)})`);

  process.stdout.write(`${sectionTitle("React Doctor")}\n`);
  process.stdout.write(
    `${formatStatusBadge(
      summary.diagnosticCount > 0 ? "review" : "pass",
    )} ${formatNumber(summary.diagnosticCount)} diagnostics across ${formatNumber(
      summary.affectedFileCount,
    )} files\n`,
  );
  process.stdout.write(
    `${renderKeyValues([
      {
        label: "Errors",
        tone: summary.errorCount > 0 ? "warning" : "success",
        value: formatNumber(summary.errorCount),
      },
      {
        label: "Warnings",
        tone: summary.warningCount > 0 ? "warning" : "success",
        value: formatNumber(summary.warningCount),
      },
      {
        label: "Blockers",
        tone: summary.blockerCount > 0 ? "warning" : "success",
        value: `${formatNumber(summary.blockerCount)} calibrated`,
      },
      {
        label: "Scope",
        value: `${options.scope}; projects ${formatProjects(options.projects)}`,
      },
      {
        label: "Blocking",
        tone: options.blocking === "none" ? "muted" : "warning",
        value: options.blocking,
      },
      {
        label: "Elapsed",
        value: formatDuration(asNumber(payload.elapsedMilliseconds)),
      },
    ])}\n`,
  );

  process.stdout.write(`\n${colorText("Top categories", "accent")}\n`);
  process.stdout.write(`${renderBullets(categories, 5)}\n`);
  process.stdout.write(`\n${colorText("Top rules", "accent")}\n`);
  process.stdout.write(`${renderBullets(rules, 5)}\n`);
}

/**
 * @param {number} value Number value.
 * @returns {string} Locale-formatted number.
 */
function formatNumber(value) {
  return numberFormatter.format(value);
}

/**
 * @param {string[]} projects Explicit React Doctor projects.
 * @returns {string} Printable project setting.
 */
function formatProjects(projects) {
  return projects.length > 0 ? projects.join(", ") : "auto";
}

/**
 * @param {string} value Value.
 * @returns {string} Markdown inline code value.
 */
function formatCodeValue(value) {
  return `\`${value}\``;
}

/**
 * @param {ReactDoctorPayload} payload Payload.
 * @param {CliOptions} options Options.
 * @param {number} cliStatus React Doctor CLI status.
 * @returns {number} Wrapper exit status.
 */
function getWrapperStatus(payload, options, cliStatus) {
  if (options.blocking === "calibrated") {
    return summarizePayload(payload).blockerCount > 0 ? 1 : 0;
  }

  return cliStatus;
}

/**
 * Runs the wrapper.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const options = parseArgs(process.argv.slice(2));

  await ensureDirectory(options.reportDir);

  const { payload, status } = await runReactDoctor(options);
  const wrapperStatus = getWrapperStatus(payload, options, status);
  const reportPath = path.join(options.reportDir, "index.md");
  const writeMarkdownReport = shouldWriteMarkdownReport(payload);

  await writeJsonFile(options.jsonFile, payload);

  if (writeMarkdownReport) {
    await writeTextFile(
      reportPath,
      formatMarkdownReport(payload, options, wrapperStatus),
    );
  } else {
    await removeFileIfPresent(reportPath);
  }

  if (!options.quiet) {
    printSummary(payload, options);
    const artifacts = [
      ...(writeMarkdownReport ? [toRepoRelativePath(reportPath)] : []),
      toRepoRelativePath(options.jsonFile),
      toRepoRelativePath(path.join(options.reportDir, "diagnostics")),
    ];

    process.stdout.write(
      `\n${colorText("Artifacts", "accent")}\n${renderBullets(artifacts)}\n`,
    );

    if (!writeMarkdownReport) {
      process.stdout.write(
        `${colorText("No Markdown report written because there were no diagnostics.", "muted")}\n`,
      );
    }
  }

  process.exitCode = wrapperStatus;
}

/**
 * Removes a generated file when it exists.
 *
 * @param {string} filePath File path.
 * @returns {Promise<void>}
 */
async function removeFileIfPresent(filePath) {
  try {
    await rm(filePath, { force: true });
  } catch (error) {
    throw new Error(
      `Could not remove stale report ${toRepoRelativePath(filePath)}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }
}

main().catch((error) => {
  process.stderr.write(
    `React Doctor wrapper failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
