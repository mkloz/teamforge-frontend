import {
  hasBrowserDocument,
  hasBrowserWindow,
} from "@/shared/lib/browser-environment";

const DEFAULT_SCROLL_BEHAVIOR: ScrollBehavior = "smooth";

export function scrollToPageTop(
  behavior: ScrollBehavior = DEFAULT_SCROLL_BEHAVIOR,
) {
  if (!hasBrowserWindow()) {
    return;
  }

  window.scrollTo({ top: 0, behavior });
}

export function scrollElementIntoViewById(
  id: string,
  options: ScrollIntoViewOptions,
) {
  if (!hasBrowserDocument()) {
    return;
  }

  document.getElementById(id)?.scrollIntoView(options);
}

export function getElementById(id: string) {
  if (!hasBrowserDocument()) {
    return null;
  }

  return document.getElementById(id);
}

export function scrollToElementProgress(
  element: HTMLElement,
  progress: number,
  behavior: ScrollBehavior = DEFAULT_SCROLL_BEHAVIOR,
) {
  if (!hasBrowserWindow()) {
    return;
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const scrollableHeight = Math.max(
    element.offsetHeight - window.innerHeight,
    0,
  );

  window.scrollTo({
    top: element.offsetTop + clampedProgress * scrollableHeight,
    behavior,
  });
}
