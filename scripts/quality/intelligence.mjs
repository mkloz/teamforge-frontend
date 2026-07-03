#!/usr/bin/env node
// @ts-check

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  colorText,
  countValue,
  ensureDirectory,
  formatDuration,
  formatStatusBadge,
  isRecord,
  parseFirstJsonObject,
  ROOT,
  readRequiredOptionValue,
  renderBullets,
  renderKeyValues,
  renderMarkdownTable,
  resolveNodeScript,
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
  isReactDoctorBlockingSignal,
} from "./policy.mjs";

/**
 * @typedef {"context" | "local" | "pr" | "release"} QualityMode
 * @typedef {{ mode: QualityMode; quiet: boolean; reportDir: string; tempDir: string }} CliOptions
 * @typedef {Record<string, unknown>} JsonObject
 * @typedef {{ label: string; payload: JsonObject; status: number; durationMs: number }} FallowResult
 * @typedef {{ category: string; filePath: string; message: string; rule: string; severity: string; source: "fallow" | "react-doctor" }} NormalizedFinding
 * @typedef {{ cleanupIssues: number; cloneGroups: number; crapRisk: number; files: Set<string>; refactorTargets: number; structuralComplexity: number; totalFindings: number }} FallowSummary
 * @typedef {{ affectedFiles: Set<string>; diagnostics: number; errors: number; warnings: number }} ReactDoctorSummary
 * @typedef {{ fallow: FallowSummary; findings: NormalizedFinding[]; reactDoctor: ReactDoctorSummary; sharedHotspots: string[]; toolSpecific: { fallowOnly: string[]; reactDoctorOnly: string[] } }} QualitySummary
 * @typedef {{ filePath: string; findings: NormalizedFinding[]; priority: number; reasons: string[]; sources: string[] }} TriageRow
 */

const DEFAULT_REPORT_DIR = path.join(ROOT, "reports");
const DEFAULT_TEMP_DIR = path.join(ROOT, "temp", "quality-intelligence");
const SUMMARY_PATH = path.join(
  ROOT,
  "temp",
  "quality-intelligence-summary.json",
);
const shouldBlock = process.env.QUALITY_INTELLIGENCE_BLOCKING === "true";
const numberFormatter = new Intl.NumberFormat("en-US");

/** @type {readonly { label: string; args: string[] }[]} */
const FALLOW_ANALYSES = [
  {
    label: "dead code",
    args: ["dead-code", "--format", "json", "--quiet"],
  },
  {
    label: "duplication",
    args: ["dupes", "--format", "json", "--quiet"],
  },
  {
    label: "complexity",
    args: ["health", "--format", "json", "--quiet"],
  },
];

/**
 * @param {string[]} argv CLI arguments.
 * @returns {CliOptions} Parsed options.
 */
function parseArgs(argv) {
  /** @type {CliOptions} */
  const options = {
    mode: "local",
    quiet: false,
    reportDir:
      process.env.QUALITY_INTELLIGENCE_REPORT_DIR ?? DEFAULT_REPORT_DIR,
    tempDir: process.env.QUALITY_INTELLIGENCE_TEMP_DIR ?? DEFAULT_TEMP_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    index = applyCliArg(options, argv, index);
  }

  return options;
}

/**
 * @param {CliOptions} options Mutable CLI options.
 * @param {string[]} argv CLI arguments.
 * @param {number} index Current argument index.
 * @returns {number} Next argument index.
 */
function applyCliArg(options, argv, index) {
  const arg = argv[index];

  return (
    applyModeArg(options, arg, index) ??
    applyQuietArg(options, arg, index) ??
    applyPathOptionArg(options, argv, index) ??
    applyInlinePathOptionArg(options, arg, index) ??
    rejectUnknownArg(arg)
  );
}

/**
 * @param {CliOptions} options Mutable CLI options.
 * @param {string} arg CLI argument.
 * @param {number} index Current argument index.
 * @returns {number | null} Next argument index when handled.
 */
function applyModeArg(options, arg, index) {
  if (!isMode(arg)) {
    return null;
  }

  options.mode = arg;
  return index;
}

/**
 * @param {CliOptions} options Mutable CLI options.
 * @param {string} arg CLI argument.
 * @param {number} index Current argument index.
 * @returns {number | null} Next argument index when handled.
 */
function applyQuietArg(options, arg, index) {
  if (arg !== "--quiet") {
    return null;
  }

  options.quiet = true;
  return index;
}

/**
 * @param {CliOptions} options Mutable CLI options.
 * @param {string[]} argv CLI arguments.
 * @param {number} index Current argument index.
 * @returns {number | null} Next argument index when handled.
 */
function applyPathOptionArg(options, argv, index) {
  const arg = argv[index];

  if (!isPathOption(arg)) {
    return null;
  }

  setPathOption(options, arg, readRequiredOptionValue(argv, index, arg));
  return index + 1;
}

/**
 * @param {CliOptions} options Mutable CLI options.
 * @param {string} arg CLI argument.
 * @param {number} index Current argument index.
 * @returns {number | null} Next argument index when handled.
 */
function applyInlinePathOptionArg(options, arg, index) {
  const inlineOption = parseInlinePathOption(arg);

  if (!inlineOption) {
    return null;
  }

  setPathOption(options, inlineOption.option, inlineOption.value);
  return index;
}

/**
 * @param {string} arg CLI argument.
 * @returns {never} Always throws.
 */
function rejectUnknownArg(arg) {
  throw new Error(`Unknown quality-intelligence argument: ${arg}`);
}

/**
 * @param {string} value CLI argument.
 * @returns {value is "--report-dir" | "--temp-dir"} Whether this is a path option.
 */
function isPathOption(value) {
  return value === "--report-dir" || value === "--temp-dir";
}

/**
 * @param {string} value CLI argument.
 * @returns {{ option: "--report-dir" | "--temp-dir"; value: string } | null} Inline path option.
 */
function parseInlinePathOption(value) {
  if (value.startsWith("--report-dir=")) {
    return {
      option: "--report-dir",
      value: value.slice("--report-dir=".length),
    };
  }

  if (value.startsWith("--temp-dir=")) {
    return {
      option: "--temp-dir",
      value: value.slice("--temp-dir=".length),
    };
  }

  return null;
}

