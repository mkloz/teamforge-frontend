import { queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import { ForgeApi } from "./forge.api";

export function forgeFriendCandidatesQueryOptions() {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.forge.friends,
    queryFn: () => ForgeApi.getFriends(),
    staleTime: 60_000,
  });
}

export function forgeRecentActivitiesQueryOptions() {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.forge.recentActivities,
    queryFn: () => ForgeApi.getRecentActivities(),
    staleTime: 30_000,
  });
}
