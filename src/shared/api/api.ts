import ky, { type Options } from "ky";

import { config } from "@/config/config";
import { parseApiError } from "@/shared/api/api-errors";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import {
  type ApiAuthMode,
  readApiRequestContext,
} from "@/shared/api/api-request-context";
import { type AuthTokens, authSession } from "@/shared/api/auth-session";
import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-cache";
import { appQueryClient } from "@/shared/api/query-client";
import { fullUserResponseSchema } from "@/shared/schemas/user-response";

export {
  type ApiResponseWithRequestId,
  getResponseRequestId,
  parseJsonWithRequestId,
} from "@/shared/api/api-errors";

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
      ...options.context,
      auth: "access",
      retryOnUnauthorized: false,
    },
  };
}

function shouldHandleUnauthorizedWithoutRetry(
  request: Request,
  options: Options,
) {
  const { auth, retryOnUnauthorized } = readApiRequestContext(options);

  return (
    !retryOnUnauthorized || auth === "refresh" || isAuthRefreshRequest(request)
  );
}

async function refreshTokensForUnauthorizedResponse() {
  try {
    return await refreshTokens({ allowCookieRefresh: true });
  } catch (error) {
    if (isApiNetworkError(error)) {
      throw error;
    }
  }

  return null;
}

async function handleUnauthorizedResponse(
  request: Request,
  options: Options,
  response: Response,
) {
  if (response.status !== 401) {
    return response;
  }

  if (shouldHandleUnauthorizedWithoutRetry(request, options)) {
    authSession.handleUnauthorized();
    return response;
  }

  const nextTokens = await refreshTokensForUnauthorizedResponse();

  if (!nextTokens) {
    authSession.handleUnauthorized();
    return response;
  }

  return apiClient(request, buildRetryOptions(request, options, nextTokens));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAuthRefreshPayload(payload: unknown) {
  if (!isRecord(payload) || typeof payload.accessToken !== "string") {
    throw new Error("Refresh response did not include an access token.");
  }

  return {
    accessToken: payload.accessToken,
    refreshToken:
      typeof payload.refreshToken === "string"
        ? payload.refreshToken
        : undefined,
    currentUser: payload.currentUser
      ? fullUserResponseSchema.parse(payload.currentUser)
      : undefined,
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
      .json<unknown>()
      .then((payload) => {
        const refreshResponse = parseAuthRefreshPayload(payload);
        const nextTokens: AuthTokens = {
          accessToken: refreshResponse.accessToken,
          refreshToken: refreshResponse.refreshToken,
        };

        authSession.setTokens(nextTokens);

        if (refreshResponse.currentUser) {
          appQueryClient.setQueryData(
            CURRENT_USER_QUERY_KEY,
            refreshResponse.currentUser,
          );
        }

        return nextTokens;
      })
      .catch((error: unknown) => {
        if (isApiNetworkError(error)) {
          throw error;
        }

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
  cache: "no-store",
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
  cache: "no-store",
  credentials: "include",
  timeout: 15_000,
  hooks: {
    ...sharedHooks,
    afterResponse: [handleUnauthorizedResponse],
  },
});
