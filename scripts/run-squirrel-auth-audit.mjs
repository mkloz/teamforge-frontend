import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { z } from "zod";

const cwd = process.cwd();
const today = new Date().toISOString().slice(0, 10);
const defaultSquirrelBin =
  process.platform === "win32"
    ? path.join(cwd, "temp", "squirrel", "squirrel.exe")
    : "squirrel";

const routes = [
  ["01-landing", "/"],
  ["02-download", "/download"],
  ["03-privacy", "/privacy"],
  ["04-terms", "/terms"],
  ["05-auth-redirect", "/auth"],
  ["06-auth-login", "/auth/login"],
  ["07-auth-register", "/auth/register"],
  ["08-auth-forgot-password", "/auth/forgot-password"],
  ["09-auth-reset-password-sample", "/auth/reset-password/audit-reset-token"],
  ["10-auth-activate-sample", "/auth/activate/audit-activation-token"],
  ["11-onboarding-profile", "/onboarding/profile"],
  ["12-onboarding-personality", "/onboarding/personality"],
  ["13-onboarding-interests", "/onboarding/interests"],
  ["14-home", "/home"],
  ["15-explore", "/explore"],
  ["16-group-detail-sample", "/groups/audit-group-id"],
  ["17-activity", "/activity"],
  ["18-profile", "/profile"],
  ["19-user-detail-sample", "/users/audit-user-id"],
  ["20-settings", "/settings"],
  ["21-forge", "/forge"],
  ["22-not-found-fallback", "/__squirrelscan-not-found"],
];

const refreshResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
  })
  .passthrough();

function writeOutput(message) {
  process.stdout.write(`${message}\n`);
}

function writeError(error) {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);

  process.stderr.write(`${message}\n`);
}

function loadEnvFile(fileName) {
  const filePath = path.join(cwd, fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function writeJson(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function getTokenFileTargets() {
  const targets = [path.join(cwd, "public", "audit-auth-tokens.json")];
  const distDir = path.join(cwd, "dist");

  if (existsSync(distDir)) {
    targets.push(path.join(distDir, "audit-auth-tokens.json"));
  }

  return targets;
}

function writeAuditTokens(tokens) {
  for (const target of getTokenFileTargets()) {
    writeJson(target, tokens);
  }
}

function removeAuditTokens() {
  for (const target of getTokenFileTargets()) {
    rmSync(target, { force: true });
  }
}

async function refreshTokens(tokens, apiUrl) {
  if (!tokens.refreshToken) {
    return tokens;
  }

  const refreshUrl = new URL("auth/refresh", ensureTrailingSlash(apiUrl));
  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.refreshToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    throw new Error(
      `Token refresh failed (${response.status}) at ${refreshUrl.href}: ${body}`,
    );
  }

  const parsedPayload = refreshResponseSchema.safeParse(
    // oxlint-disable-next-line bensandee(no-unsafe-json-parse) -- The parsed value is immediately validated by refreshResponseSchema.safeParse.
    JSON.parse(await response.text()),
  );

  if (!parsedPayload.success) {
    throw new Error("Token refresh response did not include accessToken.");
  }

  const payload = parsedPayload.data;

  return {
    accessToken: payload.accessToken,
    refreshToken:
      typeof payload.refreshToken === "string"
        ? payload.refreshToken
        : tokens.refreshToken,
  };
}

async function assertBaseUrlReachable(baseUrl) {
  const response = await fetch(baseUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Audit target returned ${response.status}: ${baseUrl}`);
  }
}

function runSquirrelAudit({
  baseUrl,
  coverage,
  outputDir,
  projectPrefix,
  routePath,
  slug,
  squirrelBin,
}) {
  const url = new URL(routePath, ensureTrailingSlash(baseUrl)).href;
  const outputPath = path.join(outputDir, `${slug}.llm`);
  const args = [
    "audit",
    url,
    "--coverage",
    coverage,
    "--format",
    "llm",
    "--output",
    outputPath,
    "--refresh",
    "-n",
    `${projectPrefix}-${slug}`,
  ];

  writeOutput(`AUDIT ${slug} ${url}`);

  const result = spawnSync(squirrelBin, args, {
    cwd,
    stdio: "inherit",
    windowsHide: true,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`SquirrelScan failed for ${url}`);
  }
}

async function main() {
  loadEnvFile(".env");
  loadEnvFile(".env.local");
  loadEnvFile(".env.audit.local");

  let tokens = {
    accessToken: getRequiredEnv("AUDIT_ACCESS_TOKEN"),
    refreshToken: process.env.AUDIT_REFRESH_TOKEN,
  };
  const apiUrl = process.env.VITE_API_URL ?? "http://localhost:6969/api/v1";
  const baseUrl = process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:4173";
  const coverage = process.env.AUDIT_COVERAGE ?? "full";
  const outputDir =
    process.env.AUDIT_OUTPUT_DIR ??
    path.join(cwd, "reports", `squirrelscan-authenticated-${today}`);
  const projectPrefix =
    process.env.AUDIT_PROJECT_PREFIX ?? "teamforge-authenticated";
  const squirrelBin = process.env.SQUIRREL_BIN ?? defaultSquirrelBin;
  const keepTokenFile = process.env.AUDIT_KEEP_TOKEN_FILE === "true";

  if (!existsSync(squirrelBin) && squirrelBin !== "squirrel") {
    throw new Error(`Squirrel binary not found: ${squirrelBin}`);
  }

  mkdirSync(outputDir, { recursive: true });
  await assertBaseUrlReachable(baseUrl);

  try {
    await routes.reduce(async (previousTokensTask, [slug, routePath]) => {
      tokens = await refreshTokens(await previousTokensTask, apiUrl);
      writeAuditTokens(tokens);

      runSquirrelAudit({
        baseUrl,
        coverage,
        outputDir,
        projectPrefix,
        routePath,
        slug,
        squirrelBin,
      });

      return tokens;
    }, Promise.resolve(tokens));

    writeOutput(`DONE ${routes.length} authenticated route audits`);
    writeOutput(`Reports: ${outputDir}`);
  } finally {
    if (!keepTokenFile) {
      removeAuditTokens();
    }
  }
}

main().catch((error) => {
  writeError(error);
  process.exit(1);
});
