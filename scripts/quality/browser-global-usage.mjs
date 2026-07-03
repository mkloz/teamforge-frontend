#!/usr/bin/env node
// @ts-check

import path from "node:path";
import ts from "typescript";
import { formatDuration, ROOT } from "../shared/command-utils.mjs";
import * as qualityScan from "./quality-scan-utils.mjs";

/**
 * @typedef {"allowed" | "finding" | "guard" | "type-only"} BrowserGlobalKind
 * @typedef {"document" | "navigator" | "window"} BrowserGlobalName
 * @typedef {{ jsonFile: string; quiet: boolean; reportFile: string; strict: boolean }} CliOptions
 * @typedef {{ column: number; context: string; filePath: string; global: BrowserGlobalName; kind: BrowserGlobalKind; line: number }} BrowserGlobalReference
 * @typedef {{ count: number; filePath: string; globals: string }} FileFindingSummary
 * @typedef {{ allowed: number; direct: number; findings: number; guards: number; scannedFiles: number; typeOnly: number }} BrowserGlobalCounts
 * @typedef {{ counts: BrowserGlobalCounts; filesWithFindings: number; generatedAt: string; topFiles: FileFindingSummary[] }} BrowserGlobalSummary
 */

const SOURCE_ROOTS = [path.join(ROOT, "src")];
const DEFAULT_REPORT_FILE = path.join(
  ROOT,
  "reports",
  "browser-global-usage.md",
);
const DEFAULT_JSON_FILE = path.join(
  ROOT,
  "temp",
  "browser-global-usage-summary.json",
);
const FINDINGS_DISPLAY_LIMIT = 80;
/** @type {readonly BrowserGlobalName[]} */
const BROWSER_GLOBALS = ["document", "navigator", "window"];
const BROWSER_GLOBAL_SET = new Set(BROWSER_GLOBALS);
const ALLOWED_DIRECTORIES = ["src/shared/lib/browser-environment/"];
const ALLOWED_FILES = new Set(["src/main.tsx"]);
const DECLARATION_NAME_KINDS = new Set([
  ts.SyntaxKind.BindingElement,
  ts.SyntaxKind.ClassDeclaration,
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.InterfaceDeclaration,
  ts.SyntaxKind.Parameter,
  ts.SyntaxKind.PropertyDeclaration,
  ts.SyntaxKind.PropertySignature,
  ts.SyntaxKind.TypeAliasDeclaration,
  ts.SyntaxKind.VariableDeclaration,
]);
const TYPE_ONLY_REFERENCE_KINDS = new Set([
  ts.SyntaxKind.ExpressionWithTypeArguments,
  ts.SyntaxKind.ImportType,
  ts.SyntaxKind.InterfaceDeclaration,
  ts.SyntaxKind.TypeAliasDeclaration,
  ts.SyntaxKind.TypeQuery,
  ts.SyntaxKind.TypeReference,
]);
const TRANSPARENT_TYPE_REFERENCE_KINDS = new Set([
  ts.SyntaxKind.ArrayType,
  ts.SyntaxKind.IndexedAccessType,
  ts.SyntaxKind.LiteralType,
  ts.SyntaxKind.ParenthesizedType,
  ts.SyntaxKind.TypeLiteral,
  ts.SyntaxKind.UnionType,
]);
const parseArgs = qualityScan.createQualityScanArgsParser({
  booleanOptions: qualityScan.createQualityBooleanOptions(),
  defaults: {
    jsonFile: DEFAULT_JSON_FILE,
    quiet: false,
    reportFile: DEFAULT_REPORT_FILE,
    strict: false,
  },
  scriptName: "browser-global-usage",
});

/**
 * @param {CliOptions} options Parsed options.
 * @returns {Promise<number>} Exit status.
 */
async function run(options) {
  return qualityScan.runQualityReferenceScan({
    collectSourceFiles,
    createSummary,
    formatReport,
    getFailureCount: (summary) => summary.counts.findings,
    options,
    printSummary,
    scanSourceFile,
  });
}

/**
 * @returns {Promise<string[]>} Repo-relative source files.
 */
function collectSourceFiles() {
  return qualityScan.collectTypeScriptSourceFiles({
    sourceRoots: SOURCE_ROOTS,
  });
}

/**
 * @param {string} filePath Repo-relative source file.
 * @returns {Promise<BrowserGlobalReference[]>} Browser global references.
 */
