/* eslint-disable no-console */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const frontendRoot = resolve(scriptDirectory, "../..");
const workspaceRoot = resolve(frontendRoot, "..");
const phaseZeroRoot = join(
  workspaceRoot,
  "reports",
  "findafew-implementation",
  "phase-0",
);
const compiledInputPath = join(
  phaseZeroRoot,
  "compiled-denied-family-input.json",
);

const ignoredDirectoryNames = new Set([
  ".git",
  ".wrangler",
  "coverage",
  "node_modules",
  "playwright-report",
  "reports",
  "screenshots",
  "test-results",
  "temp",
]);

const ignoredRelativeDirectoryPrefixes = [
  ".agents/skills/",
  "dev-dist/publication-assets/",
  "dev-dist/publication-tools/",
];

const textExtensions = new Set([
  "",
  ".cjs",
  ".css",
  ".csv",
  ".env",
  ".example",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".lock",
  ".md",
  ".mjs",
  ".mts",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalDigestPayload(compiledInput) {
  return {
    schemaVersion: compiledInput.schemaVersion,
    artifactVersion: compiledInput.artifactVersion,
    sourceLedgers: compiledInput.sourceLedgers,
    rules: compiledInput.rules,
    fixtures: compiledInput.fixtures,
  };
}

function normalizeRelativePath(path) {
  return path.split(sep).join("/");
}

function isIgnoredDirectory(relativePath, name) {
  if (ignoredDirectoryNames.has(name)) {
    return true;
  }

  const normalized = `${normalizeRelativePath(relativePath)}/`;
  return ignoredRelativeDirectoryPrefixes.some((prefix) =>
    normalized.startsWith(prefix),
  );
}

function walkFiles(root, current = root) {
  const files = [];
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    const absolutePath = join(current, entry.name);
    const relativePath = relative(root, absolutePath);
    if (entry.isDirectory()) {
      if (!isIgnoredDirectory(relativePath, entry.name)) {
        files.push(...walkFiles(root, absolutePath));
      }
      continue;
    }
    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }
  return files;
}

function isTextFile(path) {
  return textExtensions.has(extname(path).toLowerCase());
}

function withGlobalFlag(flags) {
  return flags.includes("g") ? flags : `${flags}g`;
}

function lineAndColumn(content, index) {
  const prefix = content.slice(0, index);
  const lines = prefix.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function collectMatches(content, patterns) {
  const matches = [];
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.expression, withGlobalFlag(pattern.flags));
    for (const match of content.matchAll(regex)) {
      const index = match.index ?? 0;
      matches.push({
        pattern: pattern.expression,
        ruleIds: pattern.ruleIds,
        match: match[0],
        index,
        ...lineAndColumn(content, index),
      });
    }
  }
  return matches;
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

if (!existsSync(compiledInputPath)) {
  throw new Error(`Missing compiled denied-family input: ${compiledInputPath}`);
}

const compiledInputBytes = readFileSync(compiledInputPath);
// oxlint-disable-next-line bensandee/no-unsafe-json-parse -- The checksum-attested local migration artifact is structurally verified below before use.
const compiledInput = JSON.parse(compiledInputBytes.toString("utf8"));
const expectedDigest = compiledInput.checksumAttestation?.contentDigestSha256;
const actualDigest = sha256(
  JSON.stringify(canonicalDigestPayload(compiledInput)),
);

if (actualDigest !== expectedDigest) {
  fail(
    `compiled artifact digest ${actualDigest} does not match ${expectedDigest}`,
  );
}

if (compiledInput.rules.length !== 319) {
  fail(`expected 319 compiled rules, received ${compiledInput.rules.length}`);
}

for (const sourceLedger of compiledInput.sourceLedgers) {
  const ledgerPath = join(workspaceRoot, sourceLedger.path);
  const actualLedgerDigest = sha256(readFileSync(ledgerPath));
  if (actualLedgerDigest !== sourceLedger.sha256) {
    fail(
      `${sourceLedger.path} digest ${actualLedgerDigest} does not match ${sourceLedger.sha256}`,
    );
  }
}

const patternsByIdentity = new Map();
for (const rule of compiledInput.rules) {
  if (rule.matchType !== "regex") {
    fail(`unsupported compiled match type ${rule.matchType} in ${rule.ruleId}`);
    continue;
  }
  const identity = `${rule.flags}\u0000${rule.normalizedFormerTokenOrPattern}`;
  const existing = patternsByIdentity.get(identity);
  if (existing) {
    existing.ruleIds.push(rule.ruleId);
  } else {
    patternsByIdentity.set(identity, {
      expression: rule.normalizedFormerTokenOrPattern,
      flags: rule.flags,
      ruleIds: [rule.ruleId],
    });
  }
}
const uniquePatterns = [...patternsByIdentity.values()];

for (const deniedFixture of compiledInput.fixtures.deny) {
  if (collectMatches(deniedFixture, uniquePatterns).length === 0) {
    fail(`deny fixture was not rejected: ${JSON.stringify(deniedFixture)}`);
  }
}
for (const allowedFixture of compiledInput.fixtures.allow) {
  if (collectMatches(allowedFixture, uniquePatterns).length !== 0) {
    fail(`allow fixture was rejected: ${JSON.stringify(allowedFixture)}`);
  }
}

const dependencyFixture = compiledInput.fixtures.exactDependencyException;
if (
  dependencyFixture.input !== dependencyFixture.exactPattern ||
  collectMatches(dependencyFixture.input, uniquePatterns).length === 0
) {
  fail(
    "the exact third-party dependency fixture is not narrow and self-validating",
  );
}

const files = walkFiles(frontendRoot);
const findings = [];
let textFileCount = 0;
let binaryFileCount = 0;

for (const absolutePath of files) {
  const relativePath = normalizeRelativePath(
    relative(frontendRoot, absolutePath),
  );
  for (const match of collectMatches(relativePath, uniquePatterns)) {
    findings.push({ surface: "path", path: relativePath, ...match });
  }

  if (!isTextFile(absolutePath)) {
    binaryFileCount += 1;
    continue;
  }

  textFileCount += 1;
  const content = readFileSync(absolutePath, "utf8");
  for (const match of collectMatches(content, uniquePatterns)) {
    findings.push({ surface: "content", path: relativePath, ...match });
  }
}

if (findings.length > 0) {
  for (const finding of findings.slice(0, 100)) {
    console.error(
      `${finding.surface}:${finding.path}:${finding.line}:${finding.column} ${JSON.stringify(finding.match)} [${finding.ruleIds.length} compiled rule(s)]`,
    );
  }
  if (findings.length > 100) {
    console.error(`... ${findings.length - 100} additional findings omitted`);
  }
  fail(
    `${findings.length} denied-family finding(s) remain in the active frontend product scope`,
  );
}

console.log(`Compiled artifact SHA-256: ${expectedDigest}`);
console.log(
  `Compiled rules executed: ${compiledInput.rules.length} (${uniquePatterns.length} unique regex families)`,
);
console.log(
  `Fixtures passed: ${compiledInput.fixtures.deny.length} deny, ${compiledInput.fixtures.allow.length} allow, 1 exact dependency exception`,
);
console.log(
  `Frontend files scanned: ${files.length} (${textFileCount} text, ${binaryFileCount} binary path-only)`,
);
console.log(`Denied-family findings: ${findings.length}`);
console.log(
  "Excluded migration/runtime evidence: .wrangler/, reports/, screenshots/, temp/, test-results/, playwright-report/, coverage/, dev-dist/publication-*/",
);
console.log("Excluded dependency contents: node_modules/, .agents/skills/");
console.log(
  "Terminal workspace path, Git configuration, providers, persistence, and raster OCR/manual review remain separate certification surfaces.",
);
