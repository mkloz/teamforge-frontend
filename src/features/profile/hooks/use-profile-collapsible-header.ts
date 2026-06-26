import { type RefObject, useCallback } from "react";
import {
  type CollapsibleRenderState,
  useCollapsibleScrollState,
} from "@/shared/hooks/use-collapsible-scroll-state";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";
import {
  type CssPropertyPair,
  getCollapsedCssValue,
  getCssCollapseRange,
  getMotionSafeCollapsedCssValue,
  getMotionSafeRevealDelay,
  getPrefersReducedMotion,
  setCssPropertyPairs,
} from "@/shared/lib/collapsible-motion";

interface UseProfileCollapsibleHeaderOptions<TElement extends HTMLElement> {
  ref: RefObject<TElement | null>;
}

const DEFAULT_COVER_EXPANDED_HEIGHT = 160;
const DEFAULT_COVER_COLLAPSED_HEIGHT = 80;
const PROFILE_COLLAPSE_TRIGGER = 36;
const PROFILE_EXPAND_TRIGGER = 8;
const PROFILE_COMPACT_REVEAL_DELAY_MS = 280;

interface ProfileHeaderStyleState {
  coverPhaseOffset: string;
  coverScale: string;
  coverY: string;
  heroOriginalDelay: string;
  heroOriginalOpacity: string;
  heroOriginalY: string;
  heroZIndex: string;
  typeOpacity: string;
  typeScale: string;
  typeY: string;
}

export function useProfileCollapsibleHeader<TElement extends HTMLElement>({
  ref,
}: UseProfileCollapsibleHeaderOptions<TElement>) {
  const applyHeaderState = useCallback(
    ({ collapsed }: CollapsibleRenderState) => {
      const element = ref.current;

      if (!element || !hasBrowserWindow()) {
        return false;
      }

      const collapseRange = getCoverCollapseRange(element);
      const styleState = getProfileHeaderStyleState({
        collapsed,
        collapseRange,
        prefersReducedMotion: getPrefersReducedMotion(),
      });

      applyProfileHeaderStyleState(element, styleState);

      return true;
    },
    [ref],
  );

  const getHeaderScrollTarget = useCallback(
    () => getScrollTarget(ref.current),
    [ref],
  );
  const getHeaderScrollPosition = useCallback(
    () => getScrollTop(getHeaderScrollTarget()),
    [getHeaderScrollTarget],
  );
  const { isCompactVisible: isPinned } = useCollapsibleScrollState({
    applyState: applyHeaderState,
    collapseTrigger: PROFILE_COLLAPSE_TRIGGER,
    compactRevealDelayMs: PROFILE_COMPACT_REVEAL_DELAY_MS,
    expandTrigger: PROFILE_EXPAND_TRIGGER,
    getScrollPosition: getHeaderScrollPosition,
    getScrollTarget: getHeaderScrollTarget,
    listenForResize: true,
  });

  return { isPinned };
}

function getCoverCollapseRange(element: HTMLElement) {
  return getCssCollapseRange(element, {
    collapsedFallback: DEFAULT_COVER_COLLAPSED_HEIGHT,
    collapsedProperty: "--profile-cover-collapsed-height",
    expandedFallback: DEFAULT_COVER_EXPANDED_HEIGHT,
    expandedProperty: "--profile-cover-expanded-height",
  });
}

function getProfileHeaderStyleState({
  collapsed,
  collapseRange,
  prefersReducedMotion,
}: {
  collapsed: boolean;
  collapseRange: number;
  prefersReducedMotion: boolean;
}): ProfileHeaderStyleState {
  return {
    coverPhaseOffset: "0px",
    coverScale: "1",
    coverY: getCollapsedCssValue(collapsed, `${-collapseRange}px`, "0px"),
    heroOriginalDelay: getMotionSafeRevealDelay({
      collapsed,
      expandedDelay: "140ms",
      prefersReducedMotion,
    }),
    heroOriginalOpacity: getCollapsedCssValue(collapsed, "0", "1"),
    heroOriginalY: getMotionSafeCollapsedCssValue({
      collapsed,
      collapsedValue: "-48px",
      expandedValue: "0px",
      prefersReducedMotion,
    }),
    heroZIndex: getCollapsedCssValue(collapsed, "10", "40"),
    typeOpacity: getCollapsedCssValue(collapsed, "0.22", "0.82"),
    typeScale: getCollapsedCssValue(collapsed, "0.48", "1"),
    typeY: getCollapsedCssValue(collapsed, `${-collapseRange / 2}px`, "0px"),
  };
}

function applyProfileHeaderStyleState(
  element: HTMLElement,
  styleState: ProfileHeaderStyleState,
) {
  setCssPropertyPairs(element, getProfileHeaderStyleProperties(styleState));
}

function getProfileHeaderStyleProperties(
  styleState: ProfileHeaderStyleState,
): CssPropertyPair[] {
  return [
    ["--profile-cover-y", styleState.coverY],
    ["--profile-cover-scale", styleState.coverScale],
    ["--personality-cover-type-scale", styleState.typeScale],
    ["--personality-cover-type-y", styleState.typeY],
    ["--personality-cover-type-opacity", styleState.typeOpacity],
    ["--profile-cover-phase-offset", styleState.coverPhaseOffset],
    ["--profile-hero-z-index", styleState.heroZIndex],
    ["--profile-hero-original-opacity", styleState.heroOriginalOpacity],
    ["--profile-hero-original-y", styleState.heroOriginalY],
    ["--profile-hero-original-delay", styleState.heroOriginalDelay],
  ];
}

function getScrollTarget(element: HTMLElement | null) {
  if (!element) {
    return window;
  }

  const scrollContainer = getScrollContainer(element);

  if (!scrollContainer || isViewportElement(scrollContainer)) {
    return window;
  }

  return scrollContainer;
}

function getScrollTop(scrollTarget: HTMLElement | Window) {
  return scrollTarget instanceof Window
    ? window.scrollY
    : scrollTarget.scrollTop;
}

function getScrollContainer(element: HTMLElement) {
  if (isElementScrollContainer(element)) {
    return element;
  }

  return getScrollableAncestor(element.parentElement);
}

function getScrollableAncestor(element: HTMLElement | null) {
  let currentElement = element;

  while (currentElement) {
    if (isElementScrollContainer(currentElement)) {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return null;
}

function isElementScrollContainer(element: HTMLElement) {
  return !isViewportElement(element) && isScrollable(element);
}

function isScrollable(element: HTMLElement) {
  const overflowY = window.getComputedStyle(element).overflowY;
  const canScroll = /(auto|scroll|overlay)/.test(overflowY);

  return canScroll && element.scrollHeight > element.clientHeight;
}

function isViewportElement(element: HTMLElement) {
  const { body, documentElement } = element.ownerDocument;

  return element === body || element === documentElement;
}
