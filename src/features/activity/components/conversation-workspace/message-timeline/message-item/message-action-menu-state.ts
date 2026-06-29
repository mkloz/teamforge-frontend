import {
  Bookmark,
  CheckSquare,
  Copy,
  Forward,
  type LucideIcon,
  Pencil,
  Pin,
  PinOff,
  Reply,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  canDeleteMessage,
  canEditMessage,
  canPinMessage,
  canReactToMessage,
  canReplyToMessage,
  canSaveMessage,
} from "@/features/activity/lib/message-action-capabilities";
import { getMessageClipboardContent } from "@/features/activity/lib/message-clipboard";
import {
  showAppErrorMessageToast,
  showAppSuccessToast,
} from "@/shared/lib/app-toast";
import { copyTextToClipboard } from "@/shared/lib/browser-capabilities";

export interface MessageActionItem {
  icon: LucideIcon;
  id: string;
  label: string;
  onSelect: () => unknown;
  tone?: "danger";
}

interface MessageActionCallbacks {
  onForward?: (
    message: UnifiedMessage,
    targetChatId: string,
  ) => Promise<unknown>;
  onPin: (message: UnifiedMessage) => Promise<void> | void;
  onReply: (message: UnifiedMessage) => void;
  onRetry: (message: UnifiedMessage) => Promise<void> | void;
  onSelectMessage?: (message: UnifiedMessage) => void;
  onStartEdit: (message: UnifiedMessage) => void;
  onToggleSaved?: (
    message: UnifiedMessage,
    isSaved: boolean,
  ) => Promise<unknown>;
  onUnpin: (message: UnifiedMessage) => Promise<void> | void;
}

interface GetMessageActionMenuStateInput extends MessageActionCallbacks {
  isSaved: boolean;
  message: UnifiedMessage;
  reactionPickerDisabled: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  setForwardDialogOpen: (open: boolean) => void;
}

interface PrimaryMessageActionsInput
  extends MessageActionCallbacks,
    MessageActionAvailability {
  isSaved: boolean;
  message: UnifiedMessage;
  setForwardDialogOpen: (open: boolean) => void;
}

interface DangerMessageActionsInput {
  canDelete: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
}

interface MessageActionAvailability {
  canCopy: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canPin: boolean;
  canReact: boolean;
  canReply: boolean;
  canRetry: boolean;
  canSave: boolean;
  canSelect: boolean;
  copyContent: string;
}

type MessageActionCandidate = MessageActionItem | null;

export function getMessageActionMenuState(
  input: GetMessageActionMenuStateInput,
) {
  const availability = getMessageActionAvailability(input);

  return {
    canReact: availability.canReact,
    dangerActions: getDangerMessageActions({
      canDelete: availability.canDelete,
      setDeleteDialogOpen: input.setDeleteDialogOpen,
    }),
    primaryActions: getPrimaryMessageActions({
      ...input,
      ...availability,
    }),
  };
}

function getMessageActionAvailability({
  message,
  onSelectMessage,
  reactionPickerDisabled,
}: Pick<
  GetMessageActionMenuStateInput,
  "message" | "onSelectMessage" | "reactionPickerDisabled"
>): MessageActionAvailability {
  const copyContent = getMessageClipboardContent(message);

  return {
    canCopy: copyContent.length > 0,
    canDelete: canDeleteMessage(message),
    canEdit: canEditMessage(message),
    canPin: canPinMessage(message),
    canReact: !reactionPickerDisabled && canReactToMessage(message),
    canReply: canReplyToMessage(message),
    canRetry: message.isOwn && message.status === "FAILED",
    canSave: canSaveMessage(message),
    canSelect: Boolean(onSelectMessage) && message.type !== "SYSTEM",
    copyContent,
  };
}

function getPrimaryMessageActions(input: PrimaryMessageActionsInput) {
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

function getDangerMessageActions({
  canDelete,
  setDeleteDialogOpen,
}: DangerMessageActionsInput) {
  return [getDeleteMessageAction({ canDelete, setDeleteDialogOpen })].filter(
    isMessageActionItem,
  );
}

function getDeleteMessageAction({
  canDelete,
  setDeleteDialogOpen,
}: DangerMessageActionsInput): MessageActionCandidate {
  if (!canDelete) {
    return null;
  }

  return {
    icon: Trash2,
    id: "delete",
    label: "Delete",
    onSelect: () => setDeleteDialogOpen(true),
    tone: "danger",
  };
}

function isMessageActionItem(
  action: MessageActionCandidate,
): action is MessageActionItem {
  return action !== null;
}

async function copyMessageContent({
  errorMessage,
  successMessage,
  text,
}: {
  errorMessage: string;
  successMessage: string;
  text: string;
}) {
  if (!text) {
    return;
  }

  if (!(await copyTextToClipboard(text))) {
    showAppErrorMessageToast(errorMessage);
    return;
  }

  showAppSuccessToast(successMessage, { id: "message-content-copied" });
}
