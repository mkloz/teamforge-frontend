import { hasBrowserWindow } from "@/shared/lib/browser-environment";
import { scrollElementTo, scrollToPageTop } from "@/shared/lib/browser-scroll";

export function scrollWindowToTop() {
  if (!hasBrowserWindow()) {
    return;
  }

  scrollToPageTop("locate");
}

export function scrollElementToTop(element: HTMLElement | null) {
  if (!element || !hasBrowserWindow()) {
    return;
  }

  scrollElementTo(element, { intent: "locate", top: 0 });
}
