import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, ".hardcoded-styles-baseline.json");
const SCAN_ROOT = path.join(ROOT, "src");
const UPDATE_BASELINE = process.argv.includes("--update");

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);
const IGNORED_PATH_PARTS = new Set(["node_modules", "dist", "coverage"]);
const IGNORED_FILES = new Set([
  path.normalize("src/styles/theme.css"),
  path.normalize("src/shared/types/react-css-properties.d.ts"),
]);

const STYLE_PATTERN =
  /#[\da-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)|\b(?:color|backgroundColor|borderColor|boxShadow|textShadow)\s*:/g;
const BaselineSchema = z.object({
  matches: z.record(z.string(), z.number()),
  version: z.literal(1),
});

function toRelativePath(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function shouldScan(filePath) {
  const relativePath = path.normalize(path.relative(ROOT, filePath));

  if (IGNORED_FILES.has(relativePath)) {
    return false;
  }

  return EXTENSIONS.has(path.extname(filePath));
}

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_PATH_PARTS.has(entry.name)) {
        files.push(...walk(fullPath));
      }

      continue;
    }

    if (entry.isFile() && shouldScan(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectMatches() {
  const matches = {};

  for (const filePath of walk(SCAN_ROOT)) {
    const relativePath = toRelativePath(filePath);
    const source = readFileSync(filePath, "utf8");
    const found = source.match(STYLE_PATTERN) ?? [];

    for (const value of found) {
      const key = `${relativePath}\u0000${value}`;
      matches[key] = (matches[key] ?? 0) + 1;
    }
  }

  return matches;
}

function readBaseline() {
  if (!existsSync(BASELINE_PATH)) {
    return { version: 1, matches: {} };
  }

  const parsedBaseline = BaselineSchema.safeParse(
    JSON.parse(readFileSync(BASELINE_PATH, "utf8")),
  );

  if (!parsedBaseline.success) {
    throw new Error("Hardcoded style baseline is malformed.");
  }

  return parsedBaseline.data;
}

function findNewMatches(currentMatches, baselineMatches) {
  return Object.entries(currentMatches).filter(
    ([key, count]) => count > (baselineMatches[key] ?? 0),
  );
}

const currentMatches = collectMatches();

if (UPDATE_BASELINE) {
  writeFileSync(
    BASELINE_PATH,
    `${JSON.stringify({ version: 1, matches: currentMatches }, null, 2)}\n`,
  );
  console.log(
    `Updated hardcoded style baseline with ${Object.keys(currentMatches).length} entries.`,
  );
  process.exit(0);
}

const baseline = readBaseline();
const newMatches = findNewMatches(currentMatches, baseline.matches ?? {});

if (newMatches.length === 0) {
  console.log("No new hardcoded style values found.");
  process.exit(0);
}

console.error("New hardcoded style values found:");

for (const [key, count] of newMatches) {
  const [filePath, value] = key.split("\u0000");
  const previousCount = baseline.matches?.[key] ?? 0;
  console.error(
    `- ${filePath ?? "unknown"}: ${value ?? "unknown"} (${previousCount} -> ${Number(count)} occurrences)`,
  );
}

console.error(
  "Use design tokens or Tailwind utilities, or run `node scripts/check-hardcoded-styles.mjs --update` after consciously accepting a legacy exception.",
);
process.exit(1);
