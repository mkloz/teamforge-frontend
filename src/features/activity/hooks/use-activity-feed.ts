import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDeferredValue } from "react";
import { ActivityApi } from "@/features/activity/api/activity.api";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import {
  mapSavedMessageApi,
  type SavedMessageSnapshot,
} from "@/features/activity/lib/saved-message";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import type { ChatApi, SavedMessageApi } from "@/shared/schemas";

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

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const groupsQuery = useQuery(ActivityQueryFactory.groups());
  const chatsQuery = useQuery(ActivityQueryFactory.chats());
  const friendshipsQuery = useQuery(ActivityQueryFactory.friendships());
  const savedMessagesQuery = useQuery(ActivityQueryFactory.savedMessages());
  const savedMessages = currentUserQuery.data
    ? mapSavedMessages(savedMessagesQuery.data ?? [], currentUserQuery.data.id)
    : [];
  const savedMessagesById = Object.fromEntries(
    savedMessages.map((snapshot) => [snapshot.message.id, snapshot]),
  );
  const pinnedConversationKeys = getPinnedConversationKeys(
    chatsQuery.data ?? [],
  );

  const feedData =
    currentUserQuery.data &&
    groupsQuery.data &&
    chatsQuery.data &&
    friendshipsQuery.data
      ? ActivityQueryFactory.deriveFeedData(
          activeFilter,
          deferredSearchQuery,
          groupsQuery.data,
          chatsQuery.data,
          friendshipsQuery.data,
          currentUserQuery.data,
          typingByChatId,
          {
            pinnedConversationKeys,
            savedMessagesById,
          },
        )
      : null;
  const hasBaseDataError =
    feedData === null &&
    (currentUserQuery.isError ||
      groupsQuery.isError ||
      chatsQuery.isError ||
      friendshipsQuery.isError);
  const hasSavedMessagesError =
    activeFilter === "saved" && savedMessagesQuery.isError;
  const isFeedError = hasBaseDataError || hasSavedMessagesError;
  const isFeedRetrying =
    currentUserQuery.isFetching ||
    groupsQuery.isFetching ||
    chatsQuery.isFetching ||
    friendshipsQuery.isFetching ||
    savedMessagesQuery.isFetching;
  const isInitialLoading =
    feedData === null &&
    (currentUserQuery.isPending ||
      groupsQuery.isPending ||
      chatsQuery.isPending ||
      friendshipsQuery.isPending);

  async function togglePinnedConversation(kind: "group" | "dm", id: string) {
    const chat = findChatForConversation(chatsQuery.data ?? [], kind, id);

    if (!chat) {
      return;
    }

    try {
      const updatedChat = chat.isPinned
        ? await ActivityApi.unpinChat(chat.id)
        : await ActivityApi.pinChat(chat.id);

      queryClient.setQueryData<ChatApi[]>(ACTIVITY_CHATS_QUERY_KEY, (current) =>
        updateChatInList(current, updatedChat),
      );
      syncChatSelectionCaches(queryClient, updatedChat);
    } catch (error) {
      await recoverChatMutation(queryClient, chat);
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't update that pinned chat.",
        id: `activity-chat-pin:${chat.id}`,
      });
    }
  }

  async function toggleMutedConversation(kind: "group" | "dm", id: string) {
    const chat = findChatForConversation(chatsQuery.data ?? [], kind, id);

    if (!chat) {
      return;
    }

    try {
      const updatedChat = chat.isMuted
        ? await ActivityApi.unmuteChat(chat.id)
        : await ActivityApi.muteChat(chat.id);

      queryClient.setQueryData<ChatApi[]>(ACTIVITY_CHATS_QUERY_KEY, (current) =>
        updateChatInList(current, updatedChat),
      );
      syncChatSelectionCaches(queryClient, updatedChat);
    } catch (error) {
      await recoverChatMutation(queryClient, chat);
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't update notifications for this chat.",
        id: `activity-chat-mute:${chat.id}`,
      });
    }
  }

  async function markConversationRead(kind: "group" | "dm", id: string) {
    const chat = findChatForConversation(chatsQuery.data ?? [], kind, id);

    if (!chat) {
      return;
    }

    try {
      const updatedChat = await ActivityApi.markChatRead(chat.id);

      queryClient.setQueryData<ChatApi[]>(ACTIVITY_CHATS_QUERY_KEY, (current) =>
        updateChatInList(current, updatedChat),
      );
      syncChatSelectionCaches(queryClient, updatedChat);
    } catch (error) {
      await recoverChatMutation(queryClient, chat);
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't mark that chat as read.",
        id: `activity-chat-read:${chat.id}`,
      });
    }
  }

  async function removeSavedMessage(messageId: string) {
    const snapshot = savedMessagesById[messageId];

    if (!snapshot) {
      return;
    }

    try {
      await ActivityApi.unsaveMessage(snapshot.message.chatId, messageId);
      queryClient.setQueryData<SavedMessageApi[]>(
        ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
        (current) =>
          current?.filter((item) => item.messageId !== messageId) ?? current,
      );
      ActivityMessageCache.replace(snapshot.message.chatId, messageId, {
        ...snapshot.message,
        isSaved: false,
      });
    } catch (error) {
      await recoverSavedMessageMutation(queryClient, snapshot);
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't remove that saved message.",
        id: `activity-saved-message-remove:${messageId}`,
      });
    }
  }

  async function retryFeed() {
    await Promise.allSettled([
      currentUserQuery.refetch(),
      groupsQuery.refetch(),
      chatsQuery.refetch(),
      friendshipsQuery.refetch(),
      savedMessagesQuery.refetch(),
    ]);
  }

  return {
    searchQuery,
    activeFilter,
    sidebarDensity,
    isInitialLoading,
    isFeedError,
    isFeedRetrying,
    allItems: feedData?.allItems ?? [],
    filteredItems: feedData?.items ?? [],
    groupCount: feedData?.groupCount ?? 0,
    dmCount: feedData?.dmCount ?? 0,
    unreadCount: feedData?.unreadCount ?? 0,
    pinnedCount: feedData?.pinnedCount ?? 0,
    savedCount: feedData?.savedCount ?? 0,
    setSearchQuery,
    setActiveFilter,
    setSidebarDensity,
    togglePinnedConversation,
    toggleMutedConversation,
    markConversationRead,
    removeSavedMessage,
    retryFeed,
    savedMessages,
  };
}

