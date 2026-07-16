import { ActivityApi } from "@/features/activity/api/activity.api";

import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import {
  invalidateGroupMembershipSurfaces,
  invalidateUserBlockSurfaces,
} from "@/shared/api/query-invalidation";

export const ActivityFriendshipActions = {
  async blockUser(context: ActivityActionContext, userId: string) {
    const blockResult = await ActivityApi.blockUser(userId);

    context.closeDirectChatForBlockedUser(userId);

    await Promise.all([
      invalidateUserBlockSurfaces(),
      invalidateGroupMembershipSurfaces(),
    ]);

    return blockResult;
  },

  async unblockUser(userId: string) {
    const unblockResult = await ActivityApi.unblockUser(userId);

    await invalidateUserBlockSurfaces();

    return unblockResult;
  },
};
