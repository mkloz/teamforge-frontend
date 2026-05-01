import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ChatApi, MessageApi } from "@/shared/schemas";

import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import { ACTIVITY_CHATS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import {
  getMessageVersion,
  shouldReplaceApiMessage,
  shouldReplaceMessage,
  toMessageApi,
} from "@/features/activity/api/activity-message-cache";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export const ActivityPinnedMessageCache = {
  removePinnedMessage(chatId: string, messageId: string) {
    const removeFromList = (current: UnifiedMessage[] | undefined) =>
      current?.filter((item) => item.id !== messageId) ?? [];

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                pinnedMessages: (chat.pinnedMessages ?? []).filter(
                  (message) => message.id !== messageId,
                ),
              }
            : chat,
        ) ?? current,
    );

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityGroupSelectionData>({
      queryKey: APP_QUERY_KEYS.activity.groupSelection,
    })) {
      if (!selection?.group?.chat || selection.group.chat.id !== chatId) {
        continue;
      }

      appQueryClient.setQueryData<ActivityGroupSelectionData>(queryKey, {
        ...selection,
        group: {
          ...selection.group,
          chat: {
            ...selection.group.chat,
            pinnedMessages: removeFromList(selection.group.chat.pinnedMessages),
          },
        },
      });
    }

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityDirectSelectionData>({
      queryKey: APP_QUERY_KEYS.activity.directSelection,
    })) {
      if (!selection?.chat || selection.chat.id !== chatId) {
        continue;
      }

      appQueryClient.setQueryData<ActivityDirectSelectionData>(queryKey, {
        ...selection,
        chat: {
          ...selection.chat,
          pinnedMessages: removeFromList(selection.chat.pinnedMessages),
        },
      });
    }
  },

  syncPinnedMessage(chatId: string, message: UnifiedMessage) {
    const messageApi = toMessageApi(message);
    const updatePinnedApiList = (current: MessageApi[] | undefined) => {
      const existing = current?.find((item) => item.id === message.id);
      const nextMessage =
        existing && !shouldReplaceApiMessage(existing, messageApi)
          ? existing
          : messageApi;
      const withoutExisting =
        current?.filter((item) => item.id !== message.id) ?? [];

      if (!message.isPinned) {
        return withoutExisting;
      }

      return [nextMessage, ...withoutExisting].sort(
        (left, right) => getMessageVersion(right) - getMessageVersion(left),
      );
    };
    const updatePinnedUiList = (current: UnifiedMessage[] | undefined) => {
      const existing = current?.find((item) => item.id === message.id);
      const nextMessage =
        existing && !shouldReplaceMessage(existing, message, message.id)
          ? existing
          : message;
      const withoutExisting =
        current?.filter((item) => item.id !== message.id) ?? [];

      if (!message.isPinned) {
        return withoutExisting;
      }

      return [nextMessage, ...withoutExisting].sort(
        (left, right) => getMessageVersion(right) - getMessageVersion(left),
      );
    };

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                pinnedMessages: updatePinnedApiList(chat.pinnedMessages),
              }
            : chat,
        ) ?? current,
    );

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityGroupSelectionData>({
      queryKey: APP_QUERY_KEYS.activity.groupSelection,
    })) {
      if (!selection?.group?.chat || selection.group.chat.id !== chatId) {
        continue;
      }

      appQueryClient.setQueryData<ActivityGroupSelectionData>(queryKey, {
        ...selection,
        group: {
          ...selection.group,
          chat: {
            ...selection.group.chat,
            pinnedMessages: updatePinnedUiList(
              selection.group.chat.pinnedMessages,
            ),
          },
        },
      });
    }

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityDirectSelectionData>({
      queryKey: APP_QUERY_KEYS.activity.directSelection,
    })) {
      if (!selection?.chat || selection.chat.id !== chatId) {
        continue;
      }

      appQueryClient.setQueryData<ActivityDirectSelectionData>(queryKey, {
        ...selection,
        chat: {
          ...selection.chat,
          pinnedMessages: updatePinnedUiList(selection.chat.pinnedMessages),
        },
      });
    }
  },
};
