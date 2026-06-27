// @ts-check

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
 *
 * @typedef {object} ExpectedValueGuard
 * @property {string} expected Expected value.
 * @property {(value: string | null | undefined) => string} failDetail Failure detail builder.
 * @property {string} name Check name.
 * @property {string} passDetail Passing detail.
 *
 * @typedef {ExpectedValueGuard & { key: string }} EnvExampleGuard
 * @typedef {ExpectedValueGuard & { scriptName: string }} PackageScriptGuard
 *
 * @typedef {object} NamedSourceMarker
 * @property {string} name Check name.
 * @property {CheckSeverity} [severity] Optional marker severity.
 * @property {string} text Marker text to find.
 *
 * @typedef {string | NamedSourceMarker} SourceMarker
 *
 * @typedef {object} SourceMarkerTarget
 * @property {readonly SourceMarker[]} markers Markers to validate.
 * @property {string} relativePath Source path relative to repo root.
 *
 * @typedef {object} ManifestIcon
 * @property {string} [purpose] Icon purpose tokens.
 * @property {string} sizes Manifest-declared sizes.
 * @property {string} src Icon source path.
 * @property {string} [type] Optional MIME type.
 *
 * @typedef {object} ManifestScreenshot
 * @property {string} [form_factor] Screenshot form factor.
 * @property {string} [label] Screenshot label.
 * @property {string} sizes Manifest-declared sizes.
 * @property {string} src Screenshot source path.
 * @property {string} [type] Optional MIME type.
 *
 * @typedef {object} ManifestShortcut
 * @property {string} [description] Shortcut description.
 * @property {ManifestIcon[]} [icons] Shortcut icons.
 * @property {string} [name] Shortcut name.
 * @property {string} [short_name] Shortcut short name.
 * @property {string} [url] Shortcut URL.
 *
 * @typedef {object} ManifestReport
 * @property {string} [background_color] Manifest background color.
 * @property {string} [description] Manifest description.
 * @property {string} [display] Display mode.
 * @property {ManifestIcon[]} [icons] Manifest icons.
 * @property {string} [lang] Manifest language.
 * @property {string} [name] Manifest name.
 * @property {string} [orientation] Optional orientation.
 * @property {boolean} [prefer_related_applications] Related-app preference.
 * @property {string} [scope] Manifest scope.
 * @property {ManifestScreenshot[]} [screenshots] Manifest screenshots.
 * @property {ManifestShortcut[]} [shortcuts] Manifest shortcuts.
 * @property {string} [short_name] Manifest short name.
 * @property {string} [start_url] Start URL.
 * @property {string} [theme_color] Manifest theme color.
 *
 * @typedef {object} ManifestIconCheck
 * @property {string} failDetail Failure detail.
 * @property {(items: readonly ManifestIcon[]) => boolean} getPassed Collection predicate.
 * @property {string} name Check name.
 * @property {string} passDetail Passing detail.
 * @property {CheckSeverity} [severity] Optional severity.
 *
 * @typedef {object} ManifestScreenshotCheck
 * @property {string} failDetail Failure detail.
 * @property {(items: readonly ManifestScreenshot[]) => boolean} getPassed Collection predicate.
 * @property {string} name Check name.
 * @property {string} passDetail Passing detail.
 * @property {CheckSeverity} [severity] Optional severity.
 *
 * @typedef {object} ManifestShortcutRequirement
 * @property {(shortcut: ManifestShortcut, passed: boolean) => string} getDetail Detail builder.
 * @property {(shortcut: ManifestShortcut) => boolean} getPassed Shortcut predicate.
 * @property {string} nameSuffix Requirement label suffix.
 * @property {CheckSeverity} [severity] Optional severity.
 *
 * @typedef {object} PackageJsonReport
 * @property {Record<string, string>} [scripts] Package scripts.
 *
 * @typedef {object} PngSize
 * @property {number} height Image height.
 * @property {number} width Image width.
 *
 * @typedef {object} RouteAssetInventory
 * @property {string} assetDir Asset directory.
 * @property {string[]} authenticatedRuntimeChunks Authenticated runtime chunks.
 * @property {string[]} diagnosticsChunks Diagnostics chunks.
 * @property {string[]} downloadChunks Download page chunks.
 * @property {string} indexHtmlPath Built index path.
 *
 * @typedef {object} ReportSummary
 * @property {QaCheck[]} failed Error-level failed checks.
 * @property {QaCheck[]} passed Passing checks.
 * @property {QaCheck[]} warnings Warning-level failed checks.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const REPORTS_DIR = path.join(ROOT_DIR, "reports");
const REPORT_PATH = path.join(REPORTS_DIR, "pwa-qa-report.md");
const SRC_DIR = path.join(ROOT_DIR, "src");
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, ".env.example");
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");
const PWA_PRODUCTION_ENV_SCRIPT = "scripts/pwa/production-env.mjs";
const PWA_RELEASE_SCRIPT = "node scripts/pwa/release.mjs";
const LOCAL_APP_URL = "http://localhost:3000";
const LOCAL_API_URL = "http://localhost:6969/api/v1";
const MEDIA_BASE_URL = "https://mkloz-teamforge.s3.us-east-1.amazonaws.com";
const PRODUCTION_API_URL = "https://api.mkloz.com/teamforge/api/v1";

/**
 * @param {readonly string[]} markers Source marker strings.
 * @returns {NamedSourceMarker[]} Named marker descriptors.
 */
function toNamedMarkers(markers) {
  return markers.map((marker) => ({
    name: marker,
    text: marker,
  }));
}

/** @type {readonly EnvExampleGuard[]} */
const ENV_EXAMPLE_GUARDS = [
  {
    expected: LOCAL_APP_URL,
    failDetail: (value) =>
      `.env.example should use ${LOCAL_APP_URL}; found ${value ?? "missing"}.`,
    key: "VITE_APP_URL",
    name: ".env.example app URL",
    passDetail: `.env.example points VITE_APP_URL at ${LOCAL_APP_URL}.`,
  },
  {
    expected: LOCAL_API_URL,
    failDetail: (value) =>
      `.env.example should use ${LOCAL_API_URL}; found ${value ?? "missing"}.`,
    key: "VITE_API_URL",
    name: ".env.example API prefix",
    passDetail: `.env.example points VITE_API_URL at ${LOCAL_API_URL}.`,
  },
  {
    expected: MEDIA_BASE_URL,
    failDetail: (value) =>
      `.env.example should use ${MEDIA_BASE_URL}; found ${value ?? "missing"}.`,
    key: "VITE_MEDIA_BASE_URL",
    name: ".env.example media base URL",
    passDetail:
      ".env.example points VITE_MEDIA_BASE_URL at the seed media host.",
  },
  {
    expected: "your-google-maps-api-key",
    failDetail: () =>
      ".env.example should not include a real-looking Google Maps key.",
    key: "VITE_GOOGLE_MAPS_API_KEY",
    name: ".env.example Maps placeholder",
    passDetail: ".env.example uses a placeholder Google Maps key.",
  },
];

