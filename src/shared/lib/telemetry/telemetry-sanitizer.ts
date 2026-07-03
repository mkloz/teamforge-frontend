import { isObjectRecord } from "@/shared/lib/telemetry/object-record";
import type {
  TelemetryContext,
  TelemetryValue,
} from "@/shared/lib/telemetry/telemetry-types";

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

export function sanitizeTelemetryUrl(value: string) {
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

export function sanitizeTelemetryText(value: string) {
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

export function sanitizeContext(context: TelemetryContext) {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      toTelemetryValue(key, value),
    ]),
  );
}

export function sanitizeUnknownTelemetryValue(
  key: string,
  value: unknown,
): unknown {
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
