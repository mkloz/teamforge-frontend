import { createReadStream, existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer, request as httpRequest } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

/**
 * @typedef {"error" | "warning"} CheckSeverity
 * @typedef {object} QaCheck
 * @property {string} category Report category.
 * @property {string} detail Human-readable result detail.
 * @property {string} name Check name.
 * @property {boolean} passed Whether the check passed.
 * @property {CheckSeverity} severity Failure severity.
 *
 * @typedef {object} TextResponse
 * @property {string} body Response body.
 * @property {number} statusCode HTTP status code.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const REPORTS_DIR = path.join(ROOT_DIR, "reports");
const REPORT_PATH = path.join(REPORTS_DIR, "pwa-qa-report.md");
const SRC_DIR = path.join(ROOT_DIR, "src");
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, ".env.example");
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");
const PWA_PRODUCTION_ENV_SCRIPT = "scripts/pwa-production-env.mjs";
const PWA_RELEASE_SCRIPT = "npm run pwa:env && npm run build && npm run pwa:qa";
const VERCEL_CONFIG_PATH = path.join(ROOT_DIR, "vercel.json");
const LOCAL_API_URL = "http://localhost:6969/api/v1";
const PRODUCTION_API_URL = "https://api.mkloz.com/teamforge/api/v1";

const REQUIRED_TELEMETRY_EVENTS = [
  "pwa_app_installed",
  "pwa_install_prompt_available",
  "pwa_install_prompt_outcome",
  "pwa_push_subscription_outcome",
  "pwa_push_test_outcome",
  "pwa_service_worker_offline_ready",
  "pwa_service_worker_update_check",
  "pwa_service_worker_update_ready",
];

const REQUIRED_SW_MARKERS = [
  "sw-push.js",
  "precacheAndRoute",
  "cleanupOutdatedCaches",
  "NavigationRoute",
  "teamforge-public-images",
  "teamforge-fonts",
  "manifest.webmanifest",
];

const REQUIRED_PRECACHE_ASSETS = [
  "download/install-preview-android-256w.png",
  "download/install-preview-android-360w.png",
  "download/install-preview-android.png",
  "download/install-preview-desktop-480w.png",
  "download/install-preview-desktop.png",
  "download/install-preview-ios-480w.png",
  "download/install-preview-ios-720w.png",
  "download/install-preview-ios.png",
];

const SKIPPED_MANUAL_DEVICE_CHECKS = [
  "Android Chrome install, standalone launch, and uninstall/reinstall",
  "iOS Safari Add to Home Screen launch and standalone routing",
  "Desktop Chrome install prompt acceptance and installed-window behavior",
  "Real-device push permission prompt and notification delivery",
  "Installed-app Google OAuth redirect on mobile devices",
];

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".woff2": "font/woff2",
};

const manifestIconSchema = z
  .object({
    purpose: z.string().optional(),
    sizes: z.string(),
    src: z.string(),
    type: z.string().optional(),
  })
  .passthrough();

const manifestScreenshotSchema = z
  .object({
    form_factor: z.string().optional(),
    label: z.string().optional(),
    sizes: z.string(),
    src: z.string(),
    type: z.string().optional(),
  })
  .passthrough();

const manifestShortcutSchema = z
  .object({
    description: z.string().optional(),
    icons: z.array(manifestIconSchema).optional(),
    name: z.string().optional(),
    short_name: z.string().optional(),
    url: z.string().optional(),
  })
  .passthrough();

const manifestSchema = z
  .object({
    background_color: z.string().optional(),
    description: z.string().optional(),
    display: z.string().optional(),
    icons: z.array(manifestIconSchema).optional(),
    lang: z.string().optional(),
    name: z.string().optional(),
    orientation: z.string().optional(),
    prefer_related_applications: z.boolean().optional(),
    scope: z.string().optional(),
    screenshots: z.array(manifestScreenshotSchema).optional(),
    shortcuts: z.array(manifestShortcutSchema).optional(),
    short_name: z.string().optional(),
    start_url: z.string().optional(),
    theme_color: z.string().optional(),
  })
  .passthrough();

const vercelHeaderSchema = z
  .object({
    key: z.string(),
    value: z.string(),
  })
  .passthrough();

const vercelHeaderRuleSchema = z
  .object({
    headers: z.array(vercelHeaderSchema),
    source: z.string(),
  })
  .passthrough();

const vercelRewriteSchema = z
  .object({
    destination: z.string(),
    source: z.string(),
  })
  .passthrough();

const vercelConfigSchema = z
  .object({
    headers: z.array(vercelHeaderRuleSchema).optional(),
    rewrites: z.array(vercelRewriteSchema).optional(),
  })
  .passthrough();

const packageJsonSchema = z
  .object({
    scripts: z.record(z.string(), z.string()).optional(),
  })
  .passthrough();

const checks = [];

/**
 * Records a PWA QA check.
 *
 * @param {string} category Report category.
 * @param {string} name Check name.
 * @param {boolean} passed Whether the check passed.
 * @param {string} detail Human-readable result detail.
 * @param {CheckSeverity} [severity="error"] Failure severity.
 */
function addCheck(category, name, passed, detail, severity = "error") {
  checks.push({
    category,
    detail,
    name,
    passed,
    severity,
  });
}

/**
 * Records a passing PWA QA check.
 *
 * @param {string} category Report category.
 * @param {string} name Check name.
 * @param {string} detail Human-readable detail.
 */
function addPass(category, name, detail) {
  addCheck(category, name, true, detail);
}

/**
 * Records a failing PWA QA check.
 *
 * @param {string} category Report category.
 * @param {string} name Check name.
 * @param {string} detail Human-readable detail.
 */
