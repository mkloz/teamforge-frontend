import {
  invalidateFriendshipSurfaces,
  invalidateGroupMembershipSurfaces,
} from "@/shared/api/query-invalidation";
import type { ChatApi, CreateRatingPayload } from "@/shared/schemas";

import { ActivityActions } from "./activity-actions";
import type { SendActivityMessageInput } from "./activity-actions";
import { ActivityApi } from "./activity.api";
import type {
  CreatePlanProposalDto,
  UpdateGroupPayload,
  UpdatePlanPayload,
  VotePlanProposalDto,
} from "./activity.api";
import {
  ACTIVITY_ACTION_CONTEXT,
  updateActivityChatSummaryCache,
} from "./activity-context";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export type { SendActivityMessageInput };

export const ActivityCommands = {
  invalidateGroupSurfaces() {
    return invalidateGroupMembershipSurfaces();
  },

  invalidateFriendshipSurfaces() {
    return invalidateFriendshipSurfaces();
  },

  async markChatRead(chatId: string, messageId?: string | null) {
    const updatedChat: ChatApi = await ActivityApi.markChatRead(
      chatId,
      messageId,
    );
    updateActivityChatSummaryCache(updatedChat);
    return updatedChat;
  },

  sendMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    input: SendActivityMessageInput,
  ) {
    return ActivityActions.sendMessage(
      ACTIVITY_ACTION_CONTEXT,
      kind,
      selectedId,
      input,
    );
  },

  retryMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    return ActivityActions.retryMessage(
      ACTIVITY_ACTION_CONTEXT,
      kind,
      selectedId,
      message,
    );
  },

  updateMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
    content: string,
  ) {
    return ActivityActions.updateMessage(
      ACTIVITY_ACTION_CONTEXT,
      kind,
      selectedId,
      messageId,
      content,
    );
  },

  deleteMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
  ) {
    return ActivityActions.deleteMessage(
      ACTIVITY_ACTION_CONTEXT,
      kind,
      selectedId,
      messageId,
    );
  },

  toggleReaction(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    emoji: string,
  ) {
    return ActivityActions.toggleReaction(
      ACTIVITY_ACTION_CONTEXT,
      kind,
      selectedId,
      message,
      emoji,
    );
  },

  pinMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    return ActivityActions.pinMessage(
      ACTIVITY_ACTION_CONTEXT,
      kind,
      selectedId,
      message,
    );
  },

  unpinMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    return ActivityActions.unpinMessage(
      ACTIVITY_ACTION_CONTEXT,
      kind,
      selectedId,
      message,
    );
  },

  sendGroupInvite(groupId: string, inviteeId: string) {
    return ActivityActions.sendGroupInvite(groupId, inviteeId);
  },

  createPlanProposal(
    planId: string,
    payload: CreatePlanProposalDto,
    groupId: string,
  ) {
    return ActivityActions.createPlanProposal(planId, payload, groupId);
  },

  votePlanProposal(
    proposalId: string,
    payload: VotePlanProposalDto,
    groupId?: string,
  ) {
    return ActivityActions.votePlanProposal(proposalId, payload, groupId);
  },

  withdrawPlanProposal(proposalId: string, groupId?: string) {
    return ActivityActions.withdrawPlanProposal(proposalId, groupId);
  },

  updateGroupIdentity(input: {
    groupId: string;
    groupPayload?: UpdateGroupPayload;
    planId?: string;
    planPayload?: UpdatePlanPayload;
  }) {
    return ActivityActions.updateGroupIdentity(input);
  },

  createGroupRating(groupId: string, payload: CreateRatingPayload) {
    return ActivityActions.createGroupRating(groupId, payload);
  },

  blockUser(userId: string) {
    return ActivityActions.blockUser(ACTIVITY_ACTION_CONTEXT, userId);
  },

  unblockUser(userId: string) {
    return ActivityActions.unblockUser(ACTIVITY_ACTION_CONTEXT, userId);
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
