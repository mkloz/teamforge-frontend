#!/usr/bin/env node
// @ts-check
import { execFileSync, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import ts from "typescript";

/**
 * @typedef {"architecture" | "biome" | "compiler" | "oxlint" | "types"} Stage
 * @typedef {"fast" | "full"} OxlintMode
 * @typedef {{ files: string[] | null; oxlintMode: OxlintMode; staged: boolean; stages: Stage[] }} CliOptions
 * @typedef {{ argsPrefix: string[]; command: string; shell: boolean }} CommandSpec
 * @typedef {{ name: string; output: string; status: number }} StageResult
 */

const INVOCATION_CWD = process.cwd();
const ROOT = findRepositoryRoot();
const MAX_COMMAND_LENGTH = process.platform === "win32" ? 24_000 : 48_000;
const MAX_PARALLEL_STAGES = 4;

/** @type {Stage[]} */
const ALL_STAGES = ["oxlint", "compiler", "biome", "architecture", "types"];
/** @type {ReadonlySet<string>} */
const STAGE_SET = new Set(ALL_STAGES);

const OXLINT_CONFIG_PATH = ".oxlintrc.json";
const FAST_OXLINT_CONFIG_PATH = path.join(
  ROOT,
  "node_modules",
  ".tmp",
  "oxlint.changed-fast.json",
);
const JS_PLUGIN_RULE_PREFIXES = [
  "bensandee/",
  "inhuman/",
  "oxlint-plugin-query/",
  "tailwindcss/",
];

/** @type {Readonly<Record<string, string>>} */
const PACKAGE_BIN_PATHS = {
  biome: "node_modules/@biomejs/biome/bin/biome",
  depcruise: "node_modules/dependency-cruiser/bin/dependency-cruise.mjs",
  oxlint: "node_modules/oxlint/bin/oxlint",
  "react-compiler-tracker":
    "node_modules/@doist/react-compiler-tracker/dist/index.js",
};

const EXTENSIONS = {
  architecture: new Set([".cjs", ".js", ".jsx", ".mjs", ".ts", ".tsx"]),
  biome: new Set([
    ".cjs",
    ".css",
    ".cts",
    ".js",
    ".json",
    ".jsonc",
    ".jsx",
    ".mjs",
    ".mts",
    ".ts",
    ".tsx",
  ]),
  oxlint: new Set([
    ".cjs",
    ".cts",
    ".js",
    ".jsx",
    ".mjs",
    ".mts",
    ".ts",
    ".tsx",
  ]),
  typescript: new Set([".ts", ".tsx"]),
};

async function main() {
  const options = parseCliArgs(process.argv.slice(2));
  const changedFiles = getSelectedFiles(options);

  if (changedFiles.length === 0) {
    writeLine("No changed files to lint.");
    return;
  }

  writeLine(`Found ${changedFiles.length} changed file(s).`);
  await runStages(options, changedFiles);
  writeLine("\nChanged-file lint passed.");
}

/**
 * Finds the Git repository root, falling back to the invocation directory when
 * the script is run outside a Git checkout.
 *
 * @returns {string} Absolute repository root.
 */
function findRepositoryRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: INVOCATION_CWD,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return INVOCATION_CWD;
  }
}

/**
 * @param {string} [message] Message to write.
 */
function writeLine(message = "") {
  process.stdout.write(`${message}\n`);
}

/**
 * @param {string} message Human-readable failure reason.
 * @returns {never} Never returns.
 */
function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

/**
 * @param {string[]} args Git arguments without the leading `git`.
 * @returns {string[]} Newline-delimited Git file output.
 */
