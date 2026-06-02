import { layout, type PreparedText, prepare } from "@chenglou/pretext";

import type { SenderGroup } from "@/features/activity/hooks/use-message-grouping";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  isGifAttachment,
  isVisualAttachment,
} from "@/features/activity/lib/gif-attachments";
import { getCachedMediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";

export type MessageBlockSpacing =
  | "compact"
  | "normal"
  | "related"
  | "system-boundary";

const preparedTextCache = new Map<string, PreparedText>();
const BODY_FONT = "500 14px Inter";
const BODY_LINE_HEIGHT = 20;
const MAX_BUBBLE_WIDTH = 560;
const MIN_BUBBLE_WIDTH = 220;

function getPreparedText(text: string) {
  const cacheKey = `${BODY_FONT}::${text}`;
  const cached = preparedTextCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const prepared = prepare(text, BODY_FONT, { whiteSpace: "pre-wrap" });
  preparedTextCache.set(cacheKey, prepared);
  return prepared;
}

export function getBubbleWidth(containerWidth: number, isOwn: boolean) {
  const avatarColumnWidth = isOwn ? 24 : 64;
  const responsiveMaxWidth = containerWidth < 640 ? 320 : MAX_BUBBLE_WIDTH;
  const availableWidth = Math.max(
    containerWidth - avatarColumnWidth,
    MIN_BUBBLE_WIDTH,
  );
  const percentageWidth = availableWidth * 0.85;

  return Math.max(
    MIN_BUBBLE_WIDTH,
    Math.min(responsiveMaxWidth, percentageWidth),
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function estimateAttachmentHeight(
  message: UnifiedMessage,
  bubbleWidth: number,
) {
  if (!message.attachments?.length) {
    return 0;
  }

  const mediaAttachments = message.attachments.filter(isVisualAttachment);

  const nonMediaHeight = message.attachments.reduce((sum, attachment) => {
    if (attachment.type === "AUDIO") {
      return sum + 78;
    }

    if (attachment.type === "FILE") {
      return sum + 64;
    }

    return sum;
  }, 0);

  if (mediaAttachments.length === 0) {
    return nonMediaHeight;
  }

  if (mediaAttachments.length === 1) {
    const media = mediaAttachments[0];
    const cachedSize = getCachedMediaIntrinsicSize(media.id);
    const isGif = isGifAttachment(media);

    if (cachedSize) {
      const estimatedMediaHeight = clamp(
        bubbleWidth / cachedSize.aspectRatio,
        isGif ? 188 : 180,
        480,
      );
      return nonMediaHeight + estimatedMediaHeight;
    }

    return nonMediaHeight + (isGif ? 236 : 212);
  }

  if (mediaAttachments.length === 2) {
    return nonMediaHeight + 252;
  }

  if (mediaAttachments.length === 3) {
    return nonMediaHeight + 320;
  }

  return nonMediaHeight + 360;
}

function estimateMessageHeight(message: UnifiedMessage, bubbleWidth: number) {
  if (message.type === "SYSTEM") {
    return 24;
  }

  const innerWidth = Math.max(120, bubbleWidth - 28);
  const textHeight =
    message.content.trim().length > 0
      ? layout(getPreparedText(message.content), innerWidth, BODY_LINE_HEIGHT)
          .height
      : 0;
  const replyHeight = message.replyTo ? 32 : 0;
  const attachmentHeight = estimateAttachmentHeight(message, bubbleWidth);
  const usesInlineFooter =
    message.content.trim().length > 0 &&
    !message.replyTo &&
    message.content.length < 50 &&
    !message.content.includes(" ") &&
    (message.reactions?.length ?? 0) === 0;
  const footerHeight = usesInlineFooter ? 0 : 24;
  const verticalChrome = usesInlineFooter ? 16 : 18;

  return Math.max(
    38,
    verticalChrome + replyHeight + attachmentHeight + textHeight + footerHeight,
  );
}

export function estimateSenderGroupHeight(
  senderGroup: SenderGroup,
  bubbleWidth: number,
  showDateSeparator: boolean,
  showNewMessagesSeparator: boolean,
  spacingAfter: MessageBlockSpacing,
) {
  const isSystemGroup = senderGroup.items.every(
    (message) => message.type === "SYSTEM",
  );
  const senderLabelHeight =
    senderGroup.items[0] && !senderGroup.items[0].isOwn && !isSystemGroup
      ? 20
      : 0;
  const dateHeight = showDateSeparator ? 28 : 0;
  const newMessagesSeparatorHeight = showNewMessagesSeparator ? 34 : 0;
  const messageGap = senderGroup.items.length > 1 ? 6 : 0;
  const messagesHeight = senderGroup.items.reduce(
    (sum, message, index) =>
      sum +
      estimateMessageHeight(message, bubbleWidth) +
      (index === 0 ? 0 : messageGap),
    0,
  );
  const spacingAfterHeight = {
    compact: 4,
    normal: 10,
    related: 6,
    "system-boundary": 16,
  } satisfies Record<MessageBlockSpacing, number>;

  return (
    dateHeight +
    newMessagesSeparatorHeight +
    senderLabelHeight +
    messagesHeight +
    spacingAfterHeight[spacingAfter]
  );
}
