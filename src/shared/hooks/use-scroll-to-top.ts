import { useEffect, type RefObject } from "react";

/**
 * A hook that scrolls a container (or the window) to the top.
 *
 * @param deps - Dependency array. Scroll will trigger whenever any value in this array changes.
 * @param ref - Optional ref to a scrollable HTML element. If not provided, scrolls the window.
 * @param behavior - Scroll behavior (default: "smooth")
 */
export function useScrollToTop(
  deps: unknown[] = [],
  ref?: RefObject<HTMLDivElement | null>,
  behavior: ScrollBehavior = "smooth",
) {
  useEffect(() => {
    if (ref && ref.current) {
      ref.current.scrollTo({ top: 0, behavior });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  }, [...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
