import { useEffect, useRef, useState } from "react";

import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";

interface UseDeferredRenderOptions {
  delayMs?: number;
  initialShouldRender?: boolean;
  rootMargin?: string;
}

export function useDeferredRender({
  delayMs,
  initialShouldRender = false,
  rootMargin = "0px",
}: UseDeferredRenderOptions = {}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(initialShouldRender);

  useEffect(() => {
    if (shouldRender || delayMs === undefined) {
      return undefined;
    }

    const timeoutId = scheduleDelay(() => {
      setShouldRender(true);
    }, delayMs);

    return () => cancelDelay(timeoutId);
  }, [delayMs, shouldRender]);

  useEffect(() => {
    if (shouldRender) {
      return undefined;
    }

    const sentinel = sentinelRef.current;

    if (!sentinel || typeof IntersectionObserver !== "function") {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, shouldRender]);

  return { sentinelRef, setShouldRender, shouldRender };
}
