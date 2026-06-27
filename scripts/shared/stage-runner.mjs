#!/usr/bin/env node
// @ts-check

import {
  colorText,
  formatDuration,
  formatStatusBadge,
  runCommand,
  sectionTitle,
} from "./command-utils.mjs";

/**
 * @typedef {{ args?: string[]; label: string; name: string; spec: import("./command-utils.mjs").CommandSpec }} CommandStage
 * @typedef {{ stopOnFailure?: boolean; title: string }} StageRunnerOptions
 */

/**
 * Runs command stages with compact progress output and full tool output.
 *
 * @param {readonly CommandStage[]} stages Stages to run.
 * @param {StageRunnerOptions} options Runner options.
 * @returns {Promise<number>} Exit status.
 */
export async function runCommandStages(stages, options) {
  const startedAt = performance.now();
  const stopOnFailure = options.stopOnFailure ?? true;

  writeLine(process.stdout, sectionTitle(options.title));

  for (const [index, stage] of stages.entries()) {
    writeLine(
      process.stdout,
      `\n${colorText(`${index + 1}/${stages.length}`, "muted")} ${stage.label}`,
    );

    // oxlint-disable-next-line no-await-in-loop -- Stages are intentionally serial so the output matches command-chain behavior.
    const result = await runCommand({
      args: stage.args,
      name: stage.name,
      spec: stage.spec,
    });

    writeBufferedOutput(result.stdout, process.stdout);
    writeBufferedOutput(result.stderr, process.stderr);

    const badge = formatStatusBadge(result.status);
    writeLine(
      process.stdout,
      `${badge} ${stage.label} (${formatDuration(result.durationMs)})`,
    );

    if (result.status !== 0) {
      writeLine(
        process.stderr,
        colorText(`Command failed: ${result.commandLine}`, "danger"),
      );

      if (stopOnFailure) {
        return result.status;
      }
    }
  }

  writeLine(
    process.stdout,
    colorText(
      `\nPassed ${stages.length} stages in ${formatDuration(performance.now() - startedAt)}.`,
      "success",
    ),
  );

  return 0;
}

/**
 * Writes one line to a stream.
 *
 * @param {NodeJS.WriteStream} stream Destination stream.
 * @param {string} line Line to write.
 */
function writeLine(stream, line) {
  stream.write(`${line}\n`);
}

/**
 * Writes buffered command output without forcing an extra newline.
 *
 * @param {string} output Command output.
 * @param {NodeJS.WriteStream} stream Destination stream.
 */
function writeBufferedOutput(output, stream) {
  if (output.length === 0) {
    return;
  }

  stream.write(output);

  if (!output.endsWith("\n")) {
    stream.write("\n");
  }
}
