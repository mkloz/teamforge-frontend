// @ts-check

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { z } from "zod";
import {
  cwd,
  ensureTrailingSlash,
  getApiUrl,
  getAuditBaseUrl,
  getAuditSession,
  getRefreshCookieName,
  loadAuditEnvFiles,
  refreshAuditTokens,
  removeAuditTokens,
  sleep,
  todayStamp,
  writeAuditTokens,
  writeError,
  writeJson,
  writeOutput,
  writeText,
} from "./helpers.mjs";
import { resolveAuditRoutes } from "./routes.mjs";

/**
 * @typedef {import("./helpers.mjs").AuditTokens} AuditTokens
 * @typedef {import("./routes.mjs").AuditRoute} AuditRoute
 * @typedef {import("node:child_process").ChildProcess} ChildProcess
 */

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const chromeTargetListSchema = z.array(
  z
    .object({
      type: z.string().optional(),
      webSocketDebuggerUrl: z.string().optional(),
    })
    .passthrough(),
);
const cdpMessageSchema = z
  .object({
    error: z
      .object({
        message: z.string(),
      })
      .optional(),
    id: z.number().optional(),
    method: z.string().optional(),
    params: z.unknown().optional(),
    result: z.unknown().optional(),
  })
  .passthrough();
const cdpEvaluateResultSchema = z
  .object({
    result: z
      .object({
        value: z.unknown().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
const cdpScreenshotResultSchema = z
  .object({
    data: z.string(),
  })
  .passthrough();
const cdpConsoleArgSchema = z
  .object({
    description: z.string().nullish(),
    value: z.unknown().optional(),
  })
  .passthrough();
const cdpConsoleEventSchema = z
  .object({
    args: z.array(cdpConsoleArgSchema).optional(),
    type: z.string(),
  })
  .passthrough();
const cdpExceptionEventSchema = z
  .object({
    exceptionDetails: z
      .object({
        exception: z
          .object({
            description: z.string().nullish(),
          })
          .passthrough()
          .optional(),
        text: z.string().nullish(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
const cdpNetworkResponseEventSchema = z
  .object({
    response: z
      .object({
        status: z.number().optional(),
        url: z.string().nullish(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
const cdpNetworkLoadingFailedEventSchema = z
  .object({
    blockedReason: z.string().nullish(),
    errorText: z.string().nullish(),
  })
  .passthrough();
const headingSchema = z
  .object({
    level: z.string(),
    text: z.string(),
  })
  .passthrough();
const linkSchema = z
  .object({
    href: z.string().nullable().optional(),
    text: z.string(),
  })
  .passthrough();
const routeSettleStateSchema = z
  .object({
    loading: z.boolean(),
    path: z.string(),
    pathMatches: z.boolean(),
    rootTextLength: z.number(),
    textLength: z.number(),
  })
  .passthrough();
const pageStateSchema = z
  .object({
    buttonCount: z.number(),
    buttons: z.array(z.string()),
    finalPath: z.string(),
    finalUrl: z.string(),
    formControlCount: z.number(),
    formCount: z.number(),
    h1s: z.array(z.string()),
    headingCount: z.number(),
    headings: z.array(headingSchema),
    linkCount: z.number(),
    links: z.array(linkSchema),
    mainCount: z.number(),
    requestedPath: z.string(),
    rootChildCount: z.number(),
    rootTextLength: z.number(),
    routeBlocked: z.boolean(),
    stillLoading: z.boolean(),
    textLength: z.number(),
    textSample: z.string(),
    title: z.string(),
  })
  .passthrough();

/**
 * @typedef {z.infer<typeof cdpMessageSchema>} CdpMessage
 * @typedef {z.infer<typeof routeSettleStateSchema>} RouteSettleState
 * @typedef {z.infer<typeof pageStateSchema>} PageState
 * @typedef {z.infer<typeof cdpConsoleArgSchema>} CdpConsoleArg
 *
 * @typedef {object} PendingCdpCommand
 * @property {(value: unknown) => void} resolve Resolves the command result.
 * @property {(reason?: unknown) => void} reject Rejects the command result.
 *
 * @typedef {object} DiagnosticEntry
 * @property {string} slug Route slug active when the diagnostic fired.
 * @property {string} text Diagnostic text.
 *
 * @typedef {object} AuditEventState
 * @property {string} currentSlug Route slug currently being audited.
 * @property {DiagnosticEntry[]} consoleErrors Console warnings/errors by route.
 * @property {DiagnosticEntry[]} failedRequests Failed/error requests by route.
 *
 * @typedef {PageState & { slug: string; screenshotName: string }} RouteAuditResult
 * @typedef {RouteAuditResult & { consoleErrors: string[]; expectedFailedRequests: string[]; failedRequests: string[] }} RouteResult
 *
 * @typedef {object} LoadedAuditConfig
 * @property {string} apiUrl Backend API URL.
 * @property {string} baseUrl Frontend base URL.
 * @property {string} chromePath Browser executable path.
 * @property {number} debugPort Chrome debugging port.
 * @property {string} outputDir Audit output directory.
 * @property {string} profileDir Chrome profile directory.
 * @property {string} refreshCookieName Refresh cookie name.
 * @property {AuditRoute[]} routes Routes to audit.
 * @property {string} screenshotDir Screenshot output directory.
 * @property {AuditTokens} tokens Current audit tokens.
 *
 * @typedef {object} LoadedRouteAuditOptions
 * @property {string} apiUrl Backend API URL.
 * @property {string} baseUrl Frontend base URL.
 * @property {CdpClient} cdp CDP client.
 * @property {AuditEventState} eventState Route-scoped event state.
 * @property {string} outputDir Audit output directory.
 * @property {string} refreshCookieName Refresh cookie name.
 * @property {AuditRoute[]} routes Routes to audit.
 * @property {AuditTokens} tokens Initial audit tokens.
 *
 * @typedef {object} LoadedRouteAuditRun
 * @property {RouteResult[]} results Route results.
 * @property {AuditTokens} tokens Final audit tokens.
 */

/**
 * Locates a Chrome or Edge executable for the loaded-state browser audit.
 *
 * @returns {string} Absolute browser executable path.
 */
function findChrome() {
  const chromePath = chromeCandidates.find((candidate) =>
    candidate ? existsSync(candidate) : false,
  );

  if (!chromePath) {
    throw new Error("Chrome or Edge executable was not found.");
  }

  return chromePath;
}

/**
 * Allocates an unused localhost port.
 *
 * @returns {Promise<number>} Free TCP port.
 */
function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") {
          resolve(address.port);
          return;
        }

        reject(new Error("Could not allocate a local port."));
      });
    });
  });
}

/**
 * Polls Chrome's debug endpoint until it returns a valid target list.
 *
 * @param {string} url Chrome debugging JSON endpoint.
 * @param {number} [timeoutMs=10000] Maximum wait time.
 * @returns {Promise<z.infer<typeof chromeTargetListSchema>>} Chrome targets.
 */
async function waitForJson(url, timeoutMs = 10_000) {
  const startedAt = Date.now();

  while (!hasTimedOut(startedAt, timeoutMs)) {
    // eslint-disable-next-line no-await-in-loop -- Polling waits for Chrome's debug endpoint.
    const targets = await readChromeTargets(url);

    if (targets) {
      return targets;
    }

    // eslint-disable-next-line no-await-in-loop -- Polling must stay sequential.
    await sleep(150);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

/**
 * Checks whether a polling window has expired.
 *
 * @param {number} startedAt Epoch milliseconds when polling started.
 * @param {number} timeoutMs Maximum poll duration.
 * @returns {boolean} Whether polling has timed out.
 */
function hasTimedOut(startedAt, timeoutMs) {
  return Date.now() - startedAt >= timeoutMs;
}

/**
 * Fetches and validates Chrome debug targets.
 *
 * @param {string} url Chrome debugging JSON endpoint.
 * @returns {Promise<z.infer<typeof chromeTargetListSchema> | null>} Chrome targets when ready.
 */
async function readChromeTargets(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    return parseChromeTargets(await response.text());
  } catch (error) {
    logChromeTargetWaitError(url, error);
    return null;
  }
}

/**
 * Parses Chrome target JSON.
 *
 * @param {string} responseText Chrome debug endpoint response text.
 * @returns {z.infer<typeof chromeTargetListSchema> | null} Parsed targets.
 */
function parseChromeTargets(responseText) {
  const parsedTargets = chromeTargetListSchema.safeParse(
    JSON.parse(responseText),
  );

  return parsedTargets.success ? parsedTargets.data : null;
}

/**
 * Logs Chrome target polling errors when audit debug logging is enabled.
 *
 * @param {string} url Chrome debugging JSON endpoint.
 * @param {unknown} error Polling error.
 */
function logChromeTargetWaitError(url, error) {
  if (process.env.AUDIT_DEBUG !== "true") {
    return;
  }

  writeOutput(
    `WAIT ${url}: ${error instanceof Error ? error.message : String(error)}`,
  );
}

/**
 * Routes one raw CDP websocket message to a pending command or event listener.
 *
 * @param {CdpClient} client CDP client.
 * @param {MessageEvent} event Websocket message event.
 */
function handleCdpSocketMessage(client, event) {
  const message = parseCdpMessage(event.data);

  if (!message) {
    return;
  }

  if (resolvePendingCdpCommand(client, message)) {
    return;
  }

  dispatchCdpEvent(client, message);
}

/**
 * Parses one CDP websocket message.
 *
 * @param {unknown} data Raw websocket data.
 * @returns {CdpMessage | null} Parsed CDP message.
 */
function parseCdpMessage(data) {
  const parsedMessage = cdpMessageSchema.safeParse(JSON.parse(String(data)));

  return parsedMessage.success ? parsedMessage.data : null;
}

/**
 * Resolves a pending CDP command response.
 *
 * @param {CdpClient} client CDP client.
 * @param {CdpMessage} message Parsed CDP message.
 * @returns {boolean} Whether the message was a command response.
 */
function resolvePendingCdpCommand(client, message) {
  if (typeof message.id !== "number") {
    return false;
  }

  const pending = client.pending.get(message.id);

  if (!pending) {
    return true;
  }

  client.pending.delete(message.id);

  if (message.error) {
    pending.reject(new Error(message.error.message));
    return true;
  }

  pending.resolve(message.result);
  return true;
}

/**
 * Dispatches a CDP event message to registered handlers.
 *
 * @param {CdpClient} client CDP client.
 * @param {CdpMessage} message Parsed CDP event message.
 */
function dispatchCdpEvent(client, message) {
  const handlers = getCdpEventHandlers(client, message);

  if (handlers) {
    notifyCdpEventHandlers(handlers, message.params ?? {});
  }
}

/**
 * Gets handlers registered for one CDP event message.
 *
 * @param {CdpClient} client CDP client.
 * @param {CdpMessage} message Parsed CDP event message.
 * @returns {Set<(params: unknown) => void> | undefined} Registered handlers.
 */
function getCdpEventHandlers(client, message) {
  return message.method ? client.listeners.get(message.method) : undefined;
}

/**
 * Notifies registered CDP event handlers.
 *
 * @param {Set<(params: unknown) => void>} handlers Event handlers.
 * @param {unknown} params Event params.
 */
function notifyCdpEventHandlers(handlers, params) {
  for (const handler of handlers) {
    handler(params);
  }
}

function noop() {}

class CdpClient {
  /**
   * @param {WebSocket} socket Chrome DevTools Protocol websocket.
   */
  constructor(socket) {
    /** @type {number} */
    this.id = 0;
    /** @type {Map<number, PendingCdpCommand>} */
    this.pending = new Map();
    /** @type {Map<string, Set<(params: unknown) => void>>} */
    this.listeners = new Map();
    /** @type {WebSocket} */
    this.socket = socket;

    socket.addEventListener("message", (event) =>
      handleCdpSocketMessage(this, event),
    );
  }

  /**
   * Sends a CDP command.
   *
   * @param {string} method CDP method name.
   * @param {Record<string, unknown>} [params] CDP method parameters.
   * @returns {Promise<unknown>} CDP command result.
   */
  send(method, params = {}) {
    const id = ++this.id;
    this.socket.send(JSON.stringify({ id, method, params }));

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  /**
   * Subscribes to a CDP event.
   *
   * @param {string} method CDP event name.
   * @param {(params: unknown) => void} handler Event handler.
   * @returns {() => void} Unsubscribe callback.
   */
  on(method, handler) {
    const handlers = this.listeners.get(method) ?? new Set();
    handlers.add(handler);
    this.listeners.set(method, handlers);

    return () => handlers.delete(handler);
  }

  /**
   * Waits for one CDP event.
   *
   * @param {string} method CDP event name.
   * @param {number} [timeoutMs=15000] Maximum wait time.
   * @returns {Promise<unknown>} Event parameters.
   */
  once(method, timeoutMs = 15_000) {
    return new Promise((resolve, reject) => {
      /** @type {() => void} */
      let off = noop;
      const timeout = setTimeout(() => {
        off();
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      off = this.on(method, (params) => {
        clearTimeout(timeout);
        off();
        resolve(params);
      });
    });
  }
}

/**
 * Connects to the first available Chrome page target.
 *
 * @param {number} debugPort Chrome remote debugging port.
 * @returns {Promise<CdpClient>} CDP client.
 */
async function connectPage(debugPort) {
  const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
  const target = targets.find((item) => item.type === "page") ?? targets[0];

  if (!target?.webSocketDebuggerUrl) {
    throw new Error("Could not find a Chrome page target.");
  }

  const socket = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve());
    socket.addEventListener("error", () => {
      reject(new Error("Could not open Chrome DevTools websocket."));
    });
  });

  return new CdpClient(socket);
}

/**
 * Seeds the browser with the current refresh cookie when one exists.
 *
 * @param {CdpClient} cdp CDP client.
 * @param {{ apiUrl: string; refreshCookieName: string; refreshToken?: string }} options Cookie options.
 * @returns {Promise<void>}
 */
async function setRefreshCookie(
  cdp,
  { apiUrl, refreshCookieName, refreshToken },
) {
  if (!refreshToken) {
    return;
  }

  await cdp.send("Network.setCookie", {
    name: refreshCookieName,
    value: refreshToken,
    url: new URL(apiUrl).origin,
    httpOnly: true,
    sameSite: "Lax",
  });
}

/**
 * Waits for the SPA to replace loading UI with route content.
 *
 * @param {CdpClient} cdp CDP client.
 * @param {string} routePath Requested route path.
 * @returns {Promise<RouteSettleState | null>} Last sampled route state.
 */
async function waitForRouteSettle(cdp, routePath) {
  const expression = getRouteSettleExpression(routePath);
  /** @type {RouteSettleState | null} */
  let lastValue = null;
  const startedAt = Date.now();

  while (!hasTimedOut(startedAt, 12_000)) {
    // eslint-disable-next-line no-await-in-loop -- Route settling is a sequential browser poll.
    lastValue = await evaluateRouteSettleState(cdp, expression);

    if (isRouteSettled(lastValue)) {
      break;
    }

    // eslint-disable-next-line no-await-in-loop -- Route settling is a sequential browser poll.
    await sleep(300);
  }

  return lastValue;
}

/**
 * Builds the browser-side route settling expression.
 *
 * @param {string} routePath Requested route path.
 * @returns {string} Runtime.evaluate expression.
 */
function getRouteSettleExpression(routePath) {
  return `
(() => {
  const text = document.body?.innerText ?? "";
  const rootText = document.getElementById("root")?.innerText ?? "";
  const loading = /Loading page|Preparing Findafew/.test(text);
  const pathMatches = location.pathname === ${JSON.stringify(routePath)};
  return {
    path: location.pathname,
    pathMatches,
    loading,
    textLength: text.trim().length,
    rootTextLength: rootText.trim().length,
  };
})()
`;
}

/**
 * Samples the route settling state from the browser.
 *
 * @param {CdpClient} cdp CDP client.
 * @param {string} expression Runtime.evaluate expression.
 * @returns {Promise<RouteSettleState | null>} Parsed route state.
 */
async function evaluateRouteSettleState(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });

  return parseRouteSettleState(getCdpEvaluationValue(result));
}

/**
 * Extracts the by-value payload from a CDP Runtime.evaluate result.
 *
 * @param {unknown} result CDP Runtime.evaluate result.
 * @returns {unknown} Evaluation value.
 */
function getCdpEvaluationValue(result) {
  const parsedResult = cdpEvaluateResultSchema.safeParse(result);

  return parsedResult.success ? parsedResult.data.result?.value : null;
}

/**
 * Parses route settling state from Runtime.evaluate.
 *
 * @param {unknown} value Runtime.evaluate value.
 * @returns {RouteSettleState | null} Parsed route state.
 */
function parseRouteSettleState(value) {
  const parsedState = routeSettleStateSchema.safeParse(value);

  return parsedState.success ? parsedState.data : null;
}

/**
 * Checks whether the route has loaded enough content.
 *
 * @param {RouteSettleState | null} state Last sampled route state.
 * @returns {boolean} Whether the route is settled.
 */
function isRouteSettled(state) {
  return Boolean(state && !state.loading && state.rootTextLength > 20);
}

/**
 * Collects a hydrated DOM snapshot for one route.
 *
 * @param {CdpClient} cdp CDP client.
 * @param {string} routePath Requested route path.
 * @returns {Promise<PageState | null>} Route DOM state.
 */
async function collectPageState(cdp, routePath) {
  const expression = `
(() => {
  const root = document.getElementById("root");
  const text = document.body?.innerText ?? "";
  const rootText = root?.innerText ?? "";
  const headings = [...document.querySelectorAll("h1,h2,h3")].map((node) => ({
    level: node.tagName.toLowerCase(),
    text: node.textContent?.trim().replace(/\\s+/g, " ").slice(0, 160) ?? "",
  })).filter((heading) => heading.text);
  const links = [...document.querySelectorAll("a[href]")].map((node) => ({
    text: node.textContent?.trim().replace(/\\s+/g, " ").slice(0, 80) ?? "",
    href: node.getAttribute("href"),
  }));
  const buttons = [...document.querySelectorAll("button")].map((node) =>
    node.textContent?.trim().replace(/\\s+/g, " ").slice(0, 80) ||
      node.getAttribute("aria-label") ||
      ""
  ).filter(Boolean);
  const forms = [...document.querySelectorAll("form")].length;
  const controls = [...document.querySelectorAll("input,textarea,select")].length;
  const mainCount = document.querySelectorAll("main").length;
  const h1s = [...document.querySelectorAll("h1")].map((node) =>
    node.textContent?.trim().replace(/\\s+/g, " ") ?? ""
  ).filter(Boolean);
  const routeBlocked =
    location.pathname.startsWith("/auth/login") &&
    ${JSON.stringify(routePath)} !== "/auth/login";

  return {
    requestedPath: ${JSON.stringify(routePath)},
    finalUrl: location.href,
    finalPath: location.pathname,
    title: document.title,
    routeBlocked,
    stillLoading: /Loading page|Preparing Findafew/.test(text),
    rootChildCount: root?.children.length ?? 0,
    textLength: text.trim().length,
    rootTextLength: rootText.trim().length,
    textSample: text.trim().replace(/\\s+/g, " ").slice(0, 1200),
    h1s,
    mainCount,
    headingCount: headings.length,
    headings: headings.slice(0, 18),
    linkCount: links.length,
    links: links.slice(0, 18),
    buttonCount: buttons.length,
    buttons: buttons.slice(0, 18),
    formCount: forms,
    formControlCount: controls,
  };
})()
`;
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });

  return parsePageState(getCdpEvaluationValue(result));
}

/**
 * Parses a page-state value from Runtime.evaluate.
 *
 * @param {unknown} value Runtime.evaluate value.
 * @returns {PageState | null} Parsed page state.
 */
function parsePageState(value) {
  const parsedState = pageStateSchema.safeParse(value);

  return parsedState.success ? parsedState.data : null;
}

/**
 * Builds a failed route result when navigation or collection throws.
 *
 * @param {import("./routes.mjs").AuditRoute} route Route under audit.
 * @param {unknown} [error] Route failure.
 * @returns {PageState} Fallback route result.
 */
function routeResultFallback(route, error) {
  return {
    requestedPath: route.path,
    finalUrl: "",
    finalPath: "",
    title: "",
    routeBlocked: true,
    stillLoading: false,
    rootChildCount: 0,
    textLength: 0,
    rootTextLength: 0,
    textSample: error instanceof Error ? error.message : String(error),
    h1s: [],
    mainCount: 0,
    headingCount: 0,
    headings: [],
    linkCount: 0,
    links: [],
    buttonCount: 0,
    buttons: [],
    formCount: 0,
    formControlCount: 0,
  };
}

/**
 * Checks whether a failed request is expected for the route.
 *
 * @param {import("./routes.mjs").AuditRoute} route Route under audit.
 * @param {string} text Failed request text.
 * @returns {boolean} Whether the failed request is expected.
 */
function isExpectedFailedRequest(route, text) {
  return (
    route.expectedFailedRequestPatterns?.some((pattern) =>
      text.includes(pattern),
    ) ?? false
  );
}

/**
 * Creates mutable route-scoped event capture state.
 *
 * @returns {AuditEventState} Event capture state.
 */
function createAuditEventState() {
  return {
    currentSlug: "startup",
    consoleErrors: [],
    failedRequests: [],
  };
}

/**
 * Registers CDP listeners used to collect route diagnostics.
 *
 * @param {CdpClient} cdp CDP client.
 * @param {AuditEventState} state Event capture state.
 */
function registerAuditEventHandlers(cdp, state) {
  cdp.on("Runtime.consoleAPICalled", (event) => {
    recordConsoleApiCalled(state, event);
  });
  cdp.on("Runtime.exceptionThrown", (event) => {
    recordRuntimeException(state, event);
  });
  cdp.on("Network.responseReceived", (event) => {
    recordNetworkResponse(state, event);
  });
  cdp.on("Network.loadingFailed", (event) => {
    recordNetworkLoadingFailure(state, event);
  });
}

/**
 * Records CDP console warnings and errors.
 *
 * @param {AuditEventState} state Event capture state.
 * @param {unknown} event CDP Runtime.consoleAPICalled params.
 */
function recordConsoleApiCalled(state, event) {
  const parsedEvent = cdpConsoleEventSchema.safeParse(event);

  if (!parsedEvent.success || !isConsoleErrorOrWarning(parsedEvent.data.type)) {
    return;
  }

  const text = getConsoleEventText(parsedEvent.data.args);

  if (text) {
    state.consoleErrors.push({ slug: state.currentSlug, text });
  }
}

/**
 * Checks whether a console event should be reported.
 *
 * @param {string} type CDP console event type.
 * @returns {boolean} Whether the event is an error or warning.
 */
function isConsoleErrorOrWarning(type) {
  return type === "error" || type === "warning";
}

/**
 * Builds display text for a console event.
 *
 * @param {CdpConsoleArg[] | undefined} args CDP console arguments.
 * @returns {string | undefined} Console text.
 */
function getConsoleEventText(args) {
  return (
    args
      // oxlint-disable-next-line typescript/no-base-to-string -- Preserve the previous Array.join() coercion for CDP console argument values.
      ?.map((arg) => String(arg.value ?? arg.description ?? ""))
      .join(" ")
      .trim()
  );
}

/**
 * Records CDP runtime exceptions.
 *
 * @param {AuditEventState} state Event capture state.
 * @param {unknown} event CDP Runtime.exceptionThrown params.
 */
function recordRuntimeException(state, event) {
  const parsedEvent = cdpExceptionEventSchema.safeParse(event);

  if (!parsedEvent.success) {
    return;
  }

  state.consoleErrors.push({
    slug: state.currentSlug,
    text: getRuntimeExceptionText(parsedEvent.data),
  });
}

/**
 * Gets display text for a runtime exception event.
 *
 * @param {z.infer<typeof cdpExceptionEventSchema>} event CDP exception event.
 * @returns {string} Exception text.
 */
function getRuntimeExceptionText(event) {
  return (
    [
      event.exceptionDetails?.text,
      event.exceptionDetails?.exception?.description,
      "Runtime exception",
    ].find(isString) ?? "Runtime exception"
  );
}

/**
 * Checks whether a value is a string.
 *
 * @param {unknown} value Value to check.
 * @returns {value is string} Whether the value is a string.
 */
function isString(value) {
  return typeof value === "string";
}

/**
 * Records HTTP error responses.
 *
 * @param {AuditEventState} state Event capture state.
 * @param {unknown} event CDP Network.responseReceived params.
 */
function recordNetworkResponse(state, event) {
  const parsedEvent = cdpNetworkResponseEventSchema.safeParse(event);

  if (!parsedEvent.success) {
    return;
  }

  if (isFailedNetworkResponse(parsedEvent.data)) {
    state.failedRequests.push({
      slug: state.currentSlug,
      text: formatFailedNetworkResponse(parsedEvent.data),
    });
  }
}

/**
 * Checks whether a network response should be reported as failed.
 *
 * @param {z.infer<typeof cdpNetworkResponseEventSchema>} event CDP response event.
 * @returns {boolean} Whether the response failed.
 */
function isFailedNetworkResponse(event) {
  return (event.response?.status ?? 0) >= 400;
}

/**
 * Formats a failed network response.
 *
 * @param {z.infer<typeof cdpNetworkResponseEventSchema>} event CDP response event.
 * @returns {string} Failed response text.
 */
function formatFailedNetworkResponse(event) {
  return `${event.response?.status ?? 0} ${event.response?.url}`;
}

/**
 * Records network loading failures.
 *
 * @param {AuditEventState} state Event capture state.
 * @param {unknown} event CDP Network.loadingFailed params.
 */
function recordNetworkLoadingFailure(state, event) {
  const parsedEvent = cdpNetworkLoadingFailedEventSchema.safeParse(event);

  if (!parsedEvent.success) {
    return;
  }

  state.failedRequests.push({
    slug: state.currentSlug,
    text: `${parsedEvent.data.errorText} ${
      parsedEvent.data.blockedReason ?? ""
    }`.trim(),
  });
}

/**
 * Renders loaded route audit results as markdown.
 *
 * @param {RouteResult[]} results Route results.
 * @param {{ baseUrl: string; refreshCookieName: string; hasRefreshToken: boolean }} options Report options.
 * @returns {string} Markdown report.
 */
function toMarkdown(results, { baseUrl, refreshCookieName, hasRefreshToken }) {
  const rows = results
    .map(
      (result) =>
        `| \`${result.requestedPath}\` | \`${result.finalPath}\` | ${result.routeBlocked ? "yes" : "no"} | ${result.stillLoading ? "yes" : "no"} | ${result.textLength} | ${result.h1s.length} | ${result.mainCount} | ${result.consoleErrors.length} | ${result.failedRequests.length} |`,
    )
    .join("\n");

  const details = results.map(formatRouteResultDetails).join("\n");

  return `# Findafew Loaded Route Audit

Date: ${new Date().toISOString()}
Target: \`${baseUrl}\`
Auth mode: access token bootstrap${hasRefreshToken ? ` plus rotated \`${refreshCookieName}\` API cookie` : ""}

This report checks hydrated browser state. It complements SquirrelScan, which sees the crawler-facing SPA shell.

| Requested route | Final path | Blocked | Loading | Text chars | H1s | Main | Console errors | Failed requests |
| --- | --- | :---: | :---: | ---: | ---: | ---: | ---: | ---: |
${rows}

${details}
`;
}

/**
 * Renders one route's detailed markdown section.
 *
 * @param {RouteResult} result Route result.
 * @returns {string} Markdown details section.
 */
function formatRouteResultDetails(result) {
  const consoleErrors = formatMarkdownList(result.consoleErrors, {
    limit: 8,
  });
  const failedRequests = formatMarkdownList(result.failedRequests, {
    limit: 12,
  });
  const expectedFailedRequests = formatMarkdownList(
    result.expectedFailedRequests,
    { limit: 8 },
  );
  const headings = formatMarkdownList(result.headings, {
    formatItem: formatHeadingSummary,
  });

  return `## ${result.slug}: \`${result.requestedPath}\`

- Final path: \`${result.finalPath}\`
- Route protection blocked: ${result.routeBlocked ? "yes" : "no"}
- Still loading: ${result.stillLoading ? "yes" : "no"}
- Text length: ${result.textLength}
- H1 count: ${result.h1s.length}
- Main landmarks: ${result.mainCount}
- Screenshot: [${result.screenshotName}](screenshots/${result.screenshotName})

Headings:
${headings}

Console errors:
${consoleErrors}

Failed or error HTTP requests:
${failedRequests}

Expected failed/error HTTP requests:
${expectedFailedRequests}

Text sample:

\`\`\`text
${result.textSample}
\`\`\`
`;
}

/**
 * Formats a markdown bullet list with the audit's empty-state text.
 *
 * @template T
 * @param {T[]} items Items to render.
 * @param {{ formatItem?: (item: T) => string; limit?: number }} [options] List options.
 * @returns {string} Markdown list or empty-state text.
 */
function formatMarkdownList(items, { formatItem = String, limit } = {}) {
  if (items.length === 0) {
    return "None";
  }

  return items
    .slice(0, limit)
    .map((item) => `- ${formatItem(item)}`)
    .join("\n");
}

/**
 * Formats a heading summary line.
 *
 * @param {z.infer<typeof headingSchema>} heading Heading data.
 * @returns {string} Heading summary.
 */
function formatHeadingSummary(heading) {
  return `${heading.level}: ${heading.text}`;
}

/**
 * Navigates to one route, captures DOM state, and saves a screenshot.
 *
 * @param {{ apiUrl: string; baseUrl: string; cdp: CdpClient; outputDir: string; refreshCookieName: string; route: import("./routes.mjs").AuditRoute; tokens: AuditTokens }} options Route audit options.
 * @returns {Promise<RouteAuditResult>} Route result.
 */
async function auditRoute({
  apiUrl,
  baseUrl,
  cdp,
  outputDir,
  refreshCookieName,
  route,
  tokens,
}) {
  await setRefreshCookie(cdp, {
    apiUrl,
    refreshCookieName,
    refreshToken: tokens.refreshToken,
  });

  const url = new URL(route.path, ensureTrailingSlash(baseUrl)).href;
  const loaded = cdp.once("Page.loadEventFired", 15_000).catch(() => null);
  await cdp.send("Page.navigate", { url });
  await loaded;
  await waitForRouteSettle(cdp, route.path);
  await sleep(700);

  const pageState =
    (await collectPageState(cdp, route.path)) ?? routeResultFallback(route);
  const screenshotName = `${route.slug}.png`;
  const screenshot = parseScreenshotResult(
    await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    }),
  );

  writeFileSync(
    path.join(outputDir, "screenshots", screenshotName),
    Buffer.from(screenshot.data, "base64"),
  );

  return {
    slug: route.slug,
    screenshotName,
    ...pageState,
  };
}

