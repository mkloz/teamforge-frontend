import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";

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

interface HeaderState {
  collapsed: boolean;
  compactVisible: boolean;
}

function getPrefersReducedMotion() {
  return (
    hasBrowserWindow() &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getHeaderStyleVariables({
  collapsed,
  collapsedHeight,
  compactVisible,
  expandedHeight,
  prefersReducedMotion,
}: HeaderState & {
  collapsedHeight: number;
  expandedHeight: number;
  prefersReducedMotion: boolean;
}) {
  const collapseRange = Math.max(expandedHeight - collapsedHeight, 1);

  return {
    "--collapsible-panel-compact-opacity": compactVisible ? "1" : "0",
    "--collapsible-panel-compact-scrim-opacity": compactVisible ? "0.86" : "0",
    "--collapsible-panel-cover-y": collapsed ? `${-collapseRange}px` : "0px",
    "--collapsible-panel-image-scale":
      prefersReducedMotion || !collapsed ? "1" : "1.04",
    "--collapsible-panel-image-y":
      prefersReducedMotion || !collapsed ? "0px" : "-10px",
    "--collapsible-panel-original-card-delay":
      collapsed || prefersReducedMotion ? "0ms" : "160ms",
    "--collapsible-panel-original-card-opacity": collapsed ? "0" : "1",
    "--collapsible-panel-original-card-y":
      collapsed && !prefersReducedMotion ? "-24px" : "0px",
    "--collapsible-panel-original-pointer-events": collapsed ? "none" : "auto",
    "--collapsible-panel-title-y":
      compactVisible || prefersReducedMotion ? "0px" : "-8px",
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
  const frameRef = useRef<number | null>(null);
  const isCollapsedRef = useRef(false);
  const isCompactVisibleRef = useRef(false);
  const compactRevealTimeoutRef = useRef<number | null>(null);
  const [isCompactVisible, setIsCompactVisible] = useState(false);

  const applyHeaderState = useCallback(
    ({ collapsed, compactVisible }: HeaderState) => {
      const element = ref.current;

      if (!element) {
        return;
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

      if (isCompactVisibleRef.current !== compactVisible) {
        isCompactVisibleRef.current = compactVisible;
        setIsCompactVisible(compactVisible);
      }
    },
    [collapsedHeight, expandedHeight, ref],
  );

  const clearCompactRevealTimeout = useCallback(() => {
    if (compactRevealTimeoutRef.current === null || !hasBrowserWindow()) {
      return;
    }

    window.clearTimeout(compactRevealTimeoutRef.current);
    compactRevealTimeoutRef.current = null;
  }, []);

  const revealCompactHeader = useCallback(() => {
    compactRevealTimeoutRef.current = null;
    applyHeaderState({ collapsed: true, compactVisible: true });
  }, [applyHeaderState]);

  const applyScrollState = useCallback(
    (scrollTop: number, { force = false }: { force?: boolean } = {}) => {
      const nextCollapsed =
        enabled &&
        (isCollapsedRef.current
          ? scrollTop > expandTrigger
          : scrollTop >= collapseTrigger);

      if (!force && isCollapsedRef.current === nextCollapsed) {
        return;
      }

      clearCompactRevealTimeout();

      if (nextCollapsed) {
        isCollapsedRef.current = true;
        applyHeaderState({ collapsed: true, compactVisible: false });

        const prefersReducedMotion = getPrefersReducedMotion();

        if (hasBrowserWindow() && !prefersReducedMotion) {
          compactRevealTimeoutRef.current = window.setTimeout(
            revealCompactHeader,
            COMPACT_REVEAL_DELAY_MS,
          );
        } else {
          revealCompactHeader();
        }

        return;
      }

      isCollapsedRef.current = false;
      applyHeaderState({ collapsed: false, compactVisible: false });
    },
    [
      applyHeaderState,
      clearCompactRevealTimeout,
      collapseTrigger,
      enabled,
      expandTrigger,
      revealCompactHeader,
    ],
  );

  const handleScroll = useCallback(() => {
    if (!hasBrowserWindow()) {
      return;
    }

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      applyScrollState(ref.current?.scrollTop ?? 0);
    });
  }, [applyScrollState, ref]);

  const resetHeader = useCallback(() => {
    applyScrollState(0, { force: true });
  }, [applyScrollState]);

  useLayoutEffect(() => {
    applyScrollState(ref.current?.scrollTop ?? 0, { force: true });
  }, [applyScrollState, ref]);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, ref]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null && hasBrowserWindow()) {
        window.cancelAnimationFrame(frameRef.current);
      }

      clearCompactRevealTimeout();
    };
  }, [clearCompactRevealTimeout]);

  return {
    handleScroll,
    isCompactVisible,
    resetHeader,
  };
}
