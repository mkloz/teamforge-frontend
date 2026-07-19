import { useQueryClient } from "@tanstack/react-query";
import { createActivityFeedActions } from "@/features/activity/hooks/activity-feed-actions";
import { useActivityFeedDerivedState } from "@/features/activity/hooks/activity-feed-derived-state";
import {
  useActivityListControlActions,
  useActivityListDisplayState,
} from "@/features/activity/hooks/use-activity-list-store-controls";
import { getConversationIsNotes } from "@/features/activity/lib/unify-conversations";
import { useActivityStore } from "@/features/activity/store/activity.store";

export function useActivityFeed() {
  const queryClient = useQueryClient();
  const { activeFilter, searchQuery, sidebarDensity } =
    useActivityListDisplayState();
  const typingByChatId = useActivityStore((state) => state.typingByChatId);
  const { setActiveFilter, setSearchQuery, setSidebarDensity } =
    useActivityListControlActions();
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
  const isSharedConversationFeedEmpty =
    !isInitialLoading &&
    !isFeedError &&
    !allItems.some((item) => !getConversationIsNotes(item));

  return {
    searchQuery,
    activeFilter,
    sidebarDensity,
    isInitialLoading,
    isFeedError,
    isFeedRetrying,
    isSharedConversationFeedEmpty,
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