/**
 * Parses a CDP screenshot response.
 *
 * @param {unknown} result CDP screenshot result.
 * @returns {z.infer<typeof cdpScreenshotResultSchema>} Parsed screenshot.
 */
function parseScreenshotResult(result) {
  return cdpScreenshotResultSchema.parse(result);
}

/**
 * Runs the authenticated loaded-state browser audit.
 *
 * @returns {Promise<void>}
 */
async function main() {
  loadAuditEnvFiles();

  const config = await getLoadedAuditConfig();

  prepareLoadedAuditDirectories(config);
  warnIfRefreshTokenMissing(config.tokens);

  const chrome = startChrome(config);
  /** @type {CdpClient | undefined} */
  let cdp;

  try {
    cdp = await connectPage(config.debugPort);
    const eventState = createAuditEventState();
    registerAuditEventHandlers(cdp, eventState);
    await enableAuditCdpDomains(cdp);

    const { results, tokens } = await runLoadedRouteAudits({
      apiUrl: config.apiUrl,
      baseUrl: config.baseUrl,
      cdp,
      eventState,
      outputDir: config.outputDir,
      refreshCookieName: config.refreshCookieName,
      routes: config.routes,
      tokens: config.tokens,
    });

    writeLoadedRouteAuditReport({
      baseUrl: config.baseUrl,
      outputDir: config.outputDir,
      refreshCookieName: config.refreshCookieName,
      results,
      tokens,
    });
  } finally {
    cleanupLoadedAudit(cdp, chrome);
  }
}

