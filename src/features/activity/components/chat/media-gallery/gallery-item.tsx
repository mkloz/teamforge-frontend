import { cn } from "@/shared/lib/utils";
import { useImageState } from "@/shared/hooks/use-image-state";
import { ImageOff, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
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

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={state === "error" ? undefined : onClick}
        className={cn(
          "relative group/gallery-item overflow-hidden bg-muted/60",
          state !== "error" && "cursor-zoom-in",
          count === 1 && "aspect-square sm:aspect-video max-h-120",
          count === 2 && "aspect-3/4",
          count === 3 && index === 2 && "col-span-2 aspect-2/1 sm:aspect-16/7",
          (count >= 4 || (count === 3 && index < 2)) && "aspect-square",
        )}
      >
        {/* ── Loading skeleton ── */}
        <AnimatePresence>
          {state === "loading" && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-muted/80 animate-pulse"
            >
              {/* Shimmer stripe */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error state ── */}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/60">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <ImageOff
                size={16}
                strokeWidth={1.5}
                className="text-slate-muted"
              />
            </div>
            <span className="text-[10px] font-medium text-slate-muted/70 uppercase tracking-wide">
              Failed to load
            </span>
          </div>
        )}

        {/* ── Image ── */}
        <img
          src={media.thumbnailUrl || media.url}
          alt={media.name || `Attachment ${index + 1}`}
          loading="lazy"
          onLoad={onLoad}
          onError={onError}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-out group-hover/gallery-item:scale-110",
            state === "loaded" ? "opacity-100" : "opacity-0",
          )}
        />

        {/* ── Hover overlays (only when loaded) ── */}
        {state === "loaded" && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover/gallery-item:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 opacity-0 group-hover/gallery-item:opacity-100 scale-90 group-hover/gallery-item:scale-100 transition-[opacity,transform] duration-200">
              <Layers size={14} className="text-white/80" />
            </div>
            <div className="absolute inset-0 ring-inset ring-0 ring-white/20 group-hover/gallery-item:ring-8 transition-all duration-500 ease-out" />
          </>
        )}

        {isLastVisible && state === "loaded" && <MoreOverlay count={count} />}
      </motion.div>
    );
  },
);
