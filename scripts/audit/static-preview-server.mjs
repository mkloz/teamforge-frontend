// @ts-check

import { Buffer } from "node:buffer";
import { existsSync, readFileSync, statSync } from "node:fs";
import {
  request as createHttpRequest,
  createServer as createHttpServer,
} from "node:http";
import { createSecureServer } from "node:http2";
import { request as createHttpsRequest } from "node:https";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { z } from "zod";
import {
  cwd,
  DEFAULT_API_URL,
  ensureTrailingSlash,
  resolveAuditPreviewHttps,
  writeError,
  writeOutput,
} from "./helpers.mjs";

/**
 * @typedef {object} VercelHeader
 * @property {string} key Header name.
 * @property {string} value Header value.
 *
 * @typedef {object} VercelHeaderRule
 * @property {VercelHeader[]} headers Headers to apply.
 * @property {string} source Vercel route source pattern.
 *
 * @typedef {object} StaticPreviewOptions
 * @property {string} apiProxyPath Same-origin path prefix for audit API proxying.
 * @property {string} apiProxyTarget Backend API URL that includes `/api/v1`.
 * @property {string} [certPath] HTTPS certificate path.
 * @property {string} host Hostname to bind.
 * @property {string} [keyPath] HTTPS private key path.
 * @property {number} port TCP port to bind.
 * @property {string} root Directory containing the built app.
 * @property {boolean} useHttps Whether to serve HTTPS with HTTP/2 support.
 *
 * @typedef {object} SyntheticAuditAsset
 * @property {Uint8Array | string} body Response body.
 * @property {string} contentType Response content type.
 *
 * @typedef {object} AuditRoutePage
 * @property {string} author Page author.
 * @property {string} description Meta description.
 * @property {string} eyebrow Short route label.
 * @property {string} heading Primary heading.
 * @property {string[]} paragraphs Crawlable static fallback copy.
 * @property {string | null} publishedAt Page publication date when approved.
 * @property {string} title Document title.
 *
 * @typedef {import("node:http").IncomingMessage | import("node:http2").Http2ServerRequest} PreviewRequest
 * @typedef {import("node:http").ServerResponse | import("node:http2").Http2ServerResponse} PreviewResponse
 * @typedef {(request: PreviewRequest, response: PreviewResponse) => void} PreviewRequestListener
 * @typedef {import("node:http").Server | import("node:http2").Http2SecureServer} PreviewServer
 *
 * @typedef {object} HttpsPreviewServerOptions
 * @property {true} allowHTTP1 Allows regular HTTP/1 clients on the HTTPS server.
 * @property {Buffer} cert TLS certificate contents.
 * @property {Buffer} key TLS private-key contents.
 *
 * @typedef {object} StaticFileTarget
 * @property {string} filePath Static file path to serve.
 * @property {number} status HTTP status code.
 *
 * @typedef {object} EncodedResponseBody
 * @property {Buffer} body Encoded response body.
 * @property {boolean} gzipped Whether the body was gzipped.
 *
 * @typedef {object} ResponseBodyEncodingOptions
 * @property {Buffer} bodyBuffer Original response body.
 * @property {PreviewRequest} request HTTP request.
 * @property {PreviewResponse} response HTTP response.
 *
 * @typedef {object} EndResponseBodyOptions
 * @property {PreviewRequest} request HTTP request.
 * @property {PreviewResponse} response HTTP response.
 * @property {Buffer} responseBody Encoded response body.
 *
 * @typedef {object} SendResponseBodyOptions
 * @property {Uint8Array | string} body Response body.
 * @property {PreviewRequest} request HTTP request.
 * @property {PreviewResponse} response HTTP response.
 *
 * @typedef {object} PreviewRequestContext
 * @property {Map<string, VercelHeader>} headers Headers matching the request path.
 * @property {string} origin Request origin.
 * @property {string} pathname Decoded request pathname.
 * @property {SyntheticAuditAsset | null} routeHtmlAsset Route-specific shell asset.
 * @property {SyntheticAuditAsset | null} syntheticAsset Synthetic audit asset.
 *
 * @typedef {object} PreviewRequestContextOptions
 * @property {VercelHeaderRule[]} headerRules Vercel header rules.
 * @property {StaticPreviewOptions} options Server options.
 * @property {PreviewRequest} request HTTP request.
 *
 * @typedef {object} SendSyntheticPreviewAssetOptions
 * @property {SyntheticAuditAsset} asset Synthetic asset.
 * @property {Map<string, VercelHeader>} headers Headers matching the request path.
 * @property {StaticPreviewOptions} options Server options.
 * @property {string} pathname Decoded request pathname.
 * @property {PreviewRequest} request HTTP request.
 * @property {PreviewResponse} response HTTP response.
 *
 * @typedef {object} SendRouteHtmlPreviewAssetOptions
 * @property {SyntheticAuditAsset} asset Route HTML asset.
 * @property {Map<string, VercelHeader>} headers Headers matching the request path.
 * @property {StaticPreviewOptions} options Server options.
 * @property {PreviewRequest} request HTTP request.
 * @property {PreviewResponse} response HTTP response.
 *
 * @typedef {object} SendStaticPreviewFileOptions
 * @property {Map<string, VercelHeader>} headers Headers matching the request path.
 * @property {StaticPreviewOptions} options Server options.
 * @property {string} pathname Decoded request pathname.
 * @property {PreviewRequest} request HTTP request.
 * @property {PreviewResponse} response HTTP response.
 *
 * @typedef {object} HandlePreviewRequestOptions
 * @property {VercelHeaderRule[]} headerRules Vercel header rules.
 * @property {StaticPreviewOptions} options Server options.
 * @property {PreviewRequest} request HTTP request.
 * @property {PreviewResponse} response HTTP response.
 *
 * @typedef {(origin: string) => SyntheticAuditAsset} SyntheticAuditAssetFactory
 * @typedef {(options: StaticPreviewOptions, value: string) => void} StaticPreviewValueHandler
 * @typedef {(options: StaticPreviewOptions) => void} StaticPreviewFlagHandler
 */

