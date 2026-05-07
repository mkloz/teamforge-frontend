import ky, { type Options } from "ky";

import { config } from "@/config/config";
import { parseApiError } from "@/shared/api/api-errors";
import {
  readApiRequestContext,
  type ApiAuthMode,
} from "@/shared/api/api-request-context";
import { authSession, type AuthTokens } from "@/shared/api/auth-session";

export {
  getResponseRequestId,
  parseJsonWithRequestId,
  REQUEST_ID_HEADER,
  type ApiResponseWithRequestId,
} from "@/shared/api/api-errors";
export type {
  ApiAuthMode,
  ApiRequestContext,
} from "@/shared/api/api-request-context";

const AUTH_REFRESH_PATH = "auth/refresh";
const AUTH_LOGOUT_PATH = "auth/logout";

let refreshPromise: Promise<AuthTokens | null> | null = null;

interface RefreshTokensOptions {
  allowCookieRefresh?: boolean;
}

function isAuthRefreshRequest(request: Request) {
  return request.url.includes(AUTH_REFRESH_PATH);
}

function isAuthLogoutRequest(request: Request) {
  return request.url.includes(AUTH_LOGOUT_PATH);
}

function applyAuthorizationHeader(request: Request, authMode: ApiAuthMode) {
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
      const { auth } = readApiRequestContext(options);

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

        const { auth, retryOnUnauthorized } = readApiRequestContext(options);

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
