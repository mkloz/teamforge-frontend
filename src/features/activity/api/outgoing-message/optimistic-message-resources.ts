import type {
  UnifiedAttachment,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

const TEMP_ATTACHMENT_ID_PREFIX = "temp-attachment:";

export function releaseOptimisticMessageResources(message: UnifiedMessage) {
  for (const attachment of message.attachments ?? []) {
    releaseOptimisticAttachmentResources(attachment);
  }
}

function releaseOptimisticAttachmentResources(attachment: UnifiedAttachment) {
  if (!isTemporaryOptimisticAttachment(attachment)) {
    return;
  }

  revokeBlobObjectUrl(attachment.url);

  if (hasDistinctBlobThumbnail(attachment)) {
    URL.revokeObjectURL(attachment.thumbnailUrl);
  }
}

function isTemporaryOptimisticAttachment(attachment: UnifiedAttachment) {
  return attachment.id.startsWith(TEMP_ATTACHMENT_ID_PREFIX);
}

function revokeBlobObjectUrl(url: string) {
  if (isBlobObjectUrl(url)) {
    URL.revokeObjectURL(url);
  }
}

function hasDistinctBlobThumbnail(
  attachment: UnifiedAttachment,
): attachment is UnifiedAttachment & { thumbnailUrl: string } {
  return (
    attachment.thumbnailUrl !== undefined &&
    attachment.thumbnailUrl !== null &&
    attachment.thumbnailUrl !== attachment.url &&
    isBlobObjectUrl(attachment.thumbnailUrl)
  );
}

function isBlobObjectUrl(url: string) {
  return url.startsWith("blob:");
}
