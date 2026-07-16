import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import { buildProposalClipboardText } from "@/features/activity/lib/proposal-language";
import { getMessagePreviewText } from "@/features/activity/lib/unify-conversations";

export function getMessageClipboardContent(message: UnifiedMessage) {
  if (message.proposal) {
    return buildProposalClipboardText(message.proposal);
  }

  return message.content.trim();
}

export function getMessagesClipboardContent(messages: UnifiedMessage[]) {
  return messages
    .map((message) => {
      const sender = message.isOwn
        ? "You"
        : (message.sender?.name ?? "Unknown");
      const content =
        getMessageClipboardContent(message) || getMessagePreviewText(message);

      return `[${formatChatTime(message.createdAt)}] ${sender}: ${content}`;
    })
    .join("\n");
}
