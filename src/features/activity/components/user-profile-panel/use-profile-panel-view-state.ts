import { useCallback, useEffect, useRef, useState } from "react";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import {
  cancelScheduledAnimationFrame,
  type ScheduledAnimationFrameHandle,
  scheduleAnimationFrame,
} from "@/shared/lib/browser-scheduling";
import { scrollElementToTop } from "@/shared/lib/scroll-to-top";

const PANEL_COLLAPSE_SCROLL_TRIGGER = 32;
const PANEL_EXPAND_SCROLL_TRIGGER = 8;
const PANEL_COMPACT_HEADER_HEIGHT = 72;
const PANEL_COMPACT_HEADER_SNAP_TARGET = 192;
const PROFILE_PANEL_ORIGINAL_CARD_SELECTOR =
  "[data-profile-panel-original-card]";

interface ProfilePanelViewStateInput {
  resetEnabled: boolean;
  resetKey: string;
}

interface PanelHeaderTransitionInput {
  compactRestingScrollTop: number;
  isCompactHeaderVisible: boolean;
  isPanelHeaderCollapsed: boolean;
  scrollTop: number;
}

interface PanelHeaderTransition {
  nextCompactHeaderVisible: boolean;
  nextPanelHeaderCollapsed: boolean;
  shouldExpand: boolean;
  shouldSnapCompact: boolean;
  shouldUpdateCompactHeaderVisible: boolean;
  shouldUpdatePanelHeaderCollapsed: boolean;
}

interface PanelHeaderTransitionDecision {
  nextCompactHeaderVisible: boolean;
  nextPanelHeaderCollapsed: boolean;
  shouldExpand: boolean;
  shouldShowCompactHeader: boolean;
  shouldSnapCompact: boolean;
}

export function useProfilePanelViewState({
  resetEnabled,
  resetKey,
}: ProfilePanelViewStateInput) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<ScheduledAnimationFrameHandle | null>(null);
  const isPanelHeaderCollapsedRef = useRef(false);
  const isCompactHeaderVisibleRef = useRef(false);
  const compactRestingScrollTopRef = useRef(0);
  const lastProfileScrollResetKeyRef = useRef(resetKey);
  const [isPanelHeaderCollapsed, setIsPanelHeaderCollapsed] = useState(false);
  const [isCompactHeaderVisible, setIsCompactHeaderVisible] = useState(false);

  useResetScrollOnChange({
    enabled: resetEnabled,
    ref: scrollRef,
    resetKey,
  });

  const applyPanelHeaderState = useCallback(() => {
    const element = scrollRef.current;
    const transition = getPanelHeaderTransition({
      compactRestingScrollTop: compactRestingScrollTopRef.current,
      isCompactHeaderVisible: isCompactHeaderVisibleRef.current,
      isPanelHeaderCollapsed: isPanelHeaderCollapsedRef.current,
      scrollTop: element?.scrollTop ?? 0,
    });

    compactRestingScrollTopRef.current = applyPanelHeaderScrollTransition({
      compactRestingScrollTop: compactRestingScrollTopRef.current,
      element,
      transition,
    });

    if (transition.shouldUpdatePanelHeaderCollapsed) {
      isPanelHeaderCollapsedRef.current = transition.nextPanelHeaderCollapsed;
      setIsPanelHeaderCollapsed(transition.nextPanelHeaderCollapsed);
    }

    if (transition.shouldUpdateCompactHeaderVisible) {
      isCompactHeaderVisibleRef.current = transition.nextCompactHeaderVisible;
      setIsCompactHeaderVisible(transition.nextCompactHeaderVisible);
    }
  }, []);

  const handlePanelScroll = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = scheduleAnimationFrame(() => {
      frameRef.current = null;
      applyPanelHeaderState();
    });
  }, [applyPanelHeaderState]);

  const scrollPanelToTop = useCallback(() => {
    scrollElementToTop(scrollRef.current);
  }, []);

  useEffect(() => {
    if (lastProfileScrollResetKeyRef.current === resetKey) {
      return;
    }

    lastProfileScrollResetKeyRef.current = resetKey;
    isPanelHeaderCollapsedRef.current = false;
    isCompactHeaderVisibleRef.current = false;
    compactRestingScrollTopRef.current = 0;
    setIsPanelHeaderCollapsed(false);
    setIsCompactHeaderVisible(false);
  }, [resetKey]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelScheduledAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return {
    handlePanelScroll,
    isCompactHeaderVisible,
    isPanelHeaderCollapsed,
    scrollPanelToTop,
    scrollRef,
  };
}

