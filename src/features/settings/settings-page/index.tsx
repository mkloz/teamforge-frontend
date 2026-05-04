import { useRouterState } from "@tanstack/react-router";

import type { SettingsSection } from "@/features/settings/lib/settings-route";
import { PageErrorState } from "@/shared/components/page-error-state";
import { cn } from "@/shared/lib/utils";

import { useSettingsBlockedUsers } from "@/features/settings/hooks/use-settings-blocked-users";
import { useSettingsProfileForm } from "@/features/settings/hooks/use-settings-profile-form";
import { useSettingsRouteState } from "@/features/settings/hooks/use-settings-route-state";

import { SettingsDetailHeader } from "./settings-detail-header";
import { SettingsFormBridge } from "./settings-form-bridge";
import { getSettingsSectionMeta } from "./settings-sections";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsSkeleton } from "./settings-skeleton";
import { useSettingsMobileDetail } from "./use-settings-mobile-detail";
import { useSettingsSignOut } from "./use-settings-sign-out";

export function SettingsPage() {
  const { activeSection, setActiveSection } = useSettingsRouteState();
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const mobileDetail = useSettingsMobileDetail({ currentLocation });
  const signOut = useSettingsSignOut({ currentLocation });
  const profileFormState = useSettingsProfileForm();
  const blockedUsersState = useSettingsBlockedUsers(
    Boolean(profileFormState.currentUser),
  );

  if (profileFormState.isLoading) {
    return <SettingsSkeleton />;
  }

  if (profileFormState.isError) {
    return (
      <PageErrorState
        className="mx-auto w-full max-w-5xl"
        title="Settings could not load"
        description="Your account settings could not be refreshed right now."
        onRetry={() => profileFormState.refetch()}
      />
    );
  }

  const activeSectionMeta = getSettingsSectionMeta(activeSection);

  function handleSectionSelect(section: SettingsSection) {
    setActiveSection(section);
    mobileDetail.openMobileDetail();
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-5 md:px-8 lg:grid-cols-[14rem_minmax(0,56rem)] lg:gap-12 xl:gap-18 lg:py-10">
      <SettingsSidebar
        activeSection={activeSection}
        isMobileDetailOpen={mobileDetail.isMobileDetailOpen}
        isSigningOut={signOut.isSigningOut}
        onSectionSelect={handleSectionSelect}
        onSignOut={signOut.signOut}
      />

      <section
        className={cn(
          "min-w-0 w-full pt-11 lg:block lg:max-w-4xl lg:pt-0",
          !mobileDetail.isMobileDetailOpen && "hidden",
        )}
      >
        <SettingsDetailHeader
          activeSectionMeta={activeSectionMeta}
          onMobileBack={mobileDetail.closeMobileDetail}
        />
        <SettingsFormBridge
          activeSection={activeSection}
          blockedUsersState={blockedUsersState}
          profileFormState={profileFormState}
        />
      </section>
    </div>
  );
}
