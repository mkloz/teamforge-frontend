#!/usr/bin/env node
// @ts-check

import { stat } from "node:fs/promises";
import path from "node:path";
import {
  colorText,
  ensureDirectory,
  formatStatusBadge,
  ROOT,
  renderKeyValues,
  resolveNodeScript,
  resolvePackageBin,
  runCommand,
  sectionTitle,
  tailLines,
  toRepoRelativePath,
} from "../shared/command-utils.mjs";

/**
 * @typedef {{ outputFile: string; runHealth: boolean }} CliOptions
 */

const DEFAULT_OUTPUT_FILE = path.join(
  ROOT,
  "temp",
  "repomix",
  "frontend-repo.xml",
);
const INCLUDE_PATTERNS = [
  "AGENTS.md",
  "README.md",
  "package.json",
  "tsconfig*.json",
  "vite.config.ts",
  "biome.json",
  "knip.json",
  ".npmrc",
  ".fallowrc.json",
  ".oxlintrc.json",
  ".dependency-cruiser.cjs",
  ".react-compiler-tracker.config.json",
  ".github/workflows/**",
  "src/**",
  "scripts/**",
  "test/**",
  "docs/architecture-guide.md",
  "docs/api-data-models.md",
  "docs/open-api.yaml",
  "reports/agent-health.md",
  "reports/quality-intelligence.md",
].join(",");
const IGNORE_PATTERNS = [
  "node_modules/**",
  "dist/**",
  "dev-dist/**",
  "dist-ssr/**",
  "coverage/**",
  "temp/**",
  ".git/**",
  ".agents/**",
  "public/icons/**",
  "public/download/**",
  "package-lock.json",
].join(",");

/**
 * @param {string[]} argv CLI arguments.
 * @returns {CliOptions} Parsed options.
 */
function parseArgs(argv) {
  /** @type {CliOptions} */
  const options = {
    outputFile:
      process.env.AGENT_PACK_OUTPUT ??
      process.env.CONTEXT_REPO_OUTPUT ??
      DEFAULT_OUTPUT_FILE,
    runHealth:
      process.env.AGENT_PACK_SKIP_HEALTH !== "true" &&
      process.env.CONTEXT_REPO_SKIP_HEALTH !== "true",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--skip-health") {
      options.runHealth = false;
      continue;
    }

    if (arg === "--output") {
      options.outputFile = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith("--output=")) {
      options.outputFile = arg.slice("--output=".length);
      continue;
    }

    throw new Error(`Unknown agent:pack argument: ${arg}`);
  }

  return options;
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
 * @returns {Promise<void>}
 */
async function runContextHealth() {
  const result = await runCommand({
    args: [],
    name: "agent:health",
    spec: resolveNodeScript("scripts/context/health.mjs"),
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "agent:health failed.");
  }
}

/**
 * @param {CliOptions} options CLI options.
 * @returns {Promise<import("../shared/command-utils.mjs").CommandResult>} Repomix result.
 */
async function runRepomix(options) {
  await ensureDirectory(path.dirname(options.outputFile));

  return runCommand({
    args: [
      ".",
      "--style",
      "xml",
      "--output",
      options.outputFile,
      "--parsable-style",
      "--include",
      INCLUDE_PATTERNS,
      "--ignore",
      IGNORE_PATTERNS,
      "--no-gitignore",
      "--top-files-len",
      "12",
    ],
    name: "repomix",
    spec: resolvePackageBin("repomix"),
  });
}

/**
 * @param {CliOptions} options CLI options.
 * @param {import("../shared/command-utils.mjs").CommandResult} result Repomix result.
 * @returns {Promise<void>}
 */
async function printSummary(options, result) {
  const outputSize = await getFileSize(options.outputFile);

  process.stdout.write(`${sectionTitle("Context Pack")}\n`);
  process.stdout.write(
    `${formatStatusBadge(result.status)} ${toRepoRelativePath(options.outputFile)}\n`,
  );
  process.stdout.write(
    `${renderKeyValues([
      {
        label: "Size",
        value: outputSize === null ? "not written" : formatFileSize(outputSize),
      },
      {
        label: "Health reports",
        value: options.runHealth
          ? "refreshed before packing"
          : "reused existing reports",
      },
      {
        label: "Included",
        value:
          "source, scripts, core config, workflows, and generated quality reports",
      },
    ])}\n`,
  );
}

/**
 * @param {string} filePath File path.
 * @returns {Promise<number | null>} File size or null.
 */
async function getFileSize(filePath) {
  try {
    return (await stat(filePath)).size;
  } catch {
    return null;
  }
}

/**
 * @param {number} bytes File size in bytes.
 * @returns {string} Human-readable file size.
 */
function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Runs agent context pack generation.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.runHealth) {
    await runContextHealth();
  }

  const result = await runRepomix(options);

  await printSummary(options, result);

  if (result.status !== 0) {
    process.stderr.write(`\n${colorText("Repomix output", "danger")}\n`);
    process.stderr.write(`${tailLines(result.stderr || result.stdout, 24)}\n`);
    process.exitCode = result.status;
  }
}

main().catch((error) => {
  process.stderr.write(
    `Agent pack failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
