import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGiphyMediaUrl } from "@/shared/validators/url.validator";

export function isGiphyAttachment(attachment: UnifiedAttachment) {
  return (
    attachment.type === "VIDEO" &&
    (isGiphyMediaUrl(attachment.url) ||
      isGiphyMediaUrl(attachment.thumbnailUrl))
  );
}
