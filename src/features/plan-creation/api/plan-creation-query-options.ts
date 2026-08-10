import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import { PlanCreationApi } from "./plan-creation.api";

export function planCreationFriendCandidatesQueryOptions(search: string) {
  return infiniteQueryOptions({
    queryKey: [...APP_QUERY_KEYS.groupFormation.friends, search] as const,
    queryFn: ({ pageParam }) =>
      PlanCreationApi.getFriendsPage(pageParam, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.totalPages
        ? lastPage.meta.currentPage + 1
        : undefined,
    staleTime: 60_000,
  });
}

export function planCreationFriendCompatibilityQueryOptions(input: {
  candidateIds: string[];
  groupId?: string | null;
  groupMemberIds: string[];
}) {
  const candidateIds = [...new Set(input.candidateIds)].sort();
  const groupMemberIds = [...new Set(input.groupMemberIds)].sort();

  return queryOptions({
    queryKey: [
      ...APP_QUERY_KEYS.groupFormation.friends,
      "compatibility",
      input.groupId ?? null,
      candidateIds,
      groupMemberIds,
    ] as const,
    queryFn: () =>
      PlanCreationApi.previewFriendCompatibility({
        candidateIds,
        groupId: input.groupId,
        groupMemberIds,
      }),
    staleTime: 60_000,
  });
}

export function planCreationRecentActivitiesQueryOptions() {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.groupFormation.recentActivities,
    queryFn: () => PlanCreationApi.getRecentActivities(),
    staleTime: 30_000,
  });
}
