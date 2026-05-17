import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGiphyMediaUrl } from "@/shared/validators/url.validator";

const GIF_FILE_PATTERN = /\.gif(?:[?#]|$)/i;
const VIDEO_FILE_PATTERN = /\.(?:m4v|mov|mp4|webm)(?:[?#]|$)/i;

function hasGifFileName(value: string | null | undefined) {
  return Boolean(value && GIF_FILE_PATTERN.test(value));
}

function hasVideoFileName(value: string | null | undefined) {
  return Boolean(value && VIDEO_FILE_PATTERN.test(value));
}

export function isGiphyAttachment(attachment: UnifiedAttachment) {
  return (
    (attachment.type === "VIDEO" || attachment.type === "GIF") &&
    (isGiphyMediaUrl(attachment.url) ||
      isGiphyMediaUrl(attachment.thumbnailUrl))
  );
}

export function isGifAttachment(attachment: UnifiedAttachment) {
  return (
    attachment.type === "GIF" ||
    isGiphyAttachment(attachment) ||
    attachment.mimeType === "image/gif" ||
    hasGifFileName(attachment.url) ||
    hasGifFileName(attachment.name)
  );
}

export function isGifVideoAttachment(attachment: UnifiedAttachment) {
  return (
    isGifAttachment(attachment) &&
    (attachment.type === "VIDEO" ||
      Boolean(attachment.mimeType?.startsWith("video/")) ||
      hasVideoFileName(attachment.url))
  );
}

export function isVisualAttachment(attachment: UnifiedAttachment) {
  return (
    attachment.type === "IMAGE" ||
    attachment.type === "VIDEO" ||
    attachment.type === "GIF"
  );
}