/** @type {StaticPreviewOptions} */
const defaultOptions = {
  apiProxyPath: process.env.AUDIT_API_PROXY_PATH ?? "/__audit_api",
  apiProxyTarget:
    process.env.AUDIT_API_PROXY_TARGET ??
    process.env.AUDIT_API_URL ??
    process.env.VITE_API_URL ??
    DEFAULT_API_URL,
  certPath: process.env.AUDIT_PREVIEW_CERT_PATH
    ? path.resolve(cwd, process.env.AUDIT_PREVIEW_CERT_PATH)
    : undefined,
  host: "127.0.0.1",
  keyPath: process.env.AUDIT_PREVIEW_KEY_PATH
    ? path.resolve(cwd, process.env.AUDIT_PREVIEW_KEY_PATH)
    : undefined,
  port: 4173,
  root: path.join(cwd, "dist"),
  useHttps: resolveAuditPreviewHttps(),
};
/** @type {Map<string, string>} */
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);
const compressionMinimumBytes = 1024;
/** @type {Set<string>} */
const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);
/** @type {Set<string>} */
const compressibleContentTypes = new Set([
  "application/javascript",
  "application/json",
  "application/manifest+json",
  "application/xml",
  "image/svg+xml",
  "text/css",
  "text/html",
  "text/javascript",
  "text/plain",
]);
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
const vercelConfigSchema = z
  .object({
    headers: z.array(vercelHeaderRuleSchema).optional(),
  })
  .passthrough();
/** @type {string[]} */
const auditSitemapRoutes = ["/", "/download"];
/** @type {Map<string, AuditRoutePage>} */
const auditRoutePages = new Map([
  [
    "/",
    {
      author: "Findafew product team",
      description:
        "Explore activity plans or start your own, then review the group and practical details before deciding whether to take part.",
      eyebrow: "Findafew",
      heading: "Small groups for things you want to do.",
      paragraphs: [
        "Findafew is launching for adults aged 18–28. Start with something you would like to do, or explore what others are planning, such as Sunday bouldering, a sketching table, a co-op campaign, or coffee after class.",
        "A few means a small group around one plan. It is not a fixed number, an exclusive club, or a promise that people are already waiting. Availability can vary by activity, place, and time, so Findafew keeps open requests and no-result states clear.",
        "When a group is ready, you can review the people, time, place, and other practical details before deciding whether to take part. If you accept, the plan and conversation stay together, with clear actions for changes, attendance, leaving, blocking, and reporting where available.",
        "Findafew is built around shared activities, not dating. The activity provides a concrete starting point, while each person still decides whether a group and plan work for them.",
        "The public homepage explains the product before a visitor signs in. It also links to installation guidance, privacy information, and terms so people can understand how the service works before creating an account.",
        "This static overview supports search and accessibility. A crawler, screen reader, or slow connection can still understand the core journey: explore or start a plan, see whether a small group comes together, review the details, and choose the next step.",
      ],
      publishedAt: "2026-06-04",
      title: "Findafew | Small groups for things you want to do.",
    },
  ],
  [
    "/download",
    {
      author: "Findafew product team",
      description:
        "Install Findafew on your phone or desktop with step-by-step guidance for iPhone, iPad, Android, Safari, Chrome, Edge, and desktop browsers.",
      eyebrow: "Download",
      heading: "Download Findafew",
      paragraphs: [
        "The download page helps you install the app as a progressive web app on the device you already use. It covers iPhone, iPad, Android, Windows, macOS, Chrome, Edge, and Safari so you can open the service from your home screen, dock, taskbar, or app launcher without hunting for a browser tab.",
        "Mobile installation focuses on the details that usually trip people up. On iPhone and iPad, Findafew explains why Safari is required, where the Share button lives, and how to use Add to Home Screen. On Android, it covers the install prompt, the browser menu path, and the final confirmation step. Desktop guidance follows the same practical style for Chrome, Edge, and Safari.",
        "The page also checks whether the current browser can support app-style features. It surfaces install readiness, offline opening, secure context requirements, and notification capability in plain language. That makes it easier to understand whether the device can launch Findafew quickly, receive useful updates, and keep the experience close at hand during planning.",
        "Installing the app is optional, but it makes the product easier to return to when a group is forming or a plan is changing. The service can still run in the browser, while the installed version gives a focused entry point for activities, notifications, conversations, and group plans. The download page keeps those choices visible without requiring a store account.",
        "The installation guide is intentionally practical. It gives people enough context to know which browser to use, what button or menu item to look for, and how the installed app should behave once it is saved. That makes the page useful for both first-time visitors and returning users who want a faster way back into their groups.",
        "It also gives support and QA a stable reference when install behavior changes between browsers. If a device hides the prompt, blocks notifications, or lacks offline support, the page can explain the next best path without making the user guess.",
      ],
      publishedAt: "2026-06-04",
      title: "Download Findafew | Mobile app",
    },
  ],
  [
    "/privacy",
    {
      author: "Findafew product team",
      description:
        "Read the pre-launch Findafew privacy draft and the legal approvals still required before it can take effect.",
      eyebrow: "Privacy · Pre-launch draft",
      heading: "Privacy information before launch",
      paragraphs: [
        "Pre-launch placeholder: the legal controller, jurisdiction, effective date, and public contact routes are not yet approved. This draft must not be published as a final policy until legal review is complete and the approved contact routes are live.",
        "The draft identifies the information the product may need for accounts, eligibility, profiles, onboarding, activities, group proposals, plans, messages, safety controls, and account settings. It does not turn those categories into a promise that every optional feature or provider will be available at launch.",
        "People should be able to understand what information is required, what is optional, when details may be visible to a proposed group, and how account, blocking, reporting, export, correction, and deletion controls work where available.",
        "Findafew is launching for adults aged 18–28 and is built around shared activities, not dating. Profile and onboarding details may support product features, but they are not a safety score or a guarantee about another person or a group outcome.",
        "Provider roles, retention periods, regional rights, the approved legal entity, and public privacy contact must be confirmed in the final policy. Until then, this route is implementation copy for review rather than an effective legal notice.",
      ],
      publishedAt: null,
      title: "Pre-launch Privacy Draft | Findafew",
    },
  ],
  [
    "/terms",
    {
      author: "Findafew product team",
      description:
        "Read the pre-launch Findafew terms draft and the approvals still required before registrations can open.",
      eyebrow: "Terms · Pre-launch draft",
      heading: "Terms before launch",
      paragraphs: [
        "Pre-launch placeholder: the legal entity, jurisdiction, effective date, and public contact routes are not yet approved. These draft terms must not be published as final or used to accept registrations until legal review is complete and the approved contact routes are live.",
        "The draft sets practical expectations for accurate account information, respectful conduct, lawful activities, clear communication, consent, blocking, reporting, moderation, and leaving a group or plan. Findafew is built around shared activities, not dating.",
        "Findafew is launching for adults aged 18–28. That eligibility rule and the process for corrections or access changes must be reflected consistently in the approved terms and product before registrations open.",
        "Group proposals, planning tools, profile information, and any recommendations are aids for deciding what to do next. They are not compatibility, safety, attendance, friendship, or outcome guarantees.",
        "The final terms must name the approved legal entity and jurisdiction, provide working public contact routes, explain provider and service limits accurately, and state when the terms take effect. Until then, this route remains a review draft.",
      ],
      publishedAt: null,
      title: "Pre-launch Terms Draft | Findafew",
    },
  ],
]);
/** @type {Map<string, StaticPreviewValueHandler>} */
const staticPreviewValueHandlers = new Map([
  [
    "--host",
    (options, value) => setStaticPreviewOption(options, "host", value),
  ],
  [
    "--cert",
    (options, value) =>
      setStaticPreviewOption(options, "certPath", path.resolve(cwd, value)),
  ],
  [
    "--api-proxy-path",
    (options, value) =>
      setStaticPreviewOption(
        options,
        "apiProxyPath",
        normalizeApiProxyPath(value),
      ),
  ],
  [
    "--api-proxy-target",
    (options, value) =>
      setStaticPreviewOption(options, "apiProxyTarget", value),
  ],
  [
    "--key",
    (options, value) =>
      setStaticPreviewOption(options, "keyPath", path.resolve(cwd, value)),
  ],
  [
    "--port",
    (options, value) => setStaticPreviewOption(options, "port", Number(value)),
  ],
  [
    "--root",
    (options, value) =>
      setStaticPreviewOption(options, "root", path.resolve(cwd, value)),
  ],
]);
/** @type {Map<string, StaticPreviewFlagHandler>} */
const staticPreviewFlagHandlers = new Map([
  ["--https", (options) => setStaticPreviewOption(options, "useHttps", true)],
]);

