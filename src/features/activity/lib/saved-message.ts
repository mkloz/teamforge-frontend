import { mapSingleMessage } from "@/features/activity/api/projections/activity-message-projections";
import type {
  UnifiedConversation,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type { SavedMessageApi } from "@/shared/schemas";

export interface SavedMessageSnapshot {
  conversationId: string;
  conversationKind: UnifiedConversation["kind"];
  message: UnifiedMessage;
  savedAt: string;
}

export function mapSavedMessageApi(
  item: SavedMessageApi,
  currentUserId: string,
): SavedMessageSnapshot | null {
  const conversationKind = item.chat.type === "GROUP" ? "group" : "dm";
  const conversationId =
    conversationKind === "group" ? item.chat.groupId : item.chat.id;

  if (!conversationId) {
    return null;
  }

  return {
    conversationId,
    conversationKind,
    message: mapSingleMessage(item.message, [], currentUserId),
    savedAt: item.savedAt,
  };
}
