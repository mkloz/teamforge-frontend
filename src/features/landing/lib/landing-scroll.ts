import type { LandingSectionId } from "@/features/landing/constants/landing-sections";
import {
  scrollElementIntoViewById,
  scrollToPageTop,
} from "@/shared/lib/browser-scroll";

const DEFAULT_SCROLL_OPTIONS = {
  behavior: "smooth",
  block: "start",
} as const satisfies ScrollIntoViewOptions;

export function scrollToLandingSection(
  id: LandingSectionId,
  options: ScrollIntoViewOptions = DEFAULT_SCROLL_OPTIONS,
) {
  scrollElementIntoViewById(id, options);
}

export function scrollToLandingTop() {
  scrollToPageTop();
}