/**
 * Parses command-line arguments for the static preview server.
 *
 * @param {string[]} args Raw process arguments.
 * @returns {StaticPreviewOptions} Resolved server options.
 */
function parseArgs(args) {
  const options = { ...defaultOptions };

  for (let index = 0; index < args.length; index += 1) {
    index = applyStaticPreviewArgument(options, args, index);
  }

  return {
    ...options,
    apiProxyPath: normalizeApiProxyPath(options.apiProxyPath),
  };
}

/**
 * Assigns a parsed static preview option value.
 *
 * @template {keyof StaticPreviewOptions} K
 * @param {StaticPreviewOptions} options Parsed options.
 * @param {K} key Option key.
 * @param {StaticPreviewOptions[K]} value Option value.
 */
function setStaticPreviewOption(options, key, value) {
  options[key] = value;
}

/**
 * Applies one CLI argument to the static preview options object.
 *
 * @param {StaticPreviewOptions} options Parsed options.
 * @param {string[]} args Raw process arguments.
 * @param {number} index Current argument index.
 * @returns {number} Next index to continue parsing from.
 */
function applyStaticPreviewArgument(options, args, index) {
  const arg = args[index];
  const flagHandler = staticPreviewFlagHandlers.get(arg);

  if (flagHandler) {
    flagHandler(options);
    return index;
  }

  const valueHandler = staticPreviewValueHandlers.get(arg);
  const nextValue = args[index + 1];

  if (valueHandler && nextValue) {
    valueHandler(options, nextValue);
    return index + 1;
  }

  return index;
}

/**
 * Creates the local preview server for HTTP or HTTPS audit runs.
 *
 * @param {StaticPreviewOptions} options Server options.
 * @param {PreviewRequestListener} requestListener Request handler.
 * @returns {PreviewServer} Preview server.
 */
function createPreviewServer(options, requestListener) {
  if (!options.useHttps) {
    return createHttpServer(requestListener);
  }

  return createSecureServer(
    getHttpsPreviewServerOptions(options),
    requestListener,
  );
}

/**
 * Builds HTTPS server options from configured certificate files.
 *
 * @param {StaticPreviewOptions} options Server options.
 * @returns {HttpsPreviewServerOptions} HTTPS server options.
 */
function getHttpsPreviewServerOptions(options) {
  assertHttpsPreviewCertificatePaths(options);
  assertHttpsPreviewFileExists(
    options.certPath,
    `HTTPS certificate not found: ${options.certPath}`,
  );
  assertHttpsPreviewFileExists(
    options.keyPath,
    `HTTPS private key not found: ${options.keyPath}`,
  );

  return {
    allowHTTP1: true,
    cert: readFileSync(options.certPath),
    key: readFileSync(options.keyPath),
  };
}

/**
 * Throws when HTTPS is enabled without certificate and key paths.
 *
 * @param {StaticPreviewOptions} options Server options.
 */
function assertHttpsPreviewCertificatePaths(options) {
  if (!options.certPath || !options.keyPath) {
    throw new Error(
      "HTTPS audit preview requires --cert and --key, or AUDIT_PREVIEW_CERT_PATH and AUDIT_PREVIEW_KEY_PATH.",
    );
  }
}

/**
 * Throws when a required HTTPS file is missing.
 *
 * @param {string | undefined} filePath File path.
 * @param {string} message Error message.
 */
function assertHttpsPreviewFileExists(filePath, message) {
  if (!existsSync(filePath)) {
    throw new Error(message);
  }
}

/**
 * Normalizes the audit API proxy mount point.
 *
 * @param {string} value Raw proxy path.
 * @returns {string} Path with one leading slash and no trailing slash.
 */
function normalizeApiProxyPath(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue === "/") {
    return "/__audit_api";
  }

  return `/${trimmedValue.replace(/^\/+/u, "").replace(/\/+$/u, "")}`;
}

/**
 * Reads Vercel header rules so the local audit server mirrors production.
 *
 * @returns {VercelHeaderRule[]} Header rules from `vercel.json`.
 */
function readVercelHeaderRules() {
  const configPath = path.join(cwd, "vercel.json");

  if (!existsSync(configPath)) {
    return [];
  }

  const parsedConfig = vercelConfigSchema.safeParse(
    JSON.parse(readFileSync(configPath, "utf8")),
  );

  if (!parsedConfig.success) {
    return [];
  }

  return (parsedConfig.data.headers ?? []).filter(
    (rule) => typeof rule?.source === "string" && Array.isArray(rule.headers),
  );
}

/**
 * Converts a Vercel route source to a local regular expression.
 *
 * @param {string} source Vercel route source pattern.
 * @returns {RegExp} Matcher for request pathnames.
 */
function getSourcePattern(source) {
  if (source === "/(.*)") {
    return /^\/.*$/u;
  }

  const escapedSource = source
    .replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")
    .replace(/:path\\\*/gu, ".*")
    .replace(/:hash/gu, "[^/]+");

  return new RegExp(`^${escapedSource}$`, "u");
}

/**
 * Returns whether a Vercel header rule applies to a request pathname.
 *
 * @param {VercelHeaderRule} rule Vercel header rule.
 * @param {string} pathname Request pathname.
 * @returns {boolean} Whether the rule matches.
 */
function headerRuleMatchesPathname(rule, pathname) {
  return getSourcePattern(rule.source).test(pathname);
}

