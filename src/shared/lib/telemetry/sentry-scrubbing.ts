import type {
  Breadcrumb as SentryBreadcrumb,
  Event as SentryEvent,
} from "@sentry/react";

import {
  sanitizeTelemetryText,
  sanitizeTelemetryUrl,
  sanitizeUnknownTelemetryValue,
} from "@/shared/lib/telemetry/telemetry-sanitizer";

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

export function scrubSentryBreadcrumb(
  breadcrumb: SentryBreadcrumb,
): SentryBreadcrumb {
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

export function scrubSentryEvent<TEvent extends SentryEvent>(
  event: TEvent,
): TEvent {
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
