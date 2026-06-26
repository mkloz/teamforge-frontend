import type { HTTPError } from "ky";

import {
  type ApiException,
  ApiExceptionSchema,
} from "@/shared/types/api-error";

export interface ApiResponseWithRequestId<T> {
  data: T;
  requestId: string | null;
}

const REQUEST_ID_HEADER = "x-request-id";

async function readApiErrorPayload(error: HTTPError) {
  try {
    const value: unknown = await error.response.clone().json();
    const parsed = ApiExceptionSchema.safeParse(value);

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function attachApiErrorCause(error: HTTPError, value: unknown) {
  Object.defineProperty(error, "cause", {
    value,
    configurable: true,
  });
}

function applyRequestIdToApiPayload(
  payload: ApiException,
  requestId: string | null,
) {
  if (requestId && !payload.requestId) {
    payload.requestId = requestId;
  }
}

function applyApiErrorMessage(error: HTTPError, message: string | undefined) {
  if (message && message.trim().length > 0) {
    error.message = message;
  }
}

export async function parseApiError(error: HTTPError) {
  const payload = await readApiErrorPayload(error);
  const requestId = error.response.headers.get(REQUEST_ID_HEADER);

  if (!payload) {
    if (requestId) {
      attachApiErrorCause(error, { requestId });
    }

    return error;
  }

  applyRequestIdToApiPayload(payload, requestId);
  applyApiErrorMessage(error, payload.message);

  attachApiErrorCause(error, payload);

  return error;
}

export function getResponseRequestId(response: Response) {
  return response.headers.get(REQUEST_ID_HEADER);
}

export async function parseJsonWithRequestId<T>(
  response: Response,
  parse: (value: unknown) => T,
): Promise<ApiResponseWithRequestId<T>> {
  const payload: unknown = await response.json();

  return {
    data: parse(payload),
    requestId: getResponseRequestId(response),
  };
}
