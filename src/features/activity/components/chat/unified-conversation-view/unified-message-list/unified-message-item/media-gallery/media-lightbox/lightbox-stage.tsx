import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MouseEvent } from "react";
import { memo } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGifVideoAttachment } from "@/features/activity/lib/gif-attachments";

import { LightboxImage, LightboxVideo } from "./lightbox-media";
import { NavButton } from "./nav-button";

interface LightboxStageProps {
  count: number;
  currentMedia: UnifiedAttachment | null;
  onNext: (event: MouseEvent) => void;
  onPrev: (event: MouseEvent) => void;
}

export const LightboxStage = memo(function LightboxStage({
  count,
  currentMedia,
  onNext,
  onPrev,
}: LightboxStageProps) {
  const shouldRenderVideo =
    currentMedia?.type === "VIDEO" ||
    (currentMedia ? isGifVideoAttachment(currentMedia) : false);

  return (
    <div className="pointer-events-auto relative flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {currentMedia && (
          <motion.div
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
            className="relative flex size-full items-center justify-center"
          >
            {shouldRenderVideo ? (
              <LightboxVideo media={currentMedia} />
            ) : (
              <LightboxImage media={currentMedia} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {count > 1 && (
        <div className="pointer-events-none absolute inset-x-0 inset-y-0 hidden items-center justify-between px-6 sm:flex lg:px-10">
          <NavButton
            onClick={onPrev}
            label="Previous media"
            icon={
              <ChevronLeft className="size-8 sm:size-9" strokeWidth={2.75} />
            }
          />
          <NavButton
            onClick={onNext}
            label="Next media"
            icon={
              <ChevronRight className="size-8 sm:size-9" strokeWidth={2.75} />
            }
          />
        </div>
      )}
    </div>
  );
});
