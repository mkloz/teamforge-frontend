import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient, refreshAuthSession } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { appQueryClient } from "@/shared/api/query-client";
import { fullUserResponseSchema } from "@/shared/schemas/user-response";

import { CURRENT_USER_QUERY_KEY } from "./current-user-cache";

export { useAuthSessionState } from "./auth-session-state";
export {
  CURRENT_USER_QUERY_KEY,
  clearCurrentUserCache,
} from "./current-user-cache";

export const AUTH_SESSION_RESTORE_QUERY_KEY = [
  "auth",
  "session-restore",
] as const;

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

export function useRestoreAuthSessionQuery() {
  const { isAuthenticated } = useAuthSessionState();

  return useQuery({
    queryKey: AUTH_SESSION_RESTORE_QUERY_KEY,
    queryFn: async () => (await refreshAuthSession()) !== null,
    enabled: !isAuthenticated,
    retry: false,
    staleTime: 30_000,
  });
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

export function useInvalidateCurrentUser() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: CURRENT_USER_QUERY_KEY,
    });
}
