import { AnimatePresence, motion } from "framer-motion";
import { ImageOff, Layers, Play } from "lucide-react";
import { memo } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import {
  cacheMediaIntrinsicSize,
  getCachedMediaIntrinsicSize,
} from "@/features/activity/lib/media-intrinsic-size";
import { Image } from "@/shared/components/common/image";
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
        disabled={state === "error"}
        onClick={state === "error" ? undefined : onClick}
        aria-label={`Open ${media.type === "VIDEO" ? "video" : "image"} attachment ${index + 1}`}
        className={cn(
          "group/gallery-item relative block size-full appearance-none overflow-hidden bg-muted/60 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40 focus-visible:ring-offset-2",
          "disabled:cursor-default",
          state !== "error" && "cursor-zoom-in",
          count === 1 && "aspect-square max-h-120 sm:aspect-video",
          count === 2 && "aspect-3/4",
          count === 3 && index === 2 && "col-span-2 aspect-2/1 sm:aspect-16/7",
          (count >= 4 || (count === 3 && index < 2)) && "aspect-square",
        )}
        style={singleAspectRatioStyle}
      >
        {/* ── Loading skeleton ── */}
        <AnimatePresence>
          {state === "loading" && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 animate-pulse bg-muted/80"
            >
              {/* Shimmer stripe */}
              <div className="absolute inset-0 -translate-x-full animate-pulse bg-linear-to-r from-transparent via-white/10 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error state ── */}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/60">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <ImageOff className="size-4 text-slate-muted" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-slate-muted/70 text-xs uppercase tracking-wide">
              Failed to load
            </span>
          </div>
        )}

        {/* ── Image ── */}
        {media.type === "VIDEO" ? (
          <video
            src={media.url}
            poster={media.thumbnailUrl || undefined}
            preload="metadata"
            muted
            playsInline
            onLoadedMetadata={(event) => {
              cacheMediaIntrinsicSize(
                media.id,
                event.currentTarget.videoWidth,
                event.currentTarget.videoHeight,
              );
              onLoad();
            }}
            onError={onError}
            className={cn(
              "size-full object-cover transition-all duration-700 ease-out will-change-transform group-hover/gallery-item:scale-110",
              state === "loaded" ? "opacity-100" : "opacity-0",
            )}
          />
        ) : (
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
              state === "loaded" ? "opacity-100" : "opacity-0",
            )}
            loadingComponent={null}
            fallbackComponent={null}
            showNoImage={false}
          />
        )}

        {/* ── Hover overlays (only when loaded) ── */}
        {state === "loaded" && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/gallery-item:opacity-100" />
            {media.type === "VIDEO" ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-lg backdrop-blur-sm">
                  <Play className="ml-0.5 size-4 fill-current" />
                </span>
              </div>
            ) : null}
            <div className="absolute top-2 right-2 scale-90 rounded-lg border border-white/10 bg-black/20 p-1.5 opacity-0 backdrop-blur-md transition-all duration-200 group-hover/gallery-item:scale-100 group-hover/gallery-item:opacity-100">
              <Layers className="size-3.5 text-white/80" />
            </div>
            <div className="absolute inset-0 ring-0 ring-white/20 ring-inset transition-all duration-500 ease-out group-hover/gallery-item:ring-8" />
          </>
        )}

        {isLastVisible && state === "loaded" && <MoreOverlay count={count} />}
      </motion.button>
    );
  },
);
