import { ActivitySurfaceCache } from "@/features/activity/api/activity-surface-cache";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { ChatApi } from "@/shared/schemas";

export function syncPinnedMessage(chatId: string, message: UnifiedMessage) {
  ActivitySurfaceCache.syncPinnedMessage(chatId, message);
}

export function removePinnedMessage(chatId: string, messageId: string) {
  ActivitySurfaceCache.removePinnedMessage(chatId, messageId);
}

export function updateActivityChatSummaryCache(updatedChat: ChatApi) {
  ActivitySurfaceCache.updateChatSummary(updatedChat);
}

export function updateChatLastMessage(
  chatId: string,
  message: UnifiedMessage,
  {
    hasUnread,
    unreadCount,
  }: {
    hasUnread: boolean;
    unreadCount: number;
  },
) {
  ActivitySurfaceCache.updateChatLastMessage(chatId, message, {
    hasUnread,
    unreadCount,
  });
}
