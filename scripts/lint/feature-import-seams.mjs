#!/usr/bin/env node
// @ts-check

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIRECTORY, "..", "..");
const SRC_DIRECTORY = path.join(ROOT, "src");
const FEATURES_DIRECTORY = path.join(SRC_DIRECTORY, "features");
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const SKIPPED_DIRECTORIES = new Set(["node_modules", "dist", "coverage"]);
const ROUTE_CONTRACT_FEATURES = new Set([
  "activity",
  "explore",
  "planCreation",
  "group-plan-detail",
  "home",
  "onboarding",
  "profile",
  "settings",
]);
const IMPORT_PATTERN =
  /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/gu;

const options = parseCliArgs(process.argv.slice(2));
const featureNames = readFeatureNames();
const violations = scanFeatureImports();

printReport(violations);

if (options.strict && violations.length > 0) {
  process.exitCode = 1;
}

/**
 * @typedef {{ fromFeature: string; importer: string; line: number; reason: string; specifier: string; target: string; toFeature: string }} FeatureImportViolation
 * @typedef {{ maxExamples: number; strict: boolean }} CliOptions
 */

/**
 * @param {string[]} argv CLI arguments.
 * @returns {CliOptions} Parsed options.
 */
function parseCliArgs(argv) {
  /** @type {CliOptions} */
  const parsed = {
    maxExamples: 20,
    strict: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--strict") {
      parsed.strict = true;
      continue;
    }

    if (arg === "--max-examples") {
      parsed.maxExamples = readPositiveInteger(argv[index + 1], arg);
      index += 1;
      continue;
    }

    if (arg.startsWith("--max-examples=")) {
      parsed.maxExamples = readPositiveInteger(arg.split("=")[1], arg);
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return parsed;
}

/**
 * @param {string | undefined} value Raw option value.
 * @param {string} option Option name.
 * @returns {number} Positive integer.
 */
function readPositiveInteger(value, option) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${option} expects a positive integer.`);
  }

  return parsed;
}

/**
 * @returns {Set<string>} Feature directory names.
 */
function readFeatureNames() {
  return new Set(
    readdirSync(FEATURES_DIRECTORY, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name),
  );
}

/**
 * @returns {FeatureImportViolation[]} Cross-feature internal imports.
 */
function scanFeatureImports() {
  return collectSourceFiles(FEATURES_DIRECTORY)
    .flatMap(scanFeatureFileImports)
    .sort(compareViolations);
}

/**
 * @param {string} filePath Absolute file path.
 * @returns {FeatureImportViolation[]} Cross-feature imports in the file.
 */
function scanFeatureFileImports(filePath) {
  const importer = toRepoPath(filePath);
  const fromFeature = getFeatureName(importer);

  if (!fromFeature) {
    return [];
  }

  return extractImportSpecifiers(readFileSync(filePath, "utf8"))
    .map((importRecord) =>
      createFeatureImportViolation(importer, fromFeature, importRecord),
    )
    .filter((violation) => violation !== null);
}

/**
 * @param {string} importer Repo-relative importer path.
 * @param {string} fromFeature Importing feature.
 * @param {{ line: number; specifier: string }} importRecord Import record.
 * @returns {FeatureImportViolation | null} Violation when the import crosses an internal seam.
 */
function createFeatureImportViolation(importer, fromFeature, importRecord) {
  const target = resolveImportTarget(importRecord.specifier, importer);
  const toFeature = target ? getFeatureName(target) : null;

  if (!toFeature || toFeature === fromFeature) {
    return null;
  }

  if (isFeaturePublicSeam(target, toFeature)) {
    return isFeaturePublicNavigationShim(target, toFeature)
      ? {
          fromFeature,
          importer,
          line: importRecord.line,
          reason: "navigation contracts must come from src/shared/navigation",
          specifier: importRecord.specifier,
          target,
          toFeature,
        }
      : null;
  }

  return {
    fromFeature,
    importer,
    line: importRecord.line,
    reason: "feature internals are private",
    specifier: importRecord.specifier,
    target,
    toFeature,
  };
}

/**
 * @param {string} directory Directory to scan.
 * @returns {string[]} Absolute source file paths.
 */
function collectSourceFiles(directory) {
  /** @type {string[]} */
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * @param {string} source File source.
 * @returns {{ line: number; specifier: string }[]} Import specifiers.
 */
function extractImportSpecifiers(source) {
  /** @type {{ line: number; specifier: string }[]} */
  const records = [];

  for (const match of source.matchAll(IMPORT_PATTERN)) {
    const specifier = match[1] ?? match[2];

    if (!specifier) {
      continue;
    }

    records.push({
      line: source.slice(0, match.index).split(/\r?\n/u).length,
      specifier,
    });
  }

  return records;
}

/**
 * @param {string} specifier Import specifier.
 * @param {string} importer Repo-relative importer path.
 * @returns {string | null} Resolved repo-relative target path.
 */
function resolveImportTarget(specifier, importer) {
  if (specifier.startsWith("@/")) {
    return `src/${specifier.slice(2)}`;
  }

  if (!specifier.startsWith(".")) {
    return null;
  }

  const importerDirectory = path.dirname(path.resolve(ROOT, importer));
  const resolvedPath = path.resolve(importerDirectory, specifier);
  const repoPath = toRepoPath(resolvedPath);

  if (!repoPath.startsWith("src/features/")) {
    return null;
  }

  return resolveExistingModulePath(repoPath);
}

/**
 * @param {string} repoPath Extensionless or concrete repo path.
 * @returns {string} Existing module path when one is easy to identify.
 */
function resolveExistingModulePath(repoPath) {
  const absolutePath = path.resolve(ROOT, repoPath);

  if (existsSync(absolutePath)) {
    const stats = statSync(absolutePath);

    return stats.isDirectory() ? `${repoPath}/index` : repoPath;
  }

  for (const extension of SOURCE_EXTENSIONS) {
    if (existsSync(`${absolutePath}${extension}`)) {
      return `${repoPath}${extension}`;
    }
  }

  return repoPath;
}

/**
 * @param {string} repoPath Repo-relative path.
 * @returns {string | null} Feature name.
 */
function getFeatureName(repoPath) {
  const parts = repoPath.split("/");

  if (parts[0] !== "src" || parts[1] !== "features") {
    return null;
  }

  const featureName = parts[2];

  return featureNames.has(featureName) ? featureName : null;
}

/**
 * @param {string} target Repo-relative target path.
 * @param {string} featureName Target feature name.
 * @returns {boolean} Whether the target uses the feature public seam.
 */
function isFeaturePublicSeam(target, featureName) {
  return target.startsWith(`src/features/${featureName}/public/`);
}

/**
 * @param {string} target Repo-relative target path.
 * @param {string} featureName Target feature name.
 * @returns {boolean} Whether the public seam is a route/navigation shim that should live in shared/navigation.
 */
function isFeaturePublicNavigationShim(target, featureName) {
  return (
    ROUTE_CONTRACT_FEATURES.has(featureName) &&
    /(?:^|\/)[^/]*navigation(?:\.[^.]+)?$/u.test(target)
  );
}

/**
 * @param {string} filePath Absolute or repo-relative file path.
 * @returns {string} Slash-separated repo path.
 */
function toRepoPath(filePath) {
  const absolutePath = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(ROOT, filePath);

  return path.relative(ROOT, absolutePath).replaceAll("\\", "/");
}

/**
 * @param {FeatureImportViolation} left Left violation.
 * @param {FeatureImportViolation} right Right violation.
 * @returns {number} Sort result.
 */
function compareViolations(left, right) {
  return (
    left.importer.localeCompare(right.importer) ||
    left.line - right.line ||
    left.specifier.localeCompare(right.specifier)
  );
}

/**
 * @param {FeatureImportViolation[]} found Violations.
 */
function printReport(found) {
  const mode = options.strict ? "strict" : "advisory";
  process.stdout.write(`\n> feature import seams (${mode})\n`);

  if (found.length === 0) {
    process.stdout.write("No cross-feature internal imports found.\n");
    return;
  }

  const byEdge = groupByEdge(found);
  process.stdout.write(
    `${found.length} cross-feature internal import(s) across ${byEdge.size} edge(s).\n`,
  );
  process.stdout.write(getModeMessage());

  for (const violation of found.slice(0, options.maxExamples)) {
    process.stdout.write(
      `- ${violation.importer}:${violation.line} ${violation.fromFeature} -> ${violation.toFeature} (${violation.specifier}) - ${violation.reason}\n`,
    );
  }

  const hidden = found.length - options.maxExamples;

  if (hidden > 0) {
    process.stdout.write(`... ${hidden} more import(s) hidden.\n`);
  }
}

/**
 * @returns {string} Mode-specific report text.
 */
function getModeMessage() {
  return options.strict
    ? "Feature-to-feature imports must use public seams, and route contracts must use shared navigation.\n"
    : "These are advisory until the migration to feature public seams and shared navigation is complete.\n";
}

/**
 * @param {FeatureImportViolation[]} found Violations.
 * @returns {Map<string, number>} Count by feature edge.
 */
function groupByEdge(found) {
  /** @type {Map<string, number>} */
  const grouped = new Map();

  for (const violation of found) {
    const edge = `${violation.fromFeature} -> ${violation.toFeature}`;
    grouped.set(edge, (grouped.get(edge) ?? 0) + 1);
  }

  return grouped;
}
