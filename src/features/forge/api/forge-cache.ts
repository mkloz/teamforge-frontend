import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function invalidateRecentForgeActivities() {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.forge.recentActivities,
  });
}

export function invalidateForgeSearchState() {
  return Promise.all([
    invalidateRecentForgeActivities(),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.auth.currentUser,
    }),
  ]);
}
