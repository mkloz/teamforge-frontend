import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { hasBrowserWindow } from "@/shared/lib/browser-environment";

interface UseHomeCollapsibleHeroOptions<TElement extends HTMLElement> {
  ref: RefObject<TElement | null>;
}

const HOME_COLLAPSE_TRIGGER = 72;
const HOME_EXPAND_TRIGGER = 12;
const COMPACT_REVEAL_DELAY_MS = 180;

export function useHomeCollapsibleHero<TElement extends HTMLElement>({
  ref,
}: UseHomeCollapsibleHeroOptions<TElement>) {
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

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      element.style.setProperty(
        "--home-hero-original-opacity",
        collapsed ? "0" : "1",
      );
      element.style.setProperty(
        "--home-hero-original-y",
        collapsed && !prefersReducedMotion ? "-16px" : "0px",
      );
      element.style.setProperty(
        "--home-hero-original-delay",
        collapsed || prefersReducedMotion ? "0ms" : "100ms",
      );
      element.style.setProperty(
        "--home-compact-opacity",
        compactVisible ? "1" : "0",
      );
      element.style.setProperty(
        "--home-compact-y",
        compactVisible || prefersReducedMotion ? "0px" : "-10px",
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
        ? scrollY > HOME_EXPAND_TRIGGER
        : scrollY >= HOME_COLLAPSE_TRIGGER;

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
