#!/usr/bin/env node
// @ts-check

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import {
  colorText,
  formatDuration,
  formatStatusBadge,
  ROOT,
  readRequiredOptionValue,
  renderBullets,
  renderKeyValues,
  renderMarkdownTable,
  sectionTitle,
  toRepoRelativePath,
  writeJsonFile,
  writeTextFile,
} from "../shared/command-utils.mjs";

/**
 * @typedef {"as" | "angle"} TypeAssertionKind
 * @typedef {{ jsonFile: string; quiet: boolean; reportFile: string; strict: boolean }} CliOptions
 * @typedef {{ column: number; context: string; filePath: string; kind: TypeAssertionKind; line: number; typeText: string }} TypeAssertionReference
 * @typedef {{ count: number; filePath: string; types: string }} FileAssertionSummary
 * @typedef {{ angle: number; assertions: number; asExpressions: number; scannedFiles: number }} TypeAssertionCounts
 * @typedef {{ counts: TypeAssertionCounts; filesWithAssertions: number; generatedAt: string; topFiles: FileAssertionSummary[] }} TypeAssertionSummary
 * @typedef {(options: CliOptions) => void} BooleanOptionSetter
 * @typedef {(options: CliOptions, value: string) => void} ValueOptionSetter
 */

const SOURCE_ROOTS = [path.join(ROOT, "src"), path.join(ROOT, "test")];
const ROOT_SOURCE_FILES = ["vite.config.ts"];
const DEFAULT_REPORT_FILE = path.join(
  ROOT,
  "reports",
  "type-assertion-usage.md",
);
const DEFAULT_JSON_FILE = path.join(
  ROOT,
  "temp",
  "type-assertion-usage-summary.json",
);
const ASSERTIONS_DISPLAY_LIMIT = 80;
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const SKIPPED_DIRECTORIES = new Set([
  ".git",
  "coverage",
  "dist",
  "node_modules",
  "reports",
  "temp",
]);
/** @type {Map<string, BooleanOptionSetter>} */
const BOOLEAN_OPTIONS = new Map([
  [
    "--advisory",
    (options) => {
      options.strict = false;
    },
  ],
  [
    "--quiet",
    (options) => {
      options.quiet = true;
    },
  ],
  [
    "--strict",
    (options) => {
      options.strict = true;
    },
  ],
]);
/** @type {Map<string, ValueOptionSetter>} */
const VALUE_OPTIONS = new Map([
  ["--json-file", assignJsonFile],
  ["--report-file", assignReportFile],
]);

/**
 * @param {string[]} argv CLI arguments.
 * @returns {CliOptions} Parsed options.
 */
function parseArgs(argv) {
  /** @type {CliOptions} */
  const options = {
    jsonFile: DEFAULT_JSON_FILE,
    quiet: false,
    reportFile: DEFAULT_REPORT_FILE,
    strict: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const consumed = applyArg(options, argv, index);
    index += consumed;
  }

  return options;
}

/**
 * @param {CliOptions} options Mutable options.
 * @param {string[]} argv CLI arguments.
 * @param {number} index Current argv index.
 * @returns {number} Additional argv indexes consumed.
 */
function applyArg(options, argv, index) {
  const arg = argv[index];
  const booleanSetter = BOOLEAN_OPTIONS.get(arg);

  if (booleanSetter) {
    booleanSetter(options);
    return 0;
  }

  const valueSetter = VALUE_OPTIONS.get(arg);

  if (valueSetter) {
    valueSetter(options, readRequiredOptionValue(argv, index, arg));
    return 1;
  }

  for (const [option, setter] of VALUE_OPTIONS) {
    const prefix = `${option}=`;

    if (arg.startsWith(prefix)) {
      setter(options, arg.slice(prefix.length));
      return 0;
    }
  }

  throw new Error(`Unknown type-assertion-usage argument: ${arg}`);
}

/**
 * @param {CliOptions} options Mutable options.
 * @param {string} value JSON output path.
 */
function assignJsonFile(options, value) {
  options.jsonFile = value;
}

