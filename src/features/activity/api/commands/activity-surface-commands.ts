import { ActivityApi } from "@/features/activity/api/activity.api";
import {
  markActivityChatReadCache,
  updateActivityChatSummaryCache,
} from "@/features/activity/api/activity-context";
import {
  getActivityMutationKey,
  runExclusiveActivityMutation,
} from "@/features/activity/api/activity-mutation-lock";
import { ACTIVITY_CHATS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import { appQueryClient } from "@/shared/api/query-client";
import {
  invalidateFriendshipSurfaces,
  invalidateGroupMembershipSurfaces,
} from "@/shared/api/query-invalidation";
import type { ChatApi } from "@/shared/schemas";

export const ActivitySurfaceCommands = {
  invalidateGroupSurfaces() {
    return invalidateGroupMembershipSurfaces();
  },

  invalidateFriendshipSurfaces() {
    return invalidateFriendshipSurfaces();
  },

  async markChatRead(chatId: string, messageId?: string | null) {
    return runExclusiveActivityMutation(
      getActivityMutationKey("chat", chatId, "read", messageId ?? null),
      async () => {
        markActivityChatReadCache(chatId);

        try {
          const updatedChat: ChatApi = await ActivityApi.markChatRead(
            chatId,
            messageId,
          );

          updateActivityChatSummaryCache(updatedChat);
          return updatedChat;
        } catch (error) {
          await appQueryClient.invalidateQueries({
            queryKey: ACTIVITY_CHATS_QUERY_KEY,
          });
          throw error;
        }
      },
    );
  },
};
