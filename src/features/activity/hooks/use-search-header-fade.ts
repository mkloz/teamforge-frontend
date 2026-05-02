import { useRef, useState } from "react";

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

  function handleScroll() {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const fadeRange = headerHeight * fadeThreshold;
    const newOpacity = Math.max(0, 1 - scrollTop / fadeRange);

    setOpacity((currentOpacity) => {
      if (
        Math.abs(currentOpacity - newOpacity) > 0.01 ||
        newOpacity === 0 ||
        newOpacity === 1
      ) {
        return newOpacity;
      }

      return currentOpacity;
    });
  }

  return {
    scrollRef,
    opacity,
    handleScroll,
    isPointerEnabled: opacity > 0.05,
  };
}
