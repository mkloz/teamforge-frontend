import { applyHomeInvitationUpdate } from "@/shared/api/query-cache-updaters";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import {
  invalidateFriendshipSurfaces,
  invalidateGroupMembershipSurfaces,
  invalidateInvitationSurfaces,
} from "@/shared/api/query-invalidation";
import type { CreateRatingPayload } from "@/shared/schemas";

import type {
  ActivityActionContext,
  SendActivityMessageInput,
} from "./activity-action-context";
import {
  ActivityApi,
  type CreatePlanProposalDto,
  type UpdateGroupPayload,
  type UpdatePlanPayload,
  type VotePlanProposalDto,
} from "./activity.api";
import { ActivityMessageActions } from "./activity-message-actions";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export type { ActivityActionContext, SendActivityMessageInput };

export const ActivityActions = {
  releaseOptimisticMessageResources:
    ActivityMessageActions.releaseOptimisticMessageResources,

  forgetRetryableMessage: ActivityMessageActions.forgetRetryableMessage,

  sendMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    input: SendActivityMessageInput,
  ) {
    return ActivityMessageActions.sendMessage(context, kind, selectedId, input);
  },

  retryMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    return ActivityMessageActions.retryMessage(
      context,
      kind,
      selectedId,
      message,
    );
  },

  updateMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
    content: string,
  ) {
    return ActivityMessageActions.updateMessage(
      context,
      kind,
      selectedId,
      messageId,
      content,
    );
  },

  deleteMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
  ) {
    return ActivityMessageActions.deleteMessage(
      context,
      kind,
      selectedId,
      messageId,
    );
  },

  toggleReaction(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    emoji: string,
  ) {
    return ActivityMessageActions.toggleReaction(
      context,
      kind,
      selectedId,
      message,
      emoji,
    );
  },

  pinMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    return ActivityMessageActions.pinMessage(
      context,
      kind,
      selectedId,
      message,
    );
  },

  unpinMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    return ActivityMessageActions.unpinMessage(
      context,
      kind,
      selectedId,
      message,
    );
  },

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

  async createPlanProposal(
    planId: string,
    payload: CreatePlanProposalDto,
    groupId: string,
  ) {
    const proposal = await ActivityApi.createPlanProposal(planId, payload);

    await appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    });

    return proposal;
  },

  async votePlanProposal(
    proposalId: string,
    payload: VotePlanProposalDto,
    groupId?: string,
  ) {
    const proposal = await ActivityApi.votePlanProposal(proposalId, payload);

    await appQueryClient.invalidateQueries({
      queryKey: groupId
        ? APP_QUERY_KEYS.activity.groupSelectionById(groupId)
        : APP_QUERY_KEYS.activity.groupSelection,
    });

    return proposal;
  },

  async withdrawPlanProposal(proposalId: string, groupId?: string) {
    const proposal = await ActivityApi.withdrawPlanProposal(proposalId);

    await appQueryClient.invalidateQueries({
      queryKey: groupId
        ? APP_QUERY_KEYS.activity.groupSelectionById(groupId)
        : APP_QUERY_KEYS.activity.groupSelection,
    });

    return proposal;
  },

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

  async createGroupRating(groupId: string, payload: CreateRatingPayload) {
    const result = await ActivityApi.createRating(payload);

    await Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groupRatings(groupId),
      }),
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
      }),
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groups,
      }),
    ]);

    return result;
  },

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

  async leaveGroup(
    context: ActivityActionContext,
    groupId: string,
    currentUserId: string,
  ) {
    const groupResult = await ActivityApi.leaveGroup(groupId);
    context.applyRealtimeGroupUpdate(currentUserId, groupResult.data);
    await appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    });
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
    await appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    });
    return groupResult;
  },

  async disbandGroup(
    context: ActivityActionContext,
    groupId: string,
    currentUserId: string,
  ) {
    const groupResult = await ActivityApi.disbandGroup(groupId);
    context.applyRealtimeGroupUpdate(currentUserId, groupResult.data);
    await appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    });
    return groupResult;
  },
};
