// @ts-check

import { spawn } from "node:child_process";
import { cwd } from "./constants.mjs";
import { writeOutput } from "./logging.mjs";

/**
 * @typedef {object} CommandOptions
 * @property {NodeJS.ProcessEnv} [env] Environment for the spawned command.
 * @property {string} [label] Friendly command label for logs.
 * @property {boolean} [log] Whether to log the command before running.
 * @property {"inherit" | "pipe" | "ignore"} [stdio] Stdio mode.
 *
 * @typedef {object} SpawnInvocation
 * @property {string} command Executable passed to `spawn`.
 * @property {string[]} args Arguments passed to `spawn`.
 */

/**
 * Normalizes commands that Windows cannot spawn directly in some shells.
 *
 * @param {string} command Command executable.
 * @param {string[]} args Command arguments.
 * @returns {SpawnInvocation} Spawn-ready invocation.
 */
export function getSpawnInvocation(command, args) {
  if (process.platform !== "win32" || !command.endsWith(".cmd")) {
    return { command, args };
  }

  return {
    command: "cmd.exe",
    args: ["/d", "/s", "/c", command.slice(0, -4), ...args],
  };
}

/**
 * Runs a child command and rejects on non-zero exit.
 *
 * @param {string} command Command executable.
 * @param {string[]} args Command arguments.
 * @param {CommandOptions} [options] Spawn options.
 * @returns {Promise<void>}
 */
export function runCommand(
  command,
  args,
  { env = process.env, label, log = true, stdio = "inherit" } = {},
) {
  if (log) {
    writeOutput(`RUN ${label ?? [command, ...args].join(" ")}`);
  }

  return new Promise((resolve, reject) => {
    const invocation = getSpawnInvocation(command, args);
    const child = spawn(invocation.command, invocation.args, {
      cwd,
      env,
      stdio,
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label ?? command} failed with exit code ${code}`));
    });
  });
}
