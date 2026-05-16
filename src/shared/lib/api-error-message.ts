import type { ApiException } from "@/shared/types/api-error";

export interface ApiErrorMessageOptions {
  badRequestMessage?: string;
  unauthorizedMessage?: string;
  forbiddenMessage?: string;
  notFoundMessage?: string;
  conflictMessage?: string;
  serverMessage?: string;
}

const DEFAULT_SERVER_ERROR_MESSAGE =
  "TeamForge is having trouble right now. Please try again in a moment.";

function readStringProperty(value: object, key: string) {
  const property = Object.entries(value).find(
    ([propertyKey]) => propertyKey === key,
  )?.[1];

  return typeof property === "string" ? property : undefined;
}

export function getHttpErrorStatus(error: unknown) {
  if (
    !(error instanceof Error) ||
    !("response" in error) ||
    !error.response ||
    typeof error.response !== "object" ||
    !("status" in error.response) ||
    typeof error.response.status !== "number"
  ) {
    return null;
  }

  return error.response.status;
}

export function readApiException(error: unknown): Partial<ApiException> | null {
  const status = getHttpErrorStatus(error);

  if (status === null || !(error instanceof Error)) {
    return null;
  }

  const cause = error.cause;

  if (!cause || typeof cause !== "object") {
    return null;
  }

  return {
    status:
      "status" in cause && typeof cause.status === "number"
        ? cause.status
        : status,
    message: readStringProperty(cause, "message"),
    timestamp: readStringProperty(cause, "timestamp"),
    method: readStringProperty(cause, "method"),
    path: readStringProperty(cause, "path"),
    requestId: readStringProperty(cause, "requestId"),
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
  options: ApiErrorMessageOptions = {},
) {
  const apiException = readApiException(error);

  if (apiException?.message && apiException.message.trim().length > 0) {
    return apiException.message;
  }

  const status = getHttpErrorStatus(error);

  if (status === null) {
    return fallbackMessage;
  }

  switch (status) {
    case 400:
      return options.badRequestMessage ?? fallbackMessage;
    case 401:
      return options.unauthorizedMessage ?? fallbackMessage;
    case 403:
      return options.forbiddenMessage ?? fallbackMessage;
    case 404:
      return options.notFoundMessage ?? fallbackMessage;
    case 409:
      return options.conflictMessage ?? fallbackMessage;
    default:
      if (status >= 500) {
        return options.serverMessage ?? DEFAULT_SERVER_ERROR_MESSAGE;
      }

      return fallbackMessage;
  }
}
