import type { QueryClient } from "@tanstack/react-query";
import { ActivityApi } from "@/features/activity/api/activity.api";
import { ActivityMessageCache } from "@/features/activity/api/activity-message-cache";
import {
  getActivityMutationKey,
  runExclusiveActivityMutation,
} from "@/features/activity/api/activity-mutation-lock";
import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import type { ChatApi, SavedMessageApi } from "@/shared/schemas";

type ConversationKind = "group" | "dm";
type ChatMutationKind = "muted" | "pinned" | "read";

type OptimisticChatMutationOptions = {
  chats: ChatApi[];
  conversationId: string;
  fallbackMessage: string;
  getOptimisticChat: (chat: ChatApi) => ChatApi;
  kind: ConversationKind;
  mutationKind: ChatMutationKind;
  persistChat: (chat: ChatApi) => Promise<ChatApi>;
  queryClient: QueryClient;
  toastId: (chatId: string) => string;
};

type ActivityFeedActionsOptions = {
  chats: ChatApi[];
  queryClient: QueryClient;
  refetchFeedQueries: () => Promise<void>;
  refetchSavedMessages: () => Promise<void>;
  savedMessagesById: Record<string, SavedMessageSnapshot>;
};

export function createActivityFeedActions({
  chats,
  queryClient,
  refetchFeedQueries,
  refetchSavedMessages,
  savedMessagesById,
}: ActivityFeedActionsOptions) {
  async function togglePinnedConversation(kind: ConversationKind, id: string) {
    await runOptimisticChatMutation({
      chats,
      conversationId: id,
      fallbackMessage: "We couldn't update that pinned chat.",
      getOptimisticChat: (chat) => ({ ...chat, isPinned: !chat.isPinned }),
      kind,
      mutationKind: "pinned",
      persistChat: (chat) =>
        chat.isPinned
          ? ActivityApi.unpinChat(chat.id)
          : ActivityApi.pinChat(chat.id),
      queryClient,
      toastId: (chatId) => `activity-chat-pin:${chatId}`,
    });
  }

  async function toggleMutedConversation(kind: ConversationKind, id: string) {
    await runOptimisticChatMutation({
      chats,
      conversationId: id,
      fallbackMessage: "We couldn't update notifications for this chat.",
      getOptimisticChat: (chat) => ({ ...chat, isMuted: !chat.isMuted }),
      kind,
      mutationKind: "muted",
      persistChat: (chat) =>
        chat.isMuted
          ? ActivityApi.unmuteChat(chat.id)
          : ActivityApi.muteChat(chat.id),
      queryClient,
      toastId: (chatId) => `activity-chat-mute:${chatId}`,
    });
  }

  async function markConversationRead(kind: ConversationKind, id: string) {
    await runOptimisticChatMutation({
      chats,
      conversationId: id,
      fallbackMessage: "We couldn't mark that chat as read.",
      getOptimisticChat: (chat) => ({
        ...chat,
        hasUnread: false,
        unreadCount: 0,
      }),
      kind,
      mutationKind: "read",
      persistChat: (chat) => ActivityApi.markChatRead(chat.id),
      queryClient,
      toastId: (chatId) => `activity-chat-read:${chatId}`,
    });
  }

  async function removeSavedMessage(messageId: string) {
    const snapshot = savedMessagesById[messageId];

    if (!snapshot) {
      return;
    }

    await runExclusiveActivityMutation(
      getActivityMutationKey("saved-message", messageId, "remove"),
      async () => {
        queryClient.setQueryData<SavedMessageApi[]>(
          ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
          (current) =>
            current?.filter((item) => item.messageId !== messageId) ?? current,
        );
        ActivityMessageCache.replace(snapshot.message.chatId, messageId, {
          ...snapshot.message,
          isSaved: false,
        });

        try {
          await ActivityApi.unsaveMessage(snapshot.message.chatId, messageId);
        } catch (error) {
          await recoverSavedMessageMutation(queryClient, snapshot);
          showAppErrorToast(error, {
            fallbackMessage: "We couldn't remove that saved message.",
            id: `activity-saved-message-remove:${messageId}`,
          });
        }
      },
    );
  }

  async function retryFeed() {
    await refetchFeedQueries();
  }

  async function retrySavedMessages() {
    await refetchSavedMessages();
  }

  return {
    togglePinnedConversation,
    toggleMutedConversation,
    markConversationRead,
    removeSavedMessage,
    retryFeed,
    retrySavedMessages,
  };
}

function findChatForConversation(
  chats: ChatApi[],
  kind: ConversationKind,
  id: string,
) {
  return chats.find((chat) =>
    kind === "group" ? chat.groupId === id : chat.id === id,
  );
}

function updateActivityChatCaches(
  queryClient: QueryClient,
  updatedChat: ChatApi,
) {
  queryClient.setQueryData<ChatApi[]>(ACTIVITY_CHATS_QUERY_KEY, (current) =>
    updateChatInList(current, updatedChat),
  );
  syncChatSelectionCaches(queryClient, updatedChat);
}

async function runOptimisticChatMutation({
  chats,
  conversationId,
  fallbackMessage,
  getOptimisticChat,
  kind,
  mutationKind,
  persistChat,
  queryClient,
  toastId,
}: OptimisticChatMutationOptions) {
  const chat = findChatForConversation(chats, kind, conversationId);

  if (!chat) {
    return;
  }

  await runExclusiveActivityMutation(
    getActivityMutationKey("chat", chat.id, mutationKind),
    async () => {
      updateActivityChatCaches(queryClient, getOptimisticChat(chat));

      try {
        updateActivityChatCaches(queryClient, await persistChat(chat));
      } catch (error) {
        await recoverChatMutation(queryClient, chat);
        showAppErrorToast(error, {
          fallbackMessage,
          id: toastId(chat.id),
        });
      }
    },
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
