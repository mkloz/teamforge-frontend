import { useEffect, useRef, useState } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

import {
  LANDING_SECTIONS,
  type LandingSectionId,
} from "@/features/landing/constants/landing-sections";
import {
  scrollToLandingSection,
  scrollToLandingTop,
} from "@/features/landing/lib/landing-scroll";
import { getElementById } from "@/shared/lib/browser-scroll";

function isLandingSectionId(id: string): id is LandingSectionId {
  return LANDING_SECTIONS.some((section) => section.id === id);
}

const TOP_SCROLL_ACTIVE_CORRECTION_MS = 1300;
const TOP_SCROLL_Y_THRESHOLD = 96;

export function useLandingSectionNavigation() {
  const [activeSection, setActiveSection] = useState<LandingSectionId>("hero");
  const topScrollCorrectionRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (topScrollCorrectionRef.current !== null) {
        window.clearTimeout(topScrollCorrectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      typeof document === "undefined" ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isLandingSectionId(entry.target.id)) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      },
    );

    const observedSectionIds = new Set<LandingSectionId>();

    function observeLandingSections() {
      LANDING_SECTIONS.forEach((section) => {
        if (observedSectionIds.has(section.id)) {
          return;
        }

        const element = getElementById(section.id);

        if (!element) {
          return;
        }

        observer.observe(element);
        observedSectionIds.add(section.id);
      });
    }

    observeLandingSections();

    const mutationObserver =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(observeLandingSections);

    mutationObserver?.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver?.disconnect();
      observer.disconnect();
    };
  }, []);

  const scrollToSection = useEventCallback((id: LandingSectionId) => {
    setActiveSection(id);
    scrollToLandingSection(id);
  });

  const scrollToTop = useEventCallback(() => {
    setActiveSection("hero");
    scrollToLandingTop();

    if (typeof window === "undefined") {
      return;
    }

    if (topScrollCorrectionRef.current !== null) {
      window.clearTimeout(topScrollCorrectionRef.current);
    }

    topScrollCorrectionRef.current = window.setTimeout(() => {
      if (window.scrollY <= TOP_SCROLL_Y_THRESHOLD) {
        setActiveSection("hero");
      }

      topScrollCorrectionRef.current = null;
    }, TOP_SCROLL_ACTIVE_CORRECTION_MS);
  });

  const handleKeyDown = useEventCallback((event: KeyboardEvent) => {
    const key = Number.parseInt(event.key, 10);

    if (key >= 1 && key <= LANDING_SECTIONS.length) {
      scrollToSection(LANDING_SECTIONS[key - 1].id);
    }
  });

  useEventListener("keydown", handleKeyDown);

  return {
    activeSection,
    scrollToSection,
    scrollToTop,
  };
}
