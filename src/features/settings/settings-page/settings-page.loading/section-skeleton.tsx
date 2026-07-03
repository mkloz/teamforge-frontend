import { AccountSectionSkeleton } from "@/features/settings/settings-page/settings-page.loading/account-section-skeleton";
import { MatchingSectionSkeleton } from "@/features/settings/settings-page/settings-page.loading/matching-section-skeleton";
import { PreferenceSectionSkeleton } from "@/features/settings/settings-page/settings-page.loading/preference-section-skeleton";
import { BlockedUsersSectionSkeleton } from "@/features/settings/settings-page/settings-page.loading/safety-section-skeleton";
import { SecuritySectionSkeleton } from "@/features/settings/settings-page/settings-page.loading/security-section-skeleton";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";

export function SettingsSectionSkeleton({
  activeSection,
}: {
  activeSection: SettingsSection;
}) {
  if (activeSection === "account") {
    return <AccountSectionSkeleton />;
  }

  if (activeSection === "security") {
    return <SecuritySectionSkeleton />;
  }

  if (activeSection === "matching") {
    return <MatchingSectionSkeleton />;
  }

  if (activeSection === "safety") {
    return <BlockedUsersSectionSkeleton />;
  }

  return <PreferenceSectionSkeleton />;
}