function addFail(category, name, detail) {
  addCheck(category, name, false, detail, "error");
}

/**
 * Records a warning-level PWA QA check.
 *
 * @param {string} category Report category.
 * @param {string} name Check name.
 * @param {string} detail Human-readable detail.
 */
function addWarn(category, name, detail) {
  addCheck(category, name, false, detail, "warning");
}

async function readText(filePath) {
  return readFile(filePath, "utf8");
}

async function getFileSize(filePath) {
  const fileStat = await stat(filePath);

  return fileStat.size;
}

function stripLeadingSlash(value) {
  return value.startsWith("/") ? value.slice(1) : value;
}

function resolveDistAsset(assetPath) {
  return path.join(DIST_DIR, stripLeadingSlash(assetPath));
}

function hasPurpose(icon, purpose) {
  return String(icon.purpose ?? "")
    .split(/\s+/)
    .includes(purpose);
}

function hasWorkboxNavigationFallback(swText, fallbackUrl) {
  const escapedFallbackUrl = fallbackUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fallbackPattern = new RegExp(
    `createHandlerBoundToURL\\(["']${escapedFallbackUrl}["']\\)`,
  );

  return fallbackPattern.test(swText);
}

function getVercelHeaderRule(config, source) {
  return config.headers?.find((rule) => rule.source === source) ?? null;
}

function getVercelHeaderValue(rule, key) {
  return (
    rule?.headers.find(
      (header) => header.key.toLowerCase() === key.toLowerCase(),
    )?.value ?? null
  );
}

function hasCacheDirectives(value, directives) {
  const normalizedValue = value.toLowerCase();

  return directives.every((directive) =>
    normalizedValue.includes(directive.toLowerCase()),
  );
}

function hasCspDirectives(value, directives) {
  const normalizedValue = value.toLowerCase();

  return directives.every((directive) =>
    normalizedValue.includes(directive.toLowerCase()),
  );
}

function getEnvValue(envText, key) {
  const line = envText
    .split(/\r?\n/u)
    .find((entry) => entry.trim().startsWith(`${key}=`));

  if (!line) {
    return null;
  }

  return line
    .slice(line.indexOf("=") + 1)
    .trim()
    .replace(/^["']|["']$/gu, "");
}

function getRealtimeUrlForApiUrl(apiUrlValue) {
  const apiUrl = new URL(apiUrlValue);

  return new URL("/realtime", apiUrl.origin).toString();
}

function getSocketPathForApiUrl(apiUrlValue) {
  const apiUrl = new URL(apiUrlValue);
  const publicBasePath = apiUrl.pathname
    .replace(/\/+$/u, "")
    .replace(/\/api\/v\d+$/u, "");

  return `${publicBasePath}/socket.io`.replace(/\/{2,}/gu, "/");
}

function validateVercelHeader(config, source, key, predicate, passDetail) {
  const rule = getVercelHeaderRule(config, source);
  const value = getVercelHeaderValue(rule, key);
  const passed = value !== null && predicate(value);

  addCheck(
    "Hosting",
    `${source} ${key}`,
    passed,
    passed
      ? passDetail(value)
      : `${source} should set ${key}; found ${value ?? "no matching header"}.`,
  );
}

async function validateSourceMarkers(category, relativePath, markers) {
  const filePath = path.join(ROOT_DIR, relativePath);

  if (!existsSync(filePath)) {
    addFail(category, relativePath, `${relativePath} is missing.`);
    return "";
  }

  const sourceText = await readText(filePath);

  addPass(category, relativePath, `${relativePath} exists.`);

  for (const marker of markers) {
    const markerText = typeof marker === "string" ? marker : marker.text;
    const name = typeof marker === "string" ? marker : marker.name;
    const severity = typeof marker === "string" ? "error" : marker.severity;
    const hasMarker = sourceText.includes(markerText);

    addCheck(
      category,
      `${relativePath} marker ${name}`,
      hasMarker,
      hasMarker
        ? `${relativePath} contains ${name}.`
        : `${relativePath} is missing ${name}.`,
      severity,
    );
  }

  return sourceText;
}

/**
 * Validates source-level deployment guardrails and package scripts.
 *
 * @returns {Promise<void>}
 */
async function validateDeployGuards() {
  if (!existsSync(ENV_EXAMPLE_PATH)) {
    addFail("Deploy Guards", ".env.example", ".env.example is missing.");
  } else {
    const envExample = await readText(ENV_EXAMPLE_PATH);
    const apiUrl = getEnvValue(envExample, "VITE_API_URL");
    const googleMapsKey = getEnvValue(envExample, "VITE_GOOGLE_MAPS_API_KEY");

    addCheck(
      "Deploy Guards",
      ".env.example API prefix",
      apiUrl === LOCAL_API_URL,
      apiUrl === LOCAL_API_URL
        ? `.env.example points VITE_API_URL at ${LOCAL_API_URL}.`
        : `.env.example should use ${LOCAL_API_URL}; found ${apiUrl ?? "missing"}.`,
    );
    addCheck(
      "Deploy Guards",
      ".env.example Maps placeholder",
      googleMapsKey === "your-google-maps-api-key",
      googleMapsKey === "your-google-maps-api-key"
        ? ".env.example uses a placeholder Google Maps key."
        : ".env.example should not include a real-looking Google Maps key.",
    );
  }

  let packageJson;

  try {
    const packageJsonResult = packageJsonSchema.safeParse(
      JSON.parse(await readText(PACKAGE_JSON_PATH)),
    );

    if (!packageJsonResult.success) {
      addFail(
        "Deploy Guards",
        "package.json parses",
        `package.json shape is invalid: ${z.prettifyError(packageJsonResult.error)}`,
      );
    } else {
      packageJson = packageJsonResult.data;
    }
  } catch (error) {
    addFail(
      "Deploy Guards",
      "package.json parses",
      `Could not parse package.json: ${error.message}`,
    );
  }

  const pwaEnvScript = packageJson?.scripts?.["pwa:env"];
  const pwaReleaseScript = packageJson?.scripts?.["pwa:release"];

  addCheck(
    "Deploy Guards",
    "pwa:env script",
    pwaEnvScript === `node ${PWA_PRODUCTION_ENV_SCRIPT}`,
    pwaEnvScript === `node ${PWA_PRODUCTION_ENV_SCRIPT}`
      ? "package.json exposes the production PWA env preflight."
      : `Expected pwa:env to run node ${PWA_PRODUCTION_ENV_SCRIPT}; found ${pwaEnvScript ?? "missing"}.`,
  );
  addCheck(
    "Deploy Guards",
    "pwa:release script",
    pwaReleaseScript === PWA_RELEASE_SCRIPT,
    pwaReleaseScript === PWA_RELEASE_SCRIPT
      ? "package.json exposes the production PWA release gate."
      : `Expected pwa:release to run ${PWA_RELEASE_SCRIPT}; found ${pwaReleaseScript ?? "missing"}.`,
  );

  await validateSourceMarkers("Deploy Guards", PWA_PRODUCTION_ENV_SCRIPT, [
    "PRODUCTION_API_URL",
    "EXPECTED_PRODUCTION_SOCKET_PATH",
    "VITE_API_URL uses HTTPS",
    "VITE_API_URL includes API prefix",
  ]);

  const realtimeClientSource = await validateSourceMarkers(
    "Deploy Guards",
    path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "shared/api/realtime-client.ts"),
    ),
    [
      "API_PREFIX_PATTERN",
      "buildSocketPath(apiUrl)",
      "path: buildSocketPath(apiUrl)",
      'new URL("/realtime", apiUrl.origin)',
    ],
  );

  addCheck(
    "Deploy Guards",
    "Realtime client strips API prefix",
    realtimeClientSource.includes("\\/api\\/v\\d+"),
    realtimeClientSource.includes("\\/api\\/v\\d+")
      ? "Realtime client strips /api/vN before deriving Socket.IO paths."
      : "Realtime client should strip /api/vN when deriving Socket.IO paths.",
  );

  const localSocketPath = getSocketPathForApiUrl(LOCAL_API_URL);
  const productionSocketPath = getSocketPathForApiUrl(PRODUCTION_API_URL);
  const productionRealtimeUrl = getRealtimeUrlForApiUrl(PRODUCTION_API_URL);

  addCheck(
    "Deploy Guards",
    "Local Socket.IO path",
    localSocketPath === "/socket.io",
    `Local ${LOCAL_API_URL} derives ${localSocketPath}.`,
  );
  addCheck(
    "Deploy Guards",
    "Production Socket.IO path",
    productionSocketPath === "/teamforge/socket.io",
    `Production ${PRODUCTION_API_URL} derives ${productionSocketPath}.`,
  );
  addCheck(
    "Deploy Guards",
    "Production realtime namespace URL",
    productionRealtimeUrl === "https://api.mkloz.com/realtime",
    `Production realtime namespace resolves to ${productionRealtimeUrl}.`,
  );
}

