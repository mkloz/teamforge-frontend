import type {
  Breadcrumb as SentryBreadcrumb,
  Event as SentryEvent,
} from "@sentry/react";

import { config } from "@/config/config";
import { warnInDevelopment } from "@/shared/lib/development-warning";

type TelemetryValue = string | number | boolean | null | undefined;

type TelemetryContext = Record<string, TelemetryValue | object>;
type UnknownRecord = Record<PropertyKey, unknown>;
type SentryRuntime = typeof import("@sentry/react");

interface SerializedError {
  name: string;
  message: string;
  status?: number;
  requestId?: string;
  stack?: string;
}

const MAX_TELEMETRY_ERROR_MESSAGE_LENGTH = 255;
const MAX_SENTRY_CONTEXT_STRING_LENGTH = 512;
const REDACTED_TELEMETRY_VALUE = "[redacted]";
const URL_TOKEN_PLACEHOLDER = "[token]";
const TELEMETRY_PRIMITIVE_TYPES = new Set(["boolean", "number", "string"]);
const SENSITIVE_CONTEXT_KEY_PARTS = [
  "authorization",
  "avatar",
  "bio",
  "code",
  "content",
  "cookie",
  "credential",
  "email",
  "firstName",
  "fullName",
  "googleId",
  "jwt",
  "lastName",
  "message",
  "otp",
  "passcode",
  "password",
  "refreshToken",
  "secret",
  "session",
  "token",
  "username",
];
const SENSITIVE_KEY_EXCEPTIONS = new Set([
  "emailDomain",
  "errorName",
  "mutationName",
]);
const SENSITIVE_AUTH_ROUTE_PATTERNS = [
  /\/auth\/reset-password\/[^/?#]+/giu,
  /\/auth\/activate\/[^/?#]+/giu,
];
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu;
const TOKEN_LIKE_PATTERN = /\b(?:eyJ[A-Za-z0-9_-]{12,}|[A-Za-z0-9_-]{32,})\b/gu;

let sentryRuntimePromise: Promise<SentryRuntime | null> | null = null;
let sentryInitialized = false;

function isObjectRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object";
}

function readProperty(source: unknown, key: PropertyKey) {
  return isObjectRecord(source) && key in source ? source[key] : undefined;
}

function readNumberProperty(source: unknown, key: PropertyKey) {
  const value = readProperty(source, key);

  return typeof value === "number" ? value : undefined;
}

function readStringProperty(source: unknown, key: PropertyKey) {
  const value = readProperty(source, key);

  return typeof value === "string" ? value : undefined;
}

function readApiException(error: Error) {
  const cause = readProperty(error, "cause");

  if (!isObjectRecord(cause)) {
    return null;
  }

  return {
    status: readNumberProperty(cause, "status"),
    requestId: readStringProperty(cause, "requestId"),
  };
}

function readResponseStatus(error: Error) {
  return readNumberProperty(readProperty(error, "response"), "status");
}

function getSerializedErrorMessage(error: unknown) {
  return typeof error === "string"
    ? error
    : "An unknown client error occurred.";
}

function truncateTelemetryErrorMessage(message: string) {
  if (message.length <= MAX_TELEMETRY_ERROR_MESSAGE_LENGTH) {
    return message;
  }

  return `${message.slice(0, MAX_TELEMETRY_ERROR_MESSAGE_LENGTH - 1)}…`;
}

function isTelemetryPrimitive(value: unknown): value is TelemetryValue {
  return value == null || TELEMETRY_PRIMITIVE_TYPES.has(typeof value);
}

function serializeTelemetryObject(value: object) {
  try {
    return sanitizeTelemetryText(JSON.stringify(value));
  } catch {
    return "Unserializable telemetry value";
  }
}

function truncateTelemetryContextString(value: string) {
  if (value.length <= MAX_SENTRY_CONTEXT_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_SENTRY_CONTEXT_STRING_LENGTH - 1)}…`;
}

function normalizeTelemetryKey(key: string) {
  return key.replace(/[^a-zA-Z0-9]/gu, "").toLowerCase();
}

function isSensitiveContextKey(key: string) {
  if (SENSITIVE_KEY_EXCEPTIONS.has(key)) {
    return false;
  }

  const normalizedKey = normalizeTelemetryKey(key);

  return SENSITIVE_CONTEXT_KEY_PARTS.some((part) =>
    normalizedKey.includes(normalizeTelemetryKey(part)),
  );
}

function sanitizeTelemetryUrl(value: string) {
  const withoutRouteTokens = SENSITIVE_AUTH_ROUTE_PATTERNS.reduce(
    (current, pattern) =>
      current.replace(pattern, (route) => {
        const tokenStart = route.lastIndexOf("/");

        return tokenStart === -1
          ? route
          : `${route.slice(0, tokenStart + 1)}${URL_TOKEN_PLACEHOLDER}`;
      }),
    value,
  );

  try {
    const url = new URL(withoutRouteTokens);

    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return withoutRouteTokens.split(/[?#]/u)[0] ?? withoutRouteTokens;
  }
}

function sanitizeTelemetryText(value: string) {
  return truncateTelemetryContextString(
    sanitizeTelemetryUrl(value)
      .replace(EMAIL_PATTERN, REDACTED_TELEMETRY_VALUE)
      .replace(TOKEN_LIKE_PATTERN, REDACTED_TELEMETRY_VALUE),
  );
}

function toTelemetryValue(
  key: string,
  value: TelemetryContext[string],
): TelemetryValue {
  if (isSensitiveContextKey(key)) {
    return REDACTED_TELEMETRY_VALUE;
  }

  if (typeof value === "string") {
    return sanitizeTelemetryText(value);
  }

  return isTelemetryPrimitive(value) ? value : serializeTelemetryObject(value);
}

function sanitizeContext(context: TelemetryContext) {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      toTelemetryValue(key, value),
    ]),
  );
}

function serializeUnknownError(error: unknown): SerializedError {
  return {
    name: "UnknownError",
    message: getSerializedErrorMessage(error),
  };
}

function serializeKnownError(error: Error): SerializedError {
  const apiException = readApiException(error);
  const status = readResponseStatus(error) ?? apiException?.status;

  return {
    name: error.name,
    message: error.message,
    status,
    requestId: apiException?.requestId,
    stack: error.stack,
  };
}

function serializeError(error: unknown): SerializedError {
  return error instanceof Error
    ? serializeKnownError(error)
    : serializeUnknownError(error);
}

function getSentryDsn() {
  const dsn = config.sentryDsn?.trim();

  return dsn && dsn !== "disabled" ? dsn : null;
}

function parseSentryTracesSampleRate() {
  const rawValue = config.sentryTracesSampleRate?.trim();

  if (!rawValue) {
    return 0;
  }

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(1, Math.max(0, parsed));
}

function getSentryEnvironment() {
  return config.sentryEnvironment?.trim() || config.environment;
}

function getSentryRelease() {
  return config.sentryRelease?.trim() || undefined;
}

function sanitizeUnknownTelemetryValue(key: string, value: unknown): unknown {
  if (isSensitiveContextKey(key)) {
    return REDACTED_TELEMETRY_VALUE;
  }

  if (typeof value === "string") {
    return sanitizeTelemetryText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnknownTelemetryValue(key, item));
  }

  if (isObjectRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([nestedKey, nestedValue]) => [
        nestedKey,
        sanitizeUnknownTelemetryValue(nestedKey, nestedValue),
      ]),
    );
  }

  return value;
}

function scrubSentryBreadcrumbData(
  data: SentryBreadcrumb["data"],
): SentryBreadcrumb["data"] {
  if (!data) {
    return undefined;
  }

  const scrubbedData = sanitizeUnknownTelemetryValue("breadcrumbData", data);

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Sentry breadcrumb data intentionally accepts arbitrary JSON-like fields.
  return scrubbedData as SentryBreadcrumb["data"];
}

function scrubSentryBreadcrumb(breadcrumb: SentryBreadcrumb): SentryBreadcrumb {
  return {
    ...breadcrumb,
    data: scrubSentryBreadcrumbData(breadcrumb.data),
    message: breadcrumb.message
      ? sanitizeTelemetryText(breadcrumb.message)
      : breadcrumb.message,
  };
}

function scrubSentryRequest(
  request: SentryEvent["request"],
): SentryEvent["request"] {
  if (!request) {
    return request;
  }

  return {
    ...request,
    cookies: undefined,
    data: undefined,
    headers: undefined,
    query_string: undefined,
    url: request.url ? sanitizeTelemetryUrl(request.url) : request.url,
  };
}

function scrubSentryException(
  exception: SentryEvent["exception"],
): SentryEvent["exception"] {
  if (!exception?.values) {
    return exception;
  }

  return {
    ...exception,
    values: exception.values.map((value) => ({
      ...value,
      value: value.value ? sanitizeTelemetryText(value.value) : value.value,
    })),
  };
}

function scrubSentryEvent<TEvent extends SentryEvent>(event: TEvent): TEvent {
  return {
    ...event,
    breadcrumbs: event.breadcrumbs?.map(scrubSentryBreadcrumb),
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Sentry event contexts are third-party JSON payloads scrubbed recursively before returning.
    contexts: sanitizeUnknownTelemetryValue(
      "contexts",
      event.contexts,
    ) as TEvent["contexts"],
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The exception shape is preserved while string values are scrubbed.
    exception: scrubSentryException(event.exception) as TEvent["exception"],
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Sentry extras are arbitrary JSON-like fields scrubbed recursively before returning.
    extra: sanitizeUnknownTelemetryValue(
      "extra",
      event.extra,
    ) as TEvent["extra"],
    message: event.message
      ? sanitizeTelemetryText(event.message)
      : event.message,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The request shape is preserved while sensitive request fields are removed.
    request: scrubSentryRequest(event.request) as TEvent["request"],
    transaction: event.transaction
      ? sanitizeTelemetryUrl(event.transaction)
      : event.transaction,
    user: undefined,
  };
}

function getSentryIntegrations(Sentry: SentryRuntime) {
  const tracesSampleRate = parseSentryTracesSampleRate();

  return tracesSampleRate > 0 ? [Sentry.browserTracingIntegration()] : [];
}

function initializeSentryRuntime(Sentry: SentryRuntime) {
  const dsn = getSentryDsn();

  if (!dsn || sentryInitialized) {
    return;
  }

  const tracesSampleRate = parseSentryTracesSampleRate();

  Sentry.init({
    dsn,
    environment: getSentryEnvironment(),
    release: getSentryRelease(),
    sendDefaultPii: false,
    tracesSampleRate: tracesSampleRate > 0 ? tracesSampleRate : undefined,
    integrations: getSentryIntegrations(Sentry),
    beforeBreadcrumb: (breadcrumb) => scrubSentryBreadcrumb(breadcrumb),
    beforeSend: (event) => scrubSentryEvent(event),
    beforeSendTransaction: (event) => scrubSentryEvent(event),
    denyUrls: [/extensions\//iu, /^chrome:\/\//iu, /^moz-extension:\/\//iu],
    ignoreErrors: [
      "ResizeObserver loop completed with undelivered notifications.",
      "ResizeObserver loop limit exceeded",
    ],
    normalizeDepth: 3,
  });

  sentryInitialized = true;
}

async function getSentryRuntime() {
  if (!getSentryDsn()) {
    return null;
  }

  sentryRuntimePromise ??= import("@sentry/react")
    .then((Sentry) => {
      initializeSentryRuntime(Sentry);

      return Sentry;
    })
    .catch((error: unknown) => {
      sentryRuntimePromise = null;
      warnInDevelopment("Sentry telemetry failed to initialize.", error);

      return null;
    });

  return sentryRuntimePromise;
}

export async function initializeTelemetry() {
  return (await getSentryRuntime()) !== null && sentryInitialized;
}

export function trackEvent(name: string, context: TelemetryContext = {}) {
  const data = sanitizeContext(context);

  void getSentryRuntime().then((Sentry) => {
    if (!Sentry || !sentryInitialized) {
      return null;
    }

    Sentry.addBreadcrumb({
      category: "teamforge.event",
      data,
      level: "info",
      message: sanitizeTelemetryText(name),
    });

    return null;
  });
}

export function captureException(
  scope: string,
  error: unknown,
  context: TelemetryContext = {},
) {
  const serialized = serializeError(error);
  const errorMessage = truncateTelemetryErrorMessage(serialized.message);
  const details = {
    scope,
    ...sanitizeContext(context),
    errorName: serialized.name,
    errorMessage,
    errorStatus: serialized.status,
    requestId: serialized.requestId,
  };

  // eslint-disable-next-line no-console -- Client telemetry keeps a local error trail in development and production consoles.
  console.error("[client-error]", details, error);
  trackEvent("client_error", details);

  void getSentryRuntime().then((Sentry) => {
    if (!Sentry || !sentryInitialized) {
      return null;
    }

    Sentry.withScope((sentryScope) => {
      sentryScope.setTag("teamforge.scope", sanitizeTelemetryText(scope));

      for (const [key, value] of Object.entries(details)) {
        if (value !== undefined) {
          sentryScope.setExtra(key, value);
        }
      }

      Sentry.captureException(error);
    });

    return null;
  });
}

export function trackMutationOutcome(
  name: string,
  status: "success" | "error",
  context: TelemetryContext = {},
) {
  trackEvent("mutation_outcome", {
    mutation: name,
    status,
    ...context,
  });
}
