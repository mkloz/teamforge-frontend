import {
  getSentryRuntime,
  initializeTelemetry,
} from "@/shared/lib/telemetry/sentry-runtime";
import {
  serializeError,
  truncateTelemetryErrorMessage,
} from "@/shared/lib/telemetry/telemetry-error";
import {
  sanitizeContext,
  sanitizeTelemetryText,
} from "@/shared/lib/telemetry/telemetry-sanitizer";
import type { TelemetryContext } from "@/shared/lib/telemetry/telemetry-types";

export type { TelemetryContext };
export { initializeTelemetry };

export function trackEvent(name: string, context: TelemetryContext = {}) {
  const data = sanitizeContext(context);

  void getSentryRuntime().then((Sentry) => {
    if (!Sentry) {
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
    if (!Sentry) {
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
