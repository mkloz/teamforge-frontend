import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";

interface UseGroupPlanDetailCollapsibleHeroOptions<
  TElement extends HTMLElement,
> {
  ref: RefObject<TElement | null>;
}

const DEFAULT_COVER_EXPANDED_HEIGHT = 280;
const DEFAULT_COVER_COLLAPSED_HEIGHT = 72;
const GROUP_DETAIL_COLLAPSE_TRIGGER = 96;
const GROUP_DETAIL_EXPAND_TRIGGER = 16;
const COMPACT_REVEAL_DELAY_MS = 280;

export function useGroupPlanDetailCollapsibleHero<
  TElement extends HTMLElement,
>({ ref }: UseGroupPlanDetailCollapsibleHeroOptions<TElement>) {
  const frameRef = useRef<number | null>(null);
  const compactRevealTimeoutRef = useRef<number | null>(null);
  const isCollapsedRef = useRef(false);
  const isCompactVisibleRef = useRef(false);
  const [isCompactVisible, setIsCompactVisible] = useState(false);

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
        return;
      }

      const styles = window.getComputedStyle(element);
      const expandedHeight = getCssPixelValue(
        styles,
        "--group-detail-cover-expanded-height",
        DEFAULT_COVER_EXPANDED_HEIGHT,
      );
      const collapsedHeight = getCssPixelValue(
        styles,
        "--group-detail-cover-collapsed-height",
        DEFAULT_COVER_COLLAPSED_HEIGHT,
      );
      const collapseRange = Math.max(expandedHeight - collapsedHeight, 1);
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      element.style.setProperty(
        "--group-detail-cover-y",
        collapsed ? `${-collapseRange}px` : "0px",
      );
      element.style.setProperty(
        "--group-detail-cover-image-y",
        collapsed && !prefersReducedMotion ? "-12px" : "0px",
      );
      element.style.setProperty(
        "--group-detail-cover-image-scale",
        collapsed && !prefersReducedMotion ? "1.04" : "1",
      );
      element.style.setProperty(
        "--group-detail-cover-original-opacity",
        collapsed ? "0" : "1",
      );
      element.style.setProperty(
        "--group-detail-cover-original-y",
        collapsed && !prefersReducedMotion ? "-28px" : "0px",
      );
      element.style.setProperty(
        "--group-detail-cover-original-delay",
        collapsed || prefersReducedMotion ? "0ms" : "140ms",
      );
      element.style.setProperty(
        "--group-detail-compact-opacity",
        compactVisible ? "1" : "0",
      );
      element.style.setProperty(
        "--group-detail-compact-y",
        compactVisible || prefersReducedMotion ? "0px" : "-8px",
      );

      if (isCompactVisibleRef.current !== compactVisible) {
        isCompactVisibleRef.current = compactVisible;
        setIsCompactVisible(compactVisible);
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

  const revealCompactHero = useCallback(() => {
    compactRevealTimeoutRef.current = null;
    applyHeroState({ collapsed: true, compactVisible: true });
  }, [applyHeroState]);

  const applyScrollState = useCallback(
    ({ force = false }: { force?: boolean } = {}) => {
      if (!hasBrowserWindow()) {
        return;
      }

      const scrollY = window.scrollY;
      const nextCollapsed = isCollapsedRef.current
        ? scrollY > GROUP_DETAIL_EXPAND_TRIGGER
        : scrollY >= GROUP_DETAIL_COLLAPSE_TRIGGER;

      if (!force && isCollapsedRef.current === nextCollapsed) {
        return;
      }

      clearCompactRevealTimeout();

      if (nextCollapsed) {
        isCollapsedRef.current = true;
        applyHeroState({ collapsed: true, compactVisible: false });

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (prefersReducedMotion) {
          revealCompactHero();
          return;
        }

        compactRevealTimeoutRef.current = window.setTimeout(
          revealCompactHero,
          COMPACT_REVEAL_DELAY_MS,
        );
        return;
      }

      isCollapsedRef.current = false;
      applyHeroState({ collapsed: false, compactVisible: false });
    },
    [applyHeroState, clearCompactRevealTimeout, revealCompactHero],
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

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      clearCompactRevealTimeout();
    };
  }, [clearCompactRevealTimeout, handleViewportChange]);

  return { isCompactVisible };
}

function getCssPixelValue(
  styles: CSSStyleDeclaration,
  property: string,
  fallback: number,
) {
  const value = Number.parseFloat(styles.getPropertyValue(property));

  return Number.isFinite(value) ? value : fallback;
}
