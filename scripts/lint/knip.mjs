#!/usr/bin/env node
// @ts-check

import {
  formatStatusBadge,
  resolvePackageBin,
  runCommand,
  sectionTitle,
} from "../shared/command-utils.mjs";

/**
 * Public placeholder env values that let Knip import the Vite config without
 * relying on platform-specific shell assignment syntax.
 *
 * @type {NodeJS.ProcessEnv}
 */
const KNIP_ENV = {
  VITE_API_URL: process.env.VITE_API_URL ?? "http://localhost:6969/api/v1",
  VITE_APP_URL: process.env.VITE_APP_URL ?? "http://localhost:3000",
  VITE_GIPHY_API_KEY: process.env.VITE_GIPHY_API_KEY ?? "knip-placeholder",
  VITE_GOOGLE_CLIENT_ID:
    process.env.VITE_GOOGLE_CLIENT_ID ?? "knip-placeholder",
  VITE_GOOGLE_MAPS_API_KEY:
    process.env.VITE_GOOGLE_MAPS_API_KEY ?? "knip-placeholder",
  VITE_MEDIA_BASE_URL:
    process.env.VITE_MEDIA_BASE_URL ??
    "https://mkloz-teamforge.s3.us-east-1.amazonaws.com",
  VITE_OPERATOR_API_URL:
    process.env.VITE_OPERATOR_API_URL ?? "http://localhost:6969/api/v1",
};

/**
 * Runs Knip with TeamForge's local-safe Vite env defaults.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const result = await runCommand({
    args: process.argv.slice(2),
    env: KNIP_ENV,
    name: "knip",
    spec: resolvePackageBin("knip"),
  });
  const output = `${result.stdout}${result.stderr}`;

  if (result.status === 0 && !output.trim()) {
    process.stdout.write(`${sectionTitle("Knip")}\n`);
    process.stdout.write(
      `${formatStatusBadge("pass")} no unused files, dependencies, or exports\n`,
    );
  } else {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
  }

  process.exitCode = result.status;
}

main().catch((error) => {
  process.stderr.write(
    `Knip check failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