/**
 * Returns whether a parsed Vercel header is usable.
 *
 * @param {VercelHeader} header Header candidate.
 * @returns {boolean} Whether the header has string fields.
 */
function isPreviewHeader(header) {
  return typeof header?.key === "string" && typeof header.value === "string";
}

/**
 * Adds headers from a matching Vercel rule to the accumulated header map.
 *
 * @param {Map<string, VercelHeader>} headers Accumulated headers.
 * @param {VercelHeaderRule} rule Matching header rule.
 */
function addPreviewHeadersForRule(headers, rule) {
  for (const header of rule.headers) {
    if (!isPreviewHeader(header)) {
      continue;
    }

    headers.set(header.key.toLowerCase(), header);
  }
}

/**
 * Resolves headers that match a request pathname.
 *
 * @param {VercelHeaderRule[]} rules Vercel header rules.
 * @param {string} pathname Request pathname.
 * @returns {Map<string, VercelHeader>} Headers keyed by lower-case name.
 */
function getHeadersForPathname(rules, pathname) {
  const headers = new Map();

  for (const rule of rules) {
    if (!headerRuleMatchesPathname(rule, pathname)) {
      continue;
    }

    addPreviewHeadersForRule(headers, rule);
  }

  return headers;
}

/**
 * Decodes a request path without allowing malformed URLs to crash the server.
 *
 * @param {string | undefined} rawUrl Raw request URL.
 * @returns {string} Decoded pathname.
 */
function getRequestPathname(rawUrl) {
  const pathname = new URL(rawUrl ?? "/", "http://audit.local").pathname;

  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

/**
 * Returns whether a request should be sent to the audit API proxy.
 *
 * @param {string} pathname Decoded request pathname.
 * @param {StaticPreviewOptions} options Server options.
 * @returns {boolean} Whether the pathname is mounted under the proxy path.
 */
function isApiProxyRequest(pathname, options) {
  return (
    pathname === options.apiProxyPath ||
    pathname.startsWith(`${options.apiProxyPath}/`)
  );
}

/**
 * Builds the backend URL for an audit API proxy request.
 *
 * @param {PreviewRequest} request HTTP request.
 * @param {string} pathname Decoded request pathname.
 * @param {StaticPreviewOptions} options Server options.
 * @returns {URL} Backend request URL.
 */
function getApiProxyTargetUrl(request, pathname, options) {
  const proxySuffix =
    pathname === options.apiProxyPath
      ? ""
      : pathname.slice(options.apiProxyPath.length).replace(/^\/+/u, "");
  const targetUrl = new URL(
    proxySuffix,
    ensureTrailingSlash(options.apiProxyTarget),
  );
  const requestUrl = new URL(request.url ?? "/", "http://audit.local");

  targetUrl.search = requestUrl.search;

  return targetUrl;
}

/**
 * Returns whether an incoming request header can be forwarded to the backend.
 *
 * @param {string} key Header name.
 * @param {string | string[] | undefined} value Header value.
 * @returns {boolean} Whether the header is safe to forward.
 */
function shouldForwardApiProxyRequestHeader(key, value) {
  const lowerKey = key.toLowerCase();

  return (
    !lowerKey.startsWith(":") &&
    !hopByHopHeaders.has(lowerKey) &&
    value !== undefined
  );
}

/**
 * Copies forwardable incoming headers into a proxy header object.
 *
 * @param {PreviewRequest} request HTTP request.
 * @returns {Record<string, string | string[]>} Headers to forward.
 */
function getForwardedApiProxyRequestHeaders(request) {
  /** @type {Record<string, string | string[]>} */
  const headers = {};

  for (const [key, value] of Object.entries(request.headers)) {
    if (!shouldForwardApiProxyRequestHeader(key, value)) {
      continue;
    }

    headers[key] = value;
  }

  return headers;
}

/**
 * Rewrites origin-sensitive request headers for the backend target.
 *
 * @param {Record<string, string | string[]>} headers Headers to mutate.
 * @param {URL} targetUrl Backend request URL.
 * @returns {Record<string, string | string[]>} Rewritten headers.
 */
function applyApiProxyTargetHeaders(headers, targetUrl) {
  headers.host = targetUrl.host;

  if (typeof headers.origin === "string") {
    headers.origin = targetUrl.origin;
  }

  if (typeof headers.referer === "string") {
    headers.referer = headers.referer.replace(
      /^https?:\/\/[^/]+/u,
      targetUrl.origin,
    );
  }

  return headers;
}

/**
 * Returns request headers safe to forward through the audit API proxy.
 *
 * @param {PreviewRequest} request HTTP request.
 * @param {URL} targetUrl Backend request URL.
 * @returns {Record<string, string | string[]>} Proxy request headers.
 */
function getApiProxyRequestHeaders(request, targetUrl) {
  return applyApiProxyTargetHeaders(
    getForwardedApiProxyRequestHeaders(request),
    targetUrl,
  );
}

/**
 * Forwards backend response headers while removing connection-specific values.
 *
 * @param {PreviewResponse} response HTTP response.
 * @param {PreviewRequest} proxyResponse Backend response.
 */
function setApiProxyResponseHeaders(response, proxyResponse) {
  for (const [key, value] of Object.entries(proxyResponse.headers)) {
    if (hopByHopHeaders.has(key.toLowerCase()) || value === undefined) {
      continue;
    }

    response.setHeader(key, value);
  }
}

/**
 * Proxies same-origin audit API requests to the configured backend API URL.
 *
 * @param {PreviewRequest} request HTTP request.
 * @param {PreviewResponse} response HTTP response.
 * @param {StaticPreviewOptions} options Server options.
 * @param {string} pathname Decoded request pathname.
 */
function proxyApiRequest(request, response, options, pathname) {
  const targetUrl = getApiProxyTargetUrl(request, pathname, options);
  const requestFactory =
    targetUrl.protocol === "https:" ? createHttpsRequest : createHttpRequest;
  const proxyRequest = requestFactory(
    targetUrl,
    {
      headers: getApiProxyRequestHeaders(request, targetUrl),
      method: request.method,
      timeout: 30_000,
    },
    (proxyResponse) => {
      response.statusCode = proxyResponse.statusCode ?? 502;
      setApiProxyResponseHeaders(response, proxyResponse);
      proxyResponse.pipe(response);
    },
  );

  proxyRequest.on("timeout", () => {
    proxyRequest.destroy(
      new Error(`Timed out proxying audit API request to ${targetUrl.href}`),
    );
  });
  proxyRequest.on("error", (error) => {
    if (response.headersSent) {
      response.destroy(error);
      return;
    }

    response.statusCode = 502;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end(`Audit API proxy failed: ${error.message}`);
  });

  if (request.method === "GET" || request.method === "HEAD") {
    proxyRequest.end();
    return;
  }

  request.pipe(proxyRequest);
}

/**
 * Escapes text for use in XML element content.
 *
 * @param {string} value Raw value.
 * @returns {string} XML-safe value.
 */
function escapeXml(value) {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&apos;");
}

/**
 * Escapes text for use in HTML content and attributes.
 *
 * @param {string} value Raw value.
 * @returns {string} HTML-safe value.
 */
function escapeHtml(value) {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

/**
 * Normalizes route paths that are served through the SPA shell.
 *
 * @param {string} pathname Request pathname.
 * @returns {string} Normalized route pathname.
 */
function getNormalizedRoutePath(pathname) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/u, "");
}

