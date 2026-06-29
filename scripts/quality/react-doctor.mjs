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
  readRequiredOptionValue,
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
  getReactDoctorFalsePositive,
  getReactDoctorRuleId,
  isReactDoctorBlockingSignal,
} from "./policy.mjs";

/**
 * @typedef {"changed" | "context" | "local" | "pr" | "release"} ReactDoctorMode
 * @typedef {"calibrated" | "error" | "none" | "warning"} ReactDoctorBlockingLevel
 * @typedef {{ blocking: ReactDoctorBlockingLevel; jsonFile: string; mode: ReactDoctorMode; projects: string[]; quiet: boolean; reportDir: string; scope: string }} CliOptions
 * @typedef {{ category?: string; column?: number | string; filePath?: string; line?: number | string; message?: string; plugin?: string; rule?: string; severity?: string; title?: string }} ReactDoctorDiagnostic
 * @typedef {ReactDoctorDiagnostic & { suppressionReason: string; suppressionTarget?: string }} SuppressedReactDoctorDiagnostic
 * @typedef {{ diagnostics?: ReactDoctorDiagnostic[]; directory?: string; summary?: Record<string, unknown> }} ReactDoctorProject
 * @typedef {{ elapsedMilliseconds?: number; ok?: boolean; projects?: ReactDoctorProject[]; suppressedDiagnostics?: SuppressedReactDoctorDiagnostic[]; version?: string }} ReactDoctorPayload
 * @typedef {{ affectedFileCount: number; blockerCount: number; diagnosticCount: number; errorCount: number; suppressedCount: number; warningCount: number }} ReactDoctorSummary
 * @typedef {{ diagnostic: ReactDoctorDiagnostic; suppressedDiagnostic?: SuppressedReactDoctorDiagnostic }} ClassifiedReactDoctorDiagnostic
 * @typedef {{ project: ReactDoctorProject; suppressedDiagnostics: SuppressedReactDoctorDiagnostic[] }} FilteredReactDoctorProject
 * @typedef {(options: CliOptions, value: string) => void} ReactDoctorValueOptionAssigner
 * @typedef {{ assign: ReactDoctorValueOptionAssigner; prefix: string }} ReactDoctorInlineOption
 * @typedef {{ categories: Set<string>; diagnosticCount: number; errorCount: number; warningCount: number }} MutableAffectedFileRow
 */

const DEFAULT_REPORT_DIR = path.join(ROOT, "reports");
const DEFAULT_JSON_FILE = path.join(ROOT, "temp", "react-doctor.json");
const DEFAULT_DIAGNOSTICS_DIR = path.join(
  ROOT,
  "temp",
  "react-doctor-diagnostics",
);
const SEVERITY_ORDER = ["error", "warning", "info"];
const numberFormatter = new Intl.NumberFormat("en-US");
/** @type {Map<string, ReactDoctorValueOptionAssigner>} */
const REACT_DOCTOR_VALUE_OPTIONS = new Map([
  ["--blocking", assignBlockingOption],
  ["--json-file", assignJsonFileOption],
  ["--project", assignProjectsOption],
  ["--projects", assignProjectsOption],
  ["--report-dir", assignReportDirOption],
  ["--scope", assignScopeOption],
]);
/** @type {ReactDoctorInlineOption[]} */
const REACT_DOCTOR_INLINE_OPTIONS = [
  { assign: assignBlockingOption, prefix: "--blocking=" },
  { assign: assignJsonFileOption, prefix: "--json-file=" },
  { assign: assignProjectsOption, prefix: "--project=" },
  { assign: assignProjectsOption, prefix: "--projects=" },
  { assign: assignReportDirOption, prefix: "--report-dir=" },
  { assign: assignScopeOption, prefix: "--scope=" },
];

/**
 * @param {string[]} argv CLI arguments.
 * @returns {CliOptions} Parsed options.
 */
function parseArgs(argv) {
  const options = getDefaultCliOptions();

  for (let index = 0; index < argv.length; index += 1) {
    index += applyReactDoctorArg(options, argv, index);
  }

  return options;
}

/**
 * @returns {CliOptions} Default CLI options.
 */
function getDefaultCliOptions() {
  return {
    blocking: getDefaultBlockingLevel(),
    jsonFile: process.env.REACT_DOCTOR_JSON_FILE ?? DEFAULT_JSON_FILE,
    mode: "local",
    projects: getDefaultProjects(),
    quiet: false,
    reportDir: process.env.REACT_DOCTOR_REPORT_DIR ?? DEFAULT_REPORT_DIR,
    scope: process.env.REACT_DOCTOR_SCOPE ?? "full",
  };
}

