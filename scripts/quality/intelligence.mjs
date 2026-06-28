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
    const arg = argv[index];

    if (isMode(arg)) {
      options.mode = arg;
      continue;
    }

    if (arg === "--quiet") {
      options.quiet = true;
      continue;
    }

    if (arg === "--report-dir") {
      options.reportDir = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--temp-dir") {
      options.tempDir = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith("--report-dir=")) {
      options.reportDir = arg.slice("--report-dir=".length);
      continue;
    }

    if (arg.startsWith("--temp-dir=")) {
      options.tempDir = arg.slice("--temp-dir=".length);
      continue;
    }

    throw new Error(`Unknown quality-intelligence argument: ${arg}`);
  }

  return options;
}

/**
 * @param {string} value Candidate mode.
 * @returns {value is QualityMode} Whether the value is a supported mode.
 */
function isMode(value) {
  return ["context", "local", "pr", "release"].includes(value);
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
  /** @type {NormalizedFinding[]} */
  const findings = [];

  for (const [key, value] of Object.entries(payload)) {
    if (!Array.isArray(value) || !isDeadCodeFindingKey(key)) {
      continue;
    }

    for (const item of value) {
      if (!isRecord(item)) {
        continue;
      }

      const filePath = getFallowFilePath(item);

      if (!filePath) {
        continue;
      }

      findings.push({
        category: "dead code",
        filePath,
        message: formatDeadCodeMessage(key, item),
        rule: `dead-code/${formatRuleName(key)}`,
        severity: getDeadCodeSeverity(key),
        source: "fallow",
      });
    }
  }

  return findings;
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
  const projectDirectory =
    typeof project.directory === "string" ? project.directory : ROOT;
  const rawFilePath =
    typeof diagnostic.filePath === "string" ? diagnostic.filePath : "unknown";
  const plugin =
    typeof diagnostic.plugin === "string" ? diagnostic.plugin : "unknown";
  const rule =
    typeof diagnostic.rule === "string" ? diagnostic.rule : "unknown";

  return {
    category:
      typeof diagnostic.category === "string"
        ? diagnostic.category
        : "Uncategorized",
    filePath: toRepoRelativePath(rawFilePath, projectDirectory),
    message:
      typeof diagnostic.title === "string"
        ? diagnostic.title
        : getString(diagnostic.message, "React Doctor finding"),
    rule: `${plugin}/${rule}`,
    severity:
      typeof diagnostic.severity === "string" ? diagnostic.severity : "review",
    source: "react-doctor",
  };
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
    "",
    "## Overview",
    "",
    renderMarkdownBullets([
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
      )} findings across ${formatNumber(allFiles.size)} files.`,
      `Shared hotspots: ${formatNumber(
        summary.sharedHotspots.length,
      )} files were reported by both engines.`,
    ]),
    "",
    "## Calibrated Blocking Policy",
    "",
    renderMarkdownBullets([
      `Current mode: ${
        shouldBlock
          ? "blocking enabled through QUALITY_INTELLIGENCE_BLOCKING=true"
          : "advisory; set QUALITY_INTELLIGENCE_BLOCKING=true to fail on calibrated blockers"
      }.`,
      `Blocking candidates in this run: ${formatNumber(
        blockingFindings.length,
      )}.`,
      `Blocks on: Fallow structural complexity plus ${getReactDoctorBlockingPolicyText()}.`,
      `Advisory only: CRAP coverage risk, duplication, broad performance advice such as ${[
        ...ADVISORY_REACT_DOCTOR_RULES,
      ]
        .map(formatCodeValue)
        .join(", ")}.`,
    ]),
    "",
    "## Triage Queue",
    "",
    triageRows.length === 0
      ? "No triage rows were produced."
      : renderMarkdownTable(
          ["Priority", "File", "Why", "Sources", "Top Rules"],
          triageRows.map((row) => [
            formatTriagePriority(row),
            row.filePath,
            row.reasons.join("; "),
            row.sources.join(", "),
            formatTopRules(row.findings),
          ]),
        ),
    "",
    "## Fallow Breakdown",
    "",
    renderMarkdownBullets([
      `Cleanup issues: ${formatNumber(summary.fallow.cleanupIssues)}`,
      `Clone groups: ${formatNumber(summary.fallow.cloneGroups)}`,
      `Structural complexity: ${formatNumber(
        summary.fallow.structuralComplexity,
      )}`,
      `Coverage risk / CRAP: ${formatNumber(summary.fallow.crapRisk)}`,
      `Refactor targets: ${formatNumber(summary.fallow.refactorTargets)}`,
      `Affected files: ${formatNumber(summary.fallow.files.size)}`,
    ]),
    "",
    "## React Doctor Breakdown",
    "",
    renderMarkdownBullets([
      `Diagnostics: ${formatNumber(summary.reactDoctor.diagnostics)}`,
      `Errors: ${formatNumber(summary.reactDoctor.errors)}`,
      `Warnings: ${formatNumber(summary.reactDoctor.warnings)}`,
      `Affected files: ${formatNumber(summary.reactDoctor.affectedFiles.size)}`,
    ]),
    "",
    "## Signal By Rule",
    "",
    "Fallow:",
    "",
    fallowRuleRows.length === 0
      ? "No Fallow rules reported affected files."
      : renderMarkdownTable(
          ["Rule", "Findings", "Category", "Severity"],
          fallowRuleRows.map((row) => [
            row.rule,
            formatNumber(row.count),
            row.categories.join(", "),
            row.severities.join(", "),
          ]),
        ),
    "",
    "React Doctor:",
    "",
    reactDoctorRuleRows.length === 0
      ? "No React Doctor rules reported diagnostics."
      : renderMarkdownTable(
          ["Rule", "Findings", "Category", "Severity"],
          reactDoctorRuleRows.map((row) => [
            row.rule,
            formatNumber(row.count),
            row.categories.join(", "),
            row.severities.join(", "),
          ]),
        ),
    "",
    "## Top Files By Combined Signal",
    "",
    renderMarkdownTable(
      ["File", "Findings", "Sources"],
      topFileRows.map((row) => [
        row.filePath,
        formatNumber(row.count),
        row.sources.join(", "),
      ]),
    ),
    "",
    "## Shared Hotspots",
    "",
    summary.sharedHotspots.length === 0
      ? "No files were reported by both Fallow and React Doctor."
      : renderMarkdownBullets(summary.sharedHotspots.map(formatCodeValue)),
    "",
    "## Shared Hotspot Findings",
    "",
    sharedFindings.length === 0
      ? "No shared hotspot findings were available."
      : renderMarkdownTable(
          ["Source", "Severity", "Category", "Rule", "File", "Message"],
          sortFindings(sharedFindings).map((finding) => [
            finding.source,
            finding.severity,
            finding.category,
            finding.rule,
            finding.filePath,
            finding.message,
          ]),
        ),
    "",
    "## Tool-Specific Blind Spots",
    "",
    "Fallow-only files:",
    "",
    renderMarkdownBullets(
      summary.toolSpecific.fallowOnly.length === 0
        ? ["None."]
        : summary.toolSpecific.fallowOnly.map(formatCodeValue),
    ),
    "",
    "React Doctor-only files:",
    "",
    renderMarkdownBullets(
      summary.toolSpecific.reactDoctorOnly.length === 0
        ? ["None."]
        : summary.toolSpecific.reactDoctorOnly.map(formatCodeValue),
    ),
    "",
    "## Fallow Affected Files",
    "",
    fallowFindings.length === 0
      ? "Fallow did not report affected files."
      : renderMarkdownBullets(
          sortFindings(fallowFindings).map(
            (finding) =>
              `${finding.category}: ${formatCodeValue(finding.filePath)}`,
          ),
        ),
    "",
    "## React Doctor Diagnostics",
    "",
    reactDoctorFindings.length === 0
      ? "React Doctor did not report diagnostics."
      : renderMarkdownTable(
          ["Severity", "Category", "Rule", "File", "Message"],
          sortFindings(reactDoctorFindings).map((finding) => [
            finding.severity,
            finding.category,
            finding.rule,
            finding.filePath,
            finding.message,
          ]),
        ),
    "",
    "## Command Execution Summary",
    "",
    renderMarkdownBullets(
      getQualityCommandSummary(summary, elapsedMs, options),
    ),
    "",
  ].join("\n");
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
    const current = counts.get(finding.filePath) ?? {
      count: 0,
      sources: new Set(),
    };

    current.count += 1;
    current.sources.add(finding.source);
    counts.set(finding.filePath, current);
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
    const current = counts.get(finding.rule) ?? {
      categories: new Set(),
      count: 0,
      severities: new Set(),
    };

    current.count += 1;
    current.categories.add(finding.category);
    current.severities.add(finding.severity);
    counts.set(finding.rule, current);
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
  const reasons = [];

  if (findings.some(isBlockingFinding)) {
    reasons.push("blocking candidate");
  }

  if (sharedHotspots.includes(filePath)) {
    reasons.push("shared hotspot");
  }

  if (
    findings.some(
      (finding) =>
        finding.source === "fallow" &&
        finding.category === "structural complexity",
    )
  ) {
    reasons.push("structural complexity");
  }

  if (findings.some((finding) => finding.category === "Security")) {
    reasons.push("security");
  }

  if (findings.some((finding) => finding.category === "duplication")) {
    reasons.push("duplication");
  }

  if (findings.length >= 4) {
    reasons.push(`${formatNumber(findings.length)} findings`);
  }

  return reasons.length > 0 ? reasons : ["single-tool review"];
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
  const blockingFindings = getBlockingFindings(summary);
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
    `${renderKeyValues([
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
    ])}\n`,
  );

  if (triageRows.length > 0) {
    process.stdout.write(`\n${colorText("Review first", "accent")}\n`);
    process.stdout.write(
      `${renderBullets(
        triageRows.map(
          (row) =>
            `${formatTriagePriority(row)} ${row.filePath} (${row.reasons.join(
              "; ",
            )})`,
        ),
        6,
      )}\n`,
    );
  }
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