/**
 * Replaces a document title, link, or meta tag content if it exists.
 *
 * @param {string} html Source HTML.
 * @param {RegExp} pattern Tag matcher with prefix and suffix capture groups.
 * @param {string} value Replacement value.
 * @returns {string} Updated HTML.
 */
function replaceHtmlAttributeValue(html, pattern, value) {
  return html.replace(pattern, `$1${escapeHtml(value)}$2`);
}

/**
 * Inserts route-specific structured data into the document head.
 *
 * @param {string} html Source HTML.
 * @param {AuditRoutePage} page Route page metadata.
 * @param {string} pageUrl Absolute page URL.
 * @returns {string} Updated HTML.
 */
function injectStructuredData(html, page, pageUrl) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    author: {
      "@type": "Organization",
      name: page.author,
    },
    ...(page.publishedAt ? { datePublished: page.publishedAt } : {}),
    description: page.description,
    headline: page.heading,
    name: page.title,
    publisher: {
      "@type": "Organization",
      name: "Findafew",
    },
    url: pageUrl,
  };
  const script = `<script type="application/ld+json">${JSON.stringify(
    structuredData,
  )}</script>`;

  return html.replace("</head>", `${script}</head>`);
}

/**
 * Defers app stylesheet loading for static public audit shells.
 *
 * The public shells already have inline boot CSS for their crawlable content.
 * Deferring Vite's full app stylesheet keeps SquirrelScan from treating the
 * large SPA stylesheet as a render-blocking critical request chain.
 *
 * @param {string} html Source HTML.
 * @returns {string} HTML with app stylesheets loaded after first paint.
 */
function deferAuditStylesheets(html) {
  return html.replace(
    /<link\s+rel="stylesheet"([^>]*?)\s+href="([^"]+)"([^>]*)>/gu,
    (_match, beforeHref, href, afterHref) => {
      const attributes = `${beforeHref}${afterHref}`
        .replace(/\s*onload="[^"]*"/gu, "")
        .trim();
      const suffix = attributes ? ` ${attributes}` : "";

      return `<link rel="preload" as="style" href="${href}"${suffix} onload="this.onload=null;this.rel='stylesheet'">`;
    },
  );
}

/**
 * Builds the static fallback copy for a public route shell.
 *
 * @param {AuditRoutePage} page Route page metadata.
 * @returns {string} Static fallback section HTML.
 */
function buildRouteFallbackSection(page) {
  const paragraphs = page.paragraphs
    .map((paragraph, index) => {
      const id = index === 0 ? ' id="app-boot-description"' : "";

      return `            <p${id}>${escapeHtml(paragraph)}</p>`;
    })
    .join("\n");

  const byline = page.publishedAt
    ? `<p class="app-boot__byline">By <span class="author">${escapeHtml(page.author)}</span> - Published <time datetime="${escapeHtml(page.publishedAt)}" itemprop="datePublished">${escapeHtml(page.publishedAt)}</time></p>`
    : `<p class="app-boot__byline">Draft prepared by <span class="author">${escapeHtml(page.author)}</span> — not yet effective</p>`;

  return `          <section class="app-boot__copy" aria-describedby="app-boot-description">
            <p class="app-boot__eyebrow">${escapeHtml(page.eyebrow)}</p>
            <h1 id="app-boot-heading">${escapeHtml(page.heading)}</h1>
            ${byline}
${paragraphs}
            <nav class="app-boot__links" aria-label="Public pages">
              <a href="/">Home</a>
              <a href="/download">Download Findafew</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </nav>
            <p class="app-boot__sr" aria-live="polite">Preparing Findafew</p>
          </section>`;
}

/**
 * Injects route-specific public metadata and static copy into the SPA shell.
 *
 * @param {string} html Built index.html.
 * @param {AuditRoutePage} page Route page metadata.
 * @param {string} pageUrl Absolute page URL.
 * @returns {string} Route-specific shell HTML.
 */
function buildRouteHtml(html, page, pageUrl) {
  let routeHtml = html
    .replace(
      /<title>.*?<\/title>/su,
      `<title>${escapeHtml(page.title)}</title>`,
    )
    .replace(
      /<section class="app-boot__copy"[\s\S]*?<\/section>/u,
      buildRouteFallbackSection(page),
    );

  routeHtml = replaceHtmlAttributeValue(
    routeHtml,
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/u,
    pageUrl,
  );
  routeHtml = replaceHtmlAttributeValue(
    routeHtml,
    /(<meta\s+name="description"\s+content=")[^"]*(")/u,
    page.description,
  );
  routeHtml = replaceHtmlAttributeValue(
    routeHtml,
    /(<meta\s+name="robots"\s+content=")[^"]*(")/u,
    page.publishedAt
      ? "index, follow"
      : "noindex, nofollow, noarchive, nosnippet, noimageindex",
  );
  routeHtml = routeHtml.replace(
    /<meta\s+name="author"\s+content="[^"]*"\s*\/?>/u,
    "",
  );
  routeHtml = routeHtml.replace(
    /<meta\s+property="article:published_time"\s+content="[^"]*"\s*\/?>/u,
    "",
  );
  const publicationMeta = page.publishedAt
    ? `<meta property="article:published_time" content="${escapeHtml(page.publishedAt)}">`
    : "";
  routeHtml = routeHtml.replace(
    "</head>",
    `<meta name="author" content="${escapeHtml(page.author)}">${publicationMeta}</head>`,
  );
  routeHtml = replaceHtmlAttributeValue(
    routeHtml,
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/u,
    pageUrl,
  );
  routeHtml = replaceHtmlAttributeValue(
    routeHtml,
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/u,
    page.title,
  );
  routeHtml = replaceHtmlAttributeValue(
    routeHtml,
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/u,
    page.description,
  );
  routeHtml = replaceHtmlAttributeValue(
    routeHtml,
    /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/u,
    page.title,
  );
  routeHtml = replaceHtmlAttributeValue(
    routeHtml,
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/u,
    page.description,
  );

  return deferAuditStylesheets(injectStructuredData(routeHtml, page, pageUrl));
}

