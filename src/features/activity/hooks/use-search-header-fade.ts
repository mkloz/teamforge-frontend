import { useCallback, useRef, useState } from "react";

interface UseSearchHeaderFadeOptions {
  headerHeight: number;
  fadeThreshold?: number;
}

export function useSearchHeaderFade({
  headerHeight,
  fadeThreshold = 0.6,
}: UseSearchHeaderFadeOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(1);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const fadeRange = headerHeight * fadeThreshold;
    const newOpacity = Math.max(0, 1 - scrollTop / fadeRange);

    // Low-pass filter or threshold to prevent unnecessary state updates
    if (
      Math.abs(opacity - newOpacity) > 0.01 ||
      newOpacity === 0 ||
      newOpacity === 1
    ) {
      setOpacity(newOpacity);
    }
  }, [headerHeight, fadeThreshold, opacity]);

  return {
    scrollRef,
    opacity,
    handleScroll,
    isPointerEnabled: opacity > 0.05,
  };
}
