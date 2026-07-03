#!/usr/bin/env node
// @ts-check

import path from "node:path";
import ts from "typescript";
import {
  colorText,
  formatDuration,
  formatStatusBadge,
  ROOT,
  renderBullets,
  renderKeyValues,
  renderMarkdownTable,
  sectionTitle,
  toRepoRelativePath,
  writeJsonFile,
  writeTextFile,
} from "../shared/command-utils.mjs";
import {
  collectTypeScriptSourceFiles,
  getTopReferenceFiles,
  parseQualityScanArgs,
  readTypeScriptSourceFile,
  renderMarkdownBullets,
} from "./quality-scan-utils.mjs";

/**
 * @typedef {"as" | "angle"} TypeAssertionKind
 * @typedef {{ jsonFile: string; quiet: boolean; reportFile: string; strict: boolean }} CliOptions
 * @typedef {{ column: number; context: string; filePath: string; kind: TypeAssertionKind; line: number; typeText: string }} TypeAssertionReference
 * @typedef {{ count: number; filePath: string; types: string }} FileAssertionSummary
 * @typedef {{ angle: number; assertions: number; asExpressions: number; scannedFiles: number }} TypeAssertionCounts
 * @typedef {{ counts: TypeAssertionCounts; filesWithAssertions: number; generatedAt: string; topFiles: FileAssertionSummary[] }} TypeAssertionSummary
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
/** @type {Map<string, import("./quality-scan-utils.mjs").BooleanOptionSetter>} */
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

/**
 * @param {string[]} argv CLI arguments.
 * @returns {CliOptions} Parsed options.
 */
function parseArgs(argv) {
  return parseQualityScanArgs(argv, {
    booleanOptions: BOOLEAN_OPTIONS,
    defaults: {
      jsonFile: DEFAULT_JSON_FILE,
      quiet: false,
      reportFile: DEFAULT_REPORT_FILE,
      strict: true,
    },
    scriptName: "type-assertion-usage",
  });
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
  return collectTypeScriptSourceFiles({
    rootFiles: ROOT_SOURCE_FILES,
    sourceRoots: SOURCE_ROOTS,
  });
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
  const { lines, sourceFile } = await readTypeScriptSourceFile(filePath);
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
  return getTopReferenceFiles(
    references,
    "types",
    (reference) => reference.typeText,
  );
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
