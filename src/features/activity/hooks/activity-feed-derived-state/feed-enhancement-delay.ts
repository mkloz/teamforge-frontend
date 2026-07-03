import { useEffect } from "react";

const FEED_ENHANCEMENT_DELAY_MS = 2500;

export function useFeedEnhancementDelay(
  hasLoadedBaseData: boolean,
  setShouldLoadFeedEnhancements: (shouldLoad: boolean) => void,
) {
  useEffect(() => {
    let timeoutId: number | undefined;

    if (!hasLoadedBaseData) {
      setShouldLoadFeedEnhancements(false);
    } else {
      timeoutId = window.setTimeout(() => {
        setShouldLoadFeedEnhancements(true);
      }, FEED_ENHANCEMENT_DELAY_MS);
    }

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [hasLoadedBaseData, setShouldLoadFeedEnhancements]);
}
