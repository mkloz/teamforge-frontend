import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";
import type { MouseEvent } from "react";

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
  return (
    <div className="flex-1 relative flex items-center justify-center p-2 sm:p-10 pointer-events-auto overflow-hidden">
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
            className="relative w-full h-full flex items-center justify-center"
          >
            {currentMedia.type === "VIDEO" ? (
              <LightboxVideo media={currentMedia} />
            ) : (
              <LightboxImage media={currentMedia} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {count > 1 && (
        <div className="absolute inset-x-0 hidden sm:flex justify-between px-10 pointer-events-none">
          <NavButton
            onClick={onPrev}
            icon={<ChevronLeft size={28} strokeWidth={2.5} />}
          />
          <NavButton
            onClick={onNext}
            icon={<ChevronRight size={28} strokeWidth={2.5} />}
          />
        </div>
      )}
    </div>
  );
});
