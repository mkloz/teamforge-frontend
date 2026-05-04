import ky, { type HTTPError, type Options } from "ky";

import { config } from "@/config/config";
import { authSession, type AuthTokens } from "@/shared/api/auth-session";
import type { ApiException } from "@/shared/types/api-error";

interface ApiRequestContext {
  auth?: "access" | "refresh" | "none";
  retryOnUnauthorized?: boolean;
}

export interface ApiResponseWithRequestId<T> {
  data: T;
  requestId: string | null;
}

const AUTH_REFRESH_PATH = "auth/refresh";
const AUTH_LOGOUT_PATH = "auth/logout";
export const REQUEST_ID_HEADER = "x-request-id";

let refreshPromise: Promise<AuthTokens | null> | null = null;

interface RefreshTokensOptions {
  allowCookieRefresh?: boolean;
}

function readContext(options?: Options): Required<ApiRequestContext> {
  const context = options?.context;

  return {
    auth:
      context && typeof context.auth === "string"
        ? (context.auth as Required<ApiRequestContext>["auth"])
        : "access",
    retryOnUnauthorized:
      context && typeof context.retryOnUnauthorized === "boolean"
        ? context.retryOnUnauthorized
        : true,
  };
}

function isAuthRefreshRequest(request: Request) {
  return request.url.includes(AUTH_REFRESH_PATH);
}

function isAuthLogoutRequest(request: Request) {
  return request.url.includes(AUTH_LOGOUT_PATH);
}

function applyAuthorizationHeader(
  request: Request,
  authMode: Required<ApiRequestContext>["auth"],
) {
  if (authMode === "none") {
    return;
  }

  const token =
    authMode === "refresh"
      ? authSession.getRefreshToken()
      : authSession.getAccessToken();

  if (!token) {
    return;
  }

  request.headers.set("Authorization", `Bearer ${token}`);
}

function buildRetryOptions(
  request: Request,
  options: Options,
  tokens: AuthTokens,
): Options {
  const headers = new Headers(request.headers);

  headers.set("Authorization", `Bearer ${tokens.accessToken}`);

  return {
    ...options,
    headers,
    context: {
      ...(options.context ?? {}),
      auth: "access",
      retryOnUnauthorized: false,
    },
  };
}

async function parseApiError(error: HTTPError) {
  const payload = await error.response
    .clone()
    .json()
    .then((value) => value as ApiException)
    .catch(() => null);

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

async function refreshTokens(options: RefreshTokensOptions = {}) {
  const refreshToken = authSession.getRefreshToken();

  if (!refreshToken && !options.allowCookieRefresh) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = rawApiClient
      .post(AUTH_REFRESH_PATH, {
        context: {
          auth: refreshToken ? "refresh" : "none",
          retryOnUnauthorized: false,
        },
      })
      .json<AuthTokens>()
      .then((nextTokens) => {
        authSession.setTokens(nextTokens);
        return nextTokens;
      })
      .catch(() => {
        authSession.clear();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

const sharedHooks = {
  beforeRequest: [
    async (request: Request, options: Options) => {
      const { auth } = readContext(options);

      if (isAuthRefreshRequest(request)) {
        applyAuthorizationHeader(request, "refresh");
        return;
      }

      if (isAuthLogoutRequest(request) && auth === "access") {
        applyAuthorizationHeader(request, "refresh");
        return;
      }

      applyAuthorizationHeader(request, auth);
    },
  ],
  beforeError: [parseApiError],
};

const rawApiClient = ky.create({
  prefixUrl: config.apiUrl,
  credentials: "include",
  timeout: 15_000,
  hooks: sharedHooks,
});

export const authApi = {
  clearSession() {
    authSession.clear();
  },
  getTokens() {
    return authSession.getTokens();
  },
  setTokens(tokens: AuthTokens) {
    authSession.setTokens(tokens);
  },
};

export function getResponseRequestId(response: Response) {
  return response.headers.get(REQUEST_ID_HEADER);
}

export async function parseJsonWithRequestId<T>(
  response: Response,
  parse: (value: unknown) => T,
): Promise<ApiResponseWithRequestId<T>> {
  const payload = (await response.json()) as unknown;

  return {
    data: parse(payload),
    requestId: getResponseRequestId(response),
  };
}

export function refreshAuthSession() {
  return refreshTokens({ allowCookieRefresh: true });
}

export const apiClient = ky.create({
  prefixUrl: config.apiUrl,
  credentials: "include",
  timeout: 15_000,
  hooks: {
    ...sharedHooks,
    afterResponse: [
      async (request, options, response) => {
        if (response.status !== 401) {
          return response;
        }

        const { auth, retryOnUnauthorized } = readContext(options);

        if (
          !retryOnUnauthorized ||
          auth === "refresh" ||
          isAuthRefreshRequest(request)
        ) {
          authSession.handleUnauthorized();
          return response;
        }

        const nextTokens = await refreshTokens({ allowCookieRefresh: true });

        if (!nextTokens) {
          authSession.handleUnauthorized();
          return response;
        }

        return apiClient(
          request,
          buildRetryOptions(request, options, nextTokens),
        );
      },
    ],
  },
});
