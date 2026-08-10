import { type RefObject, useEffect } from "react";

import {
  type ProgrammaticScrollIntent,
  scrollElementTo,
  scrollToPageTop,
} from "@/shared/lib/browser-scroll";

/**
 * A hook that scrolls a container (or the window) to the top.
 *
 * @param deps - Dependency array. Scroll will trigger whenever any value in this array changes.
 * @param ref - Optional ref to a scrollable HTML element. If not provided, scrolls the window.
 * @param intent - Why the scroll occurs. Resets are immediate by default.
 */
export function useScrollToTop(
  deps: unknown[] = [],
  ref?: RefObject<HTMLElement | null>,
  intent: ProgrammaticScrollIntent = "reset",
) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps is the explicit trigger list for this custom hook.
  useEffect(() => {
    if (ref?.current) {
      scrollElementTo(ref.current, { intent, top: 0 });
    } else {
      scrollToPageTop(intent);
    }
  }, [...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
