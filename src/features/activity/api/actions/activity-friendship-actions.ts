import { invalidateFriendshipSurfaces } from "@/shared/api/query-invalidation";

import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { ActivityApi } from "@/features/activity/api/activity.api";

export const ActivityFriendshipActions = {
  async blockUser(context: ActivityActionContext, userId: string) {
    const friendshipResult = await ActivityApi.blockUser(userId);

    context.applyFriendshipUpdate(friendshipResult.data);

    await invalidateFriendshipSurfaces();

    return friendshipResult;
  },

  async unblockUser(context: ActivityActionContext, userId: string) {
    const friendshipResult = await ActivityApi.unblockUser(userId);

    context.removeFriendshipFromActivity(friendshipResult.data);

    await invalidateFriendshipSurfaces();

    return friendshipResult;
  },
};
