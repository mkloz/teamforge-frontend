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

const STATUS_MESSAGE_OPTIONS = new Map<number, keyof ApiErrorMessageOptions>([
  [400, "badRequestMessage"],
  [401, "unauthorizedMessage"],
  [403, "forbiddenMessage"],
  [404, "notFoundMessage"],
  [409, "conflictMessage"],
]);

type ErrorWithResponse = Error & { response: object };

interface ApiExceptionContext {
  cause: object;
  status: number;
}

function isObjectValue(value: unknown): value is object {
  return value !== null && typeof value === "object";
}

function readOwnProperty(value: object, key: string) {
  return Object.entries(value).find(
    ([propertyKey]) => propertyKey === key,
  )?.[1];
}

function readStringProperty(value: object, key: string) {
  const property = readOwnProperty(value, key);

  return typeof property === "string" ? property : undefined;
}

function readNumberProperty(value: object, key: string) {
  if (!(key in value)) {
    return undefined;
  }

  const property: unknown = Reflect.get(value, key);

  return typeof property === "number" ? property : undefined;
}

function hasErrorResponse(error: unknown): error is ErrorWithResponse {
  return (
    error instanceof Error &&
    "response" in error &&
    isObjectValue(error.response)
  );
}

function getErrorResponse(error: unknown) {
  if (!hasErrorResponse(error)) {
    return null;
  }

  return error.response;
}

export function getHttpErrorStatus(error: unknown) {
  const response = getErrorResponse(error);

  if (!response) {
    return null;
  }

  return readNumberProperty(response, "status") ?? null;
}

function getApiExceptionContext(error: unknown): ApiExceptionContext | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const status = getHttpErrorStatus(error);
  const cause = error.cause;

  if (status === null || !isObjectValue(cause)) {
    return null;
  }

  return {
    cause,
    status,
  };
}

function readApiException(error: unknown): Partial<ApiException> | null {
  const context = getApiExceptionContext(error);

  if (!context) {
    return null;
  }

  const { cause, status } = context;

  return {
    status: readNumberProperty(cause, "status") ?? status,
    message: readStringProperty(cause, "message"),
    timestamp: readStringProperty(cause, "timestamp"),
    method: readStringProperty(cause, "method"),
    path: readStringProperty(cause, "path"),
    requestId: readStringProperty(cause, "requestId"),
  };
}

function getMappedStatusFallbackMessage(
  status: number,
  fallbackMessage: string,
  options: ApiErrorMessageOptions,
) {
  const optionKey = STATUS_MESSAGE_OPTIONS.get(status);

  if (!optionKey) {
    return null;
  }

  return options[optionKey] ?? fallbackMessage;
}

function isServerErrorStatus(status: number) {
  return status >= 500;
}

function getStatusFallbackMessage(
  status: number,
  fallbackMessage: string,
  options: ApiErrorMessageOptions,
) {
  const mappedStatusMessage = getMappedStatusFallbackMessage(
    status,
    fallbackMessage,
    options,
  );

  if (mappedStatusMessage !== null) {
    return mappedStatusMessage;
  }

  if (isServerErrorStatus(status)) {
    return options.serverMessage ?? DEFAULT_SERVER_ERROR_MESSAGE;
  }

  return fallbackMessage;
}

function isNonBlankString(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

function getApiExceptionMessage(error: unknown) {
  const apiException = readApiException(error);

  return isNonBlankString(apiException?.message) ? apiException.message : null;
}

export function getApiErrorCode(error: unknown) {
  const context = getApiExceptionContext(error);

  return context ? (readStringProperty(context.cause, "code") ?? null) : null;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
  options: ApiErrorMessageOptions = {},
) {
  const apiExceptionMessage = getApiExceptionMessage(error);

  if (apiExceptionMessage !== null) {
    return apiExceptionMessage;
  }

  const status = getHttpErrorStatus(error);

  if (status === null) {
    return fallbackMessage;
  }

  return getStatusFallbackMessage(status, fallbackMessage, options);
}
