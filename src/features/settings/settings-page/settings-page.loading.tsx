import { SettingsSectionSkeleton } from "@/features/settings/settings-page/settings-page.loading/section-skeleton";
import { SettingsDetailHeaderSkeleton } from "@/features/settings/settings-page/settings-page.loading/shared-skeletons";
import { SettingsSidebarSkeleton } from "@/features/settings/settings-page/settings-page.loading/sidebar-skeleton";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import { cn } from "@/shared/lib/utils";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";

interface SettingsPageLoadingProps extends PageLoadingProps {
  activeSection?: SettingsSection;
  isMobileDetailOpen?: boolean;
}

export function SettingsPageLoading({
  activeSection = "account",
  isMobileDetailOpen = false,
}: SettingsPageLoadingProps = {}) {
  return (
    <div
      aria-busy="true"
      className="mx-auto grid w-full max-w-6xl gap-3 px-4 py-5 md:px-8 lg:grid-cols-[18rem_minmax(0,56rem)] lg:gap-6 lg:py-10 xl:gap-8"
    >
      <output className="sr-only">Loading settings</output>
      <SettingsSidebarSkeleton isMobileDetailOpen={isMobileDetailOpen} />

      <section
        className={cn(
          "w-full min-w-0 border-border/70 pt-11 lg:block lg:max-w-4xl lg:border-l lg:pt-0 lg:pl-10 xl:pl-12",
          !isMobileDetailOpen && "hidden",
        )}
      >
        <SettingsDetailHeaderSkeleton />
        <SettingsSectionSkeleton activeSection={activeSection} />
      </section>
    </div>
  );
}

export function SettingsSectionContentLoading({
  activeSection,
}: {
  activeSection: SettingsSection;
}) {
  return (
    <div aria-busy="true">
      <output className="sr-only">Loading settings section</output>
      <SettingsSectionSkeleton activeSection={activeSection} />
    </div>
  );
}
