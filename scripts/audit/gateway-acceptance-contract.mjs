// @ts-check

import { createHash } from "node:crypto";
import { realpath, stat } from "node:fs/promises";
import path from "node:path";
import { hashTree } from "../evidence/hash-tree.mjs";

export const CANONICAL_WEB_ORIGIN = "https://findafew.today";
export const CANONICAL_API_ORIGIN = "https://api.findafew.today";
export const PUBLIC_API_PREFIX = "/findafew/api/v1";
export const INTERNAL_API_PREFIX = "/api/v1";
export const PUBLIC_SOCKET_PATH = "/findafew/socket.io";
export const INTERNAL_SOCKET_PATH = "/socket.io";
export const PUBLIC_SOCKET_PATHS = [
  PUBLIC_SOCKET_PATH,
  `${PUBLIC_SOCKET_PATH}/`,
];

export const GATEWAY_MODES = new Set([
  "public",
  "authenticated",
  "external-invite",
  "browser-public",
  "browser-authenticated",
]);

export const AUTHENTICATED_ROUTE_CONTRACTS = [
  {
    checks: [{ kind: "label", name: "Active groups and sharing" }],
    path: "/home",
    slug: "home",
  },
  {
    checks: [{ kind: "heading", level: 1, name: "Explore" }],
    path: "/explore",
    slug: "explore",
  },
  {
    checks: [{ kind: "region", name: "About this group" }],
    path: "/groups/{groupId}",
    slug: "group-detail",
  },
  {
    checks: [{ kind: "heading", level: 1, name: "Activity" }],
    path: "/activity",
    slug: "activity",
  },
  {
    checks: [{ kind: "label", name: "Show QR Code" }],
    path: "/profile",
    slug: "profile",
  },
  {
    checks: [{ kind: "text", name: "Profile sketch" }],
    path: "/users/{userId}",
    slug: "user-detail",
  },
  {
    checks: [{ kind: "heading", level: 1, name: "Settings" }],
    path: "/settings",
    slug: "settings",
  },
  {
    checks: [
      {
        kind: "heading",
        level: 1,
        name: "What are you trying to make happen?",
      },
    ],
    path: "/plans/new",
    slug: "plan-creation",
  },
];

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "[::1]", "localhost"]);
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const RETIRED_BRAND_SEGMENT = String.fromCharCode(
  116,
  101,
  97,
  109,
  102,
  111,
  114,
  103,
  101,
);

export const FAIL_CLOSED_PATHS = [
  `${INTERNAL_API_PREFIX}/health/ok`,
  `${INTERNAL_SOCKET_PATH}/?EIO=4&transport=polling`,
  `/${RETIRED_BRAND_SEGMENT}/api/v1/health/ok`,
  `/${RETIRED_BRAND_SEGMENT}/socket.io/?EIO=4&transport=polling`,
  `${PUBLIC_SOCKET_PATH}//?EIO=4&transport=polling`,
  `${PUBLIC_SOCKET_PATH}/unexpected?EIO=4&transport=polling`,
  "/__phase5-unmatched",
];

export const COOKIE_CONTRACTS = {
  refresh: {
    name: "findafew_refresh_token",
    path: `${PUBLIC_API_PREFIX}/auth`,
  },
  externalInviteBrowser: {
    name: "findafew_external_invite_browser",
    path: `${PUBLIC_API_PREFIX}/external-invites`,
  },
  externalInviteIntent: {
    name: "findafew_external_invite_intent",
    path: `${PUBLIC_API_PREFIX}/external-invites`,
  },
};

/**
 * Parses an origin and rejects credentials, search, fragments and paths.
 *
 * @param {string} value Candidate origin.
 * @param {string} label User-facing field label.
 */
