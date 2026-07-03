import { useEffect } from "react";

import {
  cancelDelay,
  type ScheduledDelayHandle,
  scheduleDelay,
} from "@/shared/lib/browser-scheduling";

const FEED_ENHANCEMENT_DELAY_MS = 2500;

export function useFeedEnhancementDelay(
  hasLoadedBaseData: boolean,
  setShouldLoadFeedEnhancements: (shouldLoad: boolean) => void,
) {
  useEffect(() => {
    let timeoutId: ScheduledDelayHandle | undefined;

    if (!hasLoadedBaseData) {
      setShouldLoadFeedEnhancements(false);
    } else {
      timeoutId = scheduleDelay(() => {
        setShouldLoadFeedEnhancements(true);
      }, FEED_ENHANCEMENT_DELAY_MS);
    }

    return () => {
      if (timeoutId !== undefined) {
        cancelDelay(timeoutId);
      }
    };
  }, [hasLoadedBaseData, setShouldLoadFeedEnhancements]);
}