/**
 * Resolves configuration and runtime paths for a loaded route audit.
 *
 * @returns {Promise<LoadedAuditConfig>} Loaded audit configuration.
 */
async function getLoadedAuditConfig() {
  const apiUrl = getApiUrl();
  const baseUrl = getAuditBaseUrl();
  const refreshCookieName = getRefreshCookieName();
  const tokens = await getAuditSession({ apiUrl, refreshCookieName });
  const routes = await resolveAuditRoutes({
    accessToken: tokens.accessToken,
    apiUrl,
  });
  const outputDir = getLoadedAuditOutputDir();
  const chromePath = findChrome();
  const debugPort = await getFreePort();
  const profileDir = path.join(cwd, "temp", "chrome-loaded-route-audit");
  const screenshotDir = path.join(outputDir, "screenshots");

  return {
    apiUrl,
    baseUrl,
    chromePath,
    debugPort,
    outputDir,
    profileDir,
    refreshCookieName,
    routes,
    screenshotDir,
    tokens,
  };
}

/**
 * Resolves the output directory for loaded route audit artifacts.
 *
 * @returns {string} Output directory.
 */
function getLoadedAuditOutputDir() {
  return (
    process.env.LOADED_AUDIT_OUTPUT_DIR ??
    process.env.AUDIT_LOADED_OUTPUT_DIR ??
    path.join(cwd, "temp", `loaded-route-audit-${todayStamp()}`)
  );
}

