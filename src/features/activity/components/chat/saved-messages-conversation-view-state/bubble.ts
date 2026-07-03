import { isVisualAttachment } from "@/features/activity/lib/gif-attachments";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { getMessagePreviewText } from "@/features/activity/lib/unify-conversations";
import { cn } from "@/shared/lib/utils";

import type {
  SavedMessageBubbleSizeDecision,
  SavedMessageBubbleSizeInput,
  SavedMessageBubbleViewState,
  SavedMessageRow,
} from "./types";

const FIT_BUBBLE_SIZE_CLASS = "w-fit max-w-full";
const ATTACHMENT_GRID_BUBBLE_SIZE_CLASS = "w-72 max-w-full sm:w-96";
const CONTEXT_PREVIEW_BUBBLE_SIZE_CLASS =
  "w-fit min-w-72 max-w-full sm:max-w-xl md:max-w-2xl";
const LONG_CONTENT_BUBBLE_SIZE_CLASS =
  "w-fit max-w-full sm:max-w-xl md:max-w-2xl";

const SAVED_MESSAGE_BUBBLE_SIZE_DECISIONS: SavedMessageBubbleSizeDecision[] = [
  {
    matches: shouldUseAttachmentOnlyBubbleSize,
    resolve: getAttachmentOnlyBubbleSizeClass,
  },
  {
    matches: shouldUseContextPreviewBubbleSize,
    resolve: () => CONTEXT_PREVIEW_BUBBLE_SIZE_CLASS,
  },
  {
    matches: shouldUseLongContentBubbleSize,
    resolve: () => LONG_CONTENT_BUBBLE_SIZE_CLASS,
  },
];

export function getSavedMessageBubbleViewState(
  row: SavedMessageRow,
): SavedMessageBubbleViewState {
  const { message, savedAt } = row.snapshot;
  const attachments = message.attachments ?? [];
  const visualAttachmentCount = getVisualAttachmentCount(attachments);

  return {
    displayContent: getSavedMessageDisplayContent(row.snapshot),
    hasContextPreview: hasSavedMessageContextPreview(row.snapshot),
    hasVisualAttachments: visualAttachmentCount > 0,
    isOwn: message.isOwn,
    savedAt,
    senderName: message.sender?.name ?? "Unknown sender",
    visualAttachmentCount,
  };
}

export function shouldUseSavedMessageInlineFooter(input: {
  displayContent: string;
  hasReply: boolean;
  reactionGroupsLength: number;
}) {
  return (
    hasInlineFooterContent(input.displayContent) &&
    !input.hasReply &&
    isCompactSingleToken(input.displayContent) &&
    input.reactionGroupsLength === 0
  );
}

export function isSavedMessageOpenKey(key: string) {
  return key === "Enter" || key === " ";
}

export function getSavedMessageBubbleSizeClass({
  content,
  hasContextPreview,
  hasVisualAttachments,
  visualAttachmentCount,
}: SavedMessageBubbleSizeInput) {
  const input = {
    content,
    hasContextPreview,
    hasVisualAttachments,
    visualAttachmentCount,
  };
  const decision = SAVED_MESSAGE_BUBBLE_SIZE_DECISIONS.find((candidate) =>
    candidate.matches(input),
  );

  return decision?.resolve(input) ?? FIT_BUBBLE_SIZE_CLASS;
}

export function getSavedMessageGalleryRounding(rounding: string) {
  const nextRounding = rounding
    .split(" ")
    .filter(
      (className) =>
        !["rounded-br-none", "rounded-bl-none"].includes(className),
    )
    .join(" ");

  return cn(nextRounding, "rounded-tl-none");
}

function getSavedMessageDisplayContent(snapshot: SavedMessageSnapshot) {
  const { message } = snapshot;

  if (message.content) {
    return message.content;
  }

  if ((message.attachments ?? []).length > 0) {
    return "";
  }

  return getMessagePreviewText(message);
}

function hasSavedMessageContextPreview(snapshot: SavedMessageSnapshot) {
  return Boolean(
    snapshot.message.replyTo || snapshot.message.forwardedFromMessageId,
  );
}

function getVisualAttachmentCount(
  attachments: SavedMessageSnapshot["message"]["attachments"],
) {
  return (attachments ?? []).filter(isVisualAttachment).length;
}

function hasInlineFooterContent(content: string) {
  return content.trim().length > 0;
}

function isCompactSingleToken(content: string) {
  return content.length < 50 && !content.includes(" ");
}

function shouldUseAttachmentOnlyBubbleSize(input: SavedMessageBubbleSizeInput) {
  return (
    input.hasVisualAttachments && !input.content && !input.hasContextPreview
  );
}

function getAttachmentOnlyBubbleSizeClass(input: SavedMessageBubbleSizeInput) {
  return input.visualAttachmentCount > 1
    ? ATTACHMENT_GRID_BUBBLE_SIZE_CLASS
    : FIT_BUBBLE_SIZE_CLASS;
}

function shouldUseContextPreviewBubbleSize(input: SavedMessageBubbleSizeInput) {
  return input.hasContextPreview;
}

function shouldUseLongContentBubbleSize(input: SavedMessageBubbleSizeInput) {
  return input.content.length > 80;
}
