import { track } from "@vercel/analytics";
import type { ApiException } from "@/shared/types/api-error";
import type { TrackedMutationName } from "@/shared/lib/telemetry-contract";

type TelemetryValue = string | number | boolean | null | undefined;

type TelemetryContext = Record<string, TelemetryValue | object>;

interface SerializedError {
  name: string;
  message: string;
  status?: number;
  requestId?: string;
  stack?: string;
}

const MAX_TELEMETRY_ERROR_MESSAGE_LENGTH = 255;

function readApiException(error: Error) {
  if (!("cause" in error)) {
    return null;
  }

  const cause = error.cause;

  if (!cause || typeof cause !== "object") {
    return null;
  }

  return cause as Partial<ApiException>;
}

function toTelemetryValue(value: TelemetryContext[string]): TelemetryValue {
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function sanitizeContext(context: TelemetryContext) {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      toTelemetryValue(value),
    ]),
  );
}

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const apiException = readApiException(error);
    const status =
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      typeof error.response.status === "number"
        ? error.response.status
        : apiException?.status;

    return {
      name: error.name,
      message: error.message,
      status,
      requestId:
        typeof apiException?.requestId === "string"
          ? apiException.requestId
          : undefined,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message:
      typeof error === "string" ? error : "An unknown client error occurred.",
  };
}

export function trackEvent(name: string, context: TelemetryContext = {}) {
  const payload = sanitizeContext(context);

  try {
    void track(name, payload);
  } catch {
    // Ignore analytics transport failures to avoid affecting product flows.
  }
}

export function captureException(
  scope: string,
  error: unknown,
  context: TelemetryContext = {},
) {
  const serialized = serializeError(error);
  const errorMessage =
    serialized.message.length > MAX_TELEMETRY_ERROR_MESSAGE_LENGTH
      ? `${serialized.message.slice(0, MAX_TELEMETRY_ERROR_MESSAGE_LENGTH - 1)}…`
      : serialized.message;
  const details = {
    scope,
    ...sanitizeContext(context),
    errorName: serialized.name,
    errorMessage,
    errorStatus: serialized.status,
    requestId: serialized.requestId,
  };

  console.error("[client-error]", details, error);
  trackEvent("client_error", details);
}

export function trackMutationOutcome(
  name: TrackedMutationName | string,
  status: "success" | "error",
  context: TelemetryContext = {},
) {
  trackEvent("mutation_outcome", {
    mutation: name,
    status,
    ...context,
  });
}
