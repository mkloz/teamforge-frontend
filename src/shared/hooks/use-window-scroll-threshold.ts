import { useEffect, useState } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

export function useWindowScrollThreshold(threshold = 0) {
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  const syncScrollState = useEventCallback(() => {
    setIsPastThreshold((current) => {
      const next = window.scrollY > threshold;

      return current === next ? current : next;
    });
  });

  useEffect(() => {
    syncScrollState();
  }, [syncScrollState]);

  useEventListener("scroll", syncScrollState, undefined, { passive: true });

  return isPastThreshold;
}
