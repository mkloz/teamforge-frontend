import { useRouterState } from "@tanstack/react-router";
import { useSettingsBlockedUsers } from "@/features/settings/hooks/use-settings-blocked-users";
import { useSettingsProfileForm } from "@/features/settings/hooks/use-settings-profile-form";
import { useSettingsRouteState } from "@/features/settings/hooks/use-settings-route-state";
import type { SettingsSection } from "@/features/settings/lib/settings-route";
import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";
import { PageErrorState } from "@/shared/components/page-error-state";
import { SettingsFormBridge } from "./settings-form-bridge";
import { SettingsPageLoading } from "./settings-page.loading";
import { SettingsPageContent } from "./settings-page-content";
import {
  SETTINGS_PAGE_SKELETON_NAME,
  SettingsPageSkeletonFixture,
} from "./settings-page-skeleton-fixture";
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
    return <SettingsPageLoading activeSection={activeSection} mode="query" />;
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

  function handleSectionSelect(section: SettingsSection) {
    setActiveSection(section);
    mobileDetail.openMobileDetail();
  }

  return (
    <GeneratedSkeleton
      name={SETTINGS_PAGE_SKELETON_NAME}
      loading={profileFormState.isLoading}
      fixture={<SettingsPageSkeletonFixture activeSection={activeSection} />}
    >
      <SettingsPageContent
        activeSection={activeSection}
        isMobileDetailOpen={mobileDetail.isMobileDetailOpen}
        isSigningOut={signOut.isSigningOut}
        onSectionSelect={handleSectionSelect}
        onSignOut={signOut.signOut}
        onMobileBack={mobileDetail.closeMobileDetail}
      >
        <SettingsFormBridge
          activeSection={activeSection}
          blockedUsersState={blockedUsersState}
          profileFormState={profileFormState}
        />
      </SettingsPageContent>
    </GeneratedSkeleton>
  );
}
