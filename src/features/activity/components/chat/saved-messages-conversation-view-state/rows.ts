import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";

import type { SavedMessageRow } from "./types";

export function getSavedMessageRows(
  savedMessages: SavedMessageSnapshot[],
  conversations: UnifiedConversation[],
  searchQuery: string,
) {
  const conversationsByKey = getConversationsByKey(conversations);
  const normalizedQuery = normalizeSavedMessagesSearchQuery(searchQuery);

  return savedMessages
    .map((snapshot) => getSavedMessageRow(snapshot, conversationsByKey))
    .filter((row) => shouldShowSavedMessageRow(row, normalizedQuery));
}

function getConversationsByKey(conversations: UnifiedConversation[]) {
  return new Map(
    conversations.map((conversation) => [
      getActivityConversationKey(conversation.kind, conversation.id),
      conversation,
    ]),
  );
}

function normalizeSavedMessagesSearchQuery(searchQuery: string) {
  return searchQuery.trim().toLowerCase();
}

function getSavedMessageRow(
  snapshot: SavedMessageSnapshot,
  conversationsByKey: Map<string, UnifiedConversation>,
): SavedMessageRow {
  const conversation = conversationsByKey.get(
    getActivityConversationKey(
      snapshot.conversationKind,
      snapshot.conversationId,
    ),
  );

  return {
    conversationTitle: conversation
      ? getConversationTitle(conversation)
      : "Original chat unavailable",
    snapshot,
  };
}

function shouldShowSavedMessageRow(
  row: SavedMessageRow,
  normalizedQuery: string,
) {
  if (!normalizedQuery) {
    return true;
  }

  return getSavedMessageSearchText(row).includes(normalizedQuery);
}

function getSavedMessageSearchText(row: SavedMessageRow) {
  return [
    row.conversationTitle,
    row.snapshot.message.sender?.name ?? "",
    getMessagePreviewText(row.snapshot.message),
  ]
    .join(" ")
    .toLowerCase();
}
