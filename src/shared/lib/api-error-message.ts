import { HTTPError } from "ky";

import {
  type ApiException,
  ApiExceptionSchema,
} from "@/shared/types/api-error";

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

export function readApiException(error: unknown): ApiException | null {
  if (!(error instanceof HTTPError)) {
    return null;
  }

  const cause = error.cause;

  if (!cause || typeof cause !== "object") {
    return null;
  }

  const parsed = ApiExceptionSchema.safeParse(cause);

  return parsed.success ? parsed.data : null;
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

  if (!(error instanceof HTTPError)) {
    return fallbackMessage;
  }

  switch (error.response.status) {
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
      if (error.response.status >= 500) {
        return options.serverMessage ?? DEFAULT_SERVER_ERROR_MESSAGE;
      }

      return fallbackMessage;
  }
}
