import { type ReactNode, type RefObject, useLayoutEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";

import { SettingsDetailHeader } from "./settings-detail-header";
import { getSettingsSectionMeta } from "./settings-sections";
import { SettingsSidebar } from "./settings-sidebar";

interface SettingsPageContentProps {
  activeSection: SettingsSection;
  children: ReactNode;
  isMobile: boolean;
  isMobileDetailOpen: boolean;
  isSigningOut: boolean;
  onMobileBack: () => void;
  mobileReturnFocusRef: RefObject<HTMLAnchorElement | null>;
  onSectionSelect: (
    section: SettingsSection,
    source: HTMLAnchorElement,
  ) => void;
  onSignOut: () => Promise<void> | void;
  restoredSidebarScroll?: {
    scrollX: number;
    scrollY: number;
  };
}

export function SettingsPageContent({
  activeSection,
  children,
  isMobile,
  isMobileDetailOpen,
  isSigningOut,
  mobileReturnFocusRef,
  onMobileBack,
  onSectionSelect,
  onSignOut,
  restoredSidebarScroll,
}: SettingsPageContentProps) {
  const activeSectionMeta = getSettingsSectionMeta(activeSection);
  const shouldRenderDetail = !isMobile || isMobileDetailOpen;
  const activeSectionLinkRef = useRef<HTMLAnchorElement | null>(null);
  const mobileDetailHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const settingsListHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const previousActiveSectionRef = useRef(activeSection);
  const previousIsMobileRef = useRef(isMobile);
  const previousMobileDetailOpenRef = useRef(isMobileDetailOpen);

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
      ? mobileDetailHeadingRef.current
      : wasMobileDetailOpen
        ? (getConnectedElement(mobileReturnFocusRef.current) ??
          settingsListHeadingRef.current)
        : didEnterMobileLayout
          ? settingsListHeadingRef.current
          : null;

    if (!focusTarget) {
      return undefined;
    }

    focusTarget.focus({ preventScroll: true });
    return undefined;
  }, [activeSection, isMobile, isMobileDetailOpen, mobileReturnFocusRef]);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-3 px-3 py-5 sm:px-4 md:px-8 lg:grid-cols-[15rem_1px_minmax(0,38rem)] lg:gap-7 lg:py-10 xl:gap-10">
      <SettingsSidebar
        activeSection={activeSection}
        activeSectionLinkRef={activeSectionLinkRef}
        isMobile={isMobile}
        isMobileDetailOpen={isMobileDetailOpen}
        isSigningOut={isSigningOut}
        onSectionSelect={onSectionSelect}
        onSignOut={onSignOut}
        restoredScroll={restoredSidebarScroll}
        settingsListHeadingRef={settingsListHeadingRef}
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
              mobileDetailHeadingRef={mobileDetailHeadingRef}
              onMobileBack={onMobileBack}
            />
            {children}
          </>
        )}
      </section>
    </div>
  );
}

function getConnectedElement<TElement extends HTMLElement>(
  element: TElement | null,
) {
  return element?.isConnected ? element : null;
}
