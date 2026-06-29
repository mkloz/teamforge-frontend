// @ts-check

import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * @typedef {{ argsPrefix: string[]; command: string; shell: boolean }} CommandSpec
 * @typedef {{ name: string; status: number; stdout: string; stderr: string; durationMs: number; commandLine: string }} CommandResult
 * @typedef {{ args?: string[]; cwd?: string; env?: NodeJS.ProcessEnv; maxBuffer?: number; name: string; spec: CommandSpec }} RunCommandOptions
 * @typedef {(string | number | null | undefined)[]} TableRow
 * @typedef {"accent" | "danger" | "default" | "muted" | "strong" | "success" | "warning"} ConsoleTone
 * @typedef {{ label: string; tone?: ConsoleTone; value: unknown }} KeyValueRow
 * @typedef {{ depth: number; escaped: boolean; inString: boolean }} JsonObjectScanState
 */

export const ROOT = findRepositoryRoot();
const DEFAULT_MAX_BUFFER = 128 * 1024 * 1024;
const ANSI_RESET = "\u001B[0m";
const ANSI_BY_TONE = {
  accent: "\u001B[36m",
  danger: "\u001B[31m",
  muted: "\u001B[90m",
  strong: "\u001B[1m",
  success: "\u001B[32m",
  warning: "\u001B[33m",
};
const ESCAPE_CHARACTER = String.fromCharCode(27);
const ANSI_PATTERN = new RegExp(
  `${ESCAPE_CHARACTER}\\[[0-?]*[ -/]*[@-~]`,
  "gu",
);
/** @type {Map<string, (value: unknown) => string>} */
const CELL_VALUE_FORMATTERS = new Map([
  ["bigint", String],
  ["boolean", String],
  ["function", stringifyFunctionCellValue],
  ["number", String],
  ["string", String],
  ["symbol", stringifySymbolCellValue],
]);
/** @type {Map<string, (state: JsonObjectScanState, index: number) => number | null>} */
const JSON_OBJECT_SCAN_HANDLERS = new Map([
  ["\\", markEscapedJsonCharacter],
  ['"', toggleJsonStringState],
  ["{", incrementJsonObjectDepth],
  ["}", decrementJsonObjectDepth],
]);

/**
 * Finds the current Git repository root.
 *
 * @returns {string} Absolute repository root.
 */
export function findRepositoryRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return process.cwd();
  }
}

/**
 * Converts a path to a slash-separated repo-relative path.
 *
 * @param {string} filePath Absolute or repo-relative file path.
 * @param {string} [baseDirectory=ROOT] Base directory for relative paths.
 * @returns {string} Slash-separated repository-relative path.
 */
export function toRepoRelativePath(filePath, baseDirectory = ROOT) {
  const absolutePath = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(baseDirectory, filePath);

  return path.relative(ROOT, absolutePath).replaceAll("\\", "/");
}

/**
 * Reads a JSON file as a plain record.
 *
 * @param {string} filePath Absolute file path.
 * @returns {Record<string, unknown>} Parsed object.
 */
export function readJsonObject(filePath) {
  // oxlint-disable-next-line bensandee/no-unsafe-json-parse -- Local config and package metadata are trusted inputs validated as objects.
  const parsed = JSON.parse(readFileSync(filePath, "utf8"));

  if (!isRecord(parsed)) {
    throw new TypeError(`${filePath} must contain a JSON object.`);
  }

  return parsed;
}

/**
 * Checks whether a value is a non-array object.
 *
 * @param {unknown} value Value to inspect.
 * @returns {value is Record<string, unknown>} Whether the value is a record.
 */
export function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Resolves a package binary to a spawn-safe command spec.
 *
 * @param {string} packageName Package directory name.
 * @param {string} [binName=packageName] Binary name in package.json.
 * @returns {CommandSpec} Command spec.
 */
export function resolvePackageBin(packageName, binName = packageName) {
  const packageJsonPath = path.join(
    ROOT,
    "node_modules",
    packageName,
    "package.json",
  );

  if (existsSync(packageJsonPath)) {
    const packageJson = readJsonObject(packageJsonPath);
    const binPath = getPackageBinPath(packageJson, binName);

    if (binPath) {
      return resolvePackageBinPath(packageName, binPath);
    }
  }

  return resolvePathBin(binName);
}

