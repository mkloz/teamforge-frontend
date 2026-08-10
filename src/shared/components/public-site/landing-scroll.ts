import {
  LANDING_SECTION_IDS,
  type LandingSectionId,
} from "@/shared/components/public-site/landing-sections";
import {
  getBrowserDocumentElement,
  getBrowserScrollY,
  getBrowserWindow,
  scrollBrowserTo,
} from "@/shared/lib/browser-environment";
import {
  cancelDelay,
  type ScheduledDelayHandle,
  scheduleDelay,
} from "@/shared/lib/browser-scheduling";
import {
  getElementById,
  type ProgrammaticScrollIntent,
  resolveProgrammaticScrollBehavior,
  scrollToPageTop,
} from "@/shared/lib/browser-scroll";

export const LANDING_BELOW_FOLD_REQUEST_EVENT =
  "findafew:landing-below-fold-request";

export interface LandingBelowFoldRequestDetail {
  options: LandingScrollOptions;
  targetId: LandingSectionId;
}

export type LandingScrollOptions = Omit<ScrollIntoViewOptions, "behavior"> & {
  intent?: ProgrammaticScrollIntent;
};

declare global {
  interface WindowEventMap {
    "findafew:landing-below-fold-request": CustomEvent<LandingBelowFoldRequestDetail>;
  }
}

const DEFAULT_SCROLL_OPTIONS = {
  block: "start",
  intent: "locate",
} as const satisfies LandingScrollOptions;

const LANDING_PROGRAMMATIC_SCROLL_CLASS = "landing-programmatic-scroll";
const LANDING_SCROLL_OFFSET_PX = 64;
const PROGRAMMATIC_SCROLL_SNAP_RESTORE_MS = 1200;

let restoreScrollSnapTimeout: ScheduledDelayHandle | null = null;

function disableScrollSnapForProgrammaticScroll(behavior: ScrollBehavior) {
  const root = getBrowserDocumentElement();

  if (!root) {
    return;
  }

  root.classList.add(LANDING_PROGRAMMATIC_SCROLL_CLASS);

  if (restoreScrollSnapTimeout) {
    cancelDelay(restoreScrollSnapTimeout);
  }

  restoreScrollSnapTimeout = scheduleDelay(
    () => {
      root.classList.remove(LANDING_PROGRAMMATIC_SCROLL_CLASS);
      restoreScrollSnapTimeout = null;
    },
    behavior === "smooth" ? PROGRAMMATIC_SCROLL_SNAP_RESTORE_MS : 120,
  );
}

export function scrollLandingElementToStart(
  element: HTMLElement,
  options: LandingScrollOptions,
) {
  const behavior = resolveProgrammaticScrollBehavior(
    options.intent ?? DEFAULT_SCROLL_OPTIONS.intent,
  );
  const top =
    element.id === "hero"
      ? 0
      : element.getBoundingClientRect().top +
        getBrowserScrollY() -
        LANDING_SCROLL_OFFSET_PX;

  disableScrollSnapForProgrammaticScroll(behavior);

  scrollBrowserTo({
    behavior,
    top: Math.max(0, top),
  });
}

export function scrollToLandingSection(
  id: LandingSectionId,
  options: LandingScrollOptions = DEFAULT_SCROLL_OPTIONS,
) {
  const element = getElementById(id);

  if (element) {
    scrollLandingElementToStart(element, options);
    return;
  }

  const browserWindow = getBrowserWindow();

  if (!browserWindow) {
    return;
  }

  browserWindow.dispatchEvent(
    new browserWindow.CustomEvent<LandingBelowFoldRequestDetail>(
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
  intent: ProgrammaticScrollIntent = DEFAULT_SCROLL_OPTIONS.intent,
) {
  const hero = getElementById(LANDING_SECTION_IDS.hero);

  if (hero) {
    scrollLandingElementToStart(hero, {
      block: DEFAULT_SCROLL_OPTIONS.block,
      intent,
    });
    return;
  }

  scrollToPageTop(intent);
}
