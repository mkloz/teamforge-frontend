import { type ReactNode, useLayoutEffect, useRef } from "react";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";

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
  onSignOut: () => Promise<void> | void;
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
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const shouldRenderDetail = !isMobile || isMobileDetailOpen;
  const activeSectionLinkRef = useRef<HTMLAnchorElement | null>(null);
  const mobileBackButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveSectionRef = useRef(activeSection);
  const previousIsMobileRef = useRef(false);
  const previousMobileDetailOpenRef = useRef(false);

  useLayoutEffect(() => {
    const didSectionChange = previousActiveSectionRef.current !== activeSection;
    const didEnterMobileLayout = isMobile && !previousIsMobileRef.current;
    const wasMobileDetailOpen = previousMobileDetailOpenRef.current;

    previousActiveSectionRef.current = activeSection;
    previousIsMobileRef.current = isMobile;
    previousMobileDetailOpenRef.current = isMobileDetailOpen;

    if (!isMobile) {
      return undefined;
    }

    const shouldFocusMobileDetail =
      isMobileDetailOpen &&
      (!wasMobileDetailOpen || didSectionChange || didEnterMobileLayout);
    const focusTarget = shouldFocusMobileDetail
      ? mobileBackButtonRef.current
      : wasMobileDetailOpen
        ? activeSectionLinkRef.current
        : null;

    if (!focusTarget) {
      return undefined;
    }

    focusTarget.focus({ preventScroll: true });
    return undefined;
  }, [activeSection, isMobile, isMobileDetailOpen]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-3 px-3 py-5 sm:px-4 md:px-8 lg:grid-cols-[15rem_1px_minmax(0,38rem)] lg:gap-7 lg:py-10 xl:gap-10">
      <SettingsSidebar
        activeSection={activeSection}
        activeSectionLinkRef={activeSectionLinkRef}
        isMobileDetailOpen={isMobileDetailOpen}
        isSigningOut={isSigningOut}
        onSectionSelect={onSectionSelect}
        onSignOut={onSignOut}
      />

      <div
        aria-hidden="true"
        className="hidden w-px self-stretch bg-border/70 lg:block"
      />

      <section
        className={cn(
          "w-full min-w-0 pt-11 lg:block lg:max-w-152 lg:pt-0",
          !isMobileDetailOpen && "hidden",
        )}
      >
        {shouldRenderDetail && (
          <>
            <SettingsDetailHeader
              activeSectionMeta={activeSectionMeta}
              mobileBackButtonRef={mobileBackButtonRef}
              onMobileBack={onMobileBack}
            />
            {children}
          </>
        )}
      </section>
    </div>
  );
}
