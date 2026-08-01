#!/usr/bin/env node
// @ts-check

import path from "node:path";
import {
  colorText,
  ensureDirectory,
  excerpt,
  formatDuration,
  formatStatusBadge,
  ROOT,
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
 * @typedef {"changed" | "local" | "pr" | "release"} VerifyMode
 * @typedef {{ id: string; label: string; args?: string[]; deps?: string[]; env?: NodeJS.ProcessEnv; spec: import("../shared/command-utils.mjs").CommandSpec }} TaskSpec
 * @typedef {{ commandLine?: string; durationMs: number; id: string; label: string; output: string; status: number; statusLabel: "failed" | "passed" | "skipped" }} TaskResult
 */

const DEFAULT_CONCURRENCY = 4;
/** @type {ReadonlyMap<string, VerifyMode>} */
const VERIFY_MODE_ALIASES = new Map([
  ["fast", "changed"],
  ["changed", "changed"],
  ["local", "local"],
  ["pr", "pr"],
  ["release", "release"],
]);
const PR_BUILD_ENV_DEFAULTS = {
  VITE_API_URL: "http://localhost:6969/api/v1",
  VITE_APP_URL: "http://localhost:3000",
  VITE_GIPHY_API_KEY: "ci-giphy-key",
  VITE_GOOGLE_CLIENT_ID: "ci-google-client-id",
  VITE_GOOGLE_MAPS_API_KEY: "ci-google-maps-key",
  VITE_MEDIA_BASE_URL: "https://mkloz-teamforge.s3.us-east-1.amazonaws.com",
};

/**
 * @param {string[]} argv CLI arguments.
 * @returns {VerifyMode} Verify mode.
 */
function parseMode(argv) {
  const mode = argv[0] ?? "local";
  const verifyMode = VERIFY_MODE_ALIASES.get(mode);

  if (verifyMode) {
    return verifyMode;
  }

  throw new Error(`Unknown verify mode: ${mode}`);
}

/**
 * @returns {number} Parallel task limit.
 */
function getConcurrency() {
  const value = Number(process.env.VERIFY_MAX_PARALLEL);

  return Number.isInteger(value) && value > 0 ? value : DEFAULT_CONCURRENCY;
}

/**
 * @returns {string[]} Optional Oxlint thread arguments.
 */
function getOxlintThreadArgs() {
  const value = Number(process.env.OXLINT_THREADS);

  return Number.isInteger(value) && value > 0
    ? ["--threads", String(value)]
    : [];
}

/**
 * @param {VerifyMode} mode Verify mode.
 * @returns {TaskSpec[]} Tasks.
 */
function getTasks(mode) {
  if (mode === "changed") {
    return [
      {
        id: "changed",
        label: "Changed-file lint",
        spec: resolveNodeScript("scripts/lint/changed.mjs"),
        args: ["--full-oxlint"],
      },
    ];
  }

  const tasks = [
    createOxlintTask(),
    createCompilerTask(),
    createBiomeTask(),
    createArchitectureTask(),
    createFeatureImportSeamsTask(),
    createQualityTask(mode),
    createTypesTask(),
    createUnitTask(),
  ];

  if (mode === "pr" || mode === "release") {
    tasks.push(
      createSecretScanTask(),
      createKnipTask(),
      createAuditTask(),
      createBuildBundleTask(mode),
      createScenarioBoundaryTask(),
    );
  }

  if (mode === "release") {
    tasks.push(createPwaEnvTask(), createPwaQaTask());
    tasks.push(...createOptionalBrowserAuditTasks());
  }

  return tasks;
}

/**
 * @returns {TaskSpec} Oxlint task.
 */
function createOxlintTask() {
  return {
    id: "oxlint",
    label: "Oxlint",
    spec: resolvePackageBin("oxlint"),
    args: [
      "--config",
      ".oxlintrc.json",
      "--format",
      "stylish",
      "--no-error-on-unmatched-pattern",
      ...getOxlintThreadArgs(),
      ".",
    ],
  };
}

/**
 * @returns {TaskSpec} React Compiler tracker task.
 */
function createCompilerTask() {
  return {
    id: "compiler",
    label: "React Compiler tracker",
    spec: resolvePackageBin(
      "@doist/react-compiler-tracker",
      "react-compiler-tracker",
    ),
    args: [],
  };
}

/**
 * @returns {TaskSpec} Biome task.
 */
function createBiomeTask() {
  return {
    id: "biome",
    label: "Biome",
    spec: resolvePackageBin("@biomejs/biome", "biome"),
    args: ["check", "--no-errors-on-unmatched", "."],
  };
}

/**
 * @returns {TaskSpec} Architecture task.
 */
function createArchitectureTask() {
  return {
    id: "architecture",
    label: "dependency-cruiser",
    spec: resolvePackageBin("dependency-cruiser", "depcruise"),
    args: ["--config", ".dependency-cruiser.cjs", "src", "vite.config.ts"],
  };
}

/**
 * @returns {TaskSpec} Feature import seam task.
 */
function createFeatureImportSeamsTask() {
  return {
    id: "feature-seams",
    label: "Feature import seams",
    spec: resolveNodeScript("scripts/lint/feature-import-seams.mjs"),
    args: ["--strict"],
  };
}

/**
 * @param {VerifyMode} mode Verify mode.
 * @returns {TaskSpec} Quality intelligence task.
 */
function createQualityTask(mode) {
  return {
    id: "quality",
    label: "Quality intelligence",
    spec: resolveNodeScript("scripts/quality/intelligence.mjs"),
    args: [mode === "changed" ? "local" : mode],
  };
}

/**
 * @returns {TaskSpec} TypeScript task.
 */
function createTypesTask() {
  return {
    id: "types",
    label: "TypeScript",
    spec: resolvePackageBin("typescript", "tsc"),
    args: ["-b"],
  };
}

/**
 * @returns {TaskSpec} Unit test task.
 */
function createUnitTask() {
  return {
    id: "unit",
    label: "Vitest unit",
    spec: resolvePackageBin("vitest"),
    args: ["run", "test/unit"],
  };
}

/**
 * @returns {TaskSpec} Knip task.
 */
function createKnipTask() {
  return {
    id: "knip",
    label: "Knip",
    spec: resolveNodeScript("scripts/lint/knip.mjs"),
    args: [],
  };
}

/**
 * @returns {TaskSpec} npm audit task.
 */
function createAuditTask() {
  return {
    id: "audit",
    label: "npm audit",
    spec: resolvePathBin("npm"),
    args: ["audit", "--audit-level=high"],
  };
}

/**
 * @returns {TaskSpec} Secret scan task.
 */
function createSecretScanTask() {
  return {
    id: "secrets",
    label: "Gitleaks secret scan",
    spec: resolveNodeScript("scripts/security/gitleaks.mjs"),
    args: [],
  };
}

/**
 * @param {VerifyMode} mode Verify mode.
 * @returns {TaskSpec} Bundle build task.
 */
function createBuildBundleTask(mode) {
  return {
    deps: ["types"],
    env: mode === "pr" ? getPrBuildEnv() : undefined,
    id: "bundle",
    label: "Vite bundle",
    spec: resolvePackageBin("vite"),
    args: ["build"],
  };
}

/**
 * @returns {TaskSpec} Scenario production-exclusion task.
 */
function createScenarioBoundaryTask() {
  return {
    deps: ["bundle"],
    id: "scenario-boundary",
    label: "Scenario production boundary",
    spec: resolveNodeScript("scripts/scenario/check-production-boundary.mjs"),
  };
}

/**
 * @returns {NodeJS.ProcessEnv} Local-safe Vite env for PR bundle verification.
 */
function getPrBuildEnv() {
  return getEnvWithDefaults(PR_BUILD_ENV_DEFAULTS);
}

/**
 * @param {Record<string, string>} defaults Env defaults by variable name.
 * @returns {NodeJS.ProcessEnv} Env values using current process values first.
 */
function getEnvWithDefaults(defaults) {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [
      key,
      process.env[key] ?? fallback,
    ]),
  );
}

