import {
  LANDING_SECTION_IDS,
  type LandingSectionId,
} from "@/features/landing/constants/landing-sections";
import { getElementById, scrollToPageTop } from "@/shared/lib/browser-scroll";

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

const LANDING_PROGRAMMATIC_SCROLL_CLASS = "landing-programmatic-scroll";
const LANDING_SCROLL_OFFSET_PX = 64;
const PROGRAMMATIC_SCROLL_SNAP_RESTORE_MS = 1200;

let restoreScrollSnapTimeout = 0;

function getScrollBehavior(options: ScrollIntoViewOptions) {
  return options.behavior ?? DEFAULT_SCROLL_OPTIONS.behavior;
}

function disableScrollSnapForProgrammaticScroll(behavior: ScrollBehavior) {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.add(LANDING_PROGRAMMATIC_SCROLL_CLASS);

  if (restoreScrollSnapTimeout) {
    window.clearTimeout(restoreScrollSnapTimeout);
  }

  restoreScrollSnapTimeout = window.setTimeout(
    () => {
      root.classList.remove(LANDING_PROGRAMMATIC_SCROLL_CLASS);
      restoreScrollSnapTimeout = 0;
    },
    behavior === "smooth" ? PROGRAMMATIC_SCROLL_SNAP_RESTORE_MS : 120,
  );
}

export function scrollLandingElementToStart(
  element: HTMLElement,
  options: ScrollIntoViewOptions,
) {
  if (typeof window === "undefined") {
    return;
  }

  const behavior = getScrollBehavior(options);
  const top =
    element.id === "hero"
      ? 0
      : element.getBoundingClientRect().top +
        window.scrollY -
        LANDING_SCROLL_OFFSET_PX;

  disableScrollSnapForProgrammaticScroll(behavior);

  window.scrollTo({
    behavior,
    top: Math.max(0, top),
  });
}

export function scrollToLandingSection(
  id: LandingSectionId,
  options: ScrollIntoViewOptions = DEFAULT_SCROLL_OPTIONS,
) {
  const element = getElementById(id);

  if (element) {
    scrollLandingElementToStart(element, options);
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

export function scrollToLandingTop(
  behavior: ScrollBehavior = DEFAULT_SCROLL_OPTIONS.behavior,
) {
  const hero = getElementById(LANDING_SECTION_IDS.hero);

  if (hero) {
    scrollLandingElementToStart(hero, {
      behavior,
      block: DEFAULT_SCROLL_OPTIONS.block,
    });
    return;
  }

  scrollToPageTop(behavior);
}
