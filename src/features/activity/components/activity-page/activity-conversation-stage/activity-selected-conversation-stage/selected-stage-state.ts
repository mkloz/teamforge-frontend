import type {
  ConversationStageRuntime,
  SelectedConversationStage,
} from "@/features/activity/components/activity-page/activity-conversation-stage/activity-selected-conversation-stage/types";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { SAVED_MESSAGES_CONVERSATION_ID } from "@/features/activity/lib/saved-messages-identity";

const EMPTY_SELECTED_CONVERSATION_STAGE: SelectedConversationStage = {
  kind: "empty",
};

export function getConversationStageRuntime(
  activity: ActivityWorkspace,
  isOnline: boolean,
): ConversationStageRuntime {
  return {
    isOnline,
    messageTimeline: {
      isError:
        activity.isMessageTimelineError ||
        (!isOnline && activity.isMessageTimelineLoading),
      isLoading: isOnline && activity.isMessageTimelineLoading,
    },
  };
}

export function getSelectedConversationStage(
  activity: ActivityWorkspace,
): SelectedConversationStage {
  return (
    getSavedMessagesStage(activity) ??
    getGroupConversationStage(activity) ??
    getDirectConversationStage(activity) ??
    EMPTY_SELECTED_CONVERSATION_STAGE
  );
}

function getSavedMessagesStage(
  activity: ActivityWorkspace,
): SelectedConversationStage | null {
  if (isSavedMessagesStageSelected(activity)) {
    return { kind: "saved" };
  }

  return null;
}

function getGroupConversationStage(
  activity: ActivityWorkspace,
): SelectedConversationStage | null {
  if (
    activity.selectedKind === "group" &&
    activity.selectedId &&
    activity.selectedGroup
  ) {
    return { kind: "group", selectedGroup: activity.selectedGroup };
  }

  return null;
}

function getDirectConversationStage(
  activity: ActivityWorkspace,
): SelectedConversationStage | null {
  if (
    activity.selectedKind === "dm" &&
    activity.selectedId &&
    activity.selectedChat
  ) {
    return { kind: "dm", selectedChat: activity.selectedChat };
  }

  return null;
}

function isSavedMessagesStageSelected(activity: ActivityWorkspace) {
  return (
    activity.selectedKind === "saved" &&
    activity.selectedId === SAVED_MESSAGES_CONVERSATION_ID
  );
}

export function openDirectProfilePanel(activity: ActivityWorkspace) {
  if (!activity.direct.isProfilePanelOpen) {
    activity.toggleProfilePanel();
  }
}

export function openSavedMessage(
  activity: ActivityWorkspace,
  snapshot: SavedMessageSnapshot,
) {
  activity.handleSelectItem(
    snapshot.conversationId,
    snapshot.conversationKind,
    {
      messageId: snapshot.message.id,
    },
  );
}
