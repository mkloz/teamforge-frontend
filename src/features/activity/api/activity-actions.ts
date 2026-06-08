import { ActivityFriendshipActions } from "@/features/activity/api/actions/activity-friendship-actions";
import { ActivityGroupCommandActions } from "@/features/activity/api/actions/activity-group-command-actions";
import { ActivityInvitationActions } from "@/features/activity/api/actions/activity-invitation-actions";
import { ActivityPlanProposalActions } from "@/features/activity/api/actions/activity-plan-proposal-actions";
import { ActivityRatingActions } from "@/features/activity/api/actions/activity-rating-actions";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type {
  ActivityActionContext,
  SendActivityMessageInput,
} from "./activity-action-context";
import { ActivityMessageActions } from "./activity-message-actions";

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

  toggleSavedMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    isSaved: boolean,
  ) {
    return ActivityMessageActions.toggleSavedMessage(
      context,
      kind,
      selectedId,
      message,
      isSaved,
    );
  },

  forwardMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    targetChatId: string,
  ) {
    return ActivityMessageActions.forwardMessage(
      context,
      kind,
      selectedId,
      message,
      targetChatId,
    );
  },

  ...ActivityInvitationActions,

  ...ActivityPlanProposalActions,

  ...ActivityGroupCommandActions,

  ...ActivityRatingActions,

  ...ActivityFriendshipActions,
};
