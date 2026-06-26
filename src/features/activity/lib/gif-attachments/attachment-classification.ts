import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGiphyMediaUrl } from "@/shared/validators/url.validator";

import { hasGifFileName, hasVideoFileName } from "./file-name-patterns";

function hasGiphyMediaUrl(attachment: UnifiedAttachment) {
  return (
    isGiphyMediaUrl(attachment.url) || isGiphyMediaUrl(attachment.thumbnailUrl)
  );
}

function canRepresentGiphyMedia(attachment: UnifiedAttachment) {
  return attachment.type === "VIDEO" || attachment.type === "GIF";
}

function isGiphyAttachment(attachment: UnifiedAttachment) {
  return canRepresentGiphyMedia(attachment) && hasGiphyMediaUrl(attachment);
}

function hasGifIdentity(attachment: UnifiedAttachment) {
  return (
    attachment.type === "GIF" ||
    attachment.mimeType === "image/gif" ||
    hasGifFileName(attachment.url) ||
    hasGifFileName(attachment.name)
  );
}

function hasVideoIdentity(attachment: UnifiedAttachment) {
  return (
    attachment.type === "VIDEO" ||
    Boolean(attachment.mimeType?.startsWith("video/")) ||
    hasVideoFileName(attachment.url)
  );
}

export function isGifAttachment(attachment: UnifiedAttachment) {
  return hasGifIdentity(attachment) || isGiphyAttachment(attachment);
}

export function isGifVideoAttachment(attachment: UnifiedAttachment) {
  return isGifAttachment(attachment) && hasVideoIdentity(attachment);
}

export function isVisualAttachment(attachment: UnifiedAttachment) {
  return (
    attachment.type === "IMAGE" ||
    attachment.type === "VIDEO" ||
    attachment.type === "GIF"
  );
}
