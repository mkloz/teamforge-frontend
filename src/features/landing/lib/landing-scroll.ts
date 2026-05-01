import type { LandingSectionId } from "@/features/landing/constants/landing-sections";

const DEFAULT_SCROLL_OPTIONS = {
  behavior: "smooth",
  block: "start",
} as const satisfies ScrollIntoViewOptions;

export function scrollToLandingSection(
  id: LandingSectionId,
  options: ScrollIntoViewOptions = DEFAULT_SCROLL_OPTIONS,
) {
  document.getElementById(id)?.scrollIntoView(options);
}

export function scrollToLandingTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
