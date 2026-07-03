#!/usr/bin/env node
// @ts-check

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import {
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
 * @typedef {"DELETE" | "GET" | "PATCH" | "POST" | "PUT"} HttpMethod
 * @typedef {{ jsonFile: string; quiet: boolean; reportFile: string; strict: boolean }} CliOptions
 * @typedef {{ hasConflictResponse: boolean; hasSecurityNone: boolean; method: HttpMethod; path: string; rawPath: string; signature: string }} OpenApiOperation
 * @typedef {{ method: HttpMethod; path: string; rawPath: string; lines: string[] }} OpenApiOperationBlock
 * @typedef {{ activeOperation: OpenApiOperationBlock | null; currentPath: string | null }} OpenApiScanState
 * @typedef {{ column: number; filePath: string; line: number; method: HttpMethod; path: string; rawPath: string; signature: string }} ApiCallSite
 * @typedef {{ column: number; filePath: string; line: number; method: HttpMethod; rawExpression: string }} DynamicApiCallSite
 * @typedef {{ signature: string; count: number; callers: string[] }} DuplicateEndpointFamily
 * @typedef {{ chatTypeNotes: boolean; conflictResponseOperations: number; errorToastConflictMessageUsages: number; fileUploadApiCalls: number; fileUploadOpenApiOperations: number; requestIdFields: number; requiredVersionSchemas: string[]; webPushPublicKeyAllowsAnonymous: boolean }} ContractMarkers
 * @typedef {keyof typeof BASELINE} BaselineMetricKey
 * @typedef {{ current: number; key: BaselineMetricKey; label: string; status: string }} BaselineRow
 * @typedef {{ inSchemas: boolean; name: string | null; text: string }} SchemaScanState
 * @typedef {(options: CliOptions) => void} BooleanOptionSetter
 * @typedef {(options: CliOptions, value: string) => void} ValueOptionSetter
 * @typedef {{ prefix: string; set: ValueOptionSetter }} InlineValueOption
 */

const DEFAULT_REPORT_FILE = path.join(
  ROOT,
  "reports",
  "api-contract-inventory.md",
);
const DEFAULT_JSON_FILE = path.join(
  ROOT,
  "temp",
  "api-contract-inventory.json",
);
const OPEN_API_FILE = path.join(ROOT, "docs", "open-api.yaml");
const SOURCE_ROOT = path.join(ROOT, "src");
/** @type {Map<string, HttpMethod>} */
const HTTP_METHOD_BY_NAME = new Map([
  ["delete", "DELETE"],
  ["get", "GET"],
  ["patch", "PATCH"],
  ["post", "POST"],
  ["put", "PUT"],
]);
/** @type {Map<string, BooleanOptionSetter>} */
const BOOLEAN_OPTIONS = new Map([
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
/** @type {InlineValueOption[]} */
const INLINE_VALUE_OPTIONS = [
  {
    prefix: "--json-file=",
    set: assignJsonFile,
  },
  {
    prefix: "--report-file=",
    set: assignReportFile,
  },
];
const BASELINE = {
  duplicateEndpointFamilies: 9,
  explicitApiClientCalls: 70,
  missingOpenApiOperations: 0,
  uniqueApiSignatures: 60,
};
const BASELINE_METRICS = [
  {
    key: "explicitApiClientCalls",
    label: "Explicit apiClient calls",
  },
  {
    key: "uniqueApiSignatures",
    label: "Unique API signatures",
  },
  {
    key: "missingOpenApiOperations",
    label: "Missing OpenAPI operations",
  },
  {
    key: "duplicateEndpointFamilies",
    label: "Duplicate wrapper families",
  },
];
const SKIPPED_DIRECTORIES = new Set([
  ".git",
  "coverage",
  "dist",
  "node_modules",
  "reports",
  "temp",
]);
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

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
    strict: false,
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

  const inlineOption = INLINE_VALUE_OPTIONS.find((option) =>
    arg.startsWith(option.prefix),
  );

  if (inlineOption) {
    inlineOption.set(options, arg.slice(inlineOption.prefix.length));
    return 0;
  }

  throw new Error(`Unknown api-contract-inventory argument: ${arg}`);
}

/**
 * @param {CliOptions} options Mutable options.
 * @param {string} value JSON output path.
 * @returns {void}
 */
function assignJsonFile(options, value) {
  options.jsonFile = value;
}

/**
 * @param {CliOptions} options Mutable options.
 * @param {string} value Report output path.
 * @returns {void}
 */
function assignReportFile(options, value) {
  options.reportFile = value;
}

/**
 * @param {CliOptions} options Parsed CLI options.
 * @returns {Promise<number>} Exit status.
 */
async function run(options) {
  const startedAt = performance.now();
  const [openApiText, sourceFiles] = await Promise.all([
    readFile(OPEN_API_FILE, "utf8"),
    collectSourceFiles(SOURCE_ROOT),
  ]);
  const openApiOperations = parseOpenApiOperations(openApiText);
  const scannedSources = await scanSourceFiles(sourceFiles);
  const uniqueFrontendSignatures = getUniqueSignatures(
    scannedSources.callSites,
  );
  const missingOpenApiOperations = getMissingOpenApiOperations(
    uniqueFrontendSignatures,
    openApiOperations,
  );
  const duplicateEndpointFamilies = getDuplicateEndpointFamilies(
    scannedSources.callSites,
  );
  const markers = collectContractMarkers(
    openApiText,
    openApiOperations,
    scannedSources,
  );
  const durationMs = performance.now() - startedAt;
  const status = options.strict && missingOpenApiOperations.length > 0 ? 1 : 0;
  const generatedAt = new Date().toISOString();
  const payload = {
    contractMarkers: markers,
    duplicateEndpointFamilies,
    durationMs,
    dynamicApiCallSites: scannedSources.dynamicCallSites,
    generatedAt,
    missingOpenApiOperations,
    openApiOperations,
    options: {
      strict: options.strict,
    },
    sourceFileCount: sourceFiles.length,
    summary: {
      duplicateEndpointFamilies: duplicateEndpointFamilies.length,
      dynamicApiCallSites: scannedSources.dynamicCallSites.length,
      explicitApiClientCalls: scannedSources.callSites.length,
      missingOpenApiOperations: missingOpenApiOperations.length,
      openApiOperations: openApiOperations.length,
      uniqueApiSignatures: uniqueFrontendSignatures.length,
    },
  };

  await Promise.all([
    writeJsonFile(path.resolve(ROOT, options.jsonFile), payload),
    writeTextFile(
      path.resolve(ROOT, options.reportFile),
      renderReport({
        duplicateEndpointFamilies,
        durationMs,
        generatedAt,
        markers,
        missingOpenApiOperations,
        openApiOperations,
        options,
        scannedSources,
        uniqueFrontendSignatures,
      }),
    ),
  ]);

  if (!options.quiet) {
    printSummary(payload.summary, status, durationMs, options);
  }

  return status;
}

/**
 * @param {string} directory Directory to scan.
 * @returns {Promise<string[]>} Source files.
 */
async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  /** @type {string[]} */
  const directoryPaths = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) {
        directoryPaths.push(absolutePath);
      }
    }
  }

  const nestedFiles = await Promise.all(
    directoryPaths.map((filePath) => collectSourceFiles(filePath)),
  );
  const currentFiles = entries
    .filter(
      (entry) =>
        entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name)),
    )
    .map((entry) => path.join(directory, entry.name));

  return [...currentFiles, ...nestedFiles.flat()].sort((left, right) =>
    left.localeCompare(right),
  );
}

