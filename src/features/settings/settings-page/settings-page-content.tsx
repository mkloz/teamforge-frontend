import type { ReactNode } from "react";
import type { SettingsSection } from "@/features/settings/lib/settings-route";
import { cn } from "@/shared/lib/utils";

import { SettingsDetailHeader } from "./settings-detail-header";
import { getSettingsSectionMeta } from "./settings-sections";
import { SettingsSidebar } from "./settings-sidebar";

interface SettingsPageContentProps {
  activeSection: SettingsSection;
  children: ReactNode;
  isMobileDetailOpen: boolean;
  isSigningOut: boolean;
  onMobileBack: () => void;
  onSectionSelect: (section: SettingsSection) => void;
  onSignOut: () => void;
}

export function SettingsPageContent({
  activeSection,
  children,
  isMobileDetailOpen,
  isSigningOut,
  onMobileBack,
  onSectionSelect,
  onSignOut,
}: SettingsPageContentProps) {
  const activeSectionMeta = getSettingsSectionMeta(activeSection);

  return (
    <div className="lg:settings-page-grid mx-auto grid w-full max-w-6xl gap-7 px-4 py-5 md:px-8 lg:gap-12 lg:py-10 xl:gap-18">
      <SettingsSidebar
        activeSection={activeSection}
        isMobileDetailOpen={isMobileDetailOpen}
        isSigningOut={isSigningOut}
        onSectionSelect={onSectionSelect}
        onSignOut={onSignOut}
      />

      <section
        className={cn(
          "w-full min-w-0 pt-11 lg:block lg:max-w-4xl lg:pt-0",
          !isMobileDetailOpen && "hidden",
        )}
      >
        <SettingsDetailHeader
          activeSectionMeta={activeSectionMeta}
          onMobileBack={onMobileBack}
        />
        {children}
      </section>
    </div>
  );
}
