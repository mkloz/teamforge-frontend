import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

import { apiClient, authApi } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";
import { appQueryClient } from "@/shared/api/query-client";
import { fullUserResponseSchema, type User } from "@/shared/schemas";
import { getPostAuthRedirectPath } from "../lib/post-auth-route";

export class AuthQueries {
  static currentUserQueryKey = ["auth", "current-user"] as const;

  static currentUser() {
    return queryOptions({
      queryKey: AuthQueries.currentUserQueryKey,
      queryFn: async () => {
        const response = await apiClient.get("users/me").json<unknown>();

        return fullUserResponseSchema.parse(response);
      },
      staleTime: 60_000,
    });
  }

  static useAuthSessionState() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tokens = useSyncExternalStore(
      authSession.subscribe,
      authSession.getTokens,
      authSession.getTokens,
    );

    return {
      tokens,
      isAuthenticated: tokens !== null,
    };
  }

  static useCurrentUser() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isAuthenticated } = AuthQueries.useAuthSessionState();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery({
      ...AuthQueries.currentUser(),
      enabled: isAuthenticated,
    });
  }

  static async ensureCurrentUser() {
    if (!authSession.hasTokens()) {
      return null;
    }

    return appQueryClient.ensureQueryData(AuthQueries.currentUser());
  }

  static clearCurrentUserCache() {
    appQueryClient.removeQueries({ queryKey: AuthQueries.currentUserQueryKey });
  }

  static useInvalidateCurrentUser() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const queryClient = useQueryClient();

    return () =>
      queryClient.invalidateQueries({
        queryKey: AuthQueries.currentUserQueryKey,
      });
  }

  static clearAuthState() {
    AuthQueries.clearCurrentUserCache();
    authApi.clearSession();
  }

  static getPostAuthRedirectPath(user: User | null | undefined) {
    return getPostAuthRedirectPath(user);
  }
}
