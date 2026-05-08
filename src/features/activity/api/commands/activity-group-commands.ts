import type {
  UpdateGroupPayload,
  UpdatePlanPayload,
} from "@/features/activity/api/activity.api";
import { ActivityActions } from "@/features/activity/api/activity-actions";
import { ACTIVITY_ACTION_CONTEXT } from "@/features/activity/api/activity-context";

export const ActivityGroupCommands = {
  sendGroupInvite(groupId: string, inviteeId: string) {
    return ActivityActions.sendGroupInvite(groupId, inviteeId);
  },

  updateGroupIdentity(input: {
    groupId: string;
    groupPayload?: UpdateGroupPayload;
    planId?: string;
    planPayload?: UpdatePlanPayload;
  }) {
    return ActivityActions.updateGroupIdentity(input);
  },

  leaveGroup(groupId: string, currentUserId: string) {
    return ActivityActions.leaveGroup(
      ACTIVITY_ACTION_CONTEXT,
      groupId,
      currentUserId,
    );
  },

  removeGroupMember(groupId: string, memberId: string, currentUserId: string) {
    return ActivityActions.removeGroupMember(
      ACTIVITY_ACTION_CONTEXT,
      groupId,
      memberId,
      currentUserId,
    );
  },

  disbandGroup(groupId: string, currentUserId: string) {
    return ActivityActions.disbandGroup(
      ACTIVITY_ACTION_CONTEXT,
      groupId,
      currentUserId,
    );
  },
};
