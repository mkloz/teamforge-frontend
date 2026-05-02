import { useEffect, useState } from "react";
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

export function useLandingSectionNavigation() {
  const [activeSection, setActiveSection] = useState<LandingSectionId>("hero");

  useEffect(() => {
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

    LANDING_SECTIONS.forEach((section) => {
      const element = getElementById(section.id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleKeyDown = useEventCallback((event: KeyboardEvent) => {
    const key = Number.parseInt(event.key, 10);

    if (key >= 1 && key <= LANDING_SECTIONS.length) {
      scrollToLandingSection(LANDING_SECTIONS[key - 1].id);
    }
  });

  useEventListener("keydown", handleKeyDown);

  return {
    activeSection,
    scrollToSection: scrollToLandingSection,
    scrollToTop: scrollToLandingTop,
  };
}
