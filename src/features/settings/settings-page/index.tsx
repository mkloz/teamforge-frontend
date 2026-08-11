import {
  useElementScrollRestoration,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef } from "react";
import { SettingsNavigationGuardProvider } from "@/features/settings/components/settings-navigation-guard";
import { useSettingsRouteState } from "@/features/settings/hooks/use-settings-route-state";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { getBrowserWindow } from "@/shared/lib/browser-environment";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";
import {
  normalizeSettingsSection,
  type SettingsSection,
  withoutHistoryLayerEntry,
} from "@/shared/navigation";
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
  const router = useRouter();
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const { activeSection, explicitSection } = useSettingsRouteState();
  const mobileReturnFocusRef = useRef<HTMLAnchorElement | null>(null);
  const activeSectionMeta = getSettingsSectionMeta(activeSection);
  const hasInvalidSection = getHasInvalidSettingsSection(
    currentLocation.searchStr,
  );
  const pageMetadata = createFindafewPageMetadata({
    title:
      (!isMobile || explicitSection) && activeSectionMeta
        ? `${activeSectionMeta.label} settings`
        : "Settings",
    description:
      "Manage your Findafew account, privacy, safety, notifications, and display settings.",
  });

  usePageMetadata(pageMetadata);

  useEffect(() => {
    if (!hasInvalidSection) {
      return;
    }

    void router.navigate({
      replace: true,
      resetScroll: false,
      search: {},
      state: (previousState) => withoutHistoryLayerEntry(previousState),
      to: "/settings",
    });
  }, [hasInvalidSection, router]);

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
    explicitSection,
    getHistorySnapshot: () => ({
      canGoBack: router.history.canGoBack(),
      state: router.history.location.state,
    }),
    onBack: () => router.history.back(),
    onReplaceWithList: () => {
      void router.navigate({
        replace: true,
        resetScroll: false,
        search: {},
        state: (previousState) => withoutHistoryLayerEntry(previousState),
        to: "/settings",
      });
    },
    restoredWindowScroll,
  });
  const signOut = useSettingsSignOut({ currentLocation });

  function handleSectionSelect(
    section: SettingsSection,
    source: HTMLAnchorElement,
  ) {
    mobileReturnFocusRef.current = source;
    mobileDetail.openMobileDetail(section);
  }

  return (
    <SettingsNavigationGuardProvider isMobile={isMobile}>
      <SettingsPageContent
        activeSection={activeSection}
        isMobile={isMobile}
        isMobileDetailOpen={mobileDetail.isMobileDetailOpen}
        isSigningOut={signOut.isSigningOut}
        onSectionSelect={handleSectionSelect}
        onSignOut={signOut.signOut}
        onMobileBack={mobileDetail.closeMobileDetail}
        mobileReturnFocusRef={mobileReturnFocusRef}
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
    </SettingsNavigationGuardProvider>
  );
}

function getHasInvalidSettingsSection(searchStr: string) {
  const search = new URLSearchParams(searchStr);

  return (
    search.has("section") && !normalizeSettingsSection(search.get("section"))
  );
}
