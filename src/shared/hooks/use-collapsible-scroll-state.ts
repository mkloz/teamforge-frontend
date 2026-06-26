import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { hasBrowserWindow } from "@/shared/lib/browser-environment";
import {
  applyCollapsedStateTransition,
  getNextCollapsedState,
  getPrefersReducedMotion,
  shouldSkipCollapsedStateUpdate,
} from "@/shared/lib/collapsible-motion";

export interface CollapsibleRenderState {
  collapsed: boolean;
  compactVisible: boolean;
}

interface UseCollapsibleScrollStateOptions {
  applyState: (state: CollapsibleRenderState) => boolean | undefined;
  collapseTrigger: number;
  compactRevealDelayMs: number;
  enabled?: boolean;
  expandTrigger: number;
  getScrollPosition?: () => number;
  getScrollTarget?: () => HTMLElement | Window | null;
  listenForResize?: boolean;
}

interface ApplyScrollStateOptions {
  force?: boolean;
}

function getWindowScrollPosition() {
  return window.scrollY;
}

function shouldDelayCompactReveal() {
  return hasBrowserWindow() && !getPrefersReducedMotion();
}

export function useCollapsibleScrollState({
  applyState,
  collapseTrigger,
  compactRevealDelayMs,
  enabled = true,
  expandTrigger,
  getScrollPosition = getWindowScrollPosition,
  getScrollTarget,
  listenForResize = false,
}: UseCollapsibleScrollStateOptions) {
  const frameRef = useRef<number | null>(null);
  const compactRevealTimeoutRef = useRef<number | null>(null);
  const isCollapsedRef = useRef(false);
  const isCompactVisibleRef = useRef(false);
  const [isCompactVisible, setIsCompactVisible] = useState(false);

  const applyRenderState = useCallback(
    (state: CollapsibleRenderState) => {
      const didApplyState = applyState(state);

      if (didApplyState === false) {
        return;
      }

      if (isCompactVisibleRef.current !== state.compactVisible) {
        isCompactVisibleRef.current = state.compactVisible;
        setIsCompactVisible(state.compactVisible);
      }
    },
    [applyState],
  );

  const clearCompactRevealTimeout = useCallback(() => {
    if (compactRevealTimeoutRef.current === null || !hasBrowserWindow()) {
      return;
    }

    window.clearTimeout(compactRevealTimeoutRef.current);
    compactRevealTimeoutRef.current = null;
  }, []);

  const revealCompactState = useCallback(() => {
    compactRevealTimeoutRef.current = null;
    applyRenderState({ collapsed: true, compactVisible: true });
  }, [applyRenderState]);

  const scheduleCompactReveal = useCallback(() => {
    if (shouldDelayCompactReveal()) {
      compactRevealTimeoutRef.current = window.setTimeout(
        revealCompactState,
        compactRevealDelayMs,
      );
      return;
    }

    revealCompactState();
  }, [compactRevealDelayMs, revealCompactState]);

  const applyCollapsedScrollState = useCallback(() => {
    isCollapsedRef.current = true;
    applyRenderState({ collapsed: true, compactVisible: false });
    scheduleCompactReveal();
  }, [applyRenderState, scheduleCompactReveal]);

  const applyExpandedScrollState = useCallback(() => {
    isCollapsedRef.current = false;
    applyRenderState({ collapsed: false, compactVisible: false });
  }, [applyRenderState]);

  const applyScrollPosition = useCallback(
    (position: number, { force = false }: ApplyScrollStateOptions = {}) => {
      const nextCollapsed = getNextCollapsedState({
        collapseAt: collapseTrigger,
        enabled,
        expandAt: expandTrigger,
        isCollapsed: isCollapsedRef.current,
        position,
      });

      if (
        shouldSkipCollapsedStateUpdate({
          force,
          isCollapsed: isCollapsedRef.current,
          nextCollapsed,
        })
      ) {
        return;
      }

      clearCompactRevealTimeout();
      applyCollapsedStateTransition({
        applyCollapsedState: applyCollapsedScrollState,
        applyExpandedState: applyExpandedScrollState,
        nextCollapsed,
      });
    },
    [
      applyCollapsedScrollState,
      applyExpandedScrollState,
      clearCompactRevealTimeout,
      collapseTrigger,
      enabled,
      expandTrigger,
    ],
  );

  const applyCurrentScrollState = useCallback(
    (options?: ApplyScrollStateOptions) => {
      if (!hasBrowserWindow()) {
        return;
      }

      applyScrollPosition(getScrollPosition(), options);
    },
    [applyScrollPosition, getScrollPosition],
  );

  const handleScroll = useCallback(() => {
    if (!hasBrowserWindow() || frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      applyCurrentScrollState();
    });
  }, [applyCurrentScrollState]);

  const cancelPendingFrame = useCallback(() => {
    if (frameRef.current === null || !hasBrowserWindow()) {
      return;
    }

    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const resetScrollState = useCallback(() => {
    applyScrollPosition(0, { force: true });
  }, [applyScrollPosition]);

  useLayoutEffect(() => {
    applyCurrentScrollState({ force: true });
  }, [applyCurrentScrollState]);

  useEffect(() => {
    if (!hasBrowserWindow()) {
      return undefined;
    }

    const scrollTarget = getScrollTarget?.() ?? window;

    if (!scrollTarget) {
      return () => {
        cancelPendingFrame();
        clearCompactRevealTimeout();
      };
    }

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });

    if (listenForResize) {
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);

      if (listenForResize) {
        window.removeEventListener("resize", handleScroll);
      }

      cancelPendingFrame();
      clearCompactRevealTimeout();
    };
  }, [
    cancelPendingFrame,
    clearCompactRevealTimeout,
    getScrollTarget,
    handleScroll,
    listenForResize,
  ]);

  return {
    handleScroll,
    isCompactVisible,
    resetScrollState,
  };
}
