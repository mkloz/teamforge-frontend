import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";

interface UseProfileCollapsibleHeaderOptions<TElement extends HTMLElement> {
  ref: RefObject<TElement | null>;
}

const DEFAULT_COVER_EXPANDED_HEIGHT = 160;
const DEFAULT_COVER_COLLAPSED_HEIGHT = 80;
const PROFILE_COLLAPSE_TRIGGER = 36;
const PROFILE_EXPAND_TRIGGER = 8;
const PROFILE_COMPACT_REVEAL_DELAY_MS = 280;

export function useProfileCollapsibleHeader<TElement extends HTMLElement>({
  ref,
}: UseProfileCollapsibleHeaderOptions<TElement>) {
  const frameRef = useRef<number | null>(null);
  const compactRevealTimeoutRef = useRef<number | null>(null);
  const isCollapsedRef = useRef(false);
  const isCompactVisibleRef = useRef(false);
  const [isPinned, setIsPinned] = useState(false);

  const applyHeaderState = useCallback(
    ({
      collapsed,
      compactVisible,
    }: {
      collapsed: boolean;
      compactVisible: boolean;
    }) => {
      const element = ref.current;

      if (!element || !hasBrowserWindow()) {
        return;
      }

      const styles = window.getComputedStyle(element);
      const expandedHeight = getCssPixelValue(
        styles,
        "--profile-cover-expanded-height",
        DEFAULT_COVER_EXPANDED_HEIGHT,
      );
      const collapsedHeight = getCssPixelValue(
        styles,
        "--profile-cover-collapsed-height",
        DEFAULT_COVER_COLLAPSED_HEIGHT,
      );
      const collapseRange = Math.max(expandedHeight - collapsedHeight, 1);
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      element.style.setProperty(
        "--profile-cover-y",
        collapsed ? `${-collapseRange}px` : "0px",
      );
      element.style.setProperty("--profile-cover-scale", "1");
      element.style.setProperty(
        "--personality-cover-type-scale",
        collapsed ? "0.48" : "1",
      );
      element.style.setProperty(
        "--personality-cover-type-y",
        collapsed ? `${-collapseRange / 2}px` : "0px",
      );
      element.style.setProperty(
        "--personality-cover-type-opacity",
        collapsed ? "0.22" : "0.82",
      );
      element.style.setProperty("--profile-cover-phase-offset", "0px");
      element.style.setProperty(
        "--profile-hero-z-index",
        collapsed ? "10" : "40",
      );
      element.style.setProperty(
        "--profile-hero-original-opacity",
        collapsed ? "0" : "1",
      );
      element.style.setProperty(
        "--profile-hero-original-y",
        collapsed && !prefersReducedMotion ? "-48px" : "0px",
      );
      element.style.setProperty(
        "--profile-hero-original-delay",
        collapsed || prefersReducedMotion ? "0ms" : "140ms",
      );

      if (isCompactVisibleRef.current !== compactVisible) {
        isCompactVisibleRef.current = compactVisible;
        setIsPinned(compactVisible);
      }
    },
    [ref],
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
    ({ force = false }: { force?: boolean } = {}) => {
      if (!hasBrowserWindow()) {
        return;
      }

      const scrollTarget = getScrollTarget(ref.current);
      const scrollTop = getScrollTop(scrollTarget);
      const nextCollapsed = isCollapsedRef.current
        ? scrollTop > PROFILE_EXPAND_TRIGGER
        : scrollTop >= PROFILE_COLLAPSE_TRIGGER;

      if (!force && isCollapsedRef.current === nextCollapsed) {
        return;
      }

      clearCompactRevealTimeout();

      if (nextCollapsed) {
        isCollapsedRef.current = true;
        applyHeaderState({ collapsed: true, compactVisible: false });

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (prefersReducedMotion) {
          revealCompactHeader();
          return;
        }

        compactRevealTimeoutRef.current = window.setTimeout(
          revealCompactHeader,
          PROFILE_COMPACT_REVEAL_DELAY_MS,
        );
        return;
      }

      isCollapsedRef.current = false;
      applyHeaderState({ collapsed: false, compactVisible: false });
    },
    [applyHeaderState, clearCompactRevealTimeout, ref, revealCompactHeader],
  );

  const handleViewportChange = useCallback(() => {
    if (!hasBrowserWindow() || frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      applyScrollState();
    });
  }, [applyScrollState]);

  useLayoutEffect(() => {
    applyScrollState({ force: true });
  }, [applyScrollState]);

  useEffect(() => {
    if (!hasBrowserWindow()) {
      return undefined;
    }

    const scrollTarget = getScrollTarget(ref.current);

    scrollTarget.addEventListener("scroll", handleViewportChange, {
      passive: true,
    });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      scrollTarget.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      clearCompactRevealTimeout();
    };
  }, [clearCompactRevealTimeout, handleViewportChange, ref]);

  return { isPinned };
}

function getCssPixelValue(
  styles: CSSStyleDeclaration,
  property: string,
  fallback: number,
) {
  const value = Number.parseFloat(styles.getPropertyValue(property));

  return Number.isFinite(value) ? value : fallback;
}

function getScrollTarget(element: HTMLElement | null) {
  if (!element) {
    return window;
  }

  return getScrollContainer(element) ?? window;
}

function getScrollTop(scrollTarget: HTMLElement | Window) {
  return scrollTarget instanceof Window
    ? window.scrollY
    : scrollTarget.scrollTop;
}

function getScrollContainer(element: HTMLElement) {
  if (isScrollable(element)) {
    return element;
  }

  let parent = element.parentElement;

  while (parent) {
    if (isScrollable(parent)) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}

function isScrollable(element: HTMLElement) {
  const overflowY = window.getComputedStyle(element).overflowY;
  const canScroll = /(auto|scroll|overlay)/.test(overflowY);

  return canScroll && element.scrollHeight > element.clientHeight;
}
