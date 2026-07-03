// @ts-check

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { cwd } from "./constants.mjs";

/**
 * @typedef {object} EnvFileEntry
 * @property {string} key Environment variable name.
 * @property {string} value Environment variable value.
 */

/**
 * Reads a boolean environment flag.
 *
 * @param {string} name Environment variable name.
 * @param {boolean} [fallback=false] Value used when the variable is absent.
 * @returns {boolean} Parsed flag value.
 */
export function envFlag(name, fallback = false) {
  const value = process.env[name];

  if (value === undefined) {
    return fallback;
  }

  return value === "true" || value === "1" || value === "yes";
}

/**
 * Loads audit env files without overriding already-exported process values.
 *
 * @param {string[]} [fileNames] Env files to load in precedence order.
 */
export function loadAuditEnvFiles(
  fileNames = [".env.audit.local", ".env.local", ".env"],
) {
  for (const fileName of fileNames) {
    loadEnvFile(fileName);
  }
}

/**
 * Loads one dotenv-style file into `process.env` if it exists.
 *
 * @param {string} fileName Repo-relative env file path.
 */
function loadEnvFile(fileName) {
  const filePath = getAuditEnvFilePath(fileName);

  if (!existsSync(filePath)) {
    return;
  }

  for (const entry of readEnvFileEntries(filePath)) {
    applyEnvFileEntry(entry);
  }
}

/**
 * Resolves an audit env file path from the repo root.
 *
 * @param {string} fileName Repo-relative env file path.
 * @returns {string} Absolute env file path.
 */
function getAuditEnvFilePath(fileName) {
  return path.join(cwd, fileName);
}

/**
 * Reads parseable dotenv entries from a file.
 *
 * @param {string} filePath Env file path.
 * @returns {EnvFileEntry[]} Parsed env entries.
 */
function readEnvFileEntries(filePath) {
  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map(parseEnvFileLine)
    .filter(isEnvFileEntry);
}

/**
 * Narrows parsed env lines to real entries.
 *
 * @param {EnvFileEntry | null} entry Parsed env entry candidate.
 * @returns {entry is EnvFileEntry} Whether the parsed line produced an entry.
 */
function isEnvFileEntry(entry) {
  return entry !== null;
}

/**
 * Applies one env file entry without overriding exported process values.
 *
 * @param {EnvFileEntry} entry Parsed env entry.
 */
function applyEnvFileEntry(entry) {
  process.env[entry.key] ??= entry.value;
}

/**
 * Parses one dotenv-style line.
 *
 * @param {string} line Raw env file line.
 * @returns {EnvFileEntry | null} Parsed entry when the line is loadable.
 */
function parseEnvFileLine(line) {
  const trimmed = line.trim();

  if (!shouldLoadEnvFileLine(trimmed)) {
    return null;
  }

  const equalsIndex = trimmed.indexOf("=");

  if (equalsIndex === -1) {
    return null;
  }

  return {
    key: trimmed.slice(0, equalsIndex).trim(),
    value: unquoteEnvFileValue(trimmed.slice(equalsIndex + 1).trim()),
  };
}

/**
 * Returns whether an env file line can contain an assignment.
 *
 * @param {string} trimmedLine Trimmed env file line.
 * @returns {boolean} Whether the line should be parsed.
 */
function shouldLoadEnvFileLine(trimmedLine) {
  return Boolean(trimmedLine) && !trimmedLine.startsWith("#");
}

/**
 * Removes matching single or double quotes around an env value.
 *
 * @param {string} value Raw env value.
 * @returns {string} Unquoted env value.
 */
function unquoteEnvFileValue(value) {
  if (isQuotedEnvFileValue(value, '"') || isQuotedEnvFileValue(value, "'")) {
    return value.slice(1, -1);
  }

  return value;
}

/**
 * Returns whether a value is wrapped in the supplied quote character.
 *
 * @param {string} value Raw env value.
 * @param {string} quote Quote character.
 * @returns {boolean} Whether the value is quoted.
 */
function isQuotedEnvFileValue(value, quote) {
  return value.startsWith(quote) && value.endsWith(quote);
}

/**
 * Reads a required environment variable.
 *
 * @param {string} name Environment variable name.
 * @returns {string} Non-empty variable value.
 */
export function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