/**
 * Recreates the browser profile directory and ensures screenshot output exists.
 *
 * @param {Pick<LoadedAuditConfig, "profileDir" | "screenshotDir">} options Directory options.
 */
function prepareLoadedAuditDirectories({ profileDir, screenshotDir }) {
  rmSync(profileDir, { recursive: true, force: true });
  mkdirSync(screenshotDir, { recursive: true });
}

/**
 * Warns when the audit cannot rotate refresh sessions.
 *
 * @param {AuditTokens} tokens Audit tokens.
 */
function warnIfRefreshTokenMissing(tokens) {
  if (!tokens.refreshToken) {
    writeOutput(
      "WARN Login did not return a refresh token or refresh cookie; loaded audit will not rotate sessions.",
    );
  }
}

/**
 * Starts the headless browser used for CDP route audits.
 *
 * @param {Pick<LoadedAuditConfig, "chromePath" | "debugPort" | "profileDir">} options Browser options.
 * @returns {ChildProcess} Spawned browser process.
 */
function startChrome({ chromePath, debugPort, profileDir }) {
  return spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-gpu",
      "about:blank",
    ],
    { windowsHide: true },
  );
}

/**
 * Enables the CDP domains used by the audit.
 *
 * @param {CdpClient} cdp CDP client.
 * @returns {Promise<void>}
 */
