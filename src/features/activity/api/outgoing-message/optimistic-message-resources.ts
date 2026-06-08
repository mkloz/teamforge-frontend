import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export function releaseOptimisticMessageResources(message: UnifiedMessage) {
  for (const attachment of message.attachments ?? []) {
    if (!attachment.id.startsWith("temp-attachment:")) {
      continue;
    }

    if (attachment.url.startsWith("blob:")) {
      URL.revokeObjectURL(attachment.url);
    }

    if (
      attachment.thumbnailUrl &&
      attachment.thumbnailUrl !== attachment.url &&
      attachment.thumbnailUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(attachment.thumbnailUrl);
    }
  }
}
