import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import { ForgeApi } from "./forge.api";

export function forgeFriendCandidatesQueryOptions(search: string) {
  return infiniteQueryOptions({
    queryKey: [...APP_QUERY_KEYS.forge.friends, search] as const,
    queryFn: ({ pageParam }) => ForgeApi.getFriendsPage(pageParam, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.totalPages
        ? lastPage.meta.currentPage + 1
        : undefined,
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
