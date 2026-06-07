import { useEffect, useState } from "react";
import { LANDING_NAV_LINKS } from "@/features/landing/constants/landing-sections";
import type { LandingNavLinkId } from "./navbar-types";

function isLandingNavLinkId(id: string): id is LandingNavLinkId {
  return LANDING_NAV_LINKS.some((link) => link.id === id);
}

export function useActiveLandingSection(isLandingPage: boolean) {
  const [activeLandingSection, setActiveLandingSection] =
    useState<LandingNavLinkId>("hero");

  useEffect(() => {
    if (!isLandingPage) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          if (isLandingNavLinkId(entry.target.id)) {
            setActiveLandingSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      },
    );

    const observedSectionIds = new Set<LandingNavLinkId>();

    function observeLandingSections() {
      LANDING_NAV_LINKS.forEach((link) => {
        if (observedSectionIds.has(link.id)) {
          return;
        }

        const element = document.getElementById(link.id);

        if (!element) {
          return;
        }

        observer.observe(element);
        observedSectionIds.add(link.id);
      });
    }

    observeLandingSections();

    const mutationObserver = new MutationObserver(observeLandingSections);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [isLandingPage]);

  return activeLandingSection;
}