/**
 * @param {CliOptions} options Mutable CLI options.
 * @param {"--report-dir" | "--temp-dir"} option Option name.
 * @param {string} value Option value.
 */
function setPathOption(options, option, value) {
  if (option === "--report-dir") {
    options.reportDir = value;
    return;
  }

  options.tempDir = value;
}

/**
 * @param {string} value Candidate mode.
 * @returns {value is QualityMode} Whether the value is a supported mode.
 */
function isMode(value) {
  return ["context", "local", "pr", "release"].includes(value);
}

/**
 * @param {{ args: string[]; label: string }} analysis Fallow analysis.
 * @returns {Promise<FallowResult>} Fallow result.
 */
async function runFallowAnalysis(analysis) {
  const result = await runCommand({
    args: analysis.args,
    name: `fallow:${analysis.label}`,
    spec: resolvePackageBin("fallow"),
  });

  if (result.status === 2) {
    throw new Error(
      `Fallow ${analysis.label} failed: ${result.stderr || result.stdout}`,
    );
  }

  return {
    durationMs: result.durationMs,
    label: analysis.label,
    payload: parseFirstJsonObject(result.stdout),
    status: result.status,
  };
}

/**
 * @param {CliOptions} options CLI options.
 * @returns {Promise<JsonObject>} React Doctor payload.
 */
async function runReactDoctor(options) {
  const jsonFile = path.join(options.tempDir, "react-doctor.json");
  const result = await runCommand({
    args: [
      options.mode,
      "--quiet",
      "--blocking",
      "none",
      "--json-file",
      jsonFile,
      "--report-dir",
      path.join(ROOT, "reports"),
    ],
    name: "react-doctor",
    spec: resolveNodeScript("scripts/quality/react-doctor.mjs"),
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "React Doctor failed.");
  }

  return readJsonFile(jsonFile);
}

/**
 * @param {string} filePath JSON file path.
 * @returns {Promise<JsonObject>} Parsed JSON object.
 */
async function readJsonFile(filePath) {
  // oxlint-disable-next-line bensandee/no-unsafe-json-parse -- Tool JSON is validated as an object before use.
  const parsed = JSON.parse(await readFile(filePath, "utf8"));

  if (!isRecord(parsed)) {
    throw new TypeError(`${filePath} must contain a JSON object.`);
  }

  return parsed;
}

/**
 * @param {FallowResult[]} fallowResults Fallow outputs.
 * @param {JsonObject} reactDoctorPayload React Doctor payload.
 * @returns {QualitySummary} Combined summary.
 */
function createQualitySummary(fallowResults, reactDoctorPayload) {
  const fallowFindings = normalizeFallowFindings(fallowResults);
  const reactDoctorFindings = normalizeReactDoctorFindings(reactDoctorPayload);
  const findings = [...fallowFindings, ...reactDoctorFindings];
  const fallow = summarizeFallow(fallowResults, fallowFindings);
  const reactDoctor = summarizeReactDoctor(reactDoctorFindings);
  const sharedHotspots = [...fallow.files].filter((filePath) =>
    reactDoctor.affectedFiles.has(filePath),
  );
  const toolSpecific = {
    fallowOnly: [...fallow.files].filter(
      (filePath) => !reactDoctor.affectedFiles.has(filePath),
    ),
    reactDoctorOnly: [...reactDoctor.affectedFiles].filter(
      (filePath) => !fallow.files.has(filePath),
    ),
  };

  return {
    fallow,
    findings,
    reactDoctor,
    sharedHotspots: sharedHotspots.sort(compareStrings),
    toolSpecific: {
      fallowOnly: toolSpecific.fallowOnly.sort(compareStrings),
      reactDoctorOnly: toolSpecific.reactDoctorOnly.sort(compareStrings),
    },
  };
}

/**
 * @param {FallowResult[]} fallowResults Fallow outputs.
 * @returns {NormalizedFinding[]} Normalized Fallow findings.
 */
function normalizeFallowFindings(fallowResults) {
  return fallowResults.flatMap((result) => {
    if (result.label === "dead code") {
      return normalizeDeadCodeFindings(result.payload);
    }

    if (result.label === "duplication") {
      return normalizeDuplicationFindings(result.payload);
    }

    if (result.label === "complexity") {
      return normalizeHealthFindings(result.payload);
    }

    return [];
  });
}

/**
 * @param {JsonObject} payload Dead-code payload.
 * @returns {NormalizedFinding[]} Normalized dead-code findings.
 */
function normalizeDeadCodeFindings(payload) {
  return Object.entries(payload).flatMap(([key, value]) =>
    normalizeDeadCodeEntry(key, value),
  );
}

/**
 * @param {string} key Dead-code finding key.
 * @param {unknown} value Dead-code payload entry.
 * @returns {NormalizedFinding[]} Normalized findings for this entry.
 */
function normalizeDeadCodeEntry(key, value) {
  if (!Array.isArray(value) || !isDeadCodeFindingKey(key)) {
    return [];
  }

  return value.filter(isRecord).flatMap((item) => {
    return normalizeDeadCodeFinding(key, item);
  });
}

/**
 * @param {string} key Dead-code finding key.
 * @param {JsonObject} item Dead-code item payload.
 * @returns {NormalizedFinding[]} Normalized findings when paths exist.
 */
function normalizeDeadCodeFinding(key, item) {
  const filePaths = getDeadCodeFilePaths(key, item);

  if (filePaths.length === 0) {
    return [];
  }

  return filePaths.map((filePath) => ({
    category: "dead code",
    filePath,
    message: formatDeadCodeMessage(key, item),
    rule: `dead-code/${formatRuleName(key)}`,
    severity: getDeadCodeSeverity(key),
    source: "fallow",
  }));
}

/**
 * @param {string} key Dead-code finding key.
 * @param {JsonObject} item Dead-code item payload.
 * @returns {string[]} Repo-relative paths for the finding.
 */
function getDeadCodeFilePaths(key, item) {
  const directPath = getFallowFilePath(item);

  if (directPath) {
    return [directPath];
  }

  if (key !== "duplicate_exports") {
    return [];
  }

  return getFallowLocationFilePaths(item.locations);
}

