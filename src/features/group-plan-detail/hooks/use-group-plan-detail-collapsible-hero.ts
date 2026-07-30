import { type RefObject, useCallback } from "react";
import { useCollapsibleScrollState } from "@/shared/hooks/use-collapsible-scroll-state";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";
import {
  type CssPropertyPair,
  getBooleanCssValue,
  getCollapsedCssValue,
  getCssCollapseRange,
  getMotionSafeActiveCssValue,
  getMotionSafeCollapsedCssValue,
  getMotionSafeRevealDelay,
  getPrefersReducedMotion,
  setCssPropertyPairs,
} from "@/shared/lib/collapsible-motion";

interface UseGroupPlanDetailCollapsibleHeroOptions<
  TElement extends HTMLElement,
> {
  ref: RefObject<TElement | null>;
}

const DEFAULT_COVER_EXPANDED_HEIGHT = 280;
const DEFAULT_COVER_COLLAPSED_HEIGHT = 72;
const GROUP_DETAIL_COLLAPSE_TRIGGER = 48;
const GROUP_DETAIL_EXPAND_TRIGGER = 8;
const COMPACT_REVEAL_DELAY_MS = 180;

interface HeroState {
  collapsed: boolean;
  compactVisible: boolean;
}

interface HeroTransitionMetrics {
  collapseRange: number;
  prefersReducedMotion: boolean;
}

export function useGroupPlanDetailCollapsibleHero<
  TElement extends HTMLElement,
>({ ref }: UseGroupPlanDetailCollapsibleHeroOptions<TElement>) {
  const applyHeroState = useCallback(
    ({ collapsed, compactVisible }: HeroState) => {
      const element = ref.current;

      if (!element || !hasBrowserWindow()) {
        return false;
      }

      setCssPropertyPairs(
        element,
        getHeroCssProperties(
          { collapsed, compactVisible },
          getHeroTransitionMetrics(element),
        ),
      );

      return true;
    },
    [ref],
  );

  const { isCompactVisible } = useCollapsibleScrollState({
    applyState: applyHeroState,
    collapseTrigger: GROUP_DETAIL_COLLAPSE_TRIGGER,
    compactRevealDelayMs: COMPACT_REVEAL_DELAY_MS,
    expandTrigger: GROUP_DETAIL_EXPAND_TRIGGER,
    listenForResize: true,
  });

  return { isCompactVisible };
}

function getHeroTransitionMetrics(element: HTMLElement): HeroTransitionMetrics {
  return {
    collapseRange: getCssCollapseRange(element, {
      collapsedFallback: DEFAULT_COVER_COLLAPSED_HEIGHT,
      collapsedProperty: "--group-detail-cover-collapsed-height",
      expandedFallback: DEFAULT_COVER_EXPANDED_HEIGHT,
      expandedProperty: "--group-detail-cover-expanded-height",
    }),
    prefersReducedMotion: getPrefersReducedMotion(),
  };
}

function getHeroCssProperties(
  state: HeroState,
  metrics: HeroTransitionMetrics,
): CssPropertyPair[] {
  return [
    ...getHeroCoverCssProperties(state.collapsed, metrics),
    ...getHeroOriginalCssProperties(state.collapsed, metrics),
    ...getHeroCompactCssProperties(state.compactVisible, metrics),
  ];
}

function getHeroCoverCssProperties(
  collapsed: boolean,
  { collapseRange, prefersReducedMotion }: HeroTransitionMetrics,
): CssPropertyPair[] {
  return [
    [
      "--group-detail-cover-shell-height",
      getCollapsedCssValue(
        collapsed,
        "0px",
        "var(--group-detail-cover-expanded-height)",
      ),
    ],
    [
      "--group-detail-cover-y",
      getCollapsedCssValue(collapsed, `${-collapseRange}px`, "0px"),
    ],
    [
      "--group-detail-cover-image-y",
      getMotionSafeCollapsedCssValue({
        collapsed,
        collapsedValue: "-12px",
        expandedValue: "0px",
        prefersReducedMotion,
      }),
    ],
    [
      "--group-detail-cover-image-scale",
      getMotionSafeCollapsedCssValue({
        collapsed,
        collapsedValue: "1.04",
        expandedValue: "1",
        prefersReducedMotion,
      }),
    ],
  ];
}

function getHeroOriginalCssProperties(
  collapsed: boolean,
  { prefersReducedMotion }: HeroTransitionMetrics,
): CssPropertyPair[] {
  return [
    [
      "--group-detail-cover-original-opacity",
      getCollapsedCssValue(collapsed, "0", "1"),
    ],
    [
      "--group-detail-cover-original-y",
      getMotionSafeCollapsedCssValue({
        collapsed,
        collapsedValue: "-28px",
        expandedValue: "0px",
        prefersReducedMotion,
      }),
    ],
    [
      "--group-detail-cover-original-delay",
      getMotionSafeRevealDelay({
        collapsed,
        expandedDelay: "140ms",
        prefersReducedMotion,
      }),
    ],
  ];
}

function getHeroCompactCssProperties(
  compactVisible: boolean,
  { prefersReducedMotion }: HeroTransitionMetrics,
): CssPropertyPair[] {
  return [
    [
      "--group-detail-compact-opacity",
      getBooleanCssValue(compactVisible, "1", "0"),
    ],
    [
      "--group-detail-compact-y",
      getMotionSafeActiveCssValue({
        active: compactVisible,
        activeValue: "0px",
        inactiveValue: "-8px",
        prefersReducedMotion,
      }),
    ],
  ];
}
