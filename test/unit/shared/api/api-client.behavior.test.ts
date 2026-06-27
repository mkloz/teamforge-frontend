import { createUser } from "@test/support/factories/user";
import { apiRoute } from "@test/support/msw/api";
import { server } from "@test/support/msw/server";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { apiClient, authApi } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";
import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-cache";
import { appQueryClient } from "@/shared/api/query-client";

describe("apiClient auth behavior", () => {
  it("refreshes an expired access token and retries the original request", async () => {
    const requestAuthorizations: string[] = [];
    const refreshedUser = createUser({
      id: "user-refresh",
      name: "Refresh User",
    });

    authApi.setTokens({
      accessToken: "expired-access",
      refreshToken: "refresh-token",
    });

    server.use(
      http.get(apiRoute("groups"), ({ request }) => {
        requestAuthorizations.push(
          request.headers.get("authorization") ?? "missing",
        );

        if (requestAuthorizations.length === 1) {
          return new HttpResponse(null, { status: 401 });
        }

        return HttpResponse.json({ ok: true });
      }),
      http.post(apiRoute("auth/refresh"), ({ request }) => {
        expect(request.headers.get("authorization")).toBe(
          "Bearer refresh-token",
        );

        return HttpResponse.json({
          accessToken: "fresh-access",
          refreshToken: "fresh-refresh",
          currentUser: refreshedUser,
        });
      }),
    );

    await expect(apiClient.get("groups").json()).resolves.toEqual({
      ok: true,
    });

    expect(requestAuthorizations).toEqual([
      "Bearer expired-access",
      "Bearer fresh-access",
    ]);
    expect(authApi.getTokens()).toEqual({
      accessToken: "fresh-access",
      refreshToken: "fresh-refresh",
    });
    expect(appQueryClient.getQueryData(CURRENT_USER_QUERY_KEY)).toMatchObject({
      id: "user-refresh",
      name: "Refresh User",
    });
  });

  it("clears the session when refresh is rejected", async () => {
    let unauthorizedCalls = 0;
    const unsetUnauthorizedHandler = authSession.setUnauthorizedHandler(() => {
      unauthorizedCalls += 1;
    });

    authApi.setTokens({
      accessToken: "expired-access",
      refreshToken: "refresh-token",
    });

    server.use(
      http.get(
        apiRoute("groups"),
        () => new HttpResponse(null, { status: 401 }),
      ),
      http.post(
        apiRoute("auth/refresh"),
        () => new HttpResponse(null, { status: 401 }),
      ),
    );

    try {
      await expect(apiClient.get("groups").json()).rejects.toMatchObject({
        response: expect.objectContaining({ status: 401 }),
      });
      expect(authApi.getTokens()).toBeNull();
      expect(unauthorizedCalls).toBe(1);
    } finally {
      unsetUnauthorizedHandler();
    }
  });
});