async function scanSourceFile(filePath) {
  const parsedSource = await qualityScan.readTypeScriptSourceFile(filePath);
  /** @type {BrowserGlobalReference[]} */
  const references = [];

  /**
   * @param {ts.Node} node AST node.
   */
  function visit(node) {
    if (isBrowserGlobalIdentifier(node) && shouldTrackIdentifier(node)) {
      references.push({
        ...qualityScan.getSourceReferenceLocation(parsedSource, node, filePath),
        global: node.text,
        kind: classifyBrowserGlobalReference(filePath, node),
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(parsedSource.sourceFile);

  return references;
}

/**
 * @param {ts.Node} node AST node.
 * @returns {node is ts.Identifier & { text: BrowserGlobalName }} Whether this is a tracked browser global.
 */
function isBrowserGlobalIdentifier(node) {
  return ts.isIdentifier(node) && BROWSER_GLOBAL_SET.has(node.text);
}

/**
 * @param {ts.Identifier} node Candidate global identifier.
 * @returns {boolean} Whether this identifier should be tracked.
 */
function shouldTrackIdentifier(node) {
  return (
    !isDeclarationName(node) &&
    !isNonGlobalPropertyName(node) &&
    !isImportIdentifier(node)
  );
}

/**
 * @param {ts.Identifier} node Candidate identifier.
 * @returns {boolean} Whether the identifier declares a local symbol.
 */
function isDeclarationName(node) {
  const parent = node.parent;

  return DECLARATION_NAME_KINDS.has(parent.kind) && parent.name === node;
}

/**
 * @param {ts.Identifier} node Candidate identifier.
 * @returns {boolean} Whether this is a property name, not the global object.
 */
function isNonGlobalPropertyName(node) {
  const parent = node.parent;

  if (ts.isPropertyAccessExpression(parent)) {
    return parent.name === node && !isGlobalThisExpression(parent.expression);
  }

  if (ts.isPropertyAssignment(parent) || ts.isMethodDeclaration(parent)) {
    return parent.name === node;
  }

  return false;
}

/**
 * @param {ts.Expression} expression Candidate expression.
 * @returns {boolean} Whether the expression is globalThis.
 */
function isGlobalThisExpression(expression) {
  return ts.isIdentifier(expression) && expression.text === "globalThis";
}

/**
 * @param {ts.Identifier} node Candidate identifier.
 * @returns {boolean} Whether this belongs to an import declaration.
 */
function isImportIdentifier(node) {
  let current = /** @type {ts.Node | undefined} */ (node);

  while (current) {
    if (
      ts.isImportClause(current) ||
      ts.isImportDeclaration(current) ||
      ts.isImportSpecifier(current) ||
      ts.isNamespaceImport(current)
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

/**
 * @param {string} filePath Repo-relative path.
 * @param {ts.Identifier} node Browser global identifier.
 * @returns {BrowserGlobalKind} Reference classification.
 */
function classifyBrowserGlobalReference(filePath, node) {
  if (isTypeOnlyReference(node)) {
    return "type-only";
  }

  if (isAllowedBrowserBoundary(filePath)) {
    return "allowed";
  }

  if (isTypeofGuard(node)) {
    return "guard";
  }

  return "finding";
}

/**
 * @param {ts.Identifier} node Browser global identifier.
 * @returns {boolean} Whether this is only used in type syntax.
 */
function isTypeOnlyReference(node) {
  let current = /** @type {ts.Node} */ (node);

  while (current.parent) {
    const parent = current.parent;

    if (TYPE_ONLY_REFERENCE_KINDS.has(parent.kind)) {
      return true;
    }

    if (TRANSPARENT_TYPE_REFERENCE_KINDS.has(parent.kind)) {
      current = parent;
      continue;
    }

    break;
  }

  return false;
}

/**
 * @param {ts.Identifier} node Browser global identifier.
 * @returns {boolean} Whether this is a safe environment guard.
 */
function isTypeofGuard(node) {
  let current = /** @type {ts.Node} */ (node);

  while (current.parent && ts.isPropertyAccessExpression(current.parent)) {
    current = current.parent;
  }

  return current.parent ? ts.isTypeOfExpression(current.parent) : false;
}

/**
 * @param {string} filePath Repo-relative file path.
 * @returns {boolean} Whether direct browser globals are permitted here.
 */
function isAllowedBrowserBoundary(filePath) {
  return (
    ALLOWED_FILES.has(filePath) ||
    ALLOWED_DIRECTORIES.some((directory) => filePath.startsWith(directory))
  );
}

/**
 * @param {number} scannedFiles Source file count.
 * @param {BrowserGlobalReference[]} references Browser global references.
 * @returns {BrowserGlobalSummary} Summary payload.
 */
function createSummary(scannedFiles, references) {
  const counts = getCounts(scannedFiles, references);
  const findings = references.filter(
    (reference) => reference.kind === "finding",
  );
  const topFiles = getTopFiles(findings);

  return {
    counts,
    filesWithFindings: new Set(findings.map((reference) => reference.filePath))
      .size,
    generatedAt: new Date().toISOString(),
    topFiles,
  };
}

/**
 * @param {number} scannedFiles Source file count.
 * @param {BrowserGlobalReference[]} references Browser global references.
 * @returns {BrowserGlobalCounts} Reference counts.
 */
function getCounts(scannedFiles, references) {
  return {
    allowed: countReferences(references, "allowed"),
    direct: references.filter((reference) => reference.kind !== "type-only")
      .length,
    findings: countReferences(references, "finding"),
    guards: countReferences(references, "guard"),
    scannedFiles,
    typeOnly: countReferences(references, "type-only"),
  };
}

/**
 * @param {BrowserGlobalReference[]} references Browser global references.
 * @param {BrowserGlobalKind} kind Kind to count.
 * @returns {number} Count.
 */
function countReferences(references, kind) {
  return references.filter((reference) => reference.kind === kind).length;
}

/**
 * @param {BrowserGlobalReference[]} findings Finding references.
 * @returns {FileFindingSummary[]} Top files.
 */
function getTopFiles(findings) {
  return qualityScan.getTopReferenceFiles(
    findings,
    "globals",
    (finding) => finding.global,
  );
}

/**
 * @param {BrowserGlobalSummary} summary Summary payload.
 * @param {BrowserGlobalReference[]} references Browser global references.
 * @param {number} durationMs Scan duration.
 * @returns {string} Markdown report.
 */
function formatReport(summary, references, durationMs) {
  const findings = references.filter(
    (reference) => reference.kind === "finding",
  );

  return qualityScan.formatLimitedReferenceReport({
    generatedAt: summary.generatedAt,
    policyItems: [
      "Product code should use `src/shared/lib/browser-environment/` helpers instead of direct browser globals.",
      "`typeof window/document/navigator` checks are recorded as guards and kept separate from findings.",
      "`src/main.tsx` and the browser-environment helper modules are approved browser boundaries.",
    ],
    referenceSection: {
      displayLimit: FINDINGS_DISPLAY_LIMIT,
      emptyText: "No findings.",
      getRow: (reference) =>
        qualityScan.createLocatedReferenceRows([reference], (row) => [
          row.global,
        ])[0] ?? [],
      headers: ["File", "Line", "Global", "Context"],
      label: "findings",
      references: findings,
      title: "Findings",
    },
    summaryItems: [
      `Scanned files: ${summary.counts.scannedFiles}`,
      `Direct browser global references: ${summary.counts.direct}`,
      `Findings outside approved browser boundaries: ${summary.counts.findings}`,
      `Files with findings: ${summary.filesWithFindings}`,
      `Safe environment guards: ${summary.counts.guards}`,
      `Approved boundary references: ${summary.counts.allowed}`,
      `Type-only references: ${summary.counts.typeOnly}`,
      `Duration: ${formatDuration(durationMs)}`,
    ],
    title: "Browser Global Usage",
    topSection: {
      emptyText: "No non-boundary browser global findings.",
      headers: ["File", "Findings", "Globals"],
      rows: qualityScan.createTopReferenceRows(summary.topFiles, "globals"),
      title: "Top Finding Files",
    },
  });
}

/**
 * @param {BrowserGlobalSummary} summary Summary payload.
 * @param {string} reportFile Report output path.
 * @param {number} durationMs Scan duration.
 */
function printSummary(summary, reportFile, durationMs) {
  const hasFindings = summary.counts.findings > 0;

  qualityScan.printQualityScanSummary({
    headline: `${summary.counts.findings} findings in ${summary.filesWithFindings} files`,
    keyValues: [
      { label: "Scanned files", value: summary.counts.scannedFiles },
      { label: "Direct refs", value: summary.counts.direct },
      {
        label: "Approved refs",
        tone: "muted",
        value: summary.counts.allowed,
      },
      { label: "Guards", tone: "muted", value: summary.counts.guards },
      qualityScan.createDurationKeyValue(durationMs),
    ],
    reportFile,
    status: hasFindings ? "review" : "pass",
    title: "Browser Global Usage",
    topItems: qualityScan.createTopReferenceItems(summary.topFiles, "globals"),
  });
}

qualityScan.runQualityScanCli({
  errorLabel: "Browser global usage scan",
  parseArgs,
  run,
});
