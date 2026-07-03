import { useQuery } from "@tanstack/react-query";
import { activityQueries } from "@/features/activity/api/activity-queries";
import type { ActivityFeedFilter } from "@/features/activity/hooks/activity-feed-status-data-derivation";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";

export function useActivityFeedQueries() {
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const groupsQuery = useQuery(activityQueries.groups());
  const chatsQuery = useQuery(activityQueries.chats());
  const friendshipsQuery = useQuery(activityQueries.friendships());

  return {
    currentUserQuery,
    groupsQuery,
    chatsQuery,
    friendshipsQuery,
  };
}

export function useSavedMessagesQuery(
  activeFilter: ActivityFeedFilter,
  shouldLoadFeedEnhancements: boolean,
) {
  return useQuery({
    ...activityQueries.savedMessages(),
    enabled: activeFilter === "saved" || shouldLoadFeedEnhancements,
  });
}

export function hasConversationBaseData({
  chatsQuery,
  currentUserQuery,
  groupsQuery,
}: ActivityFeedQueries) {
  return Boolean(currentUserQuery.data && groupsQuery.data && chatsQuery.data);
}

export type ActivityFeedQueries = ReturnType<typeof useActivityFeedQueries>;
export type SavedMessagesQuery = ReturnType<typeof useSavedMessagesQuery>;