/**
 * @param {CliOptions} options Parsed options.
 * @param {string[]} argv CLI arguments.
 * @param {number} index Current index.
 * @returns {number} Additional argv indexes consumed.
 */
function applyReactDoctorArg(options, argv, index) {
  const arg = argv[index];

  if (isMode(arg)) {
    options.mode = arg;
    return 0;
  }

  if (arg === "--quiet") {
    options.quiet = true;
    return 0;
  }

  const valueOption = REACT_DOCTOR_VALUE_OPTIONS.get(arg);

  if (valueOption) {
    valueOption(options, readRequiredOptionValue(argv, index, arg));
    return 1;
  }

  const inlineOption = REACT_DOCTOR_INLINE_OPTIONS.find((option) =>
    arg.startsWith(option.prefix),
  );

  if (inlineOption) {
    inlineOption.assign(options, arg.slice(inlineOption.prefix.length));
    return 0;
  }

  throw new Error(`Unknown react-doctor wrapper argument: ${arg}`);
}

/**
 * @param {CliOptions} options Parsed options.
 * @param {string} value Option value.
 * @returns {void}
 */
function assignBlockingOption(options, value) {
  options.blocking = parseBlockingLevel(value);
}

/**
 * @param {CliOptions} options Parsed options.
 * @param {string} value Option value.
 * @returns {void}
 */
function assignJsonFileOption(options, value) {
  options.jsonFile = value;
}

/**
 * @param {CliOptions} options Parsed options.
 * @param {string} value Option value.
 * @returns {void}
 */
function assignProjectsOption(options, value) {
  options.projects = parseProjects(value);
}

/**
 * @param {CliOptions} options Parsed options.
 * @param {string} value Option value.
 * @returns {void}
 */
function assignReportDirOption(options, value) {
  options.reportDir = value;
}

/**
 * @param {CliOptions} options Parsed options.
 * @param {string} value Option value.
 * @returns {void}
 */
function assignScopeOption(options, value) {
  options.scope = value;
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
    DEFAULT_DIAGNOSTICS_DIR,
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

    return (project.diagnostics ?? []).map((diagnostic) =>
      normalizeDiagnostic(projectRoot, diagnostic),
    );
  });
}

/**
 * @param {string} projectRoot Project root.
 * @param {ReactDoctorDiagnostic} diagnostic Raw diagnostic.
 * @returns {ReactDoctorDiagnostic} Normalized diagnostic.
 */
function normalizeDiagnostic(projectRoot, diagnostic) {
  const normalizedDiagnostic = Object.assign({}, diagnostic);

  normalizedDiagnostic.filePath = normalizeDiagnosticPath(
    projectRoot,
    diagnostic.filePath,
  );

  return normalizedDiagnostic;
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
 * @returns {ReactDoctorPayload} Payload with confirmed false positives removed.
 */
function applyFalsePositiveSuppressions(payload) {
  const filteredProjects = (payload.projects ?? []).map(
    filterProjectFalsePositives,
  );

  return Object.assign({}, payload, {
    projects: filteredProjects.map((result) => result.project),
    suppressedDiagnostics: [
      ...(payload.suppressedDiagnostics ?? []),
      ...filteredProjects.flatMap((result) => result.suppressedDiagnostics),
    ],
  });
}

/**
 * @param {ReactDoctorProject} project React Doctor project payload.
 * @returns {FilteredReactDoctorProject} Filtered project payload.
 */
function filterProjectFalsePositives(project) {
  const projectRoot = project.directory ?? ROOT;
  const classifiedDiagnostics = (project.diagnostics ?? []).map((diagnostic) =>
    classifyDiagnostic(projectRoot, diagnostic),
  );
  /** @type {ReactDoctorDiagnostic[]} */
  const retainedDiagnostics = [];
  /** @type {SuppressedReactDoctorDiagnostic[]} */
  const suppressedDiagnostics = [];

  for (const result of classifiedDiagnostics) {
    if (result.suppressedDiagnostic) {
      suppressedDiagnostics.push(result.suppressedDiagnostic);
    } else {
      retainedDiagnostics.push(result.diagnostic);
    }
  }

  return {
    project: Object.assign({}, project, {
      diagnostics: retainedDiagnostics,
    }),
    suppressedDiagnostics,
  };
}

/**
 * @param {string} projectRoot Project root.
 * @param {ReactDoctorDiagnostic} diagnostic Raw diagnostic.
 * @returns {ClassifiedReactDoctorDiagnostic} Retained or suppressed diagnostic.
 */
function classifyDiagnostic(projectRoot, diagnostic) {
  const normalizedDiagnostic = normalizeDiagnostic(projectRoot, diagnostic);
  const falsePositive = getReactDoctorFalsePositive(normalizedDiagnostic);

  return {
    diagnostic,
    suppressedDiagnostic: falsePositive
      ? Object.assign({}, normalizedDiagnostic, {
          suppressionReason: falsePositive.reason,
          suppressionTarget: falsePositive.packageName
            ? `package:${falsePositive.packageName}`
            : undefined,
        })
      : undefined,
  };
}

/**
 * @param {ReactDoctorPayload} payload React Doctor payload.
 * @returns {SuppressedReactDoctorDiagnostic[]} Suppressed diagnostics.
 */
function getSuppressedDiagnostics(payload) {
  return [...(payload.suppressedDiagnostics ?? [])].sort(compareDiagnostics);
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
    suppressedCount: getSuppressedDiagnostics(payload).length,
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
  return getFirstNonZeroComparison([
    compareNumbers(
      getSeverityRank(left.severity),
      getSeverityRank(right.severity),
    ),
    compareStrings(getDiagnosticFilePath(left), getDiagnosticFilePath(right)),
    compareStrings(getReactDoctorRuleId(left), getReactDoctorRuleId(right)),
  ]);
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
  const suppressedDiagnostics = getSuppressedDiagnostics(payload);
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
      `Suppressed confirmed false positives: ${formatNumber(
        summary.suppressedCount,
      )}`,
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
      "Confirmed false positives are suppressed only by exact file/plugin/rule/line/column evidence, with package diagnostics additionally matched by package name from the message.",
    ]),
    "",
    "## Suppressed Confirmed False Positives",
    "",
    formatSuppressedDiagnostics(suppressedDiagnostics),
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
 * @param {SuppressedReactDoctorDiagnostic[]} diagnostics Suppressed diagnostics.
 * @returns {string} Markdown details.
 */
