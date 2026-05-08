import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import {
  removePinnedUiMessage,
  syncPinnedUiMessage,
} from "@/features/activity/api/cache/pinned-message-list-updaters";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function removePinnedMessageFromSelections(
  chatId: string,
  messageId: string,
) {
  updatePinnedGroupSelections(chatId, (current) =>
    removePinnedUiMessage(current, messageId),
  );
  updatePinnedDirectSelections(chatId, (current) =>
    removePinnedUiMessage(current, messageId),
  );
}

export function syncPinnedMessageInSelections(
  chatId: string,
  message: UnifiedMessage,
) {
  updatePinnedGroupSelections(chatId, (current) =>
    syncPinnedUiMessage(current, message),
  );
  updatePinnedDirectSelections(chatId, (current) =>
    syncPinnedUiMessage(current, message),
  );
}

function updatePinnedGroupSelections(
  chatId: string,
  updatePinnedMessages: (
    current: UnifiedMessage[] | undefined,
  ) => UnifiedMessage[],
) {
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
          pinnedMessages: updatePinnedMessages(
            selection.group.chat.pinnedMessages,
          ),
        },
      },
    });
  }
}

function updatePinnedDirectSelections(
  chatId: string,
  updatePinnedMessages: (
    current: UnifiedMessage[] | undefined,
  ) => UnifiedMessage[],
) {
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
        pinnedMessages: updatePinnedMessages(selection.chat.pinnedMessages),
      },
    });
  }
}
