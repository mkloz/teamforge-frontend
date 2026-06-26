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
const MIN_TEXT_WIDTH = 120;
const SYSTEM_MESSAGE_HEIGHT = 24;
const MIN_MESSAGE_HEIGHT = 38;
const MESSAGE_HORIZONTAL_CHROME = 28;
const REPLY_PREVIEW_HEIGHT = 32;
const DEFAULT_FOOTER_HEIGHT = 24;
const INLINE_FOOTER_VERTICAL_CHROME = 16;
const DEFAULT_VERTICAL_CHROME = 18;
const SENDER_LABEL_HEIGHT = 20;
const DATE_SEPARATOR_HEIGHT = 28;
const NEW_MESSAGES_SEPARATOR_HEIGHT = 34;
const STACKED_MESSAGE_GAP = 6;
const AUDIO_ATTACHMENT_HEIGHT = 78;
const FILE_ATTACHMENT_HEIGHT = 64;
const FALLBACK_IMAGE_ATTACHMENT_HEIGHT = 212;
const FALLBACK_GIF_ATTACHMENT_HEIGHT = 236;
const MIN_IMAGE_ATTACHMENT_HEIGHT = 180;
const MIN_GIF_ATTACHMENT_HEIGHT = 188;
const MAX_SINGLE_MEDIA_ATTACHMENT_HEIGHT = 480;
const MEDIA_GRID_HEIGHT_BY_COUNT = {
  2: 252,
  3: 320,
} as const;
const MANY_MEDIA_GRID_HEIGHT = 360;
const SPACING_AFTER_HEIGHT = {
  compact: 4,
  normal: 10,
  related: 6,
  "system-boundary": 16,
} satisfies Record<MessageBlockSpacing, number>;

type MessageAttachments = NonNullable<UnifiedMessage["attachments"]>;
type MessageAttachment = MessageAttachments[number];

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
  const nonMediaHeight = estimateNonMediaAttachmentHeight(message.attachments);

  return (
    nonMediaHeight +
    estimateMediaAttachmentHeight(mediaAttachments, bubbleWidth)
  );
}

function estimateNonMediaAttachmentHeight(attachments: MessageAttachments) {
  return attachments.reduce((sum, attachment) => {
    if (attachment.type === "AUDIO") {
      return sum + AUDIO_ATTACHMENT_HEIGHT;
    }

    if (attachment.type === "FILE") {
      return sum + FILE_ATTACHMENT_HEIGHT;
    }

    return sum;
  }, 0);
}

function estimateMediaAttachmentHeight(
  mediaAttachments: MessageAttachment[],
  bubbleWidth: number,
) {
  if (mediaAttachments.length === 0) {
    return 0;
  }

  if (mediaAttachments.length === 1) {
    const [media] = mediaAttachments;

    return media ? estimateSingleMediaAttachmentHeight(media, bubbleWidth) : 0;
  }

  return estimateMediaGridHeight(mediaAttachments.length);
}

function estimateSingleMediaAttachmentHeight(
  media: MessageAttachment,
  bubbleWidth: number,
) {
  const cachedSize = getCachedMediaIntrinsicSize(media.id);
  const isGif = isGifAttachment(media);

  if (!cachedSize) {
    return isGif
      ? FALLBACK_GIF_ATTACHMENT_HEIGHT
      : FALLBACK_IMAGE_ATTACHMENT_HEIGHT;
  }

  return clamp(
    bubbleWidth / cachedSize.aspectRatio,
    getMinimumSingleMediaHeight(isGif),
    MAX_SINGLE_MEDIA_ATTACHMENT_HEIGHT,
  );
}

function getMinimumSingleMediaHeight(isGif: boolean) {
  return isGif ? MIN_GIF_ATTACHMENT_HEIGHT : MIN_IMAGE_ATTACHMENT_HEIGHT;
}

function estimateMediaGridHeight(mediaAttachmentCount: number) {
  if (mediaAttachmentCount === 2 || mediaAttachmentCount === 3) {
    return MEDIA_GRID_HEIGHT_BY_COUNT[mediaAttachmentCount];
  }

  return MANY_MEDIA_GRID_HEIGHT;
}

function estimateMessageHeight(message: UnifiedMessage, bubbleWidth: number) {
  if (message.type === "SYSTEM") {
    return SYSTEM_MESSAGE_HEIGHT;
  }

  const innerWidth = Math.max(
    MIN_TEXT_WIDTH,
    bubbleWidth - MESSAGE_HORIZONTAL_CHROME,
  );
  const textHeight = estimateTextHeight(message.content, innerWidth);
  const replyHeight = message.replyTo ? REPLY_PREVIEW_HEIGHT : 0;
  const attachmentHeight = estimateAttachmentHeight(message, bubbleWidth);
  const footerMetrics = getMessageFooterMetrics(canUseInlineFooter(message));

  return Math.max(
    MIN_MESSAGE_HEIGHT,
    footerMetrics.verticalChrome +
      replyHeight +
      attachmentHeight +
      textHeight +
      footerMetrics.footerHeight,
  );
}

function getMessageFooterMetrics(usesInlineFooter: boolean) {
  return usesInlineFooter
    ? { footerHeight: 0, verticalChrome: INLINE_FOOTER_VERTICAL_CHROME }
    : {
        footerHeight: DEFAULT_FOOTER_HEIGHT,
        verticalChrome: DEFAULT_VERTICAL_CHROME,
      };
}

function estimateTextHeight(content: string, innerWidth: number) {
  return content.trim().length > 0
    ? layout(getPreparedText(content), innerWidth, BODY_LINE_HEIGHT).height
    : 0;
}

function allConditionsPass(conditions: boolean[]) {
  return conditions.every(Boolean);
}

function canUseInlineFooter(message: UnifiedMessage) {
  return allConditionsPass([
    message.content.trim().length > 0,
    !message.replyTo,
    message.content.length < 50,
    !message.content.includes(" "),
    (message.reactions?.length ?? 0) === 0,
  ]);
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
  const senderLabelHeight = getSenderLabelHeight(senderGroup, isSystemGroup);
  const dateHeight = getOptionalHeight(
    showDateSeparator,
    DATE_SEPARATOR_HEIGHT,
  );
  const newMessagesSeparatorHeight = getOptionalHeight(
    showNewMessagesSeparator,
    NEW_MESSAGES_SEPARATOR_HEIGHT,
  );
  const messagesHeight = estimateSenderGroupMessagesHeight(
    senderGroup,
    bubbleWidth,
  );

  return (
    dateHeight +
    newMessagesSeparatorHeight +
    senderLabelHeight +
    messagesHeight +
    SPACING_AFTER_HEIGHT[spacingAfter]
  );
}

function getSenderLabelHeight(
  senderGroup: SenderGroup,
  isSystemGroup: boolean,
) {
  const firstMessage = senderGroup.items[0];

  return firstMessage && !firstMessage.isOwn && !isSystemGroup
    ? SENDER_LABEL_HEIGHT
    : 0;
}

function getOptionalHeight(isVisible: boolean, height: number) {
  return isVisible ? height : 0;
}

function estimateSenderGroupMessagesHeight(
  senderGroup: SenderGroup,
  bubbleWidth: number,
) {
  const messageGap = senderGroup.items.length > 1 ? STACKED_MESSAGE_GAP : 0;

  return senderGroup.items.reduce(
    (sum, message, index) =>
      sum +
      estimateMessageHeight(message, bubbleWidth) +
      (index === 0 ? 0 : messageGap),
    0,
  );
}
