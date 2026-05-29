import { hasBrowserWindow } from "@/shared/lib/browser-environment";

export function scrollWindowToTop() {
  if (!hasBrowserWindow()) {
    return;
  }

  window.scrollTo({ top: 0, behavior: getScrollBehavior() });
}

export function scrollElementToTop(element: HTMLElement | null) {
  if (!element || !hasBrowserWindow()) {
    return;
  }

  element.scrollTo({ top: 0, behavior: getScrollBehavior() });
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}