/**
 * Validates hosting headers and SPA rewrites.
 *
 * @returns {Promise<void>}
 */
async function validateHostingConfig() {
  if (!existsSync(VERCEL_CONFIG_PATH)) {
    addFail("Hosting", "vercel.json", "vercel.json is missing.");
    return;
  }

  addPass("Hosting", "vercel.json", "vercel.json exists.");

  let vercelConfig;

  try {
    const configResult = vercelConfigSchema.safeParse(
      JSON.parse(await readText(VERCEL_CONFIG_PATH)),
    );

    if (!configResult.success) {
      addFail(
        "Hosting",
        "vercel.json parses",
        `vercel.json shape is invalid: ${z.prettifyError(configResult.error)}`,
      );
      return;
    }

    vercelConfig = configResult.data;
  } catch (error) {
    addFail(
      "Hosting",
      "vercel.json parses",
      `Could not parse vercel.json: ${error.message}`,
    );
    return;
  }

  addPass("Hosting", "vercel.json parses", "vercel.json is valid JSON.");

  const requiresRevalidation = (value) =>
    hasCacheDirectives(value, ["max-age=0", "must-revalidate"]);
  const requiresImmutableCache = (value) =>
    hasCacheDirectives(value, ["max-age=31536000", "immutable"]);
  const appShellSource = "/(.*)";

  validateVercelHeader(
    vercelConfig,
    "/manifest.webmanifest",
    "Content-Type",
    (value) => value.toLowerCase().includes("application/manifest+json"),
    (value) => `Manifest Content-Type is ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    "/manifest.webmanifest",
    "Cache-Control",
    requiresRevalidation,
    (value) => `Manifest revalidates on deploy: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    "/sw.js",
    "Cache-Control",
    requiresRevalidation,
    (value) => `Generated service worker revalidates on deploy: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    "/sw.js",
    "Service-Worker-Allowed",
    (value) => value === "/",
    (value) => `Service worker scope is allowed from ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    "/sw-push.js",
    "Cache-Control",
    requiresRevalidation,
    (value) => `Push worker import revalidates on deploy: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    "/workbox-:hash.js",
    "Cache-Control",
    requiresImmutableCache,
    (value) => `Hashed Workbox runtime is cache-immutable: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    "/assets/:path*",
    "Cache-Control",
    requiresImmutableCache,
    (value) => `Hashed Vite assets are cache-immutable: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    "/icons/:path*",
    "Cache-Control",
    requiresRevalidation,
    (value) => `PWA icon assets revalidate when deployed: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    "/download/:path*",
    "Cache-Control",
    requiresRevalidation,
    (value) => `Download visual assets revalidate when deployed: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    appShellSource,
    "Cache-Control",
    requiresRevalidation,
    (value) => `Application shell revalidates on deploy: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    appShellSource,
    "Content-Security-Policy",
    (value) =>
      hasCspDirectives(value, [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "script-src 'self'",
        "connect-src 'self'",
      ]),
    (value) => `Application CSP is present: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    appShellSource,
    "Strict-Transport-Security",
    (value) =>
      hasCacheDirectives(value, [
        "max-age=63072000",
        "includesubdomains",
        "preload",
      ]),
    (value) => `HSTS is configured: ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    appShellSource,
    "X-Frame-Options",
    (value) => value.toUpperCase() === "DENY",
    (value) => `Clickjacking protection is ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    appShellSource,
    "X-Content-Type-Options",
    (value) => value.toLowerCase() === "nosniff",
    (value) => `MIME sniffing protection is ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    appShellSource,
    "Referrer-Policy",
    (value) => value.toLowerCase() === "strict-origin-when-cross-origin",
    (value) => `Referrer policy is ${value}.`,
  );
  validateVercelHeader(
    vercelConfig,
    appShellSource,
    "Permissions-Policy",
    (value) =>
      value.includes("camera=()") &&
      value.includes("microphone=()") &&
      value.includes("geolocation=(self)"),
    (value) => `Browser capability policy is ${value}.`,
  );

  const spaRewrite = vercelConfig.rewrites?.find(
    (rewrite) => rewrite.source === "/(.*)",
  );

  addCheck(
    "Hosting",
    "SPA deep-link rewrite",
    spaRewrite?.destination === "/index.html",
    spaRewrite?.destination === "/index.html"
      ? "All non-file routes rewrite to /index.html for PWA deep links."
      : `Expected /(.*) to rewrite to /index.html; found ${
          spaRewrite?.destination ?? "no matching rewrite"
        }.`,
  );
}

