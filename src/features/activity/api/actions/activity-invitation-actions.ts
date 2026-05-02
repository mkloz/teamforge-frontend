import { applyHomeInvitationUpdate } from "@/shared/api/query-cache-updaters";
import { invalidateInvitationSurfaces } from "@/shared/api/query-invalidation";

import { ActivityApi } from "@/features/activity/api/activity.api";

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
};
