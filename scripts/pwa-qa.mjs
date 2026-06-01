import { createReadStream, existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer, request as httpRequest } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const REPORTS_DIR = path.join(ROOT_DIR, "reports");
const REPORT_PATH = path.join(REPORTS_DIR, "pwa-qa-report.md");

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
    prefer_related_applications: z.boolean().optional(),
    scope: z.string().optional(),
    screenshots: z.array(manifestScreenshotSchema).optional(),
    shortcuts: z.array(manifestShortcutSchema).optional(),
    short_name: z.string().optional(),
    start_url: z.string().optional(),
    theme_color: z.string().optional(),
  })
  .passthrough();

const checks = [];

function addCheck(category, name, passed, detail, severity = "error") {
  checks.push({
    category,
    detail,
    name,
    passed,
    severity,
  });
}

function addPass(category, name, detail) {
  addCheck(category, name, true, detail);
}

function addFail(category, name, detail) {
  addCheck(category, name, false, detail, "error");
}

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

async function validateBuiltRoute() {
  const assetDir = path.join(DIST_DIR, "assets");

  if (!existsSync(assetDir)) {
    addFail("Route", "Assets directory", "dist/assets is missing.");
    return;
  }

  const assetFiles = await readdir(assetDir);
  const downloadChunks = assetFiles.filter((file) =>
    /^download-page-.*\.js$/.test(file),
  );

  addCheck(
    "Route",
    "Download route chunk",
    downloadChunks.length > 0,
    downloadChunks.length > 0
      ? `Found ${downloadChunks.join(", ")}.`
      : "No download-page chunk found.",
  );

  if (downloadChunks.length > 0) {
    const combinedDownloadCode = (
      await Promise.all(
        downloadChunks.map((file) => readText(path.join(assetDir, file))),
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
      combinedDownloadCode.includes("PWA diagnostics"),
      "Built download chunk should include the diagnostics panel.",
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

async function writeReport() {
  await mkdir(REPORTS_DIR, { recursive: true });
  await writeFile(REPORT_PATH, buildReport(), "utf8");
}

async function main() {
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