function getGitFiles(args) {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
      .split(/\r?\n/)
      .map((filePath) => filePath.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Returns staged, unstaged, and untracked files that still exist on disk.
 *
 * @returns {string[]} Repository-relative file paths.
 */
function getChangedFiles() {
  const trackedFiles = getGitFiles([
    "diff",
    "--name-only",
    "--diff-filter=ACMR",
    "HEAD",
    "--",
  ]);
  const untrackedFiles = getGitFiles([
    "ls-files",
    "--others",
    "--exclude-standard",
  ]);

  return compactUnique(
    [...trackedFiles, ...untrackedFiles].map(toExistingFile),
  );
}

/**
 * Returns staged files that still exist on disk.
 *
 * @returns {string[]} Repository-relative file paths.
 */
function getStagedFiles() {
  return compactUnique(
    getGitFiles([
      "diff",
      "--name-only",
      "--cached",
      "--diff-filter=ACMR",
      "--",
    ]).map(toExistingFile),
  );
}

/**
 * @param {CliOptions} options Parsed CLI options.
 * @returns {string[]} Repository-relative file paths.
 */
function getSelectedFiles(options) {
  if (options.files) {
    return normalizeExplicitFiles(options.files);
  }

  if (options.staged) {
    return getStagedFiles();
  }

  return getChangedFiles();
}

/**
 * Normalizes explicit file arguments from callers such as the Vite plugin.
 *
 * @param {string[]} files Absolute, invocation-relative, or repo-relative paths.
 * @returns {string[]} Repository-relative file paths.
 */
function normalizeExplicitFiles(files) {
  return compactUnique(
    files.map((filePath) => {
      const relativePath = toRepoRelativePath(filePath, INVOCATION_CWD);
      return relativePath ? toExistingFile(relativePath) : null;
    }),
  );
}

/**
 * @param {(string | null)[]} values Values to dedupe after removing nulls.
 * @returns {string[]} Unique strings.
 */
function compactUnique(values) {
  return [...new Set(values.filter((value) => value !== null))];
}

/**
 * @param {string} filePath Absolute or relative path.
 * @param {string} baseDirectory Base directory for relative paths.
 * @returns {string | null} Repository-relative path, or null outside the repo.
 */
function toRepoRelativePath(filePath, baseDirectory) {
  const absolutePath = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(baseDirectory, filePath);
  const relativePath = path.relative(ROOT, absolutePath);

  if (relativePath === "") {
    return "";
  }

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return normalizePath(relativePath);
}

/**
 * @param {string} filePath Repository-relative path.
 * @returns {string | null} Existing repository-relative file path.
 */
function toExistingFile(filePath) {
  const relativePath = toRepoRelativePath(filePath, ROOT);

  if (!relativePath) {
    return null;
  }

  const absolutePath = path.resolve(ROOT, relativePath);
  return existsSync(absolutePath) && statSync(absolutePath).isFile()
    ? relativePath
    : null;
}

/**
 * @param {string} filePath Path to normalize.
 * @returns {string} Slash-separated path.
 */
function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

/**
 * @param {string} filePath Repository-relative path.
 * @param {Set<string>} extensions Supported extensions.
 * @returns {boolean} Whether the path has a supported extension.
 */
function hasExtension(filePath, extensions) {
  return extensions.has(path.extname(filePath).toLowerCase());
}

/**
 * Resolves a local package binary without using npm's Windows `.cmd` shim.
 *
 * @param {string} commandName Binary name.
 * @returns {CommandSpec} Spawn-ready command.
 */
function resolveCommand(commandName) {
  const packageBinPath = PACKAGE_BIN_PATHS[commandName];

  if (packageBinPath) {
    const absolutePackageBinPath = path.resolve(ROOT, packageBinPath);

    if (existsSync(absolutePackageBinPath)) {
      return {
        argsPrefix: [absolutePackageBinPath],
        command: process.execPath,
        shell: false,
      };
    }
  }

  const binaryName =
    process.platform === "win32" ? `${commandName}.cmd` : commandName;
  const localPath = path.join(ROOT, "node_modules", ".bin", binaryName);

  return {
    argsPrefix: [],
    command: existsSync(localPath) ? localPath : binaryName,
    shell: process.platform === "win32",
  };
}

/**
 * @param {string} name Stage name.
 * @param {string[]} files Stage files.
 * @returns {string} Stage heading.
 */
function stageHeader(name, files) {
  const label = files.length === 1 ? "file" : "files";
  return `\n> ${name} (${files.length} changed ${label})\n`;
}

/**
 * @param {string} name Stage name.
 * @param {string} reason Skip reason.
 * @returns {StageResult} Skipped stage result.
 */
function skippedStage(name, reason) {
  return {
    name,
    output: `\n> ${name}\n  ${reason}\n`,
    status: 0,
  };
}

/**
 * @param {string[]} baseArgs Command and fixed args.
 * @param {string[]} fileArgs File args.
 * @returns {string[][]} Argument chunks within the platform budget.
 */
function chunkArgs(baseArgs, fileArgs) {
  const chunks = [];
  const baseLength = baseArgs.join(" ").length;
  let current = [];
  let currentLength = baseLength;

  for (const fileArg of fileArgs) {
    const nextLength = currentLength + fileArg.length + 1;

    if (current.length > 0 && nextLength > MAX_COMMAND_LENGTH) {
      chunks.push(current);
      current = [];
      currentLength = baseLength;
    }

    current.push(fileArg);
    currentLength += fileArg.length + 1;
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

/**
 * @param {string} name Stage name for errors.
 * @param {string} commandName Binary name.
 * @param {string[]} args Command arguments.
 * @returns {Promise<StageResult>} Command result.
 */
function runCommand(name, commandName, args) {
  const command = resolveCommand(commandName);

  return new Promise((resolve) => {
    const child = spawn(command.command, [...command.argsPrefix, ...args], {
      cwd: ROOT,
      shell: command.shell,
      stdio: "pipe",
    });
    let output = "";

    child.stdin.end();
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
    addChildProcessListener(
      child,
      "error",
      /**
       * @param {Error} error Child process startup error.
       */
      (error) => {
        resolve({
          name,
          output: `Failed to run ${name}: ${error.message}\n`,
          status: 1,
        });
      },
    );
    addChildProcessListener(
      child,
      "close",
      /**
       * @param {number | null} status Process exit status.
       */
      (status) => {
        resolve({
          name,
          output,
          status: status ?? 1,
        });
      },
    );
  });
}

/**
 * Registers a child process listener through a runtime-checked EventEmitter
 * surface. This keeps editor type inference away from Node's fragile spawn
 * overloads while still failing clearly if a non-emitter is ever passed.
 *
 * @param {object} child Child process object.
 * @param {"close" | "error"} event Event name.
 * @param {((status: number | null) => void) | ((error: Error) => void)} listener Event listener.
 */
function addChildProcessListener(child, event, listener) {
  const on = Reflect.get(child, "on");

  if (typeof on !== "function") {
    throw new TypeError("Spawned child process does not support events.");
  }

  Reflect.apply(on, child, [event, listener]);
}

/**
 * @param {{ baseArgs: string[]; command: string; files: string[]; name: string }} options
 * @returns {Promise<StageResult>} Stage result.
 */
async function runFileCommand({ baseArgs, command, files, name }) {
  if (files.length === 0) {
    return skippedStage(name, "No matching changed files.");
  }

  let output = stageHeader(name, files);
  const commandSpec = resolveCommand(command);
  const fixedArgs = [...commandSpec.argsPrefix, ...baseArgs];
  const chunkBaseArgs = [commandSpec.command, ...fixedArgs];

  for (const chunk of chunkArgs(chunkBaseArgs, files)) {
    // oxlint-disable-next-line no-await-in-loop -- Chunks are sequential to avoid multiplying per-stage process concurrency.
    const result = await runCommand(name, command, [...baseArgs, ...chunk]);
    output += result.output;

    if (result.status !== 0) {
      return { name, output, status: result.status };
    }
  }

  return { name, output, status: 0 };
}

/**
 * @param {unknown} value Value to inspect.
 * @returns {value is Record<string, unknown>} Whether the value is a record.
 */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @returns {Record<string, unknown>} Parsed Oxlint config.
 */
function readOxlintConfig() {
  const configPath = path.resolve(ROOT, OXLINT_CONFIG_PATH);

  try {
    // oxlint-disable-next-line bensandee/no-unsafe-json-parse -- The config is local trusted project JSON and is validated as an object before use.
    const config = JSON.parse(readFileSync(configPath, "utf8"));

    if (!isRecord(config)) {
      fail(`${OXLINT_CONFIG_PATH} must contain a JSON object.`);
    }

    return config;
  } catch (error) {
    fail(
      error instanceof Error
        ? `Failed to read ${OXLINT_CONFIG_PATH}: ${error.message}`
        : `Failed to read ${OXLINT_CONFIG_PATH}.`,
    );
    throw error;
  }
}

/**
 * @returns {string} Absolute path to the generated fast Oxlint config.
 */
function createFastOxlintConfig() {
  const config = readOxlintConfig();
  const options = isRecord(config.options) ? config.options : {};
  const rules = isRecord(config.rules) ? config.rules : {};

  config.options = { ...options, typeAware: false };
  delete config.jsPlugins;
  delete config.settings;

  for (const ruleName of Object.keys(rules)) {
    if (JS_PLUGIN_RULE_PREFIXES.some((prefix) => ruleName.startsWith(prefix))) {
      delete rules[ruleName];
    }
  }

  config.rules = rules;
  mkdirSync(path.dirname(FAST_OXLINT_CONFIG_PATH), { recursive: true });
  writeFileSync(
    FAST_OXLINT_CONFIG_PATH,
    `${JSON.stringify(config, null, 2)}\n`,
  );

  return FAST_OXLINT_CONFIG_PATH;
}

/**
 * @param {OxlintMode} mode Changed-file Oxlint mode.
 * @returns {string[]} Oxlint base arguments.
 */
function oxlintArgs(mode) {
  return [
    "--config",
    mode === "full" ? OXLINT_CONFIG_PATH : createFastOxlintConfig(),
    "--format",
    "stylish",
    "--no-error-on-unmatched-pattern",
  ];
}

/**
 * @param {string} configPath Repository-relative tsconfig path.
 * @returns {{ diagnostics: import("typescript").Diagnostic[]; parsed: import("typescript").ParsedCommandLine | null }}
 */
function readTsConfig(configPath) {
  const absoluteConfigPath = path.resolve(ROOT, configPath);
  const config = ts.readConfigFile(absoluteConfigPath, (filePath) =>
    ts.sys.readFile(filePath),
  );

  if (config.error) {
    return { diagnostics: [config.error], parsed: null };
  }

  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    path.dirname(absoluteConfigPath),
    undefined,
    absoluteConfigPath,
  );

  return { diagnostics: parsed.errors, parsed };
}

/**
 * Type-checks changed files with project compiler options. Declaration files
 * are included for ambient types, but diagnostics are reported for changed
 * roots only.
 *
 * @param {{ configPath: string; files: string[] }} options Type-check options.
 * @returns {import("typescript").Diagnostic[]} Diagnostics.
 */
function typeCheckChangedFiles({ configPath, files }) {
  if (files.length === 0) {
    return [];
  }

  const { diagnostics: configDiagnostics, parsed } = readTsConfig(configPath);

  if (!parsed) {
    return configDiagnostics;
  }

  const changedRootNames = files.map((filePath) =>
    path.resolve(ROOT, filePath),
  );
  const declarationRootNames = parsed.fileNames.filter((filePath) =>
    filePath.endsWith(".d.ts"),
  );
  const program = ts.createProgram({
    options: parsed.options,
    projectReferences: parsed.projectReferences,
    rootNames: [...new Set([...changedRootNames, ...declarationRootNames])],
  });

  const diagnostics = [
    ...configDiagnostics,
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
  ];

  for (const rootName of changedRootNames) {
    const sourceFile = program.getSourceFile(rootName);

    if (!sourceFile) {
      continue;
    }

    diagnostics.push(
      ...program.getSyntacticDiagnostics(sourceFile),
      ...program.getSemanticDiagnostics(sourceFile),
    );
  }

  return diagnostics;
}

/**
 * @param {string[]} changedFiles Existing changed files.
 * @returns {StageResult} Stage result.
 */
function runChangedTypeCheck(changedFiles) {
  const appFiles = changedFiles.filter(
    (filePath) =>
      filePath.startsWith("src/") &&
      hasExtension(filePath, EXTENSIONS.typescript),
  );
  const nodeFiles = changedFiles.filter(
    (filePath) => filePath === "vite.config.ts",
  );
  const typeFiles = [...appFiles, ...nodeFiles];

  if (typeFiles.length === 0) {
    return skippedStage("lint:types", "No matching changed TypeScript files.");
  }

  let output = stageHeader("lint:types", typeFiles);
  const diagnostics = [
    ...typeCheckChangedFiles({
      configPath: "tsconfig.app.json",
      files: appFiles,
    }),
    ...typeCheckChangedFiles({
      configPath: "tsconfig.node.json",
      files: nodeFiles,
    }),
  ];

  if (diagnostics.length === 0) {
    return {
      name: "lint:types",
      output: `${output}  TypeScript found 0 errors in changed files.\n`,
      status: 0,
    };
  }

  /** @type {import("typescript").FormatDiagnosticsHost} */
  const formatHost = {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => ROOT,
    getNewLine: () => "\n",
  };

  output += ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost);
  return {
    name: "lint:types",
    output,
    status: 1,
  };
}

/**
 * @param {string[]} argv Process arguments after the script path.
 * @returns {CliOptions} Parsed options.
 */
function parseCliArgs(argv) {
  /** @type {CliOptions} */
  const options = {
    files: null,
    oxlintMode: "fast",
    staged: false,
    stages: [...ALL_STAGES],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--stages") {
      options.stages = parseStages(readOptionValue(argv, index, "--stages"));
      index += 1;
      continue;
    }

    if (arg.startsWith("--stages=")) {
      options.stages = parseStages(arg.slice("--stages=".length));
      continue;
    }

    if (arg === "--full-oxlint") {
      options.oxlintMode = "full";
      continue;
    }

    if (arg === "--oxlint-mode") {
      options.oxlintMode = parseOxlintMode(
        readOptionValue(argv, index, "--oxlint-mode"),
      );
      index += 1;
      continue;
    }

    if (arg.startsWith("--oxlint-mode=")) {
      options.oxlintMode = parseOxlintMode(arg.slice("--oxlint-mode=".length));
      continue;
    }

    if (arg === "--staged") {
      options.staged = true;
      continue;
    }

    if (arg === "--files") {
      options.files = argv.slice(index + 1);
      break;
    }

    fail(
      arg.startsWith("--")
        ? `Unknown option: ${arg}`
        : `Unexpected argument: ${arg}`,
    );
  }

  if (options.files && options.staged) {
    fail("Use either --files or --staged, not both.");
  }

  return options;
}

/**
 * @param {string[]} argv Process arguments.
 * @param {number} optionIndex Current option index.
 * @param {string} optionName Option name for errors.
 * @returns {string} Option value.
 */
function readOptionValue(argv, optionIndex, optionName) {
  const value = argv[optionIndex + 1];

  if (!value) {
    fail(`Missing value for ${optionName}.`);
  }

  return value;
}

/**
 * @param {string} rawMode Raw CLI mode.
 * @returns {OxlintMode} Validated Oxlint mode.
 */
function parseOxlintMode(rawMode) {
  if (rawMode === "fast" || rawMode === "full") {
    return rawMode;
  }

  fail("Expected --oxlint-mode to be either fast or full.");
  throw new Error("Unreachable oxlint mode branch.");
}

/**
 * @param {string} rawStages Comma-separated stage list.
 * @returns {Stage[]} Validated stages.
 */
function parseStages(rawStages) {
  const rawStageList = rawStages.split(",").filter(Boolean);
  /** @type {Stage[]} */
  const stages = [];
  const unknownStages = [];

  for (const stage of rawStageList) {
    if (isStage(stage)) {
      stages.push(stage);
    } else {
      unknownStages.push(stage);
    }
  }

  if (rawStageList.length === 0) {
    fail("Expected at least one stage in --stages.");
  }

  if (unknownStages.length > 0) {
    fail(
      `Unknown lint stage(s): ${unknownStages.join(", ")}. Expected one of: ${ALL_STAGES.join(", ")}.`,
    );
  }

  return stages;
}

/**
 * @param {string} value Candidate stage.
 * @returns {value is Stage} Whether the value is a supported stage.
 */
function isStage(value) {
  return STAGE_SET.has(value);
}

/**
 * @param {CliOptions} options CLI options.
 * @param {string[]} changedFiles Existing changed files.
 * @returns {Promise<void>}
 */
async function runStages(options, changedFiles) {
  const jobs = getStageJobs(options, changedFiles);
  const results = await runStageJobs(jobs, MAX_PARALLEL_STAGES);

  for (const result of results) {
    if (result.output) {
      process.stdout.write(result.output);
    }
  }

  const failedResult = results.find((result) => result.status !== 0);

  if (failedResult) {
    process.exit(failedResult.status);
  }
}

/**
 * @param {CliOptions} options CLI options.
 * @param {string[]} changedFiles Existing changed files.
 * @returns {Array<() => Promise<StageResult>>} Stage jobs.
 */
function getStageJobs(options, changedFiles) {
  const stageSet = new Set(options.stages);
  const jobs = [];

  if (stageSet.has("oxlint")) {
    const files = changedFiles.filter((filePath) =>
      hasExtension(filePath, EXTENSIONS.oxlint),
    );

    jobs.push(() =>
      runFileCommand({
        baseArgs: oxlintArgs(options.oxlintMode),
        command: "oxlint",
        files,
        name:
          options.oxlintMode === "full" ? "lint:oxlint" : "lint:oxlint:fast",
      }),
    );
  }

  if (stageSet.has("compiler")) {
    jobs.push(() =>
      runFileCommand({
        baseArgs: ["--check-files"],
        command: "react-compiler-tracker",
        files: changedFiles.filter(
          (filePath) =>
            filePath.startsWith("src/") &&
            hasExtension(filePath, EXTENSIONS.oxlint),
        ),
        name: "lint:compiler",
      }),
    );
  }

  if (stageSet.has("biome")) {
    jobs.push(() =>
      runFileCommand({
        baseArgs: ["check", "--no-errors-on-unmatched", "--write"],
        command: "biome",
        files: changedFiles.filter((filePath) =>
          hasExtension(filePath, EXTENSIONS.biome),
        ),
        name: "lint:biome",
      }),
    );
  }

  if (stageSet.has("architecture")) {
    jobs.push(() => runArchitectureStage(changedFiles));
  }

  if (stageSet.has("types")) {
    jobs.push(() => Promise.resolve(runChangedTypeCheck(changedFiles)));
  }

  return jobs;
}

/**
 * @param {Array<() => Promise<StageResult>>} jobs Stage jobs.
 * @param {number} concurrency Maximum concurrent jobs.
 * @returns {Promise<StageResult[]>} Ordered stage results.
 */
async function runStageJobs(jobs, concurrency) {
  /** @type {StageResult[]} */
  const results = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < jobs.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      // oxlint-disable-next-line no-await-in-loop -- Each worker intentionally runs one queued stage at a time.
      results[currentIndex] = await jobs[currentIndex]();
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, jobs.length) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}

/**
 * @param {string[]} changedFiles Existing changed files.
 * @returns {Promise<StageResult>} Stage result.
 */
async function runArchitectureStage(changedFiles) {
  const hasArchitectureFiles = changedFiles.some(
    (filePath) =>
      (filePath.startsWith("src/") || filePath === "vite.config.ts") &&
      hasExtension(filePath, EXTENSIONS.architecture),
  );

  if (!hasArchitectureFiles) {
    return skippedStage(
      "lint:architecture",
      "No matching changed architecture files.",
    );
  }

  const result = await runCommand("lint:architecture", "depcruise", [
    "--affected",
    "HEAD",
    "--config",
    ".dependency-cruiser.cjs",
    "src",
    "vite.config.ts",
  ]);

  return {
    name: "lint:architecture",
    output: `\n> lint:architecture (native changed mode)\n${result.output}`,
    status: result.status,
  };
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : "Changed-file lint failed.");
});