function parseManifestSizes(value) {
  return String(value)
    .split(/\s+/)
    .map((entry) => {
      const [width, height] = entry.split("x").map(Number);

      return Number.isFinite(width) && Number.isFinite(height)
        ? { height, width }
        : null;
    })
    .filter(Boolean);
}

async function readPngSize(filePath) {
  const buffer = await readFile(filePath);
  const pngSignature = "89504e470d0a1a0a";

  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    return null;
  }

  return {
    height: buffer.readUInt32BE(20),
    width: buffer.readUInt32BE(16),
  };
}

function getStatusIcon(check) {
  if (check.passed) {
    return "[PASS]";
  }

  return check.severity === "warning" ? "[WARN]" : "[FAIL]";
}

async function getFilesRecursive(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return getFilesRecursive(entryPath);
      }

      return entryPath;
    }),
  );

  return files.flat();
}

/**
 * Validates generated PWA manifest shape and linked assets.
 *
 * @returns {Promise<z.infer<typeof manifestSchema> | null>} Parsed manifest.
 */
async function validateManifest() {
  const manifestPath = path.join(DIST_DIR, "manifest.webmanifest");

  if (!existsSync(manifestPath)) {
    addFail(
      "Manifest",
      "Manifest emitted",
      "dist/manifest.webmanifest is missing.",
    );
    return null;
  }

  addPass("Manifest", "Manifest emitted", "dist/manifest.webmanifest exists.");

  let manifest;

  try {
    const manifestResult = manifestSchema.safeParse(
      JSON.parse(await readText(manifestPath)),
    );

    if (!manifestResult.success) {
      addFail(
        "Manifest",
        "Manifest parses",
        `Manifest shape is invalid: ${z.prettifyError(manifestResult.error)}`,
      );
      return null;
    }

    manifest = manifestResult.data;
  } catch (error) {
    addFail(
      "Manifest",
      "Manifest parses",
      `Could not parse manifest: ${error.message}`,
    );
    return null;
  }

  addPass("Manifest", "Manifest parses", "Manifest JSON is valid.");

  const requiredTextFields = ["name", "short_name", "description", "start_url"];

  for (const field of requiredTextFields) {
    const value = manifest[field];

    if (typeof value === "string" && value.trim().length > 0) {
      addPass("Manifest", `Field ${field}`, `${field} is set to "${value}".`);
    } else {
      addFail(
        "Manifest",
        `Field ${field}`,
        `${field} must be a non-empty string.`,
      );
    }
  }

  if (["standalone", "fullscreen", "minimal-ui"].includes(manifest.display)) {
    addPass("Manifest", "Display mode", `display is "${manifest.display}".`);
  } else {
    addFail(
      "Manifest",
      "Display mode",
      "display should be standalone, fullscreen, or minimal-ui.",
    );
  }

  if (manifest.orientation === undefined) {
    addPass(
      "Manifest",
      "Orientation",
      "No orientation lock is declared, so desktop and mobile windows can adapt.",
    );
  } else {
    addFail(
      "Manifest",
      "Orientation",
      `orientation should be omitted for TeamForge's mobile and desktop PWA surfaces; found "${manifest.orientation}".`,
    );
  }

  if (manifest.scope === "/") {
    addPass("Manifest", "Scope", "scope is root-relative.");
  } else {
    addFail(
      "Manifest",
      "Scope",
      `scope should be "/"; found "${manifest.scope}".`,
    );
  }

  if (manifest.start_url?.includes("source=pwa")) {
    addPass(
      "Manifest",
      "Start URL attribution",
      `start_url includes source=pwa: ${manifest.start_url}`,
    );
  } else {
    addWarn(
      "Manifest",
      "Start URL attribution",
      "start_url does not include source=pwa.",
    );
  }

  if (manifest.theme_color === "#0D9488") {
    addPass("Manifest", "Theme color", "theme_color matches forge teal.");
  } else {
    addFail(
      "Manifest",
      "Theme color",
      `Expected #0D9488, found ${manifest.theme_color}.`,
    );
  }

  if (manifest.background_color === "#FAFAF8") {
    addPass("Manifest", "Background color", "background_color matches canvas.");
  } else {
    addFail(
      "Manifest",
      "Background color",
      `Expected #FAFAF8, found ${manifest.background_color}.`,
    );
  }

  if (manifest.prefer_related_applications === false) {
    addPass(
      "Manifest",
      "Related applications",
      "prefer_related_applications is false.",
    );
  } else {
    addWarn(
      "Manifest",
      "Related applications",
      "prefer_related_applications should be false for PWA-first launch.",
    );
  }

  await validateManifestIcons(manifest.icons ?? []);
  await validateManifestScreenshots(manifest.screenshots ?? []);
  validateManifestShortcuts(manifest.shortcuts ?? []);

  return manifest;
}

