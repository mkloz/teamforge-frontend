import {
  ActivityApi,
  type UpdateGroupPayload,
  type UpdatePlanPayload,
} from "@/features/activity/api/activity.api";
import type { ActivityActionContext } from "@/features/activity/api/activity-action-context";
import { appQueryClient } from "@/shared/api/query-client";
import { invalidateGroupMembershipSurfaces } from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

async function invalidateGroupSelection(groupId: string) {
  await appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
  });
}

export const ActivityGroupCommandActions = {
  async updateGroupIdentity({
    groupId,
    groupPayload,
    planId,
    planPayload,
  }: {
    groupId: string;
    groupPayload?: UpdateGroupPayload;
    planId?: string;
    planPayload?: UpdatePlanPayload;
  }) {
    const requests: Array<Promise<unknown>> = [];

    if (groupPayload) {
      requests.push(ActivityApi.updateGroup(groupId, groupPayload));
    }

    if (planId && planPayload) {
      requests.push(ActivityApi.updatePlan(planId, planPayload));
    }

    await Promise.all(requests);
    await invalidateGroupMembershipSurfaces();
  },

  async leaveGroup(
    context: ActivityActionContext,
    groupId: string,
    currentUserId: string,
  ) {
    const groupResult = await ActivityApi.leaveGroup(groupId);
    context.applyRealtimeGroupUpdate(currentUserId, groupResult.data);
    await invalidateGroupSelection(groupId);
    return groupResult;
  },

  async removeGroupMember(
    context: ActivityActionContext,
    groupId: string,
    memberId: string,
    currentUserId: string,
  ) {
    const groupResult = await ActivityApi.removeGroupMember(groupId, memberId);
    context.applyRealtimeGroupUpdate(currentUserId, groupResult.data);
    await invalidateGroupSelection(groupId);
    return groupResult;
  },

  async disbandGroup(
    context: ActivityActionContext,
    groupId: string,
    currentUserId: string,
  ) {
    const groupResult = await ActivityApi.disbandGroup(groupId);
    context.applyRealtimeGroupUpdate(currentUserId, groupResult.data);
    await invalidateGroupSelection(groupId);
    return groupResult;
  },
};
