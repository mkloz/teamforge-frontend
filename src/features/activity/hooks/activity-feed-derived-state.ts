import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useEffect, useState } from "react";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import {
  type ActivityFeedFilter,
  type ActivityTypingByChatId,
  composeActivityFeedDerivedState,
  deriveActivityFeedStatus,
  deriveLoadedActivityFeedData,
  deriveSavedMessageData,
  getPinnedConversationKeys,
} from "@/features/activity/hooks/activity-feed-status-data-derivation";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";

const FEED_ENHANCEMENT_DELAY_MS = 2500;

type UseActivityFeedDerivedStateOptions = {
  activeFilter: ActivityFeedFilter;
  searchQuery: string;
  typingByChatId: ActivityTypingByChatId;
};

type ActivityFeedQueries = ReturnType<typeof useActivityFeedQueries>;
type SavedMessagesQuery = ReturnType<typeof useSavedMessagesQuery>;

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

function useActivityFeedQueries() {
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const groupsQuery = useQuery(ActivityQueryFactory.groups());
  const chatsQuery = useQuery(ActivityQueryFactory.chats());
  const friendshipsQuery = useQuery(ActivityQueryFactory.friendships());

  return {
    currentUserQuery,
    groupsQuery,
    chatsQuery,
    friendshipsQuery,
  };
}

function useSavedMessagesQuery(
  activeFilter: ActivityFeedFilter,
  shouldLoadFeedEnhancements: boolean,
) {
  return useQuery({
    ...ActivityQueryFactory.savedMessages(),
    enabled: activeFilter === "saved" || shouldLoadFeedEnhancements,
  });
}

function useFeedEnhancementDelay(
  hasLoadedBaseData: boolean,
  setShouldLoadFeedEnhancements: (shouldLoad: boolean) => void,
) {
  useEffect(() => {
    let timeoutId: number | undefined;

    if (!hasLoadedBaseData) {
      setShouldLoadFeedEnhancements(false);
    } else {
      timeoutId = window.setTimeout(() => {
        setShouldLoadFeedEnhancements(true);
      }, FEED_ENHANCEMENT_DELAY_MS);
    }

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [hasLoadedBaseData, setShouldLoadFeedEnhancements]);
}

function hasConversationBaseData({
  chatsQuery,
  currentUserQuery,
  groupsQuery,
}: ActivityFeedQueries) {
  return Boolean(currentUserQuery.data && groupsQuery.data && chatsQuery.data);
}

function createActivityFeedRefetchers(
  {
    chatsQuery,
    currentUserQuery,
    friendshipsQuery,
    groupsQuery,
  }: ActivityFeedQueries,
  savedMessagesQuery: SavedMessagesQuery,
) {
  async function refetchFeedQueries() {
    await Promise.allSettled([
      currentUserQuery.refetch(),
      groupsQuery.refetch(),
      chatsQuery.refetch(),
      friendshipsQuery.refetch(),
      savedMessagesQuery.refetch(),
    ]);
  }

  async function refetchSavedMessages() {
    await savedMessagesQuery.refetch();
  }

  return {
    refetchFeedQueries,
    refetchSavedMessages,
  };
}