async function enableAuditCdpDomains(cdp) {
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
}

/**
 * Audits each route sequentially in the same browser session.
 *
 * @param {LoadedRouteAuditOptions} options Audit run options.
 * @returns {Promise<LoadedRouteAuditRun>} Route results and final tokens.
 */
async function runLoadedRouteAudits({
  apiUrl,
  baseUrl,
  cdp,
  eventState,
  outputDir,
  refreshCookieName,
  routes,
  tokens,
}) {
  /** @type {RouteResult[]} */
  const results = [];
  let currentTokens = tokens;

  for (const route of routes) {
    eventState.currentSlug = route.slug;
    const routeConsoleStart = eventState.consoleErrors.length;
    const routeRequestStart = eventState.failedRequests.length;

    // eslint-disable-next-line no-await-in-loop -- Tokens intentionally rotate before each route.
    currentTokens = await refreshAuditTokens(currentTokens, {
      apiUrl,
      refreshCookieName,
    });
    writeAuditTokens(currentTokens);

    // eslint-disable-next-line no-await-in-loop -- Browser audits must run route-by-route in one session.
    const routeResult = await auditRoute({
      apiUrl,
      baseUrl,
      cdp,
      outputDir,
      refreshCookieName,
      route,
      tokens: currentTokens,
    }).catch((error) => createRouteAuditFailure(route, error));

    const result = buildRouteResult({
      eventState,
      route,
      routeConsoleStart,
      routeRequestStart,
      routeResult,
    });

    results.push(result);
    writeJson(path.join(outputDir, `${route.slug}.json`), result);
    writeRouteAuditProgress(route, result);
  }

  return { results, tokens: currentTokens };
}

