import { domAnimation, LazyMotion, m } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGifVideoAttachment } from "@/features/activity/lib/gif-attachments";
import { usePrefersReducedMotion } from "@/shared/hooks/use-prefers-reduced-motion";

import { LightboxImage, LightboxVideo } from "./lightbox-media";
import { NavButton } from "./nav-button";
import type { LightboxNavigationDirection } from "./use-lightbox-navigation";

interface LightboxStageProps {
  count: number;
  currentMedia: UnifiedAttachment | null;
  direction: LightboxNavigationDirection;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function LightboxStage({
  count,
  currentMedia,
  direction,
  isNextDisabled,
  isPreviousDisabled,
  onNext,
  onPrevious,
}: LightboxStageProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="pointer-events-auto relative flex flex-1 items-center justify-center overflow-hidden px-12 pt-[calc(env(safe-area-inset-top)+5rem)] pb-[max(env(safe-area-inset-bottom),6rem)] sm:px-18 sm:pb-24">
      <LazyMotion features={domAnimation}>
        {currentMedia ? (
          <m.div
            key={currentMedia.id}
            data-lightbox-current-media
            initial={{
              opacity: 0,
              x: prefersReducedMotion ? 0 : direction * 12,
            }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.16,
              ease: [0.2, 0, 0, 1],
            }}
            className="relative flex size-full items-center justify-center"
          >
            <LightboxMedia media={currentMedia} />
          </m.div>
        ) : null}
      </LazyMotion>

      <LightboxStageNavigation
        count={count}
        isNextDisabled={isNextDisabled}
        isPreviousDisabled={isPreviousDisabled}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </div>
  );
}

function LightboxMedia({ media }: { media: UnifiedAttachment }) {
  return shouldRenderLightboxVideo(media) ? (
    <LightboxVideo media={media} />
  ) : (
    <LightboxImage media={media} />
  );
}

function LightboxStageNavigation({
  count,
  isNextDisabled,
  isPreviousDisabled,
  onNext,
  onPrevious,
}: {
  count: number;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  onNext: () => void;
  onPrevious: () => void;
}) {
  if (count <= 1) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-y-0 right-[max(env(safe-area-inset-right),0.5rem)] left-[max(env(safe-area-inset-left),0.5rem)] flex items-center justify-between sm:right-[max(env(safe-area-inset-right),1rem)] sm:left-[max(env(safe-area-inset-left),1rem)] lg:right-[max(env(safe-area-inset-right),2rem)] lg:left-[max(env(safe-area-inset-left),2rem)]">
      <NavButton
        disabled={isPreviousDisabled}
        onClick={onPrevious}
        label="Previous media"
        icon={<ChevronLeft className="size-5" strokeWidth={2.5} />}
      />
      <NavButton
        disabled={isNextDisabled}
        onClick={onNext}
        label="Next media"
        icon={<ChevronRight className="size-5" strokeWidth={2.5} />}
      />
    </div>
  );
}

function shouldRenderLightboxVideo(media: UnifiedAttachment) {
  return media.type === "VIDEO" || isGifVideoAttachment(media);
}
