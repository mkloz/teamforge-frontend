import { memo, useState } from "react";
import type {
  UnifiedAttachment,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import { GalleryItem } from "./gallery-item";
import { MediaLightbox } from "./media-lightbox";
import { MediaTimeOverlay } from "./media-time-overlay";

interface MediaGalleryProps {
  attachments: UnifiedAttachment[];
  isOwn?: boolean;
  rounding?: string;
  isOnlyContent?: boolean;
  timestamp?: string;
  status?: UnifiedMessage["status"];
  isReadByOthers?: boolean;
}

/**
 * MediaGallery - Adaptive collage layout with a high-performance lightbox.
 * Features organic transitions, glassmorphism, and intuitive navigation.
 */
export const MediaGallery = memo(function MediaGallery({
  attachments,
  isOwn = false,
  rounding,
  isOnlyContent = false,
  timestamp,
  status,
  isReadByOthers = false,
}: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const count = attachments.length;

  if (count === 0) return null;

  return (
    <div className="relative w-full min-w-0 max-w-full">
      <div
        className={cn(
          "grid min-w-0 max-w-full gap-1 overflow-hidden transition-colors duration-500",
          count === 1 ? "grid-cols-1" : "grid-cols-2",
          rounding ||
            "rounded-t-xl rounded-b-none border border-border/10 shadow-sm",
        )}
      >
        {attachments.slice(0, 4).map((media, i) => (
          <GalleryItem
            key={media.id}
            media={media}
            index={i}
            count={count}
            onClick={() => setSelectedIndex(i)}
          />
        ))}

        {/* Integrated Time Overlay */}
        {isOnlyContent && timestamp && (
          <MediaTimeOverlay
            timestamp={timestamp}
            isOwn={isOwn}
            status={status}
            isReadByOthers={isReadByOthers}
          />
        )}
      </div>

      <MediaLightbox
        isOpen={selectedIndex !== null}
        onOpenChange={(open: boolean) => !open && setSelectedIndex(null)}
        attachments={attachments}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </div>
  );
});