async function validateManifestIcons(icons) {
  if (!Array.isArray(icons) || icons.length === 0) {
    addFail("Manifest", "Icons", "Manifest must include icons.");
    return;
  }

  const has192 = icons.some((icon) => String(icon.sizes).includes("192x192"));
  const has512 = icons.some((icon) => String(icon.sizes).includes("512x512"));
  const hasMaskable = icons.some((icon) => hasPurpose(icon, "maskable"));

  addCheck(
    "Manifest",
    "192px icon",
    has192,
    has192 ? "A 192x192 icon is declared." : "Missing a 192x192 icon.",
  );
  addCheck(
    "Manifest",
    "512px icon",
    has512,
    has512 ? "A 512x512 icon is declared." : "Missing a 512x512 icon.",
  );
  addCheck(
    "Manifest",
    "Maskable icon",
    hasMaskable,
    hasMaskable ? "A maskable icon is declared." : "Missing a maskable icon.",
  );

  await Promise.all(
    icons.map((icon) =>
      validatePngAsset("Assets", `Icon ${icon.src}`, icon.src, icon.sizes),
    ),
  );
}

async function validateManifestScreenshots(screenshots) {
  if (!Array.isArray(screenshots) || screenshots.length === 0) {
    addPass("Manifest", "Screenshots", "No install screenshots are declared.");
    return;
  }

  const hasNarrow = screenshots.some(
    (screenshot) => screenshot.form_factor === "narrow",
  );
  const hasWide = screenshots.some(
    (screenshot) => screenshot.form_factor === "wide",
  );

  addCheck(
    "Manifest",
    "Narrow screenshot",
    hasNarrow,
    hasNarrow
      ? "A narrow install screenshot is declared."
      : "Missing a narrow install screenshot.",
    "warning",
  );
  addCheck(
    "Manifest",
    "Wide screenshot",
    hasWide,
    hasWide
      ? "A wide install screenshot is declared."
      : "Missing a wide install screenshot.",
    "warning",
  );

  await Promise.all(
    screenshots.map((screenshot) =>
      validatePngAsset(
        "Assets",
        `Screenshot ${screenshot.src}`,
        screenshot.src,
        screenshot.sizes,
      ),
    ),
  );
}

function validateManifestShortcuts(shortcuts) {
  if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
    addWarn("Manifest", "Shortcuts", "No PWA shortcuts are declared.");
    return;
  }

  for (const shortcut of shortcuts) {
    const hasName =
      typeof shortcut.name === "string" && shortcut.name.length > 0;
    const hasUrl =
      typeof shortcut.url === "string" && shortcut.url.startsWith("/");
    const hasSource =
      typeof shortcut.url === "string" &&
      shortcut.url.includes("source=pwa-shortcut");

    addCheck(
      "Manifest",
      `Shortcut ${shortcut.name ?? "unnamed"} name`,
      hasName,
      hasName ? "Shortcut has a name." : "Shortcut is missing a name.",
    );
    addCheck(
      "Manifest",
      `Shortcut ${shortcut.name ?? "unnamed"} URL`,
      hasUrl,
      hasUrl
        ? `Shortcut URL is ${shortcut.url}.`
        : "Shortcut URL must be root-relative.",
    );
    addCheck(
      "Manifest",
      `Shortcut ${shortcut.name ?? "unnamed"} attribution`,
      hasSource,
      hasSource
        ? "Shortcut URL includes source=pwa-shortcut."
        : "Shortcut URL should include source=pwa-shortcut.",
      "warning",
    );
  }
}

async function validatePngAsset(category, name, assetPath, expectedSizes) {
  const filePath = resolveDistAsset(assetPath);

  if (!existsSync(filePath)) {
    addFail(category, name, `${assetPath} is missing from dist.`);
    return;
  }

  const size = await getFileSize(filePath);

  if (size <= 0) {
    addFail(category, name, `${assetPath} is empty.`);
    return;
  }

  const pngSize = await readPngSize(filePath);

  if (!pngSize) {
    addFail(category, name, `${assetPath} is not a valid PNG.`);
    return;
  }

  const declaredSizes = parseManifestSizes(expectedSizes);
  const matchesDeclaredSize = declaredSizes.some(
    (declaredSize) =>
      declaredSize.width === pngSize.width &&
      declaredSize.height === pngSize.height,
  );

  addCheck(
    category,
    name,
    matchesDeclaredSize,
    matchesDeclaredSize
      ? `${assetPath} exists and matches ${pngSize.width}x${pngSize.height}.`
      : `${assetPath} is ${pngSize.width}x${pngSize.height}, declared as ${expectedSizes}.`,
  );
}

