import { useQueryClient } from "@tanstack/react-query";
import { createActivityFeedActions } from "@/features/activity/hooks/activity-feed-actions";
import { useActivityFeedDerivedState } from "@/features/activity/hooks/activity-feed-derived-state";
import { useActivityStore } from "@/features/activity/store/activity.store";

export function useActivityFeed() {
  const queryClient = useQueryClient();
  const searchQuery = useActivityStore((state) => state.searchQuery);
  const activeFilter = useActivityStore((state) => state.activeFilter);
  const sidebarDensity = useActivityStore((state) => state.sidebarDensity);
  const typingByChatId = useActivityStore((state) => state.typingByChatId);
  const setSearchQuery = useActivityStore((state) => state.setSearchQuery);
  const setActiveFilter = useActivityStore((state) => state.setActiveFilter);
  const setSidebarDensity = useActivityStore(
    (state) => state.setSidebarDensity,
  );
  const {
    allItems,
    allUnreadMessageCount,
    chats,
    dmCount,
    dmUnreadMessageCount,
    filteredItems,
    groupCount,
    groupUnreadMessageCount,
    isFeedError,
    isFeedRetrying,
    isInitialLoading,
    isSavedMessagesError,
    isSavedMessagesLoading,
    isSavedMessagesRetrying,
    pinnedCount,
    pinnedUnreadMessageCount,
    refetchFeedQueries,
    refetchSavedMessages,
    savedCount,
    savedMessages,
    savedMessagesById,
    unreadCount,
  } = useActivityFeedDerivedState({
    activeFilter,
    searchQuery,
    typingByChatId,
  });
  const {
    markConversationRead,
    removeSavedMessage,
    retryFeed,
    retrySavedMessages,
    toggleMutedConversation,
    togglePinnedConversation,
  } = createActivityFeedActions({
    chats,
    queryClient,
    refetchFeedQueries,
    refetchSavedMessages,
    savedMessagesById,
  });

  return {
    searchQuery,
    activeFilter,
    sidebarDensity,
    isInitialLoading,
    isFeedError,
    isFeedRetrying,
    isSavedMessagesError,
    isSavedMessagesLoading,
    isSavedMessagesRetrying,
    allItems,
    filteredItems,
    groupCount,
    dmCount,
    unreadCount,
    pinnedCount,
    allUnreadMessageCount,
    groupUnreadMessageCount,
    dmUnreadMessageCount,
    pinnedUnreadMessageCount,
    savedCount,
    setSearchQuery,
    setActiveFilter,
    setSidebarDensity,
    togglePinnedConversation,
    toggleMutedConversation,
    markConversationRead,
    removeSavedMessage,
    retryFeed,
    retrySavedMessages,
    savedMessages,
  };
}
