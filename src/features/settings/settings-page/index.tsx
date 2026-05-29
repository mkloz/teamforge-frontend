import { useRouterState } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useSettingsRouteState } from "@/features/settings/hooks/use-settings-route-state";
import { SettingsSectionContentLoading } from "./settings-page.loading";
import { SettingsPageContent } from "./settings-page-content";
import { useSettingsMobileDetail } from "./use-settings-mobile-detail";
import { useSettingsSignOut } from "./use-settings-sign-out";

const SettingsFormBridge = lazy(() =>
  import("./settings-form-bridge").then((module) => ({
    default: module.SettingsFormBridge,
  })),
);

export function SettingsPage() {
  const { activeSection } = useSettingsRouteState();
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const mobileDetail = useSettingsMobileDetail({ currentLocation });
  const signOut = useSettingsSignOut({ currentLocation });

  function handleSectionSelect() {
    mobileDetail.openMobileDetail();
  }

  return (
    <SettingsPageContent
      activeSection={activeSection}
      isMobileDetailOpen={mobileDetail.isMobileDetailOpen}
      isSigningOut={signOut.isSigningOut}
      onSectionSelect={handleSectionSelect}
      onSignOut={signOut.signOut}
      onMobileBack={mobileDetail.closeMobileDetail}
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