function mapSavedMessages(
  items: SavedMessageApi[],
  currentUserId: string,
): SavedMessageSnapshot[] {
  return items
    .map((item) => mapSavedMessageApi(item, currentUserId))
    .filter((item): item is SavedMessageSnapshot => item !== null)
    .sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
}

function getPinnedConversationKeys(chats: ChatApi[]) {
  const notesChat = chats.find((chat) => chat.type === "NOTES");
  const notesKey = notesChat
    ? getActivityConversationKey("dm", notesChat.id)
    : null;

  const pinnedKeys = chats.flatMap((chat) => {
    if (!chat.isPinned) {
      return [];
    }

    if (chat.type === "GROUP") {
      return chat.groupId
        ? [getActivityConversationKey("group", chat.groupId)]
        : [];
    }

    return [getActivityConversationKey("dm", chat.id)];
  });

  return [...pinnedKeys].sort((left, right) => {
    if (!notesKey) {
      return 0;
    }

    if (left === notesKey && right !== notesKey) {
      return -1;
    }

    if (right === notesKey && left !== notesKey) {
      return 1;
    }

    return 0;
  });
}

function findChatForConversation(
  chats: ChatApi[],
  kind: "group" | "dm",
  id: string,
) {
  return chats.find((chat) =>
    kind === "group" ? chat.groupId === id : chat.id === id,
  );
}

function updateChatInList(
  current: ChatApi[] | undefined,
  updatedChat: ChatApi,
) {
  return (
    current?.map((item) =>
      item.id === updatedChat.id ? { ...item, ...updatedChat } : item,
    ) ?? current
  );
}

function syncChatSelectionCaches(
  queryClient: QueryClient,
  updatedChat: ChatApi,
) {
  queryClient.setQueryData<ActivityDirectSelectionData>(
    APP_QUERY_KEYS.activity.directSelectionByChatId(updatedChat.id),
    (current) =>
      current?.chat
        ? {
            ...current,
            chat: {
              ...current.chat,
              hasUnread: updatedChat.hasUnread,
              isPinned: updatedChat.isPinned,
              isMuted: updatedChat.isMuted,
              unreadCount: updatedChat.unreadCount,
            },
          }
        : current,
  );

  if (!updatedChat.groupId) {
    return;
  }

  queryClient.setQueryData<ActivityGroupSelectionData>(
    APP_QUERY_KEYS.activity.groupSelectionById(updatedChat.groupId),
    (current) =>
      current?.group
        ? {
            ...current,
            group: {
              ...current.group,
              chat: current.group.chat
                ? {
                    ...current.group.chat,
                    hasUnread: updatedChat.hasUnread,
                    isPinned: updatedChat.isPinned,
                    isMuted: updatedChat.isMuted,
                    unreadCount: updatedChat.unreadCount,
                  }
                : current.group.chat,
            },
          }
        : current,
  );
}

async function recoverChatMutation(queryClient: QueryClient, chat: ChatApi) {
  await Promise.allSettled([
    queryClient.invalidateQueries({ queryKey: ACTIVITY_CHATS_QUERY_KEY }),
    chat.groupId
      ? queryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.activity.groupSelectionById(chat.groupId),
        })
      : queryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.activity.directSelectionByChatId(chat.id),
        }),
  ]);
}

async function recoverSavedMessageMutation(
  queryClient: QueryClient,
  snapshot: SavedMessageSnapshot,
) {
  await Promise.allSettled([
    queryClient.invalidateQueries({
      queryKey: ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
    }),
    queryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.messages(snapshot.message.chatId),
    }),
  ]);
}