/**
 * @returns {TaskSpec} PWA env task.
 */
function createPwaEnvTask() {
  return {
    id: "pwa-env",
    label: "PWA env preflight",
    spec: resolveNodeScript("scripts/pwa/production-env.mjs"),
    args: [],
  };
}

/**
 * @returns {TaskSpec} PWA QA task.
 */
function createPwaQaTask() {
  return {
    deps: ["scenario-boundary"],
    id: "pwa-qa",
    label: "PWA QA",
    spec: resolveNodeScript("scripts/pwa/qa.mjs"),
    args: [],
  };
}

/**
 * @returns {TaskSpec[]} Optional browser audit tasks.
 */
function createOptionalBrowserAuditTasks() {
  if (process.env.VERIFY_RUN_BROWSER_AUDITS !== "true") {
    return [];
  }

  return [
    {
      deps: ["pwa-qa"],
      id: "audit-browser",
      label: "Browser audit",
      spec: resolveNodeScript("scripts/audit/run-browser-audits.mjs"),
      args: ["release"],
    },
    {
      deps: ["audit-browser"],
      id: "bundle-restore",
      label: "Restore release bundle",
      spec: resolvePackageBin("vite"),
      args: ["build"],
    },
  ];
}

/**
 * Runs tasks with dependency and concurrency control.
 *
 * @param {TaskSpec[]} tasks Tasks.
 * @param {number} concurrency Max parallel tasks.
 * @returns {Promise<TaskResult[]>} Ordered results.
 */
