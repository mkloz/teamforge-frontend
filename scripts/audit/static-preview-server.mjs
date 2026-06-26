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
 * @property {string} publishedAt Page publication date.
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
const auditSitemapRoutes = ["/", "/download", "/privacy", "/terms"];
/** @type {Map<string, AuditRoutePage>} */
const auditRoutePages = new Map([
  [
    "/",
    {
      author: "TeamForge product team",
      description:
        "TeamForge forms small, compatible groups for shared real-world activities using personality, interests, and social context.",
      eyebrow: "TeamForge",
      heading: "Find your people, intelligently.",
      paragraphs: [
        "TeamForge helps students and young professionals turn an idea for a real-world activity into a small, compatible circle. Instead of endless browsing, the app asks what you want to do, learns enough about your personality and interests to understand the social fit, then helps shape a clear plan with people who make sense for that moment.",
        "The product is built around purposeful connection. A user can start from a simple plan like coffee after class, a weekend run, a study session, a gallery visit, or a low-pressure evening hangout. TeamForge brings together profile basics, interests, social context, age alignment, trust signals, and readiness cues so the suggested set of people has a practical reason to meet.",
        "Once everyone is ready, the experience moves into shared planning and conversation. Members can see the plan, understand why they were brought together, coordinate details, and keep the activity moving without juggling separate tools. The goal is not to collect contacts. The goal is to make it easier to meet people who are likely to feel natural in the same room.",
        "TeamForge is designed for people who want social discovery to feel calmer, clearer, and more respectful of their time. It gives every connection a purpose, keeps each circle manageable, and centers the activity rather than a popularity feed. Find your people, intelligently, then meet with a plan already in motion.",
        "The public homepage introduces that promise before a visitor signs in. It explains the one-button flow, the kind of signals used to shape a thoughtful suggestion, and the practical next step after people are brought together. It also points visitors toward installation, privacy, and terms pages so they can understand how the product works before creating an account.",
        "That static overview matters for search and accessibility too. A crawler, screen reader, or very slow connection can still understand the core product: choose an activity, receive a considered suggestion, coordinate the plan, and move toward a real meeting with less friction.",
      ],
      publishedAt: "2026-06-04",
      title: "TeamForge | Find your people, intelligently.",
    },
  ],
  [
    "/download",
    {
      author: "TeamForge product team",
      description:
        "Install TeamForge on your phone or desktop with step-by-step guidance for iPhone, iPad, Android, Safari, Chrome, Edge, and desktop browsers.",
      eyebrow: "Download",
      heading: "Download TeamForge",
      paragraphs: [
        "The download page helps you install the app as a progressive web app on the device you already use. It covers iPhone, iPad, Android, Windows, macOS, Chrome, Edge, and Safari so you can open the service from your home screen, dock, taskbar, or app launcher without hunting for a browser tab.",
        "Mobile installation focuses on the details that usually trip people up. On iPhone and iPad, TeamForge explains why Safari is required, where the Share button lives, and how to use Add to Home Screen. On Android, it covers the install prompt, the browser menu path, and the final confirmation step. Desktop guidance follows the same practical style for Chrome, Edge, and Safari.",
        "The page also checks whether the current browser can support app-style features. It surfaces install readiness, offline opening, secure context requirements, and notification capability in plain language. That makes it easier to understand whether the device can launch TeamForge quickly, receive useful updates, and keep the experience close at hand during planning.",
        "Installing the app is optional, but it makes the product easier to return to when a group is forming or a plan is changing. The service can still run in the browser, while the installed version gives a focused entry point for activities, notifications, conversations, and group plans. The download page keeps those choices visible without requiring a store account.",
        "The installation guide is intentionally practical. It gives people enough context to know which browser to use, what button or menu item to look for, and how the installed app should behave once it is saved. That makes the page useful for both first-time visitors and returning users who want a faster way back into their groups.",
        "It also gives support and QA a stable reference when install behavior changes between browsers. If a device hides the prompt, blocks notifications, or lacks offline support, the page can explain the next best path without making the user guess.",
      ],
      publishedAt: "2026-06-04",
      title: "Download TeamForge | Mobile app",
    },
  ],
  [
    "/privacy",
    {
      author: "TeamForge product team",
      description:
        "Learn how the app handles, protects, and manages personal data across profiles, onboarding, groups, plans, chats, safety, and account settings.",
      eyebrow: "Privacy",
      heading: "How we handle your data",
      paragraphs: [
        "This privacy page explains what information the platform uses and why it matters. Profile basics, personality responses, interests, activity preferences, groups, plans, chats, safety signals, and account settings help create small groups that have a better chance of feeling comfortable and useful in real life.",
        "Data handling is tied to product purpose. The service uses account and profile information to keep sessions secure, help people understand who they are meeting, support onboarding, form groups, enable conversation, and improve reliability. Personality and interest information guide compatibility inside the app, not public ranking or exposure of private answers.",
        "The policy also describes control and protection. Users should understand how their information can be updated, what may be visible to other members of a group, how service providers support the app, and what happens when safety, abuse prevention, or legal requirements require action. The product should not sell personal information, and sensitive social features need clear boundaries.",
        "Because the app supports real-world plans, privacy is part of trust. The page gives users a direct view of the information needed to run the service, the safeguards around that information, and the choices available when account details change. Clear privacy copy helps the product feel safe before someone joins a group or starts a conversation.",
        "The privacy page also helps explain the difference between data needed for the service and details that should stay private. Some profile fields make introductions easier, some onboarding answers improve the quality of suggestions, and some activity details are shared only with the people involved in a plan. That distinction matters when users are deciding whether to join a new group.",
        "It also gives a stable place for future details about retention, account deletion, provider roles, and regional privacy rights. Those topics should be easy to find because trust is built before a user shares their first plan.",
      ],
      publishedAt: "2026-06-04",
      title: "Privacy Policy | Data and Safety",
    },
  ],
  [
    "/terms",
    {
      author: "TeamForge product team",
      description:
        "Read the rules, requirements, and policies for TeamForge accounts, groups, plans, chats, respectful conduct, safety, and platform access.",
      eyebrow: "Terms",
      heading: "The rules for using TeamForge",
      paragraphs: [
        "The TeamForge terms page sets expectations for using a social platform that helps people meet around shared activities. It explains account responsibilities, acceptable use, real-world planning expectations, safety boundaries, and the rules that keep groups respectful. The terms matter because TeamForge is not only a feed; it supports plans, conversations, and in-person coordination.",
        "Users are expected to provide accurate account information, respect other members, avoid harassment or deception, and use group planning tools honestly. Activities should be lawful, safe, and appropriate for the people involved. Conversations, profiles, and invitations should help a group coordinate, not pressure people or misrepresent what is happening.",
        "The terms also cover service reliability and product limits. TeamForge may change features, moderate harmful behavior, suspend accounts that break rules, and rely on third-party infrastructure for hosting, authentication, analytics, maps, media, or messaging support. Users should understand that recommendations and group formation are tools for social planning, not guarantees about behavior or outcomes.",
        "Clear terms protect both the community and the product. They give users a plain-language reference for what TeamForge allows, what it discourages, and how disputes, updates, and safety decisions may be handled. For a product built around meeting new people, those expectations are part of making each group feel more grounded before the first plan begins.",
        "The page also sets boundaries for shared responsibility. The service can provide structure, messaging, and planning tools, while each member still needs to communicate clearly, respect consent, and make sensible choices about where and when to meet. That shared understanding keeps the product focused on useful connection instead of vague social browsing.",
        "The terms page should remain readable as the app grows. If new planning tools, safety controls, subscriptions, or moderation workflows are added later, this route gives users one consistent place to check what changed and why it matters.",
      ],
      publishedAt: "2026-06-04",
      title: "TeamForge Terms of Service | Community Rules",
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
    datePublished: page.publishedAt,
    description: page.description,
    headline: page.heading,
    name: page.title,
    publisher: {
      "@type": "Organization",
      name: "TeamForge",
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
      const id = index === 0 ? ' id="tf-boot-description"' : "";

      return `            <p${id}>${escapeHtml(paragraph)}</p>`;
    })
    .join("\n");

  return `          <section class="tf-boot__copy" aria-describedby="tf-boot-description">
            <p class="tf-boot__eyebrow">${escapeHtml(page.eyebrow)}</p>
            <h1 id="tf-boot-heading">${escapeHtml(page.heading)}</h1>
            <p class="tf-boot__byline">By <span class="author">${escapeHtml(page.author)}</span> - Published <time datetime="${escapeHtml(page.publishedAt)}" itemprop="datePublished">${escapeHtml(page.publishedAt)}</time></p>
${paragraphs}
            <nav class="tf-boot__links" aria-label="Public pages">
              <a href="/">Home</a>
              <a href="/download">Download TeamForge</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </nav>
            <p class="tf-boot__sr" aria-live="polite">Preparing TeamForge</p>
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
      /<section class="tf-boot__copy"[\s\S]*?<\/section>/u,
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
  routeHtml = routeHtml.replace(
    /<meta\s+name="author"\s+content="[^"]*"\s*\/?>/u,
    "",
  );
  routeHtml = routeHtml.replace(
    /<meta\s+property="article:published_time"\s+content="[^"]*"\s*\/?>/u,
    "",
  );
  routeHtml = routeHtml.replace(
    "</head>",
    `<meta name="author" content="${escapeHtml(page.author)}"><meta property="article:published_time" content="${escapeHtml(page.publishedAt)}"></head>`,
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
