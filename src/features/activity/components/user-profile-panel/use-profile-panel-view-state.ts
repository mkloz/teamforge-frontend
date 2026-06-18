import { useCallback, useEffect, useRef, useState } from "react";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
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

export function useProfilePanelViewState({
  resetEnabled,
  resetKey,
}: ProfilePanelViewStateInput) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
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
    const scrollTop = element?.scrollTop ?? 0;
    const snapTarget = element
      ? getProfilePanelCompactSnapTarget(element)
      : PANEL_COMPACT_HEADER_SNAP_TARGET;
    const transition = getPanelHeaderTransition({
      compactRestingScrollTop: compactRestingScrollTopRef.current,
      isCompactHeaderVisible: isCompactHeaderVisibleRef.current,
      isPanelHeaderCollapsed: isPanelHeaderCollapsedRef.current,
      scrollTop,
    });

    if (transition.shouldSnapCompact && element) {
      element.scrollTo({
        top: snapTarget,
        behavior: "instant",
      });
      compactRestingScrollTopRef.current = snapTarget;
    }

    if (transition.shouldExpand && element) {
      element.scrollTo({ top: 0, behavior: "instant" });
      compactRestingScrollTopRef.current = 0;
    }

    if (transition.shouldUpdatePanelHeaderCollapsed) {
      isPanelHeaderCollapsedRef.current = transition.nextPanelHeaderCollapsed;
      setIsPanelHeaderCollapsed(transition.nextPanelHeaderCollapsed);
    }

    if (transition.shouldUpdateCompactHeaderVisible) {
      isCompactHeaderVisibleRef.current = transition.nextCompactHeaderVisible;
      if (transition.shouldExpand) {
        compactRestingScrollTopRef.current = 0;
      }
      setIsCompactHeaderVisible(transition.nextCompactHeaderVisible);
    }
  }, []);

  const handlePanelScroll = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
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
        window.cancelAnimationFrame(frameRef.current);
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
}: PanelHeaderTransitionInput) {
  const shouldExpand =
    isCompactHeaderVisible &&
    scrollTop <
      Math.max(PANEL_EXPAND_SCROLL_TRIGGER, compactRestingScrollTop - 8);
  const shouldSnapCompact =
    !isCompactHeaderVisible && scrollTop >= PANEL_COLLAPSE_SCROLL_TRIGGER;
  const shouldCollapse = isPanelHeaderCollapsed || shouldSnapCompact;
  const shouldShowCompactHeader = isCompactHeaderVisible || shouldSnapCompact;

  return {
    nextCompactHeaderVisible: shouldExpand ? false : shouldShowCompactHeader,
    nextPanelHeaderCollapsed: shouldExpand ? false : shouldCollapse,
    shouldExpand,
    shouldSnapCompact,
    shouldUpdateCompactHeaderVisible:
      isCompactHeaderVisible !== shouldShowCompactHeader || shouldExpand,
    shouldUpdatePanelHeaderCollapsed:
      isPanelHeaderCollapsed !== shouldCollapse || shouldExpand,
  };
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
