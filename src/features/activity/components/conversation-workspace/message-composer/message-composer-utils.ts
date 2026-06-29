import type { ActivityOutgoingAttachment } from "@/features/activity/lib/activity-contract";
import {
  CHAT_ATTACHMENT_MAX_SIZE_BYTES,
  CHAT_ATTACHMENT_MAX_SIZE_LABEL,
  CHAT_MAX_ATTACHMENTS,
} from "@/shared/api/api-constraints";

export const MAX_TEXTAREA_HEIGHT = 120;
const IMAGE_EXTENSION_PATTERN = /\.(?:avif|gif|heic|heif|jpe?g|png|webp)$/i;

export function getAttachmentFileKey(file: File) {
  return [file.name, file.size, file.lastModified].join(":");
}

export function isChatAttachmentWithinSizeLimit(file: File) {
  return file.size <= CHAT_ATTACHMENT_MAX_SIZE_BYTES;
}

export function isImageAttachmentCandidate(file: File) {
  return (
    file.type.startsWith("image/") || IMAGE_EXTENSION_PATTERN.test(file.name)
  );
}

export function getChatAttachmentSizeLabel() {
  return CHAT_ATTACHMENT_MAX_SIZE_LABEL;
}

export function getVoiceExtension(mimeType: string) {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
}

export function dedupeAttachments(
  nextAttachments: ActivityOutgoingAttachment[],
) {
  const seen = new Set<string>();

  return nextAttachments
    .filter(({ file }) => {
      const key = getAttachmentFileKey(file);
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, CHAT_MAX_ATTACHMENTS);
}
