import { ActivityApi } from "@/features/activity/api/activity.api";
import { applyHomeInvitationUpdate } from "@/shared/api/query-cache-updaters";
import { invalidateInvitationSurfaces } from "@/shared/api/query-invalidation";

export const ActivityInvitationActions = {
  async sendGroupInvite(groupId: string, inviteeId: string) {
    const inviteResult = await ActivityApi.createInvite({
      groupId,
      inviteeId,
      type: "FRIEND_INVITE",
    });

    applyHomeInvitationUpdate(inviteResult.data);

    await invalidateInvitationSurfaces();

    return inviteResult;
  },

  async cancelGroupInvite(inviteId: string) {
    const inviteResult = await ActivityApi.cancelInvite(inviteId);

    applyHomeInvitationUpdate(inviteResult.data);

    await invalidateInvitationSurfaces();

    return inviteResult;
  },
};
