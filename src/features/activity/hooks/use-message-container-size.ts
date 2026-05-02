import { useEffect, useEffectEvent, useState, type RefObject } from "react";

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

    if (!containerElement) {
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
    const frame = window.requestAnimationFrame(() => {
      updateContainerSize({
        height: containerElement.clientHeight,
        width: containerElement.clientWidth,
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef]);

  return containerSize;
}
