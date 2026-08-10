import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";

import { LightboxStage } from "./lightbox-stage";
import { ThumbnailStrip } from "./thumbnail-strip";
import type { LightboxNavigationDirection } from "./use-lightbox-navigation";

interface LightboxContentProps {
  attachments: UnifiedAttachment[];
  currentIndex: number | null;
  currentMedia: UnifiedAttachment | null;
  direction: LightboxNavigationDirection;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (index: number) => void;
}

export function LightboxContent({
  attachments,
  currentIndex,
  currentMedia,
  direction,
  isNextDisabled,
  isPreviousDisabled,
  onNext,
  onPrevious,
  onSelect,
}: LightboxContentProps) {
  return (
    <>
      <LightboxStage
        count={attachments.length}
        currentMedia={currentMedia}
        direction={direction}
        isNextDisabled={isNextDisabled}
        isPreviousDisabled={isPreviousDisabled}
        onNext={onNext}
        onPrevious={onPrevious}
      />

      {attachments.length > 1 ? (
        <ThumbnailStrip
          attachments={attachments}
          selectedIndex={currentIndex}
          onSelect={onSelect}
        />
      ) : null}
    </>
  );
}
