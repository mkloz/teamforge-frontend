import { useEffect, useState } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

import { getBrowserScrollY } from "@/shared/lib/browser-environment";

export function useWindowScrollThreshold(threshold = 0) {
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  const syncScrollState = useEventCallback(() => {
    setIsPastThreshold((current) => {
      const next = getBrowserScrollY() > threshold;

      return current === next ? current : next;
    });
  });

  useEffect(() => {
    syncScrollState();
  }, [syncScrollState]);

  useEventListener("scroll", syncScrollState, undefined, { passive: true });

  return isPastThreshold;
}
