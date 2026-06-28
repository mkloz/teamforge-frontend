#!/usr/bin/env node
// @ts-check

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  colorText,
  ensureDirectory,
  excerpt,
  formatDuration,
  formatStatusBadge,
  ROOT,
  runCommand,
  sectionTitle,
  tailLines,
  toRepoRelativePath,
  writeTextFile,
} from "../shared/command-utils.mjs";

const REPORT_PATH = path.join(ROOT, "reports", "gitleaks.md");
const DEFAULT_IMAGE =
  process.env.GITLEAKS_IMAGE ?? "ghcr.io/gitleaks/gitleaks:v8.30.1";

/**
 * Runs the Gitleaks secret scanner.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const startedAt = performance.now();
  let result;

  try {
    result = await runGitleaks();
  } catch (error) {
    result = createSetupFailureResult(error, performance.now() - startedAt);
  }

  const elapsedMs = performance.now() - startedAt;

  await ensureDirectory(path.dirname(REPORT_PATH));
  await writeTextFile(REPORT_PATH, formatReport({ elapsedMs, result }));
  printSummary({ elapsedMs, result });

  if (result.status !== 0) {
    process.exitCode = result.status;
  }
}

/**
 * @returns {Promise<import("../shared/command-utils.mjs").CommandResult>} Result.
 */
function runGitleaks() {
  const args = ["detect", "--redact", ...getConfigArgs()];
  const gitleaks = resolveExternalCommand("gitleaks");

  if (gitleaks) {
    return runCommand({
      args,
      name: "gitleaks",
      spec: gitleaks,
    });
  }

  const docker = resolveExternalCommand("docker");

  if (!docker) {
    throw new Error(
      "Gitleaks requires a local gitleaks binary or Docker. Install gitleaks, start Docker, or run in CI where Docker is available.",
    );
  }

  assertDockerDaemonAvailable(docker);

  return runCommand({
    args: [
      "run",
      "--rm",
      "--mount",
      `type=bind,source=${ROOT},target=/workspace,readonly`,
      "-w",
      "/workspace",
      DEFAULT_IMAGE,
      ...args,
    ],
    name: "gitleaks docker",
    spec: docker,
  });
}

/**
 * @param {import("../shared/command-utils.mjs").CommandSpec} docker Docker command spec.
 */
function assertDockerDaemonAvailable(docker) {
  try {
    execFileSync(
      docker.command,
      [...docker.argsPrefix, "version", "--format", "{{.Server.Version}}"],
      {
        cwd: ROOT,
        shell: docker.shell,
        stdio: "ignore",
        timeout: 5000,
      },
    );
  } catch {
    throw new Error(
      "Docker is installed but the daemon is not reachable. Start Docker Desktop or install a local gitleaks binary, then rerun the scan.",
    );
  }
}

/**
 * @returns {string[]} Config arguments.
 */
function getConfigArgs() {
  return existsSync(path.join(ROOT, ".gitleaks.toml"))
    ? ["--config", ".gitleaks.toml"]
    : [];
}

/**
 * @param {unknown} error Caught setup error.
 * @param {number} elapsedMs Elapsed command time.
 * @returns {import("../shared/command-utils.mjs").CommandResult} Failure result.
 */
function createSetupFailureResult(error, elapsedMs) {
  return {
    commandLine: "gitleaks setup",
    durationMs: elapsedMs,
    name: "gitleaks setup",
    status: 1,
    stderr: `${getErrorMessage(error)}\n`,
    stdout: "",
  };
}

/**
 * @param {unknown} error Error value.
 * @returns {string} Error message.
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * @param {string} command Command name.
 * @returns {import("../shared/command-utils.mjs").CommandSpec | null} Command spec when available.
 */
function resolveExternalCommand(command) {
  const commandPath = findCommandPath(command);

  if (!commandPath) {
    return null;
  }

  return {
    argsPrefix: [],
    command: commandPath,
    shell: process.platform === "win32" && commandPath.endsWith(".cmd"),
  };
}

/**
 * @param {string} command Command name.
 * @returns {string | null} Resolved executable path.
 */
function findCommandPath(command) {
  try {
    const output = execFileSync(
      process.platform === "win32" ? "where" : "which",
      [command],
      {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
    const firstPath = output
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .find(Boolean);

    return firstPath ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {{ elapsedMs: number; result: import("../shared/command-utils.mjs").CommandResult }} context Report context.
 * @returns {string} Markdown report.
 */
function formatReport({ elapsedMs, result }) {
  const output = `${result.stdout}${result.stderr}`.trim();

  return [
    "# Gitleaks Secret Scan",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Result",
    "",
    renderMarkdownBullets([
      `Status: ${result.status === 0 ? "pass" : `status ${result.status}`}`,
      `Duration: ${formatDuration(elapsedMs)}`,
      `Command: \`${result.commandLine}\``,
    ]),
    "",
    "## Output",
    "",
    "```text",
    output ? tailLines(output, 140, 16_000) : "No leaks reported.",
    "```",
    "",
    "## Command Execution Summary",
    "",
    renderMarkdownBullets([
      result.commandLine === "gitleaks setup"
        ? "`node scripts/security/gitleaks.mjs` failed before Gitleaks could run."
        : "`node scripts/security/gitleaks.mjs` completed and wrote this report.",
      `Exit status: ${result.status}.`,
      `Report path: \`${toRepoRelativePath(REPORT_PATH)}\``,
    ]),
    "",
  ].join("\n");
}

/**
 * @param {{ elapsedMs: number; result: import("../shared/command-utils.mjs").CommandResult }} context Summary context.
 */
function printSummary({ elapsedMs, result }) {
  process.stdout.write(`${sectionTitle("Gitleaks")}\n`);
  process.stdout.write(
    `${formatStatusBadge(result.status)} Secret scan ${colorText(
      formatDuration(elapsedMs),
      "muted",
    )}\n`,
  );
  process.stdout.write(
    `  ${colorText(excerpt(`${result.stdout}${result.stderr}` || "No leaks reported."), "muted")}\n`,
  );
  process.stdout.write(
    `\n${colorText("Report", "accent")}\n  - ${toRepoRelativePath(REPORT_PATH)}\n`,
  );
}

/**
 * @param {string[]} items Items.
 * @returns {string} Markdown bullets.
 */
function renderMarkdownBullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

main().catch((error) => {
  process.stderr.write(`Gitleaks failed: ${getErrorMessage(error)}\n`);
  process.exit(1);
});