/**
 * Builds a route result for a failed route audit.
 *
 * @param {AuditRoute} route Route under audit.
 * @param {unknown} error Route failure.
 * @returns {RouteAuditResult} Fallback route result.
 */
function createRouteAuditFailure(route, error) {
  return {
    slug: route.slug,
    screenshotName: "",
    ...routeResultFallback(route, error),
  };
}

/**
 * Adds route-scoped diagnostics to a route result.
 *
 * @param {{ eventState: AuditEventState; route: AuditRoute; routeConsoleStart: number; routeRequestStart: number; routeResult: RouteAuditResult }} options Result options.
 * @returns {RouteResult} Route result with diagnostics.
 */
function buildRouteResult({
  eventState,
  route,
  routeConsoleStart,
  routeRequestStart,
  routeResult,
}) {
  const routeFailedRequests = getRouteDiagnosticTexts(
    eventState.failedRequests,
    route.slug,
    routeRequestStart,
  );

  return {
    ...routeResult,
    consoleErrors: getRouteDiagnosticTexts(
      eventState.consoleErrors,
      route.slug,
      routeConsoleStart,
    ),
    expectedFailedRequests: routeFailedRequests.filter((text) =>
      isExpectedFailedRequest(route, text),
    ),
    failedRequests: routeFailedRequests.filter(
      (text) => !isExpectedFailedRequest(route, text),
    ),
  };
}