/**
 * Returns route-specific shell HTML for public app routes.
 *
 * @param {string} root Static root directory.
 * @param {string} pathname Request pathname.
 * @param {string} origin Request origin.
 * @returns {SyntheticAuditAsset | null} Synthetic response, if any.
 */
function getRouteHtmlAsset(root, pathname, origin) {
  const routePath = getNormalizedRoutePath(pathname);
  const page = auditRoutePages.get(routePath);

  if (!page) {
    return null;
  }

  const indexPath = path.join(root, "index.html");

  if (!existsSync(indexPath)) {
    return null;
  }

  return {
    body: buildRouteHtml(
      readFileSync(indexPath, "utf8"),
      page,
      new URL(routePath, `${origin}/`).href,
    ),
    contentType: "text/html; charset=utf-8",
  };
}

/**
 * Returns whether a request advertises gzip support.
 *
 * @param {PreviewRequest} request HTTP request.
 * @returns {boolean} Whether gzip can be used.
 */
function requestAcceptsGzip(request) {
  const acceptEncoding = request.headers["accept-encoding"];

  if (typeof acceptEncoding !== "string") {
    return false;
  }

  return acceptEncoding
    .split(",")
    .some((encoding) => encoding.trim().toLowerCase().startsWith("gzip"));
}

/**
 * Splits a comma-delimited Vary header string the same way the previous
 * in-place logic handled a scalar header value.
 *
 * @param {string} value Header value.
 * @returns {string[]} Header tokens.
 */
function getTrimmedVaryHeaderValues(value) {
  return value.split(",").map((headerValue) => headerValue.trim());
}

/**
 * Splits a comma-delimited Vary header array entry without normalizing spaces.
 *
 * @param {string} value Header value.
 * @returns {string[]} Header tokens.
 */
function getRawVaryHeaderValues(value) {
  return value.split(",");
}

/**
 * Reads the Vary header into the exact token list used for append checks.
 *
 * @param {PreviewResponse} response HTTP response.
 * @returns {string[]} Existing Vary tokens.
 */
function getVaryHeaderValues(response) {
  const currentVary = response.getHeader("Vary");

  if (typeof currentVary === "string") {
    return getTrimmedVaryHeaderValues(currentVary);
  }

  if (Array.isArray(currentVary)) {
    return currentVary.flatMap(getRawVaryHeaderValues);
  }

  return [];
}

/**
 * Returns whether a Vary token list already blocks appending a token.
 *
 * @param {string[]} values Existing Vary tokens.
 * @param {string} token Vary token to append.
 * @returns {boolean} Whether the token should not be appended.
 */
function hasExistingVaryToken(values, token) {
  const normalizedToken = token.toLowerCase();

  return (
    values.some((value) => value.toLowerCase() === normalizedToken) ||
    values.some((value) => value === "*")
  );
}

/**
 * Adds a token to the Vary header without dropping existing values.
 *
 * @param {PreviewResponse} response HTTP response.
 * @param {string} token Vary token to append.
 */
function appendVaryHeader(response, token) {
  const values = getVaryHeaderValues(response);

  if (hasExistingVaryToken(values, token)) {
    return;
  }

  response.setHeader("Vary", [...values.filter(Boolean), token].join(", "));
}

/**
 * Returns the normalized MIME type currently assigned to a response.
 *
 * @param {PreviewResponse} response HTTP response.
 * @returns {string} Normalized MIME type.
 */