/** @type {readonly PackageScriptGuard[]} */
const PACKAGE_SCRIPT_GUARDS = [
  {
    expected: PWA_RELEASE_SCRIPT,
    failDetail: (value) =>
      `Expected pwa:release to run ${PWA_RELEASE_SCRIPT}; found ${value ?? "missing"}.`,
    name: "pwa:release script",
    passDetail: "package.json exposes the production PWA release gate.",
    scriptName: "pwa:release",
  },
];

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

const MANIFEST_TEXT_FIELDS = ["name", "short_name", "description", "start_url"];

/** @type {readonly ManifestIconCheck[]} */
const MANIFEST_ICON_CHECKS = [
  {
    failDetail: "Missing a 192x192 icon.",
    getPassed: (icons) => icons.some((icon) => icon.sizes.includes("192x192")),
    name: "192px icon",
    passDetail: "A 192x192 icon is declared.",
  },
  {
    failDetail: "Missing a 512x512 icon.",
    getPassed: (icons) => icons.some((icon) => icon.sizes.includes("512x512")),
    name: "512px icon",
    passDetail: "A 512x512 icon is declared.",
  },
  {
    failDetail: "Missing a maskable icon.",
    getPassed: (icons) => icons.some((icon) => hasPurpose(icon, "maskable")),
    name: "Maskable icon",
    passDetail: "A maskable icon is declared.",
  },
];

/** @type {readonly ManifestScreenshotCheck[]} */
const MANIFEST_SCREENSHOT_CHECKS = [
  {
    failDetail: "Missing a narrow install screenshot.",
    getPassed: (screenshots) =>
      screenshots.some((screenshot) => screenshot.form_factor === "narrow"),
    name: "Narrow screenshot",
    passDetail: "A narrow install screenshot is declared.",
    severity: "warning",
  },
  {
    failDetail: "Missing a wide install screenshot.",
    getPassed: (screenshots) =>
      screenshots.some((screenshot) => screenshot.form_factor === "wide"),
    name: "Wide screenshot",
    passDetail: "A wide install screenshot is declared.",
    severity: "warning",
  },
];

/** @type {readonly ManifestShortcutRequirement[]} */
const MANIFEST_SHORTCUT_REQUIREMENTS = [
  {
    getDetail: getManifestShortcutNameDetail,
    getPassed: hasManifestShortcutName,
    nameSuffix: "name",
  },
  {
    getDetail: getManifestShortcutUrlDetail,
    getPassed: hasManifestShortcutUrl,
    nameSuffix: "URL",
  },
  {
    getDetail: getManifestShortcutAttributionDetail,
    getPassed: hasManifestShortcutAttribution,
    nameSuffix: "attribution",
    severity: "warning",
  },
];

/** @type {readonly SourceMarkerTarget[]} */
const PWA_SOURCE_MARKER_TARGETS = [
  {
    markers: [
      "syncPushAppBadge",
      "getPayloadBadgeCount",
      "setAppBadge",
      "clearAppBadge",
      "unreadCount",
      "clearBadge",
    ],
    relativePath: path.relative(ROOT_DIR, path.join(PUBLIC_DIR, "sw-push.js")),
  },
  {
    markers: toNamedMarkers([
      "registerSW",
      "beforeinstallprompt",
      "appinstalled",
      "recordPwaServiceWorkerUpdate",
      "LazyPwaAuthenticatedRuntime",
      "PwaLaunchSourceCleanupRuntime",
      "OfflineConnectionBanner",
    ]),
    relativePath: path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "app/runtime/pwa-runtime.tsx"),
    ),
  },
  {
    markers: toNamedMarkers([
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
    ]),
    relativePath: path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "app/runtime/pwa-authenticated-runtime.tsx"),
    ),
  },
  {
    markers: [
      "recordPwaRealtimeResync",
      "reconnectRealtimeWithDiagnostic",
      "initial sync",
      "visibilitychange",
      "online",
      "focus",
    ],
    relativePath: path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "app/runtime/app-realtime-sync.tsx"),
    ),
  },
  {
    markers: [
      "recordPwaReconnectRefresh",
      "recordPwaRealtimeResync",
      "subscribePwaRuntimeDiagnostics",
      "getPwaRuntimeDiagnosticsSnapshot",
    ],
    relativePath: path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "shared/lib/pwa-runtime-diagnostics.ts"),
    ),
  },
  {
    markers: ["useSyncExternalStore", "subscribePwaRuntimeDiagnostics"],
    relativePath: path.relative(
      ROOT_DIR,
      path.join(SRC_DIR, "shared/hooks/use-pwa-runtime-diagnostics.ts"),
    ),
  },
];

const DIAGNOSTICS_PANEL_MARKERS = [
  "DIAGNOSTIC_CHECK_COUNT = 8",
  "Display mode",
  "Install prompt",
  "Secure context",
  "Service worker",
  "Push support",
  "Permission",
  "Backend push",
  "This device",
];

