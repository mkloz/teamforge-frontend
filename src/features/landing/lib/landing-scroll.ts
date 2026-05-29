import type { LandingSectionId } from "@/features/landing/constants/landing-sections";
import {
  getElementById,
  scrollElementIntoViewById,
  scrollToPageTop,
} from "@/shared/lib/browser-scroll";

export const LANDING_BELOW_FOLD_REQUEST_EVENT =
  "teamforge:landing-below-fold-request";

export interface LandingBelowFoldRequestDetail {
  options: ScrollIntoViewOptions;
  targetId: LandingSectionId;
}

declare global {
  interface WindowEventMap {
    "teamforge:landing-below-fold-request": CustomEvent<LandingBelowFoldRequestDetail>;
  }
}

const DEFAULT_SCROLL_OPTIONS = {
  behavior: "smooth",
  block: "start",
} as const satisfies ScrollIntoViewOptions;

export function scrollToLandingSection(
  id: LandingSectionId,
  options: ScrollIntoViewOptions = DEFAULT_SCROLL_OPTIONS,
) {
  if (getElementById(id)) {
    scrollElementIntoViewById(id, options);
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<LandingBelowFoldRequestDetail>(
      LANDING_BELOW_FOLD_REQUEST_EVENT,
      {
        detail: {
          options,
          targetId: id,
        },
      },
    ),
  );
}

export function scrollToLandingTop() {
  scrollToPageTop();
}
