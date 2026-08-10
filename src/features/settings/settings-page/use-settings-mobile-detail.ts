import { useLayoutEffect, useRef, useState } from "react";
import { scrollBrowserTo } from "@/shared/lib/browser-environment";
import { scrollToPageTop } from "@/shared/lib/browser-scroll";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";

interface UseSettingsMobileDetailOptions {
  activeSection: SettingsSection;
  currentLocation: {
    searchStr: string;
    state?: {
      __TSR_key?: string;
    };
  };
  restoredWindowScroll?: {
    scrollX: number;
    scrollY: number;
  };
}

export function useSettingsMobileDetail({
  activeSection,
  currentLocation,
  restoredWindowScroll,
}: UseSettingsMobileDetailOptions) {
  const hasExplicitSettingsSection = new URLSearchParams(
    currentLocation.searchStr,
  ).has("section");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(
    hasExplicitSettingsSection,
  );
  const pendingSidebarSectionRef = useRef<SettingsSection | null>(null);
  const currentHistoryKey = currentLocation.state?.__TSR_key;
  const previousHistoryKeyRef = useRef(currentHistoryKey);

  useLayoutEffect(() => {
    const didHistoryEntryChange =
      previousHistoryKeyRef.current !== currentHistoryKey;
    previousHistoryKeyRef.current = currentHistoryKey;
    const pendingSidebarSection = pendingSidebarSectionRef.current;

    if (pendingSidebarSection !== null) {
      if (pendingSidebarSection === activeSection) {
        pendingSidebarSectionRef.current = null;
        scrollToPageTop("reset");
      }

      return;
    }

    if (didHistoryEntryChange && restoredWindowScroll) {
      scrollBrowserTo({
        behavior: "instant",
        left: restoredWindowScroll.scrollX,
        top: restoredWindowScroll.scrollY,
      });
    }

    setIsMobileDetailOpen(hasExplicitSettingsSection);
  }, [
    activeSection,
    currentHistoryKey,
    hasExplicitSettingsSection,
    restoredWindowScroll,
  ]);

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