const STALE_DIAGNOSTIC_MARKERS = [
  "usePwaRuntimeDiagnostics",
  "Reconnect refresh",
  "Realtime resync",
  "Push bridge",
  "App badge",
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

const packageJsonSchema = z
  .object({
    scripts: z.record(z.string(), z.string()).optional(),
  })
  .passthrough();

/** @type {QaCheck[]} */
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

/**
 * Reads a file size in bytes.
 *
 * @param {string} filePath File path.
 * @returns {Promise<number>} File size.
 */
async function getFileSize(filePath) {
  const fileStat = await stat(filePath);

  return fileStat.size;
}

/**
 * Removes one leading slash from a route or asset path.
 *
 * @param {string} value Path value.
 * @returns {string} Path without a leading slash.
 */
function stripLeadingSlash(value) {
  return value.startsWith("/") ? value.slice(1) : value;
}

/**
 * Formats an unknown caught value for check details.
 *
 * @param {unknown} error Caught value.
 * @returns {string} Error message.
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Resolves a manifest asset path inside the built `dist` directory.
 *
 * @param {string} assetPath Manifest asset path.
 * @returns {string} Absolute asset path.
 */
function resolveDistAsset(assetPath) {
  return path.join(DIST_DIR, stripLeadingSlash(assetPath));
}

/**
 * Checks whether a manifest icon declares a purpose token.
 *
 * @param {ManifestIcon} icon Manifest icon.
 * @param {string} purpose Purpose token.
 * @returns {boolean} Whether the purpose is present.
 */
function hasPurpose(icon, purpose) {
  return (icon.purpose ?? "").split(/\s+/).includes(purpose);
}

/**
 * Checks whether generated Workbox code binds a navigation fallback URL.
 *
 * @param {string} swText Service worker text.
 * @param {string} fallbackUrl Fallback URL to locate.
 * @returns {boolean} Whether the fallback is present.
 */
function hasWorkboxNavigationFallback(swText, fallbackUrl) {
  const escapedFallbackUrl = fallbackUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fallbackPattern = new RegExp(
    `createHandlerBoundToURL\\(["']${escapedFallbackUrl}["']\\)`,
  );

  return fallbackPattern.test(swText);
}

/**
 * Reads one dotenv-style value from env text.
 *
 * @param {string} envText Env file text.
 * @param {string} key Env key.
 * @returns {string | null} Env value, or null when absent.
 */
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

/**
 * Adds a check for a guard with a single expected string value.
 *
 * @param {string} category Report category.
 * @param {ExpectedValueGuard} guard Expected-value guard.
 * @param {string | null | undefined} actualValue Actual value.
 */
function addExpectedValueCheck(category, guard, actualValue) {
  const passed = actualValue === guard.expected;

  addCheck(
    category,
    guard.name,
    passed,
    passed ? guard.passDetail : guard.failDetail(actualValue),
  );
}

/**
 * Validates one `.env.example` value guard.
 *
 * @param {string} envText `.env.example` contents.
 * @param {EnvExampleGuard} guard Env guard.
 */
function validateEnvExampleGuard(envText, guard) {
  addExpectedValueCheck(
    "Deploy Guards",
    guard,
    getEnvValue(envText, guard.key),
  );
}

/**
 * Validates one package script guard.
 *
 * @param {PackageJsonReport | undefined} packageJson Parsed package JSON.
 * @param {PackageScriptGuard} guard Script guard.
 */
function validatePackageScriptGuard(packageJson, guard) {
  addExpectedValueCheck(
    "Deploy Guards",
    guard,
    packageJson?.scripts?.[guard.scriptName],
  );
}

/**
 * Normalizes string and object marker declarations.
 *
 * @param {SourceMarker} marker Source marker.
 * @returns {NamedSourceMarker} Marker descriptor.
 */
function getSourceMarkerDescriptor(marker) {
  if (typeof marker === "string") {
    return {
      name: marker,
      severity: "error",
      text: marker,
    };
  }

  return {
    name: marker.name,
    severity: marker.severity,
    text: marker.text,
  };
}

/**
 * Formats a marker check detail.
 *
 * @param {string} relativePath Source path relative to repo root.
 * @param {string} markerName Marker display name.
 * @param {boolean} hasMarker Whether the marker is present.
 * @returns {string} Check detail.
 */
function getSourceMarkerDetail(relativePath, markerName, hasMarker) {
  return hasMarker
    ? `${relativePath} contains ${markerName}.`
    : `${relativePath} is missing ${markerName}.`;
}

/**
 * Adds one source marker check.
 *
 * @param {string} category Report category.
 * @param {string} relativePath Source path relative to repo root.
 * @param {SourceMarker} marker Marker declaration.
 * @param {string} sourceText Source text.
 */
function addSourceMarkerCheck(category, relativePath, marker, sourceText) {
  const { name, severity, text } = getSourceMarkerDescriptor(marker);
  const hasMarker = sourceText.includes(text);

  addCheck(
    category,
    `${relativePath} marker ${name}`,
    hasMarker,
    getSourceMarkerDetail(relativePath, name, hasMarker),
    severity,
  );
}

/**
 * Derives the realtime namespace URL from a REST API URL.
 *
 * @param {string} apiUrlValue API URL.
 * @returns {string} Realtime namespace URL.
 */
function getRealtimeUrlForApiUrl(apiUrlValue) {
  const apiUrl = new URL(apiUrlValue);

  return new URL("/realtime", apiUrl.origin).toString();
}

/**
 * Derives the Socket.IO path from a REST API URL.
 *
 * @param {string} apiUrlValue API URL.
 * @returns {string} Socket.IO path.
 */
function getSocketPathForApiUrl(apiUrlValue) {
  const apiUrl = new URL(apiUrlValue);
  const publicBasePath = apiUrl.pathname
    .replace(/\/+$/u, "")
    .replace(/\/api\/v\d+$/u, "");

  return `${publicBasePath}/socket.io`.replace(/\/{2,}/gu, "/");
}

/**
 * Validates that source markers exist in one file.
 *
 * @param {string} category Report category.
 * @param {string} relativePath Source path relative to repo root.
 * @param {readonly SourceMarker[]} markers Markers to find.
 * @returns {Promise<string>} Source text, or empty string when missing.
 */
async function validateSourceMarkers(category, relativePath, markers) {
  const filePath = path.join(ROOT_DIR, relativePath);

  if (!existsSync(filePath)) {
    addFail(category, relativePath, `${relativePath} is missing.`);
    return "";
  }

  const sourceText = await readText(filePath);

  addPass(category, relativePath, `${relativePath} exists.`);

  for (const marker of markers) {
    addSourceMarkerCheck(category, relativePath, marker, sourceText);
  }

  return sourceText;
}

/**
 * Validates one marker target.
 *
 * @param {string} category Report category.
 * @param {SourceMarkerTarget} target Marker target.
 * @returns {Promise<string>} Source text, or empty string when missing.
 */
function validateSourceMarkerTarget(category, target) {
  return validateSourceMarkers(category, target.relativePath, target.markers);
}

/**
 * Validates marker targets sequentially to keep report order stable.
 *
 * @param {string} category Report category.
 * @param {readonly SourceMarkerTarget[]} targets Marker targets.
 * @returns {Promise<void>}
 */
function validateSourceMarkerTargetsInOrder(category, targets) {
  return targets.reduce(
    (previous, target) =>
      previous.then(() =>
        validateSourceMarkerTarget(category, target).then(() => undefined),
      ),
    Promise.resolve(),
  );
}

/**
 * Validates source-level deployment guardrails and package scripts.
 *
 * @returns {Promise<void>}
 */
async function validateDeployGuards() {
  await validateEnvExampleGuards();

  const packageJson = await readPackageJsonForQa();

  validatePwaPackageScripts(packageJson);
  await validateProductionEnvScriptMarkers();

  const realtimeClientSource = await validateRealtimeClientSourceMarkers();

  validateRealtimeClientApiPrefixGuard(realtimeClientSource);
  validateDerivedRealtimeUrls();
}

async function validateEnvExampleGuards() {
  if (!existsSync(ENV_EXAMPLE_PATH)) {
    addFail("Deploy Guards", ".env.example", ".env.example is missing.");
    return;
  }

  const envExample = await readText(ENV_EXAMPLE_PATH);

  for (const guard of ENV_EXAMPLE_GUARDS) {
    validateEnvExampleGuard(envExample, guard);
  }
}

async function readPackageJsonForQa() {
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
      return undefined;
    }

    return packageJsonResult.data;
  } catch (error) {
    addFail(
      "Deploy Guards",
      "package.json parses",
      `Could not parse package.json: ${getErrorMessage(error)}`,
    );
    return undefined;
  }
}

