import type {
  ActivityFeedData,
  ActivityFeedReturnStateOptions,
} from "@/features/activity/hooks/activity-feed-status-data-derivation/types";

type ActivityFeedCountKey =
  | "groupCount"
  | "dmCount"
  | "unreadCount"
  | "pinnedCount"
  | "allUnreadMessageCount"
  | "groupUnreadMessageCount"
  | "dmUnreadMessageCount"
  | "pinnedUnreadMessageCount"
  | "savedCount";

export function composeActivityFeedDerivedState({
  chats,
  feedData,
  refetchFeedQueries,
  refetchSavedMessages,
  savedMessages,
  savedMessagesById,
  status,
}: ActivityFeedReturnStateOptions) {
  const feedCounts = getActivityFeedCounts(feedData);
  const feedItems = getActivityFeedItems(feedData);

  return {
    ...status,
    ...feedItems,
    ...feedCounts,
    chats: chats ?? [],
    savedMessages,
    savedMessagesById,
    refetchFeedQueries,
    refetchSavedMessages,
  };
}

function getActivityFeedItems(feedData: ActivityFeedData | null) {
  return {
    allItems: feedData?.allItems ?? [],
    filteredItems: feedData?.items ?? [],
  };
}

function getActivityFeedCounts(feedData: ActivityFeedData | null) {
  return {
    groupCount: getActivityFeedCount(feedData, "groupCount"),
    dmCount: getActivityFeedCount(feedData, "dmCount"),
    unreadCount: getActivityFeedCount(feedData, "unreadCount"),
    pinnedCount: getActivityFeedCount(feedData, "pinnedCount"),
    allUnreadMessageCount: getActivityFeedCount(
      feedData,
      "allUnreadMessageCount",
    ),
    groupUnreadMessageCount: getActivityFeedCount(
      feedData,
      "groupUnreadMessageCount",
    ),
    dmUnreadMessageCount: getActivityFeedCount(
      feedData,
      "dmUnreadMessageCount",
    ),
    pinnedUnreadMessageCount: getActivityFeedCount(
      feedData,
      "pinnedUnreadMessageCount",
    ),
    savedCount: getActivityFeedCount(feedData, "savedCount"),
  };
}

function getActivityFeedCount(
  feedData: ActivityFeedData | null,
  key: ActivityFeedCountKey,
) {
  return feedData?.[key] ?? 0;
}
