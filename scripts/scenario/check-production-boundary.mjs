#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIRECTORY = path.join(ROOT, "dist");
const FORBIDDEN_MARKERS = [
  "__SCENARIO_RUNTIME__",
  "SCENARIO_UNMATCHED_REQUEST",
  "Synthetic data",
  "__scenario",
  "scenario-access-token",
  "src/dev/scenarios",
];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(target) : [target];
    }),
  );

  return files.flat();
}

async function main() {
  const files = await listFiles(DIST_DIRECTORY);
  const candidates = files.filter((file) =>
    /\.(?:css|html|js|json)$/u.test(file),
  );
  const leaks = [];

  for (const file of candidates) {
    // Sequential reads keep peak memory bounded for large production bundles.
    // eslint-disable-next-line no-await-in-loop
    const contents = await readFile(file, "utf8");

    for (const marker of FORBIDDEN_MARKERS) {
      if (contents.includes(marker)) {
        leaks.push(`${path.relative(ROOT, file)} contains ${marker}`);
      }
    }
  }

  const workerAssets = files.filter((file) =>
    /(?:mockServiceWorker|scenario).*(?:js|json)$/iu.test(path.basename(file)),
  );
  leaks.push(
    ...workerAssets.map(
      (file) => `${path.relative(ROOT, file)} is a forbidden scenario asset`,
    ),
  );

  if (leaks.length > 0) {
    throw new Error(
      `Scenario runtime leaked into production:\n${leaks.join("\n")}`,
    );
  }

  process.stdout.write(
    `Production scenario boundary passed (${files.length} files scanned).\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
});
