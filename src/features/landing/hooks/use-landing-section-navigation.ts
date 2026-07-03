import { useEffect, useRef, useState } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";
import {
  scrollToLandingSection,
  scrollToLandingTop,
} from "@/shared/components/public-site/landing-scroll";
import {
  LANDING_SECTIONS,
  type LandingSectionId,
} from "@/shared/components/public-site/landing-sections";
import { useObservedLandingSection } from "@/shared/components/public-site/use-observed-landing-section";
import { getBrowserScrollY } from "@/shared/lib/browser-environment";
import {
  cancelDelay,
  type ScheduledDelayHandle,
  scheduleDelay,
} from "@/shared/lib/browser-scheduling";

function isLandingSectionId(id: string): id is LandingSectionId {
  return LANDING_SECTIONS.some((section) => section.id === id);
}

const TOP_SCROLL_ACTIVE_CORRECTION_MS = 1300;
const TOP_SCROLL_Y_THRESHOLD = 96;

export function useLandingSectionNavigation() {
  const [activeSection, setActiveSection] = useState<LandingSectionId>("hero");
  const topScrollCorrectionRef = useRef<ScheduledDelayHandle | null>(null);

  useEffect(() => {
    return () => {
      if (topScrollCorrectionRef.current !== null) {
        cancelDelay(topScrollCorrectionRef.current);
      }
    };
  }, []);

  useObservedLandingSection({
    isSectionId: isLandingSectionId,
    onActiveSectionChange: setActiveSection,
    sections: LANDING_SECTIONS,
  });

  const scrollToSection = useEventCallback((id: LandingSectionId) => {
    setActiveSection(id);
    scrollToLandingSection(id);
  });

  const scrollToTop = useEventCallback(() => {
    setActiveSection("hero");
    scrollToLandingTop();

    if (topScrollCorrectionRef.current !== null) {
      cancelDelay(topScrollCorrectionRef.current);
    }

    topScrollCorrectionRef.current = scheduleDelay(() => {
      if (getBrowserScrollY() <= TOP_SCROLL_Y_THRESHOLD) {
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
