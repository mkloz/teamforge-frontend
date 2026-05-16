import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

interface RecoverMessageMutationCachesInput {
  chatId: string;
  includeSavedMessages?: boolean;
  kind?: "dm" | "group" | null;
  selectedId?: string | null;
  targetChatId?: string | null;
}

export async function recoverMessageMutationCaches({
  chatId,
  includeSavedMessages = false,
  kind = null,
  selectedId = null,
  targetChatId = null,
}: RecoverMessageMutationCachesInput) {
  const invalidations = [
    appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_CHATS_QUERY_KEY,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.messages(chatId),
    }),
  ];

  if (targetChatId && targetChatId !== chatId) {
    invalidations.push(
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.messages(targetChatId),
      }),
    );
  }

  if (includeSavedMessages) {
    invalidations.push(
      appQueryClient.invalidateQueries({
        queryKey: ACTIVITY_SAVED_MESSAGES_QUERY_KEY,
      }),
    );
  }

  if (kind === "group" && selectedId) {
    invalidations.push(
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groupSelectionById(selectedId),
      }),
    );
  }

  if (kind === "dm" && selectedId) {
    invalidations.push(
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.directSelectionByChatId(selectedId),
      }),
    );
  }

  await Promise.allSettled(invalidations);
}
