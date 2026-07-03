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
 * @typedef {{ label: string; tone?: import("../shared/command-utils.mjs").ConsoleTone; value: unknown }} QualityScanKeyValueRow
 * @typedef {{ jsonFile: string; quiet: boolean; reportFile: string; strict: boolean }} QualityScanCliOptions
 * @typedef {(options: QualityScanCliOptions) => void} BooleanOptionSetter
 * @typedef {[string, BooleanOptionSetter]} BooleanOptionEntry
 * @typedef {(options: QualityScanCliOptions, value: string) => void} ValueOptionSetter
 * @typedef {{ context: string; filePath: string; line: number; column: number }} SourceReferenceLocation
 * @typedef {{ lines: string[]; sourceFile: ts.SourceFile }} ParsedTypeScriptSource
 * @typedef {{ emptyText: string; headers: string[]; rows: string[][]; title: string }} MarkdownTableSection
 * @typedef {{ label: string; remaining: number }} OmittedRowsNote
 * @typedef {{ generatedAt: string; policyItems: string[]; referenceSection: MarkdownTableSection; remainingNote?: OmittedRowsNote; summaryItems: string[]; title: string; topSection: MarkdownTableSection }} MarkdownReportInput
 * @typedef {{ displayLimit: number; emptyText: string; getRow: (reference: unknown) => string[]; headers: string[]; label: string; references: unknown[]; title: string }} LimitedReferenceSectionInput
 * @typedef {{ generatedAt: string; policyItems: string[]; referenceSection: LimitedReferenceSectionInput; summaryItems: string[]; title: string; topSection: MarkdownTableSection }} LimitedReferenceReportInput
 * @typedef {{ headline: string; keyValues: QualityScanKeyValueRow[]; reportFile: string; status: string; title: string; topItems?: string[] }} ConsoleSummaryInput
 * @typedef {{ errorLabel: string; parseArgs: (argv: string[]) => QualityScanCliOptions; run: (options: QualityScanCliOptions) => Promise<number> }} QualityScanCliRunner
 */

/** @type {Map<string, ValueOptionSetter>} */
const VALUE_OPTION_SETTERS = new Map([
  [
    "--json-file",
    (options, value) => {
      options.jsonFile = value;
    },
  ],
  [
    "--report-file",
    (options, value) => {
      options.reportFile = value;
    },
  ],
]);

/**
 * @param {BooleanOptionEntry[]} [extraOptions] Extra boolean option entries.
 * @returns {Map<string, BooleanOptionSetter>} Boolean option map.
 */
export function createQualityBooleanOptions(extraOptions = []) {
  return new Map([
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
    ...extraOptions,
  ]);
}

/**
 * @param {{ booleanOptions?: Map<string, BooleanOptionSetter>; defaults: QualityScanCliOptions; scriptName: string }} config Parser config.
 * @returns {(argv: string[]) => QualityScanCliOptions} Argument parser.
 */
export function createQualityScanArgsParser(config) {
  return (argv) => parseQualityScanArgs(argv, config);
}

/**
 * @param {QualityScanCliRunner} runner CLI runner config.
 */