/**
 * @param {CliOptions} options Mutable options.
 * @param {string} value Report output path.
 */
function assignReportFile(options, value) {
  options.reportFile = value;
}

/**
 * @param {CliOptions} options Parsed options.
 * @returns {Promise<number>} Exit status.
 */
async function run(options) {
  const startedAt = performance.now();
  const sourceFiles = await collectAllSourceFiles();
  const references = await scanSourceFiles(sourceFiles);
  const summary = createSummary(sourceFiles.length, references);

  await Promise.all([
    writeJsonFile(options.jsonFile, summary),
    writeTextFile(
      options.reportFile,
      formatReport(summary, references, performance.now() - startedAt),
    ),
  ]);

  if (!options.quiet) {
    printSummary(summary, options.reportFile, performance.now() - startedAt);
  }

  return options.strict && summary.counts.assertions > 0 ? 1 : 0;
}

/**
 * @returns {Promise<string[]>} Repo-relative source files.
 */
async function collectAllSourceFiles() {
  const sourceGroups = await Promise.all(SOURCE_ROOTS.map(collectSourceFiles));
  const rootFiles = ROOT_SOURCE_FILES.filter(isSourceFile);

  return [...sourceGroups.flat(), ...rootFiles].toSorted();
}

/**
 * @param {string} directory Absolute directory.
 * @returns {Promise<string[]>} Repo-relative source files.
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
 * @returns {Promise<string[]>} Repo-relative source files.
 */
async function collectSourceEntryFiles(directory, entry) {
  const absolutePath = path.join(directory, entry.name);
  const relativePath = toRepoRelativePath(absolutePath);

  if (entry.isDirectory()) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) {
      return [];
    }

    return collectSourceFiles(absolutePath);
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
 * @param {string[]} sourceFiles Repo-relative source files.
 * @returns {Promise<TypeAssertionReference[]>} Type assertion references.
 */
async function scanSourceFiles(sourceFiles) {
  const references = await Promise.all(sourceFiles.map(scanSourceFile));

  return references.flat();
}

/**
 * @param {string} filePath Repo-relative source file.
 * @returns {Promise<TypeAssertionReference[]>} Type assertion references.
 */