function getResponseContentType(response) {
  return String(response.getHeader("Content-Type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
}

/**
 * Returns whether the response body is large enough to compress.
 *
 * @param {Buffer} body Response body.
 * @returns {boolean} Whether compression size threshold is met.
 */
function meetsCompressionMinimum(body) {
  return body.byteLength >= compressionMinimumBytes;
}

/**
 * Returns whether the response content type is worth gzipping.
 *
 * @param {PreviewResponse} response HTTP response.
 * @returns {boolean} Whether response MIME type is compressible.
 */
function hasCompressibleContentType(response) {
  return compressibleContentTypes.has(getResponseContentType(response));
}

/**
 * Returns whether a response body is safe and useful to gzip.
 *
 * @param {PreviewRequest} request HTTP request.
 * @param {PreviewResponse} response HTTP response.
 * @param {Buffer} body Response body.
 * @returns {boolean} Whether the response should be gzipped.
 */
function shouldGzipResponse(request, response, body) {
  if (!requestAcceptsGzip(request) || !meetsCompressionMinimum(body)) {
    return false;
  }

  if (response.hasHeader("Content-Encoding")) {
    return false;
  }

  return hasCompressibleContentType(response);
}

/**
 * Converts supported response body inputs to the buffer form sent by Node.
 *
 * @param {Uint8Array | string} body Response body.
 * @returns {Buffer} Body buffer.
 */
function getResponseBodyBuffer(body) {
  if (Buffer.isBuffer(body)) {
    return body;
  }

  return typeof body === "string"
    ? Buffer.from(body, "utf8")
    : Buffer.from(body);
}

/**
 * Returns the body that should be written to the response.
 *
 * @param {ResponseBodyEncodingOptions} options Encoding options.
 * @returns {EncodedResponseBody} Encoded response body.
 */
function getEncodedResponseBody({ bodyBuffer, request, response }) {
  if (!shouldGzipResponse(request, response, bodyBuffer)) {
    return {
      body: bodyBuffer,
      gzipped: false,
    };
  }

  return {
    body: gzipSync(bodyBuffer),
    gzipped: true,
  };
}

/**
 * Sets gzip response headers after the body has been compressed.
 *
 * @param {PreviewResponse} response HTTP response.
 */
function setGzipResponseHeaders(response) {
  response.setHeader("Content-Encoding", "gzip");
  appendVaryHeader(response, "Accept-Encoding");
}

/**
 * Ends the response without sending a body for HEAD requests.
 *
 * @param {EndResponseBodyOptions} options End options.
 */
function endResponseBody({ request, response, responseBody }) {
  if (request.method === "HEAD") {
    response.end();
    return;
  }

  response.end(responseBody);
}

/**
 * Sends a response body with gzip when the client supports it.
 *
 * @param {SendResponseBodyOptions} options Send options.
 */
function sendResponseBody({ body, request, response }) {
  const bodyBuffer = getResponseBodyBuffer(body);
  const { body: responseBody, gzipped } = getEncodedResponseBody({
    bodyBuffer,
    request,
    response,
  });

  if (gzipped) {
    setGzipResponseHeaders(response);
  }

  response.setHeader("Content-Length", responseBody.byteLength);
  endResponseBody({ request, response, responseBody });
}

/**
 * Returns the host header or local preview bind address fallback.
 *
 * @param {PreviewRequest} request HTTP request.
 * @param {StaticPreviewOptions} options Server options.
 * @returns {string} Request host value.
 */
function getRequestHost(request, options) {
  return request.headers.host ?? `${options.host}:${options.port}`;
}

/**
 * Returns the first forwarded protocol value, if the request supplied one.
 *
 * @param {PreviewRequest} request HTTP request.
 * @returns {string | null} Forwarded protocol.
 */
function getForwardedRequestProtocol(request) {
  const forwardedProto = request.headers["x-forwarded-proto"];

  if (typeof forwardedProto === "string" && forwardedProto.trim()) {
    return forwardedProto.split(",")[0].trim();
  }

  return null;
}

/**
 * Returns the protocol implied by the socket and server configuration.
 *
 * @param {PreviewRequest} request HTTP request.
 * @param {StaticPreviewOptions} options Server options.
 * @returns {"http" | "https"} Request protocol.
 */
function getLocalRequestProtocol(request, options) {
  return isEncryptedSocket(request.socket) || options.useHttps
    ? "https"
    : "http";
}

/**
 * Checks whether a Node socket exposes TLS encryption state.
 *
 * @param {import("node:net").Socket | undefined} socket Request socket.
 * @returns {boolean} Whether the socket is encrypted.
 */
function isEncryptedSocket(socket) {
  return Boolean(socket && "encrypted" in socket && socket.encrypted);
}

/**
 * Returns a normalized origin for the current request.
 *
 * @param {PreviewRequest} request HTTP request.
 * @param {StaticPreviewOptions} options Server options.
 * @returns {string} Request origin.
 */
function getRequestOrigin(request, options) {
  const host = getRequestHost(request, options);
  const protocol =
    getForwardedRequestProtocol(request) ??
    getLocalRequestProtocol(request, options);

  return `${protocol}://${host}`;
}

/**
 * Builds an audit-local sitemap for the origin under test.
 *
 * @param {string} origin Request origin.
 * @returns {string} XML sitemap.
 */
function buildAuditSitemap(origin) {
  const generatedDate = new Date().toISOString().slice(0, 10);
  const rows = auditSitemapRoutes
    .map((routePath) => {
      const url = new URL(routePath, `${origin}/`);

      return `  <url>
    <loc>${escapeXml(url.href)}</loc>
    <lastmod>${generatedDate}</lastmod>
    <changefreq>${routePath === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${routePath === "/" ? "1.0" : "0.7"}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</urlset>
`;
}

/**
 * Builds audit-local robots.txt for the origin under test.
 *
 * @param {string} origin Request origin.
 * @returns {string} robots.txt content.
 */
function buildAuditRobots(origin) {
  const sitemapUrl = new URL("/sitemap.xml", `${origin}/`);

  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl.href}
`;
}

/** @type {Map<string, SyntheticAuditAssetFactory>} */
const syntheticAuditAssetFactories = new Map([
  [
    "/robots.txt",
    (origin) => ({
      body: buildAuditRobots(origin),
      contentType: "text/plain; charset=utf-8",
    }),
  ],
  [
    "/sitemap.xml",
    (origin) => ({
      body: buildAuditSitemap(origin),
      contentType: "application/xml; charset=utf-8",
    }),
  ],
]);

/**
 * Returns the audit auth token asset fallback when no built asset exists.
 *
 * @param {string} root Static root directory.
 * @returns {SyntheticAuditAsset | null} Synthetic response, if any.
 */
function getAuditAuthTokenAsset(root) {
  const tokenFilePath = path.join(root, "audit-auth-tokens.json");

  if (existsSync(tokenFilePath)) {
    return null;
  }

  return {
    body: "{}\n",
    contentType: "application/json; charset=utf-8",
  };
}

/**
 * Returns synthetic audit assets that should be origin-aware locally.
 *
 * @param {string} pathname Request pathname.
 * @param {string} root Static root directory.
 * @param {string} origin Request origin.
 * @returns {SyntheticAuditAsset | null} Synthetic response, if any.
 */
function getSyntheticAuditAsset(pathname, root, origin) {
  if (pathname === "/audit-auth-tokens.json") {
    return getAuditAuthTokenAsset(root);
  }

  return syntheticAuditAssetFactories.get(pathname)?.(origin) ?? null;
}

/**
 * Returns the resolved static file candidate for a request path.
 *
 * @param {string} root Static root directory.
 * @param {string} pathname Request pathname.
 * @returns {string} Candidate file path.
 */
function getStaticCandidatePath(root, pathname) {
  const relativePath = pathname.replace(/^\/+/u, "");

  return path.resolve(root, relativePath);
}

/**
 * Returns whether the candidate path passes the static root boundary check.
 *
 * @param {string} candidatePath Candidate file path.
 * @param {string} normalizedRoot Resolved static root.
 * @returns {boolean} Whether candidate is inside the static root.
 */
function isStaticCandidateInsideRoot(candidatePath, normalizedRoot) {
  return candidatePath.startsWith(normalizedRoot);
}

/**
 * Returns a direct file target if the candidate is an existing file.
 *
 * @param {string} candidatePath Candidate file path.
 * @returns {StaticFileTarget | null} File response target.
 */
function getExistingStaticFileTarget(candidatePath) {
  if (existsSync(candidatePath) && statSync(candidatePath).isFile()) {
    return {
      filePath: candidatePath,
      status: 200,
    };
  }

  return null;
}

/**
 * Returns a directory index target if the candidate directory has one.
 *
 * @param {string} candidatePath Candidate directory path.
 * @returns {StaticFileTarget | null} File response target.
 */
function getDirectoryIndexTarget(candidatePath) {
  if (!existsSync(candidatePath) || !statSync(candidatePath).isDirectory()) {
    return null;
  }

  const directoryIndex = path.join(candidatePath, "index.html");

  if (!existsSync(directoryIndex)) {
    return null;
  }

  return {
    filePath: directoryIndex,
    status: 200,
  };
}

/**
 * Returns the SPA or 404 fallback target for a request path.
 *
 * @param {string} root Static root directory.
 * @param {string} pathname Request pathname.
 * @returns {StaticFileTarget} Fallback response target.
 */
function getStaticFallbackTarget(root, pathname) {
  const hasExtension = Boolean(path.extname(pathname));

  return {
    filePath: path.join(root, hasExtension ? "404.html" : "index.html"),
    status: hasExtension ? 404 : 200,
  };
}

/**
 * Safely resolves a request path to a file inside the static root.
 *
 * @param {string} root Static root directory.
 * @param {string} pathname Request pathname.
 * @returns {StaticFileTarget} File response target.
 */
function resolveStaticFile(root, pathname) {
  const candidatePath = getStaticCandidatePath(root, pathname);
  const normalizedRoot = path.resolve(root);

  if (!isStaticCandidateInsideRoot(candidatePath, normalizedRoot)) {
    return {
      filePath: path.join(root, "index.html"),
      status: 403,
    };
  }

  const existingFileTarget = getExistingStaticFileTarget(candidatePath);

  if (existingFileTarget) {
    return existingFileTarget;
  }

  return (
    getDirectoryIndexTarget(candidatePath) ??
    getStaticFallbackTarget(root, pathname)
  );
}

/**
 * Applies headers and content type to a response.
 *
 * @param {PreviewResponse} response HTTP response.
 * @param {Map<string, VercelHeader>} headers Headers to send.
 * @param {string} filePath Response file.
 * @param {StaticPreviewOptions} options Server options.
 */
function setResponseHeaders(response, headers, filePath, options) {
  for (const header of headers.values()) {
    response.setHeader(
      header.key,
      getPreviewHeaderValue(header.key, header.value, options),
    );
  }

  if (!response.hasHeader("Content-Type")) {
    const contentType =
      contentTypes.get(path.extname(filePath)) ?? "application/octet-stream";

    response.setHeader("Content-Type", contentType);
  }
}

/**
 * Adjusts production headers for local HTTPS audit preview constraints.
 *
 * @param {string} key Header name.
 * @param {string} value Header value.
 * @param {StaticPreviewOptions} options Server options.
 * @returns {string} Header value to send.
 */
function getPreviewHeaderValue(key, value, options) {
  if (!options.useHttps || key.toLowerCase() !== "content-security-policy") {
    return value;
  }

  return value
    .replace(/\s+http:\/\/localhost:6969/gu, "")
    .replace(/\s+http:\/\/127\.0\.0\.1:6969/gu, "")
    .replace(/\s+ws:\/\/localhost:6969/gu, "")
    .replace(/\s+ws:\/\/127\.0\.0\.1:6969/gu, "");
}

/**
 * Builds all derived request state used by the preview handler.
 *
 * @param {PreviewRequestContextOptions} options Context options.
 * @returns {PreviewRequestContext} Request context.
 */
function getPreviewRequestContext({ headerRules, options, request }) {
  const pathname = getRequestPathname(request.url);
  const origin = getRequestOrigin(request, options);

  return {
    headers: getHeadersForPathname(headerRules, pathname),
    origin,
    pathname,
    routeHtmlAsset: getRouteHtmlAsset(options.root, pathname, origin),
    syntheticAsset: getSyntheticAuditAsset(pathname, options.root, origin),
  };
}

/**
 * Sends a synthetic audit asset such as robots.txt or sitemap.xml.
 *
 * @param {SendSyntheticPreviewAssetOptions} options Asset send options.
 */
function sendSyntheticPreviewAsset({
  asset,
  headers,
  options,
  pathname,
  request,
  response,
}) {
  setResponseHeaders(response, headers, pathname, options);
  response.setHeader("Content-Type", asset.contentType);
  response.statusCode = 200;
  sendResponseBody({
    body: asset.body,
    request,
    response,
  });
}

/**
 * Sends route-specific static HTML shell content.
 *
 * @param {SendRouteHtmlPreviewAssetOptions} options Route asset send options.
 */
function sendRouteHtmlPreviewAsset({
  asset,
  headers,
  options,
  request,
  response,
}) {
  setResponseHeaders(response, headers, "index.html", options);
  response.setHeader("Content-Type", asset.contentType);
  response.statusCode = 200;
  sendResponseBody({
    body: asset.body,
    request,
    response,
  });
}

/**
 * Returns the actual file path used for a static response.
 *
 * @param {string} filePath Candidate file path.
 * @param {string} root Static root directory.
 * @returns {string} Existing file path or index fallback.
 */
function getStaticResponseFilePath(filePath, root) {
  return existsSync(filePath) ? filePath : path.join(root, "index.html");
}

/**
 * Returns the status for a static response.
 *
 * @param {string} filePath Candidate file path.
 * @param {number} status Candidate status.
 * @returns {number} Status to send.
 */
function getStaticResponseStatus(filePath, status) {
  return existsSync(filePath) ? status : 404;
}

/**
 * Sends a static file from the preview root.
 *
 * @param {SendStaticPreviewFileOptions} options Static file send options.
 */
function sendStaticPreviewFile({
  headers,
  options,
  pathname,
  request,
  response,
}) {
  const { filePath, status } = resolveStaticFile(options.root, pathname);
  const responseFilePath = getStaticResponseFilePath(filePath, options.root);

  setResponseHeaders(response, headers, responseFilePath, options);
  response.statusCode = getStaticResponseStatus(filePath, status);
  sendResponseBody({
    body: readFileSync(responseFilePath),
    request,
    response,
  });
}

/**
 * Handles one preview request across proxy, synthetic, route shell, and static branches.
 *
 * @param {HandlePreviewRequestOptions} options Preview request options.
 */
function handlePreviewRequest({ headerRules, options, request, response }) {
  const { headers, pathname, routeHtmlAsset, syntheticAsset } =
    getPreviewRequestContext({
      headerRules,
      options,
      request,
    });

  if (isApiProxyRequest(pathname, options)) {
    proxyApiRequest(request, response, options, pathname);
    return;
  }

  if (syntheticAsset) {
    sendSyntheticPreviewAsset({
      asset: syntheticAsset,
      headers,
      options,
      pathname,
      request,
      response,
    });
    return;
  }

  if (routeHtmlAsset) {
    sendRouteHtmlPreviewAsset({
      asset: routeHtmlAsset,
      headers,
      options,
      request,
      response,
    });
    return;
  }

  sendStaticPreviewFile({ headers, options, pathname, request, response });
}

/**
 * Starts the local static preview server.
 *
 * @param {StaticPreviewOptions} options Server options.
 */
function startServer(options) {
  const headerRules = readVercelHeaderRules();

  if (!existsSync(options.root)) {
    throw new Error(`Static preview root does not exist: ${options.root}`);
  }

  const server = createPreviewServer(options, (request, response) => {
    handlePreviewRequest({
      headerRules,
      options,
      request,
      response,
    });
  });

  server.listen(options.port, options.host, () => {
    const protocol = options.useHttps ? "https" : "http";

    writeOutput(
      `AUDIT_STATIC_PREVIEW ${protocol}://${options.host}:${options.port} -> ${options.root}`,
    );
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      server.close(() => process.exit(0));
    });
  }
}

try {
  startServer(parseArgs(process.argv.slice(2)));
} catch (error) {
  writeError(error);
  process.exit(1);
}
