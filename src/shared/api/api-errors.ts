import type { HTTPError } from "ky";

import { ApiExceptionSchema } from "@/shared/types/api-error";

export interface ApiResponseWithRequestId<T> {
  data: T;
  requestId: string | null;
}

export const REQUEST_ID_HEADER = "x-request-id";

export async function parseApiError(error: HTTPError) {
  let payload: Awaited<ReturnType<typeof ApiExceptionSchema.parse>> | null =
    null;

  try {
    const value: unknown = await error.response.clone().json();
    const parsed = ApiExceptionSchema.safeParse(value);

    payload = parsed.success ? parsed.data : null;
  } catch {
    payload = null;
  }

  const requestId = error.response.headers.get(REQUEST_ID_HEADER);

  if (!payload) {
    if (requestId) {
      Object.defineProperty(error, "cause", {
        value: { requestId },
        configurable: true,
      });
    }

    return error;
  }

  if (requestId && !payload.requestId) {
    payload.requestId = requestId;
  }

  if (payload.message && payload.message.trim().length > 0) {
    error.message = payload.message;
  }

  Object.defineProperty(error, "cause", {
    value: payload,
    configurable: true,
  });

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
