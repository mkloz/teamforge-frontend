import {
  removePinnedMessageFromChats,
  syncPinnedMessageInChats,
} from "@/features/activity/api/cache/pinned-message-chat-cache";
import {
  removePinnedMessageFromSelections,
  syncPinnedMessageInSelections,
} from "@/features/activity/api/cache/pinned-message-selection-cache";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export const ActivityPinnedMessageCache = {
  removePinnedMessage(chatId: string, messageId: string) {
    removePinnedMessageFromChats(chatId, messageId);
    removePinnedMessageFromSelections(chatId, messageId);
  },

  syncPinnedMessage(chatId: string, message: UnifiedMessage) {
    syncPinnedMessageInChats(chatId, message);
    syncPinnedMessageInSelections(chatId, message);
  },
};
