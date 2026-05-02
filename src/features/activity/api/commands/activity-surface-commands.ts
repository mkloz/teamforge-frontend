import {
  invalidateFriendshipSurfaces,
  invalidateGroupMembershipSurfaces,
} from "@/shared/api/query-invalidation";
import type { ChatApi } from "@/shared/schemas";

import { ActivityApi } from "@/features/activity/api/activity.api";
import { updateActivityChatSummaryCache } from "@/features/activity/api/activity-context";

export const ActivitySurfaceCommands = {
  invalidateGroupSurfaces() {
    return invalidateGroupMembershipSurfaces();
  },

  invalidateFriendshipSurfaces() {
    return invalidateFriendshipSurfaces();
  },

  async markChatRead(chatId: string, messageId?: string | null) {
    const updatedChat: ChatApi = await ActivityApi.markChatRead(
      chatId,
      messageId,
    );
    updateActivityChatSummaryCache(updatedChat);
    return updatedChat;
  },
};
