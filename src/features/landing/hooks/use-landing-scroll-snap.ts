import { useEffect } from "react";

import { getBrowserDocumentElement } from "@/shared/lib/browser-environment";

const LANDING_SCROLL_SNAP_CLASS = "landing-scroll-snap";

export function useLandingScrollSnap() {
  useEffect(() => {
    const root = getBrowserDocumentElement();

    if (!root) {
      return undefined;
    }

    root.classList.add(LANDING_SCROLL_SNAP_CLASS);

    return () => {
      root.classList.remove(LANDING_SCROLL_SNAP_CLASS);
    };
  }, []);
}