/**
 * Resolves a Node script inside this repo.
 *
 * @param {string} relativePath Repository-relative script path.
 * @returns {CommandSpec} Command spec.
 */
export function resolveNodeScript(relativePath) {
  return {
    argsPrefix: [path.resolve(ROOT, relativePath)],
    command: process.execPath,
    shell: false,
  };
}

/**
 * Resolves a PATH or local node_modules/.bin binary.
 *
 * @param {string} binName Binary name.
 * @returns {CommandSpec} Command spec.
 */
export function resolvePathBin(binName) {
  const binaryName = process.platform === "win32" ? `${binName}.cmd` : binName;
  const localPath = path.join(ROOT, "node_modules", ".bin", binaryName);

  return {
    argsPrefix: [],
    command: existsSync(localPath) ? localPath : binaryName,
    shell: process.platform === "win32",
  };
}

/**
 * Gets a binary path from package metadata.
 *
 * @param {Record<string, unknown>} packageJson Parsed package metadata.
 * @param {string} binName Binary name.
 * @returns {string | null} Package-relative binary path.
 */
function getPackageBinPath(packageJson, binName) {
  const { bin } = packageJson;

  if (typeof bin === "string") {
    return bin;
  }

  if (isRecord(bin) && typeof bin[binName] === "string") {
    return bin[binName];
  }

  return null;
}

/**
 * Resolves one package-relative binary file.
 *
 * @param {string} packageName Package directory name.
 * @param {string} binPath Package-relative bin path.
 * @returns {CommandSpec} Command spec.
 */
function resolvePackageBinPath(packageName, binPath) {
  const absolutePath = path.resolve(ROOT, "node_modules", packageName, binPath);
  const extension = path.extname(absolutePath);

  if (extension === "" || [".cjs", ".js", ".mjs"].includes(extension)) {
    return {
      argsPrefix: [absolutePath],
      command: process.execPath,
      shell: false,
    };
  }

  return {
    argsPrefix: [],
    command: absolutePath,
    shell: process.platform === "win32",
  };
}

/**
 * Runs a command and collects stdout and stderr.
 *
 * @param {RunCommandOptions} options Command options.
 * @returns {Promise<CommandResult>} Command result.
 */
export function runCommand({
  args = [],
  cwd = ROOT,
  env,
  maxBuffer,
  name,
  spec,
}) {
  const startedAt = performance.now();
  const commandArgs = [...spec.argsPrefix, ...args];
  const commandLine = [spec.command, ...commandArgs].join(" ");

  return new Promise((resolve) => {
    const child = spawn(spec.command, commandArgs, {
      cwd,
      env: env ? { ...process.env, ...env } : process.env,
      shell: spec.shell,
      stdio: "pipe",
    });
    const outputLimit = maxBuffer ?? DEFAULT_MAX_BUFFER;
    let stdout = "";
    let stderr = "";

    child.stdin.end();
    child.stdout.on("data", (chunk) => {
      stdout = appendWithinLimit(stdout, chunk.toString(), outputLimit);
    });
    child.stderr.on("data", (chunk) => {
      stderr = appendWithinLimit(stderr, chunk.toString(), outputLimit);
    });
    child.on("error", (error) => {
      resolve({
        commandLine,
        durationMs: performance.now() - startedAt,
        name,
        status: 1,
        stdout,
        stderr: `${stderr}${error.message}\n`,
      });
    });
    child.on("close", (status) => {
      resolve({
        commandLine,
        durationMs: performance.now() - startedAt,
        name,
        status: status ?? 1,
        stdout,
        stderr,
      });
    });
  });
}

/**
 * Appends text while preserving a maximum buffer size.
 *
 * @param {string} current Current buffer.
 * @param {string} next Incoming text.
 * @param {number} limit Maximum buffer size.
 * @returns {string} Updated buffer.
 */
