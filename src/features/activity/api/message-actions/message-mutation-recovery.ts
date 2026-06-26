import type { QueryKey } from "@tanstack/react-query";
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

interface RecoveryQueryKeysInput {
  chatId: string;
  includeSavedMessages: boolean;
  kind: "dm" | "group" | null;
  selectedId: string | null;
  targetChatId: string | null;
}

export async function recoverMessageMutationCaches({
  chatId,
  includeSavedMessages = false,
  kind = null,
  selectedId = null,
  targetChatId = null,
}: RecoverMessageMutationCachesInput) {
  const invalidations = getRecoveryQueryKeys({
    chatId,
    includeSavedMessages,
    kind,
    selectedId,
    targetChatId,
  }).map((queryKey) => appQueryClient.invalidateQueries({ queryKey }));

  await Promise.allSettled(invalidations);
}

function getRecoveryQueryKeys({
  chatId,
  includeSavedMessages,
  kind,
  selectedId,
  targetChatId,
}: RecoveryQueryKeysInput): QueryKey[] {
  const queryKeys: QueryKey[] = [
    ACTIVITY_CHATS_QUERY_KEY,
    APP_QUERY_KEYS.activity.messages(chatId),
  ];

  const targetMessagesQueryKey = getTargetChatMessagesQueryKey(
    chatId,
    targetChatId,
  );
  const selectionQueryKey = getSelectionQueryKey(kind, selectedId);

  if (targetMessagesQueryKey) {
    queryKeys.push(targetMessagesQueryKey);
  }

  if (includeSavedMessages) {
    queryKeys.push(ACTIVITY_SAVED_MESSAGES_QUERY_KEY);
  }

  if (selectionQueryKey) {
    queryKeys.push(selectionQueryKey);
  }

  return queryKeys;
}

function getTargetChatMessagesQueryKey(
  chatId: string,
  targetChatId: string | null,
) {
  return targetChatId && targetChatId !== chatId
    ? APP_QUERY_KEYS.activity.messages(targetChatId)
    : null;
}

function getSelectionQueryKey(
  kind: RecoverMessageMutationCachesInput["kind"],
  selectedId: string | null,
) {
  if (!kind || !selectedId) {
    return null;
  }

  return kind === "group"
    ? APP_QUERY_KEYS.activity.groupSelectionById(selectedId)
    : APP_QUERY_KEYS.activity.directSelectionByChatId(selectedId);
}
