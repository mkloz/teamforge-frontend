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
 *
 * @typedef {object} RouteResult
 * @property {string} finalPath Final browser pathname.
 * @property {boolean} routeBlocked Whether the route was redirected to login.
 * @property {boolean} stillLoading Whether the app still displayed a loading state.
 * @property {number} textLength Visible body text length.
 * @property {string[]} h1s H1 text values.
 * @property {number} mainCount Number of main landmarks.
 * @property {string[]} consoleErrors Route-scoped console warnings/errors.
 * @property {string[]} expectedFailedRequests Route-scoped expected failed/error requests.
 * @property {string[]} failedRequests Route-scoped failed/error requests.
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

  while (Date.now() - startedAt < timeoutMs) {
    try {
      // eslint-disable-next-line no-await-in-loop -- Polling waits for Chrome's debug endpoint.
      const response = await fetch(url, { cache: "no-store" });

      if (response.ok) {
        // eslint-disable-next-line no-await-in-loop -- Chrome target discovery depends on the current poll response.
        const responseText = await response.text();
        const parsedTargets = chromeTargetListSchema.safeParse(
          JSON.parse(responseText),
        );

        if (parsedTargets.success) {
          return parsedTargets.data;
        }
      }
    } catch (error) {
      if (process.env.AUDIT_DEBUG === "true") {
        writeOutput(
          `WAIT ${url}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // eslint-disable-next-line no-await-in-loop -- Polling must stay sequential.
    await sleep(150);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

class CdpClient {
  /**
   * @param {WebSocket} socket Chrome DevTools Protocol websocket.
   */
  constructor(socket) {
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = socket;

    socket.addEventListener("message", (event) => {
      const parsedMessage = cdpMessageSchema.safeParse(
        JSON.parse(String(event.data)),
      );

      if (!parsedMessage.success) {
        return;
      }

      const message = parsedMessage.data;

      if (typeof message.id === "number") {
        const pending = this.pending.get(message.id);

        if (!pending) {
          return;
        }

        this.pending.delete(message.id);

        if (message.error) {
          pending.reject(new Error(message.error.message));
          return;
        }

        pending.resolve(message.result);
        return;
      }

      const handlers = this.listeners.get(message.method);

      if (handlers) {
        for (const handler of handlers) {
          handler(message.params ?? {});
        }
      }
    });
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
      const timeout = setTimeout(() => {
        off();
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      const off = this.on(method, (params) => {
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
 * @returns {Promise<unknown>} Last sampled route state.
 */
async function waitForRouteSettle(cdp, routePath) {
  const expression = `
(() => {
  const text = document.body?.innerText ?? "";
  const rootText = document.getElementById("root")?.innerText ?? "";
  const loading = /Loading page|Preparing TeamForge/.test(text);
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

  let lastValue = null;
  const startedAt = Date.now();

  while (Date.now() - startedAt < 12_000) {
    // eslint-disable-next-line no-await-in-loop -- Route settling is a sequential browser poll.
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    lastValue = result.result?.value ?? null;

    if (lastValue && !lastValue.loading && lastValue.rootTextLength > 20) {
      break;
    }

    // eslint-disable-next-line no-await-in-loop -- Route settling is a sequential browser poll.
    await sleep(300);
  }

  return lastValue;
}

/**
 * Collects a hydrated DOM snapshot for one route.
 *
 * @param {CdpClient} cdp CDP client.
 * @param {string} routePath Requested route path.
 * @returns {Promise<Record<string, unknown> | null>} Route DOM state.
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
    stillLoading: /Loading page|Preparing TeamForge/.test(text),
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

  return result.result?.value ?? null;
}

/**
 * Builds a failed route result when navigation or collection throws.
 *
 * @param {import("./routes.mjs").AuditRoute} route Route under audit.
 * @param {unknown} error Route failure.
 * @returns {Record<string, unknown>} Fallback route result.
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

  const details = results
    .map((result) => {
      const consoleErrors =
        result.consoleErrors.length === 0
          ? "None"
          : result.consoleErrors
              .slice(0, 8)
              .map((item) => `- ${item}`)
              .join("\n");
      const failedRequests =
        result.failedRequests.length === 0
          ? "None"
          : result.failedRequests
              .slice(0, 12)
              .map((item) => `- ${item}`)
              .join("\n");
      const expectedFailedRequests =
        result.expectedFailedRequests.length === 0
          ? "None"
          : result.expectedFailedRequests
              .slice(0, 8)
              .map((item) => `- ${item}`)
              .join("\n");
      const headings =
        result.headings.length === 0
          ? "None"
          : result.headings
              .map((heading) => `- ${heading.level}: ${heading.text}`)
              .join("\n");

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
    })
    .join("\n");

  return `# TeamForge Loaded Route Audit

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
 * Navigates to one route, captures DOM state, and saves a screenshot.
 *
 * @param {{ apiUrl: string; baseUrl: string; cdp: CdpClient; outputDir: string; refreshCookieName: string; route: import("./routes.mjs").AuditRoute; tokens: AuditTokens }} options Route audit options.
 * @returns {Promise<Record<string, unknown>>} Route result.
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
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });

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
 * Runs the authenticated loaded-state browser audit.
 *
 * @returns {Promise<void>}
 */
async function main() {
  loadAuditEnvFiles();

  const apiUrl = getApiUrl();
  const baseUrl = getAuditBaseUrl();
  const refreshCookieName = getRefreshCookieName();
  let tokens = await getAuditSession({ apiUrl, refreshCookieName });
  const routes = await resolveAuditRoutes({
    accessToken: tokens.accessToken,
    apiUrl,
  });
  const outputDir =
    process.env.LOADED_AUDIT_OUTPUT_DIR ??
    process.env.AUDIT_LOADED_OUTPUT_DIR ??
    path.join(cwd, "reports", `loaded-route-audit-${todayStamp()}`);
  const chromePath = findChrome();
  const debugPort = await getFreePort();
  const profileDir = path.join(cwd, "temp", "chrome-loaded-route-audit");
  const screenshotDir = path.join(outputDir, "screenshots");

  rmSync(profileDir, { recursive: true, force: true });
  mkdirSync(screenshotDir, { recursive: true });

  if (!tokens.refreshToken) {
    writeOutput(
      "WARN Login did not return a refresh token or refresh cookie; loaded audit will not rotate sessions.",
    );
  }

  const chrome = spawn(
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

  let cdp;

  try {
    cdp = await connectPage(debugPort);
    const consoleErrors = [];
    const failedRequests = [];
    let currentSlug = "startup";

    cdp.on("Runtime.consoleAPICalled", (event) => {
      if (event.type !== "error" && event.type !== "warning") {
        return;
      }

      const text = event.args
        ?.map((arg) => arg.value ?? arg.description ?? "")
        .join(" ")
        .trim();

      if (text) {
        consoleErrors.push({ slug: currentSlug, text });
      }
    });
    cdp.on("Runtime.exceptionThrown", (event) => {
      const text =
        event.exceptionDetails?.text ??
        event.exceptionDetails?.exception?.description ??
        "Runtime exception";
      consoleErrors.push({ slug: currentSlug, text });
    });
    cdp.on("Network.responseReceived", (event) => {
      const status = event.response?.status ?? 0;

      if (status >= 400) {
        failedRequests.push({
          slug: currentSlug,
          text: `${status} ${event.response.url}`,
        });
      }
    });
    cdp.on("Network.loadingFailed", (event) => {
      failedRequests.push({
        slug: currentSlug,
        text: `${event.errorText} ${event.blockedReason ?? ""}`.trim(),
      });
    });

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");

    const results = [];

    for (const route of routes) {
      currentSlug = route.slug;
      const routeConsoleStart = consoleErrors.length;
      const routeRequestStart = failedRequests.length;

      // eslint-disable-next-line no-await-in-loop -- Tokens intentionally rotate before each route.
      tokens = await refreshAuditTokens(tokens, {
        apiUrl,
        refreshCookieName,
      });
      writeAuditTokens(tokens);

      // eslint-disable-next-line no-await-in-loop -- Browser audits must run route-by-route in one session.
      const routeResult = await auditRoute({
        apiUrl,
        baseUrl,
        cdp,
        outputDir,
        refreshCookieName,
        route,
        tokens,
      }).catch((error) => ({
        slug: route.slug,
        screenshotName: "",
        ...routeResultFallback(route, error),
      }));

      const routeFailedRequests = failedRequests
        .slice(routeRequestStart)
        .filter((entry) => entry.slug === route.slug)
        .map((entry) => entry.text);
      const result = {
        ...routeResult,
        consoleErrors: consoleErrors
          .slice(routeConsoleStart)
          .filter((entry) => entry.slug === route.slug)
          .map((entry) => entry.text),
        expectedFailedRequests: routeFailedRequests.filter((text) =>
          isExpectedFailedRequest(route, text),
        ),
        failedRequests: routeFailedRequests.filter(
          (text) => !isExpectedFailedRequest(route, text),
        ),
      };

      results.push(result);
      writeJson(path.join(outputDir, `${route.slug}.json`), result);
      writeOutput(
        `ROUTE ${route.slug} ${route.path} -> ${String(result.finalPath)} text=${String(result.textLength)} blocked=${String(result.routeBlocked)}`,
      );
    }

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
  } finally {
    removeAuditTokens();

    if (cdp?.socket) {
      cdp.socket.close();
    }

    chrome.kill();
  }
}

main().catch((error) => {
  removeAuditTokens();
  writeError(error);
  process.exit(1);
});
