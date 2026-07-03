import {
  getBrowserElementById,
  scrollBrowserTo,
} from "@/shared/lib/browser-environment";

const DEFAULT_SCROLL_BEHAVIOR: ScrollBehavior = "smooth";

export function scrollToPageTop(
  behavior: ScrollBehavior = DEFAULT_SCROLL_BEHAVIOR,
) {
  scrollBrowserTo({ top: 0, behavior });
}

export function getElementById(id: string) {
  return getBrowserElementById(id);
}
