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

interface GalleryItemButtonClassInput {
  count: number;
  index: number;
  isGif: boolean;
  visibleState: ReturnType<typeof getGalleryItemViewState>["visibleState"];
}

type GalleryItemShapeClassInput = Omit<
  GalleryItemButtonClassInput,
  "visibleState"
>;

const GALLERY_ITEM_SHAPE_RULES: {
  className: string;
  matches: (input: GalleryItemShapeClassInput) => boolean;
}[] = [
  {
    className: "aspect-square max-h-120",
    matches: ({ count, isGif }) => count === 1 && isGif,
  },
  {
    className: "aspect-square max-h-120 sm:aspect-video",
    matches: ({ count }) => count === 1,
  },
  {
    className: "aspect-3/4",
    matches: ({ count }) => count === 2,
  },
  {
    className: "col-span-2 aspect-2/1 sm:aspect-16/7",
    matches: ({ count, index }) => count === 3 && index === 2,
  },
  {
    className: "aspect-square",
    matches: ({ count, index }) => count >= 4 || (count === 3 && index < 2),
  },
];

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
    const canOpen = canOpenGalleryItem(visibleState);

    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={!canOpen}
        onClick={canOpen ? onClick : undefined}
        aria-label={ariaLabel}
        className={getGalleryItemButtonClassName({
          count,
          index,
          isGif,
          visibleState,
        })}
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

function canOpenGalleryItem(
  visibleState: ReturnType<typeof getGalleryItemViewState>["visibleState"],
) {
  return visibleState !== "error";
}

function getGalleryItemButtonClassName({
  count,
  index,
  isGif,
  visibleState,
}: GalleryItemButtonClassInput) {
  return cn(
    "group/gallery-item relative block w-full appearance-none overflow-hidden bg-muted/60 text-left",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed",
    canOpenGalleryItem(visibleState) && "cursor-zoom-in",
    getGalleryItemShapeClassName({ count, index, isGif }),
  );
}

function getGalleryItemShapeClassName({
  count,
  index,
  isGif,
}: GalleryItemShapeClassInput) {
  return (
    GALLERY_ITEM_SHAPE_RULES.find((rule) =>
      rule.matches({ count, index, isGif }),
    )?.className ?? null
  );
}
