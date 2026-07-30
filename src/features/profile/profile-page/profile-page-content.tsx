import { type ReactNode, useRef } from "react";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import { ProfilePortraitSection } from "@/features/profile/components/profile-portrait-section";
import { DeferredProfileInsights } from "@/features/profile/profile-page/profile-page-content/deferred-profile-insights";
import { ProfileDeferredInsightsFallback } from "@/features/profile/profile-page/profile-page-content/profile-deferred-insights-fallback";
import { ProfileHeaderActions } from "@/features/profile/profile-page/profile-page-content/profile-header-actions";
import {
  buildProfileCoreModel,
  getCompactSocialRead,
  getProfileQrUrl,
  getShouldShowUserMenu,
} from "@/features/profile/profile-page/profile-page-content/profile-page-state";
import { ProfilePortraitSectionFallback } from "@/features/profile/profile-page/profile-page-content/profile-portrait-section-fallback";
import { useProfileInsights } from "@/features/profile/profile-page/profile-page-content/use-profile-insights";
import type { User } from "@/shared/schemas";

import { useProfileCollapsibleHeader } from "../hooks/use-profile-collapsible-header";
import { ProfileCoverBanner } from "./profile-cover-banner";

interface ProfilePageContentProps {
  profile: User;
  mode?: "self" | "public";
  renderActions?: () => ReactNode;
  showUserMenu?: boolean;
}

export function ProfilePageContent({
  mode = "self",
  profile,
  renderActions,
  showUserMenu,
}: ProfilePageContentProps) {
  const profilePageRef = useRef<HTMLDivElement | null>(null);
  const profileHeroRowRef = useRef<HTMLDivElement | null>(null);
  const profileCore = buildProfileCoreModel(profile);
  const profileInsights = useProfileInsights(profile);
  const socialRead = profileInsights
    ? getCompactSocialRead(profileInsights.portrait.lead)
    : null;
  const shouldShowUserMenu = getShouldShowUserMenu(showUserMenu, mode);
  const profileQrUrl = getProfileQrUrl(profile.id);

  useProfileCollapsibleHeader({
    ref: profilePageRef,
  });

  return (
    <div
      ref={profilePageRef}
      className="relative min-h-full overflow-x-clip bg-canvas pb-(--profile-cover-phase-reserve) [--personality-cover-type-opacity:0.82] [--personality-cover-type-scale:1] [--personality-cover-type-y:0px] [--profile-cover-collapsed-height:80px] [--profile-cover-expanded-height:160px] [--profile-cover-height:var(--profile-cover-expanded-height)] [--profile-cover-phase-offset:0px] [--profile-cover-phase-reserve:104px] [--profile-hero-original-delay:0ms] [--profile-hero-original-opacity:1] [--profile-hero-original-y:0px] [--profile-hero-z-index:40] [--profile-shell-offset:0px] [--profile-sidebar-sticky-top:var(--profile-cover-collapsed-height)] sm:[--profile-cover-expanded-height:168px] sm:[--profile-cover-phase-reserve:112px] md:[--profile-cover-expanded-height:152px] md:[--profile-cover-phase-reserve:96px] md:[--profile-shell-offset:3.5rem] lg:[--profile-cover-collapsed-height:64px] lg:[--profile-cover-phase-reserve:112px]"
    >
      <ProfileCoverBanner personalityType={profile.personalityType} />

      {shouldShowUserMenu ? (
        <ProfileHeaderActions profile={profile} profileQrUrl={profileQrUrl} />
      ) : null}

      <div className="transform-[translate3d(0,var(--profile-cover-phase-offset,0px),0)] relative z-(--profile-hero-z-index) mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pt-24 pb-8 sm:max-w-6xl sm:px-6 md:px-8 md:pt-16 lg:gap-12 lg:pb-16">
        <ProfileHero
          user={profile}
          archetype={profileCore.archetype}
          socialRead={socialRead}
          renderActions={renderActions}
          showMissingDetailsAction={mode === "self"}
          heroRowRef={profileHeroRowRef}
        />

        {profileInsights ? (
          <ProfilePortraitSection
            mode={mode}
            portrait={profileInsights.portrait}
          />
        ) : (
          <ProfilePortraitSectionFallback />
        )}

        {profileInsights ? (
          <DeferredProfileInsights
            dimensionScores={profileCore.dimensionScores}
            mode={mode}
            oceanScores={profileCore.oceanScores}
            profileInsights={profileInsights}
          />
        ) : (
          <ProfileDeferredInsightsFallback />
        )}
      </div>
    </div>
  );
}