/**
 * @param {string[]} files Source files.
 * @returns {Promise<{ callSites: ApiCallSite[]; dynamicCallSites: DynamicApiCallSite[]; sourceTexts: string[] }>} Scan result.
 */
async function scanSourceFiles(files) {
  const sourceTexts = await Promise.all(
    files.map((filePath) => readFile(filePath, "utf8")),
  );
  /** @type {ApiCallSite[]} */
  const callSites = [];
  /** @type {DynamicApiCallSite[]} */
  const dynamicCallSites = [];

  for (const [index, text] of sourceTexts.entries()) {
    scanSourceFile(files[index], text, callSites, dynamicCallSites);
  }

  return { callSites, dynamicCallSites, sourceTexts };
}

/**
 * @param {string} filePath Source file path.
 * @param {string} text Source text.
 * @param {ApiCallSite[]} callSites Collected static call sites.
 * @param {DynamicApiCallSite[]} dynamicCallSites Collected dynamic call sites.
 * @returns {void}
 */
function scanSourceFile(filePath, text, callSites, dynamicCallSites) {
  const sourceFile = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  /**
   * @param {ts.Node} node AST node.
   * @returns {void}
   */
  function visit(node) {
    if (ts.isCallExpression(node)) {
      collectApiClientCallSite(
        filePath,
        sourceFile,
        node,
        callSites,
        dynamicCallSites,
      );
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

/**
 * @param {string} filePath Source file path.
 * @param {ts.SourceFile} sourceFile Source file.
 * @param {ts.CallExpression} node Call expression.
 * @param {ApiCallSite[]} callSites Collected static call sites.
 * @param {DynamicApiCallSite[]} dynamicCallSites Collected dynamic call sites.
 * @returns {void}
 */
function collectApiClientCallSite(
  filePath,
  sourceFile,
  node,
  callSites,
  dynamicCallSites,
) {
  const method = getApiClientCallMethod(node);
  const firstArg = node.arguments[0];

  if (!method || !firstArg) {
    return;
  }

  const position = sourceFile.getLineAndCharacterOfPosition(
    firstArg.getStart(sourceFile),
  );
  const normalizedPath = getStaticEndpointPath(firstArg);

  if (normalizedPath === null) {
    dynamicCallSites.push(
      buildDynamicApiCallSite(filePath, sourceFile, firstArg, method, position),
    );
    return;
  }

  callSites.push(buildApiCallSite(filePath, normalizedPath, method, position));
}

/**
 * @param {ts.CallExpression} node Call expression.
 * @returns {HttpMethod | null} API client HTTP method.
 */
function getApiClientCallMethod(node) {
  if (!ts.isPropertyAccessExpression(node.expression)) {
    return null;
  }

  const { expression, name } = node.expression;

  if (!ts.isIdentifier(expression) || expression.text !== "apiClient") {
    return null;
  }

  return HTTP_METHOD_BY_NAME.get(name.text.toLowerCase()) ?? null;
}

/**
 * @param {string} filePath Source file path.
 * @param {string} rawPath Raw endpoint path.
 * @param {HttpMethod} method HTTP method.
 * @param {ts.LineAndCharacter} position Source position.
 * @returns {ApiCallSite} Static API call site.
 */
function buildApiCallSite(filePath, rawPath, method, position) {
  const normalized = normalizeEndpointPath(rawPath);

  return {
    column: position.character + 1,
    filePath: toRepoRelativePath(filePath),
    line: position.line + 1,
    method,
    path: normalized,
    rawPath,
    signature: getSignature(method, normalized),
  };
}

/**
 * @param {string} filePath Source file path.
 * @param {ts.SourceFile} sourceFile Source file.
 * @param {ts.Expression} expression Endpoint expression.
 * @param {HttpMethod} method HTTP method.
 * @param {ts.LineAndCharacter} position Source position.
 * @returns {DynamicApiCallSite} Dynamic API call site.
 */
function buildDynamicApiCallSite(
  filePath,
  sourceFile,
  expression,
  method,
  position,
) {
  return {
    column: position.character + 1,
    filePath: toRepoRelativePath(filePath),
    line: position.line + 1,
    method,
    rawExpression: expression.getText(sourceFile),
  };
}

/**
 * @param {ts.Expression} node Endpoint expression.
 * @returns {string | null} Static endpoint path.
 */
function getStaticEndpointPath(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (ts.isTemplateExpression(node)) {
    return node.templateSpans.reduce(
      (pathText, span) => `${pathText}{param}${span.literal.text}`,
      node.head.text,
    );
  }

  return null;
}

/**
 * @param {string} openApiText OpenAPI YAML.
 * @returns {OpenApiOperation[]} Parsed operations.
 */
function parseOpenApiOperations(openApiText) {
  const lines = openApiText.split(/\r?\n/u);
  /** @type {OpenApiOperation[]} */
  const operations = [];
  /** @type {OpenApiScanState} */
  const state = {
    activeOperation: null,
    currentPath: null,
  };

  for (const line of lines) {
    scanOpenApiLine(state, operations, line);
  }

  finishOpenApiOperation(state.activeOperation, operations);

  return operations;
}

/**
 * @param {OpenApiScanState} state Mutable scan state.
 * @param {OpenApiOperation[]} operations Collected operations.
 * @param {string} line Current line.
 * @returns {void}
 */
function scanOpenApiLine(state, operations, line) {
  if (scanOpenApiPathLine(state, operations, line)) {
    return;
  }

  if (scanOpenApiMethodLine(state, operations, line)) {
    return;
  }

  state.activeOperation?.lines.push(line);
}

/**
 * @param {OpenApiScanState} state Mutable scan state.
 * @param {OpenApiOperation[]} operations Collected operations.
 * @param {string} line Current line.
 * @returns {boolean} Whether the line was handled.
 */
function scanOpenApiPathLine(state, operations, line) {
  const pathMatch = /^ {2}(\/[^:]+):\s*$/u.exec(line);

  if (!pathMatch) {
    return false;
  }

  state.activeOperation = finishOpenApiOperation(
    state.activeOperation,
    operations,
  );
  state.currentPath = pathMatch[1];

  return true;
}

/**
 * @param {OpenApiScanState} state Mutable scan state.
 * @param {OpenApiOperation[]} operations Collected operations.
 * @param {string} line Current line.
 * @returns {boolean} Whether the line was handled.
 */
function scanOpenApiMethodLine(state, operations, line) {
  const methodMatch = /^ {4}(delete|get|patch|post|put):\s*$/u.exec(line);

  if (!methodMatch || !state.currentPath) {
    return false;
  }

  state.activeOperation = finishOpenApiOperation(
    state.activeOperation,
    operations,
  );
  state.activeOperation = buildOpenApiOperationBlock(
    methodMatch[1],
    state.currentPath,
    line,
  );

  return true;
}

/**
 * @param {string} methodName Lowercase HTTP method.
 * @param {string} currentPath Current OpenAPI path.
 * @param {string} line Method line.
 * @returns {OpenApiOperationBlock | null} Active operation block.
 */
function buildOpenApiOperationBlock(methodName, currentPath, line) {
  const method = HTTP_METHOD_BY_NAME.get(methodName);

  if (!method) {
    return null;
  }

  return {
    lines: [line],
    method,
    path: normalizeEndpointPath(currentPath),
    rawPath: currentPath,
  };
}

/**
 * @param {OpenApiOperationBlock | null} operation Active operation.
 * @param {OpenApiOperation[]} operations Collected operations.
 * @returns {null}
 */
function finishOpenApiOperation(operation, operations) {
  if (!operation) {
    return null;
  }

  const block = operation.lines.join("\n");

  operations.push({
    hasConflictResponse: /^ {8}'?409'?:/mu.test(block),
    hasSecurityNone: /^\s+security:\s*\[\]\s*$/mu.test(block),
    method: operation.method,
    path: operation.path,
    rawPath: operation.rawPath,
    signature: getSignature(operation.method, operation.path),
  });

  return null;
}

/**
 * @param {string} endpointPath Endpoint path.
 * @returns {string} Normalized path.
 */
function normalizeEndpointPath(endpointPath) {
  return endpointPath
    .replace(/[?#].*$/u, "")
    .replace(/^\s*\/?/u, "")
    .replace(/^api\/v1\/?/u, "")
    .replace(/\$\{[^}]+\}/gu, "{param}")
    .replace(/\{[^}/]+\}/gu, "{param}")
    .replace(/\/+/gu, "/")
    .replace(/\/$/u, "");
}

/**
 * @param {HttpMethod} method HTTP method.
 * @param {string} endpointPath Normalized endpoint path.
 * @returns {string} Signature.
 */
function getSignature(method, endpointPath) {
  return `${method} ${endpointPath || "/"}`;
}

/**
 * @param {ApiCallSite[]} callSites Frontend call sites.
 * @returns {string[]} Unique signatures.
 */
function getUniqueSignatures(callSites) {
  return [...new Set(callSites.map((callSite) => callSite.signature))].sort();
}

/**
 * @param {string[]} frontendSignatures Frontend signatures.
 * @param {OpenApiOperation[]} openApiOperations OpenAPI operations.
 * @returns {string[]} Missing signatures.
 */
function getMissingOpenApiOperations(frontendSignatures, openApiOperations) {
  const documentedSignatures = new Set(
    openApiOperations.map((operation) => operation.signature),
  );

  return frontendSignatures.filter(
    (signature) => !documentedSignatures.has(signature),
  );
}

/**
 * @param {ApiCallSite[]} callSites Frontend call sites.
 * @returns {DuplicateEndpointFamily[]} Duplicate endpoint families.
 */
function getDuplicateEndpointFamilies(callSites) {
  /** @type {Map<string, ApiCallSite[]>} */
  const bySignature = new Map();

  for (const callSite of callSites) {
    const calls = bySignature.get(callSite.signature) ?? [];
    calls.push(callSite);
    bySignature.set(callSite.signature, calls);
  }

  return [...bySignature.entries()]
    .filter(([, calls]) => calls.length > 1)
    .map(([signature, calls]) => ({
      callers: calls.map(
        (call) => `${call.filePath}:${call.line}:${call.column}`,
      ),
      count: calls.length,
      signature,
    }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.signature.localeCompare(right.signature),
    );
}

/**
 * @param {string} openApiText OpenAPI YAML.
 * @param {OpenApiOperation[]} openApiOperations OpenAPI operations.
 * @param {{ callSites: ApiCallSite[]; sourceTexts: string[] }} scannedSources Source scan result.
 * @returns {ContractMarkers} Contract marker summary.
 */
function collectContractMarkers(
  openApiText,
  openApiOperations,
  scannedSources,
) {
  const sourceText = scannedSources.sourceTexts.join("\n");
  const webPushPublicKey = openApiOperations.find(
    (operation) =>
      operation.signature === "GET notifications/web-push/public-key",
  );

  return {
    chatTypeNotes:
      /\bNOTES\b/u.test(openApiText) && /"NOTES"/u.test(sourceText),
    conflictResponseOperations: openApiOperations.filter(
      (operation) => operation.hasConflictResponse,
    ).length,
    errorToastConflictMessageUsages: countMatches(
      sourceText,
      /\berrorToastConflictMessage\b/gu,
    ),
    fileUploadApiCalls: scannedSources.callSites.filter((callSite) =>
      callSite.path.startsWith("file-upload/"),
    ).length,
    fileUploadOpenApiOperations: openApiOperations.filter((operation) =>
      operation.path.startsWith("file-upload/"),
    ).length,
    requestIdFields: countMatches(openApiText, /\brequestId:/gu),
    requiredVersionSchemas: getRequiredVersionSchemas(openApiText),
    webPushPublicKeyAllowsAnonymous: Boolean(webPushPublicKey?.hasSecurityNone),
  };
}

/**
 * @param {string} value Text to scan.
 * @param {RegExp} pattern Global pattern.
 * @returns {number} Match count.
 */
function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

/**
 * @param {string} openApiText OpenAPI YAML.
 * @returns {string[]} Schemas where version is required.
 */
function getRequiredVersionSchemas(openApiText) {
  const lines = openApiText.split(/\r?\n/u);
  /** @type {string[]} */
  const schemaNames = [];
  /** @type {SchemaScanState} */
  const state = {
    inSchemas: false,
    name: null,
    text: "",
  };

  for (const line of lines) {
    scanSchemaLine(state, schemaNames, line);
  }

  schemaNames.push(...getSchemaRequiredVersion(state.name, state.text));

  return schemaNames.sort((left, right) => left.localeCompare(right));
}

/**
 * @param {SchemaScanState} state Mutable schema scan state.
 * @param {string[]} schemaNames Required-version schema names.
 * @param {string} line Current line.
 * @returns {void}
 */
function scanSchemaLine(state, schemaNames, line) {
  if (scanSchemaStartLine(state, line)) {
    return;
  }

  if (scanSchemaHeadingLine(state, schemaNames, line)) {
    return;
  }

  if (state.name) {
    state.text += `${line}\n`;
  }
}

/**
 * @param {SchemaScanState} state Mutable schema scan state.
 * @param {string} line Current line.
 * @returns {boolean} Whether the line was handled.
 */
function scanSchemaStartLine(state, line) {
  if (!/^ {2}schemas:\s*$/u.test(line)) {
    return false;
  }

  state.inSchemas = true;

  return true;
}

/**
 * @param {SchemaScanState} state Mutable schema scan state.
 * @param {string[]} schemaNames Required-version schema names.
 * @param {string} line Current line.
 * @returns {boolean} Whether the line was handled.
 */
function scanSchemaHeadingLine(state, schemaNames, line) {
  if (!state.inSchemas) {
    return false;
  }

  const schemaMatch = /^ {4}([a-zA-Z][\w-]+):\s*$/u.exec(line);

  if (!schemaMatch) {
    return false;
  }

  schemaNames.push(...getSchemaRequiredVersion(state.name, state.text));
  state.name = schemaMatch[1];
  state.text = "";

  return true;
}

/**
 * @param {string | null} schemaName Schema name.
 * @param {string} schemaBlock Schema text block.
 * @returns {string[]} Schema name when version is required.
 */
function getSchemaRequiredVersion(schemaName, schemaBlock) {
  if (
    schemaName &&
    /^\s+version:\s*$/mu.test(schemaBlock) &&
    /^\s+- version\s*$/mu.test(schemaBlock)
  ) {
    return [schemaName];
  }

  return [];
}

/**
 * @param {object} data Report data.
 * @param {DuplicateEndpointFamily[]} data.duplicateEndpointFamilies Duplicate families.
 * @param {number} data.durationMs Duration.
 * @param {string} data.generatedAt ISO timestamp.
 * @param {ContractMarkers} data.markers Contract markers.
 * @param {string[]} data.missingOpenApiOperations Missing operations.
 * @param {OpenApiOperation[]} data.openApiOperations OpenAPI operations.
 * @param {CliOptions} data.options CLI options.
 * @param {{ callSites: ApiCallSite[]; dynamicCallSites: DynamicApiCallSite[] }} data.scannedSources Source scan result.
 * @param {string[]} data.uniqueFrontendSignatures Unique signatures.
 * @returns {string} Markdown report.
 */
function renderReport({
  duplicateEndpointFamilies,
  durationMs,
  generatedAt,
  markers,
  missingOpenApiOperations,
  openApiOperations,
  options,
  scannedSources,
  uniqueFrontendSignatures,
}) {
  const baselineRows = getBaselineRows({
    duplicateEndpointFamilies: duplicateEndpointFamilies.length,
    explicitApiClientCalls: scannedSources.callSites.length,
    missingOpenApiOperations: missingOpenApiOperations.length,
    uniqueApiSignatures: uniqueFrontendSignatures.length,
  });

  return `${[
    "# API Contract Inventory",
    "",
    `Generated: ${generatedAt}`,
    `Mode: ${options.strict ? "strict" : "advisory"}`,
    "",
    "## Overview",
    "",
    renderKeyValues([
      {
        label: "apiClient calls",
        value: scannedSources.callSites.length,
      },
      {
        label: "unique signatures",
        value: uniqueFrontendSignatures.length,
      },
      {
        label: "OpenAPI operations",
        value: openApiOperations.length,
      },
      {
        label: "missing operations",
        value: missingOpenApiOperations.length,
      },
      {
        label: "duplicate families",
        value: duplicateEndpointFamilies.length,
      },
      {
        label: "dynamic calls",
        value: scannedSources.dynamicCallSites.length,
      },
    ]),
    "",
    "## Advisory Policy",
    "",
    "- The default mode is advisory and exits successfully for review findings.",
    "- `--strict` fails only when a statically resolvable frontend `apiClient` method/path is absent from `docs/open-api.yaml`.",
    "- Duplicate endpoint families are refactor prompts, not proof that centralization is always correct.",
    "- Command UX must preserve response parsing, request IDs, entity `version` fields, and standard error-envelope handling.",
    "",
    "## Baseline",
    "",
    renderMarkdownTable(
      ["Metric", "Baseline", "Current", "Status"],
      baselineRows.map((row) => [
        row.label,
        String(getBaselineValue(row.key)),
        String(row.current),
        row.status,
      ]),
    ),
    "",
    "## Missing OpenAPI Operations",
    "",
    renderMissingOperations(missingOpenApiOperations, scannedSources.callSites),
    "",
    "## Duplicate Wrapper Families",
    "",
    renderDuplicateFamilies(duplicateEndpointFamilies),
    "",
    "## Contract Markers",
    "",
    renderMarkdownTable(
      ["Marker", "Current", "Evidence"],
      [
        [
          "ChatType.NOTES",
          markers.chatTypeNotes ? "present" : "missing",
          "OpenAPI and frontend enum text both contain NOTES.",
        ],
        [
          "Required version schemas",
          String(markers.requiredVersionSchemas.length),
          markers.requiredVersionSchemas.join(", ") || "none",
        ],
        [
          "requestId fields",
          String(markers.requestIdFields),
          "OpenAPI response field occurrences.",
        ],
        [
          "409 responses",
          String(markers.conflictResponseOperations),
          "OpenAPI operations documenting conflict responses.",
        ],
        [
          "file upload",
          `${markers.fileUploadApiCalls} calls / ${markers.fileUploadOpenApiOperations} operations`,
          "Frontend calls and documented file-upload operations.",
        ],
        [
          "web-push public key",
          markers.webPushPublicKeyAllowsAnonymous ? "anonymous" : "review",
          "`GET notifications/web-push/public-key` security marker.",
        ],
        [
          "errorToastConflictMessage",
          String(markers.errorToastConflictMessageUsages),
          "Frontend conflict-message usage count.",
        ],
      ],
    ),
    "",
    "## Dynamic API Calls",
    "",
    renderDynamicCalls(scannedSources.dynamicCallSites),
    "",
    "## Tool Limits",
    "",
    "- Static extraction ignores generic `apiClient(request, ...)` retry calls and direct ky internals.",
    "- Template paths are normalized by replacing each expression with `{param}`.",
    "- Dynamic endpoint expressions require manual review if they appear.",
    "",
    "## Command Execution Summary",
    "",
    renderKeyValues([
      {
        label: "duration",
        value: formatDuration(durationMs),
      },
      {
        label: "report",
        value: toRepoRelativePath(options.reportFile),
      },
      {
        label: "json",
        value: toRepoRelativePath(options.jsonFile),
      },
    ]),
    "",
  ].join("\n")}\n`;
}

/**
 * @param {Record<keyof typeof BASELINE, number>} current Current metrics.
 * @returns {BaselineRow[]} Baseline rows.
 */
function getBaselineRows(current) {
  return BASELINE_METRICS.map((metric) => {
    const currentValue = current[metric.key];
    const baseline = getBaselineValue(metric.key);

    return {
      current: currentValue,
      key: metric.key,
      label: metric.label,
      status: currentValue === baseline ? "same" : "changed",
    };
  });
}

/**
 * @param {BaselineMetricKey} key Baseline key.
 * @returns {number} Baseline value.
 */
function getBaselineValue(key) {
  return BASELINE[key];
}

/**
 * @param {string[]} missingOpenApiOperations Missing operations.
 * @param {ApiCallSite[]} callSites Frontend call sites.
 * @returns {string} Markdown content.
 */
function renderMissingOperations(missingOpenApiOperations, callSites) {
  if (missingOpenApiOperations.length === 0) {
    return "No missing OpenAPI operations found.";
  }

  return renderMarkdownTable(
    ["Signature", "Frontend callers", "Notes"],
    missingOpenApiOperations.map((signature) => [
      `\`${signature}\``,
      callSites
        .filter((callSite) => callSite.signature === signature)
        .map((callSite) => `${callSite.filePath}:${callSite.line}`)
        .join(", "),
      "Confirm the backend contract or update docs/open-api.yaml.",
    ]),
  );
}

/**
 * @param {DuplicateEndpointFamily[]} duplicateEndpointFamilies Duplicate families.
 * @returns {string} Markdown content.
 */
function renderDuplicateFamilies(duplicateEndpointFamilies) {
  if (duplicateEndpointFamilies.length === 0) {
    return "No duplicate endpoint families found.";
  }

  return renderMarkdownTable(
    ["Signature", "Calls", "Callers"],
    duplicateEndpointFamilies
      .slice(0, 25)
      .map((family) => [
        `\`${family.signature}\``,
        String(family.count),
        family.callers.slice(0, 6).join(", "),
      ]),
  );
}

/**
 * @param {DynamicApiCallSite[]} dynamicCallSites Dynamic call sites.
 * @returns {string} Markdown content.
 */
function renderDynamicCalls(dynamicCallSites) {
  if (dynamicCallSites.length === 0) {
    return "No dynamic `apiClient` endpoint expressions found.";
  }

  return renderMarkdownTable(
    ["Method", "Expression", "Caller"],
    dynamicCallSites.map((callSite) => [
      callSite.method,
      `\`${callSite.rawExpression}\``,
      `${callSite.filePath}:${callSite.line}`,
    ]),
  );
}

/**
 * @param {Record<string, number>} summary Summary counts.
 * @param {number} status Exit status.
 * @param {number} durationMs Duration.
 * @param {CliOptions} options CLI options.
 * @returns {void}
 */
function printSummary(summary, status, durationMs, options) {
  process.stdout.write(`${sectionTitle("API contract inventory")}\n`);
  process.stdout.write(
    `${renderKeyValues([
      {
        label: "status",
        value: formatStatusBadge(status),
      },
      {
        label: "mode",
        value: options.strict ? "strict" : "advisory",
      },
      {
        label: "apiClient calls",
        value: summary.explicitApiClientCalls,
      },
      {
        label: "missing ops",
        value: summary.missingOpenApiOperations,
      },
      {
        label: "duplicates",
        value: summary.duplicateEndpointFamilies,
      },
      {
        label: "duration",
        value: formatDuration(durationMs),
      },
    ])}\n`,
  );
  process.stdout.write(`${sectionTitle("Artifacts")}\n`);
  process.stdout.write(
    `${renderBullets([
      toRepoRelativePath(options.reportFile),
      toRepoRelativePath(options.jsonFile),
    ])}\n`,
  );
}

try {
  const status = await run(parseArgs(process.argv.slice(2)));
  process.exitCode = status;
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
