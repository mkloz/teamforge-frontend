// @ts-check

import { chromium } from "@playwright/test";
import {
  AUTHENTICATED_ROUTE_CONTRACTS,
  CANONICAL_WEB_ORIGIN,
  COOKIE_CONTRACTS,
  cookieInspectionPassed,
  executeWithGuaranteedCleanup,
  inspectCookieContract,
  isAllowedApiOriginPath,
  PUBLIC_API_PREFIX,
  parseSetCookie,
} from "./gateway-acceptance-contract.mjs";
import { probeAuthenticatedSocket } from "./gateway-acceptance-probes.mjs";
import { verifyDeployedAssetSet } from "./gateway-deployment-integrity.mjs";

const PUBLIC_ROUTES = [
  { expectedFinalPath: "/", path: "/", slug: "landing" },
  { expectedFinalPath: "/download", path: "/download", slug: "download" },
  {
    expectedFinalPath: "/auth/login",
    path: "/home",
    slug: "home-unauthenticated",
  },
];
const EXPECTED_UNAUTHENTICATED_API_STATUSES = [
  {
    method: "GET",
    path: `${PUBLIC_API_PREFIX}/users/me`,
    status: 401,
  },
  {
    method: "POST",
    path: `${PUBLIC_API_PREFIX}/auth/refresh`,
    status: 401,
  },
];
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

/**
 * Runs an ephemeral browser against an exact public-shaped target. It never
 * writes storage state, screenshots, videos or traces.
 *
 * @param {object} options Browser options.
 * @param {string} options.apiOrigin Exact API origin.
 * @param {string} options.deployDirectory Local deploy directory.
 * @param {string} options.frontendRoot Frontend root.
 * @param {"browser-public" | "browser-authenticated"} options.mode Browser mode.
 * @param {string | undefined} [options.email] Process-only email.
 * @param {string | undefined} [options.groupId] Accessible group ID.
 * @param {string | undefined} [options.password] Process-only password.
 * @param {string | undefined} [options.userId] Accessible user ID.
 * @param {string} options.webOrigin Exact web origin.
 */
