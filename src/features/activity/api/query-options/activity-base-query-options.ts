import { queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import { ActivityApi } from "@/features/activity/api/activity.api";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_FRIENDSHIPS_QUERY_KEY,
  ACTIVITY_GROUPS_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";

export function groupsQueryOptions() {
  return queryOptions({
    queryKey: ACTIVITY_GROUPS_QUERY_KEY,
    queryFn: () => ActivityApi.getGroups(),
    staleTime: 30_000,
  });
}

export function chatsQueryOptions() {
  return queryOptions({
    queryKey: ACTIVITY_CHATS_QUERY_KEY,
    queryFn: () => ActivityApi.getChats(),
    staleTime: 30_000,
  });
}

export function friendshipsQueryOptions() {
  return queryOptions({
    queryKey: ACTIVITY_FRIENDSHIPS_QUERY_KEY,
    queryFn: () => ActivityApi.getFriendships(),
    staleTime: 30_000,
  });
}

export function groupRatingsQueryOptions(groupId: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.activity.groupRatings(groupId),
    queryFn: () => ActivityApi.getGroupRatings(groupId),
    enabled: groupId.length > 0,
    staleTime: 30_000,
  });
}

export function linkPreviewQueryOptions(url: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.activity.linkPreview(url),
    queryFn: () => ActivityApi.getLinkPreview(url),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
