import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

import { apiClient } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";
import { appQueryClient } from "@/shared/api/query-client";
import { fullUserResponseSchema } from "@/shared/schemas";

import { APP_QUERY_KEYS } from "./query-keys";

export const CURRENT_USER_QUERY_KEY = APP_QUERY_KEYS.auth.currentUser;

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get("users/me").json<unknown>();

      return fullUserResponseSchema.parse(response);
    },
    staleTime: 60_000,
  });
}

export function useAuthSessionState() {
  const tokens = useSyncExternalStore(
    (listener) => authSession.subscribe(listener),
    () => authSession.getTokens(),
    () => authSession.getTokens(),
  );

  return {
    tokens,
    isAuthenticated: tokens !== null,
  };
}

export function useCurrentUserQuery() {
  const { isAuthenticated } = useAuthSessionState();

  return useQuery({
    ...currentUserQueryOptions(),
    enabled: isAuthenticated,
  });
}

export async function ensureCurrentUser() {
  if (!authSession.hasTokens()) {
    return null;
  }

  return appQueryClient.ensureQueryData(currentUserQueryOptions());
}

export function clearCurrentUserCache() {
  appQueryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
}

export function useInvalidateCurrentUser() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: CURRENT_USER_QUERY_KEY,
    });
}