export async function runBrowserAcceptance(options) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    serviceWorkers: "allow",
    viewport: { height: 900, width: 1365 },
  });
  const page = await context.newPage();
  const signals = createSignals(page, {
    apiOrigin: options.apiOrigin,
    mode: options.mode,
    webOrigin: options.webOrigin,
  });

  try {
    const deployment = await verifyDeployedAssetSet({
      deployDirectory: options.deployDirectory,
      frontendRoot: options.frontendRoot,
      webOrigin: options.webOrigin,
    });
    const publicRoutes = await inspectPublicRoutes(
      page,
      options.webOrigin,
      signals,
    );
    const storageBeforeAuth = await inspectBrowserStorage(page);
    let signalSummary = signals.summary();

    if (options.mode === "browser-public") {
      return {
        authenticated: null,
        deployment,
        publicRoutes,
        signals: signalSummary,
        status:
          deployment.matches &&
          publicRoutes.every((route) => route.passed) &&
          storageBeforeAuth.retiredCacheCount === 0 &&
          storageBeforeAuth.retiredKeyCount === 0 &&
          storageBeforeAuth.rootServiceWorkerScope &&
          signalSummary.consoleErrors === 0 &&
          signalSummary.failedRequests === 0 &&
          signalSummary.pageErrors === 0 &&
          signalSummary.routeHealthFailures === 0
            ? "passed"
            : "failed",
        storage: storageBeforeAuth,
      };
    }

    const authenticated = await runAuthenticatedBrowserLane({
      ...options,
      context,
      page,
      signals,
    });
    const storageAfterAuth = await inspectBrowserStorage(page);
    signalSummary = signals.summary();
    const passed =
      deployment.matches &&
      publicRoutes.every((route) => route.passed) &&
      authenticated.status === "passed" &&
      storageBeforeAuth.retiredKeyCount === 0 &&
      storageBeforeAuth.retiredCacheCount === 0 &&
      storageBeforeAuth.rootServiceWorkerScope &&
      storageAfterAuth.retiredKeyCount === 0 &&
      storageAfterAuth.retiredCacheCount === 0 &&
      storageAfterAuth.rootServiceWorkerScope &&
      signalSummary.consoleErrors === 0 &&
      signalSummary.failedRequests === 0 &&
      signalSummary.pageErrors === 0 &&
      signalSummary.routeHealthFailures === 0;

    return {
      authenticated,
      deployment,
      publicRoutes,
      signals: signalSummary,
      status: passed ? "passed" : "failed",
      storage: {
        afterAuth: storageAfterAuth,
        beforeAuth: storageBeforeAuth,
      },
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

async function inspectPublicRoutes(page, webOrigin, signals) {
  const results = [];
  for (const route of PUBLIC_ROUTES) {
    const signalStart = signals.snapshot();
    // eslint-disable-next-line no-await-in-loop -- one ephemeral page proves route isolation in order.
    const response = await page.goto(new URL(route.path, webOrigin).href, {
      waitUntil: "domcontentloaded",
    });
    // eslint-disable-next-line no-await-in-loop -- route guards settle asynchronously.
    await page
      .waitForLoadState("networkidle", { timeout: 5_000 })
      .catch(() => {});
    const routeHealthFailures = signals.failuresSince(signalStart);
    results.push({
      finalPath: new URL(page.url()).pathname,
      passed:
        Boolean(response?.ok()) &&
        new URL(page.url()).pathname === route.expectedFinalPath &&
        routeHealthFailures === 0,
      routeHealthFailures,
      requestedPath: route.path,
      slug: route.slug,
      status: response?.status() ?? null,
    });
  }
  return results;
}

async function runAuthenticatedBrowserLane(options) {
  const {
    apiOrigin,
    context,
    email,
    groupId,
    page,
    password,
    signals,
    userId,
    webOrigin,
  } = options;
  if (!email || !password || !groupId || !userId) {
    throw new Error("Authenticated browser inputs were incomplete.");
  }

  let accessToken = null;
  let loginStatus = null;
  let cookieInspection = missingCookieInspection();
  const routeResults = [];
  let realtime = {
    connected: false,
    initialTransport: null,
    passed: false,
    reconnectCount: 0,
    upgraded: false,
  };
  let cleanup = {
    cookieCleared: false,
    passed: false,
    status: null,
  };
  const lifecycle = await executeWithGuaranteedCleanup({
    execute: async () => {
      await context.clearCookies();
      await page.goto(new URL("/auth/login", webOrigin).href, {
        waitUntil: "domcontentloaded",
      });
      const loginResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          response.url() === `${apiOrigin}${PUBLIC_API_PREFIX}/auth/login`,
        { timeout: 20_000 },
      );
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Let's go" }).click();
      const loginResponse = await loginResponsePromise;
      loginStatus = loginResponse.status();
      accessToken = await readAccessToken(loginResponse);
      await page.waitForURL(
        (url) => url.origin === webOrigin && url.pathname === "/home",
        { timeout: 20_000 },
      );
      signals.markAuthenticated();

      const refreshCookie = (await context.cookies(apiOrigin)).find(
        (cookie) => cookie.name === COOKIE_CONTRACTS.refresh.name,
      );
      cookieInspection = refreshCookie
        ? inspectBrowserCookie(refreshCookie, COOKIE_CONTRACTS.refresh)
        : missingCookieInspection();

      for (const contract of AUTHENTICATED_ROUTE_CONTRACTS) {
        const routePath = contract.path
          .replace("{groupId}", encodeURIComponent(groupId))
          .replace("{userId}", encodeURIComponent(userId));
        // eslint-disable-next-line no-await-in-loop -- authenticated route checks use one in-memory session.
        const routeResult = await inspectAuthenticatedRoute({
          contract,
          page,
          routePath,
          signals,
          webOrigin,
        });
        routeResults.push(routeResult);
      }

      realtime = accessToken
        ? await probeAuthenticatedSocket({
            accessToken,
            socketOrigin: apiOrigin,
          })
        : realtime;
    },
    cleanup: async () => {
      cleanup = await cleanupSession({ apiOrigin, context });
      if (!cleanup.passed)
        throw new Error("Session cleanup was not confirmed.");
    },
  });
  const passed =
    loginStatus !== null &&
    loginStatus >= 200 &&
    loginStatus < 300 &&
    Boolean(accessToken) &&
    cookieInspectionPassed(cookieInspection) &&
    routeResults.length === 8 &&
    routeResults.every((route) => route.passed) &&
    realtime.passed &&
    cleanup.passed &&
    lifecycle.operation.passed &&
    lifecycle.cleanup.passed;

  return {
    cookie: cookieInspection,
    login: {
      accessTokenPresent: Boolean(accessToken),
      status: loginStatus,
    },
    realtime,
    routeHealth: {
      expected: 8,
      passed: routeResults.filter((route) => route.passed).length,
      routes: routeResults,
    },
    sessionCleanup: {
      ...cleanup,
      outcome: lifecycle.cleanup.outcome,
    },
    execution: lifecycle.operation,
    status: passed ? "passed" : "failed",
  };
}

async function inspectAuthenticatedRoute({
  contract,
  page,
  routePath,
  signals,
  webOrigin,
}) {
  const signalStart = signals.snapshot();
  const response = await page.goto(new URL(routePath, webOrigin).href, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(
    (expectedPath) => {
      const rootText = document.getElementById("root")?.innerText ?? "";
      return location.pathname === expectedPath && rootText.trim().length > 20;
    },
    routePath,
    { timeout: 20_000 },
  );
  await page
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch(() => {});

  const checkResults = [];
  for (const check of contract.checks) {
    // eslint-disable-next-line no-await-in-loop -- each semantic check is independently observable.
    checkResults.push(await inspectProductCheck(page, check));
  }

  const routeHealthFailures = signals.failuresSince(signalStart);
  return {
    checksPassed: checkResults.filter(Boolean).length,
    checksTotal: checkResults.length,
    passed:
      Boolean(response?.ok()) &&
      new URL(page.url()).pathname === routePath &&
      checkResults.every(Boolean) &&
      routeHealthFailures === 0,
    path: contract.path,
    routeHealthFailures,
    slug: contract.slug,
    status: response?.status() ?? null,
  };
}

async function inspectProductCheck(page, check) {
  let locator;
  if (check.kind === "label") locator = page.getByLabel(check.name).first();
  else if (check.kind === "text") locator = page.getByText(check.name).first();
  else if (check.kind === "region") {
    locator = page.getByRole("region", { name: check.name }).first();
  } else {
    locator = page
      .getByRole("heading", { level: check.level, name: check.name })
      .first();
  }

  try {
    await locator.waitFor({ state: "attached", timeout: 15_000 });
    return true;
  } catch {
    return false;
  }
}

async function readAccessToken(response) {
  try {
    const payload = await response.json();
    return typeof payload?.accessToken === "string"
      ? payload.accessToken
      : null;
  } catch {
    return null;
  }
}

function inspectBrowserCookie(cookie, contract) {
  const cookieLine = [
    `${cookie.name}=in-memory`,
    `Path=${cookie.path}`,
    cookie.httpOnly ? "HttpOnly" : "",
    cookie.secure ? "Secure" : "",
    `SameSite=${cookie.sameSite}`,
    cookie.domain.startsWith(".") ? `Domain=${cookie.domain}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  return inspectCookieContract(parseSetCookie(cookieLine), contract);
}

async function cleanupSession({ apiOrigin, context }) {
  let status = null;
  let requestPassed = false;
  let refreshCookieStillPresent = true;
  try {
    const response = await context.request.post(
      `${apiOrigin}${PUBLIC_API_PREFIX}/auth/logout`,
      {
        headers: { Origin: CANONICAL_WEB_ORIGIN },
        timeout: 15_000,
      },
    );
    status = response.status();
    requestPassed = response.ok();
    refreshCookieStillPresent = (await context.cookies(apiOrigin)).some(
      (cookie) => cookie.name === COOKIE_CONTRACTS.refresh.name,
    );
  } catch {
    requestPassed = false;
  } finally {
    await context.clearCookies();
  }
  return {
    cookieCleared: !refreshCookieStillPresent,
    passed: requestPassed && !refreshCookieStillPresent,
    status,
  };
}

async function inspectBrowserStorage(page) {
  const result = await page.evaluate(async (retiredSegment) => {
    const localKeys = Object.keys(localStorage);
    const sessionKeys = Object.keys(sessionStorage);
    if ("serviceWorker" in navigator) {
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(resolve, 5_000)),
      ]);
    }
    const registrations =
      "serviceWorker" in navigator
        ? await navigator.serviceWorker.getRegistrations()
        : [];
    return {
      localKeyCount: localKeys.length,
      retiredKeyCount: [...localKeys, ...sessionKeys].filter((key) =>
        key.toLowerCase().includes(retiredSegment),
      ).length,
      rootServiceWorkerScope: registrations.some(
        (registration) => registration.scope === `${location.origin}/`,
      ),
      serviceWorkerRegistrationCount: registrations.length,
      sessionKeyCount: sessionKeys.length,
    };
  }, RETIRED_BRAND_SEGMENT);
  const cacheNames = await page.evaluate(async () =>
    "caches" in window ? await caches.keys() : [],
  );
  return {
    ...result,
    cacheCount: cacheNames.length,
    retiredCacheCount: cacheNames.filter((name) =>
      name.toLowerCase().includes(RETIRED_BRAND_SEGMENT),
    ).length,
  };
}

function createSignals(page, { apiOrigin, mode, webOrigin }) {
  let consoleErrors = 0;
  let failedRequests = 0;
  let pageErrors = 0;
  let sessionPhase = "unauthenticated";
  const routeFailures = [];
  const unexpectedApiRequests = new WeakSet();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors += 1;
  });
  page.on("pageerror", () => {
    pageErrors += 1;
  });
  page.on("request", (request) => {
    const failure = classifyApiOriginRequest({
      apiOrigin,
      url: request.url(),
    });
    if (!failure) return;
    unexpectedApiRequests.add(request);
    routeFailures.push(failure);
  });
  page.on("requestfailed", (request) => {
    const failure = classifyFailedResource({
      apiOrigin,
      url: request.url(),
      webOrigin,
    });
    if (!failure) return;
    failedRequests += 1;
    if (!unexpectedApiRequests.has(request)) routeFailures.push(failure);
  });
  page.on("response", (response) => {
    const failure = classifyRouteResponse({
      apiOrigin,
      method: response.request().method(),
      mode,
      sessionPhase,
      status: response.status(),
      url: response.url(),
      webOrigin,
    });
    if (
      failure &&
      !(
        failure === "unexpected-api-contract-path" &&
        unexpectedApiRequests.has(response.request())
      )
    ) {
      routeFailures.push(failure);
    }
  });
  return {
    failuresSince(start) {
      return routeFailures.length - start;
    },
    markAuthenticated() {
      sessionPhase = "authenticated";
    },
    snapshot() {
      return routeFailures.length;
    },
    summary() {
      const failureCategories = Object.fromEntries(
        [...new Set(routeFailures)].map((category) => [
          category,
          routeFailures.filter((value) => value === category).length,
        ]),
      );
      return {
        consoleErrors,
        failedRequests,
        failureCategories,
        pageErrors,
        routeHealthFailures: routeFailures.length,
      };
    },
  };
}

/**
 * Classifies first-party HTTP failures. Only two explicit unauthenticated
 * session-discovery responses are allowed in the public browser lane.
 *
 * @param {object} options Response facts.
 * @param {string} options.apiOrigin API origin.
 * @param {string} options.method Request method.
 * @param {string} options.mode Browser acceptance mode.
 * @param {"authenticated" | "unauthenticated"} [options.sessionPhase] Browser session phase.
 * @param {number} options.status HTTP status.
 * @param {string} options.url Response URL.
 * @param {string} options.webOrigin Web origin.
 */
export function classifyRouteResponse({
  apiOrigin,
  method,
  mode,
  sessionPhase = mode === "browser-public"
    ? "unauthenticated"
    : "authenticated",
  status,
  url,
  webOrigin,
}) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "invalid-response-url";
  }
  if (parsed.origin === apiOrigin) {
    if (!isAllowedApiOriginPath(parsed.pathname)) {
      return "unexpected-api-contract-path";
    }
    if (status < 400) return null;
    const expected =
      sessionPhase === "unauthenticated" &&
      EXPECTED_UNAUTHENTICATED_API_STATUSES.some(
        (contract) =>
          contract.method === method &&
          contract.path === parsed.pathname &&
          contract.status === status,
      );
    return expected ? null : "api-response-error";
  }
  if (status < 400) return null;
  return parsed.origin === webOrigin ? "web-resource-error" : null;
}

/** @param {{ apiOrigin: string; url: string }} options */
export function classifyApiOriginRequest({ apiOrigin, url }) {
  try {
    const parsed = new URL(url);
    return parsed.origin === apiOrigin &&
      !isAllowedApiOriginPath(parsed.pathname)
      ? "unexpected-api-contract-path"
      : null;
  } catch {
    return "invalid-request-url";
  }
}

/** @param {{ apiOrigin: string; url: string; webOrigin: string }} options */
export function classifyFailedResource({ apiOrigin, url, webOrigin }) {
  try {
    const parsed = new URL(url);
    if (parsed.origin === apiOrigin) {
      return isAllowedApiOriginPath(parsed.pathname)
        ? "failed-resource"
        : "unexpected-api-contract-path";
    }
    return parsed.origin === webOrigin ? "failed-resource" : null;
  } catch {
    return "invalid-request-url";
  }
}

function missingCookieInspection() {
  return {
    domainAbsent: false,
    httpOnly: false,
    nameMatches: false,
    pathMatches: false,
    sameSiteLax: false,
    secure: false,
  };
}