async function runTaskGraph(tasks, concurrency) {
  /** @type {Map<string, TaskSpec>} */
  const pending = new Map(tasks.map((task) => [task.id, task]));
  /** @type {Map<string, Promise<TaskResult>>} */
  const running = new Map();
  /** @type {Map<string, TaskResult>} */
  const results = new Map();

  while (pending.size > 0 || running.size > 0) {
    markBlockedTasksAsSkipped(pending, results);
    startReadyTasks({ concurrency, pending, results, running });

    if (running.size === 0) {
      markRemainingTasksAsSkipped(pending, results, "dependency deadlock");
      break;
    }

    // oxlint-disable-next-line no-await-in-loop -- The scheduler intentionally waits for the next completed task before starting dependent work.
    const result = await Promise.race(running.values());
    running.delete(result.id);
    results.set(result.id, result);
  }

  return tasks.map((task) => getTaskResult(task, results));
}

/**
 * @param {{ concurrency: number; pending: Map<string, TaskSpec>; results: Map<string, TaskResult>; running: Map<string, Promise<TaskResult>> }} context Scheduler context.
 */
function startReadyTasks({ concurrency, pending, results, running }) {
  for (const task of pending.values()) {
    if (running.size >= concurrency) {
      return;
    }

    if (!areDependenciesPassed(task, results)) {
      continue;
    }

    pending.delete(task.id);
    running.set(task.id, runTask(task));
  }
}

/**
 * @param {Map<string, TaskSpec>} pending Pending tasks.
 * @param {Map<string, TaskResult>} results Results.
 */
function markBlockedTasksAsSkipped(pending, results) {
  for (const task of pending.values()) {
    const failedDependency = (task.deps ?? []).find((dependency) => {
      const result = results.get(dependency);

      return result && result.status !== 0;
    });

    if (!failedDependency) {
      continue;
    }

    pending.delete(task.id);
    results.set(
      task.id,
      skippedTask(task, `dependency failed: ${failedDependency}`),
    );
  }
}

/**
 * @param {Map<string, TaskSpec>} pending Pending tasks.
 * @param {Map<string, TaskResult>} results Results.
 * @param {string} reason Skip reason.
 */
function markRemainingTasksAsSkipped(pending, results, reason) {
  for (const task of pending.values()) {
    results.set(task.id, skippedTask(task, reason));
  }

  pending.clear();
}

/**
 * @param {TaskSpec} task Task.
 * @param {Map<string, TaskResult>} results Results.
 * @returns {boolean} Whether all dependencies passed.
 */
function areDependenciesPassed(task, results) {
  return (task.deps ?? []).every(
    (dependency) => results.get(dependency)?.status === 0,
  );
}

/**
 * @param {TaskSpec} task Task.
 * @returns {Promise<TaskResult>} Task result.
 */
