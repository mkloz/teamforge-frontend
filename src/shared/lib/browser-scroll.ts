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

export function getElementById(id: string) {
  if (!hasBrowserDocument()) {
    return null;
  }

  return document.getElementById(id);
}
