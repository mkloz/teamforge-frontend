import {
  useElementScrollRestoration,
  useRouterState,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useSettingsRouteState } from "@/features/settings/hooks/use-settings-route-state";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { getBrowserWindow } from "@/shared/lib/browser-environment";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";
import { SettingsSectionContentLoading } from "./settings-page.loading";
import { SettingsPageContent } from "./settings-page-content";
import { getSettingsSectionMeta } from "./settings-sections";
import { useSettingsMobileDetail } from "./use-settings-mobile-detail";
import { useSettingsSignOut } from "./use-settings-sign-out";

const SettingsFormBridge = lazy(() =>
  import("./settings-form-bridge").then((module) => ({
    default: module.SettingsFormBridge,
  })),
);

export function SettingsPage() {
  const { activeSection } = useSettingsRouteState();
  const activeSectionMeta = getSettingsSectionMeta(activeSection);
  const pageMetadata = createFindafewPageMetadata({
    title: activeSectionMeta
      ? `${activeSectionMeta.label} settings`
      : "Settings",
    description:
      "Manage your Findafew account, privacy, safety, notifications, and display settings.",
  });

  usePageMetadata(pageMetadata);

  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const restoredWindowScroll = useElementScrollRestoration({
    getElement: getBrowserWindow,
    getKey: (location) => currentLocation.state.__TSR_key ?? location.href,
  });
  const restoredSidebarScroll = useElementScrollRestoration({
    getKey: (location) => currentLocation.state.__TSR_key ?? location.href,
    id: "settings-sidebar",
  });
  const mobileDetail = useSettingsMobileDetail({
    activeSection,
    currentLocation,
    restoredWindowScroll,
  });
  const signOut = useSettingsSignOut({ currentLocation });

  function handleSectionSelect(section: SettingsSection) {
    mobileDetail.openMobileDetail(section);
  }

  return (
    <SettingsPageContent
      activeSection={activeSection}
      isMobileDetailOpen={mobileDetail.isMobileDetailOpen}
      isSigningOut={signOut.isSigningOut}
      onSectionSelect={handleSectionSelect}
      onSignOut={signOut.signOut}
      onMobileBack={mobileDetail.closeMobileDetail}
      restoredSidebarScroll={restoredSidebarScroll}
    >
      <Suspense
        fallback={
          <SettingsSectionContentLoading activeSection={activeSection} />
        }
      >
        <SettingsFormBridge activeSection={activeSection} />
      </Suspense>
    </SettingsPageContent>
  );
}