async function scanSourceFile(filePath) {
  const absolutePath = path.join(ROOT, filePath);
  const text = await readFile(absolutePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const lines = text.split(/\r?\n/u);
  /** @type {TypeAssertionReference[]} */
  const references = [];

  /**
   * @param {ts.Node} node AST node.
   */
  function visit(node) {
    if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
      const typeText = node.type.getText(sourceFile);

      if (typeText === "const") {
        ts.forEachChild(node, visit);
        return;
      }

      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile),
      );

      references.push({
        column: character + 1,
        context: lines[line]?.trim() ?? "",
        filePath,
        kind: ts.isAsExpression(node) ? "as" : "angle",
        line: line + 1,
        typeText,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return references;
}

/**
 * @param {number} scannedFiles Source file count.
 * @param {TypeAssertionReference[]} references Type assertion references.
 * @returns {TypeAssertionSummary} Summary payload.
 */
function createSummary(scannedFiles, references) {
  return {
    counts: getCounts(scannedFiles, references),
    filesWithAssertions: new Set(
      references.map((reference) => reference.filePath),
    ).size,
    generatedAt: new Date().toISOString(),
    topFiles: getTopFiles(references),
  };
}

/**
 * @param {number} scannedFiles Source file count.
 * @param {TypeAssertionReference[]} references Type assertion references.
 * @returns {TypeAssertionCounts} Reference counts.
 */
function getCounts(scannedFiles, references) {
  return {
    angle: references.filter((reference) => reference.kind === "angle").length,
    assertions: references.length,
    asExpressions: references.filter((reference) => reference.kind === "as")
      .length,
    scannedFiles,
  };
}

/**
 * @param {TypeAssertionReference[]} references Type assertion references.
 * @returns {FileAssertionSummary[]} Top files.
 */
function getTopFiles(references) {
  /** @type {Map<string, TypeAssertionReference[]>} */
  const referencesByFile = new Map();

  for (const reference of references) {
    const fileReferences = referencesByFile.get(reference.filePath) ?? [];
    fileReferences.push(reference);
    referencesByFile.set(reference.filePath, fileReferences);
  }

  return [...referencesByFile]
    .map(([filePath, fileReferences]) => ({
      count: fileReferences.length,
      filePath,
      types: [...new Set(fileReferences.map((reference) => reference.typeText))]
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
 * @param {TypeAssertionSummary} summary Summary payload.
 * @param {TypeAssertionReference[]} references Type assertion references.
 * @param {number} durationMs Scan duration.
 * @returns {string} Markdown report.
 */
function formatReport(summary, references, durationMs) {
  const shownAssertions = references.slice(0, ASSERTIONS_DISPLAY_LIMIT);
  const remainingAssertions = references.length - shownAssertions.length;

  return [
    "# Type Assertion Usage",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    "## Summary",
    "",
    renderMarkdownBullets([
      `Scanned files: ${summary.counts.scannedFiles}`,
      `Type assertions: ${summary.counts.assertions}`,
      `Files with assertions: ${summary.filesWithAssertions}`,
      `As expressions: ${summary.counts.asExpressions}`,
      `Angle assertions: ${summary.counts.angle}`,
      `Duration: ${formatDuration(durationMs)}`,
    ]),
    "",
    "## Top Assertion Files",
    "",
    summary.topFiles.length === 0
      ? "No type assertions found."
      : renderMarkdownTable(
          ["File", "Assertions", "Types"],
          summary.topFiles.map((row) => [
            row.filePath,
            String(row.count),
            row.types,
          ]),
        ),
    "",
    "## Assertions",
    "",
    shownAssertions.length === 0
      ? "No assertions."
      : renderMarkdownTable(
          ["File", "Line", "Kind", "Type", "Context"],
          shownAssertions.map((reference) => [
            reference.filePath,
            `${reference.line}:${reference.column}`,
            reference.kind,
            reference.typeText,
            reference.context,
          ]),
        ),
    remainingAssertions > 0
      ? `\n${remainingAssertions} additional assertions omitted from this table.`
      : "",
    "",
    "## Policy",
    "",
    renderMarkdownBullets([
      "Use typed declarations, `satisfies`, const-generic helpers, validation, or type guards instead of TypeScript assertions.",
      "Import aliases such as `import { Foo as Bar }` are not assertion expressions and are not reported.",
      "`as const` is an allowed literal-inference assertion and is intentionally ignored.",
    ]),
    "",
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
 * @param {TypeAssertionSummary} summary Summary payload.
 * @param {string} reportFile Report output path.
 * @param {number} durationMs Scan duration.
 */
function printSummary(summary, reportFile, durationMs) {
  const hasAssertions = summary.counts.assertions > 0;

  process.stdout.write(`${sectionTitle("Type Assertion Usage")}\n`);
  process.stdout.write(
    `${formatStatusBadge(hasAssertions ? "fail" : "pass")} ${summary.counts.assertions} assertions in ${summary.filesWithAssertions} files\n`,
  );
  process.stdout.write(
    `${renderKeyValues([
      { label: "Scanned files", value: summary.counts.scannedFiles },
      { label: "As expressions", value: summary.counts.asExpressions },
      { label: "Angle assertions", value: summary.counts.angle },
      { label: "Duration", value: formatDuration(durationMs) },
      { label: "Report", value: toRepoRelativePath(reportFile) },
    ])}\n`,
  );

  if (summary.topFiles.length > 0) {
    process.stdout.write(`\n${colorText("Top files", "accent")}\n`);
    process.stdout.write(
      `${renderBullets(
        summary.topFiles.map(
          (row) => `${row.filePath} (${row.count}: ${row.types})`,
        ),
        8,
      )}\n`,
    );
  }
}

run(parseArgs(process.argv.slice(2)))
  .then((status) => {
    process.exitCode = status;
    return undefined;
  })
  .catch((error) => {
    process.stderr.write(
      `Type assertion usage scan failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
    return undefined;
  });