/**
 * @param {unknown} locations Fallow source locations.
 * @returns {string[]} Unique repo-relative file paths.
 */
function getFallowLocationFilePaths(locations) {
  if (!Array.isArray(locations)) {
    return [];
  }

  return [
    ...new Set(
      locations.flatMap((location) => {
        const filePath = getFallowLocationFilePath(location);

        return filePath ? [filePath] : [];
      }),
    ),
  ].sort(compareStrings);
}

/**
 * @param {unknown} value Fallow location value.
 * @returns {string | null} Repo-relative file path when present.
 */
function getFallowLocationFilePath(value) {
  if (typeof value !== "string") {
    return null;
  }

  const locationMatch = value.match(
    /^(.+\.(?:[cm]?[jt]sx?|css|json|ya?ml|md))(?::\d+){0,2}$/iu,
  );
  const pathCandidate = locationMatch ? locationMatch[1] : value;

  return normalizeFilePathCandidate(pathCandidate);
}

/**
 * @param {JsonObject} payload Duplication payload.
 * @returns {NormalizedFinding[]} Normalized duplication findings.
 */
function normalizeDuplicationFindings(payload) {
  const cloneGroups = Array.isArray(payload.clone_groups)
    ? payload.clone_groups.filter(isRecord)
    : [];

  return cloneGroups.flatMap((group) => {
    const instances = Array.isArray(group.instances)
      ? group.instances.filter(isRecord)
      : [];
    const lineCount = countValue(group.line_count);
    const fingerprint = getString(group.fingerprint, "clone group");

    return instances.flatMap((instance) => {
      const filePath = getFallowFilePath(instance);

      if (!filePath) {
        return [];
      }

      return [
        {
          category: "duplication",
          filePath,
          message: `${fingerprint}: duplicated ${formatNumber(
            lineCount,
          )}-line block`,
          rule: "duplication/code-clone",
          severity: "review",
          source: "fallow",
        },
      ];
    });
  });
}

/**
 * @param {JsonObject} payload Health payload.
 * @returns {NormalizedFinding[]} Normalized health findings.
 */
function normalizeHealthFindings(payload) {
  return getHealthFindings(payload).flatMap((finding) => {
    if (!isRecord(finding)) {
      return [];
    }

    const filePath = getFallowFilePath(finding);

    if (!filePath) {
      return [];
    }

    const exceeded = getString(finding.exceeded, "threshold");
    const functionName = getString(finding.name, "anonymous function");
    const category =
      exceeded === "crap" ? "coverage risk" : "structural complexity";

    return [
      {
        category,
        filePath,
        message: `${functionName} exceeds ${exceeded} threshold`,
        rule: `health/${formatRuleName(exceeded)}`,
        severity: getString(finding.severity, "review"),
        source: "fallow",
      },
    ];
  });
}

/**
 * @param {JsonObject} finding Fallow finding.
 * @returns {string | null} Repo-relative path when present.
 */
function getFallowFilePath(finding) {
  for (const key of ["path", "file", "module", "target"]) {
    const candidate = finding[key];

    if (typeof candidate !== "string") {
      continue;
    }

    const filePath = normalizeFilePathCandidate(candidate);

    if (filePath) {
      return filePath;
    }
  }

  return null;
}

/**
 * @param {string} key Payload key.
 * @returns {boolean} Whether this dead-code key contains findings.
 */
function isDeadCodeFindingKey(key) {
  return ![
    "entry_points",
    "summary",
    "kind",
    "schema_version",
    "version",
    "elapsed_ms",
    "total_issues",
  ].includes(key);
}

/**
 * @param {string} key Dead-code finding key.
 * @param {JsonObject} finding Finding payload.
 * @returns {string} Human-readable finding message.
 */
function formatDeadCodeMessage(key, finding) {
  const subject =
    getString(finding.export_name, "") ||
    getString(finding.package_name, "") ||
    getString(finding.name, "") ||
    formatRuleName(key);

  return `${formatTitle(key)}: ${subject}`;
}

/**
 * @param {string} key Dead-code finding key.
 * @returns {string} Calibrated severity.
 */
function getDeadCodeSeverity(key) {
  return /(?:dependencies|imports|boundaries|cycles|overrides)/iu.test(key)
    ? "warning"
    : "review";
}

/**
 * @param {string} value Candidate file path.
 * @returns {string | null} Normalized file path.
 */
function normalizeFilePathCandidate(value) {
  const normalized = value.replaceAll("\\", "/");

  if (/\s/u.test(normalized) || normalized.includes("`")) {
    return null;
  }

  if (!/\.(?:[cm]?[jt]sx?|css|json|yaml|yml|md)$/iu.test(normalized)) {
    return null;
  }

  if (normalized.includes("node_modules/")) {
    return null;
  }

  return isAbsoluteFilePath(normalized)
    ? toRepoRelativePath(normalized)
    : normalized;
}

/**
 * @param {string} value Candidate path.
 * @returns {boolean} Whether the path is absolute.
 */
function isAbsoluteFilePath(value) {
  return value.startsWith("/") || /^[a-z]:\//iu.test(value);
}

/**
 * @param {string} value Raw rule/key.
 * @returns {string} Kebab-ish rule name.
 */
function formatRuleName(value) {
  return value.replaceAll("_", "-").toLowerCase();
}

/**
 * @param {string} value Raw title/key.
 * @returns {string} Human-readable title.
 */
function formatTitle(value) {
  return value
    .replaceAll("_", " ")
    .replace(/^\p{Ll}/u, (char) => char.toUpperCase());
}

/**
 * @param {JsonObject} payload React Doctor payload.
 * @returns {NormalizedFinding[]} Normalized findings.
 */
function normalizeReactDoctorFindings(payload) {
  return getReactDoctorProjects(payload).flatMap((project) => {
    const diagnostics = Array.isArray(project.diagnostics)
      ? project.diagnostics
      : [];

    return diagnostics
      .filter(isRecord)
      .map((diagnostic) => normalizeReactDoctorDiagnostic(project, diagnostic));
  });
}

/**
 * @param {JsonObject} payload React Doctor payload.
 * @returns {JsonObject[]} Projects.
 */
function getReactDoctorProjects(payload) {
  return Array.isArray(payload.projects)
    ? payload.projects.filter(isRecord)
    : [];
}

