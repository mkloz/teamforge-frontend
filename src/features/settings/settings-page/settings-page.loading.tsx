import type { SettingsSection } from "@/features/settings/lib/settings-route";
import {
  GeneratedPageLoading,
  type PageLoadingProps,
} from "@/shared/components/loading/page-loading";

import {
  SETTINGS_PAGE_SKELETON_NAME,
  SettingsPageSkeletonFixture,
} from "./settings-page-skeleton-fixture";

interface SettingsPageLoadingProps extends PageLoadingProps {
  activeSection?: SettingsSection;
}

export function SettingsPageLoading({
  activeSection,
}: SettingsPageLoadingProps = {}) {
  const fixture = <SettingsPageSkeletonFixture activeSection={activeSection} />;

  return (
    <GeneratedPageLoading name={SETTINGS_PAGE_SKELETON_NAME} fixture={fixture}>
      {fixture}
    </GeneratedPageLoading>
  );
}
