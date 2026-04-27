import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImageOff,
  Loader2,
} from "lucide-react";
import { memo } from "react";
import type { UnifiedAttachment } from "@/features/activity/types/chat.types";
import { useImageState } from "@/shared/hooks/use-image-state";
import { NavButton } from "./nav-button";
import { ThumbnailStrip } from "./thumbnail-strip";
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface MediaLightboxProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: UnifiedAttachment[];
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
}

// ─── Main image with per-image load / error state ────────────────────────────
// Extracted so useImageState resets automatically whenever the key (image id)
// changes — i.e. every time the user navigates to a different image.

const LightboxImage = memo(function LightboxImage({
  media,
}: {
  media: UnifiedAttachment;
}) {
  const { state, onLoad, onError } = useImageState();

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Loading spinner */}
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            size={36}
            strokeWidth={1.5}
            className="text-white/40 animate-spin"
          />
        </div>
      )}

      {/* Error state */}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ImageOff size={28} strokeWidth={1} className="text-white/30" />
          </div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
            Image unavailable
          </p>
        </div>
      )}

      {/* Image — fades in once loaded */}
      <img
        src={media.url}
        alt={media.name || "Shared image"}
        onLoad={onLoad}
        onError={onError}
        className={cn(
          "max-w-full max-h-full object-contain select-none",
          "shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] ring-1 ring-white/5",
          "transition-opacity duration-300",
          state === "loaded" ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
});

// ─── Lightbox shell ───────────────────────────────────────────────────────────

export const MediaLightbox = memo(function MediaLightbox({
  isOpen,
  onOpenChange,
  attachments,
  selectedIndex,
  setSelectedIndex,
}: MediaLightboxProps) {
  const count = attachments.length;
  const currentMedia =
    selectedIndex !== null ? attachments[selectedIndex] : null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % count);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null)
      setSelectedIndex((selectedIndex - 1 + count) % count);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-full h-dvh p-0 border-none bg-black/98 backdrop-blur-3xl overflow-hidden shadow-none flex flex-col pointer-events-auto [&>button]:right-6 [&>button]:top-6 [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-full [&>button]:bg-white/10 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-white/20 [&>button]:transition-all [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button_svg]:h-5 [&>button_svg]:w-5">
        <AnimatePresence mode="popLayout">
          <motion.div
            key="lightbox-container"
            className="relative w-full h-full flex flex-col"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-0 inset-x-0 h-20 pl-8 pr-28 flex items-center justify-between z-50 bg-linear-to-b from-black/60 to-transparent pointer-events-none"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-white font-black text-micro tracking-wide">
                    {selectedIndex !== null ? selectedIndex + 1 : 0} / {count}
                  </span>
                  <span className="text-white/80 font-bold text-sm tracking-tight truncate max-w-40 sm:max-w-80 uppercase">
                    {currentMedia?.name || "Shared memory"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 pointer-events-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/60 hover:text-white hover:bg-white/10 rounded-full transition active:scale-90 pointer-events-auto"
                      >
                        <Download size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-white/10 backdrop-blur-md border-white/10 text-white font-bold text-xs"
                    >
                      Download Image
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>

            <div className="flex-1 relative flex items-center justify-center p-2 sm:p-10 pointer-events-auto overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {currentMedia && (
                  <motion.div
                    // Key on id — causes LightboxImage to remount on navigation,
                    // which resets useImageState to "loading" automatically.
                    key={currentMedia.id}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      rotateY: 10,
                      filter: "blur(20px)",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotateY: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.1,
                      rotateY: -10,
                      filter: "blur(20px)",
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                      filter: { duration: 0.3 },
                    }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <LightboxImage media={currentMedia} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Arrows */}
              {count > 1 && (
                <div className="absolute inset-x-0 hidden sm:flex justify-between px-10 pointer-events-none">
                  <NavButton
                    onClick={handlePrev}
                    icon={<ChevronLeft size={28} strokeWidth={2.5} />}
                  />
                  <NavButton
                    onClick={handleNext}
                    icon={<ChevronRight size={28} strokeWidth={2.5} />}
                  />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {count > 1 && (
              <ThumbnailStrip
                attachments={attachments}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
});