/**
 * Selects diagnostic text captured after a route started.
 *
 * @param {DiagnosticEntry[]} entries Diagnostic entries.
 * @param {string} slug Route slug.
 * @param {number} startIndex First entry index for this route.
 * @returns {string[]} Route diagnostic text.
 */
function getRouteDiagnosticTexts(entries, slug, startIndex) {
  return entries
    .slice(startIndex)
    .filter((entry) => entry.slug === slug)
    .map((entry) => entry.text);
}

/**
 * Logs one route audit progress line.
 *
 * @param {AuditRoute} route Route under audit.
 * @param {RouteResult} result Route result.
 */
function writeRouteAuditProgress(route, result) {
  writeOutput(
    `ROUTE ${route.slug} ${route.path} -> ${result.finalPath} text=${String(result.textLength)} blocked=${String(result.routeBlocked)}`,
  );
}

/**
 * Writes the final JSON and markdown reports.
 *
 * @param {{ baseUrl: string; outputDir: string; refreshCookieName: string; results: RouteResult[]; tokens: AuditTokens }} options Report options.
 */
function writeLoadedRouteAuditReport({
  baseUrl,
  outputDir,
  refreshCookieName,
  results,
  tokens,
}) {
  writeJson(path.join(outputDir, "loaded-route-audit.json"), results);
  writeText(
    path.join(outputDir, "index.md"),
    toMarkdown(results, {
      baseUrl,
      refreshCookieName,
      hasRefreshToken: Boolean(tokens.refreshToken),
    }),
  );
  writeOutput(`DONE loaded route audit: ${outputDir}`);
}

/**
 * Cleans up browser state and audit bootstrap tokens.
 *
 * @param {CdpClient | undefined} cdp CDP client.
 * @param {ChildProcess} chrome Browser process.
 */
function cleanupLoadedAudit(cdp, chrome) {
  removeAuditTokens();

  if (cdp?.socket) {
    cdp.socket.close();
  }

  chrome.kill();
}

main().catch((error) => {
  removeAuditTokens();
  writeError(error);
  process.exit(1);
});
