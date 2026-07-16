import type { QueryClient } from "@tanstack/react-query";

import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function resetViewerProfileQueries(
  queryClient: QueryClient = appQueryClient,
) {
  return queryClient.resetQueries({
    queryKey: APP_QUERY_KEYS.profile.viewerProfiles,
  });
}

export function resetViewerProfileById(
  userId: string,
  queryClient: QueryClient = appQueryClient,
) {
  return queryClient.resetQueries({
    exact: true,
    queryKey: APP_QUERY_KEYS.profile.byId(userId),
  });
}
