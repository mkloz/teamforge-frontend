import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient, refreshAuthSession } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { appQueryClient } from "@/shared/api/query-client";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { fullUserResponseSchema } from "@/shared/schemas/user-response";

import { CURRENT_USER_QUERY_KEY } from "./current-user-cache";

export {
  CURRENT_USER_QUERY_KEY,
  clearCurrentUserCache,
} from "./current-user-cache";

const AUTH_SESSION_RESTORE_QUERY_KEY = ["auth", "session-restore"] as const;

function shouldSkipAuditSessionRestore() {
  return (
    import.meta.env.VITE_AUDIT_AUTH_ENABLED === "true" &&
    !authSession.hasTokens()
  );
}

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

interface RestoreAuthSessionQueryOptions {
  enabled?: boolean;
}

export function useRestoreAuthSessionQuery(
  options?: RestoreAuthSessionQueryOptions,
) {
  const { isAuthenticated } = useAuthSessionState();
  const isOnline = useNetworkStatus();
  const shouldRestore = options?.enabled ?? !isAuthenticated;

  return useQuery({
    queryKey: AUTH_SESSION_RESTORE_QUERY_KEY,
    queryFn: async () => (await refreshAuthSession()) !== null,
    enabled:
      shouldRestore &&
      !isAuthenticated &&
      isOnline &&
      !shouldSkipAuditSessionRestore(),
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