export function runQualityScanCli(runner) {
  runner
    .run(runner.parseArgs(process.argv.slice(2)))
    .then((status) => {
      process.exitCode = status;
      return undefined;
    })
    .catch((error) => {
      process.stderr.write(
        `${runner.errorLabel} failed: ${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 1;
      return undefined;
    });
}

/**
 * @param {string[]} argv CLI arguments.
 * @param {{ booleanOptions?: Map<string, BooleanOptionSetter>; defaults: QualityScanCliOptions; scriptName: string }} config Parser config.
 * @returns {QualityScanCliOptions} Parsed options.
 */
export function parseQualityScanArgs(argv, config) {
  const options = { ...config.defaults };
  const booleanOptions = config.booleanOptions ?? new Map();

  for (let index = 0; index < argv.length; index += 1) {
    index += applyQualityScanArg({
      argv,
      booleanOptions,
      index,
      options,
      scriptName: config.scriptName,
    });
  }

  return options;
}

/**
 * @param {{ argv: string[]; booleanOptions: Map<string, BooleanOptionSetter>; index: number; options: QualityScanCliOptions; scriptName: string }} input Argument parsing input.
 * @returns {number} Extra consumed argv entries.
 */
function applyQualityScanArg({
  argv,
  booleanOptions,
  index,
  options,
  scriptName,
}) {
  const arg = argv[index];

  if (applyBooleanOption(booleanOptions, arg, options)) {
    return 0;
  }

  const valueOption = getValueOption(arg);

  if (valueOption) {
    return applyValueOption({ argv, index, options, valueOption });
  }

  throw new Error(`Unknown ${scriptName} argument: ${arg}`);
}

/**
 * @param {Map<string, BooleanOptionSetter>} booleanOptions Boolean option setters.
 * @param {string} arg Current argument.
 * @param {QualityScanCliOptions} options Mutable parsed options.
 * @returns {boolean} Whether a boolean option was applied.
 */
function applyBooleanOption(booleanOptions, arg, options) {
  const booleanSetter = booleanOptions.get(arg);

  if (!booleanSetter) {
    return false;
  }

  booleanSetter(options);
  return true;
}

/**
 * @param {string} arg Current argument.
 * @returns {{ option: string; setter: ValueOptionSetter; value: string | null } | null} Value option details.
 */
function getValueOption(arg) {
  const assignmentIndex = arg.indexOf("=");
  const option = assignmentIndex === -1 ? arg : arg.slice(0, assignmentIndex);
  const setter = VALUE_OPTION_SETTERS.get(option);

  return setter
    ? {
        option,
        setter,
        value: assignmentIndex === -1 ? null : arg.slice(assignmentIndex + 1),
      }
    : null;
}

/**
 * @param {{ argv: string[]; index: number; options: QualityScanCliOptions; valueOption: { option: string; setter: ValueOptionSetter; value: string | null } }} input Value option input.
 * @returns {number} Extra consumed argv entries.
 */
function applyValueOption({ argv, index, options, valueOption }) {
  const value =
    valueOption.value ??
    readRequiredOptionValue(argv, index, valueOption.option);

  valueOption.setter(options, value);
  return valueOption.value === null ? 1 : 0;
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
 * @template TReference
 * @param {string[]} sourceFiles Repo-relative source files.
 * @param {(filePath: string) => Promise<TReference[]>} scanSourceFile Source file scanner.
 * @returns {Promise<TReference[]>} Flattened references.
 */
export async function scanTypeScriptSourceReferences(
  sourceFiles,
  scanSourceFile,
) {
  const referenceGroups = await Promise.all(sourceFiles.map(scanSourceFile));

  return referenceGroups.flat();
}

/**
 * @param {ParsedTypeScriptSource} parsedSource Parsed source.
 * @param {ts.Node} node AST node.
 * @param {string} filePath Repo-relative source path.
 * @returns {SourceReferenceLocation} Reference source location.
 */
export function getSourceReferenceLocation(parsedSource, node, filePath) {
  const { line, character } =
    parsedSource.sourceFile.getLineAndCharacterOfPosition(
      node.getStart(parsedSource.sourceFile),
    );

  return {
    column: character + 1,
    context: parsedSource.lines[line]?.trim() ?? "",
    filePath,
    line: line + 1,
  };
}

/**
 * @template TReference
 * @template TSummary
 * @param {{ collectSourceFiles: () => Promise<string[]>; createSummary: (scannedFiles: number, references: TReference[]) => TSummary; formatReport: (summary: TSummary, references: TReference[], durationMs: number) => string; getFailureCount: (summary: TSummary) => number; options: QualityScanCliOptions; printSummary: (summary: TSummary, reportFile: string, durationMs: number) => void; scanSourceFile: (filePath: string) => Promise<TReference[]> }} config Scan config.
 * @returns {Promise<number>} Exit status.
 */
export async function runQualityReferenceScan(config) {
  const startedAt = performance.now();
  const sourceFiles = await config.collectSourceFiles();
  const references = await scanTypeScriptSourceReferences(
    sourceFiles,
    config.scanSourceFile,
  );
  const summary = config.createSummary(sourceFiles.length, references);
  const durationMs = performance.now() - startedAt;

  await Promise.all([
    writeJsonFile(config.options.jsonFile, summary),
    writeTextFile(
      config.options.reportFile,
      config.formatReport(summary, references, durationMs),
    ),
  ]);

  if (!config.options.quiet) {
    config.printSummary(summary, config.options.reportFile, durationMs);
  }

  return config.options.strict && config.getFailureCount(summary) > 0 ? 1 : 0;
}

/**
 * @param {string[]} items Summary items.
 * @returns {string} Markdown bullets.
 */
export function renderMarkdownBullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

/**
 * @param {MarkdownReportInput} input Report input.
 * @returns {string} Markdown report.
 */
export function formatQualityScanReport(input) {
  return [
    `# ${input.title}`,
    "",
    `Generated: ${input.generatedAt}`,
    "",
    "## Summary",
    "",
    renderMarkdownBullets(input.summaryItems),
    "",
    renderMarkdownTableSection(input.topSection),
    "",
    renderMarkdownTableSection(input.referenceSection),
    renderOmittedRowsNote(input.remainingNote),
    "",
    "## Policy",
    "",
    renderMarkdownBullets(input.policyItems),
    "",
  ].join("\n");
}

/**
 * @param {LimitedReferenceReportInput} input Report input.
 * @returns {string} Markdown report.
 */
export function formatLimitedReferenceReport(input) {
  const limitedSection = getLimitedReferenceSection(input.referenceSection);

  return formatQualityScanReport({
    generatedAt: input.generatedAt,
    policyItems: input.policyItems,
    referenceSection: limitedSection.section,
    remainingNote: limitedSection.remainingNote,
    summaryItems: input.summaryItems,
    title: input.title,
    topSection: input.topSection,
  });
}

/**
 * @param {LimitedReferenceSectionInput} input Reference section input.
 * @returns {{ remainingNote: OmittedRowsNote; section: MarkdownTableSection }} Limited table section.
 */
function getLimitedReferenceSection(input) {
  const visibleReferences = input.references.slice(0, input.displayLimit);

  return {
    remainingNote: {
      label: input.label,
      remaining: input.references.length - visibleReferences.length,
    },
    section: {
      emptyText: input.emptyText,
      headers: input.headers,
      rows: visibleReferences.map(input.getRow),
      title: input.title,
    },
  };
}

/**
 * @param {MarkdownTableSection} section Table section.
 * @returns {string} Markdown section.
 */
function renderMarkdownTableSection(section) {
  return [
    `## ${section.title}`,
    "",
    section.rows.length === 0
      ? section.emptyText
      : renderMarkdownTable(section.headers, section.rows),
  ].join("\n");
}

/**
 * @param {OmittedRowsNote | undefined} note Omitted rows note.
 * @returns {string} Markdown note.
 */
function renderOmittedRowsNote(note) {
  if (!note || note.remaining <= 0) {
    return "";
  }

  return `\n${note.remaining} additional ${note.label} omitted from this table.`;
}

/**
 * @param {ConsoleSummaryInput} input Console summary input.
 */
export function printQualityScanSummary(input) {
  process.stdout.write(`${sectionTitle(input.title)}\n`);
  process.stdout.write(
    `${formatStatusBadge(input.status)} ${input.headline}\n`,
  );
  process.stdout.write(
    `${renderKeyValues([
      ...input.keyValues,
      { label: "Report", value: toRepoRelativePath(input.reportFile) },
    ])}\n`,
  );

  if (input.topItems?.length) {
    process.stdout.write(`\n${colorText("Top files", "accent")}\n`);
    process.stdout.write(`${renderBullets(input.topItems, 8)}\n`);
  }
}

/**
 * @param {number} durationMs Duration in milliseconds.
 * @returns {QualityScanKeyValueRow} Duration key-value row.
 */
export function createDurationKeyValue(durationMs) {
  return {
    label: "Duration",
    value: formatDuration(durationMs),
  };
}

/**
 * @template TReference
 * @param {TReference[]} references Located references.
 * @param {(reference: TReference) => string[]} getMiddleCells Middle table cells.
 * @returns {string[][]} Markdown table rows.
 */
export function createLocatedReferenceRows(references, getMiddleCells) {
  return references.map((reference) => {
    const location = readReferenceLocation(reference);

    return [
      location.filePath,
      `${location.line}:${location.column}`,
      ...getMiddleCells(reference),
      location.context,
    ];
  });
}

/**
 * @param {unknown} reference Reference-like object.
 * @returns {SourceReferenceLocation} Reference location.
 */
function readReferenceLocation(reference) {
  return {
    column: readNumberReferenceProperty(reference, "column"),
    context: readStringReferenceProperty(reference, "context"),
    filePath: readStringReferenceProperty(reference, "filePath"),
    line: readNumberReferenceProperty(reference, "line"),
  };
}

/**
 * @param {unknown} reference Reference-like object.
 * @param {string} property Property name.
 * @returns {number} Number property.
 */
function readNumberReferenceProperty(reference, property) {
  const value = readReferenceProperty(reference, property);

  if (typeof value === "number") {
    return value;
  }

  throw new Error(`Quality scan reference is missing numeric ${property}.`);
}

/**
 * @param {unknown} reference Reference-like object.
 * @param {string} property Property name.
 * @returns {string} String property.
 */
function readStringReferenceProperty(reference, property) {
  const value = readReferenceProperty(reference, property);

  if (typeof value === "string") {
    return value;
  }

  throw new Error(`Quality scan reference is missing string ${property}.`);
}

/**
 * @param {unknown} reference Reference-like object.
 * @param {string} property Property name.
 * @returns {unknown} Property value.
 */
function readReferenceProperty(reference, property) {
  if (reference && typeof reference === "object" && property in reference) {
    return reference[property];
  }

  throw new Error(`Quality scan reference is missing ${property}.`);
}

/**
 * @param {Array<{ count: number; filePath: string } & Record<string, string>>} topFiles Top files.
 * @param {string} valueProperty Value property name.
 * @returns {string[][]} Markdown table rows.
 */
export function createTopReferenceRows(topFiles, valueProperty) {
  return topFiles.map((row) => [
    row.filePath,
    String(row.count),
    row[valueProperty] ?? "",
  ]);
}

/**
 * @param {Array<{ count: number; filePath: string } & Record<string, string>>} topFiles Top files.
 * @param {string} valueProperty Value property name.
 * @returns {string[]} Console top-file items.
 */
export function createTopReferenceItems(topFiles, valueProperty) {
  return topFiles.map(
    (row) => `${row.filePath} (${row.count}: ${row[valueProperty] ?? ""})`,
  );
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
