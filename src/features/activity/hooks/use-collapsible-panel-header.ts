import { type RefObject, useCallback } from "react";
import {
  type CollapsibleRenderState,
  useCollapsibleScrollState,
} from "@/shared/hooks/use-collapsible-scroll-state";
import {
  getBooleanCssValue,
  getCollapsedCssValue,
  getMotionSafeActiveCssValue,
  getMotionSafeCollapsedCssValue,
  getMotionSafeRevealDelay,
  getPrefersReducedMotion,
} from "@/shared/lib/collapsible-motion";

interface UseCollapsiblePanelHeaderOptions<TElement extends HTMLElement> {
  collapsedHeight: number;
  collapseTrigger?: number;
  enabled?: boolean;
  expandTrigger?: number;
  expandedHeight: number;
  ref: RefObject<TElement | null>;
}

const DEFAULT_COLLAPSE_TRIGGER = 32;
const DEFAULT_EXPAND_TRIGGER = 8;
const COMPACT_REVEAL_DELAY_MS = 280;

type HeaderStyleInput = CollapsibleRenderState & {
  collapsedHeight: number;
  expandedHeight: number;
  prefersReducedMotion: boolean;
};

function getCompactHeaderStyleVariables({
  compactVisible,
  prefersReducedMotion,
}: Pick<HeaderStyleInput, "compactVisible" | "prefersReducedMotion">) {
  return {
    "--collapsible-panel-compact-opacity": getBooleanCssValue(
      compactVisible,
      "1",
      "0",
    ),
    "--collapsible-panel-compact-scrim-opacity": getBooleanCssValue(
      compactVisible,
      "0.86",
      "0",
    ),
    "--collapsible-panel-title-y": getMotionSafeActiveCssValue({
      active: compactVisible,
      activeValue: "0px",
      inactiveValue: "-8px",
      prefersReducedMotion,
    }),
  };
}

function getCoverStyleVariables({
  collapsed,
  collapsedHeight,
  expandedHeight,
}: Pick<HeaderStyleInput, "collapsed" | "collapsedHeight" | "expandedHeight">) {
  const collapseRange = Math.max(expandedHeight - collapsedHeight, 1);

  return {
    "--collapsible-panel-cover-y": getCollapsedCssValue(
      collapsed,
      `${-collapseRange}px`,
      "0px",
    ),
  };
}

function getImageStyleVariables({
  collapsed,
  prefersReducedMotion,
}: Pick<HeaderStyleInput, "collapsed" | "prefersReducedMotion">) {
  return {
    "--collapsible-panel-image-scale": getMotionSafeCollapsedCssValue({
      collapsed,
      collapsedValue: "1.04",
      expandedValue: "1",
      prefersReducedMotion,
    }),
    "--collapsible-panel-image-y": getMotionSafeCollapsedCssValue({
      collapsed,
      collapsedValue: "-10px",
      expandedValue: "0px",
      prefersReducedMotion,
    }),
  };
}

function getOriginalCardStyleVariables({
  collapsed,
  prefersReducedMotion,
}: Pick<HeaderStyleInput, "collapsed" | "prefersReducedMotion">) {
  return {
    "--collapsible-panel-original-card-delay": getMotionSafeRevealDelay({
      collapsed,
      expandedDelay: "160ms",
      prefersReducedMotion,
    }),
    "--collapsible-panel-original-card-opacity": getCollapsedCssValue(
      collapsed,
      "0",
      "1",
    ),
    "--collapsible-panel-original-card-y": getMotionSafeCollapsedCssValue({
      collapsed,
      collapsedValue: "-24px",
      expandedValue: "0px",
      prefersReducedMotion,
    }),
    "--collapsible-panel-original-pointer-events": getCollapsedCssValue(
      collapsed,
      "none",
      "auto",
    ),
  };
}

function getHeaderStyleVariables(input: HeaderStyleInput) {
  return {
    ...getCompactHeaderStyleVariables(input),
    ...getCoverStyleVariables(input),
    ...getImageStyleVariables(input),
    ...getOriginalCardStyleVariables(input),
  };
}

function applyHeaderStyleVariables(
  element: HTMLElement,
  variables: Record<string, string>,
) {
  for (const [name, value] of Object.entries(variables)) {
    element.style.setProperty(name, value);
  }
}

export function useCollapsiblePanelHeader<TElement extends HTMLElement>({
  collapsedHeight,
  collapseTrigger = DEFAULT_COLLAPSE_TRIGGER,
  enabled = true,
  expandTrigger = DEFAULT_EXPAND_TRIGGER,
  expandedHeight,
  ref,
}: UseCollapsiblePanelHeaderOptions<TElement>) {
  const applyHeaderState = useCallback(
    ({ collapsed, compactVisible }: CollapsibleRenderState) => {
      const element = ref.current;

      if (!element) {
        return false;
      }

      applyHeaderStyleVariables(
        element,
        getHeaderStyleVariables({
          collapsed,
          collapsedHeight,
          compactVisible,
          expandedHeight,
          prefersReducedMotion: getPrefersReducedMotion(),
        }),
      );

      return true;
    },
    [collapsedHeight, expandedHeight, ref],
  );

  const getPanelScrollPosition = useCallback(
    () => ref.current?.scrollTop ?? 0,
    [ref],
  );
  const getPanelScrollTarget = useCallback(() => ref.current, [ref]);
  const {
    handleScroll,
    isCompactVisible,
    resetScrollState: resetHeader,
  } = useCollapsibleScrollState({
    applyState: applyHeaderState,
    collapseTrigger,
    compactRevealDelayMs: COMPACT_REVEAL_DELAY_MS,
    enabled,
    expandTrigger,
    getScrollPosition: getPanelScrollPosition,
    getScrollTarget: getPanelScrollTarget,
  });

  return {
    handleScroll,
    isCompactVisible,
    resetHeader,
  };
}
