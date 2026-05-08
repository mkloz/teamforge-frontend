import { type RefObject, useEffect, useEffectEvent, useState } from "react";

import {
  cancelScheduledAnimationFrame,
  scheduleAnimationFrame,
} from "@/shared/lib/browser-scheduling";

interface MessageContainerSize {
  height: number;
  width: number;
}

export function useMessageContainerSize(
  containerRef?: RefObject<HTMLDivElement | null>,
) {
  const [containerSize, setContainerSize] = useState<MessageContainerSize>({
    height: 0,
    width: 0,
  });

  const updateContainerSize = useEffectEvent(
    ({ height, width }: MessageContainerSize) => {
      setContainerSize((current) =>
        current.height === height && current.width === width
          ? current
          : { height, width },
      );
    },
  );

  useEffect(() => {
    const containerElement = containerRef?.current;

    if (!containerElement || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      updateContainerSize({
        height: entry.contentRect.height,
        width: entry.contentRect.width,
      });
    });

    observer.observe(containerElement);
    const frame = scheduleAnimationFrame(() => {
      updateContainerSize({
        height: containerElement.clientHeight,
        width: containerElement.clientWidth,
      });
    });

    return () => {
      cancelScheduledAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef]);

  return containerSize;
}
