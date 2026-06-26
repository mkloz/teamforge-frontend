import { type RefObject, useCallback } from "react";
import { useCollapsibleScrollState } from "@/shared/hooks/use-collapsible-scroll-state";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";
import {
  type CssPropertyPair,
  getBooleanCssValue,
  getCollapsedCssValue,
  getMotionSafeActiveCssValue,
  getMotionSafeCollapsedCssValue,
  getMotionSafeRevealDelay,
  getPrefersReducedMotion,
  setCssPropertyPairs,
} from "@/shared/lib/collapsible-motion";

interface UseHomeCollapsibleHeroOptions<TElement extends HTMLElement> {
  ref: RefObject<TElement | null>;
}

const HOME_COLLAPSE_TRIGGER = 72;
const HOME_EXPAND_TRIGGER = 12;
const COMPACT_REVEAL_DELAY_MS = 180;

interface HomeHeroStyleState {
  compactOpacity: string;
  compactY: string;
  originalDelay: string;
  originalOpacity: string;
  originalY: string;
}

export function useHomeCollapsibleHero<TElement extends HTMLElement>({
  ref,
}: UseHomeCollapsibleHeroOptions<TElement>) {
  const applyHeroState = useCallback(
    ({
      collapsed,
      compactVisible,
    }: {
      collapsed: boolean;
      compactVisible: boolean;
    }) => {
      const element = ref.current;

      if (!element || !hasBrowserWindow()) {
        return false;
      }

      applyHomeHeroStyleState(
        element,
        getHomeHeroStyleState({
          collapsed,
          compactVisible,
          prefersReducedMotion: getPrefersReducedMotion(),
        }),
      );

      return true;
    },
    [ref],
  );

  const { isCompactVisible } = useCollapsibleScrollState({
    applyState: applyHeroState,
    collapseTrigger: HOME_COLLAPSE_TRIGGER,
    compactRevealDelayMs: COMPACT_REVEAL_DELAY_MS,
    expandTrigger: HOME_EXPAND_TRIGGER,
    listenForResize: true,
  });

  return { isCompactVisible };
}

function getHomeHeroStyleState({
  collapsed,
  compactVisible,
  prefersReducedMotion,
}: {
  collapsed: boolean;
  compactVisible: boolean;
  prefersReducedMotion: boolean;
}): HomeHeroStyleState {
  return {
    compactOpacity: getBooleanCssValue(compactVisible, "1", "0"),
    compactY: getMotionSafeActiveCssValue({
      active: compactVisible,
      activeValue: "0px",
      inactiveValue: "-10px",
      prefersReducedMotion,
    }),
    originalDelay: getMotionSafeRevealDelay({
      collapsed,
      expandedDelay: "100ms",
      prefersReducedMotion,
    }),
    originalOpacity: getCollapsedCssValue(collapsed, "0", "1"),
    originalY: getMotionSafeCollapsedCssValue({
      collapsed,
      collapsedValue: "-16px",
      expandedValue: "0px",
      prefersReducedMotion,
    }),
  };
}

function applyHomeHeroStyleState(
  element: HTMLElement,
  styleState: HomeHeroStyleState,
) {
  setCssPropertyPairs(element, getHomeHeroStyleProperties(styleState));
}

function getHomeHeroStyleProperties(
  styleState: HomeHeroStyleState,
): CssPropertyPair[] {
  return [
    ["--home-hero-original-opacity", styleState.originalOpacity],
    ["--home-hero-original-y", styleState.originalY],
    ["--home-hero-original-delay", styleState.originalDelay],
    ["--home-compact-opacity", styleState.compactOpacity],
    ["--home-compact-y", styleState.compactY],
  ];
}
