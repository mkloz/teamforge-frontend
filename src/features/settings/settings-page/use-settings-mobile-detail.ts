import { useEffect, useRef, useState } from "react";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";

interface UseSettingsMobileDetailOptions {
  activeSection: SettingsSection;
  currentLocation: {
    searchStr: string;
  };
}

export function useSettingsMobileDetail({
  activeSection,
  currentLocation,
}: UseSettingsMobileDetailOptions) {
  const hasExplicitSettingsSection = new URLSearchParams(
    currentLocation.searchStr,
  ).has("section");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(
    hasExplicitSettingsSection,
  );
  const pendingSidebarSectionRef = useRef<SettingsSection | null>(null);

  useEffect(() => {
    const pendingSidebarSection = pendingSidebarSectionRef.current;

    if (pendingSidebarSection !== null) {
      if (pendingSidebarSection === activeSection) {
        pendingSidebarSectionRef.current = null;
      }

      return;
    }

    setIsMobileDetailOpen(hasExplicitSettingsSection);
  }, [activeSection, hasExplicitSettingsSection]);

  return {
    closeMobileDetail: () => {
      pendingSidebarSectionRef.current = null;
      setIsMobileDetailOpen(false);
    },
    isMobileDetailOpen,
    openMobileDetail: (section: SettingsSection) => {
      pendingSidebarSectionRef.current = section;
      setIsMobileDetailOpen(true);
    },
  };
}
