import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { ThumbnailStrip } from "./thumbnail-strip";
import { LightboxHeader } from "./lightbox-header";
import { LightboxStage } from "./lightbox-stage";
import { useLightboxNavigation } from "./use-lightbox-navigation";

interface MediaLightboxProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: UnifiedAttachment[];
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
}

export const MediaLightbox = memo(function MediaLightbox({
  isOpen,
  onOpenChange,
  attachments,
  selectedIndex,
  setSelectedIndex,
}: MediaLightboxProps) {
  const { count, currentMedia, handleNext, handlePrev } = useLightboxNavigation(
    {
      attachments,
      selectedIndex,
      setSelectedIndex,
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="pointer-events-auto flex h-dvh w-full max-w-[100vw] flex-col overflow-hidden border-none bg-black/98 p-0 shadow-none backdrop-blur-3xl [&>button]:top-6 [&>button]:right-6 [&>button]:flex [&>button]:h-10 [&>button]:w-10 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white/10 [&>button]:text-white [&>button]:opacity-100 [&>button]:transition-all [&>button]:hover:bg-white/20 [&>button_svg]:h-5 [&>button_svg]:w-5">
        <AnimatePresence mode="popLayout">
          <motion.div
            key="lightbox-container"
            className="relative flex h-full w-full flex-col"
          >
            <LightboxHeader
              count={count}
              currentMedia={currentMedia}
              selectedIndex={selectedIndex}
            />

            <LightboxStage
              count={count}
              currentMedia={currentMedia}
              onNext={handleNext}
              onPrev={handlePrev}
            />

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