/**
 * @param {JsonObject} project React Doctor project.
 * @param {JsonObject} diagnostic React Doctor diagnostic.
 * @returns {NormalizedFinding} Normalized diagnostic.
 */
function normalizeReactDoctorDiagnostic(project, diagnostic) {
  const projectDirectory = getString(project.directory, ROOT);
  const rawFilePath = getString(diagnostic.filePath, "unknown");
  const plugin = getString(diagnostic.plugin, "unknown");
  const rule = getString(diagnostic.rule, "unknown");

  return {
    category: getString(diagnostic.category, "Uncategorized"),
    filePath: toRepoRelativePath(rawFilePath, projectDirectory),
    message: getReactDoctorMessage(diagnostic),
    rule: `${plugin}/${rule}`,
    severity: getString(diagnostic.severity, "review"),
    source: "react-doctor",
  };
}

/**
 * @param {JsonObject} diagnostic React Doctor diagnostic.
 * @returns {string} Diagnostic message.
 */
function getReactDoctorMessage(diagnostic) {
  return getString(
    diagnostic.title,
    getString(diagnostic.message, "React Doctor finding"),
  );
}

/**
 * @param {unknown} value Candidate string.
 * @param {string} fallback Fallback value.
 * @returns {string} String value or fallback.
 */
