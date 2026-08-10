import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { hashTree } from "../evidence/hash-tree.mjs";

const sanitizedReporterSchema = z.object({
  enumerated: z.number().int().nonnegative(),
  executed: z.number().int().nonnegative(),
  passed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  intentionalSkipCount: z.number().int().nonnegative(),
  unintentionalSkipCount: z.number().int().nonnegative(),
  skipReasonCounts: z.record(z.string(), z.number().int().nonnegative()),
  skipCategoryCounts: z.record(z.string(), z.number().int().nonnegative()),
});

const profile = process.argv[2] === "full" ? "full" : "smoke";
const cwd = process.cwd();
const outputRoot = path.join(cwd, "temp", "scenario-screenshots", profile);
const reporterOutputPath = path.join(
  outputRoot,
  "sanitized-runner-result.json",
);
const evidenceSummaryPath =
  profile === "full"
    ? path.join(
        cwd,
        "..",
        "reports",
        "findafew-implementation",
        "phase-3",
        "scenario-full-summary.json",
      )
    : path.join(outputRoot, "summary.json");
const playwrightCli = fileURLToPath(
  import.meta.resolve("@playwright/test/cli"),
);
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error("npm_execpath is required to run the Scenario visual audit.");
}

await rm(outputRoot, { force: true, recursive: true });
await mkdir(outputRoot, { recursive: true });
const startedAt = Date.now();
const build = await run(process.execPath, [npmCli, "run", "scenario:build"]);
const playwright =
  build.exitCode === 0
    ? await run(
        process.execPath,
        [
          playwrightCli,
          "test",
          "--config",
          "test/scenario/playwright.config.ts",
        ],
        {
          SCENARIO_AUDIT_PROFILE: profile,
          SCENARIO_SANITIZED_REPORTER_OUTPUT: reporterOutputPath,
          SCENARIO_SCREENSHOT_OUTPUT: outputRoot,
        },
      )
    : { exitCode: null, status: "not-run" };
await writeVisualIndex(outputRoot, profile);
await writeScenarioSummary({
  build,
  durationMs: Date.now() - startedAt,
  outputRoot,
  playwright,
  profile,
  reporterOutputPath,
  summaryPath: evidenceSummaryPath,
});

process.stdout.write(
  `Scenario visual audit: ${path.join(outputRoot, "index.html")}\nScenario summary: ${evidenceSummaryPath}\n`,
);

if (build.exitCode !== 0 || playwright.exitCode !== 0) {
  process.exitCode = playwright.exitCode ?? build.exitCode ?? 1;
}

function run(command, args, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: "inherit",
    });
    child.once("error", () => resolve({ exitCode: 1, status: "failed" }));
    child.once("exit", (code) => {
      resolve({
        exitCode: code ?? 1,
        status: code === 0 ? "passed" : "failed",
      });
    });
  });
}

async function writeScenarioSummary({
  build: buildResult,
  durationMs,
  outputRoot: auditOutputRoot,
  playwright: playwrightResult,
  profile: auditProfile,
  reporterOutputPath: reporterPath,
  summaryPath,
}) {
  const reporter = await readReporterIfPresent(reporterPath);
  const [sourceHash, configHash, buildHash, reportHash] = await Promise.all([
    hashTree(cwd, [
      "index.html",
      "package-lock.json",
      "package.json",
      "public",
      "scripts",
      "src",
      "test",
      "tsconfig.app.json",
      "tsconfig.json",
      "tsconfig.node.json",
      "vite.config.ts",
    ]),
    hashTree(cwd, [
      "scripts/scenario/run-visual-audit.mjs",
      "scripts/scenario/sanitized-reporter.mjs",
      "test/scenario/playwright.config.ts",
      "test/scenario/scenario-manifest.ts",
    ]),
    hashTree(cwd, ["dev-dist/scenario"]),
    hashFile(path.join(auditOutputRoot, "index.html")),
  ]);
  const summary = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    profile: auditProfile,
    hashes: {
      source: sourceHash,
      config: configHash,
      build: buildHash,
      report: reportHash,
    },
    commands: {
      scenarioBuild: buildResult,
      playwright: playwrightResult,
    },
    enumerated: reporter?.enumerated ?? 0,
    executed: reporter?.executed ?? 0,
    passed: reporter?.passed ?? 0,
    failed: reporter?.failed ?? 0,
    intentionalSkipCount: reporter?.intentionalSkipCount ?? 0,
    unintentionalSkipCount: reporter?.unintentionalSkipCount ?? 0,
    skipReasonCounts: reporter?.skipReasonCounts ?? {},
    skipCategoryCounts: reporter?.skipCategoryCounts ?? {},
    durationMs,
    exitStatus:
      buildResult.exitCode === 0 && playwrightResult.exitCode === 0
        ? "passed"
        : "failed",
  };

  await mkdir(path.dirname(summaryPath), { recursive: true });
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

async function readReporterIfPresent(filePath) {
  try {
    const payload = sanitizedReporterSchema.safeParse(
      JSON.parse(await readFile(filePath, "utf8")),
    );
    if (!payload.success) {
      throw new Error(
        `Invalid sanitized Scenario reporter output: ${filePath}`,
      );
    }
    return payload.data;
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return null;
    }
    throw error;
  }
}

async function hashFile(filePath) {
  try {
    const value = await readFile(filePath);
    return {
      algorithm: "sha256",
      digest: createHash("sha256").update(value).digest("hex"),
      file: path.basename(filePath),
    };
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return {
        algorithm: "sha256",
        digest: null,
        file: path.basename(filePath),
      };
    }
    throw error;
  }
}

function hasErrorCode(error, expectedCode) {
  return (
    error instanceof Error && "code" in error && error.code === expectedCode
  );
}

async function writeVisualIndex(outputDir, auditProfile) {
  const files = (await collectPngFiles(outputDir)).sort();
  const figures = files
    .map((file) => {
      const relativePath = path.relative(outputDir, file).replaceAll("\\", "/");
      const label = relativePath.replace(/\.png$/u, "").replaceAll("/", " · ");
      return `<figure><a href="${relativePath}"><img src="${relativePath}" loading="lazy" alt="${escapeHtml(label)}"></a><figcaption>${escapeHtml(label)}</figcaption></figure>`;
    })
    .join("\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Findafew Scenario Audit</title><style>body{margin:0;background:#0b0e0d;color:#f5f5f3;font:14px system-ui;padding:24px}h1{margin:0 0 8px}p{color:#aeb5b1;margin:0 0 24px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}figure{margin:0;background:#131615;border-radius:12px;overflow:hidden}img{display:block;width:100%;height:260px;object-fit:cover;object-position:top}figcaption{padding:12px;font-weight:650}</style></head><body><h1>Scenario visual audit</h1><p>${escapeHtml(auditProfile)} · ${files.length} screenshots</p><main class="grid">${figures}</main></body></html>`;
  await writeFile(path.join(outputDir, "index.html"), html, "utf8");
}

async function collectPngFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectPngFiles(target);
      }
      return entry.isFile() && entry.name.endsWith(".png") ? [target] : [];
    }),
  );
  return results.flat();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
