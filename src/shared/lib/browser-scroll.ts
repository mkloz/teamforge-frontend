import {
  getBrowserElementById,
  scrollBrowserTo,
} from "@/shared/lib/browser-environment";
import { getPrefersReducedMotion } from "@/shared/lib/reduced-motion";

export type ProgrammaticScrollIntent =
  | "follow"
  | "locate"
  | "reset"
  | "restore"
  | "reveal";

type ProgrammaticScrollOptions = {
  intent?: ProgrammaticScrollIntent;
};

export type ProgrammaticScrollIntoViewOptions = Omit<
  ScrollIntoViewOptions,
  "behavior"
> &
  ProgrammaticScrollOptions;

export type ProgrammaticScrollToOptions = Omit<ScrollToOptions, "behavior"> &
  ProgrammaticScrollOptions;

export function resolveProgrammaticScrollBehavior(
  intent: ProgrammaticScrollIntent = "reset",
): ScrollBehavior {
  if (intent !== "locate" && intent !== "follow") {
    return "instant";
  }

  return getPrefersReducedMotion() ? "instant" : "smooth";
}

export function scrollElementIntoView(
  element: Element | null,
  { intent = "reset", ...options }: ProgrammaticScrollIntoViewOptions = {},
) {
  element?.scrollIntoView({
    ...options,
    behavior: resolveProgrammaticScrollBehavior(intent),
  });
}

export function scrollElementBy(
  element: Element | null,
  { intent = "reset", ...options }: ProgrammaticScrollToOptions,
) {
  element?.scrollBy({
    ...options,
    behavior: resolveProgrammaticScrollBehavior(intent),
  });
}

export function scrollElementTo(
  element: Element | null,
  { intent = "reset", ...options }: ProgrammaticScrollToOptions,
) {
  element?.scrollTo({
    ...options,
    behavior: resolveProgrammaticScrollBehavior(intent),
  });
}

export function scrollToPageTop(intent: ProgrammaticScrollIntent = "reset") {
  scrollBrowserTo({
    top: 0,
    behavior: resolveProgrammaticScrollBehavior(intent),
  });
}

export function getElementById(id: string) {
  return getBrowserElementById(id);
}
