// @ts-check

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cwd } from "./constants.mjs";

/**
 * @typedef {import("./auth-session.mjs").AuditTokens} AuditTokens
 */

/**
 * Writes formatted JSON, creating the parent directory first.
 *
 * @param {string} filePath Destination path.
 * @param {unknown} payload JSON-serializable payload.
 */
export function writeJson(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

/**
 * Writes text, creating the parent directory first.
 *
 * @param {string} filePath Destination path.
 * @param {string} content Text content.
 */
export function writeText(filePath, content) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

/**
 * Returns every place the frontend may read audit bootstrap tokens from.
 *
 * @returns {string[]} Token JSON paths in public/dist.
 */
function getTokenFileTargets() {
  const targets = [path.join(cwd, "public", "audit-auth-tokens.json")];
  const distDir = path.join(cwd, "dist");

  if (existsSync(distDir)) {
    targets.push(path.join(distDir, "audit-auth-tokens.json"));
  }

  return targets;
}

/**
 * Writes audit bootstrap tokens for the served frontend.
 *
 * @param {AuditTokens} tokens Tokens to expose to the audit-only client bootstrap.
 */
export function writeAuditTokens(tokens) {
  for (const target of getTokenFileTargets()) {
    writeJson(target, tokens);
  }
}

/**
 * Removes generated audit bootstrap token files.
 */
export function removeAuditTokens() {
  for (const target of getTokenFileTargets()) {
    rmSync(target, { force: true });
  }
}