function formatSuppressedDiagnostics(diagnostics) {
  if (diagnostics.length === 0) {
    return "No confirmed false positives suppressed.";
  }

  return renderMarkdownTable(
    ["Rule", "File", "Line", "Column", "Target", "Reason"],
    diagnostics.map((diagnostic) => [
      getReactDoctorRuleId(diagnostic),
      diagnostic.filePath ?? "-",
      formatOptionalValue(diagnostic.line),
      formatOptionalValue(diagnostic.column),
      diagnostic.suppressionTarget ?? "-",
      diagnostic.suppressionReason,
    ]),
  );
}

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
  /** @type {Map<string, MutableAffectedFileRow>} */
  const rows = new Map();

  for (const diagnostic of diagnostics) {
    addAffectedFileDiagnostic(rows, diagnostic);
  }

  return [...rows.entries()]
    .map(toAffectedFileRow)
    .sort(compareAffectedFileRows);
}

/**
 * @param {Map<string, MutableAffectedFileRow>} rows File row map.
 * @param {ReactDoctorDiagnostic} diagnostic Diagnostic.
 * @returns {void}
 */
function addAffectedFileDiagnostic(rows, diagnostic) {
  const row = getMutableAffectedFileRow(
    rows,
    getDiagnosticFilePath(diagnostic),
  );

  row.diagnosticCount += 1;
  row.categories.add(diagnostic.category ?? "Uncategorized");
  incrementAffectedFileSeverity(row, diagnostic.severity);
}

/**
 * @param {Map<string, MutableAffectedFileRow>} rows File row map.
 * @param {string} filePath File path.
 * @returns {MutableAffectedFileRow} Existing or new mutable row.
 */
function getMutableAffectedFileRow(rows, filePath) {
  const row = rows.get(filePath) ?? createMutableAffectedFileRow();

  rows.set(filePath, row);

  return row;
}

/**
 * @returns {MutableAffectedFileRow} Empty mutable affected file row.
 */
function createMutableAffectedFileRow() {
  return {
    categories: new Set(),
    diagnosticCount: 0,
    errorCount: 0,
    warningCount: 0,
  };
}

/**
 * @param {MutableAffectedFileRow} row Mutable row.
 * @param {string | undefined} severity Diagnostic severity.
 * @returns {void}
 */
function incrementAffectedFileSeverity(row, severity) {
  if (severity === "error") {
    row.errorCount += 1;
    return;
  }

  if (severity === "warning") {
    row.warningCount += 1;
  }
}

/**
 * @param {[string, MutableAffectedFileRow]} entry File row map entry.
 * @returns {AffectedFileRow} Report row.
 */
function toAffectedFileRow([filePath, row]) {
  return {
    categories: [...row.categories].sort(compareStrings),
    diagnosticCount: row.diagnosticCount,
    errorCount: row.errorCount,
    filePath,
    warningCount: row.warningCount,
  };
}

