#!/usr/bin/env node
// @ts-check

import path from "node:path";
import ts from "typescript";
import { formatDuration, ROOT } from "../shared/command-utils.mjs";
import * as qualityScan from "./quality-scan-utils.mjs";

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
const parseArgs = qualityScan.createQualityScanArgsParser({
  booleanOptions: qualityScan.createQualityBooleanOptions([
    [
      "--advisory",
      (options) => {
        options.strict = false;
      },
    ],
  ]),
  defaults: {
    jsonFile: DEFAULT_JSON_FILE,
    quiet: false,
    reportFile: DEFAULT_REPORT_FILE,
    strict: true,
  },
  scriptName: "type-assertion-usage",
});

/**
 * @param {CliOptions} options Parsed options.
 * @returns {Promise<number>} Exit status.
 */
async function run(options) {
  return qualityScan.runQualityReferenceScan({
    collectSourceFiles: collectAllSourceFiles,
    createSummary,
    formatReport,
    getFailureCount: (summary) => summary.counts.assertions,
    options,
    printSummary,
    scanSourceFile,
  });
}

/**
 * @returns {Promise<string[]>} Repo-relative source files.
 */
function collectAllSourceFiles() {
  return qualityScan.collectTypeScriptSourceFiles({
    rootFiles: ROOT_SOURCE_FILES,
    sourceRoots: SOURCE_ROOTS,
  });
}

/**
 * @param {string} filePath Repo-relative source file.
 * @returns {Promise<TypeAssertionReference[]>} Type assertion references.
 */
async function scanSourceFile(filePath) {
  const parsedSource = await qualityScan.readTypeScriptSourceFile(filePath);
  /** @type {TypeAssertionReference[]} */
  const references = [];

  /**
   * @param {ts.Node} node AST node.
   */
  function visit(node) {
    if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
      const typeText = node.type.getText(parsedSource.sourceFile);

      if (typeText === "const") {
        ts.forEachChild(node, visit);
        return;
      }

      references.push({
        ...qualityScan.getSourceReferenceLocation(parsedSource, node, filePath),
        kind: ts.isAsExpression(node) ? "as" : "angle",
        typeText,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(parsedSource.sourceFile);

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
  return qualityScan.getTopReferenceFiles(
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
  return qualityScan.formatLimitedReferenceReport({
    generatedAt: summary.generatedAt,
    policyItems: [
      "Use typed declarations, `satisfies`, const-generic helpers, validation, or type guards instead of TypeScript assertions.",
      "Import aliases such as `import { Foo as Bar }` are not assertion expressions and are not reported.",
      "`as const` is an allowed literal-inference assertion and is intentionally ignored.",
    ],
    referenceSection: {
      displayLimit: ASSERTIONS_DISPLAY_LIMIT,
      emptyText: "No assertions.",
      getRow: (reference) =>
        qualityScan.createLocatedReferenceRows([reference], (row) => [
          row.kind,
          row.typeText,
        ])[0] ?? [],
      headers: ["File", "Line", "Kind", "Type", "Context"],
      label: "assertions",
      references,
      title: "Assertions",
    },
    summaryItems: [
      `Scanned files: ${summary.counts.scannedFiles}`,
      `Type assertions: ${summary.counts.assertions}`,
      `Files with assertions: ${summary.filesWithAssertions}`,
      `As expressions: ${summary.counts.asExpressions}`,
      `Angle assertions: ${summary.counts.angle}`,
      `Duration: ${formatDuration(durationMs)}`,
    ],
    title: "Type Assertion Usage",
    topSection: {
      emptyText: "No type assertions found.",
      headers: ["File", "Assertions", "Types"],
      rows: qualityScan.createTopReferenceRows(summary.topFiles, "types"),
      title: "Top Assertion Files",
    },
  });
}

/**
 * @param {TypeAssertionSummary} summary Summary payload.
 * @param {string} reportFile Report output path.
 * @param {number} durationMs Scan duration.
 */
function printSummary(summary, reportFile, durationMs) {
  const hasAssertions = summary.counts.assertions > 0;

  qualityScan.printQualityScanSummary({
    headline: `${summary.counts.assertions} assertions in ${summary.filesWithAssertions} files`,
    keyValues: [
      { label: "Scanned files", value: summary.counts.scannedFiles },
      { label: "As expressions", value: summary.counts.asExpressions },
      { label: "Angle assertions", value: summary.counts.angle },
      qualityScan.createDurationKeyValue(durationMs),
    ],
    reportFile,
    status: hasAssertions ? "fail" : "pass",
    title: "Type Assertion Usage",
    topItems: qualityScan.createTopReferenceItems(summary.topFiles, "types"),
  });
}

qualityScan.runQualityScanCli({
  errorLabel: "Type assertion usage scan",
  parseArgs,
  run,
});
