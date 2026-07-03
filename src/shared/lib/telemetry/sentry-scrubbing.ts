import type {
  Breadcrumb as SentryBreadcrumb,
  Event as SentryEvent,
} from "@sentry/react";
import { isObjectRecord } from "@/shared/lib/telemetry/object-record";
import {
  sanitizeTelemetryText,
  sanitizeTelemetryUrl,
  sanitizeUnknownTelemetryValue,
} from "@/shared/lib/telemetry/telemetry-sanitizer";

type SentryContext = NonNullable<NonNullable<SentryEvent["contexts"]>[string]>;

function scrubSentryBreadcrumbData(
  data: SentryBreadcrumb["data"],
): SentryBreadcrumb["data"] {
  if (!data) {
    return undefined;
  }

  const scrubbedData: NonNullable<SentryBreadcrumb["data"]> = {};

  for (const [key, value] of Object.entries(data)) {
    scrubbedData[key] = sanitizeUnknownTelemetryValue(key, value);
  }

  return scrubbedData;
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

function scrubSentryContext(
  key: string,
  context: SentryContext,
): SentryContext {
  const scrubbedContext = sanitizeUnknownTelemetryValue(key, context);

  if (!isObjectRecord(scrubbedContext)) {
    return { value: scrubbedContext };
  }

  const contextRecord: SentryContext = {};

  for (const [contextKey, contextValue] of Object.entries(scrubbedContext)) {
    contextRecord[contextKey] = contextValue;
  }

  return contextRecord;
}

function scrubSentryContexts(
  contexts: SentryEvent["contexts"],
): SentryEvent["contexts"] {
  if (!contexts) {
    return contexts;
  }

  const scrubbedContexts: SentryEvent["contexts"] = {};

  for (const [key, context] of Object.entries(contexts)) {
    scrubbedContexts[key] = context
      ? scrubSentryContext(key, context)
      : context;
  }

  return scrubbedContexts;
}

function scrubSentryExtra(extra: SentryEvent["extra"]): SentryEvent["extra"] {
  if (!extra) {
    return extra;
  }

  const scrubbedExtra: NonNullable<SentryEvent["extra"]> = {};

  for (const [key, value] of Object.entries(extra)) {
    scrubbedExtra[key] = sanitizeUnknownTelemetryValue(key, value);
  }

  return scrubbedExtra;
}

export function scrubSentryEvent<TEvent extends SentryEvent>(
  event: TEvent,
): TEvent {
  const scrubbedEvent: TEvent = { ...event };

  scrubbedEvent.breadcrumbs = event.breadcrumbs?.map(scrubSentryBreadcrumb);
  scrubbedEvent.contexts = scrubSentryContexts(event.contexts);
  scrubbedEvent.exception = scrubSentryException(event.exception);
  scrubbedEvent.extra = scrubSentryExtra(event.extra);
  scrubbedEvent.message = event.message
    ? sanitizeTelemetryText(event.message)
    : event.message;
  scrubbedEvent.request = scrubSentryRequest(event.request);
  scrubbedEvent.transaction = event.transaction
    ? sanitizeTelemetryUrl(event.transaction)
    : event.transaction;
  scrubbedEvent.user = undefined;

  return scrubbedEvent;
}
