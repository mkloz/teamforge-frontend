import { warnInDevelopment } from "@/shared/lib/development-warning";
import {
  getSentryDsn,
  getSentryEnvironment,
  getSentryIntegrations,
  getSentryRelease,
  parseSentryTracesSampleRate,
} from "@/shared/lib/telemetry/sentry-config";
import {
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "@/shared/lib/telemetry/sentry-scrubbing";
import type { SentryRuntime } from "@/shared/lib/telemetry/telemetry-types";

let sentryRuntimePromise: Promise<SentryRuntime | null> | null = null;
let sentryInitialized = false;

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

export async function getSentryRuntime() {
  if (!getSentryDsn()) {
    return null;
  }

  sentryRuntimePromise ??= import("@sentry/react")
    .then((Sentry) => {
      initializeSentryRuntime(Sentry);

      return sentryInitialized ? Sentry : null;
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
