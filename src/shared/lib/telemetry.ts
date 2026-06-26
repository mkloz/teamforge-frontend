type TelemetryValue = string | number | boolean | null | undefined;

type TelemetryContext = Record<string, TelemetryValue | object>;
type UnknownRecord = Record<PropertyKey, unknown>;

interface SerializedError {
  name: string;
  message: string;
  status?: number;
  requestId?: string;
  stack?: string;
}

const MAX_TELEMETRY_ERROR_MESSAGE_LENGTH = 255;
const TELEMETRY_PRIMITIVE_TYPES = new Set(["boolean", "number", "string"]);

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
    return JSON.stringify(value);
  } catch {
    return "Unserializable telemetry value";
  }
}

function toTelemetryValue(value: TelemetryContext[string]): TelemetryValue {
  return isTelemetryPrimitive(value) ? value : serializeTelemetryObject(value);
}

function sanitizeContext(context: TelemetryContext) {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      toTelemetryValue(value),
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

export function trackEvent(name: string, context: TelemetryContext = {}) {
  void name;
  void context;
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
