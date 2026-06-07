import { useEffect } from "react";

const LANDING_SCROLL_SNAP_CLASS = "landing-scroll-snap";

export function useLandingScrollSnap() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const root = document.documentElement;
    root.classList.add(LANDING_SCROLL_SNAP_CLASS);

    return () => {
      root.classList.remove(LANDING_SCROLL_SNAP_CLASS);
    };
  }, []);
}
