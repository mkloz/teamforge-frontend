import { config } from "@/config/config";
import type { SentryRuntime } from "@/shared/lib/telemetry/telemetry-types";

export function getSentryDsn() {
  const dsn = config.sentryDsn?.trim();

  return dsn && dsn !== "disabled" ? dsn : null;
}

export function parseSentryTracesSampleRate() {
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

export function getSentryEnvironment() {
  return config.sentryEnvironment?.trim() || config.environment;
}

export function getSentryRelease() {
  return config.sentryRelease?.trim() || undefined;
}

export function getSentryIntegrations(Sentry: SentryRuntime) {
  const tracesSampleRate = parseSentryTracesSampleRate();

  return tracesSampleRate > 0 ? [Sentry.browserTracingIntegration()] : [];
}
