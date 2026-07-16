import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  canDeleteMessage,
  canSaveMessage,
} from "@/features/activity/lib/message-action-capabilities";

const MAX_RELATED_REPORT_MESSAGES = 20;

interface GetMessageSelectionToolbarStateInput {
  savedMessageIds: ReadonlySet<string>;
  selectedMessages: UnifiedMessage[];
}

interface GetSelectionActionButtonStatesInput {
  canDelete: boolean;
  canForward: boolean;
  isDeleting: boolean;
  isOnline: boolean;
  isSaving: boolean;
  saveLabel: string;
  saveableCount: number;
}

export function getMessageSelectionToolbarState({
  savedMessageIds,
  selectedMessages,
}: GetMessageSelectionToolbarStateInput) {
  const selectedCount = selectedMessages.length;
  const saveableMessages = selectedMessages.filter(canSaveMessage);
  const allSaveableMessagesSaved = areAllSaveableMessagesSaved(
    saveableMessages,
    savedMessageIds,
  );

  return {
    allSaveableMessagesSaved,
    canDelete: canRunSelectionAction(selectedMessages, canDeleteMessage),
    canForward: canRunSelectionAction(selectedMessages, canSaveMessage),
    saveableMessages,
    saveLabel: allSaveableMessagesSaved ? "Unsave" : "Save",
    selectedCount,
  };
}

export function getSelectedMessageReportContext(
  selectedMessages: UnifiedMessage[],
) {
  const primaryMessage = selectedMessages.find(canReportSelectedMessage);

  if (!primaryMessage) {
    return null;
  }

  const otherSelectedMessageIds = selectedMessages
    .filter((message) => message.id !== primaryMessage.id)
    .map((message) => message.id);
  const relatedMessageIds = otherSelectedMessageIds.slice(
    0,
    MAX_RELATED_REPORT_MESSAGES,
  );

  return {
    omittedMessageCount:
      otherSelectedMessageIds.length - relatedMessageIds.length,
    primaryMessage,
    relatedMessageIds,
  };
}

export function getSelectionActionButtonStates({
  canDelete,
  canForward,
  isDeleting,
  isOnline,
  isSaving,
  saveLabel,
  saveableCount,
}: GetSelectionActionButtonStatesInput) {
  return {
    copy: {
      label: "Copy",
    },
    delete: {
      disabled: shouldDisableDeleteSelectionAction({
        canDelete,
        isDeleting,
        isOnline,
      }),
      label: isDeleting ? "Deleting" : "Delete",
      title: getOfflineSelectionActionTitle(isOnline, "delete"),
    },
    forward: {
      disabled: !canForward,
      label: "Forward",
    },
    save: {
      disabled: shouldDisableSaveSelectionAction({
        isOnline,
        isSaving,
        saveableCount,
      }),
      label: isSaving ? "Saving" : saveLabel,
      title: getOfflineSelectionActionTitle(isOnline, "save"),
    },
  };
}

export function getSavedMessageToggleTargets({
  allSaveableMessagesSaved,
  savedMessageIds,
  saveableMessages,
}: {
  allSaveableMessagesSaved: boolean;
  savedMessageIds: ReadonlySet<string>;
  saveableMessages: UnifiedMessage[];
}) {
  return saveableMessages.filter((message) =>
    shouldToggleSavedMessage({
      allSaveableMessagesSaved,
      isSaved: isMessageSaved(message, savedMessageIds),
    }),
  );
}

export function getSelectedMessagesCopiedToastMessage(selectedCount: number) {
  return selectedCount === 1 ? "Message copied." : "Messages copied.";
}

export function getSelectedMessagesDeletedToastMessage(selectedCount: number) {
  return selectedCount === 1 ? "Message deleted." : "Messages deleted.";
}

export function getSelectedMessagesDeleteDescription(selectedCount: number) {
  return selectedCount === 1
    ? "This removes the selected message from the conversation."
    : `This removes ${selectedCount} selected messages from the conversation.`;
}

export function getSelectedMessagesSaveToastMessage(
  allSaveableMessagesSaved: boolean,
) {
  return allSaveableMessagesSaved
    ? "Removed from saved messages."
    : "Saved messages.";
}

function isMessageSaved(
  message: UnifiedMessage,
  savedMessageIds: ReadonlySet<string>,
) {
  return message.isSaved || savedMessageIds.has(message.id);
}

function areAllSaveableMessagesSaved(
  saveableMessages: UnifiedMessage[],
  savedMessageIds: ReadonlySet<string>,
) {
  return (
    saveableMessages.length > 0 &&
    saveableMessages.every((message) =>
      isMessageSaved(message, savedMessageIds),
    )
  );
}

function canRunSelectionAction(
  selectedMessages: UnifiedMessage[],
  canRunAction: (message: UnifiedMessage) => boolean,
) {
  return selectedMessages.length > 0 && selectedMessages.every(canRunAction);
}

function canReportSelectedMessage(message: UnifiedMessage) {
  return message.type !== "SYSTEM" && !message.isSystem && !message.isOwn;
}

function shouldDisableDeleteSelectionAction({
  canDelete,
  isDeleting,
  isOnline,
}: {
  canDelete: boolean;
  isDeleting: boolean;
  isOnline: boolean;
}) {
  return !canDelete || isDeleting || !isOnline;
}

function shouldDisableSaveSelectionAction({
  isOnline,
  isSaving,
  saveableCount,
}: {
  isOnline: boolean;
  isSaving: boolean;
  saveableCount: number;
}) {
  return saveableCount === 0 || isSaving || !isOnline;
}

function getOfflineSelectionActionTitle(
  isOnline: boolean,
  action: "delete" | "save",
) {
  if (isOnline) {
    return undefined;
  }

  return action === "save"
    ? "Reconnect before updating saved messages."
    : "Reconnect before deleting messages.";
}

function shouldToggleSavedMessage({
  allSaveableMessagesSaved,
  isSaved,
}: {
  allSaveableMessagesSaved: boolean;
  isSaved: boolean;
}) {
  return allSaveableMessagesSaved ? isSaved : !isSaved;
}
