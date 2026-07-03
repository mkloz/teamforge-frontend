import { useDeferredValue, useState } from "react";
import { useFeedEnhancementDelay } from "@/features/activity/hooks/activity-feed-derived-state/feed-enhancement-delay";
import {
  hasConversationBaseData,
  useActivityFeedQueries,
  useSavedMessagesQuery,
} from "@/features/activity/hooks/activity-feed-derived-state/queries";
import { createActivityFeedRefetchers } from "@/features/activity/hooks/activity-feed-derived-state/refetchers";
import {
  type ActivityFeedFilter,
  type ActivityTypingByChatId,
  composeActivityFeedDerivedState,
  deriveActivityFeedStatus,
  deriveLoadedActivityFeedData,
  deriveSavedMessageData,
  getPinnedConversationKeys,
} from "@/features/activity/hooks/activity-feed-status-data-derivation";

type UseActivityFeedDerivedStateOptions = {
  activeFilter: ActivityFeedFilter;
  searchQuery: string;
  typingByChatId: ActivityTypingByChatId;
};

export function useActivityFeedDerivedState({
  activeFilter,
  searchQuery,
  typingByChatId,
}: UseActivityFeedDerivedStateOptions) {
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const queries = useActivityFeedQueries();
  const needsFriendshipData = activeFilter === "direct";
  const [shouldLoadFeedEnhancements, setShouldLoadFeedEnhancements] =
    useState(false);
  const savedMessagesQuery = useSavedMessagesQuery(
    activeFilter,
    shouldLoadFeedEnhancements,
  );
  useFeedEnhancementDelay(
    hasConversationBaseData(queries),
    setShouldLoadFeedEnhancements,
  );
  const { savedMessages, savedMessagesById } = deriveSavedMessageData(
    savedMessagesQuery.data ?? [],
    queries.currentUserQuery.data,
  );
  const feedData = deriveLoadedActivityFeedData({
    activeFilter,
    chats: queries.chatsQuery.data,
    currentUser: queries.currentUserQuery.data,
    deferredSearchQuery,
    friendships: queries.friendshipsQuery.data,
    groups: queries.groupsQuery.data,
    needsFriendshipData,
    pinnedConversationKeys: getPinnedConversationKeys(
      queries.chatsQuery.data ?? [],
    ),
    savedMessagesById,
    typingByChatId,
  });
  const status = deriveActivityFeedStatus({
    activeFilter,
    chatsQuery: queries.chatsQuery,
    currentUserQuery: queries.currentUserQuery,
    feedData,
    friendshipsQuery: queries.friendshipsQuery,
    groupsQuery: queries.groupsQuery,
    needsFriendshipData,
    savedMessagesQuery,
  });

  return composeActivityFeedDerivedState({
    chats: queries.chatsQuery.data,
    feedData,
    savedMessages,
    savedMessagesById,
    status,
    ...createActivityFeedRefetchers(queries, savedMessagesQuery),
  });
}
