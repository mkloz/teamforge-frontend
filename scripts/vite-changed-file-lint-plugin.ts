import { type ExecFileException, execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

const VITE_LINT_STAGES = "oxlint,biome";
const LINT_DEBOUNCE_MS = 300;
const MAX_LINT_OUTPUT_BYTES = 10 * 1024 * 1024;

type LintResult = {
  exitCode: number;
  stderr: string;
  stdout: string;
};

/**
 * Normalizes a path to slash separators for Git-style matching.
 */
function normalizePath(filePath: string) {
  return filePath.replaceAll("\\", "/");
}

/**
 * Converts an absolute file path to a repository-relative path.
 */
function toRepoRelativePath(root: string, filePath: string) {
  const relativePath = path.relative(root, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return normalizePath(relativePath);
}

/**
 * Converts child-process output into text.
 */
function toText(value: Buffer | string | undefined) {
  return value?.toString() ?? "";
}

/**
 * Maps an `execFile` error to a numeric process exit code.
 */
function getExitCode(error: ExecFileException | null) {
  if (!error) {
    return 0;
  }

  return typeof error.code === "number" ? error.code : 1;
}

/**
 * Returns stderr plus startup failure context when needed.
 */
function getStderr(error: ExecFileException | null, stderr: Buffer | string) {
  const stderrText = toText(stderr);

  if (!error || typeof error.code === "number") {
    return stderrText;
  }

  return [stderrText, error.message].filter(Boolean).join("\n");
}

/**
 * Runs the changed-file lint script for the current Vite project.
 */
function runChangedLint(root: string, files?: string[]) {
  const scriptPath = path.join(root, "scripts", "lint-changed.mjs");
  const args = [scriptPath, "--stages", VITE_LINT_STAGES];

  if (files?.length) {
    args.push("--files", ...files);
  }

  return new Promise<LintResult>((resolve) => {
    execFile(
      process.execPath,
      args,
      {
        cwd: root,
        encoding: "utf8",
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
        maxBuffer: MAX_LINT_OUTPUT_BYTES,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        resolve({
          exitCode: getExitCode(error),
          stderr: getStderr(error, stderr),
          stdout: toText(stdout),
        });
      },
    );
  });
}

/**
 * Prints changed-file lint output through Vite's logger.
 */
function logResult(config: ResolvedConfig, result: LintResult) {
  const stdout = result.stdout.trimEnd();
  const stderr = result.stderr.trimEnd();

  if (stdout) {
    config.logger.info(stdout);
  }

  if (stderr) {
    config.logger.error(stderr);
  }

  if (result.exitCode !== 0) {
    config.logger.warn("Changed-file Vite lint found issues.");
  }
}

/**
 * Ensures the changed-file lint script exists before the plugin runs.
 */
function assertPluginReady(config: ResolvedConfig) {
  const scriptPath = path.join(config.root, "scripts", "lint-changed.mjs");

  if (!existsSync(scriptPath)) {
    throw new Error(`Changed-file lint script was not found: ${scriptPath}`);
  }
}

export function changedFileLintPlugin(): Plugin {
  const pendingFiles = new Set<string>();
  let config: ResolvedConfig | undefined;
  let running: Promise<void> = Promise.resolve();
  let timer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Runs changed-file lint for all changed files or a provided subset.
   */
  async function run(files?: string[], failOnError = false) {
    if (!config) {
      return;
    }

    const result = await runChangedLint(config.root, files);
    logResult(config, result);

    if (failOnError && result.exitCode !== 0) {
      throw new Error("Changed-file lint failed.");
    }
  }

  /**
   * Queues a lint run after any in-flight run finishes.
   */
  function queueRun(files: string[]) {
    running = running
      .catch(() => undefined)
      .then(() => run(files, false))
      .catch((error: unknown) => {
        config?.logger.error(
          error instanceof Error
            ? error.message
            : "Changed-file Vite lint failed unexpectedly.",
        );
      });
  }

  /**
   * Debounces hot-update file paths into a lint batch.
   */
  function queueFile(filePath: string) {
    if (!config) {
      return;
    }

    const relativePath = toRepoRelativePath(config.root, filePath);

    if (!relativePath) {
      return;
    }

    pendingFiles.add(relativePath);

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      const files = [...pendingFiles];
      pendingFiles.clear();
      queueRun(files);
    }, LINT_DEBOUNCE_MS);
  }

  return {
    apply: "build",
    async buildStart() {
      if (!config) {
        return;
      }

      await run(undefined, config.command === "build");
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      assertPluginReady(resolvedConfig);
    },
    handleHotUpdate({ file }) {
      queueFile(file);
    },
    name: "teamforge-changed-file-lint",
  };
}