/**
 * Validates PWA package scripts.
 *
 * @param {PackageJsonReport | undefined} packageJson Parsed package JSON.
 */
function validatePwaPackageScripts(packageJson) {
  for (const guard of PACKAGE_SCRIPT_GUARDS) {
    validatePackageScriptGuard(packageJson, guard);
  }
}

async function validateProductionEnvScriptMarkers() {
  await validateSourceMarkers("Deploy Guards", PWA_PRODUCTION_ENV_SCRIPT, [
    "VITE_APP_URL uses HTTPS",
    "PRODUCTION_API_URL",
    "VITE_MEDIA_BASE_URL uses HTTPS",
    "EXPECTED_PRODUCTION_SOCKET_PATH",
    "VITE_API_URL uses HTTPS",
    "VITE_API_URL includes API prefix",
  ]);
}

async function validateRealtimeClientSourceMarkers() {
  return validateSourceMarkers(
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
}

/**
 * Validates the realtime-client API prefix guard.
 *
 * @param {string} realtimeClientSource Realtime client source text.
 */
function validateRealtimeClientApiPrefixGuard(realtimeClientSource) {
  addCheck(
    "Deploy Guards",
    "Realtime client strips API prefix",
    realtimeClientSource.includes("\\/api\\/v\\d+"),
    realtimeClientSource.includes("\\/api\\/v\\d+")
      ? "Realtime client strips /api/vN before deriving Socket.IO paths."
      : "Realtime client should strip /api/vN when deriving Socket.IO paths.",
  );
}

function validateDerivedRealtimeUrls() {
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
 * Parses a manifest `sizes` field.
 *
 * @param {string} value Manifest sizes value.
 * @returns {PngSize[]} Parsed sizes.
 */
function parseManifestSizes(value) {
  return value
    .split(/\s+/)
    .map((entry) => {
      const [width, height] = entry.split("x").map(Number);

      return Number.isFinite(width) && Number.isFinite(height)
        ? { height, width }
        : null;
    })
    .filter(Boolean);
}

/**
 * Reads PNG dimensions from the PNG header.
 *
 * @param {string} filePath PNG path.
 * @returns {Promise<PngSize | null>} PNG dimensions, or null if invalid.
 */
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

/**
 * Gets the markdown status icon for a check.
 *
 * @param {QaCheck} check QA check.
 * @returns {string} Status icon.
 */
function getStatusIcon(check) {
  if (check.passed) {
    return "[PASS]";
  }

  return check.severity === "warning" ? "[WARN]" : "[FAIL]";
}

/**
 * Recursively lists files below a directory.
 *
 * @param {string} directory Directory path.
 * @returns {Promise<string[]>} File paths.
 */
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
 * @returns {Promise<ManifestReport | null>} Parsed manifest.
 */
async function validateManifest() {
  const manifest = await readGeneratedManifest();

  if (!manifest) {
    return null;
  }

  await validateGeneratedManifest(manifest);

  return manifest;
}

/**
 * Validates a parsed generated manifest.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 * @returns {Promise<void>}
 */
async function validateGeneratedManifest(manifest) {
  validateManifestCoreFields(manifest);
  await validateManifestInstallAssets(manifest);
  validateManifestShortcuts(manifest.shortcuts ?? []);
}

/**
 * Validates core manifest metadata fields.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 */
function validateManifestCoreFields(manifest) {
  validateManifestTextFields(manifest);
  validateManifestDisplayMode(manifest);
  validateManifestOrientation(manifest);
  validateManifestScope(manifest);
  validateManifestStartUrlAttribution(manifest);
  validateManifestColors(manifest);
  validateManifestRelatedApplications(manifest);
}

/**
 * Validates manifest install assets.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 * @returns {Promise<void>}
 */
async function validateManifestInstallAssets(manifest) {
  await validateManifestIcons(manifest.icons ?? []);
  await validateManifestScreenshots(manifest.screenshots ?? []);
}

/**
 * Reads and parses the generated manifest.
 *
 * @returns {Promise<ManifestReport | null>} Parsed manifest.
 */
async function readGeneratedManifest() {
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

    addPass("Manifest", "Manifest parses", "Manifest JSON is valid.");
    return manifestResult.data;
  } catch (error) {
    addFail(
      "Manifest",
      "Manifest parses",
      `Could not parse manifest: ${getErrorMessage(error)}`,
    );
    return null;
  }
}

/**
 * Validates required manifest text fields.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 */
function validateManifestTextFields(manifest) {
  for (const field of MANIFEST_TEXT_FIELDS) {
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
}

/**
 * Adds a manifest icon collection check.
 *
 * @param {ManifestIconCheck} requirement Icon collection requirement.
 * @param {readonly ManifestIcon[]} items Manifest icons.
 */
function addManifestIconCollectionCheck(requirement, items) {
  addManifestCollectionResult(requirement, requirement.getPassed(items));
}

/**
 * Adds a manifest screenshot collection check.
 *
 * @param {ManifestScreenshotCheck} requirement Screenshot collection requirement.
 * @param {readonly ManifestScreenshot[]} items Manifest screenshots.
 */
function addManifestScreenshotCollectionCheck(requirement, items) {
  addManifestCollectionResult(requirement, requirement.getPassed(items));
}

/**
 * Adds a manifest collection check result.
 *
 * @param {ManifestIconCheck | ManifestScreenshotCheck} requirement Collection requirement.
 * @param {boolean} passed Whether the collection passed.
 */
function addManifestCollectionResult(requirement, passed) {
  addCheck(
    "Manifest",
    requirement.name,
    passed,
    passed ? requirement.passDetail : requirement.failDetail,
    requirement.severity,
  );
}

/**
 * Validates manifest display mode.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 */
function validateManifestDisplayMode(manifest) {
  if (["standalone", "fullscreen", "minimal-ui"].includes(manifest.display)) {
    addPass("Manifest", "Display mode", `display is "${manifest.display}".`);
  } else {
    addFail(
      "Manifest",
      "Display mode",
      "display should be standalone, fullscreen, or minimal-ui.",
    );
  }
}

/**
 * Validates manifest orientation.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 */
function validateManifestOrientation(manifest) {
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
}

/**
 * Validates manifest scope.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 */
function validateManifestScope(manifest) {
  if (manifest.scope === "/") {
    addPass("Manifest", "Scope", "scope is root-relative.");
  } else {
    addFail(
      "Manifest",
      "Scope",
      `scope should be "/"; found "${manifest.scope}".`,
    );
  }
}

/**
 * Validates manifest start URL attribution.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 */
function validateManifestStartUrlAttribution(manifest) {
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
}

/**
 * Validates manifest theme and background colors.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 */
function validateManifestColors(manifest) {
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
}

/**
 * Validates related application preference.
 *
 * @param {ManifestReport} manifest Parsed manifest.
 */
function validateManifestRelatedApplications(manifest) {
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
}

/**
 * Validates manifest icon assets.
 *
 * @param {readonly ManifestIcon[]} icons Manifest icons.
 * @returns {Promise<void>}
 */
async function validateManifestIcons(icons) {
  if (!Array.isArray(icons) || icons.length === 0) {
    addFail("Manifest", "Icons", "Manifest must include icons.");
    return;
  }

  for (const requirement of MANIFEST_ICON_CHECKS) {
    addManifestIconCollectionCheck(requirement, icons);
  }

  await Promise.all(
    icons.map((icon) =>
      validatePngAsset("Assets", `Icon ${icon.src}`, icon.src, icon.sizes),
    ),
  );
}

/**
 * Validates manifest screenshot assets.
 *
 * @param {readonly ManifestScreenshot[]} screenshots Manifest screenshots.
 * @returns {Promise<void>}
 */
async function validateManifestScreenshots(screenshots) {
  if (!Array.isArray(screenshots) || screenshots.length === 0) {
    addPass("Manifest", "Screenshots", "No install screenshots are declared.");
    return;
  }

  for (const requirement of MANIFEST_SCREENSHOT_CHECKS) {
    addManifestScreenshotCollectionCheck(requirement, screenshots);
  }

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

/**
 * Builds shortcut checks for one shortcut.
 *
 * @param {ManifestShortcut} shortcut Manifest shortcut.
 * @returns {{ detail: string; name: string; passed: boolean; severity?: CheckSeverity }[]} Shortcut checks.
 */
function getManifestShortcutChecks(shortcut) {
  const shortcutName = getManifestShortcutName(shortcut);

  return MANIFEST_SHORTCUT_REQUIREMENTS.map((requirement) =>
    getManifestShortcutCheck(shortcut, shortcutName, requirement),
  );
}

/**
 * Gets a shortcut display name.
 *
 * @param {ManifestShortcut} shortcut Manifest shortcut.
 * @returns {string} Shortcut display name.
 */
function getManifestShortcutName(shortcut) {
  return shortcut.name ?? "unnamed";
}

/**
 * Builds one shortcut requirement check.
 *
 * @param {ManifestShortcut} shortcut Manifest shortcut.
 * @param {string} shortcutName Shortcut display name.
 * @param {ManifestShortcutRequirement} requirement Shortcut requirement.
 * @returns {{ detail: string; name: string; passed: boolean; severity?: CheckSeverity }} Shortcut check.
 */
function getManifestShortcutCheck(shortcut, shortcutName, requirement) {
  const passed = requirement.getPassed(shortcut);

  return {
    detail: requirement.getDetail(shortcut, passed),
    name: `Shortcut ${shortcutName} ${requirement.nameSuffix}`,
    passed,
    severity: requirement.severity,
  };
}

/**
 * Checks whether a shortcut has a display name.
 *
 * @param {ManifestShortcut} shortcut Manifest shortcut.
 * @returns {boolean} Whether the name is present.
 */
function hasManifestShortcutName(shortcut) {
  return typeof shortcut.name === "string" && shortcut.name.length > 0;
}

/**
 * Formats the shortcut-name requirement detail.
 *
 * @param {ManifestShortcut} _shortcut Manifest shortcut.
 * @param {boolean} passed Whether the requirement passed.
 * @returns {string} Check detail.
 */
function getManifestShortcutNameDetail(_shortcut, passed) {
  return passed ? "Shortcut has a name." : "Shortcut is missing a name.";
}

/**
 * Checks whether a shortcut URL is root-relative.
 *
 * @param {ManifestShortcut} shortcut Manifest shortcut.
 * @returns {boolean} Whether the URL is root-relative.
 */
function hasManifestShortcutUrl(shortcut) {
  return typeof shortcut.url === "string" && shortcut.url.startsWith("/");
}

/**
 * Formats the shortcut-URL requirement detail.
 *
 * @param {ManifestShortcut} shortcut Manifest shortcut.
 * @param {boolean} passed Whether the requirement passed.
 * @returns {string} Check detail.
 */
function getManifestShortcutUrlDetail(shortcut, passed) {
  return passed
    ? `Shortcut URL is ${shortcut.url}.`
    : "Shortcut URL must be root-relative.";
}

/**
 * Checks whether a shortcut URL includes PWA attribution.
 *
 * @param {ManifestShortcut} shortcut Manifest shortcut.
 * @returns {boolean} Whether attribution is present.
 */
function hasManifestShortcutAttribution(shortcut) {
  return (
    typeof shortcut.url === "string" &&
    shortcut.url.includes("source=pwa-shortcut")
  );
}

/**
 * Formats the shortcut-attribution requirement detail.
 *
 * @param {ManifestShortcut} _shortcut Manifest shortcut.
 * @param {boolean} passed Whether the requirement passed.
 * @returns {string} Check detail.
 */
function getManifestShortcutAttributionDetail(_shortcut, passed) {
  return passed
    ? "Shortcut URL includes source=pwa-shortcut."
    : "Shortcut URL should include source=pwa-shortcut.";
}

/**
 * Validates one manifest shortcut.
 *
 * @param {ManifestShortcut} shortcut Manifest shortcut.
 */
function validateManifestShortcut(shortcut) {
  for (const check of getManifestShortcutChecks(shortcut)) {
    addCheck(
      "Manifest",
      check.name,
      check.passed,
      check.detail,
      check.severity,
    );
  }
}

/**
 * Validates manifest shortcuts.
 *
 * @param {readonly ManifestShortcut[]} shortcuts Manifest shortcuts.
 */
function validateManifestShortcuts(shortcuts) {
  if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
    addWarn("Manifest", "Shortcuts", "No PWA shortcuts are declared.");
    return;
  }

  for (const shortcut of shortcuts) {
    validateManifestShortcut(shortcut);
  }
}

/**
 * Validates one PNG asset against manifest-declared sizes.
 *
 * @param {string} category Report category.
 * @param {string} name Check name.
 * @param {string} assetPath Manifest asset path.
 * @param {string} expectedSizes Manifest-declared sizes.
 * @returns {Promise<void>}
 */
async function validatePngAsset(category, name, assetPath, expectedSizes) {
  const pngSize = await readValidPngSize(category, name, assetPath);

  if (!pngSize) {
    return;
  }

  const matchesDeclaredSize = isPngSizeDeclared(pngSize, expectedSizes);

  addCheck(
    category,
    name,
    matchesDeclaredSize,
    getPngAssetDetail(assetPath, expectedSizes, pngSize, matchesDeclaredSize),
  );
}

/**
 * Reads a valid PNG size and records missing/invalid asset checks.
 *
 * @param {string} category Report category.
 * @param {string} name Check name.
 * @param {string} assetPath Manifest asset path.
 * @returns {Promise<PngSize | null>} PNG dimensions.
 */
async function readValidPngSize(category, name, assetPath) {
  const filePath = resolveDistAsset(assetPath);

  if (!existsSync(filePath)) {
    addFail(category, name, `${assetPath} is missing from dist.`);
    return null;
  }

  const size = await getFileSize(filePath);

  if (size <= 0) {
    addFail(category, name, `${assetPath} is empty.`);
    return null;
  }

  const pngSize = await readPngSize(filePath);

  if (!pngSize) {
    addFail(category, name, `${assetPath} is not a valid PNG.`);
    return null;
  }

  return pngSize;
}

/**
 * Checks whether actual PNG dimensions match declared manifest sizes.
 *
 * @param {PngSize} pngSize Actual PNG dimensions.
 * @param {string} expectedSizes Manifest-declared sizes.
 * @returns {boolean} Whether any declared size matches.
 */
function isPngSizeDeclared(pngSize, expectedSizes) {
  const declaredSizes = parseManifestSizes(expectedSizes);

  return declaredSizes.some((declaredSize) =>
    isSamePngSize(declaredSize, pngSize),
  );
}

/**
 * Checks whether two PNG size objects match.
 *
 * @param {PngSize} declaredSize Declared size.
 * @param {PngSize} pngSize Actual size.
 * @returns {boolean} Whether dimensions match.
 */
function isSamePngSize(declaredSize, pngSize) {
  return (
    declaredSize.width === pngSize.width &&
    declaredSize.height === pngSize.height
  );
}

/**
 * Formats a PNG size check detail.
 *
 * @param {string} assetPath Manifest asset path.
 * @param {string} expectedSizes Manifest-declared sizes.
 * @param {PngSize} pngSize Actual PNG size.
 * @param {boolean} matchesDeclaredSize Whether sizes match.
 * @returns {string} Check detail.
 */
function getPngAssetDetail(
  assetPath,
  expectedSizes,
  pngSize,
  matchesDeclaredSize,
) {
  return matchesDeclaredSize
    ? `${assetPath} exists and matches ${pngSize.width}x${pngSize.height}.`
    : `${assetPath} is ${pngSize.width}x${pngSize.height}, declared as ${expectedSizes}.`;
}

/**
 * Validates generated service worker and push-worker output.
 *
 * @returns {Promise<void>}
 */
async function validateServiceWorker() {
  const swText = await readGeneratedServiceWorker();

  if (!swText) {
    return;
  }

  validateGeneratedServiceWorkerText(swText);
  await validateWorkboxRuntime();
  await validatePushWorker();
}

/**
 * Reads the generated service worker text.
 *
 * @returns {Promise<string | null>} Service worker text.
 */
async function readGeneratedServiceWorker() {
  const swPath = path.join(DIST_DIR, "sw.js");

  if (!existsSync(swPath)) {
    addFail(
      "Service Worker",
      "Generated service worker",
      "dist/sw.js is missing.",
    );
    return null;
  }

  return readText(swPath);
}

/**
 * Validates generated service worker text.
 *
 * @param {string} swText Service worker text.
 */
function validateGeneratedServiceWorkerText(swText) {
  validateGeneratedServiceWorkerSize(swText);
  validateServiceWorkerMarkers(swText);
  validateServiceWorkerPrecache(swText);
  validateServiceWorkerNavigationFallback(swText);
}

/**
 * Validates generated service worker size.
 *
 * @param {string} swText Service worker text.
 */
function validateGeneratedServiceWorkerSize(swText) {
  addCheck(
    "Service Worker",
    "Generated service worker",
    swText.length > 1000,
    `dist/sw.js is ${swText.length} bytes.`,
  );
}

/**
 * Validates required service worker markers.
 *
 * @param {string} swText Service worker text.
 */
function validateServiceWorkerMarkers(swText) {
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
}

/**
 * Validates precached asset markers.
 *
 * @param {string} swText Service worker text.
 */
function validateServiceWorkerPrecache(swText) {
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
}

/**
 * Validates Workbox navigation fallback target.
 *
 * @param {string} swText Service worker text.
 */
function validateServiceWorkerNavigationFallback(swText) {
  const hasIndexHtmlNavigationFallback = hasWorkboxNavigationFallback(
    swText,
    "/index.html",
  );
  const hasRootNavigationFallback = hasWorkboxNavigationFallback(swText, "/");

  addCheck(
    "Service Worker",
    "Navigation fallback target",
    hasIndexHtmlNavigationFallback && !hasRootNavigationFallback,
    getNavigationFallbackDetail(
      hasIndexHtmlNavigationFallback,
      hasRootNavigationFallback,
    ),
  );
}

/**
 * Formats the Workbox navigation fallback check detail.
 *
 * @param {boolean} hasIndexHtmlNavigationFallback Whether /index.html fallback exists.
 * @param {boolean} hasRootNavigationFallback Whether / fallback exists.
 * @returns {string} Check detail.
 */
function getNavigationFallbackDetail(
  hasIndexHtmlNavigationFallback,
  hasRootNavigationFallback,
) {
  if (hasIndexHtmlNavigationFallback) {
    return hasRootNavigationFallback
      ? "Navigation fallback includes /index.html, but also still binds /."
      : "Navigation fallback is bound to the precached /index.html shell.";
  }

  return hasRootNavigationFallback
    ? "Navigation fallback is bound to /; use /index.html so offline SPA navigations hit the precache."
    : "Navigation fallback target could not be found in dist/sw.js.";
}

async function validateWorkboxRuntime() {
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
}

async function validatePushWorker() {
  const swPushPath = path.join(DIST_DIR, "sw-push.js");

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
  validatePushWorkerListeners(swPushText);
}

/**
 * Validates push worker event listeners.
 *
 * @param {string} swPushText Push worker text.
 */
function validatePushWorkerListeners(swPushText) {
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
  await validateSourceMarkerTargetsInOrder(
    "PWA Source",
    PWA_SOURCE_MARKER_TARGETS,
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
    DIAGNOSTICS_PANEL_MARKERS,
  );

  validateDiagnosticsPanelExclusions(diagnosticsPanelSource);
}

function validateDiagnosticsPanelExclusions(diagnosticsPanelSource) {
  for (const staleMarker of STALE_DIAGNOSTIC_MARKERS) {
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
  const routeAssets = await readRouteAssetInventory();

  if (!routeAssets) {
    return;
  }

  const {
    assetDir,
    authenticatedRuntimeChunks,
    diagnosticsChunks,
    downloadChunks,
    indexHtmlPath,
  } = routeAssets;

  validateRouteChunks({ authenticatedRuntimeChunks, downloadChunks });

  await validateDownloadRouteCopy({
    assetDir,
    diagnosticsChunks,
    downloadChunks,
  });

  await validateAuthenticatedPwaRuntimePreload(indexHtmlPath);

  await validateRouteHttpSmoke();
}

/**
 * Reads built route asset inventory.
 *
 * @returns {Promise<RouteAssetInventory | null>} Route asset inventory.
 */
async function readRouteAssetInventory() {
  const assetDir = path.join(DIST_DIR, "assets");
  const indexHtmlPath = path.join(DIST_DIR, "index.html");

  if (!existsSync(assetDir)) {
    addFail("Route", "Assets directory", "dist/assets is missing.");
    return null;
  }

  const assetFiles = await readdir(assetDir);

  return {
    assetDir,
    authenticatedRuntimeChunks: getRouteChunkFiles(
      assetFiles,
      /^pwa-authenticated-runtime-.*\.js$/,
    ),
    diagnosticsChunks: getRouteChunkFiles(
      assetFiles,
      /^pwa-diagnostics-panel-.*\.js$/,
    ),
    downloadChunks: getRouteChunkFiles(assetFiles, /^download-page-.*\.js$/),
    indexHtmlPath,
  };
}

/**
 * Filters route chunk files by regex.
 *
 * @param {readonly string[]} assetFiles Asset file names.
 * @param {RegExp} pattern Chunk pattern.
 * @returns {string[]} Matching chunk files.
 */
function getRouteChunkFiles(assetFiles, pattern) {
  return assetFiles.filter((file) => pattern.test(file));
}

/**
 * Validates route chunk presence.
 *
 * @param {{ authenticatedRuntimeChunks: readonly string[]; downloadChunks: readonly string[] }} chunks Route chunks.
 */
function validateRouteChunks({ authenticatedRuntimeChunks, downloadChunks }) {
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
}

/**
 * Validates built download route copy markers.
 *
 * @param {{ assetDir: string; diagnosticsChunks: readonly string[]; downloadChunks: readonly string[] }} input Route chunk inputs.
 * @returns {Promise<void>}
 */
async function validateDownloadRouteCopy({
  assetDir,
  diagnosticsChunks,
  downloadChunks,
}) {
  if (downloadChunks.length > 0) {
    const combinedDownloadCode = await readCombinedAssetCode(
      assetDir,
      downloadChunks,
    );
    const combinedDiagnosticsCode = await readCombinedAssetCode(
      assetDir,
      diagnosticsChunks,
    );

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
}

/**
 * Reads combined code from route chunks.
 *
 * @param {string} assetDir Asset directory.
 * @param {readonly string[]} chunks Chunk file names.
 * @returns {Promise<string>} Combined code.
 */
function readCombinedAssetCode(assetDir, chunks) {
  return Promise.all(
    chunks.map((file) => readText(path.join(assetDir, file))),
  ).then((parts) => parts.join("\n"));
}

/**
 * Validates that the authenticated PWA runtime stays lazy.
 *
 * @param {string} indexHtmlPath Built index path.
 * @returns {Promise<void>}
 */
async function validateAuthenticatedPwaRuntimePreload(indexHtmlPath) {
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
}

/**
 * Runs static-server route smoke checks.
 *
 * @returns {Promise<void>}
 */
async function validateRouteHttpSmoke() {
  await withStaticServer(async (baseUrl) => {
    const downloadResponse = await requestText(`${baseUrl}/download`);
    const manifestResponse = await requestText(
      `${baseUrl}/manifest.webmanifest`,
    );
    const serviceWorkerResponse = await requestText(`${baseUrl}/sw.js`);

    addRouteHttpSmokeChecks({
      downloadResponse,
      manifestResponse,
      serviceWorkerResponse,
    });
  });
}

/**
 * Adds route smoke check results.
 *
 * @param {{ downloadResponse: TextResponse; manifestResponse: TextResponse; serviceWorkerResponse: TextResponse }} responses Smoke responses.
 */
function addRouteHttpSmokeChecks({
  downloadResponse,
  manifestResponse,
  serviceWorkerResponse,
}) {
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
 * Extracts a pathname from a static-server request.
 *
 * @param {import("node:http").IncomingMessage} request HTTP request.
 * @returns {string} Decoded pathname.
 */
function getStaticServerPathname(request) {
  const requestedUrl = new URL(request.url ?? "/", "http://127.0.0.1");

  return decodeURIComponent(requestedUrl.pathname);
}

/**
 * Normalizes a requested path for static serving.
 *
 * @param {string} pathname Requested pathname.
 * @returns {string} Safe relative path.
 */
function getSafeStaticServerPath(pathname) {
  return path
    .normalize(stripLeadingSlash(pathname))
    .replace(/^(\.\.[/\\])+/, "");
}

/**
 * Resolves the initial static file path.
 *
 * @param {string} pathname Requested pathname.
 * @returns {string} Absolute file path.
 */
function getInitialStaticServerFilePath(pathname) {
  return path.join(DIST_DIR, getSafeStaticServerPath(pathname));
}

/**
 * Checks whether the SPA index should be served.
 *
 * @param {string} pathname Requested pathname.
 * @param {string} filePath Candidate file path.
 * @returns {boolean} Whether to serve index.html.
 */
function shouldServeStaticServerIndex(pathname, filePath) {
  return pathname === "/" || !path.extname(filePath) || !existsSync(filePath);
}

/**
 * Resolves the static server file path for a request.
 *
 * @param {string} pathname Requested pathname.
 * @returns {string} Absolute file path.
 */
function getStaticServerFilePath(pathname) {
  const filePath = getInitialStaticServerFilePath(pathname);

  if (shouldServeStaticServerIndex(pathname, filePath)) {
    return path.join(DIST_DIR, "index.html");
  }

  return filePath;
}

/**
 * Checks whether a static file is inside dist and exists.
 *
 * @param {string} filePath Candidate file path.
 * @returns {boolean} Whether the file can be served.
 */
function isStaticServerFileReadable(filePath) {
  return filePath.startsWith(DIST_DIR) && existsSync(filePath);
}

/**
 * Gets the static server content type for a file.
 *
 * @param {string} filePath File path.
 * @returns {string} Content type.
 */
function getStaticServerContentType(filePath) {
  return CONTENT_TYPES[path.extname(filePath)] ?? "application/octet-stream";
}

/**
 * Sends a static-server 404 response.
 *
 * @param {import("node:http").ServerResponse} response HTTP response.
 */
function sendStaticServerNotFound(response) {
  response.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end("Not found");
}

/**
 * Sends a static-server 500 response.
 *
 * @param {import("node:http").ServerResponse} response HTTP response.
 * @param {unknown} error Caught error.
 */
function sendStaticServerError(response, error) {
  response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(error instanceof Error ? error.message : "Server error");
}

/**
 * Streams one static server file.
 *
 * @param {import("node:http").ServerResponse} response HTTP response.
 * @param {string} filePath File path.
 */
function sendStaticServerFile(response, filePath) {
  response.writeHead(200, {
    "Content-Type": getStaticServerContentType(filePath),
  });
  createReadStream(filePath).pipe(response);
}

/**
 * Handles one static-server request.
 *
 * @param {import("node:http").IncomingMessage} request HTTP request.
 * @param {import("node:http").ServerResponse} response HTTP response.
 * @returns {Promise<void>}
 */
async function handleStaticServerRequest(request, response) {
  try {
    const pathname = getStaticServerPathname(request);
    const filePath = getStaticServerFilePath(pathname);

    if (!isStaticServerFileReadable(filePath)) {
      sendStaticServerNotFound(response);
      return;
    }

    sendStaticServerFile(response, filePath);
  } catch (error) {
    sendStaticServerError(response, error);
  }
}

/**
 * Starts the static server on a random local port.
 *
 * @param {import("node:http").Server} server HTTP server.
 * @returns {Promise<void>}
 */
async function listenOnStaticServerPort(server) {
  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
}

/**
 * Gets the static server port.
 *
 * @param {import("node:http").Server} server HTTP server.
 * @returns {number | null} Port, if available.
 */
function getStaticServerPort(server) {
  const address = server.address();

  return typeof address === "object" && address ? address.port : null;
}

/**
 * Closes the static server.
 *
 * @param {import("node:http").Server} server HTTP server.
 * @returns {Promise<void>}
 */
function closeStaticServer(server) {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

/**
 * Serves `dist/` through a tiny local static server for route smoke checks.
 *
 * @param {(baseUrl: string) => Promise<void>} callback Smoke callback.
 * @returns {Promise<void>}
 */
async function withStaticServer(callback) {
  const server = createServer(handleStaticServerRequest);

  await listenOnStaticServerPort(server);

  const port = getStaticServerPort(server);

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
    await closeStaticServer(server);
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
 * @returns {ReportSummary} Summary buckets.
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
  const summary = summarizeChecks();
  const lines = [
    ...getReportIntroLines(summary),
    ...getCategoryReportLines(getReportCategories()),
    ...getRequiredFixReportLines(summary.failed),
  ];

  return lines.join("\n");
}

/**
 * Builds report intro and summary lines.
 *
 * @param {ReportSummary} summary Check summary.
 * @returns {string[]} Markdown lines.
 */
function getReportIntroLines({ failed, passed, warnings }) {
  return [
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
}

/**
 * Gets report categories in insertion order.
 *
 * @returns {string[]} Category names.
 */
function getReportCategories() {
  return [...new Set(checks.map((check) => check.category))];
}

/**
 * Builds report lines for all categories.
 *
 * @param {readonly string[]} categories Category names.
 * @returns {string[]} Markdown lines.
 */
function getCategoryReportLines(categories) {
  return categories.flatMap(getSingleCategoryReportLines);
}

/**
 * Builds report lines for a single category.
 *
 * @param {string} category Category name.
 * @returns {string[]} Markdown lines.
 */
function getSingleCategoryReportLines(category) {
  return [
    `## ${category}`,
    "",
    ...getChecksForCategory(category).map(
      (check) => `- ${getStatusIcon(check)} ${check.name}: ${check.detail}`,
    ),
    "",
  ];
}

/**
 * Gets checks for one category.
 *
 * @param {string} category Category name.
 * @returns {QaCheck[]} Matching checks.
 */
function getChecksForCategory(category) {
  return checks.filter((item) => item.category === category);
}

/**
 * Builds required-fix report lines.
 *
 * @param {readonly QaCheck[]} failed Failed error-level checks.
 * @returns {string[]} Markdown lines.
 */
function getRequiredFixReportLines(failed) {
  if (failed.length === 0) {
    return [];
  }

  return [
    "## Required Fixes",
    "",
    ...failed.map(
      (check) => `- ${check.category} / ${check.name}: ${check.detail}`,
    ),
    "",
  ];
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
    process.stdout.write("\nFailed Checks:\n");
    for (const check of failed) {
      process.stdout.write(
        `- ${check.category} / ${check.name}: ${check.detail}\n`,
      );
    }
    process.exitCode = 1;
  }
}

await main();
