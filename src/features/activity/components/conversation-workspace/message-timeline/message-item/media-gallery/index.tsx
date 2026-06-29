import { useState } from "react";
import type {
  UnifiedAttachment,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { isGifAttachment } from "@/features/activity/lib/gif-attachments";
import { cn } from "@/shared/lib/utils";
import { GalleryItem } from "./gallery-item";
import { MediaLightbox } from "./media-lightbox";
import { MediaTimeOverlay } from "./media-time-overlay";

const VISIBLE_GALLERY_ATTACHMENT_COUNT = 4;

interface MediaGalleryProps {
  attachments: UnifiedAttachment[];
  isOwn?: boolean;
  rounding?: string;
  isOnlyContent?: boolean;
  timestamp?: string;
  status?: UnifiedMessage["status"];
  isReadByOthers?: boolean;
}

interface MediaGalleryReadyState {
  containerClassName: string;
  count: number;
  gridClassName: string;
  isLightboxOpen: boolean;
  timeOverlay: MediaGalleryTimeOverlayState;
  visibleAttachments: UnifiedAttachment[];
}

type MediaGalleryViewState =
  | { kind: "empty" }
  | ({ kind: "ready" } & MediaGalleryReadyState);

type MediaGalleryTimeOverlayState =
  | { shouldRender: false; timestamp?: undefined }
  | { shouldRender: true; timestamp: string };

/**
 * MediaGallery - Adaptive collage layout with a high-performance lightbox.
 * Features organic transitions, glassmorphism, and intuitive navigation.
 */
export function MediaGallery({
  attachments,
  isOwn = false,
  rounding,
  isOnlyContent = false,
  timestamp,
  status,
  isReadByOthers = false,
}: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const viewState = getMediaGalleryViewState({
    attachments,
    isOnlyContent,
    rounding,
    selectedIndex,
    timestamp,
  });

  if (viewState.kind === "empty") return null;

  return (
    <div className={viewState.containerClassName}>
      <div className={viewState.gridClassName}>
        {viewState.visibleAttachments.map((media, i) => (
          <GalleryItem
            key={media.id}
            media={media}
            index={i}
            count={viewState.count}
            onClick={() => setSelectedIndex(i)}
          />
        ))}

        {/* Integrated Time Overlay */}
        <MediaGalleryTimeOverlay
          state={viewState.timeOverlay}
          isOwn={isOwn}
          status={status}
          isReadByOthers={isReadByOthers}
        />
      </div>

      <MediaLightbox
        isOpen={viewState.isLightboxOpen}
        onOpenChange={(open: boolean) => !open && setSelectedIndex(null)}
        attachments={attachments}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </div>
  );
}

function getMediaGalleryViewState({
  attachments,
  isOnlyContent,
  rounding,
  selectedIndex,
  timestamp,
}: {
  attachments: UnifiedAttachment[];
  isOnlyContent: boolean;
  rounding?: string;
  selectedIndex: number | null;
  timestamp?: string;
}): MediaGalleryViewState {
  const count = attachments.length;

  if (count === 0) {
    return { kind: "empty" };
  }

  return {
    kind: "ready",
    containerClassName: getMediaGalleryContainerClassName(
      hasSingleGifAttachment(attachments, count),
    ),
    count,
    gridClassName: getMediaGalleryGridClassName(count, rounding),
    isLightboxOpen: selectedIndex !== null,
    timeOverlay: getMediaGalleryTimeOverlayState(isOnlyContent, timestamp),
    visibleAttachments: attachments.slice(0, VISIBLE_GALLERY_ATTACHMENT_COUNT),
  };
}

function getMediaGalleryContainerClassName(hasSingleGif: boolean) {
  return cn(
    "relative min-w-0 max-w-full",
    hasSingleGif ? "w-36 sm:w-56" : "w-full",
  );
}

function getMediaGalleryGridClassName(count: number, rounding?: string) {
  return cn(
    "grid min-w-0 max-w-full gap-1 overflow-hidden transition-colors duration-500",
    count === 1 ? "grid-cols-1" : "grid-cols-2",
    rounding || "rounded-t-xl rounded-b-none border border-border/10 shadow-sm",
  );
}

function hasSingleGifAttachment(
  attachments: UnifiedAttachment[],
  count: number,
) {
  return count === 1 && isGifAttachment(attachments[0]);
}

function getMediaGalleryTimeOverlayState(
  isOnlyContent: boolean,
  timestamp?: string,
): MediaGalleryTimeOverlayState {
  if (!isOnlyContent || !timestamp) {
    return { shouldRender: false };
  }

  return { shouldRender: true, timestamp };
}

function MediaGalleryTimeOverlay({
  state,
  isOwn,
  status,
  isReadByOthers,
}: {
  state: MediaGalleryTimeOverlayState;
  isOwn: boolean;
  status?: UnifiedMessage["status"];
  isReadByOthers: boolean;
}) {
  if (!state.shouldRender) {
    return null;
  }

  return (
    <MediaTimeOverlay
      timestamp={state.timestamp}
      isOwn={isOwn}
      status={status}
      isReadByOthers={isReadByOthers}
    />
  );
}
