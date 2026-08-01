import { spawn } from "node:child_process";
import { readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const profile = process.argv[2] === "full" ? "full" : "smoke";
const cwd = process.cwd();
const outputRoot = path.join(cwd, "temp", "scenario-screenshots", profile);
const playwrightCli = fileURLToPath(
  import.meta.resolve("@playwright/test/cli"),
);
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error("npm_execpath is required to run the Scenario visual audit.");
}

await rm(outputRoot, { force: true, recursive: true });
await run(process.execPath, [npmCli, "run", "scenario:build"]);
await run(
  process.execPath,
  [playwrightCli, "test", "--config", "test/scenario/playwright.config.ts"],
  {
    SCENARIO_AUDIT_PROFILE: profile,
    SCENARIO_SCREENSHOT_OUTPUT: outputRoot,
  },
);
await writeVisualIndex(outputRoot, profile);

process.stdout.write(
  `Scenario visual audit: ${path.join(outputRoot, "index.html")}\n`,
);

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code ?? "unknown"}.`));
      }
    });
  });
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
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>TeamForge Scenario Audit</title><style>body{margin:0;background:#0b0e0d;color:#f5f5f3;font:14px system-ui;padding:24px}h1{margin:0 0 8px}p{color:#aeb5b1;margin:0 0 24px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}figure{margin:0;background:#131615;border-radius:12px;overflow:hidden}img{display:block;width:100%;height:260px;object-fit:cover;object-position:top}figcaption{padding:12px;font-weight:650}</style></head><body><h1>Scenario visual audit</h1><p>${escapeHtml(auditProfile)} · ${files.length} screenshots</p><main class="grid">${figures}</main></body></html>`;
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