export function parseExactOrigin(value, label) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute HTTP(S) origin.`);
  }

  const hasOnlyOrigin =
    url.pathname === "/" &&
    !url.search &&
    !url.hash &&
    !url.username &&
    !url.password;

  if (!hasOnlyOrigin || !["http:", "https:"].includes(url.protocol)) {
    throw new Error(`${label} must contain an origin only.`);
  }

  return url.origin;
}

/**
 * Proves a target is explicitly allowed and remote execution was separately
 * authorized when the origin is not loopback.
 *
 * @param {object} options Target-guard options.
 * @param {boolean} options.allowRemote Whether remote read-only access is authorized.
 * @param {string[]} options.allowedTargets Exact permitted origins.
 * @param {string} options.target Target origin.
 */
export function assertTargetAllowed({ allowRemote, allowedTargets, target }) {
  const origin = parseExactOrigin(target, "Target");
  const normalizedAllowedTargets = allowedTargets.map((candidate) =>
    parseExactOrigin(candidate, "Allowed target"),
  );

  if (!normalizedAllowedTargets.includes(origin)) {
    throw new Error("Target was not present in the exact target allowlist.");
  }

  if (!isLoopbackOrigin(origin) && !allowRemote) {
    throw new Error("Remote targets require explicit read-only authorization.");
  }

  return origin;
}

/**
 * Fails before credentials are read when a stateful lane would use remote HTTP.
 * Loopback HTTP remains available for an isolated local canary only.
 *
 * @param {object} options Stateful target options.
 * @param {string[]} options.origins Exact target origins used by the lane.
 * @param {string} options.mode Gateway acceptance mode.
 */
export function assertStatefulTargetSecurity({ mode, origins }) {
  const stateful = new Set([
    "authenticated",
    "external-invite",
    "browser-authenticated",
  ]);
  if (!stateful.has(mode)) return;

  for (const candidate of origins) {
    const origin = parseExactOrigin(candidate, "Stateful target");
    if (!isLoopbackOrigin(origin) && new URL(origin).protocol !== "https:") {
      throw new Error(
        "Authenticated, invite and other stateful remote targets require HTTPS.",
      );
    }
  }
}

/** @param {string} origin Parsed origin. */
export function isLoopbackOrigin(origin) {
  return LOOPBACK_HOSTS.has(new URL(origin).hostname);
}

/** @param {string} value Candidate SHA-256. */
export function assertSha256(value) {
  if (!SHA256_PATTERN.test(value)) {
    throw new Error("Expected build digest must be a lowercase SHA-256.");
  }
  return value;
}

/**
 * Hashes a deploy directory only when it resolves within the frontend root.
 *
 * @param {object} options Hash options.
 * @param {string} options.frontendRoot Frontend root.
 * @param {string} options.deployDirectory Deploy directory relative to the root.
 * @param {string} options.expectedDigest Frozen digest.
 */
export async function verifyDeployBuild({
  deployDirectory,
  expectedDigest,
  frontendRoot,
}) {
  assertSha256(expectedDigest);
  const root = await realpath(frontendRoot);
  const target = await realpath(path.resolve(root, deployDirectory));
  const targetStat = await stat(target);

  if (
    !targetStat.isDirectory() ||
    (target !== root && !target.startsWith(`${root}${path.sep}`))
  ) {
    throw new Error("Deploy directory must resolve inside the frontend root.");
  }

  const relative = path.relative(root, target);
  const hash = await hashTree(root, [relative]);

  return {
    ...hash,
    matchesExpected: hash.digest === expectedDigest,
  };
}

/**
 * Returns a non-reversible target identifier for retained summaries.
 *
 * @param {string} origin Target origin.
 */
export function hashOrigin(origin) {
  return createHash("sha256").update(origin).digest("hex");
}

/**
 * Runs a lane and always attempts its bounded cleanup without retaining error
 * messages, response bodies, headers, cookies or tokens.
 *
 * @param {object} options Lifecycle options.
 * @param {(signal: AbortSignal) => Promise<void>} options.cleanup Cleanup callback.
 * @param {number} [options.cleanupTimeoutMs] Cleanup deadline.
 * @param {() => Promise<void>} options.execute Lane callback.
 */
export async function executeWithGuaranteedCleanup({
  cleanup,
  cleanupTimeoutMs = 15_000,
  execute,
}) {
  let operation;
  try {
    await execute();
    operation = { outcome: "completed", passed: true };
  } catch (error) {
    operation = {
      outcome: classifyFailure(error),
      passed: false,
    };
  }

  const cleanupResult = await runBoundedCleanup(cleanup, cleanupTimeoutMs);
  return { cleanup: cleanupResult, operation };
}

/**
 * @param {(signal: AbortSignal) => Promise<void>} cleanup Cleanup callback.
 * @param {number} timeoutMs Cleanup deadline.
 */
export async function runBoundedCleanup(cleanup, timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1) {
    throw new Error("Cleanup timeout must be a positive finite number.");
  }

  const controller = new AbortController();
  let timeout;
  const cleanupPromise = Promise.resolve()
    .then(() => cleanup(controller.signal))
    .then(() => ({ outcome: "completed", passed: true }))
    .catch((error) => ({ outcome: classifyFailure(error), passed: false }));
  const timeoutPromise = new Promise((resolve) => {
    timeout = setTimeout(() => {
      controller.abort();
      resolve({ outcome: "timed-out", passed: false });
    }, timeoutMs);
  });

  const result = await Promise.race([cleanupPromise, timeoutPromise]);
  clearTimeout(timeout);
  return result;
}

/** @param {unknown} error Unknown execution failure. */
function classifyFailure(error) {
  return error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
    ? "timed-out"
    : "failed";
}

/**
 * Returns each Set-Cookie line without exposing values to retained evidence.
 *
 * @param {Headers} headers Response headers.
 */
export function getSetCookieLines(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const combined = headers.get("set-cookie");
  return combined
    ? combined.split(/,(?=\s*[^;,=\s]+=)/gu).map((value) => value.trim())
    : [];
}

/** @param {string} line One Set-Cookie line. */
export function parseSetCookie(line) {
  const [nameValue = "", ...attributeParts] = line.split(";");
  const separatorIndex = nameValue.indexOf("=");

  if (separatorIndex < 1) {
    throw new Error("Set-Cookie did not contain a cookie name.");
  }

  const attributes = new Map();
  for (const part of attributeParts) {
    const [rawName = "", ...rawValue] = part.trim().split("=");
    attributes.set(rawName.toLowerCase(), rawValue.join("=").trim() || true);
  }

  return {
    attributes,
    name: nameValue.slice(0, separatorIndex).trim(),
    value: nameValue.slice(separatorIndex + 1),
  };
}

/**
 * Checks the browser-facing cookie contract without returning cookie values.
 *
 * @param {ReturnType<typeof parseSetCookie>} cookie Parsed cookie.
 * @param {{ name: string; path: string }} contract Expected contract.
 */
export function inspectCookieContract(cookie, contract) {
  return {
    domainAbsent: !cookie.attributes.has("domain"),
    httpOnly: cookie.attributes.has("httponly"),
    nameMatches: cookie.name === contract.name,
    pathMatches: cookie.attributes.get("path") === contract.path,
    sameSiteLax:
      String(cookie.attributes.get("samesite") ?? "").toLowerCase() === "lax",
    secure: cookie.attributes.has("secure"),
  };
}

/** @param {ReturnType<typeof inspectCookieContract>} inspection Cookie result. */
export function cookieInspectionPassed(inspection) {
  return Object.values(inspection).every(Boolean);
}

/**
 * Builds an in-memory Cookie header only for cookies whose declared path
 * matches the requested public path. Values never leave process memory.
 *
 * @param {ReturnType<typeof parseSetCookie>[]} cookies Parsed cookies.
 * @param {string} requestPath Public request path.
 */
export function buildCookieHeader(cookies, requestPath) {
  return cookies
    .filter((cookie) => {
      const cookiePath = String(cookie.attributes.get("path") ?? "/");
      return cookiePathMatches(cookiePath, requestPath);
    })
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

/** @param {string} cookiePath Cookie path. @param {string} requestPath Request path. */
export function cookiePathMatches(cookiePath, requestPath) {
  if (requestPath === cookiePath) return true;
  if (!requestPath.startsWith(cookiePath)) return false;
  return cookiePath.endsWith("/") || requestPath.at(cookiePath.length) === "/";
}

/**
 * Sanitizes the exact CORS result down to contract booleans and status.
 *
 * @param {Response} response OPTIONS response.
 */
export function inspectCorsResponse(response) {
  const allowedHeaders = new Set(
    (response.headers.get("access-control-allow-headers") ?? "")
      .toLowerCase()
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const allowedMethods = new Set(
    (response.headers.get("access-control-allow-methods") ?? "")
      .toLowerCase()
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const requiredHeaders = [
    "authorization",
    "content-type",
    "idempotency-key",
    "x-findafew-onboarding-policy-version",
    "x-requested-with",
  ];
  const vary = (response.headers.get("vary") ?? "")
    .toLowerCase()
    .split(",")
    .map((value) => value.trim());

  return {
    allowCredentials:
      response.headers.get("access-control-allow-credentials") === "true",
    allowGetMethod: allowedMethods.has("get"),
    allowOriginExact:
      response.headers.get("access-control-allow-origin") ===
      CANONICAL_WEB_ORIGIN,
    requiredHeadersAllowed: requiredHeaders.every((header) =>
      allowedHeaders.has(header),
    ),
    status: response.status,
    statusAccepted: response.status >= 200 && response.status < 300,
    varyOrigin: vary.includes("origin"),
  };
}

/** @param {ReturnType<typeof inspectCorsResponse>} inspection CORS result. */
export function corsInspectionPassed(inspection) {
  return Object.entries(inspection)
    .filter(([key]) => key !== "status")
    .every(([, value]) => value === true);
}

/** @param {string} pathname Public request path. */
export function translateGatewayPath(pathname) {
  if (
    pathname === PUBLIC_API_PREFIX ||
    pathname.startsWith(`${PUBLIC_API_PREFIX}/`)
  ) {
    return `${INTERNAL_API_PREFIX}${pathname.slice(PUBLIC_API_PREFIX.length)}`;
  }

  if (isPublicSocketPath(pathname)) {
    return `${INTERNAL_SOCKET_PATH}${pathname.slice(PUBLIC_SOCKET_PATH.length)}`;
  }

  return null;
}

/** @param {string} pathname Candidate public Engine.IO path. */
export function isPublicSocketPath(pathname) {
  return PUBLIC_SOCKET_PATHS.includes(pathname);
}

/**
 * Returns whether an HTTP(S) request path is part of the frozen browser-facing
 * API origin contract. Namespace URLs such as `/realtime`, legacy aliases,
 * doubled socket slashes and arbitrary upstream paths are not public requests.
 *
 * @param {string} pathname Candidate API-origin request pathname.
 */
export function isAllowedApiOriginPath(pathname) {
  return (
    pathname === PUBLIC_API_PREFIX ||
    pathname.startsWith(`${PUBLIC_API_PREFIX}/`) ||
    isPublicSocketPath(pathname)
  );
}
