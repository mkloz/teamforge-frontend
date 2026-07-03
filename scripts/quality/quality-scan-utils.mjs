// @ts-check

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import {
  ROOT,
  readRequiredOptionValue,
  toRepoRelativePath,
} from "../shared/command-utils.mjs";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const SKIPPED_DIRECTORIES = new Set([
  ".git",
  "coverage",
  "dist",
  "node_modules",
  "reports",
  "temp",
]);

/**
 * @typedef {{ jsonFile: string; quiet: boolean; reportFile: string; strict: boolean }} QualityScanCliOptions
 * @typedef {(options: QualityScanCliOptions) => void} BooleanOptionSetter
 */

/**
 * @param {string[]} argv CLI arguments.
 * @param {{ booleanOptions?: Map<string, BooleanOptionSetter>; defaults: QualityScanCliOptions; scriptName: string }} config Parser config.
 * @returns {QualityScanCliOptions} Parsed options.
 */
export function parseQualityScanArgs(argv, config) {
  const options = { ...config.defaults };
  const booleanOptions = config.booleanOptions ?? new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const booleanSetter = booleanOptions.get(arg);

    if (booleanSetter) {
      booleanSetter(options);
      continue;
    }

    if (arg === "--json-file") {
      options.jsonFile = readRequiredOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--report-file") {
      options.reportFile = readRequiredOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg.startsWith("--json-file=")) {
      options.jsonFile = arg.slice("--json-file=".length);
      continue;
    }

    if (arg.startsWith("--report-file=")) {
      options.reportFile = arg.slice("--report-file=".length);
      continue;
    }

    throw new Error(`Unknown ${config.scriptName} argument: ${arg}`);
  }

  return options;
}

/**
 * @param {{ rootFiles?: string[]; sourceRoots: string[] }} config Source collection config.
 * @returns {Promise<string[]>} Repo-relative TypeScript source files.
 */
export async function collectTypeScriptSourceFiles(config) {
  const sourceGroups = await Promise.all(
    config.sourceRoots.map(collectSourceFiles),
  );
  const rootFiles = (config.rootFiles ?? []).filter(isSourceFile);

  return [...sourceGroups.flat(), ...rootFiles].toSorted();
}

/**
 * @param {string} directory Absolute directory.
 * @returns {Promise<string[]>} Repo-relative TypeScript source files.
 */
async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    () => [],
  );
  const fileGroups = await Promise.all(
    entries.map((entry) => collectSourceEntryFiles(directory, entry)),
  );

  return fileGroups.flat().toSorted();
}

/**
 * @param {string} directory Absolute parent directory.
 * @param {import("node:fs").Dirent} entry Directory entry.
 * @returns {Promise<string[]>} Repo-relative TypeScript source files.
 */
async function collectSourceEntryFiles(directory, entry) {
  const absolutePath = path.join(directory, entry.name);
  const relativePath = toRepoRelativePath(absolutePath);

  if (entry.isDirectory()) {
    return SKIPPED_DIRECTORIES.has(entry.name)
      ? []
      : collectSourceFiles(absolutePath);
  }

  return isSourceFile(relativePath) ? [relativePath] : [];
}

/**
 * @param {string} filePath Repo-relative file path.
 * @returns {boolean} Whether this is a TypeScript source file.
 */
function isSourceFile(filePath) {
  return SOURCE_EXTENSIONS.has(path.extname(filePath));
}

/**
 * @param {string} filePath Repo-relative source path.
 * @returns {Promise<{ lines: string[]; sourceFile: ts.SourceFile }>} Parsed TypeScript source.
 */
export async function readTypeScriptSourceFile(filePath) {
  const absolutePath = path.join(ROOT, filePath);
  const text = await readFile(absolutePath, "utf8");

  return {
    lines: text.split(/\r?\n/u),
    sourceFile: ts.createSourceFile(
      filePath,
      text,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    ),
  };
}

/**
 * @param {string[]} items Summary items.
 * @returns {string} Markdown bullets.
 */
export function renderMarkdownBullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

/**
 * @template TReference
 * @param {TReference[]} references References grouped by file.
 * @param {string} valueProperty Output property for distinct values.
 * @param {(reference: TReference) => string} getValue Distinct value selector.
 * @returns {Array<{ count: number; filePath: string } & Record<string, string>>} Top reference files.
 */
export function getTopReferenceFiles(references, valueProperty, getValue) {
  /** @type {Map<string, TReference[]>} */
  const referencesByFile = new Map();

  for (const reference of references) {
    const filePath = readReferenceFilePath(reference);
    const fileReferences = referencesByFile.get(filePath) ?? [];
    fileReferences.push(reference);
    referencesByFile.set(filePath, fileReferences);
  }

  return [...referencesByFile]
    .map(([filePath, fileReferences]) => ({
      count: fileReferences.length,
      filePath,
      [valueProperty]: [...new Set(fileReferences.map(getValue))]
        .toSorted()
        .join(", "),
    }))
    .toSorted(
      (left, right) =>
        right.count - left.count || left.filePath.localeCompare(right.filePath),
    )
    .slice(0, 12);
}

/**
 * @param {unknown} reference Reference-like object.
 * @returns {string} Reference file path.
 */
function readReferenceFilePath(reference) {
  if (
    reference &&
    typeof reference === "object" &&
    "filePath" in reference &&
    typeof reference.filePath === "string"
  ) {
    return reference.filePath;
  }

  throw new Error("Quality scan reference is missing a filePath.");
}
