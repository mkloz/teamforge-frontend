import { useLayoutEffect, useRef } from "react";
import { scrollBrowserTo } from "@/shared/lib/browser-environment";
import { scrollToPageTop } from "@/shared/lib/browser-scroll";
import {
  resolveHistoryLayerDismissal,
  type SettingsSection,
} from "@/shared/navigation";

interface UseSettingsMobileDetailOptions {
  activeSection: SettingsSection;
  currentLocation: {
    state?: unknown;
  };
  explicitSection: SettingsSection | null;
  getHistorySnapshot: () => { canGoBack: boolean; state: unknown };
  onBack: () => void;
  onReplaceWithList: () => void;
  restoredWindowScroll?: {
    scrollX: number;
    scrollY: number;
  };
}

export function useSettingsMobileDetail({
  activeSection,
  currentLocation,
  explicitSection,
  getHistorySnapshot,
  onBack,
  onReplaceWithList,
  restoredWindowScroll,
}: UseSettingsMobileDetailOptions) {
  const isMobileDetailOpen = explicitSection !== null;
  const pendingSidebarSectionRef = useRef<SettingsSection | null>(null);
  const currentHistoryKey = getRouterHistoryKey(currentLocation.state);
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
  }, [activeSection, currentHistoryKey, restoredWindowScroll]);

  return {
    closeMobileDetail: () => {
      pendingSidebarSectionRef.current = null;
      const historySnapshot = getHistorySnapshot();
      const dismissal = resolveHistoryLayerDismissal({
        canGoBack: historySnapshot.canGoBack,
        id: "settings-detail",
        state: historySnapshot.state,
      });

      if (dismissal === "back") {
        onBack();
        return;
      }

      onReplaceWithList();
    },
    isMobileDetailOpen,
    openMobileDetail: (section: SettingsSection) => {
      pendingSidebarSectionRef.current = section;
    },
  };
}

function getRouterHistoryKey(state: unknown) {
  if (typeof state !== "object" || state === null) {
    return undefined;
  }

  const key = Reflect.get(state, "__TSR_key");
  return typeof key === "string" ? key : undefined;
}