function appendWithinLimit(current, next, limit) {
  const value = `${current}${next}`;

  return value.length > limit ? value.slice(value.length - limit) : value;
}

/**
 * Formats milliseconds as a short duration string.
 *
 * @param {number} durationMs Duration in milliseconds.
 * @returns {string} Human-readable duration.
 */
export function formatDuration(durationMs) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
}

/**
 * Formats terminal text with ANSI color when the current output supports it.
 *
 * @param {unknown} value Text value.
 * @param {ConsoleTone} [tone="default"] Visual tone.
 * @returns {string} Styled text.
 */
export function colorText(value, tone = "default") {
  const text = stringifyCellValue(value);

  if (tone === "default" || !shouldUseColor()) {
    return text;
  }

  return `${ANSI_BY_TONE[tone]}${text}${ANSI_RESET}`;
}

/**
 * Formats a compact colored section title.
 *
 * @param {string} title Section title.
 * @returns {string} Styled title.
 */
export function sectionTitle(title) {
  return colorText(title, "strong");
}

/**
 * Formats a compact status badge such as [pass], [warn], or [fail].
 *
 * @param {number | string} status Status code or label.
 * @returns {string} Styled status badge.
 */
export function formatStatusBadge(status) {
  const label =
    typeof status === "number"
      ? status === 0
        ? "pass"
        : `status ${status}`
      : status;

  return colorText(`[${label}]`, getStatusTone(label));
}

/**
 * Renders short key-value rows without box drawing or wide columns.
 *
 * @param {KeyValueRow[]} rows Rows.
 * @returns {string} Rendered lines.
 */
export function renderKeyValues(rows) {
  const labelWidth = Math.min(
    Math.max(...rows.map((row) => row.label.length), 0),
    24,
  );

  return rows
    .map(
      (row) =>
        `  ${colorText(row.label.padEnd(labelWidth), "muted")} ${colorText(
          row.value,
          row.tone ?? "default",
        )}`,
    )
    .join("\n");
}

/**
 * Renders a compact bullet list with an overflow note.
 *
 * @param {string[]} items List items.
 * @param {number} [limit=6] Maximum visible items.
 * @returns {string} Rendered bullets.
 */
export function renderBullets(items, limit = 6) {
  if (items.length === 0) {
    return `  ${colorText("none", "muted")}`;
  }

  const visible = items.slice(0, limit).map((item) => `  - ${item}`);
  const remaining = items.length - visible.length;

  if (remaining > 0) {
    visible.push(
      `  ${colorText(`... ${remaining} more in the report`, "muted")}`,
    );
  }

  return visible.join("\n");
}

/**
 * Removes ANSI escape sequences from captured command output.
 *
 * @param {string} value Text value.
 * @returns {string} Plain text.
 */
export function stripAnsi(value) {
  return value.replace(ANSI_PATTERN, "");
}

/**
 * Returns the last useful lines from command output.
 *
 * @param {string} value Text value.
 * @param {number} [maxLines=16] Maximum lines.
 * @param {number} [maxLength=4000] Maximum characters.
 * @returns {string} Tail output.
 */
export function tailLines(value, maxLines = 16, maxLength = 4000) {
  const lines = stripAnsi(value)
    .trim()
    .split(/\r?\n/u)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const tail = lines.slice(-maxLines).join("\n");

  return tail.length > maxLength ? tail.slice(tail.length - maxLength) : tail;
}

/**
 * Reads a required option value from an argv array.
 *
 * @param {string[]} argv Arguments.
 * @param {number} index Current option index.
 * @param {string} option Option name.
 * @returns {string} Option value.
 */
export function readRequiredOptionValue(argv, index, option) {
  const value = argv[index + 1];

  if (value === undefined || value === "") {
    throw new Error(`Missing value for ${option}.`);
  }

  return value;
}

/**
 * @param {string} label Status label.
 * @returns {ConsoleTone} Status tone.
 */