/**
 * Validates generated service worker and push-worker output.
 *
 * @returns {Promise<void>}
 */
async function validateServiceWorker() {
  const swPath = path.join(DIST_DIR, "sw.js");
  const swPushPath = path.join(DIST_DIR, "sw-push.js");

  if (!existsSync(swPath)) {
    addFail(
      "Service Worker",
      "Generated service worker",
      "dist/sw.js is missing.",
    );
    return;
  }

  const swText = await readText(swPath);

  addCheck(
    "Service Worker",
    "Generated service worker",
    swText.length > 1000,
    `dist/sw.js is ${swText.length} bytes.`,
  );

  for (const marker of REQUIRED_SW_MARKERS) {
    addCheck(
      "Service Worker",
      `Marker ${marker}`,
      swText.includes(marker),
      swText.includes(marker)
        ? `dist/sw.js contains ${marker}.`
        : `dist/sw.js does not contain ${marker}.`,
    );
  }

  for (const asset of REQUIRED_PRECACHE_ASSETS) {
    addCheck(
      "Service Worker",
      `Precached ${asset}`,
      swText.includes(asset),
      swText.includes(asset)
        ? `${asset} is present in the generated precache manifest.`
        : `${asset} is missing from the generated precache manifest.`,
    );
  }

  const hasIndexHtmlNavigationFallback = hasWorkboxNavigationFallback(
    swText,
    "/index.html",
  );
  const hasRootNavigationFallback = hasWorkboxNavigationFallback(swText, "/");
  const navigationFallbackDetail = hasIndexHtmlNavigationFallback
    ? hasRootNavigationFallback
      ? "Navigation fallback includes /index.html, but also still binds /."
      : "Navigation fallback is bound to the precached /index.html shell."
    : hasRootNavigationFallback
      ? "Navigation fallback is bound to /; use /index.html so offline SPA navigations hit the precache."
      : "Navigation fallback target could not be found in dist/sw.js.";

  addCheck(
    "Service Worker",
    "Navigation fallback target",
    hasIndexHtmlNavigationFallback && !hasRootNavigationFallback,
    navigationFallbackDetail,
  );

  const workboxFiles = (await readdir(DIST_DIR)).filter((file) =>
    /^workbox-.*\.js$/.test(file),
  );

  addCheck(
    "Service Worker",
    "Workbox runtime",
    workboxFiles.length > 0,
    workboxFiles.length > 0
      ? `Found ${workboxFiles.join(", ")}.`
      : "No workbox runtime file found.",
  );

  if (!existsSync(swPushPath)) {
    addFail(
      "Service Worker",
      "Push worker import",
      "dist/sw-push.js is missing.",
    );
    return;
  }

  const swPushText = await readText(swPushPath);

  addPass("Service Worker", "Push worker import", "dist/sw-push.js exists.");
  addCheck(
    "Service Worker",
    "Push event listener",
    swPushText.includes('addEventListener("push"') ||
      swPushText.includes("addEventListener('push'"),
    "sw-push.js should handle push events.",
  );
  addCheck(
    "Service Worker",
    "Notification click listener",
    swPushText.includes("notificationclick"),
    "sw-push.js should handle notification clicks.",
  );
}

/**
 * Validates source markers for install, diagnostics, badge, and resume flows.
 *
 * @returns {Promise<void>}
 */
async function validatePwaSourceRuntime() {
  await validateSourceMarkers(
    "PWA Source",
    path.relative(ROOT_DIR, path.join(PUBLIC_DIR, "sw-push.js")),
    [
      "syncPushAppBadge",
      "getPayloadBadgeCount",
      "setAppBadge",
      "clearAppBadge",
      "unreadCount",
      "clearBadge",
    ],
  );

  await validateSourceMarkers(
    "PWA Source",
    path.relative(ROOT_DIR, path.join(SRC_DIR, "app/runtime/pwa-runtime.tsx")),
    [
      "registerSW",
      "beforeinstallprompt",
      "appinstalled",
      "recordPwaServiceWorkerUpdate",
      "LazyPwaAuthenticatedRuntime",
      "PwaLaunchSourceCleanupRuntime",
      "OfflineConnectionBanner",
    ].map((marker) => ({
      name: marker,
      text: marker,
    })),
  );

  await validateSourceMarkers(
    "PWA Source",
    path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "app/runtime/pwa-authenticated-runtime.tsx"),
    ),
    [
      "useUnreadAppBadge",
      "useUnreadNotificationCount",
      "PwaResumeRefreshRuntime",
      "PWA_RESUME_REFRESH_COOLDOWN_MS",
      'refetchType: "active"',
      "recordPwaReconnectRefresh",
      "PwaServiceWorkerMessageRuntime",
      "visibilitychange",
      "pageshow",
      "online",
      "focus",
    ].map((marker) => ({
      name: marker,
      text: marker,
    })),
  );

  await validateSourceMarkers(
    "PWA Source",
    path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "app/runtime/app-realtime-sync.tsx"),
    ),
    [
      "recordPwaRealtimeResync",
      "reconnectRealtimeWithDiagnostic",
      "initial sync",
      "visibilitychange",
      "online",
      "focus",
    ],
  );

  await validateSourceMarkers(
    "PWA Source",
    path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "shared/lib/pwa-runtime-diagnostics.ts"),
    ),
    [
      "recordPwaReconnectRefresh",
      "recordPwaRealtimeResync",
      "subscribePwaRuntimeDiagnostics",
      "getPwaRuntimeDiagnosticsSnapshot",
    ],
  );

  await validateSourceMarkers(
    "PWA Source",
    path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "shared/hooks/use-pwa-runtime-diagnostics.ts"),
    ),
    ["useSyncExternalStore", "subscribePwaRuntimeDiagnostics"],
  );

  const diagnosticsPanelSource = await validateSourceMarkers(
    "PWA Source",
    path.relative(
      ROOT_DIR,
      path.join(
        SRC_DIR,
        "features/download/components/pwa-diagnostics-panel.tsx",
      ),
    ),
    [
      "DIAGNOSTIC_CHECK_COUNT = 8",
      "Display mode",
      "Install prompt",
      "Secure context",
      "Service worker",
      "Push support",
      "Permission",
      "Backend push",
      "This device",
    ],
  );

  for (const staleMarker of [
    "usePwaRuntimeDiagnostics",
    "Reconnect refresh",
    "Realtime resync",
    "Push bridge",
    "App badge",
  ]) {
    const isAbsent = !diagnosticsPanelSource.includes(staleMarker);

    addCheck(
      "PWA Source",
      `Diagnostics excludes ${staleMarker}`,
      isAbsent,
      isAbsent
        ? `${staleMarker} is not shown as a device-readiness check.`
        : `${staleMarker} should not be shown in the fixed 8-check readiness grid.`,
    );
  }
}

