import type { AutoForgeRequest } from "@/features/forge/schemas/auto-forge-request.schema";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function setCurrentAutoForgeRequest(request: AutoForgeRequest | null) {
  appQueryClient.setQueryData(APP_QUERY_KEYS.forge.currentAutoRequest, request);
}

export function invalidateCurrentAutoForgeRequest() {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.forge.currentAutoRequest,
  });
}

export function invalidateRecentForgeActivities() {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.forge.recentActivities,
  });
}

export function invalidateForgeSearchState() {
  return Promise.all([
    invalidateCurrentAutoForgeRequest(),
    invalidateRecentForgeActivities(),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.auth.currentUser,
    }),
  ]);
}
