// @ts-check

/**
 * Returns a stable date stamp for report folder names.
 *
 * @returns {string} Current date in YYYY-MM-DD format.
 */
export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Writes an informational line to stdout.
 *
 * @param {string} message Message to print.
 */
export function writeOutput(message) {
  process.stdout.write(`${message}\n`);
}

/**
 * Writes an error with stack details when available.
 *
 * @param {unknown} error Error-like value to print.
 */
export function writeError(error) {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  process.stderr.write(`${message}\n`);
}

/**
 * Waits for a fixed number of milliseconds.
 *
 * @param {number} ms Delay in milliseconds.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
