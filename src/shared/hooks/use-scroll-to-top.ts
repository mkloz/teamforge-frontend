import { type RefObject, useEffect } from "react";

import { scrollToPageTop } from "@/shared/lib/browser-scroll";

/**
 * A hook that scrolls a container (or the window) to the top.
 *
 * @param deps - Dependency array. Scroll will trigger whenever any value in this array changes.
 * @param ref - Optional ref to a scrollable HTML element. If not provided, scrolls the window.
 * @param behavior - Scroll behavior (default: "smooth")
 */
export function useScrollToTop(
  deps: unknown[] = [],
  ref?: RefObject<HTMLElement | null>,
  behavior: ScrollBehavior = "smooth",
) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps is the explicit trigger list for this custom hook.
  useEffect(() => {
    if (ref?.current) {
      ref.current.scrollTo({ top: 0, behavior });
    } else {
      scrollToPageTop(behavior);
    }
  }, [...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
