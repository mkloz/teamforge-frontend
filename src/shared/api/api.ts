import ky, { type HTTPError, type Options } from "ky";

import { config } from "@/config/config";
import { authSession, type AuthTokens } from "@/shared/api/auth-session";
import type { ApiException } from "@/shared/types/api-error";

interface ApiRequestContext {
  auth?: "access" | "refresh" | "none";
  retryOnUnauthorized?: boolean;
}

const AUTH_REFRESH_PATH = "auth/refresh";
const AUTH_LOGOUT_PATH = "auth/logout";

let refreshPromise: Promise<AuthTokens | null> | null = null;

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

  if (!payload) {
    return error;
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

async function refreshTokens() {
  if (!authSession.getRefreshToken()) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = rawApiClient
      .post(AUTH_REFRESH_PATH, {
        context: {
          auth: "refresh",
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

export const apiClient = ky.create({
  prefixUrl: config.apiUrl,
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

        const nextTokens = await refreshTokens();

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