/**
 * @param {AffectedFileRow} left Left row.
 * @param {AffectedFileRow} right Right row.
 * @returns {number} Sort order.
 */
function compareAffectedFileRows(left, right) {
  return getFirstNonZeroComparison([
    compareNumbers(right.errorCount, left.errorCount),
    compareNumbers(right.diagnosticCount, left.diagnosticCount),
    compareStrings(left.filePath, right.filePath),
  ]);
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
 * @param {number} left Left value.
 * @param {number} right Right value.
 * @returns {number} Sort order.
 */
function compareNumbers(left, right) {
  return left - right;
}

/**
 * @param {number[]} comparisons Ordered comparison results.
 * @returns {number} First non-zero comparison or zero.
 */
function getFirstNonZeroComparison(comparisons) {
  for (const comparison of comparisons) {
    if (comparison !== 0) {
      return comparison;
    }
  }

  return 0;
}

/**
 * @param {ReactDoctorDiagnostic} diagnostic Diagnostic.
 * @returns {string} Printable file path.
 */
function getDiagnosticFilePath(diagnostic) {
  return diagnostic.filePath ?? "unknown";
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
    `Suppressed confirmed false positives: ${formatNumber(
      summary.suppressedCount,
    )}.`,
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
  const summary = summarizePayload(payload);

  return summary.diagnosticCount > 0 || summary.suppressedCount > 0;
}

/**
 * @param {ReactDoctorPayload} payload React Doctor payload.
 * @param {CliOptions} options CLI options.
 * @returns {void}
 */
function printSummary(payload, options) {
  const diagnostics = getDiagnostics(payload);
  const summary = summarizePayload(payload);
  const categories = formatTopCountRows(getCategoryRows(diagnostics));
  const rules = formatTopCountRows(getRuleRows(diagnostics));

  process.stdout.write(`${sectionTitle("React Doctor")}\n`);
  process.stdout.write(
    `${formatStatusBadge(
      summary.diagnosticCount > 0 ? "review" : "pass",
    )} ${formatNumber(summary.diagnosticCount)} diagnostics across ${formatNumber(
      summary.affectedFileCount,
    )} files\n`,
  );
  process.stdout.write(
    `${renderKeyValues(getSummaryKeyValueRows(summary, payload, options))}\n`,
  );

  process.stdout.write(`\n${colorText("Top categories", "accent")}\n`);
  process.stdout.write(`${renderBullets(categories, 5)}\n`);
  process.stdout.write(`\n${colorText("Top rules", "accent")}\n`);
  process.stdout.write(`${renderBullets(rules, 5)}\n`);
}

/**
 * @param {Array<[string, number]>} rows Count rows.
 * @returns {string[]} Formatted rows.
 */
function formatTopCountRows(rows) {
  return rows
    .slice(0, 5)
    .map(([label, count]) => `${label} (${formatNumber(count)})`);
}

/**
 * @param {ReactDoctorSummary} summary Summary.
 * @param {ReactDoctorPayload} payload Payload.
 * @param {CliOptions} options CLI options.
 * @returns {import("../shared/command-utils.mjs").KeyValueRow[]} Summary rows.
 */
function getSummaryKeyValueRows(summary, payload, options) {
  return [
    getCountSummaryRow("Errors", summary.errorCount),
    getCountSummaryRow("Warnings", summary.warningCount),
    {
      label: "Blockers",
      tone: getCountTone(summary.blockerCount),
      value: `${formatNumber(summary.blockerCount)} calibrated`,
    },
    {
      label: "Suppressed",
      tone: summary.suppressedCount > 0 ? "muted" : "success",
      value: formatNumber(summary.suppressedCount),
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
  ];
}

/**
 * @param {string} label Row label.
 * @param {number} count Row count.
 * @returns {import("../shared/command-utils.mjs").KeyValueRow} Summary row.
 */
function getCountSummaryRow(label, count) {
  return {
    label,
    tone: getCountTone(count),
    value: formatNumber(count),
  };
}

/**
 * @param {number} count Count.
 * @returns {"success" | "warning"} Count tone.
 */
function getCountTone(count) {
  return count > 0 ? "warning" : "success";
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

  const { payload: rawPayload, status } = await runReactDoctor(options);
  const payload = applyFalsePositiveSuppressions(rawPayload);
  const wrapperStatus = getWrapperStatus(payload, options, status);
  const reportPath = path.join(options.reportDir, "react-doctor.md");
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
      toRepoRelativePath(DEFAULT_DIAGNOSTICS_DIR),
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
