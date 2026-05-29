import { type ReactNode, useRef } from "react";
import { ActivityLanesSection } from "@/features/profile/components/activity-lanes-section";
import { BestFirstGroupStrip } from "@/features/profile/components/best-first-group-strip";
import { GroupFitSection } from "@/features/profile/components/group-fit-section";
import { MatchingSnapshot } from "@/features/profile/components/matching-snapshot";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import { ProfileCompactHeader } from "@/features/profile/components/profile-hero/profile-compact-header";
import { ProfilePortraitSection } from "@/features/profile/components/profile-portrait-section";
import { PsychometricsSidebar } from "@/features/profile/components/psychometrics-sidebar";
import { UserMenu } from "@/features/user-menu/components/user-menu";
import type { User } from "@/shared/schemas";

import { useProfileCollapsibleHeader } from "../hooks/use-profile-collapsible-header";
import { ProfileCoverBanner } from "./profile-cover-banner";
import { buildProfilePageModel } from "./profile-page-model";

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
  const profilePageRef = useRef<HTMLElement | null>(null);
  const profileHeroRowRef = useRef<HTMLDivElement | null>(null);
  const pageModel = buildProfilePageModel(profile);
  const shouldShowUserMenu = showUserMenu ?? mode === "self";

  const { isPinned: isProfileHeaderPinned } = useProfileCollapsibleHeader({
    ref: profilePageRef,
  });

  return (
    <main
      ref={profilePageRef}
      className="relative min-h-full overflow-x-clip bg-canvas pb-(--profile-cover-phase-reserve) [--profile-cover-collapsed-height:80px] [--profile-cover-expanded-height:160px] [--profile-cover-height:var(--profile-cover-expanded-height)] [--profile-cover-phase-offset:0px] [--profile-cover-phase-reserve:104px] [--profile-cover-type-y:0px] [--profile-hero-original-delay:0ms] [--profile-hero-original-opacity:1] [--profile-hero-original-y:0px] [--profile-hero-z-index:40] [--profile-shell-offset:0px] [--profile-sidebar-sticky-top:var(--profile-cover-collapsed-height)] sm:[--profile-cover-expanded-height:168px] sm:[--profile-cover-phase-reserve:112px] md:[--profile-cover-expanded-height:152px] md:[--profile-cover-phase-reserve:96px] md:[--profile-shell-offset:3.5rem] lg:[--profile-cover-collapsed-height:64px] lg:[--profile-cover-phase-reserve:112px]"
    >
      <ProfileCoverBanner personalityType={profile.personalityType} />
      <ProfileCompactHeader user={profile} visible={isProfileHeaderPinned} />

      {shouldShowUserMenu ? (
        <div className="absolute top-4 right-4 z-50 md:top-6 md:right-8">
          <UserMenu trigger="settings" />
        </div>
      ) : null}

      <div className="transform-[translate3d(0,var(--profile-cover-phase-offset,0px),0)] relative z-(--profile-hero-z-index) mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pt-24 pb-8 sm:max-w-6xl sm:px-6 md:px-8 md:pt-16 lg:gap-12 lg:pb-16">
        <ProfileHero
          user={profile}
          archetype={pageModel.archetype}
          socialRead={pageModel.socialRead}
          renderActions={renderActions}
          showMissingDetailsAction={mode === "self"}
          heroRowRef={profileHeroRowRef}
        />

        <ProfilePortraitSection portrait={pageModel.profileInsights.portrait} />

        <BestFirstGroupStrip
          activityIdeas={pageModel.profileInsights.activityIdeas}
        />

        <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
            <GroupFitSection insight={pageModel.profileInsights.groupFit} />
            <ActivityLanesSection
              lanes={pageModel.profileInsights.activityLanes}
            />
            <MatchingSnapshot
              signals={pageModel.profileInsights.matchingSignals}
            />
          </div>

          <div className="flex min-w-0 shrink-0 flex-col border-border/70 lg:sticky lg:top-(--profile-sidebar-sticky-top) lg:self-start lg:border-l lg:pl-8 xl:pl-10">
            <PsychometricsSidebar
              oceanScores={pageModel.oceanScores}
              dimensionScores={pageModel.dimensionScores}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
