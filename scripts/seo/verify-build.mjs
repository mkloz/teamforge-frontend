import { readFile } from "node:fs/promises";
import path from "node:path";

const PUBLIC_PATHS = ["/", "/download", "/privacy", "/terms"];
const PRIVATE_PATH_FRAGMENTS = [
  "/home",
  "/groups/",
  "/plans/",
  "/activity",
  "/profile",
  "/users/",
  "/settings",
  "/safety",
  "/forge",
  "/onboarding",
  "/admin",
  "/auth",
  "/invite",
];
const REQUIRED_PROTECTED_HEADER_PATHS = [
  "/home",
  "/explore",
  "/groups/*",
  "/plans/*",
  "/activity",
  "/profile",
  "/users/*",
  "/settings",
  "/safety/*",
  "/forge",
  "/onboarding/*",
  "/admin",
  "/admin/*",
  "/auth/*",
  "/invite/*",
];
const REQUIRED_TOKEN_HEADER_PATHS = [
  "/invite/*",
  "/auth/reset-password/*",
  "/auth/activate/*",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countMatches(source, pattern) {
  return Array.from(source.matchAll(pattern)).length;
}

function readCanonical(html) {
  return html.match(/<link rel="canonical" href="([^"]+)" \/>/u)?.[1];
}

async function readOutputFile(outDir, relativePath) {
  return readFile(path.join(outDir, relativePath), "utf8");
}

async function verifyHtmlRoutes(outDir) {
  const pages = await Promise.all(
    PUBLIC_PATHS.map(async (pathname) => {
      const relativePath =
        pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`;
      return [pathname, await readOutputFile(outDir, relativePath)];
    }),
  );
  const rootCanonical = readCanonical(pages[0][1]);

  assert(rootCanonical, "The homepage is missing its canonical URL.");
  const origin = new URL(rootCanonical).origin;

  for (const [pathname, html] of pages) {
    const expectedCanonical = `${origin}${pathname}`;
    assert(
      readCanonical(html) === expectedCanonical,
      `${pathname} has an incorrect canonical URL.`,
    );
    assert(
      countMatches(html, /<link rel="canonical"/gu) === 1,
      `${pathname} must contain exactly one canonical link.`,
    );
    assert(
      countMatches(
        html,
        /<meta name="robots" content="index, follow" \/>/gu,
      ) === 1,
      `${pathname} must contain exactly one indexable robots directive.`,
    );
    assert(
      !html.includes("__TEAMFORGE_APP_URL__"),
      `${pathname} still contains an unresolved app URL placeholder.`,
    );
  }

  assert(
    pages[0][1].includes('data-teamforge-json-ld="public-site"'),
    "The homepage is missing Organization/WebSite structured data.",
  );
  for (const [pathname, html] of pages.slice(1)) {
    assert(
      !html.includes('data-teamforge-json-ld="public-site"'),
      `${pathname} must not inherit homepage structured data.`,
    );
  }

  return origin;
}

async function verifyDiscoveryFiles(outDir, origin) {
  const [headers, llms, robots, sitemap] = await Promise.all([
    readOutputFile(outDir, "_headers"),
    readOutputFile(outDir, "llms.txt"),
    readOutputFile(outDir, "robots.txt"),
    readOutputFile(outDir, "sitemap.xml"),
  ]);

  for (const pathname of PUBLIC_PATHS) {
    const publicUrl = `${origin}${pathname}`;
    assert(
      sitemap.includes(`<loc>${publicUrl}</loc>`),
      `${publicUrl} is absent from sitemap.xml.`,
    );
    assert(
      pathname === "/" || llms.includes(`](${publicUrl})`),
      `${publicUrl} is absent from llms.txt.`,
    );
  }

  for (const privatePath of PRIVATE_PATH_FRAGMENTS) {
    assert(
      !sitemap.includes(`<loc>${origin}${privatePath}`),
      `A protected route leaked into sitemap.xml: ${privatePath}`,
    );
  }

  for (const routePath of REQUIRED_PROTECTED_HEADER_PATHS) {
    assert(
      headers.includes(
        `${routePath}\n  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex`,
      ),
      `Missing protected-route crawler header for ${routePath}.`,
    );
  }

  for (const routePath of REQUIRED_TOKEN_HEADER_PATHS) {
    assert(
      headers.includes(
        `${routePath}\n  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex\n  Cache-Control: private, no-store\n  Referrer-Policy: no-referrer`,
      ),
      `Missing token-route privacy headers for ${routePath}.`,
    );
  }

  assert(
    robots.includes(`Sitemap: ${origin}/sitemap.xml`),
    "robots.txt has an incorrect sitemap URL.",
  );
  assert(
    robots.includes("User-agent: OAI-SearchBot"),
    "robots.txt is missing the AI search crawler policy.",
  );
}

async function main() {
  const outDir = path.resolve(process.argv[2] ?? "dist");
  const origin = await verifyHtmlRoutes(outDir);
  await verifyDiscoveryFiles(outDir, origin);
  process.stdout.write(
    `SEO build verified: ${PUBLIC_PATHS.length} public routes; protected routes excluded.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exitCode = 1;
});