function getString(value, fallback) {
  return typeof value === "string" ? value : fallback;
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
 * @param {FallowResult[]} fallowResults Fallow outputs.
 * @param {NormalizedFinding[]} findings Normalized Fallow findings.
 * @returns {FallowSummary} Fallow summary.
 */
function summarizeFallow(fallowResults, findings) {
  const deadCode = getFallowPayload(fallowResults, "dead code");
  const dupes = getFallowPayload(fallowResults, "duplication");
  const health = getFallowPayload(fallowResults, "complexity");
  const healthFindings = getHealthFindings(health);
  const structuralComplexity = healthFindings.filter(
    (finding) => isRecord(finding) && finding.exceeded !== "crap",
  ).length;
  const crapRisk = healthFindings.filter(
    (finding) => isRecord(finding) && finding.exceeded === "crap",
  ).length;

  return {
    cleanupIssues: countValue(deadCode.total_issues),
    cloneGroups: countValue(dupes.clone_groups),
    crapRisk,
    files: new Set(findings.map((finding) => finding.filePath)),
    refactorTargets: countValue(health.targets),
    structuralComplexity,
    totalFindings:
      countValue(deadCode.total_issues) +
      countValue(dupes.clone_groups) +
      structuralComplexity +
      crapRisk,
  };
}

/**
 * @param {FallowResult[]} fallowResults Fallow outputs.
 * @param {string} label Result label.
 * @returns {JsonObject} Payload.
 */
function getFallowPayload(fallowResults, label) {
  return fallowResults.find((result) => result.label === label)?.payload ?? {};
}

/**
 * @param {JsonObject} healthPayload Health payload.
 * @returns {unknown[]} Health findings.
 */
function getHealthFindings(healthPayload) {
  if (Array.isArray(healthPayload.findings)) {
    return healthPayload.findings;
  }

  if (Array.isArray(healthPayload.results)) {
    return healthPayload.results;
  }

  return [];
}

/**
 * @param {NormalizedFinding[]} findings React Doctor findings.
 * @returns {ReactDoctorSummary} React Doctor summary.
 */
function summarizeReactDoctor(findings) {
  return {
    affectedFiles: new Set(findings.map((finding) => finding.filePath)),
    diagnostics: findings.length,
    errors: findings.filter((finding) => finding.severity === "error").length,
    warnings: findings.filter((finding) => finding.severity === "warning")
      .length,
  };
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @param {number} elapsedMs Elapsed time.
 * @param {CliOptions} options CLI options.
 * @returns {string} Markdown report.
 */
function formatMarkdownReport(summary, elapsedMs, options) {
  const allFiles = new Set([
    ...summary.fallow.files,
    ...summary.reactDoctor.affectedFiles,
  ]);
  const blockingFindings = getBlockingFindings(summary);
  const triageRows = getTriageRows(summary).slice(0, 30);
  const topFileRows = getFindingCountRows(summary.findings).slice(0, 50);
  const sharedFindings = summary.findings.filter((finding) =>
    summary.sharedHotspots.includes(finding.filePath),
  );
  const fallowFindings = summary.findings.filter(
    (finding) => finding.source === "fallow",
  );
  const reactDoctorFindings = summary.findings.filter(
    (finding) => finding.source === "react-doctor",
  );
  const fallowRuleRows = getRuleCountRows(fallowFindings).slice(0, 20);
  const reactDoctorRuleRows = getRuleCountRows(reactDoctorFindings).slice(
    0,
    25,
  );

  return [
    "# Quality Intelligence",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Elapsed: ${formatDuration(elapsedMs)}`,
    ...formatMarkdownOverviewSection(summary, allFiles.size),
    ...formatBlockingPolicySection(blockingFindings.length),
    ...formatTriageQueueSection(triageRows),
    ...formatBreakdownSections(summary),
    ...formatSignalByRuleSection(fallowRuleRows, reactDoctorRuleRows),
    ...formatTopFilesSection(topFileRows),
    ...formatSharedHotspotsSection(summary, sharedFindings),
    ...formatToolSpecificSection(summary),
    ...formatFallowAffectedFilesSection(fallowFindings),
    ...formatReactDoctorDiagnosticsSection(reactDoctorFindings),
    ...formatCommandExecutionSection(summary, elapsedMs, options),
    "",
  ].join("\n");
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @param {number} allFileCount Combined affected file count.
 * @returns {string[]} Markdown section lines.
 */
function formatMarkdownOverviewSection(summary, allFileCount) {
  return [
    "",
    "## Overview",
    "",
    renderMarkdownBullets(getMarkdownOverview(summary, allFileCount)),
    "",
  ];
}

/**
 * @param {number} blockingCandidateCount Blocking candidate count.
 * @returns {string[]} Markdown section lines.
 */
function formatBlockingPolicySection(blockingCandidateCount) {
  return [
    "## Calibrated Blocking Policy",
    "",
    renderMarkdownBullets(getBlockingPolicyLines(blockingCandidateCount)),
    "",
  ];
}

/**
 * @param {TriageRow[]} triageRows Triage rows.
 * @returns {string[]} Markdown section lines.
 */
function formatTriageQueueSection(triageRows) {
  return [
    "## Triage Queue",
    "",
    triageRows.length === 0
      ? "No triage rows were produced."
      : renderMarkdownTable(
          ["Priority", "File", "Why", "Sources", "Top Rules"],
          triageRows.map(formatTriageTableRow),
        ),
    "",
  ];
}

/**
 * @param {TriageRow} row Triage row.
 * @returns {string[]} Markdown table row.
 */
function formatTriageTableRow(row) {
  return [
    formatTriagePriority(row),
    row.filePath,
    row.reasons.join("; "),
    row.sources.join(", "),
    formatTopRules(row.findings),
  ];
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @returns {string[]} Markdown section lines.
 */
function formatBreakdownSections(summary) {
  return [
    "## Fallow Breakdown",
    "",
    renderMarkdownBullets(getFallowBreakdownLines(summary.fallow)),
    "",
    "## React Doctor Breakdown",
    "",
    renderMarkdownBullets(getReactDoctorBreakdownLines(summary.reactDoctor)),
    "",
  ];
}

/**
 * @param {RuleCountRow[]} fallowRuleRows Fallow rule rows.
 * @param {RuleCountRow[]} reactDoctorRuleRows React Doctor rule rows.
 * @returns {string[]} Markdown section lines.
 */
function formatSignalByRuleSection(fallowRuleRows, reactDoctorRuleRows) {
  return [
    "## Signal By Rule",
    "",
    "Fallow:",
    "",
    formatRuleCountTable(
      fallowRuleRows,
      "No Fallow rules reported affected files.",
    ),
    "",
    "React Doctor:",
    "",
    formatRuleCountTable(
      reactDoctorRuleRows,
      "No React Doctor rules reported diagnostics.",
    ),
    "",
  ];
}

/**
 * @param {RuleCountRow[]} rows Rule rows.
 * @param {string} emptyText Empty-state text.
 * @returns {string} Markdown table or empty state.
 */
function formatRuleCountTable(rows, emptyText) {
  return rows.length === 0
    ? emptyText
    : renderMarkdownTable(
        ["Rule", "Findings", "Category", "Severity"],
        rows.map(formatRuleCountTableRow),
      );
}

/**
 * @param {RuleCountRow} row Rule count row.
 * @returns {string[]} Markdown table row.
 */
function formatRuleCountTableRow(row) {
  return [
    row.rule,
    formatNumber(row.count),
    row.categories.join(", "),
    row.severities.join(", "),
  ];
}

/**
 * @param {FindingCountRow[]} topFileRows Top file rows.
 * @returns {string[]} Markdown section lines.
 */
function formatTopFilesSection(topFileRows) {
  return [
    "## Top Files By Combined Signal",
    "",
    renderMarkdownTable(
      ["File", "Findings", "Sources"],
      topFileRows.map(formatFindingCountTableRow),
    ),
    "",
  ];
}

/**
 * @param {FindingCountRow} row Finding count row.
 * @returns {string[]} Markdown table row.
 */
function formatFindingCountTableRow(row) {
  return [row.filePath, formatNumber(row.count), row.sources.join(", ")];
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @param {NormalizedFinding[]} sharedFindings Shared hotspot findings.
 * @returns {string[]} Markdown section lines.
 */
function formatSharedHotspotsSection(summary, sharedFindings) {
  return [
    "## Shared Hotspots",
    "",
    summary.sharedHotspots.length === 0
      ? "No files were reported by both Fallow and React Doctor."
      : renderMarkdownBullets(summary.sharedHotspots.map(formatCodeValue)),
    "",
    "## Shared Hotspot Findings",
    "",
    formatFindingsTable(
      sharedFindings,
      ["Source", "Severity", "Category", "Rule", "File", "Message"],
      formatSharedFindingTableRow,
      "No shared hotspot findings were available.",
    ),
    "",
  ];
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @returns {string[]} Markdown section lines.
 */
function formatToolSpecificSection(summary) {
  return [
    "## Tool-Specific Blind Spots",
    "",
    "Fallow-only files:",
    "",
    renderMarkdownBullets(
      formatOptionalCodeValues(summary.toolSpecific.fallowOnly),
    ),
    "",
    "React Doctor-only files:",
    "",
    renderMarkdownBullets(
      formatOptionalCodeValues(summary.toolSpecific.reactDoctorOnly),
    ),
    "",
  ];
}

/**
 * @param {string[]} values Code values.
 * @returns {string[]} Formatted values or empty-state line.
 */
function formatOptionalCodeValues(values) {
  return values.length === 0 ? ["None."] : values.map(formatCodeValue);
}

/**
 * @param {NormalizedFinding[]} fallowFindings Fallow findings.
 * @returns {string[]} Markdown section lines.
 */
function formatFallowAffectedFilesSection(fallowFindings) {
  return [
    "## Fallow Affected Files",
    "",
    fallowFindings.length === 0
      ? "Fallow did not report affected files."
      : renderMarkdownBullets(
          sortFindings(fallowFindings).map(formatFallowAffectedFileLine),
        ),
    "",
  ];
}

/**
 * @param {NormalizedFinding} finding Finding.
 * @returns {string} Markdown bullet line.
 */
function formatFallowAffectedFileLine(finding) {
  return `${finding.category}: ${formatCodeValue(finding.filePath)}`;
}

/**
 * @param {NormalizedFinding[]} reactDoctorFindings React Doctor findings.
 * @returns {string[]} Markdown section lines.
 */
function formatReactDoctorDiagnosticsSection(reactDoctorFindings) {
  return [
    "## React Doctor Diagnostics",
    "",
    formatFindingsTable(
      reactDoctorFindings,
      ["Severity", "Category", "Rule", "File", "Message"],
      formatReactDoctorFindingTableRow,
      "React Doctor did not report diagnostics.",
    ),
    "",
  ];
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @param {number} elapsedMs Elapsed time.
 * @param {CliOptions} options CLI options.
 * @returns {string[]} Markdown section lines.
 */
function formatCommandExecutionSection(summary, elapsedMs, options) {
  return [
    "## Command Execution Summary",
    "",
    renderMarkdownBullets(
      getQualityCommandSummary(summary, elapsedMs, options),
    ),
  ];
}

/**
 * @param {NormalizedFinding[]} findings Findings.
 * @param {string[]} headers Table headers.
 * @param {(finding: NormalizedFinding) => string[]} formatRow Row formatter.
 * @param {string} emptyText Empty-state text.
 * @returns {string} Markdown table or empty state.
 */
function formatFindingsTable(findings, headers, formatRow, emptyText) {
  return findings.length === 0
    ? emptyText
    : renderMarkdownTable(headers, sortFindings(findings).map(formatRow));
}

/**
 * @param {NormalizedFinding} finding Finding.
 * @returns {string[]} Markdown table row.
 */
function formatSharedFindingTableRow(finding) {
  return [
    finding.source,
    finding.severity,
    finding.category,
    finding.rule,
    finding.filePath,
    finding.message,
  ];
}

/**
 * @param {NormalizedFinding} finding Finding.
 * @returns {string[]} Markdown table row.
 */
function formatReactDoctorFindingTableRow(finding) {
  return [
    finding.severity,
    finding.category,
    finding.rule,
    finding.filePath,
    finding.message,
  ];
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @param {number} allFileCount Combined affected file count.
 * @returns {string[]} Overview bullets.
 */
function getMarkdownOverview(summary, allFileCount) {
  return [
    `Fallow: ${formatNumber(
      summary.fallow.totalFindings,
    )} repo-health findings across ${formatNumber(
      summary.fallow.files.size,
    )} files.`,
    `React Doctor: ${formatNumber(
      summary.reactDoctor.diagnostics,
    )} React diagnostics across ${formatNumber(
      summary.reactDoctor.affectedFiles.size,
    )} files.`,
    `Combined signal: ${formatNumber(
      summary.fallow.totalFindings + summary.reactDoctor.diagnostics,
    )} findings across ${formatNumber(allFileCount)} files.`,
    `Shared hotspots: ${formatNumber(
      summary.sharedHotspots.length,
    )} files were reported by both engines.`,
  ];
}

/**
 * @param {number} blockingCandidateCount Blocking candidate count.
 * @returns {string[]} Blocking policy bullets.
 */
function getBlockingPolicyLines(blockingCandidateCount) {
  return [
    `Current mode: ${
      shouldBlock
        ? "blocking enabled through QUALITY_INTELLIGENCE_BLOCKING=true"
        : "advisory; set QUALITY_INTELLIGENCE_BLOCKING=true to fail on calibrated blockers"
    }.`,
    `Blocking candidates in this run: ${formatNumber(blockingCandidateCount)}.`,
    `Blocks on: Fallow structural complexity plus ${getReactDoctorBlockingPolicyText()}.`,
    `Advisory only: CRAP coverage risk, duplication, broad performance advice such as ${[
      ...ADVISORY_REACT_DOCTOR_RULES,
    ]
      .map(formatCodeValue)
      .join(", ")}.`,
  ];
}

/**
 * @param {FallowSummary} fallow Fallow summary.
 * @returns {string[]} Fallow breakdown bullets.
 */
function getFallowBreakdownLines(fallow) {
  return [
    `Cleanup issues: ${formatNumber(fallow.cleanupIssues)}`,
    `Clone groups: ${formatNumber(fallow.cloneGroups)}`,
    `Structural complexity: ${formatNumber(fallow.structuralComplexity)}`,
    `Coverage risk / CRAP: ${formatNumber(fallow.crapRisk)}`,
    `Refactor targets: ${formatNumber(fallow.refactorTargets)}`,
    `Affected files: ${formatNumber(fallow.files.size)}`,
  ];
}

/**
 * @param {ReactDoctorSummary} reactDoctor React Doctor summary.
 * @returns {string[]} React Doctor breakdown bullets.
 */
function getReactDoctorBreakdownLines(reactDoctor) {
  return [
    `Diagnostics: ${formatNumber(reactDoctor.diagnostics)}`,
    `Errors: ${formatNumber(reactDoctor.errors)}`,
    `Warnings: ${formatNumber(reactDoctor.warnings)}`,
    `Affected files: ${formatNumber(reactDoctor.affectedFiles.size)}`,
  ];
}

/**
 * @typedef {{ count: number; filePath: string; sources: string[] }} FindingCountRow
 */

/**
 * @param {NormalizedFinding[]} findings Findings.
 * @returns {FindingCountRow[]} Finding count rows.
 */
function getFindingCountRows(findings) {
  /** @type {Map<string, { count: number; sources: Set<string> }>} */
  const counts = new Map();

  for (const finding of findings) {
    const current = getOrCreateMapEntry(counts, finding.filePath, () => ({
      count: 0,
      sources: new Set(),
    }));

    current.count += 1;
    current.sources.add(finding.source);
  }

  return [...counts.entries()]
    .map(([filePath, value]) => ({
      count: value.count,
      filePath,
      sources: [...value.sources].sort(compareStrings),
    }))
    .sort(
      (left, right) =>
        right.count - left.count || left.filePath.localeCompare(right.filePath),
    );
}

/**
 * @param {NormalizedFinding[]} findings Findings.
 * @returns {NormalizedFinding[]} Sorted findings.
 */
function sortFindings(findings) {
  return [...findings].sort(
    (left, right) =>
      left.filePath.localeCompare(right.filePath) ||
      left.source.localeCompare(right.source) ||
      left.severity.localeCompare(right.severity) ||
      left.rule.localeCompare(right.rule),
  );
}

/**
 * @typedef {{ categories: string[]; count: number; rule: string; severities: string[] }} RuleCountRow
 */

/**
 * @param {NormalizedFinding[]} findings Findings.
 * @returns {RuleCountRow[]} Counts grouped by rule.
 */
function getRuleCountRows(findings) {
  /** @type {Map<string, { categories: Set<string>; count: number; severities: Set<string> }>} */
  const counts = new Map();

  for (const finding of findings) {
    const current = getOrCreateMapEntry(counts, finding.rule, () => ({
      categories: new Set(),
      count: 0,
      severities: new Set(),
    }));

    current.count += 1;
    current.categories.add(finding.category);
    current.severities.add(finding.severity);
  }

  return [...counts.entries()]
    .map(([rule, row]) => ({
      categories: [...row.categories].sort(compareStrings),
      count: row.count,
      rule,
      severities: [...row.severities].sort(compareStrings),
    }))
    .sort(
      (left, right) =>
        right.count - left.count || left.rule.localeCompare(right.rule),
    );
}

/**
 * @template T
 * @param {Map<string, T>} map Map to read from.
 * @param {string} key Entry key.
 * @param {() => T} createValue Factory for missing entries.
 * @returns {T} Existing or newly stored entry.
 */
function getOrCreateMapEntry(map, key, createValue) {
  const current = map.get(key);

  if (current) {
    return current;
  }

  const next = createValue();
  map.set(key, next);
  return next;
}

/**
 * @param {QualitySummary} summary Summary.
 * @returns {NormalizedFinding[]} Calibrated blocking candidates.
 */
function getBlockingFindings(summary) {
  return summary.findings.filter(isBlockingFinding);
}

/**
 * @param {NormalizedFinding} finding Finding.
 * @returns {boolean} Whether this finding is allowed to fail the command.
 */
function isBlockingFinding(finding) {
  if (finding.source === "fallow") {
    return finding.category === "structural complexity";
  }

  return isReactDoctorBlockingSignal(finding);
}

/**
 * @param {QualitySummary} summary Summary.
 * @returns {TriageRow[]} Prioritized triage rows.
 */
function getTriageRows(summary) {
  /** @type {Map<string, NormalizedFinding[]>} */
  const byFile = new Map();

  for (const finding of summary.findings) {
    const findings = byFile.get(finding.filePath) ?? [];

    findings.push(finding);
    byFile.set(finding.filePath, findings);
  }

  return [...byFile.entries()]
    .map(([filePath, findings]) =>
      createTriageRow(filePath, findings, summary.sharedHotspots),
    )
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        right.findings.length - left.findings.length ||
        left.filePath.localeCompare(right.filePath),
    );
}

/**
 * @param {string} filePath File path.
 * @param {NormalizedFinding[]} findings Findings for the file.
 * @param {string[]} sharedHotspots Shared hotspot paths.
 * @returns {TriageRow} Triage row.
 */
function createTriageRow(filePath, findings, sharedHotspots) {
  const sources = [...new Set(findings.map((finding) => finding.source))].sort(
    compareStrings,
  );
  const reasons = getTriageReasons(filePath, findings, sharedHotspots);

  return {
    filePath,
    findings,
    priority: getTriagePriority(findings, reasons),
    reasons,
    sources,
  };
}

/**
 * @param {string} filePath File path.
 * @param {NormalizedFinding[]} findings Findings for the file.
 * @param {string[]} sharedHotspots Shared hotspot paths.
 * @returns {string[]} Triage reasons.
 */
function getTriageReasons(filePath, findings, sharedHotspots) {
  const reasons = [
    getReasonIf(findings.some(isBlockingFinding), "blocking candidate"),
    getReasonIf(sharedHotspots.includes(filePath), "shared hotspot"),
    getReasonIf(
      hasFallowFindingCategory(findings, "structural complexity"),
      "structural complexity",
    ),
    getReasonIf(hasFindingCategory(findings, "Security"), "security"),
    getReasonIf(hasFindingCategory(findings, "duplication"), "duplication"),
    getReasonIf(
      findings.length >= 4,
      `${formatNumber(findings.length)} findings`,
    ),
  ].filter((reason) => reason !== null);

  return reasons.length > 0 ? reasons : ["single-tool review"];
}

/**
 * @param {boolean} condition Condition.
 * @param {string} reason Reason.
 * @returns {string | null} Reason when condition is true.
 */
function getReasonIf(condition, reason) {
  return condition ? reason : null;
}

/**
 * @param {NormalizedFinding[]} findings Findings.
 * @param {string} category Category.
 * @returns {boolean} Whether any finding has this category.
 */
function hasFindingCategory(findings, category) {
  return findings.some((finding) => finding.category === category);
}

/**
 * @param {NormalizedFinding[]} findings Findings.
 * @param {string} category Category.
 * @returns {boolean} Whether any Fallow finding has this category.
 */
function hasFallowFindingCategory(findings, category) {
  return findings.some(
    (finding) => finding.source === "fallow" && finding.category === category,
  );
}

/**
 * @param {NormalizedFinding[]} findings Findings for a file.
 * @param {string[]} reasons Triage reasons.
 * @returns {number} Numeric priority.
 */
function getTriagePriority(findings, reasons) {
  return (
    findings.length +
    (reasons.includes("blocking candidate") ? 1_000 : 0) +
    (reasons.includes("shared hotspot") ? 500 : 0) +
    (reasons.includes("security") ? 300 : 0) +
    (reasons.includes("structural complexity") ? 200 : 0)
  );
}

/**
 * @param {TriageRow} row Triage row.
 * @returns {string} Priority label.
 */
function formatTriagePriority(row) {
  if (row.reasons.includes("blocking candidate")) {
    return "P0";
  }

  if (row.reasons.includes("shared hotspot")) {
    return "P1";
  }

  if (row.findings.length >= 3) {
    return "P2";
  }

  return "P3";
}

/**
 * @param {NormalizedFinding[]} findings Findings.
 * @returns {string} Top rule summary.
 */
function formatTopRules(findings) {
  return getRuleCountRows(findings)
    .slice(0, 3)
    .map((row) => `${row.rule} (${formatNumber(row.count)})`)
    .join(", ");
}

/**
 * @param {string[]} items Summary items.
 * @returns {string} Markdown bullets.
 */
function renderMarkdownBullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

/**
 * @param {string} value Value.
 * @returns {string} Markdown inline code value.
 */
function formatCodeValue(value) {
  return `\`${value}\``;
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @param {number} elapsedMs Elapsed time.
 * @param {CliOptions} options CLI options.
 * @returns {string[]} Run summary bullets.
 */
function getQualityCommandSummary(summary, elapsedMs, options) {
  const blockingFindings = getBlockingFindings(summary);

  return [
    `Command: \`node scripts/quality/intelligence.mjs ${options.mode}\``,
    `Mode: ${options.mode}`,
    `Exit status: ${shouldFail(summary) ? "1" : "0"}`,
    `Blocking: ${shouldBlock ? "enabled" : "disabled; advisory report"}`,
    `Calibrated blocking candidates: ${formatNumber(blockingFindings.length)}`,
    `Duration: ${formatDuration(elapsedMs)}`,
    `Artifacts: \`${toRepoRelativePath(
      path.join(options.reportDir, "quality-intelligence.md"),
    )}\` and \`${toRepoRelativePath(SUMMARY_PATH)}\``,
  ];
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @param {number} elapsedMs Elapsed time.
 */
function printSummary(summary, elapsedMs) {
  const allFiles = new Set([
    ...summary.fallow.files,
    ...summary.reactDoctor.affectedFiles,
  ]);
  const triageRows = getTriageRows(summary).slice(0, 6);
  const hasReviewSignal =
    summary.fallow.totalFindings > 0 || summary.reactDoctor.diagnostics > 0;

  process.stdout.write(`${sectionTitle("Quality Intelligence")}\n`);
  process.stdout.write(
    `${formatStatusBadge(hasReviewSignal ? "review" : "pass")} ${formatNumber(
      summary.fallow.totalFindings + summary.reactDoctor.diagnostics,
    )} findings across ${formatNumber(allFiles.size)} files\n`,
  );
  process.stdout.write(
    `${renderKeyValues(getConsoleSummaryRows(summary, elapsedMs))}\n`,
  );

  if (triageRows.length > 0) {
    process.stdout.write(`\n${colorText("Review first", "accent")}\n`);
    process.stdout.write(
      `${renderBullets(triageRows.map(formatTriageSummary), 6)}\n`,
    );
  }
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @param {number} elapsedMs Elapsed time.
 * @returns {{ label: string; tone?: "success" | "warning"; value: string }[]} Console summary rows.
 */
function getConsoleSummaryRows(summary, elapsedMs) {
  const blockingFindings = getBlockingFindings(summary);

  return [
    {
      label: "Fallow",
      tone: summary.fallow.structuralComplexity > 0 ? "warning" : "success",
      value: `${formatNumber(summary.fallow.totalFindings)} findings / ${formatNumber(
        summary.fallow.files.size,
      )} files (${formatNumber(
        summary.fallow.cleanupIssues,
      )} cleanup, ${formatNumber(
        summary.fallow.cloneGroups,
      )} clone groups, ${formatNumber(
        summary.fallow.structuralComplexity,
      )} structural, ${formatNumber(summary.fallow.crapRisk)} CRAP)`,
    },
    {
      label: "React Doctor",
      tone: summary.reactDoctor.errors > 0 ? "warning" : "success",
      value: `${formatNumber(
        summary.reactDoctor.diagnostics,
      )} diagnostics / ${formatNumber(
        summary.reactDoctor.affectedFiles.size,
      )} files (${formatNumber(summary.reactDoctor.errors)} errors, ${formatNumber(
        summary.reactDoctor.warnings,
      )} warnings)`,
    },
    {
      label: "Shared hotspots",
      tone: summary.sharedHotspots.length > 0 ? "warning" : "success",
      value: `${formatNumber(summary.sharedHotspots.length)} files reported by both engines`,
    },
    {
      label: "Block candidates",
      tone: blockingFindings.length > 0 ? "warning" : "success",
      value: `${formatNumber(blockingFindings.length)} calibrated candidates (${shouldBlock ? "blocking" : "advisory"})`,
    },
    {
      label: "Elapsed",
      value: formatDuration(elapsedMs),
    },
  ];
}

/**
 * @param {TriageRow} row Triage row.
 * @returns {string} Console triage summary.
 */
function formatTriageSummary(row) {
  return `${formatTriagePriority(row)} ${row.filePath} (${row.reasons.join(
    "; ",
  )})`;
}

/**
 * @param {number} value Number value.
 * @returns {string} Locale-formatted number.
 */
function formatNumber(value) {
  return numberFormatter.format(value);
}

/**
 * @param {QualitySummary} summary Quality summary.
 * @returns {boolean} Whether calibrated blocking should fail.
 */
function shouldFail(summary) {
  return shouldBlock && getBlockingFindings(summary).length > 0;
}

/**
 * Runs the quality intelligence pipeline.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const startedAt = performance.now();
  const options = parseArgs(process.argv.slice(2));

  await Promise.all([
    ensureDirectory(options.reportDir),
    ensureDirectory(options.tempDir),
  ]);

  const [fallowResults, reactDoctorPayload] = await Promise.all([
    Promise.all(FALLOW_ANALYSES.map(runFallowAnalysis)),
    runReactDoctor(options),
  ]);
  const summary = createQualitySummary(fallowResults, reactDoctorPayload);
  const elapsedMs = performance.now() - startedAt;
  const reportPath = path.join(options.reportDir, "quality-intelligence.md");

  await Promise.all([
    writeTextFile(
      reportPath,
      formatMarkdownReport(summary, elapsedMs, options),
    ),
    writeJsonFile(SUMMARY_PATH, {
      blocking: {
        candidates: getBlockingFindings(summary),
        enabled: shouldBlock,
        shouldFail: shouldFail(summary),
      },
      fallow: {
        ...summary.fallow,
        files: [...summary.fallow.files],
      },
      reactDoctor: {
        ...summary.reactDoctor,
        affectedFiles: [...summary.reactDoctor.affectedFiles],
      },
      sharedHotspots: summary.sharedHotspots,
      toolSpecific: summary.toolSpecific,
      triageQueue: getTriageRows(summary).slice(0, 50),
    }),
  ]);

  if (!options.quiet) {
    printSummary(summary, elapsedMs);
    const reportArtifacts = [
      toRepoRelativePath(reportPath),
      toRepoRelativePath(SUMMARY_PATH),
      ...(summary.reactDoctor.diagnostics > 0
        ? ["reports/react-doctor.md"]
        : []),
    ];

    process.stdout.write(
      `\n${colorText("Artifacts", "accent")}\n${renderBullets(reportArtifacts)}\n`,
    );
  }

  if (shouldFail(summary)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(
    `Quality intelligence failed: ${
      error instanceof Error ? error.message : String(error)
    }\n`,
  );
  process.exit(1);
});
