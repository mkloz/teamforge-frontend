/* eslint-disable no-await-in-loop -- ordered hashing is part of the digest contract */

import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Returns a deterministic SHA-256 over the requested first-party files.
 *
 * Every file contributes its POSIX-style path, a NUL delimiter, its bytes and a
 * second NUL delimiter. The sorted path list and file count make the digest
 * scope reproducible without exposing absolute workstation paths.
 *
 * @param {string} root Digest root.
 * @param {string[]} entries Files or directories relative to the root.
 */
export async function hashTree(root, entries) {
  const files = [];

  for (const entry of entries) {
    await collectFiles(root, path.resolve(root, entry), files);
  }

  const uniqueFiles = [...new Set(files)].sort((left, right) =>
    left.localeCompare(right, "en"),
  );
  const hash = createHash("sha256");

  for (const relativePath of uniqueFiles) {
    hash.update(relativePath.replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(await readFile(path.join(root, relativePath)));
    hash.update("\0");
  }

  return {
    algorithm: "sha256",
    digest: hash.digest("hex"),
    fileCount: uniqueFiles.length,
    inputs: [...entries].sort((left, right) => left.localeCompare(right, "en")),
  };
}

async function collectFiles(root, target, files) {
  let targetStat;

  try {
    targetStat = await stat(target);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  if (targetStat.isFile()) {
    files.push(path.relative(root, target));
    return;
  }

  if (!targetStat.isDirectory()) {
    return;
  }

  const entries = await readdir(target, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      continue;
    }
    await collectFiles(root, path.join(target, entry.name), files);
  }
}
