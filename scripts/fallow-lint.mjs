import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const fallowArgs = ["--format", "json", "--quiet"];
const shouldFailOnFindings = process.env.FALLOW_FAIL_ON_FINDINGS === "true";
const fallowReportSchema = z
  .object({
    check: z
      .object({
        total_issues: z.number().optional(),
      })
      .optional(),
    dupes: z
      .object({
        clone_groups: z.array(z.unknown()).optional(),
        stats: z
          .object({
            clone_groups: z.number().optional(),
          })
          .optional(),
      })
      .optional(),
    health: z
      .object({
        findings: z.array(z.unknown()).optional(),
      })
      .optional(),
  })
  .passthrough();
const localEntrypoint = path.join(
  process.cwd(),
  "node_modules",
  "fallow",
  "bin",
  "fallow",
);
const hasLocalEntrypoint = existsSync(localEntrypoint);

const command = hasLocalEntrypoint ? process.execPath : "fallow";
const args = hasLocalEntrypoint ? [localEntrypoint, ...fallowArgs] : fallowArgs;
const result = spawnSync(command, args, {
  cwd: process.cwd(),
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  shell: !hasLocalEntrypoint && process.platform === "win32",
  stdio: ["ignore", "pipe", "pipe"],
});

if (result.error) {
  process.stderr.write(
    `fallow lint failed to start: ${result.error.message}\n`,
  );
  process.exit(2);
}

if (result.status === 2) {
  if (result.stdout) {
    process.stderr.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  process.exit(2);
}

let report;

try {
  const parsedReport = fallowReportSchema.safeParse(JSON.parse(result.stdout));

  if (!parsedReport.success) {
    process.stderr.write("fallow lint produced an unexpected JSON report.\n");
    process.exit(2);
  }

  report = parsedReport.data;
} catch (error) {
  process.stderr.write(
    `fallow lint produced invalid JSON: ${
      error instanceof Error ? error.message : String(error)
    }\n`,
  );
  process.exit(2);
}

const deadCodeIssues = report.check?.total_issues ?? 0;
const duplicateGroups =
  report.dupes?.stats?.clone_groups ?? report.dupes?.clone_groups?.length ?? 0;
const healthFindings = report.health?.findings?.length ?? 0;
const totalFindings = deadCodeIssues + duplicateGroups + healthFindings;

if (totalFindings > 0) {
  const summary = `fallow found ${deadCodeIssues} code issues, ${duplicateGroups} duplicate groups, and ${healthFindings} health findings.`;

  if (shouldFailOnFindings) {
    process.stderr.write(`${summary}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `${summary} Advisory only; set FALLOW_FAIL_ON_FINDINGS=true to fail this gate.\n`,
  );
} else {
  process.stdout.write("fallow found no code issues.\n");
}
