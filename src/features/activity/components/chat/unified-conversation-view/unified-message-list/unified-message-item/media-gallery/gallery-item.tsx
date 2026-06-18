import { motion } from "framer-motion";
import { memo, useState } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { getCachedMediaIntrinsicSize } from "@/features/activity/lib/media-intrinsic-size";
import { useImageState } from "@/shared/hooks/use-image-state";
import { cn } from "@/shared/lib/utils";
import {
  GalleryItemErrorState,
  GalleryItemLoadedOverlays,
  GalleryItemLoadingSkeleton,
  GalleryItemMedia,
} from "./gallery-item-render-parts";
import { getGalleryItemViewState } from "./gallery-item-view-state";
import { MoreOverlay } from "./more-overlay";

interface GalleryItemProps {
  media: UnifiedAttachment;
  index: number;
  count: number;
  onClick: () => void;
}

export const GalleryItem = memo(
  ({ media, index, count, onClick }: GalleryItemProps) => {
    const { state, onLoad, onError } = useImageState();
    const [hasGifLoaded, setHasGifLoaded] = useState(false);
    const [hasGifError, setHasGifError] = useState(false);
    const cachedSize = getCachedMediaIntrinsicSize(media.id);
    const {
      ariaLabel,
      isGif,
      isLastVisible,
      isVideo,
      isVideoBackedGif,
      shouldLoadImage,
      singleAspectRatioStyle,
      visibleState,
    } = getGalleryItemViewState({
      cachedSize,
      count,
      hasGifError,
      hasGifLoaded,
      imageState: state,
      index,
      media,
    });

    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={visibleState === "error"}
        onClick={visibleState === "error" ? undefined : onClick}
        aria-label={ariaLabel}
        className={cn(
          "group/gallery-item relative block w-full appearance-none overflow-hidden bg-muted/60 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed",
          visibleState !== "error" && "cursor-zoom-in",
          count === 1 &&
            (isGif
              ? "aspect-square max-h-120"
              : "aspect-square max-h-120 sm:aspect-video"),
          count === 2 && "aspect-3/4",
          count === 3 && index === 2 && "col-span-2 aspect-2/1 sm:aspect-16/7",
          (count >= 4 || (count === 3 && index < 2)) && "aspect-square",
        )}
        style={singleAspectRatioStyle}
      >
        <GalleryItemLoadingSkeleton isLoading={visibleState === "loading"} />

        {visibleState === "error" && (
          <GalleryItemErrorState mediaType={media.type} />
        )}

        <GalleryItemMedia
          hasGifLoaded={hasGifLoaded}
          imageState={state}
          index={index}
          isGif={isGif}
          isVideoBackedGif={isVideoBackedGif}
          media={media}
          onGifError={() => setHasGifError(true)}
          onGifLoaded={() => setHasGifLoaded(true)}
          onImageError={onError}
          onImageLoaded={onLoad}
          shouldLoadImage={shouldLoadImage}
        />

        {visibleState === "loaded" && (
          <GalleryItemLoadedOverlays isGif={isGif} isVideo={isVideo} />
        )}

        {isLastVisible && visibleState === "loaded" && (
          <MoreOverlay count={count} />
        )}
      </motion.button>
    );
  },
);
