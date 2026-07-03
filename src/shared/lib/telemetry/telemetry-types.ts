export type TelemetryValue = string | number | boolean | null | undefined;

export type TelemetryContext = Record<string, TelemetryValue | object>;
export type UnknownRecord = Record<PropertyKey, unknown>;
export type SentryRuntime = typeof import("@sentry/react");

export interface SerializedError {
  name: string;
  message: string;
  status?: number;
  requestId?: string;
  stack?: string;
}
