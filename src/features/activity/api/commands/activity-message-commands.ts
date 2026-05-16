import type { SendActivityMessageInput } from "@/features/activity/api/activity-actions";
import { ActivityActions } from "@/features/activity/api/activity-actions";
import { ACTIVITY_ACTION_CONTEXT } from "@/features/activity/api/activity-context";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

type ActivityConversationKind = "group" | "dm" | null;

export const ActivityMessageCommands = {
  sendMessage(
    kind: ActivityConversationKind,
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
    kind: ActivityConversationKind,
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
    kind: ActivityConversationKind,
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
    kind: ActivityConversationKind,
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
    kind: ActivityConversationKind,
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
    kind: ActivityConversationKind,
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
    kind: ActivityConversationKind,
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

  toggleSavedMessage(
    kind: ActivityConversationKind,
    selectedId: string | null,
    message: UnifiedMessage,
    isSaved: boolean,
  ) {
    return ActivityActions.toggleSavedMessage(
      ACTIVITY_ACTION_CONTEXT,
      kind,
      selectedId,
      message,
      isSaved,
    );
  },

  forwardMessage(
    kind: ActivityConversationKind,
    selectedId: string | null,
    message: UnifiedMessage,
    targetChatId: string,
  ) {
    return ActivityActions.forwardMessage(
      ACTIVITY_ACTION_CONTEXT,
      kind,
      selectedId,
      message,
      targetChatId,
    );
  },
};
