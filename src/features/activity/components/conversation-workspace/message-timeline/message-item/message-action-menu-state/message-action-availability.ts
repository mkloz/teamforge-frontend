import {
  canDeleteMessage,
  canEditMessage,
  canPinMessage,
  canReactToMessage,
  canReplyToMessage,
  canSaveMessage,
} from "@/features/activity/lib/message-action-capabilities";
import { getMessageClipboardContent } from "@/features/activity/lib/message-clipboard";
import type {
  GetMessageActionMenuStateInput,
  MessageActionAvailability,
} from "./types";

export function getMessageActionAvailability({
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