async function runTask(task) {
  const result = await runCommand({
    args: task.args ?? [],
    env: task.env,
    name: task.label,
    spec: task.spec,
  });

  return {
    commandLine: result.commandLine,
    durationMs: result.durationMs,
    id: task.id,
    label: task.label,
    output: `${result.stdout}${result.stderr}`,
    status: result.status,
    statusLabel: result.status === 0 ? "passed" : "failed",
  };
}

/**
 * @param {TaskSpec} task Task.
 * @param {string} reason Skip reason.
 * @returns {TaskResult} Skipped task result.
 */
function skippedTask(task, reason) {
  return {
    durationMs: 0,
    id: task.id,
    label: task.label,
    output: reason,
    status: 1,
    statusLabel: "skipped",
  };
}

/**
 * @param {TaskSpec} task Task.
 * @param {Map<string, TaskResult>} results Results.
 * @returns {TaskResult} Result.
 */
function getTaskResult(task, results) {
  return results.get(task.id) ?? skippedTask(task, "not run");
}

/**
 * @param {TaskResult[]} results Task results.
 * @returns {boolean} Whether any task failed or skipped.
 */
function hasFailure(results) {
  return results.some((result) => result.status !== 0);
}

/**
 * @param {VerifyMode} mode Verify mode.
 * @param {TaskResult[]} results Results.
 * @returns {string} Markdown report.
 */
