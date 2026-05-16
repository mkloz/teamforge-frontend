import { queryOptions } from "@tanstack/react-query";
import { ActivityApi } from "@/features/activity/api/activity.api";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_FRIENDSHIPS_QUERY_KEY,
  ACTIVITY_GROUPS_QUERY_KEY,
  ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

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

export function savedMessagesQueryOptions() {
  return queryOptions({
    queryKey: ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
    queryFn: () => ActivityApi.getSavedMessages(),
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

export function groupReviewStateQueryOptions(groupId: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.activity.groupReviewState(groupId),
    queryFn: () => ActivityApi.getGroupReviewState(groupId),
    enabled: groupId.length > 0,
    staleTime: 15_000,
  });
}

export function linkPreviewQueryOptions(url: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.activity.linkPreview(url),
    queryFn: async () => {
      try {
        return await ActivityApi.getLinkPreview(url);
      } catch {
        return null;
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
  });
}
