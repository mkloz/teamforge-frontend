import {
  Bookmark,
  CheckSquare,
  Copy,
  Forward,
  Pencil,
  Pin,
  PinOff,
  Reply,
  RotateCcw,
} from "lucide-react";
import { isMessageActionItem } from "./action-candidate";
import { copyMessageContent } from "./copy-message-content";
import type {
  MessageActionCandidate,
  PrimaryMessageActionsInput,
} from "./types";

export function getPrimaryMessageActions(input: PrimaryMessageActionsInput) {
  return [
    getRetryMessageAction(input),
    getReplyMessageAction(input),
    getSelectMessageAction(input),
    getCopyMessageAction(input),
    getEditMessageAction(input),
    getPinMessageAction(input),
    getForwardMessageAction(input),
    getSaveMessageAction(input),
  ].filter(isMessageActionItem);
}

function getRetryMessageAction({
  canRetry,
  message,
  onRetry,
}: PrimaryMessageActionsInput): MessageActionCandidate {
  if (!canRetry) {
    return null;
  }

  return {
    icon: RotateCcw,
    id: "retry",
    label: "Retry send",
    onSelect: () => onRetry(message),
  };
}

function getReplyMessageAction({
  canReply,
  message,
  onReply,
}: PrimaryMessageActionsInput): MessageActionCandidate {
  if (!canReply) {
    return null;
  }

  return {
    icon: Reply,
    id: "reply",
    label: "Reply",
    onSelect: () => onReply(message),
  };
}

function getSelectMessageAction({
  canSelect,
  message,
  onSelectMessage,
}: PrimaryMessageActionsInput): MessageActionCandidate {
  if (!canSelect || !onSelectMessage) {
    return null;
  }

  return {
    icon: CheckSquare,
    id: "select",
    label: "Select",
    onSelect: () => onSelectMessage(message),
  };
}

function getCopyMessageAction({
  canCopy,
  copyContent,
  message,
}: PrimaryMessageActionsInput): MessageActionCandidate {
  if (!canCopy) {
    return null;
  }

  return {
    icon: Copy,
    id: "copy",
    label: message.proposal ? "Copy proposal" : "Copy text",
    onSelect: () =>
      copyMessageContent({
        errorMessage: message.proposal
          ? "We couldn't copy that proposal in this browser."
          : "We couldn't copy that message in this browser.",
        successMessage: message.proposal
          ? "Proposal copied."
          : "Message copied.",
        text: copyContent,
      }),
  };
}

function getEditMessageAction({
  canEdit,
  message,
  onStartEdit,
}: PrimaryMessageActionsInput): MessageActionCandidate {
  if (!canEdit) {
    return null;
  }

  return {
    icon: Pencil,
    id: "edit",
    label: "Edit",
    onSelect: () => onStartEdit(message),
  };
}

function getPinMessageAction({
  canPin,
  message,
  onPin,
  onUnpin,
}: PrimaryMessageActionsInput): MessageActionCandidate {
  if (!canPin) {
    return null;
  }

  return {
    icon: message.isPinned ? PinOff : Pin,
    id: "pin",
    label: message.isPinned ? "Unpin" : "Pin",
    onSelect: () => (message.isPinned ? onUnpin(message) : onPin(message)),
  };
}

function getForwardMessageAction({
  canSave,
  onForward,
  setForwardDialogOpen,
}: PrimaryMessageActionsInput): MessageActionCandidate {
  if (!canSave || !onForward) {
    return null;
  }

  return {
    icon: Forward,
    id: "forward",
    label: "Forward",
    onSelect: () => setForwardDialogOpen(true),
  };
}

function getSaveMessageAction({
  canSave,
  isSaved,
  message,
  onToggleSaved,
}: PrimaryMessageActionsInput): MessageActionCandidate {
  if (!canSave || !onToggleSaved) {
    return null;
  }

  return {
    icon: Bookmark,
    id: "save",
    label: isSaved ? "Remove bookmark" : "Save message",
    onSelect: () => onToggleSaved(message, isSaved),
  };
}