function getPanelHeaderTransition({
  compactRestingScrollTop,
  isCompactHeaderVisible,
  isPanelHeaderCollapsed,
  scrollTop,
}: PanelHeaderTransitionInput): PanelHeaderTransition {
  const decision = getPanelHeaderTransitionDecision({
    compactRestingScrollTop,
    isCompactHeaderVisible,
    scrollTop,
    isPanelHeaderCollapsed,
  });

  return {
    nextCompactHeaderVisible: decision.nextCompactHeaderVisible,
    nextPanelHeaderCollapsed: decision.nextPanelHeaderCollapsed,
    shouldExpand: decision.shouldExpand,
    shouldSnapCompact: decision.shouldSnapCompact,
    shouldUpdateCompactHeaderVisible:
      isCompactHeaderVisible !== decision.shouldShowCompactHeader ||
      decision.shouldExpand,
    shouldUpdatePanelHeaderCollapsed:
      isPanelHeaderCollapsed !== decision.nextPanelHeaderCollapsed ||
      decision.shouldExpand,
  };
}

function getPanelHeaderTransitionDecision({
  compactRestingScrollTop,
  isCompactHeaderVisible,
  isPanelHeaderCollapsed,
  scrollTop,
}: PanelHeaderTransitionInput): PanelHeaderTransitionDecision {
  const shouldExpand = shouldExpandPanelHeader({
    compactRestingScrollTop,
    isCompactHeaderVisible,
    scrollTop,
  });
  const shouldSnapCompact = shouldSnapCompactPanelHeader({
    isCompactHeaderVisible,
    scrollTop,
  });
  const shouldCollapse = isPanelHeaderCollapsed || shouldSnapCompact;
  const shouldShowCompactHeader = isCompactHeaderVisible || shouldSnapCompact;

  return {
    nextCompactHeaderVisible: shouldExpand ? false : shouldShowCompactHeader,
    nextPanelHeaderCollapsed: shouldExpand ? false : shouldCollapse,
    shouldExpand,
    shouldShowCompactHeader,
    shouldSnapCompact,
  };
}

function shouldExpandPanelHeader({
  compactRestingScrollTop,
  isCompactHeaderVisible,
  scrollTop,
}: Pick<
  PanelHeaderTransitionInput,
  "compactRestingScrollTop" | "isCompactHeaderVisible" | "scrollTop"
>) {
  const expandBoundary = Math.max(
    PANEL_EXPAND_SCROLL_TRIGGER,
    compactRestingScrollTop - 8,
  );

  return isCompactHeaderVisible && scrollTop < expandBoundary;
}

function shouldSnapCompactPanelHeader({
  isCompactHeaderVisible,
  scrollTop,
}: Pick<PanelHeaderTransitionInput, "isCompactHeaderVisible" | "scrollTop">) {
  return !isCompactHeaderVisible && scrollTop >= PANEL_COLLAPSE_SCROLL_TRIGGER;
}

function applyPanelHeaderScrollTransition({
  compactRestingScrollTop,
  element,
  transition,
}: {
  compactRestingScrollTop: number;
  element: HTMLElement | null;
  transition: PanelHeaderTransition;
}) {
  if (!element) {
    return getMissingElementCompactRestingScrollTop({
      compactRestingScrollTop,
      shouldExpand: transition.shouldExpand,
    });
  }

  if (transition.shouldSnapCompact) {
    return snapPanelHeaderToCompact(element);
  }

  if (transition.shouldExpand) {
    return expandPanelHeader(element);
  }

  return compactRestingScrollTop;
}

function getMissingElementCompactRestingScrollTop({
  compactRestingScrollTop,
  shouldExpand,
}: {
  compactRestingScrollTop: number;
  shouldExpand: boolean;
}) {
  return shouldExpand ? 0 : compactRestingScrollTop;
}

function snapPanelHeaderToCompact(element: HTMLElement) {
  const snapTarget = getProfilePanelCompactSnapTarget(element);

  element.scrollTo({
    top: snapTarget,
    behavior: "instant",
  });

  return snapTarget;
}

function expandPanelHeader(element: HTMLElement) {
  element.scrollTo({ top: 0, behavior: "instant" });

  return 0;
}

function getProfilePanelCompactSnapTarget(element: HTMLElement) {
  const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
  const originalCard = element.querySelector<HTMLElement>(
    PROFILE_PANEL_ORIGINAL_CARD_SELECTOR,
  );

  if (!originalCard) {
    return Math.min(PANEL_COMPACT_HEADER_SNAP_TARGET, maxScrollTop);
  }

  const elementRect = element.getBoundingClientRect();
  const originalCardRect = originalCard.getBoundingClientRect();
  const compactBoundary = elementRect.top + PANEL_COMPACT_HEADER_HEIGHT;
  const requiredScrollTop =
    element.scrollTop + (originalCardRect.bottom - compactBoundary) + 1;

  return Math.min(
    Math.max(PANEL_COMPACT_HEADER_SNAP_TARGET, Math.ceil(requiredScrollTop)),
    maxScrollTop,
  );
}