function getStatusTone(label) {
  const normalized = label.toLowerCase();

  if (/^(ok|pass|passed|success|status 0)$/u.test(normalized)) {
    return "success";
  }

  if (/^(advisory|review|warn|warning)$/u.test(normalized)) {
    return "warning";
  }

  if (
    /^(error|fail|failed|focus)$/u.test(normalized) ||
    /^status [1-9]/u.test(normalized)
  ) {
    return "danger";
  }

  if (/^(skip|skipped)$/u.test(normalized)) {
    return "muted";
  }

  return "accent";
}

/**
 * @returns {boolean} Whether ANSI color should be emitted.
 */
function shouldUseColor() {
  if (process.env.NO_COLOR !== undefined) {
    return false;
  }

  if (process.env.FORCE_COLOR !== undefined) {
    return process.env.FORCE_COLOR !== "0";
  }

  return Boolean(process.stdout.isTTY || process.env.CI);
}

/**
 * Renders a simple ASCII table.
 *
 * @param {TableRow} headers Table headers.
 * @param {TableRow[]} rows Table rows.
 * @returns {string} Rendered table.
 */
export function renderTable(headers, rows) {
  const normalizedRows = rows.map((row) => row.map(normalizeCell));
  const normalizedHeaders = headers.map(normalizeCell);
  const widths = normalizedHeaders.map((header, columnIndex) =>
    Math.max(
      header.length,
      ...normalizedRows.map((row) => row[columnIndex]?.length ?? 0),
    ),
  );
  const separator = `+-${widths.map((width) => "-".repeat(width)).join("-+-")}-+`;
  const renderRow = (row) =>
    `| ${row
      .map((cell, columnIndex) => cell.padEnd(widths[columnIndex]))
      .join(" | ")} |`;

  return [
    separator,
    renderRow(normalizedHeaders),
    separator,
    ...normalizedRows.map(renderRow),
    separator,
  ].join("\n");
}

/**
 * Renders a markdown table.
 *
 * @param {string[]} headers Table headers.
 * @param {string[][]} rows Table rows.
 * @returns {string} Rendered markdown table.
 */
export function renderMarkdownTable(headers, rows) {
  return [
    `| ${headers.map(escapeMarkdownTableCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeMarkdownTableCell).join(" | ")} |`),
  ].join("\n");
}

/**
 * Escapes markdown table separators.
 *
 * @param {unknown} value Cell value.
 * @returns {string} Escaped value.
 */