/**
 * Smoke-tests the built `/download`, manifest, and service worker routes.
 *
 * @returns {Promise<void>}
 */
async function validateBuiltRoute() {
  const assetDir = path.join(DIST_DIR, "assets");
  const indexHtmlPath = path.join(DIST_DIR, "index.html");

  if (!existsSync(assetDir)) {
    addFail("Route", "Assets directory", "dist/assets is missing.");
    return;
  }

  const assetFiles = await readdir(assetDir);
  const downloadChunks = assetFiles.filter((file) =>
    /^download-page-.*\.js$/.test(file),
  );
  const diagnosticsChunks = assetFiles.filter((file) =>
    /^pwa-diagnostics-panel-.*\.js$/.test(file),
  );
  const authenticatedRuntimeChunks = assetFiles.filter((file) =>
    /^pwa-authenticated-runtime-.*\.js$/.test(file),
  );

  addCheck(
    "Route",
    "Download route chunk",
    downloadChunks.length > 0,
    downloadChunks.length > 0
      ? `Found ${downloadChunks.join(", ")}.`
      : "No download-page chunk found.",
  );
  addCheck(
    "Route",
    "Authenticated PWA runtime chunk",
    authenticatedRuntimeChunks.length > 0,
    authenticatedRuntimeChunks.length > 0
      ? `Found ${authenticatedRuntimeChunks.join(", ")}.`
      : "No authenticated PWA runtime chunk found.",
  );

  if (downloadChunks.length > 0) {
    const combinedDownloadCode = (
      await Promise.all(
        downloadChunks.map((file) => readText(path.join(assetDir, file))),
      )
    ).join("\n");
    const combinedDiagnosticsCode = (
      await Promise.all(
        diagnosticsChunks.map((file) => readText(path.join(assetDir, file))),
      )
    ).join("\n");

    addCheck(
      "Route",
      "Download copy",
      combinedDownloadCode.includes("Download TeamForge"),
      "Built download chunk should contain download metadata/copy.",
    );
    addCheck(
      "Route",
      "Diagnostics copy",
      combinedDiagnosticsCode.includes("PWA diagnostics") ||
        combinedDownloadCode.includes("PWA diagnostics"),
      diagnosticsChunks.length > 0
        ? `Built diagnostics chunk ${diagnosticsChunks.join(", ")} includes the diagnostics panel.`
        : "Built download chunk should include or lazy-load the diagnostics panel.",
    );
  }

  if (existsSync(indexHtmlPath)) {
    const indexHtml = await readText(indexHtmlPath);

    addCheck(
      "Route",
      "Authenticated PWA runtime preload",
      !indexHtml.includes("pwa-authenticated-runtime"),
      indexHtml.includes("pwa-authenticated-runtime")
        ? "index.html preloads the authenticated PWA runtime."
        : "index.html leaves the authenticated PWA runtime lazy.",
    );
  }

  await withStaticServer(async (baseUrl) => {
    const downloadResponse = await requestText(`${baseUrl}/download`);
    const manifestResponse = await requestText(
      `${baseUrl}/manifest.webmanifest`,
    );
    const serviceWorkerResponse = await requestText(`${baseUrl}/sw.js`);

    addCheck(
      "Route",
      "/download smoke",
      downloadResponse.statusCode === 200 &&
        downloadResponse.body.includes('<div id="root">'),
      `/download returned ${downloadResponse.statusCode}.`,
    );
    addCheck(
      "Route",
      "Manifest HTTP smoke",
      manifestResponse.statusCode === 200 &&
        manifestResponse.body.includes('"name":"TeamForge"'),
      `/manifest.webmanifest returned ${manifestResponse.statusCode}.`,
    );
    addCheck(
      "Route",
      "Service worker HTTP smoke",
      serviceWorkerResponse.statusCode === 200 &&
        serviceWorkerResponse.body.includes("sw-push.js"),
      `/sw.js returned ${serviceWorkerResponse.statusCode}.`,
    );
  });
}

