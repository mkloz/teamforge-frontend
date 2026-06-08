import { ActivityActions } from "@/features/activity/api/activity-actions";
import { ACTIVITY_ACTION_CONTEXT } from "@/features/activity/api/activity-context";

export const ActivityFriendshipCommands = {
  blockUser(userId: string) {
    return ActivityActions.blockUser(ACTIVITY_ACTION_CONTEXT, userId);
  },

  unblockUser(userId: string) {
    return ActivityActions.unblockUser(ACTIVITY_ACTION_CONTEXT, userId);
  },
};