export function escapeMarkdownTableCell(value) {
  return stringifyCellValue(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

/**
 * @param {TableRow[number]} value Cell value.
 * @returns {string} Printable table cell.
 */
function normalizeCell(value) {
  return stringifyCellValue(value);
}

/**
 * Converts supported report values to a printable string without relying on
 * object default stringification.
 *
 * @param {unknown} value Cell value.
 * @returns {string} Printable cell value.
 */
function stringifyCellValue(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  return (CELL_VALUE_FORMATTERS.get(typeof value) ?? stringifyObjectCellValue)(
    value,
  );
}

/**
 * @param {unknown} value Cell value.
 * @returns {string} Printable symbol value.
 */
function stringifySymbolCellValue(value) {
  const description = typeof value === "symbol" ? value.description : undefined;

  return description ? `Symbol(${description})` : "Symbol()";
}

/**
 * @param {unknown} value Cell value.
 * @returns {string} Printable function value.
 */
function stringifyFunctionCellValue(value) {
  const functionName = typeof value === "function" ? value.name : "";

  return functionName ? `[Function ${functionName}]` : "[Function]";
}

/**
 * @param {unknown} value Cell value.
 * @returns {string} Printable object value.
 */
function stringifyObjectCellValue(value) {
  try {
    return JSON.stringify(value) ?? "-";
  } catch {
    return Object.prototype.toString.call(value);
  }
}

/**
 * Ensures a directory exists.
 *
 * @param {string} directory Directory path.
 * @returns {Promise<void>}
 */
export async function ensureDirectory(directory) {
  await mkdir(directory, { recursive: true });
}

/**
 * Writes text after ensuring the parent directory exists.
 *
 * @param {string} filePath File path.
 * @param {string} text File content.
 * @returns {Promise<void>}
 */
export async function writeTextFile(filePath, text) {
  await ensureDirectory(path.dirname(filePath));
  await writeFile(filePath, text, "utf8");
}

/**
 * Writes JSON after ensuring the parent directory exists.
 *
 * @param {string} filePath File path.
 * @param {unknown} value JSON value.
 * @returns {Promise<void>}
 */
export async function writeJsonFile(filePath, value) {
  await writeTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Returns a finite number or zero.
 *
 * @param {unknown} value Number-like value.
 * @returns {number} Finite number.
 */
export function asNumber(value) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

/**
 * Counts array items or a number-like value.
 *
 * @param {unknown} value Value to count.
 * @returns {number} Count.
 */
export function countValue(value) {
  return Array.isArray(value) ? value.length : asNumber(value);
}

/**
 * Extracts the first JSON object from command output.
 *
 * @param {string} output Command stdout.
 * @returns {Record<string, unknown>} Parsed JSON object.
 */
export function parseFirstJsonObject(output) {
  const startIndex = output.indexOf("{");

  if (startIndex === -1) {
    throw new Error("Command output did not contain a JSON object.");
  }

  return parseJsonObjectSlice(
    output,
    startIndex,
    findJsonObjectEndIndex(output, startIndex),
  );
}

/**
 * @param {string} output Command output.
 * @param {number} startIndex Object start index.
 * @returns {number} Object end index.
 */
function findJsonObjectEndIndex(output, startIndex) {
  /** @type {JsonObjectScanState} */
  const state = { depth: 0, escaped: false, inString: false };

  for (let index = startIndex; index < output.length; index += 1) {
    const endIndex = scanJsonObjectCharacter(state, output[index], index);

    if (endIndex !== null) {
      return endIndex;
    }
  }

  throw new Error("Command output contained an incomplete JSON object.");
}

/**
 * @param {JsonObjectScanState} state Scan state.
 * @param {string} char Current character.
 * @param {number} index Current character index.
 * @returns {number | null} Completed object end index.
 */
function scanJsonObjectCharacter(state, char, index) {
  if (state.escaped) {
    state.escaped = false;
    return null;
  }

  return JSON_OBJECT_SCAN_HANDLERS.get(char)?.(state, index) ?? null;
}

/**
 * @param {JsonObjectScanState} state Scan state.
 * @returns {null} No object end index.
 */
function markEscapedJsonCharacter(state) {
  state.escaped = true;

  return null;
}

/**
 * @param {JsonObjectScanState} state Scan state.
 * @returns {null} No object end index.
 */
function toggleJsonStringState(state) {
  state.inString = !state.inString;

  return null;
}

/**
 * @param {JsonObjectScanState} state Scan state.
 * @returns {null} No object end index.
 */
function incrementJsonObjectDepth(state) {
  if (!state.inString) {
    state.depth += 1;
  }

  return null;
}

/**
 * @param {JsonObjectScanState} state Scan state.
 * @param {number} index Current character index.
 * @returns {number | null} Completed object end index.
 */
function decrementJsonObjectDepth(state, index) {
  if (state.inString) {
    return null;
  }

  state.depth -= 1;

  return state.depth === 0 ? index : null;
}

/**
 * @param {string} output Command output.
 * @param {number} startIndex Object start index.
 * @param {number} endIndex Object end index.
 * @returns {Record<string, unknown>} Parsed object.
 */
function parseJsonObjectSlice(output, startIndex, endIndex) {
  // oxlint-disable-next-line bensandee/no-unsafe-json-parse -- Tool JSON is validated as a record before callers use it.
  const parsed = JSON.parse(output.slice(startIndex, endIndex + 1));

  if (!isRecord(parsed)) {
    throw new TypeError("Parsed JSON payload must be an object.");
  }

  return parsed;
}

/**
 * Returns a truncated single-line output excerpt.
 *
 * @param {string} value Text to truncate.
 * @param {number} [maxLength=240] Maximum length.
 * @returns {string} Truncated text.
 */
export function excerpt(value, maxLength = 240) {
  const oneLine = stripAnsi(value).replace(/\s+/gu, " ").trim();

  return oneLine.length > maxLength
    ? `${oneLine.slice(0, maxLength - 1)}...`
    : oneLine;
}
