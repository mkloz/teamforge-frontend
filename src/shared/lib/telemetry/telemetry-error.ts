import {
  readNumberProperty,
  readProperty,
  readStringProperty,
} from "@/shared/lib/telemetry/object-record";
import type { SerializedError } from "@/shared/lib/telemetry/telemetry-types";

const MAX_TELEMETRY_ERROR_MESSAGE_LENGTH = 255;

function readApiException(error: Error) {
  const cause = readProperty(error, "cause");

  if (!cause || typeof cause !== "object") {
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

export function truncateTelemetryErrorMessage(message: string) {
  if (message.length <= MAX_TELEMETRY_ERROR_MESSAGE_LENGTH) {
    return message;
  }

  return `${message.slice(0, MAX_TELEMETRY_ERROR_MESSAGE_LENGTH - 1)}…`;
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

export function serializeError(error: unknown): SerializedError {
  return error instanceof Error
    ? serializeKnownError(error)
    : serializeUnknownError(error);
}
