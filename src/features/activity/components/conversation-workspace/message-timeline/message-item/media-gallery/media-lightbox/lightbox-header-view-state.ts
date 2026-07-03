import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGifAttachment } from "@/features/activity/lib/gif-attachments";
import { getDownloadCandidate } from "./lightbox-header-download";

export function getLightboxHeaderViewState({
  count,
  currentMedia,
  isDownloading,
  selectedIndex,
}: {
  count: number;
  currentMedia: UnifiedAttachment | null;
  isDownloading: boolean;
  selectedIndex: number | null;
}) {
  return {
    isDownloadDisabled: !getDownloadCandidate(currentMedia, isDownloading),
    mediaTitle: currentMedia?.name || getFallbackMediaTitle(currentMedia),
    positionLabel: `${getSelectedMediaPosition(selectedIndex)} / ${count}`,
  };
}

function getFallbackMediaTitle(media: UnifiedAttachment | null) {
  return media && isGifAttachment(media) ? "Shared GIF" : "Shared media";
}

function getSelectedMediaPosition(selectedIndex: number | null) {
  return selectedIndex === null ? 0 : selectedIndex + 1;
}
