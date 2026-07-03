import { useState } from "react";
import { LANDING_NAV_LINKS } from "@/shared/components/public-site/landing-sections";
import { useObservedLandingSection } from "@/shared/components/public-site/use-observed-landing-section";
import type { LandingNavLinkId } from "./navbar-types";

function isLandingNavLinkId(id: string): id is LandingNavLinkId {
  return LANDING_NAV_LINKS.some((link) => link.id === id);
}

export function useActiveLandingSection(isLandingPage: boolean) {
  const [activeLandingSection, setActiveLandingSection] =
    useState<LandingNavLinkId>("hero");

  useObservedLandingSection({
    enabled: isLandingPage,
    isSectionId: isLandingNavLinkId,
    onActiveSectionChange: setActiveLandingSection,
    sections: LANDING_NAV_LINKS,
  });

  return activeLandingSection;
}
