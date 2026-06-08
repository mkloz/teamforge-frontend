import { useState } from "react";

interface UseSettingsMobileDetailOptions {
  currentLocation: {
    searchStr: string;
  };
}

export function useSettingsMobileDetail({
  currentLocation,
}: UseSettingsMobileDetailOptions) {
  const hasExplicitSettingsSection = new URLSearchParams(
    currentLocation.searchStr,
  ).has("section");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(
    hasExplicitSettingsSection,
  );

  return {
    closeMobileDetail: () => setIsMobileDetailOpen(false),
    isMobileDetailOpen,
    openMobileDetail: () => setIsMobileDetailOpen(true),
  };
}