/**
 * Confirms required PWA telemetry markers are present in built assets.
 *
 * @returns {Promise<void>}
 */
async function validateTelemetry() {
  const files = await getFilesRecursive(DIST_DIR);
  const jsFiles = files.filter((file) => file.endsWith(".js"));
  const combinedJs = (await Promise.all(jsFiles.map(readText))).join("\n");

  for (const eventName of REQUIRED_TELEMETRY_EVENTS) {
    addCheck(
      "Telemetry",
      `Event ${eventName}`,
      combinedJs.includes(eventName),
      combinedJs.includes(eventName)
        ? `${eventName} is present in built assets.`
        : `${eventName} is missing from built assets.`,
    );
  }

  const hasLazyTelemetryImport = combinedJs.includes("telemetry-");

  addCheck(
    "Telemetry",
    "Telemetry chunk",
    hasLazyTelemetryImport,
    hasLazyTelemetryImport
      ? "Built assets include a lazy telemetry chunk reference."
      : "Built assets do not reference a telemetry chunk.",
    "warning",
  );
}

/**
 * Serves `dist/` through a tiny local static server for route smoke checks.
 *
 * @param {(baseUrl: string) => Promise<void>} callback Smoke callback.
 * @returns {Promise<void>}
 */
async function withStaticServer(callback) {
  const server = createServer(async (request, response) => {
    try {
      const requestedUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(requestedUrl.pathname);
      const safePath = path
        .normalize(stripLeadingSlash(pathname))
        .replace(/^(\.\.[/\\])+/, "");
      let filePath = path.join(DIST_DIR, safePath);

      if (
        pathname === "/" ||
        !path.extname(filePath) ||
        !existsSync(filePath)
      ) {
        filePath = path.join(DIST_DIR, "index.html");
      }

      if (!filePath.startsWith(DIST_DIR) || !existsSync(filePath)) {
        response.writeHead(404, {
          "Content-Type": "text/plain; charset=utf-8",
        });
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type":
          CONTENT_TYPES[path.extname(filePath)] ?? "application/octet-stream",
      });
      createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : "Server error");
    }
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;

  if (!port) {
    addFail(
      "Route",
      "Static server",
      "Could not allocate a static server port.",
    );
    server.close();
    return;
  }

  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }
}

/**
 * Requests text from a local HTTP URL.
 *
 * @param {string} url URL to request.
 * @returns {Promise<TextResponse>} Response body and status.
 */
function requestText(url) {
  return new Promise((resolve, reject) => {
    const request = new URL(url);
    const req = httpRequest(request, (response) => {
      let body = "";

      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve({
          body,
          statusCode: response.statusCode ?? 0,
        });
      });
    });

    req.on("error", reject);
    req.end();
  });
}

/**
 * Groups checks by outcome.
 *
 * @returns {{ failed: QaCheck[]; passed: QaCheck[]; warnings: QaCheck[] }} Summary buckets.
 */
function summarizeChecks() {
  const failed = checks.filter(
    (check) => !check.passed && check.severity === "error",
  );
  const warnings = checks.filter(
    (check) => !check.passed && check.severity === "warning",
  );
  const passed = checks.filter((check) => check.passed);

  return { failed, passed, warnings };
}

/**
 * Builds the markdown QA report from collected checks.
 *
 * @returns {string} Markdown report.
 */
function buildReport() {
  const { failed, passed, warnings } = summarizeChecks();
  const categories = [...new Set(checks.map((check) => check.category))];
  const lines = [
    "# PWA QA Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Passed: ${passed.length}`,
    `- Warnings: ${warnings.length}`,
    `- Failed: ${failed.length}`,
    "",
    "## Automated Scope",
    "",
    "This report covers source-level PWA contracts, Vercel hosting rules, plus build artifacts in `dist/`: manifest, service worker, route smoke checks, asset precache, and telemetry markers.",
    "",
    "## Skipped Manual Device Checks",
    "",
    ...SKIPPED_MANUAL_DEVICE_CHECKS.map((check) => `- [SKIPPED] ${check}`),
    "",
  ];

  for (const category of categories) {
    lines.push(`## ${category}`, "");

    for (const check of checks.filter((item) => item.category === category)) {
      lines.push(`- ${getStatusIcon(check)} ${check.name}: ${check.detail}`);
    }

    lines.push("");
  }

  if (failed.length > 0) {
    lines.push("## Required Fixes", "");
    for (const check of failed) {
      lines.push(`- ${check.category} / ${check.name}: ${check.detail}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Writes the markdown QA report.
 *
 * @returns {Promise<void>}
 */
async function writeReport() {
  await mkdir(REPORTS_DIR, { recursive: true });
  await writeFile(REPORT_PATH, buildReport(), "utf8");
}

/**
 * Runs the full PWA QA script.
 *
 * @returns {Promise<void>}
 */
async function main() {
  await validateDeployGuards();
  await validateHostingConfig();
  await validatePwaSourceRuntime();

  if (!existsSync(DIST_DIR)) {
    addFail(
      "Build",
      "dist directory",
      "dist is missing. Run npm run build first.",
    );
  } else {
    addPass("Build", "dist directory", "dist exists.");
    await validateManifest();
    await validateServiceWorker();
    await validateBuiltRoute();
    await validateTelemetry();
  }

  await writeReport();

  const { failed, passed, warnings } = summarizeChecks();

  process.stdout.write(
    `PWA QA complete: ${passed.length} passed, ${warnings.length} warnings, ${failed.length} failed.`,
  );
  process.stdout.write(
    `\nReport written to ${path.relative(ROOT_DIR, REPORT_PATH)}\n`,
  );

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

await main();