function formatReport(mode, results, concurrency) {
  const failed = results.filter((result) => result.status !== 0);
  const passed = results.filter((result) => result.status === 0);
  const skipped = results.filter((result) => result.statusLabel === "skipped");

  return [
    `# Verify ${mode}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Task Matrix",
    "",
    renderMarkdownTable(
      ["Task", "Status", "Time", "Command", "Summary"],
      results.map((result) => [
        result.label,
        result.statusLabel,
        formatDuration(result.durationMs),
        result.commandLine ?? "-",
        excerpt(result.output, 240),
      ]),
    ),
    "",
    "## Task Output",
    "",
    results.map(formatTaskDetail).join("\n\n"),
    "",
    "## Failure Index",
    "",
    failed.length === 0
      ? "No failed tasks."
      : renderMarkdownTable(
          ["Task", "Status", "Summary"],
          failed.map((result) => [
            result.label,
            result.statusLabel,
            excerpt(result.output, 320),
          ]),
        ),
    "",
    "## Command Execution Summary",
    "",
    renderMarkdownBullets(
      getVerifyCommandSummary({
        concurrency,
        failed,
        mode,
        passed,
        results,
        skipped,
      }),
    ),
    "",
  ].join("\n");
}

/**
 * @param {TaskResult} result Task result.
 * @returns {string} Markdown task detail.
 */
function formatTaskDetail(result) {
  const output = result.output.trim()
    ? tailLines(result.output, 140, 16_000)
    : "No captured output.";

  return [
    `### ${result.label}`,
    "",
    renderMarkdownBullets([
      `Status: ${result.statusLabel}`,
      `Duration: ${formatDuration(result.durationMs)}`,
      `Command: \`${result.commandLine ?? "-"}\``,
      `Summary: ${summarizeTaskOutput(result).join(" / ") || "completed"}`,
    ]),
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
 * @param {number} count Count.
 * @param {string} singular Singular noun.
 * @returns {string} Count with a pluralized noun.
 */
function formatCount(count, singular) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

/**
 * @param {{ concurrency: number; failed: TaskResult[]; mode: VerifyMode; passed: TaskResult[]; results: TaskResult[]; skipped: TaskResult[] }} context Summary context.
 * @returns {string[]} Command execution summary bullets.
 */
function getVerifyCommandSummary({
  concurrency,
  failed,
  mode,
  passed,
  results,
  skipped,
}) {
  const exitStatus = failed.length === 0 ? 0 : 1;

  return [
    `Command: \`node scripts/verify/index.mjs ${mode}\``,
    `Mode: ${mode}`,
    `Workers: ${formatCount(concurrency, "worker")}`,
    `Exit status: ${exitStatus}`,
    `Tasks scheduled: ${formatCount(results.length, "task")}; ${formatCount(
      passed.length,
      "task",
    )} passed, ${formatCount(failed.length, "task")} failed, ${formatCount(
      skipped.length,
      "task",
    )} skipped.`,
    `Total captured task time: ${formatDuration(
      results.reduce((total, result) => total + result.durationMs, 0),
    )}.`,
    `Report path: \`reports/verify.md\``,
  ];
}

/**
 * @param {TaskResult[]} results Task results.
 */
function printSummary(results) {
  for (const result of results) {
    process.stdout.write(
      `${formatStatusBadge(getDisplayStatus(result))} ${result.label} ${colorText(
        formatDuration(result.durationMs),
        "muted",
      )}\n`,
    );

    const summary = summarizeTaskOutput(result);

    for (const line of summary) {
      process.stdout.write(`  ${colorText(line, "muted")}\n`);
    }
  }
}

/**
 * @param {TaskResult[]} results Task results.
 */
function printFailures(results) {
  const failed = results.filter((result) => result.status !== 0);

  if (failed.length === 0) {
    return;
  }

  process.stderr.write(`\n${colorText("Failed task output", "danger")}\n`);
  for (const result of failed) {
    process.stderr.write(
      `\n${formatStatusBadge(getDisplayStatus(result))} ${result.label}\n`,
    );
    process.stderr.write(`${tailLines(result.output, 28, 6000)}\n`);
  }
}

/**
 * @param {TaskResult} result Task result.
 * @returns {"fail" | "pass" | "skip"} Display status.
 */
function getDisplayStatus(result) {
  if (result.statusLabel === "skipped") {
    return "skip";
  }

  return result.status === 0 ? "pass" : "fail";
}

/**
 * @param {TaskResult} result Task result.
 * @returns {string[]} Concise summary lines.
 */
function summarizeTaskOutput(result) {
  if (result.statusLabel === "skipped") {
    return [result.output];
  }

  if (result.status !== 0) {
    return ["see failure output below"];
  }

  const summary = getUsefulCompletionLines(result.output);

  if (summary.length === 0) {
    return ["completed"];
  }

  return summary;
}

/**
 * @param {string} output Task output.
 * @returns {string[]} Useful completion lines.
 */
function getUsefulCompletionLines(output) {
  const lines = tailLines(output, 12, 1200)
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  const usefulLines = lines.filter((line) =>
    /(?:changed-file lint passed|diagnostics across|findings across|no .*found|passed|typeScript found|checked \d+ files|test files|vulnerabilities)/iu.test(
      line,
    ),
  );
  const visibleLines =
    usefulLines.length > 0 ? usefulLines.slice(-4) : [lines.join(" ")];

  return [...new Set(visibleLines.map((line) => excerpt(line, 160)))].filter(
    Boolean,
  );
}

/**
 * @param {VerifyMode} mode Verify mode.
 * @param {TaskResult[]} results Results.
 * @returns {Promise<void>}
 */
async function writeReport(mode, results, concurrency) {
  const reportPath = path.join(ROOT, "reports", "verify.md");

  await ensureDirectory(path.dirname(reportPath));
  await writeTextFile(reportPath, formatReport(mode, results, concurrency));
  process.stdout.write(
    `\n${colorText("Report", "accent")}\n  - ${toRepoRelativePath(reportPath)}\n`,
  );
}

/**
 * @param {unknown} error Error-like value.
 * @returns {string} Error message.
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Runs verification.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const mode = parseMode(process.argv.slice(2));
  const tasks = getTasks(mode);
  const concurrency = getConcurrency();

  process.stdout.write(`${sectionTitle(`Verify ${mode}`)}\n`);
  process.stdout.write(
    `${colorText(
      `Running ${formatCount(tasks.length, "task")} with ${concurrency} workers`,
      "muted",
    )}\n\n`,
  );

  const results = await runTaskGraph(tasks, concurrency);

  printSummary(results);
  await writeReport(mode, results, concurrency);

  if (hasFailure(results)) {
    printFailures(results);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`Verify failed: ${getErrorMessage(error)}\n`);
  process.exit(1);
});
