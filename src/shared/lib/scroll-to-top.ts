import {
  getBrowserMediaQuery,
  hasBrowserWindow,
  scrollBrowserTo,
} from "@/shared/lib/browser-environment";

export function scrollWindowToTop() {
  if (!hasBrowserWindow()) {
    return;
  }

  scrollBrowserTo({ top: 0, behavior: getScrollBehavior() });
}

export function scrollElementToTop(element: HTMLElement | null) {
  if (!element || !hasBrowserWindow()) {
    return;
  }

  element.scrollTo({ top: 0, behavior: getScrollBehavior() });
}

function getScrollBehavior(): ScrollBehavior {
  return getBrowserMediaQuery("(prefers-reduced-motion: reduce)")?.matches
    ? "auto"
    : "smooth";
}
