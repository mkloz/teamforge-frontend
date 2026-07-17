import { HomeApi } from "@/features/home/api/home.api";
import { HomeCache } from "@/features/home/api/home-cache";
import {
  invalidateGroupMembershipSurfaces,
  invalidateGroupParticipationSurfaces,
  invalidateInvitationSurfaces,
} from "@/shared/api/query-invalidation";
import type { RecordGroupParticipationPayload } from "@/shared/schemas";

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

  async recordGroupParticipation(
    groupId: string,
    payload: RecordGroupParticipationPayload,
  ) {
    const result = await HomeApi.recordGroupParticipation(groupId, payload);

    HomeCache.clearPendingParticipationPlan(groupId, payload.planId);
    await invalidateGroupParticipationSurfaces(groupId);

    return result;
  },
};
