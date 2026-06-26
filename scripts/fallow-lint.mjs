// @ts-check

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * @typedef {Record<string, any>} FallowJsonPayload
 *
 * @typedef {object} FallowAnalysis
 * @property {string[]} args Fallow command arguments.
 * @property {string} label Human-readable analysis label.
 *
 * @typedef {object} FallowRunResult
 * @property {string} label Human-readable analysis label.
 * @property {FallowJsonPayload} payload Parsed JSON payload.
 * @property {number | null} status Process exit status.
 *
 * @typedef {(string | number | null | undefined)[]} TableRow
 */

const shouldFailOnFindings = process.env.FALLOW_FAIL_ON_FINDINGS === "true";
/** @type {FallowAnalysis[]} */
const analyses = [
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
const localEntrypoint = path.join(
  process.cwd(),
  "node_modules",
  "fallow",
  "bin",
  "fallow",
);
const hasLocalEntrypoint = existsSync(localEntrypoint);
const command = hasLocalEntrypoint ? process.execPath : "fallow";
const numberFormatter = new Intl.NumberFormat("en-US");

/**
 * @param {unknown} value Value to parse.
 * @returns {number} Finite number or zero.
 */
function asNumber(value) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * @param {unknown} value Array-like count source.
 * @returns {number} Array length or numeric value.
 */
function countList(value) {
  return Array.isArray(value) ? value.length : asNumber(value);
}

/**
 * Handles Fallow health envelopes that expose findings as either `findings`
 * or `results` depending on CLI version/schema.
 *
 * @param {FallowJsonPayload} healthPayload Health payload.
 * @returns {number} Normalized complexity finding count.
 */
function countHealthFindings(healthPayload) {
  return Math.max(
    countList(healthPayload.findings),
    countList(healthPayload.results),
  );
}

/**
 * @param {FallowJsonPayload} payload Fallow payload.
 * @param {string[]} keys Keys to sum.
 * @returns {number} Total count.
 */
function sumCounts(payload, keys) {
  return keys.reduce((total, key) => total + countList(payload?.[key]), 0);
}

/**
 * @param {unknown} value Number-like value.
 * @returns {string} Locale-formatted number.
 */
function formatNumber(value) {
  return numberFormatter.format(asNumber(value));
}

/**
 * @param {unknown} value Number-like value.
 * @param {number} [digits=1] Fraction digits.
 * @returns {string} Fixed decimal string.
 */
function formatDecimal(value, digits = 1) {
  return asNumber(value).toFixed(digits);
}

/**
 * @param {unknown} value Percent-like value.
 * @returns {string} Formatted percentage.
 */
function formatPercent(value) {
  return `${formatDecimal(value)}%`;
}

/**
 * @param {unknown} value Millisecond-like value.
 * @returns {string} Formatted duration.
 */
function formatMillis(value) {
  return `${formatNumber(value)} ms`;
}

/**
 * @param {unknown} value Count value.
 * @param {number} focusAt Threshold for focus status.
 * @returns {"ok" | "review" | "focus"} Quality status.
 */
function qualityForCount(value, focusAt) {
  const count = asNumber(value);

  if (count === 0) {
    return "ok";
  }

  return count >= focusAt ? "focus" : "review";
}

/**
 * @param {unknown} value Percent value.
 * @param {number} focusAt Threshold for focus status.
 * @returns {"ok" | "review" | "focus"} Quality status.
 */
function qualityForPercent(value, focusAt) {
  const percent = asNumber(value);

  if (percent === 0) {
    return "ok";
  }

  return percent >= focusAt ? "focus" : "review";
}

/**
 * @param {unknown} score Health score.
 * @returns {"ok" | "review" | "focus"} Quality status.
 */
function qualityForHealthScore(score) {
  const value = asNumber(score);

  if (value >= 85) {
    return "ok";
  }

  return value >= 70 ? "review" : "focus";
}

/**
 * @param {TableRow[number]} value Cell value.
 * @returns {string} Printable table cell.
 */
function normalizeCell(value) {
  return String(value ?? "-");
}

/**
 * @param {TableRow} headers Table headers.
 * @param {TableRow[]} rows Table rows.
 * @returns {string} Rendered ASCII table.
 */
function renderTable(headers, rows) {
  const normalizedRows = rows.map((row) => row.map(normalizeCell));
  const normalizedHeaders = headers.map(normalizeCell);
  const widths = normalizedHeaders.map((header, columnIndex) =>
    Math.max(
      header.length,
      ...normalizedRows.map((row) => row[columnIndex]?.length ?? 0),
    ),
  );
  const separator = `+-${widths.map((width) => "-".repeat(width)).join("-+-")}-+`;
  const renderRow = (row) =>
    `| ${row
      .map((cell, columnIndex) => cell.padEnd(widths[columnIndex]))
      .join(" | ")} |`;

  return [
    separator,
    renderRow(normalizedHeaders),
    separator,
    ...normalizedRows.map(renderRow),
    separator,
  ].join("\n");
}

/**
 * @param {string} title Section title.
 * @param {TableRow} headers Table headers.
 * @param {TableRow[]} rows Table rows.
 * @returns {void}
 */
function printSection(title, headers, rows) {
  process.stdout.write(`${title}\n`);
  process.stdout.write(`${renderTable(headers, rows)}\n\n`);
}

/**
 * @param {string} label Analysis label.
 * @param {string} stdout Fallow stdout.
 * @returns {FallowJsonPayload} Parsed JSON payload.
 */
function parseJson(label, stdout) {
  const output = stdout.trim();

  if (!output) {
    process.stderr.write(`fallow ${label} did not return output.\n`);
    process.exit(2);
  }

  try {
    // oxlint-disable-next-line bensandee/no-unsafe-json-parse -- Fallow emits command-specific JSON envelopes that are summarized generically here.
    return JSON.parse(output);
  } catch (error) {
    process.stderr.write(`fallow ${label} returned invalid JSON.\n`);
    process.stderr.write(`${String(error)}\n`);
    process.stderr.write(`${output.slice(0, 4000)}\n`);
    process.exit(2);
    throw error;
  }
}

/**
 * @param {FallowAnalysis} analysis Fallow analysis.
 * @returns {string[]} Command arguments.
 */
function getFallowArgs(analysis) {
  return hasLocalEntrypoint
    ? [localEntrypoint, ...analysis.args]
    : analysis.args;
}

/**
 * @param {FallowAnalysis} analysis Fallow analysis.
 * @returns {import("node:child_process").SpawnSyncReturns<string>} Spawn result.
 */
function spawnFallow(analysis) {
  return spawnSync(command, getFallowArgs(analysis), {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    shell: !hasLocalEntrypoint && process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/**
 * @param {FallowAnalysis} analysis Fallow analysis.
 * @param {import("node:child_process").SpawnSyncReturns<string>} result Spawn result.
 * @returns {void}
 */
function assertFallowStarted(analysis, result) {
  if (!result.error) {
    return;
  }

  process.stderr.write(`fallow ${analysis.label} failed to start.\n`);
  process.stderr.write(`${result.error.message}\n`);
  process.exit(2);
}

/**
 * @param {FallowAnalysis} analysis Fallow analysis.
 * @param {import("node:child_process").SpawnSyncReturns<string>} result Spawn result.
 * @returns {void}
 */
function assertFallowCompleted(analysis, result) {
  if (result.status !== 2 && result.status !== null) {
    return;
  }

  process.stderr.write(`fallow ${analysis.label} failed.\n`);
  writeFallowFailureOutput(result);
  process.exit(2);
}

/**
 * @param {import("node:child_process").SpawnSyncReturns<string>} result Spawn result.
 * @returns {void}
 */
function writeFallowFailureOutput(result) {
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.stdout) {
    process.stderr.write(result.stdout);
  }
}

/**
 * @param {FallowAnalysis} analysis Fallow analysis.
 * @param {import("node:child_process").SpawnSyncReturns<string>} result Spawn result.
 * @returns {FallowRunResult} Parsed result.
 */
function createFallowRunResult(analysis, result) {
  return {
    label: analysis.label,
    status: result.status,
    payload: parseJson(analysis.label, result.stdout),
  };
}

/**
 * @param {FallowAnalysis} analysis Fallow analysis.
 * @returns {FallowRunResult} Fallow run result.
 */
function runFallow(analysis) {
  const result = spawnFallow(analysis);

  assertFallowStarted(analysis, result);
  assertFallowCompleted(analysis, result);

  return createFallowRunResult(analysis, result);
}

process.stdout.write(
  `Running fallow summary report${
    shouldFailOnFindings ? " as a failing gate" : " as an advisory report"
  }...\n\n`,
);

const results = Object.fromEntries(
  analyses.map((analysis) => {
    const result = runFallow(analysis);

    return [analysis.label, result];
  }),
);

const deadCode = results["dead code"].payload;
const dupes = results.duplication.payload;
const health = results.complexity.payload;
const dependencyIssueCount = sumCounts(deadCode, [
  "unused_dependencies",
  "unused_dev_dependencies",
  "unused_optional_dependencies",
  "type_only_dependencies",
  "test_only_dependencies",
]);
const importGraphIssueCount = sumCounts(deadCode, [
  "unresolved_imports",
  "unlisted_dependencies",
  "circular_dependencies",
  "re_export_cycles",
  "boundary_violations",
]);
const packageConfigIssueCount = sumCounts(deadCode, [
  "unused_catalog_entries",
  "empty_catalog_groups",
  "unresolved_catalog_references",
  "unused_dependency_overrides",
  "misconfigured_dependency_overrides",
]);
const duplicationStats = dupes.stats ?? {};
const healthSummary = health.summary ?? {};
const vitalSigns = health.vital_signs ?? {};
const healthScore = health.health_score ?? {};
const unitSizeProfile = vitalSigns.unit_size_profile ?? {};
const unitInterfaceProfile = vitalSigns.unit_interfacing_profile ?? {};
const elapsedTotal =
  asNumber(deadCode.elapsed_ms) +
  asNumber(dupes.elapsed_ms) +
  asNumber(health.elapsed_ms);
const healthFindingCount = countHealthFindings(health);
const cloneGroupCount = countList(dupes.clone_groups);
const refactorTargetCount = countList(health.targets);
const hasFindings =
  asNumber(deadCode.total_issues) > 0 ||
  cloneGroupCount > 0 ||
  healthFindingCount > 0 ||
  refactorTargetCount > 0;

printSection(
  "Overview",
  ["Metric", "Value", "Status"],
  [
    [
      "Health score",
      `${formatDecimal(healthScore.score)} / 100 (${healthScore.grade ?? "-"})`,
      qualityForHealthScore(healthScore.score),
    ],
    [
      "Cleanup findings",
      formatNumber(deadCode.total_issues),
      qualityForCount(deadCode.total_issues, 100),
    ],
    [
      "Duplication",
      `${formatPercent(duplicationStats.duplication_percentage)} across ${formatNumber(
        cloneGroupCount,
      )} clone groups`,
      qualityForPercent(duplicationStats.duplication_percentage, 5),
    ],
    [
      "Complexity findings",
      `${formatNumber(healthFindingCount)} across ${formatNumber(
        healthSummary.functions_analyzed,
      )} functions`,
      qualityForCount(healthFindingCount, 100),
    ],
    [
      "Refactor targets",
      formatNumber(refactorTargetCount),
      qualityForCount(refactorTargetCount, 10),
    ],
    ["Analysis time", formatMillis(elapsedTotal), "info"],
  ],
);

printSection(
  "Dead Code",
  ["Category", "Count", "Status"],
  [
    [
      "Unused files",
      formatNumber(countList(deadCode.unused_files)),
      qualityForCount(countList(deadCode.unused_files), 10),
    ],
    [
      "Unused exports",
      formatNumber(countList(deadCode.unused_exports)),
      qualityForCount(countList(deadCode.unused_exports), 100),
    ],
    [
      "Unused types",
      formatNumber(countList(deadCode.unused_types)),
      qualityForCount(countList(deadCode.unused_types), 100),
    ],
    [
      "Unused class members",
      formatNumber(countList(deadCode.unused_class_members)),
      qualityForCount(countList(deadCode.unused_class_members), 25),
    ],
    [
      "Duplicate exports",
      formatNumber(countList(deadCode.duplicate_exports)),
      qualityForCount(countList(deadCode.duplicate_exports), 10),
    ],
    [
      "Dependency placement",
      formatNumber(dependencyIssueCount),
      qualityForCount(dependencyIssueCount, 1),
    ],
    [
      "Import graph / boundaries",
      formatNumber(importGraphIssueCount),
      qualityForCount(importGraphIssueCount, 1),
    ],
    [
      "Package config hygiene",
      formatNumber(packageConfigIssueCount),
      qualityForCount(packageConfigIssueCount, 1),
    ],
  ],
);

printSection(
  "Duplication",
  ["Metric", "Value", "Status"],
  [
    ["Files scanned", formatNumber(duplicationStats.total_files), "info"],
    [
      "Files with clones",
      formatNumber(duplicationStats.files_with_clones),
      qualityForCount(duplicationStats.files_with_clones, 100),
    ],
    [
      "Duplicated lines",
      `${formatNumber(duplicationStats.duplicated_lines)} / ${formatNumber(
        duplicationStats.total_lines,
      )}`,
      qualityForPercent(duplicationStats.duplication_percentage, 5),
    ],
    [
      "Duplicated tokens",
      `${formatNumber(duplicationStats.duplicated_tokens)} / ${formatNumber(
        duplicationStats.total_tokens,
      )}`,
      qualityForPercent(duplicationStats.duplication_percentage, 5),
    ],
    [
      "Clone groups",
      formatNumber(cloneGroupCount),
      qualityForCount(cloneGroupCount, 100),
    ],
    [
      "Clone instances",
      formatNumber(duplicationStats.clone_instances),
      qualityForCount(duplicationStats.clone_instances, 250),
    ],
  ],
);

printSection(
  "Complexity",
  ["Metric", "Value", "Status"],
  [
    ["Files analyzed", formatNumber(healthSummary.files_analyzed), "info"],
    [
      "Functions analyzed",
      formatNumber(healthSummary.functions_analyzed),
      "info",
    ],
    [
      "Functions above threshold",
      `${formatNumber(healthSummary.functions_above_threshold)} (limits: cyclomatic ${formatNumber(
        healthSummary.max_cyclomatic_threshold,
      )}, cognitive ${formatNumber(
        healthSummary.max_cognitive_threshold,
      )}, CRAP ${formatNumber(healthSummary.max_crap_threshold)})`,
      qualityForCount(healthSummary.functions_above_threshold, 100),
    ],
    [
      "Severity mix",
      `${formatNumber(healthSummary.severity_critical_count)} critical, ${formatNumber(
        healthSummary.severity_high_count,
      )} high, ${formatNumber(healthSummary.severity_moderate_count)} moderate`,
      qualityForCount(healthSummary.severity_critical_count, 1),
    ],
    [
      "Cyclomatic profile",
      `avg ${formatDecimal(vitalSigns.avg_cyclomatic)}, p90 ${formatDecimal(
        vitalSigns.p90_cyclomatic,
      )}`,
      qualityForPercent(vitalSigns.critical_complexity_pct, 1),
    ],
    [
      "Maintainability",
      `avg ${formatDecimal(
        healthSummary.average_maintainability,
      )}, low-score files ${formatPercent(vitalSigns.maintainability_low_pct)}`,
      qualityForPercent(vitalSigns.maintainability_low_pct, 5),
    ],
    [
      "Large functions",
      `${formatNumber(countList(health.large_functions))} total, ${formatDecimal(
        vitalSigns.functions_over_60_loc_per_k,
      )} per 1k functions`,
      qualityForCount(countList(health.large_functions), 100),
    ],
    [
      "Hotspots",
      `${formatNumber(countList(health.hotspots))} structural, ${formatNumber(
        vitalSigns.hotspot_top_pct_count,
      )} top-percentile`,
      qualityForCount(countList(health.hotspots), 100),
    ],
  ],
);

printSection(
  "Risk Profile",
  ["Profile", "Low", "Medium", "High", "Very High"],
  [
    [
      "Function size",
      formatPercent(unitSizeProfile.low_risk),
      formatPercent(unitSizeProfile.medium_risk),
      formatPercent(unitSizeProfile.high_risk),
      formatPercent(unitSizeProfile.very_high_risk),
    ],
    [
      "Interface coupling",
      formatPercent(unitInterfaceProfile.low_risk),
      formatPercent(unitInterfaceProfile.medium_risk),
      formatPercent(unitInterfaceProfile.high_risk),
      formatPercent(unitInterfaceProfile.very_high_risk),
    ],
  ],
);

printSection(
  "Run Details",
  ["Field", "Value"],
  [
    [
      "Fallow version",
      deadCode.version ?? dupes.version ?? health.version ?? "-",
    ],
    ["Schema version", deadCode.schema_version ?? "-"],
    ["Entry points", formatNumber(deadCode.entry_points?.total)],
    ["Coverage model", healthSummary.coverage_model ?? "-"],
    ["Coverage consistency", healthSummary.coverage_source_consistency ?? "-"],
  ],
);

if (hasFindings) {
  process.stdout.write(
    "Drilldown is intentionally hidden in lint:fallow. Use fallow dead-code, fallow dupes, or fallow health directly for individual findings.\n",
  );
}

if (hasFindings && shouldFailOnFindings) {
  process.exit(1);
}
