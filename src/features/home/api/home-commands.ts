import { HomeApi } from "@/features/home/api/home.api";
import { HomeCache } from "@/features/home/api/home-cache";
import {
  invalidateGroupMembershipSurfaces,
  invalidateInvitationSurfaces,
} from "@/shared/api/query-invalidation";

export const HomeCommands = {
  async acceptInvitation(inviteId: string) {
    const invite = await HomeApi.acceptInvitation(inviteId);

    HomeCache.applyInvitationUpdate(invite);
    await invalidateGroupMembershipSurfaces();
    await invalidateInvitationSurfaces();

    return invite;
  },

  async declineInvitation(inviteId: string) {
    const invite = await HomeApi.declineInvitation(inviteId);

    HomeCache.applyInvitationUpdate(invite);
    await invalidateInvitationSurfaces();

    return invite;
  },

  async joinRecommendedGroup(groupId: string) {
    const result = await HomeApi.joinRecommendedGroup(groupId);

    HomeCache.removeRecommendedGroup(result.data.groupId);
    await invalidateGroupMembershipSurfaces();

    return result;
  },
};
