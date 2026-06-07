import { AnimatePresence, motion } from "framer-motion";
import { Layers, Play } from "lucide-react";
import { memo, useState } from "react";
import { ErrorMediaImageUnavailableVisual } from "@/features/activity/assets/error-media-image-unavailable";
import { ErrorMediaVideoUnavailableVisual } from "@/features/activity/assets/error-media-video-unavailable";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import {
  isGifAttachment,
  isGifVideoAttachment,
} from "@/features/activity/lib/gif-attachments";
import {
  cacheMediaIntrinsicSize,
  getCachedMediaIntrinsicSize,
} from "@/features/activity/lib/media-intrinsic-size";
import { Image } from "@/shared/components/common/image";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useImageState } from "@/shared/hooks/use-image-state";
import { cn } from "@/shared/lib/utils";
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
    const isVideo = media.type === "VIDEO";
    const isGif = isGifAttachment(media);
    const isVideoBackedGif = isGifVideoAttachment(media);
    const hasVideoPoster = Boolean(media.thumbnailUrl);
    const shouldLoadImage =
      !isVideoBackedGif &&
      (media.type === "IMAGE" || media.type === "GIF" || hasVideoPoster);
    const visibleState = isVideoBackedGif
      ? hasGifError
        ? "error"
        : hasGifLoaded
          ? "loaded"
          : "loading"
      : shouldLoadImage
        ? state
        : "loaded";
    const isLastVisible = index === 3 && count > 4;
    const cachedSize = getCachedMediaIntrinsicSize(media.id);
    const singleAspectRatioStyle =
      count === 1 && cachedSize
        ? {
            aspectRatio: `${cachedSize.width} / ${cachedSize.height}`,
          }
        : undefined;

    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        disabled={visibleState === "error"}
        onClick={visibleState === "error" ? undefined : onClick}
        aria-label={`Open ${
          isGif ? "GIF" : media.type === "VIDEO" ? "video" : "image"
        } attachment ${index + 1}`}
        className={cn(
          "group/gallery-item relative block w-full appearance-none overflow-hidden bg-muted/60 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40 focus-visible:ring-offset-2",
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
        {/* ── Loading skeleton ── */}
        <AnimatePresence>
          {visibleState === "loading" && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Skeleton className="size-full" tone="muted" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error state ── */}
        {visibleState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/60">
            {media.type === "VIDEO" ? (
              <ErrorMediaVideoUnavailableVisual className="h-12 w-auto text-foreground" />
            ) : (
              <ErrorMediaImageUnavailableVisual className="h-12 w-auto text-foreground" />
            )}
            <span className="font-medium text-slate-muted/70 text-xs">
              Failed to load
            </span>
          </div>
        )}

        {/* ── Image ── */}
        {isVideoBackedGif ? (
          <video
            src={media.url}
            poster={media.thumbnailUrl || undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={(event) => {
              cacheMediaIntrinsicSize(
                media.id,
                event.currentTarget.videoWidth,
                event.currentTarget.videoHeight,
              );
              setHasGifLoaded(true);
            }}
            onError={() => setHasGifError(true)}
            className={cn(
              "absolute inset-0 size-full object-cover transition-all duration-700 ease-out will-change-transform group-hover/gallery-item:scale-105",
              isGif && "object-contain",
              hasGifLoaded ? "opacity-100" : "opacity-0",
            )}
          >
            <track
              kind="captions"
              src="data:text/vtt,WEBVTT"
              srcLang="en"
              label="No captions available"
            />
          </video>
        ) : shouldLoadImage ? (
          <Image
            src={media.thumbnailUrl || media.url}
            alt={media.name || `Attachment ${index + 1}`}
            onLoad={(event) => {
              cacheMediaIntrinsicSize(
                media.id,
                event.currentTarget.naturalWidth,
                event.currentTarget.naturalHeight,
              );
              onLoad();
            }}
            onError={onError}
            wrapperClassName="absolute inset-0"
            className={cn(
              "transition-all duration-700 ease-out will-change-transform group-hover/gallery-item:scale-110",
              isGif && "object-contain",
              state === "loaded" ? "opacity-100" : "opacity-0",
            )}
            loadingComponent={null}
            fallbackComponent={null}
            showNoImage={false}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/70 text-slate-muted">
            <span className="flex size-11 items-center justify-center rounded-full border border-forge-teal/20 bg-forge-teal/10 text-forge-teal">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
            <span className="font-semibold text-xs">Video</span>
          </div>
        )}

        {/* ── Hover overlays (only when loaded) ── */}
        {visibleState === "loaded" && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/gallery-item:opacity-100" />
            {isVideo && !isGif ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-lg backdrop-blur-sm">
                  <Play className="ml-0.5 size-4 fill-current" />
                </span>
              </div>
            ) : null}
            {isGif ? (
              <span className="absolute top-2 left-2 rounded-md border border-white/10 bg-black/35 px-1.5 py-0.5 font-black text-nano text-white/90 leading-none tracking-wide backdrop-blur-sm">
                GIF
              </span>
            ) : null}
            <div className="absolute top-2 right-2 scale-90 rounded-lg border border-white/10 bg-black/20 p-1.5 opacity-0 backdrop-blur-md transition-all duration-200 group-hover/gallery-item:scale-100 group-hover/gallery-item:opacity-100">
              <Layers className="size-3.5 text-white/80" />
            </div>
            <div className="absolute inset-0 ring-0 ring-white/20 ring-inset transition-all duration-500 ease-out group-hover/gallery-item:ring-4" />
          </>
        )}

        {isLastVisible && visibleState === "loaded" && (
          <MoreOverlay count={count} />
        )}
      </motion.button>
    );
  },
);
